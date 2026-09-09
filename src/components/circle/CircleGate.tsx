'use client';
import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { isSessionUnlocked } from '@/lib/circleAuth';

/** Wraps every /circle/* page except /circle/login itself. */
export default function CircleGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  // sessionStorage read is synchronous and cheap — safe to compute at render
  // time instead of stashing it in state via an effect.
  const unlocked = isSessionUnlocked();

  useEffect(() => {
    if (!unlocked) router.replace('/circle/login');
  }, [unlocked, router]);

  if (!unlocked) return null;
  return <>{children}</>;
}
