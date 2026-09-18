'use client';
import { useEffect } from 'react';
import type { Person } from '@/lib/db';
import { t } from '@/lib/i18n';
import { queueAutoCue } from '@/lib/audio';
import Icon from '@/components/ui/Icon';

/** Rest Pause (F13): calm, full screen, no countdown, both answers equal. */
export default function RestPause({ person, onRest, onOneMore }: { person: Person; onRest: () => void; onOneMore: () => void }) {
  const lang = person.language;

  useEffect(() => {
    queueAutoCue('rest.title', lang);
  }, [lang]);

  return (
    <div
      data-testid="rest-pause"
      role="dialog"
      aria-label={t('rest.title', lang)}
      className="fixed inset-0 flex flex-col items-center justify-center gap-8 p-6 text-center"
      style={{ zIndex: 60, background: 'var(--bg)' }}
    >
      <span className="flex items-center justify-center rounded-full" style={{ width: 150, height: 150, background: 'var(--accent-soft)', color: 'var(--accent)' }}>
        <Icon name="sun" size={72} strokeWidth={2} />
      </span>
      <p style={{ fontSize: 32, maxWidth: '20ch' }} className="font-extrabold leading-snug">
        {t('rest.title', lang)}
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <button onClick={onRest} data-testid="rest-now" className="btn btn-primary btn-xl" style={{ minWidth: 180 }}>
          {t('rest.rest_now', lang)}
        </button>
        <button onClick={onOneMore} data-testid="rest-one-more" className="btn btn-ghost btn-xl" style={{ minWidth: 180 }}>
          {t('rest.one_more', lang)}
        </button>
      </div>
    </div>
  );
}
