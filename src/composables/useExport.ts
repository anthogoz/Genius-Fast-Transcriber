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
    const containers = Array.from(document.querySelectorAll<HTMLElement>(SELECTORS.LYRICS_CONTAINER));
    if (containers.length === 0) return '';

    return containers.map(container => (container.innerText || container.textContent || '').trim()).join('\n\n');
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
