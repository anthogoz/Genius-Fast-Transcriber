/**
 * Logic for exporting lyrics to a .txt file.
 * Handles formatting based on user preferences (tags, spacing).
 * Now includes advanced cleaning for HTML and Genius annotations.
 */

import { isSectionTag } from './corrections.js';

/**
 * Strips HTML tags and resolves Genius annotations.
 * Example: "[[Text]](123)" -> "Text", "<i>Text</i>" -> "Text"
 * @param {string} text - The raw text to clean.
 * @returns {string} Cleaned text.
 */
function cleanLyricsText(text) {
    if (!text) return "";

    let cleaned = text;

    // 1. Strip HTML tags (e.g., <i>, <br>, <div>)
    cleaned = cleaned.replace(/<[^>]*>/g, '');

    // 2. Resolve Genius annotations
    // Pattern [[Text]](id)
    cleaned = cleaned.replace(/\[\[(.*?)\]\]\(.*?\)/g, '$1');
    // Pattern [Text](id)
    cleaned = cleaned.replace(/\[((?!.*?\bVerse\b|.*?Chorus\b|.*?Intro\b|.*?Bridge\b).*?)\]\(.*?\)/g, '$1');

    return cleaned;
}

/**
 * Triggers a download of the lyrics as a .txt file.
 * @param {string} text - The lyrics text to export.
 * @param {string} filename - The name of the file to save.
 * @param {object} options - Export options.
 * @param {boolean} options.removeTags - Whether to remove structural tags like [Verse].
 * @param {boolean} options.removeSpacing - Whether to remove extra empty lines.
 */
export function exportToTxt(text, filename, options = {}) {
    // 0. Preliminary cleaning (HTML and Annotations)
    let processedText = cleanLyricsText(text);

    // 1. Split into lines for processing
    let lines = processedText.split(/\r?\n/);

    // 2. Filter lines based on options
    let filteredLines = lines;

    if (options.removeTags) {
        filteredLines = filteredLines.filter(line => !isSectionTag(line));
    }

    if (options.removeSpacing) {
        filteredLines = filteredLines.filter(line => line.trim() !== "");
    }

    processedText = filteredLines.join('\n').trim();

    // 3. Trigger download
    const blob = new Blob([processedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'lyrics.txt';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(url), 100);
}
