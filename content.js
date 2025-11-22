// content.js (Version 2.5 - Extension Complète)
/**
 * @file Fichier principal de l'extension "Genius Fast Transcriber" v2.5.
 * Ce script s'injecte dans les pages du site genius.com.
 * Il détecte la présence de l'éditeur de paroles et y ajoute un panneau d'outils
 * pour accélérer et fiabiliser la transcription (ajout de tags, correction de texte, etc.).
 * 
 * Fonctionnalités principales :
 * - Tags structuraux intelligents avec détection automatique des artistes
 * - Raccourcis clavier (Ctrl+1-5, Ctrl+Shift+C, Ctrl+Z/Y, Ctrl+Shift+S)
 * - Historique Undo/Redo (10 dernières modifications)
 * - Prévisualisation des corrections avec modal avant/après
 * - Statistiques en temps réel (lignes, mots, sections, caractères)
 * - Tutoriel guidé au premier lancement (6 étapes)
 * - Barre d'outils flottante pour formatage (gras/italique/nombres en lettres)
 * - Conversion de nombres en lettres françaises (0-999 milliards)
 * - Mode sombre avec préférence sauvegardée
 * - Corrections automatiques avec barre de progression et surlignage visuel
 * - Détection et surlignage des parenthèses/crochets non appariés
 * 
 * @author Lnkhey
 * @version 2.5
 */

console.log('Genius Fast Transcriber (by Lnkhey) v2.5 - Toutes fonctionnalités activées ! 🎵');

// ----- Injection des animations CSS essentielles -----
// Injecte l'animation de surlignage pour s'assurer qu'elle fonctionne même si les styles CSS de Genius l'écrasent
(function injectCriticalStyles() {
    if (!document.getElementById('gft-critical-animations')) {
        const style = document.createElement('style');
        style.id = 'gft-critical-animations';
        style.textContent = `
            @keyframes lyrics-helper-fadeout {
                0% {
                    background-color: #f9ff55;
                    opacity: 0.8;
                }
                70% {
                    background-color: #f9ff55;
                    opacity: 0.5;
                }
                100% {
                    background-color: transparent;
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
})();

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
const HEADER_FEAT_STORAGE_KEY = 'gftHeaderFeatEnabled'; // Clé pour stocker la préférence d'inclusion des feat dans l'en-tête.
let darkModeButton = null; // Référence au bouton pour activer/désactiver le mode sombre.
let floatingFormattingToolbar = null; // Référence à la barre d'outils flottante pour le formatage (gras/italique).
let undoStack = []; // Stack pour l'historique des modifications (max 10 entrées).
let redoStack = []; // Stack pour refaire les modifications annulées.
const MAX_HISTORY_SIZE = 10; // Nombre maximum d'états sauvegardés dans l'historique.

// ----- Constantes Utiles -----
// Regroupement des sélecteurs CSS et des identifiants pour faciliter la maintenance.

const LYRICS_HELPER_HIGHLIGHT_CLASS = 'lyrics-helper-highlight'; // Classe CSS pour surligner temporairement les corrections.
const SHORTCUTS_CONTAINER_ID = 'genius-lyrics-shortcuts-container'; // ID du conteneur principal du panneau d'outils.
const ARTIST_SELECTOR_CONTAINER_ID = 'artistSelectorContainerLyricsHelper'; // ID du conteneur pour les cases à cocher des artistes.
const COUPLET_BUTTON_ID = 'coupletButton_GFT'; // ID spécifique pour le bouton d'ajout de couplet.
const FEEDBACK_MESSAGE_ID = 'gft-feedback-message'; // ID de l'élément affichant les messages de feedback (ex: "3 corrections effectuées").
const GFT_VISIBLE_CLASS = 'gft-visible'; // Classe CSS pour rendre visible un élément (utilisé pour le feedback).
const FLOATING_TOOLBAR_ID = 'gft-floating-formatting-toolbar'; // ID de la barre d'outils flottante pour le formatage.

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
    GENIUS_FORMATTING_HELPER: 'div[class*="LyricsEditExplainer__Container-sc-"][class*="LyricsEdit-desktop__Explainer-sc-"]', // Aide de Genius, que nous masquons.
    LYRICS_CONTAINER: '[data-lyrics-container="true"]' // Conteneur des paroles en mode lecture
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
 * Convertit un nombre (0-999999999999) en lettres en français.
 * @param {number} num - Le nombre à convertir.
 * @returns {string} Le nombre en lettres.
 */
function numberToFrenchWords(num) {
    if (num === 0) return "zéro";

    const ones = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"];
    const teens = ["dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
    const tens = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante", "quatre-vingt", "quatre-vingt"];

    function convertUpTo99(n) {
        if (n < 10) return ones[n];
        if (n < 20) return teens[n - 10];

        const ten = Math.floor(n / 10);
        const one = n % 10;

        if (ten === 7) {
            // 70-79: soixante-dix, soixante et onze, soixante-douze, etc.
            if (one === 0) return "soixante-dix";
            if (one === 1) return "soixante et onze";
            return "soixante-" + teens[one];
        }

        if (ten === 9) {
            // 90-99: quatre-vingt-dix, quatre-vingt-onze, etc.
            if (one === 0) return "quatre-vingt-dix";
            return "quatre-vingt-" + teens[one];
        }

        if (one === 0) {
            if (ten === 8) return "quatre-vingts"; // 80 avec un "s"
            return tens[ten];
        }

        if (one === 1 && (ten === 2 || ten === 3 || ten === 4 || ten === 5 || ten === 6)) {
            return tens[ten] + " et un";
        }

        if (ten === 8) return "quatre-vingt-" + ones[one]; // 81-89 sans "s"
        return tens[ten] + "-" + ones[one];
    }

    function convertUpTo999(n) {
        if (n < 100) return convertUpTo99(n);

        const hundred = Math.floor(n / 100);
        const rest = n % 100;

        let result = "";
        if (hundred === 1) {
            result = "cent";
        } else {
            result = ones[hundred] + " cent";
        }

        if (rest === 0 && hundred > 1) {
            result += "s"; // "cents" au pluriel
        } else if (rest > 0) {
            result += " " + convertUpTo99(rest);
        }

        return result;
    }

    // Vérifie la limite (999 milliards 999 millions 999 mille 999)
    if (num < 0 || num > 999999999999) return num.toString();

    if (num < 1000) return convertUpTo999(num);

    // Gestion des milliards (1 000 000 000 à 999 999 999 999)
    if (num >= 1000000000) {
        const billions = Math.floor(num / 1000000000);
        const rest = num % 1000000000;

        let result = "";
        if (billions === 1) {
            result = "un milliard";
        } else {
            result = convertUpTo999(billions) + " milliards";
        }

        if (rest > 0) {
            result += " " + numberToFrenchWords(rest);
        }

        return result;
    }

    // Gestion des millions (1 000 000 à 999 999 999)
    if (num >= 1000000) {
        const millions = Math.floor(num / 1000000);
        const rest = num % 1000000;

        let result = "";
        if (millions === 1) {
            result = "un million";
        } else {
            result = convertUpTo999(millions) + " millions";
        }

        if (rest > 0) {
            result += " " + numberToFrenchWords(rest);
        }

        return result;
    }

    // Gestion des milliers (1 000 à 999 999)
    const thousand = Math.floor(num / 1000);
    const rest = num % 1000;

    let result = "";
    if (thousand === 1) {
        result = "mille";
    } else {
        result = convertUpTo999(thousand) + " mille";
    }

    if (rest > 0) {
        result += " " + convertUpTo999(rest);
    }

    return result;
}

/**
 * Vérifie si une chaîne est un nombre valide (entier positif).
 * @param {string} str - La chaîne à vérifier.
 * @returns {boolean} True si c'est un nombre valide.
 */
function isValidNumber(str) {
    if (!str || str.trim() === "") return false;
    const trimmed = str.trim();
    // Accepte les nombres entiers positifs (avec ou sans espaces)
    return /^\d+$/.test(trimmed);
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
    const parentRect = textarea.offsetParent.getBoundingClientRect();
    overlay.style.top = (rect.top - parentRect.top + textarea.offsetParent.scrollTop) + 'px';
    overlay.style.left = (rect.left - parentRect.left + textarea.offsetParent.scrollLeft) + 'px';
    overlay.style.width = textarea.offsetWidth + 'px';
    overlay.style.height = textarea.offsetHeight + 'px';

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
            htmlContent += `<span class="gft-bracket-error-overlay" title="${title}" style="background-color: rgba(255, 68, 68, 0.5); color: transparent; font-weight: bold; position: relative; z-index: 2;">${char === '<' ? '&lt;' : char === '>' ? '&gt;' : char === '&' ? '&amp;' : char}</span>`;
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
    textarea.addEventListener('input', () => {
        // Supprime l'overlay quand l'utilisateur commence à taper
        overlay.remove();
        textarea.removeEventListener('scroll', syncScroll);
    });

    // Ajoute une animation pulsée
    const style = document.createElement('style');
    style.textContent = `
        @keyframes gft-overlay-pulse {
            0%, 100% { background-color: rgba(255, 68, 68, 0.5); }
            50% { background-color: rgba(255, 34, 34, 0.7); }
        }
        .gft-bracket-error-overlay {
            animation: gft-overlay-pulse 1.5s ease-in-out infinite;
        }
    `;
    if (!document.getElementById('gft-overlay-style')) {
        style.id = 'gft-overlay-style';
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

let feedbackTimeout = null; // Timeout pour masquer automatiquement le message de feedback.
/**
 * Affiche un message de feedback temporaire à l'utilisateur.
 * @param {string} message - Le message à afficher.
 * @param {number} [duration=3000] - La durée d'affichage en millisecondes.
 * @param {HTMLElement} [parentElement] - L'élément parent où afficher le message.
 */
function showFeedbackMessage(message, duration = 3000, parentElement) {
    let container = parentElement || shortcutsContainerElement;

    // Fallback sur le body si aucun conteneur n'est trouvé (ex: mode lecture)
    if (!container) {
        container = document.body;
    }

    let feedbackEl = document.getElementById(FEEDBACK_MESSAGE_ID);
    if (!feedbackEl) {
        feedbackEl = document.createElement('div');
        feedbackEl.id = FEEDBACK_MESSAGE_ID;

        // Si on est sur le body, on s'assure que le style est approprié (fixed position)
        // Le CSS gère déjà probablement ça, mais on vérifie l'attachement
        container.appendChild(feedbackEl);
    } else {
        // Si l'élément existe mais n'est pas dans le conteneur actuel (cas rare de changement de contexte)
        if (!container.contains(feedbackEl)) {
            container.appendChild(feedbackEl);
        }
    }

    feedbackEl.textContent = message;
    feedbackEl.classList.add(GFT_VISIBLE_CLASS);

    if (feedbackTimeout) {
        clearTimeout(feedbackTimeout);
    }

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
            if (darkModeButton) darkModeButton.textContent = '☀️';
        } else {
            shortcutsContainerElement.classList.remove(DARK_MODE_CLASS);
            if (darkModeButton) darkModeButton.textContent = '🌙';
        }
    }

    // Applique aussi le mode sombre à la barre flottante
    if (floatingFormattingToolbar) {
        if (isDark) {
            floatingFormattingToolbar.classList.add(DARK_MODE_CLASS);
        } else {
            floatingFormattingToolbar.classList.remove(DARK_MODE_CLASS);
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
 * Crée et initialise la barre d'outils flottante pour le formatage (Gras/Italique).
 * @returns {HTMLElement} L'élément de la barre d'outils flottante.
 */
function createFloatingFormattingToolbar() {
    if (floatingFormattingToolbar && document.body.contains(floatingFormattingToolbar)) {
        return floatingFormattingToolbar;
    }

    const toolbar = document.createElement('div');
    toolbar.id = FLOATING_TOOLBAR_ID;
    toolbar.className = 'gft-floating-toolbar';

    // Bouton Gras
    const boldButton = document.createElement('button');
    boldButton.textContent = 'Gras';
    boldButton.classList.add('gft-floating-format-button');
    boldButton.title = 'Mettre en gras';
    boldButton.type = 'button';
    boldButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        applyFormattingToSelection('bold');
    });
    addTooltip(boldButton, 'Mettre le texte sélectionné en gras');

    // Bouton Italique
    const italicButton = document.createElement('button');
    italicButton.textContent = 'Italique';
    italicButton.classList.add('gft-floating-format-button');
    italicButton.title = 'Mettre en italique';
    italicButton.type = 'button';
    italicButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        applyFormattingToSelection('italic');
    });
    addTooltip(italicButton, 'Mettre le texte sélectionné en italique');

    // Bouton Créer Lyrics Card
    const lyricsCardButton = document.createElement('button');
    lyricsCardButton.textContent = 'Créer Lyric Card';
    lyricsCardButton.classList.add('gft-floating-format-button');
    lyricsCardButton.title = 'Générer une image avec les paroles sélectionnées';
    lyricsCardButton.type = 'button';
    lyricsCardButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        generateLyricsCard();
    });
    addTooltip(lyricsCardButton, 'Générer une Lyric Card (1280x720)');

    // Bouton Nombre → Lettres
    const numberButton = document.createElement('button');
    numberButton.textContent = 'Nombre → Lettres';
    numberButton.classList.add('gft-floating-format-button', 'gft-number-button');
    numberButton.title = 'Convertir le nombre en lettres';
    numberButton.type = 'button';
    numberButton.style.display = 'none'; // Caché par défaut
    numberButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        convertNumberToWords();
    });
    addTooltip(numberButton, 'Convertir le nombre sélectionné en lettres');

    toolbar.appendChild(boldButton);
    toolbar.appendChild(italicButton);
    toolbar.appendChild(lyricsCardButton);
    toolbar.appendChild(numberButton);
    document.body.appendChild(toolbar);

    floatingFormattingToolbar = toolbar;

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
    if (!currentActiveEditor) return;

    // Active le flag pour désactiver la sauvegarde automatique
    isButtonActionInProgress = true;

    // Annule le timeout de sauvegarde automatique
    if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = null;
    }

    // Sauvegarde dans l'historique avant modification
    saveToHistory();

    currentActiveEditor.focus();
    const prefix = formatType === 'bold' ? '<b>' : '<i>';
    const suffix = formatType === 'bold' ? '</b>' : '</i>';

    if (currentEditorType === 'textarea') {
        const start = currentActiveEditor.selectionStart;
        const end = currentActiveEditor.selectionEnd;
        const selectedText = currentActiveEditor.value.substring(start, end);
        let textToInsert = (start !== end) ? `${prefix}${selectedText}${suffix}` : `${prefix} ${suffix}`;
        document.execCommand('insertText', false, textToInsert);
        if (start === end) {
            currentActiveEditor.setSelectionRange(start + prefix.length + 1, start + prefix.length + 1);
        } else {
            currentActiveEditor.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
        }
    } else if (currentEditorType === 'div') {
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

    // Désactive le flag après un court délai et met à jour lastSavedContent
    setTimeout(() => {
        isButtonActionInProgress = false;
        if (currentActiveEditor) {
            lastSavedContent = getCurrentEditorContent();
            hasUnsavedChanges = false;
        }
    }, 100);

    // Cache la barre d'outils après l'application du formatage
    hideFloatingToolbar();
}

/**
 * Convertit le nombre sélectionné en lettres.
 */
function convertNumberToWords() {
    if (!currentActiveEditor) return;

    // Active le flag pour désactiver la sauvegarde automatique
    isButtonActionInProgress = true;

    // Annule le timeout de sauvegarde automatique
    if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = null;
    }

    // Sauvegarde dans l'historique avant modification
    saveToHistory();

    currentActiveEditor.focus();

    let selectedText = '';
    let start, end;

    if (currentEditorType === 'textarea') {
        start = currentActiveEditor.selectionStart;
        end = currentActiveEditor.selectionEnd;
        selectedText = currentActiveEditor.value.substring(start, end).trim();
    } else if (currentEditorType === 'div') {
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
    const wordsText = numberToFrenchWords(num);

    // Remplace le texte sélectionné
    if (currentEditorType === 'textarea') {
        document.execCommand('insertText', false, wordsText);
        const newEnd = start + wordsText.length;
        currentActiveEditor.setSelectionRange(newEnd, newEnd);
    } else if (currentEditorType === 'div') {
        document.execCommand('insertText', false, wordsText);
    }

    // Désactive le flag après un court délai et met à jour lastSavedContent
    setTimeout(() => {
        isButtonActionInProgress = false;
        if (currentActiveEditor) {
            lastSavedContent = getCurrentEditorContent();
            hasUnsavedChanges = false;
        }
    }, 100);

    // Cache la barre d'outils après la conversion
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
    if (!currentActiveEditor) return;

    const statsElement = document.getElementById('gft-stats-display');
    if (!statsElement || !statsElement.classList.contains('gft-stats-visible')) return;

    const text = currentEditorType === 'textarea'
        ? currentActiveEditor.value
        : currentActiveEditor.textContent || '';

    const stats = calculateStats(text);

    statsElement.innerHTML = `📊 <strong>${stats.lines}</strong> lignes • <strong>${stats.words}</strong> mots • <strong>${stats.sections}</strong> sections • <strong>${stats.characters}</strong> caractères`;
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
    if (!currentActiveEditor) return '';

    if (currentEditorType === 'textarea') {
        return currentActiveEditor.value;
    } else if (currentEditorType === 'div') {
        return currentActiveEditor.textContent || '';
    }
    return '';
}

/**
 * Définit le contenu de l'éditeur.
 * @param {string} content - Le contenu à définir.
 */
function setEditorContent(content) {
    if (!currentActiveEditor) return;

    if (currentEditorType === 'textarea') {
        currentActiveEditor.value = content;
        currentActiveEditor.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    } else if (currentEditorType === 'div') {
        currentActiveEditor.innerHTML = '';
        content.split('\n').forEach((lineText, index, arr) => {
            const lineDiv = document.createElement('div');
            if (lineText === "") {
                if (index !== arr.length - 1 || content.endsWith('\n')) {
                    lineDiv.appendChild(document.createElement('br'));
                }
            } else {
                lineDiv.textContent = lineText;
            }
            currentActiveEditor.appendChild(lineDiv);
        });

        // S'assure que l'éditeur n'est jamais complètement vide
        if (currentActiveEditor.childNodes.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.appendChild(document.createElement('br'));
            currentActiveEditor.appendChild(emptyDiv);
        }

        currentActiveEditor.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    }

    // Met à jour les statistiques
    debouncedStatsUpdate();
}

let autoSaveTimeout = null;
let lastSavedContent = '';
let isUndoRedoInProgress = false; // Flag pour éviter les sauvegardes pendant undo/redo
let isButtonActionInProgress = false; // Flag pour éviter les sauvegardes auto pendant les actions de boutons
let hasUnsavedChanges = false; // Flag pour savoir si des modifications non sauvegardées existent

/**
 * Sauvegarde l'état actuel dans l'historique avant une modification.
 */
function saveToHistory() {
    if (!currentActiveEditor || isUndoRedoInProgress) return;

    const currentContent = getCurrentEditorContent();

    // Ne sauvegarde pas si le contenu est identique au dernier élément de l'undoStack
    if (undoStack.length > 0 && undoStack[undoStack.length - 1] === currentContent) {
        return;
    }

    undoStack.push(currentContent);
    lastSavedContent = currentContent;
    hasUnsavedChanges = false;

    // Limite la taille de l'historique (FIFO)
    if (undoStack.length > MAX_HISTORY_SIZE) {
        undoStack.shift(); // Retire le plus ancien
    }

    // Vider le redoStack car nouvelle branche d'historique
    redoStack = [];

    // Met à jour les boutons
    updateHistoryButtons();
}

/**
 * Sauvegarde automatique dans l'historique avec debounce.
 * Appelée pendant la frappe de l'utilisateur.
 * Sauvegarde l'état AVANT les modifications au premier input.
 */
function autoSaveToHistory() {
    if (!currentActiveEditor || isUndoRedoInProgress || isButtonActionInProgress) return;

    const currentContent = getCurrentEditorContent();

    // Si c'est le premier changement depuis la dernière sauvegarde,
    // on sauvegarde IMMÉDIATEMENT l'état AVANT la modification
    if (!hasUnsavedChanges && currentContent !== lastSavedContent) {
        // Sauvegarde l'état AVANT (qui est dans lastSavedContent ou le dernier de undoStack)
        if (lastSavedContent && lastSavedContent !== (undoStack[undoStack.length - 1] || '')) {
            undoStack.push(lastSavedContent);

            // Limite la taille de l'historique (FIFO)
            if (undoStack.length > MAX_HISTORY_SIZE) {
                undoStack.shift();
            }

            // Vider le redoStack car nouvelle branche d'historique
            redoStack = [];

            updateHistoryButtons();
        }
        hasUnsavedChanges = true;
    }

    // Annule le timeout précédent
    if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
    }

    // Après 2 secondes d'inactivité, met à jour lastSavedContent et réinitialise le flag
    autoSaveTimeout = setTimeout(() => {
        if (isUndoRedoInProgress || isButtonActionInProgress) return;

        const finalContent = getCurrentEditorContent();
        lastSavedContent = finalContent;
        hasUnsavedChanges = false;
    }, 2000);
}

/**
 * Wrapper pour exécuter une action de bouton avec sauvegarde dans l'historique.
 * @param {Function} action - La fonction action à exécuter.
 */
async function executeButtonAction(action) {
    isButtonActionInProgress = true;

    // Annule le timeout de sauvegarde automatique
    if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = null;
    }

    // Sauvegarde l'état AVANT la modification
    saveToHistory();

    // Exécute l'action
    await action();

    // Désactive le flag après un court délai
    setTimeout(() => {
        isButtonActionInProgress = false;
        // Met à jour lastSavedContent après l'action
        if (currentActiveEditor) {
            lastSavedContent = getCurrentEditorContent();
        }
    }, 100);
}

/**
 * Annule la dernière modification.
 */
function undoLastChange() {
    if (!currentActiveEditor || undoStack.length === 0) {
        showFeedbackMessage("Aucune modification à annuler", 2000, shortcutsContainerElement);
        return;
    }

    // Active le flag pour éviter les sauvegardes automatiques
    isUndoRedoInProgress = true;

    // Annule le timeout de sauvegarde automatique
    if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = null;
    }

    // Sauvegarde l'état actuel dans le redoStack
    const currentContent = getCurrentEditorContent();
    redoStack.push(currentContent);

    // Récupère le dernier état depuis l'undoStack
    const previousContent = undoStack.pop();

    // Restaure cet état
    setEditorContent(previousContent);

    // Met à jour lastSavedContent et réinitialise hasUnsavedChanges
    lastSavedContent = previousContent;
    hasUnsavedChanges = false;

    // Met à jour les boutons
    updateHistoryButtons();

    showFeedbackMessage("↩️ Modification annulée", 2000, shortcutsContainerElement);

    // Désactive le flag après un court délai
    setTimeout(() => {
        isUndoRedoInProgress = false;
    }, 100);
}

/**
 * Refait la dernière modification annulée.
 */
function redoLastChange() {
    if (!currentActiveEditor || redoStack.length === 0) {
        showFeedbackMessage("Aucune modification à refaire", 2000, shortcutsContainerElement);
        return;
    }

    // Active le flag pour éviter les sauvegardes automatiques
    isUndoRedoInProgress = true;

    // Annule le timeout de sauvegarde automatique
    if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = null;
    }

    // Sauvegarde l'état actuel dans l'undoStack
    const currentContent = getCurrentEditorContent();
    undoStack.push(currentContent);

    // Limite la taille
    if (undoStack.length > MAX_HISTORY_SIZE) {
        undoStack.shift();
    }

    // Récupère le dernier état depuis le redoStack
    const nextContent = redoStack.pop();

    // Restaure cet état
    setEditorContent(nextContent);

    // Met à jour lastSavedContent et réinitialise hasUnsavedChanges
    lastSavedContent = nextContent;
    hasUnsavedChanges = false;

    // Met à jour les boutons
    updateHistoryButtons();

    showFeedbackMessage("↪️ Modification refaite", 2000, shortcutsContainerElement);

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
        if (undoStack.length === 0) {
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
        if (redoStack.length === 0) {
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
    if (!progressContainer && shortcutsContainerElement) {
        progressContainer = createProgressBar();

        // Insère après le titre ou au début du panneau
        const feedbackMsg = document.getElementById(FEEDBACK_MESSAGE_ID);
        if (feedbackMsg) {
            shortcutsContainerElement.insertBefore(progressContainer, feedbackMsg.nextSibling);
        } else {
            const panelTitle = document.getElementById('gftPanelTitle');
            if (panelTitle) {
                shortcutsContainerElement.insertBefore(progressContainer, panelTitle.nextSibling);
            } else {
                shortcutsContainerElement.insertBefore(progressContainer, shortcutsContainerElement.firstChild);
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
 * Surligne les différences entre deux textes en jaune.
 * @param {string} originalText - Le texte original.
 * @param {string} correctedText - Le texte corrigé.
 * @returns {string} Le HTML avec les différences surlignées.
 */
function highlightDifferences(originalText, correctedText) {
    // Échappe le HTML pour éviter les problèmes d'injection
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Algorithme de diff amélioré utilisant la plus longue sous-séquence commune (LCS)
    function computeLCS(str1, str2) {
        const m = str1.length;
        const n = str2.length;
        const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                if (str1[i - 1] === str2[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                } else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                }
            }
        }

        // Reconstruction du chemin
        const lcs = [];
        let i = m, j = n;
        while (i > 0 && j > 0) {
            if (str1[i - 1] === str2[j - 1]) {
                lcs.unshift({ i: i - 1, j: j - 1 });
                i--;
                j--;
            } else if (dp[i - 1][j] > dp[i][j - 1]) {
                i--;
            } else {
                j--;
            }
        }

        return lcs;
    }

    // Calcule la LCS
    const lcs = computeLCS(originalText, correctedText);

    // Construit le résultat avec surlignage
    let result = '';
    let lastJ = 0;

    for (let k = 0; k < lcs.length; k++) {
        const match = lcs[k];

        // Surligne les caractères ajoutés/modifiés avant ce match
        if (lastJ < match.j) {
            result += `<span class="gft-diff-highlight">${escapeHtml(correctedText.substring(lastJ, match.j))}</span>`;
        }

        // Ajoute le caractère correspondant (non modifié)
        result += escapeHtml(correctedText[match.j]);
        lastJ = match.j + 1;
    }

    // Surligne les caractères restants à la fin
    if (lastJ < correctedText.length) {
        result += `<span class="gft-diff-highlight">${escapeHtml(correctedText.substring(lastJ))}</span>`;
    }

    return result;
}

/**
 * Crée le modal de prévisualisation des corrections.
 * @param {string} originalText - Le texte original.
 * @param {string} correctedText - Le texte corrigé.
 * @param {object} corrections - Les détails des corrections par type.
 * @param {Function} onApply - Callback appelée si l'utilisateur applique les corrections.
 * @param {Function} onCancel - Callback appelée si l'utilisateur annule.
 */
function showCorrectionPreview(originalText, correctedText, corrections, onApply, onCancel) {
    // Crée l'overlay
    const overlay = document.createElement('div');
    overlay.id = 'gft-preview-overlay';
    overlay.className = 'gft-preview-overlay';

    // Crée le modal
    const modal = document.createElement('div');
    modal.id = 'gft-preview-modal';
    modal.className = 'gft-preview-modal';

    // Applique le mode sombre si nécessaire
    const isDarkMode = localStorage.getItem(DARK_MODE_STORAGE_KEY) === 'true';
    if (isDarkMode) {
        modal.classList.add(DARK_MODE_CLASS);
    }

    // Titre
    const title = document.createElement('h2');
    title.textContent = '🔍 Prévisualisation des corrections';
    title.className = 'gft-preview-title';
    modal.appendChild(title);

    // Résumé des corrections
    const summary = document.createElement('div');
    summary.className = 'gft-preview-summary';
    const detailsArray = [];
    if (corrections.yPrime > 0) detailsArray.push(`${corrections.yPrime} "y'"`);
    if (corrections.apostrophes > 0) detailsArray.push(`${corrections.apostrophes} apostrophe(s)`);
    if (corrections.oeuLigature > 0) detailsArray.push(`${corrections.oeuLigature} "oeu"`);
    if (corrections.capitalization > 0) detailsArray.push(`${corrections.capitalization} majuscule(s)`);
    if (corrections.punctuation > 0) detailsArray.push(`${corrections.punctuation} ponctuation(s)`);
    if (corrections.spacing > 0) detailsArray.push(`${corrections.spacing} espacement(s)`);

    const totalCorrections = corrections.yPrime + corrections.apostrophes +
        corrections.oeuLigature + corrections.capitalization +
        corrections.punctuation + corrections.spacing;

    summary.innerHTML = `<strong>📊 ${totalCorrections} correction(s) détectée(s) :</strong><br>${detailsArray.join(', ')}`;
    modal.appendChild(summary);

    // Conteneur de comparaison
    const comparisonContainer = document.createElement('div');
    comparisonContainer.className = 'gft-preview-comparison';

    // Colonne "Avant"
    const beforeColumn = document.createElement('div');
    beforeColumn.className = 'gft-preview-column';
    const beforeTitle = document.createElement('h3');
    beforeTitle.textContent = 'Avant';
    beforeColumn.appendChild(beforeTitle);
    const beforeContent = document.createElement('pre');
    beforeContent.className = 'gft-preview-content';
    beforeContent.id = 'gft-preview-before';
    // Affiche le texte complet (pas de troncature)
    beforeContent.textContent = originalText;
    beforeColumn.appendChild(beforeContent);

    // Colonne "Après"
    const afterColumn = document.createElement('div');
    afterColumn.className = 'gft-preview-column';
    const afterTitle = document.createElement('h3');
    afterTitle.textContent = 'Après';
    afterColumn.appendChild(afterTitle);
    const afterContent = document.createElement('div');
    afterContent.className = 'gft-preview-content';
    afterContent.id = 'gft-preview-after';
    // Génère le HTML avec les différences surlignées
    afterContent.innerHTML = highlightDifferences(originalText, correctedText);
    afterColumn.appendChild(afterContent);

    comparisonContainer.appendChild(beforeColumn);
    comparisonContainer.appendChild(afterColumn);
    modal.appendChild(comparisonContainer);

    // Synchronise le scroll entre les deux zones
    let isSyncingBefore = false;
    let isSyncingAfter = false;

    beforeContent.addEventListener('scroll', () => {
        if (!isSyncingBefore) {
            isSyncingAfter = true;
            afterContent.scrollTop = beforeContent.scrollTop;
            afterContent.scrollLeft = beforeContent.scrollLeft;
            setTimeout(() => { isSyncingAfter = false; }, 10);
        }
    });

    afterContent.addEventListener('scroll', () => {
        if (!isSyncingAfter) {
            isSyncingBefore = true;
            beforeContent.scrollTop = afterContent.scrollTop;
            beforeContent.scrollLeft = afterContent.scrollLeft;
            setTimeout(() => { isSyncingBefore = false; }, 10);
        }
    });

    // Boutons d'action
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'gft-preview-buttons';

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Annuler';
    cancelButton.className = 'gft-preview-button gft-preview-button-cancel';
    cancelButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
        document.body.removeChild(modal);
        if (onCancel) onCancel();
    });

    const applyButton = document.createElement('button');
    applyButton.textContent = 'Appliquer les corrections';
    applyButton.className = 'gft-preview-button gft-preview-button-apply';
    applyButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
        document.body.removeChild(modal);
        if (onApply) onApply();
    });

    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(applyButton);
    modal.appendChild(buttonContainer);

    // Ajoute au DOM
    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    // Fermeture par clic sur l'overlay
    overlay.addEventListener('click', () => {
        document.body.removeChild(overlay);
        document.body.removeChild(modal);
        if (onCancel) onCancel();
    });
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
 * Vérifie si les tooltips sont activés.
 * @returns {boolean} True si les tooltips sont activés.
 */
function areTooltipsEnabled() {
    const setting = localStorage.getItem('gft-tooltips-enabled');
    return setting === null || setting === 'true'; // Activé par défaut
}

/**
 * Active ou désactive les tooltips.
 * @param {boolean} enabled - True pour activer, false pour désactiver.
 */
function setTooltipsEnabled(enabled) {
    localStorage.setItem('gft-tooltips-enabled', enabled.toString());
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

const TUTORIAL_STEPS = [
    {
        title: "Bienvenue ! 🎵",
        content: "Bienvenue dans <strong>Genius Fast Transcriber</strong> ! Cette extension vous aide à transcrire rapidement et précisément sur Genius.com. Laissez-moi vous faire découvrir ses fonctionnalités principales."
    },
    {
        title: "Sélection des artistes 👥",
        content: "Utilisez les cases à cocher pour <strong>attribuer les sections aux artistes</strong>. L'extension détecte automatiquement les artistes de la chanson."
    },
    {
        title: "Tags structuraux 🏷️",
        content: "Cliquez sur les boutons <strong>[Couplet]</strong>, <strong>[Refrain]</strong>, etc. pour insérer rapidement des tags. Les artistes sélectionnés seront automatiquement ajoutés."
    },
    {
        title: "Corrections automatiques ✨",
        content: "Le bouton <strong>\"Tout Corriger\"</strong> applique toutes les corrections en un clic : apostrophes, majuscules, ponctuation, et espacement. Une prévisualisation vous sera montrée avant d'appliquer."
    },
    {
        title: "Raccourcis clavier ⌨️",
        content: "Gagnez du temps avec les raccourcis :<br>• <kbd>Ctrl+1-5</kbd> pour les tags<br>• <kbd>Ctrl+Shift+C</kbd> pour Tout Corriger<br>• <kbd>Ctrl+Z/Y</kbd> pour Annuler/Refaire<br>• <kbd>Ctrl+Shift+S</kbd> pour les statistiques"
    },
    {
        title: "C'est parti ! 🚀",
        content: "Vous êtes maintenant prêt à transcrire efficacement ! N'hésitez pas à réactiver ce tutoriel via le bouton ⚙️ dans le panneau."
    }
];

/**
 * Affiche le tutoriel guidé.
 */
function showTutorial() {
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
function renderTutorialStep() {
    if (!tutorialModal) return;

    const step = TUTORIAL_STEPS[currentTutorialStep];

    tutorialModal.innerHTML = '';

    // Titre
    const title = document.createElement('h2');
    title.className = 'gft-tutorial-title';
    title.textContent = step.title;
    tutorialModal.appendChild(title);

    // Contenu
    const content = document.createElement('div');
    content.className = 'gft-tutorial-content';
    content.innerHTML = step.content;
    tutorialModal.appendChild(content);

    // Indicateur de progression
    const progress = document.createElement('div');
    progress.className = 'gft-tutorial-progress';
    progress.textContent = `Étape ${currentTutorialStep + 1} sur ${TUTORIAL_STEPS.length}`;
    tutorialModal.appendChild(progress);

    // Boutons
    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'gft-tutorial-buttons';

    // Bouton "Passer"
    const skipButton = document.createElement('button');
    skipButton.textContent = 'Passer le tutoriel';
    skipButton.className = 'gft-tutorial-button gft-tutorial-button-skip';
    skipButton.addEventListener('click', closeTutorial);
    buttonsDiv.appendChild(skipButton);

    // Bouton "Précédent" (sauf première étape)
    if (currentTutorialStep > 0) {
        const prevButton = document.createElement('button');
        prevButton.textContent = '← Précédent';
        prevButton.className = 'gft-tutorial-button gft-tutorial-button-prev';
        prevButton.addEventListener('click', () => {
            currentTutorialStep--;
            renderTutorialStep();
        });
        buttonsDiv.appendChild(prevButton);
    }

    // Bouton "Suivant" ou "Terminer"
    const nextButton = document.createElement('button');
    nextButton.className = 'gft-tutorial-button gft-tutorial-button-next';

    if (currentTutorialStep < TUTORIAL_STEPS.length - 1) {
        nextButton.textContent = 'Suivant →';
        nextButton.addEventListener('click', () => {
            currentTutorialStep++;
            renderTutorialStep();
        });
    } else {
        nextButton.textContent = 'Terminer ✓';
        nextButton.addEventListener('click', closeTutorial);
    }

    buttonsDiv.appendChild(nextButton);
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
    // Crée un simple menu avec les options
    const menu = document.createElement('div');
    menu.className = 'gft-settings-menu';
    menu.id = 'gft-settings-menu';

    // Applique le mode sombre si nécessaire
    const isDarkMode = localStorage.getItem(DARK_MODE_STORAGE_KEY) === 'true';
    if (isDarkMode) {
        menu.classList.add(DARK_MODE_CLASS);
    }

    // Option 1: Relancer le tutoriel
    const tutorialOption = document.createElement('button');
    tutorialOption.className = 'gft-settings-menu-item';
    tutorialOption.textContent = '🎓 Relancer le tutoriel';
    tutorialOption.addEventListener('click', () => {
        closeSettingsMenu();
        showTutorial();
    });
    menu.appendChild(tutorialOption);

    // Option 2: Toggle tooltips
    const tooltipsOption = document.createElement('button');
    tooltipsOption.className = 'gft-settings-menu-item';
    const tooltipsEnabled = areTooltipsEnabled();
    tooltipsOption.textContent = tooltipsEnabled ? '💬 Désactiver les tooltips' : '💬 Activer les tooltips';
    tooltipsOption.addEventListener('click', () => {
        // Réévalue l'état actuel au moment du clic
        const currentState = areTooltipsEnabled();
        setTooltipsEnabled(!currentState);
        closeSettingsMenu();
        showFeedbackMessage(
            currentState ? 'Tooltips désactivés' : 'Tooltips activés',
            2000,
            shortcutsContainerElement
        );
    });
    menu.appendChild(tooltipsOption);

    // Option 3: Toggle feat dans l'en-tête
    const headerFeatOption = document.createElement('button');
    headerFeatOption.className = 'gft-settings-menu-item';
    const headerFeatEnabled = isHeaderFeatEnabled();
    headerFeatOption.textContent = headerFeatEnabled ? '🎤 Masquer feat dans l\'en-tête' : '🎤 Afficher feat dans l\'en-tête';
    headerFeatOption.addEventListener('click', () => {
        // Réévalue l'état actuel au moment du clic
        const currentState = isHeaderFeatEnabled();
        setHeaderFeatEnabled(!currentState);
        closeSettingsMenu();
        showFeedbackMessage(
            currentState ? 'Feat masqués dans l\'en-tête' : 'Feat affichés dans l\'en-tête',
            2000,
            shortcutsContainerElement
        );
    });
    menu.appendChild(headerFeatOption);

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
    'Ctrl+Shift+S': 'toggleStats'
};

/**
 * Insère un tag de section dans l'éditeur actif.
 * @param {string} tagType - Le type de tag à insérer.
 */
function insertTagViaShortcut(tagType) {
    if (!currentActiveEditor) return;

    // Active le flag pour désactiver la sauvegarde automatique
    isButtonActionInProgress = true;
    if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = null;
    }

    currentActiveEditor.focus();
    let textToInsert = '';

    switch (tagType) {
        case 'couplet':
            textToInsert = addArtistToText(`[Couplet ${coupletCounter}]`);
            coupletCounter++;
            // Met à jour le bouton
            const coupletButton = document.getElementById(COUPLET_BUTTON_ID);
            if (coupletButton) {
                coupletButton.textContent = `[Couplet ${coupletCounter}]`;
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

    // Désactive le flag après un court délai et met à jour lastSavedContent
    setTimeout(() => {
        isButtonActionInProgress = false;
        if (currentActiveEditor) {
            lastSavedContent = getCurrentEditorContent();
            hasUnsavedChanges = false;
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
    // Ne rien faire si l'éditeur n'est pas actif
    if (!currentActiveEditor) return;

    // Ne rien faire si on n'est pas dans l'éditeur de Genius
    if (document.activeElement !== currentActiveEditor) return;

    // Construire la clé du raccourci
    let shortcutKey = '';
    if (event.ctrlKey || event.metaKey) shortcutKey += 'Ctrl+';
    if (event.shiftKey) shortcutKey += 'Shift+';

    // Convertir la touche en majuscule pour la correspondance
    const key = event.key.toUpperCase();
    shortcutKey += key;

    // Vérifier si ce raccourci existe dans notre configuration
    const action = KEYBOARD_SHORTCUTS[shortcutKey];

    if (!action) return; // Pas de raccourci correspondant

    // Empêcher le comportement par défaut pour les raccourcis reconnus
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
            break;
        case 'toutCorriger':
            triggerToutCorrigerViaShortcut();
            break;
        case 'undo':
            undoLastChange();
            break;
        case 'redo':
            redoLastChange();
            break;
        case 'toggleStats':
            toggleStatsDisplay();
            break;
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
    if (!floatingFormattingToolbar) {
        createFloatingFormattingToolbar();
    }

    let rect;
    let selectedText = '';

    if (currentActiveEditor) {
        // Mode Édition
        // Affiche tous les boutons
        Array.from(floatingFormattingToolbar.children).forEach(child => child.style.display = '');

        if (currentEditorType === 'textarea') {
            // Pour les textarea, calcule la position du texte sélectionné
            const textareaRect = currentActiveEditor.getBoundingClientRect();
            const start = currentActiveEditor.selectionStart;
            const end = currentActiveEditor.selectionEnd;

            if (start === end) {
                hideFloatingToolbar();
                return;
            }

            selectedText = currentActiveEditor.value.substring(start, end);

            // Calcule la position du début de la sélection (position relative au textarea)
            const startPos = getTextareaCaretPosition(currentActiveEditor, start);

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
        Array.from(floatingFormattingToolbar.children).forEach(child => {
            if (child.textContent === 'Créer Lyric Card') {
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
    const numberButton = floatingFormattingToolbar.querySelector('.gft-number-button');
    if (numberButton) {
        if (isNumber && currentActiveEditor) { // Only show number button in edit mode
            numberButton.style.display = 'inline-block';
        } else {
            numberButton.style.display = 'none';
        }
    }

    // Positionne la barre d'outils au-dessus de la sélection
    floatingFormattingToolbar.style.display = 'flex';
    floatingFormattingToolbar.style.visibility = 'visible';
    floatingFormattingToolbar.style.opacity = '1';
    floatingFormattingToolbar.style.position = 'fixed'; // Position fixed pour qu'elle suive le scroll

    // Calcule la position centrale au-dessus de la sélection
    const toolbarWidth = floatingFormattingToolbar.offsetWidth || 150;
    const toolbarHeight = floatingFormattingToolbar.offsetHeight || 40;

    // rect contient déjà les coordonnées viewport (pas besoin d'ajouter window.scrollX/Y)
    const left = rect.left + (rect.width / 2) - (toolbarWidth / 2);
    const top = rect.top - toolbarHeight - 8; // 8px au-dessus de la sélection

    floatingFormattingToolbar.style.left = `${Math.max(10, left)}px`;
    floatingFormattingToolbar.style.top = `${Math.max(10, top)}px`;
}

/**
 * Cache la barre d'outils flottante.
 */
function hideFloatingToolbar() {
    if (floatingFormattingToolbar) {
        floatingFormattingToolbar.style.display = 'none';
    }
}

/**
 * Gestionnaire pour détecter les changements de sélection et afficher/masquer la barre flottante.
 */
function handleSelectionChange() {
    // Si on est dans un éditeur, on garde la logique existante
    if (currentActiveEditor) {
        let hasSelection = false;

        // Pour les textarea, il faut vérifier selectionStart et selectionEnd
        if (currentEditorType === 'textarea') {
            const start = currentActiveEditor.selectionStart;
            const end = currentActiveEditor.selectionEnd;
            hasSelection = (start !== end) && document.activeElement === currentActiveEditor;
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
            if (currentActiveEditor.contains(container) ||
                (container.nodeType === Node.ELEMENT_NODE && container === currentActiveEditor)) {
                isInEditor = true;
            } else if (container.parentNode && currentActiveEditor.contains(container.parentNode)) {
                isInEditor = true;
            }

            hasSelection = isInEditor && !selection.isCollapsed;
        }

        if (hasSelection) {
            setTimeout(showFloatingToolbar, 50);
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
        // On peut utiliser currentSongTitle comme proxy, ou vérifier le meta og:type
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
    const trimmed = line.trim();
    // Vérifie si c'est un tag de section (commence par [ et finit par ])
    // MAIS exclut les placeholders comme [?] ou [??]
    if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) {
        return false;
    }

    // Exclut les placeholders [?] (un ou plusieurs points d'interrogation)
    const isPlaceholder = /^\[\?+\]$/.test(trimmed);

    return !isPlaceholder;
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
                    if (newLinesInterim[newLinesInterim.length - 1].trim() !== "") {
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

                // On garde la ligne vide si la ligne suivante est un tag (que la précédente soit un tag ou du texte)
                // Cela gère : Texte→vide→Tag ET Tag→vide→Tag
                if (nextNonEmptyLineIsTagInInterim && !prevLineInNewLinesWasEmptyAndKept) {
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
            if (newLines[i].trim() !== "" || newLines[i - 1].trim() !== "") {
                finalCleanedLines.push(newLines[i]);
            }
        }
    }

    // Supprime les lignes vides au début et à la fin du texte.
    while (finalCleanedLines.length > 0 && finalCleanedLines[0].trim() === "" &&
        (finalCleanedLines.length > 1 && finalCleanedLines[1].trim() !== "")) {
        finalCleanedLines.shift();
    }
    while (finalCleanedLines.length > 0 && finalCleanedLines[finalCleanedLines.length - 1].trim() === "") {
        finalCleanedLines.pop();
    }

    const newText = finalCleanedLines.join('\n');

    // Calcule le nombre de corrections de manière plus précise
    if (text !== newText) {
        // Compte les lignes vides dans l'original et dans le résultat
        const originalEmptyLines = (text.match(/\n\s*\n/g) || []).length;
        const newEmptyLines = (newText.match(/\n\s*\n/g) || []).length;

        // Compte aussi les lignes au début/fin qui ont changé
        const originalTrimmed = text.trim();
        const newTrimmed = newText.trim();

        // Calcul simplifié : différence de lignes vides + 1 si le contenu a changé
        correctionsCount = Math.abs(originalEmptyLines - newEmptyLines);

        // Si le texte a vraiment changé mais pas de différence dans les lignes vides,
        // compte comme 1 correction minimale
        if (correctionsCount === 0 && originalTrimmed !== newTrimmed) {
            correctionsCount = 1;
        }
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
 * @returns {{newText: string, correctionsCount: number, corrections: object}} Le texte final corrigé, le nombre total et les détails par type.
 */
function applyAllTextCorrectionsToString(text) {
    let currentText = text;
    let result;

    // Objet pour tracker les corrections par type
    const corrections = {
        yPrime: 0,
        apostrophes: 0,
        oeuLigature: 0,
        capitalization: 0,
        punctuation: 0,
        spacing: 0
    };

    // Correction de "y'" -> "y "
    const yPrimePattern = /\b(Y|y)'/g;
    const yPrimeReplacement = (match, firstLetter) => (firstLetter === 'Y' ? 'Y ' : 'y ');
    const textAfterYPrime = currentText.replace(yPrimePattern, yPrimeReplacement);
    if (textAfterYPrime !== currentText) {
        corrections.yPrime = (currentText.match(yPrimePattern) || []).length;
        currentText = textAfterYPrime;
    }

    // Correction de l'apostrophe typographique ' -> '
    const apostrophePattern = /'/g;
    const textAfterApostrophe = currentText.replace(apostrophePattern, "'");
    if (textAfterApostrophe !== currentText) {
        corrections.apostrophes = (currentText.match(apostrophePattern) || []).length;
        currentText = textAfterApostrophe;
    }

    // Correction de "oeu" -> "œu"
    const oeuPattern = /([Oo])eu/g;
    const oeuReplacement = (match, firstLetter) => (firstLetter === 'O' ? 'Œu' : 'œu');
    const textAfterOeu = currentText.replace(oeuPattern, oeuReplacement);
    if (textAfterOeu !== currentText) {
        corrections.oeuLigature = (currentText.match(oeuPattern) || []).length;
        currentText = textAfterOeu;
    }

    // Application des autres corrections
    result = capitalizeFirstLetterOfEachLine(currentText);
    if (result.correctionsCount > 0) {
        corrections.capitalization = result.correctionsCount;
        currentText = result.newText;
    }

    result = removeTrailingPunctuationFromLines(currentText);
    if (result.correctionsCount > 0) {
        corrections.punctuation = result.correctionsCount;
        currentText = result.newText;
    }

    result = correctLineSpacing(currentText);
    if (result.correctionsCount > 0) {
        corrections.spacing = result.correctionsCount;
        currentText = result.newText;
    }

    // Calcul du total
    const totalCorrections = corrections.yPrime + corrections.apostrophes +
        corrections.oeuLigature + corrections.capitalization +
        corrections.punctuation + corrections.spacing;

    return { newText: currentText, correctionsCount: totalCorrections, corrections: corrections };
}

/**
 * Version asynchrone de applyAllTextCorrectionsToString avec barre de progression.
 * @param {string} text - Le texte d'origine.
 * @returns {Promise<{newText: string, correctionsCount: number, corrections: object}>} Le texte corrigé et les détails.
 */
async function applyAllTextCorrectionsAsync(text) {
    let currentText = text;
    let result;
    const totalSteps = 6;

    // Objet pour tracker les corrections par type
    const corrections = {
        yPrime: 0,
        apostrophes: 0,
        oeuLigature: 0,
        capitalization: 0,
        punctuation: 0,
        spacing: 0
    };

    // Étape 1: Correction de "y'" -> "y "
    showProgress(1, totalSteps, 'Correction de "y\'"...');
    await new Promise(resolve => setTimeout(resolve, 50)); // Petit délai pour l'affichage

    const yPrimePattern = /\b(Y|y)'/g;
    const yPrimeReplacement = (match, firstLetter) => (firstLetter === 'Y' ? 'Y ' : 'y ');
    const textAfterYPrime = currentText.replace(yPrimePattern, yPrimeReplacement);
    if (textAfterYPrime !== currentText) {
        corrections.yPrime = (currentText.match(yPrimePattern) || []).length;
        currentText = textAfterYPrime;
    }

    // Étape 2: Correction de l'apostrophe typographique
    showProgress(2, totalSteps, 'Correction des apostrophes...');
    await new Promise(resolve => setTimeout(resolve, 50));

    const apostrophePattern = /'/g;
    const textAfterApostrophe = currentText.replace(apostrophePattern, "'");
    if (textAfterApostrophe !== currentText) {
        corrections.apostrophes = (currentText.match(apostrophePattern) || []).length;
        currentText = textAfterApostrophe;
    }

    // Étape 3: Correction de "oeu" -> "œu"
    showProgress(3, totalSteps, 'Correction de "oeu"...');
    await new Promise(resolve => setTimeout(resolve, 50));

    const oeuPattern = /([Oo])eu/g;
    const oeuReplacement = (match, firstLetter) => (firstLetter === 'O' ? 'Œu' : 'œu');
    const textAfterOeu = currentText.replace(oeuPattern, oeuReplacement);
    if (textAfterOeu !== currentText) {
        corrections.oeuLigature = (currentText.match(oeuPattern) || []).length;
        currentText = textAfterOeu;
    }

    // Étape 4: Majuscules
    showProgress(4, totalSteps, 'Majuscules en début de ligne...');
    await new Promise(resolve => setTimeout(resolve, 50));

    result = capitalizeFirstLetterOfEachLine(currentText);
    if (result.correctionsCount > 0) {
        corrections.capitalization = result.correctionsCount;
        currentText = result.newText;
    }

    // Étape 5: Ponctuation
    showProgress(5, totalSteps, 'Suppression de la ponctuation...');
    await new Promise(resolve => setTimeout(resolve, 50));

    result = removeTrailingPunctuationFromLines(currentText);
    if (result.correctionsCount > 0) {
        corrections.punctuation = result.correctionsCount;
        currentText = result.newText;
    }

    // Étape 6: Espacement
    showProgress(6, totalSteps, 'Correction de l\'espacement...');
    await new Promise(resolve => setTimeout(resolve, 50));

    result = correctLineSpacing(currentText);
    if (result.correctionsCount > 0) {
        corrections.spacing = result.correctionsCount;
        currentText = result.newText;
    }

    // Calcul du total
    const totalCorrections = corrections.yPrime + corrections.apostrophes +
        corrections.oeuLigature + corrections.capitalization +
        corrections.punctuation + corrections.spacing;

    return { newText: currentText, correctionsCount: totalCorrections, corrections: corrections };
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
            {
                buttons: [
                    { label: "En-tête", getText: () => { let txt = `[Paroles de "${currentSongTitle}"`; const fts = formatArtistList(currentFeaturingArtists); if (fts && isHeaderFeatEnabled()) txt += ` ft. ${fts}`; txt += ']\n'; return txt; }, tooltip: "Insérer l'en-tête de la chanson avec les artistes" },
                    {
                        type: 'coupletManager',
                        prev: { label: '←', title: 'Couplet précédent', tooltip: 'Revenir au couplet précédent' },
                        main: {
                            id: COUPLET_BUTTON_ID,
                            getLabel: () => `[Couplet ${coupletCounter}]`,
                            getText: () => addArtistToText(`[Couplet ${coupletCounter}]`),
                            tooltip: 'Insérer un tag [Couplet] avec les artistes sélectionnés (Ctrl+1)'
                        },
                        next: { label: '→', title: 'Couplet suivant', tooltip: 'Passer au couplet suivant' }
                    },
                    { label: '[Intro]', getText: () => addArtistToText('[Intro]'), tooltip: 'Insérer un tag [Intro] avec les artistes (Ctrl+4)' },
                    { label: '[Couplet unique]', getText: () => addArtistToText('[Couplet unique]'), tooltip: 'Insérer un tag [Couplet unique] avec les artistes' },
                    { label: '[Couplet]', getText: () => addArtistToText('[Couplet]'), tooltip: 'Insérer un tag [Couplet] sans numéro avec les artistes' },
                    { label: '[Pré-refrain]', getText: () => addArtistToText('[Pré-refrain]'), tooltip: 'Insérer un tag [Pré-refrain] avec les artistes' },
                    { label: '[Refrain]', getText: () => addArtistToText('[Refrain]'), tooltip: 'Insérer un tag [Refrain] avec les artistes (Ctrl+2)' },
                    { label: '[Pont]', getText: () => addArtistToText('[Pont]'), tooltip: 'Insérer un tag [Pont] avec les artistes (Ctrl+3)' },
                    { label: '[Outro]', getText: () => addArtistToText('[Outro]'), tooltip: 'Insérer un tag [Outro] avec les artistes (Ctrl+5)' },
                    { label: '[Instrumental]', text: '[Instrumental]\n', tooltip: 'Insérer un tag [Instrumental] pour les sections instrumentales' },
                    { label: '[?]', text: '[?]\n', tooltip: 'Insérer un tag [?] pour les paroles inconnues' },
                    { label: 'ZWS', text: '\u200B', tooltip: 'Insérer un Zero Width Space (espace de largeur nulle)' }
                ]
            }
        ],
        TEXT_CLEANUP: [
            {
                label: "y' → y ",
                action: 'replaceText',
                searchPattern: /\b(Y|y)'/g,
                replacementFunction: (match, firstLetter) => (firstLetter === 'Y' ? 'Y ' : 'y '),
                highlightClass: LYRICS_HELPER_HIGHLIGHT_CLASS,
                tooltip: "Corriger tous les y' en y (typique en français)"
            },
            { label: "' → '", action: 'replaceText', searchPattern: /'/g, replacementText: "'", highlightClass: LYRICS_HELPER_HIGHLIGHT_CLASS, tooltip: "Remplacer les apostrophes typographiques ' par des apostrophes standard '" },
            {
                label: "oeu → œu",
                action: 'replaceText',
                searchPattern: /([Oo])eu/g,
                replacementFunction: (match, firstLetter) => (firstLetter === 'O' ? 'Œu' : 'œu'),
                highlightClass: LYRICS_HELPER_HIGHLIGHT_CLASS,
                tooltip: "Remplacer oeu par œu (ligature française)"
            },
            { label: "Maj. début ligne", action: 'lineCorrection', correctionType: 'capitalize', title: "Met en majuscule la première lettre de chaque ligne.", tooltip: "Mettre en majuscule la première lettre de chaque ligne" },
            { label: "Suppr. ., fin ligne", action: 'lineCorrection', correctionType: 'removePunctuation', title: "Supprime les points et virgules en fin de ligne.", tooltip: "Supprimer les points et virgules en fin de ligne" },
            { label: "Corriger Espacement", action: 'lineCorrection', correctionType: 'spacing', title: "Corrige les espacements (lignes vides inutiles ou manquantes).", tooltip: "Corriger les espacements (lignes vides inutiles ou manquantes)" }
        ],
        GLOBAL_FIXES: [
            { label: "Tout Corriger (Texte)", action: 'globalTextFix', title: "Applique toutes les corrections de texte (y', apostrophes, oeu, majuscules, ponctuation, espacement).", tooltip: "Appliquer toutes les corrections automatiques avec prévisualisation (Ctrl+Shift+C)" },
            { label: "🔍 Vérifier ( ) [ ]", action: 'checkBrackets', title: "Vérifie et surligne les parenthèses et crochets non appariés.", tooltip: "Détecter et surligner les parenthèses et crochets non appariés" }
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

        // Réinitialise l'historique pour le nouvel éditeur
        undoStack = [];
        redoStack = [];
        lastSavedContent = '';
        hasUnsavedChanges = false;
        if (autoSaveTimeout) {
            clearTimeout(autoSaveTimeout);
            autoSaveTimeout = null;
        }

        // Initialise la barre d'outils flottante
        createFloatingFormattingToolbar();

        // Ajoute un écouteur spécifique pour les sélections dans le textarea
        if (currentEditorType === 'textarea') {
            currentActiveEditor.addEventListener('select', handleSelectionChange);
            currentActiveEditor.addEventListener('mouseup', handleSelectionChange);
            // Cache la barre flottante quand on scroll dans le textarea
            currentActiveEditor.addEventListener('scroll', hideFloatingToolbar);
        }

        // Ajoute un écouteur pour mettre à jour les statistiques en temps réel
        currentActiveEditor.addEventListener('input', debouncedStatsUpdate);
        // Ajoute un écouteur pour la sauvegarde automatique dans l'historique
        currentActiveEditor.addEventListener('input', autoSaveToHistory);
        // Met à jour les statistiques initiales
        setTimeout(() => updateStatsDisplay(), 500);

        // Sauvegarde initiale dans l'historique
        setTimeout(() => {
            const initialContent = getCurrentEditorContent();
            if (initialContent && initialContent.trim().length > 0) {
                lastSavedContent = initialContent;
                if (undoStack.length === 0 || undoStack[undoStack.length - 1] !== initialContent) {
                    undoStack.push(initialContent);
                    updateHistoryButtons();
                }
            }
        }, 500);
    } else if (editorJustDisappeared) {
        currentActiveEditor = null; currentEditorType = null;
        hideFloatingToolbar();

        // Réinitialise l'historique quand on quitte l'éditeur
        undoStack = [];
        redoStack = [];
        lastSavedContent = '';
        hasUnsavedChanges = false;
        if (autoSaveTimeout) {
            clearTimeout(autoSaveTimeout);
            autoSaveTimeout = null;
        }
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
                titleAndLogoContainer.innerHTML = `<img src="${logoURL}" alt="GFT Logo" id="gftPanelLogo" /> Genius Fast Transcriber`;
                panelTitle.appendChild(titleAndLogoContainer);

                darkModeButton = document.createElement('button');
                darkModeButton.id = 'gftDarkModeButton';
                darkModeButton.classList.add('genius-lyrics-shortcut-button');
                darkModeButton.addEventListener('click', (event) => {
                    event.preventDefault();
                    toggleDarkMode();
                });
                panelTitle.appendChild(darkModeButton);
                addTooltip(darkModeButton, 'Activer/Désactiver le mode sombre');

                // Bouton pour afficher/masquer les statistiques
                const statsToggleButton = document.createElement('button');
                statsToggleButton.id = 'gftStatsToggleButton';
                statsToggleButton.textContent = '📊';
                statsToggleButton.title = 'Afficher/Masquer les statistiques (Ctrl+Shift+S)';
                statsToggleButton.classList.add('genius-lyrics-shortcut-button');
                statsToggleButton.addEventListener('click', (event) => {
                    event.preventDefault();
                    toggleStatsDisplay();
                });
                panelTitle.appendChild(statsToggleButton);
                addTooltip(statsToggleButton, 'Afficher/Masquer les statistiques (Ctrl+Shift+S)');

                // Bouton Undo
                const undoButton = document.createElement('button');
                undoButton.id = 'gft-undo-button';
                undoButton.textContent = '↩';
                undoButton.title = 'Annuler (Ctrl+Z)';
                undoButton.classList.add('genius-lyrics-shortcut-button');
                undoButton.disabled = true;
                undoButton.style.opacity = '0.5';
                undoButton.addEventListener('click', (event) => {
                    event.preventDefault();
                    undoLastChange();
                });
                panelTitle.appendChild(undoButton);
                addTooltip(undoButton, 'Annuler la dernière modification (Ctrl+Z)');

                // Bouton Redo
                const redoButton = document.createElement('button');
                redoButton.id = 'gft-redo-button';
                redoButton.textContent = '↪';
                redoButton.title = 'Refaire (Ctrl+Y)';
                redoButton.classList.add('genius-lyrics-shortcut-button');
                redoButton.disabled = true;
                redoButton.style.opacity = '0.5';
                redoButton.addEventListener('click', (event) => {
                    event.preventDefault();
                    redoLastChange();
                });
                panelTitle.appendChild(redoButton);
                addTooltip(redoButton, 'Refaire la dernière modification annulée (Ctrl+Y)');

                // Bouton Paramètres/Aide
                const settingsButton = document.createElement('button');
                settingsButton.id = 'gft-settings-button';
                settingsButton.textContent = '⚙️';
                settingsButton.title = 'Paramètres et Aide';
                settingsButton.classList.add('genius-lyrics-shortcut-button');
                settingsButton.addEventListener('click', (event) => {
                    event.preventDefault();
                    const existingMenu = document.getElementById('gft-settings-menu');
                    if (existingMenu) {
                        closeSettingsMenu();
                    } else {
                        showSettingsMenu();
                    }
                });
                panelTitle.appendChild(settingsButton);
                addTooltip(settingsButton, 'Ouvrir les paramètres et le tutoriel');

                shortcutsContainerElement.appendChild(panelTitle);
                loadDarkModePreference();

                // Crée l'affichage des statistiques
                const statsDisplay = createStatsDisplay();
                shortcutsContainerElement.appendChild(statsDisplay);

                // Met à jour les statistiques initiales si visibles
                if (statsDisplay.classList.contains('gft-stats-visible')) {
                    updateStatsDisplay();
                }

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

                    // Ajoute le tooltip si défini
                    if (config.tooltip) {
                        addTooltip(button, config.tooltip);
                    }
                    // Ajoute l'écouteur d'événement principal qui déclenche l'action du bouton.
                    button.addEventListener('click', (event) => {
                        event.preventDefault();
                        if (!currentActiveEditor) { initLyricsEditorEnhancer(); if (!currentActiveEditor) return; }

                        // Sauvegarde la position du curseur pour les textarea
                        let savedCursorStart = null;
                        let savedCursorEnd = null;
                        if (currentEditorType === 'textarea') {
                            savedCursorStart = currentActiveEditor.selectionStart;
                            savedCursorEnd = currentActiveEditor.selectionEnd;
                        }

                        currentActiveEditor.focus();

                        // Active le flag pour désactiver la sauvegarde automatique pendant toute l'action
                        isButtonActionInProgress = true;
                        if (autoSaveTimeout) {
                            clearTimeout(autoSaveTimeout);
                            autoSaveTimeout = null;
                        }

                        let textToInsertForCouplet = null;

                        // Logique pour chaque type d'action
                        if (config.action === 'replaceText' && config.searchPattern) {
                            // Sauvegarde dans l'historique avant modification
                            saveToHistory();

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
                                    // Crée un overlay pour surligner les modifications dans le textarea
                                    createTextareaReplacementOverlay(currentActiveEditor, originalValue, newValue, config.searchPattern);
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
                            // Sauvegarde dans l'historique avant modification
                            saveToHistory();

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
                                        // Crée un overlay basique pour les corrections ligne par ligne
                                        if (config.correctionType === 'capitalize') {
                                            // Pour les majuscules, on surligne les premières lettres de chaque ligne qui ont été changées
                                            const capitalizePattern = /^[a-z]/gm;
                                            createTextareaReplacementOverlay(currentActiveEditor, originalText, newText, capitalizePattern);
                                        }
                                        // Note : Pour removePunctuation et spacing, le surlignage est complexe car ce sont des suppressions/ajouts
                                        // On pourrait l'ajouter plus tard avec un algorithme de diff plus sophistiqué
                                    }
                                    correctionsCount = count;
                                } else if (currentEditorType === 'div') {
                                    correctionsCount = applyTextTransformToDivEditor(currentActiveEditor, correctionFunction);
                                }
                                if (correctionsCount > 0) showFeedbackMessage(`${correctionsCount} ${feedbackLabel} corrigé(s) !`, 3000, shortcutsContainerElement);
                                else showFeedbackMessage(`Aucune correction de ${feedbackLabel} nécessaire.`, 2000, shortcutsContainerElement);
                            }
                        } else if (config.action === 'globalTextFix') {
                            // Version avec prévisualisation (mode validation)
                            (async () => {
                                try {
                                    const originalText = currentEditorType === 'textarea'
                                        ? currentActiveEditor.value
                                        : currentActiveEditor.textContent || '';

                                    // Calcule les corrections avec barre de progression
                                    const result = await applyAllTextCorrectionsAsync(originalText);

                                    // Cache la barre de progression
                                    hideProgress();

                                    if (result.correctionsCount === 0) {
                                        showFeedbackMessage("Aucune correction de texte globale n'était nécessaire.", 2000, shortcutsContainerElement);

                                        // Vérifie quand même les brackets même s'il n'y a pas de corrections textuelles
                                        const editorRef = currentActiveEditor;
                                        const editorTypeRef = currentEditorType;

                                        console.log('[GFT] Vérification des brackets (cas sans correction)...');
                                        console.log('[GFT] editorRef:', editorRef);
                                        console.log('[GFT] editorTypeRef:', editorTypeRef);

                                        if (editorRef) {
                                            const unmatchedCount = highlightUnmatchedBracketsInEditor(editorRef, editorTypeRef);
                                            console.log('[GFT] unmatchedCount:', unmatchedCount);

                                            // Affiche le résultat après un délai
                                            setTimeout(() => {
                                                if (unmatchedCount > 0) {
                                                    const pluriel = unmatchedCount > 1 ? 's' : '';
                                                    showFeedbackMessage(
                                                        `⚠️ ${unmatchedCount} parenthèse${pluriel}/crochet${pluriel} non apparié${pluriel} détecté${pluriel} et surligné${pluriel} en rouge !`,
                                                        5000,
                                                        shortcutsContainerElement
                                                    );
                                                } else {
                                                    showFeedbackMessage(
                                                        "✅ Toutes les parenthèses et crochets sont bien appariés.",
                                                        3000,
                                                        shortcutsContainerElement
                                                    );
                                                }
                                            }, 2100);
                                        } else {
                                            console.log('[GFT] editorRef est null, impossible de vérifier les brackets');
                                        }
                                        return;
                                    }

                                    // Capture les références de l'éditeur pour les callbacks
                                    const editorRef = currentActiveEditor;
                                    const editorTypeRef = currentEditorType;

                                    // Affiche la prévisualisation
                                    showCorrectionPreview(
                                        originalText,
                                        result.newText,
                                        result.corrections,
                                        // Callback si l'utilisateur applique
                                        () => {
                                            // Sauvegarde dans l'historique
                                            saveToHistory();

                                            // Applique les corrections
                                            if (editorTypeRef === 'textarea') {
                                                editorRef.value = result.newText;
                                                editorRef.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
                                            } else if (editorTypeRef === 'div') {
                                                setEditorContent(result.newText);
                                            }

                                            // Construit le message de feedback
                                            const detailsArray = [];
                                            if (result.corrections.yPrime > 0) detailsArray.push(`${result.corrections.yPrime} "y'"`);
                                            if (result.corrections.apostrophes > 0) detailsArray.push(`${result.corrections.apostrophes} apostrophe(s)`);
                                            if (result.corrections.oeuLigature > 0) detailsArray.push(`${result.corrections.oeuLigature} "oeu"`);
                                            if (result.corrections.capitalization > 0) detailsArray.push(`${result.corrections.capitalization} majuscule(s)`);
                                            if (result.corrections.punctuation > 0) detailsArray.push(`${result.corrections.punctuation} ponctuation(s)`);
                                            if (result.corrections.spacing > 0) detailsArray.push(`${result.corrections.spacing} espacement(s)`);

                                            const message = detailsArray.length > 0
                                                ? `✅ Corrigé : ${detailsArray.join(', ')} (${result.correctionsCount} au total)`
                                                : `${result.correctionsCount} correction(s) appliquée(s)`;

                                            showFeedbackMessage(message, 4500, shortcutsContainerElement);

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
                                                        const pluriel = unmatchedCount > 1 ? 's' : '';
                                                        showFeedbackMessage(
                                                            `⚠️ ${unmatchedCount} parenthèse${pluriel}/crochet${pluriel} non apparié${pluriel} détecté${pluriel} et surligné${pluriel} en rouge !`,
                                                            5000,
                                                            shortcutsContainerElement
                                                        );
                                                    } else {
                                                        showFeedbackMessage(
                                                            "✅ Toutes les parenthèses et crochets sont bien appariés.",
                                                            3000,
                                                            shortcutsContainerElement
                                                        );
                                                    }
                                                }, 4600);
                                            } else {
                                                console.log('[GFT] editorRef est null, impossible de vérifier les brackets');
                                            }
                                        },
                                        // Callback si l'utilisateur annule
                                        () => {
                                            showFeedbackMessage("Corrections annulées", 2000, shortcutsContainerElement);
                                        }
                                    );
                                } catch (error) {
                                    hideProgress();
                                    console.error('Erreur lors des corrections:', error);
                                    showFeedbackMessage("❌ Erreur lors des corrections", 3000, shortcutsContainerElement);
                                }
                            })();
                        } else if (config.action === 'checkBrackets') {
                            // Vérifie et surligne les parenthèses et crochets non appariés
                            const unmatchedCount = highlightUnmatchedBracketsInEditor(currentActiveEditor, currentEditorType);

                            if (unmatchedCount > 0) {
                                const pluriel = unmatchedCount > 1 ? 's' : '';
                                showFeedbackMessage(
                                    `⚠️ ${unmatchedCount} parenthèse${pluriel}/crochet${pluriel} non apparié${pluriel} trouvé${pluriel} et surligné${pluriel} en rouge !`,
                                    5000,
                                    shortcutsContainerElement
                                );
                            } else {
                                showFeedbackMessage(
                                    "✅ Aucun problème trouvé ! Toutes les parenthèses et crochets sont bien appariés.",
                                    3000,
                                    shortcutsContainerElement
                                );
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
                                // Sauvegarde dans l'historique avant insertion
                                saveToHistory();
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

                        // Restaure la position du curseur pour éviter le "jumpscare" du scroll
                        if (currentEditorType === 'textarea' && savedCursorStart !== null && savedCursorEnd !== null) {
                            currentActiveEditor.setSelectionRange(savedCursorStart, savedCursorEnd);
                        }

                        currentActiveEditor.focus();

                        // Désactive le flag après un court délai et met à jour lastSavedContent
                        setTimeout(() => {
                            isButtonActionInProgress = false;
                            if (currentActiveEditor) {
                                lastSavedContent = getCurrentEditorContent();
                                hasUnsavedChanges = false;
                            }
                        }, 150);
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
                                    if (btn) btn.textContent = shortcut.main.getLabel();
                                });
                                createButton(shortcut.main, groupDiv, true);
                                createButton(shortcut.next, groupDiv).addEventListener('click', (e) => {
                                    e.stopPropagation();
                                    coupletCounter++;
                                    let btn = document.getElementById(COUPLET_BUTTON_ID);
                                    if (btn) btn.textContent = shortcut.main.getLabel();
                                });
                            } else {
                                createButton(shortcut, groupDiv);
                            }
                        });
                        buttonGroupsContainer.appendChild(groupDiv);
                    });
                }

                if (SHORTCUTS.TEXT_CLEANUP && SHORTCUTS.TEXT_CLEANUP.length > 0) { const hr = document.createElement('hr'); shortcutsContainerElement.appendChild(hr); const div = document.createElement('div'); SHORTCUTS.TEXT_CLEANUP.forEach(s => createButton(s, div)); shortcutsContainerElement.appendChild(div); }

                if (SHORTCUTS.GLOBAL_FIXES && SHORTCUTS.GLOBAL_FIXES.length > 0) {
                    const hrGlobal = document.createElement('hr'); shortcutsContainerElement.appendChild(hrGlobal);
                    const globalFixesDiv = document.createElement('div');
                    SHORTCUTS.GLOBAL_FIXES.forEach(s => createButton(s, globalFixesDiv));
                    shortcutsContainerElement.appendChild(globalFixesDiv);
                }

                // Ajoute le footer avec le crédit et la version
                const footerContainer = document.createElement('div');
                footerContainer.id = 'gft-footer-container';
                footerContainer.style.display = 'flex';
                footerContainer.style.justifyContent = 'space-between';
                footerContainer.style.alignItems = 'center';
                footerContainer.style.marginTop = '8px';

                const creditLabel = document.createElement('div');
                creditLabel.id = 'gft-credit-label';
                creditLabel.textContent = 'Made with ❤️ by Lnkhey';
                creditLabel.style.fontSize = '10px';
                creditLabel.style.color = '#888';
                creditLabel.style.opacity = '0.6';
                creditLabel.style.userSelect = 'none';

                const versionLabel = document.createElement('div');
                versionLabel.id = 'gft-version-label';
                versionLabel.textContent = 'v2.5';
                versionLabel.title = 'Genius Fast Transcriber version 2.5 - Fix : Curseur ne saute plus à la fin + Surlignage majuscules';

                footerContainer.appendChild(creditLabel);
                footerContainer.appendChild(versionLabel);
                shortcutsContainerElement.appendChild(footerContainer);

                // 4. Injecte le panneau complet dans la page.
                targetStickySection.prepend(shortcutsContainerElement);

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
                    const artistSelContainer = shortcutsContainerElement.querySelector(`#${ARTIST_SELECTOR_CONTAINER_ID}`);
                    if (artistSelContainer && artistSelContainer.parentNode) createArtistSelectors(artistSelContainer.parentNode);
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
        if (editorAppeared || controlsAppeared || (!currentActiveEditor && editorNowExistsInDOM) || editorVanished) {
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

    // Si on est sur une page de chanson (même sans éditeur), on extrait les métadonnées et on prépare la toolbar
    const isSongPage = document.querySelector('meta[property="og:type"][content="music.song"]') !== null || window.location.pathname.includes('-lyrics');
    if (isSongPage) {
        extractSongData();
        createFloatingFormattingToolbar();
    }
}

// ----- Démarrage du Script -----

// Gère le chargement initial de la page.
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startObserver);
else startObserver();

// Ajoute des écouteurs d'événements pour gérer la navigation SPA.
window.addEventListener('load', initLyricsEditorEnhancer);
window.addEventListener('popstate', initLyricsEditorEnhancer);
window.addEventListener('hashchange', initLyricsEditorEnhancer);

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
    if (observer && typeof observer.disconnect === 'function') observer.disconnect();
    if (shortcutsContainerElement) shortcutsContainerElement.remove();
    if (floatingFormattingToolbar) floatingFormattingToolbar.remove();
    delete window._gftLastPageTitle;
});

// ----- Fonctions pour la Lyrics Card -----

/**
 * Génère une "Lyric Card" à partir du texte sélectionné.
 */
function generateLyricsCard() {
    const selection = window.getSelection();
    if (!selection || selection.toString().trim().length === 0) {
        showFeedbackMessage("Veuillez sélectionner du texte pour créer une Lyric Card.");
        return;
    }

    const text = selection.toString().trim();
    const songTitle = currentSongTitle || "Titre Inconnu";
    const artistName = currentMainArtists.length > 0 ? currentMainArtists.join(' & ') : "Artiste Inconnu";

    // Récupère les URLs potentielles pour l'image de couverture
    const candidateUrls = [];

    // 1. Meta tags
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage && ogImage.content) candidateUrls.push(ogImage.content);

    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (twitterImage && twitterImage.content) candidateUrls.push(twitterImage.content);

    // 2. Images dans le DOM (souvent plus fiables pour le CORS car déjà chargées par le navigateur, 
    // mais pour le canvas on a quand même besoin du crossOrigin)
    const headerImg = document.querySelector('div[class*="SongHeader"] img') || document.querySelector('img[class*="CoverArt"]');
    if (headerImg && headerImg.src) candidateUrls.push(headerImg.src);

    // Filtre les doublons
    const uniqueUrls = [...new Set(candidateUrls)];

    if (uniqueUrls.length === 0) {
        showFeedbackMessage("Impossible de trouver la pochette de l'album.");
        return;
    }

    showFeedbackMessage("Génération de la Lyric Card en cours...", 2000);

    // Fonction pour essayer de charger une image parmi la liste
    const loadFirstWorkingImage = (urls, onSuccess, onFailure) => {
        if (urls.length === 0) {
            onFailure();
            return;
        }

        let url = urls[0];
        // Ajoute un paramètre pour éviter le cache (cache-busting)
        // Cela force le navigateur à refaire une requête avec les bons headers CORS
        // au lieu d'utiliser une version cachée sans headers (qui cause l'erreur).
        const separator = url.includes('?') ? '&' : '?';
        const safeUrl = `${url}${separator}t=${Date.now()}`;

        const img = new Image();
        img.crossOrigin = "Anonymous";

        img.onload = () => onSuccess(img);
        img.onerror = () => {
            console.warn(`[GFT] Échec du chargement de l'image : ${safeUrl}. Tentative suivante...`);
            loadFirstWorkingImage(urls.slice(1), onSuccess, onFailure);
        };

        img.src = safeUrl;
    };

    loadFirstWorkingImage(uniqueUrls, (img) => {
        // Succès du chargement de l'image de couverture
        const logoImg = new Image();
        logoImg.crossOrigin = "Anonymous";

        // Logique de chargement du logo (inchangée)
        const dominantColor = getDominantColor(img);
        const contrastColor = getContrastColor(dominantColor); // 'black' ou 'white'

        const logoUrl = chrome.runtime.getURL(contrastColor === 'white' ? 'images/geniuslogowhite.png' : 'images/geniuslogoblack.png');

        logoImg.onload = () => {
            drawLyricsCard(text, artistName, songTitle, img, dominantColor, contrastColor, logoImg);
        };
        logoImg.onerror = () => {
            drawLyricsCard(text, artistName, songTitle, img, dominantColor, contrastColor, null);
        };
        logoImg.src = logoUrl;

    }, () => {
        // Échec total
        showFeedbackMessage("Erreur : Impossible de charger l'image de couverture (CORS ou URL invalide).");
    });
}

/**
 * Dessine la Lyric Card sur un canvas et déclenche le téléchargement.
 */
function drawLyricsCard(text, artistName, songTitle, imageObj, footerColor, textColor, logoObj) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const WIDTH = 1280;
    const HEIGHT = 720;
    const FOOTER_HEIGHT = 140; // Hauteur du footer (était 160)

    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    // 1. Dessine le fond (Image zoomée pour remplir)
    // On veut remplir 1280x(720-FOOTER_HEIGHT) ou tout le canvas ? Le user dit "le fond doit être la pochette du son zoomé pour fill"
    // Le footer est par dessus ou en dessous ? "un footer avec en bas à gauche..."
    // "le footer doit avoir un contour au dessus comme dans le screen"
    // On va dessiner l'image sur tout le canvas

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

    // 2. Dessine le Footer
    ctx.fillStyle = footerColor;
    ctx.fillRect(0, HEIGHT - FOOTER_HEIGHT, WIDTH, FOOTER_HEIGHT);

    // Contour au dessus du footer (blanc ou noir selon contraste ?) 
    // Le user dit "le footer doit avoir un contour au dessus comme dans le screen". Dans le screen c'est blanc fin.
    // Contour au dessus du footer
    // "le contour du footer doit être légèrement plus fin" -> 3px (était 4px)
    ctx.fillStyle = textColor; // 'black' ou 'white'
    ctx.fillRect(0, HEIGHT - FOOTER_HEIGHT, WIDTH, 3); // Ligne de 3px

    // 3. Texte Artiste / Titre (Bas Gauche du Footer)
    // "la font doit être plus fine" -> normal (était bold)
    ctx.font = 'normal 28px "Programme", "Arial", sans-serif';
    ctx.fillStyle = textColor;
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = "2px"; // Espacement plus grand
    const footerText = `${artistName.toUpperCase()}, "${songTitle.toUpperCase()}"`;
    ctx.fillText(footerText, 60, HEIGHT - (FOOTER_HEIGHT / 2));
    ctx.letterSpacing = "0px"; // Reset pour la suite

    // 4. Logo GENIUS (Bas Droite du Footer)
    if (logoObj) {
        // Dimensions du logo : ratio à conserver
        // Supposons que le logo est rectangulaire large.
        // On veut une hauteur d'environ 40px ?
        const logoHeight = 40;
        const logoWidth = logoObj.width * (logoHeight / logoObj.height);
        ctx.drawImage(logoObj, WIDTH - 60 - logoWidth, HEIGHT - (FOOTER_HEIGHT / 2) - (logoHeight / 2), logoWidth, logoHeight);
    } else {
        // Fallback texte
        ctx.save();
        ctx.textAlign = 'right';
        ctx.font = '900 36px "Programme", "Arial Black", sans-serif';
        ctx.letterSpacing = "4px";
        ctx.fillStyle = textColor;
        ctx.fillText("G E N I U S", WIDTH - 60, HEIGHT - (FOOTER_HEIGHT / 2));
        ctx.restore();
    }

    // 5. Dessine les paroles (Au dessus du footer, aligné à gauche)
    // "par dessus en bas à gauche il doit y avoir le texte sélectionné avec une couleur de surlignage en fond carré"
    // "le surlignage doivent prendre la couleur noire ou blanche selon la luminosité de la cover"

    // On doit wrapper le texte
    const maxTextWidth = WIDTH - 120; // Marges
    const fontSize = 48;
    const lineHeight = 80; // Plus d'espace entre les lignes (était 64)
    // "fontweight plus légère" -> 300 (Light)
    ctx.font = `300 ${fontSize}px "Programme", "Arial", sans-serif`;

    // Respecter les sauts de ligne originaux
    const originalLines = text.split(/\r?\n/);
    const lines = [];

    originalLines.forEach(originalLine => {
        const trimmedLine = originalLine.trim();
        if (!trimmedLine) return; // Ignorer les lignes vides

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

    // Positionnement du texte : au dessus du footer, avec une marge
    const textBottomMargin = 35; // Descendre un peu le texte (était 40)
    let startY = HEIGHT - FOOTER_HEIGHT - textBottomMargin - (lines.length * lineHeight);

    // Couleur de fond du texte (opposé du texte)
    // "le texte et le surlignage doivent prendre la couleur noire ou blanche selon la luminosité de la cover"
    // C'est un peu ambigu. Dans l'exemple : Fond noir (texte blanc) sur l'image.
    // Donc si l'image est claire -> Fond noir, texte blanc.
    // Si l'image est sombre -> Fond blanc, texte noir ? Ou toujours fond noir texte blanc ?
    // Le user dit "selon la luminosité de la cover (sinon illisible)".
    // Donc on va calculer la luminosité moyenne de la zone où le texte s'affiche ? Ou globale ?
    // Simplification : On utilise le contraste global de l'image (calculé pour le footer déjà, mais on peut réutiliser).
    // Si dominantColor est sombre -> textColor est blanc.
    // Donc on fait : Fond du texte = textColor (ex: Blanc), Texte = dominantColor (ex: Sombre) ?
    // Non, généralement c'est Fond = Noir, Texte = Blanc OU Fond = Blanc, Texte = Noir.
    // Si textColor est 'white' (donc fond sombre), on met Fond Texte = Noir, Texte = Blanc.
    // Si textColor est 'black' (donc fond clair), on met Fond Texte = Blanc, Texte = Noir.

    // "si tu as choisis que le texte du footer sois blanc, il faut que les lyrics soient écrits en noirs avec un fond blanc"
    // textColor est la couleur du texte du footer (et du logo/border).
    // Si textColor === 'white' (donc fond sombre), on veut Lyrics: Noir sur Blanc.
    // Si textColor === 'black' (donc fond clair), on veut Lyrics: Blanc sur Noir (pour garder le contraste/style inversé).

    const lyricsBackgroundColor = textColor === 'white' ? 'white' : 'black';
    const lyricsTextColor = textColor === 'white' ? 'black' : 'white';

    lines.forEach((line, index) => {
        const y = startY + (index * lineHeight);
        const lineWidth = ctx.measureText(line).width;
        const padding = 10;

        // Fond du texte
        // "le surlignage n'est pas très bon... il devrait descendre plus bas"
        // On augmente la hauteur du rectangle vers le bas.
        // y est la baseline du texte.
        // fontSize est 48.
        // On dessine le rect de y - fontSize + correction jusqu'à y + descente.

        const rectTop = y - fontSize + 12; // Un peu plus bas que le top absolu de la font
        const rectHeight = fontSize + 24; // Plus haut pour descendre bien sous la baseline

        ctx.fillStyle = lyricsBackgroundColor;
        ctx.fillRect(60 - padding, rectTop, lineWidth + (padding * 2), rectHeight);

        // Texte
        ctx.fillStyle = lyricsTextColor;
        ctx.fillText(line, 60, y);
    });

    // Téléchargement
    const link = document.createElement('a');
    link.download = `lyrics_card_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

/**
 * Calcule la couleur dominante d'une image.
 * Version simplifiée : moyenne des pixels du centre.
 */
function getDominantColor(img) {
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

    // Calcul de la luminosité (YIQ)
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? 'black' : 'white';
}