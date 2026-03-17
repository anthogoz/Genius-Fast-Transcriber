let lastKnownTime = 0;
let lastKnownState: number | null = null;
let lastUpdateTimestamp = 0;
let telemetryBound = false;

function getYouTubeIframe(): HTMLIFrameElement | null {
  try {
    const iframes = Array.from(document.querySelectorAll('iframe'));
    const ytIframes = iframes.filter((f) => {
      try {
        const s = f.src || '';
        return (
          s.includes('youtube.com/')
          || s.includes('youtube-nocookie.com/')
          || s.includes('youtu.be/')
        );
      } catch {
        return false;
      }
    });

    if (ytIframes.length === 0) return null;

    // Try to find the visible player first
    for (const iframe of ytIframes) {
      const rect = iframe.getBoundingClientRect();
      const isVisible =
        rect.width > 0
        && rect.height > 0
        && rect.top < (window.innerHeight || document.documentElement.clientHeight)
        && rect.bottom > 0;
      if (isVisible) return iframe;
    }

    // Fallback to the first one
    return ytIframes[0];
  } catch {
    return null;
  }
}

function getVideoElement(): HTMLVideoElement | null {
  const videos = Array.from(document.querySelectorAll<HTMLVideoElement>('video'));
  if (videos.length === 0) return document.querySelector<HTMLVideoElement>('audio');

  return (
    videos.find((v) => {
      try {
        const container = v.closest(
          '[class*="ad"], [id*="id"], [class*="miniplayer"], [class*="Outbrain"]',
        );
        if (container) return false;

        const rect = v.getBoundingClientRect();
        if (rect.width < 100 || rect.height < 100) return false;

        return true;
      } catch {
        return true;
      }
    }) || videos[0]
  );
}

/**
 * Ensures enablejsapi=1 is present in the iframe src
 */
function ensureYoutubeJsApi(iframe: HTMLIFrameElement) {
  try {
    if (iframe.src && !iframe.src.includes('enablejsapi=1')) {
      const separator = iframe.src.includes('?') ? '&' : '?';
      iframe.src += `${separator}enablejsapi=1`;
      return true; // Reloaded
    }
  } catch (e) {
    console.warn('[GFT] Could not modify iframe src:', e);
  }
  return false;
}

function postCommand(iframe: HTMLIFrameElement, func: string, args: any[] = []) {
  const win = iframe.contentWindow;
  if (!win) return;
  try {
    const cmd = JSON.stringify({
      event: 'command',
      func,
      args,
      id: 1,
    });
    win.postMessage(cmd, '*');
  } catch {}
}

function postEvent(iframe: HTMLIFrameElement, event: string, extra = {}) {
  const win = iframe.contentWindow;
  if (!win) return;
  try {
    const msg = JSON.stringify({
      event,
      id: 1,
      ...extra,
    });
    win.postMessage(msg, '*');
  } catch {}
}

function bindTelemetry() {
  if (telemetryBound) return;

  window.addEventListener(
    'message',
    (e) => {
      if (!e.origin || (!e.origin.includes('youtube') && !e.origin.includes('youtube-nocookie')))
        return;

      try {
        const d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (!d) return;

        // Extract info (handles different YT message formats)
        const info = d.info || d.args?.[0];

        if (info) {
          if (info.currentTime !== undefined && typeof info.currentTime === 'number') {
            if (!(info.currentTime === 0 && lastKnownTime > 2 && lastKnownState === 1)) {
              lastKnownTime = info.currentTime;
              lastUpdateTimestamp = performance.now();
            }
          }

          if (info.playerState !== undefined) {
            lastKnownState = info.playerState;
          }
        }

        if (d.event === 'onStateChange' && typeof d.info === 'number') {
          lastKnownState = d.info;
        }

        if (d.event === 'onReady') {
          const f = getYouTubeIframe();
          if (f) {
            postEvent(f, 'listening', { channel: 'widget' });
            postCommand(f, 'addEventListener', ['onStateChange']);
          }
        }
      } catch {}
    },
    true,
  );

  telemetryBound = true;
}

export function useYoutubeControls() {
  if (typeof window !== 'undefined') {
    bindTelemetry();
  }

  function togglePlayPause(): 'playing' | 'paused' | null {
    const v = getVideoElement();
    if (v?.src && !v.src.includes('blob:')) {
      if (v.paused) {
        v.play().catch(() => {});
        return 'playing';
      } else {
        v.pause();
        return 'paused';
      }
    }

    const f = getYouTubeIframe();
    if (!f) return null;

    ensureYoutubeJsApi(f);

    // 1 = Playing, 2 = Paused
    if (lastKnownState === 1) {
      postCommand(f, 'pauseVideo');
      lastKnownState = 2;
      return 'paused';
    } else if (lastKnownState === 2) {
      postCommand(f, 'playVideo');
      lastKnownState = 1;
      lastUpdateTimestamp = performance.now();
      return 'playing';
    } else {
      // Unknown state: try to pause first (common pattern when sync is lost)
      postCommand(f, 'pauseVideo');
      lastKnownState = 2;
      // Also try to re-bind
      postEvent(f, 'listening', { channel: 'widget' });
      return 'paused';
    }
  }

  function seekBy(seconds: number): boolean {
    const v = getVideoElement();
    if (v?.src && !v.src.includes('blob:')) {
      v.currentTime = Math.max(0, v.currentTime + seconds);
      lastKnownTime = v.currentTime;
      return true;
    }

    const f = getYouTubeIframe();
    if (!f) return false;

    ensureYoutubeJsApi(f);

    let current = lastKnownTime;
    if (lastKnownState === 1 && lastUpdateTimestamp > 0) {
      const elapsed = (performance.now() - lastUpdateTimestamp) / 1000;
      current += elapsed;
    }

    const target = Math.max(0, current + seconds);
    postCommand(f, 'seekTo', [target, true]);

    lastKnownTime = target;
    lastUpdateTimestamp = performance.now();

    return true;
  }

  // Initialization
  if (typeof window !== 'undefined') {
    const init = () => {
      const f = getYouTubeIframe();
      if (f) {
        if (ensureYoutubeJsApi(f)) {
          // If reloaded, wait again
          setTimeout(init, 1000);
          return;
        }
        postEvent(f, 'listening', { channel: 'widget' });
        postCommand(f, 'addEventListener', ['onStateChange']);
        postCommand(f, 'getCurrentTime');
      }
    };
    setTimeout(init, 500);
    setTimeout(init, 2000);
  }

  return { togglePlayPause, seekBy };
}
