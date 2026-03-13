<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { browser } from 'wxt/browser';
import LanguageSelector from '@/components/popup/LanguageSelector.vue';
import ModeSelector from '@/components/popup/ModeSelector.vue';
import ThemeSelector from '@/components/popup/ThemeSelector.vue';
import { setLocale } from '@/i18n';
import type { ExtensionMode, Locale, PopupState, PopupAction, Theme } from '@/types';

const { t } = useI18n();

const mode = ref<ExtensionMode>('full');
const theme = ref<Theme>('dark');
const locale = ref<Locale>('fr');
const status = ref(t('popup_status_loading'));
const disabled = ref(false);
const version = ref('');
const isHydrating = ref(true);
const syncedMode = ref<ExtensionMode>('full');
const syncedTheme = ref<Theme>('dark');
const syncedLocale = ref<Locale>('fr');

let currentTabId: number | null = null;

function applyState(state: PopupState) {
  isHydrating.value = true;
  mode.value = state.lyricCardOnly ? 'lyric-card-only' : 'full';
  theme.value = state.isDarkMode ? 'dark' : 'light';
  locale.value = state.language;
  syncedMode.value = mode.value;
  syncedTheme.value = theme.value;
  syncedLocale.value = locale.value;
  setLocale(state.language);
  isHydrating.value = false;
}

function sendMessage(
  action: PopupAction['action'],
  data: Record<string, unknown> = {},
  options: { closeOnSuccess?: boolean } = {},
) {
  if (currentTabId === null) return;
  const { closeOnSuccess = true } = options;
  status.value = t('popup_status_updating');
  browser.tabs.sendMessage(currentTabId, { action, ...data }).then(() => {
    status.value = t('popup_status_saved');
    if (closeOnSuccess) {
      setTimeout(() => window.close(), 800);
    }
  });
}

onMounted(async () => {
  const manifest = browser.runtime.getManifest();
  version.value = `v${manifest.version}`;

  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];

    if (!tab?.url?.includes('genius.com')) {
      status.value = t('popup_status_not_genius');
      disabled.value = true;
      return;
    }

    currentTabId = tab.id ?? null;
  if (currentTabId === null) return;

    const response = await browser.tabs.sendMessage(currentTabId, {
      action: 'GET_STATUS',
    }) as PopupState | undefined;

    if (response) {
      applyState(response);
      status.value = t('popup_status_ready');
    }
  } catch {
    status.value = t('popup_status_reload');
  }
});

watch(mode, (val) => {
  if (isHydrating.value) return;
  if (val === syncedMode.value) return;
  syncedMode.value = val;
  sendMessage('SET_MODE', { lyricCardOnly: val === 'lyric-card-only' });
});

watch(theme, (val) => {
  if (isHydrating.value) return;
  if (val === syncedTheme.value) return;
  syncedTheme.value = val;
  sendMessage('SET_THEME', { isDarkMode: val === 'dark' }, { closeOnSuccess: false });
});

watch(locale, (val) => {
  if (isHydrating.value) return;
  if (val === syncedLocale.value) return;
  syncedLocale.value = val;
  setLocale(val);
  sendMessage('SET_LANGUAGE', { language: val }, { closeOnSuccess: false });
});

function restartTutorial() {
  if (currentTabId === null) return;
  browser.tabs.sendMessage(currentTabId, { action: 'RESET_TUTORIAL' });
  window.close();
}
</script>

<template>
  <div class="popup" :class="{ 'light-mode': theme === 'light' }">
    <div class="header">
      <img src="/icon/128.png" alt="GFT Logo" />
      <h2>Genius Fast Transcriber</h2>
    </div>

    <div :class="{ disabled }">
      <ModeSelector v-model="mode" />
      <ThemeSelector v-model="theme" />
      <LanguageSelector v-model="locale" />

      <div class="gft-u-popup-section-title">{{ t('popup_help_title') }}</div>
      <button type="button" class="gft-u-popup-dashed-btn" @click="restartTutorial">
        ❓ {{ t('popup_restart_tutorial') }}
      </button>
    </div>

    <div class="status">{{ status }}</div>

    <div class="footer">
      <div class="footer-links">
        <a href="https://buymeacoffee.com/lnkhey" target="_blank" rel="noopener noreferrer">
          ☕ {{ t('footer_buy_me_a_coffee') }}
        </a>
        <a
          href="https://github.com/anthogoz/Genius-Fast-Transcriber"
          target="_blank"
          rel="noopener noreferrer"
        >
          💻 {{ t('footer_github') }}
        </a>
      </div>
      <div class="version">{{ version }}</div>
    </div>
  </div>
</template>

<style scoped>
.popup {
  --primary: #ffff64;
  --bg: #222;
  --card-bg: #333;
  --text: #fff;
  --text-muted: #aaa;
  --text-active: #ffff64;
  --border: rgba(255, 255, 255, 0.1);
  --accent-shadow: rgba(255, 255, 100, 0.1);

  width: 320px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    sans-serif;
  background: var(--bg);
  color: var(--text);
  padding: 16px;
  margin: 0;
  user-select: none;
  transition: background 0.3s ease, color 0.3s ease;
}

.popup.light-mode {
  --bg: #ffffff;
  --card-bg: #f8f9fa;
  --text: #1a1a1a;
  --text-muted: #6c757d;
  --text-active: #b59400;
  --border: rgba(0, 0, 0, 0.08);
  --accent-shadow: rgba(0, 0, 0, 0.05);
}

.header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  position: relative;
}

.header::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 40px;
  height: 3px;
  background: var(--primary);
  border-radius: 99px;
}

.header img {
  width: 32px;
  height: 32px;
}

.header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.status {
  font-size: 11px;
  color: var(--text-muted);
  text-align: center;
  margin-top: 16px;
  opacity: 0.7;
}

.footer {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.footer-links {
  display: flex;
  gap: 10px;
  width: 100%;
}

.footer-links a {
  flex: 1;
  color: var(--text);
  text-decoration: none;
  font-size: 11px;
  font-weight: 600;
  padding: 8px;
  border-radius: 8px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
}

.footer-links a:hover {
  background: var(--primary);
  color: #000;
  border-color: var(--primary);
}

.version {
  font-size: 9px;
  font-family: monospace;
  color: var(--text-muted);
  opacity: 0.5;
}
</style>
