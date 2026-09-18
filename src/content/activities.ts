import type { Activity } from '@/lib/db';
import type { IconName } from '@/components/ui/Icon';

export interface ActivityInfo {
  activity: Activity;
  /**
   * URL segment, so a judge reading the address bar sees the screen's name (R4).
   * Deliberately separate from `activity`, which stays the stored id in every
   * trial row — mapping at the route layer means no Dexie migration and no risk
   * to existing history or the engine's queries.
   */
  slug: string;
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
    slug: 'today_me',
    icon: 'sun',
    labelKey: 'activity.familiar_pairs',
    domainKey: 'domain.memory',
    introKey: 'play.pairs.intro',
    cstSession: 'CST Session 10 · Orientation',
    blurb: 'Gentle talk about the time of day, season, day and month.',
  },
  {
    activity: 'sound_sight',
    slug: 'hear_find',
    icon: 'listen',
    labelKey: 'activity.sound_sight',
    domainKey: 'domain.attention',
    introKey: 'play.sound.intro',
    cstSession: 'CST Session 7 · Word Association',
    blurb: 'Hear a word, then find the matching picture.',
  },
  {
    activity: 'pattern_garden',
    slug: 'sort_home',
    icon: 'basket',
    labelKey: 'activity.pattern_garden',
    domainKey: 'domain.pattern',
    introKey: 'play.pattern.intro',
    cstSession: 'CST Session 9 · Categorising Objects',
    blurb: 'Put everyday things into the right basket.',
  },
  {
    activity: 'my_next_step',
    slug: 'next_step',
    icon: 'clock',
    labelKey: 'activity.my_next_step',
    domainKey: 'domain.routine',
    introKey: 'play.step.intro',
    cstSession: 'CST Session 4 · Everyday Practical Life',
    blurb: 'Put the steps of a daily routine in order.',
  },
  {
    activity: 'together',
    slug: 'together',
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

export function slugFor(a: Activity): string {
  return activityInfo(a).slug;
}

/** The stored activity id for a URL segment, or undefined if it is not one of ours. */
export function activityForSlug(slug: string): Activity | undefined {
  return ACTIVITIES.find((x) => x.slug === slug)?.activity;
}

/**
 * R4: the pre-rename URLs, kept as redirects so any link already shared still
 * works. `output: "export"` rules out next.config redirects (they need a
 * server), so these are real pages that replace themselves client-side.
 */
export const LEGACY_SLUGS: Record<string, string> = Object.fromEntries(
  ACTIVITIES.filter((a) => a.activity !== a.slug).map((a) => [a.activity, a.slug])
);

export const DOMAIN_COLOR: Record<string, string> = {
  'domain.memory': '#065f46',
  'domain.attention': '#6d28d9',
  'domain.pattern': '#92400e',
  'domain.routine': '#0369a1',
  'domain.emotion': '#9d174d',
};
