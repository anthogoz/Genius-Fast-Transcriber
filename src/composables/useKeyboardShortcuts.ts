import { onMounted, onUnmounted } from 'vue';
import { useSettings } from './useSettings';
import type { KeyboardShortcut } from '@/types';

interface ShortcutHandlers {
  onVerse: () => void;
  onChorus: () => void;
  onBridge: () => void;
  onIntro: () => void;
  onOutro: () => void;
  onFixAll: () => void;
  onToggleStats: () => void;
  onDuplicateLine: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onYoutubePlayPause?: () => void;
  onYoutubeSeekBack?: () => void;
  onYoutubeSeekForward?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  const { shortcuts } = useSettings();

  function matches(e: KeyboardEvent, s: KeyboardShortcut): boolean {
    // On compare le code (ex: KeyZ) ou la touche (ex: z) pour plus de flexibilité
    // Le code est plus précis pour les claviers AZERTY/QWERTY
    const keyMatch = e.key.toLowerCase() === s.key.toLowerCase() || e.code === s.code;
    const ctrlMatch = !!e.ctrlKey === !!s.ctrlKey || !!e.metaKey === !!s.ctrlKey; // Support Meta (Mac) comme Ctrl
    const shiftMatch = !!e.shiftKey === !!s.shiftKey;
    const altMatch = !!e.altKey === !!s.altKey;

    return keyMatch && ctrlMatch && shiftMatch && altMatch;
  }

  function handleKeyDown(e: KeyboardEvent) {
    try {
      const s = shortcuts.value;

      if (matches(e, s.verse)) {
        e.preventDefault();
        handlers.onVerse();
      } else if (matches(e, s.chorus)) {
        e.preventDefault();
        handlers.onChorus();
      } else if (matches(e, s.bridge)) {
        e.preventDefault();
        handlers.onBridge();
      } else if (matches(e, s.intro)) {
        e.preventDefault();
        handlers.onIntro();
      } else if (matches(e, s.outro)) {
        e.preventDefault();
        handlers.onOutro();
      } else if (matches(e, s.fixAll)) {
        e.preventDefault();
        handlers.onFixAll();
      } else if (matches(e, s.toggleStats)) {
        e.preventDefault();
        handlers.onToggleStats();
      } else if (matches(e, s.duplicateLine)) {
        e.preventDefault();
        handlers.onDuplicateLine();
      } else if (matches(e, s.undo)) {
        e.preventDefault();
        handlers.onUndo();
      } else if (matches(e, s.redo)) {
        e.preventDefault();
        handlers.onRedo();
      } else if (matches(e, s.ytPlayPause)) {
        if (handlers.onYoutubePlayPause) {
          e.preventDefault();
          handlers.onYoutubePlayPause();
        }
      } else if (matches(e, s.ytSeekBack)) {
        if (handlers.onYoutubeSeekBack) {
          e.preventDefault();
          handlers.onYoutubeSeekBack();
        }
      } else if (matches(e, s.ytSeekForward)) {
        if (handlers.onYoutubeSeekForward) {
          e.preventDefault();
          handlers.onYoutubeSeekForward();
        }
      }
    } catch (err) {
      console.error('GFT: Keyboard shortcut error', err);
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown, true);
  });

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown, true);
  });
}
