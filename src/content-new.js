// content.js (Version 3.1.0 - Modularized with esbuild)
/**
 * @file Main entry point for "Genius Fast Transcriber" extension v3.1.0.
 * This script is injected into genius.com pages and enhances the lyrics editor.
 * 
 * Refactored to use ES modules for better maintainability.
 * 
 * @author Lnkhey
 * @version 3.1.0
 */

console.log('Genius Fast Transcriber (by Lnkhey) v3.1.0 - Modularized! 🎵');

// ========== IMPORTS ==========
import { TRANSLATIONS } from './translations/index.js';
import {
    state,
    DARK_MODE_CLASS, DARK_MODE_STORAGE_KEY,
    HEADER_FEAT_STORAGE_KEY, DISABLE_TAG_NEWLINES_STORAGE_KEY,
    LYRIC_CARD_ONLY_STORAGE_KEY, PANEL_COLLAPSED_STORAGE_KEY,
    TRANSCRIPTION_MODE_STORAGE_KEY, CUSTOM_BUTTONS_STORAGE_KEY,
    MAX_HISTORY_SIZE,
    LYRICS_HELPER_HIGHLIGHT_CLASS, SHORTCUTS_CONTAINER_ID,
    ARTIST_SELECTOR_CONTAINER_ID, COUPLET_BUTTON_ID,
    FEEDBACK_MESSAGE_ID, GFT_VISIBLE_CLASS, FLOATING_TOOLBAR_ID,
    SELECTORS
} from './modules/constants.js';
import {
    formatListWithConjunction, getPluralForm, getTranslation,
    decodeHtmlEntities, cleanArtistName, escapeRegExp, formatArtistList,
    numberToFrenchWords, numberToEnglishWords, numberToPolishWords
} from './modules/utils.js';
import {
    isSectionTag, correctLineSpacing, applyTextTransformToDivEditor,
    applyAllTextCorrectionsToString, applyAllTextCorrectionsAsync
} from './modules/corrections.js';

// ========== PLACEHOLDER FOR REST OF CODE ==========
// The rest of the original content.js code will be inserted here
// This is just the import header for now
//
// TODO: Copy lines 1524+ from content.original.js (after utils section)
//       and update all references to global variables to use state.xxx

console.warn('⚠️ GFT: content.js imports are working, but main code not yet integrated');
