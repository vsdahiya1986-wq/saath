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
    <>
      <div className="flex justify-end p-3 pb-0">
        <StatusBadge lang={person?.language} />
      </div>
      {children}
    </>
  );
}
