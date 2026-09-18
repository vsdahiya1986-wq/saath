/**
 * Canonical English UI/voice strings — one flat key -> English text map.
 * `scripts/generate-audio.mjs` keeps its own copy for Bhashini generation;
 * keep the two in sync. Keys without a generated audio file are spoken by
 * the device's offline speech voice (see src/lib/audio.ts).
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
};

export type StringKey = keyof typeof STRINGS;
