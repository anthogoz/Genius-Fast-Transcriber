import { ref, watch } from 'vue';
import type { ExtensionMode, KeyboardShortcut, Locale, ShortcutSettings, Theme } from '@/types';

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
  shortcuts: 'gftShortcuts',
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

const isDarkMode = ref(true);
const isHeaderFeatEnabled = ref(true);
const isTagNewlinesDisabled = ref(false);
const isLyricCardOnly = ref(false);
const isPanelCollapsed = ref(false);
const areTooltipsEnabled = ref(true);
const locale = ref<Locale>('fr');
const transcriptionMode = ref<Locale>('fr');
const isTutorialCompleted = ref(false);

const DEFAULT_SHORTCUTS: ShortcutSettings = {
  verse: { key: '1', code: 'Digit1', ctrlKey: true },
  chorus: { key: '2', code: 'Digit2', ctrlKey: true },
  bridge: { key: '3', code: 'Digit3', ctrlKey: true },
  intro: { key: '4', code: 'Digit4', ctrlKey: true },
  outro: { key: '5', code: 'Digit5', ctrlKey: true },
  fixAll: { key: 'C', code: 'KeyC', ctrlKey: true, shiftKey: true },
  toggleStats: { key: 'S', code: 'KeyS', ctrlKey: true, shiftKey: true },
  duplicateLine: { key: 'D', code: 'KeyD', ctrlKey: true },
  undo: { key: 'z', code: 'KeyZ', ctrlKey: true },
  redo: { key: 'y', code: 'KeyY', ctrlKey: true },
  ytPlayPause: { key: ' ', code: 'Space', altKey: true, ctrlKey: true },
  ytSeekBack: { key: 'ArrowLeft', code: 'ArrowLeft', altKey: true, ctrlKey: true },
  ytSeekForward: { key: 'ArrowRight', code: 'ArrowRight', altKey: true, ctrlKey: true },
};

const shortcuts = ref<ShortcutSettings>({ ...DEFAULT_SHORTCUTS });

const theme = ref<Theme>('dark');
const mode = ref<ExtensionMode>('full');

let initialized = false;
let watchersBound = false;

export function useSettings() {
  if (!initialized) {
    isDarkMode.value = readBool(STORAGE_KEYS.darkMode, true);
    isHeaderFeatEnabled.value = readBool(STORAGE_KEYS.headerFeat, true);
    isTagNewlinesDisabled.value = readBool(STORAGE_KEYS.tagNewlines);
    isLyricCardOnly.value = readBool(STORAGE_KEYS.lyricCardOnly);
    isPanelCollapsed.value = readBool(STORAGE_KEYS.panelCollapsed);
    areTooltipsEnabled.value = readBool(STORAGE_KEYS.tooltipsEnabled, true);
    locale.value = readString(STORAGE_KEYS.language, 'fr');
    transcriptionMode.value = readString(STORAGE_KEYS.transcriptionMode, locale.value);
    isTutorialCompleted.value = readBool(STORAGE_KEYS.tutorialCompleted);

    const savedShortcuts = localStorage.getItem(STORAGE_KEYS.shortcuts);
    if (savedShortcuts) {
      try {
        shortcuts.value = { ...DEFAULT_SHORTCUTS, ...JSON.parse(savedShortcuts) };
      } catch (e) {
        console.warn('GFT: Failed to parse shortcuts', e);
      }
    }

    theme.value = isDarkMode.value ? 'dark' : 'light';
    mode.value = isLyricCardOnly.value ? 'lyric-card-only' : 'full';
    initialized = true;
  }

  if (!watchersBound) {
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
    watch(transcriptionMode, (v) => localStorage.setItem(STORAGE_KEYS.transcriptionMode, v));
    watch(isTutorialCompleted, (v) => writeBool(STORAGE_KEYS.tutorialCompleted, v));
    watch(
      shortcuts,
      (v) => {
        localStorage.setItem(STORAGE_KEYS.shortcuts, JSON.stringify(v));
      },
      { deep: true },
    );

    watch(theme, (v) => {
      isDarkMode.value = v === 'dark';
    });
    watch(mode, (v) => {
      isLyricCardOnly.value = v === 'lyric-card-only';
    });

    watchersBound = true;
  }

  function resetTutorial() {
    isTutorialCompleted.value = false;
  }

  function resetShortcuts() {
    shortcuts.value = JSON.parse(JSON.stringify(DEFAULT_SHORTCUTS));
  }

  return {
    isDarkMode,
    isHeaderFeatEnabled,
    isTagNewlinesDisabled,
    isLyricCardOnly,
    isPanelCollapsed,
    areTooltipsEnabled,
    locale,
    transcriptionMode,
    isTutorialCompleted,
    theme,
    mode,
    shortcuts,
    resetTutorial,
    resetShortcuts,
    STORAGE_KEYS,
  };
}
