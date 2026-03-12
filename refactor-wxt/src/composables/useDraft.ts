import { ref } from 'vue';

const DRAFT_KEY = 'gftDraftContent';
const DRAFT_TIME_KEY = 'gftDraftTime';
const AUTOSAVE_DELAY = 3000;

export function useDraft() {
  let autoSaveTimeout: ReturnType<typeof setTimeout> | null = null;
  const hasDraft = ref(false);
  const draftTimestamp = ref<string | null>(null);

  function saveDraft(content: string) {
    if (!content.trim()) return;
    localStorage.setItem(DRAFT_KEY, content);
    localStorage.setItem(DRAFT_TIME_KEY, new Date().toLocaleTimeString());
    hasDraft.value = true;
    draftTimestamp.value = localStorage.getItem(DRAFT_TIME_KEY);
  }

  function loadDraft(): { content: string; time: string } | null {
    const content = localStorage.getItem(DRAFT_KEY);
    const time = localStorage.getItem(DRAFT_TIME_KEY);
    if (!content) return null;
    return { content, time: time ?? '' };
  }

  function discardDraft() {
    localStorage.removeItem(DRAFT_KEY);
    localStorage.removeItem(DRAFT_TIME_KEY);
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
    }
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
