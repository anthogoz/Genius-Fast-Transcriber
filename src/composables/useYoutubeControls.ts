function getYouTubeIframe(): HTMLIFrameElement | null {
  return document.querySelector<HTMLIFrameElement>(
    'iframe[src*="youtube.com/embed/"], iframe[src*="youtube-nocookie.com/embed/"]',
  );
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

let iframeTelemetryBound = false;
let lastKnownIframeTime: number | null = null;

function isYoutubeMessageOrigin(origin: string): boolean {
  return origin.includes('youtube.com') || origin.includes('youtube-nocookie.com');
}

function bindIframeTelemetry() {
  if (iframeTelemetryBound) return;

  window.addEventListener('message', (event) => {
    if (!isYoutubeMessageOrigin(event.origin)) return;

    let payload: unknown = event.data;
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch {
        return;
      }
    }

    if (!payload || typeof payload !== 'object') return;

    const info = (payload as { info?: { currentTime?: unknown } }).info;
    if (!info || typeof info !== 'object') return;

    const currentTime = info.currentTime;
    if (typeof currentTime === 'number' && Number.isFinite(currentTime)) {
      lastKnownIframeTime = currentTime;
    }
  });

  iframeTelemetryBound = true;
}

function seekIframeBy(iframe: HTMLIFrameElement, seconds: number): boolean {
  ensureJsApi(iframe);
  bindIframeTelemetry();

  postPlayerCommand(iframe, 'addEventListener', ['onStateChange']);
  postPlayerCommand(iframe, 'getCurrentTime');

  const seekFromKnownTime = () => {
    if (lastKnownIframeTime === null) return false;

    const target = Math.max(0, lastKnownIframeTime + seconds);
    postPlayerCommand(iframe, 'seekTo', [target, true]);
    lastKnownIframeTime = target;
    return true;
  };

  if (seekFromKnownTime()) return true;

  // Best effort: request current time first, then retry seek once telemetry arrives.
  setTimeout(() => {
    void seekFromKnownTime();
  }, 120);

  return true;
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

    const iframe = getYouTubeIframe();
    if (!iframe) return false;

    return seekIframeBy(iframe, seconds);
  }

  return {
    togglePlayPause,
    seekBy,
  };
}
