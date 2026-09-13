import { getBlob, putBlob, Lang } from './db';
import { loadManifest, audioFileFor, t } from './i18n';

/**
 * One voice channel for the whole app. Every sound goes through here, so two
 * things can never talk over each other:
 *  - playCue / speak / playPackAudio interrupt whatever is playing (a tap means "say this now").
 *  - queueAutoCue waits its turn and is dropped if the same key is already queued,
 *    playing, or was spoken moments ago (React dev double-mounts, re-renders).
 *  - stopAllAudio() is called on every route change (AudioRouteGuard).
 * Cues without a pre-generated Bhashini file fall back to the device's own
 * offline speech voice instead of going silent.
 */

type Job = { key: string; run: (gen: number) => Promise<void> };

let generation = 0;
let current: HTMLAudioElement | null = null;
let currentKey: string | null = null;
let queue: Job[] = [];
let pumping = false;
let directDone: Promise<void> = Promise.resolve();
const lastSpoken = new Map<string, number>();

const REPEAT_GUARD_MS = 4000;
const TAP_DEBOUNCE_MS = 600;

export function stopAllAudio() {
  generation++;
  queue = [];
  currentKey = null;
  if (current) {
    current.pause();
    current.src = '';
    current = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
}

function playSrc(src: string, gen: number): Promise<void> {
  return new Promise((resolve) => {
    if (gen !== generation) return resolve();
    const a = new Audio(src);
    current = a;
    const done = () => {
      if (current === a) current = null;
      resolve();
    };
    a.onended = done;
    a.onerror = done;
    a.onpause = done;
    a.play().catch(done);
  });
}

function pickVoice(lang: Lang): SpeechSynthesisVoice | null | undefined {
  const voices = window.speechSynthesis.getVoices();
  if (lang === 'as') return voices.find((v) => v.lang.toLowerCase().startsWith('as')) ?? voices.find((v) => v.lang.toLowerCase().startsWith('bn')) ?? null;
  return voices.find((v) => v.lang === 'en-IN') ?? voices.find((v) => v.lang.toLowerCase().startsWith('en')) ?? undefined;
}

function speakNow(text: string, lang: Lang, gen: number): Promise<void> {
  return new Promise((resolve) => {
    if (gen !== generation || typeof window === 'undefined' || !('speechSynthesis' in window) || !text) return resolve();
    const voice = pickVoice(lang);
    if (voice === null) return resolve(); // no voice for this language: stay silent rather than mispronounce
    const u = new SpeechSynthesisUtterance(text);
    if (voice) u.voice = voice;
    u.lang = voice?.lang ?? (lang === 'as' ? 'as-IN' : 'en-IN');
    u.rate = 0.88; // slower, clearer for older listeners
    u.pitch = 1;
    const safety = setTimeout(resolve, Math.max(3500, text.length * 110));
    u.onend = u.onerror = () => {
      clearTimeout(safety);
      resolve();
    };
    window.speechSynthesis.speak(u);
  });
}

async function renderCue(key: string, lang: Lang, gen: number) {
  await loadManifest(lang);
  if (gen !== generation) return;
  const file = audioFileFor(key, lang);
  if (file) await playSrc(`/content/lang/${lang}/${file}`, gen);
  else await speakNow(t(key, lang), lang, gen);
}

function recentlySaid(key: string, windowMs: number) {
  const at = lastSpoken.get(key);
  return at !== undefined && Date.now() - at < windowMs;
}

/** Say a fixed system cue now, interrupting anything else. */
export async function playCue(key: string, lang: Lang) {
  if (recentlySaid(key, TAP_DEBOUNCE_MS)) return;
  stopAllAudio();
  const gen = generation;
  lastSpoken.set(key, Date.now());
  currentKey = key;
  directDone = renderCue(key, lang, gen).catch(() => {});
  await directDone;
}

/** Say free text now (dynamic prompts like "Find the comb"), interrupting anything else. */
export async function speak(text: string, lang: Lang) {
  const key = `text:${text}`;
  if (recentlySaid(key, TAP_DEBOUNCE_MS)) return;
  stopAllAudio();
  const gen = generation;
  lastSpoken.set(key, Date.now());
  currentKey = key;
  directDone = speakNow(text, lang, gen);
  await directDone;
}

async function pump() {
  if (pumping) return;
  pumping = true;
  while (queue.length) {
    await directDone;
    const job = queue.shift();
    if (!job) break;
    const gen = generation;
    currentKey = job.key;
    lastSpoken.set(job.key, Date.now());
    await job.run(gen).catch(() => {});
    if (gen === generation) currentKey = null;
  }
  pumping = false;
}

/** Announce a cue when a screen appears — waits its turn, never duplicates. */
export function queueAutoCue(key: string, lang: Lang) {
  if (currentKey === key || queue.some((j) => j.key === key) || recentlySaid(key, REPEAT_GUARD_MS)) return;
  queue.push({ key, run: (gen) => renderCue(key, lang, gen) });
  pump();
}

/** Queue free text the same way as queueAutoCue. */
export function queueSpeak(text: string, lang: Lang) {
  const key = `text:${text}`;
  if (currentKey === key || queue.some((j) => j.key === key) || recentlySaid(key, REPEAT_GUARD_MS)) return;
  queue.push({ key, run: (gen) => speakNow(text, lang, gen) });
  pump();
}

/** Personal content: the family member's own recorded voice. */
export async function playPackAudio(audioKey?: string) {
  if (!audioKey || recentlySaid(`pack:${audioKey}`, TAP_DEBOUNCE_MS)) return;
  const blob = await getBlob(audioKey);
  if (!blob) return;
  stopAllAudio();
  const gen = generation;
  lastSpoken.set(`pack:${audioKey}`, Date.now());
  const url = URL.createObjectURL(blob);
  directDone = playSrc(url, gen);
  await directDone;
  URL.revokeObjectURL(url);
}

/** Manual start/stop recording. No fixed timeout. */
export class VoiceRecorder {
  private rec?: MediaRecorder;
  private chunks: Blob[] = [];
  private stream?: MediaStream;

  async start() {
    stopAllAudio();
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
