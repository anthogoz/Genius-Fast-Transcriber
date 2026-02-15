/**
 * split-modules.js
 * 
 * Extracts specific code sections from content.original.js into separate module files.
 * This is a one-time migration script.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const originalFile = path.join(ROOT, 'content.original.js');
const srcDir = path.join(ROOT, 'src');

const content = fs.readFileSync(originalFile, 'utf-8');
const lines = content.split('\n');

// Helper: extract lines between startLine and endLine (1-indexed, inclusive)
function extractLines(startLine, endLine) {
    return lines.slice(startLine - 1, endLine).join('\n');
}

// Find line numbers for specific markers
function findLine(marker, startFrom = 0) {
    for (let i = startFrom; i < lines.length; i++) {
        if (lines[i].includes(marker)) return i + 1; // 1-indexed
    }
    return -1;
}

// ========== 1. Extract TRANSLATIONS ==========
console.log('📦 Extracting translations...');

// Find the TRANSLATIONS block: starts with "const TRANSLATIONS = {" and ends with "};"
const translationsStart = findLine('const TRANSLATIONS = {');
// Find the matching closing: it's "};' on its own line after the Polish section
let braceCount = 0;
let translationsEnd = -1;

for (let i = translationsStart - 1; i < lines.length; i++) {
    const line = lines[i];
    for (const ch of line) {
        if (ch === '{') braceCount++;
        if (ch === '}') braceCount--;
    }
    if (braceCount === 0 && i > translationsStart) {
        translationsEnd = i + 1; // 1-indexed
        break;
    }
}

if (translationsStart > 0 && translationsEnd > 0) {
    const translationsBlock = extractLines(translationsStart, translationsEnd);
    const moduleContent = `// Auto-extracted from content.js — Translations & Internationalization\n\n` +
        `export ${translationsBlock}\n`;

    fs.writeFileSync(path.join(srcDir, 'translations', 'index.js'), moduleContent, 'utf-8');
    console.log(`  ✅ translations/index.js (lines ${translationsStart}-${translationsEnd})`);
} else {
    console.log(`  ❌ Could not find TRANSLATIONS block`);
}

// ========== 2. Extract Constants & Selectors ==========
console.log('📦 Extracting constants...');

const constantsStart = findLine('// ----- Constantes Utiles -----');
const constantsEnd = translationsStart - 1; // Just before TRANSLATIONS

if (constantsStart > 0) {
    const constantsBlock = extractLines(constantsStart, constantsEnd);
    // Also include the global variables section
    const globalsStart = findLine('// ----- Déclarations des variables globales -----');
    const globalsBlock = extractLines(globalsStart, constantsStart - 1);

    const moduleContent = `// Auto-extracted from content.js — Global State & Constants\n\n` +
        `// ----- Global Variables -----\n` +
        `// These are mutable module-level variables shared across modules.\n\n` +
        globalsBlock + '\n\n' + constantsBlock + '\n';

    fs.writeFileSync(path.join(srcDir, 'modules', 'constants.js'), moduleContent, 'utf-8');
    console.log(`  ✅ modules/constants.js (lines ${globalsStart}-${constantsEnd})`);
}

// ========== 3. Extract Utility Functions ==========
console.log('📦 Extracting utility functions...');

// Lines 1084-1520 contain i18n utils, HTML decode, artist cleanup, regex escape, number converters
const utilsStart = findLine('function formatListWithConjunction');
const utilsEnd = findLine('function extractSongData') - 1;

if (utilsStart > 0 && utilsEnd > 0) {
    const utilsBlock = extractLines(utilsStart, utilsEnd);
    const moduleContent = `// Auto-extracted from content.js — Utility Functions\n` +
        `// Includes: i18n (formatListWithConjunction, getPluralForm, getTranslation),\n` +
        `// HTML entity decoding, artist name cleaning, regex escaping,\n` +
        `// and number-to-words converters (FR, EN, PL).\n\n` +
        `import { TRANSLATIONS } from '../translations/index.js';\n\n` +
        utilsBlock + '\n\n' +
        `export {\n` +
        `    formatListWithConjunction,\n` +
        `    getPluralForm,\n` +
        `    getTranslation,\n` +
        `    decodeHtmlEntities,\n` +
        `    cleanArtistName,\n` +
        `    escapeRegExp,\n` +
        `    formatArtistList,\n` +
        `    numberToFrenchWords,\n` +
        `    numberToEnglishWords,\n` +
        `    numberToPolishWords,\n` +
        `};\n`;

    fs.writeFileSync(path.join(srcDir, 'modules', 'utils.js'), moduleContent, 'utf-8');
    console.log(`  ✅ modules/utils.js (lines ${utilsStart}-${utilsEnd})`);
}

// ========== 4. Extract Text Corrections ==========
console.log('📦 Extracting text corrections...');

const correctionsStart = findLine('function isSectionTag(');
const correctionsEnd = findLine('function initLyricsEditorEnhancer') - 1;

if (correctionsStart > 0 && correctionsEnd > 0) {
    const correctionsBlock = extractLines(correctionsStart, correctionsEnd);
    const moduleContent = `// Auto-extracted from content.js — Text Correction Functions\n` +
        `// Includes: isSectionTag, correctLineSpacing, applyTextTransformToDivEditor,\n` +
        `// applyAllTextCorrectionsToString, applyAllTextCorrectionsAsync\n\n` +
        correctionsBlock + '\n\n' +
        `export {\n` +
        `    isSectionTag,\n` +
        `    correctLineSpacing,\n` +
        `    applyTextTransformToDivEditor,\n` +
        `    applyAllTextCorrectionsToString,\n` +
        `    applyAllTextCorrectionsAsync,\n` +
        `};\n`;

    fs.writeFileSync(path.join(srcDir, 'modules', 'corrections.js'), moduleContent, 'utf-8');
    console.log(`  ✅ modules/corrections.js (lines ${correctionsStart}-${correctionsEnd})`);
}

// ========== Summary ==========
console.log('\n🎉 Module extraction complete!');
console.log('Original file lines: ' + lines.length);
console.log('\nNext steps:');
console.log('  1. Update src/content.js to import from these modules');
console.log('  2. Remove extracted code from src/content.js');
console.log('  3. Run npm run build to verify');
