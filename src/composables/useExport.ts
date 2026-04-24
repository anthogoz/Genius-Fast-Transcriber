import type { ExportOptions } from '@/types';
import { exportToTxt, processExportText } from '@/utils/export';
import { SELECTORS } from './useSongData';
import { useEditor } from './useEditor';
import { useGftState } from './useGftState';

export function useExport() {
  const { currentSongTitle } = useGftState();
  const { getEditorContent } = useEditor();
  const { extractSongData } = useSongData();

  function getLyricsFromPage(): string {
    const containers = Array.from(
      document.querySelectorAll<HTMLElement>(SELECTORS.LYRICS_CONTAINER),
    );
    if (containers.length === 0) return '';

    // Walk the DOM tree to extract text properly:
    // - <br> -> newline
    // - Text nodes -> inline content (no spurious newlines)
    // - Inline elements (<a>, <span>, <i>, <b>) -> recurse into children
    // This avoids the `innerText` bug where the browser inserts \n between
    // adjacent inline elements (e.g. annotated <a> tags + plain text commas).
    function extractText(node: Node): string {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent ?? '';
      }

      if (node.nodeType !== Node.ELEMENT_NODE) return '';

      const el = node as HTMLElement;
      const tag = el.tagName;

      if (tag === 'BR') return '\n';

      // Skip hidden elements
      if (el.style.display === 'none' || el.hidden) return '';

      let result = '';
      for (const child of el.childNodes) {
        result += extractText(child);
      }
      return result;
    }

    return containers.map((container) => extractText(container).trim()).join('\n\n');
  }

  function exportLyrics(options: ExportOptions = {}) {
    const content = getEditorContent().trim() || getLyricsFromPage();
    if (!content.trim()) return;

    let title = currentSongTitle.value;
    if (!title || title === 'TITRE INCONNU') {
      title = extractSongData().title;
    }

    const filename = `${title} (GFT Export).txt`;
    exportToTxt(content, filename, options);
  }

  function exportStandard() {
    exportLyrics({});
  }

  function exportNoTags() {
    exportLyrics({ removeTags: true });
  }

  function exportNoSpacing() {
    exportLyrics({ removeSpacing: true });
  }

  function exportRaw() {
    exportLyrics({ removeTags: true, removeSpacing: true });
  }

  function getPreviewText(options: ExportOptions = {}): string {
    const content = getEditorContent().trim() || getLyricsFromPage();
    if (!content.trim()) return '';
    return processExportText(content, options);
  }

  return {
    getPreviewText,
    exportLyrics,
    exportStandard,
    exportNoTags,
    exportNoSpacing,
    exportRaw,
  };
}
