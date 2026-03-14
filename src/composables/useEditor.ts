import type { EditorType } from '@/types';
import { useDraft } from './useDraft';
import { useGftState } from './useGftState';
import { SELECTORS } from './useSongData';
import { useUndoRedo } from './useUndoRedo';

export function useEditor() {
  const { state, setEditor } = useGftState();
  const { saveState } = useUndoRedo();
  const { scheduleAutoSave } = useDraft();

  function detectEditor(): { editor: HTMLElement; type: EditorType } | null {
    const textarea = document.querySelector<HTMLTextAreaElement>(SELECTORS.TEXTAREA_EDITOR);
    if (textarea) return { editor: textarea, type: 'textarea' };

    const divEditor = document.querySelector<HTMLElement>(SELECTORS.DIV_EDITOR);
    if (divEditor) return { editor: divEditor, type: 'contenteditable' };

    return null;
  }

  function getEditorContent(): string {
    const { currentActiveEditor, currentEditorType } = state;
    if (!currentActiveEditor) return '';

    if (currentEditorType === 'textarea') {
      return (currentActiveEditor as HTMLTextAreaElement).value;
    }

    const lines: string[] = [];
    currentActiveEditor.childNodes.forEach((child) => {
      if (child.nodeName === 'BR') {
        lines.push('');
      } else if (child.nodeType === Node.TEXT_NODE) {
        lines.push(child.textContent ?? '');
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement;
        if (el.nodeName === 'DIV' || el.nodeName === 'P') {
          lines.push(el.textContent ?? '');
        } else {
          lines.push(el.textContent ?? '');
        }
      }
    });
    return lines.join('\n').replace(/\n+$/, '');
  }

  function setEditorContent(text: string) {
    const { currentActiveEditor, currentEditorType } = state;
    if (!currentActiveEditor) return;

    if (currentEditorType === 'textarea') {
      (currentActiveEditor as HTMLTextAreaElement).value = text;
      currentActiveEditor.dispatchEvent(new Event('input', { bubbles: true }));
      return;
    }

    currentActiveEditor.innerHTML = '';
    text.split('\n').forEach((lineText) => {
      const lineDiv = document.createElement('div');
      if (lineText === '') {
        lineDiv.appendChild(document.createElement('br'));
      } else {
        lineDiv.textContent = lineText;
      }
      currentActiveEditor.appendChild(lineDiv);
    });

    if (currentActiveEditor.childNodes.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.appendChild(document.createElement('br'));
      currentActiveEditor.appendChild(emptyDiv);
    }

    currentActiveEditor.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
  }

  function insertTextAtCursor(text: string) {
    const { currentActiveEditor, currentEditorType } = state;
    if (!currentActiveEditor) return;

    const currentContent = getEditorContent();
    saveState(currentContent);

    if (currentEditorType === 'textarea') {
      const ta = currentActiveEditor as HTMLTextAreaElement;
      ta.focus();
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      ta.value = ta.value.substring(0, start) + text + ta.value.substring(end);
      ta.selectionStart = ta.selectionEnd = start + text.length;
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      currentActiveEditor.focus();
      const selection = window.getSelection();
      if (!selection) return;

      if (selection.rangeCount === 0 || !currentActiveEditor.contains(selection.anchorNode)) {
        const range = document.createRange();
        range.selectNodeContents(currentActiveEditor);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }

      const range = selection.getRangeAt(0);
      range.deleteContents();
      const textNode = document.createTextNode(text);
      range.insertNode(textNode);

      const nextRange = document.createRange();
      nextRange.setStartAfter(textNode);
      nextRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(nextRange);

      currentActiveEditor.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    }

    scheduleAutoSave(getEditorContent);
    state.hasUnsavedChanges = true;
  }

  function getSelectedText(): string {
    const { currentActiveEditor, currentEditorType } = state;
    if (currentActiveEditor && currentEditorType === 'textarea') {
      const ta = currentActiveEditor as HTMLTextAreaElement;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      if (start === end) return '';
      return ta.value.substring(start, end);
    }

    const selection = window.getSelection();
    return selection?.toString() ?? '';
  }

  function wrapSelection(before: string, after: string) {
    const { currentActiveEditor, currentEditorType } = state;
    if (!currentActiveEditor) return;

    saveState(getEditorContent());

    if (currentEditorType === 'textarea') {
      const ta = currentActiveEditor as HTMLTextAreaElement;
      ta.focus();
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      if (start === end) return;

      const selectedText = ta.value.substring(start, end);
      ta.value =
        ta.value.substring(0, start) + before + selectedText + after + ta.value.substring(end);
      ta.selectionStart = start + before.length;
      ta.selectionEnd = start + before.length + selectedText.length;
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      currentActiveEditor.focus();
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const selectedText = selection?.toString() ?? '';
      if (!selectedText) return;

      const range = selection.getRangeAt(0);
      range.deleteContents();
      const textNode = document.createTextNode(before + selectedText + after);
      range.insertNode(textNode);

      const nextRange = document.createRange();
      nextRange.setStart(textNode, before.length + selectedText.length);
      nextRange.setEnd(textNode, before.length + selectedText.length);
      selection.removeAllRanges();
      selection.addRange(nextRange);

      currentActiveEditor.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    }

    scheduleAutoSave(getEditorContent);
    state.hasUnsavedChanges = true;
  }

  return {
    detectEditor,
    getEditorContent,
    setEditorContent,
    insertTextAtCursor,
    getSelectedText,
    wrapSelection,
    setEditor,
  };
}
