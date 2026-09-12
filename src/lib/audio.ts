import { getBlob, putBlob, Lang } from './db';
import { loadManifest, audioFileFor } from './i18n';

/** Fixed system cue: cached Bhashini audio if generated, otherwise silent no-op. */
export async function playCue(key: string, lang: Lang) {
  await loadManifest(lang);
  const file = audioFileFor(key, lang);
  if (!file) return; // not generated yet — see scripts/generate-audio.mjs
  const a = new Audio(`/content/lang/${lang}/${file}`);
  await a.play().catch(() => {});
}

/**
 * Serialized queue for cues that should play automatically as a screen
 * enters (non-literate users, "hear before choosing"). A plain playCue()
 * call from each mounting card would overlap; chaining onto one promise
 * makes them play one after another in mount order instead. Manual replay
 * (the per-card "listen" button) still calls playCue() directly and is
 * unaffected — this queue only serializes the automatic announcements.
 *
 * Platform note, verified by real testing (not assumed): Chrome's autoplay
 * policy silently blocks unmuted audio.play() calls that don't originate
 * from a user gesture — confirmed here by comparing network activity: a
 * manual "listen" tap fetches the audio file immediately, a useEffect-driven
 * auto-cue on a cold, never-interacted-with tab does not fetch it at all.
 * This queue's calls are unaffected on the app's actual shipping targets —
 * Capacitor's Android WebView explicitly disables the gesture requirement
 * (`setMediaPlaybackRequiresUserGesture(false)` in Bridge.java), and Chrome
 * grants the same exemption to an installed/standalone PWA (see
 * public/manifest.json's `display: "standalone"`) — but will stay silent if
 * this build is opened as a bare, never-interacted-with browser tab, which
 * is a browser security policy no web app can override, not a bug here.
 */
let autoCueQueue: Promise<void> = Promise.resolve();

export function queueAutoCue(key: string, lang: Lang) {
  autoCueQueue = autoCueQueue.then(() => playCue(key, lang)).catch(() => {});
}

/** Personal content: the family member's own recorded voice. */
export async function playPackAudio(audioKey: string) {
  const blob = await getBlob(audioKey);
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const a = new Audio(url);
  a.onended = () => URL.revokeObjectURL(url);
  await a.play().catch(() => URL.revokeObjectURL(url));
}

/** Manual start/stop recording. No fixed timeout. */
export class VoiceRecorder {
  private rec?: MediaRecorder;
  private chunks: Blob[] = [];
  private stream?: MediaStream;

  async start() {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find((t) => MediaRecorder.isTypeSupported(t)) || '';
    this.rec = new MediaRecorder(this.stream, mime ? { mimeType: mime } : {});
    this.chunks = [];
    this.rec.ondataavailable = (e) => {
      if (e.data.size) this.chunks.push(e.data);
    };
    this.rec.start();
  }

  async stopAndSave(audioKey: string): Promise<void> {
    return new Promise((resolve) => {
      if (!this.rec) return resolve();
      this.rec.onstop = async () => {
        this.stream?.getTracks().forEach((t) => t.stop());
        const blob = new Blob(this.chunks, { type: this.rec!.mimeType || 'audio/webm' });
        await putBlob(audioKey, blob);
        resolve();
      };
      this.rec.stop();
    });
  }
}
