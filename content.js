// content.js (Version v7.FINALE - Feedback smooth et regroupement + Dark Mode)
/**
 * @file Fichier principal de l'extension "Genius Fast Transcriber".
 * Ce script s'injecte dans les pages du site genius.com.
 * Il détecte la présence de l'éditeur de paroles et y ajoute un panneau d'outils
 * pour accélérer et fiabiliser la transcription (ajout de tags, correction de texte, etc.).
 * Il gère également un mode sombre pour le panneau et extrait les informations de la chanson
 * depuis la page pour pré-remplir certains champs.
 * Auteur: Lnkhey
 */

console.log('Genius Fast Transcriber (by Lnkhey) script chargé ! (v7.FINALE - Dark Mode)');

// ----- Déclarations des variables globales -----
// Ces variables maintiennent l'état de l'extension pendant que l'utilisateur navigue.

let coupletCounter = 1; // Compteur pour le numéro du couplet, s'incrémente à chaque ajout.
let detectedArtists = []; // Liste des artistes (principaux + featurings) détectés sur la page.
let currentActiveEditor = null; // Référence à l'élément DOM de l'éditeur de texte (textarea ou div).
let currentEditorType = null; // Type de l'éditeur ('textarea' ou 'div').
let shortcutsContainerElement = null; // L'élément DOM principal qui contient tous les outils de l'extension.
let observer; // L'instance du MutationObserver pour surveiller les changements dans la page.
let currentSongTitle = "TITRE INCONNU"; // Le titre de la chanson, extrait de la page.
let currentMainArtists = []; // Liste des artistes principaux.
let currentFeaturingArtists = []; // Liste des artistes en featuring.
const DARK_MODE_CLASS = 'gft-dark-mode'; // Classe CSS pour le mode sombre du panneau.
const DARK_MODE_STORAGE_KEY = 'gftDarkModeEnabled'; // Clé pour stocker la préférence du mode sombre dans le localStorage.
let darkModeButton = null; // Référence au bouton pour activer/désactiver le mode sombre.

// ----- Constantes Utiles -----
// Regroupement des sélecteurs CSS et des identifiants pour faciliter la maintenance.

const LYRICS_HELPER_HIGHLIGHT_CLASS = 'lyrics-helper-highlight'; // Classe CSS pour surligner temporairement les corrections.
const SHORTCUTS_CONTAINER_ID = 'genius-lyrics-shortcuts-container'; // ID du conteneur principal du panneau d'outils.
const ARTIST_SELECTOR_CONTAINER_ID = 'artistSelectorContainerLyricsHelper'; // ID du conteneur pour les cases à cocher des artistes.
const COUPLET_BUTTON_ID = 'coupletButton_GFT'; // ID spécifique pour le bouton d'ajout de couplet.
const FEEDBACK_MESSAGE_ID = 'gft-feedback-message'; // ID de l'élément affichant les messages de feedback (ex: "3 corrections effectuées").
const GFT_VISIBLE_CLASS = 'gft-visible'; // Classe CSS pour rendre visible un élément (utilisé pour le feedback).

// Sélecteurs CSS pour trouver les éléments clés sur les pages de Genius.
// Les tableaux permettent d'avoir des sélecteurs de secours si Genius met à jour son site.
const SELECTORS = {
    TITLE: [
        'h1[class*="SongHeader-desktop_Title"] span[class*="SongHeader-desktop_HiddenMask"]',
        'h1[class*="SongHeader-desktop_Title"]', 'h1[class*="SongHeader__Title"]',
        '.song_header-primary_info-title',
    ],
    OG_TITLE_META: 'meta[property="og:title"]',
    TWITTER_TITLE_META: 'meta[name="twitter:title"]',
    CREDITS_PAGE_ARTIST_LIST_CONTAINER: 'div[class*="TrackCreditsPage__CreditList"]',
    CREDITS_PAGE_ARTIST_NAME_IN_LINK: 'a[class*="Credit-sc"] span[class*="Name-sc"]',
    MAIN_ARTISTS_CONTAINER_FALLBACK: 'div[class*="HeaderArtistAndTracklist-desktop__ListArtists"]',
    MAIN_ARTIST_LINK_IN_CONTAINER_FALLBACK: 'a[class*="StyledLink"]',
    FALLBACK_MAIN_ARTIST_LINKS_FALLBACK: 'a[class*="SongHeader__Artist"], a[data-testid="ArtistLink"]',
    TEXTAREA_EDITOR: 'textarea[class*="ExpandingTextarea__Textarea"]', // Éditeur de paroles (ancien)
    DIV_EDITOR: 'div[data-testid="lyrics-input"]', // Éditeur de paroles (nouveau, content-editable)
    CONTROLS_STICKY_SECTION: 'div[class^="LyricsEdit-desktop__Controls-sc-"]', // Section où le panneau d'outils sera injecté.
    GENIUS_FORMATTING_HELPER: 'div[class*="LyricsEditExplainer__Container-sc-"][class*="LyricsEdit-desktop__Explainer-sc-"]' // Aide de Genius, que nous masquons.
};

/**
 * Décode les entités HTML (ex: &amp;) en caractères normaux (ex: &).
 * @param {string} text - Le texte à décoder.
 * @returns {string} Le texte décodé.
 */
function decodeHtmlEntities(text) {
    if (!text) return "";
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
}

/**
 * Nettoie un nom d'artiste en retirant les informations superflues (ex: "(FRA)", "(Feat...)").
 * @param {string} name - Le nom de l'artiste à nettoyer.
 * @returns {string} Le nom nettoyé.
 */
function cleanArtistName(name) {
    if (!name) return "";
    let cleaned = name.trim();
    cleaned = decodeHtmlEntities(cleaned);
    // Regex pour enlever les suffixes courants comme (FRA), (Feat. ...), etc.
    const commonSuffixRegex = /\s*\((?:FRA|FR|UK|US|Feat\.|Featuring|Trad\.|Producer|Mix|Remix|Edit|Version|Live|Demo)[^)]*?\)\s*$/i;
    if (commonSuffixRegex.test(cleaned)) {
        cleaned = cleaned.replace(commonSuffixRegex, '').trim();
    }
    // Gère d'autres types de parenthèses en fin de chaîne.
    const trailingParenthesisRegex = /\s*\([^)]*\)\s*$/;
    if (trailingParenthesisRegex.test(cleaned)) {
        cleaned = cleaned.replace(trailingParenthesisRegex, '').trim();
    } else {
        const isolatedTrailingParenthesisRegex = /\)\s*$/;
        if (isolatedTrailingParenthesisRegex.test(cleaned)) {
            cleaned = cleaned.replace(isolatedTrailingParenthesisRegex, '').trim();
        }
    }
    // Gère les parenthèses non fermées.
    const lastOpenParenIndex = cleaned.lastIndexOf('(');
    if (lastOpenParenIndex > -1 && cleaned.indexOf(')', lastOpenParenIndex) === -1) {
        if (cleaned.length - lastOpenParenIndex < 10) { // Si la parenthèse est proche de la fin
            cleaned = cleaned.substring(0, lastOpenParenIndex).trim();
        }
    }
    cleaned = cleaned.replace(/\s+/g, ' ').trim(); // Normalise les espaces.
    return cleaned;
}

/**
 * Échappe les caractères spéciaux d'une chaîne pour qu'elle puisse être utilisée dans une expression régulière.
 * @param {string} string - La chaîne à échapper.
 * @returns {string} La chaîne échappée.
 */
function escapeRegExp(string) {
    if (!string) return "";
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& signifie la chaîne correspondante entière.
}

/**
 * Formatte une liste d'artistes pour un affichage lisible (ex: "Artiste 1, Artiste 2 & Artiste 3").
 * @param {string[]} artists - Un tableau de noms d'artistes.
 * @returns {string} La liste formatée.
 */
function formatArtistList(artists) {
    if (!artists || artists.length === 0) return "";
    if (artists.length === 1) return artists[0];
    if (artists.length === 2) return artists.join(' & ');
    return `${artists.slice(0, -1).join(', ')} & ${artists[artists.length - 1]}`;
}

/**
 * Extrait les artistes principaux et en featuring à partir du contenu d'une balise meta (og:title ou twitter:title).
 * Le format est souvent "Artistes Principaux - Titre de la chanson (feat. Artistes en Featuring)".
 * @param {string} metaContent - Le contenu de la balise meta.
 * @returns {{main: string[], ft: string[]}} Un objet contenant les listes d'artistes principaux et en featuring.
 */
function extractArtistsFromMetaContent(metaContent) {
    const result = { main: [], ft: [] };
    if (!metaContent) return result;
    let contentForArtists = decodeHtmlEntities(metaContent);
    // Sépare la partie artistes du titre de la chanson.
    const songTitleSeparatorMatch = contentForArtists.match(/\s[–-]\s/);
    if (songTitleSeparatorMatch) {
        contentForArtists = contentForArtists.substring(0, songTitleSeparatorMatch.index).trim();
    }
    let ftContent = null;
    let mainPart = contentForArtists;
    // Extrait les artistes en featuring.
    const ftOuterMatch = contentForArtists.match(/\((Ft\.|Featuring)\s+(.*)\)\s*$/i);
    if (ftOuterMatch && ftOuterMatch[2]) {
        ftContent = ftOuterMatch[2].trim();
        mainPart = contentForArtists.replace(ftOuterMatch[0], '').trim();
    }
    if (ftContent) {
        ftContent.split(/[,&]\s*/).forEach(name => {
            const cleaned = name.trim(); if (cleaned) result.ft.push(cleaned);
        });
    }
    // Extrait les artistes principaux.
    mainPart.split(/[,&]\s*/).forEach(name => {
        const cleanedName = name.trim();
        if (cleanedName) {
            // S'assure qu'un artiste n'est pas à la fois dans "main" et "ft".
            if (!result.ft.some(ftArt => ftArt.toLowerCase() === cleanedName.toLowerCase())) {
                result.main.push(cleanedName);
            }
        }
    });
    return result;
}

/**
 * Fonction principale pour extraire toutes les données de la chanson (titre, artistes) depuis la page.
 * Utilise plusieurs stratégies (balises meta, éléments HTML) pour être plus robuste.
 */
function extractSongData() {
    const songData = { title: null, mainArtists: [], featuringArtists: [], _rawMainArtists: [], _rawFeaturingArtistsFromSection: [], _rawFeaturingArtistsFromTitleExtract: [] };
    let rawTitleText = null; let artistsFromMeta = { main: [], ft: [] };
    // 1. Tente d'extraire les données depuis les balises meta (plus fiable).
    const ogTitleMeta = document.querySelector(SELECTORS.OG_TITLE_META);
    if (ogTitleMeta && ogTitleMeta.content) {
        artistsFromMeta = extractArtistsFromMetaContent(ogTitleMeta.content);
        songData._rawMainArtists = [...artistsFromMeta.main];
        songData._rawFeaturingArtistsFromTitleExtract = [...artistsFromMeta.ft];
        const titleParts = decodeHtmlEntities(ogTitleMeta.content).split(/\s[–-]\s/);
        if (titleParts.length > 1) {
            rawTitleText = titleParts.slice(1).join(' – ').trim();
            if (artistsFromMeta.main.length > 0) {
                const mainArtistString = formatArtistList(artistsFromMeta.main);
                if (rawTitleText.toLowerCase().endsWith(mainArtistString.toLowerCase())) {
                    rawTitleText = rawTitleText.substring(0, rawTitleText.length - mainArtistString.length).replace(/\s*-\s*$/, '').trim();
                }
            }
        }
    } else {
        const twitterTitleMeta = document.querySelector(SELECTORS.TWITTER_TITLE_META);
        if (twitterTitleMeta && twitterTitleMeta.content) {
            artistsFromMeta = extractArtistsFromMetaContent(twitterTitleMeta.content);
            songData._rawMainArtists = [...artistsFromMeta.main];
            songData._rawFeaturingArtistsFromTitleExtract = [...artistsFromMeta.ft];
            const titleParts = decodeHtmlEntities(twitterTitleMeta.content).split(/\s[–-]\s/);
            if (titleParts.length > 1) rawTitleText = titleParts.slice(1).join(' – ').trim();
        }
    }
    // 2. Si les balises meta n'ont pas donné d'artistes, utilise des sélecteurs de secours.
    if (songData._rawMainArtists.length === 0) {
        const mainArtistsContainer = document.querySelector(SELECTORS.MAIN_ARTISTS_CONTAINER_FALLBACK);
        if (mainArtistsContainer) {
            mainArtistsContainer.querySelectorAll(SELECTORS.MAIN_ARTIST_LINK_IN_CONTAINER_FALLBACK).forEach(link => { const n = link.textContent.trim(); if (n && !songData._rawMainArtists.includes(n)) songData._rawMainArtists.push(n); });
        } else {
            document.querySelectorAll(SELECTORS.FALLBACK_MAIN_ARTIST_LINKS_FALLBACK).forEach(link => { const n = link.textContent.trim(); if (n && !songData._rawMainArtists.includes(n)) songData._rawMainArtists.push(n); });
        }
    }
    // 3. Extrait les artistes depuis la section "Crédits" de la page si elle existe.
    document.querySelectorAll(SELECTORS.CREDITS_PAGE_ARTIST_LIST_CONTAINER).forEach(listContainer => {
        const lt = listContainer.previousElementSibling; let isFt = false;
        if (lt && lt.tagName === 'H3') { const txt = lt.textContent.trim().toLowerCase(); if (txt.includes('featuring') || txt.includes('feat') || txt.includes('avec')) isFt = true; }
        if (isFt || (songData._rawFeaturingArtistsFromTitleExtract.length === 0 && songData._rawFeaturingArtistsFromSection.length === 0)) {
            listContainer.querySelectorAll(SELECTORS.CREDITS_PAGE_ARTIST_NAME_IN_LINK).forEach(s => { const n = s.textContent.trim(); if (n && !songData._rawFeaturingArtistsFromSection.includes(n) && !songData._rawMainArtists.includes(n)) songData._rawFeaturingArtistsFromSection.push(n); });
        }
    });
    // 4. Extrait le titre de la chanson si non trouvé via les balises meta.
    if (!rawTitleText) {
        for (const sel of SELECTORS.TITLE) { const el = document.querySelector(sel); if (el) { rawTitleText = el.textContent; if (rawTitleText) break; } }
    }
    // 5. Nettoie et finalise les données extraites.
    if (rawTitleText) {
        let ttc = decodeHtmlEntities(rawTitleText.trim()).replace(/\s+Lyrics$/i, '').trim();
        if (artistsFromMeta.main.length === 0 && songData._rawMainArtists.length > 0) {
            const blk = formatArtistList(songData._rawMainArtists.map(a => cleanArtistName(a)));
            if (blk) { const esc = escapeRegExp(blk); let m = ttc.match(new RegExp(`^${esc}\\s*-\\s*(.+)$`, 'i')); if (m && m[1]) ttc = m[1].trim(); else { m = ttc.match(new RegExp(`^(.+?)\\s*-\\s*${esc}$`, 'i')); if (m && m[1]) ttc = m[1].trim(); } }
        }
        ttc = ttc.replace(/\s*\((?:Ft\.|Featuring)[^)]+\)\s*/gi, ' ').trim().replace(/^[\s,-]+|[\s,-]+$/g, '').replace(/\s\s+/g, ' ');
        songData.title = ttc;
    }
    if (!songData.title || songData.title.length === 0) songData.title = "TITRE INCONNU";
    songData.mainArtists = [...new Set(songData._rawMainArtists.map(name => cleanArtistName(name)))].filter(Boolean);
    let finalFeaturingArtists = [];
    const seenCleanedFtNamesForDeduplication = new Set();
    // Priorité aux featurings extraits du titre, sinon on prend ceux de la section crédits.
    if (songData._rawFeaturingArtistsFromTitleExtract.length > 0) {
        songData._rawFeaturingArtistsFromTitleExtract.forEach(rawName => {
            const cleanedName = cleanArtistName(rawName);
            if (cleanedName && !seenCleanedFtNamesForDeduplication.has(cleanedName.toLowerCase()) && !songData.mainArtists.some(mainArt => mainArt.toLowerCase() === cleanedName.toLowerCase())) {
                finalFeaturingArtists.push(cleanedName);
                seenCleanedFtNamesForDeduplication.add(cleanedName.toLowerCase());
            }
        });
    } else {
        songData._rawFeaturingArtistsFromSection.forEach(rawName => {
            const cleanedName = cleanArtistName(rawName);
            if (cleanedName && !seenCleanedFtNamesForDeduplication.has(cleanedName.toLowerCase()) && !songData.mainArtists.some(mainArt => mainArt.toLowerCase() === cleanedName.toLowerCase())) {
                finalFeaturingArtists.push(cleanedName);
                seenCleanedFtNamesForDeduplication.add(cleanedName.toLowerCase());
            }
        });
    }
    songData.featuringArtists = finalFeaturingArtists;
    // 6. Met à jour les variables globales.
    currentSongTitle = songData.title;
    currentMainArtists = [...songData.mainArtists];
    currentFeaturingArtists = [...songData.featuringArtists];
    detectedArtists = [...new Set([...currentMainArtists, ...currentFeaturingArtists])].filter(Boolean);
    return songData;
}

/**
 * Crée et affiche les cases à cocher pour chaque artiste détecté.
 * Permet à l'utilisateur d'attribuer une section de paroles à un ou plusieurs artistes.
 * @param {HTMLElement} container - L'élément parent où les sélecteurs doivent être ajoutés.
 */
function createArtistSelectors(container) {
    if (!container) { console.error("[createArtistSelectors] Erreur: Conteneur non fourni."); return; }
    const existingSelectorContainer = document.getElementById(ARTIST_SELECTOR_CONTAINER_ID);
    if (existingSelectorContainer) { existingSelectorContainer.remove(); } // Supprime l'ancien conteneur s'il existe.
    const artistSelectorContainer = document.createElement('div');
    artistSelectorContainer.id = ARTIST_SELECTOR_CONTAINER_ID;
    artistSelectorContainer.style.display = 'flex'; artistSelectorContainer.style.flexWrap = 'wrap'; artistSelectorContainer.style.gap = '5px 10px'; artistSelectorContainer.style.alignItems = 'center';
    const title = document.createElement('p');
    title.textContent = 'Attribuer la section à :';
    title.style.width = '100%'; title.style.margin = '0 0 5px 0';
    artistSelectorContainer.appendChild(title);
    if (!detectedArtists || detectedArtists.length === 0) {
        const noArtistsMsg = document.createElement('span'); noArtistsMsg.textContent = "Aucun artiste détecté."; noArtistsMsg.style.fontStyle = 'italic';
        artistSelectorContainer.appendChild(noArtistsMsg);
    } else {
        detectedArtists.forEach((artistName, index) => {
            const artistId = `artist_checkbox_${index}_${artistName.replace(/[^a-zA-Z0-9]/g, "")}_GFT`;
            const wrapper = document.createElement('span');
            const checkbox = document.createElement('input');
            Object.assign(checkbox, { type: 'checkbox', name: 'selectedGeniusArtist_checkbox_GFT', value: artistName, id: artistId });
            wrapper.appendChild(checkbox);
            const label = document.createElement('label');
            label.htmlFor = artistId; label.textContent = artistName; label.style.marginLeft = '3px';
            wrapper.appendChild(label);
            artistSelectorContainer.appendChild(wrapper);
        });
    }
    container.appendChild(artistSelectorContainer);
}

/**
 * Ajoute les noms des artistes sélectionnés au tag de section (ex: "[Couplet 1]").
 * @param {string} baseTextWithBrackets - Le tag de base, ex: "[Couplet 1]".
 * @returns {string} Le tag final, ex: "[Couplet 1 : Artiste 1 & Artiste 2]\n".
 */
function addArtistToText(baseTextWithBrackets) {
    const checkedArtistsCheckboxes = document.querySelectorAll('input[name="selectedGeniusArtist_checkbox_GFT"]:checked');
    const selectedArtistNames = Array.from(checkedArtistsCheckboxes).map(cb => cb.value.trim()).filter(Boolean);
    let resultText;
    if (selectedArtistNames.length > 0) {
        const tagPart = baseTextWithBrackets.slice(0, -1); // Enlève le ']' final
        const artistsString = formatArtistList(selectedArtistNames);
        resultText = `${tagPart} : ${artistsString}]\n`;
    } else {
        resultText = `${baseTextWithBrackets}\n`;
    }
    return resultText;
}

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
                span.className = highlightClass; span.textContent = actualReplacement; fragment.appendChild(span);
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
 * Masque le panneau d'aide au formatage par défaut de Genius pour ne pas surcharger l'interface.
 */
function hideGeniusFormattingHelper() {
    const helperElement = document.querySelector(SELECTORS.GENIUS_FORMATTING_HELPER);
    if (helperElement) helperElement.style.display = 'none';
}

let feedbackTimeout = null; // Timeout pour masquer automatiquement le message de feedback.
/**
 * Affiche un message de feedback temporaire à l'utilisateur.
 * @param {string} message - Le message à afficher.
 * @param {number} [duration=3000] - La durée d'affichage en millisecondes.
 * @param {HTMLElement} [parentElement] - L'élément parent où afficher le message.
 */
function showFeedbackMessage(message, duration = 3000, parentElement) {
    const container = parentElement || shortcutsContainerElement;
    if (!container) { console.warn("showFeedbackMessage: Conteneur non trouvé."); return; }
    let feedbackEl = document.getElementById(FEEDBACK_MESSAGE_ID);
    if (!feedbackEl) {
        feedbackEl = document.createElement('div');
        feedbackEl.id = FEEDBACK_MESSAGE_ID;
        if (container.lastChild !== feedbackEl) {
            container.appendChild(feedbackEl);
        }
    }
    feedbackEl.textContent = message;
    feedbackEl.classList.add(GFT_VISIBLE_CLASS);
    if (feedbackTimeout) clearTimeout(feedbackTimeout);
    feedbackTimeout = setTimeout(() => {
        if (feedbackEl) {
            feedbackEl.classList.remove(GFT_VISIBLE_CLASS);
        }
    }, duration);
}

/**
 * Applique ou retire le mode sombre sur le panneau d'outils.
 * @param {boolean} isDark - True pour activer le mode sombre, false pour le désactiver.
 */
function applyDarkMode(isDark) {
    if (shortcutsContainerElement) {
        if (isDark) {
            shortcutsContainerElement.classList.add(DARK_MODE_CLASS);
            if (darkModeButton) darkModeButton.textContent = 'Mode Clair';
        } else {
            shortcutsContainerElement.classList.remove(DARK_MODE_CLASS);
            if (darkModeButton) darkModeButton.textContent = 'Mode Sombre';
        }
    }
    // Sauvegarde la préférence dans le stockage local du navigateur.
    localStorage.setItem(DARK_MODE_STORAGE_KEY, isDark.toString());
}

/**
 * Inverse l'état actuel du mode sombre.
 */
function toggleDarkMode() {
    const isCurrentlyDark = shortcutsContainerElement ? shortcutsContainerElement.classList.contains(DARK_MODE_CLASS) : false;
    applyDarkMode(!isCurrentlyDark);
}

/**
 * Charge et applique la préférence de mode sombre depuis le localStorage au chargement.
 */
function loadDarkModePreference() {
    const savedPreference = localStorage.getItem(DARK_MODE_STORAGE_KEY);
    const shouldBeDark = savedPreference === 'true';
    applyDarkMode(shouldBeDark);
}


/**
 * Met en majuscule la première lettre de chaque ligne non vide.
 * @param {string} text - Le texte à corriger.
 * @returns {{newText: string, correctionsCount: number}} Le texte corrigé et le nombre de corrections.
 */
function capitalizeFirstLetterOfEachLine(text) {
    let correctionsCount = 0;
    const lines = text.split('\n');
    const correctedLines = lines.map(line => {
        if (line.trim().length > 0) {
            const firstChar = line.charAt(0);
            const restOfLine = line.slice(1);
            if (firstChar !== firstChar.toUpperCase()) {
                correctionsCount++;
                return firstChar.toUpperCase() + restOfLine;
            }
        }
        return line;
    });
    return { newText: correctedLines.join('\n'), correctionsCount };
}

/**
 * Supprime la ponctuation (virgules, points) à la fin des lignes.
 * @param {string} text - Le texte à corriger.
 * @returns {{newText: string, correctionsCount: number}} Le texte corrigé et le nombre de corrections.
 */
function removeTrailingPunctuationFromLines(text) {
    let correctionsCount = 0;
    const lines = text.split('\n');
    const correctedLines = lines.map(line => {
        const originalLineLength = line.length;
        let correctedLine = line.replace(/([.,])\s*$/, '');
        if (correctedLine.length < originalLineLength) {
            correctionsCount++;
        }
        return correctedLine;
    });
    return { newText: correctedLines.join('\n'), correctionsCount };
}

/**
 * Vérifie si une ligne est un tag de section (ex: "[Refrain]").
 * @param {string} line - La ligne à vérifier.
 * @returns {boolean}
 */
function isSectionTag(line) {
    return line.trim().startsWith('[') && line.trim().endsWith(']');
}

/**
 * Corrige les espacements entre les lignes :
 * - Ajoute une ligne vide avant chaque tag de section (sauf le premier).
 * - Supprime les lignes vides en double ou inutiles.
 * @param {string} text - Le texte à corriger.
 * @returns {{newText: string, correctionsCount: number}} Le texte corrigé et le nombre de corrections.
 */
function correctLineSpacing(text) {
    const originalLines = text.split('\n');
    const newLinesInterim = [];
    let correctionsCount = 0;

    if (originalLines.length === 0) {
        return { newText: "", correctionsCount: 0 };
    }

    // Première passe : assurer un saut de ligne AVANT un tag de section si la ligne précédente n'est pas vide.
    for (let i = 0; i < originalLines.length; i++) {
        const currentLine = originalLines[i];
        const trimmedCurrentLine = currentLine.trim();
        newLinesInterim.push(currentLine);

        if (trimmedCurrentLine !== "" && !isSectionTag(trimmedCurrentLine)) {
            if ((i + 1) < originalLines.length) {
                const nextLineOriginal = originalLines[i + 1];
                const trimmedNextLineOriginal = nextLineOriginal.trim();
                
                if (trimmedNextLineOriginal !== "" && isSectionTag(trimmedNextLineOriginal)) {
                    if (newLinesInterim[newLinesInterim.length -1].trim() !== "") {
                        newLinesInterim.push(""); 
                    }
                }
            }
        }
    }

    const newLines = [];
    // Deuxième passe : logique complexe pour décider de garder ou non les lignes vides.
    if (newLinesInterim.length > 0) {
        for (let i = 0; i < newLinesInterim.length; i++) {
            const currentLine = newLinesInterim[i];
            const trimmedCurrentLine = currentLine.trim();

            if (trimmedCurrentLine === "") {
                let keepThisEmptyLine = false;
                let prevNonEmptyLineIndexInNewLines = -1;
                for (let j = newLines.length - 1; j >= 0; j--) {
                    if (newLines[j].trim() !== "") {
                        prevNonEmptyLineIndexInNewLines = j;
                        break;
                    }
                }
                
                let nextNonEmptyLineIsTagInInterim = false;
                for (let k = i + 1; k < newLinesInterim.length; k++) {
                    if (newLinesInterim[k].trim() !== "") {
                        if (isSectionTag(newLinesInterim[k])) {
                            nextNonEmptyLineIsTagInInterim = true;
                        }
                        break; 
                    }
                }

                const prevLineInNewLinesWasTag = prevNonEmptyLineIndexInNewLines !== -1 && isSectionTag(newLines[prevNonEmptyLineIndexInNewLines]);
                const prevLineInNewLinesWasEmptyAndKept = newLines.length > 0 && newLines[newLines.length - 1].trim() === "";

                if ((prevLineInNewLinesWasTag || nextNonEmptyLineIsTagInInterim) && !prevLineInNewLinesWasEmptyAndKept) {
                     keepThisEmptyLine = true;
                }

                if (keepThisEmptyLine) {
                    newLines.push("");
                }
            } else {
                newLines.push(currentLine);
            }
        }
    }
    
    // Troisième passe : nettoyage final des lignes vides en trop.
    const finalCleanedLines = [];
    if (newLines.length > 0) {
        finalCleanedLines.push(newLines[0]); 
        for (let i = 1; i < newLines.length; i++) {
            if (newLines[i].trim() !== "" || newLines[i-1].trim() !== "") {
                finalCleanedLines.push(newLines[i]);
            }
        }
    }

    // Supprime les lignes vides au début et à la fin du texte.
    while (finalCleanedLines.length > 0 && finalCleanedLines[0].trim() === "" && 
           (finalCleanedLines.length > 1 && finalCleanedLines[1].trim() !== "" ) ) {
        finalCleanedLines.shift();
    }
     while (finalCleanedLines.length > 0 && finalCleanedLines[finalCleanedLines.length - 1].trim() === "") {
        finalCleanedLines.pop();
    }

    const newText = finalCleanedLines.join('\n');
    
    // Calcule le nombre de corrections de manière approximative si le texte a changé.
    if (text !== newText) {
        correctionsCount = 1; 
        const originalStructure = text.replace(/\n\s*\n/g, '\n<EMPTY_LINE>\n').split('\n');
        const newStructure = newText.replace(/\n\s*\n/g, '\n<EMPTY_LINE>\n').split('\n');
        let diffs = 0;
        const maxLength = Math.max(originalStructure.length, newStructure.length);
        for(let i=0; i < maxLength; i++) {
            if(originalStructure[i] !== newStructure[i]) {
                if (newStructure[i] === "<EMPTY_LINE>" && originalStructure[i] !== "<EMPTY_LINE>" && (originalStructure[i] && originalStructure[i].trim() !== "")) diffs++;
                else if (originalStructure[i] === "<EMPTY_LINE>" && newStructure[i] !== "<EMPTY_LINE>" && (newStructure[i] && newStructure[i].trim() !== "")) diffs++;
                else if (originalStructure[i] !== newStructure[i]) diffs++;
            }
        }
        if (diffs > 0) correctionsCount = diffs;
    } else {
        correctionsCount = 0;
    }

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
                if (index === arr.length -1 && arr.length > 1 && !newText.endsWith("\n\n")) { 
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
 * @returns {{newText: string, correctionsCount: number}} Le texte final corrigé et le nombre total de corrections.
 */
function applyAllTextCorrectionsToString(text) {
    let currentText = text;
    let totalCorrections = 0;
    let result;

    // Correction de "y'" -> "y "
    const yPrimePattern = /\b(Y|y)'/g;
    const yPrimeReplacement = (match, firstLetter)=>(firstLetter === 'Y' ? 'Y ' : 'y ');
    const textAfterYPrime = currentText.replace(yPrimePattern, yPrimeReplacement);
    if (textAfterYPrime !== currentText) {
        totalCorrections += (currentText.match(yPrimePattern) || []).length;
        currentText = textAfterYPrime;
    }

    // Correction de l'apostrophe typographique ’ -> '
    const apostrophePattern = /’/g;
    const textAfterApostrophe = currentText.replace(apostrophePattern, "'");
    if (textAfterApostrophe !== currentText) {
        totalCorrections += (currentText.match(apostrophePattern) || []).length;
        currentText = textAfterApostrophe;
    }

    // Application des autres corrections
    result = capitalizeFirstLetterOfEachLine(currentText);
    if (result.correctionsCount > 0) {
        totalCorrections += result.correctionsCount;
        currentText = result.newText;
    }

    result = removeTrailingPunctuationFromLines(currentText);
    if (result.correctionsCount > 0) {
        totalCorrections += result.correctionsCount;
        currentText = result.newText;
    }

    result = correctLineSpacing(currentText); 
    if (result.correctionsCount > 0) {
        totalCorrections += result.correctionsCount;
        currentText = result.newText;
    }
    
    return { newText: currentText, correctionsCount: totalCorrections };
}


/**
 * Fonction principale qui initialise le panneau d'outils.
 * C'est le cœur de l'extension. Elle est appelée lorsque l'éditeur de paroles est détecté.
 */
function initLyricsEditorEnhancer() {
    let foundEditor = null; let foundEditorType = null;
    
    // Configuration de tous les boutons et actions du panneau.
    const SHORTCUTS = {
        TAGS_STRUCTURAUX: [ 
            { buttons: [
                { label: "En-tête", getText: () => { let txt = `[Paroles de "${currentSongTitle}"`; const fts = formatArtistList(currentFeaturingArtists); if(fts) txt+=` ft. ${fts}`; txt+=']\n'; return txt;}},
                { type: 'coupletManager', 
                    prev: { label: '←', title: 'Couplet précédent' },
                    main: { 
                        id: COUPLET_BUTTON_ID, 
                        getLabel: () => `[Couplet ${coupletCounter}]`, 
                        getText: () => addArtistToText(`[Couplet ${coupletCounter}]`) 
                    },
                    next: { label: '→', title: 'Couplet suivant' }
                },
                {label:'[Intro]',getText:()=>addArtistToText('[Intro]')},
                {label:'[Couplet unique]',getText:()=>addArtistToText('[Couplet unique]')},
                {label:'[Pré-refrain]',getText:()=>addArtistToText('[Pré-refrain]')},
                {label:'[Refrain]',getText:()=>addArtistToText('[Refrain]')},
                {label:'[Pont]',getText:()=>addArtistToText('[Pont]')},
                {label:'[Outro]',getText:()=>addArtistToText('[Outro]')},
                {label:'[?]',text:'[?]\n'}
              ]
            }
        ],
        TEXT_CLEANUP: [
            {
                label:"y' → y ", 
                action:'replaceText',
                searchPattern:/\b(Y|y)'/g, 
                replacementFunction:(match, firstLetter)=>(firstLetter === 'Y' ? 'Y ' : 'y '), 
                highlightClass:LYRICS_HELPER_HIGHLIGHT_CLASS
            },
            {label:"’ → '",action:'replaceText',searchPattern:/’/g,replacementText:"'",highlightClass:LYRICS_HELPER_HIGHLIGHT_CLASS},
            {label:"Maj. début ligne",action:'lineCorrection',correctionType:'capitalize',title:"Met en majuscule la première lettre de chaque ligne."},
            {label:"Suppr. ., fin ligne",action:'lineCorrection',correctionType:'removePunctuation',title:"Supprime les points et virgules en fin de ligne."},
            {label:"Corriger Espacement",action:'lineCorrection',correctionType:'spacing',title:"Corrige les espacements (lignes vides inutiles ou manquantes)."}
        ],
        FORMATTING: [{label:'Gras',action:'format',formatType:'bold'},{label:'Italique',action:'format',formatType:'italic'}],
        GLOBAL_FIXES: [
            {label:"Tout Corriger (Texte)", action:'globalTextFix', title:"Applique toutes les corrections de texte (y', apostrophes, majuscules, ponctuation, espacement)."}
        ]
    };

    // 1. Détecte si un éditeur de paroles (textarea ou div) est présent sur la page.
    const textareaEditor = document.querySelector(SELECTORS.TEXTAREA_EDITOR); if (textareaEditor) { foundEditor = textareaEditor; foundEditorType = 'textarea'; } else { const divEditor = document.querySelector(SELECTORS.DIV_EDITOR); if (divEditor) { foundEditor = divEditor; foundEditorType = 'div'; } }
    if (foundEditor && !document.body.contains(foundEditor)) { foundEditor = null; foundEditorType = null; }
    // Gère les cas où l'éditeur apparaît, disparaît ou change (navigation SPA).
    const editorJustAppeared = foundEditor && !currentActiveEditor;
    const editorJustDisappeared = !foundEditor && currentActiveEditor;
    const editorInstanceChanged = foundEditor && currentActiveEditor && (foundEditor !== currentActiveEditor);

    if (editorJustAppeared || editorInstanceChanged) {
        currentActiveEditor = foundEditor; currentEditorType = foundEditorType;
        extractSongData(); // Extrait les données de la chanson à l'apparition de l'éditeur.
        hideGeniusFormattingHelper();
        if (shortcutsContainerElement) { shortcutsContainerElement.remove(); shortcutsContainerElement = null; }
    } else if (editorJustDisappeared) {
        currentActiveEditor = null; currentEditorType = null;
    }

    shortcutsContainerElement = document.getElementById(SHORTCUTS_CONTAINER_ID);
    if (editorJustDisappeared && shortcutsContainerElement) {
        shortcutsContainerElement.remove(); shortcutsContainerElement = null; return;
    }

    // 2. Si un éditeur est trouvé, on crée et injecte le panneau d'outils.
    if (foundEditor) {
        const targetStickySection = document.querySelector(SELECTORS.CONTROLS_STICKY_SECTION);
        if (targetStickySection) {
            // Crée le conteneur principal du panneau seulement s'il n'existe pas déjà.
            if (!shortcutsContainerElement || editorInstanceChanged || editorJustAppeared) {
                if (shortcutsContainerElement) shortcutsContainerElement.remove();
                shortcutsContainerElement = document.createElement('div');
                shortcutsContainerElement.id = SHORTCUTS_CONTAINER_ID;

                // Crée le titre du panneau, le logo et le bouton de mode sombre.
                const panelTitle = document.createElement('div');
                panelTitle.id = 'gftPanelTitle';

                const titleAndLogoContainer = document.createElement('span');
                const logoURL = chrome.runtime.getURL('images/icon16.png');
                titleAndLogoContainer.innerHTML = `<img src="${logoURL}" alt="GFT Logo" id="gftPanelLogo" /> Genius Fast Transcriber (by Lnkhey)`;
                panelTitle.appendChild(titleAndLogoContainer);

                darkModeButton = document.createElement('button');
                darkModeButton.id = 'gftDarkModeButton';
                darkModeButton.classList.add('genius-lyrics-shortcut-button');
                darkModeButton.addEventListener('click', (event) => {
                    event.preventDefault();
                    toggleDarkMode();
                });
                panelTitle.appendChild(darkModeButton);
                shortcutsContainerElement.appendChild(panelTitle);
                loadDarkModePreference();

                // Crée les sélecteurs d'artistes.
                if (detectedArtists.length === 0 && !editorJustAppeared && !editorInstanceChanged) extractSongData();
                createArtistSelectors(shortcutsContainerElement);
                if (currentFeaturingArtists.length > 0 || currentMainArtists.length > 1) { const hrArtists = document.createElement('hr'); shortcutsContainerElement.appendChild(hrArtists); }

                /**
                 * Usine (factory) à boutons : crée un bouton à partir d'une configuration.
                 * @param {object} config - L'objet de configuration du bouton (label, action, etc.).
                 * @param {HTMLElement} parentEl - L'élément parent du bouton.
                 * @param {boolean} isCoupletMainButton - Booléen spécial pour le bouton de couplet principal.
                 * @returns {HTMLButtonElement} Le bouton créé.
                 */
                const createButton = (config, parentEl = shortcutsContainerElement, isCoupletMainButton = false) => { 
                    const button = document.createElement('button');
                    button.textContent = typeof config.getLabel === 'function' ? config.getLabel() : config.label;
                    if (config.id) button.id = config.id;
                    button.classList.add('genius-lyrics-shortcut-button');
                    if (config.title) button.title = config.title;
                    button.type = 'button'; parentEl.appendChild(button);
                    // Ajoute l'écouteur d'événement principal qui déclenche l'action du bouton.
                    button.addEventListener('click', (event) => {
                        event.preventDefault();
                        if (!currentActiveEditor) { initLyricsEditorEnhancer(); if(!currentActiveEditor) return; }
                        currentActiveEditor.focus();
                        
                        let textToInsertForCouplet = null; 

                        // Logique pour chaque type d'action
                        if (config.action === 'format' && config.formatType) {
                            // Gère le gras/italique
                             const prefix = config.formatType === 'bold' ? '<b>' : '<i>'; const suffix = config.formatType === 'bold' ? '</b>' : '</i>';
                            if (currentEditorType === 'textarea') {
                                const start = currentActiveEditor.selectionStart; const end = currentActiveEditor.selectionEnd; const selectedText = currentActiveEditor.value.substring(start, end);
                                let textToInsert = (start !== end) ? `${prefix}${selectedText}${suffix}` : `${prefix} ${suffix}`;
                                document.execCommand('insertText', false, textToInsert);
                                if (start === end) currentActiveEditor.setSelectionRange(start + prefix.length + 1, start + prefix.length + 1);
                                else currentActiveEditor.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
                            } else if (currentEditorType === 'div') {
                                document.execCommand(config.formatType, false, null);
                                const selection = window.getSelection();
                                if (selection.isCollapsed) {
                                    const formatElement = document.createElement(config.formatType === 'bold' ? 'b' : 'i');
                                    const spaceNode = document.createTextNode('\u00A0'); formatElement.appendChild(spaceNode);
                                    const range = selection.getRangeAt(0); range.deleteContents(); range.insertNode(formatElement);
                                    const newRange = document.createRange(); newRange.setStart(formatElement.firstChild, 0); newRange.collapse(true);
                                    selection.removeAllRanges(); selection.addRange(newRange);
                                }
                            }
                        } else if (config.action === 'replaceText' && config.searchPattern) {
                            // Gère le remplacement de texte
                            const replacementValueOrFn = config.replacementFunction || config.replacementText;
                            let replacementsCount = 0;
                            if (currentEditorType === 'textarea') {
                                const originalValue = currentActiveEditor.value; let tempCount = 0;
                                const newValue = originalValue.replace(config.searchPattern, (...matchArgs) => {
                                    tempCount++;
                                    if (typeof replacementValueOrFn === 'function') return replacementValueOrFn(...matchArgs);
                                    return replacementValueOrFn;
                                });
                                if (originalValue !== newValue) {
                                    currentActiveEditor.value = newValue;
                                    currentActiveEditor.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
                                    replacementsCount = tempCount;
                                }
                            } else if (currentEditorType === 'div') {
                                replacementsCount = replaceAndHighlightInDiv(currentActiveEditor, config.searchPattern, replacementValueOrFn, config.highlightClass);
                                if (replacementsCount > 0) currentActiveEditor.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
                            }
                            if (replacementsCount > 0) {
                                let itemLabel = "élément(s)";
                                if (config.label.includes("y' → y ")) itemLabel = "occurrence(s) de 'y''";
                                if (config.label.includes("’ → '")) itemLabel = "apostrophe(s) ’";
                                showFeedbackMessage(`${replacementsCount} ${itemLabel} remplacé(s) !`, 3000, shortcutsContainerElement);
                            } else {
                                showFeedbackMessage("Aucun remplacement effectué.", 2000, shortcutsContainerElement);
                            }
                        } else if (config.action === 'lineCorrection' && config.correctionType) {
                            // Gère les corrections ligne par ligne
                            let correctionsCount = 0; let correctionFunction; let feedbackLabel = "";
                            if (config.correctionType === 'capitalize') { correctionFunction = capitalizeFirstLetterOfEachLine; feedbackLabel = "majuscule(s) en début de ligne"; }
                            else if (config.correctionType === 'removePunctuation') { correctionFunction = removeTrailingPunctuationFromLines; feedbackLabel = "point(s)/virgule(s) en fin de ligne"; }
                            else if (config.correctionType === 'spacing') { correctionFunction = correctLineSpacing; feedbackLabel = "espacement(s) de ligne"; }

                            if (correctionFunction) {
                                if (currentEditorType === 'textarea') {
                                    const originalText = currentActiveEditor.value;
                                    const { newText, correctionsCount: count } = correctionFunction(originalText);
                                    if (originalText !== newText) {
                                        currentActiveEditor.value = newText;
                                        currentActiveEditor.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
                                    }
                                    correctionsCount = count;
                                } else if (currentEditorType === 'div') {
                                    correctionsCount = applyTextTransformToDivEditor(currentActiveEditor, correctionFunction);
                                }
                                if (correctionsCount > 0) showFeedbackMessage(`${correctionsCount} ${feedbackLabel} corrigé(s) !`, 3000, shortcutsContainerElement);
                                else showFeedbackMessage(`Aucune correction de ${feedbackLabel} nécessaire.`, 2000, shortcutsContainerElement);
                            }
                        } else if (config.action === 'globalTextFix') { 
                            // Applique toutes les corrections de texte
                            let totalCorrectionsMade = 0;
                            if (currentEditorType === 'textarea') {
                                const originalText = currentActiveEditor.value;
                                const { newText, correctionsCount } = applyAllTextCorrectionsToString(originalText);
                                if (originalText !== newText) {
                                    currentActiveEditor.value = newText;
                                    currentActiveEditor.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
                                }
                                totalCorrectionsMade = correctionsCount;
                            } else if (currentEditorType === 'div') {
                                totalCorrectionsMade = applyTextTransformToDivEditor(currentActiveEditor, applyAllTextCorrectionsToString);
                            }
                            if (totalCorrectionsMade > 0) {
                                showFeedbackMessage(`${totalCorrectionsMade} correction(s) de texte appliquée(s) au total !`, 3000, shortcutsContainerElement);
                            } else {
                                showFeedbackMessage("Aucune correction de texte globale n'était nécessaire.", 2000, shortcutsContainerElement);
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

                            if (typeof textToInsert !== 'undefined' && textToInsert !== null && currentActiveEditor) {
                                document.execCommand('insertText', false, textToInsert);
                            }
                        }

                        // Logique spécifique au bouton de couplet
                        if (isCoupletMainButton && textToInsertForCouplet !== null) {
                            coupletCounter++;
                            button.textContent = config.getLabel(); 
                        } else if (typeof config.getLabel === 'function' && !isCoupletMainButton) { 
                            button.textContent = config.getLabel();
                        }
                        currentActiveEditor.focus();
                    });
                    return button;
                };

                // 3. Boucle sur la configuration SHORTCUTS pour créer tous les groupes de boutons.
                const buttonGroupsContainer = document.createElement('div'); 
                buttonGroupsContainer.id = 'gftButtonGroupsContainer';
                shortcutsContainerElement.appendChild(buttonGroupsContainer); 

                if (SHORTCUTS.TAGS_STRUCTURAUX) {
                    SHORTCUTS.TAGS_STRUCTURAUX.forEach(groupConfig => {
                        const groupDiv = document.createElement('div');
                        groupConfig.buttons.forEach(shortcut => {
                            if (shortcut.type === 'coupletManager') {
                                // Crée les boutons "précédent", "suivant" et le bouton principal du couplet
                                createButton(shortcut.prev, groupDiv).addEventListener('click', (e) => { 
                                    e.stopPropagation(); 
                                    if (coupletCounter > 1) coupletCounter--; 
                                    let btn = document.getElementById(COUPLET_BUTTON_ID); 
                                    if(btn) btn.textContent = shortcut.main.getLabel(); 
                                });
                                createButton(shortcut.main, groupDiv, true); 
                                createButton(shortcut.next, groupDiv).addEventListener('click', (e) => { 
                                    e.stopPropagation(); 
                                    coupletCounter++; 
                                    let btn = document.getElementById(COUPLET_BUTTON_ID); 
                                    if(btn) btn.textContent = shortcut.main.getLabel(); 
                                });
                            } else {
                                createButton(shortcut, groupDiv);
                            }
                        });
                        buttonGroupsContainer.appendChild(groupDiv); 
                    });
                }

                if (SHORTCUTS.GLOBAL_FIXES && SHORTCUTS.GLOBAL_FIXES.length > 0) {
                    const hrGlobal = document.createElement('hr'); shortcutsContainerElement.appendChild(hrGlobal);
                    const globalFixesDiv = document.createElement('div'); 
                    SHORTCUTS.GLOBAL_FIXES.forEach(s => createButton(s, globalFixesDiv)); 
                    shortcutsContainerElement.appendChild(globalFixesDiv);
                }

                if (SHORTCUTS.TEXT_CLEANUP && SHORTCUTS.TEXT_CLEANUP.length > 0) { const hr = document.createElement('hr'); shortcutsContainerElement.appendChild(hr); const div = document.createElement('div'); SHORTCUTS.TEXT_CLEANUP.forEach(s => createButton(s, div)); shortcutsContainerElement.appendChild(div); }
                if (SHORTCUTS.FORMATTING && SHORTCUTS.FORMATTING.length > 0) { const hr = document.createElement('hr'); shortcutsContainerElement.appendChild(hr); const div = document.createElement('div'); SHORTCUTS.FORMATTING.forEach(s => createButton(s, div)); shortcutsContainerElement.appendChild(div); }

                // 4. Injecte le panneau complet dans la page.
                targetStickySection.prepend(shortcutsContainerElement);

            } else {
                 // Si le panneau existe déjà, on met à jour les données si la page a changé (navigation SPA)
                 if (document.title !== (window._gftLastPageTitle || "")) {
                    extractSongData();
                    const artistSelContainer = shortcutsContainerElement.querySelector(`#${ARTIST_SELECTOR_CONTAINER_ID}`);
                    if(artistSelContainer && artistSelContainer.parentNode) createArtistSelectors(artistSelContainer.parentNode);
                    else if (shortcutsContainerElement) createArtistSelectors(shortcutsContainerElement);
                 }
                 if (shortcutsContainerElement) loadDarkModePreference();
            }
            window._gftLastPageTitle = document.title;
            hideGeniusFormattingHelper();
            // Met à jour le label du bouton couplet
            if (shortcutsContainerElement) { 
                const coupletButton = shortcutsContainerElement.querySelector(`#${COUPLET_BUTTON_ID}`); 
                if (coupletButton && SHORTCUTS.TAGS_STRUCTURAUX && SHORTCUTS.TAGS_STRUCTURAUX[0]) {
                    const coupletManagerConfig = SHORTCUTS.TAGS_STRUCTURAUX[0].buttons.find(b => b.type === 'coupletManager');
                    if (coupletManagerConfig) {
                        coupletButton.textContent = coupletManagerConfig.main.getLabel(); 
                    }
                }
            }
        } else {
            if (shortcutsContainerElement) { shortcutsContainerElement.remove(); shortcutsContainerElement = null; }
        }
    } else {
        if (shortcutsContainerElement) { shortcutsContainerElement.remove(); shortcutsContainerElement = null; }
    }
}

/**
 * Démarre le MutationObserver pour surveiller les changements dynamiques dans le DOM.
 * C'est essentiel pour les sites de type SPA (Single Page Application) comme Genius.
 */
function startObserver() {
    if (!document.body) { setTimeout(startObserver, 100); return; } // Attend que le body soit prêt.
    if (observer && typeof observer.disconnect === 'function') { observer.disconnect(); } // Déconnecte l'ancien observateur.
    observer = new MutationObserver((mutationsList, currentObsInstance) => {
        // La fonction de rappel est exécutée à chaque changement détecté dans le DOM.
        let editorAppeared = false; let controlsAppeared = false;
        for (const mutation of mutationsList) { if (mutation.type === 'childList') { if (mutation.addedNodes.length > 0) { mutation.addedNodes.forEach(node => { if (node.nodeType === Node.ELEMENT_NODE && typeof node.matches === 'function') { if (node.matches(SELECTORS.TEXTAREA_EDITOR) || node.matches(SELECTORS.DIV_EDITOR)) editorAppeared = true; if (node.matches(SELECTORS.CONTROLS_STICKY_SECTION)) controlsAppeared = true; } }); } } }
        const editorNowExistsInDOM = document.querySelector(SELECTORS.TEXTAREA_EDITOR) || document.querySelector(SELECTORS.DIV_EDITOR);
        const editorVanished = currentActiveEditor && !document.body.contains(currentActiveEditor);
        // Si l'éditeur apparaît ou disparaît, on relance l'initialisation.
        if (editorAppeared || controlsAppeared || (!currentActiveEditor && editorNowExistsInDOM) || editorVanished ) {
            // On se déconnecte temporairement pour éviter les boucles infinies.
            currentObsInstance.disconnect();
            initLyricsEditorEnhancer();
            // On se reconnecte après un court délai.
            setTimeout(() => { startObserver(); }, 200);
        }
    });
    // Commence à observer le `body` et tous ses descendants.
    try { observer.observe(document.body, { childList: true, subtree: true }); } catch (e) { console.error("[Observer] Erreur initiale:", e); }
    // Fait un premier appel pour gérer le cas où l'éditeur est déjà présent au chargement.
    initLyricsEditorEnhancer();
}

// ----- Démarrage du Script -----

// Gère le chargement initial de la page.
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startObserver);
else startObserver();

// Ajoute des écouteurs d'événements pour gérer la navigation SPA.
window.addEventListener('load', initLyricsEditorEnhancer);
window.addEventListener('popstate', initLyricsEditorEnhancer);
window.addEventListener('hashchange', initLyricsEditorEnhancer);

// Nettoie les ressources lorsque l'utilisateur quitte la page.
window.addEventListener('beforeunload', () => {
    if (observer && typeof observer.disconnect === 'function') observer.disconnect();
    if (shortcutsContainerElement) shortcutsContainerElement.remove();
    delete window._gftLastPageTitle;
});