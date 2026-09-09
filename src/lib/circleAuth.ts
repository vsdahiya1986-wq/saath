import { Preferences } from '@capacitor/preferences';

/**
 * Circle screens need a barrier so the elder doesn't wander into caregiver
 * tools by accident — not a defence against a determined attacker. The
 * master plan marks /circle/* as "(auth)" and assumes Supabase Auth, but
 * that needs a live Supabase project (external credential, not available
 * yet) and the Circle screens must work fully offline regardless. A local
 * PIN, checked against a stored hash, satisfies the actual requirement
 * (keep a confused or curious elder out of the Circle Board) without an
 * account system. Supabase Auth layers on top later for real multi-device
 * sync — see sync.ts.
 */

const PIN_HASH_KEY = 'saath_circle_pin_hash';
const SESSION_KEY = 'saath_circle_session';

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)));
}

export async function hasPin(): Promise<boolean> {
  const { value } = await Preferences.get({ key: PIN_HASH_KEY });
  return !!value;
}

export async function setPin(pin: string): Promise<void> {
  await Preferences.set({ key: PIN_HASH_KEY, value: await sha256(pin) });
}

export async function verifyPin(pin: string): Promise<boolean> {
  const { value } = await Preferences.get({ key: PIN_HASH_KEY });
  if (!value) return false;
  return value === (await sha256(pin));
}

export function markSessionUnlocked(): void {
  if (typeof window !== 'undefined') sessionStorage.setItem(SESSION_KEY, '1');
}

export function isSessionUnlocked(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(SESSION_KEY) === '1';
}
