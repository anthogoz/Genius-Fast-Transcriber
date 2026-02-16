import {
    DISABLE_TAG_NEWLINES_STORAGE_KEY,
    LYRIC_CARD_ONLY_STORAGE_KEY,
    TRANSCRIPTION_MODE_STORAGE_KEY
} from './constants.js';

/**
 * Checks if automatic newline after tags is disabled.
 * @returns {boolean} true if disabled, false otherwise.
 */
export function isTagNewlinesDisabled() {
    return localStorage.getItem(DISABLE_TAG_NEWLINES_STORAGE_KEY) === 'true';
}

/**
 * Sets whether automatic newline after tags is disabled.
 * @param {boolean} disabled - true to disable, false to enable.
 */
export function setTagNewlinesDisabled(disabled) {
    localStorage.setItem(DISABLE_TAG_NEWLINES_STORAGE_KEY, disabled.toString());
}

/**
 * Checks if "Lyric Card Only" mode is enabled.
 * @returns {boolean} true if enabled.
 */
export function isLyricCardOnlyMode() {
    return localStorage.getItem(LYRIC_CARD_ONLY_STORAGE_KEY) === 'true';
}

/**
 * Sets "Lyric Card Only" mode.
 * @param {boolean} enabled - true to enable.
 */
export function setLyricCardOnlyMode(enabled) {
    localStorage.setItem(LYRIC_CARD_ONLY_STORAGE_KEY, enabled.toString());
}

/**
 * Gets the current transcription mode (fr, en, or pl).
 * Default is 'fr' if not set.
 * @returns {string} 'fr', 'en' or 'pl'
 */
export function getTranscriptionMode() {
    return localStorage.getItem(TRANSCRIPTION_MODE_STORAGE_KEY) || 'fr';
}

/**
 * Sets the transcription mode.
 * @param {string} mode - 'fr', 'en' or 'pl'
 */
export function setTranscriptionMode(mode) {
    localStorage.setItem(TRANSCRIPTION_MODE_STORAGE_KEY, mode);
}

/**
 * Helper to check if it's English transcription mode.
 * @returns {boolean}
 */
export function isEnglishTranscriptionMode() {
    return getTranscriptionMode() === 'en';
}

/**
 * Helper to check if it's Polish transcription mode.
 * @returns {boolean}
 */
export function isPolishTranscriptionMode() {
    return getTranscriptionMode() === 'pl';
}
