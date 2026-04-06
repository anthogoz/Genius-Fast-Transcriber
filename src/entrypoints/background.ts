import { browser } from 'wxt/browser';

export default defineBackground(() => {
  // --- Keyboard shortcut commands ---
  browser.commands.onCommand.addListener(async (command) => {
    console.log('GFT: Command received in background:', command);

    try {
      const tabs = await browser.tabs.query({ active: true, lastFocusedWindow: true });
      const tab = tabs[0];

      if (tab?.id) {
        console.log('GFT: Sending command to tab:', tab.id);
        await browser.tabs.sendMessage(tab.id, { type: 'GFT_COMMAND', command });
      } else {
        console.warn('GFT: No active tab found to send command');
      }
    } catch (err) {
      console.error('GFT: Error sending command to tab:', err);
    }
  });

  // --- Fetch proxy for Genius API calls ---
  // Routes fetch requests through the background script so that network errors
  // (e.g. 403) do not appear in the page's DevTools console. This was the cause
  // of Chrome Web Store rejection ("Getting 403 errors in the console").
  browser.runtime.onMessage.addListener(
    (message: any, _sender: any, sendResponse: (response?: any) => void) => {
      if (message?.type !== 'GFT_FETCH') return false;

      const url: string = message.url;
      if (!url) {
        sendResponse({ ok: false, status: 0, body: null });
        return true;
      }

      fetch(url)
        .then(async (response) => {
          if (!response.ok) {
            sendResponse({ ok: false, status: response.status, body: null });
            return;
          }
          const body = await response.json();
          sendResponse({ ok: true, status: response.status, body });
        })
        .catch(() => {
          sendResponse({ ok: false, status: 0, body: null });
        });

      // Return true to indicate we will call sendResponse asynchronously.
      return true;
    },
  );
});
