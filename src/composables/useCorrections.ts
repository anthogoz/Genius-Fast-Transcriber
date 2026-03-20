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
  const { locale, isHeaderFeatEnabled } = useSettings();

  function highlightContentEditableBrackets(positions: number[]) {
    const editor = state.currentActiveEditor;
    if (!editor || positions.length === 0) return;

    // Trier les positions par ordre décroissant pour ne pas décaler les index lors de l'insertion
    const sortedPositions = [...positions].sort((a, b) => b - a);

    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
    const textNodes: { node: Text; start: number; end: number }[] = [];
    let traversed = 0;

    while (walker.nextNode()) {
      const node = walker.currentNode as Text;
      const len = node.nodeValue?.length ?? 0;
      textNodes.push({ node, start: traversed, end: traversed + len });
      traversed += len;
    }

    for (const pos of sortedPositions) {
      const target = textNodes.find((tn) => pos >= tn.start && pos < tn.end);
      if (!target) continue;

      const node = target.node;
      const localIndex = pos - target.start;
      const value = node.nodeValue ?? '';
      const parent = node.parentNode;
      if (!parent) continue;

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

      parent.replaceChild(frag, node);

      // Nettoyage après l'animation
      window.setTimeout(() => {
        if (marker.parentNode) {
          const text = (before ?? '') + char + (after ?? '');
          marker.parentNode.replaceChild(document.createTextNode(text), marker);
          // Note: Cela ne restaure pas parfaitement la structure d'origine (nœuds fragmentés)
          // mais l'éditeur Genius gère généralement bien le nettoyage des nœuds texte adjacents.
        }
      }, 2500);
    }
  }

  function applyCorrections(
    _options?: Partial<CorrectionOptions>,
    progressFn?: (step: number, total: number, msg: string) => void,
  ): Promise<CorrectionResult> {
    const content = getEditorContent();
    saveState(content);
    const songData = {
      title: state.currentSongTitle,
      mainArtists: state.currentMainArtists,
      featuringArtists: isHeaderFeatEnabled.value ? state.currentFeaturingArtists : [],
    };
    return applyAllTextCorrectionsAsync(content, locale.value, progressFn, songData);
  }

  function applySyncCorrections(options?: Partial<CorrectionOptions>): CorrectionResult {
    const content = getEditorContent();
    const songData = {
      title: state.currentSongTitle,
      mainArtists: state.currentMainArtists,
      featuringArtists: isHeaderFeatEnabled.value ? state.currentFeaturingArtists : [],
    };
    return applyAllTextCorrectionsToString(content, locale.value, options, songData);
  }

  function previewCorrections(options?: Partial<CorrectionOptions>): CorrectionResult {
    const content = getEditorContent();
    const songData = {
      title: state.currentSongTitle,
      mainArtists: state.currentMainArtists,
      featuringArtists: isHeaderFeatEnabled.value ? state.currentFeaturingArtists : [],
    };
    return applyAllTextCorrectionsToString(content, locale.value, options, songData);
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

    const editor = state.currentActiveEditor as HTMLElement;

    // Alerte visuelle sur l'éditeur lui-même
    editor.classList.add('gft-bracket-editor-alert');
    window.setTimeout(() => {
      editor.classList.remove('gft-bracket-editor-alert');
    }, 2500);

    if (state.currentEditorType === 'textarea') {
      const ta = editor as HTMLTextAreaElement;
      const firstIssue = issues[0];
      const pos = Math.max(0, Math.min(firstIssue.position, ta.value.length - 1));
      ta.focus();
      // On ne peut sélectionner qu'un seul élément dans un textarea
      ta.setSelectionRange(pos, pos + 1);
    } else if (state.currentEditorType === 'contenteditable') {
      highlightContentEditableBrackets(issues.map((i) => i.position));
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
        const newLine = line.replace(/\.{3,}/g, '…');
        return newLine.replace(/[.,]+[^\S\r\n]*$/, '');
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
