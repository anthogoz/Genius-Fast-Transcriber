const fs = require('fs');

const path = 'src/content.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Add import
const importStatement = `import {
    showFeedbackMessage, showRestoreDraftNotification,
    showProgress, hideProgress, showCorrectionPreview
} from './modules/ui.js';
`;
content = content.replace("import { exportToTxt } from './modules/export.js';", "import { exportToTxt } from './modules/export.js';\n" + importStatement);

// 2. Remove Progress Bar and Preview (everything between "// ----- Barre de Progression -----" and "// ----- Tutoriel et Tooltips -----")
const startRegex = /\/\/\s*-----\s*Barre de Progression\s*-----[\s\S]*?(?=\/\/\s*-----\s*Tutoriel et Tooltips\s*-----)/;
content = content.replace(startRegex, '');

// 3. Remove showFeedbackMessage
const feedbackRegex = /\/\*\*\n\s+\*\s*Affiche un message de feedback temporaire \(toast\)[\s\S]*?^(?=\/\/\s*-----\s*Custom Buttons Feature\s*-----)/m;
content = content.replace(feedbackRegex, '');

fs.writeFileSync(path, content, 'utf8');
console.log('UI functions successfully removed and imports added.');
