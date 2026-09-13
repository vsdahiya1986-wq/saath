'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { hasPin, setPin, verifyPin, markSessionUnlocked } from '@/lib/circleAuth';
import StatusBadge from '@/components/ui/StatusBadge';
import BackButton from '@/components/ui/BackButton';

export default function CircleLogin() {
  const router = useRouter();
  const [mode, setMode] = useState<'checking' | 'create' | 'enter'>('checking');
  const [pin, setPinValue] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    hasPin().then((exists) => setMode(exists ? 'enter' : 'create'));
  }, []);

  async function submitCreate() {
    if (pin.length < 4) return setError('Use at least 4 digits.');
    if (pin !== confirm) return setError('PINs do not match.');
    await setPin(pin);
    markSessionUnlocked();
    router.replace('/circle');
  }

  async function submitEnter() {
    if (await verifyPin(pin)) {
      markSessionUnlocked();
      router.replace('/circle');
    } else {
      setError('Incorrect PIN.');
      setPinValue('');
    }
  }

  if (mode === 'checking') return null;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-5 bg-[var(--bg)] p-6 relative">
      <div className="absolute top-4 left-4">
        <BackButton href="/" label="Back" />
      </div>
      <div className="absolute top-4 right-4">
        <StatusBadge />
      </div>
      <h1 style={{ fontSize: 28 }} className="font-black text-[var(--text)]">
        Circle access
      </h1>
      <p style={{ fontSize: 15 }} className="text-[var(--text-muted)] text-center max-w-xs">
        {mode === 'create'
          ? 'Set a PIN for family and worker access to this device.'
          : 'Enter the Circle PIN.'}
      </p>

      <input
        type="password"
        inputMode="numeric"
        value={pin}
        onChange={(e) => setPinValue(e.target.value)}
        maxLength={8}
        style={{ border: 'var(--border-w) solid var(--border)', borderRadius: 'var(--radius)', fontSize: 24, minHeight: 56 }}
        className="text-center w-48 tracking-widest"
        aria-label="PIN"
        autoFocus
      />

      {mode === 'create' && (
        <input
          type="password"
          inputMode="numeric"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          maxLength={8}
          placeholder="Confirm"
          style={{ border: 'var(--border-w) solid var(--border)', borderRadius: 'var(--radius)', fontSize: 24, minHeight: 56 }}
          className="text-center w-48 tracking-widest"
          aria-label="Confirm PIN"
        />
      )}

      {error && (
        <p style={{ color: 'var(--alert)', fontSize: 15 }}>{error}</p>
      )}

      <button
        onClick={mode === 'create' ? submitCreate : submitEnter}
        style={{ minHeight: 56, background: 'var(--accent)', borderRadius: 'var(--radius)' }}
        className="text-[var(--on-accent)] font-black px-8 text-lg active:opacity-80"
      >
        {mode === 'create' ? 'Set PIN' : 'Continue'}
      </button>
    </main>
  );
}
