export type Locale = 'fr' | 'en' | 'pl' | 'es' | 'de' | 'it' | 'pt' | 'ru';

export type ExtensionMode = 'full' | 'lyric-card-only';

export type Theme = 'light' | 'dark';

export type EditorType = 'textarea' | 'contenteditable' | null;

export interface SongData {
  title: string;
  mainArtists: string[];
  featuringArtists: string[];
}

export interface SongDataRaw extends SongData {
  _rawMainArtists: string[];
  _rawFeaturingArtistsFromSection: string[];
  _rawFeaturingArtistsFromTitleExtract: string[];
}

export interface GftState {
  verseCounter: number;
  detectedArtists: string[];
  currentActiveEditor: HTMLElement | null;
  currentEditorType: EditorType;
  panelElement: HTMLElement | null;
  observer: MutationObserver | null;
  currentSongTitle: string;
  currentMainArtists: string[];
  currentFeaturingArtists: string[];
  floatingToolbar: HTMLElement | null;
  undoStack: string[];
  redoStack: string[];
  lastSavedContent: string;
  hasUnsavedChanges: boolean;
}

export interface CorrectionOptions {
  yPrime: boolean;
  apostrophes: boolean;
  oeuLigature: boolean;
  frenchQuotes: boolean;
  longDash: boolean;
  punctuation: boolean;
  doubleSpaces: boolean;
  spacing: boolean;
  quoteSpaces: boolean;
  majuscules: boolean;
  songHeader: boolean;
  repetitions: boolean;
  tagSeparator: boolean;
  englishAbbreviations: boolean;
}

export interface CorrectionCounts {
  yPrime: number;
  apostrophes: number;
  oeuLigature: number;
  frenchQuotes: number;
  longDash: number;
  punctuation: number;
  doubleSpaces: number;
  spacing: number;
  quoteSpaces: number;
  majuscules: number;
  songHeader: number;
  repetitions: number;
  bracketSpaces: number;
  tagSeparator: number;
  englishAbbreviations: number;
}

export interface CorrectionResult {
  newText: string;
  correctionsCount: number;
  corrections: CorrectionCounts;
}

export interface CorrectionRule {
  id: keyof CorrectionCounts;
  progressKey: string;
  execute: (
    text: string,
    corrections: CorrectionCounts,
    opts: CorrectionOptions,
    locale: Locale,
    songData?: SongData,
  ) => string;
}

export interface DiffChunk {
  type: 'common' | 'removed' | 'added';
  value: string;
}

export interface UnmatchedBracket {
  char: string;
  position: number;
  type: 'opening-without-closing' | 'closing-without-opening' | 'wrong-pair';
}

export interface ExportOptions {
  removeTags?: boolean;
  removeSpacing?: boolean;
}

export interface CustomButton {
  id: string;
  label: string;
  type: 'structure' | 'cleanup';
  content?: string;
  findPattern?: string;
  replaceWith?: string;
  isRegex?: boolean;
  caseSensitive?: boolean;
}

export interface PopupState {
  lyricCardOnly: boolean;
  isDarkMode: boolean;
  language: Locale;
}

export type PopupAction =
  | { action: 'GET_STATUS' }
  | { action: 'SET_MODE'; lyricCardOnly: boolean }
  | { action: 'SET_THEME'; isDarkMode: boolean }
  | { action: 'SET_LANGUAGE'; language: Locale }
  | { action: 'RESET_TUTORIAL' };

export interface LyricsStats {
  lines: number;
  words: number;
  sections: number;
  characters: number;
}

export interface KeyboardShortcut {
  key: string;
  code: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
}

export interface ShortcutSettings {
  verse: KeyboardShortcut;
  chorus: KeyboardShortcut;
  bridge: KeyboardShortcut;
  intro: KeyboardShortcut;
  outro: KeyboardShortcut;
  fixAll: KeyboardShortcut;
  toggleStats: KeyboardShortcut;
  duplicateLine: KeyboardShortcut;
  undo: KeyboardShortcut;
  redo: KeyboardShortcut;
  ytPlayPause: KeyboardShortcut;
  ytSeekBack: KeyboardShortcut;
  ytSeekForward: KeyboardShortcut;
}
