import type { Activity } from '@/lib/db';
import type { IconName } from '@/components/ui/Icon';

export interface ActivityInfo {
  activity: Activity;
  icon: IconName;
  labelKey: string;
  domainKey: string;
  introKey: string;
  /** The named session in the 14-session CST programme this activity delivers. */
  cstSession: string;
  blurb: string;
}

/** The five CST activities, one per SIH26003 cognitive domain. Activity ids are stable storage keys. */
export const ACTIVITIES: ActivityInfo[] = [
  {
    activity: 'familiar_pairs',
    icon: 'sun',
    labelKey: 'activity.familiar_pairs',
    domainKey: 'domain.memory',
    introKey: 'play.pairs.intro',
    cstSession: 'CST Session 10 · Orientation',
    blurb: 'Gentle talk about the time of day, season, day and month.',
  },
  {
    activity: 'sound_sight',
    icon: 'listen',
    labelKey: 'activity.sound_sight',
    domainKey: 'domain.attention',
    introKey: 'play.sound.intro',
    cstSession: 'CST Session 7 · Word Association',
    blurb: 'Hear a word, then find the matching picture.',
  },
  {
    activity: 'pattern_garden',
    icon: 'basket',
    labelKey: 'activity.pattern_garden',
    domainKey: 'domain.pattern',
    introKey: 'play.pattern.intro',
    cstSession: 'CST Session 9 · Categorising Objects',
    blurb: 'Put everyday things into the right basket.',
  },
  {
    activity: 'my_next_step',
    icon: 'clock',
    labelKey: 'activity.my_next_step',
    domainKey: 'domain.routine',
    introKey: 'play.step.intro',
    cstSession: 'CST Session 4 · Everyday Practical Life',
    blurb: 'Put the steps of a daily routine in order.',
  },
  {
    activity: 'together',
    icon: 'heart',
    labelKey: 'activity.together',
    domainKey: 'domain.emotion',
    introKey: 'play.together.intro',
    cstSession: 'CST Session 3 · Childhood & Reminiscence',
    blurb: 'Share memories and talk together. No scores.',
  },
];

export function activityInfo(a: Activity): ActivityInfo {
  return ACTIVITIES.find((x) => x.activity === a)!;
}

export const DOMAIN_COLOR: Record<string, string> = {
  'domain.memory': '#065f46',
  'domain.attention': '#6d28d9',
  'domain.pattern': '#92400e',
  'domain.routine': '#0369a1',
  'domain.emotion': '#9d174d',
};
