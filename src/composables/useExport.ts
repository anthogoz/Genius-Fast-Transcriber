import type { ExportOptions } from '@/types';
import { exportToTxt } from '@/utils/export';
import { useEditor } from './useEditor';
import { useGftState } from './useGftState';

export function useExport() {
  const { currentSongTitle } = useGftState();
  const { getEditorContent } = useEditor();

  function exportLyrics(options: ExportOptions = {}) {
    const content = getEditorContent();
    if (!content.trim()) return;
    const filename = `${currentSongTitle.value} (GFT Export).txt`;
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

  return {
    exportStandard,
    exportNoTags,
    exportNoSpacing,
    exportRaw,
  };
}
