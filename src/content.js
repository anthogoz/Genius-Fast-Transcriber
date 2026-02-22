// content.js (Version 4.0.1 - Modular)
/**
 * @file Main entry point for "Genius Fast Transcriber" extension v4.0.1.
 * @author Lnkhey  
 * @version 4.0.1
 */

// =====
import { extractSongData } from './modules/songData.js';
import {
    isTagNewlinesDisabled, setTagNewlinesDisabled, isLyricCardOnlyMode,
    setLyricCardOnlyMode, getTranscriptionMode, setTranscriptionMode,
    isEnglishTranscriptionMode, isPolishTranscriptionMode,
    areTooltipsEnabled,
    setTooltipsEnabled
} from './modules/config.js';
import {
    createArtistSelectors, addArtistToText, formatSimpleTag
} from './modules/ui-artists.js';

// ===== MODULE IMPORTS =====
import { TRANSLATIONS } from './translations/index.js';
import {
    GFT_STATE,
    DARK_MODE_CLASS,
    DARK_MODE_STORAGE_KEY,
    HEADER_FEAT_STORAGE_KEY,
    DISABLE_TAG_NEWLINES_STORAGE_KEY,
    LYRIC_CARD_ONLY_STORAGE_KEY,
    PANEL_COLLAPSED_STORAGE_KEY,
    TRANSCRIPTION_MODE_STORAGE_KEY,
    CUSTOM_BUTTONS_STORAGE_KEY,
    MAX_HISTORY_SIZE,
    LYRICS_HELPER_HIGHLIGHT_CLASS,
    SHORTCUTS_CONTAINER_ID,
    ARTIST_SELECTOR_CONTAINER_ID,
    COUPLET_BUTTON_ID,
    FEEDBACK_MESSAGE_ID,
    GFT_VISIBLE_CLASS,
    FLOATING_TOOLBAR_ID,
    SELECTORS
} from './modules/constants.js';

import {
    formatListWithConjunction, getPluralForm, getTranslation,
    decodeHtmlEntities, cleanArtistName, escapeRegExp, formatArtistList,
    numberToFrenchWords, numberToEnglishWords, numberToPolishWords,
    isValidNumber, extractArtistsFromMetaContent,
} from './modules/utils.js';
import {
    isSectionTag, correctLineSpacing, applyTextTransformToDivEditor,
    applyAllTextCorrectionsToString, applyAllTextCorrectionsAsync,
} from './modules/corrections.js';
import { exportToTxt } from './modules/export.js';
// ===========================

console.log('Genius Fast Transcriber v4.0.1 🎵');

/**
 * Vérifie si le contexte de l'extension est toujours valide.
 * Empêche les erreurs "Extension context invalidated" après une mise à jour.
 * @returns {boolean} True si le contexte est valide.
 */
function isContextValid() {
    return typeof chrome !== 'undefined' && !!chrome.runtime && !!chrome.runtime.id;
}

// ----- Injection des animations CSS essentielles -----
// Injecte l'animation de surlignage pour s'assurer qu'elle fonctionne même si les styles CSS de Genius l'écrasent
(function injectCriticalStyles() {
    if (!document.getElementById('gft-critical-animations')) {
        const style = document.createElement('style');
        style.id = 'gft-critical-animations';
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


// ----- Constantes Utiles -----
// Regroupement des sélecteurs CSS et des identifiants pour faciliter la maintenance.









// Sélecteurs CSS pour trouver les éléments clés sur les pages de Genius.
// Les tableaux permettent d'avoir des sélecteurs de secours si Genius met à jour son site.



// Utility functions imported from ./modules/utils.js

/**
 * Fonction principale pour extraire toutes les données de la chanson (titre, artistes) depuis la page.
 * Utilise plusieurs stratégies (balises meta, éléments HTML) pour être plus robuste.
 */


/**
 * Crée et affiche les cases à cocher pour chaque artiste détecté.
 * Permet à l'utilisateur d'attribuer une section de paroles à un ou plusieurs artistes.
 * @param {HTMLElement} container - L'élément parent où les sélecteurs doivent être ajoutés.
 */


/**
 * Vérifie si l'ajout automatique de saut de ligne après les tags est désactivé.
 * @returns {boolean} true si désactivé, false sinon.
 */


/**
 * Active ou désactive l'ajout automatique de saut de ligne après les tags.
 * @param {boolean} disabled - true pour désactiver, false pour activer.
 */


/**
 * Vérifie si le mode "Lyric Card Only" est activé.
 * @returns {boolean} true si activé.
 */


/**
 * Active ou désactive le mode "Lyric Card Only".
 * @param {boolean} enabled - true pour activer.
 */


/**
 * Récupère le mode de transcription actuel (fr ou en).
 * Par défaut, retourne 'fr' si non défini.
 * @returns {string} 'fr' ou 'en'
 */


/**
 * Définit le mode de transcription.
 * @param {string} mode - 'fr' ou 'en'
 */


/**
 * Vérifie si le mode de transcription est anglais.
 * @returns {boolean} true si mode anglais
 */


/**
 * Vérifie si le mode de transcription est polonais.
 * @returns {boolean} true si mode polonais
 */


/**
 * Formatte un tag simple en ajoutant ou non un saut de ligne selon la préférence.
 * @param {string} tag - Le tag à formater (ex: "[Instrumental]").
 * @returns {string} Le tag formaté.
 */


/**
 * Ajoute les noms des artistes sélectionnés au tag de section.
 * En français: "[Couplet 1 : Artiste]" (espace avant et après le :)
 * En anglais: "[Verse 1: Artist]" (pas d'espace avant le :)
 * @param {string} baseTextWithBrackets - Le tag de base, ex: "[Couplet 1]" ou "[Verse 1]".
 * @returns {string} Le tag final avec artistes et saut de ligne si activé.
 */


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

    // Récupère les styles du textarea pour les copier
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

    // Positionne l'overlay exactement sur le textarea
    const rect = textarea.getBoundingClientRect();
    const parentRect = textarea.offsetParent ? textarea.offsetParent.getBoundingClientRect() : { top: 0, left: 0 };

    const scrollTop = textarea.offsetParent ? textarea.offsetParent.scrollTop : 0;
    const scrollLeft = textarea.offsetParent ? textarea.offsetParent.scrollLeft : 0;

    overlay.style.top = (rect.top - parentRect.top + scrollTop) + 'px';
    overlay.style.left = (rect.left - parentRect.left + scrollLeft) + 'px';
    overlay.style.width = rect.width + 'px';
    overlay.style.height = rect.height + 'px';

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
            // Surlignage rouge vif
            htmlContent += `<span class="gft-bracket-error-overlay" title="${title}" style="background-color: #ff0000 !important; color: white !important; font-weight: bold; border-radius: 2px;">${char === '<' ? '&lt;' : char === '>' ? '&gt;' : char === '&' ? '&amp;' : char}</span>`;
        } else {
            // Texte normal transparent pour laisser l'original dessous
            if (char === '\n') {
                htmlContent += '<br>';
            } else {
                htmlContent += `<span>${char === '<' ? '&lt;' : char === '>' ? '&gt;' : char === '&' ? '&amp;' : (char === ' ' ? '&nbsp;' : char)}</span>`;
            }
        }
    }

    overlay.innerHTML = htmlContent;

    // Insère l'overlay APRÈS le textarea dans le DOM pour qu'il soit au-dessus
    if (textarea.nextSibling) {
        textarea.parentNode.insertBefore(overlay, textarea.nextSibling);
    } else {
        textarea.parentNode.appendChild(overlay);
    }

    // Synchronise le scroll de l'overlay avec celui du textarea
    const syncScroll = () => {
        overlay.scrollTop = textarea.scrollTop;
        overlay.scrollLeft = textarea.scrollLeft;
    };

    textarea.addEventListener('scroll', syncScroll);

    // Supprime l'overlay quand le textarea change ou perd le focus
    const cleanup = () => {
        overlay.remove();
        textarea.removeEventListener('scroll', syncScroll);
        textarea.removeEventListener('input', cleanup);
    };

    textarea.addEventListener('input', cleanup);

    // Ajoute une animation pulsée
    if (!document.getElementById('gft-overlay-style')) {
        const style = document.createElement('style');
        style.id = 'gft-overlay-style';
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

// showFeedbackMessage definition and GFT_STATE.feedbackTimeout moved to global scope and end of file to avoid duplication


/**
 * Applique ou retire le mode sombre sur le panneau d'outils.
 * @param {boolean} isDark - True pour activer le mode sombre, false pour le désactiver.
 */
function applyDarkMode(isDark) {
    if (GFT_STATE.shortcutsContainerElement) {
        if (isDark) {
            GFT_STATE.shortcutsContainerElement.classList.add(DARK_MODE_CLASS);
            if (GFT_STATE.darkModeButton) GFT_STATE.darkModeButton.textContent = '☀️';
        } else {
            GFT_STATE.shortcutsContainerElement.classList.remove(DARK_MODE_CLASS);
            if (GFT_STATE.darkModeButton) GFT_STATE.darkModeButton.textContent = '🌙';
        }
    }

    // Applique aussi le mode sombre à la barre flottante
    if (GFT_STATE.floatingFormattingToolbar) {
        if (isDark) {
            GFT_STATE.floatingFormattingToolbar.classList.add(DARK_MODE_CLASS);
        } else {
            GFT_STATE.floatingFormattingToolbar.classList.remove(DARK_MODE_CLASS);
        }
    }

    // Sauvegarde la préférence dans le stockage local du navigateur.
    localStorage.setItem(DARK_MODE_STORAGE_KEY, isDark.toString());
}

/**
 * Inverse l'état actuel du mode sombre.
 */
function toggleDarkMode() {
    const isCurrentlyDark = GFT_STATE.shortcutsContainerElement ? GFT_STATE.shortcutsContainerElement.classList.contains(DARK_MODE_CLASS) : false;
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
    if (GFT_STATE.floatingFormattingToolbar && document.body.contains(GFT_STATE.floatingFormattingToolbar)) {
        return GFT_STATE.floatingFormattingToolbar;
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

    GFT_STATE.floatingFormattingToolbar = toolbar;

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
    if (!GFT_STATE.currentActiveEditor) return;

    // Active le flag pour désactiver la sauvegarde automatique
    isButtonActionInProgress = true;

    // Annule le timeout de sauvegarde automatique
    if (GFT_STATE.autoSaveTimeout) {
        clearTimeout(GFT_STATE.autoSaveTimeout);
        GFT_STATE.autoSaveTimeout = null;
    }

    // Sauvegarde dans l'historique avant modification
    saveToHistory();

    GFT_STATE.currentActiveEditor.focus();
    const prefix = formatType === 'bold' ? '<b>' : '<i>';
    const suffix = formatType === 'bold' ? '</b>' : '</i>';

    if (GFT_STATE.currentEditorType === 'textarea') {
        const start = GFT_STATE.currentActiveEditor.selectionStart;
        const end = GFT_STATE.currentActiveEditor.selectionEnd;
        const selectedText = GFT_STATE.currentActiveEditor.value.substring(start, end);
        let textToInsert = (start !== end) ? `${prefix}${selectedText}${suffix}` : `${prefix} ${suffix}`;
        document.execCommand('insertText', false, textToInsert);
        if (start === end) {
            GFT_STATE.currentActiveEditor.setSelectionRange(start + prefix.length + 1, start + prefix.length + 1);
        } else {
            GFT_STATE.currentActiveEditor.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
        }
    } else if (GFT_STATE.currentEditorType === 'div') {
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

    // Désactive le flag après un court délai et met à jour GFT_STATE.lastSavedContent
    setTimeout(() => {
        isButtonActionInProgress = false;
        if (GFT_STATE.currentActiveEditor) {
            GFT_STATE.lastSavedContent = getCurrentEditorContent();
            GFT_STATE.hasUnsavedChanges = false;
        }
    }, 100);

    // Cache la barre d'outils après l'application du formatage
    hideFloatingToolbar();
}

/**
 * Convertit le nombre sélectionné en lettres.
 */
function convertNumberToWords() {
    if (!GFT_STATE.currentActiveEditor) return;

    // Active le flag pour désactiver la sauvegarde automatique
    isButtonActionInProgress = true;

    // Annule le timeout de sauvegarde automatique
    if (GFT_STATE.autoSaveTimeout) {
        clearTimeout(GFT_STATE.autoSaveTimeout);
        GFT_STATE.autoSaveTimeout = null;
    }

    // Sauvegarde dans l'historique avant modification
    saveToHistory();

    GFT_STATE.currentActiveEditor.focus();

    let selectedText = '';
    let start, end;

    if (GFT_STATE.currentEditorType === 'textarea') {
        start = GFT_STATE.currentActiveEditor.selectionStart;
        end = GFT_STATE.currentActiveEditor.selectionEnd;
        selectedText = GFT_STATE.currentActiveEditor.value.substring(start, end).trim();
    } else if (GFT_STATE.currentEditorType === 'div') {
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
    if (GFT_STATE.currentEditorType === 'textarea') {
        document.execCommand('insertText', false, wordsText);
        const newEnd = start + wordsText.length;
        GFT_STATE.currentActiveEditor.setSelectionRange(newEnd, newEnd);
    } else if (GFT_STATE.currentEditorType === 'div') {
        document.execCommand('insertText', false, wordsText);
    }

    // Désactive le flag après un court délai et met à jour GFT_STATE.lastSavedContent
    setTimeout(() => {
        isButtonActionInProgress = false;
        if (GFT_STATE.currentActiveEditor) {
            GFT_STATE.lastSavedContent = getCurrentEditorContent();
            GFT_STATE.hasUnsavedChanges = false;
        }
    }, 100);

    // Cache la barre d'outils après la conversion
    hideFloatingToolbar();
}

/**
 * Entoure le texte sélectionné de parenthèses pour les ad-libs.
 */
function wrapSelectionWithAdlib() {
    if (!GFT_STATE.currentActiveEditor) return;

    // Active le flag pour désactiver la sauvegarde automatique
    isButtonActionInProgress = true;
    if (GFT_STATE.autoSaveTimeout) {
        clearTimeout(GFT_STATE.autoSaveTimeout);
        GFT_STATE.autoSaveTimeout = null;
    }

    // Sauvegarde dans l'historique
    saveToHistory();

    let selectedText = '';
    let replaced = false;

    if (GFT_STATE.currentEditorType === 'textarea') {
        const start = GFT_STATE.currentActiveEditor.selectionStart;
        const end = GFT_STATE.currentActiveEditor.selectionEnd;

        if (start !== end) {
            selectedText = GFT_STATE.currentActiveEditor.value.substring(start, end);
            const wrappedText = '(' + selectedText + ')';

            GFT_STATE.currentActiveEditor.setSelectionRange(start, end);
            document.execCommand('insertText', false, wrappedText);
            replaced = true;
        }
    } else if (GFT_STATE.currentEditorType === 'div') {
        const selection = window.getSelection();
        if (selection.rangeCount > 0 && !selection.isCollapsed) {
            selectedText = selection.toString();
            const wrappedText = '(' + selectedText + ')';

            document.execCommand('insertText', false, wrappedText);
            GFT_STATE.currentActiveEditor.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
            replaced = true;
        }
    }

    if (replaced) {
        showFeedbackMessage(getTranslation('feedback_adlib_added'), 2000, GFT_STATE.shortcutsContainerElement);
    } else {
        showFeedbackMessage(getTranslation('feedback_select_text_first'), 2000, GFT_STATE.shortcutsContainerElement);
    }

    // Désactive le flag après un court délai et met à jour GFT_STATE.lastSavedContent
    setTimeout(() => {
        isButtonActionInProgress = false;
        if (GFT_STATE.currentActiveEditor) {
            GFT_STATE.lastSavedContent = getCurrentEditorContent();
            GFT_STATE.hasUnsavedChanges = false;
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
    if (!GFT_STATE.currentActiveEditor) return;

    const statsElement = document.getElementById('gft-stats-display');
    if (!statsElement || !statsElement.classList.contains('gft-stats-visible')) return;

    const text = GFT_STATE.currentEditorType === 'textarea'
        ? GFT_STATE.currentActiveEditor.value
        : GFT_STATE.currentActiveEditor.textContent || '';

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
    if (!GFT_STATE.currentActiveEditor) return '';

    if (GFT_STATE.currentEditorType === 'textarea') {
        return GFT_STATE.currentActiveEditor.value;
    } else if (GFT_STATE.currentEditorType === 'div') {
        return GFT_STATE.currentActiveEditor.textContent || '';
    }
    return '';
}

/**
 * Définit le contenu de l'éditeur.
 * @param {string} content - Le contenu à définir.
 */
function setEditorContent(content) {
    if (!GFT_STATE.currentActiveEditor) return;

    if (GFT_STATE.currentEditorType === 'textarea') {
        GFT_STATE.currentActiveEditor.value = content;
        GFT_STATE.currentActiveEditor.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    } else if (GFT_STATE.currentEditorType === 'div') {
        GFT_STATE.currentActiveEditor.innerHTML = '';
        content.split('\n').forEach((lineText, index, arr) => {
            const lineDiv = document.createElement('div');
            if (lineText === "") {
                if (index !== arr.length - 1 || content.endsWith('\n')) {
                    lineDiv.appendChild(document.createElement('br'));
                }
            } else {
                lineDiv.textContent = lineText;
            }
            GFT_STATE.currentActiveEditor.appendChild(lineDiv);
        });

        // S'assure que l'éditeur n'est jamais complètement vide
        if (GFT_STATE.currentActiveEditor.childNodes.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.appendChild(document.createElement('br'));
            GFT_STATE.currentActiveEditor.appendChild(emptyDiv);
        }

        GFT_STATE.currentActiveEditor.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    }

    // Met à jour les statistiques
    debouncedStatsUpdate();
}


let isUndoRedoInProgress = false; // Flag pour éviter les sauvegardes pendant undo/redo
let isButtonActionInProgress = false; // Flag pour éviter les sauvegardes auto pendant les actions de boutons

let draftNotificationShown = false; // Flag pour éviter d'afficher plusieurs fois la notification de brouillon

/**
 * Sauvegarde l'état actuel dans l'historique avant une modification.
 */
function saveToHistory() {
    if (!GFT_STATE.currentActiveEditor || isUndoRedoInProgress) return;

    const currentContent = getCurrentEditorContent();

    // Ne sauvegarde pas si le contenu est identique au dernier élément de l'GFT_STATE.undoStack
    if (GFT_STATE.undoStack.length > 0 && GFT_STATE.undoStack[GFT_STATE.undoStack.length - 1] === currentContent) {
        return;
    }

    GFT_STATE.undoStack.push(currentContent);
    GFT_STATE.lastSavedContent = currentContent;
    GFT_STATE.hasUnsavedChanges = false;

    // Limite la taille de l'historique (FIFO)
    if (GFT_STATE.undoStack.length > MAX_HISTORY_SIZE) {
        GFT_STATE.undoStack.shift(); // Retire le plus ancien
    }

    // Vider le GFT_STATE.redoStack car nouvelle branche d'historique
    GFT_STATE.redoStack = [];

    // Met à jour les boutons
    updateHistoryButtons();
}

/**
 * Sauvegarde automatique dans l'historique avec debounce.
 * Appelée pendant la frappe de l'utilisateur.
 * Sauvegarde l'état AVANT les modifications au premier input.
 */
function autoSaveToHistory() {
    if (!GFT_STATE.currentActiveEditor || isUndoRedoInProgress || isButtonActionInProgress) return;

    const currentContent = getCurrentEditorContent();

    // Si c'est le premier changement depuis la dernière sauvegarde,
    // on sauvegarde IMMÉDIATEMENT l'état AVANT la modification
    if (!GFT_STATE.hasUnsavedChanges && currentContent !== GFT_STATE.lastSavedContent) {
        // Sauvegarde l'état AVANT (qui est dans GFT_STATE.lastSavedContent ou le dernier de GFT_STATE.undoStack)
        if (GFT_STATE.lastSavedContent && GFT_STATE.lastSavedContent !== (GFT_STATE.undoStack[GFT_STATE.undoStack.length - 1] || '')) {
            GFT_STATE.undoStack.push(GFT_STATE.lastSavedContent);

            // Limite la taille de l'historique (FIFO)
            if (GFT_STATE.undoStack.length > MAX_HISTORY_SIZE) {
                GFT_STATE.undoStack.shift();
            }

            // Vider le GFT_STATE.redoStack car nouvelle branche d'historique
            GFT_STATE.redoStack = [];

            updateHistoryButtons();
        }
        GFT_STATE.hasUnsavedChanges = true;
    }

    // Annule le timeout précédent
    if (GFT_STATE.autoSaveTimeout) {
        clearTimeout(GFT_STATE.autoSaveTimeout);
    }

    // Après 2 secondes d'inactivité, met à jour GFT_STATE.lastSavedContent et réinitialise le flag
    GFT_STATE.autoSaveTimeout = setTimeout(() => {
        if (isUndoRedoInProgress || isButtonActionInProgress) return;

        const finalContent = getCurrentEditorContent();
        GFT_STATE.lastSavedContent = finalContent;
        GFT_STATE.hasUnsavedChanges = false;

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
        title: GFT_STATE.currentSongTitle
    };

    try {
        localStorage.setItem(key, JSON.stringify(draftData));
        visualFeedbackAutoSave();
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
    if (GFT_STATE.autoSaveTimeout) {
        clearTimeout(GFT_STATE.autoSaveTimeout);
        GFT_STATE.autoSaveTimeout = null;
    }

    // Sauvegarde l'état AVANT la modification
    saveToHistory();

    // Exécute l'action
    await action();

    // Désactive le flag après un court délai
    setTimeout(() => {
        isButtonActionInProgress = false;
        // Met à jour GFT_STATE.lastSavedContent après l'action
        if (GFT_STATE.currentActiveEditor) {
            GFT_STATE.lastSavedContent = getCurrentEditorContent();
        }
    }, 100);
}

/**
 * Annule la dernière modification.
 */
function undoLastChange() {
    if (!GFT_STATE.currentActiveEditor || GFT_STATE.undoStack.length === 0) {
        showFeedbackMessage(getTranslation('feedback_no_changes'), 2000, GFT_STATE.shortcutsContainerElement);
        return;
    }

    // Active le flag pour éviter les sauvegardes automatiques
    isUndoRedoInProgress = true;

    // Annule le timeout de sauvegarde automatique
    if (GFT_STATE.autoSaveTimeout) {
        clearTimeout(GFT_STATE.autoSaveTimeout);
        GFT_STATE.autoSaveTimeout = null;
    }

    // Sauvegarde l'état actuel dans le GFT_STATE.redoStack
    const currentContent = getCurrentEditorContent();
    GFT_STATE.redoStack.push(currentContent);

    // Récupère le dernier état depuis l'GFT_STATE.undoStack
    const previousContent = GFT_STATE.undoStack.pop();

    // Restaure cet état
    setEditorContent(previousContent);

    // Met à jour GFT_STATE.lastSavedContent et réinitialise GFT_STATE.hasUnsavedChanges
    GFT_STATE.lastSavedContent = previousContent;
    GFT_STATE.hasUnsavedChanges = false;

    // Met à jour les boutons
    updateHistoryButtons();

    showFeedbackMessage(getTranslation('feedback_undo'), 2000, GFT_STATE.shortcutsContainerElement);

    // Désactive le flag après un court délai
    setTimeout(() => {
        isUndoRedoInProgress = false;
    }, 100);
}

/**
 * Refait la dernière modification annulée.
 */
function redoLastChange() {
    if (!GFT_STATE.currentActiveEditor || GFT_STATE.redoStack.length === 0) {
        showFeedbackMessage(getTranslation('feedback_no_changes'), 2000, GFT_STATE.shortcutsContainerElement);
        return;
    }

    // Active le flag pour éviter les sauvegardes automatiques
    isUndoRedoInProgress = true;

    // Annule le timeout de sauvegarde automatique
    if (GFT_STATE.autoSaveTimeout) {
        clearTimeout(GFT_STATE.autoSaveTimeout);
        GFT_STATE.autoSaveTimeout = null;
    }

    // Sauvegarde l'état actuel dans l'GFT_STATE.undoStack
    const currentContent = getCurrentEditorContent();
    GFT_STATE.undoStack.push(currentContent);

    // Limite la taille
    if (GFT_STATE.undoStack.length > MAX_HISTORY_SIZE) {
        GFT_STATE.undoStack.shift();
    }

    // Récupère le dernier état depuis le GFT_STATE.redoStack
    const nextContent = GFT_STATE.redoStack.pop();

    // Restaure cet état
    setEditorContent(nextContent);

    // Met à jour GFT_STATE.lastSavedContent et réinitialise GFT_STATE.hasUnsavedChanges
    GFT_STATE.lastSavedContent = nextContent;
    GFT_STATE.hasUnsavedChanges = false;

    // Met à jour les boutons
    updateHistoryButtons();

    showFeedbackMessage(getTranslation('feedback_redo'), 2000, GFT_STATE.shortcutsContainerElement);

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
        if (GFT_STATE.undoStack.length === 0) {
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
        if (GFT_STATE.redoStack.length === 0) {
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
    if (!progressContainer && GFT_STATE.shortcutsContainerElement) {
        progressContainer = createProgressBar();

        // Insère après le titre ou au début du panneau
        const feedbackMsg = document.getElementById(FEEDBACK_MESSAGE_ID);
        if (feedbackMsg) {
            GFT_STATE.shortcutsContainerElement.insertBefore(progressContainer, feedbackMsg.nextSibling);
        } else {
            const panelTitle = document.getElementById('gftPanelTitle');
            if (panelTitle) {
                GFT_STATE.shortcutsContainerElement.insertBefore(progressContainer, panelTitle.nextSibling);
            } else {
                GFT_STATE.shortcutsContainerElement.insertBefore(progressContainer, GFT_STATE.shortcutsContainerElement.firstChild);
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
    if (!isContextValid()) return;
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
    // Si le menu existe déjà, on le ferme
    const existingMenu = document.getElementById('gft-settings-menu');
    if (existingMenu) {
        closeSettingsMenu();
        return;
    }

    // Crée un simple menu avec les options
    const menu = document.createElement('div');
    menu.className = 'gft-settings-menu';
    menu.id = 'gft-settings-menu';

    // Applique le mode sombre si nécessaire
    const isDarkMode = document.body.classList.contains(DARK_MODE_CLASS);
    if (isDarkMode) {
        menu.classList.add(DARK_MODE_CLASS);
    }

    const addItem = (label, onClick) => {
        const item = document.createElement('button');
        item.className = 'gft-settings-menu-item';
        item.textContent = label;
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            onClick();
            closeSettingsMenu();
        });
        menu.appendChild(item);
    };

    // 1. Mode Sombre
    addItem(
        isDarkMode ? getTranslation('dark_mode_toggle_light') : getTranslation('dark_mode_toggle_dark'),
        gftToggleDarkMode
    );

    // 2. Statistiques
    const areStatsVisible = document.getElementById('gft-stats-display')?.classList.contains('gft-stats-visible');
    addItem(
        areStatsVisible ? getTranslation('stats_hide') : getTranslation('stats_show'),
        toggleStatsDisplay
    );

    // 3. Tooltips
    const tooltipsEnabled = areTooltipsEnabled();
    addItem(
        tooltipsEnabled ? getTranslation('tooltips_disable') : getTranslation('tooltips_enable'),
        () => {
            setTooltipsEnabled(!tooltipsEnabled);
            showFeedbackMessage(
                !tooltipsEnabled ? getTranslation('feedback_tooltips_enabled') : getTranslation('feedback_tooltips_disabled')
            );
        }
    );

    // 4. Masquer les Feats dans l'en-tête (Seulement en FR)
    if (!isEnglishTranscriptionMode() && !isPolishTranscriptionMode()) {
        addItem(
            isHeaderFeatEnabled() ? getTranslation('header_feat_hide') : getTranslation('header_feat_show'),
            gftToggleHeaderFeat
        );
    }

    // 5. Saut de ligne après tag
    addItem(
        isTagNewlinesDisabled() ? getTranslation('newline_enable') : getTranslation('newline_disable'),
        gftToggleTagNewlines
    );

    // 6. Tutoriel
    addItem(
        getTranslation('tutorial_link'),
        showTutorial
    );

    // 7. Bibliothèque de boutons
    addItem(
        getTranslation('settings_custom_library'),
        () => {
            if (typeof openCustomButtonManager === 'function') {
                openCustomButtonManager('structure', 'library');
            }
        }
    );

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
    if (!GFT_STATE.currentActiveEditor) return;

    // Active le flag pour désactiver la sauvegarde automatique
    isButtonActionInProgress = true;
    if (GFT_STATE.autoSaveTimeout) {
        clearTimeout(GFT_STATE.autoSaveTimeout);
        GFT_STATE.autoSaveTimeout = null;
    }

    GFT_STATE.currentActiveEditor.focus();
    let textToInsert = '';

    switch (tagType) {
        case 'couplet':
            textToInsert = addArtistToText(`[Couplet ${GFT_STATE.coupletCounter}]`);
            GFT_STATE.coupletCounter++;
            // Met à jour le bouton
            const coupletButton = document.getElementById(COUPLET_BUTTON_ID);
            if (coupletButton) {
                coupletButton.textContent = `[Couplet ${GFT_STATE.coupletCounter}]`;
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

    // Désactive le flag après un court délai et met à jour GFT_STATE.lastSavedContent
    setTimeout(() => {
        isButtonActionInProgress = false;
        if (GFT_STATE.currentActiveEditor) {
            GFT_STATE.lastSavedContent = getCurrentEditorContent();
            GFT_STATE.hasUnsavedChanges = false;
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
        // Mais on n'exige PAS document.activeElement === GFT_STATE.currentActiveEditor
        if (!GFT_STATE.currentActiveEditor && !document.querySelector(SELECTORS.CONTROLS_STICKY_SECTION)) {
            // Si GFT n'est pas actif du tout, on ne fait rien (pour ne pas casser Ctrl+Shift+Space ailleurs ?)
            // Ctrl+Shift+Space n'est pas standard, donc c'est probablement OK.
            return;
        }
    } else {
        // Actions d'édition strictes
        if (!GFT_STATE.currentActiveEditor) return;
        if (document.activeElement !== GFT_STATE.currentActiveEditor) return;
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
            visualFeedback(action);
            break;
        case 'toutCorriger':
            triggerToutCorrigerViaShortcut();
            visualFeedback('fix-all');
            break;
        case 'undo':
            undoLastChange();
            visualFeedback('undo');
            break;
        case 'redo':
            redoLastChange();
            visualFeedback('redo');
            break;
        case 'toggleStats':
            toggleStatsDisplay();
            // Pas forcement de feedback visuel bouton car menu possiblement fermé
            break;
        case 'togglePlay':
        case 'rewind':
        case 'forward':
            controlYoutubePlayer(action);
            break;
    }
}

/**
 * Fournit un retour visuel quand un raccourci est utilisé.
 * @param {string} action - L'identifiant de l'action ou du bouton.
 */
function visualFeedback(action) {
    let btn = null;
    if (action === 'couplet' || action === 'refrain' || action === 'pont' || action === 'intro' || action === 'outro') {
        // Trouve le bouton correspondant dans le panneau
        const buttons = document.querySelectorAll('.genius-lyrics-shortcut-button');
        for (const b of buttons) {
            if (b.textContent.toLowerCase().includes(action.toLowerCase())) {
                btn = b;
                break;
            }
        }
    } else if (action === 'fix-all') {
        btn = document.querySelector('.gft-btn-main-action'); // Le premier est souvent Fix All
    } else if (action === 'undo') {
        btn = document.getElementById('gft-undo-btn');
    } else if (action === 'redo') {
        btn = document.getElementById('gft-redo-btn');
    }

    if (btn) {
        btn.classList.add('gft-shortcut-feedback');
        setTimeout(() => btn.classList.remove('gft-shortcut-feedback'), 300);
    }
}

/**
 * Fournit un retour visuel lors de la sauvegarde du brouillon.
 */
function visualFeedbackAutoSave() {
    const indicator = document.getElementById('gft-autosave-dot');
    if (indicator) {
        indicator.classList.add('gft-autosave-flash');
        setTimeout(() => indicator.classList.remove('gft-autosave-flash'), 1000);
    }
}

/**
 * Applique une recherche et remplacement sur le texte de l'éditeur.
 * @param {string} findText - Le texte ou pattern à rechercher.
 * @param {string} replaceText - Le texte de remplacement.
 * @param {boolean} isRegex - Si vrai, traite findText comme une expression régulière.
 * @param {boolean} replaceAll - Si vrai, remplace toutes les occurrences.
 */
function applySearchReplace(findText, replaceText, isRegex, replaceAll) {
    if (!findText) {
        showFeedbackMessage(getTranslation('feedback_select_text_first') || 'Enter text to find');
        return;
    }

    if (!GFT_STATE.currentActiveEditor) return;

    saveToHistory();

    const currentText = getCurrentEditorContent();
    let newText = '';
    let count = 0;

    try {
        let pattern;
        if (isRegex) {
            pattern = new RegExp(findText, replaceAll ? 'g' : '');
        } else {
            // Escape special chars for literal search
            const escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            pattern = new RegExp(escaped, replaceAll ? 'g' : '');
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
            showFeedbackMessage(getTranslation('feedback_replaced').replace('{count}', count).replace('{item}', findText));
        } else {
            showFeedbackMessage(getTranslation('feedback_no_replacement'));
        }
    } catch (e) {
        console.error('Find/Replace Error:', e);
        showFeedbackMessage('Error: ' + e.message);
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
    if (!GFT_STATE.floatingFormattingToolbar) {
        createFloatingFormattingToolbar();
    }

    let rect;
    let selectedText = '';

    if (GFT_STATE.currentActiveEditor) {
        // Mode Édition
        // Affiche tous les boutons
        Array.from(GFT_STATE.floatingFormattingToolbar.children).forEach(child => child.style.display = '');

        if (GFT_STATE.currentEditorType === 'textarea') {
            // Pour les textarea, calcule la position du texte sélectionné
            const textareaRect = GFT_STATE.currentActiveEditor.getBoundingClientRect();
            const start = GFT_STATE.currentActiveEditor.selectionStart;
            const end = GFT_STATE.currentActiveEditor.selectionEnd;

            if (start === end) {
                hideFloatingToolbar();
                return;
            }

            selectedText = GFT_STATE.currentActiveEditor.value.substring(start, end);

            // Calcule la position du début de la sélection (position relative au textarea)
            const startPos = getTextareaCaretPosition(GFT_STATE.currentActiveEditor, start);

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
        Array.from(GFT_STATE.floatingFormattingToolbar.children).forEach(child => {
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
    const numberButton = GFT_STATE.floatingFormattingToolbar.querySelector('.gft-number-button');
    if (numberButton) {
        if (isNumber && GFT_STATE.currentActiveEditor) { // Only show number button in edit mode
            numberButton.style.display = 'inline-block';
        } else {
            numberButton.style.display = 'none';
        }
    }

    // Positionne la barre d'outils au-dessus de la sélection
    GFT_STATE.floatingFormattingToolbar.style.display = 'flex';
    GFT_STATE.floatingFormattingToolbar.style.visibility = 'visible';
    GFT_STATE.floatingFormattingToolbar.style.opacity = '1';
    GFT_STATE.floatingFormattingToolbar.style.position = 'fixed'; // Position fixed pour qu'elle suive le scroll

    // Calcule la position centrale au-dessus de la sélection
    const toolbarWidth = GFT_STATE.floatingFormattingToolbar.offsetWidth || 150;
    const toolbarHeight = GFT_STATE.floatingFormattingToolbar.offsetHeight || 40;

    // rect contient déjà les coordonnées viewport (pas besoin d'ajouter window.scrollX/Y)
    const left = rect.left + (rect.width / 2) - (toolbarWidth / 2);
    const top = rect.top - toolbarHeight - 8; // 8px au-dessus de la sélection

    GFT_STATE.floatingFormattingToolbar.style.left = `${Math.max(10, left)}px`;
    GFT_STATE.floatingFormattingToolbar.style.top = `${Math.max(10, top)}px`;
}

/**
 * Cache la barre d'outils flottante.
 */
function hideFloatingToolbar() {
    if (GFT_STATE.floatingFormattingToolbar) {
        GFT_STATE.floatingFormattingToolbar.style.display = 'none';
    }
}

/**
 * Gestionnaire pour détecter les changements de sélection et afficher/masquer la barre flottante.
 */
function handleSelectionChange() {
    // Si on est dans un éditeur, on garde la logique existante
    if (GFT_STATE.currentActiveEditor) {
        let hasSelection = false;

        // Pour les textarea, il faut vérifier selectionStart et selectionEnd
        if (GFT_STATE.currentEditorType === 'textarea') {
            const start = GFT_STATE.currentActiveEditor.selectionStart;
            const end = GFT_STATE.currentActiveEditor.selectionEnd;
            hasSelection = (start !== end) && document.activeElement === GFT_STATE.currentActiveEditor;
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
            if (GFT_STATE.currentActiveEditor.contains(container) ||
                (container.nodeType === Node.ELEMENT_NODE && container === GFT_STATE.currentActiveEditor)) {
                isInEditor = true;
            } else if (container.parentNode && GFT_STATE.currentActiveEditor.contains(container.parentNode)) {
                isInEditor = true;
            }

            hasSelection = isInEditor && !selection.isCollapsed;
        }

        if (hasSelection) {
            // Check if toolbar has visible buttons
            if (GFT_STATE.floatingFormattingToolbar) {
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
        // On peut utiliser GFT_STATE.currentSongTitle comme proxy, ou vérifier le meta og:type
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


// Correction functions imported from ./modules/corrections.js

/**
 * Fonction principale qui initialise le panneau d'outils.
 * C'est le cœur de l'extension. Elle est appelée lorsque l'éditeur de paroles est détecté.
 */
function initLyricsEditorEnhancer() {
    if (!isContextValid()) return;
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
            title: getTranslation('btn_add_custom_structure_title'),
            isPlusButton: true,
            managerType: 'structure'
        };

        if (isPolish) {
            // Mode polonais : tags en polonais selon Genius Polska
            return {
                buttons: [
                    {
                        type: 'coupletManager',
                        prev: { label: '←', title: getTranslation('btn_prev_couplet_title'), tooltip: getTranslation('btn_prev_couplet_tooltip') },
                        main: {
                            id: COUPLET_BUTTON_ID,
                            getLabel: () => `[Zwrotka ${GFT_STATE.coupletCounter}]`,
                            getText: () => addArtistToText(`[Zwrotka ${GFT_STATE.coupletCounter}]`),
                            tooltip: getTranslation('add_couplet'),
                            shortcut: '1'
                        },
                        next: { label: '→', title: getTranslation('btn_next_couplet_title'), tooltip: getTranslation('btn_next_couplet_tooltip') }
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
                        prev: { label: '←', title: getTranslation('btn_prev_couplet_title'), tooltip: getTranslation('btn_prev_couplet_tooltip') },
                        main: {
                            id: COUPLET_BUTTON_ID,
                            getLabel: () => `[Verse ${GFT_STATE.coupletCounter}]`,
                            getText: () => addArtistToText(`[Verse ${GFT_STATE.coupletCounter}]`),
                            tooltip: getTranslation('add_couplet'),
                            shortcut: '1'
                        },
                        next: { label: '→', title: getTranslation('btn_next_couplet_title'), tooltip: getTranslation('btn_next_couplet_tooltip') }
                    },
                    { label: getTranslation('btn_intro'), getText: () => addArtistToText('[Intro]'), tooltip: getTranslation('btn_intro_tooltip'), shortcut: '4' },
                    { label: getTranslation('btn_pre_chorus'), getText: () => addArtistToText('[Pre-Chorus]'), tooltip: getTranslation('btn_pre_chorus_tooltip') },
                    { label: getTranslation('btn_chorus'), getText: () => addArtistToText('[Chorus]'), tooltip: getTranslation('btn_chorus_tooltip'), shortcut: '2' },
                    { label: getTranslation('btn_post_chorus'), getText: () => addArtistToText('[Post-Chorus]'), tooltip: getTranslation('btn_post_chorus_tooltip') },
                    { label: getTranslation('btn_bridge'), getText: () => addArtistToText('[Bridge]'), tooltip: getTranslation('btn_bridge_tooltip'), shortcut: '3' },
                    { label: getTranslation('btn_outro'), getText: () => addArtistToText('[Outro]'), tooltip: getTranslation('btn_outro_tooltip'), shortcut: '5' },
                    { label: getTranslation('btn_instrumental'), getText: () => formatSimpleTag('[Instrumental]'), tooltip: getTranslation('btn_instrumental_tooltip') },
                    { label: getTranslation('btn_unknown'), getText: () => formatSimpleTag('[?]', true), tooltip: getTranslation('btn_unknown_tooltip') },
                    ...customButtons,
                    plusButton
                ]
            };
        } else {
            // Mode français : tags en français avec en-tête et couplet unique
            return {
                buttons: [
                    { label: getTranslation('btn_header'), getText: () => { let txt = `[Paroles de "${GFT_STATE.currentSongTitle}"`; const fts = formatArtistList(GFT_STATE.currentFeaturingArtists); if (fts && isHeaderFeatEnabled()) txt += ` ft. ${fts}`; txt += ']'; if (!isTagNewlinesDisabled()) txt += '\n'; return txt; }, tooltip: getTranslation('btn_header_tooltip') },
                    {
                        type: 'coupletManager',
                        prev: { label: '←', title: getTranslation('btn_prev_couplet_title'), tooltip: getTranslation('btn_prev_couplet_tooltip') },
                        main: {
                            id: COUPLET_BUTTON_ID,
                            getLabel: () => `[Couplet ${GFT_STATE.coupletCounter}]`,
                            getText: () => addArtistToText(`[Couplet ${GFT_STATE.coupletCounter}]`),
                            tooltip: getTranslation('add_couplet'),
                            shortcut: '1'
                        },
                        next: { label: '→', title: getTranslation('btn_next_couplet_title'), tooltip: getTranslation('btn_next_couplet_tooltip') }
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
            searchPattern: new RegExp(b.regex, b.isCaseSensitive ? 'g' : 'gi'),
            replacementText: b.replacement || '',
            highlightClass: LYRICS_HELPER_HIGHLIGHT_CLASS,
            tooltip: 'Custom: ' + b.label
        }));

        const plusButton = {
            label: '+',
            title: getTranslation('btn_add_custom_cleanup_title'),
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
                },
                {
                    label: getTranslation('btn_orphans_label'),
                    action: 'replaceText',
                    searchPattern: /\b([WwZzOoUuIiAa])\s+/g,
                    replacementText: "$1\u00A0",
                    highlightClass: LYRICS_HELPER_HIGHLIGHT_CLASS,
                    tooltip: getTranslation('cleanup_orphans_tooltip'),
                    feedbackKey: 'preview_stat_orphans'
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
    const editorJustAppeared = foundEditor && !GFT_STATE.currentActiveEditor;
    const editorJustDisappeared = !foundEditor && GFT_STATE.currentActiveEditor;
    const editorInstanceChanged = foundEditor && GFT_STATE.currentActiveEditor && (foundEditor !== GFT_STATE.currentActiveEditor);

    if (editorJustAppeared || editorInstanceChanged) {
        GFT_STATE.currentActiveEditor = foundEditor;
        GFT_STATE.currentEditorType = foundEditorType;
        extractSongData(); // Extrait les données de la chanson à l'apparition de l'éditeur.
        hideGeniusFormattingHelper();
        if (GFT_STATE.shortcutsContainerElement) {
            GFT_STATE.shortcutsContainerElement.remove();
            GFT_STATE.shortcutsContainerElement = null;
        }

        // Vérifie s'il y a un brouillon à restaurer (uniquement quand l'éditeur apparaît)
        setTimeout(checkAndRestoreDraft, 1000);

        // Réinitialise l'historique pour le nouvel éditeur
        GFT_STATE.undoStack = [];
        GFT_STATE.redoStack = [];
        GFT_STATE.lastSavedContent = '';
        GFT_STATE.hasUnsavedChanges = false;
        if (GFT_STATE.autoSaveTimeout) {
            clearTimeout(GFT_STATE.autoSaveTimeout);
            GFT_STATE.autoSaveTimeout = null;
        }

        // Initialise la barre d'outils flottante
        createFloatingFormattingToolbar();

        // Ajoute un écouteur spécifique pour les sélections dans le textarea
        if (GFT_STATE.currentEditorType === 'textarea') {
            GFT_STATE.currentActiveEditor.addEventListener('select', handleSelectionChange);
            GFT_STATE.currentActiveEditor.addEventListener('mouseup', handleSelectionChange);
            // Cache la barre flottante quand on scroll dans le textarea
            GFT_STATE.currentActiveEditor.addEventListener('scroll', hideFloatingToolbar);
        }

        // Ajoute un écouteur pour mettre à jour les statistiques en temps réel
        GFT_STATE.currentActiveEditor.addEventListener('input', debouncedStatsUpdate);
        // Ajoute un écouteur pour la sauvegarde automatique dans l'historique
        GFT_STATE.currentActiveEditor.addEventListener('input', autoSaveToHistory);
        // Met à jour les statistiques initiales
        setTimeout(() => updateStatsDisplay(), 500);

        // Sauvegarde initiale dans l'historique
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
        GFT_STATE.currentActiveEditor = null; GFT_STATE.currentEditorType = null;
        hideFloatingToolbar();

        // Réinitialise l'historique quand on quitte l'éditeur
        GFT_STATE.undoStack = [];
        GFT_STATE.redoStack = [];
        GFT_STATE.lastSavedContent = '';
        GFT_STATE.hasUnsavedChanges = false;
        if (GFT_STATE.autoSaveTimeout) {
            clearTimeout(GFT_STATE.autoSaveTimeout);
            GFT_STATE.autoSaveTimeout = null;
        }
    }

    GFT_STATE.shortcutsContainerElement = document.getElementById(SHORTCUTS_CONTAINER_ID);
    if (editorJustDisappeared && GFT_STATE.shortcutsContainerElement) {
        GFT_STATE.shortcutsContainerElement.remove(); GFT_STATE.shortcutsContainerElement = null; return;
    }

    // 2. Si un éditeur est trouvé, on crée et injecte le panneau d'outils.
    if (foundEditor) {
        const targetStickySection = document.querySelector(SELECTORS.CONTROLS_STICKY_SECTION);
        if (targetStickySection) {
            // Si le mode "Lyric Card Only" est activé, on NE CRÉE PAS le panneau.
            if (isLyricCardOnlyMode()) {
                if (GFT_STATE.shortcutsContainerElement) {
                    GFT_STATE.shortcutsContainerElement.remove();
                    GFT_STATE.shortcutsContainerElement = null;
                }
                // On s'assure quand même que l'extractSongData est fait pour la Lyric Card
                if (editorJustAppeared || editorInstanceChanged) {
                    extractSongData();
                    hideGeniusFormattingHelper();
                }
                return;
            }

            // Crée le conteneur principal du panneau seulement s'il n'existe pas déjà.
            if (!GFT_STATE.shortcutsContainerElement || editorInstanceChanged || editorJustAppeared) {
                if (GFT_STATE.shortcutsContainerElement) GFT_STATE.shortcutsContainerElement.remove();
                GFT_STATE.shortcutsContainerElement = document.createElement('div');
                GFT_STATE.shortcutsContainerElement.id = SHORTCUTS_CONTAINER_ID;


                // Crée le titre du panneau, le logo et le bouton de mode sombre.
                const isDarkMode = localStorage.getItem(DARK_MODE_STORAGE_KEY) === 'true';
                const panelTitle = document.createElement('div');
                panelTitle.id = 'gftPanelTitle';

                // Conteneur cliquable pour le titre et la flèche
                const clickableTitleArea = document.createElement('span');
                clickableTitleArea.id = 'gft-clickable-title';
                clickableTitleArea.style.cursor = 'pointer';
                clickableTitleArea.style.display = 'inline-flex';
                clickableTitleArea.style.alignItems = 'center';
                clickableTitleArea.style.userSelect = 'none';

                if (!isContextValid()) return;
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

                const saveIndicator = document.createElement('span');
                saveIndicator.id = 'gft-autosave-dot';
                saveIndicator.className = 'gft-autosave-indicator';
                saveIndicator.textContent = '💾'; // Icône Disquette
                saveIndicator.title = getTranslation('draft_saved_at') || 'Draft saved';
                panelTitle.appendChild(saveIndicator);

                addTooltip(clickableTitleArea, 'Cliquer pour replier/déplier');

                // Sélecteur de mode de transcription (FR/EN/PL)
                const transcriptionModeSelect = document.createElement('select');
                transcriptionModeSelect.id = 'gft-transcription-mode-select';
                transcriptionModeSelect.classList.add('gft-transcription-mode-select');
                transcriptionModeSelect.title = getTranslation('mode_select_title') || 'Transcription mode';

                const optionFR = document.createElement('option');
                optionFR.value = 'fr';
                optionFR.textContent = 'FR';
                transcriptionModeSelect.appendChild(optionFR);

                const optionEN = document.createElement('option');
                optionEN.value = 'en';
                optionEN.textContent = 'EN';
                transcriptionModeSelect.appendChild(optionEN);

                const optionPL = document.createElement('option');
                optionPL.value = 'pl';
                optionPL.textContent = 'PL';
                transcriptionModeSelect.appendChild(optionPL);

                // Définit la valeur actuelle
                transcriptionModeSelect.value = getTranscriptionMode();

                // Événement de changement
                transcriptionModeSelect.addEventListener('change', (e) => {
                    const newMode = e.target.value;
                    setTranscriptionMode(newMode);
                    // Synchronise aussi la langue d'interface pour que les traductions soient cohérentes
                    localStorage.setItem('gftLanguage', newMode);
                    // Recharge la page pour appliquer les changements
                    window.location.reload();
                });

                panelTitle.appendChild(transcriptionModeSelect);
                addTooltip(transcriptionModeSelect, getTranslation('lang_select_title') || 'Change transcription mode');

                // Bouton Undo
                const undoButton = document.createElement('button');
                undoButton.id = 'gft-undo-button';
                undoButton.textContent = '↩';
                undoButton.title = getTranslation('undo_tooltip');
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
                redoButton.title = getTranslation('redo_tooltip');
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
                    showSettingsMenu();
                });


                panelTitle.appendChild(settingsButton);
                addTooltip(settingsButton, getTranslation('settings_tooltip'));



                GFT_STATE.shortcutsContainerElement.appendChild(panelTitle);
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
                if (GFT_STATE.detectedArtists.length === 0 && !editorJustAppeared && !editorInstanceChanged) extractSongData();
                createArtistSelectors(panelContent);
                if (GFT_STATE.currentFeaturingArtists.length > 0 || GFT_STATE.currentMainArtists.length > 1) { const hrArtists = document.createElement('hr'); panelContent.appendChild(hrArtists); }

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
                        let tooltipText = config.tooltip;
                        // Ajoute le raccourci formaté si présent
                        if (config.shortcut) {
                            const formattedShortcut = config.shortcut.length === 1 ? `[Ctrl+${config.shortcut}]` : `[${config.shortcut}]`;
                            tooltipText += ` ${formattedShortcut}`;
                        }
                        button.title = tooltipText; // Fallback natif
                        addTooltip(button, tooltipText);
                    }
                    // Ajoute l'écouteur d'événement principal qui déclenche l'action du bouton.
                    button.addEventListener('click', (event) => {
                        event.preventDefault();
                        if (!GFT_STATE.currentActiveEditor) { initLyricsEditorEnhancer(); if (!GFT_STATE.currentActiveEditor) return; }

                        // Sauvegarde la position du curseur pour les textarea
                        let savedCursorStart = null;
                        let savedCursorEnd = null;
                        if (GFT_STATE.currentEditorType === 'textarea') {
                            savedCursorStart = GFT_STATE.currentActiveEditor.selectionStart;
                            savedCursorEnd = GFT_STATE.currentActiveEditor.selectionEnd;
                        }

                        GFT_STATE.currentActiveEditor.focus();

                        // Active le flag pour désactiver la sauvegarde automatique pendant toute l'action
                        isButtonActionInProgress = true;
                        if (GFT_STATE.autoSaveTimeout) {
                            clearTimeout(GFT_STATE.autoSaveTimeout);
                            GFT_STATE.autoSaveTimeout = null;
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
                            if (GFT_STATE.currentEditorType === 'textarea') {
                                const originalValue = GFT_STATE.currentActiveEditor.value; let tempCount = 0;
                                const newValue = originalValue.replace(config.searchPattern, (...matchArgs) => {
                                    tempCount++;
                                    if (typeof replacementValueOrFn === 'function') return replacementValueOrFn(...matchArgs);
                                    return replacementValueOrFn;
                                });
                                if (originalValue !== newValue) {
                                    GFT_STATE.currentActiveEditor.value = newValue;
                                    GFT_STATE.currentActiveEditor.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
                                    replacementsCount = tempCount;
                                    // Crée un overlay pour surligner les modifications dans le textarea
                                    createTextareaReplacementOverlay(GFT_STATE.currentActiveEditor, originalValue, newValue, config.searchPattern);
                                }
                            } else if (GFT_STATE.currentEditorType === 'div') {
                                replacementsCount = replaceAndHighlightInDiv(GFT_STATE.currentActiveEditor, config.searchPattern, replacementValueOrFn, config.highlightClass);
                                if (replacementsCount > 0) GFT_STATE.currentActiveEditor.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
                            }
                            if (replacementsCount > 0) {
                                let itemLabel = "élément(s)";
                                if (config.feedbackKey) {
                                    itemLabel = getTranslation(config.feedbackKey, replacementsCount);
                                } else {
                                    if (config.label.includes("y' → y ")) itemLabel = "occurrence(s) de 'y''";
                                    if (config.label.includes("’ → '")) itemLabel = "apostrophe(s) ’";
                                }
                                showFeedbackMessage(getTranslation('feedback_replaced', replacementsCount).replace('{count}', replacementsCount).replace('{item}', itemLabel), 3000, GFT_STATE.shortcutsContainerElement);
                            } else {
                                let noCorrectionLabel = "élément(s)";
                                if (config.feedbackKey) {
                                    noCorrectionLabel = getTranslation(config.feedbackKey, 1); // Utilise la forme singulière (souvent génitif pour PL)
                                }
                                showFeedbackMessage(getTranslation('feedback_no_correction_needed').replace('{item}', noCorrectionLabel), 2000, GFT_STATE.shortcutsContainerElement);
                            }
                        } else if (config.action === 'lineCorrection' && config.correctionType) {
                            // Sauvegarde dans l'historique avant modification
                            saveToHistory();

                            // Gère les corrections ligne par ligne
                            let correctionsCount = 0; let correctionFunction; let feedbackLabel = "";
                            if (config.correctionType === 'spacing') { correctionFunction = correctLineSpacing; feedbackLabel = "espacement(s) de ligne"; }

                            if (correctionFunction) {
                                if (GFT_STATE.currentEditorType === 'textarea') {
                                    const originalText = GFT_STATE.currentActiveEditor.value;
                                    const { newText, correctionsCount: count } = correctionFunction(originalText);
                                    if (originalText !== newText) {
                                        GFT_STATE.currentActiveEditor.value = newText;
                                        GFT_STATE.currentActiveEditor.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
                                    }
                                    correctionsCount = count;
                                } else if (GFT_STATE.currentEditorType === 'div') {
                                    correctionsCount = applyTextTransformToDivEditor(GFT_STATE.currentActiveEditor, correctionFunction);
                                }
                                if (correctionsCount > 0) {
                                    let itemLabel = "élément(s)";
                                    if (config.feedbackKey) itemLabel = getTranslation(config.feedbackKey, correctionsCount);
                                    else itemLabel = feedbackLabel;
                                    showFeedbackMessage(getTranslation('feedback_corrected', correctionsCount).replace('{count}', correctionsCount).replace('{item}', itemLabel), 3000, GFT_STATE.shortcutsContainerElement);
                                } else {
                                    let noCorrectionLabel = "élément(s)";
                                    if (config.feedbackKey) noCorrectionLabel = getTranslation(config.feedbackKey, 1);
                                    else noCorrectionLabel = feedbackLabel;
                                    showFeedbackMessage(getTranslation('feedback_no_correction_needed').replace('{item}', noCorrectionLabel), 2000, GFT_STATE.shortcutsContainerElement);
                                }
                            }
                        } else if (config.action === 'globalTextFix') {
                            // Version avec prévisualisation (mode validation)
                            (async () => {
                                try {
                                    const originalText = GFT_STATE.currentEditorType === 'textarea'
                                        ? GFT_STATE.currentActiveEditor.value
                                        : GFT_STATE.currentActiveEditor.textContent || '';

                                    // Calcule les corrections avec barre de progression
                                    const result = await applyAllTextCorrectionsAsync(originalText, showProgress);

                                    // Cache la barre de progression
                                    hideProgress();

                                    if (result.correctionsCount === 0) {
                                        // Vérifie les brackets AVANT d'afficher le message "Aucune correction"
                                        const editorRef = GFT_STATE.currentActiveEditor;
                                        const editorTypeRef = GFT_STATE.currentEditorType;
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
                                                GFT_STATE.shortcutsContainerElement
                                            );
                                        } else {
                                            // Vraiment rien à faire, ou le compte de brackets est à 0.
                                            // Par prudence (si le comptage échoue mais que le surlignage a lieu), on invite à vérifier.
                                            showFeedbackMessage(getTranslation('feedback_no_text_corrections'), 3000, GFT_STATE.shortcutsContainerElement);
                                        }
                                        return;
                                    }

                                    // Capture les références de l'éditeur pour les callbacks
                                    const editorRef = GFT_STATE.currentActiveEditor;
                                    const editorTypeRef = GFT_STATE.currentEditorType;

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

                                            showFeedbackMessage(message, 4500, GFT_STATE.shortcutsContainerElement);

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
                                                        showFeedbackMessage(
                                                            getTranslation('feedback_brackets_issue').replace('{count}', unmatchedCount),
                                                            5000,
                                                            GFT_STATE.shortcutsContainerElement
                                                        );
                                                    } else {
                                                        // Idem ici : pas de notification de succès si tout est OK, seulement les erreurs.
                                                        // showFeedbackMessage("✅ Toutes les parenthèses et crochets sont bien appariés.", 3000, GFT_STATE.shortcutsContainerElement);
                                                    }
                                                }, 4600);
                                            } else {
                                                console.log('[GFT] editorRef est null, impossible de vérifier les brackets');
                                            }
                                        },
                                        // Callback si l'utilisateur annule
                                        () => {
                                            showFeedbackMessage(getTranslation('feedback_corrections_cancelled'), 2000, GFT_STATE.shortcutsContainerElement);
                                        }
                                    );
                                } catch (error) {
                                    hideProgress();
                                    console.error('Erreur lors des corrections:', error);
                                    showFeedbackMessage(getTranslation('error_corrections'), 3000, GFT_STATE.shortcutsContainerElement);
                                }
                            })();
                        } else if (config.action === 'checkBrackets') {
                            // Vérifie et surligne les parenthèses et crochets non appariés
                            const unmatchedCount = highlightUnmatchedBracketsInEditor(GFT_STATE.currentActiveEditor, GFT_STATE.currentEditorType);

                            if (unmatchedCount > 0) {
                                showFeedbackMessage(
                                    getTranslation('feedback_brackets_issue').replace('{count}', unmatchedCount),
                                    5000,
                                    GFT_STATE.shortcutsContainerElement
                                );
                            } else {
                                showFeedbackMessage(
                                    getTranslation('feedback_brackets_ok'),
                                    3000,
                                    GFT_STATE.shortcutsContainerElement
                                );
                            }
                        } else if (config.action === 'duplicateLine') {
                            // Duplique la ligne actuelle
                            saveToHistory();

                            if (GFT_STATE.currentEditorType === 'textarea') {
                                const text = GFT_STATE.currentActiveEditor.value;
                                const cursorPos = GFT_STATE.currentActiveEditor.selectionStart;

                                // Trouve le début et la fin de la ligne actuelle
                                let lineStart = text.lastIndexOf('\n', cursorPos - 1) + 1;
                                let lineEnd = text.indexOf('\n', cursorPos);
                                if (lineEnd === -1) lineEnd = text.length;

                                const currentLine = text.substring(lineStart, lineEnd);
                                const newText = text.substring(0, lineEnd) + '\n' + currentLine + text.substring(lineEnd);

                                GFT_STATE.currentActiveEditor.value = newText;
                                GFT_STATE.currentActiveEditor.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));

                                // Place le curseur au début de la nouvelle ligne
                                const newCursorPos = lineEnd + 1 + currentLine.length;
                                GFT_STATE.currentActiveEditor.setSelectionRange(newCursorPos, newCursorPos);

                                showFeedbackMessage(getTranslation('feedback_duplicate_line'), 2000, GFT_STATE.shortcutsContainerElement);
                            } else if (GFT_STATE.currentEditorType === 'div') {
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
                                        GFT_STATE.currentActiveEditor.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
                                        showFeedbackMessage(getTranslation('feedback_duplicate_line'), 2000, GFT_STATE.shortcutsContainerElement);
                                    }
                                }
                            }
                        } else if (config.action === 'wrapSelection') {
                            // Entoure la sélection avec les caractères spécifiés
                            let selectedText = '';

                            if (GFT_STATE.currentEditorType === 'textarea') {
                                const start = GFT_STATE.currentActiveEditor.selectionStart;
                                const end = GFT_STATE.currentActiveEditor.selectionEnd;

                                if (start !== end) {
                                    saveToHistory();
                                    selectedText = GFT_STATE.currentActiveEditor.value.substring(start, end);
                                    const wrappedText = config.wrapStart + selectedText + config.wrapEnd;

                                    GFT_STATE.currentActiveEditor.setSelectionRange(start, end);
                                    document.execCommand('insertText', false, wrappedText);

                                    showFeedbackMessage(getTranslation('feedback_wrapped').replace('{start}', config.wrapStart).replace('{end}', config.wrapEnd), 2000, GFT_STATE.shortcutsContainerElement);
                                } else {
                                    showFeedbackMessage(getTranslation('feedback_select_text_first'), 2000, GFT_STATE.shortcutsContainerElement);
                                }
                            } else if (GFT_STATE.currentEditorType === 'div') {
                                const selection = window.getSelection();
                                if (selection.rangeCount > 0 && !selection.isCollapsed) {
                                    saveToHistory();
                                    selectedText = selection.toString();
                                    const wrappedText = config.wrapStart + selectedText + config.wrapEnd;

                                    document.execCommand('insertText', false, wrappedText);
                                    GFT_STATE.currentActiveEditor.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));

                                    showFeedbackMessage(getTranslation('feedback_wrapped').replace('{start}', config.wrapStart).replace('{end}', config.wrapEnd), 2000, GFT_STATE.shortcutsContainerElement);
                                } else {
                                    showFeedbackMessage(getTranslation('feedback_select_text_first'), 2000, GFT_STATE.shortcutsContainerElement);
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

                            if (typeof textToInsert !== 'undefined' && textToInsert !== null && GFT_STATE.currentActiveEditor) {
                                // Sauvegarde dans l'historique avant insertion
                                saveToHistory();
                                document.execCommand('insertText', false, textToInsert);
                                insertionPerformed = true;
                            }
                        }

                        // Logique spécifique au bouton de couplet
                        if (isCoupletMainButton && textToInsertForCouplet !== null) {
                            GFT_STATE.coupletCounter++;
                            button.textContent = config.getLabel();
                        } else if (typeof config.getLabel === 'function' && !isCoupletMainButton) {
                            button.textContent = config.getLabel();
                        }

                        // Restaure la position du curseur pour éviter le "jumpscare" du scroll
                        // SAUF si une insertion a eu lieu, auquel cas on veut que le curseur soit à la fin du texte inséré
                        if (!insertionPerformed && GFT_STATE.currentEditorType === 'textarea' && savedCursorStart !== null && savedCursorEnd !== null) {
                            GFT_STATE.currentActiveEditor.setSelectionRange(savedCursorStart, savedCursorEnd);
                        }

                        GFT_STATE.currentActiveEditor.focus();

                        // Désactive le flag après un court délai et met à jour GFT_STATE.lastSavedContent
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

                // Fonction helper pour créer le bouton Toggle
                const createToggleBtn = () => {
                    const toggleBtn = createButton({
                        label: '🔍 ' + (getTranslation('find_replace_title') || 'Find & Replace'),
                        tooltip: getTranslation('find_replace_title'),
                    }, utilityContainer);
                    toggleBtn.classList.add('gft-btn-utility');
                    toggleBtn.style.padding = '0 6px';
                    toggleBtn.style.minWidth = 'auto'; // Ajustement largeur
                    // Hauteur auto pour matcher les autres boutons (pas de height forcée)
                    toggleBtn.style.display = 'inline-flex';
                    toggleBtn.style.alignItems = 'center';
                    toggleBtn.style.justifyContent = 'center';

                    toggleBtn.onclick = (e) => {
                        e.preventDefault();
                        const isClosed = findReplaceContainer.style.maxHeight === '0px' || findReplaceContainer.style.maxHeight === '0';
                        if (isClosed) {
                            findReplaceContainer.style.visibility = 'visible';
                            findReplaceContainer.style.maxHeight = '300px';
                            findReplaceContainer.style.opacity = '1';
                            findReplaceContainer.style.marginTop = '12px';
                            findReplaceContainer.style.padding = '12px';
                            toggleBtn.classList.add('active');
                        } else {
                            findReplaceContainer.style.maxHeight = '0';
                            findReplaceContainer.style.opacity = '0';
                            findReplaceContainer.style.marginTop = '0';
                            findReplaceContainer.style.padding = '0';
                            setTimeout(() => {
                                if (findReplaceContainer.style.maxHeight === '0px' || findReplaceContainer.style.maxHeight === '0') {
                                    findReplaceContainer.style.visibility = 'hidden';
                                }
                            }, 300);
                            toggleBtn.classList.remove('active');
                        }
                    };
                    return toggleBtn;
                };

                let toggleFindReplaceBtn = null;

                if (SHORTCUTS.TEXT_CLEANUP && SHORTCUTS.TEXT_CLEANUP.length > 0) {
                    SHORTCUTS.TEXT_CLEANUP.forEach(s => {
                        // Si c'est le bouton PLUS, on insère le bouton Toggle AVANT
                        if (s.isPlusButton && !toggleFindReplaceBtn) {
                            toggleFindReplaceBtn = createToggleBtn();
                        }

                        const btn = createButton(s, utilityContainer);

                        // Uniformisation du style pour tous les boutons de nettoyage
                        btn.classList.add('gft-btn-utility');
                        // On enlève height fixe pour laisser le CSS gérer (comme les boutons structure)
                        // On ajuste juste le padding pour que ce soit compact
                        btn.style.padding = '2px 6px';
                        btn.style.display = 'inline-flex';
                        btn.style.alignItems = 'center';
                        btn.style.justifyContent = 'center';

                        // Raccourcir les labels si défini dans la config (via shortLabel)
                        if (s.shortLabel) {
                            btn.textContent = s.shortLabel;
                        } else {
                            // Nettoyage cosmétique par défaut pour les flèches
                            btn.textContent = s.label.replace(' → ', '→');
                        }
                    });

                    // Fallback: si pas de bouton plus (bug?), on l'ajoute à la fin
                    if (!toggleFindReplaceBtn) {
                        toggleFindReplaceBtn = createToggleBtn();
                    }
                }

                toolsSection.appendChild(utilityContainer);

                // --- FIND & REPLACE TOOL ---
                const findReplaceContainer = document.createElement('div');
                findReplaceContainer.className = 'gft-find-replace-container';
                // Styles de base pour la transition et le look
                findReplaceContainer.style.background = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
                findReplaceContainer.style.borderRadius = '10px';
                findReplaceContainer.style.border = isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)';
                findReplaceContainer.style.overflow = 'hidden';
                findReplaceContainer.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                findReplaceContainer.style.width = '100%'; // Force la largeur totale
                findReplaceContainer.style.boxSizing = 'border-box'; // Inclut padding/border dans la largeur

                // État initial (fermé)
                findReplaceContainer.style.maxHeight = '0';
                findReplaceContainer.style.opacity = '0';
                findReplaceContainer.style.marginTop = '0';
                findReplaceContainer.style.padding = '0';
                findReplaceContainer.style.visibility = 'hidden';

                // Toujours en display: flex pour que la layout se calcule, mais caché par visibility/opacity
                findReplaceContainer.style.display = 'flex';
                findReplaceContainer.style.flexDirection = 'column';
                findReplaceContainer.style.gap = '8px';



                const inputsRow = document.createElement('div');
                inputsRow.style.display = 'flex';
                inputsRow.style.gap = '8px';

                const findInput = document.createElement('input');
                findInput.type = 'text';
                findInput.placeholder = getTranslation('find_placeholder');
                findInput.className = 'gft-input-small';
                findInput.style.flex = '1';
                findInput.style.padding = '6px 8px';
                findInput.style.borderRadius = '6px';
                findInput.style.border = '1px solid ' + (isDarkMode ? 'rgba(255,255,255,0.2)' : '#ccc');

                const replaceInput = document.createElement('input');
                replaceInput.type = 'text';
                replaceInput.placeholder = getTranslation('replace_placeholder');
                replaceInput.className = 'gft-input-small';
                replaceInput.style.flex = '1';
                replaceInput.style.padding = '6px 8px';
                replaceInput.style.borderRadius = '6px';
                replaceInput.style.border = '1px solid ' + (isDarkMode ? 'rgba(255,255,255,0.2)' : '#ccc');

                inputsRow.appendChild(findInput);
                inputsRow.appendChild(replaceInput);
                findReplaceContainer.appendChild(inputsRow);

                const controlsRow = document.createElement('div');
                controlsRow.style.display = 'flex';
                controlsRow.style.justifyContent = 'space-between';
                controlsRow.style.alignItems = 'center';

                const regexLabel = document.createElement('label');
                regexLabel.style.fontSize = '12px';
                regexLabel.style.display = 'flex';
                regexLabel.style.alignItems = 'center';
                regexLabel.style.gap = '6px';
                regexLabel.style.cursor = 'pointer';
                const regexCheck = document.createElement('input');
                regexCheck.type = 'checkbox';
                regexLabel.appendChild(regexCheck);
                regexLabel.appendChild(document.createTextNode(getTranslation('regex_toggle')));
                controlsRow.appendChild(regexLabel);

                const replaceAllBtn = document.createElement('button');
                replaceAllBtn.textContent = getTranslation('btn_replace_all');
                replaceAllBtn.className = 'gft-btn-small gft-btn-primary';
                replaceAllBtn.style.padding = '6px 12px';
                replaceAllBtn.style.borderRadius = '6px';
                replaceAllBtn.onclick = () => applySearchReplace(findInput.value, replaceInput.value, regexCheck.checked, true);

                controlsRow.appendChild(replaceAllBtn);

                findReplaceContainer.appendChild(controlsRow);
                toolsSection.appendChild(findReplaceContainer);

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


                const versionLabel = document.createElement('div');
                versionLabel.id = 'gft-version-label';
                versionLabel.textContent = 'v4.0.1'; // Bump version visuelle pour le user
                versionLabel.title = 'Genius Fast Transcriber v4.0.1 - Nouvelle Interface Premium';
                versionLabel.style.fontSize = '10px';
                versionLabel.style.color = '#888';
                versionLabel.style.opacity = '0.6';

                footerContainer.appendChild(creditLabel);

                // Buy Me a Coffee Link
                const coffeeLink = document.createElement('a');
                coffeeLink.innerHTML = '☕ ' + getTranslation('footer_buy_me_a_coffee');
                coffeeLink.href = 'https://buymeacoffee.com/lnkhey';
                coffeeLink.target = '_blank';
                coffeeLink.rel = 'noopener noreferrer';
                coffeeLink.className = 'gft-footer-link';
                coffeeLink.title = getTranslation('footer_buy_me_a_coffee');

                // GitHub Link
                const githubLink = document.createElement('a');
                githubLink.innerHTML = '<svg height="12" width="12" viewBox="0 0 16 16" fill="currentColor" style="vertical-align: middle; margin-right: 4px;"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>' + getTranslation('footer_github');
                githubLink.href = 'https://github.com/anthogoz/Genius-Fast-Transcriber';
                githubLink.target = '_blank';
                githubLink.rel = 'noopener noreferrer';
                githubLink.className = 'gft-footer-link';
                githubLink.title = 'GitHub - Project Source';

                footerContainer.appendChild(coffeeLink);
                footerContainer.appendChild(githubLink);

                footerContainer.appendChild(versionLabel);
                panelContent.appendChild(footerContainer);
                GFT_STATE.shortcutsContainerElement.appendChild(panelContent);

                // 4. Injecte le panneau complet dans la page.
                targetStickySection.prepend(GFT_STATE.shortcutsContainerElement);

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
                    const artistSelContainer = GFT_STATE.shortcutsContainerElement.querySelector(`#${ARTIST_SELECTOR_CONTAINER_ID}`);
                    if (artistSelContainer && artistSelContainer.parentNode) createArtistSelectors(artistSelContainer.parentNode);
                    else if (GFT_STATE.shortcutsContainerElement) createArtistSelectors(GFT_STATE.shortcutsContainerElement);
                }
                if (GFT_STATE.shortcutsContainerElement) loadDarkModePreference();
            }
            window._gftLastPageTitle = document.title;
            hideGeniusFormattingHelper();
            // Met à jour le label du bouton couplet
            if (GFT_STATE.shortcutsContainerElement) {
                const coupletButton = GFT_STATE.shortcutsContainerElement.querySelector(`#${COUPLET_BUTTON_ID}`);
                if (coupletButton && SHORTCUTS.TAGS_STRUCTURAUX && SHORTCUTS.TAGS_STRUCTURAUX[0]) {
                    const coupletManagerConfig = SHORTCUTS.TAGS_STRUCTURAUX[0].buttons.find(b => b.type === 'coupletManager');
                    if (coupletManagerConfig) {
                        coupletButton.textContent = coupletManagerConfig.main.getLabel();
                    }
                }
            }
        } else {
            if (GFT_STATE.shortcutsContainerElement) { GFT_STATE.shortcutsContainerElement.remove(); GFT_STATE.shortcutsContainerElement = null; }
        }
    } else {
        if (GFT_STATE.shortcutsContainerElement) { GFT_STATE.shortcutsContainerElement.remove(); GFT_STATE.shortcutsContainerElement = null; }
    }
}

/**
 * Extrait les paroles directement de la page (hors éditeur).
 */
function extractLyricsFromPage() {
    const containers = document.querySelectorAll(SELECTORS.LYRICS_CONTAINER);
    if (!containers || containers.length === 0) return "";

    let allText = "";
    containers.forEach(container => {
        const clone = container.cloneNode(true);
        // Nettoyage des éléments parasites (Embed, Footer, Contributors, etc.)
        clone.querySelectorAll('div[class*="Lyrics__Footer"], a[class*="Lyrics__Footer"], div[class*="LyricsHeader"], span[class*="LyricsHeader"]').forEach(el => el.remove());

        // Suppression spécifique des textes de contributeurs s'ils sont capturés
        clone.querySelectorAll('*').forEach(el => {
            if (el.innerText && (el.innerText.includes('Contributor') || el.innerText.includes('Lyrics'))) {
                // Si c'est un petit header de métadonnées, on le vire
                if (el.innerText.length < 50) el.remove();
            }
        });

        clone.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
        clone.querySelectorAll('div, p').forEach(el => {
            el.innerHTML += '\n';
        });
        allText += clone.innerText || clone.textContent;
        allText += '\n\n';
    });

    return allText.trim();
}

/**
 * Initialise l'outil d'exportation dans la toolbar Genius (StickyToolbar).
 */
function initSongPageToolbarEnhancer() {
    if (!isContextValid()) return;
    const isSongPage = document.querySelector('meta[property=\"og:type\"][content=\"music.song\"]') !== null || window.location.pathname.includes('-lyrics');
    if (!isSongPage) return;

    const toolbarLeft = document.querySelector('[data-testid=\"sticky-contributor-toolbar\"] .StickyToolbar__Left-sc-335d47e5-1')
        || document.querySelector('.StickyToolbar__Left-sc-335d47e5-1');
    if (!toolbarLeft) return;

    if (document.getElementById('gft-toolbar-export-btn')) return;

    const lang = getTranscriptionMode();

    // Création du bouton principal (exactement comme "Edit Lyrics")
    const exportBtn = document.createElement('button');
    exportBtn.id = 'gft-toolbar-export-btn';
    // Les classes exactes de Genius pour un look 100% natif
    exportBtn.className = 'SmallButton__Container-sc-f92f54a0-0 cmagge StickyToolbar__SmallButton-sc-335d47e5-5 aIzQu';
    exportBtn.innerHTML = `<span>${TRANSLATIONS[lang].export_btn}</span>`;
    exportBtn.style.marginLeft = '0px'; // Réduit l'espace car les boutons Genius ont déjà leurs marges/paddings
    exportBtn.style.position = 'relative';

    // Menu dropdown
    const dropdown = document.createElement('div');
    dropdown.id = 'gft-export-dropdown';
    dropdown.style.cssText = `
        position: absolute;
        top: calc(100% + 5px);
        left: 0;
        background: white;
        border: 1px solid rgba(0,0,0,0.15);
        border-radius: 6px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        display: none;
        z-index: 10000;
        min-width: 170px;
        padding: 5px 0;
    `;

    const formats = [
        { label: TRANSLATIONS[lang].export_opt_standard, id: 'standard' },
        { label: TRANSLATIONS[lang].export_opt_no_tags, id: 'no-tags' },
        { label: TRANSLATIONS[lang].export_opt_no_spacing, id: 'no-spacing' },
        { label: TRANSLATIONS[lang].export_opt_raw, id: 'raw' }
    ];

    formats.forEach(format => {
        const item = document.createElement('div');
        item.innerText = format.label;
        item.style.cssText = `
            padding: 8px 16px;
            cursor: pointer;
            font-size: 13px;
            color: #111;
            text-align: left;
            transition: background 0.15s;
        `;
        item.onmouseenter = () => item.style.background = '#f2f2f2';
        item.onmouseleave = () => item.style.background = 'transparent';

        item.onclick = (e) => {
            e.stopPropagation();
            dropdown.style.display = 'none';

            let text = "";
            const editor = document.querySelector('.lyrics_edit-text_area, textarea[name=\"song[lyrics]\"]');
            if (editor && editor.value) {
                text = editor.value;
            } else {
                text = extractLyricsFromPage();
            }

            if (!text) {
                showFeedbackMessage(TRANSLATIONS[lang].export_error_no_lyrics, 3000);
                return;
            }

            const title = document.querySelector('h1[class*=\"Title\"]')?.innerText || 'Lyrics';
            const filename = `${title}.txt`;

            exportToTxt(text, filename, {
                removeTags: format.id === 'no-tags' || format.id === 'raw',
                removeSpacing: format.id === 'no-spacing' || format.id === 'raw'
            });

            showFeedbackMessage(TRANSLATIONS[lang].export_success);
        };
        dropdown.appendChild(item);
    });

    exportBtn.onclick = (e) => {
        e.stopPropagation();
        const isShown = dropdown.style.display === 'block';
        dropdown.style.display = isShown ? 'none' : 'block';
    };

    // Fermeture propre au clic ailleurs
    document.addEventListener('click', () => { dropdown.style.display = 'none'; });

    exportBtn.appendChild(dropdown);
    toolbarLeft.appendChild(exportBtn);
}

/**
 * Démarre le MutationObserver pour surveiller les changements dynamiques dans le DOM.
 * C'est essentiel pour les sites de type SPA (Single Page Application) comme Genius.
 */
function startObserver() {
    if (!document.body) { setTimeout(startObserver, 100); return; } // Attend que le body soit prêt.
    if (GFT_STATE.observer && typeof GFT_STATE.observer.disconnect === 'function') { GFT_STATE.observer.disconnect(); } // Déconnecte l'ancien observateur.
    GFT_STATE.observer = new MutationObserver((mutationsList, currentObsInstance) => {
        if (!isContextValid()) {
            currentObsInstance.disconnect();
            return;
        }
        // La fonction de rappel est exécutée à chaque changement détecté dans le DOM.
        let editorAppeared = false; let controlsAppeared = false;
        for (const mutation of mutationsList) { if (mutation.type === 'childList') { if (mutation.addedNodes.length > 0) { mutation.addedNodes.forEach(node => { if (node.nodeType === Node.ELEMENT_NODE && typeof node.matches === 'function') { if (node.matches(SELECTORS.TEXTAREA_EDITOR) || node.matches(SELECTORS.DIV_EDITOR)) editorAppeared = true; if (node.matches(SELECTORS.CONTROLS_STICKY_SECTION)) controlsAppeared = true; } }); } } }
        const editorNowExistsInDOM = document.querySelector(SELECTORS.TEXTAREA_EDITOR) || document.querySelector(SELECTORS.DIV_EDITOR);
        const editorVanished = GFT_STATE.currentActiveEditor && !document.body.contains(GFT_STATE.currentActiveEditor);

        // On vérifie aussi l'apparition de la barre d'outils Genius sur la page
        const toolbarExists = document.querySelector('[data-testid="sticky-contributor-toolbar"]') !== null;

        // Si l'éditeur apparaît ou disparaît, on relance l'initialisation.
        if (editorAppeared || controlsAppeared || (!GFT_STATE.currentActiveEditor && editorNowExistsInDOM) || editorVanished || toolbarExists) {
            // On se déconnecte temporairement pour éviter les boucles infinies.
            currentObsInstance.disconnect();

            initLyricsEditorEnhancer();
            initSongPageToolbarEnhancer();

            // On vérifie aussi les iframes YouTube pour injecter l'API
            enableYoutubeJsApi();

            // On se reconnecte après un court délai.
            setTimeout(() => { startObserver(); }, 200);
        } else {
            // Même sans re-init complet, on vérifie si de nouveaux iframes sont apparus
            enableYoutubeJsApi();
        }
    });
    // Commence à GFT_STATE.observer le `body` et tous ses descendants.
    try { GFT_STATE.observer.observe(document.body, { childList: true, subtree: true }); } catch (e) { console.error("[Observer] Erreur initiale:", e); }
    // Fait un premier appel pour gérer le cas où l'éditeur est déjà présent au chargement.
    initLyricsEditorEnhancer();

    // Si on est sur une page de chanson (même sans éditeur), on extrait les métadonnées et on prépare la toolbar
    const isSongPage = document.querySelector('meta[property="og:type"][content="music.song"]') !== null || window.location.pathname.includes('-lyrics');
    if (isSongPage) {
        extractSongData();
        createFloatingFormattingToolbar();
        initSongPageToolbarEnhancer();
    }
}

// ----- Démarrage du Script -----

// Gère le chargement initial de la page.
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { applyStoredPreferences(); startObserver(); });
else { applyStoredPreferences(); startObserver(); }

// Ajoute des écouteurs d'événements pour gérer la navigation SPA.
window.addEventListener('load', () => { applyStoredPreferences(); initLyricsEditorEnhancer(); initSongPageToolbarEnhancer(); });
window.addEventListener('popstate', () => { applyStoredPreferences(); initLyricsEditorEnhancer(); initSongPageToolbarEnhancer(); });
window.addEventListener('hashchange', () => { applyStoredPreferences(); initLyricsEditorEnhancer(); initSongPageToolbarEnhancer(); });

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
    if (GFT_STATE.observer && typeof GFT_STATE.observer.disconnect === 'function') GFT_STATE.observer.disconnect();
    if (GFT_STATE.shortcutsContainerElement) GFT_STATE.shortcutsContainerElement.remove();
    if (GFT_STATE.floatingFormattingToolbar) GFT_STATE.floatingFormattingToolbar.remove();
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
    if (typeof GFT_STATE.currentMainArtists !== 'undefined' && GFT_STATE.currentMainArtists.length > 0) {
        const artistName = GFT_STATE.currentMainArtists[0];
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

    // 1. Dessine le fond (Image zoomée pour remplir ou couleur solide)
    if (imageObj && imageObj.width > 0) {
        try {
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
        } catch (e) {
            console.warn("[GFT] Failed to draw image on canvas (CORS?):", e);
            ctx.fillStyle = footerColor || '#000';
            ctx.fillRect(0, 0, WIDTH, HEIGHT);
        }
    } else {
        // Fallback fond plein si pas d'image
        ctx.fillStyle = footerColor || '#000';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }

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

    // Construction du texte
    const firstPart = artistName.toUpperCase() + ",";
    const secondPart = ` "${songTitle.toUpperCase()}"`;
    const fullText = firstPart + secondPart;

    // Calcul de l'espace disponible
    const maxFooterTextWidth = logoX - 40 - 60;

    // Mesure
    let textWidth = ctx.measureText(fullText).width;

    if (textWidth <= maxFooterTextWidth) {
        // Rendu sur une seule ligne (cas standard)
        ctx.fillText(fullText, 60, HEIGHT - (FOOTER_HEIGHT / 2));
    } else {
        // Rendu sur deux lignes
        let line1 = firstPart;
        let line2 = secondPart.trim();

        // Fonction utilitaire de troncature interne
        const truncate = (text, maxWidth) => {
            let t = text;
            if (ctx.measureText(t).width <= maxWidth) return t;
            while (ctx.measureText(t + "...").width > maxWidth && t.length > 0) {
                t = t.slice(0, -1);
            }
            return t + "...";
        };

        // On tronque chaque ligne si elle dépasse individuellement le max
        line1 = truncate(line1, maxFooterTextWidth);
        line2 = truncate(line2, maxFooterTextWidth);

        // Positionnement vertical pour deux lignes centrées
        const spacing = 4;
        const line1Y = HEIGHT - (FOOTER_HEIGHT / 2) - (FONT_SIZE_FOOTER / 2) - spacing;
        const line2Y = HEIGHT - (FOOTER_HEIGHT / 2) + (FONT_SIZE_FOOTER / 2) + spacing;

        ctx.fillText(line1, 60, line1Y);
        ctx.fillText(line2, 60, line2Y);
    }
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
    versionSpan.textContent = 'v4.0.1';
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
    const allArtists = [...new Set([...GFT_STATE.currentMainArtists, ...GFT_STATE.currentFeaturingArtists])].filter(Boolean);

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
        // Force un premier rendu "vide" (fond noir) pour éviter l'écran blanc si c'est le premier chargement
        if (!canvas.renderedOnce) {
            renderLyricCardToCanvas(canvas, text, displayArtistName, songTitle, null, '#111', 'white', null, currentFormat);
            canvas.renderedOnce = true;
        }

        const img = new Image();
        let isTimedOut = false;

        // Sécurité chargement long
        const timeout = setTimeout(() => {
            isTimedOut = true;
            console.warn("[GFT] Image load timeout. Rendering with fallback color.");
            renderLyricCardToCanvas(canvas, text, displayArtistName, songTitle, null, '#111', 'white', null, currentFormat);
        }, 4000);

        if (imageUrl.startsWith('data:')) {
            img.src = imageUrl;
        } else {
            img.crossOrigin = "Anonymous";
            // On ajoute un timestamp pour éviter le cache navigateur agressif qui pourrait ignorer les headers CORS
            const separator = imageUrl.includes('?') ? '&' : '?';
            img.src = `${imageUrl}${separator}t=${Date.now()}`;
        }

        img.onload = () => {
            if (isTimedOut) return;
            clearTimeout(timeout);

            const dominantColor = getDominantColor(img);
            const contrastColor = getContrastColor(dominantColor);

            // Charge le logo de manière asynchrone aussi
            const logoImg = new Image();
            if (!isContextValid()) return;
            const logoUrl = chrome.runtime.getURL(contrastColor === 'white' ? 'images/geniuslogowhite.png' : 'images/geniuslogoblack.png');
            logoImg.src = logoUrl;

            logoImg.onload = () => {
                renderLyricCardToCanvas(canvas, text, displayArtistName, songTitle, img, dominantColor, contrastColor, logoImg, currentFormat);
            };
            logoImg.onerror = () => {
                renderLyricCardToCanvas(canvas, text, displayArtistName, songTitle, img, dominantColor, contrastColor, null, currentFormat);
            };
        };

        img.onerror = (e) => {
            if (isTimedOut) return;
            clearTimeout(timeout);
            console.error("[GFT] Main image load error:", imageUrl, e);
            // On fait quand même le rendu avec un fond par défaut
            renderLyricCardToCanvas(canvas, text, displayArtistName, songTitle, null, '#111', 'white', null, currentFormat);
            showFeedbackMessage(getTranslation('lc_feedback_load_error'), 3000);
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
    if (!isContextValid()) return;
    const selection = window.getSelection();
    if (!selection || selection.toString().trim().length === 0) {
        showFeedbackMessage(getTranslation('lc_select_text_error'));
        return;
    }

    const text = selection.toString().trim();
    const songTitle = GFT_STATE.currentSongTitle || "Titre Inconnu";
    const artistName = GFT_STATE.currentMainArtists.length > 0 ? GFT_STATE.currentMainArtists.join(' & ') : "Artiste Inconnu";

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
    const primaryArtistName = GFT_STATE.currentMainArtists.length > 0 ? GFT_STATE.currentMainArtists[0] : null;
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
 * Calcule la couleur dominante d'une image.
 * Version simplifiée : moyenne des pixels du centre.
 */
function getDominantColor(img) {
    try {
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
    } catch (e) {
        console.warn("[GFT] Dominant color detection failed (probably CORS). Defaulting to black.", e);
        return "rgb(0,0,0)";
    }
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
        const msg = newState ? getTranslation('header_feat_show') : getTranslation('header_feat_hide');
        showFeedbackMessage(msg, 2000, GFT_STATE.shortcutsContainerElement || document.body);
    }
}

function gftToggleTagNewlines() {
    if (typeof isTagNewlinesDisabled === 'function' && typeof setTagNewlinesDisabled === 'function') {
        const currentValue = isTagNewlinesDisabled();
        const newState = !currentValue;
        setTagNewlinesDisabled(newState);
        const msg = !newState ? getTranslation('newline_enable') : getTranslation('newline_disable');
        showFeedbackMessage(msg, 2000, GFT_STATE.shortcutsContainerElement || document.body);
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
    if (GFT_STATE.feedbackTimeout) {
        clearTimeout(GFT_STATE.feedbackTimeout);
        GFT_STATE.feedbackTimeout = null;
    }
    // Annuler le timer d'animation de fermeture précédent
    if (GFT_STATE.feedbackAnimationTimeout) {
        clearTimeout(GFT_STATE.feedbackAnimationTimeout);
        GFT_STATE.feedbackAnimationTimeout = null;
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
        GFT_STATE.feedbackTimeout = setTimeout(() => {
            feedbackEl.style.opacity = '0';
            if (feedbackEl.id === FEEDBACK_MESSAGE_ID) {
                feedbackEl.style.maxHeight = '0';
                feedbackEl.style.marginTop = '0';
                feedbackEl.style.marginBottom = '0';
                feedbackEl.style.paddingTop = '0';
                feedbackEl.style.paddingBottom = '0';
            }
            GFT_STATE.feedbackAnimationTimeout = setTimeout(() => {
                feedbackEl.style.visibility = 'hidden';
                if (feedbackEl.id === 'gft-global-toast') {
                    // Ne pas cacher display:none car transition, mais ok pour toast
                } else {
                    feedbackEl.style.display = 'none';
                }
                GFT_STATE.feedbackAnimationTimeout = null;
            }, 300);
            GFT_STATE.feedbackTimeout = null;
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
 * @param {string} initialTab - 'create' ou 'library' pour l'onglet par défaut.
 */
function openCustomButtonManager(defaultType = 'structure', initialTab = 'create') {
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
        backdrop-filter: blur(5px);
    `;
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

    // Modal Container
    const modal = document.createElement('div');
    modal.className = `gft-custom-manager-modal ${isDarkMode ? 'gft-dark-mode' : ''}`;
    modal.style.background = isDarkMode ? '#222' : 'white';
    modal.style.color = isDarkMode ? '#eee' : '#222';
    modal.style.padding = '24px';
    modal.style.borderRadius = '12px';
    modal.style.boxShadow = '0 20px 50px rgba(0,0,0,0.5)';
    modal.style.position = 'relative';

    // Titre
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.innerHTML = `<h2 style="margin:0; font-size:20px; font-weight:700;">${getTranslation('custom_manager_title')}</h2>`;

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.background = 'none'; closeBtn.style.border = 'none';
    closeBtn.style.fontSize = '28px'; closeBtn.style.cursor = 'pointer';
    closeBtn.style.color = 'inherit'; closeBtn.style.opacity = '0.5';
    closeBtn.onmouseenter = () => closeBtn.style.opacity = '1';
    closeBtn.onmouseleave = () => closeBtn.style.opacity = '0.5';
    closeBtn.onclick = () => overlay.remove();
    header.appendChild(closeBtn);
    modal.appendChild(header);

    // Tabs
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'gft-tabs';
    const tabCreate = document.createElement('button');
    tabCreate.className = 'gft-tab-btn active'; tabCreate.textContent = getTranslation('custom_manager_tab_create');
    const tabManage = document.createElement('button');
    tabManage.className = 'gft-tab-btn'; tabManage.textContent = getTranslation('custom_manager_tab_library');

    tabsContainer.appendChild(tabCreate);
    tabsContainer.appendChild(tabManage);
    modal.appendChild(tabsContainer);

    // Contenu "Créer"
    const contentCreate = document.createElement('div');
    contentCreate.style.display = 'flex';
    contentCreate.style.flexDirection = 'column';
    contentCreate.style.gap = '5px';

    // Type Selector
    const typeGroup = document.createElement('div');
    typeGroup.className = 'gft-form-group';
    typeGroup.innerHTML = `<label class="gft-form-label">${getTranslation('custom_mgr_action_type')}</label>`;
    const typeSelect = document.createElement('select');
    typeSelect.className = 'gft-form-select';
    typeSelect.innerHTML = `
        <option value="structure">🏗️ ${getTranslation('custom_mgr_type_structure')}</option>
        <option value="cleanup">🧹 ${getTranslation('custom_mgr_type_cleanup')}</option>
    `;
    typeSelect.value = defaultType;
    typeGroup.appendChild(typeSelect);
    contentCreate.appendChild(typeGroup);

    // Nom / Label
    const nameGroup = document.createElement('div');
    nameGroup.className = 'gft-form-group';
    nameGroup.innerHTML = `<label class="gft-form-label">${getTranslation('custom_mgr_button_label')}</label>`;
    const nameInput = document.createElement('input');
    nameInput.className = 'gft-form-input';
    nameInput.maxLength = 25;
    nameInput.placeholder = getTranslation('custom_mgr_btn_label_placeholder');
    nameGroup.appendChild(nameInput);
    contentCreate.appendChild(nameGroup);

    // Preview Zone
    const previewZone = document.createElement('div');
    previewZone.className = 'gft-preview-zone';
    previewZone.innerHTML = `<div style="font-size:10px; opacity:0.5; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Preview</div>`;
    const previewBtn = document.createElement('button');
    previewBtn.className = 'gft-shortcut-button';
    previewBtn.style.pointerEvents = 'none';
    previewBtn.textContent = 'Label';
    previewZone.appendChild(previewBtn);
    contentCreate.appendChild(previewZone);

    nameInput.oninput = () => {
        previewBtn.textContent = nameInput.value.trim() || 'Label';
    };

    // Champs dynamiques selon le type
    const dynamicFields = document.createElement('div');

    const renderDynamicFields = () => {
        dynamicFields.innerHTML = '';
        const type = typeSelect.value;
        previewBtn.className = type === 'structure' ? 'gft-shortcut-button gft-btn-struct' : 'gft-shortcut-button gft-btn-cleanup';

        if (type === 'structure') {
            const grp = document.createElement('div');
            grp.className = 'gft-form-group';
            grp.innerHTML = `<label class="gft-form-label">${getTranslation('custom_mgr_text_to_insert')}</label>`;
            const input = document.createElement('textarea');
            input.id = 'gft-custom-content';
            input.className = 'gft-form-textarea';
            input.placeholder = "[Verse]\n";
            input.rows = 3;
            grp.appendChild(input);
            dynamicFields.appendChild(grp);
        } else {
            // Cleanup: Mode Simple vs Avancé
            const switchesRow = document.createElement('div');
            switchesRow.style.display = 'flex'; switchesRow.style.gap = '15px'; switchesRow.style.marginBottom = '12px';

            const modeSwitch = document.createElement('div');
            modeSwitch.style.display = 'flex'; modeSwitch.style.alignItems = 'center'; modeSwitch.style.gap = '5px';
            modeSwitch.style.fontSize = '12px';
            const chk = document.createElement('input'); chk.type = 'checkbox'; chk.id = 'gft-advanced-regex';
            chk.style.width = '16px'; chk.style.height = '16px';
            const lbl = document.createElement('label'); lbl.htmlFor = 'gft-advanced-regex'; lbl.textContent = getTranslation('custom_mgr_advanced_regex');
            lbl.style.cursor = 'pointer';
            modeSwitch.appendChild(chk);
            modeSwitch.appendChild(lbl);
            switchesRow.appendChild(modeSwitch);

            // Case Sensitive Switch
            const caseSwitch = document.createElement('div');
            caseSwitch.style.display = 'flex'; caseSwitch.style.alignItems = 'center'; caseSwitch.style.gap = '5px';
            caseSwitch.style.fontSize = '12px';
            const chkCase = document.createElement('input'); chkCase.type = 'checkbox'; chkCase.id = 'gft-case-sensitive';
            chkCase.style.width = '16px'; chkCase.style.height = '16px';
            const lblCase = document.createElement('label'); lblCase.htmlFor = 'gft-case-sensitive'; lblCase.textContent = getTranslation('custom_mgr_case_sensitive');
            lblCase.style.cursor = 'pointer';
            caseSwitch.appendChild(chkCase);
            caseSwitch.appendChild(lblCase);
            switchesRow.appendChild(caseSwitch);

            dynamicFields.appendChild(switchesRow);

            // Rechercher
            const grpFind = document.createElement('div');
            grpFind.className = 'gft-form-group';
            grpFind.innerHTML = `<label class="gft-form-label">${getTranslation('custom_mgr_find_pattern')}</label>`;
            const inputFind = document.createElement('input');
            inputFind.id = 'gft-custom-find';
            inputFind.className = 'gft-form-input';
            grpFind.appendChild(inputFind);
            dynamicFields.appendChild(grpFind);

            // Remplacer
            const grpRep = document.createElement('div');
            grpRep.className = 'gft-form-group';
            grpRep.innerHTML = `<label class="gft-form-label">${getTranslation('custom_mgr_replace_with')}</label>`;
            const inputRep = document.createElement('input');
            inputRep.id = 'gft-custom-replace';
            inputRep.className = 'gft-form-input';
            inputRep.placeholder = getTranslation('custom_mgr_replace_placeholder');
            grpRep.appendChild(inputRep);
            dynamicFields.appendChild(grpRep);

            chk.onchange = () => {
                if (chk.checked) {
                    inputFind.placeholder = getTranslation('custom_mgr_find_placeholder_regex');
                } else {
                    inputFind.placeholder = getTranslation('custom_mgr_find_placeholder_exact');
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
    saveBtn.textContent = getTranslation('custom_mgr_save_button');
    saveBtn.className = 'gft-tutorial-button';
    saveBtn.style.cssText = 'background: #f9ff55; color: black; border: none; padding: 12px; font-weight: bold; border-radius: 8px; cursor: pointer; margin-top: 10px; width: 100%; font-size:15px;';
    saveBtn.onclick = () => {
        const type = typeSelect.value;
        const label = nameInput.value.trim();
        if (!label) return alert(getTranslation('custom_mgr_error_no_label'));

        const btnData = {
            label: label,
            type: type
        };

        if (type === 'structure') {
            const content = document.getElementById('gft-custom-content').value;
            if (!content) return alert(getTranslation('custom_mgr_error_no_content'));
            btnData.content = content;
        } else {
            const find = document.getElementById('gft-custom-find').value;
            const rep = document.getElementById('gft-custom-replace').value;
            const isRegex = document.getElementById('gft-advanced-regex').checked;
            const isCaseSensitive = document.getElementById('gft-case-sensitive').checked;

            if (!find) return alert(getTranslation('custom_mgr_error_no_content'));

            btnData.regex = isRegex ? find : escapeRegExp(find);
            btnData.replacement = rep;
            btnData.isExplicitRegex = isRegex;
            btnData.isCaseSensitive = isCaseSensitive;
        }

        saveCustomButton(btnData);
        showFeedbackMessage(getTranslation('custom_mgr_success_created'), 3000);
        overlay.remove();
        setTimeout(() => window.location.reload(), 1000);
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
            list.innerHTML = `<div style="padding:30px; text-align:center; opacity:0.5; font-style:italic;">${getTranslation('custom_mgr_empty_library')}</div>`;
        } else {
            buttons.forEach(btn => {
                const item = document.createElement('div');
                item.className = 'gft-custom-item';

                const icon = btn.type === 'structure' ? '🏗️' : '🧹';
                const info = document.createElement('div');
                info.style.display = 'flex'; info.style.alignItems = 'center'; info.style.gap = '8px';
                info.innerHTML = `
                    <span style="font-size:18px;">${icon}</span>
                    <div style="display:flex; flex-direction:column;">
                        <span style="font-weight:600; font-size:14px;">${btn.label}</span>
                        <span style="font-size:10px; opacity:0.5; text-transform:uppercase; letter-spacing:0.5px;">${btn.type}</span>
                    </div>
                `;

                const actions = document.createElement('div');
                actions.style.display = 'flex'; actions.style.gap = '5px';

                const delBtn = document.createElement('button');
                delBtn.style.cssText = 'background:rgba(255,0,0,0.1); border:none; padding:8px; border-radius:6px; cursor:pointer; color:#ff4444; font-size:14px;';
                delBtn.innerHTML = '🗑️';
                delBtn.title = 'Delete';
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

        // Zone Import / Export
        const ioZone = document.createElement('div');
        ioZone.className = 'gft-io-zone';
        ioZone.innerHTML = `<div style="font-weight:700; font-size:13px; margin-bottom:10px; display:flex; align-items:center; gap:5px;">📤 ${getTranslation('custom_mgr_share_presets')}</div>`;

        const codeArea = document.createElement('textarea');
        codeArea.className = 'gft-code-area';
        codeArea.placeholder = getTranslation('custom_mgr_import_placeholder');

        const btnContainer = document.createElement('div');
        btnContainer.style.display = 'flex'; btnContainer.style.gap = '10px'; btnContainer.style.marginTop = '10px';

        const exportBtn = document.createElement('button');
        exportBtn.textContent = getTranslation('custom_mgr_export_code');
        exportBtn.className = 'gft-tutorial-button';
        exportBtn.style.flex = '1'; exportBtn.style.fontSize = '12px'; exportBtn.style.padding = '8px';
        exportBtn.onclick = () => {
            const code = exportCustomButtons();
            codeArea.value = code;
            codeArea.select();
            document.execCommand('copy');
            showFeedbackMessage(getTranslation('common_copy_success') || "Copied!", 2000);
        };

        const importBtn = document.createElement('button');
        importBtn.textContent = getTranslation('custom_mgr_import_button');
        importBtn.className = 'gft-tutorial-button';
        importBtn.style.flex = '1'; importBtn.style.fontSize = '12px'; importBtn.style.padding = '8px';
        importBtn.style.background = '#f9ff55'; importBtn.style.color = 'black';
        importBtn.onclick = () => {
            const code = codeArea.value.trim();
            if (!code) return;
            if (importCustomButtons(code)) {
                showFeedbackMessage(getTranslation('custom_mgr_success_imported'), 3000);
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

    // Tab Logic
    tabCreate.onclick = () => {
        tabCreate.classList.add('active'); tabManage.classList.remove('active');
        contentCreate.style.display = 'flex'; contentManage.style.display = 'none';
        renderDynamicFields();
    };
    tabManage.onclick = () => {
        tabManage.classList.add('active'); tabCreate.classList.remove('active');
        contentManage.style.display = 'block'; contentCreate.style.display = 'none';
        renderList();
    };

    // Initial tab
    if (initialTab === 'library') {
        tabManage.onclick();
    } else {
        tabCreate.onclick();
    }

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
        // Synchroniser le mode de transcription avec la langue choisie
        if (typeof setTranscriptionMode === 'function') {
            setTranscriptionMode(request.language);
        }
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
