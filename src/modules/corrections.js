// Auto-extracted from content.js — Text Correction Functions
// Includes: isSectionTag, correctLineSpacing, applyTextTransformToDivEditor,
// applyAllTextCorrectionsToString, applyAllTextCorrectionsAsync

import { getTranslation } from './utils.js';

function isSectionTag(line) {
    const trimmed = line.trim();

    // Cas 1 : Tag standard [Couplet]
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        // Exclut les placeholders [?] (un ou plusieurs points d'interrogation)
        if (/^\[\?+\]$/.test(trimmed)) return false;
        return true;
    }

    // Cas 2 : Tag annoté (lien Genius) ex: [[Couplet]](id)
    // Regex : DOIT commencer par [[ pour être un tag lié (donc le contenu visible est [Tag])
    // Ceci évite de confondre avec une simple annotation sur une ligne complète ex: [Paroles annotées](id)
    if (/^\[\[.*\]\]\(.*\)$/.test(trimmed)) {
        return true;
    }

    return false;
}

/**
 * Corrige les espacements entre les lignes :
 * - Ajoute une ligne vide avant chaque tag de section (sauf le premier).
 * - Supprime les lignes vides en double ou inutiles.
 * @param {string} text - Le texte à corriger.
 * @returns {{newText: string, correctionsCount: number}} Le texte corrigé et le nombre de corrections.
 */
/**
 * Corrige les espacements entre les lignes :
 * - Ajoute une ligne vide avant chaque tag de section (sauf le premier).
 * - Supprime les lignes vides en double ou inutiles.
 * @param {string} text - Le texte à corriger.
 * @returns {{newText: string, correctionsCount: number}} Le texte corrigé et le nombre de corrections.
 */
function correctLineSpacing(text) {
    const originalLines = text.split('\n');
    let correctionsCount = 0;

    if (originalLines.length === 0) {
        return { newText: "", correctionsCount: 0 };
    }

    // 1. Identification des corrections nécessaires (sans modifier pour l'instant)
    // On travaille d'abord sur une structure intermédiaire pour compter les ajouts
    const linesWithAddedSpacing = [];

    for (let i = 0; i < originalLines.length; i++) {
        const currentLine = originalLines[i];
        linesWithAddedSpacing.push(currentLine);

        // Vérifie si on doit ajouter une ligne vide après la ligne courante
        if (currentLine.trim() !== "" && !isSectionTag(currentLine)) {
            if ((i + 1) < originalLines.length) {
                const nextLine = originalLines[i + 1];
                if (nextLine.trim() !== "" && isSectionTag(nextLine)) {
                    // Il manque une ligne vide, on l'ajoute
                    linesWithAddedSpacing.push("");
                    correctionsCount++; // +1 pour ajout de ligne
                }
            }
        }
    }

    // 2. Nettoyage des lignes vides existantes superflues
    const cleanedLines = [];

    // On parcourt les lignes (avec les ajouts potentiels) pour filtrer
    for (let i = 0; i < linesWithAddedSpacing.length; i++) {
        const currentLine = linesWithAddedSpacing[i];
        const trimmedLine = currentLine.trim();

        if (trimmedLine !== "") {
            // Ligne de texte : on la garde toujours
            cleanedLines.push(currentLine);
        } else {
            // C'est une ligne vide
            // On doit décider si on la garde

            // Si c'est la toute première ligne, on vire (sauf si le texte était vide, géré en haut)
            if (cleanedLines.length === 0) {
                // Suppression ligne vide au début
                // Si cette ligne vide existait dans l'original (pas un ajout de l'étape 1), on compte correction
                // (Difficile de tracer parfaitement l'origine, on simplifie : si on retire une ligne vide, c'est une correction)
                correctionsCount++;
                continue;
            }

            const prevLine = cleanedLines[cleanedLines.length - 1]; // Dernière ligne validée

            // Regarde la prochaine ligne non vide
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
                // Ligne vide à la fin du texte : on supprime
                correctionsCount++;
                continue;
            }

            // Règle : Une ligne vide est autorisée SEULEMENT AVANT un tag
            if (nextLineIsTag) {
                // Vérifie qu'on n'a pas déjà mis une ligne vide juste avant
                if (prevLine.trim() === "") {
                    // Doublon de ligne vide : on supprime celle-ci
                    correctionsCount++;
                } else {
                    // C'est une ligne vide utile (Texte -> Vide -> Tag)
                    // On la garde. 
                    // Si elle vient de l'étape 1 (ajoutée), le compteur est déjà incrémenté.
                    // Si elle était déjà là, on ne touche pas au compteur.
                    cleanedLines.push(currentLine);
                }
            } else {
                // Ligne vide inutile (ex: entre deux lignes de couplet) : on supprime
                correctionsCount++;
            }
        }
    }

    // On revérifie si le comptage n'est pas trop agressif (ex: suppression de lignes ajoutées par nous-même ?)
    // Non, les lignes ajoutées à l'étape 1 sont placées stratégiquement (Texte->Tag devenant Texte->Vide->Tag).
    // À l'étape 2, la logique "S'il y a une ligne vide avant un Tag et que la ligne d'avant n'est pas vide -> on garde"
    // protégera nos ajouts.

    // Cas spécifique : Si on a compté des suppressions de lignes qu'on venait d'ajouter (ne devrait pas arriver avec la logique actuelle
    // mais par sécurité on compare le texte final).

    // Correction finale pour éviter les incréments excessifs sur des cas simples
    // On recalcule un delta "brut" si le algo détaillé donne un résultat incohérent (peu probable mais prudent)
    // Mais pour l'instant, faisons confiance à la logique pas à pas.
    // Seul bémol : "Suppression ligne vide au début" -> si original avait 3 lignes vides au début, on incrémente 3 fois. Correct.

    // Recalage final si texte identique (pour éviter les faux positifs 0 vs 1)
    const newText = cleanedLines.join('\n');
    if (text === newText) return { newText, correctionsCount: 0 };

    // Si le texte change mais qu'on a compté 0 (ex: trim simple ?), on force 1
    if (correctionsCount === 0 && text !== newText) correctionsCount = 1;

    return { newText, correctionsCount };
}


/**
 * Applique une fonction de transformation de texte à un éditeur `div contenteditable`.
 * Cette fonction est nécessaire car on ne peut pas simplement modifier une propriété `value`.
 * Il faut reconstruire le contenu DOM de l'éditeur.
 * @param {HTMLElement} editorNode - L'élément `div` de l'éditeur.
 * @param {Function} transformFunction - La fonction qui prend le texte en entrée et retourne { newText, correctionsCount }.
 * @returns {number} Le nombre de corrections effectuées.
 */
function applyTextTransformToDivEditor(editorNode, transformFunction) {
    // 1. Sauvegarde la position du curseur.
    const selection = window.getSelection();
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0).cloneRange() : null;
    let currentTextContent = "";
    const lineElements = [];
    let nodeBuffer = "";

    // 2. Extrait le texte brut du div en gérant les <br> et autres éléments.
    editorNode.childNodes.forEach(child => {
        if (child.nodeName === 'BR') {
            if (nodeBuffer) lineElements.push(document.createTextNode(nodeBuffer));
            nodeBuffer = "";
            lineElements.push(document.createElement('br'));
        } else if (child.nodeType === Node.TEXT_NODE) {
            nodeBuffer += child.textContent;
        } else if (child.nodeType === Node.ELEMENT_NODE) {
            if (nodeBuffer) lineElements.push(document.createTextNode(nodeBuffer));
            nodeBuffer = "";
            if (child.nodeName === 'DIV' || child.nodeName === 'P') {
                if (child.textContent.trim() !== "") {
                    lineElements.push(child.cloneNode(true));
                } else if (child.querySelector('br')) {
                    lineElements.push(document.createElement('br'));
                }
            } else {
                nodeBuffer += child.textContent;
            }
        }
    });
    if (nodeBuffer) lineElements.push(document.createTextNode(nodeBuffer));

    currentTextContent = "";
    lineElements.forEach(el => {
        if (el.nodeName === 'BR') {
            currentTextContent += '\n';
        } else if (el.nodeType === Node.TEXT_NODE) {
            currentTextContent += el.textContent;
        } else if (el.nodeName === 'DIV' || el.nodeName === 'P') {
            currentTextContent += el.textContent + '\n';
        }
    });
    currentTextContent = currentTextContent.replace(/\n+$/, '');

    // 3. Applique la fonction de transformation sur le texte brut.
    const { newText, correctionsCount } = transformFunction(currentTextContent);

    // 4. Si le texte a changé, vide le div et le reconstruit.
    if (currentTextContent !== newText || correctionsCount > 0) {
        editorNode.innerHTML = '';
        newText.split('\n').forEach((lineText, index, arr) => {
            const lineDiv = document.createElement('div');
            if (lineText === "") {
                if (index === arr.length - 1 && arr.length > 1 && !newText.endsWith("\n\n")) {
                    // Ne rien faire pour la dernière ligne si elle est vide (évite un <br> en trop)
                } else {
                    lineDiv.appendChild(document.createElement('br'));
                }
            } else {
                lineDiv.textContent = lineText;
            }
            editorNode.appendChild(lineDiv);
        });

        // S'assure que l'éditeur n'est jamais complètement vide.
        if (editorNode.childNodes.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.appendChild(document.createElement('br'));
            editorNode.appendChild(emptyDiv);
        }

        // 5. Restaure la position du curseur à la fin du texte.
        if (range) {
            try {
                const lastDiv = editorNode.lastChild;
                if (lastDiv) {
                    const newRange = document.createRange();
                    if (lastDiv.nodeName === 'DIV') {
                        if (lastDiv.firstChild && lastDiv.firstChild.nodeName === 'BR') {
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
            } catch (e) { console.warn("Erreur restauration sélection après transformDiv:", e); }
        }
        editorNode.focus();
        // 6. Déclenche un événement 'input' pour que Genius détecte le changement.
        const inputEvent = new Event('input', { bubbles: true, cancelable: true });
        editorNode.dispatchEvent(inputEvent);
    }
    return correctionsCount;
}

/**
 * Chaîne toutes les corrections de texte individuelles en une seule passe.
 * @param {string} text - Le texte d'origine.
 * @param {object} options - Options de corrections activées (par défaut toutes true).
 * @returns {{newText: string, correctionsCount: number, corrections: object}} Le texte final corrigé, le nombre total et les détails par type.
 */
function applyAllTextCorrectionsToString(text, options = {}) {
    // Options par défaut (tout activé)
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

    // Objet pour tracker les corrections par type
    const corrections = {
        yPrime: 0,
        apostrophes: 0,
        oeuLigature: 0,
        frenchQuotes: 0,
        longDash: 0,
        doubleSpaces: 0,
        spacing: 0
    };

    // Correction de "y'" -> "y "
    if (opts.yPrime) {
        const yPrimePattern = /\b(Y|y)['']/g;
        const yPrimeReplacement = (match, firstLetter) => (firstLetter === 'Y' ? 'Y ' : 'y ');
        const textAfterYPrime = currentText.replace(yPrimePattern, yPrimeReplacement);
        if (textAfterYPrime !== currentText) {
            corrections.yPrime = (currentText.match(yPrimePattern) || []).length;
            currentText = textAfterYPrime;
        }
    }

    // Correction de l'apostrophe typographique ' -> '
    if (opts.apostrophes) {
        const apostrophePattern = /['']/g;
        const textAfterApostrophe = currentText.replace(apostrophePattern, "'");
        if (textAfterApostrophe !== currentText) {
            corrections.apostrophes = (currentText.match(apostrophePattern) || []).length;
            currentText = textAfterApostrophe;
        }
    }

    // Correction de "oeu" -> "œu"
    if (opts.oeuLigature) {
        const oeuPattern = /([Oo])eu/g;
        const oeuReplacement = (match, firstLetter) => (firstLetter === 'O' ? 'Œu' : 'œu');
        const textAfterOeu = currentText.replace(oeuPattern, oeuReplacement);
        if (textAfterOeu !== currentText) {
            corrections.oeuLigature = (currentText.match(oeuPattern) || []).length;
            currentText = textAfterOeu;
        }
    }

    // Correction des guillemets français «» -> "
    if (opts.frenchQuotes) {
        const frenchQuotesPattern = /[«»]/g;
        const textAfterFrenchQuotes = currentText.replace(frenchQuotesPattern, '"');
        if (textAfterFrenchQuotes !== currentText) {
            corrections.frenchQuotes = (currentText.match(frenchQuotesPattern) || []).length;
            currentText = textAfterFrenchQuotes;
        }
    }

    // Correction des tirets longs — – -> - (ou inversement pour PL)
    if (opts.longDash) {
        if (typeof isPolishTranscriptionMode === 'function' && isPolishTranscriptionMode()) {
            // Pour le polonais : standardiser les tirets de séparation (-) en tirets longs (—)
            // On vise les tirets entourés d'espaces : " - " -> " — "
            const polishDashPattern = / - /g;
            const textAfterPolishDash = currentText.replace(polishDashPattern, ' — ');
            if (textAfterPolishDash !== currentText) {
                corrections.longDash = (currentText.match(polishDashPattern) || []).length;
                currentText = textAfterPolishDash;
            }
        } else {
            // Comportement standard (FR/EN) : tirets longs -> tirets courts
            const longDashPattern = /[—–]/g;
            const textAfterLongDash = currentText.replace(longDashPattern, '-');
            if (textAfterLongDash !== currentText) {
                corrections.longDash = (currentText.match(longDashPattern) || []).length;
                currentText = textAfterLongDash;
            }
        }
    }

    // Correction des doubles espaces
    if (opts.doubleSpaces) {
        const doubleSpacesPattern = /  +/g;
        const textAfterDoubleSpaces = currentText.replace(doubleSpacesPattern, ' ');
        if (textAfterDoubleSpaces !== currentText) {
            corrections.doubleSpaces = (currentText.match(doubleSpacesPattern) || []).length;
            currentText = textAfterDoubleSpaces;
        }
    }

    // Application de la correction d'espacement
    if (opts.spacing) {
        result = correctLineSpacing(currentText);
        if (result.correctionsCount > 0) {
            corrections.spacing = result.correctionsCount;
            currentText = result.newText;
        }
    }

    // Calcul du total
    const totalCorrections = corrections.yPrime + corrections.apostrophes +
        corrections.oeuLigature + corrections.frenchQuotes + corrections.longDash +
        corrections.doubleSpaces + corrections.spacing;

    return { newText: currentText, correctionsCount: totalCorrections, corrections: corrections };
}

/**
 * Version asynchrone de applyAllTextCorrectionsToString avec barre de progression.
 * @param {string} text - Le texte d'origine.
 * @param {Function} [showProgressFn] - Optional callback for progress: showProgressFn(step, total, message)
 * @returns {Promise<{newText: string, correctionsCount: number, corrections: object}>} Le texte corrigé et les détails.
 */
async function applyAllTextCorrectionsAsync(text, showProgressFn) {
    const showProgress = showProgressFn || (() => { });
    let currentText = text;
    let result;
    const totalSteps = 7;

    // Objet pour tracker les corrections par type
    const corrections = {
        yPrime: 0,
        apostrophes: 0,
        oeuLigature: 0,
        frenchQuotes: 0,
        longDash: 0,
        doubleSpaces: 0,
        spacing: 0
    };

    // Étape 1: Correction de "y'" -> "y "
    showProgress(1, totalSteps, getTranslation('progress_step_yprime'));
    await new Promise(resolve => setTimeout(resolve, 50));

    const yPrimePattern = /\b(Y|y)['']/g;
    const yPrimeReplacement = (match, firstLetter) => (firstLetter === 'Y' ? 'Y ' : 'y ');
    const textAfterYPrime = currentText.replace(yPrimePattern, yPrimeReplacement);
    if (textAfterYPrime !== currentText) {
        corrections.yPrime = (currentText.match(yPrimePattern) || []).length;
        currentText = textAfterYPrime;
    }

    // Étape 2: Correction de l'apostrophe typographique
    showProgress(2, totalSteps, getTranslation('progress_step_apostrophes'));
    await new Promise(resolve => setTimeout(resolve, 50));

    const apostrophePattern = /['']/g;
    const textAfterApostrophe = currentText.replace(apostrophePattern, "'");
    if (textAfterApostrophe !== currentText) {
        corrections.apostrophes = (currentText.match(apostrophePattern) || []).length;
        currentText = textAfterApostrophe;
    }

    // Étape 3: Correction de "oeu" -> "œu"
    showProgress(3, totalSteps, getTranslation('progress_step_oeu'));
    await new Promise(resolve => setTimeout(resolve, 50));

    const oeuPattern = /([Oo])eu/g;
    const oeuReplacement = (match, firstLetter) => (firstLetter === 'O' ? 'Œu' : 'œu');
    const textAfterOeu = currentText.replace(oeuPattern, oeuReplacement);
    if (textAfterOeu !== currentText) {
        corrections.oeuLigature = (currentText.match(oeuPattern) || []).length;
        currentText = textAfterOeu;
    }

    // Étape 4: Correction des guillemets français «» -> "
    showProgress(4, totalSteps, getTranslation('progress_step_quotes'));
    await new Promise(resolve => setTimeout(resolve, 50));

    const frenchQuotesPattern = /[«»]/g;
    const textAfterFrenchQuotes = currentText.replace(frenchQuotesPattern, '"');
    if (textAfterFrenchQuotes !== currentText) {
        corrections.frenchQuotes = (currentText.match(frenchQuotesPattern) || []).length;
        currentText = textAfterFrenchQuotes;
    }

    // Étape 5: Correction des tirets longs
    showProgress(5, totalSteps, getTranslation('progress_step_dash'));
    await new Promise(resolve => setTimeout(resolve, 50));

    if (typeof isPolishTranscriptionMode === 'function' && isPolishTranscriptionMode()) {
        const polishDashPattern = / - /g;
        const textAfterPolishDash = currentText.replace(polishDashPattern, ' — ');
        if (textAfterPolishDash !== currentText) {
            corrections.longDash = (currentText.match(polishDashPattern) || []).length;
            currentText = textAfterPolishDash;
        }
    } else {
        const longDashPattern = /[—–]/g;
        const textAfterLongDash = currentText.replace(longDashPattern, '-');
        if (textAfterLongDash !== currentText) {
            corrections.longDash = (currentText.match(longDashPattern) || []).length;
            currentText = textAfterLongDash;
        }
    }

    // Étape 6: Correction des doubles espaces
    showProgress(6, totalSteps, getTranslation('progress_step_spaces'));
    await new Promise(resolve => setTimeout(resolve, 50));

    const doubleSpacesPattern = /  +/g;
    const textAfterDoubleSpaces = currentText.replace(doubleSpacesPattern, ' ');
    if (textAfterDoubleSpaces !== currentText) {
        corrections.doubleSpaces = (currentText.match(doubleSpacesPattern) || []).length;
        currentText = textAfterDoubleSpaces;
    }

    // Étape 7: Espacement
    showProgress(7, totalSteps, getTranslation('progress_step_spacing'));
    await new Promise(resolve => setTimeout(resolve, 50));

    result = correctLineSpacing(currentText);
    if (result.correctionsCount > 0) {
        corrections.spacing = result.correctionsCount;
        currentText = result.newText;
    }

    // Calcul du total
    const totalCorrections = corrections.yPrime + corrections.apostrophes +
        corrections.oeuLigature + corrections.frenchQuotes + corrections.longDash +
        corrections.doubleSpaces + corrections.spacing;

    return { newText: currentText, correctionsCount: totalCorrections, corrections: corrections };
}


/**
 * Fonction principale qui initialise le panneau d'outils.
 * C'est le cœur de l'extension. Elle est appelée lorsque l'éditeur de paroles est détecté.
 */

export {
    isSectionTag,
    correctLineSpacing,
    applyTextTransformToDivEditor,
    applyAllTextCorrectionsToString,
    applyAllTextCorrectionsAsync,
};
