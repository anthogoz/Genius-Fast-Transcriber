import {
    GFT_STATE,
    SELECTORS
} from './constants.js';
import {
    extractArtistsFromMetaContent,
    decodeHtmlEntities,
    formatArtistList,
    cleanArtistName,
    escapeRegExp
} from './utils.js';

/**
 * Main function to extract all song data (title, artists) from the page.
 * Uses multiple strategies (meta tags, HTML elements) for robustness.
 * @returns {object} The extracted song data.
 */
export function extractSongData() {
    const songData = {
        title: null,
        mainArtists: [],
        featuringArtists: [],
        _rawMainArtists: [],
        _rawFeaturingArtistsFromSection: [],
        _rawFeaturingArtistsFromTitleExtract: []
    };

    let rawTitleText = null;
    let artistsFromMeta = { main: [], ft: [] };

    // 1. Attempt extraction from meta tags (most reliable)
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

    // 2. Fallback selectors if meta tags didn't provide artists
    if (songData._rawMainArtists.length === 0) {
        const mainArtistsContainer = document.querySelector(SELECTORS.MAIN_ARTISTS_CONTAINER_FALLBACK);
        if (mainArtistsContainer) {
            mainArtistsContainer.querySelectorAll(SELECTORS.MAIN_ARTIST_LINK_IN_CONTAINER_FALLBACK).forEach(link => {
                const n = link.textContent.trim();
                if (n && !songData._rawMainArtists.includes(n)) songData._rawMainArtists.push(n);
            });
        } else {
            document.querySelectorAll(SELECTORS.FALLBACK_MAIN_ARTIST_LINKS_FALLBACK).forEach(link => {
                const n = link.textContent.trim();
                if (n && !songData._rawMainArtists.includes(n)) songData._rawMainArtists.push(n);
            });
        }
    }

    // 3. Extract artists from "Credits" section if it exists
    document.querySelectorAll(SELECTORS.CREDITS_PAGE_ARTIST_LIST_CONTAINER).forEach(listContainer => {
        const lt = listContainer.previousElementSibling;
        let isFt = false;
        if (lt) {
            const txt = lt.textContent.trim().toLowerCase();
            // Stricter check: only accept if header explicitly mentions featuring/feat/avec
            if (txt.includes('featuring') || txt.includes('feat') || txt.includes('avec')) {
                isFt = true;
            }
        }

        if (isFt) {
            listContainer.querySelectorAll(SELECTORS.CREDITS_PAGE_ARTIST_NAME_IN_LINK).forEach(s => {
                const n = s.textContent.trim();
                // Avoid adding main artists again
                if (n && !songData._rawFeaturingArtistsFromSection.includes(n) && !songData._rawMainArtists.includes(n)) {
                    songData._rawFeaturingArtistsFromSection.push(n);
                }
            });
        }
    });

    // 4. Extract song title if not found via meta
    if (!rawTitleText) {
        for (const sel of SELECTORS.TITLE) {
            const el = document.querySelector(sel);
            if (el) {
                rawTitleText = el.textContent;
                if (rawTitleText) break;
            }
        }
    }

    // 5. Clean up and finalize extracted data
    if (rawTitleText) {
        let ttc = decodeHtmlEntities(rawTitleText.trim()).replace(/\s+Lyrics$/i, '').trim();
        if (artistsFromMeta.main.length === 0 && songData._rawMainArtists.length > 0) {
            const blk = formatArtistList(songData._rawMainArtists.map(a => cleanArtistName(a)));
            if (blk) {
                const esc = escapeRegExp(blk);
                let m = ttc.match(new RegExp(`^${esc}\\s*-\\s*(.+)$`, 'i'));
                if (m && m[1]) ttc = m[1].trim();
                else {
                    m = ttc.match(new RegExp(`^(.+?)\\s*-\\s*${esc}$`, 'i'));
                    if (m && m[1]) ttc = m[1].trim();
                }
            }
        }
        ttc = ttc.replace(/\s*\((?:Ft\.|Featuring)[^)]+\)\s*/gi, ' ').trim().replace(/^[\s,-]+|[\s,-]+$/g, '').replace(/\s\s+/g, ' ');
        songData.title = ttc;
    }

    if (!songData.title || songData.title.length === 0) songData.title = "TITRE INCONNU";
    songData.mainArtists = [...new Set(songData._rawMainArtists.map(name => cleanArtistName(name)))].filter(Boolean);

    let finalFeaturingArtists = [];
    const seenCleanedFtNamesForDeduplication = new Set();

    // Priority to featuring artists from title, then credits section
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

    // 6. Update global state
    GFT_STATE.currentSongTitle = songData.title;
    GFT_STATE.currentMainArtists = [...songData.mainArtists];
    GFT_STATE.currentFeaturingArtists = [...songData.featuringArtists];
    GFT_STATE.detectedArtists = [...new Set([...GFT_STATE.currentMainArtists, ...GFT_STATE.currentFeaturingArtists])].filter(Boolean);

    return songData;
}
