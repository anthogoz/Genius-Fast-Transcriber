import type { CorrectionOptions, CorrectionResult } from '@/types';
import { findUnmatchedBracketsAndParentheses } from '@/utils/brackets';
import {
  applyAllTextCorrectionsAsync,
  applyAllTextCorrectionsToString,
  correctLineSpacing,
  isSectionTag,
} from '@/utils/corrections';
import { useEditor } from './useEditor';
import { useGftState } from './useGftState';
import { useSettings } from './useSettings';
import { useUndoRedo } from './useUndoRedo';

export function useCorrections() {
  const { state } = useGftState();
  const { getEditorContent, setEditorContent } = useEditor();
  const { saveState } = useUndoRedo();
  const { locale } = useSettings();

  function highlightContentEditableBracket(position: number) {
    const editor = state.currentActiveEditor;
    if (!editor) return;

    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
    let traversed = 0;

    while (walker.nextNode()) {
      const textNode = walker.currentNode as Text;
      const value = textNode.nodeValue ?? '';
      if (position < traversed + value.length) {
        const localIndex = position - traversed;
        const parent = textNode.parentNode;
        if (!parent) return;

        const before = value.slice(0, localIndex);
        const char = value[localIndex] ?? '';
        const after = value.slice(localIndex + 1);

        const frag = document.createDocumentFragment();
        if (before) frag.appendChild(document.createTextNode(before));
        const marker = document.createElement('span');
        marker.className = 'gft-bracket-highlight';
        marker.textContent = char;
        frag.appendChild(marker);
        if (after) frag.appendChild(document.createTextNode(after));

        parent.replaceChild(frag, textNode);
        window.setTimeout(() => {
          const replacement = document.createTextNode((before ?? '') + char + (after ?? ''));
          marker.parentNode?.replaceChild(replacement, marker);
        }, 1800);
        return;
      }
      traversed += value.length;
    }
  }

  function applyCorrections(
    _options?: Partial<CorrectionOptions>,
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
    const issues = findUnmatchedBracketsAndParentheses(content);
    if (issues.length === 0 || !state.currentActiveEditor) return issues;

    const firstIssue = issues[0];
    if (state.currentEditorType === 'textarea') {
      const ta = state.currentActiveEditor as HTMLTextAreaElement;
      // Scroll to the problematic point, but don't select the text
      const pos = Math.max(0, Math.min(firstIssue.position, ta.value.length - 1));
      ta.focus();
      // Set the cursor at the position instead of selecting it
      ta.setSelectionRange(pos, pos);
    } else if (state.currentEditorType === 'contenteditable') {
      highlightContentEditableBracket(firstIssue.position);
    }

    return issues;
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
    const newText = content.replace(/\u200B|\u200C|\u200D|\uFEFF/g, '');
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
      return;
    }

    if (state.currentEditorType === 'contenteditable') {
      const selection = window.getSelection();
      const activeEditor = state.currentActiveEditor;
      if (!selection || selection.rangeCount === 0 || !activeEditor) return;

      const range = selection.getRangeAt(0);
      let lineNode: Node | null = range.startContainer;

      if (lineNode.nodeType === Node.TEXT_NODE) {
        lineNode = lineNode.parentNode;
      }

      while (lineNode && lineNode !== activeEditor && !(lineNode instanceof HTMLDivElement)) {
        lineNode = lineNode.parentNode;
      }

      if (!lineNode || lineNode === activeEditor) return;

      const sourceDiv = lineNode as HTMLDivElement;
      const clone = sourceDiv.cloneNode(true) as HTMLDivElement;
      sourceDiv.insertAdjacentElement('afterend', clone);
      activeEditor.dispatchEvent(new Event('input', { bubbles: true }));

      const newRange = document.createRange();
      newRange.selectNodeContents(clone);
      newRange.collapse(false);
      selection.removeAllRanges();
      selection.addRange(newRange);
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
