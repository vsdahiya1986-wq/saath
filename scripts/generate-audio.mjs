// node scripts/generate-audio.mjs
//
// Build-time only. Requires BHASHINI_API_KEY, BHASHINI_USER_ID,
// BHASHINI_PIPELINE_ID (register at bhashini.gov.in). Generates audio once,
// ships the files, plays offline forever — see src/lib/audio.ts / i18n.ts.
//
// Writes to public/content/lang/{lang}/ (NOT src/content) because the app
// fetches these at runtime from a root-relative path that Next.js only
// serves out of public/ in a static export.
//
// Keep STRINGS here in sync with src/content/strings.ts by hand — this is a
// plain Node script run only when credentials exist, not part of the app
// bundle, so it does not import TypeScript.
import fs from 'node:fs/promises';
import path from 'node:path';

const API_KEY = process.env.BHASHINI_API_KEY;
const PIPELINE = process.env.BHASHINI_PIPELINE_ID;

if (!API_KEY || !PIPELINE) {
  console.error('Missing BHASHINI_API_KEY / BHASHINI_PIPELINE_ID. See .env.local.example.');
  process.exit(1);
}

const STRINGS = {
  'home.title': 'SAATH',
  home_intro: 'This is your memory companion. Choose Play, Help, or Today.',
  'home.play': 'Play',
  'home.play.sub': 'A familiar activity',
  'home.help': 'Help',
  'home.help.sub': 'Get help with something',
  'home.today': 'Today',
  'home.today.sub': "Today's reminders",
  'activity.familiar_pairs': 'Familiar Pairs',
  'activity.sound_sight': 'Sound & Sight',
  'activity.pattern_garden': 'Pattern Garden',
  'activity.my_next_step': 'My Next Step',
  'activity.together': 'Together Moment',
  'play.title': 'Choose an activity',
  'play.pairs.intro': 'Find the two pictures that are the same. Take your time.',
  'play.sound.intro': 'Listen to the sound, then choose the matching picture.',
  'play.pattern.intro': 'Look at the shapes and choose what comes next.',
  'play.step.intro': 'Put the steps of your routine in order.',
  'play.together.intro': 'Let us look at this picture together.',
  'cue.repeat': 'Let me say that again.',
  'cue.highlight': 'Look here.',
  'cue.reduce': 'Let us try with fewer choices.',
  'cue.demonstrate': 'Watch how it is done, then you try.',
  'common.pause': 'Paused. Tap to continue, or choose Stop.',
  'common.stop': 'We can stop here. That is completely fine.',
  'common.open': 'Open',
  'a11y.listen': 'Listen',
  'help.need': 'I need someone',
  'help.sent_local': 'Your family has been told on this network.',
  'help.stored': 'Saved on this device. It will be sent when there is a connection.',
  'remind.medicine': 'It is time for your medicine.',
  'remind.hydration': 'Time for a glass of water.',
  'remind.activity': 'Time for your daily activity.',
  'remind.appointment': 'You have a clinic appointment.',
};

async function tts(text, lang) {
  const res = await fetch('https://dhruva-api.bhashini.gov.in/services/inference/pipeline', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: API_KEY },
    body: JSON.stringify({
      pipelineTasks: [
        { taskType: 'tts', config: { language: { sourceLanguage: lang }, gender: 'female', samplingRate: 16000 } },
      ],
      inputData: { input: [{ source: text }] },
    }),
  });
  if (!res.ok) throw new Error(`Bhashini ${res.status}: ${await res.text()}`);
  const json = await res.json();
  const b64 = json.pipelineResponse?.[0]?.audio?.[0]?.audioContent;
  if (!b64) throw new Error('No audio returned');
  return Buffer.from(b64, 'base64');
}

async function translate(text, target) {
  if (target === 'en') return text;
  const res = await fetch('https://dhruva-api.bhashini.gov.in/services/inference/pipeline', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: API_KEY },
    body: JSON.stringify({
      pipelineTasks: [{ taskType: 'translation', config: { language: { sourceLanguage: 'en', targetLanguage: target } } }],
      inputData: { input: [{ source: text }] },
    }),
  });
  const json = await res.json();
  return json.pipelineResponse?.[0]?.output?.[0]?.target ?? text;
}

async function main() {
  for (const lang of ['as', 'en']) {
    const dir = path.join('public', 'content', 'lang', lang);
    await fs.mkdir(dir, { recursive: true });
    const manifest = {};
    for (const [key, en] of Object.entries(STRINGS)) {
      const text = lang === 'en' ? en : await translate(en, lang);
      const wav = await tts(text, lang);
      const file = `${key.replace(/\./g, '_')}.wav`;
      await fs.writeFile(path.join(dir, file), wav);
      manifest[key] = { file, text };
      console.log(`  ${lang}/${file}`);
      await new Promise((r) => setTimeout(r, 300)); // be polite to the API
    }
    await fs.writeFile(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
