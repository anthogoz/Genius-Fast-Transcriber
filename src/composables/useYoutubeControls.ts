function getYouTubeIframe(): HTMLIFrameElement | null {
  return document.querySelector<HTMLIFrameElement>('iframe[src*="youtube.com/embed/"]');
}

function getVideoElement(): HTMLVideoElement | null {
  return document.querySelector<HTMLVideoElement>('video');
}

function ensureJsApi(iframe: HTMLIFrameElement) {
  try {
    const src = iframe.getAttribute('src');
    if (!src) return;

    const url = new URL(src, window.location.href);
    if (url.searchParams.get('enablejsapi') !== '1') {
      url.searchParams.set('enablejsapi', '1');
      url.searchParams.set('origin', window.location.origin);
      iframe.setAttribute('src', url.toString());
    }
  } catch {
    // Ignore malformed URL or cross-origin edge cases.
  }
}

function postPlayerCommand(iframe: HTMLIFrameElement, func: string, args: unknown[] = []) {
  iframe.contentWindow?.postMessage(
    JSON.stringify({
      event: 'command',
      func,
      args,
    }),
    '*',
  );
}

export function useYoutubeControls() {
  function togglePlayPause(): boolean {
    const video = getVideoElement();
    if (video) {
      if (video.paused) {
        void video.play();
      } else {
        video.pause();
      }
      return true;
    }

    const iframe = getYouTubeIframe();
    if (!iframe) return false;

    ensureJsApi(iframe);
    postPlayerCommand(iframe, 'playVideo');
    return true;
  }

  function seekBy(seconds: number): boolean {
    const video = getVideoElement();
    if (video) {
      video.currentTime = Math.max(0, video.currentTime + seconds);
      return true;
    }

    return false;
  }

  return {
    togglePlayPause,
    seekBy,
  };
}
