(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // src/modules/constants.js
  var GFT_STATE, DARK_MODE_CLASS, DARK_MODE_STORAGE_KEY, HEADER_FEAT_STORAGE_KEY, DISABLE_TAG_NEWLINES_STORAGE_KEY, LYRIC_CARD_ONLY_STORAGE_KEY, PANEL_COLLAPSED_STORAGE_KEY, TRANSCRIPTION_MODE_STORAGE_KEY, CUSTOM_BUTTONS_STORAGE_KEY, MAX_HISTORY_SIZE, LYRICS_HELPER_HIGHLIGHT_CLASS, SHORTCUTS_CONTAINER_ID, ARTIST_SELECTOR_CONTAINER_ID, COUPLET_BUTTON_ID, FEEDBACK_MESSAGE_ID, FLOATING_TOOLBAR_ID, SELECTORS;
  var init_constants = __esm({
    "src/modules/constants.js"() {
      GFT_STATE = {
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
        lastSavedContent: "",
        hasUnsavedChanges: false,
        autoSaveTimeout: null
      };
      DARK_MODE_CLASS = "gft-dark-mode";
      DARK_MODE_STORAGE_KEY = "gftDarkModeEnabled";
      HEADER_FEAT_STORAGE_KEY = "gftHeaderFeatEnabled";
      DISABLE_TAG_NEWLINES_STORAGE_KEY = "gftDisableTagNewlines";
      LYRIC_CARD_ONLY_STORAGE_KEY = "gftLyricCardOnly";
      PANEL_COLLAPSED_STORAGE_KEY = "gftPanelCollapsed";
      TRANSCRIPTION_MODE_STORAGE_KEY = "gftTranscriptionMode";
      CUSTOM_BUTTONS_STORAGE_KEY = "gftCustomButtons";
      MAX_HISTORY_SIZE = 10;
      LYRICS_HELPER_HIGHLIGHT_CLASS = "lyrics-helper-highlight";
      SHORTCUTS_CONTAINER_ID = "genius-lyrics-shortcuts-container";
      ARTIST_SELECTOR_CONTAINER_ID = "artistSelectorContainerLyricsHelper";
      COUPLET_BUTTON_ID = "coupletButton_GFT";
      FEEDBACK_MESSAGE_ID = "gft-feedback-message";
      FLOATING_TOOLBAR_ID = "gft-floating-formatting-toolbar";
      SELECTORS = {
        TITLE: [
          'h1[class*="SongHeader-desktop_Title"] span[class*="SongHeader-desktop_HiddenMask"]',
          'h1[class*="SongHeader-desktop_Title"]',
          'h1[class*="SongHeader__Title"]',
          ".song_header-primary_info-title"
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
    }
  });

  // src/translations/index.js
  var TRANSLATIONS;
  var init_translations = __esm({
    "src/translations/index.js"() {
      TRANSLATIONS = {
        fr: {
          panel_title: "Genius Fast Transcriber",
          artist_selection: "Attribuer la section \xE0 :",
          no_artist: "Aucun artiste d\xE9tect\xE9.",
          shortcuts_title: "Raccourcis",
          add_couplet: "Ajouter Couplet",
          format_numbers: "Nombres en lettres",
          create_lyric_card: "Cr\xE9er Lyric Card",
          preview: "Aper\xE7u",
          copy: "Copier",
          undo: "Annuler",
          redo: "Refaire",
          feedback_copied: "Copi\xE9 !",
          feedback_restored: "Restaur\xE9",
          onboarding_title: "Bienvenue",
          next_btn: "Suivant",
          finish_btn: "Terminer",
          mode_full_title: "Mode Complet",
          mode_full_desc: "Outils de transcription + Lyric Cards",
          mode_lyric_title: "Lyric Card Uniquement",
          mode_lyric_desc: "Cr\xE9ation d'image uniquement",
          recommended_label: "Recommand\xE9",
          theme_select_title: "Choisissez votre th\xE8me \u{1F317}",
          theme_light_btn: "Mode Clair \u2600\uFE0F",
          theme_dark_btn: "Mode Sombre \u{1F319}",
          lang_select_title: "Langue",
          mode_select_title: "Mode",
          full_mode_label: "Complet (Transcription + Lyric Cards)",
          lyric_only_label: "Lyric Card Uniquement",
          settings_saved: "Pr\xE9f\xE9rences sauvegard\xE9es !",
          open_panel: "Ouvrir le panneau",
          close_panel: "Fermer le panneau",
          onboarding_intro: "Configurez votre exp\xE9rience Genius Fast Transcriber.",
          // Settings & Tooltips
          settings_menu: "Menu Param\xE8tres",
          dark_mode_toggle_light: "\u2600\uFE0F Mode Clair",
          dark_mode_toggle_dark: "\u{1F319} Mode Sombre",
          stats_show: "\u{1F4CA} Afficher Statistiques",
          stats_hide: "\u{1F4CA} Masquer Statistiques",
          header_feat_show: "\u{1F3A4} Afficher feat dans l'en-t\xEAte",
          header_feat_hide: "\u{1F3A4} Masquer feat dans l'en-t\xEAte",
          newline_enable: "\u21B5 Activer saut de ligne apr\xE8s tags",
          newline_disable: "\u21B5 D\xE9sactiver saut de ligne apr\xE8s tags",
          tutorial_link: "\u2753 Tutoriel / Aide",
          undo_tooltip: "Annuler la derni\xE8re modification (Ctrl+Z)",
          redo_tooltip: "Refaire la derni\xE8re modification annul\xE9e (Ctrl+Y)",
          panel_title_img_alt: "GFT Logo",
          settings_tooltip: "Param\xE8tres (Mode sombre, Stats, Aide)",
          error_corrections: "\u274C Erreur lors des corrections",
          // Sections
          section_structure: "Structure & Artistes",
          section_cleanup: "Outils de nettoyage",
          // Buttons & Tooltips
          btn_header: "En-t\xEAte",
          btn_header_tooltip: "Ins\xE9rer l'en-t\xEAte de la chanson avec les artistes",
          btn_intro: "[Intro]",
          btn_intro_tooltip: "Ins\xE9rer un tag [Intro] avec les artistes (Ctrl+4)",
          btn_verse_unique: "[Couplet unique]",
          btn_verse_unique_tooltip: "Ins\xE9rer un tag [Couplet unique] avec les artistes",
          btn_verse: "[Couplet]",
          btn_verse_tooltip: "Ins\xE9rer un tag [Couplet] sans num\xE9ro avec les artistes",
          btn_verse_num: "[Couplet 1]",
          btn_verse_num_tooltip: "Ins\xE9rer un tag [Couplet X] avec gestion du num\xE9ro",
          btn_chorus: "[Refrain]",
          btn_chorus_tooltip: "Ins\xE9rer un tag [Refrain] avec les artistes (Ctrl+1, Ctrl+2)",
          btn_pre_chorus: "[Pr\xE9-refrain]",
          btn_pre_chorus_tooltip: "Ins\xE9rer un tag [Pr\xE9-refrain] (Ctrl+3)",
          btn_bridge: "[Pont]",
          btn_bridge_tooltip: "Ins\xE9rer un tag [Pont] avec les artistes (Ctrl+5)",
          btn_outro: "[Outro]",
          btn_outro_tooltip: "Ins\xE9rer un tag [Outro] avec les artistes",
          btn_instrumental: "[Instrumental]",
          btn_instrumental_tooltip: "Ins\xE9rer un tag [Instrumental]",
          btn_break: "[Pause]",
          btn_break_tooltip: "Ins\xE9rer un tag [Pause]",
          btn_post_chorus: "[Post-refrain]",
          btn_post_chorus_tooltip: "Ins\xE9rer un tag [Post-refrain]",
          btn_unknown: "[?]",
          btn_unknown_tooltip: "Ins\xE9rer un tag [?]",
          btn_zws_remove: "Suppr. ZWS",
          btn_zws_remove_tooltip: "Supprime les caract\xE8res invisibles (Zero Width Space)",
          btn_hook: "[Przy\u015Bpiewka]",
          btn_hook_tooltip: "Ins\xE9rer un tag [Przy\u015Bpiewka] (r\xE8gle polonaise)",
          btn_interlude: "[Interludium]",
          btn_interlude_tooltip: "Ins\xE9rer un tag [Interludium]",
          btn_part: "[Cz\u0119\u015B\u0107]",
          btn_part_tooltip: "Ins\xE9rer un tag [Cz\u0119\u015B\u0107] (Partie)",
          btn_skit: "[Skit]",
          btn_skit_tooltip: "Ins\xE9rer un tag [Skit]",
          btn_vocalization: "[Wokaliza]",
          btn_vocalization_tooltip: "Ins\xE9rer un tag [Wokaliza] (Vocalises)",
          // Cleanup Tools
          cleanup_capitalize: "Maj. D\xE9but",
          cleanup_capitalize_tooltip: "Met une majuscule au d\xE9but de chaque ligne",
          cleanup_punct: "Ponctuation",
          cleanup_punct_tooltip: "Supprime la ponctuation en fin de ligne (. , ;)",
          cleanup_quotes: "Guillemets",
          cleanup_quotes_tooltip: "Transforme les apostrophes droites (') en courbes (\u2019) et corrige les guillemets",
          cleanup_parens: "Parenth\xE8ses",
          cleanup_parens_tooltip: "V\xE9rifie les parenth\xE8ses et crochets manquants ou mal ferm\xE9s",
          cleanup_all: "Tout Corriger",
          cleanup_all_tooltip: "Applique toutes les corrections d'un coup (Ctrl+Shift+C)",
          global_check_tooltip: "V\xE9rifier les parenth\xE8ses et crochets manquants ou mal ferm\xE9s",
          global_fix_tooltip: "Appliquer toutes les corrections de texte d'un coup",
          // Button Labels (Cleanup)
          btn_y_label: "y' \u2192 y",
          btn_apostrophe_label: "' \u2192 '",
          cleanup_apostrophe_tooltip: "Remplace les apostrophes courbes par des apostrophes droites",
          btn_oeu_label: "oeu \u2192 \u0153u",
          btn_french_quotes_label: '\xAB\xBB \u2192 "',
          cleanup_french_quotes_tooltip: 'Remplace les guillemets fran\xE7ais \xAB\xBB par des guillemets droits "',
          btn_long_dash_label: "\u2014 \u2192 -",
          cleanup_long_dash_tooltip: "Remplace les tirets longs (\u2014 \u2013) par des tirets courts (-)",
          btn_double_spaces_label: "Doubles espaces",
          cleanup_double_spaces_tooltip: "Supprime les espaces en double",
          btn_duplicate_line_label: "\u{1F4CB} Dupliquer ligne",
          cleanup_duplicate_line_tooltip: "Duplique la ligne actuelle (Ctrl+D)",
          cleanup_spacing_tooltip: "Corrige l'espacement entre les lignes (supprime les lignes vides en trop)",
          cleanup_y_tooltip: `Remplace les "y'" par des "y " (r\xE8gle Genius)`,
          cleanup_oeu_tooltip: 'Remplace "oeu" par le caract\xE8re sp\xE9cial "\u0153u"',
          btn_adlib_label: "(Ad-lib)",
          cleanup_adlib_tooltip: "Entoure le texte s\xE9lectionn\xE9 de parenth\xE8ses pour les ad-libs",
          btn_capitalize_label: "Maj. d\xE9but ligne",
          btn_punctuation_label: "Suppr. ., fin ligne",
          btn_spacing_label: "Corriger Espacement",
          btn_check_label: "\u{1F50D} V\xE9rifier ( ) [ ]",
          btn_fix_all_label: "Tout Corriger (Texte)",
          btn_capitalize_short: "Majuscules",
          btn_punctuation_short: "Ponctuation",
          btn_spacing_short: "Espacement",
          btn_fix_all_short: "\u2728 Tout Corriger",
          btn_prev_couplet_title: "Couplet pr\xE9c\xE9dent",
          btn_prev_couplet_tooltip: "Revenir au couplet pr\xE9c\xE9dent",
          btn_next_couplet_title: "Couplet suivant",
          btn_next_couplet_tooltip: "Passer au couplet suivant",
          btn_add_custom_structure_title: "Ajouter un bouton de structure personnalis\xE9",
          btn_add_custom_cleanup_title: "Ajouter un bouton de nettoyage personnalis\xE9",
          btn_polish_quotes_label: '\u201E\u201D \u2192 "',
          cleanup_polish_quotes_tooltip: "Remplace les guillemets polonais par des guillemets droits",
          btn_em_dash_label: "- \u2192 \u2014",
          cleanup_em_dash_tooltip: "Remplace les tirets courts par des tirets longs (r\xE8gle polonaise)",
          btn_ellipsis_label: "... \u2192 \u2026",
          cleanup_ellipsis_tooltip: "Remplace les trois points par un caract\xE8re d'ellipse",
          // Tutorial Steps
          tuto_step1_title: "1. Structure & Artistes \u{1F3D7}\uFE0F",
          tuto_step1_content: "\u2022 <strong>Artistes :</strong> Cochez les cases en haut pour attribuer automatiquement les sections sur les anciens editeurs.<br>\u2022 <strong>Couplets :</strong> Utilisez le nouveau bouton central <strong>[Couplet 1]</strong>. Les fl\xE8ches \u2190 \u2192 changent le num\xE9ro.<br>\u2022 <strong>Tags :</strong> Ins\xE9rez Refrain, Intro, Pont en un clic.",
          tuto_step2_title: "2. Corrections Intelligentes \u2728",
          tuto_step2_content: "\u2022 <strong>Tout Corriger :</strong> Nettoie apostrophes, majuscules, spaces.<br>\u2022 <strong>V\xE9rifier ( ) [ ] :</strong> Scanne les parenth\xE8ses oubli\xE9es.",
          tuto_step3_title: "3. Outils de Formatage \u{1F3A8}",
          tuto_step3_content: "\u2022 <strong>Barre Flottante :</strong> S\xE9lectionnez du texte pour mettre en gras, italique ou cr\xE9er une <strong>Lyric Card</strong>.<br>\u2022 <strong>Nombres en Lettres :</strong> Convertit '42' en 'quarante-deux'.",
          tuto_step4_title: "4. Historique & S\xE9curit\xE9 \u{1F6E1}\uFE0F",
          tuto_step4_content: "\u2022 <strong>Annuler/Refaire :</strong> Vos 10 derni\xE8res actions sont sauvegard\xE9es (Ctrl+Z).<br>\u2022 <strong>Sauvegarde Auto :</strong> Brouillons m\xE9moris\xE9s en cas de crash.",
          tuto_step5_title: "5. Contr\xF4le YouTube \u{1F4FA}",
          tuto_step5_content: "\u2022 <kbd>Ctrl+Alt+Espace</kbd> : Lecture / Pause<br>\u2022 <kbd>Ctrl+Alt+\u2190 / \u2192</kbd> : Reculer / Avancer (5s)",
          tuto_step6_title: "6. Autres Raccourcis \u2328\uFE0F",
          tuto_step6_content: "\u2022 <kbd>Ctrl+1-5</kbd> : Tags de structure<br>\u2022 <kbd>Ctrl+Shift+C</kbd> : Tout Corriger",
          tuto_finish_title: "C'est parti ! \u{1F680}",
          tuto_finish_content: "Vous \xEAtes pr\xEAt ! Explorez les param\xE8tres \u2699\uFE0F pour personnaliser votre exp\xE9rience.<br><br>\u{1F4A1} <strong>Note :</strong> Vous pouvez changer de mode/langue \xE0 tout moment en cliquant sur l'ic\xF4ne de l'extension.",
          // Lyric Mode Specific Tutorial
          tuto_lyric_mode_title: "Mode Lyric Card Activ\xE9 \u{1F3A8}",
          tuto_lyric_mode_content: "Pour cr\xE9er une Lyric Card :<br>1. <strong>Surlignez</strong> les paroles de votre choix.<br>2. Cliquez sur le bouton <strong>'Cr\xE9er Lyric Card'</strong> qui appara\xEEt.<br><br>\u{1F4A1} <strong>Note :</strong> Changez les param\xE8tres via l'ic\xF4ne de l'extension.",
          tuto_lyric_mode_btn: "C'est compris !",
          // Lyric Card Modal
          lc_modal_title: "Aper\xE7u Lyric Card",
          lc_album_default: "\u{1F4BF} Pochette Album (D\xE9faut)",
          lc_manual_search: "\u{1F50D} Rechercher un artiste...",
          lc_format_btn: "\u{1F4CF} Format: ",
          lc_search_placeholder: "Tapez un nom d'artiste...",
          lc_upload_btn: "\u{1F4C2} Upload une image",
          lc_download_btn: "\u2B07\uFE0F T\xE9l\xE9charger",
          lc_download_done: "\u2705 T\xE9l\xE9charg\xE9 !",
          lc_share_btn: "\u{1D54F} Partager",
          lc_share_copying: "\u{1F4CB} Copie...",
          lc_share_copied: "\u2705 Copi\xE9 !",
          lc_share_error: "\u274C Erreur",
          lc_feedback_load_error: "Erreur chargement image.",
          lc_search_searching: "\u23F3 Recherche en cours...",
          lc_search_none: "Aucun r\xE9sultat trouv\xE9 \u{1F615}",
          lc_custom_img: "\u{1F4C2} Image import\xE9e",
          lc_select_text_error: "Veuillez s\xE9lectionner du texte pour cr\xE9er une Lyric Card.",
          // Lyric Card Feedback
          lc_error_search: "Erreur lors de la recherche",
          lc_img_copied_tweet: "Image copi\xE9e ! Faites Ctrl+V dans la fen\xEAtre X qui vient de s'ouvrir.",
          lc_error_copy: "Impossible de copier l'image.",
          lc_error_img_not_found: "Image introuvable pour",
          lc_img_loaded: "Image charg\xE9e !",
          lc_error_album_not_found: "Impossible de trouver la pochette de l'album.",
          lc_searching_artist: "Recherche de l'image artiste...",
          lc_generating: "G\xE9n\xE9ration de la Lyric Card en cours...",
          lc_error_internal: "Erreur interne: Fonction introuvable.",
          lc_fetching_id: "R\xE9cup\xE9ration image artiste (via ID)...",
          lc_searching_name: "Recherche image pour",
          lc_img_applied: "Image appliqu\xE9e :",
          lc_img_found: "Image artiste trouv\xE9e !",
          lc_api_error: "\xC9chec API, essai extraction locale...",
          lc_opening: "Ouverture de la Lyric Card...",
          // Toolbar
          toolbar_bold: "Gras",
          toolbar_italic: "Italique",
          toolbar_num_to_words: "Nombre \u2192 Lettres",
          toolbar_bold_tooltip: "Mettre le texte s\xE9lectionn\xE9 en gras",
          toolbar_italic_tooltip: "Mettre le texte s\xE9lectionn\xE9 en italique",
          toolbar_lyric_card_tooltip: "G\xE9n\xE9rer une Lyric Card (1280x720)",
          toolbar_num_to_words_tooltip: "Convertir le nombre s\xE9lectionn\xE9 en lettres",
          // Tutorial Buttons
          tuto_prev: "Pr\xE9c\xE9dent",
          tuto_next: "Suivant",
          tuto_skip: "Passer",
          tuto_finish: "Terminer",
          tuto_step_counter: "\xC9tape",
          tuto_of: "sur",
          // Correction Preview Modal
          preview_title: "\u{1F6E0}\uFE0F Configurer les corrections",
          preview_diff_title: "Aper\xE7u des modifications (Unified View)",
          preview_btn_cancel: "Annuler",
          preview_btn_apply: "Appliquer la s\xE9lection",
          preview_summary: "\u{1F4CA} {count} correction(s) \xE0 appliquer :",
          preview_no_corrections: "Aucune correction s\xE9lectionn\xE9e/n\xE9cessaire.",
          preview_opt_yprime: "y' \u2192 y",
          preview_opt_apostrophes: "Apostrophes '",
          preview_opt_oeu: "oeu \u2192 \u0153u",
          preview_opt_quotes: 'Guillemets \xAB\xBB \u2192 "',
          preview_opt_dash: "Tirets longs \u2014 \u2013 \u2192 -",
          preview_opt_spaces: "Doubles espaces",
          preview_opt_spacing: "Espacement (lignes)",
          preview_stat_apostrophes: "apostrophe(s) \u2019",
          preview_stat_quotes: "guillemet(s) fran\xE7ais",
          preview_stat_dash: "tiret(s) long(s)",
          preview_stat_spaces: "double(s) espace(s)",
          preview_stat_spacing: "espacement(s) de ligne",
          preview_stat_orphans: "orphelins",
          preview_opt_orphans: "Orphelins (Pr\xE9positions Polonaises)",
          // Draft notification
          draft_found_title: "Brouillon trouv\xE9 !",
          draft_saved_at: "Sauvegard\xE9 \xE0",
          draft_btn_restore: "Restaurer",
          draft_btn_discard: "Ignorer",
          draft_restored: "Brouillon restaur\xE9 avec succ\xE8s !",
          // Progress steps
          progress_step_yprime: `Correction de "y'"...`,
          progress_step_apostrophes: "Correction des apostrophes...",
          progress_step_oeu: 'Correction de "oeu"...',
          progress_step_quotes: "Correction des guillemets \xAB\xBB...",
          progress_step_dash: "Correction des tirets longs...",
          progress_step_spaces: "Suppression des doubles espaces...",
          progress_step_spacing: "Correction de l'espacement...",
          // Feedback messages
          feedback_adlib_added: "(Ad-lib) ajout\xE9 !",
          feedback_select_text_first: "\u26A0\uFE0F S\xE9lectionnez du texte d'abord",
          feedback_no_replacement: "Aucune occurrence trouv\xE9e.",
          feedback_replaced: '{count} occurrence(s) de "{item}" remplac\xE9e(s)',
          feedback_no_correction_needed: "Aucune correction de {item} n\xE9cessaire.",
          feedback_corrected: "{count} {item} corrig\xE9(s) !",
          feedback_no_changes: "Aucune modification \xE0 annuler.",
          feedback_undo: "\u21A9\uFE0F Annul\xE9",
          feedback_redo: "\u21AA\uFE0F Refait",
          feedback_pause: "\u23F8\uFE0F Pause",
          feedback_play: "\u25B6\uFE0F Lecture",
          feedback_duplicate_line: "\u{1F4CB} Ligne dupliqu\xE9e !",
          feedback_no_text_corrections: "Aucune correction de texte. V\xE9rifiez visuellement les parenth\xE8ses.",
          feedback_brackets_ok: "\u2705 Aucun probl\xE8me trouv\xE9 ! Toutes les parenth\xE8ses et crochets sont bien appari\xE9s.",
          feedback_brackets_issue: "\u26A0\uFE0F {count} parenth\xE8se(s)/crochet(s) non appari\xE9(s) d\xE9tect\xE9(s) et surlign\xE9(s) en rouge !",
          feedback_summary_corrected: "\u2705 Corrig\xE9 : {details} ({count} au total)",
          feedback_summary_correction: "{count} correction(s) appliqu\xE9e(s)",
          feedback_detail_yprime: `{count} "y'"`,
          feedback_detail_apostrophes: "{count} apostrophe(s)",
          feedback_detail_oeu: '{count} "oeu"',
          feedback_detail_quotes: "{count} guillemets",
          feedback_detail_dash: "{count} tirets",
          feedback_detail_spaces: "{count} doubles espaces",
          feedback_detail_spacing: "{count} espacement(s)",
          feedback_detail_orphans: "{count} orphelin|{count} orphelins",
          feedback_wrapped: "Texte entour\xE9 : {start}...{end}",
          feedback_corrections_cancelled: "Corrections annul\xE9es",
          // Stats
          stats_lines: "ligne|lignes",
          stats_words: "mot|mots",
          stats_sections: "section|sections",
          stats_characters: "caract\xE8re|caract\xE8res",
          preview_stat_yprime: `occurrence(s) de "y'"`,
          preview_stat_oeu: 'occurrence(s) de "oeu"',
          find_replace_title: "Rechercher & Remplacer",
          find_placeholder: "Rechercher...",
          replace_placeholder: "Remplacer par...",
          btn_replace: "Remplacer",
          btn_replace_all: "Tout Remplacer",
          regex_toggle: "Regex",
          custom_manager_title: "\u2728 Gestionnaire de boutons",
          custom_manager_tab_create: "Cr\xE9er",
          custom_manager_tab_library: "Biblioth\xE8que",
          custom_mgr_action_type: "Type d'action",
          custom_mgr_type_structure: "Tag de structure (Insertion)",
          custom_mgr_type_cleanup: "Outil de nettoyage (Recherche/Remplacer)",
          custom_mgr_button_label: "Texte du bouton",
          custom_mgr_btn_label_placeholder: "Ex: [Couplet], Suppr. Emojis...",
          custom_mgr_text_to_insert: "Texte \xE0 ins\xE9rer",
          custom_mgr_advanced_regex: "Mode Regex Avanc\xE9",
          custom_mgr_find_pattern: "Mod\xE8le \xE0 rechercher",
          custom_mgr_replace_with: "Remplacer par",
          custom_mgr_save_button: "Sauvegarder le bouton",
          custom_mgr_empty_library: "Aucun bouton personnalis\xE9 trouv\xE9.",
          custom_mgr_share_presets: "Partage de configurations",
          custom_mgr_import_placeholder: "Collez un code ici pour importer, ou cliquez sur Exporter...",
          custom_mgr_export_code: "Copier le code d'export",
          custom_mgr_import_button: "Importer le code",
          custom_mgr_error_no_label: "Veuillez sp\xE9cifier un nom pour le bouton.",
          custom_mgr_error_no_content: "Le contenu est requis.",
          custom_mgr_success_created: "Bouton cr\xE9\xE9 ! Actualisation...",
          custom_mgr_success_imported: "Importation r\xE9ussie ! Actualisation...",
          custom_mgr_find_placeholder_exact: "Texte exact \xE0 supprimer",
          custom_mgr_find_placeholder_regex: "Motif Regex (ex: d+s*$)",
          custom_mgr_replace_placeholder: "(Laisser vide pour supprimer)",
          custom_mgr_case_sensitive: "Respecter la casse",
          settings_custom_library: "\u{1F4DA} Biblioth\xE8que de boutons"
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
          theme_select_title: "Choose your theme \u{1F317}",
          theme_light_btn: "Light Mode \u2600\uFE0F",
          theme_dark_btn: "Dark Mode \u{1F319}",
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
          dark_mode_toggle_light: "\u2600\uFE0F Light Mode",
          dark_mode_toggle_dark: "\u{1F319} Dark Mode",
          stats_show: "\u{1F4CA} Show Statistics",
          stats_hide: "\u{1F4CA} Hide Statistics",
          header_feat_show: "\u{1F3A4} Show feat in header",
          header_feat_hide: "\u{1F3A4} Hide feat in header",
          newline_enable: "\u21B5 Enable newline after tags",
          newline_disable: "\u21B5 Disable newline after tags",
          tutorial_link: "\u2753 Tutorial / Help",
          undo_tooltip: "Undo last change (Ctrl+Z)",
          redo_tooltip: "Redo last undone change (Ctrl+Y)",
          panel_title_img_alt: "GFT Logo",
          settings_tooltip: "Settings (Dark Mode, Stats, Help)",
          error_corrections: "\u274C Error during corrections",
          // Sections
          section_structure: "Structure & Artists",
          section_cleanup: "Cleanup Tools",
          // Buttons & Tooltips - REVERT TO FRENCH for Transcription tags
          btn_header: "Header",
          btn_header_tooltip: "Insert song header with artists",
          btn_intro: "[Intro]",
          btn_intro_tooltip: "Insert [Intro] tag with artists (Ctrl+4)",
          btn_verse_unique: "[Unique Verse]",
          btn_verse_unique_tooltip: "Insert [Unique Verse] tag with artists",
          btn_verse: "[Verse]",
          btn_verse_tooltip: "Insert [Verse] tag without number",
          btn_verse_num: "[Verse 1]",
          btn_verse_num_tooltip: "Insert [Verse X] tag with automatic numbering",
          btn_chorus: "[Chorus]",
          btn_chorus_tooltip: "Insert [Chorus] tag with artists (Ctrl+1, Ctrl+2)",
          btn_pre_chorus: "[Pre-Chorus]",
          btn_pre_chorus_tooltip: "Insert [Pre-Chorus] tag (Ctrl+3)",
          btn_bridge: "[Bridge]",
          btn_bridge_tooltip: "Insert [Bridge] tag with artists (Ctrl+5)",
          btn_outro: "[Outro]",
          btn_outro_tooltip: "Insert [Outro] tag with artists",
          btn_instrumental: "[Instrumental]",
          btn_instrumental_tooltip: "Insert [Instrumental] tag",
          btn_break: "[Break]",
          btn_break_tooltip: "Insert [Break] tag",
          btn_post_chorus: "[Post-Chorus]",
          btn_post_chorus_tooltip: "Insert [Post-Chorus] tag",
          btn_unknown: "[?]",
          btn_unknown_tooltip: "Insert [?] tag for unknown section",
          btn_hook: "[Hook]",
          btn_hook_tooltip: "Insert [Hook] tag",
          btn_interlude: "[Interlude]",
          btn_interlude_tooltip: "Insert [Interlude] tag",
          btn_part: "[Part]",
          btn_part_tooltip: "Insert [Part] tag",
          btn_skit: "[Skit]",
          btn_skit_tooltip: "Insert [Skit] tag",
          btn_vocalization: "[Vocalization]",
          btn_vocalization_tooltip: "Insert [Vocalization] tag",
          btn_adlib_label: "(Ad-lib)",
          btn_orphans_label: "Orphans cleanup",
          cleanup_orphans_tooltip: "Prevents hanging single-letter words at the end of lines",
          btn_zws_remove: "\u232B ZWS",
          btn_zws_remove_tooltip: "Remove invisible zero-width space characters",
          // Cleanup Tools - English descriptions
          cleanup_capitalize: "Capitalize",
          cleanup_capitalize_tooltip: "Capitalize the start of each line",
          cleanup_punct: "Punctuation",
          cleanup_punct_tooltip: "Remove punctuation at the end of lines (. , ;)",
          cleanup_quotes: "Quotes",
          cleanup_quotes_tooltip: "Convert curly apostrophes to straight ones and fix quotes",
          cleanup_parens: "Brackets",
          cleanup_parens_tooltip: "Check for missing or unmatched brackets and parentheses",
          cleanup_all: "Fix All",
          cleanup_all_tooltip: "Apply all text corrections at once (Ctrl+Shift+C)",
          btn_polish_quotes_label: '\u201E\u201D \u2192 "',
          cleanup_polish_quotes_tooltip: "Replace Polish quotes with straight quotes",
          btn_em_dash_label: "- \u2192 \u2014",
          cleanup_em_dash_tooltip: "Replace short hyphens with em-dashes (Polish rule)",
          btn_ellipsis_label: "... \u2192 \u2026",
          cleanup_ellipsis_tooltip: "Replace three dots with ellipsis character",
          // Button Labels (Cleanup) - REVERT
          btn_y_label: "y' \u2192 y",
          btn_apostrophe_label: "' \u2192 '",
          btn_oeu_label: "oeu \u2192 \u0153u",
          btn_french_quotes_label: '\xAB\xBB \u2192 "',
          cleanup_french_quotes_tooltip: 'Replace French quotes \xAB\xBB with straight quotes "',
          btn_long_dash_label: "\u2014 \u2192 -",
          cleanup_long_dash_tooltip: "Remplace les tirets longs (\u2014 \u2013) par des tirets courts (-)",
          btn_double_spaces_label: "Double spaces",
          cleanup_double_spaces_tooltip: "Remove double spaces",
          btn_duplicate_line_label: "\u{1F4CB} Duplicate line",
          cleanup_duplicate_line_tooltip: "Duplicate current line (Ctrl+D)",
          cleanup_adlib_tooltip: "Entoure le texte s\xE9lectionn\xE9 de parenth\xE8ses pour les ad-libs",
          btn_capitalize_label: "Maj. d\xE9but ligne",
          btn_punctuation_label: "Suppr. ., fin ligne",
          btn_spacing_label: "Fix Spacing",
          btn_check_label: "\u{1F50D} Check ( ) [ ]",
          btn_fix_all_label: "Fix All (Text)",
          btn_capitalize_short: "Majuscules",
          btn_punctuation_short: "Ponctuation",
          btn_spacing_short: "Spacing",
          btn_fix_all_short: "\u2728 Fix All",
          // Tutorial Steps
          tuto_step1_title: "1. Structure & Artists \u{1F3D7}\uFE0F",
          tuto_step1_content: "\u2022 <strong>Artists:</strong> Check boxes at top to assign sections automatically on old editors.<br>\u2022 <strong>Verses:</strong> Use the central <strong>[Verse 1]</strong> button. Arrows \u2190 \u2192 change the number.<br>\u2022 <strong>Tags:</strong> Insert Chorus, Intro, Bridge in one click.",
          tuto_step2_title: "2. Smart Corrections \u2728",
          tuto_step2_content: "\u2022 <strong>Fix All:</strong> Cleans apostrophes, capitalization, spaces.<br>\u2022 <strong>Verification ( ) [ ]:</strong> Scans for missing brackets.",
          tuto_step3_title: "3. Formatting Tools \u{1F3A8}",
          tuto_step3_content: "\u2022 <strong>Floating Bar:</strong> Select text to bold, italic, or create a <strong>Lyric Card</strong>.<br>\u2022 <strong>Numbers to Words:</strong> Converts '42' to 'forty-two'.",
          tuto_step4_title: "4. History & Safety \u{1F6E1}\uFE0F",
          tuto_step4_content: "\u2022 <strong>Undo/Redo:</strong> Your last 10 actions are saved (Ctrl+Z).<br>\u2022 <strong>Auto Save:</strong> Drafts saved locally.",
          tuto_step5_title: "5. YouTube Control \u{1F4FA}",
          tuto_step5_content: "\u2022 <kbd>Ctrl+Alt+Space</kbd> : Play / Pause<br>\u2022 <kbd>Ctrl+Alt+\u2190 / \u2192</kbd> : Rewind / Forward (5s)",
          tuto_step6_title: "6. Other Shortcuts \u2328\uFE0F",
          tuto_step6_content: "\u2022 <kbd>Ctrl+1-5</kbd> : Structure tags<br>\u2022 <kbd>Ctrl+Shift+C</kbd> : Fix All",
          tuto_finish_title: "Let's Go! \u{1F680}",
          tuto_finish_content: "You're ready! Explore settings \u2699\uFE0F to customize your experience.<br><br>\u{1F4A1} <strong>Note:</strong> You can change mode/language anytime by clicking the extension icon.",
          // Lyric Mode Specific Tutorial
          tuto_lyric_mode_title: "Lyric Card Mode Active \u{1F3A8}",
          tuto_lyric_mode_content: "To create a Lyric Card:<br>1. <strong>Highlight</strong> the lyrics of your choice.<br>2. Click on the <strong>'Create Lyric Card'</strong> button that appears.<br><br>\u{1F4A1} <strong>Note:</strong> Change settings via the extension icon.",
          tuto_lyric_mode_btn: "Got it!",
          // Lyric Card Modal
          lc_modal_title: "Lyric Card Preview",
          lc_album_default: "\u{1F4BF} Album Cover (Default)",
          lc_manual_search: "\u{1F50D} Search an artist...",
          lc_format_btn: "\u{1F4CF} Format: ",
          lc_search_placeholder: "Type an artist name...",
          lc_upload_btn: "\u{1F4C2} Upload an image",
          lc_download_btn: "\u2B07\uFE0F Download",
          lc_download_done: "\u2705 Downloaded!",
          lc_share_btn: "\u{1D54F} Share",
          lc_share_copying: "\u{1F4CB} Copying...",
          lc_share_copied: "\u2705 Copied!",
          lc_share_error: "\u274C Error",
          lc_feedback_load_error: "Error loading image.",
          lc_search_searching: "\u23F3 Searching...",
          lc_search_none: "No results found \u{1F615}",
          lc_custom_img: "\u{1F4C2} Imported image",
          lc_select_text_error: "Please select text to create a Lyric Card.",
          // Lyric Card Feedback
          lc_error_search: "Error during search",
          lc_img_copied_tweet: "Image copied! Press Ctrl+V in the X window that just opened.",
          lc_error_copy: "Could not copy image.",
          lc_error_img_not_found: "Image not found for",
          lc_img_loaded: "Image loaded!",
          lc_error_album_not_found: "Could not find album cover.",
          lc_searching_artist: "Searching for artist image...",
          lc_generating: "Generating Lyric Card...",
          lc_error_internal: "Internal error: Function not found.",
          lc_fetching_id: "Fetching artist image (via ID)...",
          lc_searching_name: "Searching image for",
          lc_img_applied: "Image applied:",
          // Toolbar
          toolbar_bold: "Bold",
          toolbar_italic: "Italic",
          toolbar_num_to_words: "Number \u2192 Words",
          toolbar_bold_tooltip: "Make selected text bold",
          toolbar_italic_tooltip: "Make selected text italic",
          toolbar_lyric_card_tooltip: "Generate a Lyric Card (1280x720)",
          toolbar_num_to_words_tooltip: "Convert selected number to words (French logic)",
          // Tutorial Steps (Translated)
          // Tutorial Buttons
          tuto_prev: "Previous",
          tuto_next: "Next",
          tuto_skip: "Skip",
          tuto_finish: "Finish",
          tuto_step_counter: "Step",
          tuto_of: "of",
          // Correction Preview Modal
          preview_title: "\u{1F6E0}\uFE0F Configure corrections",
          preview_diff_title: "Modification preview (Unified View)",
          preview_btn_cancel: "Cancel",
          preview_btn_apply: "Apply selection",
          preview_summary: "\u{1F4CA} {count} correction(s) to apply:",
          preview_no_corrections: "No corrections selected/needed.",
          preview_opt_yprime: "y' \u2192 y",
          preview_opt_apostrophes: "Apostrophes '",
          preview_opt_oeu: "oeu \u2192 \u0153u",
          preview_opt_quotes: 'Quotes \xAB\xBB \u2192 "',
          preview_opt_dash: "Long dashes \u2014 \u2013 \u2192 -",
          preview_opt_spaces: "Double spaces",
          preview_opt_spacing: "Spacing (lines)",
          preview_stat_apostrophes: "apostrophe(s)",
          preview_stat_quotes: "french quote(s)",
          preview_stat_dash: "long dash(es)",
          preview_stat_spaces: "double space(s)",
          preview_stat_spacing: "line spacing",
          preview_stat_orphans: "orphans",
          preview_opt_orphans: "Orphans (Polish rules)",
          feedback_detail_orphans: "{count} orphan|{count} orphans",
          feedback_replaced: "{count} {item} replaced!",
          feedback_no_replacement: "No replacement made.",
          find_replace_title: "Find & Replace",
          find_placeholder: "Find...",
          replace_placeholder: "Replace with...",
          btn_replace: "Replace",
          btn_replace_all: "Replace All",
          regex_toggle: "Regex",
          // Button labels (English specific)
          btn_prev_couplet_title: "Previous Verse",
          btn_prev_couplet_tooltip: "Go to previous verse",
          btn_next_couplet_title: "Next Verse",
          btn_next_couplet_tooltip: "Go to next verse",
          btn_add_custom_structure_title: "Add custom structure button",
          btn_add_custom_cleanup_title: "Add custom cleanup button",
          // Cleanup tooltips
          cleanup_apostrophe_tooltip: "Replace curly apostrophes with straight ones",
          cleanup_spacing_tooltip: "Fix line spacing (remove extra empty lines)",
          global_check_tooltip: "Check for unmatched brackets and parentheses",
          global_fix_tooltip: "Apply all text corrections at once",
          cleanup_y_tooltip: `Replace "y'" with "y " (French typography rule)`,
          cleanup_oeu_tooltip: 'Replace "oeu" with the special character "\u0153u" (French typography rule)',
          // Draft notification
          draft_found_title: "Draft found!",
          draft_saved_at: "Saved at",
          draft_btn_restore: "Restore",
          draft_btn_discard: "Discard",
          draft_restored: "Draft restored successfully!",
          // Progress steps
          progress_step_yprime: `Fixing "y'"...`,
          progress_step_apostrophes: "Fixing apostrophes...",
          progress_step_oeu: 'Fixing "oeu"...',
          progress_step_quotes: "Fixing quotes \xAB\xBB...",
          progress_step_dash: "Fixing long dashes...",
          progress_step_spaces: "Removing double spaces...",
          progress_step_spacing: "Fixing spacing...",
          // Feedback messages
          feedback_adlib_added: "(Ad-lib) added!",
          feedback_select_text_first: "\u26A0\uFE0F Select text first",
          feedback_no_correction_needed: "No {item} correction needed.",
          feedback_corrected: "{count} {item} corrected!",
          feedback_no_changes: "No changes to undo.",
          feedback_undo: "\u21A9\uFE0F Undone",
          feedback_redo: "\u21AA\uFE0F Redone",
          feedback_pause: "\u23F8\uFE0F Pause",
          feedback_play: "\u25B6\uFE0F Play",
          feedback_duplicate_line: "\u{1F4CB} Line duplicated!",
          feedback_no_text_corrections: "No text correction. Visually check the brackets.",
          feedback_brackets_ok: "\u2705 No issues found! All brackets are well paired.",
          feedback_brackets_issue: "\u26A0\uFE0F {count} unmatched parenthesis/bracket(s) detected and highlighted in red!",
          feedback_summary_corrected: "\u2705 Fixed: {details} ({count} total)",
          // Stats
          stats_lines: "line|lines",
          stats_words: "word|words",
          stats_sections: "section|sections",
          stats_characters: "character|characters",
          preview_stat_yprime: `"y'" occurrence(s)`,
          preview_stat_oeu: '"oeu" occurrence(s)',
          feedback_summary_correction: "{count} correction(s) applied",
          feedback_detail_yprime: `{count} "y'"`,
          feedback_detail_apostrophes: "{count} apostrophe(s)",
          feedback_detail_oeu: '{count} "oeu"',
          feedback_detail_quotes: "{count} quotes",
          feedback_detail_dash: "{count} dashes",
          feedback_detail_spaces: "{count} double spaces",
          feedback_detail_spacing: "{count} spacing",
          feedback_wrapped: "Text wrapped: {start}...{end}",
          feedback_corrections_cancelled: "Corrections cancelled",
          lc_img_found: "Artist image found!",
          lc_api_error: "API error, trying local extraction...",
          lc_opening: "Opening Lyric Card...",
          custom_manager_title: "\u2728 Custom Buttons Manager",
          custom_manager_tab_create: "Create",
          custom_manager_tab_library: "Library",
          custom_mgr_action_type: "Action Type",
          custom_mgr_type_structure: "Structure Tag (Insertion)",
          custom_mgr_type_cleanup: "Cleanup Tool (Search/Replace)",
          custom_mgr_button_label: "Button Label",
          custom_mgr_btn_label_placeholder: "Ex: [Verse], Remove Emojis...",
          custom_mgr_text_to_insert: "Text to Insert",
          custom_mgr_advanced_regex: "Advanced Regex Mode",
          custom_mgr_find_pattern: "Find Pattern",
          custom_mgr_replace_with: "Replace With",
          custom_mgr_save_button: "Save Custom Button",
          custom_mgr_empty_library: "No custom buttons found.",
          custom_mgr_share_presets: "Share Presets",
          custom_mgr_import_placeholder: "Paste a preset code here to import, or click Export...",
          custom_mgr_export_code: "Copy Export Code",
          custom_mgr_import_button: "Import Code",
          custom_mgr_error_no_label: "Please specify a button label.",
          custom_mgr_error_no_content: "Content is required.",
          custom_mgr_success_created: "Button created! Reloading...",
          custom_mgr_success_imported: "Import successful! Reloading...",
          custom_mgr_find_placeholder_exact: "Exact text to remove",
          custom_mgr_find_placeholder_regex: "Regex Pattern (e.g. d+s*$)",
          custom_mgr_replace_placeholder: "(Leave empty to delete)",
          custom_mgr_case_sensitive: "Case Sensitive",
          settings_custom_library: "\u{1F4DA} Buttons Library"
        },
        // Polish translations - UI strings are placeholders for contributor PR
        // Structure tags and cleanup tools are Polish-specific per Genius Polska guidelines
        pl: {
          panel_title: "Genius Fast Transcriber",
          artist_selection: "Przypisz sekcj\u0119 do:",
          no_artist: "Nie wykryto wykonawcy.",
          shortcuts_title: "Skr\xF3ty",
          add_couplet: "Dodaj zwrotk\u0119",
          format_numbers: "Liczby na s\u0142owa",
          create_lyric_card: "Utw\xF3rz Lyric Card",
          preview: "Podgl\u0105d",
          copy: "Kopiuj",
          undo: "Cofnij",
          redo: "Pon\xF3w",
          feedback_copied: "Skopiowano!",
          feedback_restored: "Przywr\xF3cono!",
          onboarding_title: "Witaj",
          next_btn: "Dalej",
          finish_btn: "Zako\u0144cz",
          mode_full_title: "Tryb pe\u0142ny",
          mode_full_desc: "Narz\u0119dzia do transkrypcji + Lyric Cards",
          mode_lyric_title: "Tylko Lyric Card",
          mode_lyric_desc: "Tylko tworzenie obraz\xF3w",
          recommended_label: "Zalecane",
          theme_select_title: "Wybierz motyw \u{1F317}",
          theme_light_btn: "Tryb jasny \u2600\uFE0F",
          theme_dark_btn: "Tryb ciemny \u{1F319}",
          lang_select_title: "J\u0119zyk",
          mode_select_title: "Tryb",
          full_mode_label: "Pe\u0142ny (transkrypcja + Lyric Cards)",
          lyric_only_label: "Tylko Lyric Card",
          settings_saved: "Zapisano zmiany!",
          open_panel: "Otw\xF3rz panel",
          close_panel: "Zamknij panel",
          onboarding_intro: "Skonfiguruj ustawienia narz\u0119dzia Genius Fast Transcriber.",
          // Settings & Tooltips
          settings_menu: "Ustawienia",
          dark_mode_toggle_light: "\u2600\uFE0F Tryb jasny",
          dark_mode_toggle_dark: "\u{1F319} Tryb ciemny",
          stats_show: "\u{1F4CA} Poka\u017C statystyki",
          stats_hide: "\u{1F4CA} Ukryj statystyki",
          header_feat_show: "\u{1F3A4} Poka\u017C 'feat.' w nag\u0142\xF3wku",
          header_feat_hide: "\u{1F3A4} Ukryj 'feat.' w nag\u0142\xF3wku",
          newline_enable: "\u21B5 Dodawaj now\u0105 lini\u0119 po tagach",
          newline_disable: "\u21B5 Nie dodawaj nowej linii po tagach",
          tutorial_link: "\u2753 Samouczek / Pomoc",
          undo_tooltip: "Cofnij ostatni\u0105 zmian\u0119 (Ctrl+Z)",
          redo_tooltip: "Pon\xF3w ostatni\u0105 cofni\u0119t\u0105 zmian\u0119 (Ctrl+Y)",
          panel_title_img_alt: "Logo GFT",
          // Sections
          section_structure: "Struktura i wykonawcy",
          section_cleanup: "Szybkie poprawki",
          // Buttons & Tooltips - Polish structure tags
          btn_header: "Nag\u0142\xF3wek SEO",
          btn_header_tooltip: "Wstaw nag\u0142\xF3wek z tytu\u0142em i wykonawcami utworu",
          btn_intro: "[Intro]",
          btn_intro_tooltip: "Wstaw tag [Intro] z wykonawcami",
          btn_verse_unique: "[Zwrotka]",
          btn_verse_unique_tooltip: "Wstaw tag [Zwrotka] z wykonawcami",
          btn_verse: "[Zwrotka]",
          btn_verse_tooltip: "Wstaw tag [Zwrotka] bez numeru wraz z wykonawcami",
          btn_verse_num: "[Zwrotka 1]",
          btn_verse_num_tooltip: "Wstaw tag [Zwrotka X] z automatyczn\u0105 numeracj\u0105",
          btn_chorus: "[Refren]",
          btn_chorus_tooltip: "Wstaw tag [Refren] z wykonawcami",
          btn_pre_chorus: "[Przedrefren]",
          btn_pre_chorus_tooltip: "Wstaw tag [Przedrefren] z wykonawcami",
          btn_bridge: "[Przej\u015Bcie]",
          btn_bridge_tooltip: "Wstaw tag [Przej\u015Bcie] z wykonawcami",
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
          btn_part: "[Cz\u0119\u015B\u0107]",
          btn_part_tooltip: "Wstaw tag [Cz\u0119\u015B\u0107]",
          btn_skit: "[Skit]",
          btn_skit_tooltip: "Wstaw tag [Skit]",
          btn_hook: "[Przy\u015Bpiewka]",
          btn_hook_tooltip: "Wstaw tag [Przy\u015Bpiewka] (stosowany obok tagu [Refren])",
          btn_vocalization: "[Wokaliza]",
          btn_vocalization_tooltip: "Wstaw tag [Wokaliza] dla wokali bez s\u0142\xF3w",
          btn_unknown: "[?]",
          btn_unknown_tooltip: "Wstaw tag [?]",
          btn_zws_remove: "Usu\u0144 ZWS",
          btn_zws_remove_tooltip: "Usuwa niewidoczne znaki (Zero Width Space)",
          // Cleanup Tools - Polish specific
          cleanup_capitalize: "Wielka litera",
          cleanup_capitalize_tooltip: "Zmienia pierwsz\u0105 liter\u0119 ka\u017Cdego wiersza na wielk\u0105",
          cleanup_punct: "Interpunkcja",
          cleanup_punct_tooltip: "Usuwa kropki, przecinki i \u015Bredniki z ko\u0144c\xF3w wierszy",
          cleanup_quotes: "Cudzys\u0142owy",
          cleanup_quotes_tooltip: 'Zamienia cudzys\u0142owy drukarskie (\u201E\u201D \xAB\xBB) na proste ("")',
          cleanup_parens: "Nawiasy",
          cleanup_parens_tooltip: "Znajduje brakuj\u0105ce lub b\u0142\u0119dnie zamkni\u0119te nawiasy",
          cleanup_all: "Popraw wszystko",
          cleanup_all_tooltip: "Stosuje wszystkie poprawki naraz (Ctrl+Shift+C)",
          // Button Labels (Cleanup) - Polish specific
          btn_polish_quotes_label: '\u201E\u201D \u2192 "',
          cleanup_polish_quotes_tooltip: 'Zamienia cudzys\u0142owy polskie (\u201E\u201D) na proste ("")',
          btn_apostrophe_label: "' \u2192 '",
          btn_em_dash_label: "- \u2192 \u2014",
          cleanup_em_dash_tooltip: "Zamienia dywizy (-) na my\u015Blnik (\u2014)",
          btn_ellipsis_label: "... \u2192 \u2026",
          cleanup_ellipsis_tooltip: "Zamienia trzy kropki na wielokropek (\u2026)",
          btn_french_quotes_label: '\xAB\xBB \u2192 "',
          cleanup_french_quotes_tooltip: 'Zamienia cudzys\u0142owy drukarskie (\xAB\xBB) na proste ("")',
          btn_double_spaces_label: "Podw\xF3jne spacje",
          cleanup_double_spaces_tooltip: "Usuwa podw\xF3jne spacje",
          btn_duplicate_line_label: "\u{1F4CB} Duplikuj lini\u0119",
          cleanup_duplicate_line_tooltip: "Duplikuje bie\u017C\u0105c\u0105 lini\u0119",
          btn_adlib_label: "(Ad-lib)",
          btn_orphans_label: "Sierotki",
          cleanup_orphans_tooltip: "\u0141\u0105czy pojedyncze litery z nast\u0119pnym s\u0142owem tward\u0105 spacj\u0105",
          cleanup_adlib_tooltip: "Otacza zaznaczony tekst nawiasami",
          cleanup_spacing_tooltip: "Naprawia odst\u0119py mi\u0119dzy liniami (usuwa zb\u0119dne puste linie)",
          btn_capitalize_label: "Wielka litera",
          btn_punctuation_label: "Usu\u0144 interpunkcj\u0119",
          btn_spacing_label: "Popraw odst\u0119py",
          btn_check_label: "\u{1F50D} Sprawd\u017A (\xA0) [\xA0]",
          btn_fix_all_label: "Popraw wszystko (Tekst)",
          btn_capitalize_short: "Wielkie litery",
          btn_punctuation_short: "Interpunkcja",
          btn_spacing_short: "Odst\u0119py",
          btn_fix_all_short: "\u2728 Popraw wszystko",
          btn_prev_couplet_title: "Poprzednia zwrotka",
          btn_prev_couplet_tooltip: "Wr\xF3\u0107 do poprzedniej zwrotki",
          btn_next_couplet_title: "Nast\u0119pna zwrotka",
          btn_next_couplet_tooltip: "Przejd\u017A do nast\u0119pnej zwrotki",
          btn_add_custom_structure_title: "Dodaj w\u0142asny tag",
          btn_add_custom_cleanup_title: "Dodaj w\u0142asn\u0105 szybk\u0105 poprawk\u0119",
          // Tutorial Steps
          tuto_step1_title: "1. Struktura i wykonawcy \u{1F3D7}\uFE0F",
          tuto_step1_content: "\u2022 <strong>Arty\u015Bci</strong> \u2014 Zaznacz wykonawc\xF3w, aby przypisa\u0107 ich do\xA0sekcji.<br>\u2022 <strong>Zwrotki:</strong> U\u017Cyj centralnego przycisku <strong>[Zwrotka 1]</strong>. Strza\u0142ki \u2190\xA0\u2192 zmieniaj\u0105 numeracj\u0119.<br>\u2022 <strong>Tagi:</strong> Wstaw [Refren], [Intro] lub [Przej\u015Bcie] jednym klikni\u0119ciem.",
          tuto_step2_title: "2. Inteligentne poprawki \u2728",
          tuto_step2_content: "\u2022 <strong>Popraw wszystko:</strong> Czy\u015Bci cudzys\u0142owy, wielkie litery i spacje.<br>\u2022 <strong>Sprawd\u017A ( ) [ ]:</strong> Znajduje brakuj\u0105ce lub b\u0142\u0119dnie zamkni\u0119te nawiasy.",
          tuto_step3_title: "3. Narz\u0119dzia do formatowania \u{1F3A8}",
          tuto_step3_content: "\u2022 <strong>P\u0142ywaj\u0105cy pasek narz\u0119dzi:</strong> Zaznacz tekst, aby go pogrubi\u0107, pochyli\u0107 lub utworzy\u0107 <strong>Lyric Card</strong>.<br>\u2022 <strong>Liczby na s\u0142owa:</strong> Zamienia \u201E42\u201D na \u201Eczterdzie\u015Bci dwa\u201D.",
          tuto_step4_title: "4. Historia i bezpiecze\u0144stwo \u{1F6E1}\uFE0F",
          tuto_step4_content: "\u2022 <strong>Cofnij/Pon\xF3w:</strong> Twoje ostatnie 10 czynno\u015Bci jest zapisanych (Ctrl+Z).<br>\u2022 <strong>Automatyczne zapisywanie:</strong> Wersje robocze s\u0105 zapisywane na wypadek awarii przegl\u0105darki.",
          tuto_step5_title: "5. Sterowanie odtwarzaczem YouTube \u{1F4FA}",
          tuto_step5_content: "\u2022 <kbd>Ctrl+Alt+Spacja</kbd>: Odtw\xF3rz/Wstrzymaj<br>\u2022 <kbd>Ctrl+Alt+\u2190 / \u2192</kbd>: Przewi\u0144 do ty\u0142u/do przodu o 5 sekund",
          tuto_step6_title: "6. Inne skr\xF3ty klawiszowe \u2328\uFE0F",
          tuto_step6_content: "\u2022 <kbd>Ctrl+1-5</kbd>: Tagi sekcji (np. Intro, Zwrotka)<br>\u2022 <kbd>Ctrl+Shift+C</kbd>: Popraw wszystko",
          tuto_finish_title: "Zaczynamy! \u{1F680}",
          tuto_finish_content: "Wszystko gotowe! Zajrzyj do ustawie\u0144 \u2699\uFE0F, aby rozszerzenie do swoich potrzeb.<br><br>\u{1F4A1} <strong>Uwaga:</strong> Tryb i j\u0119zyk mo\u017Cesz zmieni\u0107 w dowolnym momencie, klikaj\u0105c ikon\u0119 rozszerzenia.",
          // Lyric Mode Specific Tutorial
          tuto_lyric_mode_title: "Tryb Lyric Card aktywny \u{1F3A8}",
          tuto_lyric_mode_content: "Aby utworzy\u0107 Lyric Card:<br>1. <strong>Zaznacz</strong> wybrany fragment tekstu piosenki.<br>2. Kliknij przycisk <strong>\u201EUtw\xF3rz Lyric Card\u201D</strong>, kt\xF3ry si\u0119 pojawi.<br><br>\u{1F4A1} <strong>Wskaz\xF3wka:</strong> Ustawienia zmienisz, klikaj\u0105c ikon\u0119 rozszerzenia.",
          tuto_lyric_mode_btn: "Rozumiem!",
          // Lyric Card Modal
          lc_modal_title: "Podgl\u0105d Lyric Card",
          lc_album_default: "\u{1F4BF} Ok\u0142adka albumu (domy\u015Blnie)",
          lc_manual_search: "\u{1F50D} Wyszukaj wykonawc\u0119\u2026",
          lc_format_btn: "\u{1F4CF} Format: ",
          lc_search_placeholder: "Wpisz nazw\u0119 wykonawcy\u2026",
          lc_upload_btn: "\u{1F4C2} Prze\u015Blij obraz",
          lc_download_btn: "\u2B07\uFE0F Pobierz",
          lc_download_done: "\u2705 Pobrano!",
          lc_share_btn: "\u{1D54F} Udost\u0119pnij",
          lc_share_copying: "\u{1F4CB} Kopiowanie\u2026",
          lc_share_copied: "\u2705 Skopiowano!",
          lc_share_error: "\u274C Wyst\u0105pi\u0142 b\u0142\u0105d",
          lc_feedback_load_error: "B\u0142\u0105d wczytywania obrazu.",
          lc_search_searching: "\u23F3 Wyszukiwanie\u2026",
          lc_search_none: "Nie znaleziono wynik\xF3w \u{1F615}",
          lc_custom_img: "\u{1F4C2} Przes\u0142any obraz",
          lc_select_text_error: "Zaznacz tekst, aby utworzy\u0107 Lyric Card.",
          // Lyric Card Feedback
          lc_error_search: "B\u0142\u0105d podczas wyszukiwania",
          lc_img_copied_tweet: "Skopiowano obraz! Naci\u015Bnij Ctrl+V w oknie X, aby go wklei\u0107.",
          lc_error_copy: "Nie uda\u0142o si\u0119 skopiowa\u0107 obrazu.",
          lc_error_img_not_found: "Nie znaleziono obrazu dla",
          lc_img_loaded: "Za\u0142adowano obraz!",
          lc_error_album_not_found: "Nie uda\u0142o si\u0119 znale\u017A\u0107 ok\u0142adki albumu.",
          lc_searching_artist: "Wyszukiwanie obrazu wykonawcy\u2026",
          lc_generating: "Generowanie Lyric Card\u2026",
          lc_error_internal: "B\u0142\u0105d wewn\u0119trzny: nie znaleziono funkcji.",
          lc_fetching_id: "Pobieranie obrazu wykonawcy (za pomoc\u0105 identyfikatora)\u2026",
          lc_searching_name: "Wyszukiwanie obrazu dla",
          lc_img_applied: "Zastosowany obraz:",
          lc_img_found: "Znaleziono obraz wykonawcy!",
          lc_api_error: "B\u0142\u0105d API, pr\xF3buj\u0119 wyodr\u0119bni\u0107 lokalnie\u2026",
          lc_opening: "Otwieranie Lyric Card\u2026",
          // Toolbar
          toolbar_bold: "Pogrubienie",
          toolbar_italic: "Kursywa",
          toolbar_num_to_words: "Liczba \u2192 S\u0142owa",
          toolbar_bold_tooltip: "Pogrub zaznaczony tekst",
          toolbar_italic_tooltip: "Pochyl zaznaczony tekst",
          toolbar_lyric_card_tooltip: "Wygeneruj Lyric Card (1280x720)",
          toolbar_num_to_words_tooltip: "Zapisz zaznaczon\u0105 liczb\u0119 s\u0142ownie (w mianowniku)",
          // Tutorial Buttons
          tuto_prev: "Wstecz",
          tuto_next: "Dalej",
          tuto_skip: "Pomi\u0144",
          tuto_finish: "Zako\u0144cz",
          tuto_step_counter: "Krok",
          feedback_summary_corrected: "\u2705 Poprawiono: {details} (\u0142\u0105cznie {count})",
          feedback_summary_correction: "Zastosowano {count} poprawk\u0119|Zastosowano {count} poprawki|Zastosowano {count} poprawek",
          feedback_detail_yprime: `{count} "y'"`,
          feedback_detail_apostrophes: "{count} apostrof|{count} apostrofy|{count} apostrof\xF3w",
          feedback_detail_oeu: '{count} "oeu"',
          feedback_detail_quotes: "{count} cudzys\u0142\xF3w|{count} cudzys\u0142owy|{count} cudzys\u0142ow\xF3w",
          feedback_detail_dash: "{count} my\u015Blnik|{count} my\u015Blniki|{count} my\u015Blnik\xF3w",
          feedback_detail_spaces: "{count} podw\xF3jna spacja|{count} podw\xF3jne spacje|{count} podw\xF3jnych spacji",
          feedback_detail_spacing: "{count} odst\u0119p|{count} odst\u0119py|{count} odst\u0119p\xF3w",
          feedback_detail_polish_quotes: "{count} polski cudzys\u0142\xF3w|{count} polskie cudzys\u0142owy|{count} polskich cudzys\u0142ow\xF3w",
          feedback_detail_ellipsis: "{count} wielokropek|{count} wielokropki|{count} wielokropk\xF3w",
          feedback_detail_orphans: "{count} sierotka|{count} sierotki|{count} sierotek",
          feedback_wrapped: "Otoczono tekst: {start}...{end}",
          feedback_corrections_cancelled: "Anulowano poprawki",
          feedback_select_text_first: "\u26A0\uFE0F Zaznacz najpierw tekst",
          feedback_no_text_corrections: "Brak poprawek tekstu. Zweryfikuj nawiasy.",
          feedback_brackets_ok: "\u2705 Nie znaleziono \u017Cadnych problem\xF3w! Wszystkie nawiasy s\u0105 domkni\u0119te.",
          feedback_brackets_issue: "\u26A0\uFE0F Znaleziono {count} niepasuj\u0105cych nawias\xF3w i zaznaczono je na czerwono!",
          // Stats (Singular | Paucal | Plural)
          stats_lines: "linia|linie|linii",
          stats_words: "s\u0142owo|s\u0142owa|s\u0142\xF3w",
          stats_sections: "sekcja|sekcje|sekcji",
          stats_characters: "znak|znaki|znak\xF3w",
          feedback_no_changes: "Brak zmian do cofni\u0119cia.",
          feedback_undo: "\u21A9\uFE0F Cofni\u0119to",
          feedback_redo: "\u21AA\uFE0F Ponowiono",
          feedback_pause: "\u23F8\uFE0F Wstrzymano",
          feedback_play: "\u25B6\uFE0F Odtwarzanie",
          feedback_duplicate_line: "\u{1F4CB} Zduplikowano lini\u0119!",
          tuto_of: "z",
          // Correction Preview Modal
          preview_title: "\u{1F6E0}\uFE0F Konfiguracja poprawek",
          preview_diff_title: "Podgl\u0105d zmian (widok ujednolicony)",
          preview_btn_cancel: "Anuluj",
          preview_btn_apply: "Zastosuj zaznaczone",
          preview_summary: "\u{1F4CA} {count} poprawka do zastosowania:|\u{1F4CA} {count} poprawki do zastosowania:|\u{1F4CA} {count} poprawek do zastosowania:",
          preview_no_corrections: "Brak poprawek do wprowadzenia.",
          preview_opt_polish_quotes: '\u201E\u201D \u2192 "',
          preview_opt_apostrophes: "Apostrofy (')",
          preview_opt_ellipsis: "... \u2192 \u2026",
          preview_opt_quotes: 'Cudzys\u0142owy (\xAB\xBB \u2192 "")',
          preview_opt_dash: "My\u015Blniki (- \u2192 \u2014)",
          preview_opt_spaces: "Podw\xF3jne spacje",
          preview_opt_spacing: "Odst\u0119py (linie)",
          preview_stat_apostrophes: "apostrof|apostrofy|apostrof\xF3w",
          preview_stat_quotes: "francuski cudzys\u0142\xF3w (\xAB\xBB)|francuskie cudzys\u0142owy (\xAB\xBB)|francuskich cudzys\u0142ow\xF3w (\xAB\xBB)",
          preview_stat_polish_quotes: "polski cudzys\u0142\xF3w (\u201E\u201D)|polskie cudzys\u0142owy (\u201E\u201D)|polskich cudzys\u0142ow\xF3w (\u201E\u201D)",
          preview_stat_dash: "my\u015Blnik|my\u015Blniki|my\u015Blnik\xF3w",
          preview_stat_ellipsis: "wielokropek|wielokropki|wielokropk\xF3w",
          preview_stat_spaces: "podw\xF3jna spacja|podw\xF3jne spacje|podw\xF3jnych spacji",
          preview_stat_spacing: "odst\u0119p|odst\u0119py|odst\u0119p\xF3w",
          preview_stat_orphans: "sierotka|sierotki|sierotek",
          preview_opt_orphans: "Sierotki (sp\xF3jniki)",
          // Draft notification
          draft_found_title: "Znaleziono wersj\u0119 robocz\u0105!",
          draft_saved_at: "Zapisano o",
          draft_btn_restore: "Przywr\xF3\u0107",
          draft_btn_discard: "Odrzu\u0107",
          draft_restored: "Pomy\u015Blnie przywr\xF3cono wersj\u0119 robocz\u0105!",
          feedback_replaced: "Zamieniono {count} {item}!",
          feedback_no_replacement: "Nie dokonano \u017Cadnych zmian.",
          find_replace_title: "Znajd\u017A i zamie\u0144",
          find_placeholder: "Szukaj...",
          replace_placeholder: "Zamie\u0144 na...",
          btn_replace: "Zamie\u0144",
          btn_replace_all: "Zamie\u0144 wszystko",
          regex_toggle: "Regex",
          // Progress steps - Polish specific corrections
          progress_step_polish_quotes: "Poprawianie polskich cudzys\u0142ow\xF3w (\u201E\u201D)\u2026",
          progress_step_apostrophes: "Poprawianie apostrof\xF3w\u2026",
          progress_step_ellipsis: "Poprawianie wielokropk\xF3w\u2026",
          progress_step_quotes: "Poprawianie francuskich cudzys\u0142ow\xF3w (\xAB\xBB)\u2026",
          progress_step_dash: "Poprawianie my\u015Blnik\xF3w\u2026",
          progress_step_spaces: "Usuwanie podw\xF3jnych spacji\u2026",
          progress_step_spacing: "Poprawianie odst\u0119p\xF3w\u2026",
          // Feedback messages
          feedback_adlib_added: "Otoczono tekst nawiasami!",
          feedback_no_correction_needed: "Zamiana {item} nie jest wymagana",
          feedback_corrected: "Poprawiono {count} {item}!",
          global_check_tooltip: "Sprawd\u017A brakuj\u0105ce lub b\u0142\u0119dnie zamkni\u0119te nawiasy",
          global_fix_tooltip: "Zastosuj wszystkie poprawki tekstu naraz",
          custom_manager_title: "\u2728 Mened\u017Cer w\u0142asnych przycisk\xF3w",
          custom_manager_tab_create: "Utw\xF3rz",
          custom_manager_tab_library: "Biblioteka",
          custom_mgr_action_type: "Typ akcji",
          custom_mgr_type_structure: "Tag struktury (Wstawianie)",
          custom_mgr_type_cleanup: "Narz\u0119dzie czyszczenia (Znajd\u017A/Zamie\u0144)",
          custom_mgr_button_label: "Etykieta przycisku",
          custom_mgr_btn_label_placeholder: "Np: [Zwrotka], Usu\u0144 Emoji...",
          custom_mgr_text_to_insert: "Tekst do wstawienia",
          custom_mgr_advanced_regex: "Zaawansowany tryb Regex",
          custom_mgr_find_pattern: "Szukany wzorzec",
          custom_mgr_replace_with: "Zamie\u0144 na",
          custom_mgr_save_button: "Zapisz w\u0142asny przycisk",
          custom_mgr_empty_library: "Nie znaleziono w\u0142asnych przycisk\xF3w.",
          custom_mgr_share_presets: "Udost\u0119pnianie ustawie\u0144",
          custom_mgr_import_placeholder: "Wklej kod tutaj, aby zaimportowa\u0107, lub kliknij Eksportuj...",
          custom_mgr_export_code: "Kopiuj kod eksportu",
          custom_mgr_import_button: "Importuj kod",
          custom_mgr_error_no_label: "Prosz\u0119 poda\u0107 nazw\u0119 przycisku.",
          custom_mgr_error_no_content: "Tre\u015B\u0107 jest wymagana.",
          custom_mgr_success_created: "Przycisk utworzony! Od\u015Bwie\u017Canie...",
          custom_mgr_success_imported: "Import zako\u0144czony sukcesem! Od\u015Bwie\u017Canie...",
          custom_mgr_find_placeholder_exact: "Tekst do usuni\u0119cia",
          custom_mgr_find_placeholder_regex: "Wzorzec Regex (np. d+s*$)",
          custom_mgr_replace_placeholder: "(Pozostaw puste, aby usun\u0105\u0107)",
          custom_mgr_case_sensitive: "Uwzgl\u0119dniaj wielko\u015B\u0107 liter",
          settings_custom_library: "\u{1F4DA} Biblioteka przycisk\xF3w"
        }
      };
    }
  });

  // src/modules/utils.js
  function formatListWithConjunction(items, lang) {
    if (items.length === 0) return "";
    if (items.length === 1) return items[0];
    if (typeof Intl !== "undefined" && Intl.ListFormat) {
      try {
        const formatter = new Intl.ListFormat(lang, { style: "long", type: "conjunction" });
        return formatter.format(items);
      } catch (e) {
        console.warn("[GFT] Intl.ListFormat failed, falling back to manual join.", e);
      }
    }
    const lastItem = items.pop();
    const conjunctions = {
      "fr": " et ",
      "en": " and ",
      "pl": " i "
    };
    const conj = conjunctions[lang] || conjunctions["fr"];
    return items.join(", ") + conj + lastItem;
  }
  function getPluralForm(count, lang) {
    const c = Math.abs(count);
    if (lang === "pl") {
      if (c === 1) return 0;
      if (c % 10 >= 2 && c % 10 <= 4 && (c % 100 < 12 || c % 100 > 14)) return 1;
      return 2;
    }
    if (lang === "fr") return c > 1 ? 1 : 0;
    return c === 1 ? 0 : 1;
  }
  function getTranslation(key, count = null) {
    const lang = localStorage.getItem("gftLanguage") || "fr";
    let val = TRANSLATIONS[lang] && TRANSLATIONS[lang][key] || TRANSLATIONS["fr"][key] || key;
    if (count !== null && typeof val === "string" && val.includes("|")) {
      const parts = val.split("|").map((s) => s.trim());
      const formIndex = getPluralForm(count, lang);
      return parts[formIndex] || parts[parts.length - 1];
    }
    return val;
  }
  function decodeHtmlEntities(text) {
    if (!text) return "";
    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    return textarea.value;
  }
  function cleanArtistName(name) {
    if (!name) return "";
    let cleaned = name.trim();
    cleaned = decodeHtmlEntities(cleaned);
    const commonSuffixRegex = /\s*\((?:FRA|FR|UK|US|Feat\.|Featuring|Trad\.|Producer|Mix|Remix|Edit|Version|Live|Demo)[^)]*?\)\s*$/i;
    if (commonSuffixRegex.test(cleaned)) {
      cleaned = cleaned.replace(commonSuffixRegex, "").trim();
    }
    const trailingParenthesisRegex = /\s*\([^)]*\)\s*$/;
    if (trailingParenthesisRegex.test(cleaned)) {
      cleaned = cleaned.replace(trailingParenthesisRegex, "").trim();
    } else {
      const isolatedTrailingParenthesisRegex = /\)\s*$/;
      if (isolatedTrailingParenthesisRegex.test(cleaned)) {
        cleaned = cleaned.replace(isolatedTrailingParenthesisRegex, "").trim();
      }
    }
    const lastOpenParenIndex = cleaned.lastIndexOf("(");
    if (lastOpenParenIndex > -1 && cleaned.indexOf(")", lastOpenParenIndex) === -1) {
      if (cleaned.length - lastOpenParenIndex < 10) {
        cleaned = cleaned.substring(0, lastOpenParenIndex).trim();
      }
    }
    cleaned = cleaned.replace(/\s+/g, " ").trim();
    return cleaned;
  }
  function escapeRegExp(string) {
    if (!string) return "";
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  function formatArtistList(artists) {
    if (!artists || artists.length === 0) return "";
    if (artists.length === 1) return artists[0];
    if (artists.length === 2) return artists.join(" & ");
    return `${artists.slice(0, -1).join(", ")} & ${artists[artists.length - 1]}`;
  }
  function numberToFrenchWords(num) {
    if (num === 0) return "z\xE9ro";
    const ones = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"];
    const teens = ["dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
    const tens = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante", "quatre-vingt", "quatre-vingt"];
    function convertUpTo99(n) {
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      const ten = Math.floor(n / 10);
      const one = n % 10;
      if (ten === 7) {
        if (one === 0) return "soixante-dix";
        if (one === 1) return "soixante et onze";
        return "soixante-" + teens[one];
      }
      if (ten === 9) {
        if (one === 0) return "quatre-vingt-dix";
        return "quatre-vingt-" + teens[one];
      }
      if (one === 0) {
        if (ten === 8) return "quatre-vingts";
        return tens[ten];
      }
      if (one === 1 && (ten === 2 || ten === 3 || ten === 4 || ten === 5 || ten === 6)) {
        return tens[ten] + " et un";
      }
      if (ten === 8) return "quatre-vingt-" + ones[one];
      return tens[ten] + "-" + ones[one];
    }
    function convertUpTo999(n) {
      if (n < 100) return convertUpTo99(n);
      const hundred = Math.floor(n / 100);
      const rest2 = n % 100;
      let result2 = "";
      if (hundred === 1) {
        result2 = "cent";
      } else {
        result2 = ones[hundred] + " cent";
      }
      if (rest2 === 0 && hundred > 1) {
        result2 += "s";
      } else if (rest2 > 0) {
        result2 += " " + convertUpTo99(rest2);
      }
      return result2;
    }
    if (num < 0 || num > 999999999999) return num.toString();
    if (num < 1e3) return convertUpTo999(num);
    if (num >= 1e9) {
      const billions = Math.floor(num / 1e9);
      const rest2 = num % 1e9;
      let result2 = "";
      if (billions === 1) {
        result2 = "un milliard";
      } else {
        result2 = convertUpTo999(billions) + " milliards";
      }
      if (rest2 > 0) {
        result2 += " " + numberToFrenchWords(rest2);
      }
      return result2;
    }
    if (num >= 1e6) {
      const millions = Math.floor(num / 1e6);
      const rest2 = num % 1e6;
      let result2 = "";
      if (millions === 1) {
        result2 = "un million";
      } else {
        result2 = convertUpTo999(millions) + " millions";
      }
      if (rest2 > 0) {
        result2 += " " + numberToFrenchWords(rest2);
      }
      return result2;
    }
    const thousand = Math.floor(num / 1e3);
    const rest = num % 1e3;
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
      const rest2 = n % 100;
      let result2 = ones[hundred] + " hundred";
      if (rest2 > 0) {
        result2 += " " + convertUpTo99(rest2);
      }
      return result2;
    }
    if (num < 0 || num > 999999999999) return num.toString();
    if (num < 1e3) return convertUpTo999(num);
    if (num >= 1e9) {
      const billions = Math.floor(num / 1e9);
      const rest2 = num % 1e9;
      let result2 = convertUpTo999(billions) + " billion";
      if (rest2 > 0) result2 += " " + numberToEnglishWords(rest2);
      return result2;
    }
    if (num >= 1e6) {
      const millions = Math.floor(num / 1e6);
      const rest2 = num % 1e6;
      let result2 = convertUpTo999(millions) + " million";
      if (rest2 > 0) result2 += " " + numberToEnglishWords(rest2);
      return result2;
    }
    const thousand = Math.floor(num / 1e3);
    const rest = num % 1e3;
    let result = convertUpTo999(thousand) + " thousand";
    if (rest > 0) result += " " + convertUpTo999(rest);
    return result;
  }
  function numberToPolishWords(num) {
    if (num === 0) return "zero";
    const ones = ["", "jeden", "dwa", "trzy", "cztery", "pi\u0119\u0107", "sze\u015B\u0107", "siedem", "osiem", "dziewi\u0119\u0107"];
    const teens = ["dziesi\u0119\u0107", "jedena\u015Bcie", "dwana\u015Bcie", "trzyna\u015Bcie", "czterna\u015Bcie", "pi\u0119tna\u015Bcie", "szesna\u015Bcie", "siedemna\u015Bcie", "osiemna\u015Bcie", "dziewi\u0119tna\u015Bcie"];
    const tens = ["", "", "dwadzie\u015Bcia", "trzydzie\u015Bci", "czterdzie\u015Bci", "pi\u0119\u0107dziesi\u0105t", "sze\u015B\u0107dziesi\u0105t", "siedemdziesi\u0105t", "osiemdziesi\u0105t", "dziewi\u0119\u0107dziesi\u0105t"];
    const hundreds = ["", "sto", "dwie\u015Bcie", "trzysta", "czterysta", "pi\u0119\u0107set", "sze\u015B\u0107set", "siedemset", "osiemset", "dziewi\u0119\u0107set"];
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
      const rest2 = n % 100;
      let result2 = hundreds[hundred];
      if (rest2 > 0) {
        result2 += " " + convertUpTo99(rest2);
      }
      return result2;
    }
    function getThousandForm(n) {
      if (n === 1) return "tysi\u0105c";
      const lastDigit = n % 10;
      const lastTwoDigits = n % 100;
      if (lastTwoDigits >= 12 && lastTwoDigits <= 14) return "tysi\u0119cy";
      if (lastDigit >= 2 && lastDigit <= 4) return "tysi\u0105ce";
      return "tysi\u0119cy";
    }
    function getMillionForm(n) {
      if (n === 1) return "milion";
      const lastDigit = n % 10;
      const lastTwoDigits = n % 100;
      if (lastTwoDigits >= 12 && lastTwoDigits <= 14) return "milion\xF3w";
      if (lastDigit >= 2 && lastDigit <= 4) return "miliony";
      return "milion\xF3w";
    }
    function getBillionForm(n) {
      if (n === 1) return "miliard";
      const lastDigit = n % 10;
      const lastTwoDigits = n % 100;
      if (lastTwoDigits >= 12 && lastTwoDigits <= 14) return "miliard\xF3w";
      if (lastDigit >= 2 && lastDigit <= 4) return "miliardy";
      return "miliard\xF3w";
    }
    if (num < 0 || num > 999999999999) return num.toString();
    if (num < 1e3) return convertUpTo999(num);
    if (num >= 1e9) {
      const billions = Math.floor(num / 1e9);
      const rest2 = num % 1e9;
      let result2 = (billions === 1 ? "" : convertUpTo999(billions) + " ") + getBillionForm(billions);
      if (rest2 > 0) result2 += " " + numberToPolishWords(rest2);
      return result2.trim();
    }
    if (num >= 1e6) {
      const millions = Math.floor(num / 1e6);
      const rest2 = num % 1e6;
      let result2 = (millions === 1 ? "" : convertUpTo999(millions) + " ") + getMillionForm(millions);
      if (rest2 > 0) result2 += " " + numberToPolishWords(rest2);
      return result2.trim();
    }
    const thousand = Math.floor(num / 1e3);
    const rest = num % 1e3;
    let result = (thousand === 1 ? "" : convertUpTo999(thousand) + " ") + getThousandForm(thousand);
    if (rest > 0) result += " " + convertUpTo999(rest);
    return result.trim();
  }
  function isValidNumber(str) {
    if (!str || str.trim() === "") return false;
    const trimmed = str.trim();
    return /^\d+$/.test(trimmed);
  }
  function extractArtistsFromMetaContent(metaContent) {
    const result = { main: [], ft: [] };
    if (!metaContent) return result;
    let contentForArtists = decodeHtmlEntities(metaContent);
    const songTitleSeparatorMatch = contentForArtists.match(/\s[–-]\s/);
    if (songTitleSeparatorMatch) {
      contentForArtists = contentForArtists.substring(0, songTitleSeparatorMatch.index).trim();
    }
    let ftContent = null;
    let mainPart = contentForArtists;
    const ftOuterMatch = contentForArtists.match(/\((Ft\.|Featuring)\s+(.*)\)\s*$/i);
    if (ftOuterMatch && ftOuterMatch[2]) {
      ftContent = ftOuterMatch[2].trim();
      mainPart = contentForArtists.replace(ftOuterMatch[0], "").trim();
    }
    if (ftContent) {
      ftContent.split(/[,&]\s*/).forEach((name) => {
        const cleaned = name.trim();
        if (cleaned) result.ft.push(cleaned);
      });
    }
    mainPart.split(/[,&]\s*/).forEach((name) => {
      const cleanedName = name.trim();
      if (cleanedName) {
        if (!result.ft.some((ftArt) => ftArt.toLowerCase() === cleanedName.toLowerCase())) {
          result.main.push(cleanedName);
        }
      }
    });
    return result;
  }
  var init_utils = __esm({
    "src/modules/utils.js"() {
      init_translations();
    }
  });

  // src/modules/songData.js
  function extractSongData() {
    const songData = {
      title: null,
      mainArtists: [],
      featuringArtists: [],
      _rawMainArtists: [],
      _rawFeaturingArtistsFromSection: [],
      _rawFeaturingArtistsFromTitleExtract: []
    };
    let rawTitleText = null;
    let artistsFromMeta = { main: [], ft: [] };
    const ogTitleMeta = document.querySelector(SELECTORS.OG_TITLE_META);
    if (ogTitleMeta && ogTitleMeta.content) {
      artistsFromMeta = extractArtistsFromMetaContent(ogTitleMeta.content);
      songData._rawMainArtists = [...artistsFromMeta.main];
      songData._rawFeaturingArtistsFromTitleExtract = [...artistsFromMeta.ft];
      const titleParts = decodeHtmlEntities(ogTitleMeta.content).split(/\s[–-]\s/);
      if (titleParts.length > 1) {
        rawTitleText = titleParts.slice(1).join(" \u2013 ").trim();
        if (artistsFromMeta.main.length > 0) {
          const mainArtistString = formatArtistList(artistsFromMeta.main);
          if (rawTitleText.toLowerCase().endsWith(mainArtistString.toLowerCase())) {
            rawTitleText = rawTitleText.substring(0, rawTitleText.length - mainArtistString.length).replace(/\s*-\s*$/, "").trim();
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
        if (titleParts.length > 1) rawTitleText = titleParts.slice(1).join(" \u2013 ").trim();
      }
    }
    if (songData._rawMainArtists.length === 0) {
      const mainArtistsContainer = document.querySelector(SELECTORS.MAIN_ARTISTS_CONTAINER_FALLBACK);
      if (mainArtistsContainer) {
        mainArtistsContainer.querySelectorAll(SELECTORS.MAIN_ARTIST_LINK_IN_CONTAINER_FALLBACK).forEach((link) => {
          const n = link.textContent.trim();
          if (n && !songData._rawMainArtists.includes(n)) songData._rawMainArtists.push(n);
        });
      } else {
        document.querySelectorAll(SELECTORS.FALLBACK_MAIN_ARTIST_LINKS_FALLBACK).forEach((link) => {
          const n = link.textContent.trim();
          if (n && !songData._rawMainArtists.includes(n)) songData._rawMainArtists.push(n);
        });
      }
    }
    document.querySelectorAll(SELECTORS.CREDITS_PAGE_ARTIST_LIST_CONTAINER).forEach((listContainer) => {
      const lt = listContainer.previousElementSibling;
      let isFt = false;
      if (lt) {
        const txt = lt.textContent.trim().toLowerCase();
        if (txt.includes("featuring") || txt.includes("feat") || txt.includes("avec")) {
          isFt = true;
        }
      }
      if (isFt) {
        listContainer.querySelectorAll(SELECTORS.CREDITS_PAGE_ARTIST_NAME_IN_LINK).forEach((s) => {
          const n = s.textContent.trim();
          if (n && !songData._rawFeaturingArtistsFromSection.includes(n) && !songData._rawMainArtists.includes(n)) {
            songData._rawFeaturingArtistsFromSection.push(n);
          }
        });
      }
    });
    if (!rawTitleText) {
      for (const sel of SELECTORS.TITLE) {
        const el = document.querySelector(sel);
        if (el) {
          rawTitleText = el.textContent;
          if (rawTitleText) break;
        }
      }
    }
    if (rawTitleText) {
      let ttc = decodeHtmlEntities(rawTitleText.trim()).replace(/\s+Lyrics$/i, "").trim();
      if (artistsFromMeta.main.length === 0 && songData._rawMainArtists.length > 0) {
        const blk = formatArtistList(songData._rawMainArtists.map((a) => cleanArtistName(a)));
        if (blk) {
          const esc = escapeRegExp(blk);
          let m = ttc.match(new RegExp(`^${esc}\\s*-\\s*(.+)$`, "i"));
          if (m && m[1]) ttc = m[1].trim();
          else {
            m = ttc.match(new RegExp(`^(.+?)\\s*-\\s*${esc}$`, "i"));
            if (m && m[1]) ttc = m[1].trim();
          }
        }
      }
      ttc = ttc.replace(/\s*\((?:Ft\.|Featuring)[^)]+\)\s*/gi, " ").trim().replace(/^[\s,-]+|[\s,-]+$/g, "").replace(/\s\s+/g, " ");
      songData.title = ttc;
    }
    if (!songData.title || songData.title.length === 0) songData.title = "TITRE INCONNU";
    songData.mainArtists = [...new Set(songData._rawMainArtists.map((name) => cleanArtistName(name)))].filter(Boolean);
    let finalFeaturingArtists = [];
    const seenCleanedFtNamesForDeduplication = /* @__PURE__ */ new Set();
    if (songData._rawFeaturingArtistsFromTitleExtract.length > 0) {
      songData._rawFeaturingArtistsFromTitleExtract.forEach((rawName) => {
        const cleanedName = cleanArtistName(rawName);
        if (cleanedName && !seenCleanedFtNamesForDeduplication.has(cleanedName.toLowerCase()) && !songData.mainArtists.some((mainArt) => mainArt.toLowerCase() === cleanedName.toLowerCase())) {
          finalFeaturingArtists.push(cleanedName);
          seenCleanedFtNamesForDeduplication.add(cleanedName.toLowerCase());
        }
      });
    } else {
      songData._rawFeaturingArtistsFromSection.forEach((rawName) => {
        const cleanedName = cleanArtistName(rawName);
        if (cleanedName && !seenCleanedFtNamesForDeduplication.has(cleanedName.toLowerCase()) && !songData.mainArtists.some((mainArt) => mainArt.toLowerCase() === cleanedName.toLowerCase())) {
          finalFeaturingArtists.push(cleanedName);
          seenCleanedFtNamesForDeduplication.add(cleanedName.toLowerCase());
        }
      });
    }
    songData.featuringArtists = finalFeaturingArtists;
    GFT_STATE.currentSongTitle = songData.title;
    GFT_STATE.currentMainArtists = [...songData.mainArtists];
    GFT_STATE.currentFeaturingArtists = [...songData.featuringArtists];
    GFT_STATE.detectedArtists = [.../* @__PURE__ */ new Set([...GFT_STATE.currentMainArtists, ...GFT_STATE.currentFeaturingArtists])].filter(Boolean);
    return songData;
  }
  var init_songData = __esm({
    "src/modules/songData.js"() {
      init_constants();
      init_utils();
    }
  });

  // src/modules/config.js
  function isTagNewlinesDisabled() {
    return localStorage.getItem(DISABLE_TAG_NEWLINES_STORAGE_KEY) === "true";
  }
  function setTagNewlinesDisabled(disabled) {
    localStorage.setItem(DISABLE_TAG_NEWLINES_STORAGE_KEY, disabled.toString());
  }
  function isLyricCardOnlyMode() {
    return localStorage.getItem(LYRIC_CARD_ONLY_STORAGE_KEY) === "true";
  }
  function setLyricCardOnlyMode(enabled) {
    localStorage.setItem(LYRIC_CARD_ONLY_STORAGE_KEY, enabled.toString());
  }
  function getTranscriptionMode() {
    return localStorage.getItem(TRANSCRIPTION_MODE_STORAGE_KEY) || "fr";
  }
  function setTranscriptionMode(mode) {
    localStorage.setItem(TRANSCRIPTION_MODE_STORAGE_KEY, mode);
  }
  function isEnglishTranscriptionMode() {
    return getTranscriptionMode() === "en";
  }
  function isPolishTranscriptionMode2() {
    return getTranscriptionMode() === "pl";
  }
  var init_config = __esm({
    "src/modules/config.js"() {
      init_constants();
    }
  });

  // src/modules/ui-artists.js
  function createArtistSelectors(container) {
    if (!container) {
      console.error("[createArtistSelectors] Erreur: Conteneur non fourni.");
      return;
    }
    const existingSelectorContainer = document.getElementById(ARTIST_SELECTOR_CONTAINER_ID);
    if (existingSelectorContainer) {
      existingSelectorContainer.remove();
    }
    const artistSelectorContainer = document.createElement("div");
    artistSelectorContainer.id = ARTIST_SELECTOR_CONTAINER_ID;
    artistSelectorContainer.style.display = "flex";
    artistSelectorContainer.style.flexWrap = "wrap";
    artistSelectorContainer.style.gap = "2px 10px";
    artistSelectorContainer.style.alignItems = "center";
    const title = document.createElement("p");
    title.textContent = getTranslation("artist_selection");
    title.style.width = "100%";
    title.style.margin = "0 0 1px 0";
    artistSelectorContainer.appendChild(title);
    if (!GFT_STATE.detectedArtists || GFT_STATE.detectedArtists.length === 0) {
      const noArtistsMsg = document.createElement("span");
      noArtistsMsg.textContent = getTranslation("no_artist");
      noArtistsMsg.style.fontStyle = "italic";
      artistSelectorContainer.appendChild(noArtistsMsg);
    } else {
      GFT_STATE.detectedArtists.forEach((artistName, index) => {
        const artistId = `artist_checkbox_${index}_${artistName.replace(/[^a-zA-Z0-9]/g, "")}_GFT`;
        const wrapper = document.createElement("span");
        const checkbox = document.createElement("input");
        Object.assign(checkbox, {
          type: "checkbox",
          name: "selectedGeniusArtist_checkbox_GFT",
          value: artistName,
          id: artistId
        });
        wrapper.appendChild(checkbox);
        const label = document.createElement("label");
        label.htmlFor = artistId;
        label.textContent = artistName;
        label.style.marginLeft = "3px";
        wrapper.appendChild(label);
        artistSelectorContainer.appendChild(wrapper);
      });
    }
    container.appendChild(artistSelectorContainer);
  }
  function formatSimpleTag(tag, forceNoNewline = false) {
    if (forceNoNewline) return tag;
    return isTagNewlinesDisabled() ? tag : `${tag}
`;
  }
  function addArtistToText(baseTextWithBrackets) {
    const checkedArtistsCheckboxes = document.querySelectorAll('input[name="selectedGeniusArtist_checkbox_GFT"]:checked');
    const selectedArtistNames = Array.from(checkedArtistsCheckboxes).map((cb) => cb.value.trim()).filter(Boolean);
    let resultText;
    if (selectedArtistNames.length > 0) {
      const tagPart = baseTextWithBrackets.slice(0, -1);
      const artistsString = formatArtistList(selectedArtistNames);
      const separator = isEnglishTranscriptionMode() || isPolishTranscriptionMode2() ? ": " : " : ";
      resultText = `${tagPart}${separator}${artistsString}]`;
    } else {
      resultText = baseTextWithBrackets;
    }
    if (!isTagNewlinesDisabled()) {
      resultText += "\n";
    }
    return resultText;
  }
  var init_ui_artists = __esm({
    "src/modules/ui-artists.js"() {
      init_constants();
      init_utils();
      init_config();
    }
  });

  // src/modules/corrections.js
  function isSectionTag(line) {
    const trimmed = line.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      if (/^\[\?+\]$/.test(trimmed)) return false;
      return true;
    }
    if (/^\[\[.*\]\]\(.*\)$/.test(trimmed)) {
      return true;
    }
    return false;
  }
  function correctLineSpacing(text) {
    const originalLines = text.split("\n");
    let correctionsCount = 0;
    if (originalLines.length === 0) {
      return { newText: "", correctionsCount: 0 };
    }
    const linesWithAddedSpacing = [];
    for (let i = 0; i < originalLines.length; i++) {
      const currentLine = originalLines[i];
      linesWithAddedSpacing.push(currentLine);
      if (currentLine.trim() !== "" && !isSectionTag(currentLine)) {
        if (i + 1 < originalLines.length) {
          const nextLine = originalLines[i + 1];
          if (nextLine.trim() !== "" && isSectionTag(nextLine)) {
            linesWithAddedSpacing.push("");
            correctionsCount++;
          }
        }
      }
    }
    const cleanedLines = [];
    for (let i = 0; i < linesWithAddedSpacing.length; i++) {
      const currentLine = linesWithAddedSpacing[i];
      const trimmedLine = currentLine.trim();
      if (trimmedLine !== "") {
        cleanedLines.push(currentLine);
      } else {
        if (cleanedLines.length === 0) {
          correctionsCount++;
          continue;
        }
        const prevLine = cleanedLines[cleanedLines.length - 1];
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
          correctionsCount++;
          continue;
        }
        if (nextLineIsTag) {
          if (prevLine.trim() === "") {
            correctionsCount++;
          } else {
            cleanedLines.push(currentLine);
          }
        } else {
          correctionsCount++;
        }
      }
    }
    const newText = cleanedLines.join("\n");
    if (text === newText) return { newText, correctionsCount: 0 };
    if (correctionsCount === 0 && text !== newText) correctionsCount = 1;
    return { newText, correctionsCount };
  }
  function applyTextTransformToDivEditor(editorNode, transformFunction) {
    const selection = window.getSelection();
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0).cloneRange() : null;
    let currentTextContent = "";
    const lineElements = [];
    let nodeBuffer = "";
    editorNode.childNodes.forEach((child) => {
      if (child.nodeName === "BR") {
        if (nodeBuffer) lineElements.push(document.createTextNode(nodeBuffer));
        nodeBuffer = "";
        lineElements.push(document.createElement("br"));
      } else if (child.nodeType === Node.TEXT_NODE) {
        nodeBuffer += child.textContent;
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        if (nodeBuffer) lineElements.push(document.createTextNode(nodeBuffer));
        nodeBuffer = "";
        if (child.nodeName === "DIV" || child.nodeName === "P") {
          if (child.textContent.trim() !== "") {
            lineElements.push(child.cloneNode(true));
          } else if (child.querySelector("br")) {
            lineElements.push(document.createElement("br"));
          }
        } else {
          nodeBuffer += child.textContent;
        }
      }
    });
    if (nodeBuffer) lineElements.push(document.createTextNode(nodeBuffer));
    currentTextContent = "";
    lineElements.forEach((el) => {
      if (el.nodeName === "BR") {
        currentTextContent += "\n";
      } else if (el.nodeType === Node.TEXT_NODE) {
        currentTextContent += el.textContent;
      } else if (el.nodeName === "DIV" || el.nodeName === "P") {
        currentTextContent += el.textContent + "\n";
      }
    });
    currentTextContent = currentTextContent.replace(/\n+$/, "");
    const { newText, correctionsCount } = transformFunction(currentTextContent);
    if (currentTextContent !== newText || correctionsCount > 0) {
      editorNode.innerHTML = "";
      newText.split("\n").forEach((lineText, index, arr) => {
        const lineDiv = document.createElement("div");
        if (lineText === "") {
          if (index === arr.length - 1 && arr.length > 1 && !newText.endsWith("\n\n")) {
          } else {
            lineDiv.appendChild(document.createElement("br"));
          }
        } else {
          lineDiv.textContent = lineText;
        }
        editorNode.appendChild(lineDiv);
      });
      if (editorNode.childNodes.length === 0) {
        const emptyDiv = document.createElement("div");
        emptyDiv.appendChild(document.createElement("br"));
        editorNode.appendChild(emptyDiv);
      }
      if (range) {
        try {
          const lastDiv = editorNode.lastChild;
          if (lastDiv) {
            const newRange = document.createRange();
            if (lastDiv.nodeName === "DIV") {
              if (lastDiv.firstChild && lastDiv.firstChild.nodeName === "BR") {
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
        } catch (e) {
          console.warn("Erreur restauration s\xE9lection apr\xE8s transformDiv:", e);
        }
      }
      editorNode.focus();
      const inputEvent = new Event("input", { bubbles: true, cancelable: true });
      editorNode.dispatchEvent(inputEvent);
    }
    return correctionsCount;
  }
  function applyAllTextCorrectionsToString(text, options = {}) {
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
    const corrections = {
      yPrime: 0,
      apostrophes: 0,
      oeuLigature: 0,
      frenchQuotes: 0,
      longDash: 0,
      doubleSpaces: 0,
      spacing: 0
    };
    if (opts.yPrime) {
      const yPrimePattern = /\b(Y|y)['']/g;
      const yPrimeReplacement = (match, firstLetter) => firstLetter === "Y" ? "Y " : "y ";
      const textAfterYPrime = currentText.replace(yPrimePattern, yPrimeReplacement);
      if (textAfterYPrime !== currentText) {
        corrections.yPrime = (currentText.match(yPrimePattern) || []).length;
        currentText = textAfterYPrime;
      }
    }
    if (opts.apostrophes) {
      const apostrophePattern = /['']/g;
      const textAfterApostrophe = currentText.replace(apostrophePattern, "'");
      if (textAfterApostrophe !== currentText) {
        corrections.apostrophes = (currentText.match(apostrophePattern) || []).length;
        currentText = textAfterApostrophe;
      }
    }
    if (opts.oeuLigature) {
      const oeuPattern = /([Oo])eu/g;
      const oeuReplacement = (match, firstLetter) => firstLetter === "O" ? "\u0152u" : "\u0153u";
      const textAfterOeu = currentText.replace(oeuPattern, oeuReplacement);
      if (textAfterOeu !== currentText) {
        corrections.oeuLigature = (currentText.match(oeuPattern) || []).length;
        currentText = textAfterOeu;
      }
    }
    if (opts.frenchQuotes) {
      const frenchQuotesPattern = /[«»]/g;
      const textAfterFrenchQuotes = currentText.replace(frenchQuotesPattern, '"');
      if (textAfterFrenchQuotes !== currentText) {
        corrections.frenchQuotes = (currentText.match(frenchQuotesPattern) || []).length;
        currentText = textAfterFrenchQuotes;
      }
    }
    if (opts.longDash) {
      if (typeof isPolishTranscriptionMode === "function" && isPolishTranscriptionMode()) {
        const polishDashPattern = / - /g;
        const textAfterPolishDash = currentText.replace(polishDashPattern, " \u2014 ");
        if (textAfterPolishDash !== currentText) {
          corrections.longDash = (currentText.match(polishDashPattern) || []).length;
          currentText = textAfterPolishDash;
        }
      } else {
        const longDashPattern = /[—–]/g;
        const textAfterLongDash = currentText.replace(longDashPattern, "-");
        if (textAfterLongDash !== currentText) {
          corrections.longDash = (currentText.match(longDashPattern) || []).length;
          currentText = textAfterLongDash;
        }
      }
    }
    if (opts.doubleSpaces) {
      const doubleSpacesPattern = /  +/g;
      const textAfterDoubleSpaces = currentText.replace(doubleSpacesPattern, " ");
      if (textAfterDoubleSpaces !== currentText) {
        corrections.doubleSpaces = (currentText.match(doubleSpacesPattern) || []).length;
        currentText = textAfterDoubleSpaces;
      }
    }
    if (opts.spacing) {
      result = correctLineSpacing(currentText);
      if (result.correctionsCount > 0) {
        corrections.spacing = result.correctionsCount;
        currentText = result.newText;
      }
    }
    const totalCorrections = corrections.yPrime + corrections.apostrophes + corrections.oeuLigature + corrections.frenchQuotes + corrections.longDash + corrections.doubleSpaces + corrections.spacing;
    return { newText: currentText, correctionsCount: totalCorrections, corrections };
  }
  async function applyAllTextCorrectionsAsync(text, showProgressFn) {
    const showProgress = showProgressFn || (() => {
    });
    let currentText = text;
    let result;
    const totalSteps = 7;
    const corrections = {
      yPrime: 0,
      apostrophes: 0,
      oeuLigature: 0,
      frenchQuotes: 0,
      longDash: 0,
      doubleSpaces: 0,
      spacing: 0
    };
    showProgress(1, totalSteps, getTranslation("progress_step_yprime"));
    await new Promise((resolve) => setTimeout(resolve, 50));
    const yPrimePattern = /\b(Y|y)['']/g;
    const yPrimeReplacement = (match, firstLetter) => firstLetter === "Y" ? "Y " : "y ";
    const textAfterYPrime = currentText.replace(yPrimePattern, yPrimeReplacement);
    if (textAfterYPrime !== currentText) {
      corrections.yPrime = (currentText.match(yPrimePattern) || []).length;
      currentText = textAfterYPrime;
    }
    showProgress(2, totalSteps, getTranslation("progress_step_apostrophes"));
    await new Promise((resolve) => setTimeout(resolve, 50));
    const apostrophePattern = /['']/g;
    const textAfterApostrophe = currentText.replace(apostrophePattern, "'");
    if (textAfterApostrophe !== currentText) {
      corrections.apostrophes = (currentText.match(apostrophePattern) || []).length;
      currentText = textAfterApostrophe;
    }
    showProgress(3, totalSteps, getTranslation("progress_step_oeu"));
    await new Promise((resolve) => setTimeout(resolve, 50));
    const oeuPattern = /([Oo])eu/g;
    const oeuReplacement = (match, firstLetter) => firstLetter === "O" ? "\u0152u" : "\u0153u";
    const textAfterOeu = currentText.replace(oeuPattern, oeuReplacement);
    if (textAfterOeu !== currentText) {
      corrections.oeuLigature = (currentText.match(oeuPattern) || []).length;
      currentText = textAfterOeu;
    }
    showProgress(4, totalSteps, getTranslation("progress_step_quotes"));
    await new Promise((resolve) => setTimeout(resolve, 50));
    const frenchQuotesPattern = /[«»]/g;
    const textAfterFrenchQuotes = currentText.replace(frenchQuotesPattern, '"');
    if (textAfterFrenchQuotes !== currentText) {
      corrections.frenchQuotes = (currentText.match(frenchQuotesPattern) || []).length;
      currentText = textAfterFrenchQuotes;
    }
    showProgress(5, totalSteps, getTranslation("progress_step_dash"));
    await new Promise((resolve) => setTimeout(resolve, 50));
    if (typeof isPolishTranscriptionMode === "function" && isPolishTranscriptionMode()) {
      const polishDashPattern = / - /g;
      const textAfterPolishDash = currentText.replace(polishDashPattern, " \u2014 ");
      if (textAfterPolishDash !== currentText) {
        corrections.longDash = (currentText.match(polishDashPattern) || []).length;
        currentText = textAfterPolishDash;
      }
    } else {
      const longDashPattern = /[—–]/g;
      const textAfterLongDash = currentText.replace(longDashPattern, "-");
      if (textAfterLongDash !== currentText) {
        corrections.longDash = (currentText.match(longDashPattern) || []).length;
        currentText = textAfterLongDash;
      }
    }
    showProgress(6, totalSteps, getTranslation("progress_step_spaces"));
    await new Promise((resolve) => setTimeout(resolve, 50));
    const doubleSpacesPattern = /  +/g;
    const textAfterDoubleSpaces = currentText.replace(doubleSpacesPattern, " ");
    if (textAfterDoubleSpaces !== currentText) {
      corrections.doubleSpaces = (currentText.match(doubleSpacesPattern) || []).length;
      currentText = textAfterDoubleSpaces;
    }
    showProgress(7, totalSteps, getTranslation("progress_step_spacing"));
    await new Promise((resolve) => setTimeout(resolve, 50));
    result = correctLineSpacing(currentText);
    if (result.correctionsCount > 0) {
      corrections.spacing = result.correctionsCount;
      currentText = result.newText;
    }
    const totalCorrections = corrections.yPrime + corrections.apostrophes + corrections.oeuLigature + corrections.frenchQuotes + corrections.longDash + corrections.doubleSpaces + corrections.spacing;
    return { newText: currentText, correctionsCount: totalCorrections, corrections };
  }
  var init_corrections = __esm({
    "src/modules/corrections.js"() {
      init_utils();
    }
  });

  // src/content.js
  var require_content = __commonJS({
    "src/content.js"() {
      init_songData();
      init_config();
      init_ui_artists();
      init_translations();
      init_constants();
      init_utils();
      init_corrections();
      console.log("Genius Fast Transcriber v4.0.0 \u{1F3B5}");
      (function injectCriticalStyles() {
        if (!document.getElementById("gft-critical-animations")) {
          const style = document.createElement("style");
          style.id = "gft-critical-animations";
          style.textContent = `
            @keyframes lyrics-helper-fadeout {
                0% { background-color: #f9ff55; opacity: 0.8; }
                70% { background-color: #f9ff55; opacity: 0.5; }
                100% { background-color: transparent; opacity: 1; }
            }
            .gft-shortcut-feedback {
                animation: gft-button-glow 0.3s ease-out;
            }
            @keyframes gft-button-glow {
                0% { box-shadow: 0 0 0 0 rgba(249, 255, 85, 0.7); transform: scale(1); }
                50% { box-shadow: 0 0 20px 10px rgba(249, 255, 85, 0); transform: scale(1.05); }
                100% { box-shadow: 0 0 0 0 rgba(249, 255, 85, 0); transform: scale(1); }
            }
            .gft-autosave-indicator {
                font-size: 16px; margin-left: 10px;
                opacity: 0.2; transition: opacity 0.3s ease;
                cursor: default;
            }
            .gft-autosave-flash {
                animation: gft-save-flash 1s ease-out;
            }
            @keyframes gft-save-flash {
                0% { opacity: 1; transform: scale(1.3); }
                100% { opacity: 0.2; transform: scale(1); }
            }
            /* Custom Button Manager Styles */
            .gft-custom-manager-modal {
                width: 420px; max-width: 90vw;
                font-family: 'Inter', system-ui, -apple-system, sans-serif;
                border: 1px solid rgba(255,255,255,0.1);
            }
            .gft-tabs {
                display: flex; background: rgba(0,0,0,0.05);
                padding: 3px; border-radius: 8px; margin: 15px 0;
            }
            .gft-tab-btn {
                flex: 1; background: none; border: none; padding: 8px;
                color: inherit; cursor: pointer; border-radius: 6px;
                font-size: 13px; transition: all 0.2s; opacity: 0.7;
            }
            .gft-tab-btn.active {
                background: white; color: black; opacity: 1;
                font-weight: bold; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .gft-dark-mode .gft-tab-btn.active { background: #444; color: white; }
            .gft-form-group { margin-bottom: 15px; }
            .gft-form-label {
                display: block; font-size: 11px; margin-bottom: 6px;
                opacity: 0.9; font-weight: 600; text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .gft-form-input, .gft-form-textarea, .gft-form-select {
                width: 100%; padding: 10px 14px; border-radius: 6px;
                border: 1px solid rgba(0,0,0,0.1); background: rgba(255,255,255,0.8);
                color: #222; font-size: 14px; box-sizing: border-box;
                transition: border-color 0.2s;
            }
            .gft-form-input:focus, .gft-form-textarea:focus { border-color: #f9ff55; outline: none; }
            .gft-dark-mode .gft-form-input, .gft-dark-mode .gft-form-textarea, .gft-dark-mode .gft-form-select {
                border-color: rgba(255,255,255,0.1); background: #2a2a2a; color: #eee;
            }
            .gft-custom-list { max-height: 280px; overflow-y: auto; margin-bottom: 15px; padding-right: 5px; }
            .gft-custom-list::-webkit-scrollbar { width: 4px; }
            .gft-custom-list::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
            .gft-dark-mode .gft-custom-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
            .gft-custom-item {
                display: flex; justify-content: space-between; align-items: center;
                padding: 10px; border-bottom: 1px solid rgba(0,0,0,0.05); transition: background 0.2s;
            }
            .gft-custom-item:hover { background: rgba(0,0,0,0.02); }
            .gft-dark-mode .gft-custom-item:hover { background: rgba(255,255,255,0.02); }
            .gft-dark-mode .gft-custom-item { border-bottom-color: rgba(255,255,255,0.05); }
            .gft-code-area {
                width: 100%; height: 70px; font-family: monospace; font-size: 11px;
                margin-top: 8px; border-radius: 6px; background: rgba(0,0,0,0.05);
                border: 1px solid rgba(0,0,0,0.1); padding: 8px; resize: none;
            }
            .gft-dark-mode .gft-code-area { background: #111; color: #888; border-color: #333; }
            .gft-io-zone { margin-top: 20px; padding-top: 15px; border-top: 1px dashed rgba(0,0,0,0.1); }
            .gft-dark-mode .gft-io-zone { border-top-color: rgba(255,255,255,0.1); }
            .gft-preview-zone { 
                padding: 15px; background: rgba(0,0,0,0.03); border-radius: 8px; 
                margin-bottom: 15px; text-align: center; border: 1px dashed rgba(0,0,0,0.1);
            }
            .gft-dark-mode .gft-preview-zone { background: #151515; border-color: rgba(255,255,255,0.1); }
            .gft-dark-mode .gft-shortcut-button { color: #eee !important; background: #333; border-color: #444; }
            .gft-dark-mode .gft-shortcut-button.gft-btn-struct { color: #222 !important; background: #f9ff55; border-color: #f9ff55; }
        `;
          document.head.appendChild(style);
        }
      })();
      function replaceAndHighlightInDiv(editorNode, searchRegex, replacementTextOrFn, highlightClass) {
        let replacementsMadeCount = 0;
        const treeWalker = document.createTreeWalker(editorNode, NodeFilter.SHOW_TEXT, null, false);
        const nodesToProcess = [];
        while (treeWalker.nextNode()) nodesToProcess.push(treeWalker.currentNode);
        nodesToProcess.forEach((textNode) => {
          const localSearchRegex = new RegExp(searchRegex.source, searchRegex.flags.includes("g") ? searchRegex.flags : searchRegex.flags + "g");
          if (textNode.nodeValue.match(localSearchRegex)) {
            const parent = textNode.parentNode;
            if (!parent || parent.nodeType === Node.ELEMENT_NODE && parent.classList.contains(highlightClass)) return;
            const fragment = document.createDocumentFragment();
            let lastIndex = 0;
            let match;
            let nodeChangedThisIteration = false;
            localSearchRegex.lastIndex = 0;
            while ((match = localSearchRegex.exec(textNode.nodeValue)) !== null) {
              if (match.index > lastIndex) fragment.appendChild(document.createTextNode(textNode.nodeValue.substring(lastIndex, match.index)));
              const actualReplacement = typeof replacementTextOrFn === "function" ? replacementTextOrFn(match[0], ...match.slice(1)) : replacementTextOrFn;
              const span = document.createElement("span");
              span.className = highlightClass;
              span.style.cssText = "background-color: #f9ff55 !important; border-radius: 2px !important; padding: 0 1px !important; animation: lyrics-helper-fadeout 2s ease-out forwards !important;";
              span.textContent = actualReplacement;
              fragment.appendChild(span);
              lastIndex = localSearchRegex.lastIndex;
              nodeChangedThisIteration = true;
              replacementsMadeCount++;
              if (lastIndex === match.index && localSearchRegex.source !== "") localSearchRegex.lastIndex++;
              if (lastIndex === 0 && localSearchRegex.source === "" && match[0] === "") break;
            }
            if (lastIndex < textNode.nodeValue.length) fragment.appendChild(document.createTextNode(textNode.nodeValue.substring(lastIndex)));
            if (nodeChangedThisIteration && fragment.childNodes.length > 0) {
              parent.replaceChild(fragment, textNode);
            }
          }
        });
        return replacementsMadeCount;
      }
      function findUnmatchedBracketsAndParentheses(text) {
        const unmatched = [];
        const stack = [];
        const pairs = {
          "(": ")",
          "[": "]"
        };
        const closingChars = {
          ")": "(",
          "]": "["
        };
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          if (pairs[char]) {
            stack.push({ char, position: i });
          } else if (closingChars[char]) {
            if (stack.length === 0) {
              unmatched.push({ char, position: i, type: "closing-without-opening" });
            } else {
              const last = stack[stack.length - 1];
              if (pairs[last.char] === char) {
                stack.pop();
              } else {
                unmatched.push({ char, position: i, type: "wrong-pair" });
                stack.pop();
              }
            }
          }
        }
        stack.forEach((item) => {
          unmatched.push({ char: item.char, position: item.position, type: "opening-without-closing" });
        });
        return unmatched;
      }
      function createTextareaReplacementOverlay(textarea, originalText, newText, searchPattern, color = "#f9ff55") {
        const existingOverlay = document.getElementById("gft-textarea-overlay");
        if (existingOverlay) {
          existingOverlay.remove();
        }
        if (originalText === newText) {
          return;
        }
        const modifiedPositions = /* @__PURE__ */ new Set();
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
          if (!searchPattern.flags.includes("g")) break;
        }
        let offset = 0;
        originalMatches.forEach((originalMatch) => {
          const posInNew = originalMatch.start + offset;
          const originalLength = originalMatch.end - originalMatch.start;
          let newLength = 0;
          let k = posInNew;
          const charAfterMatch = originalText[originalMatch.end];
          if (charAfterMatch) {
            while (k < newText.length && newText[k] !== charAfterMatch) {
              newLength++;
              k++;
            }
          } else {
            newLength = newText.length - posInNew;
          }
          for (let i = posInNew; i < posInNew + newLength; i++) {
            modifiedPositions.add(i);
          }
          offset += newLength - originalLength;
        });
        const overlay = document.createElement("div");
        overlay.id = "gft-textarea-overlay";
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
        const rect = textarea.getBoundingClientRect();
        const parentRect = textarea.offsetParent ? textarea.offsetParent.getBoundingClientRect() : { top: 0, left: 0 };
        overlay.style.top = rect.top - parentRect.top + (textarea.offsetParent ? textarea.offsetParent.scrollTop : 0) + "px";
        overlay.style.left = rect.left - parentRect.left + (textarea.offsetParent ? textarea.offsetParent.scrollLeft : 0) + "px";
        overlay.style.width = textarea.offsetWidth + "px";
        overlay.style.height = textarea.offsetHeight + "px";
        let htmlContent = "";
        for (let i = 0; i < newText.length; i++) {
          const char = newText[i];
          if (modifiedPositions.has(i)) {
            htmlContent += `<span class="gft-correction-overlay" style="background-color: ${color}; opacity: 0.6; border-radius: 2px; padding: 0 1px; color: transparent; font-weight: inherit;">${char === "<" ? "&lt;" : char === ">" ? "&gt;" : char === "&" ? "&amp;" : char === "\n" ? "<br>" : char}</span>`;
          } else {
            htmlContent += `<span style="color: transparent;">${char === "<" ? "&lt;" : char === ">" ? "&gt;" : char === "&" ? "&amp;" : char === "\n" ? "<br>" : char}</span>`;
          }
        }
        overlay.innerHTML = htmlContent;
        textarea.parentNode.insertBefore(overlay, textarea);
        const syncScroll = () => {
          overlay.scrollTop = textarea.scrollTop;
          overlay.scrollLeft = textarea.scrollLeft;
        };
        textarea.addEventListener("scroll", syncScroll);
        setTimeout(() => {
          if (overlay && overlay.parentNode) {
            overlay.remove();
            textarea.removeEventListener("scroll", syncScroll);
          }
        }, 2e3);
      }
      function createTextareaOverlay(textarea, unmatched) {
        const existingOverlay = document.getElementById("gft-textarea-overlay");
        if (existingOverlay) {
          existingOverlay.remove();
        }
        const overlay = document.createElement("div");
        overlay.id = "gft-textarea-overlay";
        const computedStyle = window.getComputedStyle(textarea);
        overlay.style.cssText = `
        position: absolute;
        pointer-events: none;
        z-index: 10000;
        white-space: pre-wrap;
        word-wrap: break-word;
        overflow: hidden;
        background-color: transparent;
        color: transparent;
        font-family: ${computedStyle.fontFamily};
        font-size: ${computedStyle.fontSize};
        line-height: ${computedStyle.lineHeight};
        padding: ${computedStyle.padding};
        margin: ${computedStyle.margin};
        border: ${computedStyle.border};
        border-color: transparent;
        box-sizing: border-box;
    `;
        const rect = textarea.getBoundingClientRect();
        const parentRect = textarea.offsetParent ? textarea.offsetParent.getBoundingClientRect() : { top: 0, left: 0 };
        const scrollTop = textarea.offsetParent ? textarea.offsetParent.scrollTop : 0;
        const scrollLeft = textarea.offsetParent ? textarea.offsetParent.scrollLeft : 0;
        overlay.style.top = rect.top - parentRect.top + scrollTop + "px";
        overlay.style.left = rect.left - parentRect.left + scrollLeft + "px";
        overlay.style.width = rect.width + "px";
        overlay.style.height = rect.height + "px";
        const text = textarea.value;
        const unmatchedPositions = new Set(unmatched.map((u) => u.position));
        let htmlContent = "";
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          if (unmatchedPositions.has(i)) {
            const unmatchedItem = unmatched.find((u) => u.position === i);
            let title = "";
            if (unmatchedItem.type === "opening-without-closing") {
              title = `${unmatchedItem.char} ouvrant sans fermeture correspondante`;
            } else if (unmatchedItem.type === "closing-without-opening") {
              title = `${unmatchedItem.char} fermant sans ouverture correspondante`;
            } else if (unmatchedItem.type === "wrong-pair") {
              title = `${unmatchedItem.char} ne correspond pas au caract\xE8re ouvrant`;
            }
            htmlContent += `<span class="gft-bracket-error-overlay" title="${title}" style="background-color: #ff0000 !important; color: white !important; font-weight: bold; border-radius: 2px;">${char === "<" ? "&lt;" : char === ">" ? "&gt;" : char === "&" ? "&amp;" : char}</span>`;
          } else {
            if (char === "\n") {
              htmlContent += "<br>";
            } else {
              htmlContent += `<span>${char === "<" ? "&lt;" : char === ">" ? "&gt;" : char === "&" ? "&amp;" : char === " " ? "&nbsp;" : char}</span>`;
            }
          }
        }
        overlay.innerHTML = htmlContent;
        if (textarea.nextSibling) {
          textarea.parentNode.insertBefore(overlay, textarea.nextSibling);
        } else {
          textarea.parentNode.appendChild(overlay);
        }
        const syncScroll = () => {
          overlay.scrollTop = textarea.scrollTop;
          overlay.scrollLeft = textarea.scrollLeft;
        };
        textarea.addEventListener("scroll", syncScroll);
        const cleanup = () => {
          overlay.remove();
          textarea.removeEventListener("scroll", syncScroll);
          textarea.removeEventListener("input", cleanup);
        };
        textarea.addEventListener("input", cleanup);
        if (!document.getElementById("gft-overlay-style")) {
          const style = document.createElement("style");
          style.id = "gft-overlay-style";
          style.textContent = `
            @keyframes gft-overlay-pulse {
                0%, 100% { background-color: #ff0000; box-shadow: 0 0 5px #ff0000; }
                50% { background-color: #aa0000; box-shadow: 0 0 2px #550000; }
            }
            .gft-bracket-error-overlay {
                animation: gft-overlay-pulse 1s ease-in-out infinite;
                display: inline-block;
                line-height: 1;
            }
        `;
          document.head.appendChild(style);
        }
      }
      function highlightUnmatchedBracketsInEditor(editorNode, editorType) {
        console.log("[GFT] highlightUnmatchedBracketsInEditor appel\xE9e");
        console.log("[GFT] editorType:", editorType);
        if (editorType === "div") {
          const existingErrors = editorNode.querySelectorAll(".gft-bracket-error");
          existingErrors.forEach((span) => {
            const text2 = span.textContent;
            const textNode = document.createTextNode(text2);
            span.parentNode.replaceChild(textNode, span);
          });
          editorNode.normalize();
        } else {
          const existingOverlay = document.getElementById("gft-textarea-overlay");
          if (existingOverlay) existingOverlay.remove();
        }
        const text = editorType === "textarea" ? editorNode.value : editorNode.textContent;
        console.log("[GFT] Texte \xE0 analyser (longueur):", text.length);
        const unmatched = findUnmatchedBracketsAndParentheses(text);
        console.log("[GFT] Caract\xE8res non appari\xE9s trouv\xE9s:", unmatched.length);
        if (unmatched.length === 0) {
          const existingOverlay = document.getElementById("gft-textarea-overlay");
          if (existingOverlay) {
            existingOverlay.remove();
          }
          console.log("[GFT] Aucun probl\xE8me trouv\xE9, retour 0");
          return 0;
        }
        console.log("[GFT] Probl\xE8mes trouv\xE9s, cr\xE9ation de l'overlay...");
        if (editorType === "div") {
          const treeWalker = document.createTreeWalker(editorNode, NodeFilter.SHOW_TEXT, null, false);
          const textNodes = [];
          while (treeWalker.nextNode()) {
            textNodes.push(treeWalker.currentNode);
          }
          let globalPosition = 0;
          const unmatchedPositions = new Set(unmatched.map((u) => u.position));
          textNodes.forEach((textNode) => {
            const nodeText = textNode.nodeValue;
            const nodeStartPos = globalPosition;
            const nodeEndPos = globalPosition + nodeText.length;
            const relevantPositions = unmatched.filter(
              (u) => u.position >= nodeStartPos && u.position < nodeEndPos
            );
            if (relevantPositions.length > 0) {
              const parent = textNode.parentNode;
              if (parent && parent.nodeType === Node.ELEMENT_NODE && parent.classList.contains("gft-bracket-error")) {
                globalPosition += nodeText.length;
                return;
              }
              const fragment = document.createDocumentFragment();
              let lastIndex = 0;
              relevantPositions.forEach((unmatchedItem) => {
                const localPos = unmatchedItem.position - nodeStartPos;
                if (localPos > lastIndex) {
                  fragment.appendChild(document.createTextNode(nodeText.substring(lastIndex, localPos)));
                }
                const span = document.createElement("span");
                span.className = "gft-bracket-error";
                span.textContent = nodeText[localPos];
                span.style.cssText = "background-color: #ff4444 !important; color: white !important; padding: 0 2px; border-radius: 2px; font-weight: bold;";
                if (unmatchedItem.type === "opening-without-closing") {
                  span.title = `${unmatchedItem.char} ouvrant sans fermeture correspondante`;
                } else if (unmatchedItem.type === "closing-without-opening") {
                  span.title = `${unmatchedItem.char} fermant sans ouverture correspondante`;
                } else if (unmatchedItem.type === "wrong-pair") {
                  span.title = `${unmatchedItem.char} ne correspond pas au caract\xE8re ouvrant`;
                }
                fragment.appendChild(span);
                lastIndex = localPos + 1;
              });
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
          createTextareaOverlay(editorNode, unmatched);
        }
        return unmatched.length;
      }
      function hideGeniusFormattingHelper() {
        const helperElement = document.querySelector(SELECTORS.GENIUS_FORMATTING_HELPER);
        if (helperElement) helperElement.style.display = "none";
      }
      function applyDarkMode(isDark) {
        if (GFT_STATE.shortcutsContainerElement) {
          if (isDark) {
            GFT_STATE.shortcutsContainerElement.classList.add(DARK_MODE_CLASS);
            if (GFT_STATE.darkModeButton) GFT_STATE.darkModeButton.textContent = "\u2600\uFE0F";
          } else {
            GFT_STATE.shortcutsContainerElement.classList.remove(DARK_MODE_CLASS);
            if (GFT_STATE.darkModeButton) GFT_STATE.darkModeButton.textContent = "\u{1F319}";
          }
        }
        if (GFT_STATE.floatingFormattingToolbar) {
          if (isDark) {
            GFT_STATE.floatingFormattingToolbar.classList.add(DARK_MODE_CLASS);
          } else {
            GFT_STATE.floatingFormattingToolbar.classList.remove(DARK_MODE_CLASS);
          }
        }
        localStorage.setItem(DARK_MODE_STORAGE_KEY, isDark.toString());
      }
      function loadDarkModePreference() {
        const savedPreference = localStorage.getItem(DARK_MODE_STORAGE_KEY);
        const shouldBeDark = savedPreference === null ? true : savedPreference === "true";
        applyDarkMode(shouldBeDark);
      }
      function createFloatingFormattingToolbar() {
        if (GFT_STATE.floatingFormattingToolbar && document.body.contains(GFT_STATE.floatingFormattingToolbar)) {
          return GFT_STATE.floatingFormattingToolbar;
        }
        const toolbar = document.createElement("div");
        toolbar.id = FLOATING_TOOLBAR_ID;
        toolbar.className = "gft-floating-toolbar";
        const lyricsCardButton = document.createElement("button");
        lyricsCardButton.textContent = getTranslation("create_lyric_card");
        lyricsCardButton.classList.add("gft-floating-format-button", "gft-lyric-card-btn");
        lyricsCardButton.title = getTranslation("toolbar_lyric_card_tooltip");
        lyricsCardButton.type = "button";
        lyricsCardButton.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          generateLyricsCard();
        });
        addTooltip(lyricsCardButton, getTranslation("toolbar_lyric_card_tooltip"));
        toolbar.appendChild(lyricsCardButton);
        if (!isLyricCardOnlyMode()) {
          const boldButton = document.createElement("button");
          boldButton.textContent = getTranslation("toolbar_bold");
          boldButton.classList.add("gft-floating-format-button");
          boldButton.title = getTranslation("toolbar_bold_tooltip");
          boldButton.type = "button";
          boldButton.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            applyFormattingToSelection("bold");
          });
          addTooltip(boldButton, getTranslation("toolbar_bold_tooltip"));
          toolbar.appendChild(boldButton);
        }
        if (!isLyricCardOnlyMode()) {
          const italicButton = document.createElement("button");
          italicButton.textContent = getTranslation("toolbar_italic");
          italicButton.classList.add("gft-floating-format-button");
          italicButton.title = getTranslation("toolbar_italic_tooltip");
          italicButton.type = "button";
          italicButton.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            applyFormattingToSelection("italic");
          });
          addTooltip(italicButton, getTranslation("toolbar_italic_tooltip"));
          toolbar.appendChild(italicButton);
        }
        if (!isLyricCardOnlyMode()) {
          const numberButton = document.createElement("button");
          numberButton.textContent = getTranslation("toolbar_num_to_words");
          numberButton.classList.add("gft-floating-format-button", "gft-number-button");
          numberButton.title = getTranslation("toolbar_num_to_words_tooltip");
          numberButton.type = "button";
          numberButton.style.display = "none";
          numberButton.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            convertNumberToWords();
          });
          addTooltip(numberButton, getTranslation("toolbar_num_to_words_tooltip"));
          toolbar.appendChild(numberButton);
        }
        if (!isLyricCardOnlyMode()) {
          const adlibButton = document.createElement("button");
          adlibButton.textContent = getTranslation("btn_adlib_label");
          adlibButton.classList.add("gft-floating-format-button", "gft-adlib-button");
          adlibButton.title = getTranslation("cleanup_adlib_tooltip");
          adlibButton.type = "button";
          adlibButton.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            wrapSelectionWithAdlib();
          });
          addTooltip(adlibButton, getTranslation("cleanup_adlib_tooltip"));
          toolbar.appendChild(adlibButton);
        }
        document.body.appendChild(toolbar);
        GFT_STATE.floatingFormattingToolbar = toolbar;
        const isDarkMode = localStorage.getItem(DARK_MODE_STORAGE_KEY) === "true";
        if (isDarkMode) {
          toolbar.classList.add(DARK_MODE_CLASS);
        }
        return toolbar;
      }
      function applyFormattingToSelection(formatType) {
        if (!GFT_STATE.currentActiveEditor) return;
        isButtonActionInProgress = true;
        if (GFT_STATE.autoSaveTimeout) {
          clearTimeout(GFT_STATE.autoSaveTimeout);
          GFT_STATE.autoSaveTimeout = null;
        }
        saveToHistory();
        GFT_STATE.currentActiveEditor.focus();
        const prefix = formatType === "bold" ? "<b>" : "<i>";
        const suffix = formatType === "bold" ? "</b>" : "</i>";
        if (GFT_STATE.currentEditorType === "textarea") {
          const start = GFT_STATE.currentActiveEditor.selectionStart;
          const end = GFT_STATE.currentActiveEditor.selectionEnd;
          const selectedText = GFT_STATE.currentActiveEditor.value.substring(start, end);
          let textToInsert = start !== end ? `${prefix}${selectedText}${suffix}` : `${prefix} ${suffix}`;
          document.execCommand("insertText", false, textToInsert);
          if (start === end) {
            GFT_STATE.currentActiveEditor.setSelectionRange(start + prefix.length + 1, start + prefix.length + 1);
          } else {
            GFT_STATE.currentActiveEditor.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
          }
        } else if (GFT_STATE.currentEditorType === "div") {
          document.execCommand(formatType, false, null);
          const selection = window.getSelection();
          if (selection.isCollapsed) {
            const formatElement = document.createElement(formatType === "bold" ? "b" : "i");
            const spaceNode = document.createTextNode("\xA0");
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
        setTimeout(() => {
          isButtonActionInProgress = false;
          if (GFT_STATE.currentActiveEditor) {
            GFT_STATE.lastSavedContent = getCurrentEditorContent();
            GFT_STATE.hasUnsavedChanges = false;
          }
        }, 100);
        hideFloatingToolbar();
      }
      function convertNumberToWords() {
        if (!GFT_STATE.currentActiveEditor) return;
        isButtonActionInProgress = true;
        if (GFT_STATE.autoSaveTimeout) {
          clearTimeout(GFT_STATE.autoSaveTimeout);
          GFT_STATE.autoSaveTimeout = null;
        }
        saveToHistory();
        GFT_STATE.currentActiveEditor.focus();
        let selectedText = "";
        let start, end;
        if (GFT_STATE.currentEditorType === "textarea") {
          start = GFT_STATE.currentActiveEditor.selectionStart;
          end = GFT_STATE.currentActiveEditor.selectionEnd;
          selectedText = GFT_STATE.currentActiveEditor.value.substring(start, end).trim();
        } else if (GFT_STATE.currentEditorType === "div") {
          const selection = window.getSelection();
          if (selection.rangeCount > 0) {
            selectedText = selection.toString().trim();
          }
        }
        if (!isValidNumber(selectedText)) {
          hideFloatingToolbar();
          return;
        }
        const num = parseInt(selectedText, 10);
        let wordsText;
        if (isPolishTranscriptionMode2()) {
          wordsText = numberToPolishWords(num);
        } else if (isEnglishTranscriptionMode()) {
          wordsText = numberToEnglishWords(num);
        } else {
          wordsText = numberToFrenchWords(num);
        }
        if (GFT_STATE.currentEditorType === "textarea") {
          document.execCommand("insertText", false, wordsText);
          const newEnd = start + wordsText.length;
          GFT_STATE.currentActiveEditor.setSelectionRange(newEnd, newEnd);
        } else if (GFT_STATE.currentEditorType === "div") {
          document.execCommand("insertText", false, wordsText);
        }
        setTimeout(() => {
          isButtonActionInProgress = false;
          if (GFT_STATE.currentActiveEditor) {
            GFT_STATE.lastSavedContent = getCurrentEditorContent();
            GFT_STATE.hasUnsavedChanges = false;
          }
        }, 100);
        hideFloatingToolbar();
      }
      function wrapSelectionWithAdlib() {
        if (!GFT_STATE.currentActiveEditor) return;
        isButtonActionInProgress = true;
        if (GFT_STATE.autoSaveTimeout) {
          clearTimeout(GFT_STATE.autoSaveTimeout);
          GFT_STATE.autoSaveTimeout = null;
        }
        saveToHistory();
        let selectedText = "";
        let replaced = false;
        if (GFT_STATE.currentEditorType === "textarea") {
          const start = GFT_STATE.currentActiveEditor.selectionStart;
          const end = GFT_STATE.currentActiveEditor.selectionEnd;
          if (start !== end) {
            selectedText = GFT_STATE.currentActiveEditor.value.substring(start, end);
            const wrappedText = "(" + selectedText + ")";
            GFT_STATE.currentActiveEditor.setSelectionRange(start, end);
            document.execCommand("insertText", false, wrappedText);
            replaced = true;
          }
        } else if (GFT_STATE.currentEditorType === "div") {
          const selection = window.getSelection();
          if (selection.rangeCount > 0 && !selection.isCollapsed) {
            selectedText = selection.toString();
            const wrappedText = "(" + selectedText + ")";
            document.execCommand("insertText", false, wrappedText);
            GFT_STATE.currentActiveEditor.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
            replaced = true;
          }
        }
        if (replaced) {
          showFeedbackMessage(getTranslation("feedback_adlib_added"), 2e3, GFT_STATE.shortcutsContainerElement);
        } else {
          showFeedbackMessage(getTranslation("feedback_select_text_first"), 2e3, GFT_STATE.shortcutsContainerElement);
        }
        setTimeout(() => {
          isButtonActionInProgress = false;
          if (GFT_STATE.currentActiveEditor) {
            GFT_STATE.lastSavedContent = getCurrentEditorContent();
            GFT_STATE.hasUnsavedChanges = false;
          }
        }, 100);
        hideFloatingToolbar();
      }
      function calculateStats(text) {
        if (!text) return { lines: 0, words: 0, sections: 0, characters: 0 };
        const lines = text.split("\n").filter((l) => l.trim().length > 0);
        const words = text.split(/\s+/).filter((w) => w.trim().length > 0);
        const sections = (text.match(/\[.*?\]/g) || []).length;
        const characters = text.replace(/\s/g, "").length;
        return {
          lines: lines.length,
          words: words.length,
          sections,
          characters
        };
      }
      function updateStatsDisplay() {
        if (!GFT_STATE.currentActiveEditor) return;
        const statsElement = document.getElementById("gft-stats-display");
        if (!statsElement || !statsElement.classList.contains("gft-stats-visible")) return;
        const text = GFT_STATE.currentEditorType === "textarea" ? GFT_STATE.currentActiveEditor.value : GFT_STATE.currentActiveEditor.textContent || "";
        const stats = calculateStats(text);
        statsElement.innerHTML = `\u{1F4CA} <strong>${stats.lines}</strong> ${getTranslation("stats_lines", stats.lines)} \u2022 <strong>${stats.words}</strong> ${getTranslation("stats_words", stats.words)} \u2022 <strong>${stats.sections}</strong> ${getTranslation("stats_sections", stats.sections)} \u2022 <strong>${stats.characters}</strong> ${getTranslation("stats_characters", stats.characters)}`;
      }
      var statsUpdateTimeout = null;
      function debouncedStatsUpdate() {
        if (statsUpdateTimeout) clearTimeout(statsUpdateTimeout);
        statsUpdateTimeout = setTimeout(() => {
          updateStatsDisplay();
        }, 300);
      }
      function toggleStatsDisplay() {
        const statsElement = document.getElementById("gft-stats-display");
        if (!statsElement) return;
        const isVisible = statsElement.classList.contains("gft-stats-visible");
        if (isVisible) {
          statsElement.classList.remove("gft-stats-visible");
          localStorage.setItem("gft-stats-visible", "false");
        } else {
          statsElement.classList.add("gft-stats-visible");
          localStorage.setItem("gft-stats-visible", "true");
          updateStatsDisplay();
        }
      }
      function createStatsDisplay() {
        const statsElement = document.createElement("div");
        statsElement.id = "gft-stats-display";
        statsElement.className = "gft-stats-display";
        const isVisible = localStorage.getItem("gft-stats-visible") === "true";
        if (isVisible) {
          statsElement.classList.add("gft-stats-visible");
        }
        return statsElement;
      }
      function getCurrentEditorContent() {
        if (!GFT_STATE.currentActiveEditor) return "";
        if (GFT_STATE.currentEditorType === "textarea") {
          return GFT_STATE.currentActiveEditor.value;
        } else if (GFT_STATE.currentEditorType === "div") {
          return GFT_STATE.currentActiveEditor.textContent || "";
        }
        return "";
      }
      function setEditorContent(content) {
        if (!GFT_STATE.currentActiveEditor) return;
        if (GFT_STATE.currentEditorType === "textarea") {
          GFT_STATE.currentActiveEditor.value = content;
          GFT_STATE.currentActiveEditor.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
        } else if (GFT_STATE.currentEditorType === "div") {
          GFT_STATE.currentActiveEditor.innerHTML = "";
          content.split("\n").forEach((lineText, index, arr) => {
            const lineDiv = document.createElement("div");
            if (lineText === "") {
              if (index !== arr.length - 1 || content.endsWith("\n")) {
                lineDiv.appendChild(document.createElement("br"));
              }
            } else {
              lineDiv.textContent = lineText;
            }
            GFT_STATE.currentActiveEditor.appendChild(lineDiv);
          });
          if (GFT_STATE.currentActiveEditor.childNodes.length === 0) {
            const emptyDiv = document.createElement("div");
            emptyDiv.appendChild(document.createElement("br"));
            GFT_STATE.currentActiveEditor.appendChild(emptyDiv);
          }
          GFT_STATE.currentActiveEditor.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
        }
        debouncedStatsUpdate();
      }
      var isUndoRedoInProgress = false;
      var isButtonActionInProgress = false;
      var draftNotificationShown = false;
      function saveToHistory() {
        if (!GFT_STATE.currentActiveEditor || isUndoRedoInProgress) return;
        const currentContent = getCurrentEditorContent();
        if (GFT_STATE.undoStack.length > 0 && GFT_STATE.undoStack[GFT_STATE.undoStack.length - 1] === currentContent) {
          return;
        }
        GFT_STATE.undoStack.push(currentContent);
        GFT_STATE.lastSavedContent = currentContent;
        GFT_STATE.hasUnsavedChanges = false;
        if (GFT_STATE.undoStack.length > MAX_HISTORY_SIZE) {
          GFT_STATE.undoStack.shift();
        }
        GFT_STATE.redoStack = [];
        updateHistoryButtons();
      }
      function autoSaveToHistory() {
        if (!GFT_STATE.currentActiveEditor || isUndoRedoInProgress || isButtonActionInProgress) return;
        const currentContent = getCurrentEditorContent();
        if (!GFT_STATE.hasUnsavedChanges && currentContent !== GFT_STATE.lastSavedContent) {
          if (GFT_STATE.lastSavedContent && GFT_STATE.lastSavedContent !== (GFT_STATE.undoStack[GFT_STATE.undoStack.length - 1] || "")) {
            GFT_STATE.undoStack.push(GFT_STATE.lastSavedContent);
            if (GFT_STATE.undoStack.length > MAX_HISTORY_SIZE) {
              GFT_STATE.undoStack.shift();
            }
            GFT_STATE.redoStack = [];
            updateHistoryButtons();
          }
          GFT_STATE.hasUnsavedChanges = true;
        }
        if (GFT_STATE.autoSaveTimeout) {
          clearTimeout(GFT_STATE.autoSaveTimeout);
        }
        GFT_STATE.autoSaveTimeout = setTimeout(() => {
          if (isUndoRedoInProgress || isButtonActionInProgress) return;
          const finalContent = getCurrentEditorContent();
          GFT_STATE.lastSavedContent = finalContent;
          GFT_STATE.hasUnsavedChanges = false;
          saveDraft(finalContent);
        }, 2e3);
      }
      function getDraftKey() {
        return `gft-draft-${window.location.pathname}`;
      }
      function saveDraft(content) {
        if (!content || content.trim().length === 0) return;
        const key = getDraftKey();
        const draftData = {
          content,
          timestamp: Date.now(),
          title: GFT_STATE.currentSongTitle
        };
        try {
          localStorage.setItem(key, JSON.stringify(draftData));
          visualFeedbackAutoSave();
        } catch (e) {
          console.warn("[GFT] Erreur sauvegarde brouillon:", e);
        }
      }
      function checkAndRestoreDraft() {
        if (draftNotificationShown) return;
        const key = getDraftKey();
        const savedDraft = localStorage.getItem(key);
        if (!savedDraft) return;
        try {
          const draftData = JSON.parse(savedDraft);
          const currentContent = getCurrentEditorContent();
          if (!draftData.content || draftData.content === currentContent) return;
          const ONE_DAY = 24 * 60 * 60 * 1e3;
          if (Date.now() - draftData.timestamp > ONE_DAY) return;
          const date = new Date(draftData.timestamp);
          const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          showRestoreDraftNotification(timeStr, draftData.content);
          draftNotificationShown = true;
        } catch (e) {
          console.warn("[GFT] Erreur lecture brouillon:", e);
        }
      }
      function showRestoreDraftNotification(timeStr, contentToRestore) {
        const container = document.body;
        const notification = document.createElement("div");
        notification.className = "gft-draft-notification";
        notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #333;
        color: white;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        z-index: 2147483647; /* Max z-index pour \xEAtre s\xFBr d'\xEAtre au-dessus de tout */
        display: flex;
        flex-direction: column;
        gap: 10px;
        font-family: 'Programme', sans-serif;
        border-left: 4px solid #ffff64;
        animation: slideIn 0.3s ease-out;
        pointer-events: auto; /* Force la r\xE9activit\xE9 aux clics */
        cursor: default;
    `;
        const text = document.createElement("div");
        text.innerHTML = `<strong>${getTranslation("draft_found_title")}</strong><br>${getTranslation("draft_saved_at")} ${timeStr}`;
        const buttons = document.createElement("div");
        buttons.style.display = "flex";
        buttons.style.gap = "10px";
        const restoreBtn = document.createElement("button");
        restoreBtn.textContent = getTranslation("draft_btn_restore");
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
          e.stopPropagation();
          setEditorContent(contentToRestore);
          saveToHistory();
          showFeedbackMessage(getTranslation("draft_restored"));
          notification.remove();
          draftNotificationShown = false;
        };
        const discardBtn = document.createElement("button");
        discardBtn.textContent = getTranslation("draft_btn_discard");
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
          localStorage.removeItem(getDraftKey());
          draftNotificationShown = false;
        };
        buttons.appendChild(restoreBtn);
        buttons.appendChild(discardBtn);
        notification.appendChild(text);
        notification.appendChild(buttons);
        container.appendChild(notification);
        setTimeout(() => {
          if (document.body.contains(notification)) {
            notification.remove();
            draftNotificationShown = false;
          }
        }, 15e3);
      }
      function undoLastChange() {
        if (!GFT_STATE.currentActiveEditor || GFT_STATE.undoStack.length === 0) {
          showFeedbackMessage(getTranslation("feedback_no_changes"), 2e3, GFT_STATE.shortcutsContainerElement);
          return;
        }
        isUndoRedoInProgress = true;
        if (GFT_STATE.autoSaveTimeout) {
          clearTimeout(GFT_STATE.autoSaveTimeout);
          GFT_STATE.autoSaveTimeout = null;
        }
        const currentContent = getCurrentEditorContent();
        GFT_STATE.redoStack.push(currentContent);
        const previousContent = GFT_STATE.undoStack.pop();
        setEditorContent(previousContent);
        GFT_STATE.lastSavedContent = previousContent;
        GFT_STATE.hasUnsavedChanges = false;
        updateHistoryButtons();
        showFeedbackMessage(getTranslation("feedback_undo"), 2e3, GFT_STATE.shortcutsContainerElement);
        setTimeout(() => {
          isUndoRedoInProgress = false;
        }, 100);
      }
      function redoLastChange() {
        if (!GFT_STATE.currentActiveEditor || GFT_STATE.redoStack.length === 0) {
          showFeedbackMessage(getTranslation("feedback_no_changes"), 2e3, GFT_STATE.shortcutsContainerElement);
          return;
        }
        isUndoRedoInProgress = true;
        if (GFT_STATE.autoSaveTimeout) {
          clearTimeout(GFT_STATE.autoSaveTimeout);
          GFT_STATE.autoSaveTimeout = null;
        }
        const currentContent = getCurrentEditorContent();
        GFT_STATE.undoStack.push(currentContent);
        if (GFT_STATE.undoStack.length > MAX_HISTORY_SIZE) {
          GFT_STATE.undoStack.shift();
        }
        const nextContent = GFT_STATE.redoStack.pop();
        setEditorContent(nextContent);
        GFT_STATE.lastSavedContent = nextContent;
        GFT_STATE.hasUnsavedChanges = false;
        updateHistoryButtons();
        showFeedbackMessage(getTranslation("feedback_redo"), 2e3, GFT_STATE.shortcutsContainerElement);
        setTimeout(() => {
          isUndoRedoInProgress = false;
        }, 100);
      }
      function updateHistoryButtons() {
        const undoButton = document.getElementById("gft-undo-button");
        const redoButton = document.getElementById("gft-redo-button");
        if (undoButton) {
          if (GFT_STATE.undoStack.length === 0) {
            undoButton.disabled = true;
            undoButton.style.opacity = "0.5";
            undoButton.style.cursor = "not-allowed";
          } else {
            undoButton.disabled = false;
            undoButton.style.opacity = "1";
            undoButton.style.cursor = "pointer";
          }
        }
        if (redoButton) {
          if (GFT_STATE.redoStack.length === 0) {
            redoButton.disabled = true;
            redoButton.style.opacity = "0.5";
            redoButton.style.cursor = "not-allowed";
          } else {
            redoButton.disabled = false;
            redoButton.style.opacity = "1";
            redoButton.style.cursor = "pointer";
          }
        }
      }
      function createProgressBar() {
        const progressContainer = document.createElement("div");
        progressContainer.id = "gft-progress-container";
        progressContainer.className = "gft-progress-container";
        const progressBar = document.createElement("div");
        progressBar.id = "gft-progress-bar";
        progressBar.className = "gft-progress-bar";
        const progressText = document.createElement("div");
        progressText.id = "gft-progress-text";
        progressText.className = "gft-progress-text";
        progressText.textContent = "Pr\xE9paration...";
        progressContainer.appendChild(progressBar);
        progressContainer.appendChild(progressText);
        return progressContainer;
      }
      function showProgress(step, total, message) {
        let progressContainer = document.getElementById("gft-progress-container");
        if (!progressContainer && GFT_STATE.shortcutsContainerElement) {
          progressContainer = createProgressBar();
          const feedbackMsg = document.getElementById(FEEDBACK_MESSAGE_ID);
          if (feedbackMsg) {
            GFT_STATE.shortcutsContainerElement.insertBefore(progressContainer, feedbackMsg.nextSibling);
          } else {
            const panelTitle = document.getElementById("gftPanelTitle");
            if (panelTitle) {
              GFT_STATE.shortcutsContainerElement.insertBefore(progressContainer, panelTitle.nextSibling);
            } else {
              GFT_STATE.shortcutsContainerElement.insertBefore(progressContainer, GFT_STATE.shortcutsContainerElement.firstChild);
            }
          }
        }
        if (!progressContainer) return;
        progressContainer.style.display = "block";
        const progressBar = document.getElementById("gft-progress-bar");
        const progressText = document.getElementById("gft-progress-text");
        const percentage = Math.round(step / total * 100);
        if (progressBar) {
          progressBar.style.width = `${percentage}%`;
        }
        if (progressText) {
          progressText.textContent = `${message} (${step}/${total})`;
        }
      }
      function hideProgress() {
        const progressContainer = document.getElementById("gft-progress-container");
        if (progressContainer) {
          progressContainer.style.display = "none";
        }
      }
      function computeDiff(original, modified) {
        const m = original.length;
        const n = modified.length;
        const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
        for (let i2 = 1; i2 <= m; i2++) {
          for (let j2 = 1; j2 <= n; j2++) {
            if (original[i2 - 1] === modified[j2 - 1]) {
              dp[i2][j2] = dp[i2 - 1][j2 - 1] + 1;
            } else {
              dp[i2][j2] = Math.max(dp[i2 - 1][j2], dp[i2][j2 - 1]);
            }
          }
        }
        const chunks = [];
        let i = m, j = n;
        let currentCommon = "";
        let currentAdded = "";
        let currentRemoved = "";
        while (i > 0 || j > 0) {
          if (i > 0 && j > 0 && original[i - 1] === modified[j - 1]) {
            if (currentAdded) {
              chunks.unshift({ type: "added", value: currentAdded });
              currentAdded = "";
            }
            if (currentRemoved) {
              chunks.unshift({ type: "removed", value: currentRemoved });
              currentRemoved = "";
            }
            currentCommon = original[i - 1] + currentCommon;
            i--;
            j--;
          } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
            if (currentCommon) {
              chunks.unshift({ type: "common", value: currentCommon });
              currentCommon = "";
            }
            if (currentRemoved) {
              chunks.unshift({ type: "removed", value: currentRemoved });
              currentRemoved = "";
            }
            currentAdded = modified[j - 1] + currentAdded;
            j--;
          } else {
            if (currentCommon) {
              chunks.unshift({ type: "common", value: currentCommon });
              currentCommon = "";
            }
            if (currentAdded) {
              chunks.unshift({ type: "added", value: currentAdded });
              currentAdded = "";
            }
            currentRemoved = original[i - 1] + currentRemoved;
            i--;
          }
        }
        if (currentCommon) chunks.unshift({ type: "common", value: currentCommon });
        if (currentAdded) chunks.unshift({ type: "added", value: currentAdded });
        if (currentRemoved) chunks.unshift({ type: "removed", value: currentRemoved });
        return chunks;
      }
      function highlightDifferences(originalText, correctedText) {
        function escapeHtml(text) {
          const div = document.createElement("div");
          div.textContent = text;
          return div.innerHTML;
        }
        const diffChunks = computeDiff(originalText, correctedText);
        let html = "";
        diffChunks.forEach((chunk) => {
          let escapedValue = escapeHtml(chunk.value);
          escapedValue = escapedValue.replace(/\n/g, '<span style="opacity: 0.5; font-size: 0.8em;">\u21B5</span>\n');
          if (chunk.type === "removed") {
            html += `<span style="background-color: #ffcccc; color: #cc0000; text-decoration: line-through; border-radius: 2px;">${escapedValue}</span>`;
          } else if (chunk.type === "added") {
            html += `<span style="background-color: #ccffcc; color: #006600; font-weight: bold; border-radius: 2px;">${escapedValue}</span>`;
          } else {
            html += escapedValue;
          }
        });
        return html;
      }
      function showCorrectionPreview(originalText, correctedText, initialCorrections, onApply, onCancel) {
        let currentPreviewText = correctedText;
        let currentStats = initialCorrections;
        const options = {
          yPrime: true,
          apostrophes: true,
          oeuLigature: true,
          frenchQuotes: true,
          longDash: true,
          doubleSpaces: true,
          spacing: true
        };
        const overlay = document.createElement("div");
        overlay.id = "gft-preview-overlay";
        overlay.className = "gft-preview-overlay";
        const modal = document.createElement("div");
        modal.id = "gft-preview-modal";
        modal.className = "gft-preview-modal";
        const isDarkMode = localStorage.getItem(DARK_MODE_STORAGE_KEY) === "true";
        if (isDarkMode) modal.classList.add(DARK_MODE_CLASS);
        const header = document.createElement("div");
        header.style.marginBottom = "15px";
        const title = document.createElement("h2");
        title.textContent = getTranslation("preview_title");
        title.className = "gft-preview-title";
        header.appendChild(title);
        const optionsContainer = document.createElement("div");
        optionsContainer.style.display = "grid";
        optionsContainer.style.gridTemplateColumns = "repeat(auto-fit, minmax(180px, 1fr))";
        optionsContainer.style.gap = "8px";
        optionsContainer.style.padding = "10px";
        optionsContainer.style.background = isDarkMode ? "rgba(255,255,255,0.05)" : "#f0f0f0";
        optionsContainer.style.borderRadius = "5px";
        optionsContainer.style.marginBottom = "10px";
        const createOption = (key, label) => {
          const labelEl = document.createElement("label");
          labelEl.style.display = "flex";
          labelEl.style.alignItems = "center";
          labelEl.style.fontSize = "12px";
          labelEl.style.cursor = "pointer";
          if (isDarkMode) labelEl.style.color = "#ddd";
          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.checked = options[key];
          checkbox.style.marginRight = "6px";
          checkbox.addEventListener("change", () => {
            options[key] = checkbox.checked;
            updatePreview();
          });
          labelEl.appendChild(checkbox);
          labelEl.appendChild(document.createTextNode(label));
          return labelEl;
        };
        optionsContainer.appendChild(createOption("yPrime", getTranslation("preview_opt_yprime")));
        optionsContainer.appendChild(createOption("apostrophes", getTranslation("preview_opt_apostrophes")));
        optionsContainer.appendChild(createOption("oeuLigature", getTranslation("preview_opt_oeu")));
        optionsContainer.appendChild(createOption("frenchQuotes", getTranslation("preview_opt_quotes")));
        optionsContainer.appendChild(createOption("longDash", getTranslation("preview_opt_dash")));
        optionsContainer.appendChild(createOption("doubleSpaces", getTranslation("preview_opt_spaces")));
        optionsContainer.appendChild(createOption("spacing", getTranslation("preview_opt_spacing")));
        header.appendChild(optionsContainer);
        modal.appendChild(header);
        const summary = document.createElement("div");
        summary.className = "gft-preview-summary";
        modal.appendChild(summary);
        const diffTitle = document.createElement("h3");
        diffTitle.textContent = getTranslation("preview_diff_title");
        diffTitle.style.fontSize = "14px";
        diffTitle.style.marginBottom = "5px";
        diffTitle.style.color = isDarkMode ? "#aaa" : "#555";
        modal.appendChild(diffTitle);
        const diffContainer = document.createElement("div");
        diffContainer.className = "gft-preview-content";
        diffContainer.id = "gft-preview-diff";
        diffContainer.style.flex = "1";
        diffContainer.style.overflowY = "auto";
        diffContainer.style.whiteSpace = "pre-wrap";
        diffContainer.style.border = "1px solid #ccc";
        if (isDarkMode) diffContainer.style.borderColor = "#444";
        modal.appendChild(diffContainer);
        const buttonContainer = document.createElement("div");
        buttonContainer.className = "gft-preview-buttons";
        const cancelButton = document.createElement("button");
        cancelButton.textContent = getTranslation("preview_btn_cancel");
        cancelButton.className = "gft-preview-button gft-preview-button-cancel";
        cancelButton.addEventListener("click", () => close());
        buttonContainer.appendChild(cancelButton);
        const applyButton = document.createElement("button");
        applyButton.textContent = getTranslation("preview_btn_apply");
        applyButton.className = "gft-preview-button gft-preview-button-apply";
        applyButton.addEventListener("click", () => {
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
          if (onCancel && !currentPreviewText) onCancel();
        }
        function updatePreview() {
          const result = applyAllTextCorrectionsToString(originalText, options);
          currentPreviewText = result.newText;
          currentStats = result.corrections;
          const lang = localStorage.getItem("gftLanguage") || "fr";
          const detailsArray = [];
          if (options.yPrime && currentStats.yPrime > 0) detailsArray.push(`${currentStats.yPrime} "y'"`);
          if (options.apostrophes && currentStats.apostrophes > 0) detailsArray.push(`${currentStats.apostrophes} ${getTranslation("preview_stat_apostrophes", currentStats.apostrophes)}`);
          if (options.oeuLigature && currentStats.oeuLigature > 0) detailsArray.push(`${currentStats.oeuLigature} "oeu"`);
          if (options.frenchQuotes && currentStats.frenchQuotes > 0) detailsArray.push(`${currentStats.frenchQuotes} ${getTranslation("preview_stat_quotes", currentStats.frenchQuotes)}`);
          if (options.longDash && currentStats.longDash > 0) detailsArray.push(`${currentStats.longDash} ${getTranslation("preview_stat_dash", currentStats.longDash)}`);
          if (options.doubleSpaces && currentStats.doubleSpaces > 0) detailsArray.push(`${currentStats.doubleSpaces} ${getTranslation("preview_stat_spaces", currentStats.doubleSpaces)}`);
          if (options.spacing && currentStats.spacing > 0) detailsArray.push(`${currentStats.spacing} ${getTranslation("preview_stat_spacing", currentStats.spacing)}`);
          const total = result.correctionsCount;
          const summaryTemplate = getTranslation("preview_summary", total).replace("{count}", total);
          summary.innerHTML = `<strong>${summaryTemplate}</strong><br>${detailsArray.length > 0 ? formatListWithConjunction(detailsArray, lang) : getTranslation("preview_no_corrections")}`;
          diffContainer.innerHTML = highlightDifferences(originalText, currentPreviewText);
        }
        updatePreview();
        overlay.addEventListener("click", close);
      }
      function isFirstLaunch() {
        return localStorage.getItem("gft-tutorial-completed") !== "true";
      }
      function markTutorialCompleted() {
        localStorage.setItem("gft-tutorial-completed", "true");
      }
      function areTooltipsEnabled() {
        const setting = localStorage.getItem("gft-tooltips-enabled");
        return setting === null || setting === "true";
      }
      function isHeaderFeatEnabled() {
        const setting = localStorage.getItem(HEADER_FEAT_STORAGE_KEY);
        return setting === null ? true : setting === "true";
      }
      function setHeaderFeatEnabled(enabled) {
        localStorage.setItem(HEADER_FEAT_STORAGE_KEY, enabled.toString());
      }
      var currentTutorialStep = 0;
      var tutorialOverlay = null;
      var tutorialModal = null;
      function getTutorialSteps() {
        return [
          {
            title: "",
            // Hiding default title to use custom stylish header
            content: (() => {
              const isDark = localStorage.getItem(DARK_MODE_STORAGE_KEY) === "true";
              const btnBg = isDark ? "#333" : "#f9f9f9";
              const btnColor = isDark ? "white" : "#333";
              const btnBorder = isDark ? "#555" : "#ccc";
              return `
                <div style="display: flex; flex-direction: column; align-items: center; gap: 15px; margin-bottom: 25px;">
                    <img src="${chrome.runtime.getURL("images/icon128.png")}" style="width: 80px; height: 80px;">
                    <div style="background: ${btnBg}; border: 1px solid ${btnBorder}; border-radius: 16px; padding: 15px 20px; display: inline-block; box-shadow: 0 4px 10px rgba(0,0,0,0.1); text-align: center;">
                        <h2 style="font-size: 22px; font-weight: 900; margin: 0; background: linear-gradient(135deg, #FFD700, #FFA500); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -0.5px; line-height: 1.2;">Genius Fast Transcriber</h2>
                        <h3 style="font-size: 14px; margin: 5px 0 0 0; opacity: 0.9; font-weight: 600; color: ${btnColor}; text-transform: uppercase; letter-spacing: 1px;">+ Lyric Card Maker</h3>
                    </div>
                </div>
                
                <p style="text-align:center; font-size:15px; margin-bottom: 25px; color: ${btnColor};">
                    <strong>Welcome! / Bienvenue ! / Witaj!</strong><br>
                    <span style="opacity: 0.7; font-size: 13px;">Please select your language to start.<br>Veuillez choisir votre langue pour commencer.<br>Wybierz j\u0119zyk, aby rozpocz\u0105\u0107.</span>
                </p>

                <div style="display: flex; gap: 15px; justify-content: center; margin-top: 20px; flex-wrap: wrap;">
                    <button id="gft-lang-fr-btn" class="gft-tutorial-button" style="background:${btnBg}; color:${btnColor}; border:2px solid ${btnBorder}; padding:12px 20px; cursor:pointer; border-radius:8px; font-size:15px; transition:0.2s; min-width: 120px;">
                        \u{1F1EB}\u{1F1F7} Fran\xE7ais (FR)
                    </button>
                    <button id="gft-lang-en-btn" class="gft-tutorial-button" style="background:${btnBg}; color:${btnColor}; border:2px solid ${btnBorder}; padding:12px 20px; cursor:pointer; border-radius:8px; font-size:15px; transition:0.2s; min-width: 120px;">
                        \u{1F1EC}\u{1F1E7} English (EN)
                    </button>
                    <button id="gft-lang-pl-btn" class="gft-tutorial-button" style="background:${btnBg}; color:${btnColor}; border:2px solid ${btnBorder}; padding:12px 20px; cursor:pointer; border-radius:8px; font-size:15px; transition:0.2s; min-width: 120px;">
                        \u{1F1F5}\u{1F1F1} Polski (PL)
                    </button>
                </div>
            `;
            })()
          },
          {
            title: getTranslation("theme_select_title"),
            content: `
                <div style="display: flex; gap: 10px; flex-direction: column; margin-top: 20px;">
                    <button id="gft-theme-light-btn" class="gft-tutorial-button" style="background:#f0f0f0; color:#333; border:2px solid #ccc; padding:15px; cursor:pointer; border-radius:8px; font-size:16px; font-weight:bold; transition:0.2s; display:flex; justify-content:space-between; align-items:center;">
                        ${getTranslation("theme_light_btn")}
                    </button>
                    <button id="gft-theme-dark-btn" class="gft-tutorial-button" style="background:#222; color:white; border:2px solid #444; padding:15px; cursor:pointer; border-radius:8px; font-size:16px; font-weight:bold; transition:0.2s; display:flex; justify-content:space-between; align-items:center;">
                        ${getTranslation("theme_dark_btn")}
                    </button>
                </div>
            `
          },
          {
            title: `${getTranslation("onboarding_title")}! Choose your mode \u2699\uFE0F`,
            content: (() => {
              const isDark = localStorage.getItem(DARK_MODE_STORAGE_KEY) === "true";
              const btnBg = isDark ? "#333" : "#f9f9f9";
              const btnColor = isDark ? "white" : "#333";
              const btnBorder = isDark ? "#555" : "#ccc";
              return `
                <p>${getTranslation("onboarding_intro")}</p>
                <div style="display: flex; gap: 10px; flex-direction: column; margin-top: 15px;">
                    <button id="gft-mode-full-btn" class="gft-tutorial-button" style="background:${btnBg}; color:${btnColor}; border:2px solid ${btnBorder}; padding:15px 15px 15px 15px; text-align:left; cursor:pointer; border-radius:8px; position:relative; overflow:hidden;">
                        <span style="position:absolute; top:0; right:0; background:#f9ff55; color:black; font-size:10px; padding:2px 8px; font-weight:bold; border-bottom-left-radius:8px;">${getTranslation("recommended_label")}</span>
                        <div style="display:flex; justify-content:space-between; align-items:center; width:100%; margin-top: 8px;">
                            <div style="font-weight:bold; font-size:14px;">${getTranslation("mode_full_title")}</div>
                            <div style="font-size:18px; line-height: 1;">\u26A1</div>
                        </div>
                        <div style="font-size:11px; opacity:0.8; margin-top:6px; padding-right:5px;">${getTranslation("mode_full_desc")}</div>
                    </button>
                    <button id="gft-mode-simple-btn" class="gft-tutorial-button" style="background:${btnBg}; color:${btnColor}; border:2px solid ${btnBorder}; padding:15px; text-align:left; cursor:pointer; border-radius:8px;">
                         <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                            <div style="font-weight:bold; font-size:14px;">${getTranslation("mode_lyric_title")}</div>
                            <div style="font-size:18px; line-height: 1;">\u{1F3A8}</div>
                        </div>
                        <div style="font-size:11px; opacity:0.8; margin-top:4px;">${getTranslation("mode_lyric_desc")}</div>
                    </button>
                </div>
            `;
            })()
          },
          {
            title: getTranslation("tuto_step1_title"),
            content: getTranslation("tuto_step1_content")
          },
          {
            title: getTranslation("tuto_step2_title"),
            content: getTranslation("tuto_step2_content")
          },
          {
            title: getTranslation("tuto_step3_title"),
            content: getTranslation("tuto_step3_content")
          },
          {
            title: getTranslation("tuto_step4_title"),
            content: getTranslation("tuto_step4_content")
          },
          {
            title: getTranslation("tuto_step5_title"),
            content: getTranslation("tuto_step5_content")
          },
          {
            title: getTranslation("tuto_step6_title"),
            content: getTranslation("tuto_step6_content")
          },
          {
            title: getTranslation("tuto_finish_title"),
            content: getTranslation("tuto_finish_content")
          }
        ];
      }
      function showTutorial() {
        currentTutorialStep = 0;
        tutorialOverlay = document.createElement("div");
        tutorialOverlay.id = "gft-tutorial-overlay";
        tutorialOverlay.className = "gft-tutorial-overlay";
        tutorialModal = document.createElement("div");
        tutorialModal.id = "gft-tutorial-modal";
        tutorialModal.className = "gft-tutorial-modal";
        const isDarkMode = localStorage.getItem(DARK_MODE_STORAGE_KEY) === "true";
        if (isDarkMode) {
          tutorialModal.classList.add(DARK_MODE_CLASS);
        }
        document.body.appendChild(tutorialOverlay);
        document.body.appendChild(tutorialModal);
        renderTutorialStep();
      }
      function renderTutorialStep() {
        if (!tutorialModal) return;
        const steps = getTutorialSteps();
        const step = steps[currentTutorialStep];
        tutorialModal.innerHTML = "";
        const title = document.createElement("h2");
        title.className = "gft-tutorial-title";
        title.innerHTML = step.title;
        tutorialModal.appendChild(title);
        const content = document.createElement("div");
        content.className = "gft-tutorial-content";
        content.innerHTML = step.content;
        tutorialModal.appendChild(content);
        const progress = document.createElement("div");
        progress.className = "gft-tutorial-progress";
        progress.textContent = `${getTranslation("tuto_step_counter")} ${currentTutorialStep + 1} ${getTranslation("tuto_of")} ${steps.length}`;
        tutorialModal.appendChild(progress);
        const buttonsDiv = document.createElement("div");
        buttonsDiv.className = "gft-tutorial-buttons";
        if (currentTutorialStep > 2) {
          const skipButton = document.createElement("button");
          skipButton.textContent = getTranslation("tuto_skip");
          skipButton.className = "gft-tutorial-button gft-tutorial-button-skip";
          skipButton.addEventListener("click", closeTutorial);
          buttonsDiv.appendChild(skipButton);
        }
        if (currentTutorialStep > 2) {
          const prevButton = document.createElement("button");
          prevButton.textContent = `\u2190 ${getTranslation("tuto_prev")}`;
          prevButton.className = "gft-tutorial-button gft-tutorial-button-prev";
          prevButton.addEventListener("click", () => {
            currentTutorialStep--;
            renderTutorialStep();
          });
          buttonsDiv.appendChild(prevButton);
        }
        if (currentTutorialStep > 2) {
          const nextButton = document.createElement("button");
          nextButton.className = "gft-tutorial-button gft-tutorial-button-next";
          if (currentTutorialStep < steps.length - 1) {
            nextButton.textContent = `${getTranslation("tuto_next")} \u2192`;
            nextButton.addEventListener("click", () => {
              currentTutorialStep++;
              renderTutorialStep();
            });
          } else {
            nextButton.textContent = `${getTranslation("tuto_finish")} \u2713`;
            nextButton.addEventListener("click", closeTutorial);
          }
          buttonsDiv.appendChild(nextButton);
        }
        tutorialModal.appendChild(buttonsDiv);
        if (currentTutorialStep === 0) {
          const btnFr = document.getElementById("gft-lang-fr-btn");
          const btnEn = document.getElementById("gft-lang-en-btn");
          const btnPl = document.getElementById("gft-lang-pl-btn");
          const handleLangSelection = (lang) => {
            localStorage.setItem("gftLanguage", lang);
            setTranscriptionMode(lang);
            currentTutorialStep++;
            renderTutorialStep();
          };
          if (btnFr) btnFr.onclick = () => handleLangSelection("fr");
          if (btnEn) btnEn.onclick = () => handleLangSelection("en");
          if (btnPl) btnPl.onclick = () => handleLangSelection("pl");
          buttonsDiv.style.display = "none";
        } else if (currentTutorialStep === 1) {
          const lightBtn = document.getElementById("gft-theme-light-btn");
          const darkBtn = document.getElementById("gft-theme-dark-btn");
          const toggleTheme = (isDark) => {
            if (isDark) {
              document.body.classList.add(DARK_MODE_CLASS);
              localStorage.setItem(DARK_MODE_STORAGE_KEY, "true");
            } else {
              document.body.classList.remove(DARK_MODE_CLASS);
              localStorage.setItem(DARK_MODE_STORAGE_KEY, "false");
            }
            const modal = document.getElementById("gft-tutorial-modal");
            if (modal) {
              if (isDark) modal.classList.add(DARK_MODE_CLASS);
              else modal.classList.remove(DARK_MODE_CLASS);
            }
            currentTutorialStep++;
            renderTutorialStep();
          };
          if (lightBtn) lightBtn.onclick = () => toggleTheme(false);
          if (darkBtn) darkBtn.onclick = () => toggleTheme(true);
          buttonsDiv.style.display = "none";
        } else if (currentTutorialStep === 2) {
          const fullBtn = document.getElementById("gft-mode-full-btn");
          const simpleBtn = document.getElementById("gft-mode-simple-btn");
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
              localStorage.setItem("gft-tutorial-completed", "true");
              renderLyricModeTutorialEnd();
            };
          }
          buttonsDiv.style.display = "none";
        }
      }
      function renderLyricModeTutorialEnd() {
        if (!tutorialModal) return;
        tutorialModal.innerHTML = "";
        const title = document.createElement("h2");
        title.className = "gft-tutorial-title";
        title.innerHTML = getTranslation("tuto_lyric_mode_title");
        tutorialModal.appendChild(title);
        const content = document.createElement("div");
        content.className = "gft-tutorial-content";
        content.innerHTML = getTranslation("tuto_lyric_mode_content");
        tutorialModal.appendChild(content);
        const buttonsDiv = document.createElement("div");
        buttonsDiv.className = "gft-tutorial-buttons";
        const finishBtn = document.createElement("button");
        finishBtn.className = "gft-tutorial-button gft-tutorial-button-next";
        finishBtn.textContent = getTranslation("tuto_lyric_mode_btn");
        finishBtn.onclick = () => {
          closeTutorial();
          window.location.reload();
        };
        buttonsDiv.appendChild(finishBtn);
        tutorialModal.appendChild(buttonsDiv);
      }
      function closeTutorial() {
        if (tutorialOverlay && document.body.contains(tutorialOverlay)) {
          document.body.removeChild(tutorialOverlay);
        }
        if (tutorialModal && document.body.contains(tutorialModal)) {
          document.body.removeChild(tutorialModal);
        }
        tutorialOverlay = null;
        tutorialModal = null;
        markTutorialCompleted();
      }
      function addTooltip(element, text) {
        if (!element) return;
        let tooltip = null;
        element.addEventListener("mouseenter", () => {
          if (!areTooltipsEnabled()) return;
          tooltip = document.createElement("div");
          tooltip.className = "gft-tooltip";
          tooltip.textContent = text;
          const isDarkMode = localStorage.getItem(DARK_MODE_STORAGE_KEY) === "true";
          if (isDarkMode) {
            tooltip.classList.add(DARK_MODE_CLASS);
          }
          document.body.appendChild(tooltip);
          const rect = element.getBoundingClientRect();
          tooltip.style.position = "fixed";
          tooltip.style.left = `${rect.left + rect.width / 2}px`;
          tooltip.style.top = `${rect.top - 35}px`;
          tooltip.style.transform = "translateX(-50%)";
          setTimeout(() => {
            if (tooltip) tooltip.classList.add("gft-tooltip-visible");
          }, 10);
        });
        element.addEventListener("mouseleave", () => {
          if (tooltip && document.body.contains(tooltip)) {
            document.body.removeChild(tooltip);
          }
          tooltip = null;
        });
      }
      var gftYoutubePlayerState = {
        isPlaying: null,
        // null = inconnu au départ (pour éviter le double-toggle)
        currentTime: 0,
        timestamp: 0,
        // Timestamp de la dernière mise à jour du currentTime
        activeIframeSrc: null
        // Pour tracker quelle iframe est active
      };
      function getEstimatedCurrentTime() {
        if (gftYoutubePlayerState.isPlaying === true && gftYoutubePlayerState.timestamp > 0) {
          const elapsedMs = Date.now() - gftYoutubePlayerState.timestamp;
          const elapsedSeconds = elapsedMs / 1e3;
          return gftYoutubePlayerState.currentTime + elapsedSeconds;
        }
        return gftYoutubePlayerState.currentTime;
      }
      window.addEventListener("message", (event) => {
        if (event.origin.match(/^https?:\/\/(www\.)?youtube(-nocookie)?\.com$/) || event.origin.match(/^https?:\/\/(www\.)?youtu\.be$/)) {
          try {
            const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
            if (data.event === "infoDelivery" && data.info) {
              if (data.info.currentTime !== void 0) {
                gftYoutubePlayerState.currentTime = data.info.currentTime;
                gftYoutubePlayerState.timestamp = Date.now();
              }
              if (data.info.playerState !== void 0) {
                const wasPlaying = gftYoutubePlayerState.isPlaying;
                gftYoutubePlayerState.isPlaying = data.info.playerState === 1;
                if (wasPlaying === true && gftYoutubePlayerState.isPlaying === false) {
                  gftYoutubePlayerState.timestamp = Date.now();
                }
              }
            }
            if (data.event === "onReady") {
              startListeningToYoutube();
            }
          } catch (e) {
          }
        }
      });
      function startListeningToYoutube() {
        const iframes = document.querySelectorAll('iframe[src*="youtube.com"], iframe[src*="youtu.be"], iframe[src*="youtube-nocookie.com"]');
        iframes.forEach((iframe) => {
          try {
            iframe.contentWindow.postMessage(JSON.stringify({
              "event": "listening",
              "id": 1,
              "channel": "widget"
            }), "*");
            iframe.contentWindow.postMessage(JSON.stringify({
              "event": "command",
              "func": "getVideoData"
            }), "*");
          } catch (e) {
          }
        });
      }
      function enableYoutubeJsApi() {
        const iframes = document.querySelectorAll('iframe[src*="youtube.com"], iframe[src*="youtu.be"], iframe[src*="youtube-nocookie.com"]');
        iframes.forEach((iframe) => {
          try {
            if (iframe.src && !iframe.src.includes("enablejsapi=1")) {
              const separator = iframe.src.includes("?") ? "&" : "?";
              iframe.src += `${separator}enablejsapi=1`;
              console.log("[GFT] API YouTube activ\xE9e pour iframe:", iframe.src);
            }
          } catch (e) {
            console.warn("[GFT] Impossible de modifier iframe src (CORS?):", e);
          }
        });
        setTimeout(startListeningToYoutube, 1e3);
      }
      function findVisibleYoutubePlayer() {
        const iframes = document.querySelectorAll('iframe[src*="youtube.com"], iframe[src*="youtu.be"], iframe[src*="youtube-nocookie.com"]');
        for (const iframe of iframes) {
          const rect = iframe.getBoundingClientRect();
          const isVisible = rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight && rect.bottom > 0;
          if (isVisible) {
            return iframe;
          }
        }
        return iframes.length > 0 ? iframes[0] : null;
      }
      function controlYoutubePlayer(command) {
        enableYoutubeJsApi();
        const playerIframe = findVisibleYoutubePlayer();
        if (!playerIframe) {
          showFeedbackMessage("Lecteur YouTube introuvable.", 2e3);
          return;
        }
        const postCmd = (func, args) => {
          playerIframe.contentWindow.postMessage(JSON.stringify({
            "event": "command",
            "func": func,
            "args": args || []
          }), "*");
        };
        switch (command) {
          case "togglePlay":
            if (gftYoutubePlayerState.isPlaying === true) {
              postCmd("pauseVideo");
              gftYoutubePlayerState.isPlaying = false;
              showFeedbackMessage(getTranslation("feedback_pause"), 1e3);
            } else if (gftYoutubePlayerState.isPlaying === false) {
              postCmd("playVideo");
              gftYoutubePlayerState.isPlaying = true;
              gftYoutubePlayerState.timestamp = Date.now();
              showFeedbackMessage(getTranslation("feedback_play"), 1e3);
            } else {
              postCmd("pauseVideo");
              gftYoutubePlayerState.isPlaying = false;
              showFeedbackMessage("\u23F8\uFE0F Pause (Sync)", 1e3);
            }
            break;
          case "rewind":
            {
              const estimatedTime = getEstimatedCurrentTime();
              const newTime = Math.max(0, estimatedTime - 5);
              postCmd("seekTo", [newTime, true]);
              gftYoutubePlayerState.currentTime = newTime;
              gftYoutubePlayerState.timestamp = Date.now();
              showFeedbackMessage(`\u23EA -5s (${Math.floor(newTime / 60)}:${String(Math.floor(newTime % 60)).padStart(2, "0")})`, 1e3);
            }
            break;
          case "forward":
            {
              const estimatedTime = getEstimatedCurrentTime();
              const newTime = estimatedTime + 5;
              postCmd("seekTo", [newTime, true]);
              gftYoutubePlayerState.currentTime = newTime;
              gftYoutubePlayerState.timestamp = Date.now();
              showFeedbackMessage(`\u23E9 +5s (${Math.floor(newTime / 60)}:${String(Math.floor(newTime % 60)).padStart(2, "0")})`, 1e3);
            }
            break;
        }
      }
      var KEYBOARD_SHORTCUTS = {
        "Ctrl+1": "couplet",
        "Ctrl+2": "refrain",
        "Ctrl+3": "pont",
        "Ctrl+4": "intro",
        "Ctrl+5": "outro",
        "Ctrl+Shift+C": "toutCorriger",
        "Ctrl+Z": "undo",
        "Ctrl+Y": "redo",
        "Ctrl+Shift+Y": "redo",
        // Alternative pour redo
        "Ctrl+Shift+S": "toggleStats",
        "Ctrl+Alt+ ": "togglePlay",
        // Espace avec Alt
        "Ctrl+Alt+ARROWLEFT": "rewind",
        // Flèche Gauche
        "Ctrl+Alt+ARROWRIGHT": "forward"
        // Flèche Droite
      };
      function insertTagViaShortcut(tagType) {
        if (!GFT_STATE.currentActiveEditor) return;
        isButtonActionInProgress = true;
        if (GFT_STATE.autoSaveTimeout) {
          clearTimeout(GFT_STATE.autoSaveTimeout);
          GFT_STATE.autoSaveTimeout = null;
        }
        GFT_STATE.currentActiveEditor.focus();
        let textToInsert = "";
        switch (tagType) {
          case "couplet":
            textToInsert = addArtistToText(`[Couplet ${GFT_STATE.coupletCounter}]`);
            GFT_STATE.coupletCounter++;
            const coupletButton = document.getElementById(COUPLET_BUTTON_ID);
            if (coupletButton) {
              coupletButton.textContent = `[Couplet ${GFT_STATE.coupletCounter}]`;
            }
            break;
          case "refrain":
            textToInsert = addArtistToText("[Refrain]");
            break;
          case "pont":
            textToInsert = addArtistToText("[Pont]");
            break;
          case "intro":
            textToInsert = addArtistToText("[Intro]");
            break;
          case "outro":
            textToInsert = addArtistToText("[Outro]");
            break;
          default:
            isButtonActionInProgress = false;
            return;
        }
        if (textToInsert) {
          saveToHistory();
          document.execCommand("insertText", false, textToInsert);
        }
        setTimeout(() => {
          isButtonActionInProgress = false;
          if (GFT_STATE.currentActiveEditor) {
            GFT_STATE.lastSavedContent = getCurrentEditorContent();
            GFT_STATE.hasUnsavedChanges = false;
          }
        }, 150);
      }
      function triggerToutCorrigerViaShortcut() {
        const toutCorrigerButton = Array.from(document.querySelectorAll(".genius-lyrics-shortcut-button")).find((btn) => btn.textContent.includes("Tout Corriger"));
        if (toutCorrigerButton) {
          toutCorrigerButton.click();
        }
      }
      function handleKeyboardShortcut(event) {
        let shortcutKey = "";
        if (event.ctrlKey || event.metaKey) shortcutKey += "Ctrl+";
        if (event.altKey) shortcutKey += "Alt+";
        if (event.shiftKey) shortcutKey += "Shift+";
        const key = event.key.toUpperCase();
        shortcutKey += key;
        const action = KEYBOARD_SHORTCUTS[shortcutKey];
        if (!action) return;
        const GLOBAL_ACTIONS = ["togglePlay", "rewind", "forward", "toggleStats"];
        const isGlobalAction = GLOBAL_ACTIONS.includes(action);
        if (isGlobalAction) {
          if (!GFT_STATE.currentActiveEditor && !document.querySelector(SELECTORS.CONTROLS_STICKY_SECTION)) {
            return;
          }
        } else {
          if (!GFT_STATE.currentActiveEditor) return;
          if (document.activeElement !== GFT_STATE.currentActiveEditor) return;
        }
        event.preventDefault();
        event.stopPropagation();
        switch (action) {
          case "couplet":
          case "refrain":
          case "pont":
          case "intro":
          case "outro":
            insertTagViaShortcut(action);
            visualFeedback(action);
            break;
          case "toutCorriger":
            triggerToutCorrigerViaShortcut();
            visualFeedback("fix-all");
            break;
          case "undo":
            undoLastChange();
            visualFeedback("undo");
            break;
          case "redo":
            redoLastChange();
            visualFeedback("redo");
            break;
          case "toggleStats":
            toggleStatsDisplay();
            break;
          case "togglePlay":
          case "rewind":
          case "forward":
            controlYoutubePlayer(action);
            break;
        }
      }
      function visualFeedback(action) {
        let btn = null;
        if (action === "couplet" || action === "refrain" || action === "pont" || action === "intro" || action === "outro") {
          const buttons = document.querySelectorAll(".genius-lyrics-shortcut-button");
          for (const b of buttons) {
            if (b.textContent.toLowerCase().includes(action.toLowerCase())) {
              btn = b;
              break;
            }
          }
        } else if (action === "fix-all") {
          btn = document.querySelector(".gft-btn-main-action");
        } else if (action === "undo") {
          btn = document.getElementById("gft-undo-btn");
        } else if (action === "redo") {
          btn = document.getElementById("gft-redo-btn");
        }
        if (btn) {
          btn.classList.add("gft-shortcut-feedback");
          setTimeout(() => btn.classList.remove("gft-shortcut-feedback"), 300);
        }
      }
      function visualFeedbackAutoSave() {
        const indicator = document.getElementById("gft-autosave-dot");
        if (indicator) {
          indicator.classList.add("gft-autosave-flash");
          setTimeout(() => indicator.classList.remove("gft-autosave-flash"), 1e3);
        }
      }
      function applySearchReplace(findText, replaceText, isRegex, replaceAll) {
        if (!findText) {
          showFeedbackMessage(getTranslation("feedback_select_text_first") || "Enter text to find");
          return;
        }
        if (!GFT_STATE.currentActiveEditor) return;
        saveToHistory();
        const currentText = getCurrentEditorContent();
        let newText = "";
        let count = 0;
        try {
          let pattern;
          if (isRegex) {
            pattern = new RegExp(findText, replaceAll ? "g" : "");
          } else {
            const escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            pattern = new RegExp(escaped, replaceAll ? "g" : "");
          }
          if (replaceAll) {
            const matches = currentText.match(pattern);
            count = matches ? matches.length : 0;
            newText = currentText.replace(pattern, replaceText);
          } else {
            newText = currentText.replace(pattern, replaceText);
            count = newText !== currentText ? 1 : 0;
          }
          if (count > 0) {
            setEditorContent(newText);
            showFeedbackMessage(getTranslation("feedback_replaced").replace("{count}", count).replace("{item}", findText));
          } else {
            showFeedbackMessage(getTranslation("feedback_no_replacement"));
          }
        } catch (e) {
          console.error("Find/Replace Error:", e);
          showFeedbackMessage("Error: " + e.message);
        }
      }
      function getTextareaCaretPosition(textarea, selectionPoint) {
        const div = document.createElement("div");
        const computed = window.getComputedStyle(textarea);
        const properties = [
          "boxSizing",
          "width",
          "height",
          "overflowX",
          "overflowY",
          "borderTopWidth",
          "borderRightWidth",
          "borderBottomWidth",
          "borderLeftWidth",
          "paddingTop",
          "paddingRight",
          "paddingBottom",
          "paddingLeft",
          "fontStyle",
          "fontVariant",
          "fontWeight",
          "fontStretch",
          "fontSize",
          "fontSizeAdjust",
          "lineHeight",
          "fontFamily",
          "textAlign",
          "textTransform",
          "textIndent",
          "textDecoration",
          "letterSpacing",
          "wordSpacing",
          "tabSize",
          "whiteSpace",
          "wordBreak",
          "wordWrap"
        ];
        properties.forEach((prop) => {
          div.style[prop] = computed[prop];
        });
        div.style.position = "absolute";
        div.style.visibility = "hidden";
        div.style.whiteSpace = "pre-wrap";
        div.style.wordWrap = "break-word";
        div.style.overflow = "hidden";
        div.style.top = "0px";
        div.style.left = "0px";
        document.body.appendChild(div);
        const textBeforeCaret = textarea.value.substring(0, selectionPoint);
        div.textContent = textBeforeCaret;
        const span = document.createElement("span");
        span.textContent = textarea.value.substring(selectionPoint) || ".";
        div.appendChild(span);
        const spanRect = span.getBoundingClientRect();
        const divRect = div.getBoundingClientRect();
        const relativeTop = spanRect.top - divRect.top;
        const relativeLeft = spanRect.left - divRect.left;
        document.body.removeChild(div);
        return {
          top: relativeTop - textarea.scrollTop,
          left: relativeLeft - textarea.scrollLeft,
          height: spanRect.height
        };
      }
      function showFloatingToolbar() {
        if (!GFT_STATE.floatingFormattingToolbar) {
          createFloatingFormattingToolbar();
        }
        let rect;
        let selectedText = "";
        if (GFT_STATE.currentActiveEditor) {
          Array.from(GFT_STATE.floatingFormattingToolbar.children).forEach((child) => child.style.display = "");
          if (GFT_STATE.currentEditorType === "textarea") {
            const textareaRect = GFT_STATE.currentActiveEditor.getBoundingClientRect();
            const start = GFT_STATE.currentActiveEditor.selectionStart;
            const end = GFT_STATE.currentActiveEditor.selectionEnd;
            if (start === end) {
              hideFloatingToolbar();
              return;
            }
            selectedText = GFT_STATE.currentActiveEditor.value.substring(start, end);
            const startPos = getTextareaCaretPosition(GFT_STATE.currentActiveEditor, start);
            rect = {
              left: textareaRect.left + startPos.left,
              top: textareaRect.top + startPos.top,
              width: 100,
              // Largeur arbitraire pour centrer la barre
              height: startPos.height
            };
          } else {
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
          Array.from(GFT_STATE.floatingFormattingToolbar.children).forEach((child) => {
            if (child.classList.contains("gft-lyric-card-btn")) {
              child.style.display = "";
            } else {
              child.style.display = "none";
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
        const isNumber = isValidNumber(selectedText);
        const numberButton = GFT_STATE.floatingFormattingToolbar.querySelector(".gft-number-button");
        if (numberButton) {
          if (isNumber && GFT_STATE.currentActiveEditor) {
            numberButton.style.display = "inline-block";
          } else {
            numberButton.style.display = "none";
          }
        }
        GFT_STATE.floatingFormattingToolbar.style.display = "flex";
        GFT_STATE.floatingFormattingToolbar.style.visibility = "visible";
        GFT_STATE.floatingFormattingToolbar.style.opacity = "1";
        GFT_STATE.floatingFormattingToolbar.style.position = "fixed";
        const toolbarWidth = GFT_STATE.floatingFormattingToolbar.offsetWidth || 150;
        const toolbarHeight = GFT_STATE.floatingFormattingToolbar.offsetHeight || 40;
        const left = rect.left + rect.width / 2 - toolbarWidth / 2;
        const top = rect.top - toolbarHeight - 8;
        GFT_STATE.floatingFormattingToolbar.style.left = `${Math.max(10, left)}px`;
        GFT_STATE.floatingFormattingToolbar.style.top = `${Math.max(10, top)}px`;
      }
      function hideFloatingToolbar() {
        if (GFT_STATE.floatingFormattingToolbar) {
          GFT_STATE.floatingFormattingToolbar.style.display = "none";
        }
      }
      function handleSelectionChange() {
        if (GFT_STATE.currentActiveEditor) {
          let hasSelection = false;
          if (GFT_STATE.currentEditorType === "textarea") {
            const start = GFT_STATE.currentActiveEditor.selectionStart;
            const end = GFT_STATE.currentActiveEditor.selectionEnd;
            hasSelection = start !== end && document.activeElement === GFT_STATE.currentActiveEditor;
          } else {
            const selection = window.getSelection();
            if (!selection.rangeCount) {
              hideFloatingToolbar();
              return;
            }
            const range = selection.getRangeAt(0);
            const container = range.commonAncestorContainer;
            let isInEditor = false;
            if (GFT_STATE.currentActiveEditor.contains(container) || container.nodeType === Node.ELEMENT_NODE && container === GFT_STATE.currentActiveEditor) {
              isInEditor = true;
            } else if (container.parentNode && GFT_STATE.currentActiveEditor.contains(container.parentNode)) {
              isInEditor = true;
            }
            hasSelection = isInEditor && !selection.isCollapsed;
          }
          if (hasSelection) {
            if (GFT_STATE.floatingFormattingToolbar) {
              if (isLyricCardOnlyMode()) {
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
          const selection = window.getSelection();
          if (!selection || selection.isCollapsed || selection.toString().trim().length === 0) {
            hideFloatingToolbar();
            return;
          }
          const isSongPage = document.querySelector('meta[property="og:type"][content="music.song"]') !== null;
          if (isSongPage) {
            const range = selection.getRangeAt(0);
            const container = range.commonAncestorContainer;
            const lyricsContainer = document.querySelector(SELECTORS.LYRICS_CONTAINER);
            if (lyricsContainer) {
              if (lyricsContainer.contains(container)) {
                setTimeout(showFloatingToolbar, 50);
              } else {
                hideFloatingToolbar();
              }
            } else {
              let parent = container.nodeType === Node.ELEMENT_NODE ? container : container.parentNode;
              let isLyrics = false;
              while (parent && parent !== document.body) {
                if (parent.className && typeof parent.className === "string" && parent.className.includes("Lyrics__Container")) {
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
      function initLyricsEditorEnhancer() {
        let foundEditor = null;
        let foundEditorType = null;
        const getStructuralTags = () => {
          const isEnglish = isEnglishTranscriptionMode();
          const isPolish = isPolishTranscriptionMode2();
          const customButtons = getCustomButtons().filter((b) => b.type === "structure").map((b) => ({
            label: b.label,
            getText: () => {
              if (b.content.trim().startsWith("[")) return addArtistToText(b.content);
              return b.content;
            },
            tooltip: "Custom: " + b.label
          }));
          const plusButton = {
            label: "+",
            title: getTranslation("btn_add_custom_structure_title"),
            isPlusButton: true,
            managerType: "structure"
          };
          if (isPolish) {
            return {
              buttons: [
                {
                  type: "coupletManager",
                  prev: { label: "\u2190", title: getTranslation("btn_prev_couplet_title"), tooltip: getTranslation("btn_prev_couplet_tooltip") },
                  main: {
                    id: COUPLET_BUTTON_ID,
                    getLabel: () => `[Zwrotka ${GFT_STATE.coupletCounter}]`,
                    getText: () => addArtistToText(`[Zwrotka ${GFT_STATE.coupletCounter}]`),
                    tooltip: getTranslation("add_couplet"),
                    shortcut: "1"
                  },
                  next: { label: "\u2192", title: getTranslation("btn_next_couplet_title"), tooltip: getTranslation("btn_next_couplet_tooltip") }
                },
                { label: getTranslation("btn_intro"), getText: () => addArtistToText("[Intro]"), tooltip: getTranslation("btn_intro_tooltip"), shortcut: "4" },
                { label: getTranslation("btn_verse"), getText: () => addArtistToText("[Zwrotka]"), tooltip: getTranslation("btn_verse_tooltip") },
                { label: getTranslation("btn_pre_chorus"), getText: () => addArtistToText("[Przedrefren]"), tooltip: getTranslation("btn_pre_chorus_tooltip") },
                { label: getTranslation("btn_chorus"), getText: () => addArtistToText("[Refren]"), tooltip: getTranslation("btn_chorus_tooltip"), shortcut: "2" },
                { label: getTranslation("btn_hook"), getText: () => addArtistToText("[Przy\u015Bpiewka]"), tooltip: getTranslation("btn_hook_tooltip") },
                { label: getTranslation("btn_post_chorus"), getText: () => addArtistToText("[Zarefren]"), tooltip: getTranslation("btn_post_chorus_tooltip") },
                { label: getTranslation("btn_bridge"), getText: () => addArtistToText("[Przej\u015Bcie]"), tooltip: getTranslation("btn_bridge_tooltip"), shortcut: "3" },
                { label: getTranslation("btn_outro"), getText: () => addArtistToText("[Outro]"), tooltip: getTranslation("btn_outro_tooltip"), shortcut: "5" },
                { label: getTranslation("btn_instrumental"), getText: () => formatSimpleTag("[Przerwa instrumentalna]"), tooltip: getTranslation("btn_instrumental_tooltip") },
                { label: getTranslation("btn_interlude"), getText: () => addArtistToText("[Interludium]"), tooltip: getTranslation("btn_interlude_tooltip") },
                { label: getTranslation("btn_part"), getText: () => addArtistToText("[Cz\u0119\u015B\u0107]"), tooltip: getTranslation("btn_part_tooltip") },
                { label: getTranslation("btn_skit"), getText: () => formatSimpleTag("[Skit]"), tooltip: getTranslation("btn_skit_tooltip") },
                { label: getTranslation("btn_vocalization"), getText: () => addArtistToText("[Wokaliza]"), tooltip: getTranslation("btn_vocalization_tooltip") },
                { label: getTranslation("btn_unknown"), getText: () => formatSimpleTag("[?]", true), tooltip: getTranslation("btn_unknown_tooltip") },
                ...customButtons,
                plusButton
              ]
            };
          } else if (isEnglish) {
            return {
              buttons: [
                {
                  type: "coupletManager",
                  prev: { label: "\u2190", title: getTranslation("btn_prev_couplet_title"), tooltip: getTranslation("btn_prev_couplet_tooltip") },
                  main: {
                    id: COUPLET_BUTTON_ID,
                    getLabel: () => `[Verse ${GFT_STATE.coupletCounter}]`,
                    getText: () => addArtistToText(`[Verse ${GFT_STATE.coupletCounter}]`),
                    tooltip: getTranslation("add_couplet"),
                    shortcut: "1"
                  },
                  next: { label: "\u2192", title: getTranslation("btn_next_couplet_title"), tooltip: getTranslation("btn_next_couplet_tooltip") }
                },
                { label: getTranslation("btn_intro"), getText: () => addArtistToText("[Intro]"), tooltip: getTranslation("btn_intro_tooltip"), shortcut: "4" },
                { label: getTranslation("btn_pre_chorus"), getText: () => addArtistToText("[Pre-Chorus]"), tooltip: getTranslation("btn_pre_chorus_tooltip") },
                { label: getTranslation("btn_chorus"), getText: () => addArtistToText("[Chorus]"), tooltip: getTranslation("btn_chorus_tooltip"), shortcut: "2" },
                { label: getTranslation("btn_post_chorus"), getText: () => addArtistToText("[Post-Chorus]"), tooltip: getTranslation("btn_post_chorus_tooltip") },
                { label: getTranslation("btn_bridge"), getText: () => addArtistToText("[Bridge]"), tooltip: getTranslation("btn_bridge_tooltip"), shortcut: "3" },
                { label: getTranslation("btn_outro"), getText: () => addArtistToText("[Outro]"), tooltip: getTranslation("btn_outro_tooltip"), shortcut: "5" },
                { label: getTranslation("btn_instrumental"), getText: () => formatSimpleTag("[Instrumental]"), tooltip: getTranslation("btn_instrumental_tooltip") },
                { label: getTranslation("btn_unknown"), getText: () => formatSimpleTag("[?]", true), tooltip: getTranslation("btn_unknown_tooltip") },
                ...customButtons,
                plusButton
              ]
            };
          } else {
            return {
              buttons: [
                { label: getTranslation("btn_header"), getText: () => {
                  let txt = `[Paroles de "${GFT_STATE.currentSongTitle}"`;
                  const fts = formatArtistList(GFT_STATE.currentFeaturingArtists);
                  if (fts && isHeaderFeatEnabled()) txt += ` ft. ${fts}`;
                  txt += "]";
                  if (!isTagNewlinesDisabled()) txt += "\n";
                  return txt;
                }, tooltip: getTranslation("btn_header_tooltip") },
                {
                  type: "coupletManager",
                  prev: { label: "\u2190", title: getTranslation("btn_prev_couplet_title"), tooltip: getTranslation("btn_prev_couplet_tooltip") },
                  main: {
                    id: COUPLET_BUTTON_ID,
                    getLabel: () => `[Couplet ${GFT_STATE.coupletCounter}]`,
                    getText: () => addArtistToText(`[Couplet ${GFT_STATE.coupletCounter}]`),
                    tooltip: getTranslation("add_couplet"),
                    shortcut: "1"
                  },
                  next: { label: "\u2192", title: getTranslation("btn_next_couplet_title"), tooltip: getTranslation("btn_next_couplet_tooltip") }
                },
                { label: getTranslation("btn_intro"), getText: () => addArtistToText("[Intro]"), tooltip: getTranslation("btn_intro_tooltip"), shortcut: "4" },
                { label: getTranslation("btn_verse_unique"), getText: () => addArtistToText("[Couplet unique]"), tooltip: getTranslation("btn_verse_unique_tooltip") },
                { label: getTranslation("btn_verse"), getText: () => addArtistToText("[Couplet]"), tooltip: getTranslation("btn_verse_tooltip") },
                { label: getTranslation("btn_pre_chorus"), getText: () => addArtistToText("[Pr\xE9-refrain]"), tooltip: getTranslation("btn_pre_chorus_tooltip") },
                { label: getTranslation("btn_chorus"), getText: () => addArtistToText("[Refrain]"), tooltip: getTranslation("btn_chorus_tooltip"), shortcut: "2" },
                { label: getTranslation("btn_post_chorus"), getText: () => addArtistToText("[Post-refrain]"), tooltip: getTranslation("btn_post_chorus_tooltip") },
                { label: getTranslation("btn_bridge"), getText: () => addArtistToText("[Pont]"), tooltip: getTranslation("btn_bridge_tooltip"), shortcut: "3" },
                { label: getTranslation("btn_outro"), getText: () => addArtistToText("[Outro]"), tooltip: getTranslation("btn_outro_tooltip"), shortcut: "5" },
                { label: getTranslation("btn_instrumental"), getText: () => formatSimpleTag("[Instrumental]"), tooltip: getTranslation("btn_instrumental_tooltip") },
                { label: getTranslation("btn_unknown"), getText: () => formatSimpleTag("[?]", true), tooltip: getTranslation("btn_unknown_tooltip") },
                ...customButtons,
                plusButton
              ]
            };
          }
        };
        const getTextCleanupTools = () => {
          const isEnglish = isEnglishTranscriptionMode();
          const isPolish = isPolishTranscriptionMode2();
          const customButtons = getCustomButtons().filter((b) => b.type === "cleanup").map((b) => ({
            label: b.label,
            action: "replaceText",
            searchPattern: new RegExp(b.regex, b.isCaseSensitive ? "g" : "gi"),
            replacementText: b.replacement || "",
            highlightClass: LYRICS_HELPER_HIGHLIGHT_CLASS,
            tooltip: "Custom: " + b.label
          }));
          const plusButton = {
            label: "+",
            title: getTranslation("btn_add_custom_cleanup_title"),
            isPlusButton: true,
            managerType: "cleanup"
          };
          const commonTools = [
            {
              label: getTranslation("btn_apostrophe_label"),
              action: "replaceText",
              searchPattern: /['']/g,
              replacementText: "'",
              highlightClass: LYRICS_HELPER_HIGHLIGHT_CLASS,
              tooltip: getTranslation("cleanup_apostrophe_tooltip"),
              feedbackKey: "preview_stat_apostrophes"
            },
            {
              label: getTranslation("btn_french_quotes_label"),
              action: "replaceText",
              searchPattern: /[«»]/g,
              replacementText: '"',
              highlightClass: LYRICS_HELPER_HIGHLIGHT_CLASS,
              tooltip: getTranslation("cleanup_french_quotes_tooltip"),
              feedbackKey: "preview_stat_quotes"
            },
            {
              label: getTranslation("btn_double_spaces_label"),
              action: "replaceText",
              searchPattern: /  +/g,
              replacementText: " ",
              highlightClass: LYRICS_HELPER_HIGHLIGHT_CLASS,
              tooltip: getTranslation("cleanup_double_spaces_tooltip"),
              feedbackKey: "preview_stat_spaces"
            },
            {
              label: getTranslation("btn_zws_remove"),
              action: "replaceText",
              searchPattern: /[\u200B\u200C\u200D\uFEFF]/g,
              replacementText: "",
              highlightClass: LYRICS_HELPER_HIGHLIGHT_CLASS,
              tooltip: getTranslation("btn_zws_remove_tooltip")
            },
            {
              label: getTranslation("btn_duplicate_line_label"),
              action: "duplicateLine",
              tooltip: getTranslation("cleanup_duplicate_line_tooltip"),
              shortcut: "D"
            },
            {
              label: getTranslation("btn_spacing_label"),
              shortLabel: getTranslation("btn_spacing_short"),
              action: "lineCorrection",
              correctionType: "spacing",
              title: getTranslation("cleanup_spacing_tooltip"),
              tooltip: getTranslation("cleanup_spacing_tooltip"),
              feedbackKey: "preview_stat_spacing"
            },
            {
              label: getTranslation("btn_check_label"),
              action: "checkBrackets",
              title: getTranslation("global_check_tooltip"),
              tooltip: getTranslation("global_check_tooltip"),
              shortcut: "S"
            }
          ];
          if (isPolish) {
            const polishSpecificTools = [
              {
                label: getTranslation("btn_polish_quotes_label"),
                action: "replaceText",
                searchPattern: /[„""]/g,
                // Polish quotes „" and curly quotes ""
                replacementText: '"',
                highlightClass: LYRICS_HELPER_HIGHLIGHT_CLASS,
                tooltip: getTranslation("cleanup_polish_quotes_tooltip"),
                feedbackKey: "preview_stat_polish_quotes"
              },
              {
                label: getTranslation("btn_em_dash_label"),
                action: "replaceText",
                searchPattern: /(?<!\-)\-(?!\-)/g,
                // Single hyphen (not part of --)
                replacementText: "\u2014",
                highlightClass: LYRICS_HELPER_HIGHLIGHT_CLASS,
                tooltip: getTranslation("cleanup_em_dash_tooltip"),
                feedbackKey: "preview_stat_dash"
              },
              {
                label: getTranslation("btn_ellipsis_label"),
                action: "replaceText",
                searchPattern: /\.{3}/g,
                // Three dots
                replacementText: "\u2026",
                highlightClass: LYRICS_HELPER_HIGHLIGHT_CLASS,
                tooltip: getTranslation("cleanup_ellipsis_tooltip"),
                feedbackKey: "preview_stat_ellipsis"
              },
              {
                label: getTranslation("btn_orphans_label"),
                action: "replaceText",
                searchPattern: /\b([WwZzOoUuIiAa])\s+/g,
                replacementText: "$1\xA0",
                highlightClass: LYRICS_HELPER_HIGHLIGHT_CLASS,
                tooltip: getTranslation("cleanup_orphans_tooltip"),
                feedbackKey: "preview_stat_orphans"
              }
            ];
            return [...polishSpecificTools, ...commonTools, ...customButtons, plusButton];
          } else if (isEnglish) {
            return [...commonTools, ...customButtons, plusButton];
          } else {
            const frenchSpecificTools = [
              {
                label: getTranslation("btn_y_label"),
                action: "replaceText",
                searchPattern: /\b(Y|y)['']/g,
                replacementFunction: (match, firstLetter) => firstLetter === "Y" ? "Y " : "y ",
                highlightClass: LYRICS_HELPER_HIGHLIGHT_CLASS,
                tooltip: getTranslation("cleanup_y_tooltip"),
                feedbackKey: "preview_stat_yprime"
              },
              {
                label: getTranslation("btn_oeu_label"),
                action: "replaceText",
                searchPattern: /([Oo])eu/g,
                replacementFunction: (match, firstLetter) => firstLetter === "O" ? "\u0152u" : "\u0153u",
                highlightClass: LYRICS_HELPER_HIGHLIGHT_CLASS,
                tooltip: getTranslation("cleanup_oeu_tooltip"),
                feedbackKey: "preview_stat_oeu"
              },
              {
                label: getTranslation("btn_long_dash_label"),
                action: "replaceText",
                searchPattern: /[—–]/g,
                replacementText: "-",
                highlightClass: LYRICS_HELPER_HIGHLIGHT_CLASS,
                tooltip: getTranslation("cleanup_long_dash_tooltip"),
                feedbackKey: "preview_stat_dash"
              }
            ];
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
              label: getTranslation("btn_fix_all_label"),
              // Tout Corriger (Texte)
              shortLabel: getTranslation("btn_fix_all_short"),
              // ✨ Tout Corriger
              action: "globalTextFix",
              title: getTranslation("global_fix_tooltip"),
              tooltip: getTranslation("global_fix_tooltip"),
              shortcut: "C"
            }
          ]
        };
        const textareaEditor = document.querySelector(SELECTORS.TEXTAREA_EDITOR);
        const divEditor = document.querySelector(SELECTORS.DIV_EDITOR);
        const isVisible = (el) => !!(el && (el.offsetParent !== null || el.getClientRects().length > 0));
        if (divEditor && isVisible(divEditor)) {
          foundEditor = divEditor;
          foundEditorType = "div";
        } else if (textareaEditor && isVisible(textareaEditor)) {
          foundEditor = textareaEditor;
          foundEditorType = "textarea";
        } else {
          if (divEditor) {
            foundEditor = divEditor;
            foundEditorType = "div";
          } else if (textareaEditor) {
            foundEditor = textareaEditor;
            foundEditorType = "textarea";
          }
        }
        if (foundEditor && !document.body.contains(foundEditor)) {
          foundEditor = null;
          foundEditorType = null;
        }
        const editorJustAppeared = foundEditor && !GFT_STATE.currentActiveEditor;
        const editorJustDisappeared = !foundEditor && GFT_STATE.currentActiveEditor;
        const editorInstanceChanged = foundEditor && GFT_STATE.currentActiveEditor && foundEditor !== GFT_STATE.currentActiveEditor;
        if (editorJustAppeared || editorInstanceChanged) {
          GFT_STATE.currentActiveEditor = foundEditor;
          GFT_STATE.currentEditorType = foundEditorType;
          extractSongData();
          hideGeniusFormattingHelper();
          if (GFT_STATE.shortcutsContainerElement) {
            GFT_STATE.shortcutsContainerElement.remove();
            GFT_STATE.shortcutsContainerElement = null;
          }
          setTimeout(checkAndRestoreDraft, 1e3);
          GFT_STATE.undoStack = [];
          GFT_STATE.redoStack = [];
          GFT_STATE.lastSavedContent = "";
          GFT_STATE.hasUnsavedChanges = false;
          if (GFT_STATE.autoSaveTimeout) {
            clearTimeout(GFT_STATE.autoSaveTimeout);
            GFT_STATE.autoSaveTimeout = null;
          }
          createFloatingFormattingToolbar();
          if (GFT_STATE.currentEditorType === "textarea") {
            GFT_STATE.currentActiveEditor.addEventListener("select", handleSelectionChange);
            GFT_STATE.currentActiveEditor.addEventListener("mouseup", handleSelectionChange);
            GFT_STATE.currentActiveEditor.addEventListener("scroll", hideFloatingToolbar);
          }
          GFT_STATE.currentActiveEditor.addEventListener("input", debouncedStatsUpdate);
          GFT_STATE.currentActiveEditor.addEventListener("input", autoSaveToHistory);
          setTimeout(() => updateStatsDisplay(), 500);
          setTimeout(() => {
            const initialContent = getCurrentEditorContent();
            if (initialContent && initialContent.trim().length > 0) {
              GFT_STATE.lastSavedContent = initialContent;
              if (GFT_STATE.undoStack.length === 0 || GFT_STATE.undoStack[GFT_STATE.undoStack.length - 1] !== initialContent) {
                GFT_STATE.undoStack.push(initialContent);
                updateHistoryButtons();
              }
            }
          }, 500);
        } else if (editorJustDisappeared) {
          GFT_STATE.currentActiveEditor = null;
          GFT_STATE.currentEditorType = null;
          hideFloatingToolbar();
          GFT_STATE.undoStack = [];
          GFT_STATE.redoStack = [];
          GFT_STATE.lastSavedContent = "";
          GFT_STATE.hasUnsavedChanges = false;
          if (GFT_STATE.autoSaveTimeout) {
            clearTimeout(GFT_STATE.autoSaveTimeout);
            GFT_STATE.autoSaveTimeout = null;
          }
        }
        GFT_STATE.shortcutsContainerElement = document.getElementById(SHORTCUTS_CONTAINER_ID);
        if (editorJustDisappeared && GFT_STATE.shortcutsContainerElement) {
          GFT_STATE.shortcutsContainerElement.remove();
          GFT_STATE.shortcutsContainerElement = null;
          return;
        }
        if (foundEditor) {
          const targetStickySection = document.querySelector(SELECTORS.CONTROLS_STICKY_SECTION);
          if (targetStickySection) {
            if (isLyricCardOnlyMode()) {
              if (GFT_STATE.shortcutsContainerElement) {
                GFT_STATE.shortcutsContainerElement.remove();
                GFT_STATE.shortcutsContainerElement = null;
              }
              if (editorJustAppeared || editorInstanceChanged) {
                extractSongData();
                hideGeniusFormattingHelper();
              }
              return;
            }
            if (!GFT_STATE.shortcutsContainerElement || editorInstanceChanged || editorJustAppeared) {
              if (GFT_STATE.shortcutsContainerElement) GFT_STATE.shortcutsContainerElement.remove();
              GFT_STATE.shortcutsContainerElement = document.createElement("div");
              GFT_STATE.shortcutsContainerElement.id = SHORTCUTS_CONTAINER_ID;
              const isDarkMode = localStorage.getItem(DARK_MODE_STORAGE_KEY) === "true";
              const panelTitle = document.createElement("div");
              panelTitle.id = "gftPanelTitle";
              const clickableTitleArea = document.createElement("span");
              clickableTitleArea.id = "gft-clickable-title";
              clickableTitleArea.style.cursor = "pointer";
              clickableTitleArea.style.display = "inline-flex";
              clickableTitleArea.style.alignItems = "center";
              clickableTitleArea.style.userSelect = "none";
              const logoURL = chrome.runtime.getURL("images/icon16.png");
              const collapseArrow = document.createElement("span");
              collapseArrow.id = "gft-collapse-arrow";
              collapseArrow.style.marginLeft = "5px";
              collapseArrow.style.fontSize = "12px";
              collapseArrow.style.transition = "transform 0.3s ease";
              const isCollapsed = localStorage.getItem(PANEL_COLLAPSED_STORAGE_KEY) === "true";
              collapseArrow.textContent = isCollapsed ? "\u25BC" : "\u25B2";
              clickableTitleArea.innerHTML = `<img src="${logoURL}" alt="${getTranslation("panel_title_img_alt")}" id="gftPanelLogo" /> <span style="font-weight:bold;">${getTranslation("panel_title")}</span>`;
              clickableTitleArea.appendChild(collapseArrow);
              const togglePanel = (e) => {
                if (e) {
                  e.preventDefault();
                  e.stopPropagation();
                }
                const contentWrapper = document.getElementById("gft-panel-content");
                if (contentWrapper) {
                  contentWrapper.classList.toggle("gft-collapsed");
                  const currentlyCollapsed = contentWrapper.classList.contains("gft-collapsed");
                  document.getElementById("gft-collapse-arrow").textContent = currentlyCollapsed ? "\u25BC" : "\u25B2";
                  localStorage.setItem(PANEL_COLLAPSED_STORAGE_KEY, currentlyCollapsed ? "true" : "false");
                }
              };
              clickableTitleArea.addEventListener("click", togglePanel);
              panelTitle.appendChild(clickableTitleArea);
              const saveIndicator = document.createElement("span");
              saveIndicator.id = "gft-autosave-dot";
              saveIndicator.className = "gft-autosave-indicator";
              saveIndicator.textContent = "\u{1F4BE}";
              saveIndicator.title = getTranslation("draft_saved_at") || "Draft saved";
              panelTitle.appendChild(saveIndicator);
              addTooltip(clickableTitleArea, "Cliquer pour replier/d\xE9plier");
              const transcriptionModeSelect = document.createElement("select");
              transcriptionModeSelect.id = "gft-transcription-mode-select";
              transcriptionModeSelect.classList.add("gft-transcription-mode-select");
              transcriptionModeSelect.title = getTranslation("mode_select_title") || "Transcription mode";
              const optionFR = document.createElement("option");
              optionFR.value = "fr";
              optionFR.textContent = "FR";
              transcriptionModeSelect.appendChild(optionFR);
              const optionEN = document.createElement("option");
              optionEN.value = "en";
              optionEN.textContent = "EN";
              transcriptionModeSelect.appendChild(optionEN);
              const optionPL = document.createElement("option");
              optionPL.value = "pl";
              optionPL.textContent = "PL";
              transcriptionModeSelect.appendChild(optionPL);
              transcriptionModeSelect.value = getTranscriptionMode();
              transcriptionModeSelect.addEventListener("change", (e) => {
                const newMode = e.target.value;
                setTranscriptionMode(newMode);
                localStorage.setItem("gftLanguage", newMode);
                window.location.reload();
              });
              panelTitle.appendChild(transcriptionModeSelect);
              addTooltip(transcriptionModeSelect, getTranslation("lang_select_title") || "Change transcription mode");
              const undoButton = document.createElement("button");
              undoButton.id = "gft-undo-button";
              undoButton.textContent = "\u21A9";
              undoButton.title = getTranslation("undo_tooltip");
              undoButton.classList.add("genius-lyrics-shortcut-button");
              undoButton.disabled = true;
              undoButton.style.opacity = "0.5";
              undoButton.addEventListener("click", (event) => {
                event.preventDefault();
                undoLastChange();
              });
              panelTitle.appendChild(undoButton);
              addTooltip(undoButton, getTranslation("undo_tooltip"));
              const redoButton = document.createElement("button");
              redoButton.id = "gft-redo-button";
              redoButton.textContent = "\u21AA";
              redoButton.title = getTranslation("redo_tooltip");
              redoButton.classList.add("genius-lyrics-shortcut-button");
              redoButton.disabled = true;
              redoButton.style.opacity = "0.5";
              redoButton.addEventListener("click", (event) => {
                event.preventDefault();
                redoLastChange();
              });
              panelTitle.appendChild(redoButton);
              addTooltip(redoButton, getTranslation("redo_tooltip"));
              const settingsButton = document.createElement("button");
              settingsButton.id = "gft-settings-button";
              settingsButton.textContent = "\u2699\uFE0F";
              settingsButton.title = getTranslation("settings_menu");
              settingsButton.classList.add("genius-lyrics-shortcut-button");
              settingsButton.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();
                const existingMenu = document.getElementById("gft-settings-menu");
                if (existingMenu) {
                  existingMenu.remove();
                  return;
                }
                const menu = document.createElement("div");
                menu.id = "gft-settings-menu";
                menu.className = "gft-settings-menu";
                const rect = settingsButton.getBoundingClientRect();
                menu.style.top = `${rect.bottom + 5}px`;
                menu.style.left = `${rect.left}px`;
                const darkModeItem = document.createElement("button");
                darkModeItem.className = "gft-settings-menu-item";
                darkModeItem.textContent = document.body.classList.contains("gft-dark-mode") ? getTranslation("dark_mode_toggle_light") : getTranslation("dark_mode_toggle_dark");
                darkModeItem.onclick = () => {
                  gftToggleDarkMode();
                  menu.remove();
                };
                menu.appendChild(darkModeItem);
                const statsItem = document.createElement("button");
                statsItem.className = "gft-settings-menu-item";
                const areStatsVisible = document.getElementById("gft-stats-display")?.classList.contains("gft-stats-visible");
                statsItem.textContent = areStatsVisible ? getTranslation("stats_hide") : getTranslation("stats_show");
                statsItem.onclick = () => {
                  toggleStatsDisplay();
                  menu.remove();
                };
                menu.appendChild(statsItem);
                if (!isEnglishTranscriptionMode()) {
                  const featItem = document.createElement("button");
                  featItem.className = "gft-settings-menu-item";
                  featItem.textContent = isHeaderFeatEnabled() ? getTranslation("header_feat_hide") : getTranslation("header_feat_show");
                  featItem.onclick = () => {
                    gftToggleHeaderFeat();
                    menu.remove();
                  };
                  menu.appendChild(featItem);
                }
                const newlineItem = document.createElement("button");
                newlineItem.className = "gft-settings-menu-item";
                newlineItem.textContent = !isTagNewlinesDisabled() ? getTranslation("newline_enable") : getTranslation("newline_disable");
                newlineItem.onclick = () => {
                  gftToggleTagNewlines();
                  menu.remove();
                };
                menu.appendChild(newlineItem);
                const tutorialItem = document.createElement("button");
                tutorialItem.className = "gft-settings-menu-item";
                tutorialItem.textContent = getTranslation("tutorial_link");
                tutorialItem.onclick = () => {
                  showTutorial();
                  menu.remove();
                };
                menu.appendChild(tutorialItem);
                const libraryItem = document.createElement("button");
                libraryItem.className = "gft-settings-menu-item";
                libraryItem.textContent = getTranslation("settings_custom_library");
                libraryItem.onclick = () => {
                  if (typeof openCustomButtonManager === "function") {
                    openCustomButtonManager("structure", "library");
                  }
                  menu.remove();
                };
                menu.appendChild(libraryItem);
                document.body.appendChild(menu);
                const closeMenuHandler = (e) => {
                  if (!menu.contains(e.target) && e.target !== settingsButton) {
                    menu.remove();
                    document.removeEventListener("click", closeMenuHandler);
                  }
                };
                document.addEventListener("click", closeMenuHandler);
              });
              panelTitle.appendChild(settingsButton);
              addTooltip(settingsButton, getTranslation("settings_tooltip"));
              GFT_STATE.shortcutsContainerElement.appendChild(panelTitle);
              loadDarkModePreference();
              const panelContent = document.createElement("div");
              panelContent.id = "gft-panel-content";
              if (isCollapsed) {
                panelContent.classList.add("gft-collapsed");
              }
              const statsDisplay = createStatsDisplay();
              panelContent.appendChild(statsDisplay);
              if (statsDisplay.classList.contains("gft-stats-visible")) {
                updateStatsDisplay();
              }
              if (GFT_STATE.detectedArtists.length === 0 && !editorJustAppeared && !editorInstanceChanged) extractSongData();
              createArtistSelectors(panelContent);
              if (GFT_STATE.currentFeaturingArtists.length > 0 || GFT_STATE.currentMainArtists.length > 1) {
                const hrArtists = document.createElement("hr");
                panelContent.appendChild(hrArtists);
              }
              const createButton = (config, parentEl = panelContent, isCoupletMainButton = false) => {
                const button = document.createElement("button");
                button.textContent = typeof config.getLabel === "function" ? config.getLabel() : config.label;
                if (config.id) button.id = config.id;
                button.classList.add("genius-lyrics-shortcut-button");
                if (config.title) button.title = config.title;
                button.type = "button";
                parentEl.appendChild(button);
                if (config.isPlusButton) {
                  button.classList.remove("genius-lyrics-shortcut-button");
                  button.classList.add("gft-add-custom-btn");
                  if (config.title) addTooltip(button, config.title);
                  button.onclick = (e) => {
                    e.preventDefault();
                    if (typeof openCustomButtonManager === "function") openCustomButtonManager(config.managerType || "structure");
                    else console.error("openCustomButtonManager not found");
                  };
                  return button;
                }
                if (config.shortcut) {
                  const badge = document.createElement("span");
                  badge.className = "gft-shortcut-badge";
                  badge.textContent = config.shortcut;
                  button.appendChild(badge);
                }
                if (config.tooltip) {
                  let tooltipText = config.tooltip;
                  if (config.shortcut) {
                    const formattedShortcut = config.shortcut.length === 1 ? `[Ctrl+${config.shortcut}]` : `[${config.shortcut}]`;
                    tooltipText += ` ${formattedShortcut}`;
                  }
                  button.title = tooltipText;
                  addTooltip(button, tooltipText);
                }
                button.addEventListener("click", (event) => {
                  event.preventDefault();
                  if (!GFT_STATE.currentActiveEditor) {
                    initLyricsEditorEnhancer();
                    if (!GFT_STATE.currentActiveEditor) return;
                  }
                  let savedCursorStart = null;
                  let savedCursorEnd = null;
                  if (GFT_STATE.currentEditorType === "textarea") {
                    savedCursorStart = GFT_STATE.currentActiveEditor.selectionStart;
                    savedCursorEnd = GFT_STATE.currentActiveEditor.selectionEnd;
                  }
                  GFT_STATE.currentActiveEditor.focus();
                  isButtonActionInProgress = true;
                  if (GFT_STATE.autoSaveTimeout) {
                    clearTimeout(GFT_STATE.autoSaveTimeout);
                    GFT_STATE.autoSaveTimeout = null;
                  }
                  let textToInsertForCouplet = null;
                  let insertionPerformed = false;
                  if (config.action === "replaceText" && config.searchPattern) {
                    saveToHistory();
                    const replacementValueOrFn = config.replacementFunction || config.replacementText;
                    let replacementsCount = 0;
                    if (GFT_STATE.currentEditorType === "textarea") {
                      const originalValue = GFT_STATE.currentActiveEditor.value;
                      let tempCount = 0;
                      const newValue = originalValue.replace(config.searchPattern, (...matchArgs) => {
                        tempCount++;
                        if (typeof replacementValueOrFn === "function") return replacementValueOrFn(...matchArgs);
                        return replacementValueOrFn;
                      });
                      if (originalValue !== newValue) {
                        GFT_STATE.currentActiveEditor.value = newValue;
                        GFT_STATE.currentActiveEditor.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
                        replacementsCount = tempCount;
                        createTextareaReplacementOverlay(GFT_STATE.currentActiveEditor, originalValue, newValue, config.searchPattern);
                      }
                    } else if (GFT_STATE.currentEditorType === "div") {
                      replacementsCount = replaceAndHighlightInDiv(GFT_STATE.currentActiveEditor, config.searchPattern, replacementValueOrFn, config.highlightClass);
                      if (replacementsCount > 0) GFT_STATE.currentActiveEditor.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
                    }
                    if (replacementsCount > 0) {
                      let itemLabel = "\xE9l\xE9ment(s)";
                      if (config.feedbackKey) {
                        itemLabel = getTranslation(config.feedbackKey, replacementsCount);
                      } else {
                        if (config.label.includes("y' \u2192 y ")) itemLabel = "occurrence(s) de 'y''";
                        if (config.label.includes("\u2019 \u2192 '")) itemLabel = "apostrophe(s) \u2019";
                      }
                      showFeedbackMessage(getTranslation("feedback_replaced", replacementsCount).replace("{count}", replacementsCount).replace("{item}", itemLabel), 3e3, GFT_STATE.shortcutsContainerElement);
                    } else {
                      let noCorrectionLabel = "\xE9l\xE9ment(s)";
                      if (config.feedbackKey) {
                        noCorrectionLabel = getTranslation(config.feedbackKey, 1);
                      }
                      showFeedbackMessage(getTranslation("feedback_no_correction_needed").replace("{item}", noCorrectionLabel), 2e3, GFT_STATE.shortcutsContainerElement);
                    }
                  } else if (config.action === "lineCorrection" && config.correctionType) {
                    saveToHistory();
                    let correctionsCount = 0;
                    let correctionFunction;
                    let feedbackLabel = "";
                    if (config.correctionType === "spacing") {
                      correctionFunction = correctLineSpacing;
                      feedbackLabel = "espacement(s) de ligne";
                    }
                    if (correctionFunction) {
                      if (GFT_STATE.currentEditorType === "textarea") {
                        const originalText = GFT_STATE.currentActiveEditor.value;
                        const { newText, correctionsCount: count } = correctionFunction(originalText);
                        if (originalText !== newText) {
                          GFT_STATE.currentActiveEditor.value = newText;
                          GFT_STATE.currentActiveEditor.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
                        }
                        correctionsCount = count;
                      } else if (GFT_STATE.currentEditorType === "div") {
                        correctionsCount = applyTextTransformToDivEditor(GFT_STATE.currentActiveEditor, correctionFunction);
                      }
                      if (correctionsCount > 0) {
                        let itemLabel = "\xE9l\xE9ment(s)";
                        if (config.feedbackKey) itemLabel = getTranslation(config.feedbackKey, correctionsCount);
                        else itemLabel = feedbackLabel;
                        showFeedbackMessage(getTranslation("feedback_corrected", correctionsCount).replace("{count}", correctionsCount).replace("{item}", itemLabel), 3e3, GFT_STATE.shortcutsContainerElement);
                      } else {
                        let noCorrectionLabel = "\xE9l\xE9ment(s)";
                        if (config.feedbackKey) noCorrectionLabel = getTranslation(config.feedbackKey, 1);
                        else noCorrectionLabel = feedbackLabel;
                        showFeedbackMessage(getTranslation("feedback_no_correction_needed").replace("{item}", noCorrectionLabel), 2e3, GFT_STATE.shortcutsContainerElement);
                      }
                    }
                  } else if (config.action === "globalTextFix") {
                    (async () => {
                      try {
                        const originalText = GFT_STATE.currentEditorType === "textarea" ? GFT_STATE.currentActiveEditor.value : GFT_STATE.currentActiveEditor.textContent || "";
                        const result = await applyAllTextCorrectionsAsync(originalText, showProgress);
                        hideProgress();
                        if (result.correctionsCount === 0) {
                          const editorRef2 = GFT_STATE.currentActiveEditor;
                          const editorTypeRef2 = GFT_STATE.currentEditorType;
                          let unmatchedCount = 0;
                          console.log("[GFT] V\xE9rification des brackets (cas sans correction texte)...");
                          if (editorRef2) {
                            unmatchedCount = highlightUnmatchedBracketsInEditor(editorRef2, editorTypeRef2);
                            console.log("[GFT] unmatchedCount:", unmatchedCount);
                          }
                          if (unmatchedCount > 0) {
                            showFeedbackMessage(
                              getTranslation("feedback_brackets_issue").replace("{count}", unmatchedCount),
                              5e3,
                              GFT_STATE.shortcutsContainerElement
                            );
                          } else {
                            showFeedbackMessage(getTranslation("feedback_no_text_corrections"), 3e3, GFT_STATE.shortcutsContainerElement);
                          }
                          return;
                        }
                        const editorRef = GFT_STATE.currentActiveEditor;
                        const editorTypeRef = GFT_STATE.currentEditorType;
                        showCorrectionPreview(
                          originalText,
                          result.newText,
                          result.corrections,
                          // Callback si l'utilisateur applique, avec le texte et les stats recalculés
                          (finalText, finalStats) => {
                            saveToHistory();
                            if (editorTypeRef === "textarea") {
                              editorRef.value = finalText;
                              editorRef.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
                            } else if (editorTypeRef === "div") {
                              setEditorContent(finalText);
                            }
                            const detailsArray = [];
                            if (finalStats.yPrime > 0) detailsArray.push(getTranslation("feedback_detail_yprime", finalStats.yPrime).replace("{count}", finalStats.yPrime));
                            if (finalStats.apostrophes > 0) detailsArray.push(getTranslation("feedback_detail_apostrophes", finalStats.apostrophes).replace("{count}", finalStats.apostrophes));
                            if (finalStats.oeuLigature > 0) detailsArray.push(getTranslation("feedback_detail_oeu", finalStats.oeuLigature).replace("{count}", finalStats.oeuLigature));
                            if (finalStats.frenchQuotes > 0) detailsArray.push(getTranslation("feedback_detail_quotes", finalStats.frenchQuotes).replace("{count}", finalStats.frenchQuotes));
                            if (finalStats.longDash > 0) detailsArray.push(getTranslation("feedback_detail_dash", finalStats.longDash).replace("{count}", finalStats.longDash));
                            if (finalStats.doubleSpaces > 0) detailsArray.push(getTranslation("feedback_detail_spaces", finalStats.doubleSpaces).replace("{count}", finalStats.doubleSpaces));
                            if (finalStats.spacing > 0) detailsArray.push(getTranslation("feedback_detail_spacing", finalStats.spacing).replace("{count}", finalStats.spacing));
                            const totalCount = Object.values(finalStats).reduce((a, b) => a + b, 0);
                            const lang = localStorage.getItem("gftLanguage") || "fr";
                            const message = detailsArray.length > 0 ? getTranslation("feedback_summary_corrected", totalCount).replace("{details}", formatListWithConjunction(detailsArray, lang)).replace("{count}", totalCount) : getTranslation("feedback_summary_correction", totalCount).replace("{count}", totalCount);
                            showFeedbackMessage(message, 4500, GFT_STATE.shortcutsContainerElement);
                            console.log("[GFT] V\xE9rification des brackets apr\xE8s corrections...");
                            console.log("[GFT] editorRef:", editorRef);
                            console.log("[GFT] editorTypeRef:", editorTypeRef);
                            if (editorRef) {
                              const unmatchedCount = highlightUnmatchedBracketsInEditor(editorRef, editorTypeRef);
                              console.log("[GFT] unmatchedCount:", unmatchedCount);
                              setTimeout(() => {
                                if (unmatchedCount > 0) {
                                  showFeedbackMessage(
                                    getTranslation("feedback_brackets_issue").replace("{count}", unmatchedCount),
                                    5e3,
                                    GFT_STATE.shortcutsContainerElement
                                  );
                                } else {
                                }
                              }, 4600);
                            } else {
                              console.log("[GFT] editorRef est null, impossible de v\xE9rifier les brackets");
                            }
                          },
                          // Callback si l'utilisateur annule
                          () => {
                            showFeedbackMessage(getTranslation("feedback_corrections_cancelled"), 2e3, GFT_STATE.shortcutsContainerElement);
                          }
                        );
                      } catch (error) {
                        hideProgress();
                        console.error("Erreur lors des corrections:", error);
                        showFeedbackMessage(getTranslation("error_corrections"), 3e3, GFT_STATE.shortcutsContainerElement);
                      }
                    })();
                  } else if (config.action === "checkBrackets") {
                    const unmatchedCount = highlightUnmatchedBracketsInEditor(GFT_STATE.currentActiveEditor, GFT_STATE.currentEditorType);
                    if (unmatchedCount > 0) {
                      showFeedbackMessage(
                        getTranslation("feedback_brackets_issue").replace("{count}", unmatchedCount),
                        5e3,
                        GFT_STATE.shortcutsContainerElement
                      );
                    } else {
                      showFeedbackMessage(
                        getTranslation("feedback_brackets_ok"),
                        3e3,
                        GFT_STATE.shortcutsContainerElement
                      );
                    }
                  } else if (config.action === "duplicateLine") {
                    saveToHistory();
                    if (GFT_STATE.currentEditorType === "textarea") {
                      const text = GFT_STATE.currentActiveEditor.value;
                      const cursorPos = GFT_STATE.currentActiveEditor.selectionStart;
                      let lineStart = text.lastIndexOf("\n", cursorPos - 1) + 1;
                      let lineEnd = text.indexOf("\n", cursorPos);
                      if (lineEnd === -1) lineEnd = text.length;
                      const currentLine = text.substring(lineStart, lineEnd);
                      const newText = text.substring(0, lineEnd) + "\n" + currentLine + text.substring(lineEnd);
                      GFT_STATE.currentActiveEditor.value = newText;
                      GFT_STATE.currentActiveEditor.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
                      const newCursorPos = lineEnd + 1 + currentLine.length;
                      GFT_STATE.currentActiveEditor.setSelectionRange(newCursorPos, newCursorPos);
                      showFeedbackMessage(getTranslation("feedback_duplicate_line"), 2e3, GFT_STATE.shortcutsContainerElement);
                    } else if (GFT_STATE.currentEditorType === "div") {
                      const selection = window.getSelection();
                      if (selection.rangeCount > 0) {
                        const range = selection.getRangeAt(0);
                        const node = range.startContainer;
                        let lineText = "";
                        if (node.nodeType === Node.TEXT_NODE) {
                          lineText = node.textContent;
                        } else if (node.textContent) {
                          lineText = node.textContent;
                        }
                        if (lineText) {
                          document.execCommand("insertText", false, "\n" + lineText);
                          GFT_STATE.currentActiveEditor.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
                          showFeedbackMessage(getTranslation("feedback_duplicate_line"), 2e3, GFT_STATE.shortcutsContainerElement);
                        }
                      }
                    }
                  } else if (config.action === "wrapSelection") {
                    let selectedText = "";
                    if (GFT_STATE.currentEditorType === "textarea") {
                      const start = GFT_STATE.currentActiveEditor.selectionStart;
                      const end = GFT_STATE.currentActiveEditor.selectionEnd;
                      if (start !== end) {
                        saveToHistory();
                        selectedText = GFT_STATE.currentActiveEditor.value.substring(start, end);
                        const wrappedText = config.wrapStart + selectedText + config.wrapEnd;
                        GFT_STATE.currentActiveEditor.setSelectionRange(start, end);
                        document.execCommand("insertText", false, wrappedText);
                        showFeedbackMessage(getTranslation("feedback_wrapped").replace("{start}", config.wrapStart).replace("{end}", config.wrapEnd), 2e3, GFT_STATE.shortcutsContainerElement);
                      } else {
                        showFeedbackMessage(getTranslation("feedback_select_text_first"), 2e3, GFT_STATE.shortcutsContainerElement);
                      }
                    } else if (GFT_STATE.currentEditorType === "div") {
                      const selection = window.getSelection();
                      if (selection.rangeCount > 0 && !selection.isCollapsed) {
                        saveToHistory();
                        selectedText = selection.toString();
                        const wrappedText = config.wrapStart + selectedText + config.wrapEnd;
                        document.execCommand("insertText", false, wrappedText);
                        GFT_STATE.currentActiveEditor.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
                        showFeedbackMessage(getTranslation("feedback_wrapped").replace("{start}", config.wrapStart).replace("{end}", config.wrapEnd), 2e3, GFT_STATE.shortcutsContainerElement);
                      } else {
                        showFeedbackMessage(getTranslation("feedback_select_text_first"), 2e3, GFT_STATE.shortcutsContainerElement);
                      }
                    }
                  } else {
                    let textToInsert;
                    if (typeof config.getText === "function") {
                      textToInsert = config.getText();
                      if (isCoupletMainButton) {
                        textToInsertForCouplet = textToInsert;
                      }
                    } else if (typeof config.text !== "undefined") {
                      textToInsert = config.text;
                    }
                    if (typeof textToInsert !== "undefined" && textToInsert !== null && GFT_STATE.currentActiveEditor) {
                      saveToHistory();
                      document.execCommand("insertText", false, textToInsert);
                      insertionPerformed = true;
                    }
                  }
                  if (isCoupletMainButton && textToInsertForCouplet !== null) {
                    GFT_STATE.coupletCounter++;
                    button.textContent = config.getLabel();
                  } else if (typeof config.getLabel === "function" && !isCoupletMainButton) {
                    button.textContent = config.getLabel();
                  }
                  if (!insertionPerformed && GFT_STATE.currentEditorType === "textarea" && savedCursorStart !== null && savedCursorEnd !== null) {
                    GFT_STATE.currentActiveEditor.setSelectionRange(savedCursorStart, savedCursorEnd);
                  }
                  GFT_STATE.currentActiveEditor.focus();
                  setTimeout(() => {
                    isButtonActionInProgress = false;
                    if (GFT_STATE.currentActiveEditor) {
                      GFT_STATE.lastSavedContent = getCurrentEditorContent();
                      GFT_STATE.hasUnsavedChanges = false;
                    }
                  }, 150);
                });
                return button;
              };
              const buttonGroupsContainer = document.createElement("div");
              buttonGroupsContainer.id = "gftButtonGroupsContainer";
              panelContent.appendChild(buttonGroupsContainer);
              const structureSection = document.createElement("div");
              structureSection.style.marginTop = "10px";
              const structureLabel = document.createElement("div");
              structureLabel.className = "gft-section-label";
              structureLabel.textContent = getTranslation("section_structure");
              structureSection.appendChild(structureLabel);
              const structuralButtonsContainer = document.createElement("div");
              structuralButtonsContainer.style.display = "flex";
              structuralButtonsContainer.style.flexWrap = "wrap";
              structuralButtonsContainer.style.gap = "5px";
              structuralButtonsContainer.style.alignItems = "center";
              if (SHORTCUTS.TAGS_STRUCTURAUX && SHORTCUTS.TAGS_STRUCTURAUX[0]) {
                const coupletManagerConfig = SHORTCUTS.TAGS_STRUCTURAUX[0].buttons.find((b) => b.type === "coupletManager");
                if (coupletManagerConfig) {
                  const coupletControl = document.createElement("div");
                  coupletControl.className = "gft-couplet-control";
                  const prevBtn = document.createElement("button");
                  prevBtn.className = "gft-couplet-btn";
                  prevBtn.textContent = "\u2190";
                  prevBtn.onclick = (e) => {
                    e.stopPropagation();
                    if (GFT_STATE.coupletCounter > 1) {
                      GFT_STATE.coupletCounter--;
                      const mainLabel = document.getElementById(COUPLET_BUTTON_ID);
                      if (mainLabel) mainLabel.textContent = coupletManagerConfig.main.getLabel();
                    }
                  };
                  if (coupletManagerConfig.prev.tooltip) {
                    prevBtn.title = coupletManagerConfig.prev.tooltip;
                    addTooltip(prevBtn, coupletManagerConfig.prev.tooltip);
                  }
                  coupletControl.appendChild(prevBtn);
                  const mainBtn = createButton(coupletManagerConfig.main, coupletControl, true);
                  mainBtn.className = "";
                  mainBtn.classList.add("gft-couplet-btn", "gft-couplet-main");
                  const nextBtn = document.createElement("button");
                  nextBtn.className = "gft-couplet-btn";
                  nextBtn.textContent = "\u2192";
                  nextBtn.onclick = (e) => {
                    e.stopPropagation();
                    GFT_STATE.coupletCounter++;
                    const mainLabel = document.getElementById(COUPLET_BUTTON_ID);
                    if (mainLabel) mainLabel.textContent = coupletManagerConfig.main.getLabel();
                  };
                  if (coupletManagerConfig.next.tooltip) {
                    nextBtn.title = coupletManagerConfig.next.tooltip;
                    addTooltip(nextBtn, coupletManagerConfig.next.tooltip);
                  }
                  coupletControl.appendChild(nextBtn);
                  structuralButtonsContainer.appendChild(coupletControl);
                }
              }
              if (SHORTCUTS.TAGS_STRUCTURAUX) {
                SHORTCUTS.TAGS_STRUCTURAUX.forEach((groupConfig) => {
                  groupConfig.buttons.forEach((shortcut) => {
                    if (shortcut.type === "coupletManager") return;
                    const btn = createButton(shortcut, structuralButtonsContainer);
                    btn.classList.add("gft-btn-secondary");
                  });
                });
              }
              structureSection.appendChild(structuralButtonsContainer);
              buttonGroupsContainer.appendChild(structureSection);
              const toolsSection = document.createElement("div");
              toolsSection.className = "gft-section";
              const toolsLabel = document.createElement("div");
              toolsLabel.className = "gft-section-label";
              toolsLabel.textContent = getTranslation("section_cleanup");
              toolsSection.appendChild(toolsLabel);
              const utilityContainer = document.createElement("div");
              utilityContainer.style.display = "flex";
              utilityContainer.style.flexWrap = "wrap";
              utilityContainer.style.gap = "6px";
              const createToggleBtn = () => {
                const toggleBtn = createButton({
                  label: "\u{1F50D} " + (getTranslation("find_replace_title") || "Find & Replace"),
                  tooltip: getTranslation("find_replace_title")
                }, utilityContainer);
                toggleBtn.classList.add("gft-btn-utility");
                toggleBtn.style.padding = "0 6px";
                toggleBtn.style.minWidth = "auto";
                toggleBtn.style.display = "inline-flex";
                toggleBtn.style.alignItems = "center";
                toggleBtn.style.justifyContent = "center";
                toggleBtn.onclick = (e) => {
                  e.preventDefault();
                  const isClosed = findReplaceContainer.style.maxHeight === "0px" || findReplaceContainer.style.maxHeight === "0";
                  if (isClosed) {
                    findReplaceContainer.style.visibility = "visible";
                    findReplaceContainer.style.maxHeight = "300px";
                    findReplaceContainer.style.opacity = "1";
                    findReplaceContainer.style.marginTop = "12px";
                    findReplaceContainer.style.padding = "12px";
                    toggleBtn.classList.add("active");
                  } else {
                    findReplaceContainer.style.maxHeight = "0";
                    findReplaceContainer.style.opacity = "0";
                    findReplaceContainer.style.marginTop = "0";
                    findReplaceContainer.style.padding = "0";
                    setTimeout(() => {
                      if (findReplaceContainer.style.maxHeight === "0px" || findReplaceContainer.style.maxHeight === "0") {
                        findReplaceContainer.style.visibility = "hidden";
                      }
                    }, 300);
                    toggleBtn.classList.remove("active");
                  }
                };
                return toggleBtn;
              };
              let toggleFindReplaceBtn = null;
              if (SHORTCUTS.TEXT_CLEANUP && SHORTCUTS.TEXT_CLEANUP.length > 0) {
                SHORTCUTS.TEXT_CLEANUP.forEach((s) => {
                  if (s.isPlusButton && !toggleFindReplaceBtn) {
                    toggleFindReplaceBtn = createToggleBtn();
                  }
                  const btn = createButton(s, utilityContainer);
                  btn.classList.add("gft-btn-utility");
                  btn.style.padding = "2px 6px";
                  btn.style.display = "inline-flex";
                  btn.style.alignItems = "center";
                  btn.style.justifyContent = "center";
                  if (s.shortLabel) {
                    btn.textContent = s.shortLabel;
                  } else {
                    btn.textContent = s.label.replace(" \u2192 ", "\u2192");
                  }
                });
                if (!toggleFindReplaceBtn) {
                  toggleFindReplaceBtn = createToggleBtn();
                }
              }
              toolsSection.appendChild(utilityContainer);
              const findReplaceContainer = document.createElement("div");
              findReplaceContainer.className = "gft-find-replace-container";
              findReplaceContainer.style.background = isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
              findReplaceContainer.style.borderRadius = "10px";
              findReplaceContainer.style.border = isDarkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)";
              findReplaceContainer.style.overflow = "hidden";
              findReplaceContainer.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
              findReplaceContainer.style.width = "100%";
              findReplaceContainer.style.boxSizing = "border-box";
              findReplaceContainer.style.maxHeight = "0";
              findReplaceContainer.style.opacity = "0";
              findReplaceContainer.style.marginTop = "0";
              findReplaceContainer.style.padding = "0";
              findReplaceContainer.style.visibility = "hidden";
              findReplaceContainer.style.display = "flex";
              findReplaceContainer.style.flexDirection = "column";
              findReplaceContainer.style.gap = "8px";
              const inputsRow = document.createElement("div");
              inputsRow.style.display = "flex";
              inputsRow.style.gap = "8px";
              const findInput = document.createElement("input");
              findInput.type = "text";
              findInput.placeholder = getTranslation("find_placeholder");
              findInput.className = "gft-input-small";
              findInput.style.flex = "1";
              findInput.style.padding = "6px 8px";
              findInput.style.borderRadius = "6px";
              findInput.style.border = "1px solid " + (isDarkMode ? "rgba(255,255,255,0.2)" : "#ccc");
              const replaceInput = document.createElement("input");
              replaceInput.type = "text";
              replaceInput.placeholder = getTranslation("replace_placeholder");
              replaceInput.className = "gft-input-small";
              replaceInput.style.flex = "1";
              replaceInput.style.padding = "6px 8px";
              replaceInput.style.borderRadius = "6px";
              replaceInput.style.border = "1px solid " + (isDarkMode ? "rgba(255,255,255,0.2)" : "#ccc");
              inputsRow.appendChild(findInput);
              inputsRow.appendChild(replaceInput);
              findReplaceContainer.appendChild(inputsRow);
              const controlsRow = document.createElement("div");
              controlsRow.style.display = "flex";
              controlsRow.style.justifyContent = "space-between";
              controlsRow.style.alignItems = "center";
              const regexLabel = document.createElement("label");
              regexLabel.style.fontSize = "12px";
              regexLabel.style.display = "flex";
              regexLabel.style.alignItems = "center";
              regexLabel.style.gap = "6px";
              regexLabel.style.cursor = "pointer";
              const regexCheck = document.createElement("input");
              regexCheck.type = "checkbox";
              regexLabel.appendChild(regexCheck);
              regexLabel.appendChild(document.createTextNode(getTranslation("regex_toggle")));
              controlsRow.appendChild(regexLabel);
              const replaceAllBtn = document.createElement("button");
              replaceAllBtn.textContent = getTranslation("btn_replace_all");
              replaceAllBtn.className = "gft-btn-small gft-btn-primary";
              replaceAllBtn.style.padding = "6px 12px";
              replaceAllBtn.style.borderRadius = "6px";
              replaceAllBtn.onclick = () => applySearchReplace(findInput.value, replaceInput.value, regexCheck.checked, true);
              controlsRow.appendChild(replaceAllBtn);
              findReplaceContainer.appendChild(controlsRow);
              toolsSection.appendChild(findReplaceContainer);
              buttonGroupsContainer.appendChild(toolsSection);
              const mainActionsSection = document.createElement("div");
              mainActionsSection.className = "gft-section";
              mainActionsSection.style.marginTop = "12px";
              mainActionsSection.style.borderTop = "none";
              const mainActionsContainer = document.createElement("div");
              mainActionsContainer.style.display = "flex";
              mainActionsContainer.style.gap = "10px";
              mainActionsContainer.style.width = "100%";
              if (SHORTCUTS.GLOBAL_FIXES && SHORTCUTS.GLOBAL_FIXES.length > 0) {
                SHORTCUTS.GLOBAL_FIXES.forEach((s) => {
                  const btn = createButton(s, mainActionsContainer);
                  btn.classList.add("gft-btn-primary", "gft-btn-main-action");
                  btn.style.flex = "1";
                  btn.style.justifyContent = "center";
                  if (s.shortLabel) btn.textContent = s.shortLabel;
                  else if (s.label.includes("Tout Corriger")) btn.innerHTML = s.label;
                  else if (s.label.includes("V\xE9rifier")) btn.innerHTML = s.label;
                });
              }
              mainActionsSection.appendChild(mainActionsContainer);
              buttonGroupsContainer.appendChild(mainActionsSection);
              const feedbackContainer = document.createElement("div");
              feedbackContainer.style.marginTop = "0px";
              feedbackContainer.style.width = "100%";
              const feedbackMessage = document.createElement("div");
              feedbackMessage.id = FEEDBACK_MESSAGE_ID;
              feedbackMessage.style.display = "none";
              feedbackMessage.style.padding = "8px";
              feedbackMessage.style.borderRadius = "4px";
              feedbackMessage.style.fontSize = "12px";
              feedbackMessage.style.textAlign = "center";
              feedbackMessage.style.marginTop = "5px";
              feedbackMessage.style.marginBottom = "5px";
              feedbackMessage.style.fontWeight = "bold";
              feedbackContainer.appendChild(feedbackMessage);
              const progressContainer = document.createElement("div");
              progressContainer.id = "gft-progress-container";
              progressContainer.className = "gft-progress-container";
              progressContainer.style.display = "none";
              const progressBar = document.createElement("div");
              progressBar.id = "gft-progress-bar";
              progressBar.className = "gft-progress-bar";
              const progressText = document.createElement("div");
              progressText.id = "gft-progress-text";
              progressText.className = "gft-progress-text";
              progressText.textContent = "0%";
              progressContainer.appendChild(progressBar);
              progressContainer.appendChild(progressText);
              feedbackContainer.appendChild(progressContainer);
              panelContent.appendChild(feedbackContainer);
              const footerContainer = document.createElement("div");
              footerContainer.id = "gft-footer-container";
              footerContainer.style.display = "flex";
              footerContainer.style.justifyContent = "space-between";
              footerContainer.style.alignItems = "center";
              footerContainer.style.marginTop = "5px";
              footerContainer.style.paddingTop = "5px";
              footerContainer.style.borderTop = "1px solid rgba(0,0,0,0.05)";
              const creditLabel = document.createElement("div");
              creditLabel.id = "gft-credit-label";
              creditLabel.textContent = "Made with \u2764\uFE0F by Lnkhey";
              creditLabel.style.fontSize = "10px";
              creditLabel.style.color = "#888";
              creditLabel.style.opacity = "0.6";
              creditLabel.style.userSelect = "none";
              if (!isEnglishTranscriptionMode() && !isPolishTranscriptionMode2()) {
                const iaLink = document.createElement("a");
                iaLink.textContent = "\u{1F916} Transcription IA \u2197";
                iaLink.href = "https://aistudio.google.com/apps/drive/1D16MbaGAWjUMTseOvzzvSDnccRbU-z_S?fullscreenApplet=true&showPreview=true&showAssistant=true";
                iaLink.target = "_blank";
                iaLink.rel = "noopener noreferrer";
                iaLink.style.fontSize = "10px";
                iaLink.style.color = "#888";
                iaLink.style.textDecoration = "none";
                iaLink.style.opacity = "0.6";
                iaLink.style.cursor = "pointer";
                iaLink.style.transition = "opacity 0.2s ease";
                iaLink.title = "Ouvrir l'outil de transcription IA";
                iaLink.addEventListener("mouseenter", () => {
                  iaLink.style.opacity = "1";
                  iaLink.style.textDecoration = "underline";
                });
                iaLink.addEventListener("mouseleave", () => {
                  iaLink.style.opacity = "0.6";
                  iaLink.style.textDecoration = "none";
                });
                footerContainer.appendChild(iaLink);
              }
              const versionLabel = document.createElement("div");
              versionLabel.id = "gft-version-label";
              versionLabel.textContent = "v4.0.0";
              versionLabel.title = "Genius Fast Transcriber v4.0.0 - Nouvelle Interface Premium";
              footerContainer.appendChild(creditLabel);
              footerContainer.appendChild(versionLabel);
              panelContent.appendChild(footerContainer);
              GFT_STATE.shortcutsContainerElement.appendChild(panelContent);
              targetStickySection.prepend(GFT_STATE.shortcutsContainerElement);
              if (isFirstLaunch()) {
                setTimeout(() => {
                  showTutorial();
                }, 1500);
              }
            } else {
              if (document.title !== (window._gftLastPageTitle || "")) {
                extractSongData();
                const artistSelContainer = GFT_STATE.shortcutsContainerElement.querySelector(`#${ARTIST_SELECTOR_CONTAINER_ID}`);
                if (artistSelContainer && artistSelContainer.parentNode) createArtistSelectors(artistSelContainer.parentNode);
                else if (GFT_STATE.shortcutsContainerElement) createArtistSelectors(GFT_STATE.shortcutsContainerElement);
              }
              if (GFT_STATE.shortcutsContainerElement) loadDarkModePreference();
            }
            window._gftLastPageTitle = document.title;
            hideGeniusFormattingHelper();
            if (GFT_STATE.shortcutsContainerElement) {
              const coupletButton = GFT_STATE.shortcutsContainerElement.querySelector(`#${COUPLET_BUTTON_ID}`);
              if (coupletButton && SHORTCUTS.TAGS_STRUCTURAUX && SHORTCUTS.TAGS_STRUCTURAUX[0]) {
                const coupletManagerConfig = SHORTCUTS.TAGS_STRUCTURAUX[0].buttons.find((b) => b.type === "coupletManager");
                if (coupletManagerConfig) {
                  coupletButton.textContent = coupletManagerConfig.main.getLabel();
                }
              }
            }
          } else {
            if (GFT_STATE.shortcutsContainerElement) {
              GFT_STATE.shortcutsContainerElement.remove();
              GFT_STATE.shortcutsContainerElement = null;
            }
          }
        } else {
          if (GFT_STATE.shortcutsContainerElement) {
            GFT_STATE.shortcutsContainerElement.remove();
            GFT_STATE.shortcutsContainerElement = null;
          }
        }
      }
      function startObserver() {
        if (!document.body) {
          setTimeout(startObserver, 100);
          return;
        }
        if (GFT_STATE.observer && typeof GFT_STATE.observer.disconnect === "function") {
          GFT_STATE.observer.disconnect();
        }
        GFT_STATE.observer = new MutationObserver((mutationsList, currentObsInstance) => {
          let editorAppeared = false;
          let controlsAppeared = false;
          for (const mutation of mutationsList) {
            if (mutation.type === "childList") {
              if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach((node) => {
                  if (node.nodeType === Node.ELEMENT_NODE && typeof node.matches === "function") {
                    if (node.matches(SELECTORS.TEXTAREA_EDITOR) || node.matches(SELECTORS.DIV_EDITOR)) editorAppeared = true;
                    if (node.matches(SELECTORS.CONTROLS_STICKY_SECTION)) controlsAppeared = true;
                  }
                });
              }
            }
          }
          const editorNowExistsInDOM = document.querySelector(SELECTORS.TEXTAREA_EDITOR) || document.querySelector(SELECTORS.DIV_EDITOR);
          const editorVanished = GFT_STATE.currentActiveEditor && !document.body.contains(GFT_STATE.currentActiveEditor);
          if (editorAppeared || controlsAppeared || !GFT_STATE.currentActiveEditor && editorNowExistsInDOM || editorVanished) {
            currentObsInstance.disconnect();
            initLyricsEditorEnhancer();
            enableYoutubeJsApi();
            setTimeout(() => {
              startObserver();
            }, 200);
          } else {
            enableYoutubeJsApi();
          }
        });
        try {
          GFT_STATE.observer.observe(document.body, { childList: true, subtree: true });
        } catch (e) {
          console.error("[Observer] Erreur initiale:", e);
        }
        initLyricsEditorEnhancer();
        const isSongPage = document.querySelector('meta[property="og:type"][content="music.song"]') !== null || window.location.pathname.includes("-lyrics");
        if (isSongPage) {
          extractSongData();
          createFloatingFormattingToolbar();
        }
      }
      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => {
        applyStoredPreferences();
        startObserver();
      });
      else {
        applyStoredPreferences();
        startObserver();
      }
      window.addEventListener("load", () => {
        applyStoredPreferences();
        initLyricsEditorEnhancer();
      });
      window.addEventListener("popstate", () => {
        applyStoredPreferences();
        initLyricsEditorEnhancer();
      });
      window.addEventListener("hashchange", () => {
        applyStoredPreferences();
        initLyricsEditorEnhancer();
      });
      document.addEventListener("selectionchange", handleSelectionChange);
      document.addEventListener("mouseup", () => {
        setTimeout(handleSelectionChange, 10);
      });
      document.addEventListener("keydown", handleKeyboardShortcut);
      window.addEventListener("scroll", hideFloatingToolbar, true);
      if (document.readyState === "complete" || document.readyState === "interactive") {
        setTimeout(() => {
          createFloatingFormattingToolbar();
        }, 500);
      } else {
        document.addEventListener("DOMContentLoaded", () => {
          setTimeout(() => {
            createFloatingFormattingToolbar();
          }, 500);
        });
      }
      window.addEventListener("beforeunload", () => {
        if (GFT_STATE.observer && typeof GFT_STATE.observer.disconnect === "function") GFT_STATE.observer.disconnect();
        if (GFT_STATE.shortcutsContainerElement) GFT_STATE.shortcutsContainerElement.remove();
        if (GFT_STATE.floatingFormattingToolbar) GFT_STATE.floatingFormattingToolbar.remove();
        delete window._gftLastPageTitle;
      });
      function extractArtistImage() {
        const cleanUrl = (url) => {
          if (!url) return null;
          try {
            if (url.includes("genius.com/unsafe/")) {
              const unsafeSplit = url.split("/unsafe/");
              if (unsafeSplit.length > 1) {
                let remainder = unsafeSplit[1];
                const encodedProtocolIndex = remainder.search(/https?%3A/i);
                if (encodedProtocolIndex !== -1) {
                  remainder = remainder.substring(encodedProtocolIndex);
                  return decodeURIComponent(remainder);
                }
                const protocolIndex = remainder.search(/https?:/i);
                if (protocolIndex !== -1) {
                  return remainder.substring(protocolIndex);
                }
              }
            }
            if (url.includes("%3A") || url.includes("%2F")) {
              return decodeURIComponent(url);
            }
            return url;
          } catch (e) {
            console.warn("[GFT] Erreur decoding URL:", e);
            return url;
          }
        };
        const headerAvatar = document.querySelector('div[class*="SongHeader"] a[href*="/artists/"] img');
        if (headerAvatar && headerAvatar.src) return cleanUrl(headerAvatar.src);
        const aboutImg = document.querySelector('[class*="AboutArtist__Container"] img') || document.querySelector('[class*="ArtistAvatar__Image"]');
        if (aboutImg && aboutImg.src) return cleanUrl(aboutImg.src);
        const metaImg = document.querySelector('meta[property="genius:track_artist_image"]');
        if (metaImg && metaImg.content) return cleanUrl(metaImg.content);
        if (typeof GFT_STATE.currentMainArtists !== "undefined" && GFT_STATE.currentMainArtists.length > 0) {
          const artistName = GFT_STATE.currentMainArtists[0];
          const candidate = Array.from(document.querySelectorAll("img")).find((img) => {
            const src = img.src || "";
            const alt = img.alt || "";
            return alt.includes(artistName) && src.includes("images.genius.com") && !src.includes("pixel") && !src.includes("placeholder") && (src.includes("avatar") || src.includes("profile") || img.width === img.height);
          });
          if (candidate) return cleanUrl(candidate.src);
        }
        return null;
      }
      function renderLyricCardToCanvas(canvas, text, artistName, songTitle, imageObj, footerColor, textColor, logoObj, format = "16:9") {
        const ctx = canvas.getContext("2d");
        let WIDTH, HEIGHT, FOOTER_HEIGHT, FONT_SIZE_TEXT, LINE_HEIGHT_TEXT, FONT_SIZE_FOOTER;
        if (format === "1:1") {
          WIDTH = 1080;
          HEIGHT = 1080;
          FOOTER_HEIGHT = 160;
          FONT_SIZE_TEXT = 54;
          LINE_HEIGHT_TEXT = 90;
          FONT_SIZE_FOOTER = 32;
        } else {
          WIDTH = 1280;
          HEIGHT = 720;
          FOOTER_HEIGHT = 140;
          FONT_SIZE_TEXT = 48;
          LINE_HEIGHT_TEXT = 80;
          FONT_SIZE_FOOTER = 28;
        }
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
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
        ctx.fillStyle = footerColor;
        ctx.fillRect(0, HEIGHT - FOOTER_HEIGHT, WIDTH, FOOTER_HEIGHT);
        ctx.fillStyle = textColor;
        ctx.fillRect(0, HEIGHT - FOOTER_HEIGHT, WIDTH, 3);
        const logoHeight = 40;
        let logoWidth = 0;
        if (logoObj) {
          logoWidth = logoObj.width * (logoHeight / logoObj.height);
        } else {
          ctx.save();
          ctx.font = '900 36px "Programme", "Arial Black", sans-serif';
          ctx.letterSpacing = "4px";
          logoWidth = ctx.measureText("G E N I U S").width;
          ctx.restore();
        }
        const logoX = WIDTH - 60 - logoWidth;
        ctx.font = `normal ${FONT_SIZE_FOOTER}px "Programme", "Arial", sans-serif`;
        ctx.fillStyle = textColor;
        ctx.textBaseline = "middle";
        ctx.letterSpacing = "2px";
        const footerText = `${artistName.toUpperCase()}, "${songTitle.toUpperCase()}"`;
        const maxFooterTextWidth = logoX - 40 - 60;
        let displayText = footerText;
        let textWidth = ctx.measureText(displayText).width;
        if (textWidth > maxFooterTextWidth) {
          while (textWidth > maxFooterTextWidth && displayText.length > 0) {
            displayText = displayText.slice(0, -1);
            textWidth = ctx.measureText(displayText + "...").width;
          }
          displayText += "...";
        }
        ctx.fillText(displayText, 60, HEIGHT - FOOTER_HEIGHT / 2);
        ctx.letterSpacing = "0px";
        if (logoObj) {
          ctx.drawImage(logoObj, logoX, HEIGHT - FOOTER_HEIGHT / 2 - logoHeight / 2, logoWidth, logoHeight);
        } else {
          ctx.save();
          ctx.textAlign = "left";
          ctx.font = '900 36px "Programme", "Arial Black", sans-serif';
          ctx.letterSpacing = "4px";
          ctx.fillStyle = textColor;
          ctx.fillText("G E N I U S", logoX, HEIGHT - FOOTER_HEIGHT / 2);
          ctx.restore();
        }
        const maxTextWidth = WIDTH - 120;
        const fontSize = FONT_SIZE_TEXT;
        const lineHeight = LINE_HEIGHT_TEXT;
        ctx.font = `300 ${fontSize}px "Programme", "Arial", sans-serif`;
        const originalLines = text.split(/\r?\n/);
        const lines = [];
        originalLines.forEach((originalLine) => {
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
        let startY = HEIGHT - FOOTER_HEIGHT - textBottomMargin - lines.length * lineHeight;
        const lyricsBackgroundColor = textColor === "white" ? "white" : "black";
        const lyricsTextColor = textColor === "white" ? "black" : "white";
        lines.forEach((line, index) => {
          const y = startY + index * lineHeight;
          const lineWidth = ctx.measureText(line).width;
          const padding = 10;
          const rectTop = y - fontSize + 12;
          const rectHeight = fontSize + 24;
          ctx.fillStyle = lyricsBackgroundColor;
          ctx.fillRect(60 - padding, rectTop, lineWidth + padding * 2, rectHeight);
          ctx.fillStyle = lyricsTextColor;
          ctx.fillText(line, 60, y);
        });
      }
      function showLyricCardPreviewModal(text, artistName, songTitle, albumUrl, artistUrl) {
        const existing = document.getElementById("gft-lyric-card-modal");
        if (existing) existing.remove();
        const isDarkMode = localStorage.getItem(DARK_MODE_STORAGE_KEY) === "true";
        const overlay = document.createElement("div");
        overlay.id = "gft-lyric-card-modal";
        overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.85); z-index: 10001;
        display: flex; justify-content: center; align-items: center;
        backdrop-filter: blur(5px);
    `;
        const modal = document.createElement("div");
        modal.className = isDarkMode ? "gft-preview-modal gft-dark-mode" : "gft-preview-modal";
        modal.style.cssText = `
        position: relative;
        top: auto;
        left: auto;
        transform: none;
        background: ${isDarkMode ? "#222" : "white"};
        color: ${isDarkMode ? "#eee" : "#222"};
        padding: 30px 20px 20px 20px; border-radius: 12px;
        max-width: 90%; max-height: 90vh;
        display: flex; flex-direction: column; gap: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    `;
        const closeIcon = document.createElement("button");
        closeIcon.innerHTML = "&times;";
        closeIcon.style.cssText = `
        position: absolute; top: 10px; right: 15px;
        background: none; border: none; font-size: 28px;
        color: ${isDarkMode ? "#aaa" : "#666"}; cursor: pointer;
        line-height: 1; padding: 0;
    `;
        closeIcon.onmouseover = () => closeIcon.style.color = isDarkMode ? "white" : "black";
        closeIcon.onmouseout = () => closeIcon.style.color = isDarkMode ? "#aaa" : "#666";
        closeIcon.onclick = () => overlay.remove();
        modal.appendChild(closeIcon);
        const title = document.createElement("h3");
        title.style.margin = "0";
        title.style.display = "flex";
        title.style.alignItems = "baseline";
        title.style.gap = "8px";
        const titleText = document.createTextNode(getTranslation("lc_modal_title"));
        title.appendChild(titleText);
        const versionSpan = document.createElement("span");
        versionSpan.textContent = "v2.7.1";
        versionSpan.style.fontSize = "11px";
        versionSpan.style.color = isDarkMode ? "#888" : "#aaa";
        versionSpan.style.fontWeight = "normal";
        versionSpan.style.fontFamily = "monospace";
        title.appendChild(versionSpan);
        modal.appendChild(title);
        const canvasContainer = document.createElement("div");
        canvasContainer.style.cssText = "overflow: hidden; border-radius: 8px; border: 2px solid #555; display: flex; justify-content: center;";
        const canvas = document.createElement("canvas");
        canvas.style.cssText = "max-width: 100%; max-height: 60vh; width: auto; height: auto; display: block;";
        canvasContainer.appendChild(canvas);
        modal.appendChild(canvasContainer);
        const controls = document.createElement("div");
        controls.style.cssText = "display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;";
        const imageSelector = document.createElement("select");
        imageSelector.className = "gft-tutorial-button";
        imageSelector.style.background = isDarkMode ? "#444" : "#eee";
        imageSelector.style.color = isDarkMode ? "white" : "black";
        imageSelector.style.maxWidth = "200px";
        imageSelector.style.cursor = "pointer";
        const optionAlbum = document.createElement("option");
        optionAlbum.value = "ALBUM";
        optionAlbum.text = getTranslation("lc_album_default");
        imageSelector.appendChild(optionAlbum);
        const allArtists = [.../* @__PURE__ */ new Set([...GFT_STATE.currentMainArtists, ...GFT_STATE.currentFeaturingArtists])].filter(Boolean);
        const artistImageCache = {};
        allArtists.forEach((art) => {
          const opt = document.createElement("option");
          opt.value = art;
          opt.text = `\u{1F464} ${art}`;
          imageSelector.appendChild(opt);
        });
        const optionSearch = document.createElement("option");
        optionSearch.value = "MANUAL_SEARCH";
        optionSearch.text = getTranslation("lc_manual_search");
        imageSelector.appendChild(optionSearch);
        let currentFormat = "16:9";
        const toggleFormatBtn = document.createElement("button");
        toggleFormatBtn.textContent = getTranslation("lc_format_btn") + "16:9";
        toggleFormatBtn.className = "gft-tutorial-button";
        toggleFormatBtn.style.background = isDarkMode ? "#444" : "#eee";
        toggleFormatBtn.style.color = isDarkMode ? "white" : "black";
        toggleFormatBtn.onclick = () => {
          currentFormat = currentFormat === "16:9" ? "1:1" : "16:9";
          toggleFormatBtn.textContent = getTranslation("lc_format_btn") + currentFormat;
          imageSelector.dispatchEvent(new Event("change"));
        };
        controls.appendChild(imageSelector);
        controls.appendChild(toggleFormatBtn);
        const searchWrapper = document.createElement("div");
        searchWrapper.style.cssText = "display: none; flex-direction: column; gap: 5px; width: 100%; align-items: center; margin-top: 10px; background: rgba(0,0,0,0.1); padding: 10px; border-radius: 8px;";
        const inputContainer = document.createElement("div");
        inputContainer.style.cssText = "width: 100%; display: flex; justify-content: center;";
        const searchInput = document.createElement("input");
        searchInput.type = "text";
        searchInput.placeholder = getTranslation("lc_search_placeholder");
        searchInput.style.cssText = `
        padding: 8px 12px; border-radius: 4px; border: 1px solid #555; width: 100%;
        background: ${isDarkMode ? "#333" : "#fff"}; color: ${isDarkMode ? "#fff" : "#000"};
    `;
        inputContainer.appendChild(searchInput);
        const searchResultsContainer = document.createElement("div");
        searchResultsContainer.style.cssText = "display: flex; flex-direction: column; gap: 5px; width: 100%; max-height: 250px; overflow-y: auto; margin-top: 5px; scrollbar-width: thin;";
        let debounceTimer;
        searchInput.oninput = () => {
          clearTimeout(debounceTimer);
          const query = searchInput.value.trim();
          if (!query) {
            searchResultsContainer.innerHTML = "";
            return;
          }
          debounceTimer = setTimeout(async () => {
            searchResultsContainer.innerHTML = '<div style="text-align:center; padding:10px; opacity:0.6;">' + getTranslation("lc_search_searching") + "</div>";
            try {
              const candidates = await searchArtistCandidates(query);
              searchResultsContainer.innerHTML = "";
              if (candidates && candidates.length > 0) {
                candidates.forEach((cand) => {
                  const item = document.createElement("div");
                  item.style.cssText = `
                             display: flex; align-items: center; gap: 10px; padding: 6px; 
                             border-radius: 6px; cursor: pointer; transition: background 0.1s;
                             background: ${isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"};
                         `;
                  item.onmouseover = () => item.style.background = isDarkMode ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)";
                  item.onmouseout = () => item.style.background = isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
                  const img = document.createElement("img");
                  img.src = cand.image_url;
                  img.style.cssText = "width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 1px solid transparent; flex-shrink: 0;";
                  const infoDiv = document.createElement("div");
                  infoDiv.style.flex = "1";
                  infoDiv.style.minWidth = "0";
                  const nameDiv = document.createElement("div");
                  nameDiv.textContent = cand.name;
                  nameDiv.style.fontWeight = "bold";
                  nameDiv.style.whiteSpace = "nowrap";
                  nameDiv.style.overflow = "hidden";
                  nameDiv.style.textOverflow = "ellipsis";
                  infoDiv.appendChild(nameDiv);
                  item.appendChild(img);
                  item.appendChild(infoDiv);
                  item.onclick = () => {
                    const newOption = document.createElement("option");
                    newOption.value = "SEARCH_RESULT_" + Date.now();
                    newOption.text = "\u{1F464} " + cand.name;
                    imageSelector.appendChild(newOption);
                    newOption.selected = true;
                    artistImageCache[newOption.value] = cand.image_url;
                    updateCard(cand.image_url, artistName);
                    searchResultsContainer.innerHTML = "";
                    searchInput.value = "";
                    searchWrapper.style.display = "none";
                    imageSelector.dispatchEvent(new Event("change"));
                    showFeedbackMessage(getTranslation("lc_img_applied") + " " + cand.name, 2e3);
                  };
                  searchResultsContainer.appendChild(item);
                });
              } else {
                searchResultsContainer.innerHTML = '<div style="text-align:center; padding:10px; opacity:0.6;">' + getTranslation("lc_search_none") + "</div>";
              }
            } catch (e) {
              console.error(e);
              searchResultsContainer.innerHTML = '<div style="text-align:center; padding:10px; color:red;">' + getTranslation("lc_error_search") + "</div>";
            }
          }, 300);
        };
        searchWrapper.appendChild(inputContainer);
        searchWrapper.appendChild(searchResultsContainer);
        controls.appendChild(searchWrapper);
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.style.display = "none";
        let currentUploadedImage = null;
        const uploadBtn = document.createElement("button");
        uploadBtn.textContent = getTranslation("lc_upload_btn");
        uploadBtn.className = "gft-tutorial-button";
        uploadBtn.style.background = isDarkMode ? "#444" : "#eee";
        uploadBtn.style.color = isDarkMode ? "white" : "black";
        uploadBtn.onclick = () => fileInput.click();
        fileInput.onchange = (e) => {
          if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
              currentUploadedImage = event.target.result;
              let customOpt = imageSelector.querySelector('option[value="CUSTOM"]');
              if (!customOpt) {
                customOpt = document.createElement("option");
                customOpt.value = "CUSTOM";
                customOpt.text = "\u{1F4C2} Image import\xE9e";
                imageSelector.appendChild(customOpt);
              }
              customOpt.selected = true;
              updateCard(currentUploadedImage, artistName);
            };
            reader.readAsDataURL(e.target.files[0]);
          }
        };
        const downloadBtn = document.createElement("button");
        downloadBtn.textContent = getTranslation("lc_download_btn");
        downloadBtn.className = "gft-tutorial-button";
        downloadBtn.style.background = "#f9ff55";
        downloadBtn.style.color = "black";
        downloadBtn.style.fontWeight = "bold";
        const shareXBtn = document.createElement("button");
        shareXBtn.textContent = getTranslation("lc_share_btn");
        shareXBtn.className = "gft-tutorial-button";
        shareXBtn.style.background = "black";
        shareXBtn.style.color = "white";
        shareXBtn.style.fontWeight = "bold";
        shareXBtn.style.marginLeft = "5px";
        shareXBtn.onclick = async () => {
          try {
            shareXBtn.textContent = getTranslation("lc_share_copying");
            canvas.toBlob(async (blob) => {
              try {
                if (!blob) throw new Error("Canvas blob failed");
                const item = new ClipboardItem({ "image/png": blob });
                await navigator.clipboard.write([item]);
                shareXBtn.textContent = getTranslation("lc_share_copied");
                const tweetText = `${songTitle} by ${artistName}

${window.location.href}

#Genius #Lyrics`;
                const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
                const width = 600;
                const height = 450;
                const left = window.innerWidth / 2 - width / 2 + window.screenX;
                const top = window.innerHeight / 2 - height / 2 + window.screenY;
                window.open(intentUrl, "share-x", `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`);
                showFeedbackMessage(getTranslation("lc_img_copied_tweet"), 6e3);
                setTimeout(() => shareXBtn.textContent = getTranslation("lc_share_btn"), 3e3);
              } catch (innerErr) {
                console.error("Clipboard write failed", innerErr);
                showFeedbackMessage(getTranslation("lc_error_copy"));
                shareXBtn.textContent = getTranslation("lc_share_error");
              }
            }, "image/png");
          } catch (err) {
            console.error("Share failed", err);
            shareXBtn.textContent = getTranslation("lc_share_error");
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
          if (imageUrl.startsWith("data:")) {
            img.src = imageUrl;
          } else {
            img.crossOrigin = "Anonymous";
            const separator = imageUrl.includes("?") ? "&" : "?";
            img.src = `${imageUrl}${separator}t=${Date.now()}`;
          }
          img.onload = () => {
            const dominantColor = getDominantColor(img);
            const contrastColor = getContrastColor(dominantColor);
            const logoUrl = chrome.runtime.getURL(contrastColor === "white" ? "images/geniuslogowhite.png" : "images/geniuslogoblack.png");
            const logoImg = new Image();
            logoImg.src = logoUrl;
            logoImg.onload = () => renderLyricCardToCanvas(canvas, text, displayArtistName, songTitle, img, dominantColor, contrastColor, logoImg, currentFormat);
            logoImg.onerror = () => renderLyricCardToCanvas(canvas, text, displayArtistName, songTitle, img, dominantColor, contrastColor, null, currentFormat);
          };
          img.onerror = (e) => {
            console.error("Image load fail", e);
            showFeedbackMessage(getTranslation("lc_feedback_load_error"));
          };
        };
        updateCard(albumUrl, artistName);
        imageSelector.onchange = async () => {
          const selectedValue = imageSelector.value;
          if (selectedValue === "MANUAL_SEARCH") {
            searchWrapper.style.display = "flex";
            searchInput.focus();
            return;
          } else {
            searchWrapper.style.display = "none";
          }
          if (selectedValue === "ALBUM") {
            updateCard(albumUrl, artistName);
          } else if (selectedValue === "CUSTOM") {
            if (currentUploadedImage) updateCard(currentUploadedImage, artistName);
          } else {
            const selectedArtistName = selectedValue;
            if (artistImageCache[selectedArtistName]) {
              updateCard(artistImageCache[selectedArtistName], artistName);
            } else {
              const originalText = imageSelector.options[imageSelector.selectedIndex].text;
              imageSelector.options[imageSelector.selectedIndex].text = "\u23F3 " + selectedArtistName;
              try {
                const fetchedUrl = await fetchArtistImageFromApi(selectedArtistName);
                if (fetchedUrl) {
                  artistImageCache[selectedArtistName] = fetchedUrl;
                  updateCard(fetchedUrl, artistName);
                  imageSelector.options[imageSelector.selectedIndex].text = "\u{1F464} " + selectedArtistName;
                } else {
                  showFeedbackMessage(getTranslation("lc_error_img_not_found") + " " + selectedArtistName, 3e3);
                  updateCard(albumUrl, artistName);
                  imageSelector.options[imageSelector.selectedIndex].text = "\u274C " + selectedArtistName;
                }
              } catch (e) {
                console.error(e);
                updateCard(albumUrl, artistName);
                imageSelector.options[imageSelector.selectedIndex].text = "\u274C " + selectedArtistName;
              }
            }
          }
        };
        fileInput.onchange = (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
              showFeedbackMessage(getTranslation("lc_img_loaded"));
              currentUploadedImage = evt.target.result;
              let customOpt = imageSelector.querySelector('option[value="CUSTOM"]');
              if (!customOpt) {
                customOpt = document.createElement("option");
                customOpt.value = "CUSTOM";
                customOpt.text = getTranslation("lc_custom_img");
                imageSelector.appendChild(customOpt);
              }
              customOpt.selected = true;
              imageSelector.dispatchEvent(new Event("change"));
            };
            reader.readAsDataURL(file);
          }
        };
        downloadBtn.onclick = () => {
          const link = document.createElement("a");
          link.download = `genius_lyric_card_${Date.now()}.png`;
          link.href = canvas.toDataURL("image/png");
          link.click();
          downloadBtn.textContent = getTranslation("lc_download_done");
          setTimeout(() => {
            downloadBtn.textContent = getTranslation("lc_download_btn");
          }, 2e3);
        };
        overlay.onclick = (e) => {
          if (e.target === overlay) overlay.remove();
        };
      }
      async function generateLyricsCard() {
        const selection = window.getSelection();
        if (!selection || selection.toString().trim().length === 0) {
          showFeedbackMessage(getTranslation("lc_select_text_error"));
          return;
        }
        const text = selection.toString().trim();
        const songTitle = GFT_STATE.currentSongTitle || "Titre Inconnu";
        const artistName = GFT_STATE.currentMainArtists.length > 0 ? GFT_STATE.currentMainArtists.join(" & ") : "Artiste Inconnu";
        let candidateUrls = [];
        const ogImage = document.querySelector('meta[property="og:image"]');
        if (ogImage && ogImage.content) candidateUrls.push(ogImage.content);
        const twitterImage = document.querySelector('meta[name="twitter:image"]');
        if (twitterImage && twitterImage.content) candidateUrls.push(twitterImage.content);
        const headerImg = document.querySelector('div[class*="SongHeader"] img') || document.querySelector('img[class*="CoverArt"]');
        if (headerImg && headerImg.src) candidateUrls.push(headerImg.src);
        const uniqueUrls = [...new Set(candidateUrls)];
        if (uniqueUrls.length === 0) {
          showFeedbackMessage(getTranslation("lc_error_album_not_found"));
          return;
        }
        const albumUrl = uniqueUrls[0];
        showFeedbackMessage(getTranslation("lc_searching_artist"), 0);
        const primaryArtistName = GFT_STATE.currentMainArtists.length > 0 ? GFT_STATE.currentMainArtists[0] : null;
        let artistUrl = await fetchArtistImageFromApi(primaryArtistName);
        if (!artistUrl) {
          console.log("[GFT] API failed, using DOM fallback.");
          artistUrl = extractArtistImage(albumUrl);
        }
        showFeedbackMessage(getTranslation("lc_generating"), 2e3);
        if (typeof showLyricCardPreviewModal === "function") {
          showLyricCardPreviewModal(text, artistName, songTitle, albumUrl, artistUrl);
        } else {
          console.error("[GFT] CRITICAL: showLyricCardPreviewModal is undefined!");
          showFeedbackMessage(getTranslation("lc_error_internal"));
        }
      }
      async function fetchArtistImageFromApi(artistName, forceSearch = false) {
        let songId = null;
        if (!forceSearch) {
          try {
            const metaNewRelic = document.querySelector('meta[name="newrelic-resource-path"]');
            if (metaNewRelic && metaNewRelic.content) {
              const match = metaNewRelic.content.match(/songs\/(\d+)/);
              if (match && match[1]) songId = match[1];
            }
            if (!songId) {
              const metaApp = document.querySelector('meta[name="twitter:app:url:iphone"]') || document.querySelector('meta[name="twitter:app:url:googleplay"]');
              if (metaApp && metaApp.content) {
                const match = metaApp.content.match(/songs\/(\d+)/);
                if (match && match[1]) songId = match[1];
              }
            }
            if (!songId) {
              const htmlHead = document.body.innerHTML.substring(0, 5e4);
              const match = htmlHead.match(/"id":(\d+),"_type":"song"/);
              if (match && match[1]) songId = match[1];
            }
            if (songId) {
              console.log("[GFT] Fetching artist image via Song ID:", songId);
              showFeedbackMessage(getTranslation("lc_fetching_id"), 0);
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
        if (artistName && artistName !== "Artiste Inconnu") {
          try {
            console.log("[GFT] ID not found. Searching API for:", artistName);
            showFeedbackMessage(getTranslation("lc_searching_name") + ' "' + artistName + '"...', 0);
            let expectedUrl = null;
            try {
              const allLinks = Array.from(document.querySelectorAll("a"));
              const artistLink = allLinks.find(
                (a) => a.textContent.trim() === artistName && a.href.includes("genius.com/artists/")
              );
              if (artistLink) {
                expectedUrl = artistLink.href;
                console.log("[GFT] Found expected artist URL in DOM:", expectedUrl);
              }
            } catch (domErr) {
              console.error(domErr);
            }
            const searchUrl = `https://genius.com/api/search/multi?per_page=5&q=${encodeURIComponent(artistName)}`;
            const response = await fetch(searchUrl);
            if (response.ok) {
              const data = await response.json();
              const sections = data.response?.sections;
              if (sections) {
                const artistSection = sections.find((s) => s.type === "artist");
                if (artistSection && artistSection.hits && artistSection.hits.length > 0) {
                  let targetHit = null;
                  if (expectedUrl) {
                    targetHit = artistSection.hits.find((h) => h.result && h.result.url === expectedUrl);
                  }
                  if (!targetHit) {
                    targetHit = artistSection.hits.find((h) => h.result && h.result.name.toLowerCase() === artistName.toLowerCase());
                  }
                  if (!targetHit) {
                    try {
                      const escapedName = artistName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                      const wordBoundaryRegex = new RegExp(`\\b${escapedName}\\b`, "i");
                      targetHit = artistSection.hits.find((h) => h.result && wordBoundaryRegex.test(h.result.name));
                      if (targetHit) console.log("[GFT] Found via Word Boundary Match:", targetHit.result.name);
                    } catch (regexErr) {
                      console.warn(regexErr);
                    }
                  }
                  if (!targetHit) {
                    targetHit = artistSection.hits[0];
                    console.log("[GFT] No exact/boundary match, using first hit (risky):", targetHit.result.name);
                  }
                  if (targetHit && targetHit.result && targetHit.result.image_url) {
                    console.log("[GFT] Found via Search API:", targetHit.result.image_url);
                    showFeedbackMessage(getTranslation("lc_img_found"), 1e3);
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
        showFeedbackMessage(getTranslation("lc_api_error"), 1e3);
        return null;
      }
      async function searchArtistCandidates(query) {
        try {
          const searchUrl = `https://genius.com/api/search/artist?q=${encodeURIComponent(query)}`;
          const response = await fetch(searchUrl);
          if (response.ok) {
            const data = await response.json();
            const sections = data.response?.sections;
            if (sections && sections[0] && sections[0].hits) {
              return sections[0].hits.map((h) => h.result).filter((r) => r.image_url);
            }
          }
        } catch (e) {
          console.warn("[GFT] Search Candidates failed:", e);
        }
        return [];
      }
      function getDominantColor(img) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
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
      function getContrastColor(rgbString) {
        const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (!match) return "white";
        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        const yiq = (r * 299 + g * 587 + b * 114) / 1e3;
        return yiq >= 128 ? "black" : "white";
      }
      function gftToggleHeaderFeat() {
        if (typeof isHeaderFeatEnabled === "function" && typeof setHeaderFeatEnabled === "function") {
          const newState = !isHeaderFeatEnabled();
          setHeaderFeatEnabled(newState);
          showFeedbackMessage(newState ? "\u2705 Inclure Feats dans l'en-t\xEAte" : "\u274C Feats masqu\xE9s dans l'en-t\xEAte", 2e3, GFT_STATE.shortcutsContainerElement || document.body);
        }
      }
      function gftToggleTagNewlines() {
        if (typeof isTagNewlinesDisabled === "function" && typeof setTagNewlinesDisabled === "function") {
          const currentValue = isTagNewlinesDisabled();
          const newState = !currentValue;
          setTagNewlinesDisabled(newState);
          showFeedbackMessage(!newState ? "\u2705 Saut de ligne apr\xE8s tags ACTIV\xC9" : "\u274C Saut de ligne apr\xE8s tags D\xC9SACTIV\xC9", 2e3, GFT_STATE.shortcutsContainerElement || document.body);
        }
      }
      function gftToggleDarkMode() {
        const isDark = document.body.classList.toggle("gft-dark-mode");
        localStorage.setItem("gftDarkModeEnabled", isDark);
        const tooltips = document.querySelectorAll(".gft-tooltip");
        tooltips.forEach((t) => {
          if (isDark) t.classList.add("gft-dark-mode");
          else t.classList.remove("gft-dark-mode");
        });
        const menu = document.getElementById("gft-settings-menu");
        if (menu) {
          if (isDark) menu.classList.add("gft-dark-mode");
          else menu.classList.remove("gft-dark-mode");
        }
        const container = document.getElementById(SHORTCUTS_CONTAINER_ID);
        if (container) {
          container.classList.remove("gft-dark-mode");
        }
      }
      function applyStoredPreferences() {
        const isDarkMode = localStorage.getItem(DARK_MODE_STORAGE_KEY) === "true";
        if (isDarkMode) {
          document.body.classList.add(DARK_MODE_CLASS);
        } else {
          document.body.classList.remove(DARK_MODE_CLASS);
        }
      }
      function showFeedbackMessage(message, duration = 3e3, container = null) {
        let feedbackEl = document.getElementById(FEEDBACK_MESSAGE_ID);
        if (!feedbackEl) {
          let toast = document.getElementById("gft-global-toast");
          if (!toast) {
            toast = document.createElement("div");
            toast.id = "gft-global-toast";
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
          feedbackEl.style.display = "block";
        }
        if (GFT_STATE.feedbackTimeout) {
          clearTimeout(GFT_STATE.feedbackTimeout);
          GFT_STATE.feedbackTimeout = null;
        }
        if (GFT_STATE.feedbackAnimationTimeout) {
          clearTimeout(GFT_STATE.feedbackAnimationTimeout);
          GFT_STATE.feedbackAnimationTimeout = null;
        }
        feedbackEl.textContent = message;
        feedbackEl.style.display = "block";
        requestAnimationFrame(() => {
          feedbackEl.style.visibility = "visible";
          feedbackEl.style.opacity = "1";
          if (feedbackEl.id === FEEDBACK_MESSAGE_ID) {
            feedbackEl.style.maxHeight = "100px";
            feedbackEl.style.marginTop = "10px";
            feedbackEl.style.marginBottom = "10px";
            feedbackEl.style.paddingTop = "8px";
            feedbackEl.style.paddingBottom = "8px";
          }
        });
        if (duration > 0) {
          GFT_STATE.feedbackTimeout = setTimeout(() => {
            feedbackEl.style.opacity = "0";
            if (feedbackEl.id === FEEDBACK_MESSAGE_ID) {
              feedbackEl.style.maxHeight = "0";
              feedbackEl.style.marginTop = "0";
              feedbackEl.style.marginBottom = "0";
              feedbackEl.style.paddingTop = "0";
              feedbackEl.style.paddingBottom = "0";
            }
            GFT_STATE.feedbackAnimationTimeout = setTimeout(() => {
              feedbackEl.style.visibility = "hidden";
              if (feedbackEl.id === "gft-global-toast") {
              } else {
                feedbackEl.style.display = "none";
              }
              GFT_STATE.feedbackAnimationTimeout = null;
            }, 300);
            GFT_STATE.feedbackTimeout = null;
          }, duration);
        }
      }
      function getCustomButtons() {
        try {
          const stored = localStorage.getItem(CUSTOM_BUTTONS_STORAGE_KEY);
          return stored ? JSON.parse(stored) : [];
        } catch (e) {
          console.error("Erreur lecture boutons custom:", e);
          return [];
        }
      }
      function saveCustomButton(buttonData) {
        const buttons = getCustomButtons();
        buttonData.id = buttonData.id || "custom_" + Date.now();
        buttonData.createdAt = buttonData.createdAt || Date.now();
        buttons.push(buttonData);
        localStorage.setItem(CUSTOM_BUTTONS_STORAGE_KEY, JSON.stringify(buttons));
        return buttonData;
      }
      function deleteCustomButton(id) {
        let buttons = getCustomButtons();
        buttons = buttons.filter((b) => b.id !== id);
        localStorage.setItem(CUSTOM_BUTTONS_STORAGE_KEY, JSON.stringify(buttons));
      }
      function exportCustomButtons() {
        const buttons = getCustomButtons();
        const json = JSON.stringify(buttons);
        return "GFT-PRESET-" + btoa(unescape(encodeURIComponent(json)));
      }
      function importCustomButtons(code) {
        try {
          if (!code.startsWith("GFT-PRESET-")) throw new Error("Format invalide");
          const base64 = code.replace("GFT-PRESET-", "");
          const json = decodeURIComponent(escape(atob(base64)));
          const newButtons = JSON.parse(json);
          if (!Array.isArray(newButtons)) throw new Error("Donn\xE9es invalides");
          const currentButtons = getCustomButtons();
          const merged = [...currentButtons, ...newButtons];
          const unique = merged.filter(
            (btn, index, self) => index === self.findIndex((t) => t.label === btn.label && t.content === btn.content && t.regex === btn.regex)
          );
          localStorage.setItem(CUSTOM_BUTTONS_STORAGE_KEY, JSON.stringify(unique));
          return true;
        } catch (e) {
          console.error("Import failed:", e);
          return false;
        }
      }
      function openCustomButtonManager(defaultType = "structure", initialTab = "create") {
        const existing = document.getElementById("gft-custom-manager");
        if (existing) existing.remove();
        const isDarkMode = localStorage.getItem(DARK_MODE_STORAGE_KEY) === "true";
        const overlay = document.createElement("div");
        overlay.id = "gft-custom-manager";
        overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8); z-index: 10005;
        display: flex; justify-content: center; align-items: center;
        backdrop-filter: blur(5px);
    `;
        overlay.onclick = (e) => {
          if (e.target === overlay) overlay.remove();
        };
        const modal = document.createElement("div");
        modal.className = `gft-custom-manager-modal ${isDarkMode ? "gft-dark-mode" : ""}`;
        modal.style.background = isDarkMode ? "#222" : "white";
        modal.style.color = isDarkMode ? "#eee" : "#222";
        modal.style.padding = "24px";
        modal.style.borderRadius = "12px";
        modal.style.boxShadow = "0 20px 50px rgba(0,0,0,0.5)";
        modal.style.position = "relative";
        const header = document.createElement("div");
        header.style.display = "flex";
        header.style.justifyContent = "space-between";
        header.style.alignItems = "center";
        header.innerHTML = `<h2 style="margin:0; font-size:20px; font-weight:700;">${getTranslation("custom_manager_title")}</h2>`;
        const closeBtn = document.createElement("button");
        closeBtn.innerHTML = "&times;";
        closeBtn.style.background = "none";
        closeBtn.style.border = "none";
        closeBtn.style.fontSize = "28px";
        closeBtn.style.cursor = "pointer";
        closeBtn.style.color = "inherit";
        closeBtn.style.opacity = "0.5";
        closeBtn.onmouseenter = () => closeBtn.style.opacity = "1";
        closeBtn.onmouseleave = () => closeBtn.style.opacity = "0.5";
        closeBtn.onclick = () => overlay.remove();
        header.appendChild(closeBtn);
        modal.appendChild(header);
        const tabsContainer = document.createElement("div");
        tabsContainer.className = "gft-tabs";
        const tabCreate = document.createElement("button");
        tabCreate.className = "gft-tab-btn active";
        tabCreate.textContent = getTranslation("custom_manager_tab_create");
        const tabManage = document.createElement("button");
        tabManage.className = "gft-tab-btn";
        tabManage.textContent = getTranslation("custom_manager_tab_library");
        tabsContainer.appendChild(tabCreate);
        tabsContainer.appendChild(tabManage);
        modal.appendChild(tabsContainer);
        const contentCreate = document.createElement("div");
        contentCreate.style.display = "flex";
        contentCreate.style.flexDirection = "column";
        contentCreate.style.gap = "5px";
        const typeGroup = document.createElement("div");
        typeGroup.className = "gft-form-group";
        typeGroup.innerHTML = `<label class="gft-form-label">${getTranslation("custom_mgr_action_type")}</label>`;
        const typeSelect = document.createElement("select");
        typeSelect.className = "gft-form-select";
        typeSelect.innerHTML = `
        <option value="structure">\u{1F3D7}\uFE0F ${getTranslation("custom_mgr_type_structure")}</option>
        <option value="cleanup">\u{1F9F9} ${getTranslation("custom_mgr_type_cleanup")}</option>
    `;
        typeSelect.value = defaultType;
        typeGroup.appendChild(typeSelect);
        contentCreate.appendChild(typeGroup);
        const nameGroup = document.createElement("div");
        nameGroup.className = "gft-form-group";
        nameGroup.innerHTML = `<label class="gft-form-label">${getTranslation("custom_mgr_button_label")}</label>`;
        const nameInput = document.createElement("input");
        nameInput.className = "gft-form-input";
        nameInput.maxLength = 25;
        nameInput.placeholder = getTranslation("custom_mgr_btn_label_placeholder");
        nameGroup.appendChild(nameInput);
        contentCreate.appendChild(nameGroup);
        const previewZone = document.createElement("div");
        previewZone.className = "gft-preview-zone";
        previewZone.innerHTML = `<div style="font-size:10px; opacity:0.5; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Preview</div>`;
        const previewBtn = document.createElement("button");
        previewBtn.className = "gft-shortcut-button";
        previewBtn.style.pointerEvents = "none";
        previewBtn.textContent = "Label";
        previewZone.appendChild(previewBtn);
        contentCreate.appendChild(previewZone);
        nameInput.oninput = () => {
          previewBtn.textContent = nameInput.value.trim() || "Label";
        };
        const dynamicFields = document.createElement("div");
        const renderDynamicFields = () => {
          dynamicFields.innerHTML = "";
          const type = typeSelect.value;
          previewBtn.className = type === "structure" ? "gft-shortcut-button gft-btn-struct" : "gft-shortcut-button gft-btn-cleanup";
          if (type === "structure") {
            const grp = document.createElement("div");
            grp.className = "gft-form-group";
            grp.innerHTML = `<label class="gft-form-label">${getTranslation("custom_mgr_text_to_insert")}</label>`;
            const input = document.createElement("textarea");
            input.id = "gft-custom-content";
            input.className = "gft-form-textarea";
            input.placeholder = "[Verse]\n";
            input.rows = 3;
            grp.appendChild(input);
            dynamicFields.appendChild(grp);
          } else {
            const switchesRow = document.createElement("div");
            switchesRow.style.display = "flex";
            switchesRow.style.gap = "15px";
            switchesRow.style.marginBottom = "12px";
            const modeSwitch = document.createElement("div");
            modeSwitch.style.display = "flex";
            modeSwitch.style.alignItems = "center";
            modeSwitch.style.gap = "5px";
            modeSwitch.style.fontSize = "12px";
            const chk = document.createElement("input");
            chk.type = "checkbox";
            chk.id = "gft-advanced-regex";
            chk.style.width = "16px";
            chk.style.height = "16px";
            const lbl = document.createElement("label");
            lbl.htmlFor = "gft-advanced-regex";
            lbl.textContent = getTranslation("custom_mgr_advanced_regex");
            lbl.style.cursor = "pointer";
            modeSwitch.appendChild(chk);
            modeSwitch.appendChild(lbl);
            switchesRow.appendChild(modeSwitch);
            const caseSwitch = document.createElement("div");
            caseSwitch.style.display = "flex";
            caseSwitch.style.alignItems = "center";
            caseSwitch.style.gap = "5px";
            caseSwitch.style.fontSize = "12px";
            const chkCase = document.createElement("input");
            chkCase.type = "checkbox";
            chkCase.id = "gft-case-sensitive";
            chkCase.style.width = "16px";
            chkCase.style.height = "16px";
            const lblCase = document.createElement("label");
            lblCase.htmlFor = "gft-case-sensitive";
            lblCase.textContent = getTranslation("custom_mgr_case_sensitive");
            lblCase.style.cursor = "pointer";
            caseSwitch.appendChild(chkCase);
            caseSwitch.appendChild(lblCase);
            switchesRow.appendChild(caseSwitch);
            dynamicFields.appendChild(switchesRow);
            const grpFind = document.createElement("div");
            grpFind.className = "gft-form-group";
            grpFind.innerHTML = `<label class="gft-form-label">${getTranslation("custom_mgr_find_pattern")}</label>`;
            const inputFind = document.createElement("input");
            inputFind.id = "gft-custom-find";
            inputFind.className = "gft-form-input";
            grpFind.appendChild(inputFind);
            dynamicFields.appendChild(grpFind);
            const grpRep = document.createElement("div");
            grpRep.className = "gft-form-group";
            grpRep.innerHTML = `<label class="gft-form-label">${getTranslation("custom_mgr_replace_with")}</label>`;
            const inputRep = document.createElement("input");
            inputRep.id = "gft-custom-replace";
            inputRep.className = "gft-form-input";
            inputRep.placeholder = getTranslation("custom_mgr_replace_placeholder");
            grpRep.appendChild(inputRep);
            dynamicFields.appendChild(grpRep);
            chk.onchange = () => {
              if (chk.checked) {
                inputFind.placeholder = getTranslation("custom_mgr_find_placeholder_regex");
              } else {
                inputFind.placeholder = getTranslation("custom_mgr_find_placeholder_exact");
              }
            };
            chk.dispatchEvent(new Event("change"));
          }
        };
        renderDynamicFields();
        typeSelect.onchange = renderDynamicFields;
        contentCreate.appendChild(dynamicFields);
        const saveBtn = document.createElement("button");
        saveBtn.textContent = getTranslation("custom_mgr_save_button");
        saveBtn.className = "gft-tutorial-button";
        saveBtn.style.cssText = "background: #f9ff55; color: black; border: none; padding: 12px; font-weight: bold; border-radius: 8px; cursor: pointer; margin-top: 10px; width: 100%; font-size:15px;";
        saveBtn.onclick = () => {
          const type = typeSelect.value;
          const label = nameInput.value.trim();
          if (!label) return alert(getTranslation("custom_mgr_error_no_label"));
          const btnData = {
            label,
            type
          };
          if (type === "structure") {
            const content = document.getElementById("gft-custom-content").value;
            if (!content) return alert(getTranslation("custom_mgr_error_no_content"));
            btnData.content = content;
          } else {
            const find = document.getElementById("gft-custom-find").value;
            const rep = document.getElementById("gft-custom-replace").value;
            const isRegex = document.getElementById("gft-advanced-regex").checked;
            const isCaseSensitive = document.getElementById("gft-case-sensitive").checked;
            if (!find) return alert(getTranslation("custom_mgr_error_no_content"));
            btnData.regex = isRegex ? find : escapeRegExp(find);
            btnData.replacement = rep;
            btnData.isExplicitRegex = isRegex;
            btnData.isCaseSensitive = isCaseSensitive;
          }
          saveCustomButton(btnData);
          showFeedbackMessage(getTranslation("custom_mgr_success_created"), 3e3);
          overlay.remove();
          setTimeout(() => window.location.reload(), 1e3);
        };
        contentCreate.appendChild(saveBtn);
        modal.appendChild(contentCreate);
        const contentManage = document.createElement("div");
        contentManage.style.display = "none";
        const renderList = () => {
          contentManage.innerHTML = "";
          const list = document.createElement("div");
          list.className = "gft-custom-list";
          const buttons = getCustomButtons();
          if (buttons.length === 0) {
            list.innerHTML = `<div style="padding:30px; text-align:center; opacity:0.5; font-style:italic;">${getTranslation("custom_mgr_empty_library")}</div>`;
          } else {
            buttons.forEach((btn) => {
              const item = document.createElement("div");
              item.className = "gft-custom-item";
              const icon = btn.type === "structure" ? "\u{1F3D7}\uFE0F" : "\u{1F9F9}";
              const info = document.createElement("div");
              info.style.display = "flex";
              info.style.alignItems = "center";
              info.style.gap = "8px";
              info.innerHTML = `
                    <span style="font-size:18px;">${icon}</span>
                    <div style="display:flex; flex-direction:column;">
                        <span style="font-weight:600; font-size:14px;">${btn.label}</span>
                        <span style="font-size:10px; opacity:0.5; text-transform:uppercase; letter-spacing:0.5px;">${btn.type}</span>
                    </div>
                `;
              const actions = document.createElement("div");
              actions.style.display = "flex";
              actions.style.gap = "5px";
              const delBtn = document.createElement("button");
              delBtn.style.cssText = "background:rgba(255,0,0,0.1); border:none; padding:8px; border-radius:6px; cursor:pointer; color:#ff4444; font-size:14px;";
              delBtn.innerHTML = "\u{1F5D1}\uFE0F";
              delBtn.title = "Delete";
              delBtn.onclick = () => {
                if (confirm(`Delete "${btn.label}"?`)) {
                  deleteCustomButton(btn.id);
                  renderList();
                }
              };
              actions.appendChild(delBtn);
              item.appendChild(info);
              item.appendChild(actions);
              list.appendChild(item);
            });
          }
          contentManage.appendChild(list);
          const ioZone = document.createElement("div");
          ioZone.className = "gft-io-zone";
          ioZone.innerHTML = `<div style="font-weight:700; font-size:13px; margin-bottom:10px; display:flex; align-items:center; gap:5px;">\u{1F4E4} ${getTranslation("custom_mgr_share_presets")}</div>`;
          const codeArea = document.createElement("textarea");
          codeArea.className = "gft-code-area";
          codeArea.placeholder = getTranslation("custom_mgr_import_placeholder");
          const btnContainer = document.createElement("div");
          btnContainer.style.display = "flex";
          btnContainer.style.gap = "10px";
          btnContainer.style.marginTop = "10px";
          const exportBtn = document.createElement("button");
          exportBtn.textContent = getTranslation("custom_mgr_export_code");
          exportBtn.className = "gft-tutorial-button";
          exportBtn.style.flex = "1";
          exportBtn.style.fontSize = "12px";
          exportBtn.style.padding = "8px";
          exportBtn.onclick = () => {
            const code = exportCustomButtons();
            codeArea.value = code;
            codeArea.select();
            document.execCommand("copy");
            showFeedbackMessage(getTranslation("common_copy_success") || "Copied!", 2e3);
          };
          const importBtn = document.createElement("button");
          importBtn.textContent = getTranslation("custom_mgr_import_button");
          importBtn.className = "gft-tutorial-button";
          importBtn.style.flex = "1";
          importBtn.style.fontSize = "12px";
          importBtn.style.padding = "8px";
          importBtn.style.background = "#f9ff55";
          importBtn.style.color = "black";
          importBtn.onclick = () => {
            const code = codeArea.value.trim();
            if (!code) return;
            if (importCustomButtons(code)) {
              showFeedbackMessage(getTranslation("custom_mgr_success_imported"), 3e3);
              setTimeout(() => window.location.reload(), 1500);
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
        tabCreate.onclick = () => {
          tabCreate.classList.add("active");
          tabManage.classList.remove("active");
          contentCreate.style.display = "flex";
          contentManage.style.display = "none";
          renderDynamicFields();
        };
        tabManage.onclick = () => {
          tabManage.classList.add("active");
          tabCreate.classList.remove("active");
          contentManage.style.display = "block";
          contentCreate.style.display = "none";
          renderList();
        };
        if (initialTab === "library") {
          tabManage.onclick();
        } else {
          tabCreate.onclick();
        }
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
      }
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "GET_MODE") {
          sendResponse({ lyricCardOnly: isLyricCardOnlyMode() });
        } else if (request.action === "GET_STATUS") {
          sendResponse({
            lyricCardOnly: isLyricCardOnlyMode(),
            language: localStorage.getItem("gftLanguage") || "fr"
          });
        } else if (request.action === "SET_MODE") {
          setLyricCardOnlyMode(request.lyricCardOnly);
          sendResponse({ success: true });
          window.location.reload();
        } else if (request.action === "SET_LANGUAGE") {
          localStorage.setItem("gftLanguage", request.language);
          if (typeof setTranscriptionMode === "function") {
            setTranscriptionMode(request.language);
          }
          sendResponse({ success: true });
          window.location.reload();
        } else if (request.action === "RESET_TUTORIAL") {
          localStorage.removeItem("gft-tutorial-completed");
          showTutorial();
          sendResponse({ success: true });
        }
      });
      (function init() {
        const tutorialCompleted = localStorage.getItem("gft-tutorial-completed") === "true";
        const languageSet = localStorage.getItem("gftLanguage");
        if (!tutorialCompleted || !languageSet) {
          if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", showTutorial);
          } else {
            setTimeout(showTutorial, 500);
          }
        }
      })();
    }
  });
  require_content();
})();
