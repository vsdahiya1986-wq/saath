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
