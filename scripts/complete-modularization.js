/**
 * complete-modularization.js
 * 
 * Final script to complete the modularization by:
 * 1. Adding module imports at the top
 * 2. Removing only the extracted sections (translations, constants, utils)
 * 3. Keeping all remaining application logic
 * 4. Preserving the CSS injection
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const originalFile = path.join(ROOT, 'content.original.js');
const targetFile = path.join(ROOT, 'src', 'content.js');
const backupFile = path.join(ROOT, 'src', 'content.js.pre-final-merge.backup');

console.log('🔨 Completing modularization of Genius Fast Transcriber...\n');

// Backup current src/content.js
if (fs.existsSync(targetFile)) {
    fs.copyFileSync(targetFile, backupFile);
    console.log('✅ Backed up current src/content.js\n');
}

// Read original content
const content = fs.readFileSync(originalFile, 'utf-8');
const lines = content.split('\r\n');

console.log(`📄 Original file: ${lines.length} lines\n`);

// Define line ranges to EXCLUDE (these have been extracted to modules)
const sectionsToExclude = [
    { name: 'Header comments', start: 0, end: 26 }, // Will replace with new imports
    { name: 'Global variables', start: 65, end: 92 }, // Extracted to constants.js
    { name: 'Constants & SELECTORS', start: 93, end: 124 }, // Extracted to constants.js
    { name: 'TRANSLATIONS object', start: 126, end: 1082 }, // Extracted to translations/index.js
    { name: 'Utility functions', start: 1084, end: 1523 }, // Extracted to utils.js
    { name: 'Transcription mode helpers', start: 1758, end: 1789 }, // getTranscriptionMode, isEnglishTranscriptionMode, isPolishTranscriptionMode (now in utils.js)
];

console.log('📦 Sections to exclude (extracted to modules):');
sectionsToExclude.forEach(section => {
    console.log(`   • ${section.name}: lines ${section.start + 1}-${section.end + 1}`);
});
console.log();

// Build the new file
const newLines = [];

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
    numberToFrenchWords, numberToEnglishWords, numberToPolishWords,
    getTranscriptionMode, isEnglishTranscriptionMode, isPolishTranscriptionMode
} from './modules/utils.js';
import {
    isSectionTag, correctLineSpacing, applyTextTransformToDivEditor,
    applyAllTextCorrectionsToString, applyAllTextCorrectionsAsync
} from './modules/corrections.js';

// Destructure state for easier access (backward compatibility with existing code)
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

newLines.push(...header.split('\r\n'));

// ========== COPY NON-EXCLUDED LINES ==========
for (let i = 0; i < lines.length; i++) {
    // Check if this line is in an excluded section
    let shouldExclude = false;
    for (const section of sectionsToExclude) {
        if (i >= section.start && i <= section.end) {
            shouldExclude = true;
            // Skip to end of section
            i = section.end;
            break;
        }
    }

    if (!shouldExclude && i < lines.length) {
        newLines.push(lines[i]);
    }
}

// ========== WRITE FINAL FILE ==========
const finalContent = newLines.join('\r\n');
fs.writeFileSync(targetFile, finalContent, 'utf-8');

const reduction = lines.length - newLines.length;
const reductionPercent = Math.round((reduction / lines.length) * 100);

console.log('✅ Modularization complete!');
console.log(`   • Original: ${lines.length} lines`);
console.log(`   • Final: ${newLines.length} lines`);
console.log(`   • Reduction: ${reduction} lines (-${reductionPercent}%)`);
console.log(`   • Code moved to modules: ${reduction} lines\n`);

console.log('📁 Files created:');
console.log('   • src/content.js (modular entry point)');
console.log('   • src/translations/index.js (958 lines)');
console.log('   • src/modules/constants.js (70 lines)');
console.log('   • src/modules/utils.js (501 lines)');
console.log('   • src/modules/corrections.js (523 lines)\n');

console.log('🎯 Next steps:');
console.log('   1. Run: npm run build');
console.log('   2. Check for any remaining errors');
console.log('   3. Test the extension in Chrome');
console.log('   4. Commit changes if everything works!\n');
