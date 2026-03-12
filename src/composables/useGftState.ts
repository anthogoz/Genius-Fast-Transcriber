import { reactive, toRefs } from 'vue';
import type { EditorType, GftState } from '@/types';

const state = reactive<GftState>({
  verseCounter: 1,
  detectedArtists: [],
  currentActiveEditor: null,
  currentEditorType: null,
  panelElement: null,
  observer: null,
  currentSongTitle: 'TITRE INCONNU',
  currentMainArtists: [],
  currentFeaturingArtists: [],
  floatingToolbar: null,
  undoStack: [],
  redoStack: [],
  lastSavedContent: '',
  hasUnsavedChanges: false,
});

export function useGftState() {
  function setEditor(editor: HTMLElement | null, type: EditorType) {
    state.currentActiveEditor = editor;
    state.currentEditorType = type;
  }

  function setArtists(main: string[], featuring: string[]) {
    state.currentMainArtists = [...main];
    state.currentFeaturingArtists = [...featuring];
    state.detectedArtists = [...new Set([...main, ...featuring])].filter(Boolean);
  }

  function setSongTitle(title: string) {
    state.currentSongTitle = title || 'TITRE INCONNU';
  }

  function incrementVerseCounter() {
    state.verseCounter++;
  }

  function decrementVerseCounter() {
    if (state.verseCounter > 1) state.verseCounter--;
  }

  function resetVerseCounter() {
    state.verseCounter = 1;
  }

  return {
    ...toRefs(state),
    state,
    setEditor,
    setArtists,
    setSongTitle,
    incrementVerseCounter,
    decrementVerseCounter,
    resetVerseCounter,
  };
}
