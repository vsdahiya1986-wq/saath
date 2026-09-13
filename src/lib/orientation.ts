import type { IconName } from '@/components/ui/Icon';

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

export function partOfDayIndex(hour: number): number {
  if (hour >= 5 && hour < 12) return 0;
  if (hour >= 12 && hour < 17) return 1;
  if (hour >= 17 && hour < 21) return 2;
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
