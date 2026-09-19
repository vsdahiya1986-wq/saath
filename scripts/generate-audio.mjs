// node scripts/generate-audio.mjs
//
// Build-time only. Requires BHASHINI_API_KEY — a dashboard-issued inference
// key from bhashini.gov.in tied to a specific pipeline of tasks (TTS/
// translation per language) the user selected when creating that pipeline.
// Generates audio once, ships the files, plays offline forever — see
// src/lib/audio.ts / i18n.ts.
//
// Order (07 §1.4): `npm run translate` first — it translates, round-trip
// verifies and writes docs/i18n-review.json — then this script, which voices
// only the Assamese that passed. Unchanged text reuses its existing file.
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
  home_intro: 'This is your memory companion. Choose Play, Help, or Today.',
  'home.play': 'Play',
  'home.help': 'Help',
  'home.today': 'Today',
  'home.circle': 'Circle',
  'home.help.ok': "No help is needed now",
  'activity.familiar_pairs': 'Today & Me',
  'activity.sound_sight': 'Hear & Find',
  'activity.pattern_garden': 'Sort the Home',
  'activity.my_next_step': 'My Next Step',
  'activity.together': 'Together Moment',
  'activity.saah_pat': 'Saah Pat · Tea Leaf',
  'activity.apon_mukh': 'Apon Mukh · Dear Faces',
  'play.today_three': "Three for today",
  'play.all_activities': 'All activities',
  'display.text_size': 'Text size',
  'rest.title': "Do you want to rest now?",
  'rest.rest_now': 'Rest now',
  'rest.one_more': "Play one more",
  'domain.memory': 'Memory',
  'domain.attention': 'Attention & Concentration',
  'domain.routine': 'Daily Routine Recall',
  'domain.pattern': 'Pattern & Object Recognition',
  'domain.emotion': 'Emotional Engagement',
  'status.offline': "No internet connection",
  'status.synced': "Saved",
  'status.no_signal': "Test: no internet",
  'adaptive.same': "The same as last time",
  'adaptive.easier': "A little easier today",
  'adaptive.harder': "A little harder today",
  'adaptive.with_help': "With some help today",
  'play.title': 'Choose an activity',
  'play.pairs.intro': "Let us talk about today. Choose the answer you think is correct. There is no hurry.",
  'play.sound.intro': 'Listen to the word, then tap the matching picture.',
  'play.pattern.intro': "Tap the basket where this belongs.",
  'play.step.intro': 'Put the steps of your routine in order.',
  'play.together.intro': 'Let us look at this picture together.',
  'play.saah_pat.intro': "Find the tea shoots with two leaves and one bud. Tap each one you see. There is no hurry.",
  'play.apon_mukh.intro': "Tap two cards to see the pictures. Find the two that match.",
  'game.not_this_one': 'Not this one.',
  'cue.highlight': 'Look here.',
  'cue.reduce': 'Let us try with fewer choices.',
  'common.pause': 'Paused. Tap to continue, or choose Stop.',
  'common.open': 'Open',
  'common.back': "Go back",
  'common.home': 'Home',
  'common.continue': 'Continue',
  'a11y.listen': 'Listen',
  'help.title': 'Help',
  'help.need': 'I need someone',
  'help.sent_local': "Your family has been told.",
  'help.stored': 'Saved on this device. It will be sent when there is a connection.',
  'help.stale_warning': "This photo may show an old place.",
  'today.title': "Today's reminders",
  'remind.medicine': 'It is time for your medicine.',
  'remind.hydration': "It is time for a glass of water.",
  'remind.activity': "It is time for your daily activity.",
  'remind.appointment': 'You have a clinic appointment.',
  'remind.done': 'Done',
  'remind.not_now': 'Not now',
  'exit.pause': "Stop for a moment",
  'exit.skip_one': "Skip this step",
  'exit.end': "Finish",
  'game.well_done': "Well done. That was good.",
  'game.gentle_end': "That is fine. We can try again another day.",
  'game.look_again': 'Let us look again.',
  'game.good': 'Yes, that is right.',
  // Fix pack A1/A2 (Sept 2026): activity content and screen text, so nothing
  // elder-facing renders as a bare English literal on an Assamese profile.
  'q.today_me.part_of_day': "What part of the day is it now?",
  'q.today_me.season': "Which season is it now?",
  'q.today_me.weekday': "What day of the week is it today?",
  'q.today_me.month': "Which month is it now?",
  'opt.period.morning': "Morning",
  'opt.period.afternoon': "Afternoon",
  'opt.period.evening': "Evening",
  'opt.period.night': "Night",
  'opt.season.spring': "Spring",
  'opt.season.summer': "Summer",
  'opt.season.monsoon': "Rainy season",
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
  'opt.bucket.around_house': "Elsewhere in the house",
  'item.reg_tumbler': "Steel tumbler",
  'item.reg_kettle': "Tea kettle",
  'item.reg_thali': "Thali plate",
  'item.reg_ghoti': "Water pot",
  'item.reg_comb': "Comb",
  'item.reg_mirror': "Hand mirror",
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
  'item.reg_claypot': "Earthen water pot",
  'item.reg_areca': "Areca nut plate",
  'item.reg_ricepot': "Rice pot",
  'item.reg_gamosa': "Gamosa",
  'item.reg_xorai': "Brass offering tray",
  'item.reg_net': "Fishing net",
  'item.reg_loom': "Weaving loom",
  'routine.reg_morning_routine': "Morning routine",
  'step.reg_morning_routine.wake': "Wake up",
  'step.reg_morning_routine.medicine': "Take medicine",
  'step.reg_morning_routine.wash': "Wash your face",
  'step.reg_morning_routine.breakfast': "Have breakfast",
  'routine.reg_afternoon_routine': "Afternoon routine",
  'step.reg_afternoon_routine.rest': "Sit and rest",
  'step.reg_afternoon_routine.tea': "Have tea",
  'step.reg_afternoon_routine.walk': "Short walk",
  'step.reg_afternoon_routine.water': "Drink water",
  'routine.reg_evening_routine': "Evening routine",
  'step.reg_evening_routine.wash_up': "Wash your hands",
  'step.reg_evening_routine.dinner': "Have dinner",
  'step.reg_evening_routine.lock_up': "Lock the door",
  'step.reg_evening_routine.sleep': "Turn off the lamp",
  'routine.reg_prayer_routine': "Evening prayer",
  'step.reg_prayer_routine.light': "Light the lamp",
  'step.reg_prayer_routine.sit': "Sit on the mat",
  'step.reg_prayer_routine.pray': "Say the prayer",
  'step.reg_prayer_routine.put_out': "Put out the lamp",
  'routine.reg_bath_routine': "Bath time",
  'step.reg_bath_routine.fetch': "Fetch water",
  'step.reg_bath_routine.wash': "Soap and wash",
  'step.reg_bath_routine.dry': "Dry with the gamosa",
  'step.reg_bath_routine.dress': "Change clothes",
  'together.childhood.theme': "Childhood",
  'together.childhood.q': "Tell me about the house where you lived as a child.",
  'together.childhood.follow': "Who lived there with you?",
  'together.food.theme': "Food",
  'together.food.q': "What was your favourite food as a child?",
  'together.food.follow': "Who used to cook it for you?",
  'together.festivals.theme': "Festivals",
  'together.festivals.q': "How did your family celebrate Bihu or a festival you love?",
  'together.festivals.follow': "What did you wear on that day?",
  'together.music.theme': "Music",
  'together.music.q': "Which song do you remember singing when you were young?",
  'together.music.follow': "Can you sing a little of it?",
  'together.work.theme': "Work with your hands",
  'together.work.q': "What work did you enjoy doing with your hands?",
  'together.work.follow': "Who taught you how to do it?",
  'together.places.theme': "Places",
  'together.places.q': "Where is a place that made you feel happy?",
  'together.places.follow': "What could you see and hear there?",
  'together.tea_time.theme': "Tea time",
  'together.tea_time.q': "Do you like your tea with milk or without milk?",
  'together.tea_time.follow': "Who do you enjoy having tea with?",
  'together.friends.theme': "Friends",
  'together.friends.q': "Tell me about a good friend from when you were young.",
  'together.friends.follow': "What did you do together?",
  'q.sort_home.where': "Where should this go?",
  'q.hear_find.listen': "Listen, then find",
  'q.hear_find.look': "Find this picture",
  'q.next_step.first': "What do you do first?",
  'q.next_step.after': "What do you do next?",
  'q.apon_mukh.find_pairs': "Find the two cards that match",
  'q.saah_pat.find_sprigs': "Find every tea shoot like this one",
  'q.saah_pat.left': "Tea shoots still to find",
  'q.saah_pat.all_found': "All found",
  'notice.some_family': "Some of these are your family's own photos.",
  'notice.visual_mode': "Read the word, then find its picture.",
  'notice.family_routine': "Your family's own routine",
  'notice.routine_generic': "A family can add their own routine in the Memory Garden.",
  'notice.family_photos': "These are your family's own pictures.",
  'notice.add_photos': "A family can add their own photos in the Memory Garden.",
  'game.here_all': "Here are all the pairs.",
  'game.here_others': "Here are the others.",
  'game.play_again': "Play again",
  'game.more_activities': "More activities",
  'next.same': "Next time it will be the same.",
  'next.more': "Next time it will be a little harder.",
  'next.gentler': "Next time it will be a little easier.",
  'next.with_help': "Next time there will be some help.",
  'together.who': "Who is here? What do you remember about this?",
  'together.thanks': "Thank you for sharing.",
  'together.done_note': "Talking about memories is good for the mind and the heart. There is no score here.",
  'together.done': "Finish talking",
  'together.tell_more': "Tell me more",
  'together.another': "Another topic",
  'together.reject': "I don't want to see this again",
  'together.reject_confirm': "Tap again to remove this forever",
  'together.add_photos': "A family member can add real photos and voice notes in the Memory Garden.",
  'play.subtitle': "Short, easy games. There are no wrong answers.",
  'reminder.overdue': "Past the time",
  'reminder.next_up': "Coming next",
  'reminder.none': "No reminders set yet",
  'reminder.none_help': "A family member or health worker can add medicine, water, activity and clinic reminders in Circle.",
  'reminder.not_armed': "Reminders are not set up on this phone.",
  'reminder.now': "Now",
  'reminder.snoozed': "Again in 10 minutes",
  'reminder.done_state': "Done for today",
  'reminder.more_later': "more reminders later today",
  'reminder.all_done': "All reminders are done for today.",
  'today.is': "Today",
  'today.played': "Games played today",
  'today.nothing_yet': "No games played yet today.",
  'home.circle.one': "person who cares for you",
  'home.circle.many': "people who care for you",
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

async function main() {
  const failures = {};
  const unverified = [];
  // Translation happens in verify-translations.mjs (07 §1.4), which records
  // a PASS/FAIL per key. This script only voices what passed.
  const review = JSON.parse(await fs.readFile(path.join('docs', 'i18n-review.json'), 'utf8').catch(() => 'null'));
  if (!review) console.warn('No docs/i18n-review.json — run `node scripts/verify-translations.mjs --run` first. Assamese stays English.');

  for (const lang of ['as', 'en']) {
    const dir = path.join('public', 'content', 'lang', lang);
    await fs.mkdir(dir, { recursive: true });
    const manifest = {};
    const previous = JSON.parse(await fs.readFile(path.join(dir, 'manifest.json'), 'utf8').catch(() => '{}'));
    failures[lang] = [];

    for (const [key, en] of Object.entries(STRINGS)) {
      let text = en;
      if (lang !== 'en') {
        // Not verified: English on screen, no Assamese audio. English is
        // honest; wrong Assamese is not.
        const r = review?.entries[key];
        if (!r || r.verdict !== 'PASS' || r.en !== en) {
          unverified.push(key);
          manifest[key] = { file: null, text: en };
          continue;
        }
        text = r.as;
      }

      // Same text as last run and the recording is still there: reuse it.
      const old = previous[key];
      if (old?.file && old.text === text && (await fs.access(path.join(dir, old.file)).then(() => true, () => false))) {
        manifest[key] = old;
        continue;
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
    await fs.writeFile(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  }

  console.log('\n--- generate-audio summary ---');
  if (unverified.length) console.log(`as: ${unverified.length} not verified — English text, no Assamese audio: ${unverified.join(', ')}`);
  for (const [lang, keys] of Object.entries(failures)) {
    if (keys.length === 0) {
      console.log(`${lang}: every string that has ${lang === 'en' ? 'text' : 'verified text'} was generated with audio.`);
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
