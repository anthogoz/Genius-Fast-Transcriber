let lastKnownTime = 0;
let lastKnownState: number | null = null;
let telemetryBound = false;

function getYouTubeIframe(): HTMLIFrameElement | null {
  try {
    const all = Array.from(document.querySelectorAll('iframe'));
    return all.find(f => {
      try {
        const s = f.src || '';
        return (
          s.includes('youtube.com/embed/') || 
          s.includes('youtube-nocookie.com/embed/') || 
          s.includes('youtu.be/')
        );
      } catch { return false; }
    }) || null;
  } catch { return null; }
}

function getVideoElement(): HTMLVideoElement | null {
  return document.querySelector<HTMLVideoElement>('video') 
      || document.querySelector<HTMLVideoElement>('audio');
}

function postCommand(iframe: HTMLIFrameElement, func: string, args: any[] = []) {
  const win = iframe.contentWindow;
  if (!win) return;
  try {
    const cmd = JSON.stringify({ 
      event: 'command', 
      func, 
      args, 
      id: 1 
    });
    win.postMessage(cmd, '*');
  } catch {}
}

function bindTelemetry() {
  if (telemetryBound) return;
  
  window.addEventListener('message', (e) => {
    // Broadening the origin check to catch all variations
    if (!e.origin || !e.origin.includes('youtube')) return;
    
    try {
      const d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      
      // Standard YouTube info delivery
      if (d && d.event === 'infoDelivery' && d.info) {
        if (d.info.currentTime !== undefined && typeof d.info.currentTime === 'number') {
          lastKnownTime = d.info.currentTime;
        }
        if (d.info.playerState !== undefined) {
          lastKnownState = d.info.playerState;
        }
      }
      // Alternate data structure
      else if (d && d.info) {
        if (d.info.currentTime !== undefined) lastKnownTime = d.info.currentTime;
        if (d.info.playerState !== undefined) lastKnownState = d.info.playerState;
      }
    } catch {}
  }, true);
  
  telemetryBound = true;
}

export function useYoutubeControls() {
  if (typeof window !== 'undefined') {
    bindTelemetry();
  }

  function togglePlayPause(): boolean {
    const v = getVideoElement();
    if (v) {
      if (v.paused) v.play().catch(() => {});
      else v.pause();
      return true;
    }

    const f = getYouTubeIframe();
    if (!f) return false;

    // Handshake
    postCommand(f, 'listening');
    
    // Toggle
    if (lastKnownState === 1) { 
        postCommand(f, 'pauseVideo');
        lastKnownState = 2;
    } else {
        postCommand(f, 'playVideo');
        lastKnownState = 1;
    }
    
    // Proactive update requests
    postCommand(f, 'addEventListener', ['onStateChange']);
    postCommand(f, 'getPlayerState');
    postCommand(f, 'getCurrentTime');
    
    return true;
  }

  function seekBy(seconds: number): boolean {
    const v = getVideoElement();
    if (v) {
      const prev = v.currentTime;
      v.currentTime = Math.max(0, v.currentTime + seconds);
      return v.currentTime !== prev;
    }

    const f = getYouTubeIframe();
    if (!f) return false;

    // To seek properly, we need the current time from telemetry.
    // If telemetry hasn't fired yet, lastKnownTime is 0.
    // We send getCurrentTime to try to trigger an update.
    postCommand(f, 'getCurrentTime');

    // Use absolute seek: last_known + offset
    const target = Math.max(0, lastKnownTime + seconds);
    postCommand(f, 'seekTo', [target, true]);
    
    // Optimistically update cache for double-clicks
    lastKnownTime = target;
    
    return true;
  }

  // Auto-init on page load if iframe exists
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      const f = getYouTubeIframe();
      if (f) {
        postCommand(f, 'listening');
        postCommand(f, 'addEventListener', ['onStateChange']);
        postCommand(f, 'getCurrentTime');
      }
    }, 1000);
  }

  return { togglePlayPause, seekBy };
}
