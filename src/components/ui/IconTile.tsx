import Icon, { IconName } from './Icon';

/** Icon inside a solid, softly tinted circle. Decorative only — never the tappable element itself. */
export default function IconTile({
  icon,
  size = 32,
  tone = 'warm',
  fg: fgOverride,
  bg: bgOverride,
}: {
  icon: IconName;
  size?: number;
  tone?: 'warm' | 'accent';
  fg?: string;
  bg?: string;
}) {
  const fg = fgOverride ?? (tone === 'warm' ? 'var(--accent-warm)' : 'var(--accent)');
  const bg = bgOverride ?? `color-mix(in srgb, ${fg} 12%, var(--surface))`;
  const pad = Math.round(size * 0.3);
  return (
    <div
      style={{ width: size + pad * 2, height: size + pad * 2, background: bg, color: fg, borderRadius: 9999 }}
      className="flex items-center justify-center shrink-0"
    >
      <Icon name={icon} size={size} />
    </div>
  );
}
