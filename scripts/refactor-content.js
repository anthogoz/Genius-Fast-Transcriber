/**
 * refactor-content.js
 * 
 * Transforms src/content.js to use imports from extracted modules
 * and removes the now-redundant inline code.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const srcContentFile = path.join(ROOT, 'src', 'content.js');
const backupFile = path.join(ROOT, 'src', 'content.js.backup');

console.log('📦 Refactoring src/content.js to use modular imports...\n');

// 1. Create backup
console.log('1️⃣  Creating backup...');
fs.copyFileSync(srcContentFile, backupFile);
console.log(`   ✅ Backup created: ${backupFile}\n`);

// 2. Read original content
const content = fs.readFileSync(srcContentFile, 'utf-8');
const lines = content.split('\n');

console.log(`2️⃣  Original file: ${lines.length} lines\n`);

// 3. Find line ranges to remove
const findLineIndex = (marker) => {
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(marker)) return i;
    }
    return -1;
};

// Variables globales: lignes ~65-92
const globalVarsStart = findLineIndex('// ----- Déclarations des variables globales -----');
const globalVarsEnd = findLineIndex('let feedbackAnimationTimeout = null;');

// Constantes: lignes ~93-124
const constantsStart = findLineIndex('// ----- Constantes Utiles -----');
const constantsEnd = findLineIndex("const SELECTORS = {") + 18; // End of SELECTORS object

// Translations: lignes ~126-1082
const translationsStart = findLineIndex('// ----- Traductions & Internationalisation -----');
const translationsEnd = findLineIndex('    }') + 1; // After closing Polish translations

// Utils: lignes ~1084-1523
const utilsStart = findLineIndex('function formatListWithConjunction(items, lang)');
const utilsEnd = findLineIndex('function isValidNumber(str)') + 5; // After isValidNumber

console.log('3️⃣  Identified sections to remove:');
console.log(`   • Global vars: lines ${globalVarsStart + 1}-${globalVarsEnd + 1}`);
console.log(`   • Constants: lines ${constantsStart + 1}-${constantsEnd + 1}`);
console.log(`   • Translations: lines ${translationsStart + 1}-${translationsEnd + 1}`);
console.log(`   • Utils: lines ${utilsStart + 1}-${utilsEnd + 1}\n`);

// 4. Build new content
const importsBlock = `// content.js (Version 3.1.0 - Modularized)
/**
 * @file Main entry point for "Genius Fast Transcriber" extension v3.1.0
 * This script is injected into genius.com pages and enhances the lyrics editor.
 * 
 * @author Lnkhey
 * @version 3.1.0
 */

console.log('Genius Fast Transcriber (by Lnkhey) v3.1.0 - All features active! 🎵');

// ----- Module Imports -----
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

// Re-export state variables for backward compatibility
let { 
    coupletCounter, detectedArtists, currentActiveEditor, currentEditorType,
    shortcutsContainerElement, observer, currentSongTitle,
    currentMainArtists, currentFeaturingArtists,
    darkModeButton, floatingFormattingToolbar,
    undoStack, redoStack, feedbackTimeout, feedbackAnimationTimeout
} = state;

`;

// Remove extracted sections and inject imports
const newLines = [];

// Add imports
newLines.push(...importsBlock.split('\n'));

// Skip original header (lines 0-63, before global vars)
let i = 0;

// Find where to start (after the CSS injection and console.log)
const cssInjectionEnd = findLineIndex('})();');
if (cssInjectionEnd >= 0) {
    i = cssInjectionEnd + 2; // Skip empty line after
}

// Skip global vars section
if (globalVarsStart >= 0 && i <= globalVarsStart) {
    i = globalVarsEnd + 2;
}

// Skip constants section
if (constantsStart >= 0 && i <= constantsStart) {
    i = constantsEnd + 2;
}

// Skip translations section
if (translationsStart >= 0 && i <= translationsStart) {
    i = translationsEnd + 2;
}

// Skip utils section
if (utilsStart >= 0 && i <= utilsStart) {
    i = utilsEnd + 2;
}

// Add remaining code (everything after utils)
while (i < lines.length) {
    newLines.push(lines[i]);
    i++;
}

// 5. Write new content
const newContent = newLines.join('\n');
fs.writeFileSync(srcContentFile, newContent, 'utf-8');

console.log('4️⃣  Refactored file written');
console.log(`   • New file: ${newLines.length} lines\n`);

console.log('🎉 Refactoring complete!');
console.log(`   • Original lines: ${lines.length}`);
console.log(`   • New lines: ${newLines.length}`);
console.log(`   • Reduction: ${lines.length - newLines.length} lines\n`);
console.log('Next: Run `npm run build` to test the refactored code.');
