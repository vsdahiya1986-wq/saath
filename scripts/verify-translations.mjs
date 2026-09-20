// node scripts/verify-translations.mjs           — the gate (offline, runs in CI)
// node scripts/verify-translations.mjs --run     — translate + verify (needs BHASHINI_API_KEY)
//
// 07_TRANSLATION_AND_REMAINING.md §1.4: with no native reviewer before the
// deadline, every Assamese string is checked by machine instead:
//   1. EN → AS with engine A (Bhashini translation, en→as).
//   2. AS → EN with engine B, a different model (Bhashini's as→en; see ENGINE_B).
//   3. Compare the round trip with the original: meaning (sentence-embedding
//      cosine) and words (token overlap).
//   4. Denylist: concepts that must never reach this screen, in either language.
//   5. Length: Assamese more than LEN_MAX × the English is flagged — it clips.
// A FAIL keeps the English on screen and has no Assamese audio. English is
// honest; wrong Assamese is not.
//
// --run writes docs/i18n-review.json (read by generate-audio.mjs, which only
// voices PASS translations) and docs/i18n-review.md (for people).
// The gate re-checks what actually ships: every Assamese string in the
// manifest must have a PASS record for exactly this English and this Assamese.
import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { STRINGS } from '../src/content/strings.ts';
import { fixApostrophes } from './lib/fixApostrophes.mjs';

/**
 * Fix pack 12: a second target locale, same mechanism. Each language has its
 * own review files and its own denylist in its own script; nothing else about
 * the pipeline changes, and Hindi is translated from the same de-idiomed
 * English source as Assamese — never from the Assamese, which would compound
 * whatever drift the first hop introduced.
 */
export const TARGETS = {
  as: { name: 'Assamese', review: 'docs/i18n-review.json', md: 'docs/i18n-review.md' },
  hi: { name: 'Hindi', review: 'docs/i18n-review.hi.json', md: 'docs/i18n-review.hi.md' },
};

const manifestFor = (lang) => `public/content/lang/${lang}/manifest.json`;

export const SIM_MIN = 0.75;
export const LEXICAL_MIN = 0.5;
export const LEN_MAX = 1.8;

/** Seeded from 07 §1.4; extend as new failures are found. Substring match. */
export const DENY_AS = ['অস্ত্ৰ', 'সৈন্য', 'যুদ্ধ', 'আক্ৰমণ', 'মৃত্যু', 'ৰোগ', 'পাগল'];
/** The same concepts in Devanagari, for the Hindi target (fix pack 12). */
export const DENY_HI = ['हथियार', 'शस्त्र', 'सैनिक', 'सेना', 'युद्ध', 'हमला', 'आक्रमण', 'मौत', 'मृत्यु', 'बीमारी', 'रोग', 'पागल'];
export const DENY_FOR = { as: DENY_AS, hi: DENY_HI };
/** The same concepts in the round-tripped English — catches a synonym the Assamese list misses. */
export const DENY_EN = /\b(weapons?|armed|soldiers?|war|attack\w*|death|dead|die|disease\w*|mad|crazy|insane)\b/i;

/**
 * Keys a person flagged by reading — not a native speaker, so a doubt, not a
 * verdict. They stay on the human-review list whatever the round trip says.
 */
export const HUMAN_FLAGS = {
  'opt.bucket.around_house': '08 item 6: was "সাজু হৈ গৈ আছে" (reads as "getting ready"); English source changed to "Elsewhere in the house".',
  'q.sort_home.where': '08 item 6: was "এইটো ক\'ত আছে?" ("where is this?") for "where does this belong?"; English source changed to "Where should this go?".',
};

// IndicTrans2 (07 §1.3) is the intended engine B, but its Hugging Face models
// are gated (401 without an accepted licence and a token) and need PyTorch.
// Until then engine B is Bhashini's as→en model — a separately trained model
// from the en→as one (IndicTrans2 itself ships them as two models), not the
// same model run backwards.
const engineA = (lang) => `Bhashini translation en→${lang}`;
const engineB = (lang) => `Bhashini translation ${lang}→en`;

const STOP = new Set('a an the is are am to of in on at for it this that and or you your we us let be do does will there here'.split(' '));
const tokens = (s) => new Set(s.toLowerCase().normalize('NFKD').replace(/[^a-z\s]/g, ' ').split(/\s+/).filter((w) => w && !STOP.has(w)));

/** Share of the original's content words that survived the round trip. */
export function lexical(en, back) {
  const a = tokens(en);
  if (!a.size) return 1;
  const b = tokens(back);
  return [...a].filter((w) => b.has(w)).length / a.size;
}

export function denied(en, as, back, lang = 'as') {
  const hit = (DENY_FOR[lang] ?? DENY_AS).find((w) => as.includes(w));
  if (hit) return `${TARGETS[lang]?.name ?? 'Assamese'} contains ${hit}`;
  const m = back.match(DENY_EN);
  if (m && !DENY_EN.test(en)) return `round trip says "${m[0]}"`;
  return null;
}

export function verdictFor({ en, as, back, sim, lang = 'as' }) {
  const deny = denied(en, as, back, lang);
  const lex = lexical(en, back);
  // Divergence needs both signals: a one-word label can round-trip as a
  // different form of the same word ("Play" → "will play"), which dents the
  // embedding score while the words still match.
  const fail = !!deny || (sim < SIM_MIN && lex < LEXICAL_MIN);
  return { lexical: Number(lex.toFixed(2)), deny, long: as.length > LEN_MAX * en.length, verdict: fail ? 'FAIL' : 'PASS' };
}

async function bhashini(text, src, tgt) {
  const res = await fetch('https://dhruva-api.bhashini.gov.in/services/inference/pipeline', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: process.env.BHASHINI_API_KEY },
    body: JSON.stringify({
      pipelineTasks: [{ taskType: 'translation', config: { language: { sourceLanguage: src, targetLanguage: tgt } } }],
      inputData: { input: [{ source: text }] },
    }),
  });
  if (!res.ok) throw new Error(`Bhashini ${res.status}: ${await res.text()}`);
  const out = (await res.json()).pipelineResponse?.[0]?.output?.[0]?.target;
  if (!out) throw new Error('empty translation');
  return fixApostrophes(out);
}

async function run(lang) {
  const target = TARGETS[lang];
  if (!process.env.BHASHINI_API_KEY) {
    console.error('Missing BHASHINI_API_KEY — cannot translate. Nothing was changed; the English fallback stays active.');
    process.exit(1);
  }
  const { pipeline } = await import('@huggingface/transformers');
  const embed = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { dtype: 'q8' });
  const vec = async (s) => (await embed(s, { pooling: 'mean', normalize: true })).data;
  const cosine = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);

  // Incremental: an entry whose English is unchanged and that did not error is
  // kept as is. `--all` re-translates everything from scratch.
  const previous = process.argv.includes('--all') ? {} : (JSON.parse(await fs.readFile(target.review, 'utf8').catch(() => 'null'))?.entries ?? {});
  const entries = {};
  for (const [key, en] of Object.entries(STRINGS)) {
    const prev = previous[key];
    if (prev && prev.en === en && !prev.error) {
      entries[key] = prev;
      continue;
    }
    try {
      // Always from the English source, never from another translation.
      const as = await bhashini(en, 'en', lang);
      const back = await bhashini(as, lang, 'en');
      const sim = Number(cosine(await vec(en), await vec(back)).toFixed(2));
      entries[key] = { en, as, back, sim, ...verdictFor({ en, as, back, sim, lang }) };
    } catch (e) {
      entries[key] = { en, as: null, back: null, sim: null, lexical: null, deny: null, long: false, verdict: 'FAIL', error: e.message };
    }
    const r = entries[key];
    console.log(`${r.verdict}  ${key}  ${r.sim ?? '-'}  ${r.as ?? r.error}`);
  }

  const review = { generated_at: new Date().toISOString(), lang, engine_a: engineA(lang), engine_b: engineB(lang), thresholds: { SIM_MIN, LEXICAL_MIN, LEN_MAX }, entries };
  await fs.writeFile(target.review, JSON.stringify(review, null, 2) + '\n');
  await fs.writeFile(target.md, markdown(review));
  const fails = Object.values(entries).filter((e) => e.verdict === 'FAIL').length;
  const n = Object.keys(entries).length;
  console.log(`\n${target.name}: ${n - fails}/${n} verified (${Math.round(((n - fails) / n) * 100)}%). ${fails} fall back to English. Now run npm run generate-audio.`);
}

const cell = (s) => String(s ?? '—').replace(/\|/g, '\\|');

function markdown({ generated_at, lang = 'as', engine_a, engine_b, thresholds, entries }) {
  const name = TARGETS[lang].name;
  const all = Object.entries(entries);
  const fails = all.filter(([, e]) => e.verdict === 'FAIL');
  // The read-flags were raised against the Assamese wording only.
  const flagged = lang === 'as' ? Object.entries(HUMAN_FLAGS).filter(([k]) => entries[k]) : [];
  const long = all.filter(([, e]) => e.long && e.verdict === 'PASS');
  const row = ([k, e]) => `| \`${k}\` | ${cell(e.en)} | ${cell(e.as)} | ${cell(e.back)} | ${e.sim ?? '—'} | ${e.lexical ?? '—'} | ${e.verdict}${e.deny ? ` (${cell(e.deny)})` : ''}${e.error ? ` (${cell(e.error)})` : ''}${e.long ? ' · LONG' : ''} |`;
  const head = `| key | English | ${name} | round-trip English | similarity | word overlap | verdict |\n| --- | --- | --- | --- | --- | --- | --- |`;
  return `# ${name} translation review

Generated ${generated_at} by \`node scripts/verify-translations.mjs --run\`. Do not edit by hand.

- Engine A: ${engine_a}. Engine B: ${engine_b}. IndicTrans2 is the intended engine B but its models are gated; see the script header.
- FAIL = a denylisted concept, or the round trip diverges on **both** meaning (similarity < ${thresholds.SIM_MIN}) and words (overlap < ${thresholds.LEXICAL_MIN}).
- A FAIL shows its English on screen and has no ${name} audio. LONG = more than ${thresholds.LEN_MAX}× the English length (may clip).

**${all.length - fails.length}/${all.length} verified (${Math.round(((all.length - fails.length) / all.length) * 100)}%). ${fails.length} fall back to English.**

## Needs human review (${fails.length})

${fails.length ? `${head}\n${fails.map(row).join('\n')}` : 'None.'}

### Flagged by reading (${flagged.length})

Flagged by a person reading the screen, not by a native speaker — kept here for review even when the round trip passes.

${flagged.length ? `| key | why | current ${name} | verdict |\n| --- | --- | --- | --- |\n${flagged.map(([k, why]) => `| \`${k}\` | ${cell(why)} | ${cell(entries[k].as)} | ${entries[k].verdict} |`).join('\n')}` : 'None.'}

## Passed but long — check for clipping (${long.length})

${long.length ? `${head}\n${long.map(row).join('\n')}` : 'None.'}

## Every key

${head}
${all.map(row).join('\n')}
`;
}

/** Offline: what ships in each locale's manifest must be exactly what was verified. */
async function gateOne(lang) {
  const target = TARGETS[lang];
  const review = JSON.parse(await fs.readFile(target.review, 'utf8').catch(() => 'null'));
  const manifest = JSON.parse(await fs.readFile(manifestFor(lang), 'utf8').catch(() => 'null'));
  const problems = [];
  if (!review) problems.push(`${target.review} is missing — run with --run --lang=${lang} first.`);
  if (!manifest) {
    problems.push(`${manifestFor(lang)} is missing — run generate-audio.`);
    return { problems, shown: 0 };
  }

  for (const [key, en] of Object.entries(STRINGS)) {
    const shown = manifest[key]?.text;
    if (shown === undefined) {
      problems.push(`${lang} ${key}: not in the ${target.name} manifest (run generate-audio)`);
      continue;
    }
    const hit = DENY_FOR[lang].find((w) => shown.includes(w));
    if (hit) problems.push(`${lang} ${key}: shows denylisted ${hit}`);
    if (shown === en) continue; // English fallback: honest by definition
    const r = review?.entries[key];
    if (!r || r.verdict !== 'PASS') problems.push(`${lang} ${key}: shows ${target.name} that did not pass verification`);
    else if (r.en !== en) problems.push(`${lang} ${key}: English changed since it was verified — re-run --run --lang=${lang}`);
    else if (r.as !== shown) problems.push(`${lang} ${key}: shows ${target.name} that differs from the verified text`);
  }
  return { problems, shown: Object.keys(STRINGS).filter((k) => manifest[k]?.text !== undefined && manifest[k].text !== STRINGS[k]).length };
}

async function gate() {
  const results = await Promise.all(Object.keys(TARGETS).map(async (lang) => [lang, await gateOne(lang)]));
  const problems = results.flatMap(([, r]) => r.problems);
  if (problems.length) {
    console.error(`verify-translations: ${problems.length} problem(s)` + `
  ` + problems.join(`
  `));
    process.exit(1);
  }
  const total = Object.keys(STRINGS).length;
  const summary = results.map(([lang, r]) => `${TARGETS[lang].name} ${r.shown}/${total} (${total - r.shown} English fallback)`).join('; ');
  console.log(`verify-translations: OK — ${summary}. Every shown string was verified.`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const arg = process.argv.find((a) => a.startsWith('--lang='));
  const langs = arg ? arg.slice('--lang='.length).split(',') : Object.keys(TARGETS);
  const bad = langs.filter((l) => !TARGETS[l]);
  if (bad.length) {
    console.error(`Unknown language: ${bad.join(', ')}. Known: ${Object.keys(TARGETS).join(', ')}.`);
    process.exit(1);
  }
  const work = process.argv.includes('--run') ? (async () => {
    for (const lang of langs) await run(lang);
  })() : gate();
  work.catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
