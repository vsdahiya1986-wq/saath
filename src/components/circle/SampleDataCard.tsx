'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import { setActivePersonId } from '@/lib/usePerson';
import { clearSample, loadSample, sampleLoaded } from '@/lib/sampleData';

/**
 * F1: one tap to a populated app, and one tap to remove it again. Kept on the
 * Circle screen rather than anywhere the elder goes — loading fiction over a
 * real person's data is a caregiver decision.
 */
export default function SampleDataCard({ onChange }: { onChange?: () => void }) {
  const router = useRouter();
  const [loaded, setLoaded] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    sampleLoaded().then(setLoaded);
  }, []);

  async function load() {
    setBusy(true);
    const id = await loadSample();
    await setActivePersonId(id);
    setLoaded(true);
    setBusy(false);
    onChange?.();
    router.refresh();
  }

  async function clear() {
    setBusy(true);
    await clearSample();
    setLoaded(false);
    setBusy(false);
    onChange?.();
    router.refresh();
  }

  return (
    <section className="core col-span-2 p-5 flex flex-wrap gap-4 items-center justify-between" style={{ borderTop: '6px solid var(--accent-warm)' }}>
      <div className="flex gap-4 items-start">
        <span style={{ color: 'var(--accent-warm)' }}>
          <Icon name="sparkle" size={30} />
        </span>
        <div className="flex flex-col gap-1">
          <span style={{ fontSize: 19 }} className="font-extrabold">
            Aita&apos;s Day (sample)
          </span>
          <span style={{ fontSize: 16 }} className="muted">
            A fictional person with two weeks of sessions, reminders, a circle and two memories — so you can see every screen populated. Not
            a real person, and never synced anywhere.
          </span>
        </div>
      </div>
      {loaded ? (
        <button onClick={clear} disabled={busy} data-testid="clear-sample" className="btn btn-ghost" style={{ minHeight: 64 }}>
          <Icon name="stop" size={22} /> Clear sample data
        </button>
      ) : (
        <button onClick={load} disabled={busy || loaded === null} data-testid="load-sample" className="btn btn-primary" style={{ minHeight: 64 }}>
          <Icon name="sparkle" size={22} /> Load Aita&apos;s Day (sample)
        </button>
      )}
    </section>
  );
}
