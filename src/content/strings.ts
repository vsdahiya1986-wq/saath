/**
 * Canonical English UI/voice strings. Every fixed system string the app
 * ever displays or speaks lives here — one flat key -> English text map.
 *
 * `scripts/generate-audio.mjs` keeps its OWN copy of this list (it's a
 * plain Node script run only when Bhashini credentials are available, not
 * part of the app bundle) and produces, per language, cached audio files
 * plus a manifest.json with the Bhashini-translated text. Keep the two
 * lists in sync when you add a key.
 *
 * Until that script has been run with real Bhashini credentials, the `as`
 * (Assamese) manifest does not exist, and the app falls back to this
 * English text everywhere — see src/lib/i18n.ts. That is a real limitation,
 * not a hidden one: say so before you're asked.
 */
export const STRINGS: Record<string, string> = {
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
  'common.pause_btn': 'Pause',
  'common.skip_btn': 'Skip',
  'common.stop_btn': 'Stop',
  'common.back': 'Back',
  'common.continue': 'Continue',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'a11y.listen': 'Listen',

  'help.title': 'Help',
  'help.need': 'I need someone',
  'help.sent_local': 'Your family has been told on this network.',
  'help.stored': 'Saved on this device. It will be sent when there is a connection.',
  'help.stale_warning': "This may not show where it really is right now.",

  'today.title': "Today's reminders",
  'remind.medicine': 'It is time for your medicine.',
  'remind.hydration': 'Time for a glass of water.',
  'remind.activity': 'Time for your daily activity.',
  'remind.appointment': 'You have a clinic appointment.',

  'exit.pause': 'Pause',
  'exit.skip': 'Skip',
  'exit.stop': 'Stop',
};

export type StringKey = keyof typeof STRINGS;
