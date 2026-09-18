'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** R4: sends a pre-rename /play/<old> URL to its current one, replacing history. */
export default function LegacyRedirect({ to }: { to: string }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(to);
  }, [router, to]);

  return (
    <main className="min-h-[100dvh] flex items-center justify-center">
      <div className="spinner" aria-label="Loading" />
    </main>
  );
}
