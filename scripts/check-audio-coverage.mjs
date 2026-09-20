// node scripts/check-audio-coverage.mjs
//
// Build-time warning, not a build-time failure: the app is designed to run
// text-only when Bhashini audio hasn't been generated (see the comment atop
// src/content/strings.ts), so this never exits non-zero. It exists so a demo
// doesn't silently fall back to text-only without anyone noticing — it warns
// loudly on stdout during `npm run build` instead.
//
// Checks each public/content/lang/{lang}/manifest.json against the canonical
// key list in src/content/strings.ts for two kinds of drift:
//   1. missing  — a STRINGS key with no entry (or a null `file`) in the manifest
//   2. stale    — the manifest is older than strings.ts, so it was generated
//                 against a previous version of the string list
import fs from 'node:fs/promises';
import path from 'node:path';
import { isTextOnly } from './lib/textOnly.mjs';

const STRINGS_PATH = path.join('src', 'content', 'strings.ts');
const LANG_DIR = path.join('public', 'content', 'lang');

async function loadStringKeys() {
  const src = await fs.readFile(STRINGS_PATH, 'utf8');
  const keys = [];
  // Matches both `'quoted.key':` and `bare_key:` object-literal entries.
  const re = /^\s*(?:'([^']+)'|([A-Za-z_][\w.]*))\s*:\s*(['"])/gm;
  let m;
  while ((m = re.exec(src))) {
    keys.push(m[1] ?? m[2]);
  }
  return keys;
}

async function main() {
  const keys = await loadStringKeys();
  const stringsStat = await fs.stat(STRINGS_PATH);

  let langDirs;
  try {
    langDirs = (await fs.readdir(LANG_DIR, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name);
  } catch {
    console.warn(
      `\n[audio-coverage] No ${LANG_DIR} directory — no Bhashini audio has been generated. ` +
        `The app will run text-only for every string. Run \`npm run generate-audio\` to fix. (Not a build error.)\n`
    );
    return;
  }

  if (langDirs.length === 0) {
    console.warn(`\n[audio-coverage] ${LANG_DIR} exists but has no language folders. Text-only fallback active.\n`);
    return;
  }

  let anyIssue = false;

  for (const lang of langDirs) {
    const manifestPath = path.join(LANG_DIR, lang, 'manifest.json');
    let manifest;
    let manifestStat;
    try {
      manifestStat = await fs.stat(manifestPath);
      manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
    } catch {
      console.warn(`[audio-coverage] ${lang}: no manifest.json — text-only fallback for this language.`);
      anyIssue = true;
      continue;
    }

    // Text-only keys are read, never spoken — a null `file` is correct for them.
    const missing = keys.filter((k) => !isTextOnly(k) && (!manifest[k] || !manifest[k].file));
    const stale = manifestStat.mtimeMs < stringsStat.mtimeMs;

    if (missing.length > 0) {
      anyIssue = true;
      console.warn(
        `[audio-coverage] ${lang}: ${missing.length}/${keys.length} strings have no audio (text-only fallback): ` +
          missing.join(', ')
      );
    }
    if (stale) {
      anyIssue = true;
      console.warn(
        `[audio-coverage] ${lang}: manifest.json is OLDER than src/content/strings.ts — ` +
          `it was generated against a previous string list. Re-run \`npm run generate-audio\`.`
      );
    }
    if (missing.length === 0 && !stale) {
      console.log(`[audio-coverage] ${lang}: OK — all ${keys.length} strings covered, manifest up to date.`);
    }
  }

  if (anyIssue) {
    console.warn('[audio-coverage] Some strings will render as text-only, not silent — see src/lib/audio.ts. Not a build error.\n');
  }
}

main().catch((e) => {
  // Never fail the build over a warning check.
  console.warn('[audio-coverage] check skipped:', e.message);
});
