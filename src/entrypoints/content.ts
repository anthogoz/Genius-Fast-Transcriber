import { createApp, defineComponent, h, reactive } from 'vue';
import { browser } from 'wxt/browser';
import '@/assets/content.css';
import FeedbackToast from '@/components/content/FeedbackToast.vue';
import FloatingToolbar from '@/components/content/FloatingToolbar.vue';
import GftPanel from '@/components/content/GftPanel.vue';
import NativeExportButton from '@/components/content/NativeExportButton.vue';
import OnboardingWizard from '@/components/content/OnboardingWizard.vue';
import { useEditor } from '@/composables/useEditor';
import { useGftState } from '@/composables/useGftState';
import { useLyricCard } from '@/composables/useLyricCard';
import { useSettings } from '@/composables/useSettings';
import { SELECTORS, useSongData } from '@/composables/useSongData';
import { i18n, setLocale } from '@/locales';
import type { Locale, PopupState } from '@/types';
import {
  isValidNumber,
  numberToEnglishWords,
  numberToFrenchWords,
  numberToPolishWords,
} from '@/utils/numberToWords';

export default defineContentScript({
  matches: ['*://*.genius.com/*'],
  cssInjectionMode: 'manifest',

  async main(ctx) {
    const settings = useSettings();
    const { setEditor, setArtists, setSongTitle, state } = useGftState();
    const { extractSongData } = useSongData();

    setLocale(settings.locale.value);

    // Global Feedback Toast
    const feedbackContainer = document.createElement('div');
    feedbackContainer.id = 'gft-feedback-root';
    document.body.appendChild(feedbackContainer);
    const feedbackApp = createApp(FeedbackToast);
    feedbackApp.use(i18n);
    feedbackApp.mount(feedbackContainer);

    // YouTube Controls (Global)
    const { togglePlayPause, seekBy } = useYoutubeControls();
    const showFeedback = (msg: string) => {
      window.dispatchEvent(new CustomEvent('gft-show-feedback', { detail: { message: msg } }));
    };

    const handleYoutubeAction = (action: 'play' | 'back' | 'forward') => {
      const t = (key: string) => String(i18n.global.t(key));
      if (action === 'play') {
        const result = togglePlayPause();
        if (result === 'playing') showFeedback(t('feedback_play'));
        else if (result === 'paused') showFeedback(t('feedback_pause'));
        else showFeedback(`❌ ${t('yt_player_not_found')}`);
      } else if (action === 'back') {
        if (seekBy(-5)) showFeedback('⏪ -5s');
        else showFeedback(`❌ ${t('yt_player_not_found')}`);
      } else if (action === 'forward') {
        if (seekBy(5)) showFeedback('⏩ +5s');
        else showFeedback(`❌ ${t('yt_player_not_found')}`);
      }
    };

    // Global Shortcuts (YouTube) are handled via background.ts -> browser.commands
    // and received in the onMessage listener above.

    browser.runtime.onMessage.addListener((message) => {
      if (message.type === 'GFT_COMMAND') {
        switch (message.command) {
          case 'toggle-play':
            handleYoutubeAction('play');
            break;
          case 'seek-backward':
            handleYoutubeAction('back');
            break;
          case 'seek-forward':
            handleYoutubeAction('forward');
            break;
        }
      }
    });

    const GFT_VERSION = browser.runtime.getManifest().version;
    let cleanupFloatingToolbar: (() => void) | null = null;
    let panelApp: any = null;

    setupMessageListener();

    if (!settings.isTutorialCompleted.value) {
      const isEligibleForTutorial = () => {
        return (
          document.querySelector(SELECTORS.LYRICS_CONTAINER)
          || document.querySelector(SELECTORS.TEXTAREA_EDITOR)
          || document.querySelector(SELECTORS.DIV_EDITOR)
          || document.querySelector(SELECTORS.CONTROLS_STICKY)
          || document.querySelector(SELECTORS.GENIUS_HELPER)
        );
      };

      if (isEligibleForTutorial()) {
        void showOnboarding(ctx);
      } else {
        const observer = new MutationObserver(() => {
          if (isEligibleForTutorial()) {
            observer.disconnect();
            void showOnboarding(ctx);
          }
        });
        observer.observe(document.body, { childList: true, subtree: true });
      }
    }

    if (settings.isLyricCardOnly.value) {
      const updateMetadata = () => {
        const songData = extractSongData();
        setSongTitle(songData.title);
        setArtists(songData.mainArtists, songData.featuringArtists);
      };

      updateMetadata();
      // Observer pour mettre à jour si les données arrivent tardivement ou changent (navigation SPA)
      const metaObserver = new MutationObserver(() => updateMetadata());
      metaObserver.observe(document.head, { childList: true, subtree: true, characterData: true });
      metaObserver.observe(document.body, { childList: true, subtree: true });

      initFloatingToolbar(true);
      return;
    }

    startEditorObserver(ctx);
    initFloatingToolbar(false);
    initNativeExportButton();

    function startEditorObserver(ctx: any) {
      const OBSERVER_DEBOUNCE_MS = 120;
      let mutationTimer: number | null = null;
      let observedRoot: Node | null = null;

      const observer = new MutationObserver((mutations) => {
        if (
          observedRoot
          && observedRoot !== document.body
          && observedRoot instanceof Node
          && !document.contains(observedRoot)
        ) {
          observeRoot(document.body);
        }

        if (state.currentActiveEditor && document.contains(state.currentActiveEditor)) return;

        const hasRelevantMutation = mutations.some((mutation) => {
          if (isPotentialEditorNode(mutation.target)) return true;

          for (const node of mutation.addedNodes) {
            if (isPotentialEditorNode(node)) return true;
          }

          for (const node of mutation.removedNodes) {
            if (isPotentialEditorNode(node)) return true;
          }

          return false;
        });

        if (!hasRelevantMutation) return;

        if (mutationTimer !== null) {
          clearTimeout(mutationTimer);
        }

        mutationTimer = window.setTimeout(() => {
          mutationTimer = null;
          syncEditorAndPanel();
        }, OBSERVER_DEBOUNCE_MS);
      });

      function observeRoot(root: Node) {
        if (observedRoot === root) return;
        observer.disconnect();
        observer.observe(root, { childList: true, subtree: true });
        observedRoot = root;
        state.observer = observer;
      }

      function getPreferredObserveRoot(editor: HTMLElement): Node {
        const mainRoot = editor.closest('main');
        if (mainRoot) return mainRoot;

        const formRoot = editor.closest('form');
        if (formRoot) return formRoot;

        return editor.parentElement ?? document.body;
      }

      function isPotentialEditorNode(node: Node): boolean {
        if (!(node instanceof Element)) return false;
        if (node.matches(SELECTORS.TEXTAREA_EDITOR) || node.matches(SELECTORS.DIV_EDITOR)) {
          return true;
        }
        return Boolean(
          node.querySelector(SELECTORS.TEXTAREA_EDITOR) || node.querySelector(SELECTORS.DIV_EDITOR),
        );
      }

      function syncEditorAndPanel() {
        const textarea = document.querySelector<HTMLTextAreaElement>(SELECTORS.TEXTAREA_EDITOR);
        const divEditor = document.querySelector<HTMLElement>(SELECTORS.DIV_EDITOR);

        if (!(textarea || divEditor)) {
          setEditor(null, null);
          unmountPanel();
          observeRoot(document.body);

          const songData = extractSongData();
          if (songData.title !== 'TITRE INCONNU' || state.currentSongTitle === 'TITRE INCONNU') {
            setSongTitle(songData.title);
            setArtists(songData.mainArtists, songData.featuringArtists);
          }
          return;
        }

        const editor = textarea ?? (divEditor as HTMLElement);
        const type = textarea ? 'textarea' : 'contenteditable';

        observeRoot(getPreferredObserveRoot(editor));

        if (state.currentActiveEditor === editor) return;

        setEditor(editor as HTMLElement, type);

        const songData = extractSongData();
        setSongTitle(songData.title);
        setArtists(songData.mainArtists, songData.featuringArtists);

        mountPanel(ctx);
      }

      observeRoot(document.body);

      syncEditorAndPanel();
    }

    async function mountPanel(_ctx: any) {
      const existingPanel = document.getElementById('gft-panel-root');
      if (existingPanel) return;

      const controlsSection = document.querySelector(SELECTORS.CONTROLS_STICKY);
      const geniusHelper = document.querySelector(SELECTORS.GENIUS_HELPER);
      if (!controlsSection && !geniusHelper) {
        const container = document.createElement('div');
        container.id = 'gft-panel-root';
        document.body.appendChild(container);
        mountVueApp(container);
        return;
      }

      const container = document.createElement('div');
      container.id = 'gft-panel-root';

      if (controlsSection) {
        controlsSection.prepend(container);
      } else {
        geniusHelper?.parentNode?.insertBefore(container, geniusHelper);
      }

      mountVueApp(container);
    }

    function mountVueApp(container: HTMLElement) {
      panelApp = createApp(GftPanel, { version: GFT_VERSION });
      panelApp.use(i18n);
      panelApp.mount(container);
    }

    function unmountPanel() {
      if (panelApp) {
        panelApp.unmount();
        panelApp = null;
      }
      const existingPanel = document.getElementById('gft-panel-root');
      if (existingPanel) {
        existingPanel.remove();
      }
    }

    async function showOnboarding(_ctx: any) {
      return new Promise<void>((resolve) => {
        const overlay = document.createElement('div');
        overlay.id = 'gft-onboarding-root';
        overlay.style.cssText =
          'position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.7);';
        document.body.appendChild(overlay);

        const app = createApp(OnboardingWizard, {
          onComplete: () => {
            settings.isTutorialCompleted.value = true;
            app.unmount();
            overlay.remove();
            resolve();
          },
        });
        app.use(i18n);
        app.mount(overlay);
      });
    }

    function initFloatingToolbar(lyricCardOnly: boolean) {
      cleanupFloatingToolbar?.();
      cleanupFloatingToolbar = null;

      const container = document.createElement('div');
      container.id = 'gft-toolbar-root';
      document.body.appendChild(container);

      const toolbar = reactive({
        visible: false,
        position: { x: 0, y: 0 },
        showLyricCardOnly: lyricCardOnly,
      });

      const { getSelectedText, insertTextAtCursor, wrapSelection } = useEditor();
      const { generateLyricsCard } = useLyricCard({
        getSelectedText,
        hideToolbar,
        isDarkMode: () => settings.isDarkMode.value,
        version: GFT_VERSION,
        t: (key) => String(i18n.global.t(key)),
        getSongTitle: () => state.currentSongTitle,
        getMainArtists: () => state.currentMainArtists,
        getFeaturingArtists: () => state.currentFeaturingArtists,
        showFeedback: (msg: string) => {
          // Si le panneau est monté, on peut appeler son showFeedback
          // Mais plus simple ici : on peut dispatcher un événement custom
          // que GftPanel écoutera, ou utiliser le state global
          window.dispatchEvent(new CustomEvent('gft-show-feedback', { detail: { message: msg } }));
        },
      });

      function hideToolbar() {
        toolbar.visible = false;
      }

      function getTextareaCaretPosition(element: HTMLTextAreaElement, position: number) {
        const properties = [
          'direction',
          'boxSizing',
          'width',
          'height',
          'overflowX',
          'overflowY',
          'borderTopWidth',
          'borderRightWidth',
          'borderBottomWidth',
          'borderLeftWidth',
          'borderStyle',
          'paddingTop',
          'paddingRight',
          'paddingBottom',
          'paddingLeft',
          'fontStyle',
          'fontVariant',
          'fontWeight',
          'fontStretch',
          'fontSize',
          'fontSizeAdjust',
          'lineHeight',
          'fontFamily',
          'textAlign',
          'textTransform',
          'textIndent',
          'textDecoration',
          'letterSpacing',
          'wordSpacing',
          'tabSize',
          'MozTabSize',
        ];

        const div = document.createElement('div');
        document.body.appendChild(div);

        const style = div.style;
        const computed = window.getComputedStyle(element);

        style.whiteSpace = 'pre-wrap';
        style.overflowWrap = 'break-word';
        style.position = 'absolute';
        style.visibility = 'hidden';

        properties.forEach((prop) => {
          (style as any)[prop] = (computed as any)[prop];
        });

        // Simulate scrollbar presence (or absence) so text wraps at the same width.
        if (element.scrollHeight > Number.parseInt(computed.height, 10)) {
          style.overflowY = 'scroll';
        } else {
          style.overflow = 'hidden';
        }

        div.textContent = element.value.substring(0, position);

        const span = document.createElement('span');
        span.textContent = element.value.substring(position) || '.';
        div.appendChild(span);

        // offsetTop and offsetLeft give the position relative to the DIV.
        const coordinates = {
          top:
            span.offsetTop
            + Number.parseInt(computed.borderTopWidth || '0', 10)
            - element.scrollTop,
          left:
            span.offsetLeft
            + Number.parseInt(computed.borderLeftWidth || '0', 10)
            - element.scrollLeft,
        };

        document.body.removeChild(div);
        return coordinates;
      }

      function isLyricsSelection(): boolean {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return false;

        const lyricsContainer = document.querySelector(SELECTORS.LYRICS_CONTAINER);
        if (!lyricsContainer) return false;

        const range = selection.getRangeAt(0);
        return lyricsContainer.contains(range.commonAncestorContainer);
      }

      function getSelectionRect(): DOMRect | null {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return null;
        return selection.getRangeAt(0).getBoundingClientRect();
      }

      function isValidSelection(): boolean {
        if (lyricCardOnly) {
          const selection = window.getSelection();
          return (
            Boolean(selection && !selection.isCollapsed && selection.toString().trim().length > 0)
            && isLyricsSelection()
          );
        }

        if (!state.currentActiveEditor) {
          return isLyricsSelection();
        }

        if (state.currentEditorType === 'textarea') {
          const textarea = state.currentActiveEditor as HTMLTextAreaElement;
          return (
            document.activeElement === textarea && textarea.selectionStart !== textarea.selectionEnd
          );
        }

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return false;
        const range = selection.getRangeAt(0);
        return state.currentActiveEditor.contains(range.commonAncestorContainer);
      }

      function updateToolbarPosition() {
        if (!isValidSelection() || document.getElementById('gft-lyric-card-modal-root')) {
          hideToolbar();
          return;
        }

        if (!lyricCardOnly && state.currentEditorType === 'textarea' && state.currentActiveEditor) {
          const textarea = state.currentActiveEditor as HTMLTextAreaElement;
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          if (start === end) {
            hideToolbar();
            return;
          }

          const rect = textarea.getBoundingClientRect();
          const startPos = getTextareaCaretPosition(textarea, start);

          toolbar.showLyricCardOnly = false;
          toolbar.position.x = rect.left + startPos.left + 20; // Slightly offset from the start of the selection.
          toolbar.position.y = rect.top + startPos.top;
          toolbar.visible = true;
          return;
        }

        const rect = getSelectionRect();
        if (!rect) {
          hideToolbar();
          return;
        }

        toolbar.showLyricCardOnly = lyricCardOnly || !state.currentActiveEditor;
        toolbar.position.x = rect.left + rect.width / 2;
        toolbar.position.y = rect.top;
        toolbar.visible = true;
      }

      function shouldShowNumberToWords(): boolean {
        if (lyricCardOnly) return false;
        const selected = getSelectedText().trim();
        return isValidNumber(selected);
      }

      const toolbarApp = createApp(
        defineComponent({
          name: 'GftFloatingToolbarRoot',
          setup() {
            function wrapWith(tag: 'b' | 'i') {
              wrapSelection(`<${tag}>`, `</${tag}>`);
              hideToolbar();
            }

            function convertSelectedNumber() {
              const selected = getSelectedText().trim();
              if (!isValidNumber(selected)) {
                hideToolbar();
                return;
              }

              const value = Number.parseInt(selected, 10);
              let words = '';
              if (settings.locale.value === 'en') words = numberToEnglishWords(value);
              else if (settings.locale.value === 'pl') words = numberToPolishWords(value);
              else words = numberToFrenchWords(value);

              insertTextAtCursor(words);
              hideToolbar();
            }

            function openLyricCard() {
              void generateLyricsCard();
            }

            return () =>
              h(FloatingToolbar, {
                visible: toolbar.visible,
                position: toolbar.position,
                lyricCardOnly: toolbar.showLyricCardOnly,
                showNumberToWords: shouldShowNumberToWords(),
                onBold: () => wrapWith('b'),
                onItalic: () => wrapWith('i'),
                onNumberToWords: convertSelectedNumber,
                onAdlib: () => {
                  wrapSelection('(', ')');
                  hideToolbar();
                },
                onLyricCard: openLyricCard,
              });
          },
        }),
      );

      toolbarApp.use(i18n);
      toolbarApp.mount(container);

      // --- Bug fix: prevent toolbar from appearing during drag-selection ---
      // Track whether the mouse button is held down. While dragging, the toolbar
      // must stay hidden to avoid stealing focus / collapsing the selection,
      // which would create an infinite show/hide flicker loop.
      let isMouseDown = false;
      let selectionDebounce: number | null = null;

      const debouncedUpdate = () => {
        if (selectionDebounce !== null) clearTimeout(selectionDebounce);
        selectionDebounce = window.setTimeout(() => {
          selectionDebounce = null;
          if (!isMouseDown) updateToolbarPosition();
        }, 80);
      };

      const onMouseDown = () => {
        isMouseDown = true;
        hideToolbar();
      };

      const onMouseUp = () => {
        isMouseDown = false;
        // Short delay to let the browser finalise the selection range
        setTimeout(updateToolbarPosition, 30);
      };

      const onKeyUp = () => {
        if (!isMouseDown) {
          setTimeout(updateToolbarPosition, 10);
        }
      };

      let scrollRaf: number | null = null;
      const onScroll = () => {
        // Au lieu de cacher la barre au scroll, on la fait suivre la sélection.
        if (!isMouseDown && toolbar.visible) {
          if (scrollRaf !== null) cancelAnimationFrame(scrollRaf);
          scrollRaf = requestAnimationFrame(() => {
            scrollRaf = null;
            updateToolbarPosition();
          });
        }
      };

      document.addEventListener('selectionchange', debouncedUpdate);
      document.addEventListener('mousedown', onMouseDown, true);
      document.addEventListener('mouseup', onMouseUp);
      document.addEventListener('keyup', onKeyUp);
      window.addEventListener('scroll', onScroll, true);

      cleanupFloatingToolbar = () => {
        document.removeEventListener('selectionchange', debouncedUpdate);
        document.removeEventListener('mousedown', onMouseDown, true);
        document.removeEventListener('mouseup', onMouseUp);
        document.removeEventListener('keyup', onKeyUp);
        window.removeEventListener('scroll', onScroll, true);
        if (selectionDebounce !== null) clearTimeout(selectionDebounce);
        if (scrollRaf !== null) cancelAnimationFrame(scrollRaf);
        toolbarApp.unmount();
        container.remove();
      };
    }

    function initNativeExportButton() {
      const GFT_NATIVE_EXPORT_ID = 'gft-native-export-root';

      const observer = new MutationObserver(() => {
        if (document.getElementById(GFT_NATIVE_EXPORT_ID)) return;

        const container = document.querySelector('div[class*="StickyToolbar__Left"]');
        if (!container) return;

        // Trouver un bouton référence dans le conteneur pour copier son style
        const referenceButton = container.querySelector('a, button');
        if (!referenceButton) return;

        const buttonClass = referenceButton.className;
        const svgEl = referenceButton.querySelector('svg');
        const spanEl = referenceButton.querySelector('span');

        const iconClass = svgEl?.getAttribute('class') || '';
        const labelClass = spanEl?.className || '';

        const root = document.createElement('div');
        root.id = GFT_NATIVE_EXPORT_ID;
        root.style.display = 'contents';

        container.appendChild(root);

        const app = createApp(NativeExportButton, { buttonClass, iconClass, labelClass });
        app.use(i18n);
        app.mount(root);
      });

      observer.observe(document.body, { childList: true, subtree: true });
    }

    function setupMessageListener() {
      browser.runtime.onMessage.addListener(
        (message: any, _sender: any, sendResponse: (response?: any) => void) => {
          switch (message.action) {
            case 'GET_STATUS':
              sendResponse({
                lyricCardOnly: settings.isLyricCardOnly.value,
                isDarkMode: settings.isDarkMode.value,
                language: settings.locale.value,
              } satisfies PopupState);
              break;

            case 'SET_MODE':
              if (settings.isLyricCardOnly.value === message.lyricCardOnly) {
                sendResponse();
                break;
              }
              settings.isLyricCardOnly.value = message.lyricCardOnly;
              sendResponse();
              setTimeout(() => location.reload(), 300);
              break;

            case 'SET_THEME':
              settings.isDarkMode.value = message.isDarkMode;
              sendResponse();
              break;

            case 'SET_LANGUAGE':
              settings.locale.value = message.language as Locale;
              settings.transcriptionMode.value = message.language as Locale;
              setLocale(message.language as Locale);
              sendResponse();
              break;

            case 'RESET_TUTORIAL':
              settings.resetTutorial();
              sendResponse();
              setTimeout(() => location.reload(), 300);
              break;
          }

          return true;
        },
      );
    }
  },
});
