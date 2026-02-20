// Global State & Constants

// ----- État Global Mutable -----
// Regroupé dans un objet pour permettre la modification par les différents modules.
export const GFT_STATE = {
    coupletCounter: 1,
    detectedArtists: [],
    currentActiveEditor: null,
    currentEditorType: null,
    shortcutsContainerElement: null,
    observer: null,
    currentSongTitle: "TITRE INCONNU",
    currentMainArtists: [],
    currentFeaturingArtists: [],
    darkModeButton: null,
    floatingFormattingToolbar: null,
    undoStack: [],
    redoStack: [],
    feedbackTimeout: null,
    feedbackAnimationTimeout: null,
    lastSavedContent: '',
    hasUnsavedChanges: false,
    autoSaveTimeout: null
};

// ----- Constantes (Immuables) -----
export const DARK_MODE_CLASS = 'gft-dark-mode';
export const DARK_MODE_STORAGE_KEY = 'gftDarkModeEnabled';
export const HEADER_FEAT_STORAGE_KEY = 'gftHeaderFeatEnabled';
export const DISABLE_TAG_NEWLINES_STORAGE_KEY = 'gftDisableTagNewlines';
export const LYRIC_CARD_ONLY_STORAGE_KEY = 'gftLyricCardOnly';
export const PANEL_COLLAPSED_STORAGE_KEY = 'gftPanelCollapsed';
export const TRANSCRIPTION_MODE_STORAGE_KEY = 'gftTranscriptionMode';
export const CUSTOM_BUTTONS_STORAGE_KEY = 'gftCustomButtons';
export const TOOLTIPS_ENABLED_STORAGE_KEY = 'gftTooltipsEnabled';
export const MAX_HISTORY_SIZE = 10;

export const LYRICS_HELPER_HIGHLIGHT_CLASS = 'lyrics-helper-highlight';
export const SHORTCUTS_CONTAINER_ID = 'genius-lyrics-shortcuts-container';
export const ARTIST_SELECTOR_CONTAINER_ID = 'artistSelectorContainerLyricsHelper';
export const COUPLET_BUTTON_ID = 'coupletButton_GFT';
export const FEEDBACK_MESSAGE_ID = 'gft-feedback-message';
export const GFT_VISIBLE_CLASS = 'gft-visible';
export const FLOATING_TOOLBAR_ID = 'gft-floating-formatting-toolbar';

// Sélecteurs CSS
export const SELECTORS = {
    TITLE: [
        'h1[class*="SongHeader-desktop_Title"] span[class*="SongHeader-desktop_HiddenMask"]',
        'h1[class*="SongHeader-desktop_Title"]', 'h1[class*="SongHeader__Title"]',
        '.song_header-primary_info-title',
    ],
    OG_TITLE_META: 'meta[property="og:title"]',
    TWITTER_TITLE_META: 'meta[name="twitter:title"]',
    CREDITS_PAGE_ARTIST_LIST_CONTAINER: 'div[class*="TrackCreditsPage__CreditList"]',
    CREDITS_PAGE_ARTIST_NAME_IN_LINK: 'a[class*="Credit-sc"] span[class*="Name-sc"]',
    MAIN_ARTISTS_CONTAINER_FALLBACK: 'div[class*="HeaderArtistAndTracklist-desktop__ListArtists"]',
    MAIN_ARTIST_LINK_IN_CONTAINER_FALLBACK: 'a[class*="StyledLink"]',
    FALLBACK_MAIN_ARTIST_LINKS_FALLBACK: 'a[class*="SongHeader__Artist"], a[data-testid="ArtistLink"]',
    TEXTAREA_EDITOR: 'textarea[class*="ExpandingTextarea__Textarea"]',
    DIV_EDITOR: 'div[data-testid="lyrics-input"]',
    CONTROLS_STICKY_SECTION: 'div[class^="LyricsEdit-desktop__Controls-sc-"]',
    GENIUS_FORMATTING_HELPER: 'div[class*="LyricsEditExplainer__Container-sc-"][class*="LyricsEdit-desktop__Explainer-sc-"]',
    LYRICS_CONTAINER: '[data-lyrics-container="true"]'
};
