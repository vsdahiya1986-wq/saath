// node scripts/generate-audio.mjs
//
// Build-time only. Requires BHASHINI_API_KEY — a dashboard-issued inference
// key from bhashini.gov.in tied to a specific pipeline of tasks (TTS/
// translation per language) the user selected when creating that pipeline.
// Generates audio once, ships the files, plays offline forever — see
// src/lib/audio.ts / i18n.ts.
//
// BHASHINI_USER_ID / BHASHINI_PIPELINE_ID are NOT used here. Those belong to
// the *other* Bhashini auth flow — raw ULCA credentials calling
// meity-auth.ulcacontrib.org/.../getModelsPipeline for service discovery.
// A dashboard inference key skips that: it's called directly against
// dhruva-api.bhashini.gov.in and only works for the tasks/languages already
// attached to that key's pipeline in the dashboard UI. If a task 500s with
// "DHRUVA-101: Failed to send request", that task isn't attached to this
// key's pipeline — add it in the Bhashini dashboard, it's not a code bug.
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

if (!API_KEY) {
  console.error('Missing BHASHINI_API_KEY. See .env.local.example.');
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
  'home.circle': 'Circle',
  'home.circle.sub': 'The people looking out for you',
  'home.help.ok': 'No help needed right now',
  'activity.familiar_pairs': 'Today & Me',
  'activity.sound_sight': 'Hear & Find',
  'activity.pattern_garden': 'Sort the Home',
  'activity.my_next_step': 'My Next Step',
  'activity.together': 'Together Moment',
  'domain.memory': 'Memory',
  'domain.attention': 'Attention & Concentration',
  'domain.routine': 'Daily Routine Recall',
  'domain.pattern': 'Pattern & Object Recognition',
  'domain.emotion': 'Emotional Engagement',
  'status.offline': 'Working offline',
  'status.synced': 'Synced',
  'status.syncing': 'Syncing…',
  'adaptive.learned': 'Adapting to you',
  'adaptive.baseline': 'Standard pace',
  'play.title': 'Choose an activity',
  'play.pairs.intro': 'Let us talk about today. Choose the answer that feels right. There is no hurry.',
  'play.sound.intro': 'Listen to the word, then tap the matching picture.',
  'play.pattern.intro': 'Where does this belong? Tap the right basket.',
  'play.step.intro': 'Put the steps of your routine in order.',
  'play.together.intro': 'Let us look at this picture together.',
  'cue.repeat': 'Let me say that again.',
  'cue.highlight': 'Look here.',
  'cue.reduce': 'Let us try with fewer choices.',
  'cue.demonstrate': 'Watch how it is done, then you try.',
  'common.pause': 'Paused. Tap to continue, or choose Stop.',
  'common.stop': 'We can stop here. That is completely fine.',
  'common.open': 'Open',
  'common.pause_btn': 'Pause',
  'common.skip_btn': 'Skip',
  'common.stop_btn': 'Stop',
  'common.back': 'Back',
  'common.home': 'Home',
  'common.continue': 'Continue',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'a11y.listen': 'Listen',
  'help.title': 'Help',
  'help.need': 'I need someone',
  'help.sent_local': 'Your family has been told on this network.',
  'help.stored': 'Saved on this device. It will be sent when there is a connection.',
  'help.stale_warning': 'This may not show where it really is right now.',
  'today.title': "Today's reminders",
  'remind.medicine': 'It is time for your medicine.',
  'remind.hydration': 'Time for a glass of water.',
  'remind.activity': 'Time for your daily activity.',
  'remind.appointment': 'You have a clinic appointment.',
  'exit.pause': 'Pause',
  'exit.skip': 'Skip',
  'exit.stop': 'Stop',
  'common.home': 'Home',
  'game.well_done': 'Well done. That was lovely.',
  'game.gentle_end': 'That is completely fine. We can try again another time.',
  'game.try_again': 'Not quite. Let us try another one.',
  'game.good': 'Yes, that is right.',
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
  const failures = {};

  for (const lang of ['as', 'en']) {
    const dir = path.join('public', 'content', 'lang', lang);
    await fs.mkdir(dir, { recursive: true });
    const manifest = {};
    failures[lang] = [];

    for (const [key, en] of Object.entries(STRINGS)) {
      let text = en;
      if (lang !== 'en') {
        try {
          text = await translate(en, lang);
        } catch (e) {
          console.error(`  ${lang}/${key}: translation failed — ${e.message}`);
          failures[lang].push(key);
          manifest[key] = { file: null, text: en };
          continue;
        }
      }

      try {
        const wav = await tts(text, lang);
        const file = `${key.replace(/\./g, '_')}.wav`;
        await fs.writeFile(path.join(dir, file), wav);
        manifest[key] = { file, text };
        console.log(`  ${lang}/${file}`);
      } catch (e) {
        console.error(`  ${lang}/${key}: TTS failed — ${e.message}`);
        failures[lang].push(key);
        // Keep the translated text even without audio — playCue() no-ops on
        // a null file and the app falls back to on-screen/read text.
        manifest[key] = { file: null, text };
      }
      await new Promise((r) => setTimeout(r, 300)); // be polite to the API
    }
    await fs.writeFile(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  }

  console.log('\n--- generate-audio summary ---');
  for (const [lang, keys] of Object.entries(failures)) {
    if (keys.length === 0) {
      console.log(`${lang}: all ${Object.keys(STRINGS).length} strings generated with audio.`);
    } else {
      console.log(
        `${lang}: ${keys.length}/${Object.keys(STRINGS).length} strings have NO audio (text-only fallback) — ` +
          `${keys.join(', ')}`
      );
      console.log(
        `  Likely cause: this task/language isn't attached to the BHASHINI_API_KEY's pipeline in the ` +
          `Bhashini dashboard. Add it there, then re-run this script — no code change needed.`
      );
    }
  }

  const anyFailures = Object.values(failures).some((k) => k.length > 0);
  if (anyFailures) process.exitCode = 1; // signal partial success without discarding what did generate
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
