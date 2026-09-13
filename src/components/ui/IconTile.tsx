import Icon, { IconName } from './Icon';

/** Icon inside a softly glowing orb, tinted by `fg`. Decorative only. */
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
  const bg = bgOverride ?? `color-mix(in srgb, ${fg} 14%, transparent)`;
  const pad = Math.round(size * 0.32);
  return (
    <div
      style={{
        width: size + pad * 2,
        height: size + pad * 2,
        background: bg,
        color: fg,
        borderRadius: '9999px',
        border: `1.5px solid color-mix(in srgb, ${fg} 35%, transparent)`,
        boxShadow: `0 0 32px -8px color-mix(in srgb, ${fg} 55%, transparent), inset 0 1px 0 rgba(255,255,255,0.12)`,
      }}
      className="flex items-center justify-center shrink-0"
    >
      <Icon name={icon} size={size} />
    </div>
  );
}
