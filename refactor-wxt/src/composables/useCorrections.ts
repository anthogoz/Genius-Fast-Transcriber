import { useGftState } from './useGftState';
import { useEditor } from './useEditor';
import { useUndoRedo } from './useUndoRedo';
import { useSettings } from './useSettings';
import {
  applyAllTextCorrectionsToString,
  applyAllTextCorrectionsAsync,
  isSectionTag,
  correctLineSpacing,
} from '@/utils/corrections';
import { applyTextTransformToDivEditor, replaceAndHighlightInDiv } from '@/utils/dom';
import { findUnmatchedBracketsAndParentheses } from '@/utils/brackets';
import type { CorrectionOptions, CorrectionResult, Locale } from '@/types';

export function useCorrections() {
  const { state } = useGftState();
  const { getEditorContent, setEditorContent } = useEditor();
  const { saveState } = useUndoRedo();
  const { locale } = useSettings();

  function applyCorrections(
    options?: Partial<CorrectionOptions>,
    progressFn?: (step: number, total: number, msg: string) => void,
  ): Promise<CorrectionResult> {
    const content = getEditorContent();
    saveState(content);
    return applyAllTextCorrectionsAsync(content, locale.value, progressFn);
  }

  function applySyncCorrections(options?: Partial<CorrectionOptions>): CorrectionResult {
    const content = getEditorContent();
    return applyAllTextCorrectionsToString(content, locale.value, options);
  }

  function previewCorrections(options?: Partial<CorrectionOptions>): CorrectionResult {
    const content = getEditorContent();
    return applyAllTextCorrectionsToString(content, locale.value, options);
  }

  function applyAndSetCorrections(result: CorrectionResult) {
    if (result.correctionsCount > 0) {
      saveState(getEditorContent());
      setEditorContent(result.newText);
    }
  }

  function checkBrackets() {
    const content = getEditorContent();
    return findUnmatchedBracketsAndParentheses(content);
  }

  function capitalizeLines() {
    const content = getEditorContent();
    saveState(content);
    const newText = content
      .split('\n')
      .map((line) => {
        const trimmed = line.trim();
        if (!trimmed || isSectionTag(trimmed)) return line;
        return line.replace(/^(\s*)(\S)/, (_, space, char) => space + char.toUpperCase());
      })
      .join('\n');
    setEditorContent(newText);
    return content !== newText;
  }

  function removeEndPunctuation() {
    const content = getEditorContent();
    saveState(content);
    const newText = content
      .split('\n')
      .map((line) => {
        const trimmed = line.trim();
        if (!trimmed || isSectionTag(trimmed)) return line;
        return line.replace(/[.,;]+\s*$/, '');
      })
      .join('\n');
    setEditorContent(newText);
    return content !== newText;
  }

  function fixSpacing() {
    const content = getEditorContent();
    saveState(content);
    const result = correctLineSpacing(content);
    if (result.correctionsCount > 0) {
      setEditorContent(result.newText);
    }
    return result;
  }

  function removeZeroWidthSpaces() {
    const content = getEditorContent();
    saveState(content);
    const newText = content.replace(/[\u200B\u200C\u200D\uFEFF]/g, '');
    const count = content.length - newText.length;
    if (count > 0) setEditorContent(newText);
    return count;
  }

  function duplicateCurrentLine() {
    const content = getEditorContent();
    if (!state.currentActiveEditor) return;

    saveState(content);

    if (state.currentEditorType === 'textarea') {
      const ta = state.currentActiveEditor as HTMLTextAreaElement;
      const pos = ta.selectionStart;
      const lines = ta.value.split('\n');
      let charCount = 0;
      let lineIndex = 0;

      for (let i = 0; i < lines.length; i++) {
        charCount += lines[i].length + 1;
        if (charCount > pos) {
          lineIndex = i;
          break;
        }
      }

      lines.splice(lineIndex + 1, 0, lines[lineIndex]);
      ta.value = lines.join('\n');
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  return {
    applyCorrections,
    applySyncCorrections,
    previewCorrections,
    applyAndSetCorrections,
    checkBrackets,
    capitalizeLines,
    removeEndPunctuation,
    fixSpacing,
    removeZeroWidthSpaces,
    duplicateCurrentLine,
  };
}
