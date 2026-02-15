//  test-simple-imports.js - Test minimal pour vérifier que les imports fonctionnent

import { TRANSLATIONS } from './translations/index.js';
import { state } from './modules/constants.js';
import { getTranslation } from './modules/utils.js';

console.log('✅ Imports working!');
console.log('TRANSLATIONS keys:', Object.keys(TRANSLATIONS).length);
console.log('State:', state);
console.log('Translation test:', getTranslation('artist_selection'));
