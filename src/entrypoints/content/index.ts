import { createApp } from 'vue';
import { browser } from 'wxt/browser';
import FloatingToolbar from '@/components/content/FloatingToolbar.vue';
import GftPanel from '@/components/content/GftPanel.vue';
import OnboardingWizard from '@/components/content/OnboardingWizard.vue';
import { useGftState } from '@/composables/useGftState';
import { useSettings } from '@/composables/useSettings';
import { SELECTORS, useSongData } from '@/composables/useSongData';
import { i18n, setLocale } from '@/i18n';
import type { Locale, PopupState } from '@/types';

export default defineContentScript({
  matches: ['*://*.genius.com/*-lyrics'],
  cssInjectionMode: 'ui',

  async main(ctx) {
    const settings = useSettings();
    const { setEditor, setArtists, setSongTitle, state } = useGftState();
    const { extractSongData } = useSongData();

    setLocale(settings.locale.value);

    let GFT_VERSION = '4.2.0';
    try {
      GFT_VERSION = browser.runtime.getManifest().version;
    } catch {}
    console.log(`Genius Fast Transcriber v${GFT_VERSION}`);

    if (!settings.isTutorialCompleted.value) {
      await showOnboarding(ctx);
    }

    if (settings.isLyricCardOnly.value) {
      initLyricCardMode(ctx);
      return;
    }

    startEditorObserver(ctx);

    setupMessageListener();

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
      const anchorElement = geniusHelper ?? controlsSection;

      if (!anchorElement) {
        const container = document.createElement('div');
        container.id = 'gft-panel-root';
        document.body.appendChild(container);
        mountVueApp(container);
        return;
      }

      const container = document.createElement('div');
      container.id = 'gft-panel-root';
      anchorElement.parentNode?.insertBefore(container, anchorElement.nextSibling);
      mountVueApp(container);
    }

    function mountVueApp(container: HTMLElement) {
      const app = createApp(GftPanel);
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

    function initLyricCardMode(_ctx: any) {
      const container = document.createElement('div');
      container.id = 'gft-toolbar-root';
      document.body.appendChild(container);

      const app = createApp(FloatingToolbar, {
        visible: false,
        position: { x: 0, y: 0 },
        lyricCardOnly: true,
      });
      app.use(i18n);
      app.mount(container);

      document.addEventListener('mouseup', () => {
        const selection = window.getSelection();
        if (selection && selection.toString().trim().length > 0) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          const toolbarEl = container.querySelector('.gft-floating-toolbar') as HTMLElement;
          if (toolbarEl) {
            toolbarEl.style.top = `${rect.top + window.scrollY - 50}px`;
            toolbarEl.style.left = `${rect.left + window.scrollX + rect.width / 2}px`;
            toolbarEl.style.display = 'flex';
          }
        }
      });
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
              settings.isLyricCardOnly.value = message.lyricCardOnly;
              sendResponse();
              setTimeout(() => location.reload(), 300);
              break;

            case 'SET_THEME':
              settings.isDarkMode.value = message.isDarkMode;
              sendResponse();
              setTimeout(() => location.reload(), 300);
              break;

            case 'SET_LANGUAGE':
              settings.locale.value = message.language as Locale;
              setLocale(message.language as Locale);
              sendResponse();
              setTimeout(() => location.reload(), 300);
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
