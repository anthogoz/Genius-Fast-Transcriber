import { onMounted, onUnmounted } from 'vue';
import type { Locale } from '@/types';

interface ShortcutHandlers {
  onChorus: () => void;
  onChorusWithArtist: () => void;
  onPreChorus: () => void;
  onIntro: () => void;
  onBridge: () => void;
  onFixAll: () => void;
  onDuplicateLine: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onYoutubePlayPause: () => void;
  onYoutubeSeekBack: () => void;
  onYoutubeSeekForward: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  function handleKeyDown(e: KeyboardEvent) {
    if (!e.ctrlKey && !e.metaKey) return;

    if (e.altKey) {
      if (e.code === 'Space') {
        e.preventDefault();
        handlers.onYoutubePlayPause();
        return;
      }
      if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlers.onYoutubeSeekBack();
        return;
      }
      if (e.code === 'ArrowRight') {
        e.preventDefault();
        handlers.onYoutubeSeekForward();
        return;
      }
    }

    if (e.shiftKey && (e.key === 'C' || e.key === 'c')) {
      e.preventDefault();
      handlers.onFixAll();
      return;
    }

    switch (e.key) {
      case '1':
        e.preventDefault();
        handlers.onChorus();
        break;
      case '2':
        e.preventDefault();
        handlers.onChorusWithArtist();
        break;
      case '3':
        e.preventDefault();
        handlers.onPreChorus();
        break;
      case '4':
        e.preventDefault();
        handlers.onIntro();
        break;
      case '5':
        e.preventDefault();
        handlers.onBridge();
        break;
      case 'd':
      case 'D':
        e.preventDefault();
        handlers.onDuplicateLine();
        break;
      case 'z':
      case 'Z':
        if (!e.shiftKey) {
          e.preventDefault();
          handlers.onUndo();
        }
        break;
      case 'y':
      case 'Y':
        e.preventDefault();
        handlers.onRedo();
        break;
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown, true);
  });

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown, true);
  });
}
