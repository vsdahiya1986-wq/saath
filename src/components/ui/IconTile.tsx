import Icon, { IconName } from './Icon';

/**
 * Wraps an Icon in a soft tinted circle instead of bare black linework
 * floating on white — part of the SIH26003 visual-identity pass (see
 * globals.css's --accent-warm/--accent-soft comment). Decorative only: the
 * tint never carries interactive meaning, so it's safe on non-tappable
 * icons and inside buttons alike.
 */
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
  /** Explicit colors override `tone` — used for per-domain variety (see play/page.tsx's DOMAIN_COLOR). */
  fg?: string;
  bg?: string;
}) {
  const bg = bgOverride ?? (tone === 'warm' ? 'var(--accent-warm-soft)' : 'var(--accent-soft)');
  const fg = fgOverride ?? (tone === 'warm' ? 'var(--accent-warm)' : 'var(--accent)');
  const pad = Math.round(size * 0.3);
  return (
    <div
      style={{
        width: size + pad * 2,
        height: size + pad * 2,
        background: bg,
        color: fg,
        borderRadius: '9999px',
      }}
      className="flex items-center justify-center shrink-0"
    >
      <Icon name={icon} size={size} />
    </div>
  );
}
