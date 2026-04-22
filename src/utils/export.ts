import type { ExportOptions } from '@/types';
import { isSectionTag } from './corrections';

function cleanLyricsText(text: string): string {
  if (!text) return '';

  let cleaned = text;

  // Supprimer les en-têtes natifs Genius présents avant les paroles.
  // Ces éléments peuvent être séparés par des \n (innerText) ou concaténés
  // sans séparateur (extractText DOM). Ex :
  //   "59 ContributorsTranslationsEnglishPériscope Lyrics[Paroles de...]"
  //   "16 Contributors\nTranslations\nPériscope Lyrics\n[Paroles de...]"
  // On utilise [^\[]* pour ne jamais franchir un crochet (début de tag section).
  cleaned = cleaned.replace(/^[^\[]*?\bLyrics\b\s*/i, '');

  cleaned = cleaned.replace(/<[^>]*>/g, '');
  cleaned = cleaned.replace(/\[\[(.*?)\]\]\(.*?\)/g, '$1');
  cleaned = cleaned.replace(
    /\[((?!.*?\bVerse\b|.*?Chorus\b|.*?Intro\b|.*?Bridge\b).*?)\]\(.*?\)/g,
    '$1',
  );

  return cleaned.trim();
}

export function processExportText(text: string, options: ExportOptions = {}): string {
  const processedText = cleanLyricsText(text);
  let lines = processedText.split(/\r?\n/);

  if (options.removeTags) {
    lines = lines.filter((line) => !isSectionTag(line));
  }

  if (options.removeSpacing) {
    lines = lines.filter((line) => line.trim() !== '');
  }

  return lines.join('\n').trim();
}

export function exportToTxt(text: string, filename: string, options: ExportOptions = {}): void {
  const processedText = processExportText(text, options);

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
