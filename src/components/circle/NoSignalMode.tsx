'use client';
import { useSyncExternalStore } from 'react';
import Icon from '@/components/ui/Icon';
import { isForcedOffline, setForcedOffline, subscribeForcedOffline } from '@/lib/sync';

/**
 * No-Signal Mode (F3), which replaces the internal Failure Theatre toggle
 * removed in R1: a caregiver — or a judge — can pretend this phone has no
 * network and watch SAATH keep working. The flag is persisted, so it survives
 * the reloads of a live demo.
 */
export default function NoSignalMode() {
  const on = useSyncExternalStore(subscribeForcedOffline, isForcedOffline, () => false);

  return (
    <section className="core col-span-2 p-5 flex flex-wrap gap-4 items-center justify-between" style={{ borderTop: `6px solid ${on ? 'var(--accent-warm)' : 'var(--control-border)'}` }}>
      <div className="flex gap-4 items-start">
        <span style={{ color: on ? 'var(--accent-warm)' : 'var(--text-muted)' }}>
          <Icon name={on ? 'warning' : 'shield'} size={30} />
        </span>
        <div className="flex flex-col gap-1">
          <span style={{ fontSize: 19 }} className="font-extrabold">
            No-Signal Mode
          </span>
          <span style={{ fontSize: 16 }} className="muted">
            Pretend this phone has no network, to show how SAATH keeps working. Activities, reminders and notes all carry on; nothing is sent
            until you turn it off.
          </span>
        </div>
      </div>
      <button
        data-testid="no-signal-toggle"
        aria-pressed={on}
        onClick={() => setForcedOffline(!on)}
        className={`btn ${on ? 'btn-primary' : 'btn-ghost'}`}
        style={{ minHeight: 64 }}
      >
        <Icon name={on ? 'check' : 'circle'} size={24} />
        {on ? 'No-Signal Mode is on' : 'Turn on No-Signal Mode'}
      </button>
    </section>
  );
}
