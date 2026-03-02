import { getTranslation, formatListWithConjunction } from './utils.js';
import { applyAllTextCorrectionsToString } from './corrections.js';
import { isEnglishTranscriptionMode, isPolishTranscriptionMode } from './config.js';
import {
    GFT_STATE,
    DARK_MODE_CLASS,
    DARK_MODE_STORAGE_KEY,
    FEEDBACK_MESSAGE_ID
} from './constants.js';

/**
 * Affiche un message de feedback temporaire (toast).
 * Si l'élément de feedback du panneau n'existe pas, crée un toast flottant.
 * @param {string} message - Le message à afficher.
 * @param {number} duration - La durée en ms (défaut 3000).
 * @param {HTMLElement} [container] - Le conteneur parent (optionnel).
 */
export function showFeedbackMessage(message, duration = 3000, container = null) {
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

/**
 * Affiche une notification spéciale pour restaurer le brouillon.
 */
export function showRestoreDraftNotification(timeStr, contentToRestore, onRestore, onDiscard) {
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
        z-index: 2147483647;
        display: flex;
        flex-direction: column;
        gap: 10px;
        font-family: 'Programme', sans-serif;
        border-left: 4px solid #ffff64;
        animation: slideIn 0.3s ease-out;
        pointer-events: auto;
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
        e.stopPropagation();
        if (onRestore) onRestore();
        showFeedbackMessage(getTranslation('draft_restored'));
        notification.remove();
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
        if (onDiscard) onDiscard();
        notification.remove();
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
            if (onDiscard) onDiscard();
        }
    }, 15000);
}

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
export function showProgress(step, total, message) {
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
export function hideProgress() {
    const progressContainer = document.getElementById('gft-progress-container');
    if (progressContainer) {
        progressContainer.style.display = 'none';
    }
}

/**
 * Calcule les différences entre deux chaînes (suppressions et ajouts).
 * @param {string} original - Le texte de base.
 * @param {string} modified - Le texte modifié.
 * @returns {Array} Un tableau d'objets { type: 'common' | 'removed' | 'added', value: string }.
 */
export function computeDiff(original, modified) {
    const m = original.length;
    const n = modified.length;
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
            if (currentAdded) { chunks.unshift({ type: 'added', value: currentAdded }); currentAdded = ''; }
            if (currentRemoved) { chunks.unshift({ type: 'removed', value: currentRemoved }); currentRemoved = ''; }
            currentCommon = original[i - 1] + currentCommon;
            i--; j--;
        } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
            if (currentCommon) { chunks.unshift({ type: 'common', value: currentCommon }); currentCommon = ''; }
            if (currentRemoved) { chunks.unshift({ type: 'removed', value: currentRemoved }); currentRemoved = ''; }
            currentAdded = modified[j - 1] + currentAdded;
            j--;
        } else {
            if (currentCommon) { chunks.unshift({ type: 'common', value: currentCommon }); currentCommon = ''; }
            if (currentAdded) { chunks.unshift({ type: 'added', value: currentAdded }); currentAdded = ''; }
            currentRemoved = original[i - 1] + currentRemoved;
            i--;
        }
    }
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
export function highlightDifferences(originalText, correctedText) {
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    const diffChunks = computeDiff(originalText, correctedText);
    let html = '';

    diffChunks.forEach(chunk => {
        let escapedValue = escapeHtml(chunk.value);
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
export function showCorrectionPreview(originalText, correctedText, initialCorrections, onApply, onCancel) {
    let currentPreviewText = correctedText;
    let currentStats = initialCorrections;

    // État des options (tout activé par défaut)
    const options = {
        yPrime: true,
        apostrophes: true,
        oeuLigature: true,
        frenchQuotes: true,
        longDash: true,
        punctuation: true,
        doubleSpaces: true,
        spacing: true
    };

    const overlay = document.createElement('div');
    overlay.id = 'gft-preview-overlay';
    overlay.className = 'gft-preview-overlay';

    const modal = document.createElement('div');
    modal.id = 'gft-preview-modal';
    modal.className = 'gft-preview-modal';

    const isDarkMode = localStorage.getItem(DARK_MODE_STORAGE_KEY) === 'true';
    if (isDarkMode) modal.classList.add(DARK_MODE_CLASS);

    const header = document.createElement('div');
    header.style.marginBottom = '15px';

    const title = document.createElement('h2');
    title.textContent = getTranslation('preview_title');
    title.className = 'gft-preview-title';
    header.appendChild(title);

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

    if (!(typeof isPolishTranscriptionMode === 'function' && isPolishTranscriptionMode()) &&
        !(typeof isEnglishTranscriptionMode === 'function' && isEnglishTranscriptionMode())) {
        optionsContainer.appendChild(createOption('punctuation', getTranslation('preview_opt_punctuation')));
    }

    optionsContainer.appendChild(createOption('doubleSpaces', getTranslation('preview_opt_spaces')));
    optionsContainer.appendChild(createOption('spacing', getTranslation('preview_opt_spacing')));

    header.appendChild(optionsContainer);
    modal.appendChild(header);

    const summary = document.createElement('div');
    summary.className = 'gft-preview-summary';
    modal.appendChild(summary);

    const diffTitle = document.createElement('h3');
    diffTitle.textContent = getTranslation('preview_diff_title');
    diffTitle.style.fontSize = '14px';
    diffTitle.style.marginBottom = '5px';
    diffTitle.style.color = isDarkMode ? '#aaa' : '#555';
    modal.appendChild(diffTitle);

    const diffContainer = document.createElement('div');
    diffContainer.className = 'gft-preview-content';
    diffContainer.id = 'gft-preview-diff';
    diffContainer.style.flex = '1';
    diffContainer.style.overflowY = 'auto';
    diffContainer.style.whiteSpace = 'pre-wrap';
    diffContainer.style.border = '1px solid #ccc';
    if (isDarkMode) diffContainer.style.borderColor = '#444';
    modal.appendChild(diffContainer);

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
        if (document.body.contains(overlay)) document.body.removeChild(overlay);
        if (document.body.contains(modal)) document.body.removeChild(modal);
        if (onCancel && !currentPreviewText) onCancel();
    }

    function updatePreview() {
        const result = applyAllTextCorrectionsToString(originalText, options);
        currentPreviewText = result.newText;
        currentStats = result.corrections;

        const lang = localStorage.getItem('gftLanguage') || 'fr';
        const detailsArray = [];
        if (options.yPrime && currentStats.yPrime > 0) detailsArray.push(`${currentStats.yPrime} "y'"`);
        if (options.apostrophes && currentStats.apostrophes > 0) detailsArray.push(`${currentStats.apostrophes} ${getTranslation('preview_stat_apostrophes', currentStats.apostrophes)}`);
        if (options.oeuLigature && currentStats.oeuLigature > 0) detailsArray.push(`${currentStats.oeuLigature} "oeu"`);
        if (options.frenchQuotes && currentStats.frenchQuotes > 0) detailsArray.push(`${currentStats.frenchQuotes} ${getTranslation('preview_stat_quotes', currentStats.frenchQuotes)}`);
        if (options.longDash && currentStats.longDash > 0) detailsArray.push(`${currentStats.longDash} ${getTranslation('preview_stat_dash', currentStats.longDash)}`);
        if (options.punctuation && currentStats.punctuation > 0) detailsArray.push(`${currentStats.punctuation} ${getTranslation('preview_stat_punctuation', currentStats.punctuation)}`);
        if (options.doubleSpaces && currentStats.doubleSpaces > 0) detailsArray.push(`${currentStats.doubleSpaces} ${getTranslation('preview_stat_spaces', currentStats.doubleSpaces)}`);
        if (options.spacing && currentStats.spacing > 0) detailsArray.push(`${currentStats.spacing} ${getTranslation('preview_stat_spacing', currentStats.spacing)}`);

        const total = result.correctionsCount;
        const summaryTemplate = getTranslation('preview_summary', total).replace('{count}', total);
        summary.innerHTML = `<strong>${summaryTemplate}</strong><br>${detailsArray.length > 0 ? formatListWithConjunction(detailsArray, lang) : getTranslation('preview_no_corrections')}`;

        diffContainer.innerHTML = highlightDifferences(originalText, currentPreviewText);
    }

    updatePreview();
    overlay.addEventListener('click', close);
}
