/**
 * build-modular-content.js
 * 
 * Builds the final modular src/content.js by:
 * 1. Adding module imports at the top
 * 2. Copying the remaining code from content.original.js (skipping extracted sections)
 * 3. Creating a clean, modular entry point
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const originalFile = path.join(ROOT, 'content.original.js');
const targetFile = path.join(ROOT, 'src', 'content.js');

console.log('🔨 Building modular src/content.js...\n');

const original = fs.readFileSync(originalFile, 'utf-8');
const lines = original.split('\r\n'); // Windows line endings

console.log(`📄 Original file: ${lines.length} lines\n`);

// ========== HEADER WITH IMPORTS ==========
const header = `// content.js (Version 3.1.0 - Modularized)
/**
 * @file Main entry point for "Genius Fast Transcriber" extension v3.1.0.
 * This script is injected into genius.com pages and enhances the lyrics editor.
 * 
 * Refactored using ES modules for better code organization and maintainability.
 * 
 * @author Lnkhey
 * @version 3.1.0
 */

console.log('Genius Fast Transcriber (by Lnkhey) v3.1.0 - Modularized! 🎵');

// ========== MODULE IMPORTS ==========
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

// Destructure state for easier access (backward compatibility)
let coupletCounter = state.coupletCounter;
let detectedArtists = state.detectedArtists;
let currentActiveEditor = state.currentActiveEditor;
let currentEditorType = state.currentEditorType;
let shortcutsContainerElement = state.shortcutsContainerElement;
let observer = state.observer;
let currentSongTitle = state.currentSongTitle;
let currentMainArtists = state.currentMainArtists;
let currentFeaturingArtists = state.currentFeaturingArtists;
let darkModeButton = state.darkModeButton;
let floatingFormattingToolbar = state.floatingFormattingToolbar;
let undoStack = state.undoStack;
let redoStack = state.redoStack;
let feedbackTimeout = state.feedbackTimeout;
let feedbackAnimationTimeout = state.feedbackAnimationTimeout;
`;

// ========== COPY REMAINING CODE ==========
// We need to skip:
// - Lines 1-63: Header + CSS injection (we keep CSS injection)
// - Lines 65-92: Global variables (extracted to constants.js)
// - Lines 93-125: Constants & SELECTORS (extracted to constants.js)
// - Lines 126-1082: TRANSLATIONS (extracted to translations/index.js)
// - Lines 1084-1523: Utility functions (extracted to utils.js)

// But we KEEP the CSS injection (lines 28-63)
const cssInjectionStart = lines.findIndex(l => l.includes('// ----- Injection des animations CSS essentielles -----'));
const cssInjectionEnd = lines.findIndex((l, i) => i > cssInjectionStart && l.includes('})();'));

console.log(`📦 Sections to extract:`);
console.log(`   • CSS Injection: lines ${cssInjectionStart + 1}-${cssInjectionEnd + 1}`);

const cssBlock = lines.slice(cssInjectionStart, cssInjectionEnd + 1).join('\r\n');

// Find where remaining code starts (after utility functions)
// The next substantive code after utils is around line 1524+
const remainingCodeStart = 1524; // After isValidNumber() and helper functions

console.log(`   • Main code starts: line ${remainingCodeStart + 1}\n`);

const remainingCode = lines.slice(remainingCodeStart).join('\r\n');

// ========== ASSEMBLE FINAL FILE ==========
const finalContent = [
    header,
    '',
    cssBlock,
    '',
    '// ========== REMAINING APPLICATION CODE ==========',
    '',
    remainingCode
].join('\r\n');

// Write to target
fs.writeFileSync(targetFile, finalContent, 'utf-8');

const finalLines = finalContent.split('\r\n').length;
console.log(`✅ Built modular src/content.js`);
console.log(`   • Original: ${lines.length} lines`);
console.log(`   • New: ${finalLines} lines`);
console.log(`   • Reduction: ${lines.length - finalLines} lines (~${Math.round((1 - finalLines / lines.length) * 100)}%)\n`);

console.log('🎉 Modularization complete!');
console.log('\nNext steps:');
console.log('  1. Run: npm run build');
console.log('  2. Test the extension in Chrome');
console.log('  3. Fix any runtime errors by updating state.xxx references');
