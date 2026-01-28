// content.js (Version 3.0.1 - Extension Complète)
/**
 * @file Fichier principal de l'extension "Genius Fast Transcriber" v3.0.1.
 * Ce script s'injecte dans les pages du site genius.com.
 * Il détecte la présence de l'éditeur de paroles et y ajoute un panneau d'outils
 * pour accélérer et fiabiliser la transcription (ajout de tags, correction de texte, etc.).
 * 
 * Fonctionnalités principales :
 * - Tags structuraux intelligents avec détection automatique des artistes
 * - Raccourcis clavier (Ctrl+1-5, Ctrl+Shift+C, Ctrl+Z/Y, Ctrl+Shift+S)
 * - Historique Undo/Redo (10 dernières modifications)
 * - Prévisualisation des corrections avec modal avant/après
 * - Statistiques en temps réel (lignes, mots, sections, caractères)
 * - Tutoriel guidé au premier lancement (6 étapes)
 * - Barre d'outils flottante pour formatage (gras/italique/nombres en lettres)
 * - Conversion de nombres en lettres françaises (0-999 milliards)
 * - Mode sombre avec préférence sauvegardée
 * - Corrections automatiques avec barre de progression et surlignage visuel
 * - Détection et surlignage des parenthèses/crochets non appariés
 * - Création de Lyric Cards avec formatage et partage
 * 
 * @author Lnkhey
 * @version 3.0.1
 */

console.log('Genius Fast Transcriber (by Lnkhey) v3.0.1 - Toutes fonctionnalités activées ! 🎵');

// ----- Injection des animations CSS essentielles -----
// Injecte l'animation de surlignage pour s'assurer qu'elle fonctionne même si les styles CSS de Genius l'écrasent
(function injectCriticalStyles() {
    if (!document.getElementById('gft-critical-animations')) {
        const style = document.createElement('style');
        style.id = 'gft-critical-animations';
        style.textContent = `
            @keyframes lyrics-helper-fadeout {
                0% {
                    background-color: #f9ff55;
                    opacity: 0.8;
                }
                70% {
                    background-color: #f9ff55;
                    opacity: 0.5;
                }
                100% {
                    background-color: transparent;
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
})();

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

const TRANSLATIONS = {
    fr: {
        panel_title: "Genius Fast Transcriber",
        artist_selection: "Attribuer la section à :",
        no_artist: "Aucun artiste détecté.",
        shortcuts_title: "Raccourcis",
        add_couplet: "Ajouter Couplet",
        format_numbers: "Nombres en lettres",
        create_lyric_card: "Créer Lyric Card",
        preview: "Aperçu",
        copy: "Copier",
        undo: "Annuler",
        redo: "Refaire",
        feedback_copied: "Copié !",
        feedback_restored: "Restauré",
        onboarding_title: "Bienvenue",
        next_btn: "Suivant",
        finish_btn: "Terminer",
        mode_full_title: "Mode Complet",
        mode_full_desc: "Outils de transcription + Lyric Cards",
        mode_lyric_title: "Lyric Card Uniquement",
        mode_lyric_desc: "Création d'image uniquement",
        recommended_label: "Recommandé",
        theme_select_title: "Choisissez votre thème 🌗",
        theme_light_btn: "Mode Clair ☀️",
        theme_dark_btn: "Mode Sombre 🌙",
        lang_select_title: "Langue",
        mode_select_title: "Mode",
        full_mode_label: "Complet (Transcription + Lyric Cards)",
        lyric_only_label: "Lyric Card Uniquement",
        settings_saved: "Préférences sauvegardées !",
        open_panel: "Ouvrir le panneau",
        close_panel: "Fermer le panneau",
        onboarding_intro: "Configurez votre expérience Genius Fast Transcriber.",
        // Settings & Tooltips
        settings_menu: "Menu Paramètres",
        dark_mode_toggle_light: "☀️ Mode Clair",
        dark_mode_toggle_dark: "🌙 Mode Sombre",
        stats_show: "📊 Afficher Statistiques",
        stats_hide: "📊 Masquer Statistiques",
        header_feat_show: "🎤 Afficher feat dans l'en-tête",
        header_feat_hide: "🎤 Masquer feat dans l'en-tête",
        newline_enable: "↵ Activer saut de ligne après tags",
        newline_disable: "↵ Désactiver saut de ligne après tags",
        tutorial_link: "❓ Tutoriel / Aide",
        undo_tooltip: "Annuler la dernière modification (Ctrl+Z)",
        redo_tooltip: "Refaire la dernière modification annulée (Ctrl+Y)",
        panel_title_img_alt: "GFT Logo",
        // Sections
        section_structure: "Structure & Artistes",
        section_cleanup: "Outils de nettoyage",
        // Buttons & Tooltips
        btn_header: "En-tête",
        btn_header_tooltip: "Insérer l'en-tête de la chanson avec les artistes",
        btn_intro: "[Intro]",
        btn_intro_tooltip: "Insérer un tag [Intro] avec les artistes (Ctrl+4)",
        btn_verse_unique: "[Couplet unique]",
        btn_verse_unique_tooltip: "Insérer un tag [Couplet unique] avec les artistes",
        btn_verse: "[Couplet]",
        btn_verse_tooltip: "Insérer un tag [Couplet] sans numéro avec les artistes",
        btn_verse_num: "[Couplet 1]",
        btn_verse_num_tooltip: "Insérer un tag [Couplet X] avec gestion du numéro",
        btn_chorus: "[Refrain]",
        btn_chorus_tooltip: "Insérer un tag [Refrain] avec les artistes (Ctrl+1, Ctrl+2)",
        btn_pre_chorus: "[Pré-refrain]",
        btn_pre_chorus_tooltip: "Insérer un tag [Pré-refrain] (Ctrl+3)",
        btn_bridge: "[Pont]",
        btn_bridge_tooltip: "Insérer un tag [Pont] avec les artistes (Ctrl+5)",
        btn_outro: "[Outro]",
        btn_outro_tooltip: "Insérer un tag [Outro] avec les artistes",
        btn_instrumental: "[Instrumental]",
        btn_instrumental_tooltip: "Insérer un tag [Instrumental]",
        btn_break: "[Pause]",
        btn_break_tooltip: "Insérer un tag [Pause]",
        btn_post_chorus: "[Post-refrain]",
        btn_post_chorus_tooltip: "Insérer un tag [Post-refrain]",
        btn_unknown: "[?]",
        btn_unknown_tooltip: "Insérer un tag [?]",
        btn_zws_remove: "Suppr. ZWS",
        btn_zws_remove_tooltip: "Supprime les caractères invisibles (Zero Width Space)",
        // Cleanup Tools
        cleanup_capitalize: "Maj. Début",
        cleanup_capitalize_tooltip: "Met une majuscule au début de chaque ligne",
        cleanup_punct: "Ponctuation",
        cleanup_punct_tooltip: "Supprime la ponctuation en fin de ligne (. , ;)",
        cleanup_quotes: "Guillemets",
        cleanup_quotes_tooltip: "Transforme les apostrophes droites (') en courbes (’) et corrige les guillemets",
        cleanup_parens: "Parenthèses",
        cleanup_parens_tooltip: "Vérifie les parenthèses et crochets manquants ou mal fermés",
        cleanup_all: "Tout Corriger",
        cleanup_all_tooltip: "Applique toutes les corrections d'un coup (Ctrl+Shift+C)",
        // Button Labels (Cleanup)
        btn_y_label: "y' → y",
        btn_apostrophe_label: "' → '",
        btn_oeu_label: "oeu → œu",
        btn_french_quotes_label: "«» → \"",
        cleanup_french_quotes_tooltip: "Remplace les guillemets français «» par des guillemets droits \"",
        btn_long_dash_label: "— → -",
        cleanup_long_dash_tooltip: "Remplace les tirets longs (— –) par des tirets courts (-)",
        btn_double_spaces_label: "Doubles espaces",
        cleanup_double_spaces_tooltip: "Supprime les espaces en double",
        btn_duplicate_line_label: "📋 Dupliquer ligne",
        cleanup_duplicate_line_tooltip: "Duplique la ligne actuelle (Ctrl+D)",
        btn_adlib_label: "(Ad-lib)",
        cleanup_adlib_tooltip: "Entoure le texte sélectionné de parenthèses pour les ad-libs",
        btn_capitalize_label: "Maj. début ligne",
        btn_punctuation_label: "Suppr. ., fin ligne",
        btn_spacing_label: "Corriger Espacement",
        btn_check_label: "🔍 Vérifier ( ) [ ]",
        btn_fix_all_label: "Tout Corriger (Texte)",
        btn_capitalize_short: "Majuscules",
        btn_punctuation_short: "Ponctuation",
        btn_spacing_short: "Espacement",
        btn_fix_all_short: "✨ Tout Corriger",
        // Tutorial Steps
        tuto_step1_title: "1. Structure & Artistes 🏗️",
        tuto_step1_content: "• <strong>Artistes :</strong> Cochez les cases en haut pour attribuer automatiquement les sections sur les anciens editeurs.<br>• <strong>Couplets :</strong> Utilisez le nouveau bouton central <strong>[Couplet 1]</strong>. Les flèches ← → changent le numéro.<br>• <strong>Tags :</strong> Insérez Refrain, Intro, Pont en un clic.",
        tuto_step2_title: "2. Corrections Intelligentes ✨",
        tuto_step2_content: "• <strong>Tout Corriger :</strong> Nettoie apostrophes, majuscules, spaces.<br>• <strong>Vérifier ( ) [ ] :</strong> Scanne les parenthèses oubliées.",
        tuto_step3_title: "3. Outils de Formatage 🎨",
        tuto_step3_content: "• <strong>Barre Flottante :</strong> Sélectionnez du texte pour mettre en gras, italique ou créer une <strong>Lyric Card</strong>.<br>• <strong>Nombres en Lettres :</strong> Convertit '42' en 'quarante-deux'.",
        tuto_step4_title: "4. Historique & Sécurité 🛡️",
        tuto_step4_content: "• <strong>Annuler/Refaire :</strong> Vos 10 dernières actions sont sauvegardées (Ctrl+Z).<br>• <strong>Sauvegarde Auto :</strong> Brouillons mémorisés en cas de crash.",
        tuto_step5_title: "5. Contrôle YouTube 📺",
        tuto_step5_content: "• <kbd>Ctrl+Alt+Espace</kbd> : Lecture / Pause<br>• <kbd>Ctrl+Alt+← / →</kbd> : Reculer / Avancer (5s)",
        tuto_step6_title: "6. Autres Raccourcis ⌨️",
        tuto_step6_content: "• <kbd>Ctrl+1-5</kbd> : Tags de structure<br>• <kbd>Ctrl+Shift+C</kbd> : Tout Corriger",
        tuto_finish_title: "C'est parti ! 🚀",
        tuto_finish_content: "Vous êtes prêt ! Explorez les paramètres ⚙️ pour personnaliser votre expérience.<br><br>💡 <strong>Note :</strong> Vous pouvez changer de mode/langue à tout moment en cliquant sur l'icône de l'extension.",
        // Lyric Mode Specific Tutorial
        tuto_lyric_mode_title: "Mode Lyric Card Activé 🎨",
        tuto_lyric_mode_content: "Pour créer une Lyric Card :<br>1. <strong>Surlignez</strong> les paroles de votre choix.<br>2. Cliquez sur le bouton <strong>'Créer Lyric Card'</strong> qui apparaît.<br><br>💡 <strong>Note :</strong> Changez les paramètres via l'icône de l'extension.",
        tuto_lyric_mode_btn: "C'est compris !",
        // Lyric Card Modal
        lc_modal_title: "Aperçu Lyric Card",
        lc_album_default: "💿 Pochette Album (Défaut)",
        lc_manual_search: "🔍 Rechercher un artiste...",
        lc_format_btn: "📏 Format: ",
        lc_search_placeholder: "Tapez un nom d'artiste...",
        lc_upload_btn: "📂 Upload une image",
        lc_download_btn: "⬇️ Télécharger",
        lc_download_done: "✅ Téléchargé !",
        lc_share_btn: "𝕏 Partager",
        lc_share_copying: "📋 Copie...",
        lc_share_copied: "✅ Copié !",
        lc_share_error: "❌ Erreur",
        lc_feedback_load_error: "Erreur chargement image.",
        lc_search_searching: "⏳ Recherche en cours...",
        lc_search_none: "Aucun résultat trouvé 😕",
        lc_custom_img: "📂 Image importée",
        lc_select_text_error: "Veuillez sélectionner du texte pour créer une Lyric Card.",
        // Lyric Card Feedback
        lc_error_search: "Erreur lors de la recherche",
        lc_img_copied_tweet: "Image copiée ! Faites Ctrl+V dans la fenêtre X qui vient de s'ouvrir.",
        lc_error_copy: "Impossible de copier l'image.",
        lc_error_img_not_found: "Image introuvable pour",
        lc_img_loaded: "Image chargée !",
        lc_error_album_not_found: "Impossible de trouver la pochette de l'album.",
        lc_searching_artist: "Recherche de l'image artiste...",
        lc_generating: "Génération de la Lyric Card en cours...",
        lc_error_internal: "Erreur interne: Fonction introuvable.",
        lc_fetching_id: "Récupération image artiste (via ID)...",
        lc_searching_name: "Recherche image pour",
        lc_img_applied: "Image appliquée :",
        lc_img_found: "Image artiste trouvée !",
        lc_api_error: "Échec API, essai extraction locale...",
        lc_opening: "Ouverture de la Lyric Card...",
        // Toolbar
        toolbar_bold: "Gras",
        toolbar_italic: "Italique",
        toolbar_num_to_words: "Nombre → Lettres",
        toolbar_bold_tooltip: "Mettre le texte sélectionné en gras",
        toolbar_italic_tooltip: "Mettre le texte sélectionné en italique",
        toolbar_lyric_card_tooltip: "Générer une Lyric Card (1280x720)",
        toolbar_num_to_words_tooltip: "Convertir le nombre sélectionné en lettres",
        // Tutorial Buttons
        tuto_prev: "Précédent",
        tuto_next: "Suivant",
        tuto_skip: "Passer",
        tuto_finish: "Terminer",
        tuto_step_counter: "Étape",
        tuto_of: "sur",
        // Correction Preview Modal
        preview_title: "🛠️ Configurer les corrections",
        preview_diff_title: "Aperçu des modifications (Unified View)",
        preview_btn_cancel: "Annuler",
        preview_btn_apply: "Appliquer la sélection",
        preview_summary: "📊 {count} correction(s) à appliquer :",
        preview_no_corrections: "Aucune correction sélectionnée/nécessaire.",
        preview_opt_yprime: "y' → y",
        preview_opt_apostrophes: "Apostrophes '",
        preview_opt_oeu: "oeu → œu",
        preview_opt_quotes: "Guillemets «» → \"",
        preview_opt_dash: "Tirets longs — – → -",
        preview_opt_spaces: "Doubles espaces",
        preview_opt_spacing: "Espacement (lignes)",
        preview_stat_apostrophes: "apostrophes",
        preview_stat_quotes: "guillemets «»",
        preview_stat_dash: "tirets longs",
        preview_stat_spaces: "doubles espaces",
        preview_stat_spacing: "espacements",
        // Draft notification
        draft_found_title: "Brouillon trouvé !",
        draft_saved_at: "Sauvegardé à",
        draft_btn_restore: "Restaurer",
        draft_btn_discard: "Ignorer",
        draft_restored: "Brouillon restauré avec succès !",
        // Progress steps
        progress_step_yprime: "Correction de \"y'\"...",
        progress_step_apostrophes: "Correction des apostrophes...",
        progress_step_oeu: "Correction de \"oeu\"...",
        progress_step_quotes: "Correction des guillemets «»...",
        progress_step_dash: "Correction des tirets longs...",
        progress_step_spaces: "Suppression des doubles espaces...",
        progress_step_spacing: "Correction de l'espacement...",
        // Feedback messages
        feedback_adlib_added: "(Ad-lib) ajouté !",
        feedback_select_text_first: "⚠️ Sélectionnez du texte d'abord",
        feedback_no_replacement: "Aucun remplacement effectué.",
        feedback_replaced: "{count} {item} remplacé(s) !",
        feedback_no_correction_needed: "Aucune correction de {item} nécessaire.",
        feedback_corrected: "{count} {item} corrigé(s) !",
        feedback_no_changes: "Aucune modification à annuler.",
        feedback_undo: "↩️ Annulé",
        feedback_redo: "↪️ Refait",
        feedback_pause: "⏸️ Pause",
        feedback_play: "▶️ Lecture",
        feedback_duplicate_line: "📋 Ligne dupliquée !",
        feedback_no_text_corrections: "Aucune correction de texte. Vérifiez visuellement les parenthèses.",
        feedback_brackets_ok: "✅ Aucun problème trouvé ! Toutes les parenthèses et crochets sont bien appariés.",
        feedback_brackets_issue: "⚠️ {count} parenthèse(s)/crochet(s) non apparié(s) trouvé(s) et surligné(s) en rouge !",
        feedback_summary_corrected: "✅ Corrigé : {details} ({count} au total)",
        feedback_summary_correction: "{count} correction(s) appliquée(s)",
        feedback_detail_yprime: "{count} \"y'\"",
        feedback_detail_apostrophes: "{count} apostrophe(s)",
        feedback_detail_oeu: "{count} \"oeu\"",
        feedback_detail_quotes: "{count} guillemets",
        feedback_detail_dash: "{count} tirets",
        feedback_detail_spaces: "{count} doubles espaces",
        feedback_detail_spacing: "{count} espacement(s)",
        feedback_wrapped: "Texte entouré : {start}...{end}",
        feedback_corrections_cancelled: "Corrections annulées",
        // Stats
        stats_lines: "ligne|lignes",
        stats_words: "mot|mots",
        stats_sections: "section|sections",
        stats_characters: "caractère|caractères",
        preview_stat_yprime: "occurrence(s) de \"y'\"",
        preview_stat_oeu: "occurrence(s) de \"oeu\"",
        preview_stat_apostrophes: "apostrophe(s) ’",
        preview_stat_quotes: "guillemet(s) français",
        preview_stat_dash: "tiret(s) long(s)",
        preview_stat_spaces: "double(s) espace(s)",
        preview_stat_spacing: "espacement(s) de ligne",
    },
    en: {
        panel_title: "Genius Fast Transcriber",
        artist_selection: "Assign section to:",
        no_artist: "No artist detected.",
        shortcuts_title: "Shortcuts",
        add_couplet: "Add Verse",
        format_numbers: "Numbers to Words",
        create_lyric_card: "Create Lyric Card",
        preview: "Preview",
        copy: "Copy",
        undo: "Undo",
        redo: "Redo",
        feedback_copied: "Copied!",
        feedback_restored: "Restored",
        onboarding_title: "Welcome",
        next_btn: "Next",
        finish_btn: "Finish",
        mode_full_title: "Full Mode",
        mode_full_desc: "Transcription Tools + Lyric Cards",
        mode_lyric_title: "Lyric Card Only",
        mode_lyric_desc: "Image Creation Only",
        recommended_label: "Recommended",
        theme_select_title: "Choose your theme 🌗",
        theme_light_btn: "Light Mode ☀️",
        theme_dark_btn: "Dark Mode 🌙",
        lang_select_title: "Language",
        mode_select_title: "Mode",
        full_mode_label: "Full (Transcription + Lyric Cards)",
        lyric_only_label: "Lyric Card Only",
        settings_saved: "Preferences saved!",
        open_panel: "Open panel",
        close_panel: "Close panel",
        onboarding_intro: "Configure your Genius Fast Transcriber experience.",
        // Settings & Tooltips
        settings_menu: "Settings Menu",
        dark_mode_toggle_light: "☀️ Light Mode",
        dark_mode_toggle_dark: "🌙 Dark Mode",
        stats_show: "📊 Show Statistics",
        stats_hide: "📊 Hide Statistics",
        header_feat_show: "🎤 Show feat in header",
        header_feat_hide: "🎤 Hide feat in header",
        newline_enable: "↵ Enable newline after tags",
        newline_disable: "↵ Disable newline after tags",
        tutorial_link: "❓ Tutorial / Help",
        undo_tooltip: "Undo last change (Ctrl+Z)",
        redo_tooltip: "Redo last undone change (Ctrl+Y)",
        panel_title_img_alt: "GFT Logo",
        // Sections
        section_structure: "Structure & Artists",
        section_cleanup: "Cleanup Tools",
        // Buttons & Tooltips - REVERT TO FRENCH for Transcription tags
        btn_header: "En-tête",
        btn_header_tooltip: "Insérer l'en-tête de la chanson avec les artistes",
        btn_intro: "[Intro]",
        btn_intro_tooltip: "Insérer un tag [Intro] avec les artistes (Ctrl+4)",
        btn_verse_unique: "[Couplet unique]",
        btn_verse_unique_tooltip: "Insérer un tag [Couplet unique] avec les artistes",
        btn_verse: "[Couplet]",
        btn_verse_tooltip: "Insérer un tag [Couplet] sans numéro avec les artistes",
        btn_verse_num: "[Couplet 1]",
        btn_verse_num_tooltip: "Insérer un tag [Couplet X] avec gestion du numéro",
        btn_chorus: "[Refrain]",
        btn_chorus_tooltip: "Insérer un tag [Refrain] avec les artistes (Ctrl+1, Ctrl+2)",
        btn_pre_chorus: "[Pré-refrain]",
        btn_pre_chorus_tooltip: "Insérer un tag [Pré-refrain] (Ctrl+3)",
        btn_bridge: "[Pont]",
        btn_bridge_tooltip: "Insérer un tag [Pont] avec les artistes (Ctrl+5)",
        btn_outro: "[Outro]",
        btn_outro_tooltip: "Insérer un tag [Outro] avec les artistes",
        btn_instrumental: "[Instrumental]",
        btn_instrumental_tooltip: "Insérer un tag [Instrumental]",
        btn_break: "[Pause]",
        btn_break_tooltip: "Insérer un tag [Pause]",
        btn_post_chorus: "[Post-refrain]",
        btn_post_chorus_tooltip: "Insérer un tag [Post-refrain]",
        btn_unknown: "[?]",
        btn_unknown_tooltip: "Insérer un tag [?]",
        btn_zws_remove: "Suppr. ZWS",
        btn_zws_remove_tooltip: "Supprime les caractères invisibles (Zero Width Space)",
        // Cleanup Tools - REVERT TO FRENCH (Specific to French typography)
        cleanup_capitalize: "Maj. Début",
        cleanup_capitalize_tooltip: "Met une majuscule au début de chaque ligne",
        cleanup_punct: "Ponctuation",
        cleanup_punct_tooltip: "Supprime la ponctuation en fin de ligne (. , ;)",
        cleanup_quotes: "Guillemets",
        cleanup_quotes_tooltip: "Transforme les apostrophes droites (') en courbes (’) et corrige les guillemets",
        cleanup_parens: "Parenthèses",
        cleanup_parens_tooltip: "Vérifie les parenthèses et crochets manquants ou mal fermés",
        cleanup_all: "Tout Corriger",
        cleanup_all_tooltip: "Applique toutes les corrections d'un coup (Ctrl+Shift+C)",
        // Button Labels (Cleanup) - REVERT
        btn_y_label: "y' → y",
        btn_apostrophe_label: "' → '",
        btn_oeu_label: "oeu → œu",
        btn_french_quotes_label: "«» → \"",
        cleanup_french_quotes_tooltip: "Remplace les guillemets français «» par des guillemets droits \"",
        btn_long_dash_label: "— → -",
        cleanup_long_dash_tooltip: "Remplace les tirets longs (— –) par des tirets courts (-)",
        btn_double_spaces_label: "Doubles espaces",
        cleanup_double_spaces_tooltip: "Supprime les espaces en double",
        btn_duplicate_line_label: "📋 Dupliquer ligne",
        cleanup_duplicate_line_tooltip: "Duplique la ligne actuelle (Ctrl+D)",
        btn_adlib_label: "(Ad-lib)",
        cleanup_adlib_tooltip: "Entoure le texte sélectionné de parenthèses pour les ad-libs",
        btn_capitalize_label: "Maj. début ligne",
        btn_punctuation_label: "Suppr. ., fin ligne",
        btn_spacing_label: "Corriger Espacement",
        btn_check_label: "🔍 Vérifier ( ) [ ]",
        btn_fix_all_label: "Tout Corriger (Texte)",
        btn_capitalize_short: "Majuscules",
        btn_punctuation_short: "Ponctuation",
        btn_spacing_short: "Espacement",
        btn_fix_all_short: "✨ Tout Corriger",
        // Tutorial Steps
        tuto_step1_title: "1. Structure & Artists 🏗️",
        tuto_step1_content: "• <strong>Artists:</strong> use checkboxes on top to assign sections.<br>• <strong>Verses:</strong> Use the central <strong>[Couplet 1]</strong> button. Arrows ← → change the number.<br>• <strong>Tags:</strong> Insert Chorus, Intro, Bridge with one click.",
        tuto_step2_title: "2. Smart Corrections ✨",
        tuto_step2_content: "• <strong>Fix All:</strong> Cleans quotes, caps, spacing.<br>• <strong>Check ( ) [ ]:</strong> Scans for missing brackets.",
        tuto_step3_title: "3. Formatting Tools 🎨",
        tuto_step3_content: "• <strong>Floating Toolbar:</strong> Select text to Bold, Italic or create a <strong>Lyric Card</strong>.<br>• <strong>Number to Words:</strong> Converts '42' to 'forty-two'.",
        tuto_step4_title: "4. History & Safety 🛡️",
        tuto_step4_content: "• <strong>Undo/Redo:</strong> Your last 10 actions are saved (Ctrl+Z).<br>• <strong>Auto Save:</strong> Drafts saved in case of crash.",
        tuto_step5_title: "5. YouTube Control 📺",
        tuto_step5_content: "• <kbd>Ctrl+Alt+Space</kbd>: Play / Pause<br>• <kbd>Ctrl+Alt+← / →</kbd>: Rewind / Forward (5s)",
        tuto_step6_title: "6. Other Shortcuts ⌨️",
        tuto_step6_content: "• <kbd>Ctrl+1-5</kbd>: Structure tags<br>• <kbd>Ctrl+Shift+C</kbd>: Fix All",
        tuto_finish_title: "Let's go! 🚀",
        tuto_finish_content: "You are ready! Explore settings ⚙️ to customize your experience.<br><br>💡 <strong>Note:</strong> You can change mode/language anytime via the extension icon.",
        // Lyric Mode Specific Tutorial
        tuto_lyric_mode_title: "Lyric Card Mode Active 🎨",
        tuto_lyric_mode_content: "To create a Lyric Card:<br>1. <strong>Highlight</strong> the lyrics of your choice.<br>2. Click on the <strong>'Create Lyric Card'</strong> button that appears.<br><br>💡 <strong>Note:</strong> Change settings via the extension icon.",
        tuto_lyric_mode_btn: "Got it!",
        // Lyric Card Modal
        lc_modal_title: "Lyric Card Preview",
        lc_album_default: "💿 Album Cover (Default)",
        lc_manual_search: "🔍 Search artist...",
        lc_format_btn: "📏 Format: ",
        lc_search_placeholder: "Type an artist name...",
        lc_upload_btn: "📂 Upload image",
        lc_download_btn: "⬇️ Download",
        lc_download_done: "✅ Downloaded!",
        lc_share_btn: "𝕏 Share",
        lc_share_copying: "📋 Copying...",
        lc_share_copied: "✅ Copied!",
        lc_share_error: "❌ Error",
        lc_feedback_load_error: "Image load error.",
        lc_search_searching: "⏳ Searching...",
        lc_search_none: "No results found 😕",
        lc_custom_img: "📂 Imported Image",
        lc_select_text_error: "Please select text to create a Lyric Card.",
        // Lyric Card Feedback
        lc_error_search: "Error during search",
        lc_img_copied_tweet: "Image copied! Press Ctrl+V in the X window to paste it.",
        lc_error_copy: "Unable to copy image.",
        lc_error_img_not_found: "Image not found for",
        lc_img_loaded: "Image loaded!",
        lc_error_album_not_found: "Unable to find album cover.",
        lc_searching_artist: "Searching for artist image...",
        lc_generating: "Generating Lyric Card...",
        lc_error_internal: "Internal error: Function not found.",
        lc_fetching_id: "Fetching artist image (via ID)...",
        lc_searching_name: "Searching image for",
        lc_img_applied: "Image applied:",
        // Toolbar
        toolbar_bold: "Bold",
        toolbar_italic: "Italic",
        toolbar_num_to_words: "Number → Words",
        toolbar_bold_tooltip: "Make selected text bold",
        toolbar_italic_tooltip: "Make selected text italic",
        toolbar_lyric_card_tooltip: "Generate a Lyric Card (1280x720)",
        toolbar_num_to_words_tooltip: "Convert selected number to words (French logic)",
        // Tutorial Steps (Translated)
        tuto_step1_title: "1. Structure & Artists 🏗️",
        tuto_step1_content: "• <strong>Artists:</strong> Check boxes at top to assign sections automatically on old editors.<br>• <strong>Verses:</strong> Use the central <strong>[Verse 1]</strong> button. Arrows ← → change the number.<br>• <strong>Tags:</strong> Insert Chorus, Intro, Bridge in one click.",
        tuto_step2_title: "2. Smart Corrections ✨",
        tuto_step2_content: "• <strong>Fix All:</strong> Cleans apostrophes, capitalization, spaces.<br>• <strong>Verification ( ) [ ]:</strong> Scans for missing brackets.",
        tuto_step3_title: "3. Formatting Tools 🎨",
        tuto_step3_content: "• <strong>Floating Bar:</strong> Select text to bold, italic, or create a <strong>Lyric Card</strong>.<br>• <strong>Numbers to Words:</strong> Converts '42' to 'forty-two'.",
        tuto_step4_title: "4. History & Safety 🛡️",
        tuto_step4_content: "• <strong>Undo/Redo:</strong> Your last 10 actions are saved (Ctrl+Z).<br>• <strong>Auto Save:</strong> Drafts saved locally.",
        tuto_step5_title: "5. YouTube Control 📺",
        tuto_step5_content: "• <kbd>Ctrl+Alt+Space</kbd> : Play / Pause<br>• <kbd>Ctrl+Alt+← / →</kbd> : Rewind / Forward (5s)",
        tuto_step6_title: "6. Other Shortcuts ⌨️",
        tuto_step6_content: "• <kbd>Ctrl+1-5</kbd> : Structure tags<br>• <kbd>Ctrl+Shift+C</kbd> : Fix All",
        tuto_finish_title: "Let's Go! 🚀",
        tuto_finish_content: "You're ready! Explore settings ⚙️ to customize your experience.<br><br>💡 <strong>Note:</strong> You can change mode/language anytime by clicking the extension icon.",
        // Tutorial Buttons
        tuto_prev: "Previous",
        tuto_next: "Next",
        tuto_skip: "Skip",
        tuto_finish: "Finish",
        tuto_step_counter: "Step",
        tuto_of: "of",
        // Correction Preview Modal
        preview_title: "🛠️ Configure corrections",
        preview_diff_title: "Modification preview (Unified View)",
        preview_btn_cancel: "Cancel",
        preview_btn_apply: "Apply selection",
        preview_summary: "📊 {count} correction(s) to apply:",
        preview_no_corrections: "No corrections selected/needed.",
        preview_opt_yprime: "y' → y",
        preview_opt_apostrophes: "Apostrophes '",
        preview_opt_oeu: "oeu → œu",
        preview_opt_quotes: "Quotes «» → \"",
        preview_opt_dash: "Long dashes — – → -",
        preview_opt_spaces: "Double spaces",
        preview_opt_spacing: "Spacing (lines)",
        preview_stat_apostrophes: "apostrophes",
        preview_stat_quotes: "quotes «»",
        preview_stat_dash: "long dashes",
        preview_stat_spaces: "double spaces",
        preview_stat_spacing: "spacings",
        // Button labels (English specific)
        btn_y_label: "y' → y",
        btn_apostrophe_label: "' → '",
        btn_french_quotes_label: "«» → \"",
        btn_double_spaces_label: "Double spaces",
        btn_duplicate_line_label: "📋 Duplicate line",
        btn_spacing_label: "Fix Spacing",
        btn_check_label: "🔍 Check ( ) [ ]",
        btn_fix_all_label: "Fix All (Text)",
        btn_spacing_short: "Spacing",
        btn_fix_all_short: "✨ Fix All",
        btn_zws_remove: "⌫ ZWS",
        // Cleanup tooltips
        cleanup_apostrophe_tooltip: "Replace curly apostrophes with straight ones",
        cleanup_french_quotes_tooltip: "Replace French quotes «» with straight quotes \"",
        cleanup_double_spaces_tooltip: "Remove double spaces",
        cleanup_duplicate_line_tooltip: "Duplicate current line (Ctrl+D)",
        cleanup_spacing_tooltip: "Fix line spacing (remove extra empty lines)",
        global_check_tooltip: "Check for unmatched brackets and parentheses",
        global_fix_tooltip: "Apply all text corrections at once",
        btn_zws_remove_tooltip: "Remove invisible zero-width space characters",
        // Draft notification
        draft_found_title: "Draft found!",
        draft_saved_at: "Saved at",
        draft_btn_restore: "Restore",
        draft_btn_discard: "Discard",
        draft_restored: "Draft restored successfully!",
        // Progress steps
        progress_step_yprime: "Fixing \"y'\"...",
        progress_step_apostrophes: "Fixing apostrophes...",
        progress_step_oeu: "Fixing \"oeu\"...",
        progress_step_quotes: "Fixing quotes «»...",
        progress_step_dash: "Fixing long dashes...",
        progress_step_spaces: "Removing double spaces...",
        progress_step_spacing: "Fixing spacing...",
        // Feedback messages
        feedback_adlib_added: "(Ad-lib) added!",
        feedback_select_text_first: "⚠️ Select text first",
        feedback_no_replacement: "No replacement made.",
        feedback_replaced: "{count} {item} replaced!",
        feedback_no_correction_needed: "No {item} correction needed.",
        feedback_corrected: "{count} {item} corrected!",
        feedback_no_changes: "No changes to undo.",
        feedback_undo: "↩️ Undone",
        feedback_redo: "↪️ Redone",
        feedback_pause: "⏸️ Pause",
        feedback_play: "▶️ Play",
        feedback_duplicate_line: "📋 Line duplicated!",
        feedback_no_text_corrections: "No text correction. Visually check the brackets.",
        feedback_brackets_ok: "✅ No issues found! All brackets are well paired.",
        feedback_brackets_issue: "⚠️ {count} unpaired bracket(s) found and highlighted in red!",
        feedback_summary_corrected: "✅ Fixed: {details} ({count} total)",
        // Stats
        stats_lines: "line|lines",
        stats_words: "word|words",
        stats_sections: "section|sections",
        stats_characters: "character|characters",
        preview_stat_yprime: "\"y'\" occurrence(s)",
        preview_stat_oeu: "\"oeu\" occurrence(s)",
        preview_stat_apostrophes: "apostrophe(s)",
        preview_stat_quotes: "french quote(s)",
        preview_stat_dash: "long dash(es)",
        preview_stat_spaces: "double space(s)",
        preview_stat_spacing: "line spacing",
        feedback_summary_correction: "{count} correction(s) applied",
        feedback_detail_yprime: "{count} \"y'\"",
        feedback_detail_apostrophes: "{count} apostrophe(s)",
        feedback_detail_oeu: "{count} \"oeu\"",
        feedback_detail_quotes: "{count} quotes",
        feedback_detail_dash: "{count} dashes",
        feedback_detail_spaces: "{count} double spaces",
        feedback_detail_spacing: "{count} spacing",
        feedback_wrapped: "Text wrapped: {start}...{end}",
        feedback_corrections_cancelled: "Corrections cancelled",
        lc_img_found: "Artist image found!",
        lc_api_error: "API error, trying local extraction...",
        lc_img_loaded: "Image loaded!",
        lc_opening: "Opening Lyric Card...",
        lc_modal_title: "Lyric Card Preview",
        lc_album_default: "💿 Album Cover (Default)",
        lc_manual_search: "🔍 Search an artist...",
        lc_format_btn: "📏 Format: ",
        lc_search_placeholder: "Type an artist name...",
        lc_upload_btn: "📂 Upload an image",
        lc_download_btn: "⬇️ Download",
        lc_download_done: "✅ Downloaded!",
        lc_share_btn: "𝕏 Share",
        lc_share_copying: "📋 Copying...",
        lc_share_copied: "✅ Copied!",
        lc_share_error: "❌ Error",
        lc_feedback_load_error: "Error loading image.",
        lc_search_searching: "⏳ Searching...",
        lc_search_none: "No results found 😕",
        lc_custom_img: "📂 Imported image",
        lc_select_text_error: "Please select text to create a Lyric Card.",
        lc_error_search: "Error during search",
        lc_img_copied_tweet: "Image copied! Press Ctrl+V in the X window that just opened.",
        lc_error_copy: "Could not copy image.",
        lc_error_img_not_found: "Image not found for",
        lc_error_album_not_found: "Could not find album cover.",
        lc_searching_artist: "Searching for artist image...",
        lc_generating: "Generating Lyric Card...",
        lc_error_internal: "Internal error: Function not found.",
        lc_fetching_id: "Fetching artist image (via ID)...",
        lc_searching_name: "Searching image for",
        lc_img_applied: "Image applied:",
    },
    // Polish translations - UI strings are placeholders for contributor PR
    // Structure tags and cleanup tools are Polish-specific per Genius Polska guidelines
    pl: {
        panel_title: "Genius Fast Transcriber",
        artist_selection: "Przypisz sekcję do:",
        no_artist: "Nie wykryto wykonawcy.",
        shortcuts_title: "Skróty",
        add_couplet: "Dodaj zwrotkę",
        format_numbers: "Liczby na słowa",
        create_lyric_card: "Utwórz Lyric Card",
        preview: "Podgląd",
        copy: "Kopiuj",
        undo: "Cofnij",
        redo: "Ponów",
        feedback_copied: "Skopiowano!",
        feedback_restored: "Przywrócono!",
        onboarding_title: "Witaj",
        next_btn: "Dalej",
        finish_btn: "Zakończ",
        mode_full_title: "Tryb pełny",
        mode_full_desc: "Narzędzia do transkrypcji + Lyric Cards",
        mode_lyric_title: "Tylko Lyric Card",
        mode_lyric_desc: "Tylko tworzenie obrazów",
        recommended_label: "Zalecane",
        theme_select_title: "Wybierz motyw 🌗",
        theme_light_btn: "Tryb jasny ☀️",
        theme_dark_btn: "Tryb ciemny 🌙",
        lang_select_title: "Język",
        mode_select_title: "Tryb",
        full_mode_label: "Pełny (transkrypcja + Lyric Cards)",
        lyric_only_label: "Tylko Lyric Card",
        settings_saved: "Zapisano zmiany!",
        open_panel: "Otwórz panel",
        close_panel: "Zamknij panel",
        onboarding_intro: "Skonfiguruj ustawienia narzędzia Genius Fast Transcriber.",
        // Settings & Tooltips
        settings_menu: "Ustawienia",
        dark_mode_toggle_light: "☀️ Tryb jasny",
        dark_mode_toggle_dark: "🌙 Tryb ciemny",
        stats_show: "📊 Pokaż statystyki",
        stats_hide: "📊 Ukryj statystyki",
        header_feat_show: "🎤 Pokaż 'feat.' w nagłówku",
        header_feat_hide: "🎤 Ukryj 'feat.' w nagłówku",
        newline_enable: "↵ Dodawaj nową linię po tagach",
        newline_disable: "↵ Nie dodawaj nowej linii po tagach",
        tutorial_link: "❓ Samouczek / Pomoc",
        undo_tooltip: "Cofnij ostatnią zmianę (Ctrl+Z)",
        redo_tooltip: "Ponów ostatnią cofniętą zmianę (Ctrl+Y)",
        panel_title_img_alt: "Logo GFT",
        // Sections
        section_structure: "Struktura i wykonawcy",
        section_cleanup: "Szybkie poprawki",
        // Buttons & Tooltips - Polish structure tags
        btn_header: "Nagłówek SEO",
        btn_header_tooltip: "Wstaw nagłówek z tytułem i wykonawcami utworu",
        btn_intro: "[Intro]",
        btn_intro_tooltip: "Wstaw tag [Intro] z wykonawcami (Ctrl+4)",
        btn_verse_unique: "[Zwrotka]",
        btn_verse_unique_tooltip: "Wstaw tag [Zwrotka] z wykonawcami",
        btn_verse: "[Zwrotka]",
        btn_verse_tooltip: "Wstaw tag [Zwrotka] bez numeru wraz z wykonawcami",
        btn_verse_num: "[Zwrotka 1]",
        btn_verse_num_tooltip: "Wstaw tag [Zwrotka X] z automatyczną numeracją",
        btn_chorus: "[Refren]",
        btn_chorus_tooltip: "Wstaw tag [Refren] z wykonawcami (Ctrl+1, Ctrl+2)",
        btn_pre_chorus: "[Przedrefren]",
        btn_pre_chorus_tooltip: "Wstaw tag [Przedrefren] z wykonawcami (Ctrl+3)",
        btn_bridge: "[Przejście]",
        btn_bridge_tooltip: "Wstaw tag [Przejście] z wykonawcami (Ctrl+5)",
        btn_outro: "[Outro]",
        btn_outro_tooltip: "Wstaw tag [Outro] z wykonawcami",
        btn_instrumental: "[Przerwa instrumentalna]",
        btn_instrumental_tooltip: "Wstaw tag [Przerwa instrumentalna]",
        btn_break: "[Przerwa]",
        btn_break_tooltip: "Wstaw tag [Przerwa]",
        btn_post_chorus: "[Zarefren]",
        btn_post_chorus_tooltip: "Wstaw tag [Zarefren]",
        btn_interlude: "[Interludium]",
        btn_interlude_tooltip: "Wstaw tag [Interludium]",
        btn_part: "[Część]",
        btn_part_tooltip: "Wstaw tag [Część]",
        btn_skit: "[Skit]",
        btn_skit_tooltip: "Wstaw tag [Skit]",
        btn_hook: "[Przyśpiewka]",
        btn_hook_tooltip: "Wstaw tag [Przyśpiewka] (stosowany obok tagu [Refren])",
        btn_vocalization: "[Wokaliza]",
        btn_vocalization_tooltip: "Wstaw tag [Wokaliza] dla wokali bez słów",
        btn_unknown: "[?]",
        btn_unknown_tooltip: "Wstaw tag [?]",
        btn_zws_remove: "Usuń ZWS",
        btn_zws_remove_tooltip: "Usuwa niewidoczne znaki (Zero Width Space)",
        // Cleanup Tools - Polish specific
        cleanup_capitalize: "Wielka litera",
        cleanup_capitalize_tooltip: "Zmienia pierwszą literę każdego wiersza na wielką",
        cleanup_punct: "Interpunkcja",
        cleanup_punct_tooltip: "Usuwa kropki, przecinki i średniki z końców wierszy",
        cleanup_quotes: "Cudzysłowy",
        cleanup_quotes_tooltip: "Zamienia cudzysłowy drukarskie (\u201E\u201D \u00AB\u00BB) na proste (\"\")",
        cleanup_parens: "Nawiasy",
        cleanup_parens_tooltip: "Znajduje brakujące lub błędnie zamknięte nawiasy",
        cleanup_all: "Popraw wszystko",
        cleanup_all_tooltip: "Stosuje wszystkie poprawki naraz (Ctrl+Shift+C)",
        // Button Labels (Cleanup) - Polish specific
        btn_polish_quotes_label: "\u201E\u201D \u2192 \"",
        cleanup_polish_quotes_tooltip: "Zamienia cudzysłowy polskie (\u201E\u201D) na proste (\"\")",
        btn_apostrophe_label: "' → '",
        btn_em_dash_label: "- → —",
        cleanup_em_dash_tooltip: "Zamienia dywizy (-) na myślnik (—)",
        btn_ellipsis_label: "... → …",
        cleanup_ellipsis_tooltip: "Zamienia trzy kropki na wielokropek (…)",
        btn_french_quotes_label: "«» → \"",
        cleanup_french_quotes_tooltip: "Zamienia cudzysłowy drukarskie («») na proste (\"\")",
        btn_double_spaces_label: "Podwójne spacje",
        cleanup_double_spaces_tooltip: "Usuwa podwójne spacje",
        btn_duplicate_line_label: "📋 Duplikuj linię",
        cleanup_duplicate_line_tooltip: "Duplikuje bieżącą linię (Ctrl+D)",
        btn_adlib_label: "(Ad-lib)",
        cleanup_adlib_tooltip: "Otacza zaznaczony tekst nawiasami",
        btn_capitalize_label: "Wielka litera",
        btn_punctuation_label: "Usuń interpunkcję",
        btn_spacing_label: "Popraw odstępy",
        btn_check_label: "🔍 Sprawdź (\u00A0) [\u00A0]",
        btn_fix_all_label: "Popraw wszystko (tekst)",
        btn_capitalize_short: "Wielkie litery",
        btn_punctuation_short: "Interpunkcja",
        btn_spacing_short: "Odstępy",
        btn_fix_all_short: "✨ Popraw wszystko",
        // Tutorial Steps
        tuto_step1_title: "1. Struktura i wykonawcy 🏗️",
        tuto_step1_content: "• <strong>Artyści</strong> — Zaznacz wykonawców, aby przypisać ich do\u00A0sekcji.<br>• <strong>Zwrotki:</strong> Użyj centralnego przycisku <strong>[Zwrotka 1]</strong>. Strzałki ←\u00A0→ zmieniają numerację.<br>• <strong>Tagi:</strong> Wstaw [Refren], [Intro] lub [Przejście] jednym kliknięciem.",
        tuto_step2_title: "2. Inteligentne poprawki ✨",
        tuto_step2_content: "• <strong>Popraw wszystko:</strong> Czyści cudzysłowy, wielkie litery i spacje.<br>• <strong>Sprawdź ( ) [ ]:</strong> Znajduje brakujące lub błędnie zamknięte nawiasy.",
        tuto_step3_title: "3. Narzędzia do formatowania 🎨",
        tuto_step3_content: "• <strong>Pływający pasek narzędzi:</strong> Zaznacz tekst, aby go pogrubić, pochylić lub utworzyć <strong>Lyric Card</strong>.<br>• <strong>Liczby na słowa:</strong> Zamienia „42” na „czterdzieści dwa”.",
        tuto_step4_title: "4. Historia i bezpieczeństwo 🛡️",
        tuto_step4_content: "• <strong>Cofnij/Ponów:</strong> Twoje ostatnie 10 czynności jest zapisanych (Ctrl+Z).<br>• <strong>Automatyczne zapisywanie:</strong> Wersje robocze są zapisywane na wypadek awarii przeglądarki.",
        tuto_step5_title: "5. Sterowanie odtwarzaczem YouTube 📺",
        tuto_step5_content: "• <kbd>Ctrl+Alt+Spacja</kbd>: Odtwórz/Wstrzymaj<br>• <kbd>Ctrl+Alt+← / →</kbd>: Przewiń do tyłu/do przodu o 5 sekund",
        tuto_step6_title: "6. Inne skróty klawiszowe ⌨️",
        tuto_step6_content: "• <kbd>Ctrl+1-5</kbd>: Tagi sekcji (np. Intro, Zwrotka)<br>• <kbd>Ctrl+Shift+C</kbd>: Popraw wszystko",
        tuto_finish_title: "Zaczynamy! 🚀",
        tuto_finish_content: "Wszystko gotowe! Zajrzyj do ustawień ⚙️, aby rozszerzenie do swoich potrzeb.<br><br>💡 <strong>Uwaga:</strong> Tryb i język możesz zmienić w dowolnym momencie, klikając ikonę rozszerzenia.",
        // Lyric Mode Specific Tutorial
        tuto_lyric_mode_title: "Tryb Lyric Card aktywny 🎨",
        tuto_lyric_mode_content: "Aby utworzyć Lyric Card:<br>1. <strong>Zaznacz</strong> wybrany fragment tekstu piosenki.<br>2. Kliknij przycisk <strong>„Utwórz Lyric Card”</strong>, który się pojawi.<br><br>💡 <strong>Wskazówka:</strong> Ustawienia zmienisz, klikając ikonę rozszerzenia.",
        tuto_lyric_mode_btn: "Rozumiem!",
        // Lyric Card Modal
        lc_modal_title: "Podgląd Lyric Card",
        lc_album_default: "💿 Okładka albumu (domyślnie)",
        lc_manual_search: "🔍 Wyszukaj wykonawcę…",
        lc_format_btn: "📏 Format: ",
        lc_search_placeholder: "Wpisz nazwę wykonawcy…",
        lc_upload_btn: "📂 Prześlij obraz",
        lc_download_btn: "⬇️ Pobierz",
        lc_download_done: "✅ Pobrano!",
        lc_share_btn: "𝕏 Udostępnij",
        lc_share_copying: "📋 Kopiowanie…",
        lc_share_copied: "✅ Skopiowano!",
        lc_share_error: "❌ Wystąpił błąd",
        lc_feedback_load_error: "Błąd wczytywania obrazu.",
        lc_search_searching: "⏳ Wyszukiwanie…",
        lc_search_none: "Nie znaleziono wyników 😕",
        lc_custom_img: "📂 Przesłany obraz",
        lc_select_text_error: "Zaznacz tekst, aby utworzyć Lyric Card.",
        // Lyric Card Feedback
        lc_error_search: "Błąd podczas wyszukiwania",
        lc_img_copied_tweet: "Skopiowano obraz! Naciśnij Ctrl+V w oknie X, aby go wkleić.",
        lc_error_copy: "Nie udało się skopiować obrazu.",
        lc_error_img_not_found: "Nie znaleziono obrazu dla",
        lc_img_loaded: "Załadowano obraz!",
        lc_error_album_not_found: "Nie udało się znaleźć okładki albumu.",
        lc_searching_artist: "Wyszukiwanie obrazu wykonawcy…",
        lc_generating: "Generowanie Lyric Card…",
        lc_error_internal: "Błąd wewnętrzny: nie znaleziono funkcji.",
        lc_fetching_id: "Pobieranie obrazu wykonawcy (za pomocą identyfikatora)…",
        lc_searching_name: "Wyszukiwanie obrazu dla",
        lc_img_applied: "Zastosowany obraz:",
        lc_img_found: "Znaleziono obraz wykonawcy!",
        lc_api_error: "Błąd API, próbuję wyodrębnić lokalnie…",
        lc_opening: "Otwieranie Lyric Card…",
        // Toolbar
        toolbar_bold: "Pogrubienie",
        toolbar_italic: "Kursywa",
        toolbar_num_to_words: "Liczba → Słowa",
        toolbar_bold_tooltip: "Pogrub zaznaczony tekst",
        toolbar_italic_tooltip: "Pochyl zaznaczony tekst",
        toolbar_lyric_card_tooltip: "Wygeneruj Lyric Card (1280x720)",
        toolbar_num_to_words_tooltip: "Zapisz zaznaczoną liczbę słownie (w mianowniku)",
        // Tutorial Buttons
        tuto_prev: "Wstecz",
        tuto_next: "Dalej",
        tuto_skip: "Pomiń",
        tuto_finish: "Zakończ",
        tuto_step_counter: "Krok",
        feedback_summary_corrected: "✅ Poprawiono: {details} (łącznie {count})",
        feedback_summary_correction: "Zastosowano {count} poprawkę|Zastosowano {count} poprawki|Zastosowano {count} poprawek",
        feedback_detail_yprime: "{count} \"y'\"",
        feedback_detail_apostrophes: "{count} apostrof|{count} apostrofy|{count} apostrofów",
        feedback_detail_oeu: "{count} \"oeu\"",
        feedback_detail_quotes: "{count} cudzysłów|{count} cudzysłowy|{count} cudzysłowów",
        feedback_detail_dash: "{count} myślnik|{count} myślniki|{count} myślników",
        feedback_detail_spaces: "{count} podwójna spacja|{count} podwójne spacje|{count} podwójnych spacji",
        feedback_detail_spacing: "{count} odstęp|{count} odstępy|{count} odstępów",
        feedback_detail_polish_quotes: "{count} polski cudzysłów|{count} polskie cudzysłowy|{count} polskich cudzysłowów",
        feedback_detail_ellipsis: "{count} wielokropek|{count} wielokropki|{count} wielokropków",
        feedback_wrapped: "Otoczono tekst: {start}...{end}",
        feedback_corrections_cancelled: "Anulowano poprawki",
        feedback_select_text_first: "⚠️ Zaznacz najpierw tekst",
        feedback_no_text_corrections: "Brak poprawek tekstu. Zweryfikuj nawiasy.",
        feedback_brackets_ok: "✅ Nie znaleziono żadnych problemów! Wszystkie nawiasy są domknięte.",
        feedback_brackets_issue: "⚠️ Znaleziono {count} niesparowany nawias i zaznaczono go na czerwono!|⚠️ Znaleziono {count} niesparowane nawiasy i zaznaczono je na czerwono!|⚠️ Znaleziono {count} niesparowanych nawiasów i zaznaczono je na czerwono!",
        // Stats (Singular | Paucal | Plural)
        stats_lines: "linia|linie|linii",
        stats_words: "słowo|słowa|słów",
        stats_sections: "sekcja|sekcje|sekcji",
        stats_characters: "znak|znaki|znaków",
        feedback_no_changes: "Brak zmian do cofnięcia.",
        feedback_undo: "↩️ Cofnięto",
        feedback_redo: "↪️ Ponowiono",
        feedback_pause: "⏸️ Wstrzymano",
        feedback_play: "▶️ Odtwarzanie",
        feedback_duplicate_line: "📋 Zduplikowano linię!",
        tuto_of: "z",
        // Correction Preview Modal
        preview_title: "🛠️ Konfiguracja poprawek",
        preview_diff_title: "Podgląd zmian (widok ujednolicony)",
        preview_btn_cancel: "Anuluj",
        preview_btn_apply: "Zastosuj zaznaczone",
        preview_summary: "📊 {count} poprawka do zastosowania:|📊 {count} poprawki do zastosowania:|📊 {count} poprawek do zastosowania:",
        preview_no_corrections: "Brak poprawek do wprowadzenia.",
        preview_opt_polish_quotes: "\u201E\u201D \u2192 \"",
        preview_opt_apostrophes: "Apostrofy (')",
        preview_opt_ellipsis: "... → …",
        preview_opt_quotes: "Cudzysłowy («» → \"\")",
        preview_opt_dash: "Myślniki (- → —)",
        preview_opt_spaces: "Podwójne spacje",
        preview_opt_spacing: "Odstępy (linie)",
        preview_stat_apostrophes: "apostrofu|apostrofów|apostrofów",
        preview_stat_quotes: "francuskiego cudzysłowu («»)|francuskich cudzysłowów («»)|francuskich cudzysłowów («»)",
        preview_stat_polish_quotes: "polskiego cudzysłowu (\u201E\u201D)|polskich cudzysłowów (\u201E\u201D)|polskich cudzysłowów (\u201E\u201D)",
        preview_stat_dash: "myślnika|myślników|myślników",
        preview_stat_ellipsis: "wielokropka|wielokropków|wielokropków",
        preview_stat_spaces: "podwójnej spacji|podwójnych spacji|podwójnych spacji",
        preview_stat_spacing: "odstępu|odstępów|odstępów",
        // Draft notification
        draft_found_title: "Znaleziono wersję roboczą!",
        draft_saved_at: "Zapisano o",
        draft_btn_restore: "Przywróć",
        draft_btn_discard: "Odrzuć",
        draft_restored: "Pomyślnie przywrócono wersję roboczą!",
        // Progress steps - Polish specific corrections
        progress_step_polish_quotes: "Poprawianie polskich cudzysłowów (\u201E\u201D)…",
        progress_step_apostrophes: "Poprawianie apostrofów…",
        progress_step_ellipsis: "Poprawianie wielokropków…",
        progress_step_quotes: "Poprawianie francuskich cudzysłowów («»)…",
        progress_step_dash: "Poprawianie myślników…",
        progress_step_spaces: "Usuwanie podwójnych spacji…",
        progress_step_spacing: "Poprawianie odstępów…",
        // Feedback messages
        feedback_adlib_added: "Otoczono tekst nawiasami!",
        feedback_select_text_first: "⚠️ Zaznacz najpierw tekst",
        feedback_no_replacement: "Nie dokonano żadnych zmian.",
        feedback_replaced: "Zamieniono {count} {item}!",
        feedback_no_correction_needed: "Zamiana {item} nie jest wymagana",
        feedback_corrected: "Poprawiono {count} {item}!",
        feedback_no_changes: "Brak zmian do cofnięcia.",
        feedback_undo: "↩️ Cofnięto",
        feedback_redo: "↪️ Ponowiono",
        feedback_pause: "⏸️ Wstrzymano",
        feedback_play: "▶️ Odtwarzanie",
        feedback_duplicate_line: "📋 Zduplikowano linię!",
        feedback_no_text_corrections: "Brak poprawek tekstu. Zweryfikuj nawiasy.",
        feedback_brackets_ok: "✅ Nie znaleziono żadnych problemów! Wszystkie nawiasy są domknięte.",
        feedback_brackets_issue: "⚠️ Znaleziono {count} niesparowany nawias i zaznaczono go na czerwono!|⚠️ Znaleziono {count} niesparowane nawiasy i zaznaczono je na czerwono!|⚠️ Znaleziono {count} niesparowanych nawiasów i zaznaczono je na czerwono!",
    }
};

/**
 * Formate une liste de chaînes avec une conjonction naturelle (A, B et C).
 * @param {string[]} items - Liste des éléments à formater.
 * @param {string} lang - La langue ('fr', 'en', 'pl').
 * @returns {string} La chaîne formatée.
 */
function formatListWithConjunction(items, lang) {
    if (items.length === 0) return "";
    if (items.length === 1) return items[0];

    // Utilisation de Intl.ListFormat si disponible
    if (typeof Intl !== 'undefined' && Intl.ListFormat) {
        try {
            const formatter = new Intl.ListFormat(lang, { style: 'long', type: 'conjunction' });
            return formatter.format(items);
        } catch (e) {
            console.warn("[GFT] Intl.ListFormat failed, falling back to manual join.", e);
        }
    }

    // Fallback manuel
    const lastItem = items.pop();
    const conjunctions = {
        'fr': ' et ',
        'en': ' and ',
        'pl': ' i '
    };
    const conj = conjunctions[lang] || conjunctions['fr'];
    return items.join(', ') + conj + lastItem;
}

/**
 * Détermine l'index de la forme plurielle pour une langue et un nombre donnés.
 * @param {number} count - Le nombre.
 * @param {string} lang - La langue ('fr', 'en', 'pl').
 * @returns {number} L'index de la forme (0, 1, 2...).
 */
function getPluralForm(count, lang) {
    const c = Math.abs(count);
    if (lang === 'pl') {
        if (c === 1) return 0; // Singulier (1)
        if (c % 10 >= 2 && c % 10 <= 4 && (c % 100 < 12 || c % 100 > 14)) return 1; // Paucal (2-4, 22-24...)
        return 2; // Pluriel (5-21, 25-31...)
    }
    // Règles par défaut (FR/EN)
    if (lang === 'fr') return c > 1 ? 1 : 0; // 0, 1 -> sing, 2+ -> pluriel
    return c === 1 ? 0 : 1; // EN: 1 -> sing, 0, 2+ -> pluriel
}

/**
 * Récupère la traduction pour une clé donnée selon la langue préférée.
 * Supporte le pluriel si un nombre `count` est fourni et que la valeur contient des séparateurs '|'.
 * @param {string} key - La clé de traduction.
 * @param {number} [count] - Le nombre pour, déterminer la forme plurielle.
 * @returns {string} Le texte traduit.
 */
function getTranslation(key, count = null) {
    const lang = localStorage.getItem('gftLanguage') || 'fr'; // 'fr' par défaut
    let val = (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || TRANSLATIONS['fr'][key] || key;

    // Gestion du pluriel complexe (ex: "Singulier|Paucal|Pluriel")
    if (count !== null && typeof val === 'string' && val.includes('|')) {
        const parts = val.split('|').map(s => s.trim());
        const formIndex = getPluralForm(count, lang);
        // Si l'index dépasse, on prend la dernière forme disponible
        return parts[formIndex] || parts[parts.length - 1];
    }

    return val;
}

/**
 * Décode les entités HTML (ex: &amp;) en caractères normaux (ex: &).
 * @param {string} text - Le texte à décoder.
 * @returns {string} Le texte décodé.
 */
function decodeHtmlEntities(text) {
    if (!text) return "";
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
}

/**
 * Nettoie un nom d'artiste en retirant les informations superflues (ex: "(FRA)", "(Feat...)").
 * @param {string} name - Le nom de l'artiste à nettoyer.
 * @returns {string} Le nom nettoyé.
 */
function cleanArtistName(name) {
    if (!name) return "";
    let cleaned = name.trim();
    cleaned = decodeHtmlEntities(cleaned);
    // Regex pour enlever les suffixes courants comme (FRA), (FR), (UK), (US), (Feat. ...), etc.
    const commonSuffixRegex = /\s*\((?:FRA|FR|UK|US|Feat\.|Featuring|Trad\.|Producer|Mix|Remix|Edit|Version|Live|Demo)[^)]*?\)\s*$/i;
    if (commonSuffixRegex.test(cleaned)) {
        cleaned = cleaned.replace(commonSuffixRegex, '').trim();
    }
    // Gère d'autres types de parenthèses en fin de chaîne.
    const trailingParenthesisRegex = /\s*\([^)]*\)\s*$/;
    if (trailingParenthesisRegex.test(cleaned)) {
        cleaned = cleaned.replace(trailingParenthesisRegex, '').trim();
    } else {
        const isolatedTrailingParenthesisRegex = /\)\s*$/;
        if (isolatedTrailingParenthesisRegex.test(cleaned)) {
            cleaned = cleaned.replace(isolatedTrailingParenthesisRegex, '').trim();
        }
    }
    // Gère les parenthèses non fermées.
    const lastOpenParenIndex = cleaned.lastIndexOf('(');
    if (lastOpenParenIndex > -1 && cleaned.indexOf(')', lastOpenParenIndex) === -1) {
        if (cleaned.length - lastOpenParenIndex < 10) { // Si la parenthèse est proche de la fin
            cleaned = cleaned.substring(0, lastOpenParenIndex).trim();
        }
    }
    cleaned = cleaned.replace(/\s+/g, ' ').trim(); // Normalise les espaces.
    return cleaned;
}

/**
 * Échappe les caractères spéciaux d'une chaîne pour qu'elle puisse être utilisée dans une expression régulière.
 * @param {string} string - La chaîne à échapper.
 * @returns {string} La chaîne échappée.
 */
function escapeRegExp(string) {
    if (!string) return "";
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& signifie la chaîne correspondante entière.
}

/**
 * Formatte une liste d'artistes pour un affichage lisible (ex: "Artiste 1, Artiste 2 & Artiste 3").
 * @param {string[]} artists - Un tableau de noms d'artistes.
 * @returns {string} La liste formatée.
 */
function formatArtistList(artists) {
    if (!artists || artists.length === 0) return "";
    if (artists.length === 1) return artists[0];
    if (artists.length === 2) return artists.join(' & ');
    return `${artists.slice(0, -1).join(', ')} & ${artists[artists.length - 1]}`;
}

/**
 * Convertit un nombre (0-999999999999) en lettres en français.
 * @param {number} num - Le nombre à convertir.
 * @returns {string} Le nombre en lettres.
 */
function numberToFrenchWords(num) {
    if (num === 0) return "zéro";

    const ones = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"];
    const teens = ["dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
    const tens = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante", "quatre-vingt", "quatre-vingt"];

    function convertUpTo99(n) {
        if (n < 10) return ones[n];
        if (n < 20) return teens[n - 10];

        const ten = Math.floor(n / 10);
        const one = n % 10;

        if (ten === 7) {
            // 70-79: soixante-dix, soixante et onze, soixante-douze, etc.
            if (one === 0) return "soixante-dix";
            if (one === 1) return "soixante et onze";
            return "soixante-" + teens[one];
        }

        if (ten === 9) {
            // 90-99: quatre-vingt-dix, quatre-vingt-onze, etc.
            if (one === 0) return "quatre-vingt-dix";
            return "quatre-vingt-" + teens[one];
        }

        if (one === 0) {
            if (ten === 8) return "quatre-vingts"; // 80 avec un "s"
            return tens[ten];
        }

        if (one === 1 && (ten === 2 || ten === 3 || ten === 4 || ten === 5 || ten === 6)) {
            return tens[ten] + " et un";
        }

        if (ten === 8) return "quatre-vingt-" + ones[one]; // 81-89 sans "s"
        return tens[ten] + "-" + ones[one];
    }

    function convertUpTo999(n) {
        if (n < 100) return convertUpTo99(n);

        const hundred = Math.floor(n / 100);
        const rest = n % 100;

        let result = "";
        if (hundred === 1) {
            result = "cent";
        } else {
            result = ones[hundred] + " cent";
        }

        if (rest === 0 && hundred > 1) {
            result += "s"; // "cents" au pluriel
        } else if (rest > 0) {
            result += " " + convertUpTo99(rest);
        }

        return result;
    }

    // Vérifie la limite (999 milliards 999 millions 999 mille 999)
    if (num < 0 || num > 999999999999) return num.toString();

    if (num < 1000) return convertUpTo999(num);

    // Gestion des milliards (1 000 000 000 à 999 999 999 999)
    if (num >= 1000000000) {
        const billions = Math.floor(num / 1000000000);
        const rest = num % 1000000000;

        let result = "";
        if (billions === 1) {
            result = "un milliard";
        } else {
            result = convertUpTo999(billions) + " milliards";
        }

        if (rest > 0) {
            result += " " + numberToFrenchWords(rest);
        }

        return result;
    }

    // Gestion des millions (1 000 000 à 999 999 999)
    if (num >= 1000000) {
        const millions = Math.floor(num / 1000000);
        const rest = num % 1000000;

        let result = "";
        if (millions === 1) {
            result = "un million";
        } else {
            result = convertUpTo999(millions) + " millions";
        }

        if (rest > 0) {
            result += " " + numberToFrenchWords(rest);
        }

        return result;
    }

    // Gestion des milliers (1 000 à 999 999)
    const thousand = Math.floor(num / 1000);
    const rest = num % 1000;

    let result = "";
    if (thousand === 1) {
        result = "mille";
    } else {
        result = convertUpTo999(thousand) + " mille";
    }

    if (rest > 0) {
        result += " " + convertUpTo999(rest);
    }

    return result;
}

/**
 * Convertit un nombre (0-999999999999) en lettres en anglais.
 * @param {number} num - Le nombre à convertir.
 * @returns {string} Le nombre en lettres.
 */
function numberToEnglishWords(num) {
    if (num === 0) return "zero";

    const ones = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
    const teens = ["ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
    const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

    function convertUpTo99(n) {
        if (n < 10) return ones[n];
        if (n < 20) return teens[n - 10];

        const ten = Math.floor(n / 10);
        const one = n % 10;

        if (one === 0) return tens[ten];
        return tens[ten] + "-" + ones[one];
    }

    function convertUpTo999(n) {
        if (n < 100) return convertUpTo99(n);

        const hundred = Math.floor(n / 100);
        const rest = n % 100;

        let result = ones[hundred] + " hundred";
        if (rest > 0) {
            result += " " + convertUpTo99(rest);
        }
        return result;
    }

    if (num < 0 || num > 999999999999) return num.toString();

    if (num < 1000) return convertUpTo999(num);

    if (num >= 1000000000) {
        const billions = Math.floor(num / 1000000000);
        const rest = num % 1000000000;
        let result = convertUpTo999(billions) + " billion";
        if (rest > 0) result += " " + numberToEnglishWords(rest);
        return result;
    }

    if (num >= 1000000) {
        const millions = Math.floor(num / 1000000);
        const rest = num % 1000000;
        let result = convertUpTo999(millions) + " million";
        if (rest > 0) result += " " + numberToEnglishWords(rest);
        return result;
    }

    const thousand = Math.floor(num / 1000);
    const rest = num % 1000;

    let result = convertUpTo999(thousand) + " thousand";
    if (rest > 0) result += " " + convertUpTo999(rest);

    return result;
}

/**
 * Convertit un nombre (0-999999999999) en lettres en polonais.
 * @param {number} num - Le nombre à convertir.
 * @returns {string} Le nombre en lettres.
 */
function numberToPolishWords(num) {
    if (num === 0) return "zero";

    const ones = ["", "jeden", "dwa", "trzy", "cztery", "pięć", "sześć", "siedem", "osiem", "dziewięć"];
    const teens = ["dziesięć", "jedenaście", "dwanaście", "trzynaście", "czternaście", "piętnaście", "szesnaście", "siedemnaście", "osiemnaście", "dziewiętnaście"];
    const tens = ["", "", "dwadzieścia", "trzydzieści", "czterdzieści", "pięćdziesiąt", "sześćdziesiąt", "siedemdziesiąt", "osiemdziesiąt", "dziewięćdziesiąt"];
    const hundreds = ["", "sto", "dwieście", "trzysta", "czterysta", "pięćset", "sześćset", "siedemset", "osiemset", "dziewięćset"];

    function convertUpTo99(n) {
        if (n < 10) return ones[n];
        if (n < 20) return teens[n - 10];

        const ten = Math.floor(n / 10);
        const one = n % 10;

        if (one === 0) return tens[ten];
        return tens[ten] + " " + ones[one];
    }

    function convertUpTo999(n) {
        if (n < 100) return convertUpTo99(n);

        const hundred = Math.floor(n / 100);
        const rest = n % 100;

        let result = hundreds[hundred];
        if (rest > 0) {
            result += " " + convertUpTo99(rest);
        }
        return result;
    }

    // Polish thousand forms: tysiąc, tysiące, tysięcy
    function getThousandForm(n) {
        if (n === 1) return "tysiąc";
        const lastDigit = n % 10;
        const lastTwoDigits = n % 100;
        if (lastTwoDigits >= 12 && lastTwoDigits <= 14) return "tysięcy";
        if (lastDigit >= 2 && lastDigit <= 4) return "tysiące";
        return "tysięcy";
    }

    // Polish million forms: milion, miliony, milionów
    function getMillionForm(n) {
        if (n === 1) return "milion";
        const lastDigit = n % 10;
        const lastTwoDigits = n % 100;
        if (lastTwoDigits >= 12 && lastTwoDigits <= 14) return "milionów";
        if (lastDigit >= 2 && lastDigit <= 4) return "miliony";
        return "milionów";
    }

    // Polish billion forms: miliard, miliardy, miliardów
    function getBillionForm(n) {
        if (n === 1) return "miliard";
        const lastDigit = n % 10;
        const lastTwoDigits = n % 100;
        if (lastTwoDigits >= 12 && lastTwoDigits <= 14) return "miliardów";
        if (lastDigit >= 2 && lastDigit <= 4) return "miliardy";
        return "miliardów";
    }

    if (num < 0 || num > 999999999999) return num.toString();

    if (num < 1000) return convertUpTo999(num);

    if (num >= 1000000000) {
        const billions = Math.floor(num / 1000000000);
        const rest = num % 1000000000;
        let result = (billions === 1 ? "" : convertUpTo999(billions) + " ") + getBillionForm(billions);
        if (rest > 0) result += " " + numberToPolishWords(rest);
        return result.trim();
    }

    if (num >= 1000000) {
        const millions = Math.floor(num / 1000000);
        const rest = num % 1000000;
        let result = (millions === 1 ? "" : convertUpTo999(millions) + " ") + getMillionForm(millions);
        if (rest > 0) result += " " + numberToPolishWords(rest);
        return result.trim();
    }

    const thousand = Math.floor(num / 1000);
    const rest = num % 1000;

    let result = (thousand === 1 ? "" : convertUpTo999(thousand) + " ") + getThousandForm(thousand);
    if (rest > 0) result += " " + convertUpTo999(rest);

    return result.trim();
}

/**
 * Vérifie si une chaîne est un nombre valide (entier positif).
 * @param {string} str - La chaîne à vérifier.
 * @returns {boolean} True si c'est un nombre valide.
 */
function isValidNumber(str) {
    if (!str || str.trim() === "") return false;
    const trimmed = str.trim();
    // Accepte les nombres entiers positifs (avec ou sans espaces)
    return /^\d+$/.test(trimmed);
}

/**
 * Extrait les artistes principaux et en featuring à partir du contenu d'une balise meta (og:title ou twitter:title).
 * Le format est souvent "Artistes Principaux - Titre de la chanson (feat. Artistes en Featuring)".
 * @param {string} metaContent - Le contenu de la balise meta.
 * @returns {{main: string[], ft: string[]}} Un objet contenant les listes d'artistes principaux et en featuring.
 */
function extractArtistsFromMetaContent(metaContent) {
    const result = { main: [], ft: [] };
    if (!metaContent) return result;
    let contentForArtists = decodeHtmlEntities(metaContent);
    // Sépare la partie artistes du titre de la chanson.
    const songTitleSeparatorMatch = contentForArtists.match(/\s[–-]\s/);
    if (songTitleSeparatorMatch) {
        contentForArtists = contentForArtists.substring(0, songTitleSeparatorMatch.index).trim();
    }
    let ftContent = null;
    let mainPart = contentForArtists;
    // Extrait les artistes en featuring.
    const ftOuterMatch = contentForArtists.match(/\((Ft\.|Featuring)\s+(.*)\)\s*$/i);
    if (ftOuterMatch && ftOuterMatch[2]) {
        ftContent = ftOuterMatch[2].trim();
        mainPart = contentForArtists.replace(ftOuterMatch[0], '').trim();
    }
    if (ftContent) {
        ftContent.split(/[,&]\s*/).forEach(name => {
            const cleaned = name.trim(); if (cleaned) result.ft.push(cleaned);
        });
    }
    // Extrait les artistes principaux.
    mainPart.split(/[,&]\s*/).forEach(name => {
        const cleanedName = name.trim();
        if (cleanedName) {
            // S'assure qu'un artiste n'est pas à la fois dans "main" et "ft".
            if (!result.ft.some(ftArt => ftArt.toLowerCase() === cleanedName.toLowerCase())) {
                result.main.push(cleanedName);
            }
        }
    });
    return result;
}

/**
 * Fonction principale pour extraire toutes les données de la chanson (titre, artistes) depuis la page.
 * Utilise plusieurs stratégies (balises meta, éléments HTML) pour être plus robuste.
 */
function extractSongData() {
    const songData = { title: null, mainArtists: [], featuringArtists: [], _rawMainArtists: [], _rawFeaturingArtistsFromSection: [], _rawFeaturingArtistsFromTitleExtract: [] };
    let rawTitleText = null; let artistsFromMeta = { main: [], ft: [] };
    // 1. Tente d'extraire les données depuis les balises meta (plus fiable).
    const ogTitleMeta = document.querySelector(SELECTORS.OG_TITLE_META);
    if (ogTitleMeta && ogTitleMeta.content) {
        artistsFromMeta = extractArtistsFromMetaContent(ogTitleMeta.content);
        songData._rawMainArtists = [...artistsFromMeta.main];
        songData._rawFeaturingArtistsFromTitleExtract = [...artistsFromMeta.ft];
        const titleParts = decodeHtmlEntities(ogTitleMeta.content).split(/\s[–-]\s/);
        if (titleParts.length > 1) {
            rawTitleText = titleParts.slice(1).join(' – ').trim();
            if (artistsFromMeta.main.length > 0) {
                const mainArtistString = formatArtistList(artistsFromMeta.main);
                if (rawTitleText.toLowerCase().endsWith(mainArtistString.toLowerCase())) {
                    rawTitleText = rawTitleText.substring(0, rawTitleText.length - mainArtistString.length).replace(/\s*-\s*$/, '').trim();
                }
            }
        }
    } else {
        const twitterTitleMeta = document.querySelector(SELECTORS.TWITTER_TITLE_META);
        if (twitterTitleMeta && twitterTitleMeta.content) {
            artistsFromMeta = extractArtistsFromMetaContent(twitterTitleMeta.content);
            songData._rawMainArtists = [...artistsFromMeta.main];
            songData._rawFeaturingArtistsFromTitleExtract = [...artistsFromMeta.ft];
            const titleParts = decodeHtmlEntities(twitterTitleMeta.content).split(/\s[–-]\s/);
            if (titleParts.length > 1) rawTitleText = titleParts.slice(1).join(' – ').trim();
        }
    }
    // 2. Si les balises meta n'ont pas donné d'artistes, utilise des sélecteurs de secours.
    if (songData._rawMainArtists.length === 0) {
        const mainArtistsContainer = document.querySelector(SELECTORS.MAIN_ARTISTS_CONTAINER_FALLBACK);
        if (mainArtistsContainer) {
            mainArtistsContainer.querySelectorAll(SELECTORS.MAIN_ARTIST_LINK_IN_CONTAINER_FALLBACK).forEach(link => { const n = link.textContent.trim(); if (n && !songData._rawMainArtists.includes(n)) songData._rawMainArtists.push(n); });
        } else {
            document.querySelectorAll(SELECTORS.FALLBACK_MAIN_ARTIST_LINKS_FALLBACK).forEach(link => { const n = link.textContent.trim(); if (n && !songData._rawMainArtists.includes(n)) songData._rawMainArtists.push(n); });
        }
    }
    // 3. Extrait les artistes depuis la section "Crédits" de la page si elle existe.
    document.querySelectorAll(SELECTORS.CREDITS_PAGE_ARTIST_LIST_CONTAINER).forEach(listContainer => {
        const lt = listContainer.previousElementSibling;
        let isFt = false;
        if (lt) {
            const txt = lt.textContent.trim().toLowerCase();
            // Stricter check: only accept if header explicitly mentions featuring/feat/avec
            if (txt.includes('featuring') || txt.includes('feat') || txt.includes('avec')) {
                isFt = true;
            }
        }

        if (isFt) {
            listContainer.querySelectorAll(SELECTORS.CREDITS_PAGE_ARTIST_NAME_IN_LINK).forEach(s => {
                const n = s.textContent.trim();
                // Avoid adding main artists again
                if (n && !songData._rawFeaturingArtistsFromSection.includes(n) && !songData._rawMainArtists.includes(n)) {
                    songData._rawFeaturingArtistsFromSection.push(n);
                }
            });
        }
    });
    // 4. Extrait le titre de la chanson si non trouvé via les balises meta.
    if (!rawTitleText) {
        for (const sel of SELECTORS.TITLE) { const el = document.querySelector(sel); if (el) { rawTitleText = el.textContent; if (rawTitleText) break; } }
    }
    // 5. Nettoie et finalise les données extraites.
    if (rawTitleText) {
        let ttc = decodeHtmlEntities(rawTitleText.trim()).replace(/\s+Lyrics$/i, '').trim();
        if (artistsFromMeta.main.length === 0 && songData._rawMainArtists.length > 0) {
            const blk = formatArtistList(songData._rawMainArtists.map(a => cleanArtistName(a)));
            if (blk) { const esc = escapeRegExp(blk); let m = ttc.match(new RegExp(`^${esc}\\s*-\\s*(.+)$`, 'i')); if (m && m[1]) ttc = m[1].trim(); else { m = ttc.match(new RegExp(`^(.+?)\\s*-\\s*${esc}$`, 'i')); if (m && m[1]) ttc = m[1].trim(); } }
        }
        ttc = ttc.replace(/\s*\((?:Ft\.|Featuring)[^)]+\)\s*/gi, ' ').trim().replace(/^[\s,-]+|[\s,-]+$/g, '').replace(/\s\s+/g, ' ');
        songData.title = ttc;
    }
    if (!songData.title || songData.title.length === 0) songData.title = "TITRE INCONNU";
    songData.mainArtists = [...new Set(songData._rawMainArtists.map(name => cleanArtistName(name)))].filter(Boolean);
    let finalFeaturingArtists = [];
    const seenCleanedFtNamesForDeduplication = new Set();
    // Priorité aux featurings extraits du titre, sinon on prend ceux de la section crédits.
    if (songData._rawFeaturingArtistsFromTitleExtract.length > 0) {
        songData._rawFeaturingArtistsFromTitleExtract.forEach(rawName => {
            const cleanedName = cleanArtistName(rawName);
            if (cleanedName && !seenCleanedFtNamesForDeduplication.has(cleanedName.toLowerCase()) && !songData.mainArtists.some(mainArt => mainArt.toLowerCase() === cleanedName.toLowerCase())) {
                finalFeaturingArtists.push(cleanedName);
                seenCleanedFtNamesForDeduplication.add(cleanedName.toLowerCase());
            }
        });
    } else {
        songData._rawFeaturingArtistsFromSection.forEach(rawName => {
            const cleanedName = cleanArtistName(rawName);
            if (cleanedName && !seenCleanedFtNamesForDeduplication.has(cleanedName.toLowerCase()) && !songData.mainArtists.some(mainArt => mainArt.toLowerCase() === cleanedName.toLowerCase())) {
                finalFeaturingArtists.push(cleanedName);
                seenCleanedFtNamesForDeduplication.add(cleanedName.toLowerCase());
            }
        });
    }
    songData.featuringArtists = finalFeaturingArtists;
    // 6. Met à jour les variables globales.
    currentSongTitle = songData.title;
    currentMainArtists = [...songData.mainArtists];
    currentFeaturingArtists = [...songData.featuringArtists];
    detectedArtists = [...new Set([...currentMainArtists, ...currentFeaturingArtists])].filter(Boolean);
    return songData;
}

/**
 * Crée et affiche les cases à cocher pour chaque artiste détecté.
 * Permet à l'utilisateur d'attribuer une section de paroles à un ou plusieurs artistes.
 * @param {HTMLElement} container - L'élément parent où les sélecteurs doivent être ajoutés.
 */
function createArtistSelectors(container) {
    if (!container) { console.error("[createArtistSelectors] Erreur: Conteneur non fourni."); return; }
    const existingSelectorContainer = document.getElementById(ARTIST_SELECTOR_CONTAINER_ID);
    if (existingSelectorContainer) { existingSelectorContainer.remove(); } // Supprime l'ancien conteneur s'il existe.
    const artistSelectorContainer = document.createElement('div');
    artistSelectorContainer.id = ARTIST_SELECTOR_CONTAINER_ID;
    artistSelectorContainer.style.display = 'flex'; artistSelectorContainer.style.flexWrap = 'wrap'; artistSelectorContainer.style.gap = '2px 10px'; artistSelectorContainer.style.alignItems = 'center';
    const title = document.createElement('p');
    title.textContent = getTranslation('artist_selection');
    title.style.width = '100%'; title.style.margin = '0 0 1px 0'; // Réduit au minimum, le gap fait le reste
    artistSelectorContainer.appendChild(title);
    if (!detectedArtists || detectedArtists.length === 0) {
        const noArtistsMsg = document.createElement('span'); noArtistsMsg.textContent = getTranslation('no_artist'); noArtistsMsg.style.fontStyle = 'italic';
        artistSelectorContainer.appendChild(noArtistsMsg);
    } else {
        detectedArtists.forEach((artistName, index) => {
            const artistId = `artist_checkbox_${index}_${artistName.replace(/[^a-zA-Z0-9]/g, "")}_GFT`;
            const wrapper = document.createElement('span');
            const checkbox = document.createElement('input');
            Object.assign(checkbox, { type: 'checkbox', name: 'selectedGeniusArtist_checkbox_GFT', value: artistName, id: artistId });
            wrapper.appendChild(checkbox);
            const label = document.createElement('label');
            label.htmlFor = artistId; label.textContent = artistName; label.style.marginLeft = '3px';
            wrapper.appendChild(label);
            artistSelectorContainer.appendChild(wrapper);
        });
    }
    container.appendChild(artistSelectorContainer);
}

/**
 * Vérifie si l'inclusion des feats dans l'en-tête est activée.
 * @returns {boolean} true si activé (défaut: true).
 */
function isHeaderFeatEnabled() {
    return localStorage.getItem(HEADER_FEAT_STORAGE_KEY) !== 'false';
}

/**
 * Active ou désactive l'inclusion des feats dans l'en-tête.
 * @param {boolean} enabled - true pour activer.
 */
function setHeaderFeatEnabled(enabled) {
    localStorage.setItem(HEADER_FEAT_STORAGE_KEY, enabled.toString());
}

/**
 * Vérifie si l'ajout automatique de saut de ligne après les tags est désactivé.
 * @returns {boolean} true si désactivé, false sinon.
 */
function isTagNewlinesDisabled() {
    return localStorage.getItem(DISABLE_TAG_NEWLINES_STORAGE_KEY) === 'true';
}

/**
 * Active ou désactive l'ajout automatique de saut de ligne après les tags.
 * @param {boolean} disabled - true pour désactiver, false pour activer.
 */
function setTagNewlinesDisabled(disabled) {
    localStorage.setItem(DISABLE_TAG_NEWLINES_STORAGE_KEY, disabled.toString());
}

/**
 * Vérifie si le mode "Lyric Card Only" est activé.
 * @returns {boolean} true si activé.
 */
function isLyricCardOnlyMode() {
    return localStorage.getItem(LYRIC_CARD_ONLY_STORAGE_KEY) === 'true';
}

/**
 * Active ou désactive le mode "Lyric Card Only".
 * @param {boolean} enabled - true pour activer.
 */
function setLyricCardOnlyMode(enabled) {
    localStorage.setItem(LYRIC_CARD_ONLY_STORAGE_KEY, enabled.toString());
}

/**
 * Récupère le mode de transcription actuel (fr ou en).
 * Par défaut, retourne 'fr' si non défini.
 * @returns {string} 'fr' ou 'en'
 */
function getTranscriptionMode() {
    return localStorage.getItem(TRANSCRIPTION_MODE_STORAGE_KEY) || 'fr';
}

/**
 * Définit le mode de transcription.
 * @param {string} mode - 'fr' ou 'en'
 */
function setTranscriptionMode(mode) {
    localStorage.setItem(TRANSCRIPTION_MODE_STORAGE_KEY, mode);
}

/**
 * Vérifie si le mode de transcription est anglais.
 * @returns {boolean} true si mode anglais
 */
function isEnglishTranscriptionMode() {
    return getTranscriptionMode() === 'en';
}

/**
 * Vérifie si le mode de transcription est polonais.
 * @returns {boolean} true si mode polonais
 */
function isPolishTranscriptionMode() {
    return getTranscriptionMode() === 'pl';
}

/**
 * Formatte un tag simple en ajoutant ou non un saut de ligne selon la préférence.
 * @param {string} tag - Le tag à formater (ex: "[Instrumental]").
 * @returns {string} Le tag formaté.
 */
function formatSimpleTag(tag, forceNoNewline = false) {
    if (forceNoNewline) return tag;
    return isTagNewlinesDisabled() ? tag : `${tag}\n`;
}

/**
 * Ajoute les noms des artistes sélectionnés au tag de section.
 * En français: "[Couplet 1 : Artiste]" (espace avant et après le :)
 * En anglais: "[Verse 1: Artist]" (pas d'espace avant le :)
 * @param {string} baseTextWithBrackets - Le tag de base, ex: "[Couplet 1]" ou "[Verse 1]".
 * @returns {string} Le tag final avec artistes et saut de ligne si activé.
 */
function addArtistToText(baseTextWithBrackets) {
    const checkedArtistsCheckboxes = document.querySelectorAll('input[name="selectedGeniusArtist_checkbox_GFT"]:checked');
    const selectedArtistNames = Array.from(checkedArtistsCheckboxes).map(cb => cb.value.trim()).filter(Boolean);
    let resultText;
    if (selectedArtistNames.length > 0) {
        const tagPart = baseTextWithBrackets.slice(0, -1); // Enlève le ']' final
        const artistsString = formatArtistList(selectedArtistNames);
        // En anglais et polonais : pas d'espace avant le ':', en français : espace avant et après
        const separator = (isEnglishTranscriptionMode() || isPolishTranscriptionMode()) ? ': ' : ' : ';
        resultText = `${tagPart}${separator}${artistsString}]`;
    } else {
        resultText = baseTextWithBrackets;
    }

    if (!isTagNewlinesDisabled()) {
        resultText += '\n';
    }

    return resultText;
}

/**
 * Remplace du texte dans un éditeur de type `div contenteditable` et surligne les remplacements.
 * C'est plus complexe qu'un simple .replace() car il faut manipuler le DOM.
 * @param {HTMLElement} editorNode - L'élément `div` de l'éditeur.
 * @param {RegExp} searchRegex - L'expression régulière pour trouver le texte à remplacer.
 * @param {string|Function} replacementTextOrFn - Le texte de remplacement ou une fonction qui le retourne.
 * @param {string} highlightClass - La classe CSS à appliquer pour le surlignage.
 * @returns {number} Le nombre de remplacements effectués.
 */
function replaceAndHighlightInDiv(editorNode, searchRegex, replacementTextOrFn, highlightClass) {
    let replacementsMadeCount = 0;
    // TreeWalker est utilisé pour parcourir tous les nœuds de texte de manière sûre.
    const treeWalker = document.createTreeWalker(editorNode, NodeFilter.SHOW_TEXT, null, false);
    const nodesToProcess = [];
    while (treeWalker.nextNode()) nodesToProcess.push(treeWalker.currentNode);
    nodesToProcess.forEach(textNode => {
        const localSearchRegex = new RegExp(searchRegex.source, searchRegex.flags.includes('g') ? searchRegex.flags : searchRegex.flags + 'g');
        if (textNode.nodeValue.match(localSearchRegex)) {
            const parent = textNode.parentNode;
            if (!parent || (parent.nodeType === Node.ELEMENT_NODE && parent.classList.contains(highlightClass))) return;
            const fragment = document.createDocumentFragment();
            let lastIndex = 0;
            let match;
            let nodeChangedThisIteration = false;
            localSearchRegex.lastIndex = 0;
            while ((match = localSearchRegex.exec(textNode.nodeValue)) !== null) {
                if (match.index > lastIndex) fragment.appendChild(document.createTextNode(textNode.nodeValue.substring(lastIndex, match.index)));
                const actualReplacement = typeof replacementTextOrFn === 'function' ? replacementTextOrFn(match[0], ...match.slice(1)) : replacementTextOrFn;
                const span = document.createElement('span');
                span.className = highlightClass;
                // Applique des styles inline avec !important pour éviter qu'ils soient écrasés par les styles de Genius
                span.style.cssText = 'background-color: #f9ff55 !important; border-radius: 2px !important; padding: 0 1px !important; animation: lyrics-helper-fadeout 2s ease-out forwards !important;';
                span.textContent = actualReplacement;
                fragment.appendChild(span);
                lastIndex = localSearchRegex.lastIndex;
                nodeChangedThisIteration = true;
                replacementsMadeCount++;
                if (lastIndex === match.index && localSearchRegex.source !== "") localSearchRegex.lastIndex++;
                if (lastIndex === 0 && localSearchRegex.source === "" && match[0] === "") break;
            }
            if (lastIndex < textNode.nodeValue.length) fragment.appendChild(document.createTextNode(textNode.nodeValue.substring(lastIndex)));
            if (nodeChangedThisIteration && fragment.childNodes.length > 0) { parent.replaceChild(fragment, textNode); }
        }
    });
    return replacementsMadeCount;
}

/**
 * Trouve les parenthèses et crochets non appariés dans le texte.
 * @param {string} text - Le texte à analyser.
 * @returns {Array} Un tableau d'objets contenant les positions et types des caractères non appariés.
 */
function findUnmatchedBracketsAndParentheses(text) {
    const unmatched = [];
    const stack = [];
    const pairs = {
        '(': ')',
        '[': ']'
    };
    const closingChars = {
        ')': '(',
        ']': '['
    };

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (pairs[char]) {
            // C'est un caractère ouvrant
            stack.push({ char: char, position: i });
        } else if (closingChars[char]) {
            // C'est un caractère fermant
            if (stack.length === 0) {
                // Pas de caractère ouvrant correspondant
                unmatched.push({ char: char, position: i, type: 'closing-without-opening' });
            } else {
                const last = stack[stack.length - 1];
                if (pairs[last.char] === char) {
                    // Paire correcte, on enlève de la pile
                    stack.pop();
                } else {
                    // Mauvaise paire (par exemple [ fermé par ) )
                    unmatched.push({ char: char, position: i, type: 'wrong-pair' });
                    stack.pop();
                }
            }
        }
    }

    // Tous les caractères restants dans la pile sont des caractères ouvrants sans fermeture
    stack.forEach(item => {
        unmatched.push({ char: item.char, position: item.position, type: 'opening-without-closing' });
    });

    return unmatched;
}

/**
 * Crée un overlay visuel pour surligner les corrections dans un textarea.
 * @param {HTMLElement} textarea - L'élément textarea.
 * @param {string} originalText - Le texte original avant correction.
 * @param {string} newText - Le texte après correction.
 * @param {RegExp} searchPattern - La regex utilisée pour la recherche (pour identifier précisément les modifications).
 * @param {string} color - Couleur du surlignage (par défaut jaune pour corrections, rouge pour erreurs).
 */
function createTextareaReplacementOverlay(textarea, originalText, newText, searchPattern, color = '#f9ff55') {
    // Supprime l'ancien overlay s'il existe
    const existingOverlay = document.getElementById('gft-textarea-overlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }

    // Si aucun changement, ne fait rien
    if (originalText === newText) {
        return;
    }

    // Trouve les positions des modifications en appliquant la regex sur le texte MODIFIÉ
    // Pour identifier les caractères qui ont été changés
    const modifiedPositions = new Set();

    // Utilise un algorithme de différence simple mais plus précis
    // Trouve tous les matches de la regex dans l'original
    const originalMatches = [];
    const localSearchRegex = new RegExp(searchPattern.source, searchPattern.flags);
    let match;
    localSearchRegex.lastIndex = 0;
    while ((match = localSearchRegex.exec(originalText)) !== null) {
        originalMatches.push({
            start: match.index,
            end: match.index + match[0].length,
            text: match[0]
        });
        if (!searchPattern.flags.includes('g')) break;
    }

    // Pour chaque match trouvé dans l'original, trouve la position correspondante dans le nouveau texte
    let offset = 0; // Décalage causé par les remplacements
    originalMatches.forEach(originalMatch => {
        const posInNew = originalMatch.start + offset;
        // Calcule la différence de longueur causée par ce remplacement
        // On doit trouver combien de caractères ont été ajoutés/supprimés
        const originalLength = originalMatch.end - originalMatch.start;

        // Trouve le texte de remplacement en regardant dans newText
        let newLength = 0;
        let k = posInNew;
        // Cherche jusqu'à trouver un caractère qui existait après le match original
        const charAfterMatch = originalText[originalMatch.end];
        if (charAfterMatch) {
            while (k < newText.length && newText[k] !== charAfterMatch) {
                newLength++;
                k++;
            }
        } else {
            // C'est à la fin du texte
            newLength = newText.length - posInNew;
        }

        // Marque les positions modifiées
        for (let i = posInNew; i < posInNew + newLength; i++) {
            modifiedPositions.add(i);
        }

        // Met à jour le décalage
        offset += (newLength - originalLength);
    });

    // Crée le conteneur de l'overlay
    const overlay = document.createElement('div');
    overlay.id = 'gft-textarea-overlay';
    overlay.style.cssText = `
        position: absolute;
        pointer-events: none;
        z-index: 1;
        white-space: pre-wrap;
        word-wrap: break-word;
        overflow: hidden;
        font-family: ${window.getComputedStyle(textarea).fontFamily};
        font-size: ${window.getComputedStyle(textarea).fontSize};
        line-height: ${window.getComputedStyle(textarea).lineHeight};
        padding: ${window.getComputedStyle(textarea).padding};
        border: ${window.getComputedStyle(textarea).border};
        box-sizing: border-box;
    `;

    // Positionne l'overlay exactement sur le textarea
    const rect = textarea.getBoundingClientRect();
    const parentRect = textarea.offsetParent ? textarea.offsetParent.getBoundingClientRect() : { top: 0, left: 0 };
    overlay.style.top = (rect.top - parentRect.top + (textarea.offsetParent ? textarea.offsetParent.scrollTop : 0)) + 'px';
    overlay.style.left = (rect.left - parentRect.left + (textarea.offsetParent ? textarea.offsetParent.scrollLeft : 0)) + 'px';
    overlay.style.width = textarea.offsetWidth + 'px';
    overlay.style.height = textarea.offsetHeight + 'px';

    // Crée le contenu de l'overlay avec surlignage
    let htmlContent = '';
    for (let i = 0; i < newText.length; i++) {
        const char = newText[i];
        if (modifiedPositions.has(i)) {
            htmlContent += `<span class="gft-correction-overlay" style="background-color: ${color}; opacity: 0.6; border-radius: 2px; padding: 0 1px; color: transparent; font-weight: inherit;">${char === '<' ? '&lt;' : char === '>' ? '&gt;' : char === '&' ? '&amp;' : char === '\n' ? '<br>' : char}</span>`;
        } else {
            htmlContent += `<span style="color: transparent;">${char === '<' ? '&lt;' : char === '>' ? '&gt;' : char === '&' ? '&amp;' : char === '\n' ? '<br>' : char}</span>`;
        }
    }

    overlay.innerHTML = htmlContent;

    // Insère l'overlay avant le textarea dans le DOM
    textarea.parentNode.insertBefore(overlay, textarea);

    // Synchronise le scroll de l'overlay avec celui du textarea
    const syncScroll = () => {
        overlay.scrollTop = textarea.scrollTop;
        overlay.scrollLeft = textarea.scrollLeft;
    };

    textarea.addEventListener('scroll', syncScroll);

    // Supprime l'overlay après l'animation (2 secondes)
    setTimeout(() => {
        if (overlay && overlay.parentNode) {
            overlay.remove();
            textarea.removeEventListener('scroll', syncScroll);
        }
    }, 2000);
}

/**
 * Crée un overlay visuel pour surligner les erreurs dans un textarea.
 * @param {HTMLElement} textarea - L'élément textarea.
 * @param {Array} unmatched - Liste des caractères non appariés avec leurs positions.
 */
function createTextareaOverlay(textarea, unmatched) {
    // Supprime l'ancien overlay s'il existe
    const existingOverlay = document.getElementById('gft-textarea-overlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }

    // Crée le conteneur de l'overlay
    const overlay = document.createElement('div');
    overlay.id = 'gft-textarea-overlay';
    overlay.style.cssText = `
        position: absolute;
        pointer-events: none;
        z-index: 1;
        white-space: pre-wrap;
        word-wrap: break-word;
        overflow: hidden;
        font-family: ${window.getComputedStyle(textarea).fontFamily};
        font-size: ${window.getComputedStyle(textarea).fontSize};
        line-height: ${window.getComputedStyle(textarea).lineHeight};
        padding: ${window.getComputedStyle(textarea).padding};
        border: ${window.getComputedStyle(textarea).border};
        box-sizing: border-box;
    `;

    // Positionne l'overlay exactement sur le textarea
    const rect = textarea.getBoundingClientRect();
    const parentRect = textarea.offsetParent.getBoundingClientRect();
    overlay.style.top = (rect.top - parentRect.top + textarea.offsetParent.scrollTop) + 'px';
    overlay.style.left = (rect.left - parentRect.left + textarea.offsetParent.scrollLeft) + 'px';
    overlay.style.width = textarea.offsetWidth + 'px';
    overlay.style.height = textarea.offsetHeight + 'px';

    // Crée le contenu de l'overlay avec surlignage
    const text = textarea.value;
    const unmatchedPositions = new Set(unmatched.map(u => u.position));
    let htmlContent = '';

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (unmatchedPositions.has(i)) {
            const unmatchedItem = unmatched.find(u => u.position === i);
            let title = '';
            if (unmatchedItem.type === 'opening-without-closing') {
                title = `${unmatchedItem.char} ouvrant sans fermeture correspondante`;
            } else if (unmatchedItem.type === 'closing-without-opening') {
                title = `${unmatchedItem.char} fermant sans ouverture correspondante`;
            } else if (unmatchedItem.type === 'wrong-pair') {
                title = `${unmatchedItem.char} ne correspond pas au caractère ouvrant`;
            }
            htmlContent += `<span class="gft-bracket-error-overlay" title="${title}" style="background-color: rgba(255, 68, 68, 0.5); color: transparent; font-weight: bold; position: relative; z-index: 2;">${char === '<' ? '&lt;' : char === '>' ? '&gt;' : char === '&' ? '&amp;' : char}</span>`;
        } else {
            htmlContent += `<span style="color: transparent;">${char === '<' ? '&lt;' : char === '>' ? '&gt;' : char === '&' ? '&amp;' : char === '\n' ? '<br>' : char}</span>`;
        }
    }

    overlay.innerHTML = htmlContent;

    // Insère l'overlay avant le textarea dans le DOM
    textarea.parentNode.insertBefore(overlay, textarea);

    // Synchronise le scroll de l'overlay avec celui du textarea
    const syncScroll = () => {
        overlay.scrollTop = textarea.scrollTop;
        overlay.scrollLeft = textarea.scrollLeft;
    };

    textarea.addEventListener('scroll', syncScroll);
    textarea.addEventListener('input', () => {
        // Supprime l'overlay quand l'utilisateur commence à taper
        overlay.remove();
        textarea.removeEventListener('scroll', syncScroll);
    });

    // Ajoute une animation pulsée
    const style = document.createElement('style');
    style.textContent = `
        @keyframes gft-overlay-pulse {
            0%, 100% { background-color: rgba(255, 68, 68, 0.5); }
            50% { background-color: rgba(255, 34, 34, 0.7); }
        }
        .gft-bracket-error-overlay {
            animation: gft-overlay-pulse 1.5s ease-in-out infinite;
        }
    `;
    if (!document.getElementById('gft-overlay-style')) {
        style.id = 'gft-overlay-style';
        document.head.appendChild(style);
    }
}

/**
 * Surligne les parenthèses et crochets non appariés dans l'éditeur.
 * @param {HTMLElement} editorNode - L'élément de l'éditeur (textarea ou div).
 * @param {string} editorType - Le type d'éditeur ('textarea' ou 'div').
 * @returns {number} Le nombre de caractères non appariés trouvés.
 */
function highlightUnmatchedBracketsInEditor(editorNode, editorType) {
    console.log('[GFT] highlightUnmatchedBracketsInEditor appelée');
    console.log('[GFT] editorType:', editorType);

    // Nettoyer les surlignages existants avant toute chose
    if (editorType === 'div') {
        const existingErrors = editorNode.querySelectorAll('.gft-bracket-error');
        existingErrors.forEach(span => {
            const text = span.textContent;
            const textNode = document.createTextNode(text);
            span.parentNode.replaceChild(textNode, span);
        });
        // Normaliser pour fusionner les nœuds texte adjacents
        editorNode.normalize();
    } else {
        const existingOverlay = document.getElementById('gft-textarea-overlay');
        if (existingOverlay) existingOverlay.remove();
    }

    const text = editorType === 'textarea' ? editorNode.value : editorNode.textContent;
    console.log('[GFT] Texte à analyser (longueur):', text.length);

    const unmatched = findUnmatchedBracketsAndParentheses(text);
    console.log('[GFT] Caractères non appariés trouvés:', unmatched.length);

    if (unmatched.length === 0) {
        // Supprime l'overlay s'il existe
        const existingOverlay = document.getElementById('gft-textarea-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        console.log('[GFT] Aucun problème trouvé, retour 0');
        return 0;
    }

    console.log('[GFT] Problèmes trouvés, création de l\'overlay...');

    if (editorType === 'div') {
        // Pour les éditeurs div (contenteditable), on doit travailler avec le DOM
        const treeWalker = document.createTreeWalker(editorNode, NodeFilter.SHOW_TEXT, null, false);
        const textNodes = [];
        while (treeWalker.nextNode()) {
            textNodes.push(treeWalker.currentNode);
        }

        let globalPosition = 0;
        const unmatchedPositions = new Set(unmatched.map(u => u.position));

        textNodes.forEach(textNode => {
            const nodeText = textNode.nodeValue;
            const nodeStartPos = globalPosition;
            const nodeEndPos = globalPosition + nodeText.length;

            // Vérifie si ce nœud contient des positions non appariées
            const relevantPositions = unmatched.filter(
                u => u.position >= nodeStartPos && u.position < nodeEndPos
            );

            if (relevantPositions.length > 0) {
                const parent = textNode.parentNode;
                // Ne surligne pas si déjà surligné
                if (parent && parent.nodeType === Node.ELEMENT_NODE &&
                    parent.classList.contains('gft-bracket-error')) {
                    globalPosition += nodeText.length;
                    return;
                }

                const fragment = document.createDocumentFragment();
                let lastIndex = 0;

                relevantPositions.forEach(unmatchedItem => {
                    const localPos = unmatchedItem.position - nodeStartPos;

                    // Ajoute le texte avant le caractère non apparié
                    if (localPos > lastIndex) {
                        fragment.appendChild(document.createTextNode(nodeText.substring(lastIndex, localPos)));
                    }

                    // Crée un span pour le caractère non apparié
                    const span = document.createElement('span');
                    span.className = 'gft-bracket-error';
                    span.textContent = nodeText[localPos];
                    span.style.cssText = 'background-color: #ff4444 !important; color: white !important; padding: 0 2px; border-radius: 2px; font-weight: bold;';

                    // Ajoute un titre pour expliquer le problème
                    if (unmatchedItem.type === 'opening-without-closing') {
                        span.title = `${unmatchedItem.char} ouvrant sans fermeture correspondante`;
                    } else if (unmatchedItem.type === 'closing-without-opening') {
                        span.title = `${unmatchedItem.char} fermant sans ouverture correspondante`;
                    } else if (unmatchedItem.type === 'wrong-pair') {
                        span.title = `${unmatchedItem.char} ne correspond pas au caractère ouvrant`;
                    }

                    fragment.appendChild(span);
                    lastIndex = localPos + 1;
                });

                // Ajoute le reste du texte
                if (lastIndex < nodeText.length) {
                    fragment.appendChild(document.createTextNode(nodeText.substring(lastIndex)));
                }

                if (fragment.childNodes.length > 0 && parent) {
                    parent.replaceChild(fragment, textNode);
                }
            }

            globalPosition += nodeText.length;
        });
    } else {
        // Pour les textarea, crée un overlay visuel pour simuler le surlignage
        createTextareaOverlay(editorNode, unmatched);

        // Ne pas forcer le focus ou le scroll pour éviter la "téléportation"
        // L'utilisateur peut voir les erreurs surlignées sans être déplacé
    }

    return unmatched.length;
}

/**
 * Masque le panneau d'aide au formatage par défaut de Genius pour ne pas surcharger l'interface.
 */
function hideGeniusFormattingHelper() {
    const helperElement = document.querySelector(SELECTORS.GENIUS_FORMATTING_HELPER);
    if (helperElement) helperElement.style.display = 'none';
}

// showFeedbackMessage definition and feedbackTimeout moved to global scope and end of file to avoid duplication


/**
 * Applique ou retire le mode sombre sur le panneau d'outils.
 * @param {boolean} isDark - True pour activer le mode sombre, false pour le désactiver.
 */
function applyDarkMode(isDark) {
    if (shortcutsContainerElement) {
        if (isDark) {
            shortcutsContainerElement.classList.add(DARK_MODE_CLASS);
            if (darkModeButton) darkModeButton.textContent = '☀️';
        } else {
            shortcutsContainerElement.classList.remove(DARK_MODE_CLASS);
            if (darkModeButton) darkModeButton.textContent = '🌙';
        }
    }

    // Applique aussi le mode sombre à la barre flottante
    if (floatingFormattingToolbar) {
        if (isDark) {
            floatingFormattingToolbar.classList.add(DARK_MODE_CLASS);
        } else {
            floatingFormattingToolbar.classList.remove(DARK_MODE_CLASS);
        }
    }

    // Sauvegarde la préférence dans le stockage local du navigateur.
    localStorage.setItem(DARK_MODE_STORAGE_KEY, isDark.toString());
}

/**
 * Inverse l'état actuel du mode sombre.
 */
function toggleDarkMode() {
    const isCurrentlyDark = shortcutsContainerElement ? shortcutsContainerElement.classList.contains(DARK_MODE_CLASS) : false;
    applyDarkMode(!isCurrentlyDark);
}

/**
 * Charge et applique la préférence de mode sombre depuis le localStorage au chargement.
 */
function loadDarkModePreference() {
    const savedPreference = localStorage.getItem(DARK_MODE_STORAGE_KEY);
    // Par défaut, dark mode activé si aucune préférence n'est sauvegardée (première utilisation)
    const shouldBeDark = savedPreference === null ? true : savedPreference === 'true';
    applyDarkMode(shouldBeDark);
}

/**
 * Crée et initialise la barre d'outils flottante pour le formatage (Gras/Italique).
 * @returns {HTMLElement} L'élément de la barre d'outils flottante.
 */
function createFloatingFormattingToolbar() {
    if (floatingFormattingToolbar && document.body.contains(floatingFormattingToolbar)) {
        return floatingFormattingToolbar;
    }

    const toolbar = document.createElement('div');
    toolbar.id = FLOATING_TOOLBAR_ID;
    toolbar.className = 'gft-floating-toolbar';

    // Bouton Créer Lyrics Card
    const lyricsCardButton = document.createElement('button');
    lyricsCardButton.textContent = getTranslation('create_lyric_card');
    lyricsCardButton.classList.add('gft-floating-format-button', 'gft-lyric-card-btn');
    lyricsCardButton.title = getTranslation('toolbar_lyric_card_tooltip');
    lyricsCardButton.type = 'button';
    lyricsCardButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        generateLyricsCard();
    });
    addTooltip(lyricsCardButton, getTranslation('toolbar_lyric_card_tooltip'));

    toolbar.appendChild(lyricsCardButton);

    // Bouton Gras
    if (!isLyricCardOnlyMode()) {
        const boldButton = document.createElement('button');
        boldButton.textContent = getTranslation('toolbar_bold');
        boldButton.classList.add('gft-floating-format-button');
        boldButton.title = getTranslation('toolbar_bold_tooltip');
        boldButton.type = 'button';
        boldButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            applyFormattingToSelection('bold');
        });
        addTooltip(boldButton, getTranslation('toolbar_bold_tooltip'));
        toolbar.appendChild(boldButton);
    }

    // Bouton Italique
    if (!isLyricCardOnlyMode()) {
        const italicButton = document.createElement('button');
        italicButton.textContent = getTranslation('toolbar_italic');
        italicButton.classList.add('gft-floating-format-button');
        italicButton.title = getTranslation('toolbar_italic_tooltip');
        italicButton.type = 'button';
        italicButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            applyFormattingToSelection('italic');
        });
        addTooltip(italicButton, getTranslation('toolbar_italic_tooltip'));
        toolbar.appendChild(italicButton);
    }

    // Bouton Nombre → Lettres (Seulement en mode full)
    if (!isLyricCardOnlyMode()) {
        const numberButton = document.createElement('button');
        numberButton.textContent = getTranslation('toolbar_num_to_words');
        numberButton.classList.add('gft-floating-format-button', 'gft-number-button');
        numberButton.title = getTranslation('toolbar_num_to_words_tooltip');
        numberButton.type = 'button';
        numberButton.style.display = 'none'; // Caché par défaut
        numberButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            convertNumberToWords();
        });
        addTooltip(numberButton, getTranslation('toolbar_num_to_words_tooltip'));
        toolbar.appendChild(numberButton);
    }

    // Bouton Ad-lib (Seulement en mode full)
    if (!isLyricCardOnlyMode()) {
        const adlibButton = document.createElement('button');
        adlibButton.textContent = getTranslation('btn_adlib_label');
        adlibButton.classList.add('gft-floating-format-button', 'gft-adlib-button');
        adlibButton.title = getTranslation('cleanup_adlib_tooltip');
        adlibButton.type = 'button';
        adlibButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            wrapSelectionWithAdlib();
        });
        addTooltip(adlibButton, getTranslation('cleanup_adlib_tooltip'));
        toolbar.appendChild(adlibButton);
    }

    document.body.appendChild(toolbar);

    floatingFormattingToolbar = toolbar;

    // Applique le mode sombre si nécessaire
    const isDarkMode = localStorage.getItem(DARK_MODE_STORAGE_KEY) === 'true';
    if (isDarkMode) {
        toolbar.classList.add(DARK_MODE_CLASS);
    }

    return toolbar;
}

/**
 * Applique un formatage (gras ou italique) au texte sélectionné.
 * @param {string} formatType - Type de formatage : 'bold' ou 'italic'.
 */
function applyFormattingToSelection(formatType) {
    if (!currentActiveEditor) return;

    // Active le flag pour désactiver la sauvegarde automatique
    isButtonActionInProgress = true;

    // Annule le timeout de sauvegarde automatique
    if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = null;
    }

    // Sauvegarde dans l'historique avant modification
    saveToHistory();

    currentActiveEditor.focus();
    const prefix = formatType === 'bold' ? '<b>' : '<i>';
    const suffix = formatType === 'bold' ? '</b>' : '</i>';

    if (currentEditorType === 'textarea') {
        const start = currentActiveEditor.selectionStart;
        const end = currentActiveEditor.selectionEnd;
        const selectedText = currentActiveEditor.value.substring(start, end);
        let textToInsert = (start !== end) ? `${prefix}${selectedText}${suffix}` : `${prefix} ${suffix}`;
        document.execCommand('insertText', false, textToInsert);
        if (start === end) {
            currentActiveEditor.setSelectionRange(start + prefix.length + 1, start + prefix.length + 1);
        } else {
            currentActiveEditor.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
        }
    } else if (currentEditorType === 'div') {
        document.execCommand(formatType, false, null);
        const selection = window.getSelection();
        if (selection.isCollapsed) {
            const formatElement = document.createElement(formatType === 'bold' ? 'b' : 'i');
            const spaceNode = document.createTextNode('\u00A0');
            formatElement.appendChild(spaceNode);
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(formatElement);
            const newRange = document.createRange();
            newRange.setStart(formatElement.firstChild, 0);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);
        }
    }

    // Désactive le flag après un court délai et met à jour lastSavedContent
    setTimeout(() => {
        isButtonActionInProgress = false;
        if (currentActiveEditor) {
            lastSavedContent = getCurrentEditorContent();
            hasUnsavedChanges = false;
        }
    }, 100);

    // Cache la barre d'outils après l'application du formatage
    hideFloatingToolbar();
}

/**
 * Convertit le nombre sélectionné en lettres.
 */
function convertNumberToWords() {
    if (!currentActiveEditor) return;

    // Active le flag pour désactiver la sauvegarde automatique
    isButtonActionInProgress = true;

    // Annule le timeout de sauvegarde automatique
    if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = null;
    }

    // Sauvegarde dans l'historique avant modification
    saveToHistory();

    currentActiveEditor.focus();

    let selectedText = '';
    let start, end;

    if (currentEditorType === 'textarea') {
        start = currentActiveEditor.selectionStart;
        end = currentActiveEditor.selectionEnd;
        selectedText = currentActiveEditor.value.substring(start, end).trim();
    } else if (currentEditorType === 'div') {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            selectedText = selection.toString().trim();
        }
    }

    // Vérifie si c'est un nombre valide
    if (!isValidNumber(selectedText)) {
        hideFloatingToolbar();
        return;
    }

    const num = parseInt(selectedText, 10);
    let wordsText;
    if (isPolishTranscriptionMode()) {
        wordsText = numberToPolishWords(num);
    } else if (isEnglishTranscriptionMode()) {
        wordsText = numberToEnglishWords(num);
    } else {
        wordsText = numberToFrenchWords(num);
    }

    // Remplace le texte sélectionné
    if (currentEditorType === 'textarea') {
        document.execCommand('insertText', false, wordsText);
        const newEnd = start + wordsText.length;
        currentActiveEditor.setSelectionRange(newEnd, newEnd);
    } else if (currentEditorType === 'div') {
        document.execCommand('insertText', false, wordsText);
    }

    // Désactive le flag après un court délai et met à jour lastSavedContent
    setTimeout(() => {
        isButtonActionInProgress = false;
        if (currentActiveEditor) {
            lastSavedContent = getCurrentEditorContent();
            hasUnsavedChanges = false;
        }
    }, 100);

    // Cache la barre d'outils après la conversion
    hideFloatingToolbar();
}

/**
 * Entoure le texte sélectionné de parenthèses pour les ad-libs.
 */
function wrapSelectionWithAdlib() {
    if (!currentActiveEditor) return;

    // Active le flag pour désactiver la sauvegarde automatique
    isButtonActionInProgress = true;
    if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = null;
    }

    // Sauvegarde dans l'historique
    saveToHistory();

    let selectedText = '';
    let replaced = false;

    if (currentEditorType === 'textarea') {
        const start = currentActiveEditor.selectionStart;
        const end = currentActiveEditor.selectionEnd;

        if (start !== end) {
            selectedText = currentActiveEditor.value.substring(start, end);
            const wrappedText = '(' + selectedText + ')';

            currentActiveEditor.setSelectionRange(start, end);
            document.execCommand('insertText', false, wrappedText);
            replaced = true;
        }
    } else if (currentEditorType === 'div') {
        const selection = window.getSelection();
        if (selection.rangeCount > 0 && !selection.isCollapsed) {
            selectedText = selection.toString();
            const wrappedText = '(' + selectedText + ')';

            document.execCommand('insertText', false, wrappedText);
            currentActiveEditor.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
            replaced = true;
        }
    }

    if (replaced) {
        showFeedbackMessage(getTranslation('feedback_adlib_added'), 2000, shortcutsContainerElement);
    } else {
        showFeedbackMessage(getTranslation('feedback_select_text_first'), 2000, shortcutsContainerElement);
    }

    // Désactive le flag après un court délai et met à jour lastSavedContent
    setTimeout(() => {
        isButtonActionInProgress = false;
        if (currentActiveEditor) {
            lastSavedContent = getCurrentEditorContent();
            hasUnsavedChanges = false;
        }
    }, 100);

    // Cache la barre d'outils après l'action
    hideFloatingToolbar();
}

/**
 * Calcule les statistiques du texte (lignes, mots, sections, caractères).
 * @param {string} text - Le texte à analyser.
 * @returns {{lines: number, words: number, sections: number, characters: number}} Les statistiques calculées.
 */
function calculateStats(text) {
    if (!text) return { lines: 0, words: 0, sections: 0, characters: 0 };

    const lines = text.split('\n').filter(l => l.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.trim().length > 0);
    const sections = (text.match(/\[.*?\]/g) || []).length;
    const characters = text.replace(/\s/g, '').length;

    return {
        lines: lines.length,
        words: words.length,
        sections: sections,
        characters: characters
    };
}

/**
 * Met à jour l'affichage des statistiques dans le panneau.
 */
function updateStatsDisplay() {
    if (!currentActiveEditor) return;

    const statsElement = document.getElementById('gft-stats-display');
    if (!statsElement || !statsElement.classList.contains('gft-stats-visible')) return;

    const text = currentEditorType === 'textarea'
        ? currentActiveEditor.value
        : currentActiveEditor.textContent || '';

    const stats = calculateStats(text);

    statsElement.innerHTML = `📊 <strong>${stats.lines}</strong> ${getTranslation('stats_lines', stats.lines)} • <strong>${stats.words}</strong> ${getTranslation('stats_words', stats.words)} • <strong>${stats.sections}</strong> ${getTranslation('stats_sections', stats.sections)} • <strong>${stats.characters}</strong> ${getTranslation('stats_characters', stats.characters)}`;
}

let statsUpdateTimeout = null;
/**
 * Met à jour les statistiques avec un debounce pour optimiser les performances.
 */
function debouncedStatsUpdate() {
    if (statsUpdateTimeout) clearTimeout(statsUpdateTimeout);
    statsUpdateTimeout = setTimeout(() => {
        updateStatsDisplay();
    }, 300);
}

/**
 * Toggle l'affichage du compteur de statistiques.
 */
function toggleStatsDisplay() {
    const statsElement = document.getElementById('gft-stats-display');
    if (!statsElement) return;

    const isVisible = statsElement.classList.contains('gft-stats-visible');

    if (isVisible) {
        statsElement.classList.remove('gft-stats-visible');
        localStorage.setItem('gft-stats-visible', 'false');
    } else {
        statsElement.classList.add('gft-stats-visible');
        localStorage.setItem('gft-stats-visible', 'true');
        updateStatsDisplay();
    }
}

/**
 * Crée l'élément d'affichage des statistiques.
 * @returns {HTMLElement} L'élément des statistiques.
 */
function createStatsDisplay() {
    const statsElement = document.createElement('div');
    statsElement.id = 'gft-stats-display';
    statsElement.className = 'gft-stats-display';

    // Restaurer l'état sauvegardé
    const isVisible = localStorage.getItem('gft-stats-visible') === 'true';
    if (isVisible) {
        statsElement.classList.add('gft-stats-visible');
    }

    return statsElement;
}

// ----- Historique Undo/Redo -----

/**
 * Obtient le contenu textuel actuel de l'éditeur.
 * @returns {string} Le contenu de l'éditeur.
 */
function getCurrentEditorContent() {
    if (!currentActiveEditor) return '';

    if (currentEditorType === 'textarea') {
        return currentActiveEditor.value;
    } else if (currentEditorType === 'div') {
        return currentActiveEditor.textContent || '';
    }
    return '';
}

/**
 * Définit le contenu de l'éditeur.
 * @param {string} content - Le contenu à définir.
 */
function setEditorContent(content) {
    if (!currentActiveEditor) return;

    if (currentEditorType === 'textarea') {
        currentActiveEditor.value = content;
        currentActiveEditor.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    } else if (currentEditorType === 'div') {
        currentActiveEditor.innerHTML = '';
        content.split('\n').forEach((lineText, index, arr) => {
            const lineDiv = document.createElement('div');
            if (lineText === "") {
                if (index !== arr.length - 1 || content.endsWith('\n')) {
                    lineDiv.appendChild(document.createElement('br'));
                }
            } else {
                lineDiv.textContent = lineText;
            }
            currentActiveEditor.appendChild(lineDiv);
        });

        // S'assure que l'éditeur n'est jamais complètement vide
        if (currentActiveEditor.childNodes.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.appendChild(document.createElement('br'));
            currentActiveEditor.appendChild(emptyDiv);
        }

        currentActiveEditor.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    }

    // Met à jour les statistiques
    debouncedStatsUpdate();
}

let autoSaveTimeout = null;
let lastSavedContent = '';
let isUndoRedoInProgress = false; // Flag pour éviter les sauvegardes pendant undo/redo
let isButtonActionInProgress = false; // Flag pour éviter les sauvegardes auto pendant les actions de boutons
let hasUnsavedChanges = false; // Flag pour savoir si des modifications non sauvegardées existent
let draftNotificationShown = false; // Flag pour éviter d'afficher plusieurs fois la notification de brouillon

/**
 * Sauvegarde l'état actuel dans l'historique avant une modification.
 */
function saveToHistory() {
    if (!currentActiveEditor || isUndoRedoInProgress) return;

    const currentContent = getCurrentEditorContent();

    // Ne sauvegarde pas si le contenu est identique au dernier élément de l'undoStack
    if (undoStack.length > 0 && undoStack[undoStack.length - 1] === currentContent) {
        return;
    }

    undoStack.push(currentContent);
    lastSavedContent = currentContent;
    hasUnsavedChanges = false;

    // Limite la taille de l'historique (FIFO)
    if (undoStack.length > MAX_HISTORY_SIZE) {
        undoStack.shift(); // Retire le plus ancien
    }

    // Vider le redoStack car nouvelle branche d'historique
    redoStack = [];

    // Met à jour les boutons
    updateHistoryButtons();
}

/**
 * Sauvegarde automatique dans l'historique avec debounce.
 * Appelée pendant la frappe de l'utilisateur.
 * Sauvegarde l'état AVANT les modifications au premier input.
 */
function autoSaveToHistory() {
    if (!currentActiveEditor || isUndoRedoInProgress || isButtonActionInProgress) return;

    const currentContent = getCurrentEditorContent();

    // Si c'est le premier changement depuis la dernière sauvegarde,
    // on sauvegarde IMMÉDIATEMENT l'état AVANT la modification
    if (!hasUnsavedChanges && currentContent !== lastSavedContent) {
        // Sauvegarde l'état AVANT (qui est dans lastSavedContent ou le dernier de undoStack)
        if (lastSavedContent && lastSavedContent !== (undoStack[undoStack.length - 1] || '')) {
            undoStack.push(lastSavedContent);

            // Limite la taille de l'historique (FIFO)
            if (undoStack.length > MAX_HISTORY_SIZE) {
                undoStack.shift();
            }

            // Vider le redoStack car nouvelle branche d'historique
            redoStack = [];

            updateHistoryButtons();
        }
        hasUnsavedChanges = true;
    }

    // Annule le timeout précédent
    if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
    }

    // Après 2 secondes d'inactivité, met à jour lastSavedContent et réinitialise le flag
    autoSaveTimeout = setTimeout(() => {
        if (isUndoRedoInProgress || isButtonActionInProgress) return;

        const finalContent = getCurrentEditorContent();
        lastSavedContent = finalContent;
        hasUnsavedChanges = false;

        // Sauvegarde aussi dans le brouillon local
        saveDraft(finalContent);
    }, 2000);
}

// ----- Gestion des Brouillons (Drafts) -----

/**
 * Génère une clé unique pour le stockage du brouillon basée sur l'URL.
 * @returns {string} La clé de stockage.
 */
function getDraftKey() {
    // Utilise le pathname pour identifier la chanson (ex: /Artiste-titre-lyrics)
    return `gft-draft-${window.location.pathname}`;
}

/**
 * Sauvegarde le contenu actuel comme brouillon dans localStorage.
 * @param {string} content - Le contenu à sauvegarder.
 */
function saveDraft(content) {
    if (!content || content.trim().length === 0) return;

    const key = getDraftKey();
    const draftData = {
        content: content,
        timestamp: Date.now(),
        title: currentSongTitle
    };

    try {
        localStorage.setItem(key, JSON.stringify(draftData));
        // console.log('[GFT] Brouillon sauvegardé', new Date().toLocaleTimeString());
    } catch (e) {
        console.warn('[GFT] Erreur sauvegarde brouillon:', e);
    }
}

/**
 * Vérifie s'il existe un brouillon pour cette page et propose de le restaurer.
 */
function checkAndRestoreDraft() {
    // Si la notification a déjà été affichée pour cette session, on ne la réaffiche pas
    if (draftNotificationShown) return;

    const key = getDraftKey();
    const savedDraft = localStorage.getItem(key);

    if (!savedDraft) return;

    try {
        const draftData = JSON.parse(savedDraft);
        const currentContent = getCurrentEditorContent();

        // Si le brouillon est vide ou identique au contenu actuel, on ignore
        if (!draftData.content || draftData.content === currentContent) return;

        // Si le brouillon est plus vieux que 24h, on l'ignore (optionnel, mais évite les vieux trucs)
        const ONE_DAY = 24 * 60 * 60 * 1000;
        if (Date.now() - draftData.timestamp > ONE_DAY) return;

        // Affiche une notification pour restaurer
        const date = new Date(draftData.timestamp);
        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        showRestoreDraftNotification(timeStr, draftData.content);
        draftNotificationShown = true; // Marque comme affiché

    } catch (e) {
        console.warn('[GFT] Erreur lecture brouillon:', e);
    }
}

/**
 * Affiche une notification spéciale pour restaurer le brouillon.
 */
function showRestoreDraftNotification(timeStr, contentToRestore) {
    // On attache directement au body pour éviter les problèmes de z-index ou de pointer-events des conteneurs parents
    const container = document.body;

    const notification = document.createElement('div');
    notification.className = 'gft-draft-notification';
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #333;
        color: white;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        z-index: 2147483647; /* Max z-index pour être sûr d'être au-dessus de tout */
        display: flex;
        flex-direction: column;
        gap: 10px;
        font-family: 'Programme', sans-serif;
        border-left: 4px solid #ffff64;
        animation: slideIn 0.3s ease-out;
        pointer-events: auto; /* Force la réactivité aux clics */
        cursor: default;
    `;

    const text = document.createElement('div');
    text.innerHTML = `<strong>${getTranslation('draft_found_title')}</strong><br>${getTranslation('draft_saved_at')} ${timeStr}`;

    const buttons = document.createElement('div');
    buttons.style.display = 'flex';
    buttons.style.gap = '10px';

    const restoreBtn = document.createElement('button');
    restoreBtn.textContent = getTranslation('draft_btn_restore');
    restoreBtn.style.cssText = `
        background-color: #ffff64;
        color: black;
        border: none;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
        pointer-events: auto;
    `;
    restoreBtn.onclick = (e) => {
        e.stopPropagation(); // Empêche la propagation au cas où
        setEditorContent(contentToRestore);
        saveToHistory(); // Sauvegarde l'état restauré dans l'historique
        showFeedbackMessage(getTranslation('draft_restored'));
        notification.remove();
        draftNotificationShown = false; // Réinitialise le flag après restauration
    };

    const discardBtn = document.createElement('button');
    discardBtn.textContent = getTranslation('draft_btn_discard');
    discardBtn.style.cssText = `
        background-color: transparent;
        color: #aaa;
        border: 1px solid #555;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        pointer-events: auto;
    `;
    discardBtn.onclick = (e) => {
        e.stopPropagation();
        notification.remove();
        // Supprime le brouillon pour ne plus le proposer
        localStorage.removeItem(getDraftKey());
        draftNotificationShown = false; // Réinitialise le flag après avoir ignoré
    };

    buttons.appendChild(restoreBtn);
    buttons.appendChild(discardBtn);

    notification.appendChild(text);
    notification.appendChild(buttons);

    container.appendChild(notification);

    // Auto-hide après 15 secondes
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.remove();
            draftNotificationShown = false; // Réinitialise le flag si la notification disparaît d'elle-même
        }
    }, 15000);
}

/**
 * Wrapper pour exécuter une action de bouton avec sauvegarde dans l'historique.
 * @param {Function} action - La fonction action à exécuter.
 */
async function executeButtonAction(action) {
    isButtonActionInProgress = true;

    // Annule le timeout de sauvegarde automatique
    if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = null;
    }

    // Sauvegarde l'état AVANT la modification
    saveToHistory();

    // Exécute l'action
    await action();

    // Désactive le flag après un court délai
    setTimeout(() => {
        isButtonActionInProgress = false;
        // Met à jour lastSavedContent après l'action
        if (currentActiveEditor) {
            lastSavedContent = getCurrentEditorContent();
        }
    }, 100);
}

/**
 * Annule la dernière modification.
 */
function undoLastChange() {
    if (!currentActiveEditor || undoStack.length === 0) {
        showFeedbackMessage(getTranslation('feedback_no_changes'), 2000, shortcutsContainerElement);
        return;
    }

    // Active le flag pour éviter les sauvegardes automatiques
    isUndoRedoInProgress = true;

    // Annule le timeout de sauvegarde automatique
    if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = null;
    }

    // Sauvegarde l'état actuel dans le redoStack
    const currentContent = getCurrentEditorContent();
    redoStack.push(currentContent);

    // Récupère le dernier état depuis l'undoStack
    const previousContent = undoStack.pop();

    // Restaure cet état
    setEditorContent(previousContent);

    // Met à jour lastSavedContent et réinitialise hasUnsavedChanges
    lastSavedContent = previousContent;
    hasUnsavedChanges = false;

    // Met à jour les boutons
    updateHistoryButtons();

    showFeedbackMessage(getTranslation('feedback_undo'), 2000, shortcutsContainerElement);

    // Désactive le flag après un court délai
    setTimeout(() => {
        isUndoRedoInProgress = false;
    }, 100);
}

/**
 * Refait la dernière modification annulée.
 */
function redoLastChange() {
    if (!currentActiveEditor || redoStack.length === 0) {
        showFeedbackMessage(getTranslation('feedback_no_changes'), 2000, shortcutsContainerElement);
        return;
    }

    // Active le flag pour éviter les sauvegardes automatiques
    isUndoRedoInProgress = true;

    // Annule le timeout de sauvegarde automatique
    if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = null;
    }

    // Sauvegarde l'état actuel dans l'undoStack
    const currentContent = getCurrentEditorContent();
    undoStack.push(currentContent);

    // Limite la taille
    if (undoStack.length > MAX_HISTORY_SIZE) {
        undoStack.shift();
    }

    // Récupère le dernier état depuis le redoStack
    const nextContent = redoStack.pop();

    // Restaure cet état
    setEditorContent(nextContent);

    // Met à jour lastSavedContent et réinitialise hasUnsavedChanges
    lastSavedContent = nextContent;
    hasUnsavedChanges = false;

    // Met à jour les boutons
    updateHistoryButtons();

    showFeedbackMessage(getTranslation('feedback_redo'), 2000, shortcutsContainerElement);

    // Désactive le flag après un court délai
    setTimeout(() => {
        isUndoRedoInProgress = false;
    }, 100);
}

/**
 * Met à jour l'état des boutons Undo/Redo (activés/désactivés).
 */
function updateHistoryButtons() {
    const undoButton = document.getElementById('gft-undo-button');
    const redoButton = document.getElementById('gft-redo-button');

    if (undoButton) {
        if (undoStack.length === 0) {
            undoButton.disabled = true;
            undoButton.style.opacity = '0.5';
            undoButton.style.cursor = 'not-allowed';
        } else {
            undoButton.disabled = false;
            undoButton.style.opacity = '1';
            undoButton.style.cursor = 'pointer';
        }
    }

    if (redoButton) {
        if (redoStack.length === 0) {
            redoButton.disabled = true;
            redoButton.style.opacity = '0.5';
            redoButton.style.cursor = 'not-allowed';
        } else {
            redoButton.disabled = false;
            redoButton.style.opacity = '1';
            redoButton.style.cursor = 'pointer';
        }
    }
}

// ----- Barre de Progression -----

/**
 * Crée l'élément de la barre de progression.
 * @returns {HTMLElement} L'élément conteneur de la barre de progression.
 */
function createProgressBar() {
    const progressContainer = document.createElement('div');
    progressContainer.id = 'gft-progress-container';
    progressContainer.className = 'gft-progress-container';

    const progressBar = document.createElement('div');
    progressBar.id = 'gft-progress-bar';
    progressBar.className = 'gft-progress-bar';

    const progressText = document.createElement('div');
    progressText.id = 'gft-progress-text';
    progressText.className = 'gft-progress-text';
    progressText.textContent = 'Préparation...';

    progressContainer.appendChild(progressBar);
    progressContainer.appendChild(progressText);

    return progressContainer;
}

/**
 * Affiche la barre de progression.
 * @param {number} step - L'étape actuelle (1-5).
 * @param {number} total - Le nombre total d'étapes.
 * @param {string} message - Le message à afficher.
 */
function showProgress(step, total, message) {
    let progressContainer = document.getElementById('gft-progress-container');

    // Crée le conteneur s'il n'existe pas
    if (!progressContainer && shortcutsContainerElement) {
        progressContainer = createProgressBar();

        // Insère après le titre ou au début du panneau
        const feedbackMsg = document.getElementById(FEEDBACK_MESSAGE_ID);
        if (feedbackMsg) {
            shortcutsContainerElement.insertBefore(progressContainer, feedbackMsg.nextSibling);
        } else {
            const panelTitle = document.getElementById('gftPanelTitle');
            if (panelTitle) {
                shortcutsContainerElement.insertBefore(progressContainer, panelTitle.nextSibling);
            } else {
                shortcutsContainerElement.insertBefore(progressContainer, shortcutsContainerElement.firstChild);
            }
        }
    }

    if (!progressContainer) return;

    // Affiche le conteneur
    progressContainer.style.display = 'block';

    const progressBar = document.getElementById('gft-progress-bar');
    const progressText = document.getElementById('gft-progress-text');

    // Calcule le pourcentage
    const percentage = Math.round((step / total) * 100);

    // Met à jour la barre
    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
    }

    // Met à jour le texte
    if (progressText) {
        progressText.textContent = `${message} (${step}/${total})`;
    }
}

/**
 * Cache la barre de progression.
 */
function hideProgress() {
    const progressContainer = document.getElementById('gft-progress-container');
    if (progressContainer) {
        progressContainer.style.display = 'none';
    }
}

// ----- Prévisualisation et Mode Validation -----

/**
 * Calcule les différences entre deux chaînes (suppressions et ajouts).
 * @param {string} original - Le texte de base.
 * @param {string} modified - Le texte modifié.
 * @returns {Array} Un tableau d'objets { type: 'common' | 'removed' | 'added', value: string }.
 */
function computeDiff(original, modified) {
    const m = original.length;
    const n = modified.length;
    // Matrice DP optimisée (on pourrait utiliser Myers mais LCS suffira pour ce cas d'usage)
    // Attention : pour de longs textes, une matrice complète peut être lourde en mémoire.
    // On garde l'algo LCS existant mais on l'utilise pour reconstruire les chunks.
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (original[i - 1] === modified[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    const chunks = [];
    let i = m, j = n;
    let currentCommon = '';
    let currentAdded = '';
    let currentRemoved = '';

    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && original[i - 1] === modified[j - 1]) {
            // Match (Common)
            if (currentAdded) { chunks.unshift({ type: 'added', value: currentAdded }); currentAdded = ''; }
            if (currentRemoved) { chunks.unshift({ type: 'removed', value: currentRemoved }); currentRemoved = ''; }
            currentCommon = original[i - 1] + currentCommon;
            i--; j--;
        } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
            // Addition (in modified but not original)
            if (currentCommon) { chunks.unshift({ type: 'common', value: currentCommon }); currentCommon = ''; }
            if (currentRemoved) { chunks.unshift({ type: 'removed', value: currentRemoved }); currentRemoved = ''; }
            currentAdded = modified[j - 1] + currentAdded;
            j--;
        } else {
            // Deletion (in original but not modified)
            if (currentCommon) { chunks.unshift({ type: 'common', value: currentCommon }); currentCommon = ''; }
            if (currentAdded) { chunks.unshift({ type: 'added', value: currentAdded }); currentAdded = ''; }
            currentRemoved = original[i - 1] + currentRemoved;
            i--;
        }
    }
    // Flush remainders
    if (currentCommon) chunks.unshift({ type: 'common', value: currentCommon });
    if (currentAdded) chunks.unshift({ type: 'added', value: currentAdded });
    if (currentRemoved) chunks.unshift({ type: 'removed', value: currentRemoved });

    return chunks;
}

/**
 * Génère le HTML pour visualiser les différences (Unified Diff).
 * @param {string} originalText - Le texte original.
 * @param {string} correctedText - Le texte corrigé.
 * @returns {string} Le HTML avec les suppressions en rouge et ajouts en vert.
 */
function highlightDifferences(originalText, correctedText) {
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    const diffChunks = computeDiff(originalText, correctedText);
    let html = '';

    diffChunks.forEach(chunk => {
        let escapedValue = escapeHtml(chunk.value);
        // Visualiser les sauts de ligne explicitement
        escapedValue = escapedValue.replace(/\n/g, '<span style="opacity: 0.5; font-size: 0.8em;">↵</span>\n');

        if (chunk.type === 'removed') {
            html += `<span style="background-color: #ffcccc; color: #cc0000; text-decoration: line-through; border-radius: 2px;">${escapedValue}</span>`;
        } else if (chunk.type === 'added') {
            html += `<span style="background-color: #ccffcc; color: #006600; font-weight: bold; border-radius: 2px;">${escapedValue}</span>`;
        } else {
            html += escapedValue;
        }
    });

    return html;
}

/**
 * Crée le modal de prévisualisation des corrections avec options.
 * @param {string} originalText - Le texte original.
 * @param {string} correctedText - Le texte corrigé initialement.
 * @param {object} initialCorrections - Les détails des corrections initiales.
 * @param {Function} onApply - Callback appelée si l'utilisateur applique, avec (finalText, activeCorrections).
 * @param {Function} onCancel - Callback appelée si l'utilisateur annule.
 */
function showCorrectionPreview(originalText, correctedText, initialCorrections, onApply, onCancel) {
    let currentPreviewText = correctedText;
    let currentStats = initialCorrections;

    // État des options (tout activé par défaut)
    const options = {
        yPrime: true,
        apostrophes: true,
        oeuLigature: true,
        frenchQuotes: true,
        longDash: true,
        doubleSpaces: true,
        spacing: true
    };

    // Crée l'overlay
    const overlay = document.createElement('div');
    overlay.id = 'gft-preview-overlay';
    overlay.className = 'gft-preview-overlay';

    // Crée le modal
    const modal = document.createElement('div');
    modal.id = 'gft-preview-modal';
    modal.className = 'gft-preview-modal';

    const isDarkMode = localStorage.getItem(DARK_MODE_STORAGE_KEY) === 'true';
    if (isDarkMode) modal.classList.add(DARK_MODE_CLASS);

    // Header : Titre + Checkboxes
    const header = document.createElement('div');
    header.style.marginBottom = '15px';

    const title = document.createElement('h2');
    title.textContent = getTranslation('preview_title');
    title.className = 'gft-preview-title';
    header.appendChild(title);

    // Conteneur des options
    const optionsContainer = document.createElement('div');
    optionsContainer.style.display = 'grid';
    optionsContainer.style.gridTemplateColumns = 'repeat(auto-fit, minmax(180px, 1fr))';
    optionsContainer.style.gap = '8px';
    optionsContainer.style.padding = '10px';
    optionsContainer.style.background = isDarkMode ? 'rgba(255,255,255,0.05)' : '#f0f0f0';
    optionsContainer.style.borderRadius = '5px';
    optionsContainer.style.marginBottom = '10px';

    const createOption = (key, label) => {
        const labelEl = document.createElement('label');
        labelEl.style.display = 'flex';
        labelEl.style.alignItems = 'center';
        labelEl.style.fontSize = '12px';
        labelEl.style.cursor = 'pointer';
        if (isDarkMode) labelEl.style.color = '#ddd';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = options[key];
        checkbox.style.marginRight = '6px';

        checkbox.addEventListener('change', () => {
            options[key] = checkbox.checked;
            updatePreview();
        });

        labelEl.appendChild(checkbox);
        labelEl.appendChild(document.createTextNode(label));
        return labelEl;
    };

    optionsContainer.appendChild(createOption('yPrime', getTranslation('preview_opt_yprime')));
    optionsContainer.appendChild(createOption('apostrophes', getTranslation('preview_opt_apostrophes')));
    optionsContainer.appendChild(createOption('oeuLigature', getTranslation('preview_opt_oeu')));
    optionsContainer.appendChild(createOption('frenchQuotes', getTranslation('preview_opt_quotes')));
    optionsContainer.appendChild(createOption('longDash', getTranslation('preview_opt_dash')));
    optionsContainer.appendChild(createOption('doubleSpaces', getTranslation('preview_opt_spaces')));
    optionsContainer.appendChild(createOption('spacing', getTranslation('preview_opt_spacing')));

    header.appendChild(optionsContainer);
    modal.appendChild(header);

    // Résumé (Dynamique)
    const summary = document.createElement('div');
    summary.className = 'gft-preview-summary';
    modal.appendChild(summary);

    // Titre de la section de diff
    const diffTitle = document.createElement('h3');
    diffTitle.textContent = getTranslation('preview_diff_title');
    diffTitle.style.fontSize = '14px';
    diffTitle.style.marginBottom = '5px';
    diffTitle.style.color = isDarkMode ? '#aaa' : '#555';
    modal.appendChild(diffTitle);

    // Conteneur de diff (Vue unifiée)
    const diffContainer = document.createElement('div');
    diffContainer.className = 'gft-preview-content';
    diffContainer.id = 'gft-preview-diff';
    diffContainer.style.flex = '1';
    diffContainer.style.overflowY = 'auto';
    diffContainer.style.whiteSpace = 'pre-wrap';
    diffContainer.style.border = '1px solid #ccc';
    if (isDarkMode) diffContainer.style.borderColor = '#444';
    modal.appendChild(diffContainer);

    // Boutons
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'gft-preview-buttons';

    const cancelButton = document.createElement('button');
    cancelButton.textContent = getTranslation('preview_btn_cancel');
    cancelButton.className = 'gft-preview-button gft-preview-button-cancel';
    cancelButton.addEventListener('click', () => close());
    buttonContainer.appendChild(cancelButton);

    const applyButton = document.createElement('button');
    applyButton.textContent = getTranslation('preview_btn_apply');
    applyButton.className = 'gft-preview-button gft-preview-button-apply';
    applyButton.addEventListener('click', () => {
        close();
        if (onApply) onApply(currentPreviewText, currentStats);
    });
    buttonContainer.appendChild(applyButton);

    modal.appendChild(buttonContainer);
    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    function close() {
        document.body.removeChild(overlay);
        document.body.removeChild(modal);
        if (onCancel && !currentPreviewText) onCancel(); // Si onCancel est appelé explicitement (mais ici on gère le flux via apply)
    }

    function updatePreview() {
        // Recalculer le texte corrigé
        const result = applyAllTextCorrectionsToString(originalText, options);
        currentPreviewText = result.newText;
        currentStats = result.corrections;

        const lang = localStorage.getItem('gftLanguage') || 'fr';
        // Mise à jour du résumé
        const detailsArray = [];
        if (options.yPrime && currentStats.yPrime > 0) detailsArray.push(`${currentStats.yPrime} "y'"`);
        if (options.apostrophes && currentStats.apostrophes > 0) detailsArray.push(`${currentStats.apostrophes} ${getTranslation('preview_stat_apostrophes', currentStats.apostrophes)}`);
        if (options.oeuLigature && currentStats.oeuLigature > 0) detailsArray.push(`${currentStats.oeuLigature} "oeu"`);
        if (options.frenchQuotes && currentStats.frenchQuotes > 0) detailsArray.push(`${currentStats.frenchQuotes} ${getTranslation('preview_stat_quotes', currentStats.frenchQuotes)}`);
        if (options.longDash && currentStats.longDash > 0) detailsArray.push(`${currentStats.longDash} ${getTranslation('preview_stat_dash', currentStats.longDash)}`);
        if (options.doubleSpaces && currentStats.doubleSpaces > 0) detailsArray.push(`${currentStats.doubleSpaces} ${getTranslation('preview_stat_spaces', currentStats.doubleSpaces)}`);
        if (options.spacing && currentStats.spacing > 0) detailsArray.push(`${currentStats.spacing} ${getTranslation('preview_stat_spacing', currentStats.spacing)}`);

        const total = result.correctionsCount;
        const summaryTemplate = getTranslation('preview_summary', total).replace('{count}', total);
        summary.innerHTML = `<strong>${summaryTemplate}</strong><br>${detailsArray.length > 0 ? formatListWithConjunction(detailsArray, lang) : getTranslation('preview_no_corrections')}`;

        // Mise à jour du diff
        diffContainer.innerHTML = highlightDifferences(originalText, currentPreviewText);
    }

    // Initial render
    updatePreview();

    overlay.addEventListener('click', close);
}

// ----- Tutoriel et Tooltips -----

/**
 * Vérifie si c'est le premier lancement de l'extension.
 * @returns {boolean} True si c'est la première fois.
 */
function isFirstLaunch() {
    return localStorage.getItem('gft-tutorial-completed') !== 'true';
}

/**
 * Marque le tutoriel comme complété.
 */
function markTutorialCompleted() {
    localStorage.setItem('gft-tutorial-completed', 'true');
}

/**
 * Vérifie si les tooltips sont activés.
 * @returns {boolean} True si les tooltips sont activés.
 */
function areTooltipsEnabled() {
    const setting = localStorage.getItem('gft-tooltips-enabled');
    return setting === null || setting === 'true'; // Activé par défaut
}

/**
 * Active ou désactive les tooltips.
 * @param {boolean} enabled - True pour activer, false pour désactiver.
 */
function setTooltipsEnabled(enabled) {
    localStorage.setItem('gft-tooltips-enabled', enabled.toString());
}

/**
 * Vérifie si l'inclusion des feat dans l'en-tête est activée.
 * @returns {boolean} true si activé, false sinon. Par défaut true.
 */
function isHeaderFeatEnabled() {
    const setting = localStorage.getItem(HEADER_FEAT_STORAGE_KEY);
    return setting === null ? true : setting === 'true';
}

/**
 * Active ou désactive l'inclusion des feat dans l'en-tête.
 * @param {boolean} enabled - true pour inclure, false pour exclure.
 */
function setHeaderFeatEnabled(enabled) {
    localStorage.setItem(HEADER_FEAT_STORAGE_KEY, enabled.toString());
}

let currentTutorialStep = 0;
let tutorialOverlay = null;
let tutorialModal = null;

/**
 * Retourne les étapes du tutoriel, potentiellement localisées.
 * Incorpore l'étape de sélection de langue au début.
 */
function getTutorialSteps() {
    return [
        {
            title: "", // Hiding default title to use custom stylish header
            content: (() => {
                // Default to Light Mode stylings for initial launch if not set, or check system preference?
                // Actually, initial launch is likely Light Mode default unless we detect OS preference.
                // Let's check storage, default to false.
                const isDark = localStorage.getItem(DARK_MODE_STORAGE_KEY) === 'true';
                const btnBg = isDark ? '#333' : '#f9f9f9';
                const btnColor = isDark ? 'white' : '#333';
                const btnBorder = isDark ? '#555' : '#ccc';

                return `
                <div style="display: flex; flex-direction: column; align-items: center; gap: 15px; margin-bottom: 25px;">
                    <img src="${chrome.runtime.getURL('images/icon128.png')}" style="width: 80px; height: 80px;">
                    <div style="background: ${btnBg}; border: 1px solid ${btnBorder}; border-radius: 16px; padding: 15px 20px; display: inline-block; box-shadow: 0 4px 10px rgba(0,0,0,0.1); text-align: center;">
                        <h2 style="font-size: 22px; font-weight: 900; margin: 0; background: linear-gradient(135deg, #FFD700, #FFA500); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -0.5px; line-height: 1.2;">Genius Fast Transcriber</h2>
                        <h3 style="font-size: 14px; margin: 5px 0 0 0; opacity: 0.9; font-weight: 600; color: ${btnColor}; text-transform: uppercase; letter-spacing: 1px;">+ Lyric Card Maker</h3>
                    </div>
                </div>
                
                <p style="text-align:center; font-size:15px; margin-bottom: 25px; color: ${btnColor};">
                    <strong>Welcome! / Bienvenue ! / Witaj!</strong><br>
                    <span style="opacity: 0.7; font-size: 13px;">Please select your language to start.<br>Veuillez choisir votre langue pour commencer.<br>Wybierz język, aby rozpocząć.</span>
                </p>

                <div style="display: flex; gap: 15px; justify-content: center; margin-top: 20px; flex-wrap: wrap;">
                    <button id="gft-lang-fr-btn" class="gft-tutorial-button" style="background:${btnBg}; color:${btnColor}; border:2px solid ${btnBorder}; padding:12px 20px; cursor:pointer; border-radius:8px; font-size:15px; transition:0.2s; min-width: 120px;">
                        🇫🇷 Français (FR)
                    </button>
                    <button id="gft-lang-en-btn" class="gft-tutorial-button" style="background:${btnBg}; color:${btnColor}; border:2px solid ${btnBorder}; padding:12px 20px; cursor:pointer; border-radius:8px; font-size:15px; transition:0.2s; min-width: 120px;">
                        🇬🇧 English (EN)
                    </button>
                    <button id="gft-lang-pl-btn" class="gft-tutorial-button" style="background:${btnBg}; color:${btnColor}; border:2px solid ${btnBorder}; padding:12px 20px; cursor:pointer; border-radius:8px; font-size:15px; transition:0.2s; min-width: 120px;">
                        🇵🇱 Polski (PL)
                    </button>
                </div>
            `;
            })()
        },
        {
            title: getTranslation('theme_select_title'),
            content: `
                <div style="display: flex; gap: 10px; flex-direction: column; margin-top: 20px;">
                    <button id="gft-theme-light-btn" class="gft-tutorial-button" style="background:#f0f0f0; color:#333; border:2px solid #ccc; padding:15px; cursor:pointer; border-radius:8px; font-size:16px; font-weight:bold; transition:0.2s; display:flex; justify-content:space-between; align-items:center;">
                        ${getTranslation('theme_light_btn')}
                    </button>
                    <button id="gft-theme-dark-btn" class="gft-tutorial-button" style="background:#222; color:white; border:2px solid #444; padding:15px; cursor:pointer; border-radius:8px; font-size:16px; font-weight:bold; transition:0.2s; display:flex; justify-content:space-between; align-items:center;">
                        ${getTranslation('theme_dark_btn')}
                    </button>
                </div>
            `
        },
        {
            title: `${getTranslation('onboarding_title')}! Choose your mode ⚙️`,
            content: (() => {
                const isDark = localStorage.getItem(DARK_MODE_STORAGE_KEY) === 'true';
                const btnBg = isDark ? '#333' : '#f9f9f9';
                const btnColor = isDark ? 'white' : '#333';
                const btnBorder = isDark ? '#555' : '#ccc';

                return `
                <p>${getTranslation('onboarding_intro')}</p>
                <div style="display: flex; gap: 10px; flex-direction: column; margin-top: 15px;">
                    <button id="gft-mode-full-btn" class="gft-tutorial-button" style="background:${btnBg}; color:${btnColor}; border:2px solid ${btnBorder}; padding:15px 15px 15px 15px; text-align:left; cursor:pointer; border-radius:8px; position:relative; overflow:hidden;">
                        <span style="position:absolute; top:0; right:0; background:#f9ff55; color:black; font-size:10px; padding:2px 8px; font-weight:bold; border-bottom-left-radius:8px;">${getTranslation('recommended_label')}</span>
                        <div style="display:flex; justify-content:space-between; align-items:center; width:100%; margin-top: 8px;">
                            <div style="font-weight:bold; font-size:14px;">${getTranslation('mode_full_title')}</div>
                            <div style="font-size:18px; line-height: 1;">⚡</div>
                        </div>
                        <div style="font-size:11px; opacity:0.8; margin-top:6px; padding-right:5px;">${getTranslation('mode_full_desc')}</div>
                    </button>
                    <button id="gft-mode-simple-btn" class="gft-tutorial-button" style="background:${btnBg}; color:${btnColor}; border:2px solid ${btnBorder}; padding:15px; text-align:left; cursor:pointer; border-radius:8px;">
                         <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                            <div style="font-weight:bold; font-size:14px;">${getTranslation('mode_lyric_title')}</div>
                            <div style="font-size:18px; line-height: 1;">🎨</div>
                        </div>
                        <div style="font-size:11px; opacity:0.8; margin-top:4px;">${getTranslation('mode_lyric_desc')}</div>
                    </button>
                </div>
            `;
            })()
        },
        {
            title: getTranslation('tuto_step1_title'),
            content: getTranslation('tuto_step1_content')
        },
        {
            title: getTranslation('tuto_step2_title'),
            content: getTranslation('tuto_step2_content')
        },
        {
            title: getTranslation('tuto_step3_title'),
            content: getTranslation('tuto_step3_content')
        },
        {
            title: getTranslation('tuto_step4_title'),
            content: getTranslation('tuto_step4_content')
        },
        {
            title: getTranslation('tuto_step5_title'),
            content: getTranslation('tuto_step5_content')
        },
        {
            title: getTranslation('tuto_step6_title'),
            content: getTranslation('tuto_step6_content')
        },
        {
            title: getTranslation('tuto_finish_title'),
            content: getTranslation('tuto_finish_content')
        }
    ];
}

/**
 * Affiche le tutoriel guidé.
 */
function showTutorial() {
    currentTutorialStep = 0;

    // Crée l'overlay
    tutorialOverlay = document.createElement('div');
    tutorialOverlay.id = 'gft-tutorial-overlay';
    tutorialOverlay.className = 'gft-tutorial-overlay';

    // Crée le modal
    tutorialModal = document.createElement('div');
    tutorialModal.id = 'gft-tutorial-modal';
    tutorialModal.className = 'gft-tutorial-modal';

    // Applique le mode sombre si nécessaire
    const isDarkMode = localStorage.getItem(DARK_MODE_STORAGE_KEY) === 'true';
    if (isDarkMode) {
        tutorialModal.classList.add(DARK_MODE_CLASS);
    }

    document.body.appendChild(tutorialOverlay);
    document.body.appendChild(tutorialModal);

    renderTutorialStep();
}

/**
 * Affiche une étape spécifique du tutoriel.
 */
/**
 * Affiche une étape spécifique du tutoriel.
 */
function renderTutorialStep() {
    if (!tutorialModal) return;

    // Récupère les étapes dynamiques (potentiellement traduites)
    const steps = getTutorialSteps();
    const step = steps[currentTutorialStep];

    tutorialModal.innerHTML = '';

    // Titre
    const title = document.createElement('h2');
    title.className = 'gft-tutorial-title';
    title.innerHTML = step.title; // innerHTML pour autoriser les emojis/HTML
    tutorialModal.appendChild(title);

    // Contenu
    const content = document.createElement('div');
    content.className = 'gft-tutorial-content';
    content.innerHTML = step.content;
    tutorialModal.appendChild(content);

    // Indicateur de progression
    const progress = document.createElement('div');
    progress.className = 'gft-tutorial-progress';
    progress.textContent = `${getTranslation('tuto_step_counter')} ${currentTutorialStep + 1} ${getTranslation('tuto_of')} ${steps.length}`;
    tutorialModal.appendChild(progress);

    // Boutons
    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'gft-tutorial-buttons';

    // Bouton "Passer" (Sauf étape 0, 1 et 2 qui sont obligatoires pour config)
    if (currentTutorialStep > 2) {
        const skipButton = document.createElement('button');
        skipButton.textContent = getTranslation('tuto_skip');
        skipButton.className = 'gft-tutorial-button gft-tutorial-button-skip';
        skipButton.addEventListener('click', closeTutorial);
        buttonsDiv.appendChild(skipButton);
    }

    // Bouton "Précédent" (sauf étapes critiques 0, 1 et 2)
    if (currentTutorialStep > 2) {
        const prevButton = document.createElement('button');
        prevButton.textContent = `← ${getTranslation('tuto_prev')}`;
        prevButton.className = 'gft-tutorial-button gft-tutorial-button-prev';
        prevButton.addEventListener('click', () => {
            currentTutorialStep--;
            renderTutorialStep();
        });
        buttonsDiv.appendChild(prevButton);
    }

    // Bouton "Suivant" ou "Terminer"
    // On cache le bouton "Suivant" pour les étapes interactives (0, 1 et 2)
    if (currentTutorialStep > 2) {
        const nextButton = document.createElement('button');
        nextButton.className = 'gft-tutorial-button gft-tutorial-button-next';

        if (currentTutorialStep < steps.length - 1) {
            nextButton.textContent = `${getTranslation('tuto_next')} →`;
            nextButton.addEventListener('click', () => {
                currentTutorialStep++;
                renderTutorialStep();
            });
        } else {
            nextButton.textContent = `${getTranslation('tuto_finish')} ✓`;
            nextButton.addEventListener('click', closeTutorial);
        }
        buttonsDiv.appendChild(nextButton);
    }

    tutorialModal.appendChild(buttonsDiv);

    // --- LOGIQUE INTERACTIVE POUR LES ÉTAPES DE CONFIG ---

    // ÉTAPE 0 : CHOIX DE LA LANGUE
    if (currentTutorialStep === 0) {
        const btnFr = document.getElementById('gft-lang-fr-btn');
        const btnEn = document.getElementById('gft-lang-en-btn');
        const btnPl = document.getElementById('gft-lang-pl-btn');

        const handleLangSelection = (lang) => {
            localStorage.setItem('gftLanguage', lang);
            // Définit également le mode de transcription selon la langue
            setTranscriptionMode(lang);
            // Rafraîchit l'étape suivante pour appliquer la langue
            currentTutorialStep++;
            renderTutorialStep();
        }

        if (btnFr) btnFr.onclick = () => handleLangSelection('fr');
        if (btnEn) btnEn.onclick = () => handleLangSelection('en');
        if (btnPl) btnPl.onclick = () => handleLangSelection('pl');

        // Cache les boutons de navigation standard
        buttonsDiv.style.display = 'none';
    }

    // ÉTAPE 1 : CHOIX DU THÈME (NOUVEAU)
    else if (currentTutorialStep === 1) {
        const lightBtn = document.getElementById('gft-theme-light-btn');
        const darkBtn = document.getElementById('gft-theme-dark-btn');

        const toggleTheme = (isDark) => {
            if (isDark) {
                document.body.classList.add(DARK_MODE_CLASS);
                localStorage.setItem(DARK_MODE_STORAGE_KEY, 'true');
            } else {
                document.body.classList.remove(DARK_MODE_CLASS);
                localStorage.setItem(DARK_MODE_STORAGE_KEY, 'false');
            }
            // Mettre à jour les variables globales si nécessaire ou les éléments UI
            // Reset tutorial modal classes to reflect change instantly
            const modal = document.getElementById('gft-tutorial-modal');
            if (modal) {
                if (isDark) modal.classList.add(DARK_MODE_CLASS);
                else modal.classList.remove(DARK_MODE_CLASS);
            }
            currentTutorialStep++;
            renderTutorialStep();
        };

        if (lightBtn) lightBtn.onclick = () => toggleTheme(false);
        if (darkBtn) darkBtn.onclick = () => toggleTheme(true);

        buttonsDiv.style.display = 'none';
    }

    // ÉTAPE 2 : CHOIX DU MODE (DÉCALÉ)
    else if (currentTutorialStep === 2) {
        const fullBtn = document.getElementById('gft-mode-full-btn');
        const simpleBtn = document.getElementById('gft-mode-simple-btn');

        if (fullBtn) {
            fullBtn.onclick = () => {
                setLyricCardOnlyMode(false);
                currentTutorialStep++;
                renderTutorialStep();
            };
        }
        if (simpleBtn) {
            simpleBtn.onclick = () => {
                setLyricCardOnlyMode(true);
                localStorage.setItem('gft-tutorial-completed', 'true');
                // Affiche l'étape explicative pour le mode Lyric Card
                renderLyricModeTutorialEnd();
            };
        }
        buttonsDiv.style.display = 'none';
    }
}

/**
 * Affiche l'écran de fin spécifique au mode Lyric Card Only.
 */
function renderLyricModeTutorialEnd() {
    if (!tutorialModal) return;
    tutorialModal.innerHTML = '';

    // Titre
    const title = document.createElement('h2');
    title.className = 'gft-tutorial-title';
    title.innerHTML = getTranslation('tuto_lyric_mode_title');
    tutorialModal.appendChild(title);

    // Contenu
    const content = document.createElement('div');
    content.className = 'gft-tutorial-content';
    content.innerHTML = getTranslation('tuto_lyric_mode_content');
    tutorialModal.appendChild(content);

    // Bouton de fin
    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'gft-tutorial-buttons';

    const finishBtn = document.createElement('button');
    finishBtn.className = 'gft-tutorial-button gft-tutorial-button-next'; // Style primaire
    finishBtn.textContent = getTranslation('tuto_lyric_mode_btn');
    finishBtn.onclick = () => {
        closeTutorial();
        window.location.reload();
    };

    buttonsDiv.appendChild(finishBtn);
    tutorialModal.appendChild(buttonsDiv);
}

/**
 * Ferme le tutoriel.
 */
function closeTutorial() {
    if (tutorialOverlay && document.body.contains(tutorialOverlay)) {
        document.body.removeChild(tutorialOverlay);
    }
    if (tutorialModal && document.body.contains(tutorialModal)) {
        document.body.removeChild(tutorialModal);
    }

    tutorialOverlay = null;
    tutorialModal = null;

    // Marque comme complété
    markTutorialCompleted();
}

/**
 * Ajoute un tooltip à un élément.
 * @param {HTMLElement} element - L'élément auquel ajouter le tooltip.
 * @param {string} text - Le texte du tooltip.
 */
function addTooltip(element, text) {
    if (!element) return;

    let tooltip = null;

    element.addEventListener('mouseenter', () => {
        // Vérifie si les tooltips sont activés à chaque survol
        if (!areTooltipsEnabled()) return;

        tooltip = document.createElement('div');
        tooltip.className = 'gft-tooltip';
        tooltip.textContent = text;

        // Applique le mode sombre si nécessaire
        const isDarkMode = localStorage.getItem(DARK_MODE_STORAGE_KEY) === 'true';
        if (isDarkMode) {
            tooltip.classList.add(DARK_MODE_CLASS);
        }

        document.body.appendChild(tooltip);

        // Positionne le tooltip
        const rect = element.getBoundingClientRect();
        tooltip.style.position = 'fixed';
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.top = `${rect.top - 35}px`;
        tooltip.style.transform = 'translateX(-50%)';

        // Animation d'apparition
        setTimeout(() => {
            if (tooltip) tooltip.classList.add('gft-tooltip-visible');
        }, 10);
    });

    element.addEventListener('mouseleave', () => {
        if (tooltip && document.body.contains(tooltip)) {
            document.body.removeChild(tooltip);
        }
        tooltip = null;
    });
}

/**
 * Affiche le menu de paramètres.
 */
function showSettingsMenu() {
    // Crée un simple menu avec les options
    const menu = document.createElement('div');
    menu.className = 'gft-settings-menu';
    menu.id = 'gft-settings-menu';

    // Applique le mode sombre si nécessaire
    const isDarkMode = localStorage.getItem(DARK_MODE_STORAGE_KEY) === 'true';
    if (isDarkMode) {
        menu.classList.add(DARK_MODE_CLASS);
    }

    // Option 1: Relancer le tutoriel
    const tutorialOption = document.createElement('button');
    tutorialOption.className = 'gft-settings-menu-item';
    tutorialOption.textContent = '🎓 Relancer le tutoriel';
    tutorialOption.addEventListener('click', () => {
        closeSettingsMenu();
        showTutorial();
    });
    menu.appendChild(tutorialOption);

    // Option 2: Toggle tooltips
    const tooltipsOption = document.createElement('button');
    tooltipsOption.className = 'gft-settings-menu-item';
    const tooltipsEnabled = areTooltipsEnabled();
    tooltipsOption.textContent = tooltipsEnabled ? '💬 Désactiver les tooltips' : '💬 Activer les tooltips';
    tooltipsOption.addEventListener('click', () => {
        // Réévalue l'état actuel au moment du clic
        const currentState = areTooltipsEnabled();
        setTooltipsEnabled(!currentState);
        closeSettingsMenu();
        showFeedbackMessage(
            currentState ? 'Tooltips désactivés' : 'Tooltips activés',
            2000,
            shortcutsContainerElement
        );
    });
    menu.appendChild(tooltipsOption);

    // Option 3: Toggle feat dans l'en-tête
    const headerFeatOption = document.createElement('button');
    headerFeatOption.className = 'gft-settings-menu-item';
    const headerFeatEnabled = isHeaderFeatEnabled();
    headerFeatOption.textContent = headerFeatEnabled ? '🎤 Masquer feat dans l\'en-tête' : '🎤 Afficher feat dans l\'en-tête';
    headerFeatOption.addEventListener('click', () => {
        // Réévalue l'état actuel au moment du clic
        const currentState = isHeaderFeatEnabled();
        setHeaderFeatEnabled(!currentState);
        closeSettingsMenu();
        showFeedbackMessage(
            currentState ? 'Feat masqués dans l\'en-tête' : 'Feat affichés dans l\'en-tête',
            2000,
            shortcutsContainerElement
        );
    });
    menu.appendChild(headerFeatOption);

    // Option 4: Toggle saut de ligne après tags
    const tagNewlinesOption = document.createElement('button');
    tagNewlinesOption.className = 'gft-settings-menu-item';
    const tagNewlinesDisabled = isTagNewlinesDisabled();
    tagNewlinesOption.textContent = tagNewlinesDisabled ? '↵ Activer saut de ligne après tags' : '↵ Désactiver saut de ligne après tags';
    tagNewlinesOption.addEventListener('click', () => {
        const currentState = isTagNewlinesDisabled();
        setTagNewlinesDisabled(!currentState);
        closeSettingsMenu();
        showFeedbackMessage(
            !currentState ? 'Saut de ligne après tags DÉSACTIVÉ' : 'Saut de ligne après tags ACTIVÉ',
            2000,
            shortcutsContainerElement
        );
    });
    menu.appendChild(tagNewlinesOption);

    // Positionne le menu
    const settingsButton = document.getElementById('gft-settings-button');
    if (settingsButton) {
        const rect = settingsButton.getBoundingClientRect();
        menu.style.position = 'fixed';
        menu.style.top = `${rect.bottom + 5}px`;
        menu.style.right = `${window.innerWidth - rect.right}px`;
    }

    document.body.appendChild(menu);

    // Fermeture par clic en dehors
    setTimeout(() => {
        document.addEventListener('click', closeSettingsMenuOnClickOutside);
    }, 10);
}

/**
 * Ferme le menu de paramètres.
 */
function closeSettingsMenu() {
    const menu = document.getElementById('gft-settings-menu');
    if (menu && document.body.contains(menu)) {
        document.body.removeChild(menu);
    }
    document.removeEventListener('click', closeSettingsMenuOnClickOutside);
}

/**
 * Ferme le menu si on clique en dehors.
 */
function closeSettingsMenuOnClickOutside(event) {
    const menu = document.getElementById('gft-settings-menu');
    const settingsButton = document.getElementById('gft-settings-button');

    if (menu && !menu.contains(event.target) && event.target !== settingsButton) {
        closeSettingsMenu();
    }
}

// ----- Contrôle Player YouTube -----

// État global du lecteur YouTube
let gftYoutubePlayerState = {
    isPlaying: null, // null = inconnu au départ (pour éviter le double-toggle)
    currentTime: 0,
    timestamp: 0, // Timestamp de la dernière mise à jour du currentTime
    activeIframeSrc: null // Pour tracker quelle iframe est active
};

/**
 * Estime le temps actuel de la vidéo en tenant compte du temps écoulé depuis la dernière mise à jour.
 * @returns {number} Le temps estimé en secondes.
 */
function getEstimatedCurrentTime() {
    if (gftYoutubePlayerState.isPlaying === true && gftYoutubePlayerState.timestamp > 0) {
        // Si la vidéo joue, on ajoute le temps écoulé depuis la dernière mise à jour
        const elapsedMs = Date.now() - gftYoutubePlayerState.timestamp;
        const elapsedSeconds = elapsedMs / 1000;
        return gftYoutubePlayerState.currentTime + elapsedSeconds;
    }
    return gftYoutubePlayerState.currentTime;
}

// Écoute les messages de l'iframe YouTube pour mettre à jour l'état (nécessaire pour toggle et seek)
window.addEventListener('message', (event) => {
    // Filtrage pour traiter les messages YouTube (incluant youtube-nocookie)
    if (event.origin.match(/^https?:\/\/(www\.)?youtube(-nocookie)?\.com$/) || event.origin.match(/^https?:\/\/(www\.)?youtu\.be$/)) {
        try {
            // YouTube envoie parfois des chaînes JSON
            const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

            if (data.event === 'infoDelivery' && data.info) {
                if (data.info.currentTime !== undefined) {
                    gftYoutubePlayerState.currentTime = data.info.currentTime;
                    gftYoutubePlayerState.timestamp = Date.now();
                }
                if (data.info.playerState !== undefined) {
                    // 1 = Playing, 2 = Paused, 3 = Buffering, ...
                    const wasPlaying = gftYoutubePlayerState.isPlaying;
                    gftYoutubePlayerState.isPlaying = data.info.playerState === 1;

                    // Si on passe de playing à pause, on met à jour le timestamp
                    if (wasPlaying === true && gftYoutubePlayerState.isPlaying === false) {
                        gftYoutubePlayerState.timestamp = Date.now();
                    }
                }
            }

            // Réponse à l'événement "onReady" - le player est prêt
            if (data.event === 'onReady') {
                // Demander les mises à jour continues
                startListeningToYoutube();
            }
        } catch (e) {
            // Ignore parse errors
        }
    }
});

/**
 * Demande à YouTube de commencer à envoyer des mises à jour de l'état du player.
 */
function startListeningToYoutube() {
    const iframes = document.querySelectorAll('iframe[src*="youtube.com"], iframe[src*="youtu.be"], iframe[src*="youtube-nocookie.com"]');
    iframes.forEach(iframe => {
        try {
            // Envoie l'événement "listening" pour commencer à recevoir les mises à jour
            iframe.contentWindow.postMessage(JSON.stringify({
                'event': 'listening',
                'id': 1,
                'channel': 'widget'
            }), '*');

            // Demande aussi les infos actuelles
            iframe.contentWindow.postMessage(JSON.stringify({
                'event': 'command',
                'func': 'getVideoData'
            }), '*');
        } catch (e) {
            // Ignore errors
        }
    });
}

/**
 * Active l'API JS sur les iframes YouTube pour permettre le contrôle via postMessage.
 * Doit être appelé quand le DOM change.
 */
function enableYoutubeJsApi() {
    const iframes = document.querySelectorAll('iframe[src*="youtube.com"], iframe[src*="youtu.be"], iframe[src*="youtube-nocookie.com"]');
    iframes.forEach(iframe => {
        try {
            // Vérifie si l'API est déjà activée
            if (iframe.src && !iframe.src.includes('enablejsapi=1')) {
                // Ajoute le paramètre
                const separator = iframe.src.includes('?') ? '&' : '?';
                iframe.src += `${separator}enablejsapi=1`;
                console.log('[GFT] API YouTube activée pour iframe:', iframe.src);
            }
        } catch (e) {
            console.warn('[GFT] Impossible de modifier iframe src (CORS?):', e);
        }
    });

    // Initialise l'écoute après un court délai pour que l'iframe se recharge
    setTimeout(startListeningToYoutube, 1000);
}

/**
 * Trouve le premier lecteur YouTube visible sur la page.
 * @returns {HTMLIFrameElement|null} L'iframe du lecteur ou null.
 */
function findVisibleYoutubePlayer() {
    const iframes = document.querySelectorAll('iframe[src*="youtube.com"], iframe[src*="youtu.be"], iframe[src*="youtube-nocookie.com"]');

    for (const iframe of iframes) {
        // Vérifie si l'iframe est visible
        const rect = iframe.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0 &&
            rect.top < window.innerHeight && rect.bottom > 0;

        if (isVisible) {
            return iframe;
        }
    }

    // Fallback : retourne la première iframe si aucune n'est visible
    return iframes.length > 0 ? iframes[0] : null;
}

/**
 * Contrôle le lecteur YouTube via postMessage.
 * @param {string} command - 'togglePlay', 'rewind', 'forward'
 */
function controlYoutubePlayer(command) {
    // On s'assure d'abord que les iframes ont l'API activée
    enableYoutubeJsApi();

    const playerIframe = findVisibleYoutubePlayer();

    if (!playerIframe) {
        showFeedbackMessage("Lecteur YouTube introuvable.", 2000);
        return;
    }

    // Helper pour envoyer les commandes
    const postCmd = (func, args) => {
        playerIframe.contentWindow.postMessage(JSON.stringify({
            'event': 'command',
            'func': func,
            'args': args || []
        }), '*');
    };

    switch (command) {
        case 'togglePlay':
            if (gftYoutubePlayerState.isPlaying === true) {
                postCmd('pauseVideo');
                gftYoutubePlayerState.isPlaying = false;
                showFeedbackMessage(getTranslation('feedback_pause'), 1000);
            } else if (gftYoutubePlayerState.isPlaying === false) {
                postCmd('playVideo');
                gftYoutubePlayerState.isPlaying = true;
                gftYoutubePlayerState.timestamp = Date.now(); // Reset le timestamp pour l'estimation
                showFeedbackMessage(getTranslation('feedback_play'), 1000);
            } else {
                // État NULL (inconnu) - on privilégie PAUSE car souvent la vidéo joue déjà
                postCmd('pauseVideo');
                gftYoutubePlayerState.isPlaying = false;
                showFeedbackMessage('⏸️ Pause (Sync)', 1000);
            }
            break;

        case 'rewind':
            {
                // Utilise le temps estimé pour tenir compte du temps écoulé
                const estimatedTime = getEstimatedCurrentTime();
                const newTime = Math.max(0, estimatedTime - 5);
                postCmd('seekTo', [newTime, true]);
                // Mise à jour de l'état
                gftYoutubePlayerState.currentTime = newTime;
                gftYoutubePlayerState.timestamp = Date.now();
                showFeedbackMessage(`⏪ -5s (${Math.floor(newTime / 60)}:${String(Math.floor(newTime % 60)).padStart(2, '0')})`, 1000);
            }
            break;

        case 'forward':
            {
                // Utilise le temps estimé pour tenir compte du temps écoulé
                const estimatedTime = getEstimatedCurrentTime();
                const newTime = estimatedTime + 5;
                postCmd('seekTo', [newTime, true]);
                // Mise à jour de l'état
                gftYoutubePlayerState.currentTime = newTime;
                gftYoutubePlayerState.timestamp = Date.now();
                showFeedbackMessage(`⏩ +5s (${Math.floor(newTime / 60)}:${String(Math.floor(newTime % 60)).padStart(2, '0')})`, 1000);
            }
            break;
    }
}

// ----- Raccourcis Clavier -----

/**
 * Configuration des raccourcis clavier.
 * Les clés sont au format "Ctrl+Touche" ou "Ctrl+Shift+Touche".
 */
const KEYBOARD_SHORTCUTS = {
    'Ctrl+1': 'couplet',
    'Ctrl+2': 'refrain',
    'Ctrl+3': 'pont',
    'Ctrl+4': 'intro',
    'Ctrl+5': 'outro',
    'Ctrl+Shift+C': 'toutCorriger',
    'Ctrl+Z': 'undo',
    'Ctrl+Y': 'redo',
    'Ctrl+Shift+Y': 'redo', // Alternative pour redo
    'Ctrl+Shift+S': 'toggleStats',
    'Ctrl+Alt+ ': 'togglePlay', // Espace avec Alt
    'Ctrl+Alt+ARROWLEFT': 'rewind', // Flèche Gauche
    'Ctrl+Alt+ARROWRIGHT': 'forward' // Flèche Droite
};

/**
 * Insère un tag de section dans l'éditeur actif.
 * @param {string} tagType - Le type de tag à insérer.
 */
function insertTagViaShortcut(tagType) {
    if (!currentActiveEditor) return;

    // Active le flag pour désactiver la sauvegarde automatique
    isButtonActionInProgress = true;
    if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = null;
    }

    currentActiveEditor.focus();
    let textToInsert = '';

    switch (tagType) {
        case 'couplet':
            textToInsert = addArtistToText(`[Couplet ${coupletCounter}]`);
            coupletCounter++;
            // Met à jour le bouton
            const coupletButton = document.getElementById(COUPLET_BUTTON_ID);
            if (coupletButton) {
                coupletButton.textContent = `[Couplet ${coupletCounter}]`;
            }
            break;
        case 'refrain':
            textToInsert = addArtistToText('[Refrain]');
            break;
        case 'pont':
            textToInsert = addArtistToText('[Pont]');
            break;
        case 'intro':
            textToInsert = addArtistToText('[Intro]');
            break;
        case 'outro':
            textToInsert = addArtistToText('[Outro]');
            break;
        default:
            isButtonActionInProgress = false;
            return;
    }

    if (textToInsert) {
        // Sauvegarde dans l'historique avant insertion
        saveToHistory();
        document.execCommand('insertText', false, textToInsert);
    }

    // Désactive le flag après un court délai et met à jour lastSavedContent
    setTimeout(() => {
        isButtonActionInProgress = false;
        if (currentActiveEditor) {
            lastSavedContent = getCurrentEditorContent();
            hasUnsavedChanges = false;
        }
    }, 150);
}

/**
 * Déclenche l'action "Tout Corriger" via raccourci clavier.
 */
function triggerToutCorrigerViaShortcut() {
    const toutCorrigerButton = Array.from(document.querySelectorAll('.genius-lyrics-shortcut-button'))
        .find(btn => btn.textContent.includes('Tout Corriger'));

    if (toutCorrigerButton) {
        toutCorrigerButton.click();
    }
}

/**
 * Gestionnaire principal des raccourcis clavier.
 * @param {KeyboardEvent} event - L'événement clavier.
 */
function handleKeyboardShortcut(event) {
    // Ne pas interférer si modifier keys pressed seules (sauf nos combos)

    // Construire la clé du raccourci
    let shortcutKey = '';
    if (event.ctrlKey || event.metaKey) shortcutKey += 'Ctrl+';
    if (event.altKey) shortcutKey += 'Alt+';
    if (event.shiftKey) shortcutKey += 'Shift+';

    // Convertir la touche en majuscule pour la correspondance
    const key = event.key.toUpperCase();
    shortcutKey += key;

    // Vérifier si ce raccourci existe dans notre configuration
    const action = KEYBOARD_SHORTCUTS[shortcutKey];

    if (!action) return; // Pas de raccourci correspondant

    // --- LOGIQUE DE FOCUS ---
    // Pour certaines actions (Media, Stats), on autorise l'exécution même si le focus n'est pas dans l'éditeur.
    // Pour les actions d'édition (Tags, undo...), on exige que l'éditeur soit focus.

    const GLOBAL_ACTIONS = ['togglePlay', 'rewind', 'forward', 'toggleStats'];
    const isGlobalAction = GLOBAL_ACTIONS.includes(action);

    if (isGlobalAction) {
        // Pour les actions globales, on exige au moins que l'éditeur ait été détecté (mode GFT actif)
        // Mais on n'exige PAS document.activeElement === currentActiveEditor
        if (!currentActiveEditor && !document.querySelector(SELECTORS.CONTROLS_STICKY_SECTION)) {
            // Si GFT n'est pas actif du tout, on ne fait rien (pour ne pas casser Ctrl+Shift+Space ailleurs ?)
            // Ctrl+Shift+Space n'est pas standard, donc c'est probablement OK.
            return;
        }
    } else {
        // Actions d'édition strictes
        if (!currentActiveEditor) return;
        if (document.activeElement !== currentActiveEditor) return;
    }

    // Empêcher le comportement par défaut
    event.preventDefault();
    event.stopPropagation();

    // Exécuter l'action correspondante
    switch (action) {
        case 'couplet':
        case 'refrain':
        case 'pont':
        case 'intro':
        case 'outro':
            insertTagViaShortcut(action);
            break;
        case 'toutCorriger':
            triggerToutCorrigerViaShortcut();
            break;
        case 'undo':
            undoLastChange();
            break;
        case 'redo':
            redoLastChange();
            break;
        case 'toggleStats':
            toggleStatsDisplay();
            break;
        case 'togglePlay':
        case 'rewind':
        case 'forward':
            controlYoutubePlayer(action);
            break;
    }
}

/**
 * Calcule la position approximative du curseur dans un textarea.
 * @param {HTMLTextAreaElement} textarea - L'élément textarea.
 * @param {number} selectionPoint - La position du curseur (selectionStart ou selectionEnd).
 * @returns {{top: number, left: number, height: number}} La position calculée (relative au textarea).
 */
function getTextareaCaretPosition(textarea, selectionPoint) {
    // Crée un div miroir pour calculer la position
    const div = document.createElement('div');
    const computed = window.getComputedStyle(textarea);

    // Copie tous les styles pertinents du textarea
    const properties = [
        'boxSizing', 'width', 'height', 'overflowX', 'overflowY',
        'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
        'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
        'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize',
        'fontSizeAdjust', 'lineHeight', 'fontFamily', 'textAlign', 'textTransform',
        'textIndent', 'textDecoration', 'letterSpacing', 'wordSpacing',
        'tabSize', 'whiteSpace', 'wordBreak', 'wordWrap'
    ];

    properties.forEach(prop => {
        div.style[prop] = computed[prop];
    });

    // Style le div pour qu'il soit invisible et positionné absolument
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.whiteSpace = 'pre-wrap';
    div.style.wordWrap = 'break-word';
    div.style.overflow = 'hidden';
    div.style.top = '0px';
    div.style.left = '0px';

    document.body.appendChild(div);

    // Ajoute le texte jusqu'au point de sélection
    const textBeforeCaret = textarea.value.substring(0, selectionPoint);
    div.textContent = textBeforeCaret;

    // Ajoute un span pour marquer la position exacte
    const span = document.createElement('span');
    span.textContent = textarea.value.substring(selectionPoint) || '.';
    div.appendChild(span);

    // Obtient la hauteur du span (hauteur de ligne)
    const spanRect = span.getBoundingClientRect();
    const divRect = div.getBoundingClientRect();

    // Position relative dans le div miroir
    const relativeTop = spanRect.top - divRect.top;
    const relativeLeft = spanRect.left - divRect.left;

    // Nettoie
    document.body.removeChild(div);

    // Retourne la position relative (SANS scrollTop car on va l'utiliser avec getBoundingClientRect)
    return {
        top: relativeTop - textarea.scrollTop,
        left: relativeLeft - textarea.scrollLeft,
        height: spanRect.height
    };
}

/**
 * Affiche la barre d'outils flottante à côté de la sélection de texte.
 */
function showFloatingToolbar() {
    if (!floatingFormattingToolbar) {
        createFloatingFormattingToolbar();
    }

    let rect;
    let selectedText = '';

    if (currentActiveEditor) {
        // Mode Édition
        // Affiche tous les boutons
        Array.from(floatingFormattingToolbar.children).forEach(child => child.style.display = '');

        if (currentEditorType === 'textarea') {
            // Pour les textarea, calcule la position du texte sélectionné
            const textareaRect = currentActiveEditor.getBoundingClientRect();
            const start = currentActiveEditor.selectionStart;
            const end = currentActiveEditor.selectionEnd;

            if (start === end) {
                hideFloatingToolbar();
                return;
            }

            selectedText = currentActiveEditor.value.substring(start, end);

            // Calcule la position du début de la sélection (position relative au textarea)
            const startPos = getTextareaCaretPosition(currentActiveEditor, start);

            // Combine la position du textarea avec la position relative du texte sélectionné
            // textareaRect.top/left sont déjà en coordonnées viewport (pas besoin de window.scrollY ici)
            rect = {
                left: textareaRect.left + startPos.left,
                top: textareaRect.top + startPos.top,
                width: 100, // Largeur arbitraire pour centrer la barre
                height: startPos.height
            };
        } else {
            // Pour les div contenteditable
            const selection = window.getSelection();
            if (!selection.rangeCount || selection.isCollapsed) {
                hideFloatingToolbar();
                return;
            }

            selectedText = selection.toString();

            const range = selection.getRangeAt(0);
            rect = range.getBoundingClientRect();

            if (rect.width === 0 && rect.height === 0) {
                hideFloatingToolbar();
                return;
            }
        }
    } else {
        // Mode Lecture
        // Cache les boutons de formatage (Gras, Italique, Nombre)
        // Affiche seulement le bouton Lyrics Card
        Array.from(floatingFormattingToolbar.children).forEach(child => {
            if (child.classList.contains('gft-lyric-card-btn')) {
                child.style.display = '';
            } else {
                child.style.display = 'none';
            }
        });

        const selection = window.getSelection();
        if (!selection.rangeCount || selection.isCollapsed) {
            hideFloatingToolbar();
            return;
        }
        selectedText = selection.toString();
        const range = selection.getRangeAt(0);
        rect = range.getBoundingClientRect();

        if (rect.width === 0 && rect.height === 0) {
            hideFloatingToolbar();
            return;
        }
    }

    if (!rect) {
        hideFloatingToolbar();
        return;
    }

    // Vérifie si le texte sélectionné est un nombre (et seulement un nombre)
    const isNumber = isValidNumber(selectedText);

    // Trouve le bouton de conversion de nombre
    const numberButton = floatingFormattingToolbar.querySelector('.gft-number-button');
    if (numberButton) {
        if (isNumber && currentActiveEditor) { // Only show number button in edit mode
            numberButton.style.display = 'inline-block';
        } else {
            numberButton.style.display = 'none';
        }
    }

    // Positionne la barre d'outils au-dessus de la sélection
    floatingFormattingToolbar.style.display = 'flex';
    floatingFormattingToolbar.style.visibility = 'visible';
    floatingFormattingToolbar.style.opacity = '1';
    floatingFormattingToolbar.style.position = 'fixed'; // Position fixed pour qu'elle suive le scroll

    // Calcule la position centrale au-dessus de la sélection
    const toolbarWidth = floatingFormattingToolbar.offsetWidth || 150;
    const toolbarHeight = floatingFormattingToolbar.offsetHeight || 40;

    // rect contient déjà les coordonnées viewport (pas besoin d'ajouter window.scrollX/Y)
    const left = rect.left + (rect.width / 2) - (toolbarWidth / 2);
    const top = rect.top - toolbarHeight - 8; // 8px au-dessus de la sélection

    floatingFormattingToolbar.style.left = `${Math.max(10, left)}px`;
    floatingFormattingToolbar.style.top = `${Math.max(10, top)}px`;
}

/**
 * Cache la barre d'outils flottante.
 */
function hideFloatingToolbar() {
    if (floatingFormattingToolbar) {
        floatingFormattingToolbar.style.display = 'none';
    }
}

/**
 * Gestionnaire pour détecter les changements de sélection et afficher/masquer la barre flottante.
 */
function handleSelectionChange() {
    // Si on est dans un éditeur, on garde la logique existante
    if (currentActiveEditor) {
        let hasSelection = false;

        // Pour les textarea, il faut vérifier selectionStart et selectionEnd
        if (currentEditorType === 'textarea') {
            const start = currentActiveEditor.selectionStart;
            const end = currentActiveEditor.selectionEnd;
            hasSelection = (start !== end) && document.activeElement === currentActiveEditor;
        } else {
            // Pour les div contenteditable
            const selection = window.getSelection();

            if (!selection.rangeCount) {
                hideFloatingToolbar();
                return;
            }

            const range = selection.getRangeAt(0);
            const container = range.commonAncestorContainer;

            // Vérifie si le conteneur de la sélection est dans l'éditeur actif
            let isInEditor = false;
            if (currentActiveEditor.contains(container) ||
                (container.nodeType === Node.ELEMENT_NODE && container === currentActiveEditor)) {
                isInEditor = true;
            } else if (container.parentNode && currentActiveEditor.contains(container.parentNode)) {
                isInEditor = true;
            }

            hasSelection = isInEditor && !selection.isCollapsed;
        }

        if (hasSelection) {
            // Check if toolbar has visible buttons
            if (floatingFormattingToolbar) {
                // If Lyric Card Only mode, ensure we have valid content to show
                if (isLyricCardOnlyMode()) {
                    // In lyric card only, we might want to check if the selection is valid text
                    // But the loop above already checks valid containers.
                    // Just show it.
                    setTimeout(showFloatingToolbar, 50);
                } else {
                    setTimeout(showFloatingToolbar, 50);
                }
            } else {
                createFloatingFormattingToolbar();
                setTimeout(showFloatingToolbar, 50);
            }
        } else {
            hideFloatingToolbar();
        }
    } else {
        // Mode lecture (pas d'éditeur actif)
        // On veut afficher la barre seulement si on est sur une page de chanson et qu'on sélectionne du texte
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || selection.toString().trim().length === 0) {
            hideFloatingToolbar();
            return;
        }

        // Vérifie si on est sur une page de chanson (présence de metadata song)
        // Ou simplement si l'URL contient "lyrics" ou si on a trouvé des metadata
        // On peut utiliser currentSongTitle comme proxy, ou vérifier le meta og:type
        const isSongPage = document.querySelector('meta[property="og:type"][content="music.song"]') !== null;

        if (isSongPage) {
            // Vérifie si la sélection est DANS les paroles
            const range = selection.getRangeAt(0);
            const container = range.commonAncestorContainer;
            const lyricsContainer = document.querySelector(SELECTORS.LYRICS_CONTAINER);

            // Si on ne trouve pas le conteneur (ex: ancienne page ou structure différente), on autorise quand même pour ne pas casser la feature
            // Mais si on le trouve, on restreint.
            if (lyricsContainer) {
                if (lyricsContainer.contains(container)) {
                    setTimeout(showFloatingToolbar, 50);
                } else {
                    hideFloatingToolbar();
                }
            } else {
                // Fallback : on vérifie si le parent a une classe qui ressemble à Lyrics
                let parent = container.nodeType === Node.ELEMENT_NODE ? container : container.parentNode;
                let isLyrics = false;
                while (parent && parent !== document.body) {
                    if (parent.className && typeof parent.className === 'string' && parent.className.includes('Lyrics__Container')) {
                        isLyrics = true;
                        break;
                    }
                    parent = parent.parentNode;
                }

                if (isLyrics) {
                    setTimeout(showFloatingToolbar, 50);
                } else {
                    hideFloatingToolbar();
                }
            }
        } else {
            hideFloatingToolbar();
        }
    }
}


/**
 * Vérifie si une ligne est un tag de section (ex: "[Refrain]").
 * @param {string} line - La ligne à vérifier.
 * @returns {boolean}
 */
function isSectionTag(line) {
    const trimmed = line.trim();

    // Cas 1 : Tag standard [Couplet]
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        // Exclut les placeholders [?] (un ou plusieurs points d'interrogation)
        if (/^\[\?+\]$/.test(trimmed)) return false;
        return true;
    }

    // Cas 2 : Tag annoté (lien Genius) ex: [[Couplet]](id)
    // Regex : DOIT commencer par [[ pour être un tag lié (donc le contenu visible est [Tag])
    // Ceci évite de confondre avec une simple annotation sur une ligne complète ex: [Paroles annotées](id)
    if (/^\[\[.*\]\]\(.*\)$/.test(trimmed)) {
        return true;
    }

    return false;
}

/**
 * Corrige les espacements entre les lignes :
 * - Ajoute une ligne vide avant chaque tag de section (sauf le premier).
 * - Supprime les lignes vides en double ou inutiles.
 * @param {string} text - Le texte à corriger.
 * @returns {{newText: string, correctionsCount: number}} Le texte corrigé et le nombre de corrections.
 */
/**
 * Corrige les espacements entre les lignes :
 * - Ajoute une ligne vide avant chaque tag de section (sauf le premier).
 * - Supprime les lignes vides en double ou inutiles.
 * @param {string} text - Le texte à corriger.
 * @returns {{newText: string, correctionsCount: number}} Le texte corrigé et le nombre de corrections.
 */
function correctLineSpacing(text) {
    const originalLines = text.split('\n');
    let correctionsCount = 0;

    if (originalLines.length === 0) {
        return { newText: "", correctionsCount: 0 };
    }

    // 1. Identification des corrections nécessaires (sans modifier pour l'instant)
    // On travaille d'abord sur une structure intermédiaire pour compter les ajouts
    const linesWithAddedSpacing = [];

    for (let i = 0; i < originalLines.length; i++) {
        const currentLine = originalLines[i];
        linesWithAddedSpacing.push(currentLine);

        // Vérifie si on doit ajouter une ligne vide après la ligne courante
        if (currentLine.trim() !== "" && !isSectionTag(currentLine)) {
            if ((i + 1) < originalLines.length) {
                const nextLine = originalLines[i + 1];
                if (nextLine.trim() !== "" && isSectionTag(nextLine)) {
                    // Il manque une ligne vide, on l'ajoute
                    linesWithAddedSpacing.push("");
                    correctionsCount++; // +1 pour ajout de ligne
                }
            }
        }
    }

    // 2. Nettoyage des lignes vides existantes superflues
    const cleanedLines = [];

    // On parcourt les lignes (avec les ajouts potentiels) pour filtrer
    for (let i = 0; i < linesWithAddedSpacing.length; i++) {
        const currentLine = linesWithAddedSpacing[i];
        const trimmedLine = currentLine.trim();

        if (trimmedLine !== "") {
            // Ligne de texte : on la garde toujours
            cleanedLines.push(currentLine);
        } else {
            // C'est une ligne vide
            // On doit décider si on la garde

            // Si c'est la toute première ligne, on vire (sauf si le texte était vide, géré en haut)
            if (cleanedLines.length === 0) {
                // Suppression ligne vide au début
                // Si cette ligne vide existait dans l'original (pas un ajout de l'étape 1), on compte correction
                // (Difficile de tracer parfaitement l'origine, on simplifie : si on retire une ligne vide, c'est une correction)
                correctionsCount++;
                continue;
            }

            const prevLine = cleanedLines[cleanedLines.length - 1]; // Dernière ligne validée

            // Regarde la prochaine ligne non vide
            let nextLineIsTag = false;
            let hasNextContent = false;

            for (let k = i + 1; k < linesWithAddedSpacing.length; k++) {
                if (linesWithAddedSpacing[k].trim() !== "") {
                    hasNextContent = true;
                    if (isSectionTag(linesWithAddedSpacing[k])) {
                        nextLineIsTag = true;
                    }
                    break;
                }
            }

            if (!hasNextContent) {
                // Ligne vide à la fin du texte : on supprime
                correctionsCount++;
                continue;
            }

            // Règle : Une ligne vide est autorisée SEULEMENT AVANT un tag
            if (nextLineIsTag) {
                // Vérifie qu'on n'a pas déjà mis une ligne vide juste avant
                if (prevLine.trim() === "") {
                    // Doublon de ligne vide : on supprime celle-ci
                    correctionsCount++;
                } else {
                    // C'est une ligne vide utile (Texte -> Vide -> Tag)
                    // On la garde. 
                    // Si elle vient de l'étape 1 (ajoutée), le compteur est déjà incrémenté.
                    // Si elle était déjà là, on ne touche pas au compteur.
                    cleanedLines.push(currentLine);
                }
            } else {
                // Ligne vide inutile (ex: entre deux lignes de couplet) : on supprime
                correctionsCount++;
            }
        }
    }

    // On revérifie si le comptage n'est pas trop agressif (ex: suppression de lignes ajoutées par nous-même ?)
    // Non, les lignes ajoutées à l'étape 1 sont placées stratégiquement (Texte->Tag devenant Texte->Vide->Tag).
    // À l'étape 2, la logique "S'il y a une ligne vide avant un Tag et que la ligne d'avant n'est pas vide -> on garde"
    // protégera nos ajouts.

    // Cas spécifique : Si on a compté des suppressions de lignes qu'on venait d'ajouter (ne devrait pas arriver avec la logique actuelle
    // mais par sécurité on compare le texte final).

    // Correction finale pour éviter les incréments excessifs sur des cas simples
    // On recalcule un delta "brut" si le algo détaillé donne un résultat incohérent (peu probable mais prudent)
    // Mais pour l'instant, faisons confiance à la logique pas à pas.
    // Seul bémol : "Suppression ligne vide au début" -> si original avait 3 lignes vides au début, on incrémente 3 fois. Correct.

    // Recalage final si texte identique (pour éviter les faux positifs 0 vs 1)
    const newText = cleanedLines.join('\n');
    if (text === newText) return { newText, correctionsCount: 0 };

    // Si le texte change mais qu'on a compté 0 (ex: trim simple ?), on force 1
    if (correctionsCount === 0 && text !== newText) correctionsCount = 1;

    return { newText, correctionsCount };
}


/**
 * Applique une fonction de transformation de texte à un éditeur `div contenteditable`.
 * Cette fonction est nécessaire car on ne peut pas simplement modifier une propriété `value`.
 * Il faut reconstruire le contenu DOM de l'éditeur.
 * @param {HTMLElement} editorNode - L'élément `div` de l'éditeur.
 * @param {Function} transformFunction - La fonction qui prend le texte en entrée et retourne { newText, correctionsCount }.
 * @returns {number} Le nombre de corrections effectuées.
 */
function applyTextTransformToDivEditor(editorNode, transformFunction) {
    // 1. Sauvegarde la position du curseur.
    const selection = window.getSelection();
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0).cloneRange() : null;
    let currentTextContent = "";
    const lineElements = [];
    let nodeBuffer = "";

    // 2. Extrait le texte brut du div en gérant les <br> et autres éléments.
    editorNode.childNodes.forEach(child => {
        if (child.nodeName === 'BR') {
            if (nodeBuffer) lineElements.push(document.createTextNode(nodeBuffer));
            nodeBuffer = "";
            lineElements.push(document.createElement('br'));
        } else if (child.nodeType === Node.TEXT_NODE) {
            nodeBuffer += child.textContent;
        } else if (child.nodeType === Node.ELEMENT_NODE) {
            if (nodeBuffer) lineElements.push(document.createTextNode(nodeBuffer));
            nodeBuffer = "";
            if (child.nodeName === 'DIV' || child.nodeName === 'P') {
                if (child.textContent.trim() !== "") {
                    lineElements.push(child.cloneNode(true));
                } else if (child.querySelector('br')) {
                    lineElements.push(document.createElement('br'));
                }
            } else {
                nodeBuffer += child.textContent;
            }
        }
    });
    if (nodeBuffer) lineElements.push(document.createTextNode(nodeBuffer));

    currentTextContent = "";
    lineElements.forEach(el => {
        if (el.nodeName === 'BR') {
            currentTextContent += '\n';
        } else if (el.nodeType === Node.TEXT_NODE) {
            currentTextContent += el.textContent;
        } else if (el.nodeName === 'DIV' || el.nodeName === 'P') {
            currentTextContent += el.textContent + '\n';
        }
    });
    currentTextContent = currentTextContent.replace(/\n+$/, '');

    // 3. Applique la fonction de transformation sur le texte brut.
    const { newText, correctionsCount } = transformFunction(currentTextContent);

    // 4. Si le texte a changé, vide le div et le reconstruit.
    if (currentTextContent !== newText || correctionsCount > 0) {
        editorNode.innerHTML = '';
        newText.split('\n').forEach((lineText, index, arr) => {
            const lineDiv = document.createElement('div');
            if (lineText === "") {
                if (index === arr.length - 1 && arr.length > 1 && !newText.endsWith("\n\n")) {
                    // Ne rien faire pour la dernière ligne si elle est vide (évite un <br> en trop)
                } else {
                    lineDiv.appendChild(document.createElement('br'));
                }
            } else {
                lineDiv.textContent = lineText;
            }
            editorNode.appendChild(lineDiv);
        });

        // S'assure que l'éditeur n'est jamais complètement vide.
        if (editorNode.childNodes.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.appendChild(document.createElement('br'));
            editorNode.appendChild(emptyDiv);
        }

        // 5. Restaure la position du curseur à la fin du texte.
        if (range) {
            try {
                const lastDiv = editorNode.lastChild;
                if (lastDiv) {
                    const newRange = document.createRange();
                    if (lastDiv.nodeName === 'DIV') {
                        if (lastDiv.firstChild && lastDiv.firstChild.nodeName === 'BR') {
                            newRange.setStartBefore(lastDiv.firstChild);
                        } else if (lastDiv.firstChild && lastDiv.firstChild.nodeType === Node.TEXT_NODE) {
                            newRange.setStart(lastDiv.firstChild, lastDiv.firstChild.textContent.length);
                        } else {
                            newRange.selectNodeContents(lastDiv);
                            newRange.collapse(false);
                        }
                    } else {
                        newRange.setStart(lastDiv, lastDiv.textContent ? lastDiv.textContent.length : 0);
                    }
                    newRange.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                }
            } catch (e) { console.warn("Erreur restauration sélection après transformDiv:", e); }
        }
        editorNode.focus();
        // 6. Déclenche un événement 'input' pour que Genius détecte le changement.
        const inputEvent = new Event('input', { bubbles: true, cancelable: true });
        editorNode.dispatchEvent(inputEvent);
    }
    return correctionsCount;
}

/**
 * Chaîne toutes les corrections de texte individuelles en une seule passe.
 * @param {string} text - Le texte d'origine.
 * @param {object} options - Options de corrections activées (par défaut toutes true).
 * @returns {{newText: string, correctionsCount: number, corrections: object}} Le texte final corrigé, le nombre total et les détails par type.
 */
function applyAllTextCorrectionsToString(text, options = {}) {
    // Options par défaut (tout activé)
    const opts = {
        yPrime: options.yPrime !== false,
        apostrophes: options.apostrophes !== false,
        oeuLigature: options.oeuLigature !== false,
        frenchQuotes: options.frenchQuotes !== false,
        longDash: options.longDash !== false,
        doubleSpaces: options.doubleSpaces !== false,
        capitalization: options.capitalization !== false,
        punctuation: options.punctuation !== false,
        spacing: options.spacing !== false
    };

    let currentText = text;
    let result;

    // Objet pour tracker les corrections par type
    const corrections = {
        yPrime: 0,
        apostrophes: 0,
        oeuLigature: 0,
        frenchQuotes: 0,
        longDash: 0,
        doubleSpaces: 0,
        spacing: 0
    };

    // Correction de "y'" -> "y "
    if (opts.yPrime) {
        const yPrimePattern = /\b(Y|y)['']/g;
        const yPrimeReplacement = (match, firstLetter) => (firstLetter === 'Y' ? 'Y ' : 'y ');
        const textAfterYPrime = currentText.replace(yPrimePattern, yPrimeReplacement);
        if (textAfterYPrime !== currentText) {
            corrections.yPrime = (currentText.match(yPrimePattern) || []).length;
            currentText = textAfterYPrime;
        }
    }

    // Correction de l'apostrophe typographique ' -> '
    if (opts.apostrophes) {
        const apostrophePattern = /['']/g;
        const textAfterApostrophe = currentText.replace(apostrophePattern, "'");
        if (textAfterApostrophe !== currentText) {
            corrections.apostrophes = (currentText.match(apostrophePattern) || []).length;
            currentText = textAfterApostrophe;
        }
    }

    // Correction de "oeu" -> "œu"
    if (opts.oeuLigature) {
        const oeuPattern = /([Oo])eu/g;
        const oeuReplacement = (match, firstLetter) => (firstLetter === 'O' ? 'Œu' : 'œu');
        const textAfterOeu = currentText.replace(oeuPattern, oeuReplacement);
        if (textAfterOeu !== currentText) {
            corrections.oeuLigature = (currentText.match(oeuPattern) || []).length;
            currentText = textAfterOeu;
        }
    }

    // Correction des guillemets français «» -> "
    if (opts.frenchQuotes) {
        const frenchQuotesPattern = /[«»]/g;
        const textAfterFrenchQuotes = currentText.replace(frenchQuotesPattern, '"');
        if (textAfterFrenchQuotes !== currentText) {
            corrections.frenchQuotes = (currentText.match(frenchQuotesPattern) || []).length;
            currentText = textAfterFrenchQuotes;
        }
    }

    // Correction des tirets longs — – -> - (ou inversement pour PL)
    if (opts.longDash) {
        if (typeof isPolishTranscriptionMode === 'function' && isPolishTranscriptionMode()) {
            // Pour le polonais : standardiser les tirets de séparation (-) en tirets longs (—)
            // On vise les tirets entourés d'espaces : " - " -> " — "
            const polishDashPattern = / - /g;
            const textAfterPolishDash = currentText.replace(polishDashPattern, ' — ');
            if (textAfterPolishDash !== currentText) {
                corrections.longDash = (currentText.match(polishDashPattern) || []).length;
                currentText = textAfterPolishDash;
            }
        } else {
            // Comportement standard (FR/EN) : tirets longs -> tirets courts
            const longDashPattern = /[—–]/g;
            const textAfterLongDash = currentText.replace(longDashPattern, '-');
            if (textAfterLongDash !== currentText) {
                corrections.longDash = (currentText.match(longDashPattern) || []).length;
                currentText = textAfterLongDash;
            }
        }
    }

    // Correction des doubles espaces
    if (opts.doubleSpaces) {
        const doubleSpacesPattern = /  +/g;
        const textAfterDoubleSpaces = currentText.replace(doubleSpacesPattern, ' ');
        if (textAfterDoubleSpaces !== currentText) {
            corrections.doubleSpaces = (currentText.match(doubleSpacesPattern) || []).length;
            currentText = textAfterDoubleSpaces;
        }
    }

    // Application de la correction d'espacement
    if (opts.spacing) {
        result = correctLineSpacing(currentText);
        if (result.correctionsCount > 0) {
            corrections.spacing = result.correctionsCount;
            currentText = result.newText;
        }
    }

    // Calcul du total
    const totalCorrections = corrections.yPrime + corrections.apostrophes +
        corrections.oeuLigature + corrections.frenchQuotes + corrections.longDash +
        corrections.doubleSpaces + corrections.spacing;

    return { newText: currentText, correctionsCount: totalCorrections, corrections: corrections };
}

/**
 * Version asynchrone de applyAllTextCorrectionsToString avec barre de progression.
 * @param {string} text - Le texte d'origine.
 * @returns {Promise<{newText: string, correctionsCount: number, corrections: object}>} Le texte corrigé et les détails.
 */
async function applyAllTextCorrectionsAsync(text) {
    let currentText = text;
    let result;
    const totalSteps = 7;

    // Objet pour tracker les corrections par type
    const corrections = {
        yPrime: 0,
        apostrophes: 0,
        oeuLigature: 0,
        frenchQuotes: 0,
        longDash: 0,
        doubleSpaces: 0,
        spacing: 0
    };

    // Étape 1: Correction de "y'" -> "y "
    showProgress(1, totalSteps, getTranslation('progress_step_yprime'));
    await new Promise(resolve => setTimeout(resolve, 50));

    const yPrimePattern = /\b(Y|y)['']/g;
    const yPrimeReplacement = (match, firstLetter) => (firstLetter === 'Y' ? 'Y ' : 'y ');
    const textAfterYPrime = currentText.replace(yPrimePattern, yPrimeReplacement);
    if (textAfterYPrime !== currentText) {
        corrections.yPrime = (currentText.match(yPrimePattern) || []).length;
        currentText = textAfterYPrime;
    }

    // Étape 2: Correction de l'apostrophe typographique
    showProgress(2, totalSteps, getTranslation('progress_step_apostrophes'));
    await new Promise(resolve => setTimeout(resolve, 50));

    const apostrophePattern = /['']/g;
    const textAfterApostrophe = currentText.replace(apostrophePattern, "'");
    if (textAfterApostrophe !== currentText) {
        corrections.apostrophes = (currentText.match(apostrophePattern) || []).length;
        currentText = textAfterApostrophe;
    }

    // Étape 3: Correction de "oeu" -> "œu"
    showProgress(3, totalSteps, getTranslation('progress_step_oeu'));
    await new Promise(resolve => setTimeout(resolve, 50));

    const oeuPattern = /([Oo])eu/g;
    const oeuReplacement = (match, firstLetter) => (firstLetter === 'O' ? 'Œu' : 'œu');
    const textAfterOeu = currentText.replace(oeuPattern, oeuReplacement);
    if (textAfterOeu !== currentText) {
        corrections.oeuLigature = (currentText.match(oeuPattern) || []).length;
        currentText = textAfterOeu;
    }

    // Étape 4: Correction des guillemets français «» -> "
    showProgress(4, totalSteps, getTranslation('progress_step_quotes'));
    await new Promise(resolve => setTimeout(resolve, 50));

    const frenchQuotesPattern = /[«»]/g;
    const textAfterFrenchQuotes = currentText.replace(frenchQuotesPattern, '"');
    if (textAfterFrenchQuotes !== currentText) {
        corrections.frenchQuotes = (currentText.match(frenchQuotesPattern) || []).length;
        currentText = textAfterFrenchQuotes;
    }

    // Étape 5: Correction des tirets longs
    showProgress(5, totalSteps, getTranslation('progress_step_dash'));
    await new Promise(resolve => setTimeout(resolve, 50));

    if (typeof isPolishTranscriptionMode === 'function' && isPolishTranscriptionMode()) {
        const polishDashPattern = / - /g;
        const textAfterPolishDash = currentText.replace(polishDashPattern, ' — ');
        if (textAfterPolishDash !== currentText) {
            corrections.longDash = (currentText.match(polishDashPattern) || []).length;
            currentText = textAfterPolishDash;
        }
    } else {
        const longDashPattern = /[—–]/g;
        const textAfterLongDash = currentText.replace(longDashPattern, '-');
        if (textAfterLongDash !== currentText) {
            corrections.longDash = (currentText.match(longDashPattern) || []).length;
            currentText = textAfterLongDash;
        }
    }

    // Étape 6: Correction des doubles espaces
    showProgress(6, totalSteps, getTranslation('progress_step_spaces'));
    await new Promise(resolve => setTimeout(resolve, 50));

    const doubleSpacesPattern = /  +/g;
    const textAfterDoubleSpaces = currentText.replace(doubleSpacesPattern, ' ');
    if (textAfterDoubleSpaces !== currentText) {
        corrections.doubleSpaces = (currentText.match(doubleSpacesPattern) || []).length;
        currentText = textAfterDoubleSpaces;
    }

    // Étape 7: Espacement
    showProgress(7, totalSteps, getTranslation('progress_step_spacing'));
    await new Promise(resolve => setTimeout(resolve, 50));

    result = correctLineSpacing(currentText);
    if (result.correctionsCount > 0) {
        corrections.spacing = result.correctionsCount;
        currentText = result.newText;
    }

    // Calcul du total
    const totalCorrections = corrections.yPrime + corrections.apostrophes +
        corrections.oeuLigature + corrections.frenchQuotes + corrections.longDash +
        corrections.doubleSpaces + corrections.spacing;

    return { newText: currentText, correctionsCount: totalCorrections, corrections: corrections };
}


/**
 * Fonction principale qui initialise le panneau d'outils.
 * C'est le cœur de l'extension. Elle est appelée lorsque l'éditeur de paroles est détecté.
 */
function initLyricsEditorEnhancer() {
    let foundEditor = null; let foundEditorType = null;

    // Configuration de tous les boutons et actions du panneau.
    // Les tags structuraux sont dynamiques selon le mode de transcription (FR/EN/PL)
    const getStructuralTags = () => {
        const isEnglish = isEnglishTranscriptionMode();
        const isPolish = isPolishTranscriptionMode();
        const customButtons = getCustomButtons().filter(b => b.type === 'structure').map(b => ({
            label: b.label,
            getText: () => {
                // Si le contenu ressemble à un tag (commence par [), on utilise addArtistToText
                // Sinon on insère brut (ou formatSimpleTag)
                if (b.content.trim().startsWith('[')) return addArtistToText(b.content);
                return b.content;
            },
            tooltip: 'Custom: ' + b.label
        }));

        const plusButton = {
            label: '+',
            title: 'Ajouter bouton structure',
            isPlusButton: true,
            managerType: 'structure'
        };

        if (isPolish) {
            // Mode polonais : tags en polonais selon Genius Polska
            return {
                buttons: [
                    {
                        type: 'coupletManager',
                        prev: { label: '←', title: 'Poprzednia Zwrotka', tooltip: 'Wróć do poprzedniej zwrotki' },
                        main: {
                            id: COUPLET_BUTTON_ID,
                            getLabel: () => `[Zwrotka ${coupletCounter}]`,
                            getText: () => addArtistToText(`[Zwrotka ${coupletCounter}]`),
                            tooltip: getTranslation('add_couplet'),
                            shortcut: '1'
                        },
                        next: { label: '→', title: 'Następna Zwrotka', tooltip: 'Przejdź do następnej zwrotki' }
                    },
                    { label: getTranslation('btn_intro'), getText: () => addArtistToText('[Intro]'), tooltip: getTranslation('btn_intro_tooltip'), shortcut: '4' },
                    { label: getTranslation('btn_verse'), getText: () => addArtistToText('[Zwrotka]'), tooltip: getTranslation('btn_verse_tooltip') },
                    { label: getTranslation('btn_pre_chorus'), getText: () => addArtistToText('[Przedrefren]'), tooltip: getTranslation('btn_pre_chorus_tooltip') },
                    { label: getTranslation('btn_chorus'), getText: () => addArtistToText('[Refren]'), tooltip: getTranslation('btn_chorus_tooltip'), shortcut: '2' },
                    { label: getTranslation('btn_hook'), getText: () => addArtistToText('[Przyśpiewka]'), tooltip: getTranslation('btn_hook_tooltip') },
                    { label: getTranslation('btn_post_chorus'), getText: () => addArtistToText('[Zarefren]'), tooltip: getTranslation('btn_post_chorus_tooltip') },
                    { label: getTranslation('btn_bridge'), getText: () => addArtistToText('[Przejście]'), tooltip: getTranslation('btn_bridge_tooltip'), shortcut: '3' },
                    { label: getTranslation('btn_outro'), getText: () => addArtistToText('[Outro]'), tooltip: getTranslation('btn_outro_tooltip'), shortcut: '5' },
                    { label: getTranslation('btn_instrumental'), getText: () => formatSimpleTag('[Przerwa instrumentalna]'), tooltip: getTranslation('btn_instrumental_tooltip') },
                    { label: getTranslation('btn_interlude'), getText: () => addArtistToText('[Interludium]'), tooltip: getTranslation('btn_interlude_tooltip') },
                    { label: getTranslation('btn_part'), getText: () => addArtistToText('[Część]'), tooltip: getTranslation('btn_part_tooltip') },
                    { label: getTranslation('btn_skit'), getText: () => formatSimpleTag('[Skit]'), tooltip: getTranslation('btn_skit_tooltip') },
                    { label: getTranslation('btn_vocalization'), getText: () => addArtistToText('[Wokaliza]'), tooltip: getTranslation('btn_vocalization_tooltip') },
                    { label: getTranslation('btn_unknown'), getText: () => formatSimpleTag('[?]', true), tooltip: getTranslation('btn_unknown_tooltip') },
                    ...customButtons,
                    plusButton
                ]
            };
        } else if (isEnglish) {
            // Mode anglais : tags en anglais, pas d'en-tête, pas de "Couplet unique"
            return {
                buttons: [
                    {
                        type: 'coupletManager',
                        prev: { label: '←', title: 'Previous Verse', tooltip: 'Go to previous verse' },
                        main: {
                            id: COUPLET_BUTTON_ID,
                            getLabel: () => `[Verse ${coupletCounter}]`,
                            getText: () => addArtistToText(`[Verse ${coupletCounter}]`),
                            tooltip: 'Insert Verse tag with current number',
                            shortcut: '1'
                        },
                        next: { label: '→', title: 'Next Verse', tooltip: 'Go to next verse' }
                    },
                    { label: '[Intro]', getText: () => addArtistToText('[Intro]'), tooltip: 'Insert [Intro] tag', shortcut: '4' },
                    { label: '[Pre-Chorus]', getText: () => addArtistToText('[Pre-Chorus]'), tooltip: 'Insert [Pre-Chorus] tag' },
                    { label: '[Chorus]', getText: () => addArtistToText('[Chorus]'), tooltip: 'Insert [Chorus] tag', shortcut: '2' },
                    { label: '[Post-Chorus]', getText: () => addArtistToText('[Post-Chorus]'), tooltip: 'Insert [Post-Chorus] tag' },
                    { label: '[Bridge]', getText: () => addArtistToText('[Bridge]'), tooltip: 'Insert [Bridge] tag', shortcut: '3' },
                    { label: '[Outro]', getText: () => addArtistToText('[Outro]'), tooltip: 'Insert [Outro] tag', shortcut: '5' },
                    { label: '[Instrumental]', getText: () => formatSimpleTag('[Instrumental]'), tooltip: 'Insert [Instrumental] tag' },
                    { label: '[?]', getText: () => formatSimpleTag('[?]', true), tooltip: 'Insert [?] tag for unknown section' },
                    ...customButtons,
                    plusButton
                ]
            };
        } else {
            // Mode français : tags en français avec en-tête et couplet unique
            return {
                buttons: [
                    { label: getTranslation('btn_header'), getText: () => { let txt = `[Paroles de "${currentSongTitle}"`; const fts = formatArtistList(currentFeaturingArtists); if (fts && isHeaderFeatEnabled()) txt += ` ft. ${fts}`; txt += ']'; if (!isTagNewlinesDisabled()) txt += '\n'; return txt; }, tooltip: getTranslation('btn_header_tooltip') },
                    {
                        type: 'coupletManager',
                        prev: { label: '←', title: 'Couplet précédent', tooltip: 'Revenir au couplet précédent' },
                        main: {
                            id: COUPLET_BUTTON_ID,
                            getLabel: () => `[Couplet ${coupletCounter}]`,
                            getText: () => addArtistToText(`[Couplet ${coupletCounter}]`),
                            tooltip: getTranslation('add_couplet'),
                            shortcut: '1'
                        },
                        next: { label: '→', title: 'Couplet suivant', tooltip: 'Passer au couplet suivant' }
                    },
                    { label: getTranslation('btn_intro'), getText: () => addArtistToText('[Intro]'), tooltip: getTranslation('btn_intro_tooltip'), shortcut: '4' },
                    { label: getTranslation('btn_verse_unique'), getText: () => addArtistToText('[Couplet unique]'), tooltip: getTranslation('btn_verse_unique_tooltip') },
                    { label: getTranslation('btn_verse'), getText: () => addArtistToText('[Couplet]'), tooltip: getTranslation('btn_verse_tooltip') },
                    { label: getTranslation('btn_pre_chorus'), getText: () => addArtistToText('[Pré-refrain]'), tooltip: getTranslation('btn_pre_chorus_tooltip') },
                    { label: getTranslation('btn_chorus'), getText: () => addArtistToText('[Refrain]'), tooltip: getTranslation('btn_chorus_tooltip'), shortcut: '2' },
                    { label: getTranslation('btn_post_chorus'), getText: () => addArtistToText('[Post-refrain]'), tooltip: getTranslation('btn_post_chorus_tooltip') },
                    { label: getTranslation('btn_bridge'), getText: () => addArtistToText('[Pont]'), tooltip: getTranslation('btn_bridge_tooltip'), shortcut: '3' },
                    { label: getTranslation('btn_outro'), getText: () => addArtistToText('[Outro]'), tooltip: getTranslation('btn_outro_tooltip'), shortcut: '5' },
                    { label: getTranslation('btn_instrumental'), getText: () => formatSimpleTag('[Instrumental]'), tooltip: getTranslation('btn_instrumental_tooltip') },
                    { label: getTranslation('btn_unknown'), getText: () => formatSimpleTag('[?]', true), tooltip: getTranslation('btn_unknown_tooltip') },
                    ...customButtons,
                    plusButton
                ]
            };
        }
    };

    // Fonction pour obtenir les outils de nettoyage selon le mode
    const getTextCleanupTools = () => {
        const isEnglish = isEnglishTranscriptionMode();
        const isPolish = isPolishTranscriptionMode();

        // Récupération des boutons personnalisés
        const customButtons = getCustomButtons().filter(b => b.type === 'cleanup').map(b => ({
            label: b.label,
            action: 'replaceText',
            searchPattern: new RegExp(b.regex, 'g'),
            replacementText: b.replacement || '',
            highlightClass: LYRICS_HELPER_HIGHLIGHT_CLASS,
            tooltip: 'Custom: ' + b.label
        }));

        const plusButton = {
            label: '+',
            title: 'Ajouter bouton cleanup',
            isPlusButton: true,
            managerType: 'cleanup'
        };

        // Outils communs à toutes les langues
        const commonTools = [
            {
                label: getTranslation('btn_apostrophe_label'),
                action: 'replaceText',
                searchPattern: /['']/g,
                replacementText: "'",
                highlightClass: LYRICS_HELPER_HIGHLIGHT_CLASS,
                tooltip: getTranslation('cleanup_apostrophe_tooltip'),
                feedbackKey: 'preview_stat_apostrophes'
            },
            {
                label: getTranslation('btn_french_quotes_label'),
                action: 'replaceText',
                searchPattern: /[«»]/g,
                replacementText: '"',
                highlightClass: LYRICS_HELPER_HIGHLIGHT_CLASS,
                tooltip: getTranslation('cleanup_french_quotes_tooltip'),
                feedbackKey: 'preview_stat_quotes'
            },
            {
                label: getTranslation('btn_double_spaces_label'),
                action: 'replaceText',
                searchPattern: /  +/g,
                replacementText: ' ',
                highlightClass: LYRICS_HELPER_HIGHLIGHT_CLASS,
                tooltip: getTranslation('cleanup_double_spaces_tooltip'),
                feedbackKey: 'preview_stat_spaces'
            },
            {
                label: getTranslation('btn_zws_remove'),
                action: 'replaceText',
                searchPattern: /[\u200B\u200C\u200D\uFEFF]/g,
                replacementText: '',
                highlightClass: LYRICS_HELPER_HIGHLIGHT_CLASS,
                tooltip: getTranslation('btn_zws_remove_tooltip')
            },
            {
                label: getTranslation('btn_duplicate_line_label'),
                action: 'duplicateLine',
                tooltip: getTranslation('cleanup_duplicate_line_tooltip'),
                shortcut: 'D'
            },
            {
                label: getTranslation('btn_spacing_label'),
                shortLabel: getTranslation('btn_spacing_short'),
                action: 'lineCorrection',
                correctionType: 'spacing',
                title: getTranslation('cleanup_spacing_tooltip'),
                tooltip: getTranslation('cleanup_spacing_tooltip'),
                feedbackKey: 'preview_stat_spacing'
            },
            {
                label: getTranslation('btn_check_label'),
                action: 'checkBrackets',
                title: getTranslation('global_check_tooltip'),
                tooltip: getTranslation('global_check_tooltip'),
                shortcut: 'S'
            }
        ];

        if (isPolish) {
            // Mode polonais : outils spécifiques selon les règles Genius Polska
            // Note: En polonais, on convertit - → — (inverse du français !)
            const polishSpecificTools = [
                {
                    label: getTranslation('btn_polish_quotes_label'),
                    action: 'replaceText',
                    searchPattern: /[„""]/g,  // Polish quotes „" and curly quotes ""
                    replacementText: '"',
                    highlightClass: LYRICS_HELPER_HIGHLIGHT_CLASS,
                    tooltip: getTranslation('cleanup_polish_quotes_tooltip'),
                    feedbackKey: 'preview_stat_polish_quotes'
                },
                {
                    label: getTranslation('btn_em_dash_label'),
                    action: 'replaceText',
                    searchPattern: /(?<!\-)\-(?!\-)/g,  // Single hyphen (not part of --)
                    replacementText: '—',
                    highlightClass: LYRICS_HELPER_HIGHLIGHT_CLASS,
                    tooltip: getTranslation('cleanup_em_dash_tooltip'),
                    feedbackKey: 'preview_stat_dash'
                },
                {
                    label: getTranslation('btn_ellipsis_label'),
                    action: 'replaceText',
                    searchPattern: /\.{3}/g,  // Three dots
                    replacementText: '…',
                    highlightClass: LYRICS_HELPER_HIGHLIGHT_CLASS,
                    tooltip: getTranslation('cleanup_ellipsis_tooltip'),
                    feedbackKey: 'preview_stat_ellipsis'
                }
            ];

            return [...polishSpecificTools, ...commonTools, ...customButtons, plusButton];
        } else if (isEnglish) {
            // Mode anglais : pas de y', oeu→œu, tirets longs
            return [...commonTools, ...customButtons, plusButton];
        } else {
            // Mode français : tous les outils spécifiques
            const frenchSpecificTools = [
                {
                    label: getTranslation('btn_y_label'),
                    action: 'replaceText',
                    searchPattern: /\b(Y|y)['']/g,
                    replacementFunction: (match, firstLetter) => (firstLetter === 'Y' ? 'Y ' : 'y '),
                    highlightClass: LYRICS_HELPER_HIGHLIGHT_CLASS,
                    tooltip: getTranslation('cleanup_y_tooltip'),
                    feedbackKey: 'preview_stat_yprime'
                },
                {
                    label: getTranslation('btn_oeu_label'),
                    action: 'replaceText',
                    searchPattern: /([Oo])eu/g,
                    replacementFunction: (match, firstLetter) => (firstLetter === 'O' ? 'Œu' : 'œu'),
                    highlightClass: LYRICS_HELPER_HIGHLIGHT_CLASS,
                    tooltip: getTranslation('cleanup_oeu_tooltip'),
                    feedbackKey: 'preview_stat_oeu'
                },
                {
                    label: getTranslation('btn_long_dash_label'),
                    action: 'replaceText',
                    searchPattern: /[—–]/g,
                    replacementText: '-',
                    highlightClass: LYRICS_HELPER_HIGHLIGHT_CLASS,
                    tooltip: getTranslation('cleanup_long_dash_tooltip'),
                    feedbackKey: 'preview_stat_dash'
                }
            ];

            // Insère les outils français au début, puis les outils communs
            return [...frenchSpecificTools, ...commonTools, ...customButtons, plusButton];
        }
    };

    const SHORTCUTS = {
        TAGS_STRUCTURAUX: [
            getStructuralTags()
        ],
        TEXT_CLEANUP: getTextCleanupTools(),
        GLOBAL_FIXES: [
            {
                label: getTranslation('btn_fix_all_label'), // Tout Corriger (Texte)
                shortLabel: getTranslation('btn_fix_all_short'), // ✨ Tout Corriger
                action: 'globalTextFix',
                title: getTranslation('global_fix_tooltip'),
                tooltip: getTranslation('global_fix_tooltip'),
                shortcut: 'C'
            }
        ]
    };

    // ... (Reste de l'initialisation) ...

    // 1. Détecte si un éditeur de paroles (textarea ou div) est présent sur la page.
    // On priorise l'éditeur VISIBLE, car Genius peut garder l'ancien textarea caché dans le DOM.
    const textareaEditor = document.querySelector(SELECTORS.TEXTAREA_EDITOR);
    const divEditor = document.querySelector(SELECTORS.DIV_EDITOR);

    // Fonction utilitaire pour vérifier la visibilité
    const isVisible = (el) => !!(el && (el.offsetParent !== null || el.getClientRects().length > 0));

    if (divEditor && isVisible(divEditor)) {
        foundEditor = divEditor;
        foundEditorType = 'div';
        // console.log('[GFT] Éditeur DIV visible détecté');
    } else if (textareaEditor && isVisible(textareaEditor)) {
        foundEditor = textareaEditor;
        foundEditorType = 'textarea';
        // console.log('[GFT] Éditeur TEXTAREA visible détecté');
    } else {
        // Fallback : si aucun n'est visible (ex: chargement), on prend ce qu'on trouve
        if (divEditor) {
            foundEditor = divEditor;
            foundEditorType = 'div';
        } else if (textareaEditor) {
            foundEditor = textareaEditor;
            foundEditorType = 'textarea';
        }
    }

    if (foundEditor && !document.body.contains(foundEditor)) {
        foundEditor = null;
        foundEditorType = null;
    }

    // Gère les cas où l'éditeur apparaît, disparaît ou change (navigation SPA).
    const editorJustAppeared = foundEditor && !currentActiveEditor;
    const editorJustDisappeared = !foundEditor && currentActiveEditor;
    const editorInstanceChanged = foundEditor && currentActiveEditor && (foundEditor !== currentActiveEditor);

    if (editorJustAppeared || editorInstanceChanged) {
        currentActiveEditor = foundEditor;
        currentEditorType = foundEditorType;
        extractSongData(); // Extrait les données de la chanson à l'apparition de l'éditeur.
        hideGeniusFormattingHelper();
        if (shortcutsContainerElement) {
            shortcutsContainerElement.remove();
            shortcutsContainerElement = null;
        }

        // Vérifie s'il y a un brouillon à restaurer (uniquement quand l'éditeur apparaît)
        setTimeout(checkAndRestoreDraft, 1000);

        // Réinitialise l'historique pour le nouvel éditeur
        undoStack = [];
        redoStack = [];
        lastSavedContent = '';
        hasUnsavedChanges = false;
        if (autoSaveTimeout) {
            clearTimeout(autoSaveTimeout);
            autoSaveTimeout = null;
        }

        // Initialise la barre d'outils flottante
        createFloatingFormattingToolbar();

        // Ajoute un écouteur spécifique pour les sélections dans le textarea
        if (currentEditorType === 'textarea') {
            currentActiveEditor.addEventListener('select', handleSelectionChange);
            currentActiveEditor.addEventListener('mouseup', handleSelectionChange);
            // Cache la barre flottante quand on scroll dans le textarea
            currentActiveEditor.addEventListener('scroll', hideFloatingToolbar);
        }

        // Ajoute un écouteur pour mettre à jour les statistiques en temps réel
        currentActiveEditor.addEventListener('input', debouncedStatsUpdate);
        // Ajoute un écouteur pour la sauvegarde automatique dans l'historique
        currentActiveEditor.addEventListener('input', autoSaveToHistory);
        // Met à jour les statistiques initiales
        setTimeout(() => updateStatsDisplay(), 500);

        // Sauvegarde initiale dans l'historique
        setTimeout(() => {
            const initialContent = getCurrentEditorContent();
            if (initialContent && initialContent.trim().length > 0) {
                lastSavedContent = initialContent;
                if (undoStack.length === 0 || undoStack[undoStack.length - 1] !== initialContent) {
                    undoStack.push(initialContent);
                    updateHistoryButtons();
                }
            }
        }, 500);
    } else if (editorJustDisappeared) {
        currentActiveEditor = null; currentEditorType = null;
        hideFloatingToolbar();

        // Réinitialise l'historique quand on quitte l'éditeur
        undoStack = [];
        redoStack = [];
        lastSavedContent = '';
        hasUnsavedChanges = false;
        if (autoSaveTimeout) {
            clearTimeout(autoSaveTimeout);
            autoSaveTimeout = null;
        }
    }

    shortcutsContainerElement = document.getElementById(SHORTCUTS_CONTAINER_ID);
    if (editorJustDisappeared && shortcutsContainerElement) {
        shortcutsContainerElement.remove(); shortcutsContainerElement = null; return;
    }

    // 2. Si un éditeur est trouvé, on crée et injecte le panneau d'outils.
    if (foundEditor) {
        const targetStickySection = document.querySelector(SELECTORS.CONTROLS_STICKY_SECTION);
        if (targetStickySection) {
            // Si le mode "Lyric Card Only" est activé, on NE CRÉE PAS le panneau.
            if (isLyricCardOnlyMode()) {
                if (shortcutsContainerElement) {
                    shortcutsContainerElement.remove();
                    shortcutsContainerElement = null;
                }
                // On s'assure quand même que l'extractSongData est fait pour la Lyric Card
                if (editorJustAppeared || editorInstanceChanged) {
                    extractSongData();
                    hideGeniusFormattingHelper();
                }
                return;
            }

            // Crée le conteneur principal du panneau seulement s'il n'existe pas déjà.
            if (!shortcutsContainerElement || editorInstanceChanged || editorJustAppeared) {
                if (shortcutsContainerElement) shortcutsContainerElement.remove();
                shortcutsContainerElement = document.createElement('div');
                shortcutsContainerElement.id = SHORTCUTS_CONTAINER_ID;

                // Crée le titre du panneau, le logo et le bouton de mode sombre.
                const panelTitle = document.createElement('div');
                panelTitle.id = 'gftPanelTitle';

                // Conteneur cliquable pour le titre et la flèche
                const clickableTitleArea = document.createElement('span');
                clickableTitleArea.id = 'gft-clickable-title';
                clickableTitleArea.style.cursor = 'pointer';
                clickableTitleArea.style.display = 'inline-flex';
                clickableTitleArea.style.alignItems = 'center';
                clickableTitleArea.style.userSelect = 'none';

                const logoURL = chrome.runtime.getURL('images/icon16.png');

                // Flèche (créée ici pour être manipulée)
                const collapseArrow = document.createElement('span');
                collapseArrow.id = 'gft-collapse-arrow';
                collapseArrow.style.marginLeft = '5px';
                collapseArrow.style.fontSize = '12px'; // Un peu plus grand pour la flèche
                collapseArrow.style.transition = 'transform 0.3s ease'; // Animation de rotation

                // Vérifie l'état initial
                const isCollapsed = localStorage.getItem(PANEL_COLLAPSED_STORAGE_KEY) === 'true';
                collapseArrow.textContent = isCollapsed ? '▼' : '▲';
                // Rotation si replié (optionnel, ou juste changement de texte)
                // Ici on change juste le texte comme demandé, mais dans un span

                clickableTitleArea.innerHTML = `<img src="${logoURL}" alt="${getTranslation('panel_title_img_alt')}" id="gftPanelLogo" /> <span style="font-weight:bold;">${getTranslation('panel_title')}</span>`;
                clickableTitleArea.appendChild(collapseArrow);

                // Fonction de toggle commune
                const togglePanel = (e) => {
                    if (e) {
                        e.preventDefault();
                        e.stopPropagation();
                    }

                    const contentWrapper = document.getElementById('gft-panel-content');
                    if (contentWrapper) {
                        contentWrapper.classList.toggle('gft-collapsed');
                        const currentlyCollapsed = contentWrapper.classList.contains('gft-collapsed');

                        document.getElementById('gft-collapse-arrow').textContent = currentlyCollapsed ? '▼' : '▲';

                        // Sauvegarde la préférence
                        localStorage.setItem(PANEL_COLLAPSED_STORAGE_KEY, currentlyCollapsed ? 'true' : 'false');
                    }
                };

                clickableTitleArea.addEventListener('click', togglePanel);
                panelTitle.appendChild(clickableTitleArea);
                addTooltip(clickableTitleArea, 'Cliquer pour replier/déplier');

                // Sélecteur de mode de transcription (FR/EN/PL)
                const transcriptionModeSelect = document.createElement('select');
                transcriptionModeSelect.id = 'gft-transcription-mode-select';
                transcriptionModeSelect.classList.add('gft-transcription-mode-select');
                transcriptionModeSelect.title = getTranslation('mode_select_title') || 'Transcription mode';

                const optionFR = document.createElement('option');
                optionFR.value = 'fr';
                optionFR.textContent = '🇫🇷 FR';
                transcriptionModeSelect.appendChild(optionFR);

                const optionEN = document.createElement('option');
                optionEN.value = 'en';
                optionEN.textContent = '🇬🇧 EN';
                transcriptionModeSelect.appendChild(optionEN);

                const optionPL = document.createElement('option');
                optionPL.value = 'pl';
                optionPL.textContent = '🇵🇱 PL';
                transcriptionModeSelect.appendChild(optionPL);

                // Définit la valeur actuelle
                transcriptionModeSelect.value = getTranscriptionMode();

                // Événement de changement
                transcriptionModeSelect.addEventListener('change', (e) => {
                    const newMode = e.target.value;
                    setTranscriptionMode(newMode);
                    // Synchronise aussi la langue d'interface pour que les traductions soient cohérentes
                    localStorage.setItem('gftLanguage', newMode);
                    // Recharge le panneau pour appliquer les changements
                    if (shortcutsContainerElement) {
                        shortcutsContainerElement.remove();
                        shortcutsContainerElement = null;
                    }
                    // Force la réinitialisation
                    setTimeout(() => initLyricsEditorEnhancer(), 100);
                });

                panelTitle.appendChild(transcriptionModeSelect);
                addTooltip(transcriptionModeSelect, getTranslation('lang_select_title') || 'Change transcription mode');

                // Bouton Undo
                const undoButton = document.createElement('button');
                undoButton.id = 'gft-undo-button';
                undoButton.textContent = '↩';
                undoButton.title = 'Annuler (Ctrl+Z)';
                undoButton.classList.add('genius-lyrics-shortcut-button');
                undoButton.disabled = true;
                undoButton.style.opacity = '0.5';
                undoButton.addEventListener('click', (event) => {
                    event.preventDefault();
                    undoLastChange();
                });
                panelTitle.appendChild(undoButton);
                addTooltip(undoButton, getTranslation('undo_tooltip'));

                // Bouton Redo
                const redoButton = document.createElement('button');
                redoButton.id = 'gft-redo-button';
                redoButton.textContent = '↪';
                redoButton.title = 'Refaire (Ctrl+Y)';
                redoButton.classList.add('genius-lyrics-shortcut-button');
                redoButton.disabled = true;
                redoButton.style.opacity = '0.5';
                redoButton.addEventListener('click', (event) => {
                    event.preventDefault();
                    redoLastChange();
                });
                panelTitle.appendChild(redoButton);
                addTooltip(redoButton, getTranslation('redo_tooltip'));

                // Bouton Paramètres (Ouvre le menu)
                const settingsButton = document.createElement('button');
                settingsButton.id = 'gft-settings-button';
                settingsButton.textContent = '⚙️';
                settingsButton.title = getTranslation('settings_menu');
                settingsButton.classList.add('genius-lyrics-shortcut-button');

                settingsButton.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    const existingMenu = document.getElementById('gft-settings-menu');
                    if (existingMenu) {
                        existingMenu.remove(); // Ferme le menu s'il est ouvert
                        return;
                    }

                    // Création du Menu Popover
                    const menu = document.createElement('div');
                    menu.id = 'gft-settings-menu';
                    menu.className = 'gft-settings-menu';

                    // Positionnement
                    const rect = settingsButton.getBoundingClientRect();
                    menu.style.top = `${rect.bottom + 5}px`;
                    menu.style.left = `${rect.left}px`;


                    // Item 1: Mode Sombre
                    const darkModeItem = document.createElement('button');
                    darkModeItem.className = 'gft-settings-menu-item';
                    darkModeItem.textContent = document.body.classList.contains('gft-dark-mode') ? getTranslation('dark_mode_toggle_light') : getTranslation('dark_mode_toggle_dark');
                    darkModeItem.onclick = () => {
                        gftToggleDarkMode();
                        // On ferme le menu pour voir l'effet global, et au prochain appel le texte sera mis à jour.
                        menu.remove();
                    };
                    menu.appendChild(darkModeItem);

                    // Item 2: Statistiques
                    const statsItem = document.createElement('button');
                    statsItem.className = 'gft-settings-menu-item';
                    const areStatsVisible = document.getElementById('gft-stats-display')?.classList.contains('gft-stats-visible');
                    statsItem.textContent = areStatsVisible ? getTranslation('stats_hide') : getTranslation('stats_show');
                    statsItem.onclick = () => { toggleStatsDisplay(); menu.remove(); };
                    menu.appendChild(statsItem);

                    // Item 3: Masquer les Feats dans l'en-tête (Seulement en FR)
                    if (!isEnglishTranscriptionMode()) {
                        const featItem = document.createElement('button');
                        featItem.className = 'gft-settings-menu-item';
                        featItem.textContent = isHeaderFeatEnabled() ? getTranslation('header_feat_hide') : getTranslation('header_feat_show');
                        featItem.onclick = () => {
                            gftToggleHeaderFeat();
                            menu.remove();
                        };
                        menu.appendChild(featItem);
                    }

                    // Item 4: Saut de ligne après tag
                    const newlineItem = document.createElement('button');
                    newlineItem.className = 'gft-settings-menu-item';
                    newlineItem.textContent = !isTagNewlinesDisabled() ? getTranslation('newline_enable') : getTranslation('newline_disable');
                    newlineItem.onclick = () => {
                        gftToggleTagNewlines();
                        menu.remove();
                    };
                    menu.appendChild(newlineItem);

                    // Item 5: Tutoriel
                    const tutorialItem = document.createElement('button');
                    tutorialItem.className = 'gft-settings-menu-item';
                    tutorialItem.textContent = getTranslation('tutorial_link');
                    tutorialItem.onclick = () => { showTutorial(); menu.remove(); };
                    menu.appendChild(tutorialItem);

                    document.body.appendChild(menu);

                    // Fermeture au clic dehors
                    const closeMenuHandler = (e) => {
                        if (!menu.contains(e.target) && e.target !== settingsButton) {
                            menu.remove();
                            document.removeEventListener('click', closeMenuHandler);
                        }
                    };
                    document.addEventListener('click', closeMenuHandler);
                });


                panelTitle.appendChild(settingsButton);
                addTooltip(settingsButton, 'Paramètres (Mode sombre, Stats, Aide)');



                shortcutsContainerElement.appendChild(panelTitle);
                loadDarkModePreference();

                // Crée le conteneur repliable pour tout le contenu du panneau
                const panelContent = document.createElement('div');
                panelContent.id = 'gft-panel-content';
                if (isCollapsed) {
                    panelContent.classList.add('gft-collapsed');
                }
                // Plus de display inline ici, tout est géré par la classe .gft-collapsed et le CSS

                // Crée l'affichage des statistiques
                const statsDisplay = createStatsDisplay();
                panelContent.appendChild(statsDisplay);

                // Met à jour les statistiques initiales si visibles
                if (statsDisplay.classList.contains('gft-stats-visible')) {
                    updateStatsDisplay();
                }

                // Crée les sélecteurs d'artistes.
                if (detectedArtists.length === 0 && !editorJustAppeared && !editorInstanceChanged) extractSongData();
                createArtistSelectors(panelContent);
                if (currentFeaturingArtists.length > 0 || currentMainArtists.length > 1) { const hrArtists = document.createElement('hr'); panelContent.appendChild(hrArtists); }

                /**
                 * Usine (factory) à boutons : crée un bouton à partir d'une configuration.
                 * @param {object} config - L'objet de configuration du bouton (label, action, etc.).
                 * @param {HTMLElement} parentEl - L'élément parent du bouton.
                 * @param {boolean} isCoupletMainButton - Booléen spécial pour le bouton de couplet principal.
                 * @returns {HTMLButtonElement} Le bouton créé.
                 */
                const createButton = (config, parentEl = panelContent, isCoupletMainButton = false) => {
                    const button = document.createElement('button');
                    button.textContent = typeof config.getLabel === 'function' ? config.getLabel() : config.label;
                    if (config.id) button.id = config.id;
                    button.classList.add('genius-lyrics-shortcut-button');
                    if (config.title) button.title = config.title;
                    button.type = 'button';
                    parentEl.appendChild(button);

                    if (config.isPlusButton) {
                        button.classList.remove('genius-lyrics-shortcut-button');
                        button.classList.add('gft-add-custom-btn');
                        if (config.title) addTooltip(button, config.title);
                        button.onclick = (e) => {
                            e.preventDefault();
                            if (typeof openCustomButtonManager === 'function') openCustomButtonManager(config.managerType || 'structure');
                            else console.error('openCustomButtonManager not found');
                        };
                        return button;
                    }

                    // Ajoute le badge de raccourci si défini
                    if (config.shortcut) {
                        const badge = document.createElement('span');
                        badge.className = 'gft-shortcut-badge';
                        badge.textContent = config.shortcut;
                        button.appendChild(badge);
                    }

                    // Ajoute le tooltip si défini
                    if (config.tooltip) {
                        addTooltip(button, config.tooltip);
                    }
                    // Ajoute l'écouteur d'événement principal qui déclenche l'action du bouton.
                    button.addEventListener('click', (event) => {
                        event.preventDefault();
                        if (!currentActiveEditor) { initLyricsEditorEnhancer(); if (!currentActiveEditor) return; }

                        // Sauvegarde la position du curseur pour les textarea
                        let savedCursorStart = null;
                        let savedCursorEnd = null;
                        if (currentEditorType === 'textarea') {
                            savedCursorStart = currentActiveEditor.selectionStart;
                            savedCursorEnd = currentActiveEditor.selectionEnd;
                        }

                        currentActiveEditor.focus();

                        // Active le flag pour désactiver la sauvegarde automatique pendant toute l'action
                        isButtonActionInProgress = true;
                        if (autoSaveTimeout) {
                            clearTimeout(autoSaveTimeout);
                            autoSaveTimeout = null;
                        }

                        let textToInsertForCouplet = null;
                        let insertionPerformed = false; // Flag pour savoir si une insertion de texte a eu lieu

                        // Logique pour chaque type d'action
                        if (config.action === 'replaceText' && config.searchPattern) {
                            // Sauvegarde dans l'historique avant modification
                            saveToHistory();

                            // Gère le remplacement de texte
                            const replacementValueOrFn = config.replacementFunction || config.replacementText;
                            let replacementsCount = 0;
                            if (currentEditorType === 'textarea') {
                                const originalValue = currentActiveEditor.value; let tempCount = 0;
                                const newValue = originalValue.replace(config.searchPattern, (...matchArgs) => {
                                    tempCount++;
                                    if (typeof replacementValueOrFn === 'function') return replacementValueOrFn(...matchArgs);
                                    return replacementValueOrFn;
                                });
                                if (originalValue !== newValue) {
                                    currentActiveEditor.value = newValue;
                                    currentActiveEditor.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
                                    replacementsCount = tempCount;
                                    // Crée un overlay pour surligner les modifications dans le textarea
                                    createTextareaReplacementOverlay(currentActiveEditor, originalValue, newValue, config.searchPattern);
                                }
                            } else if (currentEditorType === 'div') {
                                replacementsCount = replaceAndHighlightInDiv(currentActiveEditor, config.searchPattern, replacementValueOrFn, config.highlightClass);
                                if (replacementsCount > 0) currentActiveEditor.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
                            }
                            if (replacementsCount > 0) {
                                let itemLabel = "élément(s)";
                                if (config.feedbackKey) {
                                    itemLabel = getTranslation(config.feedbackKey, replacementsCount);
                                } else {
                                    if (config.label.includes("y' → y ")) itemLabel = "occurrence(s) de 'y''";
                                    if (config.label.includes("’ → '")) itemLabel = "apostrophe(s) ’";
                                }
                                showFeedbackMessage(getTranslation('feedback_replaced', replacementsCount).replace('{count}', replacementsCount).replace('{item}', itemLabel), 3000, shortcutsContainerElement);
                            } else {
                                let noCorrectionLabel = "élément(s)";
                                if (config.feedbackKey) {
                                    noCorrectionLabel = getTranslation(config.feedbackKey, 1); // Utilise la forme singulière (souvent génitif pour PL)
                                }
                                showFeedbackMessage(getTranslation('feedback_no_correction_needed').replace('{item}', noCorrectionLabel), 2000, shortcutsContainerElement);
                            }
                        } else if (config.action === 'lineCorrection' && config.correctionType) {
                            // Sauvegarde dans l'historique avant modification
                            saveToHistory();

                            // Gère les corrections ligne par ligne
                            let correctionsCount = 0; let correctionFunction; let feedbackLabel = "";
                            if (config.correctionType === 'spacing') { correctionFunction = correctLineSpacing; feedbackLabel = "espacement(s) de ligne"; }

                            if (correctionFunction) {
                                if (currentEditorType === 'textarea') {
                                    const originalText = currentActiveEditor.value;
                                    const { newText, correctionsCount: count } = correctionFunction(originalText);
                                    if (originalText !== newText) {
                                        currentActiveEditor.value = newText;
                                        currentActiveEditor.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
                                    }
                                    correctionsCount = count;
                                } else if (currentEditorType === 'div') {
                                    correctionsCount = applyTextTransformToDivEditor(currentActiveEditor, correctionFunction);
                                }
                                if (correctionsCount > 0) {
                                    let itemLabel = "élément(s)";
                                    if (config.feedbackKey) itemLabel = getTranslation(config.feedbackKey, correctionsCount);
                                    else itemLabel = feedbackLabel;
                                    showFeedbackMessage(getTranslation('feedback_corrected', correctionsCount).replace('{count}', correctionsCount).replace('{item}', itemLabel), 3000, shortcutsContainerElement);
                                } else {
                                    let noCorrectionLabel = "élément(s)";
                                    if (config.feedbackKey) noCorrectionLabel = getTranslation(config.feedbackKey, 1);
                                    else noCorrectionLabel = feedbackLabel;
                                    showFeedbackMessage(getTranslation('feedback_no_correction_needed').replace('{item}', noCorrectionLabel), 2000, shortcutsContainerElement);
                                }
                            }
                        } else if (config.action === 'globalTextFix') {
                            // Version avec prévisualisation (mode validation)
                            (async () => {
                                try {
                                    const originalText = currentEditorType === 'textarea'
                                        ? currentActiveEditor.value
                                        : currentActiveEditor.textContent || '';

                                    // Calcule les corrections avec barre de progression
                                    const result = await applyAllTextCorrectionsAsync(originalText);

                                    // Cache la barre de progression
                                    hideProgress();

                                    if (result.correctionsCount === 0) {
                                        // Vérifie les brackets AVANT d'afficher le message "Aucune correction"
                                        const editorRef = currentActiveEditor;
                                        const editorTypeRef = currentEditorType;
                                        let unmatchedCount = 0;

                                        console.log('[GFT] Vérification des brackets (cas sans correction texte)...');

                                        if (editorRef) {
                                            unmatchedCount = highlightUnmatchedBracketsInEditor(editorRef, editorTypeRef);
                                            console.log('[GFT] unmatchedCount:', unmatchedCount);
                                        }

                                        if (unmatchedCount > 0) {
                                            // Priorité à l'erreur de parenthèses
                                            showFeedbackMessage(
                                                getTranslation('feedback_brackets_issue').replace('{count}', unmatchedCount),
                                                5000,
                                                shortcutsContainerElement
                                            );
                                        } else {
                                            // Vraiment rien à faire, ou le compte de brackets est à 0.
                                            // Par prudence (si le comptage échoue mais que le surlignage a lieu), on invite à vérifier.
                                            showFeedbackMessage(getTranslation('feedback_no_text_corrections'), 3000, shortcutsContainerElement);
                                        }
                                        return;
                                    }

                                    // Capture les références de l'éditeur pour les callbacks
                                    const editorRef = currentActiveEditor;
                                    const editorTypeRef = currentEditorType;

                                    // Affiche la prévisualisation
                                    showCorrectionPreview(
                                        originalText,
                                        result.newText,
                                        result.corrections,
                                        // Callback si l'utilisateur applique, avec le texte et les stats recalculés
                                        (finalText, finalStats) => {
                                            // Sauvegarde dans l'historique
                                            saveToHistory();

                                            // Applique les corrections
                                            if (editorTypeRef === 'textarea') {
                                                editorRef.value = finalText;
                                                editorRef.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
                                            } else if (editorTypeRef === 'div') {
                                                setEditorContent(finalText);
                                            }

                                            // Construit le message de feedback basé sur les stats finales
                                            const detailsArray = [];
                                            if (finalStats.yPrime > 0) detailsArray.push(getTranslation('feedback_detail_yprime', finalStats.yPrime).replace('{count}', finalStats.yPrime));
                                            if (finalStats.apostrophes > 0) detailsArray.push(getTranslation('feedback_detail_apostrophes', finalStats.apostrophes).replace('{count}', finalStats.apostrophes));
                                            if (finalStats.oeuLigature > 0) detailsArray.push(getTranslation('feedback_detail_oeu', finalStats.oeuLigature).replace('{count}', finalStats.oeuLigature));
                                            if (finalStats.frenchQuotes > 0) detailsArray.push(getTranslation('feedback_detail_quotes', finalStats.frenchQuotes).replace('{count}', finalStats.frenchQuotes));
                                            if (finalStats.longDash > 0) detailsArray.push(getTranslation('feedback_detail_dash', finalStats.longDash).replace('{count}', finalStats.longDash));
                                            if (finalStats.doubleSpaces > 0) detailsArray.push(getTranslation('feedback_detail_spaces', finalStats.doubleSpaces).replace('{count}', finalStats.doubleSpaces));
                                            if (finalStats.spacing > 0) detailsArray.push(getTranslation('feedback_detail_spacing', finalStats.spacing).replace('{count}', finalStats.spacing));

                                            // Recalcule le total count
                                            const totalCount = Object.values(finalStats).reduce((a, b) => a + b, 0);
                                            const lang = localStorage.getItem('gftLanguage') || 'fr';

                                            const message = detailsArray.length > 0
                                                ? getTranslation('feedback_summary_corrected', totalCount).replace('{details}', formatListWithConjunction(detailsArray, lang)).replace('{count}', totalCount)
                                                : getTranslation('feedback_summary_correction', totalCount).replace('{count}', totalCount);

                                            showFeedbackMessage(message, 4500, shortcutsContainerElement);

                                            // Vérifie automatiquement les brackets après les corrections (immédiatement)
                                            console.log('[GFT] Vérification des brackets après corrections...');
                                            console.log('[GFT] editorRef:', editorRef);
                                            console.log('[GFT] editorTypeRef:', editorTypeRef);

                                            if (editorRef) {
                                                const unmatchedCount = highlightUnmatchedBracketsInEditor(editorRef, editorTypeRef);
                                                console.log('[GFT] unmatchedCount:', unmatchedCount);

                                                // Affiche le résultat après un délai pour ne pas écraser le premier message
                                                setTimeout(() => {
                                                    if (unmatchedCount > 0) {
                                                        const pluriel = unmatchedCount > 1 ? 's' : '';
                                                        showFeedbackMessage(
                                                            `⚠️ ${unmatchedCount} parenthèse${pluriel}/crochet${pluriel} non apparié${pluriel} détecté${pluriel} et surligné${pluriel} en rouge !`,
                                                            5000,
                                                            shortcutsContainerElement
                                                        );
                                                    } else {
                                                        // Idem ici : pas de notification de succès si tout est OK, seulement les erreurs.
                                                        // showFeedbackMessage("✅ Toutes les parenthèses et crochets sont bien appariés.", 3000, shortcutsContainerElement);
                                                    }
                                                }, 4600);
                                            } else {
                                                console.log('[GFT] editorRef est null, impossible de vérifier les brackets');
                                            }
                                        },
                                        // Callback si l'utilisateur annule
                                        () => {
                                            showFeedbackMessage(getTranslation('feedback_corrections_cancelled'), 2000, shortcutsContainerElement);
                                        }
                                    );
                                } catch (error) {
                                    hideProgress();
                                    console.error('Erreur lors des corrections:', error);
                                    showFeedbackMessage("❌ Erreur lors des corrections", 3000, shortcutsContainerElement);
                                }
                            })();
                        } else if (config.action === 'checkBrackets') {
                            // Vérifie et surligne les parenthèses et crochets non appariés
                            const unmatchedCount = highlightUnmatchedBracketsInEditor(currentActiveEditor, currentEditorType);

                            if (unmatchedCount > 0) {
                                showFeedbackMessage(
                                    getTranslation('feedback_brackets_issue').replace('{count}', unmatchedCount),
                                    5000,
                                    shortcutsContainerElement
                                );
                            } else {
                                showFeedbackMessage(
                                    getTranslation('feedback_brackets_ok'),
                                    3000,
                                    shortcutsContainerElement
                                );
                            }
                        } else if (config.action === 'duplicateLine') {
                            // Duplique la ligne actuelle
                            saveToHistory();

                            if (currentEditorType === 'textarea') {
                                const text = currentActiveEditor.value;
                                const cursorPos = currentActiveEditor.selectionStart;

                                // Trouve le début et la fin de la ligne actuelle
                                let lineStart = text.lastIndexOf('\n', cursorPos - 1) + 1;
                                let lineEnd = text.indexOf('\n', cursorPos);
                                if (lineEnd === -1) lineEnd = text.length;

                                const currentLine = text.substring(lineStart, lineEnd);
                                const newText = text.substring(0, lineEnd) + '\n' + currentLine + text.substring(lineEnd);

                                currentActiveEditor.value = newText;
                                currentActiveEditor.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));

                                // Place le curseur au début de la nouvelle ligne
                                const newCursorPos = lineEnd + 1 + currentLine.length;
                                currentActiveEditor.setSelectionRange(newCursorPos, newCursorPos);

                                showFeedbackMessage(getTranslation('feedback_duplicate_line'), 2000, shortcutsContainerElement);
                            } else if (currentEditorType === 'div') {
                                // Pour les divs, on utilise execCommand
                                const selection = window.getSelection();
                                if (selection.rangeCount > 0) {
                                    const range = selection.getRangeAt(0);
                                    const node = range.startContainer;
                                    let lineText = '';

                                    if (node.nodeType === Node.TEXT_NODE) {
                                        lineText = node.textContent;
                                    } else if (node.textContent) {
                                        lineText = node.textContent;
                                    }

                                    if (lineText) {
                                        document.execCommand('insertText', false, '\n' + lineText);
                                        currentActiveEditor.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
                                        showFeedbackMessage(getTranslation('feedback_duplicate_line'), 2000, shortcutsContainerElement);
                                    }
                                }
                            }
                        } else if (config.action === 'wrapSelection') {
                            // Entoure la sélection avec les caractères spécifiés
                            let selectedText = '';

                            if (currentEditorType === 'textarea') {
                                const start = currentActiveEditor.selectionStart;
                                const end = currentActiveEditor.selectionEnd;

                                if (start !== end) {
                                    saveToHistory();
                                    selectedText = currentActiveEditor.value.substring(start, end);
                                    const wrappedText = config.wrapStart + selectedText + config.wrapEnd;

                                    currentActiveEditor.setSelectionRange(start, end);
                                    document.execCommand('insertText', false, wrappedText);

                                    showFeedbackMessage(getTranslation('feedback_wrapped').replace('{start}', config.wrapStart).replace('{end}', config.wrapEnd), 2000, shortcutsContainerElement);
                                } else {
                                    showFeedbackMessage(getTranslation('feedback_select_text_first'), 2000, shortcutsContainerElement);
                                }
                            } else if (currentEditorType === 'div') {
                                const selection = window.getSelection();
                                if (selection.rangeCount > 0 && !selection.isCollapsed) {
                                    saveToHistory();
                                    selectedText = selection.toString();
                                    const wrappedText = config.wrapStart + selectedText + config.wrapEnd;

                                    document.execCommand('insertText', false, wrappedText);
                                    currentActiveEditor.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));

                                    showFeedbackMessage(getTranslation('feedback_wrapped').replace('{start}', config.wrapStart).replace('{end}', config.wrapEnd), 2000, shortcutsContainerElement);
                                } else {
                                    showFeedbackMessage(getTranslation('feedback_select_text_first'), 2000, shortcutsContainerElement);
                                }
                            }
                        }
                        else {
                            // Action par défaut : insérer du texte (tags, etc.).
                            let textToInsert;
                            if (typeof config.getText === 'function') {
                                textToInsert = config.getText();
                                if (isCoupletMainButton) {
                                    textToInsertForCouplet = textToInsert;
                                }
                            }
                            else if (typeof config.text !== 'undefined') {
                                textToInsert = config.text;
                            }

                            if (typeof textToInsert !== 'undefined' && textToInsert !== null && currentActiveEditor) {
                                // Sauvegarde dans l'historique avant insertion
                                saveToHistory();
                                document.execCommand('insertText', false, textToInsert);
                                insertionPerformed = true;
                            }
                        }

                        // Logique spécifique au bouton de couplet
                        if (isCoupletMainButton && textToInsertForCouplet !== null) {
                            coupletCounter++;
                            button.textContent = config.getLabel();
                        } else if (typeof config.getLabel === 'function' && !isCoupletMainButton) {
                            button.textContent = config.getLabel();
                        }

                        // Restaure la position du curseur pour éviter le "jumpscare" du scroll
                        // SAUF si une insertion a eu lieu, auquel cas on veut que le curseur soit à la fin du texte inséré
                        if (!insertionPerformed && currentEditorType === 'textarea' && savedCursorStart !== null && savedCursorEnd !== null) {
                            currentActiveEditor.setSelectionRange(savedCursorStart, savedCursorEnd);
                        }

                        currentActiveEditor.focus();

                        // Désactive le flag après un court délai et met à jour lastSavedContent
                        setTimeout(() => {
                            isButtonActionInProgress = false;
                            if (currentActiveEditor) {
                                lastSavedContent = getCurrentEditorContent();
                                hasUnsavedChanges = false;
                            }
                        }, 150);
                    });
                    return button;
                };

                // 3. Construction du Panneau (Nouveau Design v2.6.1)
                const buttonGroupsContainer = document.createElement('div');
                buttonGroupsContainer.id = 'gftButtonGroupsContainer';
                panelContent.appendChild(buttonGroupsContainer);

                // --- SECTION 1: STRUCTURE ---
                const structureSection = document.createElement('div');
                // structureSection.className = 'gft-section'; // Pas de bordure pour la première section
                structureSection.style.marginTop = '10px';

                const structureLabel = document.createElement('div');
                structureLabel.className = 'gft-section-label';
                structureLabel.textContent = getTranslation('section_structure');
                structureSection.appendChild(structureLabel);

                // Conteneur unique pour tout le monde (Couplet Control + Autres boutons)
                const structuralButtonsContainer = document.createElement('div');
                structuralButtonsContainer.style.display = 'flex';
                structuralButtonsContainer.style.flexWrap = 'wrap';
                structuralButtonsContainer.style.gap = '5px';
                structuralButtonsContainer.style.alignItems = 'center';

                // 1.1 Couplet Manager Unifié (Ajouté DANS le conteneur flex)
                if (SHORTCUTS.TAGS_STRUCTURAUX && SHORTCUTS.TAGS_STRUCTURAUX[0]) {
                    const coupletManagerConfig = SHORTCUTS.TAGS_STRUCTURAUX[0].buttons.find(b => b.type === 'coupletManager');

                    if (coupletManagerConfig) {
                        const coupletControl = document.createElement('div');
                        coupletControl.className = 'gft-couplet-control';

                        // Bouton Précédent
                        const prevBtn = document.createElement('button');
                        prevBtn.className = 'gft-couplet-btn';
                        prevBtn.textContent = '←'; // ou coupletManagerConfig.prev.label
                        prevBtn.onclick = (e) => {
                            e.stopPropagation();
                            if (coupletCounter > 1) {
                                coupletCounter--;
                                const mainLabel = document.getElementById(COUPLET_BUTTON_ID);
                                if (mainLabel) mainLabel.textContent = coupletManagerConfig.main.getLabel();
                            }
                        };
                        coupletControl.appendChild(prevBtn);

                        // Label Central (Bouton principal qui insère)
                        const mainBtn = createButton(coupletManagerConfig.main, coupletControl, true);
                        mainBtn.className = ''; // Reset default class
                        mainBtn.classList.add('gft-couplet-btn', 'gft-couplet-main');
                        // L'event listener est déjà attaché par createButton

                        // Bouton Suivant
                        const nextBtn = document.createElement('button');
                        nextBtn.className = 'gft-couplet-btn';
                        nextBtn.textContent = '→';
                        nextBtn.onclick = (e) => {
                            e.stopPropagation();
                            coupletCounter++;
                            const mainLabel = document.getElementById(COUPLET_BUTTON_ID);
                            if (mainLabel) mainLabel.textContent = coupletManagerConfig.main.getLabel();
                        };
                        coupletControl.appendChild(nextBtn);

                        structuralButtonsContainer.appendChild(coupletControl);
                    }
                }

                // 1.2 Autres Tags Structurels
                if (SHORTCUTS.TAGS_STRUCTURAUX) {
                    SHORTCUTS.TAGS_STRUCTURAUX.forEach(groupConfig => {
                        groupConfig.buttons.forEach(shortcut => {
                            if (shortcut.type === 'coupletManager') return; // Déjà géré au dessus

                            const btn = createButton(shortcut, structuralButtonsContainer);
                            btn.classList.add('gft-btn-secondary'); // Style secondaire pour les tags
                        });
                    });
                }
                structureSection.appendChild(structuralButtonsContainer);
                buttonGroupsContainer.appendChild(structureSection);


                // --- SECTION 2: OUTILS & NETTOYAGE ---
                const toolsSection = document.createElement('div');
                toolsSection.className = 'gft-section';

                const toolsLabel = document.createElement('div');
                toolsLabel.className = 'gft-section-label';
                toolsLabel.textContent = getTranslation('section_cleanup');
                toolsSection.appendChild(toolsLabel);

                const utilityContainer = document.createElement('div');
                utilityContainer.style.display = 'flex';
                utilityContainer.style.flexWrap = 'wrap';
                utilityContainer.style.gap = '6px'; // Un peu plus d'espace

                if (SHORTCUTS.TEXT_CLEANUP && SHORTCUTS.TEXT_CLEANUP.length > 0) {
                    SHORTCUTS.TEXT_CLEANUP.forEach(s => {
                        const btn = createButton(s, utilityContainer);

                        // Uniformisation du style pour tous les boutons de nettoyage
                        btn.classList.add('gft-btn-utility');

                        // Raccourcir les labels si défini dans la config (via shortLabel)
                        if (s.shortLabel) {
                            btn.textContent = s.shortLabel;
                        } else {
                            // Nettoyage cosmétique par défaut pour les flèches
                            btn.textContent = s.label.replace(' → ', '→');
                        }

                        // Ajouter une tooltip si elle n'existe pas déjà (déjà géré par createButton via s.tooltip, mais on s'assure que le bouton reste compréhensible)
                    });
                }
                toolsSection.appendChild(utilityContainer);
                buttonGroupsContainer.appendChild(toolsSection);


                // --- SECTION 3: ACTIONS PRINCIPALES ---
                const mainActionsSection = document.createElement('div');
                mainActionsSection.className = 'gft-section';
                mainActionsSection.style.marginTop = '12px'; // Un peu plus détaché
                mainActionsSection.style.borderTop = 'none'; // Pas de ligne, juste de l'espace

                const mainActionsContainer = document.createElement('div');
                mainActionsContainer.style.display = 'flex';
                mainActionsContainer.style.gap = '10px';
                mainActionsContainer.style.width = '100%';

                if (SHORTCUTS.GLOBAL_FIXES && SHORTCUTS.GLOBAL_FIXES.length > 0) {
                    SHORTCUTS.GLOBAL_FIXES.forEach(s => {
                        const btn = createButton(s, mainActionsContainer);
                        btn.classList.add('gft-btn-primary', 'gft-btn-main-action');
                        btn.style.flex = '1';
                        btn.style.justifyContent = 'center';

                        // Ajout d'icônes si possible et usage de shortLabel
                        if (s.shortLabel) btn.textContent = s.shortLabel;
                        else if (s.label.includes('Tout Corriger')) btn.innerHTML = s.label;
                        else if (s.label.includes('Vérifier')) btn.innerHTML = s.label;
                    });
                }
                mainActionsSection.appendChild(mainActionsContainer);
                buttonGroupsContainer.appendChild(mainActionsSection);


                // --- ZONE DE FEEDBACK & PROGRESSION (Intégré) ---
                const feedbackContainer = document.createElement('div');
                feedbackContainer.style.marginTop = '0px'; // Reduced from 10px to avoid empty space
                feedbackContainer.style.width = '100%';


                // Message de feedback (toast intégré)
                const feedbackMessage = document.createElement('div');
                feedbackMessage.id = FEEDBACK_MESSAGE_ID; // 'gft-feedback-message'
                feedbackMessage.style.display = 'none';
                feedbackMessage.style.padding = '8px';
                feedbackMessage.style.borderRadius = '4px';
                feedbackMessage.style.fontSize = '12px';
                feedbackMessage.style.textAlign = 'center';
                feedbackMessage.style.marginTop = '5px';
                feedbackMessage.style.marginBottom = '5px';
                feedbackMessage.style.fontWeight = 'bold';
                feedbackContainer.appendChild(feedbackMessage);

                // Barre de progression
                const progressContainer = document.createElement('div');
                progressContainer.id = 'gft-progress-container';
                progressContainer.className = 'gft-progress-container';
                progressContainer.style.display = 'none';

                const progressBar = document.createElement('div');
                progressBar.id = 'gft-progress-bar';
                progressBar.className = 'gft-progress-bar';

                const progressText = document.createElement('div');
                progressText.id = 'gft-progress-text';
                progressText.className = 'gft-progress-text';
                progressText.textContent = '0%';

                progressContainer.appendChild(progressBar);
                progressContainer.appendChild(progressText);
                feedbackContainer.appendChild(progressContainer);

                panelContent.appendChild(feedbackContainer);


                // Ajoute le footer
                const footerContainer = document.createElement('div');
                footerContainer.id = 'gft-footer-container';
                footerContainer.style.display = 'flex';
                footerContainer.style.justifyContent = 'space-between';
                footerContainer.style.alignItems = 'center';
                footerContainer.style.marginTop = '5px'; // Reduced from 15px
                footerContainer.style.paddingTop = '5px';
                footerContainer.style.borderTop = '1px solid rgba(0,0,0,0.05)';


                const creditLabel = document.createElement('div');
                creditLabel.id = 'gft-credit-label';
                creditLabel.textContent = 'Made with ❤️ by Lnkhey';
                creditLabel.style.fontSize = '10px';
                creditLabel.style.color = '#888';
                creditLabel.style.opacity = '0.6';
                creditLabel.style.userSelect = 'none';

                // Lien discret vers Transcription IA (uniquement en mode français)
                if (!isEnglishTranscriptionMode() && !isPolishTranscriptionMode()) {
                    const iaLink = document.createElement('a');
                    iaLink.textContent = '🤖 Transcription IA ↗';
                    iaLink.href = 'https://aistudio.google.com/apps/drive/1D16MbaGAWjUMTseOvzzvSDnccRbU-z_S?fullscreenApplet=true&showPreview=true&showAssistant=true';
                    iaLink.target = '_blank';
                    iaLink.rel = 'noopener noreferrer';
                    iaLink.style.fontSize = '10px';
                    iaLink.style.color = '#888';
                    iaLink.style.textDecoration = 'none';
                    iaLink.style.opacity = '0.6';
                    iaLink.style.cursor = 'pointer';
                    iaLink.style.transition = 'opacity 0.2s ease';
                    iaLink.title = 'Ouvrir l\'outil de transcription IA';

                    iaLink.addEventListener('mouseenter', () => {
                        iaLink.style.opacity = '1';
                        iaLink.style.textDecoration = 'underline';
                    });
                    iaLink.addEventListener('mouseleave', () => {
                        iaLink.style.opacity = '0.6';
                        iaLink.style.textDecoration = 'none';
                    });

                    footerContainer.appendChild(iaLink);
                }

                const versionLabel = document.createElement('div');
                versionLabel.id = 'gft-version-label';
                versionLabel.textContent = 'v3.0.1'; // Bump version visuelle pour le user
                versionLabel.title = 'Genius Fast Transcriber v3.0.1 - Nouvelle Interface Premium';

                footerContainer.appendChild(creditLabel);
                footerContainer.appendChild(versionLabel);
                panelContent.appendChild(footerContainer);
                shortcutsContainerElement.appendChild(panelContent);

                // 4. Injecte le panneau complet dans la page.
                targetStickySection.prepend(shortcutsContainerElement);

                // Lance le tutoriel au premier lancement
                if (isFirstLaunch()) {
                    setTimeout(() => {
                        showTutorial();
                    }, 1500);
                }

            } else {
                // Si le panneau existe déjà, on met à jour les données si la page a changé (navigation SPA)
                if (document.title !== (window._gftLastPageTitle || "")) {
                    extractSongData();
                    const artistSelContainer = shortcutsContainerElement.querySelector(`#${ARTIST_SELECTOR_CONTAINER_ID}`);
                    if (artistSelContainer && artistSelContainer.parentNode) createArtistSelectors(artistSelContainer.parentNode);
                    else if (shortcutsContainerElement) createArtistSelectors(shortcutsContainerElement);
                }
                if (shortcutsContainerElement) loadDarkModePreference();
            }
            window._gftLastPageTitle = document.title;
            hideGeniusFormattingHelper();
            // Met à jour le label du bouton couplet
            if (shortcutsContainerElement) {
                const coupletButton = shortcutsContainerElement.querySelector(`#${COUPLET_BUTTON_ID}`);
                if (coupletButton && SHORTCUTS.TAGS_STRUCTURAUX && SHORTCUTS.TAGS_STRUCTURAUX[0]) {
                    const coupletManagerConfig = SHORTCUTS.TAGS_STRUCTURAUX[0].buttons.find(b => b.type === 'coupletManager');
                    if (coupletManagerConfig) {
                        coupletButton.textContent = coupletManagerConfig.main.getLabel();
                    }
                }
            }
        } else {
            if (shortcutsContainerElement) { shortcutsContainerElement.remove(); shortcutsContainerElement = null; }
        }
    } else {
        if (shortcutsContainerElement) { shortcutsContainerElement.remove(); shortcutsContainerElement = null; }
    }
}

/**
 * Démarre le MutationObserver pour surveiller les changements dynamiques dans le DOM.
 * C'est essentiel pour les sites de type SPA (Single Page Application) comme Genius.
 */
function startObserver() {
    if (!document.body) { setTimeout(startObserver, 100); return; } // Attend que le body soit prêt.
    if (observer && typeof observer.disconnect === 'function') { observer.disconnect(); } // Déconnecte l'ancien observateur.
    observer = new MutationObserver((mutationsList, currentObsInstance) => {
        // La fonction de rappel est exécutée à chaque changement détecté dans le DOM.
        let editorAppeared = false; let controlsAppeared = false;
        for (const mutation of mutationsList) { if (mutation.type === 'childList') { if (mutation.addedNodes.length > 0) { mutation.addedNodes.forEach(node => { if (node.nodeType === Node.ELEMENT_NODE && typeof node.matches === 'function') { if (node.matches(SELECTORS.TEXTAREA_EDITOR) || node.matches(SELECTORS.DIV_EDITOR)) editorAppeared = true; if (node.matches(SELECTORS.CONTROLS_STICKY_SECTION)) controlsAppeared = true; } }); } } }
        const editorNowExistsInDOM = document.querySelector(SELECTORS.TEXTAREA_EDITOR) || document.querySelector(SELECTORS.DIV_EDITOR);
        const editorVanished = currentActiveEditor && !document.body.contains(currentActiveEditor);
        // Si l'éditeur apparaît ou disparaît, on relance l'initialisation.
        if (editorAppeared || controlsAppeared || (!currentActiveEditor && editorNowExistsInDOM) || editorVanished) {
            // On se déconnecte temporairement pour éviter les boucles infinies.
            currentObsInstance.disconnect();
            initLyricsEditorEnhancer();

            // On vérifie aussi les iframes YouTube pour injecter l'API
            enableYoutubeJsApi();

            // On se reconnecte après un court délai.
            setTimeout(() => { startObserver(); }, 200);
        } else {
            // Même sans re-init complet, on vérifie si de nouveaux iframes sont apparus
            enableYoutubeJsApi();
        }
    });
    // Commence à observer le `body` et tous ses descendants.
    try { observer.observe(document.body, { childList: true, subtree: true }); } catch (e) { console.error("[Observer] Erreur initiale:", e); }
    // Fait un premier appel pour gérer le cas où l'éditeur est déjà présent au chargement.
    initLyricsEditorEnhancer();

    // Si on est sur une page de chanson (même sans éditeur), on extrait les métadonnées et on prépare la toolbar
    const isSongPage = document.querySelector('meta[property="og:type"][content="music.song"]') !== null || window.location.pathname.includes('-lyrics');
    if (isSongPage) {
        extractSongData();
        createFloatingFormattingToolbar();
    }
}

// ----- Démarrage du Script -----

// Gère le chargement initial de la page.
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { applyStoredPreferences(); startObserver(); });
else { applyStoredPreferences(); startObserver(); }

// Ajoute des écouteurs d'événements pour gérer la navigation SPA.
window.addEventListener('load', () => { applyStoredPreferences(); initLyricsEditorEnhancer(); });
window.addEventListener('popstate', () => { applyStoredPreferences(); initLyricsEditorEnhancer(); });
window.addEventListener('hashchange', () => { applyStoredPreferences(); initLyricsEditorEnhancer(); });

// Écoute les changements de sélection pour afficher la barre d'outils flottante
document.addEventListener('selectionchange', handleSelectionChange);
document.addEventListener('mouseup', () => {
    setTimeout(handleSelectionChange, 10);
});

// Écoute les raccourcis clavier
document.addEventListener('keydown', handleKeyboardShortcut);

// Cache la barre flottante quand on scroll la page
window.addEventListener('scroll', hideFloatingToolbar, true);

// Crée la barre d'outils flottante dès que le DOM est prêt
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => {
        createFloatingFormattingToolbar();
    }, 500);
} else {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            createFloatingFormattingToolbar();
        }, 500);
    });
}

// Nettoie les ressources lorsque l'utilisateur quitte la page.
window.addEventListener('beforeunload', () => {
    if (observer && typeof observer.disconnect === 'function') observer.disconnect();
    if (shortcutsContainerElement) shortcutsContainerElement.remove();
    if (floatingFormattingToolbar) floatingFormattingToolbar.remove();
    delete window._gftLastPageTitle;
});

// ----- Fonctions pour la Lyrics Card -----

/**
 * Extrait l'URL de l'image de l'artiste depuis la page.
 */
/**
 * Extrait l'URL de l'image de l'artiste depuis la page.
 */
function extractArtistImage() {
    const cleanUrl = (url) => {
        if (!url) return null;
        try {
            // 1. Unwrap Genius Proxy (t2.genius.com/unsafe/...)
            // Genius utilise un proxy pour redimensionner, mais cela peut causer des problèmes de CORS ou fournit une URL encodée.
            // On essaie de récupérer l'URL originale de l'image (souvent images.genius.com).
            if (url.includes('genius.com/unsafe/')) {
                const unsafeSplit = url.split('/unsafe/');
                if (unsafeSplit.length > 1) {
                    let remainder = unsafeSplit[1];
                    // Remainder peut être "344x344/https%3A%2F%2F..." ou directement l'url
                    // On cherche le début du protocole (http ou https, encodé ou non)

                    // Cas encodé: http%3A or https%3A
                    const encodedProtocolIndex = remainder.search(/https?%3A/i);
                    if (encodedProtocolIndex !== -1) {
                        remainder = remainder.substring(encodedProtocolIndex);
                        return decodeURIComponent(remainder);
                    }

                    // Cas non encodé: http: or https:
                    const protocolIndex = remainder.search(/https?:/i);
                    if (protocolIndex !== -1) {
                        return remainder.substring(protocolIndex);
                    }
                }
            }

            // 2. Decode Encoded URL standard (si on a raté le proxy ou autre cas)
            if (url.includes('%3A') || url.includes('%2F')) {
                return decodeURIComponent(url);
            }

            return url;
        } catch (e) {
            console.warn("[GFT] Erreur decoding URL:", e);
            return url;
        }
    };

    // 1. Avatar dans le Header de la chanson (nouveau design)
    // C'est le plus susceptible d'être l'image de profil de l'artiste (distincte de la cover)
    const headerAvatar = document.querySelector('div[class*="SongHeader"] a[href*="/artists/"] img');
    if (headerAvatar && headerAvatar.src) return cleanUrl(headerAvatar.src);

    // 2. Sidebar "About Artist"
    const aboutImg = document.querySelector('[class*="AboutArtist__Container"] img') ||
        document.querySelector('[class*="ArtistAvatar__Image"]');
    if (aboutImg && aboutImg.src) return cleanUrl(aboutImg.src);

    // 3. Meta Tag spécifique Genius (Fallback)
    // Attention: parfois identique à la cover si pas d'image spécifique définie
    const metaImg = document.querySelector('meta[property="genius:track_artist_image"]');
    if (metaImg && metaImg.content) return cleanUrl(metaImg.content);

    // 4. Recherche générique par nom d'artiste
    if (typeof currentMainArtists !== 'undefined' && currentMainArtists.length > 0) {
        const artistName = currentMainArtists[0];
        const candidate = Array.from(document.querySelectorAll('img')).find(img => {
            const src = img.src || '';
            const alt = img.alt || '';
            return alt.includes(artistName) &&
                src.includes('images.genius.com') &&
                !src.includes('pixel') &&
                !src.includes('placeholder') &&
                (src.includes('avatar') || src.includes('profile') || img.width === img.height);
        });
        if (candidate) return cleanUrl(candidate.src);
    }

    return null;
}

/**
 * Dessine la Lyric Card sur un canvas cible.
 */
function renderLyricCardToCanvas(canvas, text, artistName, songTitle, imageObj, footerColor, textColor, logoObj, format = '16:9') {
    const ctx = canvas.getContext('2d');

    // Définition des dimensions selon le format
    let WIDTH, HEIGHT, FOOTER_HEIGHT, FONT_SIZE_TEXT, LINE_HEIGHT_TEXT, FONT_SIZE_FOOTER;

    if (format === '1:1') {
        WIDTH = 1080;
        HEIGHT = 1080;
        FOOTER_HEIGHT = 160; // Footer ajusté
        FONT_SIZE_TEXT = 54;
        LINE_HEIGHT_TEXT = 90;
        FONT_SIZE_FOOTER = 32;
    } else {
        // Défaut 16:9
        WIDTH = 1280;
        HEIGHT = 720;
        FOOTER_HEIGHT = 140;
        FONT_SIZE_TEXT = 48;
        LINE_HEIGHT_TEXT = 80;
        FONT_SIZE_FOOTER = 28;
    }

    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    // 1. Dessine le fond (Image zoomée pour remplir)
    const imgRatio = imageObj.width / imageObj.height;
    const canvasRatio = WIDTH / HEIGHT;
    let renderWidth, renderHeight, offsetX, offsetY;

    if (imgRatio > canvasRatio) {
        renderHeight = HEIGHT;
        renderWidth = imageObj.width * (HEIGHT / imageObj.height);
        offsetX = (WIDTH - renderWidth) / 2;
        offsetY = 0;
    } else {
        renderWidth = WIDTH;
        renderHeight = imageObj.height * (WIDTH / imageObj.width);
        offsetX = 0;
        offsetY = (HEIGHT - renderHeight) / 2;
    }
    ctx.drawImage(imageObj, offsetX, offsetY, renderWidth, renderHeight);

    // 2. Dessine le Footer
    ctx.fillStyle = footerColor;
    ctx.fillRect(0, HEIGHT - FOOTER_HEIGHT, WIDTH, FOOTER_HEIGHT);

    // Contour au dessus du footer
    ctx.fillStyle = textColor;
    ctx.fillRect(0, HEIGHT - FOOTER_HEIGHT, WIDTH, 3);

    // 4. Logo GENIUS
    const logoHeight = 40;
    let logoWidth = 0; // Sera calculé

    // On prépare le logo pour connaître sa largeur et placer le texte ensuite ou avant
    if (logoObj) {
        logoWidth = logoObj.width * (logoHeight / logoObj.height);
    } else {
        // Fallback text "GENIUS" width approximation
        ctx.save();
        ctx.font = '900 36px "Programme", "Arial Black", sans-serif';
        ctx.letterSpacing = "4px";
        logoWidth = ctx.measureText("G E N I U S").width;
        ctx.restore();
    }

    // Position du logo (droite)
    const logoX = WIDTH - 60 - logoWidth;

    // 3. Texte Artiste / Titre
    ctx.font = `normal ${FONT_SIZE_FOOTER}px "Programme", "Arial", sans-serif`;
    ctx.fillStyle = textColor;
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = "2px";

    // Construction du texte complet
    const footerText = `${artistName.toUpperCase()}, "${songTitle.toUpperCase()}"`;

    // Calcul de l'espace disponible
    // Marge gauche (60) + Texte + Marge (environ 40) + Logo + Marge droite (60)
    // Espace max pour le texte = LogoX - Marge - 60 (début texte)
    const maxFooterTextWidth = logoX - 40 - 60;

    // Mesure et troncature si nécessaire
    let displayText = footerText;
    let textWidth = ctx.measureText(displayText).width;

    if (textWidth > maxFooterTextWidth) {
        // Algorithme de troncature
        // On enlève des caractères tant que ça dépasse, puis on ajoute "..."
        while (textWidth > maxFooterTextWidth && displayText.length > 0) {
            displayText = displayText.slice(0, -1);
            textWidth = ctx.measureText(displayText + "...").width;
        }
        displayText += "...";
    }

    ctx.fillText(displayText, 60, HEIGHT - (FOOTER_HEIGHT / 2));
    ctx.letterSpacing = "0px";

    // Dessin du Logo après le texte
    if (logoObj) {
        ctx.drawImage(logoObj, logoX, HEIGHT - (FOOTER_HEIGHT / 2) - (logoHeight / 2), logoWidth, logoHeight);
    } else {
        ctx.save();
        ctx.textAlign = 'left'; // On dessine depuis logoX
        ctx.font = '900 36px "Programme", "Arial Black", sans-serif';
        ctx.letterSpacing = "4px";
        ctx.fillStyle = textColor;
        ctx.fillText("G E N I U S", logoX, HEIGHT - (FOOTER_HEIGHT / 2)); // Corrigé position Y centré
        ctx.restore();
    }

    // 5. Dessine les paroles
    const maxTextWidth = WIDTH - 120;
    const fontSize = FONT_SIZE_TEXT;
    const lineHeight = LINE_HEIGHT_TEXT;
    ctx.font = `300 ${fontSize}px "Programme", "Arial", sans-serif`;

    const originalLines = text.split(/\r?\n/);
    const lines = [];

    originalLines.forEach(originalLine => {
        const trimmedLine = originalLine.trim();
        if (!trimmedLine) return;
        const words = trimmedLine.split(/\s+/);
        let currentLine = words[0];
        for (let i = 1; i < words.length; i++) {
            const width = ctx.measureText(currentLine + " " + words[i]).width;
            if (width < maxTextWidth) {
                currentLine += " " + words[i];
            } else {
                lines.push(currentLine);
                currentLine = words[i];
            }
        }
        lines.push(currentLine);
    });

    const textBottomMargin = 35;
    let startY = HEIGHT - FOOTER_HEIGHT - textBottomMargin - (lines.length * lineHeight);

    const lyricsBackgroundColor = textColor === 'white' ? 'white' : 'black';
    const lyricsTextColor = textColor === 'white' ? 'black' : 'white';

    lines.forEach((line, index) => {
        const y = startY + (index * lineHeight);
        const lineWidth = ctx.measureText(line).width;
        const padding = 10;
        const rectTop = y - fontSize + 12;
        const rectHeight = fontSize + 24;

        ctx.fillStyle = lyricsBackgroundColor;
        ctx.fillRect(60 - padding, rectTop, lineWidth + (padding * 2), rectHeight);

        ctx.fillStyle = lyricsTextColor;
        ctx.fillText(line, 60, y);
    });
}


/**
 * Affiche le modal de prévisualisation de la Lyric Card.
 */
function showLyricCardPreviewModal(text, artistName, songTitle, albumUrl, artistUrl) {
    // Supprime l'ancien modal
    const existing = document.getElementById('gft-lyric-card-modal');
    if (existing) existing.remove();

    const isDarkMode = localStorage.getItem(DARK_MODE_STORAGE_KEY) === 'true';

    // Création du Modal
    const overlay = document.createElement('div');
    overlay.id = 'gft-lyric-card-modal';
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.85); z-index: 10001;
        display: flex; justify-content: center; align-items: center;
        backdrop-filter: blur(5px);
    `;

    const modal = document.createElement('div');
    modal.className = isDarkMode ? 'gft-preview-modal gft-dark-mode' : 'gft-preview-modal';
    modal.style.cssText = `
        position: relative;
        top: auto;
        left: auto;
        transform: none;
        background: ${isDarkMode ? '#222' : 'white'};
        color: ${isDarkMode ? '#eee' : '#222'};
        padding: 30px 20px 20px 20px; border-radius: 12px;
        max-width: 90%; max-height: 90vh;
        display: flex; flex-direction: column; gap: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    `;

    // Bouton Fermer (Croix en haut à droite)
    const closeIcon = document.createElement('button');
    closeIcon.innerHTML = '&times;';
    closeIcon.style.cssText = `
        position: absolute; top: 10px; right: 15px;
        background: none; border: none; font-size: 28px;
        color: ${isDarkMode ? '#aaa' : '#666'}; cursor: pointer;
        line-height: 1; padding: 0;
    `;
    closeIcon.onmouseover = () => closeIcon.style.color = isDarkMode ? 'white' : 'black';
    closeIcon.onmouseout = () => closeIcon.style.color = isDarkMode ? '#aaa' : '#666';
    closeIcon.onclick = () => overlay.remove();
    modal.appendChild(closeIcon);

    const title = document.createElement('h3');
    title.style.margin = '0';
    title.style.display = 'flex';
    title.style.alignItems = 'baseline';
    title.style.gap = '8px';

    // Texte du titre
    const titleText = document.createTextNode(getTranslation('lc_modal_title'));
    title.appendChild(titleText);

    // Indicateur de version
    const versionSpan = document.createElement('span');
    versionSpan.textContent = 'v2.7.1';
    versionSpan.style.fontSize = '11px';
    versionSpan.style.color = isDarkMode ? '#888' : '#aaa';
    versionSpan.style.fontWeight = 'normal';
    versionSpan.style.fontFamily = 'monospace';
    title.appendChild(versionSpan);

    modal.appendChild(title);

    const canvasContainer = document.createElement('div');
    canvasContainer.style.cssText = 'overflow: hidden; border-radius: 8px; border: 2px solid #555; display: flex; justify-content: center;';

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'max-width: 100%; max-height: 60vh; width: auto; height: auto; display: block;';
    canvasContainer.appendChild(canvas);
    modal.appendChild(canvasContainer);

    const controls = document.createElement('div');
    controls.style.cssText = 'display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;';

    // Sélecteur d'image / Artiste
    const imageSelector = document.createElement('select');
    imageSelector.className = 'gft-tutorial-button';
    imageSelector.style.background = isDarkMode ? '#444' : '#eee';
    imageSelector.style.color = isDarkMode ? 'white' : 'black';
    imageSelector.style.maxWidth = '200px';
    imageSelector.style.cursor = 'pointer';

    // Option par défaut : Album
    const optionAlbum = document.createElement('option');
    optionAlbum.value = 'ALBUM';
    optionAlbum.text = getTranslation('lc_album_default');
    imageSelector.appendChild(optionAlbum);

    // Ajout des artistes détectés
    const allArtists = [...new Set([...currentMainArtists, ...currentFeaturingArtists])].filter(Boolean);

    // Cache pour stocker les images déjà chargées : { 'ArtistName': 'url' }
    const artistImageCache = {};

    allArtists.forEach(art => {
        const opt = document.createElement('option');
        opt.value = art;
        opt.text = `👤 ${art}`;
        imageSelector.appendChild(opt);
    });

    // Option Recherche Manuelle
    const optionSearch = document.createElement('option');
    optionSearch.value = 'MANUAL_SEARCH';
    optionSearch.text = getTranslation('lc_manual_search');
    imageSelector.appendChild(optionSearch);

    // Bouton Toggle Format (16:9 vs 1:1)
    let currentFormat = '16:9';
    const toggleFormatBtn = document.createElement('button');
    toggleFormatBtn.textContent = getTranslation('lc_format_btn') + '16:9';
    toggleFormatBtn.className = 'gft-tutorial-button';
    toggleFormatBtn.style.background = isDarkMode ? '#444' : '#eee';
    toggleFormatBtn.style.color = isDarkMode ? 'white' : 'black';
    toggleFormatBtn.onclick = () => {
        currentFormat = currentFormat === '16:9' ? '1:1' : '16:9';
        toggleFormatBtn.textContent = getTranslation('lc_format_btn') + currentFormat;
        // Re-trigger update with current selection
        imageSelector.dispatchEvent(new Event('change'));
    };

    controls.appendChild(imageSelector);
    controls.appendChild(toggleFormatBtn);

    // --- Search UI (Live Search) ---
    const searchWrapper = document.createElement('div');
    searchWrapper.style.cssText = 'display: none; flex-direction: column; gap: 5px; width: 100%; align-items: center; margin-top: 10px; background: rgba(0,0,0,0.1); padding: 10px; border-radius: 8px;';

    // Input Container
    const inputContainer = document.createElement('div');
    inputContainer.style.cssText = 'width: 100%; display: flex; justify-content: center;';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = getTranslation('lc_search_placeholder');
    searchInput.style.cssText = `
        padding: 8px 12px; border-radius: 4px; border: 1px solid #555; width: 100%;
        background: ${isDarkMode ? '#333' : '#fff'}; color: ${isDarkMode ? '#fff' : '#000'};
    `;
    inputContainer.appendChild(searchInput);

    const searchResultsContainer = document.createElement('div');
    searchResultsContainer.style.cssText = 'display: flex; flex-direction: column; gap: 5px; width: 100%; max-height: 250px; overflow-y: auto; margin-top: 5px; scrollbar-width: thin;';

    let debounceTimer;

    searchInput.oninput = () => {
        clearTimeout(debounceTimer);
        const query = searchInput.value.trim();

        if (!query) {
            searchResultsContainer.innerHTML = '';
            return;
        }

        debounceTimer = setTimeout(async () => {
            searchResultsContainer.innerHTML = '<div style="text-align:center; padding:10px; opacity:0.6;">' + getTranslation('lc_search_searching') + '</div>';

            try {
                const candidates = await searchArtistCandidates(query);
                searchResultsContainer.innerHTML = '';

                if (candidates && candidates.length > 0) {
                    candidates.forEach(cand => {
                        const item = document.createElement('div');
                        item.style.cssText = `
                             display: flex; align-items: center; gap: 10px; padding: 6px; 
                             border-radius: 6px; cursor: pointer; transition: background 0.1s;
                             background: ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
                         `;
                        item.onmouseover = () => item.style.background = isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)';
                        item.onmouseout = () => item.style.background = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

                        const img = document.createElement('img');
                        img.src = cand.image_url;
                        img.style.cssText = 'width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 1px solid transparent; flex-shrink: 0;';

                        const infoDiv = document.createElement('div');
                        infoDiv.style.flex = '1';
                        infoDiv.style.minWidth = '0'; // For ellipsis

                        const nameDiv = document.createElement('div');
                        nameDiv.textContent = cand.name;
                        nameDiv.style.fontWeight = 'bold';
                        nameDiv.style.whiteSpace = 'nowrap';
                        nameDiv.style.overflow = 'hidden';
                        nameDiv.style.textOverflow = 'ellipsis';

                        infoDiv.appendChild(nameDiv);
                        item.appendChild(img);
                        item.appendChild(infoDiv);

                        item.onclick = () => {
                            const newOption = document.createElement('option');
                            newOption.value = 'SEARCH_RESULT_' + Date.now();
                            newOption.text = '👤 ' + cand.name;
                            imageSelector.appendChild(newOption);
                            newOption.selected = true;

                            artistImageCache[newOption.value] = cand.image_url;
                            updateCard(cand.image_url, artistName);

                            // Clear results and hide
                            searchResultsContainer.innerHTML = '';
                            searchInput.value = '';
                            searchWrapper.style.display = 'none';

                            imageSelector.dispatchEvent(new Event('change'));
                            showFeedbackMessage(getTranslation('lc_img_applied') + ' ' + cand.name, 2000);
                        };

                        searchResultsContainer.appendChild(item);
                    });
                } else {
                    searchResultsContainer.innerHTML = '<div style="text-align:center; padding:10px; opacity:0.6;">' + getTranslation('lc_search_none') + '</div>';
                }

            } catch (e) {
                console.error(e);
                searchResultsContainer.innerHTML = '<div style="text-align:center; padding:10px; color:red;">' + getTranslation('lc_error_search') + '</div>';
            }
        }, 300); // 300ms debounce
    };

    searchWrapper.appendChild(inputContainer);
    searchWrapper.appendChild(searchResultsContainer);
    controls.appendChild(searchWrapper);

    // Feature Upload
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';

    let currentUploadedImage = null;

    const uploadBtn = document.createElement('button');
    uploadBtn.textContent = getTranslation('lc_upload_btn');
    uploadBtn.className = 'gft-tutorial-button';
    uploadBtn.style.background = isDarkMode ? '#444' : '#eee';
    uploadBtn.style.color = isDarkMode ? 'white' : 'black';
    uploadBtn.onclick = () => fileInput.click();

    fileInput.onchange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                currentUploadedImage = event.target.result;
                // Force "Custom" state in selector if possible or just override
                // Pour simplifier, on applique l'image et on met le selecteur sur un état spécial ou on le laisse tel quel
                // On pourrait ajouter une option "Custom" temporaire

                let customOpt = imageSelector.querySelector('option[value="CUSTOM"]');
                if (!customOpt) {
                    customOpt = document.createElement('option');
                    customOpt.value = 'CUSTOM';
                    customOpt.text = '📂 Image importée';
                    imageSelector.appendChild(customOpt);
                }
                customOpt.selected = true;

                updateCard(currentUploadedImage, artistName); // Garde le nom actuel pour l'upload (ou full artists)
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = getTranslation('lc_download_btn');
    downloadBtn.className = 'gft-tutorial-button';
    downloadBtn.style.background = '#f9ff55';
    downloadBtn.style.color = 'black';
    downloadBtn.style.fontWeight = 'bold';

    const shareXBtn = document.createElement('button');
    shareXBtn.textContent = getTranslation('lc_share_btn');
    shareXBtn.className = 'gft-tutorial-button';
    shareXBtn.style.background = 'black';
    shareXBtn.style.color = 'white';
    shareXBtn.style.fontWeight = 'bold';
    shareXBtn.style.marginLeft = '5px';

    shareXBtn.onclick = async () => {
        try {
            shareXBtn.textContent = getTranslation('lc_share_copying');

            // 1. Copy Image to Clipboard
            // We need to wait for blob generation
            canvas.toBlob(async (blob) => {
                try {
                    if (!blob) throw new Error("Canvas blob failed");
                    const item = new ClipboardItem({ 'image/png': blob });
                    await navigator.clipboard.write([item]);

                    shareXBtn.textContent = getTranslation('lc_share_copied');

                    // 2. Open X Intent
                    // Use specific artist name from selection if available or general one
                    const tweetText = `${songTitle} by ${artistName}\n\n${window.location.href}\n\n#Genius #Lyrics`;
                    const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
                    const width = 600;
                    const height = 450;
                    const left = (window.innerWidth / 2) - (width / 2) + window.screenX;
                    const top = (window.innerHeight / 2) - (height / 2) + window.screenY;
                    window.open(intentUrl, 'share-x', `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`);

                    showFeedbackMessage(getTranslation('lc_img_copied_tweet'), 6000);

                    setTimeout(() => shareXBtn.textContent = getTranslation('lc_share_btn'), 3000);
                } catch (innerErr) {
                    console.error("Clipboard write failed", innerErr);
                    showFeedbackMessage(getTranslation('lc_error_copy'));
                    shareXBtn.textContent = getTranslation('lc_share_error');
                }
            }, 'image/png');

        } catch (err) {
            console.error("Share failed", err);
            shareXBtn.textContent = getTranslation('lc_share_error');
        }
    };

    controls.appendChild(uploadBtn);
    controls.appendChild(downloadBtn);
    controls.appendChild(shareXBtn);
    modal.appendChild(controls);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const updateCard = (imageUrl, displayArtistName) => {
        const img = new Image();

        // Gestion spéciale pour Data URL (Upload) vs URL distante
        if (imageUrl.startsWith('data:')) {
            img.src = imageUrl;
        } else {
            img.crossOrigin = "Anonymous";
            const separator = imageUrl.includes('?') ? '&' : '?';
            img.src = `${imageUrl}${separator}t=${Date.now()}`;
        }

        img.onload = () => {
            const dominantColor = getDominantColor(img);
            const contrastColor = getContrastColor(dominantColor);
            const logoUrl = chrome.runtime.getURL(contrastColor === 'white' ? 'images/geniuslogowhite.png' : 'images/geniuslogoblack.png');
            const logoImg = new Image();
            logoImg.src = logoUrl;

            logoImg.onload = () => renderLyricCardToCanvas(canvas, text, displayArtistName, songTitle, img, dominantColor, contrastColor, logoImg, currentFormat);
            logoImg.onerror = () => renderLyricCardToCanvas(canvas, text, displayArtistName, songTitle, img, dominantColor, contrastColor, null, currentFormat);
        };
        img.onerror = (e) => {
            console.error("Image load fail", e);
            showFeedbackMessage(getTranslation('lc_feedback_load_error'));
        };
    };

    // Initial render avec Album
    updateCard(albumUrl, artistName);

    // Event Listeners
    imageSelector.onchange = async () => {
        const selectedValue = imageSelector.value;

        if (selectedValue === 'MANUAL_SEARCH') {
            searchWrapper.style.display = 'flex';
            searchInput.focus();
            return;
        } else {
            searchWrapper.style.display = 'none';
        }

        if (selectedValue === 'ALBUM') {
            updateCard(albumUrl, artistName); // artistName = "Main & Main" (passé en paramètre initiaux)
        } else if (selectedValue === 'CUSTOM') {
            if (currentUploadedImage) updateCard(currentUploadedImage, artistName);
        } else {
            // C'est un artiste spécifique
            const selectedArtistName = selectedValue;

            // Vérifie le cache
            if (artistImageCache[selectedArtistName]) {
                updateCard(artistImageCache[selectedArtistName], artistName);
            } else {
                // Fetch image
                const originalText = imageSelector.options[imageSelector.selectedIndex].text;
                imageSelector.options[imageSelector.selectedIndex].text = '⏳ ' + selectedArtistName;

                try {
                    const fetchedUrl = await fetchArtistImageFromApi(selectedArtistName);

                    if (fetchedUrl) {
                        artistImageCache[selectedArtistName] = fetchedUrl;
                        updateCard(fetchedUrl, artistName);
                        imageSelector.options[imageSelector.selectedIndex].text = '👤 ' + selectedArtistName;
                    } else {
                        // Fallback ou erreur
                        showFeedbackMessage(getTranslation('lc_error_img_not_found') + ' ' + selectedArtistName, 3000);
                        updateCard(albumUrl, artistName);
                        imageSelector.options[imageSelector.selectedIndex].text = '❌ ' + selectedArtistName;
                    }
                } catch (e) {
                    console.error(e);
                    updateCard(albumUrl, artistName);
                    imageSelector.options[imageSelector.selectedIndex].text = '❌ ' + selectedArtistName;
                }
            }
        }
    };


    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                showFeedbackMessage(getTranslation('lc_img_loaded'));
                currentUploadedImage = evt.target.result;

                let customOpt = imageSelector.querySelector('option[value="CUSTOM"]');
                if (!customOpt) {
                    customOpt = document.createElement('option');
                    customOpt.value = 'CUSTOM';
                    customOpt.text = getTranslation('lc_custom_img');
                    imageSelector.appendChild(customOpt);
                }
                customOpt.selected = true;
                imageSelector.dispatchEvent(new Event('change'));
            };
            reader.readAsDataURL(file);
        }
    };

    downloadBtn.onclick = () => {
        const link = document.createElement('a');
        link.download = `genius_lyric_card_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        downloadBtn.textContent = getTranslation('lc_download_done');
        setTimeout(() => { downloadBtn.textContent = getTranslation('lc_download_btn'); }, 2000);
    };

    overlay.onclick = (e) => {
        if (e.target === overlay) overlay.remove();
    };
}

/**
 * Génère une "Lyric Card" à partir du texte sélectionné.
 */
async function generateLyricsCard() {
    const selection = window.getSelection();
    if (!selection || selection.toString().trim().length === 0) {
        showFeedbackMessage(getTranslation('lc_select_text_error'));
        return;
    }

    const text = selection.toString().trim();
    const songTitle = currentSongTitle || "Titre Inconnu";
    const artistName = currentMainArtists.length > 0 ? currentMainArtists.join(' & ') : "Artiste Inconnu";

    // 1. Trouver l'image de l'album (Cover Art)
    let candidateUrls = [];
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage && ogImage.content) candidateUrls.push(ogImage.content);

    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (twitterImage && twitterImage.content) candidateUrls.push(twitterImage.content);

    const headerImg = document.querySelector('div[class*="SongHeader"] img') || document.querySelector('img[class*="CoverArt"]');
    if (headerImg && headerImg.src) candidateUrls.push(headerImg.src);

    const uniqueUrls = [...new Set(candidateUrls)];
    if (uniqueUrls.length === 0) {
        showFeedbackMessage(getTranslation('lc_error_album_not_found'));
        return;
    }
    const albumUrl = uniqueUrls[0];

    showFeedbackMessage(getTranslation('lc_searching_artist'), 0);

    // 2. Trouver l'image de l'artiste (API d'abord, puis fallback DOM)
    // On passe le nom du premier main artist pour le fallback "Search API"
    const primaryArtistName = currentMainArtists.length > 0 ? currentMainArtists[0] : null;
    let artistUrl = await fetchArtistImageFromApi(primaryArtistName);

    if (!artistUrl) {
        console.log("[GFT] API failed, using DOM fallback.");
        artistUrl = extractArtistImage(albumUrl); // Utilise la version avec exclusion
    }

    showFeedbackMessage(getTranslation('lc_generating'), 2000);

    if (typeof showLyricCardPreviewModal === 'function') {
        showLyricCardPreviewModal(text, artistName, songTitle, albumUrl, artistUrl);
    } else {
        console.error("[GFT] CRITICAL: showLyricCardPreviewModal is undefined!");
        showFeedbackMessage(getTranslation('lc_error_internal'));
    }
}
/**
 * Récupère l'image de l'artiste via l'API Genius.
 * Stratégies :
 * 1. Via l'ID de la chanson (API Songs) -> Le plus précis pour le "Primary Artist" du track.
 * 2. Via le nom de l'artiste (API Search) -> Fallback si l'ID est introuvable.
 * @param {string} artistName - Nom de l'artiste pour la recherche fallback.
 */
async function fetchArtistImageFromApi(artistName, forceSearch = false) {
    let songId = null;

    // A. TENTATIVE VIA ID CHANSON (Pour avoir l'artiste exact du morceau)
    if (!forceSearch) {
        try {
            // Stratégie 1: New Relic Resource Path
            const metaNewRelic = document.querySelector('meta[name="newrelic-resource-path"]');
            if (metaNewRelic && metaNewRelic.content) {
                const match = metaNewRelic.content.match(/songs\/(\d+)/);
                if (match && match[1]) songId = match[1];
            }

            // Stratégie 2: Twitter App URL
            if (!songId) {
                const metaApp = document.querySelector('meta[name="twitter:app:url:iphone"]') ||
                    document.querySelector('meta[name="twitter:app:url:googleplay"]');
                if (metaApp && metaApp.content) {
                    const match = metaApp.content.match(/songs\/(\d+)/);
                    if (match && match[1]) songId = match[1];
                }
            }

            // Stratégie 3: Regex Body
            if (!songId) {
                const htmlHead = document.body.innerHTML.substring(0, 50000);
                const match = htmlHead.match(/"id":(\d+),"_type":"song"/);
                if (match && match[1]) songId = match[1];
            }

            if (songId) {
                console.log("[GFT] Fetching artist image via Song ID:", songId);
                showFeedbackMessage(getTranslation('lc_fetching_id'), 0);
                const response = await fetch(`https://genius.com/api/songs/${songId}`);
                if (response.ok) {
                    const data = await response.json();
                    const artist = data.response?.song?.primary_artist;
                    if (artist && artist.image_url) {
                        console.log("[GFT] Found via Song API");
                        return artist.image_url;
                    }
                }
            }
        } catch (e) {
            console.warn("[GFT] Song API strategy failed:", e);
        }
    }

    // B. TENTATIVE VIA RECHERCHE (Fallback "User Suggestion")
    if (artistName && artistName !== "Artiste Inconnu") {
        try {
            console.log("[GFT] ID not found. Searching API for:", artistName);
            showFeedbackMessage(getTranslation('lc_searching_name') + ' "' + artistName + '"...', 0);

            // Tente de trouver l'URL de l'artiste dans le DOM pour affiner la recherche (ex: pour SCH)
            let expectedUrl = null;
            try {
                // Cherche un lien contenant le nom exact de l'artiste
                const allLinks = Array.from(document.querySelectorAll('a'));
                const artistLink = allLinks.find(a =>
                    a.textContent.trim() === artistName &&
                    a.href.includes('genius.com/artists/')
                );
                if (artistLink) {
                    expectedUrl = artistLink.href;
                    console.log("[GFT] Found expected artist URL in DOM:", expectedUrl);
                }
            } catch (domErr) { console.error(domErr); }

            // On utilise l'API search/multi
            const searchUrl = `https://genius.com/api/search/multi?per_page=5&q=${encodeURIComponent(artistName)}`;
            const response = await fetch(searchUrl);

            if (response.ok) {
                const data = await response.json();
                const sections = data.response?.sections;

                if (sections) {
                    const artistSection = sections.find(s => s.type === 'artist');
                    if (artistSection && artistSection.hits && artistSection.hits.length > 0) {

                        let targetHit = null;

                        // Stratégie 1: Match par URL (si trouvée dans le DOM) - Le plus fiable
                        if (expectedUrl) {
                            targetHit = artistSection.hits.find(h => h.result && h.result.url === expectedUrl);
                        }

                        // Stratégie 2: Match exact par Nom (Case Insensitive)
                        if (!targetHit) {
                            targetHit = artistSection.hits.find(h => h.result && h.result.name.toLowerCase() === artistName.toLowerCase());
                        }

                        // Stratégie 3: Match "Mot Entier" (Word Boundary)
                        // Évite que "Eva" matche "Evanescence" (qui commence par Eva mais n'est pas le mot Eva)
                        if (!targetHit) {
                            try {
                                const escapedName = artistName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape regex chars
                                const wordBoundaryRegex = new RegExp(`\\b${escapedName}\\b`, 'i');
                                targetHit = artistSection.hits.find(h => h.result && wordBoundaryRegex.test(h.result.name));
                                if (targetHit) console.log("[GFT] Found via Word Boundary Match:", targetHit.result.name);
                            } catch (regexErr) { console.warn(regexErr); }
                        }

                        // Stratégie 4: Premier résultat (Ultime recours)
                        if (!targetHit) {
                            targetHit = artistSection.hits[0];
                            console.log("[GFT] No exact/boundary match, using first hit (risky):", targetHit.result.name);
                        }

                        if (targetHit && targetHit.result && targetHit.result.image_url) {
                            console.log("[GFT] Found via Search API:", targetHit.result.image_url);
                            showFeedbackMessage(getTranslation('lc_img_found'), 1000);
                            return targetHit.result.image_url;
                        }
                    }
                }
            }
        } catch (e) {
            console.warn("[GFT] Search API strategy failed:", e);
        }
    }

    console.warn("[GFT] Failed to fetch artist image from any API.");
    showFeedbackMessage(getTranslation('lc_api_error'), 1000);
    return null;
}

/**
 * Recherche une liste d'artistes candidats via l'API Genius.
 * @param {string} query - Le nom à rechercher.
 * @returns {Promise<Array>} Liste d'objets artiste { name, image_url, ... }
 */
async function searchArtistCandidates(query) {
    try {
        const searchUrl = `https://genius.com/api/search/artist?q=${encodeURIComponent(query)}`;
        const response = await fetch(searchUrl);
        if (response.ok) {
            const data = await response.json();
            const sections = data.response?.sections;
            if (sections && sections[0] && sections[0].hits) {
                return sections[0].hits.map(h => h.result).filter(r => r.image_url);
            }
        }
    } catch (e) {
        console.warn("[GFT] Search Candidates failed:", e);
    }
    return [];
}

/**
 * Génère une "Lyric Card" à partir du texte sélectionné.
 */
async function generateLyricsCard() {
    const selection = window.getSelection();
    if (!selection || selection.toString().trim().length === 0) {
        showFeedbackMessage("Veuillez sélectionner du texte pour créer une Lyric Card.");
        return;
    }

    const text = selection.toString().trim();
    const songTitle = currentSongTitle || "Titre Inconnu";
    const artistName = currentMainArtists.length > 0 ? currentMainArtists.join(' & ') : "Artiste Inconnu";

    // 1. Trouver l'image de l'album (Cover Art)
    let candidateUrls = [];
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage && ogImage.content) candidateUrls.push(ogImage.content);

    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (twitterImage && twitterImage.content) candidateUrls.push(twitterImage.content);

    const headerImg = document.querySelector('div[class*="SongHeader"] img') || document.querySelector('img[class*="CoverArt"]');
    if (headerImg && headerImg.src) candidateUrls.push(headerImg.src);

    const uniqueUrls = [...new Set(candidateUrls)];
    if (uniqueUrls.length === 0) {
        showFeedbackMessage(getTranslation('lc_error_album_not_found'), 1000);
        return;
    }
    const albumUrl = uniqueUrls[0];

    showFeedbackMessage(getTranslation('lc_opening'), 500);

    // On passe null pour artistUrl car on le charge dynamiquement dans le modal
    showLyricCardPreviewModal(text, artistName, songTitle, albumUrl, null);

}

/**
 * Calcule la couleur dominante d'une image.
 * Version simplifiée : moyenne des pixels du centre.
 */
function getDominantColor(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 100;
    canvas.height = 100;
    ctx.drawImage(img, 0, 0, 100, 100);

    const imageData = ctx.getImageData(0, 0, 100, 100);
    const data = imageData.data;
    let r = 0, g = 0, b = 0;

    for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
    }

    const count = data.length / 4;
    r = Math.floor(r / count);
    g = Math.floor(g / count);
    b = Math.floor(b / count);

    return `rgb(${r},${g},${b})`;
}

/**
 * Retourne 'black' ou 'white' selon la couleur donnée pour un meilleur contraste.
 */
function getContrastColor(rgbString) {
    // Extrait r, g, b
    const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return 'white';

    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);

    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? 'black' : 'white';
}

// --- Correction Functions for Settings Menu ---
function gftToggleHeaderFeat() {
    if (typeof isHeaderFeatEnabled === 'function' && typeof setHeaderFeatEnabled === 'function') {
        const newState = !isHeaderFeatEnabled();
        setHeaderFeatEnabled(newState);
        showFeedbackMessage(newState ? '✅ Inclure Feats dans l\'en-tête' : '❌ Feats masqués dans l\'en-tête', 2000, shortcutsContainerElement || document.body);
    }
}

function gftToggleTagNewlines() {
    if (typeof isTagNewlinesDisabled === 'function' && typeof setTagNewlinesDisabled === 'function') {
        const currentValue = isTagNewlinesDisabled();
        const newState = !currentValue;
        setTagNewlinesDisabled(newState);
        showFeedbackMessage(!newState ? '✅ Saut de ligne après tags ACTIVÉ' : '❌ Saut de ligne après tags DÉSACTIVÉ', 2000, shortcutsContainerElement || document.body);
    }
}

function gftToggleDarkMode() {
    const isDark = document.body.classList.toggle('gft-dark-mode');
    localStorage.setItem('gftDarkModeEnabled', isDark);

    // Update tooltip styles dynamically if needed
    const tooltips = document.querySelectorAll('.gft-tooltip');
    tooltips.forEach(t => {
        if (isDark) t.classList.add('gft-dark-mode');
        else t.classList.remove('gft-dark-mode');
    });

    // Update existing settings menu if open
    const menu = document.getElementById('gft-settings-menu');
    if (menu) {
        if (isDark) menu.classList.add('gft-dark-mode');
        else menu.classList.remove('gft-dark-mode');
    }

    // Safety: Ensure container checks/clears class if it ever got it
    const container = document.getElementById(SHORTCUTS_CONTAINER_ID);
    if (container) {
        container.classList.remove('gft-dark-mode');
    }
}

/**
 * Applique les préférences stockées (Dark Mode, etc.) au chargement.
 */
function applyStoredPreferences() {
    const isDarkMode = localStorage.getItem(DARK_MODE_STORAGE_KEY) === 'true';
    if (isDarkMode) {
        document.body.classList.add(DARK_MODE_CLASS);
    } else {
        document.body.classList.remove(DARK_MODE_CLASS);
    }
}

/**
 * Met en évidence les parenthèses et crochets non appariés.
 * @param {HTMLElement} editor - L'élément éditeur.
 * @param {string} editorType - 'textarea' ou 'div'.
 * @returns {number} Le nombre de brackets non appariées trouvées.
 */
function highlightUnmatchedBracketsInEditor(editor, editorType) {
    if (!editor) return 0;

    const text = editorType === 'textarea' ? editor.value : (editor.textContent || '');
    const unmatchedIndices = [];
    const stack = []; // Stocke { char, index }

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (char === '(' || char === '[') {
            stack.push({ char, index: i });
        } else if (char === ')' || char === ']') {
            if (stack.length === 0) {
                // Bracket fermant sans ouvrant
                unmatchedIndices.push(i);
            } else {
                const last = stack.pop();
                // Vérifie la correspondance
                if ((char === ')' && last.char !== '(') || (char === ']' && last.char !== '[')) {
                    // Mismatch (ex: [) ou (])
                    unmatchedIndices.push(last.index); // L'ouvrant est invalide
                    unmatchedIndices.push(i);        // Le fermant est invalide
                    // Note: ici on pourrait décider de remettre le "last" dans la stack s'il n'est pas consommé par le bon bracket
                    // Mais pour simplifier, on considère les deux comme fautifs
                }
            }
        }
    }

    // Ajoute tous les ouvrants restants dans la stack (jamais fermés)
    stack.forEach(item => unmatchedIndices.push(item.index));

    const count = unmatchedIndices.length;

    if (count > 0 && editorType === 'textarea') {
        // Logique de surlignage spécifique pour textarea
        // On ne peut pas surligner DANS le textarea, on utilise l'overlay
        // Mais createTextareaReplacementOverlay prend un regex ou pattern.
        // Ici on a des indices spécifiques.
        // On va adapter createTextareaReplacementOverlay ou créer un overlay dédié "ErrorOverlay".
        // Pour l'instant, réutilisons createTextareaReplacementOverlay de manière astucieuse ou simplifiée :
        // On peut générer un regex qui matche ces caractères ? Non.
        // On va recréer un highlightOverlay manuel simple ici.

        const rect = editor.getBoundingClientRect();
        const overlay = document.createElement('div');
        const computedStyle = window.getComputedStyle(editor);

        overlay.style.position = 'absolute';
        overlay.style.top = `${rect.top + window.scrollY}px`;
        overlay.style.left = `${rect.left + window.scrollX}px`;
        overlay.style.width = computedStyle.width;
        overlay.style.height = computedStyle.height;
        overlay.style.font = computedStyle.font;
        overlay.style.lineHeight = computedStyle.lineHeight;
        overlay.style.padding = computedStyle.padding;
        overlay.style.border = computedStyle.border;
        overlay.style.whiteSpace = computedStyle.whiteSpace;
        overlay.style.overflow = 'hidden'; // Suit le scroll ? Difficile si textarea scrolle.
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '9999';
        overlay.style.backgroundColor = 'transparent';
        overlay.style.color = 'transparent'; // Texte invisible

        // Construit le HTML avec les spans rouges
        let html = '';
        let lastIndex = 0;
        // Trie les indices pour construire le HTML séquentiellement
        unmatchedIndices.sort((a, b) => a - b);

        // On limite pour éviter de crasher si trop d'erreurs
        const safeIndices = unmatchedIndices.filter((v, i, a) => a.indexOf(v) === i); // Unique

        safeIndices.forEach(index => {
            const safeText = text.substring(lastIndex, index).replace(/</g, '&lt;').replace(/>/g, '&gt;');
            html += safeText;
            const char = text[index].replace(/</g, '&lt;').replace(/>/g, '&gt;');
            html += `<span style="background-color: rgba(255, 0, 0, 0.3); border-bottom: 2px solid red;">${char}</span>`;
            lastIndex = index + 1;
        });
        html += text.substring(lastIndex).replace(/</g, '&lt;').replace(/>/g, '&gt;');

        // Remplace les \n par <br> pour l'affichage visuel
        overlay.innerHTML = html.replace(/\n/g, '<br>');

        // Synchronisation du scroll
        overlay.scrollTop = editor.scrollTop;
        editor.addEventListener('scroll', () => { overlay.scrollTop = editor.scrollTop; });

        document.body.appendChild(overlay);

        // Auto-remove après 3s
        setTimeout(() => { if (document.body.contains(overlay)) document.body.removeChild(overlay); }, 5000);
    }

}



/**
 * Affiche un message de feedback temporaire (toast).
 * Si l'élément de feedback du panneau n'existe pas, crée un toast flottant.
 * @param {string} message - Le message à afficher.
 * @param {number} duration - La durée en ms (défaut 3000).
 * @param {HTMLElement} [container] - Le conteneur parent (optionnel).
 */
function showFeedbackMessage(message, duration = 3000, container = null) {
    let feedbackEl = document.getElementById(FEEDBACK_MESSAGE_ID);

    // Fallback: Si l'élément n'existe pas (panneau fermé), on utilise un toast global
    if (!feedbackEl) {
        let toast = document.getElementById('gft-global-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'gft-global-toast';
            toast.style.cssText = `
                position: fixed; top: 20px; right: 20px; z-index: 10002;
                background: #333; color: white; padding: 12px 20px;
                border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                font-family: sans-serif; font-size: 14px; opacity: 0;
                transition: opacity 0.3s ease; pointer-events: none;
            `;
            document.body.appendChild(toast);
        }
        feedbackEl = toast;
        feedbackEl.style.display = 'block'; // Assure la visibilité
    }

    // Annuler le timer précédent
    if (feedbackTimeout) {
        clearTimeout(feedbackTimeout);
        feedbackTimeout = null;
    }
    // Annuler le timer d'animation de fermeture précédent
    if (feedbackAnimationTimeout) {
        clearTimeout(feedbackAnimationTimeout);
        feedbackAnimationTimeout = null;
    }

    feedbackEl.textContent = message;

    // Rendre visible
    feedbackEl.style.display = 'block';
    requestAnimationFrame(() => {
        feedbackEl.style.visibility = 'visible';
        feedbackEl.style.opacity = '1';
        if (feedbackEl.id === FEEDBACK_MESSAGE_ID) {
            feedbackEl.style.maxHeight = '100px';
            feedbackEl.style.marginTop = '10px';
            feedbackEl.style.marginBottom = '10px';
            feedbackEl.style.paddingTop = '8px';
            feedbackEl.style.paddingBottom = '8px';
        }
    });

    // Cache après le délai
    if (duration > 0) {
        feedbackTimeout = setTimeout(() => {
            feedbackEl.style.opacity = '0';
            if (feedbackEl.id === FEEDBACK_MESSAGE_ID) {
                feedbackEl.style.maxHeight = '0';
                feedbackEl.style.marginTop = '0';
                feedbackEl.style.marginBottom = '0';
                feedbackEl.style.paddingTop = '0';
                feedbackEl.style.paddingBottom = '0';
            }
            feedbackAnimationTimeout = setTimeout(() => {
                feedbackEl.style.visibility = 'hidden';
                if (feedbackEl.id === 'gft-global-toast') {
                    // Ne pas cacher display:none car transition, mais ok pour toast
                } else {
                    feedbackEl.style.display = 'none';
                }
                feedbackAnimationTimeout = null;
            }, 300);
            feedbackTimeout = null;
        }, duration);
    }
}

// ----- Custom Buttons Feature -----

/**
 * Récupère les boutons personnalisés sauvegardés.
 * @returns {Array} Liste des objets boutons triés par date de création.
 */
function getCustomButtons() {
    try {
        const stored = localStorage.getItem(CUSTOM_BUTTONS_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error("Erreur lecture boutons custom:", e);
        return [];
    }
}

/**
 * Sauvegarde un nouveau bouton ou met à jour la liste.
 * @param {object} buttonData - Données du bouton.
 */
function saveCustomButton(buttonData) {
    const buttons = getCustomButtons();
    buttonData.id = buttonData.id || 'custom_' + Date.now();
    buttonData.createdAt = buttonData.createdAt || Date.now();

    buttons.push(buttonData);
    localStorage.setItem(CUSTOM_BUTTONS_STORAGE_KEY, JSON.stringify(buttons));
    return buttonData;
}

/**
 * Supprime un bouton personnalisé par son ID.
 * @param {string} id - ID du bouton.
 */
function deleteCustomButton(id) {
    let buttons = getCustomButtons();
    buttons = buttons.filter(b => b.id !== id);
    localStorage.setItem(CUSTOM_BUTTONS_STORAGE_KEY, JSON.stringify(buttons));
}

/**
 * Exporte tous les boutons personnalisés sous forme de code string.
 * Format: "GFT-PRESET-" + Base64(JSON)
 */
function exportCustomButtons() {
    const buttons = getCustomButtons();
    const json = JSON.stringify(buttons);
    return "GFT-PRESET-" + btoa(unescape(encodeURIComponent(json)));
}

/**
 * Importe des boutons depuis un code string.
 * @param {string} code - Le code preset.
 * @returns {boolean} Succès ou échec.
 */
function importCustomButtons(code) {
    try {
        if (!code.startsWith("GFT-PRESET-")) throw new Error("Format invalide");
        const base64 = code.replace("GFT-PRESET-", "");
        const json = decodeURIComponent(escape(atob(base64)));
        const newButtons = JSON.parse(json);

        if (!Array.isArray(newButtons)) throw new Error("Données invalides");

        // Fusionne avec les existants (ou remplace ? Fusion est plus safe)
        const currentButtons = getCustomButtons();
        const merged = [...currentButtons, ...newButtons];

        // Dédoublonnage basique par contenu exact pour éviter le spam
        const unique = merged.filter((btn, index, self) =>
            index === self.findIndex((t) => (
                t.label === btn.label && t.content === btn.content && t.regex === btn.regex
            ))
        );

        localStorage.setItem(CUSTOM_BUTTONS_STORAGE_KEY, JSON.stringify(unique));
        return true;
    } catch (e) {
        console.error("Import failed:", e);
        return false;
    }
}

/**
 * Affiche le gestionnaire de boutons personnalisés (Modal).
 * @param {string} defaultType - 'structure' ou 'cleanup' pour pré-remplir le type.
 */
function openCustomButtonManager(defaultType = 'structure') {
    // Supprime l'ancien modal si ouvert
    const existing = document.getElementById('gft-custom-manager');
    if (existing) existing.remove();

    const isDarkMode = localStorage.getItem(DARK_MODE_STORAGE_KEY) === 'true';

    // Overlay
    const overlay = document.createElement('div');
    overlay.id = 'gft-custom-manager';
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8); z-index: 10005;
        display: flex; justify-content: center; align-items: center;
        backdrop-filter: blur(3px);
    `;

    // Modal Container
    const modal = document.createElement('div');
    modal.className = `gft-custom-manager-modal ${isDarkMode ? 'gft-dark-mode' : ''}`;
    modal.style.background = isDarkMode ? '#222' : 'white';
    modal.style.color = isDarkMode ? '#eee' : '#222';
    // Force text color for better readability
    modal.style.setProperty('color', isDarkMode ? '#eee' : '#222', 'important');

    modal.style.padding = '20px';
    modal.style.borderRadius = '8px';
    modal.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';

    // Titre
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.innerHTML = `<h2 style="margin:0; font-size:18px;">✨ Custom Buttons Manager</h2>`;

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.background = 'none'; closeBtn.style.border = 'none';
    closeBtn.style.fontSize = '24px'; closeBtn.style.cursor = 'pointer';
    closeBtn.style.color = 'inherit';
    closeBtn.onclick = () => overlay.remove();
    header.appendChild(closeBtn);
    modal.appendChild(header);

    // Tabs
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'gft-tabs';
    const tabCreate = document.createElement('button');
    tabCreate.className = 'gft-tab-btn active'; tabCreate.textContent = 'Create';
    const tabManage = document.createElement('button');
    tabManage.className = 'gft-tab-btn'; tabManage.textContent = 'Library';

    tabsContainer.appendChild(tabCreate);
    tabsContainer.appendChild(tabManage);
    modal.appendChild(tabsContainer);

    // Contenu "Créer"
    const contentCreate = document.createElement('div');
    contentCreate.style.display = 'flex';
    contentCreate.style.flexDirection = 'column';
    contentCreate.style.gap = '10px';

    // Type Selector
    const typeGroup = document.createElement('div');
    typeGroup.className = 'gft-form-group';
    typeGroup.innerHTML = `<label class="gft-form-label">Action Type</label>`;
    const typeSelect = document.createElement('select');
    typeSelect.className = 'gft-form-select';
    typeSelect.innerHTML = `
        <option value="structure">Structure Tag (Insertion)</option>
        <option value="cleanup">Cleanup Tool (Search/Replace)</option>
    `;
    typeSelect.value = defaultType;
    typeGroup.appendChild(typeSelect);
    contentCreate.appendChild(typeGroup);

    // Nom / Label
    const nameGroup = document.createElement('div');
    nameGroup.className = 'gft-form-group';
    nameGroup.innerHTML = `<label class="gft-form-label">Button Label</label>`;
    const nameInput = document.createElement('input');
    nameInput.className = 'gft-form-input';
    nameInput.placeholder = "Ex: Remove Emoji, [Verse]...";
    nameGroup.appendChild(nameInput);
    contentCreate.appendChild(nameGroup);

    // Champs dynamiques selon le type
    const dynamicFields = document.createElement('div');

    const renderDynamicFields = () => {
        dynamicFields.innerHTML = '';
        const type = typeSelect.value;

        if (type === 'structure') {
            const grp = document.createElement('div');
            grp.className = 'gft-form-group';
            grp.innerHTML = `<label class="gft-form-label">Text to Insert</label>`;
            const input = document.createElement('textarea');
            input.id = 'gft-custom-content';
            input.className = 'gft-form-textarea';
            input.placeholder = "[Verse]\n";
            input.rows = 3;
            grp.appendChild(input);
            dynamicFields.appendChild(grp);
        } else {
            // Cleanup: Mode Simple vs Avancé
            const modeSwitch = document.createElement('div');
            modeSwitch.style.display = 'flex'; modeSwitch.style.alignItems = 'center'; modeSwitch.style.gap = '5px';
            modeSwitch.style.fontSize = '12px';
            const chk = document.createElement('input'); chk.type = 'checkbox'; chk.id = 'gft-advanced-regex';
            modeSwitch.appendChild(chk);
            modeSwitch.appendChild(document.createTextNode('Advanced Regex Mode'));
            dynamicFields.appendChild(modeSwitch);

            // Rechercher
            const grpFind = document.createElement('div');
            grpFind.className = 'gft-form-group';
            grpFind.innerHTML = `<label class="gft-form-label">Find Pattern</label>`;
            const inputFind = document.createElement('input');
            inputFind.id = 'gft-custom-find';
            inputFind.className = 'gft-form-input';
            grpFind.appendChild(inputFind);
            dynamicFields.appendChild(grpFind);

            // Remplacer
            const grpRep = document.createElement('div');
            grpRep.className = 'gft-form-group';
            grpRep.innerHTML = `<label class="gft-form-label">Replace With</label>`;
            const inputRep = document.createElement('input');
            inputRep.id = 'gft-custom-replace';
            inputRep.className = 'gft-form-input';
            inputRep.placeholder = "(Leave empty to delete)";
            grpRep.appendChild(inputRep);
            dynamicFields.appendChild(grpRep);

            chk.onchange = () => {
                if (chk.checked) {
                    inputFind.placeholder = "Regex Pattern (e.g. \\d+\\s*$)";
                } else {
                    inputFind.placeholder = "Exact text to remove";
                }
            };
            chk.dispatchEvent(new Event('change'));
        }
    };

    renderDynamicFields();
    typeSelect.onchange = renderDynamicFields;
    contentCreate.appendChild(dynamicFields);

    // Bouton Sauvegarder
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save Custom Button';
    saveBtn.style.cssText = 'background: #f9ff55; color: black; border: none; padding: 10px; font-weight: bold; border-radius: 4px; cursor: pointer; margin-top: 10px; width: 100%;';
    saveBtn.onclick = () => {
        const type = typeSelect.value;
        const label = nameInput.value.trim();
        if (!label) return alert("Please specify a button label.");

        const btnData = {
            label: label,
            type: type
        };

        if (type === 'structure') {
            const content = document.getElementById('gft-custom-content').value;
            if (!content) return alert("Content is required.");
            btnData.content = content;
        } else {
            const find = document.getElementById('gft-custom-find').value;
            const rep = document.getElementById('gft-custom-replace').value;
            const isRegex = document.getElementById('gft-advanced-regex').checked;

            if (!find) return alert("Find pattern is required.");

            btnData.regex = isRegex ? find : escapeRegExp(find); // Stocke toujours comme regex string
            btnData.replacement = rep;
            btnData.isExplicitRegex = isRegex; // Juste pour info si on veut rééditer plus tard
        }

        saveCustomButton(btnData);
        showFeedbackMessage("Button created! Reloading...", 3000); // Idéalement on rafraîchit l'UI sans reload
        overlay.remove();
        // Force refresh of panel logic if possible, otherwise reload page
        window.location.reload();
    };
    contentCreate.appendChild(saveBtn);
    modal.appendChild(contentCreate);

    // Contenu "Bibliothèque"
    const contentManage = document.createElement('div');
    contentManage.style.display = 'none';

    const renderList = () => {
        contentManage.innerHTML = '';
        const list = document.createElement('div');
        list.className = 'gft-custom-list';

        const buttons = getCustomButtons();
        if (buttons.length === 0) {
            list.innerHTML = `<div style="padding:15px; text-align:center; opacity:0.5;">No custom buttons found.</div>`;
        } else {
            buttons.forEach(btn => {
                const item = document.createElement('div');
                item.className = 'gft-custom-item';

                const info = document.createElement('div');
                info.innerHTML = `<strong>${btn.label}</strong> <span style="font-size:10px; opacity:0.7; border:1px solid currentColor; padding:1px 3px; border-radius:3px;">${btn.type}</span>`;

                const actions = document.createElement('div');
                actions.className = 'gft-custom-actions';

                const delBtn = document.createElement('button');
                delBtn.className = 'gft-icon-btn gft-btn-delete';
                delBtn.innerHTML = '🗑️';
                delBtn.title = 'Delete';
                delBtn.onclick = () => {
                    if (confirm("Delete this button?")) {
                        deleteCustomButton(btn.id);
                        renderList(); // Refresh list
                    }
                };

                actions.appendChild(delBtn);
                item.appendChild(info);
                item.appendChild(actions);
                list.appendChild(item);
            });
        }
        contentManage.appendChild(list);

        // Zone Import / Export
        const ioZone = document.createElement('div');
        ioZone.className = 'gft-io-zone';
        ioZone.innerHTML = `<strong>Share Presets</strong>`;

        const codeArea = document.createElement('textarea');
        codeArea.className = 'gft-code-area';
        codeArea.placeholder = "Paste a preset code here to import, or click Export...";

        const btnContainer = document.createElement('div');
        btnContainer.style.display = 'flex'; btnContainer.style.gap = '10px'; btnContainer.style.marginTop = '5px';

        const exportBtn = document.createElement('button');
        exportBtn.textContent = 'Copy Export Code';
        exportBtn.className = 'gft-tutorial-button'; /* Réutiliser style */
        exportBtn.style.fontSize = '11px'; exportBtn.style.padding = '5px 10px';
        exportBtn.onclick = () => {
            const code = exportCustomButtons();
            codeArea.value = code;
            codeArea.select();
            document.execCommand('copy');
            showFeedbackMessage("Code copied!", 2000);
        };

        const importBtn = document.createElement('button');
        importBtn.textContent = 'Import Code';
        importBtn.className = 'gft-tutorial-button';
        importBtn.style.fontSize = '11px'; exportBtn.style.padding = '5px 10px';
        importBtn.style.background = '#f9ff55'; importBtn.style.color = 'black';
        importBtn.onclick = () => {
            const code = codeArea.value.trim();
            if (!code) return alert("Please paste a code first.");
            if (importCustomButtons(code)) {
                alert("Import successful! Reloading...");
                window.location.reload();
            } else {
                alert("Import failed. Invalid code.");
            }
        };

        btnContainer.appendChild(exportBtn);
        btnContainer.appendChild(importBtn);
        ioZone.appendChild(codeArea);
        ioZone.appendChild(btnContainer);
        contentManage.appendChild(ioZone);
    };

    modal.appendChild(contentManage);

    // Tab Logic
    tabCreate.onclick = () => {
        tabCreate.classList.add('active'); tabManage.classList.remove('active');
        contentCreate.style.display = 'flex'; contentManage.style.display = 'none';
        renderDynamicFields(); // refresh
    };
    tabManage.onclick = () => {
        tabManage.classList.add('active'); tabCreate.classList.remove('active');
        contentManage.style.display = 'block'; contentCreate.style.display = 'none';
        renderList();
    };

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}

// ----- Communication avec le Popup -----
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "GET_MODE") {
        sendResponse({ lyricCardOnly: isLyricCardOnlyMode() });
    }
    else if (request.action === "GET_STATUS") {
        // Renvoie l'état complet (Mode + Langue)
        sendResponse({
            lyricCardOnly: isLyricCardOnlyMode(),
            language: localStorage.getItem('gftLanguage') || 'fr'
        });
    }
    else if (request.action === "SET_MODE") {
        setLyricCardOnlyMode(request.lyricCardOnly);
        sendResponse({ success: true });
        // Recharge la page pour appliquer le changement
        window.location.reload();
    }
    else if (request.action === "SET_LANGUAGE") {
        localStorage.setItem('gftLanguage', request.language);
        sendResponse({ success: true });
        window.location.reload();
    }
    else if (request.action === "RESET_TUTORIAL") {
        // Réinitialise les flags
        localStorage.removeItem('gft-tutorial-completed');
        // On pourrait aussi reset la langue si on veut un full onboarding
        // localStorage.removeItem('gftLanguage'); 

        // Lance le tutoriel
        showTutorial();
        sendResponse({ success: true });
    }
});

// Initialisation globale
(function init() {
    // Vérifie si le tutoriel est terminé ou si la langue n'est pas définie
    // Le tutoriel fait office d'onboarding désormais
    const tutorialCompleted = localStorage.getItem('gft-tutorial-completed') === 'true';
    const languageSet = localStorage.getItem('gftLanguage');

    if (!tutorialCompleted || !languageSet) {
        // Applique un petit délai pour s'assurer que le DOM est prêt
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', showTutorial);
        } else {
            // Petit délai supplémentaire pour être sûr que le CSS/styles sont chargés
            setTimeout(showTutorial, 500);
        }
    }
})();
