import type { ExportOptions } from '@/types';
import { isSectionTag } from './corrections';

function cleanLyricsText(text: string): string {
  if (!text) return '';

  let cleaned = text;
  cleaned = cleaned.replace(/<[^>]*>/g, '');
  cleaned = cleaned.replace(/\[\[(.*?)\]\]\(.*?\)/g, '$1');
  cleaned = cleaned.replace(
    /\[((?!.*?\bVerse\b|.*?Chorus\b|.*?Intro\b|.*?Bridge\b).*?)\]\(.*?\)/g,
    '$1',
  );

  return cleaned;
}

export function exportToTxt(text: string, filename: string, options: ExportOptions = {}): void {
  let processedText = cleanLyricsText(text);
  let lines = processedText.split(/\r?\n/);

  if (options.removeTags) {
    lines = lines.filter((line) => !isSectionTag(line));
  }

  if (options.removeSpacing) {
    lines = lines.filter((line) => line.trim() !== '');
  }

  processedText = lines.join('\n').trim();

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
