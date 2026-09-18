import type { IconName } from '@/components/ui/Icon';
import type { Lang } from './db';
import { t } from './i18n';

export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const PARTS: { name: string; icon: IconName }[] = [
  { name: 'Morning', icon: 'sun' },
  { name: 'Afternoon', icon: 'sunset' },
  { name: 'Evening', icon: 'moon' },
  { name: 'Night', icon: 'moon' },
];

/** Seasons as commonly spoken of in Assam / North-East India. */
export const SEASONS: { name: string; icon: IconName; months: number[] }[] = [
  { name: 'Spring', icon: 'leaf', months: [1, 2] },
  { name: 'Summer', icon: 'sun', months: [3, 4] },
  { name: 'Monsoon', icon: 'rain', months: [5, 6, 7, 8] },
  { name: 'Autumn', icon: 'leaf', months: [9, 10] },
  { name: 'Winter', icon: 'snow', months: [11, 0] },
];

/**
 * The single source of the day's boundaries (01_BUGS.md B1): morning 05:00–11:59,
 * afternoon 12:00–16:59, evening 17:00–19:59, night 20:00–04:59. Uses the
 * device's own local time, which is what the person's day actually follows.
 */
export function partOfDayIndex(hour: number): number {
  if (hour >= 5 && hour < 12) return 0;
  if (hour >= 12 && hour < 17) return 1;
  if (hour >= 17 && hour < 20) return 2;
  return 3;
}

export function orientationNow(d = new Date()) {
  const part = PARTS[partOfDayIndex(d.getHours())];
  const season = SEASONS.find((s) => s.months.includes(d.getMonth()))!;
  return {
    part: part.name,
    partIcon: part.icon,
    weekday: WEEKDAYS[d.getDay()],
    day: d.getDate(),
    month: MONTHS[d.getMonth()],
    season: season.name,
    seasonIcon: season.icon,
  };
}

/**
 * Fix pack A1/A2: every name above is shown through `t()`, never as the bare
 * English literal. The English name stays the id; the key is derived from it.
 */
export type OrientationKind = 'period' | 'season' | 'weekday' | 'month';
export const optKey = (kind: OrientationKind, name: string) => `opt.${kind}.${name.toLowerCase()}`;

/** "Friday, 18 September" in the person's language (fix pack A2). */
export function localDate(now: ReturnType<typeof orientationNow>, lang: Lang): string {
  return `${t(optKey('weekday', now.weekday), lang)}, ${now.day} ${t(optKey('month', now.month), lang)}`;
}
