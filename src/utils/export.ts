import type { ExportOptions } from '@/types';
import { isSectionTag } from './corrections';

function cleanLyricsText(text: string): string {
  if (!text) return '';

  let cleaned = text;
  
  // Supprimer l'en-tête natif de Genius copié avec .innerText du type:
  // "16 Contributors\nVision Lyrics\n"
  cleaned = cleaned.replace(/^\d*\s*Contributors?\s*\n/i, '');
  
  // Supprimer la ligne "Titre Lyrics" qui apparait au tout début
  cleaned = cleaned.replace(/^.*?\sLyrics\s*\n/i, '');

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
