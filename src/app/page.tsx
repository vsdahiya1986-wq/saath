'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePerson } from '@/lib/usePerson';
import { announce } from '@/lib/voiceNav';
import { t } from '@/lib/i18n';
import BigChoice from '@/components/ui/BigChoice';
import StatusBadge from '@/components/ui/StatusBadge';

export default function PersonHome() {
  const router = useRouter();
  const { person, loading } = usePerson();

  useEffect(() => {
    if (person?.navigation === 'voice-guided') {
      announce('home_intro', person.language);
    }
  }, [person]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <p style={{ fontSize: 'var(--text-body)' }}>Loading…</p>
      </main>
    );
  }

  if (!person) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[var(--bg)] p-6 text-center">
        <h1 style={{ fontSize: 'var(--text-title)' }} className="font-black text-[var(--text)]">
          Welcome to SAATH
        </h1>
        <p style={{ fontSize: 'var(--text-body)' }} className="text-[var(--text-muted)] max-w-sm">
          No person profile exists on this device yet. A family member or worker sets one up from the Circle
          screens.
        </p>
        <button
          onClick={() => router.push('/circle/setup')}
          style={{ minHeight: 72, background: 'var(--accent)', borderRadius: 'var(--radius)' }}
          className="text-white font-black px-8 text-xl active:opacity-80"
        >
          Set up a profile
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] p-5 flex flex-col gap-5">
      <header className="pb-2 flex items-center justify-between gap-3">
        <h1 style={{ fontSize: 'var(--text-title)' }} className="font-black text-[var(--text)]">
          {person.display_name}
        </h1>
        <StatusBadge person={person} />
      </header>

      <BigChoice icon="play" labelKey="home.play" subKey="home.play.sub" person={person} onSelect={() => router.push('/play')} />
      <BigChoice icon="help" labelKey="home.help" subKey="home.help.sub" person={person} onSelect={() => router.push('/help')} />
      <BigChoice icon="today" labelKey="home.today" subKey="home.today.sub" person={person} onSelect={() => router.push('/today')} />

      <footer className="mt-auto pt-4 text-center">
        <Link href="/circle" className="underline" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {t('common.open', person.language)} circle {'→'}
        </Link>
      </footer>
    </main>
  );
}
