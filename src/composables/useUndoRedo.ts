import { ref } from 'vue';

const MAX_HISTORY_SIZE = 10;

const undoStack = ref<string[]>([]);
const redoStack = ref<string[]>([]);

export function useUndoRedo() {
  function saveState(content: string) {
    undoStack.value.push(content);
    if (undoStack.value.length > MAX_HISTORY_SIZE) {
      undoStack.value.shift();
    }
    redoStack.value = [];
  }

  function undo(currentContent: string): string | null {
    if (undoStack.value.length === 0) return null;
    const previousState = undoStack.value.pop()!;
    redoStack.value.push(currentContent);
    return previousState;
  }

  function redo(currentContent: string): string | null {
    if (redoStack.value.length === 0) return null;
    const nextState = redoStack.value.pop()!;
    undoStack.value.push(currentContent);
    return nextState;
  }

  function clear() {
    undoStack.value = [];
    redoStack.value = [];
  }

  return {
    undoStack,
    redoStack,
    saveState,
    undo,
    redo,
    clear,
    canUndo: () => undoStack.value.length > 0,
    canRedo: () => redoStack.value.length > 0,
  };
}
