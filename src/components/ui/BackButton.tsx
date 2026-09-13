'use client';
import Link from 'next/link';
import Icon from './Icon';

/** Always-visible, full-size Back control in the header of every screen. */
export default function BackButton({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} aria-label={label} className="btn btn-ghost shrink-0" style={{ paddingLeft: 10, paddingRight: 22, fontSize: 18 }}>
      <span className="nub" style={{ width: 44, height: 44 }}>
        <Icon name="back" size={22} strokeWidth={2.4} />
      </span>
      <span>{label}</span>
    </Link>
  );
}
