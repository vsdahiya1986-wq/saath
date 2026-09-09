import { playCue } from './audio';
import type { Lang } from './db';

export type VoiceNavHandlers = {
  onNext: () => void;
  onPrev: () => void;
  onSelect: () => void;
  onRepeat: () => void;
  onHome: () => void;
};

const SWIPE_MIN_PX = 60;
const LONG_PRESS_MS = 1500;
const DOUBLE_TAP_MS = 400;

/**
 * Global gesture contract, identical on every screen (F4 / Part 21):
 * single tap = repeat · swipe right = next · swipe left = previous ·
 * double-tap = select · long-press 1.5s = home.
 */
export function attachVoiceNav(root: HTMLElement, h: VoiceNavHandlers): () => void {
  let sx = 0,
    sy = 0,
    st = 0;
  let lastTap = 0;
  let longTimer: ReturnType<typeof setTimeout> | undefined;

  const start = (e: TouchEvent) => {
    const touch = e.touches[0];
    sx = touch.clientX;
    sy = touch.clientY;
    st = Date.now();
    longTimer = setTimeout(() => {
      longTimer = undefined;
      h.onHome();
    }, LONG_PRESS_MS);
  };

  const end = (e: TouchEvent) => {
    if (longTimer) {
      clearTimeout(longTimer);
      longTimer = undefined;
    } else return; // long press already fired

    const touch = e.changedTouches[0];
    const dx = touch.clientX - sx;
    const dy = touch.clientY - sy;

    if (Math.abs(dx) > SWIPE_MIN_PX && Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) h.onNext();
      else h.onPrev();
      return;
    }
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20 && Date.now() - st < 500) {
      const now = Date.now();
      if (now - lastTap < DOUBLE_TAP_MS) {
        lastTap = 0;
        h.onSelect();
      } else {
        lastTap = now;
        setTimeout(() => {
          if (lastTap) {
            lastTap = 0;
            h.onRepeat();
          }
        }, DOUBLE_TAP_MS);
      }
    }
  };

  root.addEventListener('touchstart', start, { passive: true });
  root.addEventListener('touchend', end, { passive: true });
  return () => {
    root.removeEventListener('touchstart', start);
    root.removeEventListener('touchend', end);
  };
}

/** Auto-announce on every screen change. Cached audio => works offline. */
export async function announce(cueKey: string, lang: Lang) {
  await playCue(cueKey, lang);
}
