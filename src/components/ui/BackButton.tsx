import Link from 'next/link';
import Icon from './Icon';

/**
 * SIH26003 bug fix: every screen previously relied on a single 14px
 * underlined text link, usually placed after all page content (`mt-auto` or
 * literally the last element) — invisible without scrolling on any screen
 * with real content, and easy to miss even when visible. Research finding
 * #6 (see the rebuild plan) is explicit: older users need a persistent,
 * familiar, always-visible control, not something hidden below the fold or
 * a swipe gesture. This renders in the header, at the top of every screen,
 * every time, at full touch-target size.
 */
export default function BackButton({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      aria-label={label}
      style={{
        minHeight: 'var(--touch-min)',
        border: 'var(--border-w) solid var(--border)',
        borderRadius: 'var(--radius)',
      }}
      className="flex items-center gap-2 px-4 font-black text-[var(--text)] shrink-0 active:opacity-70"
    >
      <Icon name="back" size={20} />
      <span style={{ fontSize: 15 }}>{label}</span>
    </Link>
  );
}
