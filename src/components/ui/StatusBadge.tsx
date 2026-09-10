'use client';
import { useEffect, useState } from 'react';
import { t } from '@/lib/i18n';
import { Lang } from '@/lib/db';

/**
 * Persistent offline/synced indicator — SIH26003 requirement (g): "Work in
 * low-connectivity environments with offline functionality support." The app
 * already works fully offline; this component just makes that fact visible,
 * so a judge (or a caregiver) doesn't have to take it on faith.
 *
 * Deliberately minimal: a small pill in the corner, not a banner that eats
 * into the elderly-friendly layout's already-scarce screen space.
 *
 * Takes `lang` rather than a full `Person` so it also works on screens with
 * no active/known person yet (Circle login, the no-profile home state) —
 * every screen needs to show this, not only person-facing ones.
 */
export default function StatusBadge({ lang = 'en' }: { lang?: Lang }) {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return (
    <div
      data-testid="status-badge"
      style={{
        fontSize: 12,
        color: online ? 'var(--ok)' : 'var(--text-muted)',
        border: `2px solid ${online ? 'var(--ok)' : 'var(--text-muted)'}`,
        borderRadius: 999,
      }}
      className="inline-flex items-center gap-1.5 px-3 py-1 font-bold"
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: online ? 'var(--ok)' : 'var(--text-muted)',
        }}
      />
      {t(online ? 'status.synced' : 'status.offline', lang)}
    </div>
  );
}
