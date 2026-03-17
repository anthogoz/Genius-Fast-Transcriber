import { browser } from 'wxt/browser';

export default defineBackground(() => {
  browser.commands.onCommand.addListener(async (command) => {
    console.log('GFT: Command received in background:', command);

    try {
      // Find the active tab in any window (last focused)
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
});
