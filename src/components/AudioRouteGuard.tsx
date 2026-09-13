'use client';
import { useLayoutEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { stopAllAudio } from '@/lib/audio';

/**
 * Silences the previous screen's voice on navigation. Layout effect on
 * purpose: it runs before the new screen's passive effects queue their own
 * announcements, so only the old screen's audio is cut.
 */
export default function AudioRouteGuard() {
  const pathname = usePathname();
  const first = useRef(true);
  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    stopAllAudio();
  }, [pathname]);
  return null;
}
