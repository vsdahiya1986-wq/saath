'use client';
import { useSyncExternalStore } from 'react';
import { t } from '@/lib/i18n';
import { Lang } from '@/lib/db';
import { isForcedOffline, subscribeForcedOffline } from '@/lib/sync';

function subscribe(cb: () => void) {
  window.addEventListener('online', cb);
  window.addEventListener('offline', cb);
  const unsubscribe = subscribeForcedOffline(cb);
  return () => {
    window.removeEventListener('online', cb);
    window.removeEventListener('offline', cb);
    unsubscribe();
  };
}

/**
 * Persistent offline/synced indicator (SIH26003 requirement g).
 *
 * F3: shows real network state *and* No-Signal Mode, and says which it is —
 * a simulated outage during a demo must never be mistaken for a real one.
 */
export default function StatusBadge({ lang = 'en' }: { lang?: Lang }) {
  const state = useSyncExternalStore(
    subscribe,
    () => (isForcedOffline() ? 'simulated' : navigator.onLine ? 'online' : 'offline'),
    () => 'online' as const
  );
  const online = state === 'online';
  const color = online ? 'var(--ok)' : 'var(--accent-warm)';
  return (
    <div data-testid="status-badge" data-state={state} className="chip" style={{ color }}>
      <span className="relative flex" style={{ width: 10, height: 10 }}>
        <span className="absolute inset-0 rounded-full breathe" style={{ background: color, opacity: 0.5 }} />
        <span className="relative rounded-full" style={{ width: 10, height: 10, background: color }} />
      </span>
      {t(state === 'simulated' ? 'status.no_signal' : online ? 'status.synced' : 'status.offline', lang)}
    </div>
  );
}
