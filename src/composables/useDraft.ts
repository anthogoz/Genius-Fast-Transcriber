import { ref } from 'vue';
import { useGftState } from './useGftState';

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
    meta: `gftDraftMeta:${scoped}`,
  };
}

export interface DraftHistoryItem {
  scoped: string;
  pathname: string;
  content: string;
  time: string;
  date: string;
  title: string;
  artists: string;
  charCount: number;
}

export function useDraft() {
  const { state } = useGftState();

  function saveDraft(content: string) {
    if (!content.trim()) return;
    const keys = getDraftKeys();
    const timeStr = new Date().toLocaleTimeString();
    const dateStr = new Date().toLocaleDateString();

    localStorage.setItem(keys.content, content);
    localStorage.setItem(keys.time, timeStr);

    const metaData = {
      title: state.currentSongTitle || 'TITRE INCONNU',
      artists: state.currentMainArtists.join(', ') || 'Artiste Inconnu',
      time: timeStr,
      date: dateStr,
      pathname: window.location.pathname,
      charCount: content.length,
    };
    localStorage.setItem(keys.meta, JSON.stringify(metaData));

    hasDraft.value = true;
    draftTimestamp.value = timeStr;
  }

  function loadDraft(): { content: string; time: string } | null {
    const keys = getDraftKeys();
    const content = localStorage.getItem(keys.content);
    const time = localStorage.getItem(keys.time);
    if (!content) return null;
    return { content, time: time ?? '' };
  }

  function loadDraftByScoped(scoped: string): { content: string; time: string } | null {
    const content = localStorage.getItem(`gftDraftContent:${scoped}`);
    const time = localStorage.getItem(`gftDraftTime:${scoped}`);
    if (!content) return null;
    return { content, time: time ?? '' };
  }

  function discardDraft() {
    const keys = getDraftKeys();
    localStorage.removeItem(keys.content);
    localStorage.removeItem(keys.time);
    localStorage.removeItem(keys.meta);
    hasDraft.value = false;
    draftTimestamp.value = null;
  }

  function discardDraftByScoped(scoped: string) {
    localStorage.removeItem(`gftDraftContent:${scoped}`);
    localStorage.removeItem(`gftDraftTime:${scoped}`);
    localStorage.removeItem(`gftDraftMeta:${scoped}`);

    const currentKeys = getDraftKeys();
    if (currentKeys.content === `gftDraftContent:${scoped}`) {
      hasDraft.value = false;
      draftTimestamp.value = null;
    }
  }

  function getAllDrafts(): DraftHistoryItem[] {
    const drafts: DraftHistoryItem[] = [];
    const keys = Object.keys(localStorage);

    for (const key of keys) {
      if (key.startsWith('gftDraftContent:')) {
        const scoped = key.replace('gftDraftContent:', '');
        const content = localStorage.getItem(key) ?? '';
        const time = localStorage.getItem(`gftDraftTime:${scoped}`) ?? '';

        let meta = {
          title: 'Titre Inconnu',
          artists: 'Artiste Inconnu',
          time: time,
          date: '',
          pathname: decodeURIComponent(scoped),
          charCount: content.length,
        };

        const metaRaw = localStorage.getItem(`gftDraftMeta:${scoped}`);
        if (metaRaw) {
          try {
            const parsed = JSON.parse(metaRaw);
            meta = { ...meta, ...parsed };
          } catch {
            // Ignore parsing failures
          }
        } else {
          // Reconstruct fallback from path
          const cleanPath = decodeURIComponent(scoped)
            .replace('/lyrics/edit', '')
            .replace('/edit', '')
            .replace('/', '');
          if (cleanPath) {
            const parts = cleanPath.split('-');
            if (parts.length > 1) {
              meta.artists = parts[0].replace(/_/g, ' ');
              meta.title = parts.slice(1).join(' ').replace(/_/g, ' ');
            } else {
              meta.title = cleanPath.replace(/_/g, ' ');
            }
          }
        }

        drafts.push({
          scoped,
          pathname: meta.pathname,
          content,
          time: meta.time,
          date: meta.date || '',
          title: meta.title,
          artists: meta.artists,
          charCount: meta.charCount,
        });
      }
    }

    // Sort: most recent first
    drafts.sort((a, b) => {
      const parseDateTime = (d: string, t: string) => {
        try {
          const dParts = d.split('/');
          if (dParts.length === 3) {
            const dStr = `${dParts[2]}-${dParts[1]}-${dParts[0]}T${t}`;
            const dateObj = new Date(dStr);
            if (!Number.isNaN(dateObj.getTime())) return dateObj.getTime();
          }
        } catch {
          // Ignore
        }
        return 0;
      };

      const timeA = parseDateTime(a.date, a.time);
      const timeB = parseDateTime(b.date, b.time);
      if (timeA > 0 && timeB > 0) return timeB - timeA;

      return (b.date + ' ' + b.time).localeCompare(a.date + ' ' + a.time);
    });

    return drafts;
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
    loadDraftByScoped,
    discardDraft,
    discardDraftByScoped,
    scheduleAutoSave,
    cancelAutoSave,
    checkForDraft,
    getAllDrafts,
  };
}
