import { createApp, defineComponent, h, reactive } from 'vue';
import { browser } from 'wxt/browser';
import '@/assets/content.css';
import FloatingToolbar from '@/components/content/FloatingToolbar.vue';
import GftPanel from '@/components/content/GftPanel.vue';
import OnboardingWizard from '@/components/content/OnboardingWizard.vue';
import { useEditor } from '@/composables/useEditor';
import { useGftState } from '@/composables/useGftState';
import { useLyricCard } from '@/composables/useLyricCard';
import { useSettings } from '@/composables/useSettings';
import { SELECTORS, useSongData } from '@/composables/useSongData';
import { i18n, setLocale } from '@/i18n';
import type { Locale, PopupState } from '@/types';
import {
  isValidNumber,
  numberToEnglishWords,
  numberToFrenchWords,
  numberToPolishWords,
} from '@/utils/numberToWords';

export default defineContentScript({
  matches: ['*://*.genius.com/*-lyrics'],
  cssInjectionMode: 'manifest',

  async main(ctx) {
    const settings = useSettings();
    const { setEditor, setArtists, setSongTitle, state } = useGftState();
    const { extractSongData } = useSongData();

    setLocale(settings.locale.value);

    const GFT_VERSION = browser.runtime.getManifest().version;

    if (!settings.isTutorialCompleted.value) {
      await showOnboarding(ctx);
    }

    setupMessageListener();

    if (settings.isLyricCardOnly.value) {
      initFloatingToolbar(true);
      return;
    }

    startEditorObserver(ctx);
    initFloatingToolbar(false);

    function startEditorObserver(ctx: any) {
      const observer = new MutationObserver(() => {
        const textarea = document.querySelector<HTMLTextAreaElement>(SELECTORS.TEXTAREA_EDITOR);
        const divEditor = document.querySelector<HTMLElement>(SELECTORS.DIV_EDITOR);

        if (textarea || divEditor) {
          const editor = textarea ?? (divEditor as HTMLElement);
          const type = textarea ? 'textarea' : 'contenteditable';

          if (state.currentActiveEditor !== editor) {
            setEditor(editor as HTMLElement, type);

            const songData = extractSongData();
            setSongTitle(songData.title);
            setArtists(songData.mainArtists, songData.featuringArtists);

            mountPanel(ctx);
          }
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
      state.observer = observer;

      const existingTextarea = document.querySelector<HTMLTextAreaElement>(
        SELECTORS.TEXTAREA_EDITOR,
      );
      const existingDiv = document.querySelector<HTMLElement>(SELECTORS.DIV_EDITOR);
      if (existingTextarea || existingDiv) {
        const editor = existingTextarea ?? (existingDiv as HTMLElement);
        const type = existingTextarea ? 'textarea' : 'contenteditable';
        setEditor(editor as HTMLElement, type);

        const songData = extractSongData();
        setSongTitle(songData.title);
        setArtists(songData.mainArtists, songData.featuringArtists);

        mountPanel(ctx);
      }
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
      const app = createApp(GftPanel, { version: GFT_VERSION });
      app.use(i18n);
      app.mount(container);
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
      const existing = document.getElementById('gft-toolbar-root');
      existing?.remove();

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
        if (!isValidSelection()) {
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

      const selectionHandler = () => setTimeout(updateToolbarPosition, 10);
      const hideHandler = () => hideToolbar();

      document.addEventListener('selectionchange', selectionHandler);
      document.addEventListener('mouseup', selectionHandler);
      document.addEventListener('keyup', selectionHandler);
      window.addEventListener('scroll', hideHandler, true);
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
