import { ref, watch } from 'vue';
import type { ExtensionMode, Locale, Theme } from '@/types';

const STORAGE_KEYS = {
  darkMode: 'gftDarkModeEnabled',
  headerFeat: 'gftHeaderFeatEnabled',
  tagNewlines: 'gftDisableTagNewlines',
  lyricCardOnly: 'gftLyricCardOnly',
  panelCollapsed: 'gftPanelCollapsed',
  transcriptionMode: 'gftTranscriptionMode',
  customButtons: 'gftCustomButtons',
  tooltipsEnabled: 'gftTooltipsEnabled',
  language: 'gftLanguage',
  tutorialCompleted: 'gftTutorialDone',
} as const;

function readBool(key: string, defaultValue = false): boolean {
  const val = localStorage.getItem(key);
  if (val === null) return defaultValue;
  return val === 'true';
}

function writeBool(key: string, value: boolean) {
  localStorage.setItem(key, String(value));
}

function readString<T extends string>(key: string, defaultValue: T): T {
  return (localStorage.getItem(key) as T) ?? defaultValue;
}

export function useSettings() {
  const isDarkMode = ref(readBool(STORAGE_KEYS.darkMode));
  const isHeaderFeatEnabled = ref(readBool(STORAGE_KEYS.headerFeat));
  const isTagNewlinesDisabled = ref(readBool(STORAGE_KEYS.tagNewlines));
  const isLyricCardOnly = ref(readBool(STORAGE_KEYS.lyricCardOnly));
  const isPanelCollapsed = ref(readBool(STORAGE_KEYS.panelCollapsed));
  const areTooltipsEnabled = ref(readBool(STORAGE_KEYS.tooltipsEnabled, true));
  const locale = ref<Locale>(readString(STORAGE_KEYS.language, 'fr'));
  const isTutorialCompleted = ref(readBool(STORAGE_KEYS.tutorialCompleted));

  const theme = ref<Theme>(isDarkMode.value ? 'dark' : 'light');
  const mode = ref<ExtensionMode>(isLyricCardOnly.value ? 'lyric-card-only' : 'full');

  watch(isDarkMode, (v) => {
    writeBool(STORAGE_KEYS.darkMode, v);
    theme.value = v ? 'dark' : 'light';
  });
  watch(isHeaderFeatEnabled, (v) => writeBool(STORAGE_KEYS.headerFeat, v));
  watch(isTagNewlinesDisabled, (v) => writeBool(STORAGE_KEYS.tagNewlines, v));
  watch(isLyricCardOnly, (v) => {
    writeBool(STORAGE_KEYS.lyricCardOnly, v);
    mode.value = v ? 'lyric-card-only' : 'full';
  });
  watch(isPanelCollapsed, (v) => writeBool(STORAGE_KEYS.panelCollapsed, v));
  watch(areTooltipsEnabled, (v) => writeBool(STORAGE_KEYS.tooltipsEnabled, v));
  watch(locale, (v) => localStorage.setItem(STORAGE_KEYS.language, v));
  watch(isTutorialCompleted, (v) => writeBool(STORAGE_KEYS.tutorialCompleted, v));

  watch(theme, (v) => {
    isDarkMode.value = v === 'dark';
  });
  watch(mode, (v) => {
    isLyricCardOnly.value = v === 'lyric-card-only';
  });

  function resetTutorial() {
    isTutorialCompleted.value = false;
  }

  return {
    isDarkMode,
    isHeaderFeatEnabled,
    isTagNewlinesDisabled,
    isLyricCardOnly,
    isPanelCollapsed,
    areTooltipsEnabled,
    locale,
    isTutorialCompleted,
    theme,
    mode,
    resetTutorial,
    STORAGE_KEYS,
  };
}
