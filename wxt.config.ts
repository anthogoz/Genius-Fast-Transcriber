import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-vue', '@wxt-dev/i18n/module'],
  manifest: {
    name: '__MSG_extName__',
    description: '__MSG_extDescription__',
    default_locale: 'en',
    permissions: ['activeTab', 'tabs'],
    host_permissions: ['*://*.genius.com/*'],
    commands: {
      'toggle-play': {
        suggested_key: {
          default: 'Ctrl+Shift+Space',
        },
        description: 'Toggle YouTube Play/Pause',
      },
      'seek-forward': {
        suggested_key: {
          default: 'Ctrl+Shift+Right',
        },
        description: 'Seek Forward +5s',
      },
      'seek-backward': {
        suggested_key: {
          default: 'Ctrl+Shift+Left',
        },
        description: 'Seek Backward -5s',
      },
    },
    web_accessible_resources: [
      {
        resources: [
          'icon/16.png',
          'icon/48.png',
          'icon/128.png',
          'images/geniuslogowhite.png',
          'images/geniuslogoblack.png',
        ],
        matches: ['*://*.genius.com/*'],
      },
    ],
    // Required by Firefox to load the extension without "corrupted" error.
    // WXT silently ignores this field in Chrome/MV3 builds.
    browser_specific_settings: {
      gecko: {
        id: 'genius-fast-transcriber@lnkhey',
        strict_min_version: '109.0',
      },
    },
  },
});

