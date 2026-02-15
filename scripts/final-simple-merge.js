/**
 * final-simple-merge.js
 * 
 * Ultra-simple approach: just add imports to the top of content.original.js
 * Keep ALL existing code for now (even if duplicated in modules)
 * Once it works, we can clean up duplicates later
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const originalFile = path.join(ROOT, 'content.original.js');
const targetFile = path.join(ROOT, 'src', 'content.js');

console.log('🔨 Simple merge: adding imports to content.js...\n');

// Read original
const originalContent = fs.readFileSync(originalFile, 'utf-8');

// Header with imports (will replace the old header comments)
const importsHeader = `// content.js (Version 3.1.0 - Modularized with esbuild)
/**
 * @file Main entry point for "Genius Fast Transcriber" extension v3.1.0.
 * @author Lnkhey  
 * @version 3.1.0
 */

console.log('Genius Fast Transcriber v3.1.0 - Loading... 🎵');

// ========== MODULE IMPORTS (for future refactoring) ==========
// These modules are available but not yet fully integrated
// The original code below still contains duplicates - this is intentional
// TODO: Gradually remove duplicated code and use imports instead

import { TRANSLATIONS } from './translations/index.js';
import { state, SELECTORS } from './modules/constants.js';
import { getTranslation } from './modules/utils.js';

// Note: Keeping original code intact for now to ensure functionality
// Modularization will be completed in a future phase

`;

// Find where the actual code starts (after the initial comment block)
// Look for the CSS injection as that's a good marker
const cssInjectionMarker = '// ----- Injection des animations CSS essentielles -----';
const cssInjectionIndex = originalContent.indexOf(cssInjectionMarker);

if (cssInjectionIndex === -1) {
    console.error('❌ Could not find CSS injection marker');
    process.exit(1);
}

// Keep everything from CSS injection onward
const codeBody = originalContent.substring(cssInjectionIndex);

// Combine
const finalContent = importsHeader + '\n' + codeBody;

// Write
fs.writeFileSync(targetFile, finalContent, 'utf-8');

const originalLines = originalContent.split('\n').length;
const finalLines = finalContent.split('\n').length;

console.log('✅ Simple merge complete!');
console.log(`   • Original: ${originalLines} lines`);
console.log(`   • With imports: ${finalLines} lines`);
console.log(`   • Added: ${finalLines - originalLines} lines (import header)\n`);

console.log('📦 Module files ready for future use:');
console.log('   • src/translations/index.js');
console.log('   • src/modules/constants.js');
console.log('   • src/modules/utils.js');
console.log('   • src/modules/corrections.js\n');

console.log('🎯 Next: Run `npm run build` to test');
