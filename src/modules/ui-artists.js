import {
    GFT_STATE,
    ARTIST_SELECTOR_CONTAINER_ID
} from './constants.js';
import {
    getTranslation,
    formatArtistList
} from './utils.js';
import {
    isEnglishTranscriptionMode,
    isPolishTranscriptionMode,
    isTagNewlinesDisabled
} from './config.js';

/**
 * Creates and displays checkboxes for each detected artist.
 * Allows the user to attribute a lyrics section to one or more artists.
 * @param {HTMLElement} container - The parent element where selectors should be added.
 */
export function createArtistSelectors(container) {
    if (!container) {
        console.error("[createArtistSelectors] Erreur: Conteneur non fourni.");
        return;
    }

    const existingSelectorContainer = document.getElementById(ARTIST_SELECTOR_CONTAINER_ID);
    if (existingSelectorContainer) {
        existingSelectorContainer.remove();
    }

    const artistSelectorContainer = document.createElement('div');
    artistSelectorContainer.id = ARTIST_SELECTOR_CONTAINER_ID;
    artistSelectorContainer.style.display = 'flex';
    artistSelectorContainer.style.flexWrap = 'wrap';
    artistSelectorContainer.style.gap = '2px 10px';
    artistSelectorContainer.style.alignItems = 'center';

    const title = document.createElement('p');
    title.textContent = getTranslation('artist_selection');
    title.style.width = '100%';
    title.style.margin = '0 0 1px 0';
    artistSelectorContainer.appendChild(title);

    if (!GFT_STATE.detectedArtists || GFT_STATE.detectedArtists.length === 0) {
        const noArtistsMsg = document.createElement('span');
        noArtistsMsg.textContent = getTranslation('no_artist');
        noArtistsMsg.style.fontStyle = 'italic';
        artistSelectorContainer.appendChild(noArtistsMsg);
    } else {
        GFT_STATE.detectedArtists.forEach((artistName, index) => {
            const artistId = `artist_checkbox_${index}_${artistName.replace(/[^a-zA-Z0-9]/g, "")}_GFT`;
            const wrapper = document.createElement('span');
            const checkbox = document.createElement('input');
            Object.assign(checkbox, {
                type: 'checkbox',
                name: 'selectedGeniusArtist_checkbox_GFT',
                value: artistName,
                id: artistId
            });
            wrapper.appendChild(checkbox);

            const label = document.createElement('label');
            label.htmlFor = artistId;
            label.textContent = artistName;
            label.style.marginLeft = '3px';
            wrapper.appendChild(label);

            artistSelectorContainer.appendChild(wrapper);
        });
    }

    container.appendChild(artistSelectorContainer);
}

/**
 * Formats a simple tag with or without newline.
 * @param {string} tag - The tag to format (e.g. "[Instrumental]").
 * @param {boolean} forceNoNewline - If true, skip newline.
 * @returns {string} Formatted tag.
 */
export function formatSimpleTag(tag, forceNoNewline = false) {
    if (forceNoNewline) return tag;
    return isTagNewlinesDisabled() ? tag : `${tag}\n`;
}

/**
 * Adds selected artist names to a tag text.

 * @param {string} baseTextWithBrackets - e.g., "[Verse 1]"
 * @returns {string} - e.g., "[Verse 1 : Artist Name]"
 */
export function addArtistToText(baseTextWithBrackets) {
    const checkedArtistsCheckboxes = document.querySelectorAll('input[name="selectedGeniusArtist_checkbox_GFT"]:checked');
    const selectedArtistNames = Array.from(checkedArtistsCheckboxes).map(cb => cb.value.trim()).filter(Boolean);
    let resultText;

    if (selectedArtistNames.length > 0) {
        const tagPart = baseTextWithBrackets.slice(0, -1); // Remove final ']'
        const artistsString = formatArtistList(selectedArtistNames);
        // Spacing varies by language
        const separator = (isEnglishTranscriptionMode() || isPolishTranscriptionMode()) ? ': ' : ' : ';
        resultText = `${tagPart}${separator}${artistsString}]`;
    } else {
        resultText = baseTextWithBrackets;
    }

    if (!isTagNewlinesDisabled()) {
        resultText += '\n';
    }

    return resultText;
}
