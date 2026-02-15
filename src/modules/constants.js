// Auto-extracted from content.js — Global State & Constants

// ----- Global Variables -----
// These are mutable module-level variables shared across modules.

// ----- Déclarations des variables globales -----
// Ces variables maintiennent l'état de l'extension pendant que l'utilisateur navigue.

let coupletCounter = 1; // Compteur pour le numéro du couplet, s'incrémente à chaque ajout.
let detectedArtists = []; // Liste des artistes (principaux + featurings) détectés sur la page.
let currentActiveEditor = null; // Référence à l'élément DOM de l'éditeur de texte (textarea ou div).
let currentEditorType = null; // Type de l'éditeur ('textarea' ou 'div').
let shortcutsContainerElement = null; // L'élément DOM principal qui contient tous les outils de l'extension.
let observer; // L'instance du MutationObserver pour surveiller les changements dans la page.
let currentSongTitle = "TITRE INCONNU"; // Le titre de la chanson, extrait de la page.
let currentMainArtists = []; // Liste des artistes principaux.
let currentFeaturingArtists = []; // Liste des artistes en featuring.
const DARK_MODE_CLASS = 'gft-dark-mode'; // Classe CSS pour le mode sombre du panneau.
const DARK_MODE_STORAGE_KEY = 'gftDarkModeEnabled'; // Clé pour stocker la préférence du mode sombre dans le localStorage.
const HEADER_FEAT_STORAGE_KEY = 'gftHeaderFeatEnabled'; // Clé pour stocker la préférence d'inclusion des feat dans l'en-tête.
const DISABLE_TAG_NEWLINES_STORAGE_KEY = 'gftDisableTagNewlines'; // Clé pour stocker la préférence de saut de ligne après tags.
const LYRIC_CARD_ONLY_STORAGE_KEY = 'gftLyricCardOnly'; // Clé pour stocker la préférence du mode "Lyric Card Only".
const PANEL_COLLAPSED_STORAGE_KEY = 'gftPanelCollapsed'; // Clé pour stocker l'état replié/déplié du panneau.
const TRANSCRIPTION_MODE_STORAGE_KEY = 'gftTranscriptionMode'; // Clé pour stocker le mode de transcription (fr/en).
const CUSTOM_BUTTONS_STORAGE_KEY = 'gftCustomButtons'; // Clé pour stocker les boutons personnalisés.
let darkModeButton = null; // Référence au bouton pour activer/désactiver le mode sombre.
let floatingFormattingToolbar = null; // Référence à la barre d'outils flottante pour le formatage (gras/italique).
let undoStack = []; // Stack pour l'historique des modifications (max 10 entrées).
let redoStack = []; // Stack pour refaire les modifications annulées.
const MAX_HISTORY_SIZE = 10; // Nombre maximum d'états sauvegardés dans l'historique.
let feedbackTimeout = null; // Timer pour cacher le message de feedback.
let feedbackAnimationTimeout = null; // Timer pour l'animation de fermeture du feedback.


// ----- Constantes Utiles -----
// Regroupement des sélecteurs CSS et des identifiants pour faciliter la maintenance.

const LYRICS_HELPER_HIGHLIGHT_CLASS = 'lyrics-helper-highlight'; // Classe CSS pour surligner temporairement les corrections.
const SHORTCUTS_CONTAINER_ID = 'genius-lyrics-shortcuts-container'; // ID du conteneur principal du panneau d'outils.
const ARTIST_SELECTOR_CONTAINER_ID = 'artistSelectorContainerLyricsHelper'; // ID du conteneur pour les cases à cocher des artistes.
const COUPLET_BUTTON_ID = 'coupletButton_GFT'; // ID spécifique pour le bouton d'ajout de couplet.
const FEEDBACK_MESSAGE_ID = 'gft-feedback-message'; // ID de l'élément affichant les messages de feedback (ex: "3 corrections effectuées").
const GFT_VISIBLE_CLASS = 'gft-visible'; // Classe CSS pour rendre visible un élément (utilisé pour le feedback).
const FLOATING_TOOLBAR_ID = 'gft-floating-formatting-toolbar'; // ID de la barre d'outils flottante pour le formatage.

// Sélecteurs CSS pour trouver les éléments clés sur les pages de Genius.
// Les tableaux permettent d'avoir des sélecteurs de secours si Genius met à jour son site.
const SELECTORS = {
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
    TEXTAREA_EDITOR: 'textarea[class*="ExpandingTextarea__Textarea"]', // Éditeur de paroles (ancien)
    DIV_EDITOR: 'div[data-testid="lyrics-input"]', // Éditeur de paroles (nouveau, content-editable)
    CONTROLS_STICKY_SECTION: 'div[class^="LyricsEdit-desktop__Controls-sc-"]', // Section où le panneau d'outils sera injecté.
    GENIUS_FORMATTING_HELPER: 'div[class*="LyricsEditExplainer__Container-sc-"][class*="LyricsEdit-desktop__Explainer-sc-"]', // Aide de Genius, que nous masquons.
    LYRICS_CONTAINER: '[data-lyrics-container="true"]' // Conteneur des paroles en mode lecture
};

// ----- Traductions & Internationalisation -----

