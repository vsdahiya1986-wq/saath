/**
 * Keys that ship translated text but no recording.
 *
 * The caregiver screens are read, never spoken: a family member reads "Why
 * these activities", "What we keep, and where" and the Circle counts on
 * screen. Voicing them would add dozens of WAV files per language to the repo
 * for audio no one plays. The elder's own strings — `mood.*` on the completion
 * screen included — are not in this list and are voiced as usual. The text still goes through the same translate →
 * round-trip → verify gate as everything else; only the TTS step is skipped,
 * and `playCue()` already no-ops on a null file.
 */
const TEXT_ONLY_PREFIXES = ['why.', 'privacy.', 'strip.', 'trend.', 'day.'];

export function isTextOnly(key) {
  return TEXT_ONLY_PREFIXES.some((p) => key.startsWith(p));
}
