/**
 * 08 item 2: for someone who navigates by picture, two options with the same
 * icon cannot be told apart — evening and night were both a moon. Every
 * option set is checked as it is built. In development a duplicate throws, so
 * it cannot slip through; in production it is logged and the screen still works.
 */
export function duplicateIcons(options: { icon?: string }[]): string[] {
  const seen = new Set<string>();
  const dup = new Set<string>();
  for (const o of options) {
    if (!o.icon) continue;
    if (seen.has(o.icon)) dup.add(o.icon);
    seen.add(o.icon);
  }
  return [...dup];
}

export function distinctIcons<T extends { icon?: string }>(options: T[], where: string): T[] {
  const dup = duplicateIcons(options);
  if (dup.length) {
    const message = `${where}: options share an icon (${dup.join(', ')})`;
    if (process.env.NODE_ENV !== 'production') throw new Error(message);
    console.error(message);
  }
  return options;
}
