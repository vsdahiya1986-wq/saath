'use client';
import { useSyncExternalStore } from 'react';
import { t } from '@/lib/i18n';
import { Lang } from '@/lib/db';

function subscribe(cb: () => void) {
  window.addEventListener('online', cb);
  window.addEventListener('offline', cb);
  return () => {
    window.removeEventListener('online', cb);
    window.removeEventListener('offline', cb);
  };
}

/** Persistent offline/synced indicator (SIH26003 requirement g). */
export default function StatusBadge({ lang = 'en' }: { lang?: Lang }) {
  const online = useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
  const color = online ? 'var(--ok)' : 'var(--accent-warm)';
  return (
    <div data-testid="status-badge" className="chip shrink-0" style={{ color }}>
      <span className="relative flex" style={{ width: 10, height: 10 }}>
        <span className="absolute inset-0 rounded-full breathe" style={{ background: color, opacity: 0.5 }} />
        <span className="relative rounded-full" style={{ width: 10, height: 10, background: color }} />
      </span>
      {t(online ? 'status.synced' : 'status.offline', lang)}
    </div>
  );
}
