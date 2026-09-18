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
import { fixApostrophes } from './lib/fixApostrophes.mjs';

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
  'activity.saah_pat': 'Saah Pat · Tea Leaf',
  'activity.apon_mukh': 'Apon Mukh · Dear Faces',
  'play.today_three': "Today's three",
  'play.all_activities': 'All activities',
  'display.text_size': 'Text size',
  'rest.title': 'Shall we rest for a while?',
  'rest.rest_now': 'Rest now',
  'rest.one_more': 'One more',
  'domain.memory': 'Memory',
  'domain.attention': 'Attention & Concentration',
  'domain.routine': 'Daily Routine Recall',
  'domain.pattern': 'Pattern & Object Recognition',
  'domain.emotion': 'Emotional Engagement',
  'status.offline': 'Working offline',
  'status.synced': 'Synced',
  'status.syncing': 'Syncing…',
  'status.no_signal': 'No-Signal Mode',
  'adaptive.same': 'Same pace as last time',
  'adaptive.easier': 'A gentler round today',
  'adaptive.harder': 'A little more today',
  'adaptive.with_help': 'With a little help today',
  'play.title': 'Choose an activity',
  'play.pairs.intro': 'Let us talk about today. Choose the answer that feels right. There is no hurry.',
  'play.sound.intro': 'Listen to the word, then tap the matching picture.',
  'play.pattern.intro': 'Where does this belong? Tap the right basket.',
  'play.step.intro': 'Put the steps of your routine in order.',
  'play.together.intro': 'Let us look at this picture together.',
  'play.saah_pat.intro': 'Find the sprigs with two leaves and a bud. Tap each one you see. There is no hurry.',
  'play.apon_mukh.intro': 'Turn over two cards and find the pairs.',
  'game.not_this_one': 'Not this one.',
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
  'remind.done': 'Done',
  'remind.not_now': 'Not now',
  'exit.pause': 'Pause',
  'exit.skip_one': 'Skip this one',
  'exit.end': 'End',
  'game.well_done': 'Well done. That was lovely.',
  'game.gentle_end': 'That is completely fine. We can try again another time.',
  'game.look_again': 'Let us look again.',
  'game.good': 'Yes, that is right.',
  // Fix pack A1/A2 (Sept 2026): activity content and screen text, so nothing
  // elder-facing renders as a bare English literal on an Assamese profile.
  'q.today_me.part_of_day': "What part of the day is it now?",
  'q.today_me.season': "Which season are we in?",
  'q.today_me.weekday': "What day of the week is it today?",
  'q.today_me.month': "Which month are we in?",
  'opt.period.morning': "Morning",
  'opt.period.afternoon': "Afternoon",
  'opt.period.evening': "Evening",
  'opt.period.night': "Night",
  'opt.season.spring': "Spring",
  'opt.season.summer': "Summer",
  'opt.season.monsoon': "Monsoon",
  'opt.season.autumn': "Autumn",
  'opt.season.winter': "Winter",
  'opt.weekday.sunday': "Sunday",
  'opt.weekday.monday': "Monday",
  'opt.weekday.tuesday': "Tuesday",
  'opt.weekday.wednesday': "Wednesday",
  'opt.weekday.thursday': "Thursday",
  'opt.weekday.friday': "Friday",
  'opt.weekday.saturday': "Saturday",
  'opt.month.january': "January",
  'opt.month.february': "February",
  'opt.month.march': "March",
  'opt.month.april': "April",
  'opt.month.may': "May",
  'opt.month.june': "June",
  'opt.month.july': "July",
  'opt.month.august': "August",
  'opt.month.september': "September",
  'opt.month.october': "October",
  'opt.month.november': "November",
  'opt.month.december': "December",
  'done.today': "Today",
  'done.date': "Date",
  'done.season': "Season",
  'done.time_of_day': "Time of day",
  'opt.bucket.kitchen': "Kitchen",
  'opt.bucket.getting_ready': "Getting ready",
  'opt.bucket.around_house': "Around the house",
  'item.reg_tumbler': "Steel tumbler",
  'item.reg_kettle': "Tea kettle",
  'item.reg_thali': "Thali plate",
  'item.reg_ghoti': "Water pot",
  'item.reg_comb': "Comb",
  'item.reg_mirror': "Mirror",
  'item.reg_slipper': "Slippers",
  'item.reg_jhola': "Cloth bag",
  'item.reg_umbrella': "Japi hat",
  'item.reg_broom': "Broom",
  'item.reg_torch': "Torch",
  'item.reg_keylock': "Lock and key",
  'item.reg_lamp': "Diya lamp",
  'item.reg_stool': "Mora stool",
  'item.reg_pankha': "Hand fan",
  'item.reg_basket': "Bamboo basket",
  'item.reg_dhekia': "Dhekia greens",
  'item.reg_claypot': "Clay water pot",
  'item.reg_areca': "Areca nut plate",
  'item.reg_ricepot': "Rice pot",
  'item.reg_gamosa': "Gamosa",
  'item.reg_xorai': "Xorai",
  'item.reg_net': "Fishing net",
  'item.reg_loom': "Weaving loom",
  'routine.reg_morning_routine': "Morning routine",
  'step.reg_morning_routine.wake': "Wake up",
  'step.reg_morning_routine.medicine': "Take medicine",
  'step.reg_morning_routine.wash': "Wash up",
  'step.reg_morning_routine.breakfast': "Have breakfast",
  'routine.reg_afternoon_routine': "Afternoon routine",
  'step.reg_afternoon_routine.rest': "Sit and rest",
  'step.reg_afternoon_routine.tea': "Have tea",
  'step.reg_afternoon_routine.walk': "Short walk",
  'step.reg_afternoon_routine.water': "Drink water",
  'routine.reg_evening_routine': "Evening routine",
  'step.reg_evening_routine.wash_up': "Wash up",
  'step.reg_evening_routine.dinner': "Have dinner",
  'step.reg_evening_routine.lock_up': "Lock the door",
  'step.reg_evening_routine.sleep': "Turn off the lamp",
  'routine.reg_prayer_routine': "Evening prayer",
  'step.reg_prayer_routine.light': "Light the lamp",
  'step.reg_prayer_routine.sit': "Sit down",
  'step.reg_prayer_routine.pray': "Say the prayer",
  'step.reg_prayer_routine.put_out': "Put out the lamp",
  'routine.reg_bath_routine': "Bath time",
  'step.reg_bath_routine.fetch': "Fetch water",
  'step.reg_bath_routine.wash': "Soap and wash",
  'step.reg_bath_routine.dry': "Dry with the gamosa",
  'step.reg_bath_routine.dress': "Change clothes",
  'together.childhood.theme': "Childhood",
  'together.childhood.q': "Tell me about the house you grew up in.",
  'together.childhood.follow': "Who lived there with you?",
  'together.food.theme': "Food",
  'together.food.q': "What was your favourite food as a child?",
  'together.food.follow': "Who used to cook it for you?",
  'together.festivals.theme': "Festivals",
  'together.festivals.q': "How did your family celebrate Bihu or a festival you love?",
  'together.festivals.follow': "What did you wear on that day?",
  'together.music.theme': "Music",
  'together.music.q': "Which song do you remember singing when you were young?",
  'together.music.follow': "Can you hum a little of it?",
  'together.work.theme': "Work",
  'together.work.q': "What work did you enjoy doing with your hands?",
  'together.work.follow': "Who taught you how to do it?",
  'together.places.theme': "Places",
  'together.places.q': "Where is a place that made you feel happy?",
  'together.places.follow': "What could you see and hear there?",
  'together.tea_time.theme': "Tea time",
  'together.tea_time.q': "How do you like your tea?",
  'together.tea_time.follow': "Who do you enjoy having tea with?",
  'together.friends.theme': "Friends",
  'together.friends.q': "Tell me about a good friend from your younger days.",
  'together.friends.follow': "What did you do together?",
  'q.sort_home.where': "Where does this belong?",
  'q.hear_find.listen': "Listen, then find",
  'q.hear_find.look': "Find this picture",
  'q.next_step.first': "What do you do first?",
  'q.next_step.after': "What comes next?",
  'q.apon_mukh.find_pairs': "Find the pairs",
  'q.saah_pat.find_sprigs': "Find every sprig like this one",
  'q.saah_pat.left': "still to find",
  'q.saah_pat.all_found': "All found",
  'notice.family_pictures': "Includes pictures from your family.",
  'notice.visual_mode': "Read the word, then find its picture.",
  'notice.family_routine': "Your family's own routine",
  'notice.routine_generic': "A family can add their own routine in the Memory Garden.",
  'notice.family_photos': "These are your family's own pictures.",
  'notice.add_photos': "A family can add their own photos in the Memory Garden.",
  'game.here_all': "Here they all are.",
  'game.here_others': "Here are the others.",
  'game.play_again': "Play again",
  'game.more_activities': "More activities",
  'next.same': "Next time we'll keep the same pace.",
  'next.more': "Next time, a little more.",
  'next.gentler': "Next time, a gentler round.",
  'next.with_help': "Next time, with a little help.",
  'together.who': "Who is here? What do you remember about this?",
  'together.thanks': "Thank you for sharing.",
  'together.done_note': "Talking about memories is good for the mind and the heart. There is no score here.",
  'together.done': "Done talking",
  'together.tell_more': "Tell me more",
  'together.another': "Another topic",
  'together.reject': "I don't want to see this again",
  'together.reject_confirm': "Tap again to remove this forever",
  'together.add_photos': "A family member can add real photos and voice notes in the Memory Garden.",
  'play.subtitle': "Short, gentle sessions. There are no wrong answers — just try your best.",
  'reminder.overdue': "Overdue",
  'reminder.next': "Next",
  'reminder.next_up': "Next up",
  'reminder.later': "Later today",
  'reminder.none': "No reminders set yet",
  'reminder.none_help': "A family member or health worker can add medicine, water, activity and clinic reminders in Circle.",
  'reminder.not_armed': "Not armed on this device",
  'today.is': "Today is",
  'today.played': "Played today",
  'today.nothing_yet': "Nothing yet today",
  'home.circle.one': "person looking out for you",
  'home.circle.many': "people looking out for you",
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
  return fixApostrophes(json.pipelineResponse?.[0]?.output?.[0]?.target ?? text);
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
