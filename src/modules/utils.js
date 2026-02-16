// Auto-extracted from content.js — Utility Functions
// Includes: i18n (formatListWithConjunction, getPluralForm, getTranslation),
// HTML entity decoding, artist name cleaning, regex escaping,
// and number-to-words converters (FR, EN, PL).

import { TRANSLATIONS } from '../translations/index.js';

function formatListWithConjunction(items, lang) {
    if (items.length === 0) return "";
    if (items.length === 1) return items[0];

    // Utilisation de Intl.ListFormat si disponible
    if (typeof Intl !== 'undefined' && Intl.ListFormat) {
        try {
            const formatter = new Intl.ListFormat(lang, { style: 'long', type: 'conjunction' });
            return formatter.format(items);
        } catch (e) {
            console.warn("[GFT] Intl.ListFormat failed, falling back to manual join.", e);
        }
    }

    // Fallback manuel
    const lastItem = items.pop();
    const conjunctions = {
        'fr': ' et ',
        'en': ' and ',
        'pl': ' i '
    };
    const conj = conjunctions[lang] || conjunctions['fr'];
    return items.join(', ') + conj + lastItem;
}

/**
 * Détermine l'index de la forme plurielle pour une langue et un nombre donnés.
 * @param {number} count - Le nombre.
 * @param {string} lang - La langue ('fr', 'en', 'pl').
 * @returns {number} L'index de la forme (0, 1, 2...).
 */
function getPluralForm(count, lang) {
    const c = Math.abs(count);
    if (lang === 'pl') {
        if (c === 1) return 0; // Singulier (1)
        if (c % 10 >= 2 && c % 10 <= 4 && (c % 100 < 12 || c % 100 > 14)) return 1; // Paucal (2-4, 22-24...)
        return 2; // Pluriel (5-21, 25-31...)
    }
    // Règles par défaut (FR/EN)
    if (lang === 'fr') return c > 1 ? 1 : 0; // 0, 1 -> sing, 2+ -> pluriel
    return c === 1 ? 0 : 1; // EN: 1 -> sing, 0, 2+ -> pluriel
}

/**
 * Récupère la traduction pour une clé donnée selon la langue préférée.
 * Supporte le pluriel si un nombre `count` est fourni et que la valeur contient des séparateurs '|'.
 * @param {string} key - La clé de traduction.
 * @param {number} [count] - Le nombre pour, déterminer la forme plurielle.
 * @returns {string} Le texte traduit.
 */
function getTranslation(key, count = null) {
    const lang = localStorage.getItem('gftLanguage') || 'fr'; // 'fr' par défaut
    let val = (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || TRANSLATIONS['fr'][key] || key;

    // Gestion du pluriel complexe (ex: "Singulier|Paucal|Pluriel")
    if (count !== null && typeof val === 'string' && val.includes('|')) {
        const parts = val.split('|').map(s => s.trim());
        const formIndex = getPluralForm(count, lang);
        // Si l'index dépasse, on prend la dernière forme disponible
        return parts[formIndex] || parts[parts.length - 1];
    }

    return val;
}

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
    // Regex pour enlever les suffixes courants comme (FRA), (FR), (UK), (US), (Feat. ...), etc.
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
 * Convertit un nombre (0-999999999999) en lettres en anglais.
 * @param {number} num - Le nombre à convertir.
 * @returns {string} Le nombre en lettres.
 */
function numberToEnglishWords(num) {
    if (num === 0) return "zero";

    const ones = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
    const teens = ["ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
    const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

    function convertUpTo99(n) {
        if (n < 10) return ones[n];
        if (n < 20) return teens[n - 10];

        const ten = Math.floor(n / 10);
        const one = n % 10;

        if (one === 0) return tens[ten];
        return tens[ten] + "-" + ones[one];
    }

    function convertUpTo999(n) {
        if (n < 100) return convertUpTo99(n);

        const hundred = Math.floor(n / 100);
        const rest = n % 100;

        let result = ones[hundred] + " hundred";
        if (rest > 0) {
            result += " " + convertUpTo99(rest);
        }
        return result;
    }

    if (num < 0 || num > 999999999999) return num.toString();

    if (num < 1000) return convertUpTo999(num);

    if (num >= 1000000000) {
        const billions = Math.floor(num / 1000000000);
        const rest = num % 1000000000;
        let result = convertUpTo999(billions) + " billion";
        if (rest > 0) result += " " + numberToEnglishWords(rest);
        return result;
    }

    if (num >= 1000000) {
        const millions = Math.floor(num / 1000000);
        const rest = num % 1000000;
        let result = convertUpTo999(millions) + " million";
        if (rest > 0) result += " " + numberToEnglishWords(rest);
        return result;
    }

    const thousand = Math.floor(num / 1000);
    const rest = num % 1000;

    let result = convertUpTo999(thousand) + " thousand";
    if (rest > 0) result += " " + convertUpTo999(rest);

    return result;
}

/**
 * Convertit un nombre (0-999999999999) en lettres en polonais.
 * @param {number} num - Le nombre à convertir.
 * @returns {string} Le nombre en lettres.
 */
function numberToPolishWords(num) {
    if (num === 0) return "zero";

    const ones = ["", "jeden", "dwa", "trzy", "cztery", "pięć", "sześć", "siedem", "osiem", "dziewięć"];
    const teens = ["dziesięć", "jedenaście", "dwanaście", "trzynaście", "czternaście", "piętnaście", "szesnaście", "siedemnaście", "osiemnaście", "dziewiętnaście"];
    const tens = ["", "", "dwadzieścia", "trzydzieści", "czterdzieści", "pięćdziesiąt", "sześćdziesiąt", "siedemdziesiąt", "osiemdziesiąt", "dziewięćdziesiąt"];
    const hundreds = ["", "sto", "dwieście", "trzysta", "czterysta", "pięćset", "sześćset", "siedemset", "osiemset", "dziewięćset"];

    function convertUpTo99(n) {
        if (n < 10) return ones[n];
        if (n < 20) return teens[n - 10];

        const ten = Math.floor(n / 10);
        const one = n % 10;

        if (one === 0) return tens[ten];
        return tens[ten] + " " + ones[one];
    }

    function convertUpTo999(n) {
        if (n < 100) return convertUpTo99(n);

        const hundred = Math.floor(n / 100);
        const rest = n % 100;

        let result = hundreds[hundred];
        if (rest > 0) {
            result += " " + convertUpTo99(rest);
        }
        return result;
    }

    // Polish thousand forms: tysiąc, tysiące, tysięcy
    function getThousandForm(n) {
        if (n === 1) return "tysiąc";
        const lastDigit = n % 10;
        const lastTwoDigits = n % 100;
        if (lastTwoDigits >= 12 && lastTwoDigits <= 14) return "tysięcy";
        if (lastDigit >= 2 && lastDigit <= 4) return "tysiące";
        return "tysięcy";
    }

    // Polish million forms: milion, miliony, milionów
    function getMillionForm(n) {
        if (n === 1) return "milion";
        const lastDigit = n % 10;
        const lastTwoDigits = n % 100;
        if (lastTwoDigits >= 12 && lastTwoDigits <= 14) return "milionów";
        if (lastDigit >= 2 && lastDigit <= 4) return "miliony";
        return "milionów";
    }

    // Polish billion forms: miliard, miliardy, miliardów
    function getBillionForm(n) {
        if (n === 1) return "miliard";
        const lastDigit = n % 10;
        const lastTwoDigits = n % 100;
        if (lastTwoDigits >= 12 && lastTwoDigits <= 14) return "miliardów";
        if (lastDigit >= 2 && lastDigit <= 4) return "miliardy";
        return "miliardów";
    }

    if (num < 0 || num > 999999999999) return num.toString();

    if (num < 1000) return convertUpTo999(num);

    if (num >= 1000000000) {
        const billions = Math.floor(num / 1000000000);
        const rest = num % 1000000000;
        let result = (billions === 1 ? "" : convertUpTo999(billions) + " ") + getBillionForm(billions);
        if (rest > 0) result += " " + numberToPolishWords(rest);
        return result.trim();
    }

    if (num >= 1000000) {
        const millions = Math.floor(num / 1000000);
        const rest = num % 1000000;
        let result = (millions === 1 ? "" : convertUpTo999(millions) + " ") + getMillionForm(millions);
        if (rest > 0) result += " " + numberToPolishWords(rest);
        return result.trim();
    }

    const thousand = Math.floor(num / 1000);
    const rest = num % 1000;

    let result = (thousand === 1 ? "" : convertUpTo999(thousand) + " ") + getThousandForm(thousand);
    if (rest > 0) result += " " + convertUpTo999(rest);

    return result.trim();
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

export {
    formatListWithConjunction,
    getPluralForm,
    getTranslation,
    decodeHtmlEntities,
    cleanArtistName,
    escapeRegExp,
    formatArtistList,
    numberToFrenchWords,
    numberToEnglishWords,
    numberToPolishWords,
    isValidNumber,
    extractArtistsFromMetaContent,
};
