'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { isSessionUnlocked } from '@/lib/circleAuth';
import { usePerson } from '@/lib/usePerson';
import StatusBadge from '@/components/ui/StatusBadge';

/**
 * Wraps every /circle/* page except /circle/login itself, and /inspector/*
 * (see src/app/inspector/layout.tsx, which reuses this same gate).
 *
 * Also the one place that can put the SIH26003 (g) offline/synced status bar
 * on all of those screens in one shot, rather than editing each page.
 *
 * `unlocked` starts as `null` ("not yet known") and resolves in an effect,
 * rather than reading sessionStorage directly during render: that read is
 * synchronous and cheap, but sessionStorage doesn't exist during Next.js's
 * server render, so branching render output on it directly produces a real
 * hydration mismatch on any page where a Circle PIN session is already
 * active — the server always renders "locked", the client's first paint can
 * already see "unlocked". Resolving after mount keeps server and the first
 * client render identical (both show nothing yet).
 */
export default function CircleGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { person } = usePerson();
  const [unlocked, setUnlocked] = useState<boolean | null>(null);

  useEffect(() => {
    const ok = isSessionUnlocked();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional:
    // resolving eagerly in a lazy useState initializer would call
    // isSessionUnlocked() during the render itself, which is the exact
    // server/client divergence this effect exists to avoid (see the class
    // comment above). Same tradeoff as StatusBadge.tsx's online/offline
    // state, which has the identical pattern for the identical reason.
    setUnlocked(ok);
    if (!ok) router.replace('/circle/login');
  }, [router]);

  if (!unlocked) return null;
  return (
    <>
      <div className="flex justify-end p-3 pb-0">
        <StatusBadge lang={person?.language} />
      </div>
      {children}
    </>
  );
}
