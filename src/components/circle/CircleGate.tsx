'use client';
import { useEffect, useSyncExternalStore, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { isSessionUnlocked } from '@/lib/circleAuth';
import { usePerson } from '@/lib/usePerson';
import StatusBadge from '@/components/ui/StatusBadge';

const noopSubscribe = () => () => {};

/**
 * Wraps every /circle/* page except /circle/login, and /inspector/*.
 * The server snapshot is `null` ("not yet known") so server and first client
 * render match; the client then reads the PIN session from sessionStorage.
 * It owns the full viewport height: the status row sits on top and the page
 * scrolls inside, so a full-height page never produces a second scrollbar.
 */
export default function CircleGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { person } = usePerson();
  const unlocked = useSyncExternalStore<boolean | null>(noopSubscribe, isSessionUnlocked, () => null);

  useEffect(() => {
    if (unlocked === false) router.replace('/circle/login');
  }, [unlocked, router]);

  if (!unlocked) return null;
  return (
    <div className="h-[100dvh] flex flex-col">
      <div className="no-print shrink-0 flex justify-end px-4 pt-3">
        <StatusBadge lang={person?.language} />
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col">{children}</div>
    </div>
  );
}
