import { ref } from 'vue';

const AUTOSAVE_DELAY = 3000;
let autoSaveTimeout: ReturnType<typeof setTimeout> | null = null;
const hasDraft = ref(false);
const draftTimestamp = ref<string | null>(null);

function getDraftKeys() {
  const path = (window.location.pathname || '/').trim() || '/';
  const scoped = encodeURIComponent(path);
  return {
    content: `gftDraftContent:${scoped}`,
    time: `gftDraftTime:${scoped}`,
  };
}

export function useDraft() {
  function saveDraft(content: string) {
    if (!content.trim()) return;
    const keys = getDraftKeys();
    localStorage.setItem(keys.content, content);
    localStorage.setItem(keys.time, new Date().toLocaleTimeString());
    hasDraft.value = true;
    draftTimestamp.value = localStorage.getItem(keys.time);
  }

  function loadDraft(): { content: string; time: string } | null {
    const keys = getDraftKeys();
    const content = localStorage.getItem(keys.content);
    const time = localStorage.getItem(keys.time);
    if (!content) return null;
    return { content, time: time ?? '' };
  }

  function discardDraft() {
    const keys = getDraftKeys();
    localStorage.removeItem(keys.content);
    localStorage.removeItem(keys.time);
    hasDraft.value = false;
    draftTimestamp.value = null;
  }

  function scheduleAutoSave(getContent: () => string) {
    if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
      saveDraft(getContent());
    }, AUTOSAVE_DELAY);
  }

  function cancelAutoSave() {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
      autoSaveTimeout = null;
    }
  }

  function checkForDraft() {
    const draft = loadDraft();
    if (draft) {
      hasDraft.value = true;
      draftTimestamp.value = draft.time;
    } else {
      hasDraft.value = false;
      draftTimestamp.value = null;
    }
    return draft;
  }

  return {
    hasDraft,
    draftTimestamp,
    saveDraft,
    loadDraft,
    discardDraft,
    scheduleAutoSave,
    cancelAutoSave,
    checkForDraft,
  };
}
