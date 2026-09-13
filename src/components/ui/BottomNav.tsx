'use client';
import Link from 'next/link';
import { Lang } from '@/lib/db';
import { t } from '@/lib/i18n';
import { playCue } from '@/lib/audio';
import Icon from './Icon';

/** Persistent bottom dock — icon + label, always in the same place. Omit backHref on Home. */
export default function BottomNav({ lang, backHref, backLabel }: { lang: Lang; backHref?: string; backLabel?: string }) {
  const isHome = !backHref;
  return (
    <nav aria-label={t('common.home', lang)} className="dock shrink-0 px-4 pt-3 pb-4 flex gap-3 justify-center">
      {backHref && (
        <Link
          href={backHref}
          onClick={() => playCue('common.back', lang)}
          aria-label={backLabel ?? t('common.back', lang)}
          className="btn btn-ghost flex-1 max-w-xs"
        >
          <Icon name="back" size={26} strokeWidth={2.4} />
          <span>{backLabel ?? t('common.back', lang)}</span>
        </Link>
      )}
      <Link
        href="/"
        onClick={() => playCue('common.home', lang)}
        aria-current={isHome ? 'page' : undefined}
        aria-label={t('common.home', lang)}
        className={`btn flex-1 max-w-xs ${isHome ? 'btn-primary' : 'btn-ghost'}`}
      >
        <Icon name="home" size={26} strokeWidth={2.4} />
        <span>{t('common.home', lang)}</span>
      </Link>
    </nav>
  );
}
