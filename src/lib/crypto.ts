import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

/**
 * Field-level AES-256-GCM encryption, keyed by a secret generated on-device
 * and held in the platform secure store (Android Keystore / iOS Keychain via
 * capacitor-secure-storage-plugin; localStorage on the web dev fallback).
 *
 * Why field-level and not a full encrypted-database swap (the SQLCipher
 * route the master plan sketches in Part 15): every other module in this
 * app — the Bayesian engine, the event state machine, the whole test suite —
 * is built directly on Dexie/IndexedDB. Swapping the entire storage engine
 * for a second, SQL-only, native-only database would mean two disagreeing
 * data layers and would make nothing testable outside a real Android build.
 * This delivers the same guarantee Part 15 is actually after — a real
 * AES-256 cipher, a key that is never hard-coded or derived from anything
 * guessable, stored in hardware-backed OS storage, not the algorithm choice
 * of the surrounding database file — while keeping one consistent store.
 */

const KEY_ID = 'saath_field_key_v1';

let cachedKey: CryptoKey | null = null;

async function getOrCreateRawKey(): Promise<Uint8Array> {
  try {
    const { value } = await SecureStoragePlugin.get({ key: KEY_ID });
    return Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
  } catch {
    // Not found — mint a new 256-bit key with a CSPRNG. Never derived from a
    // password, device id, or anything else guessable.
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    const b64 = btoa(String.fromCharCode(...bytes));
    await SecureStoragePlugin.set({ key: KEY_ID, value: b64 });
    return bytes;
  }
}

async function getKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;
  const raw = await getOrCreateRawKey();
  cachedKey = await crypto.subtle.importKey('raw', raw as BufferSource, 'AES-GCM', false, ['encrypt', 'decrypt']);
  return cachedKey;
}

/** Encrypts a UTF-8 string. Output is a single base64 string: IV || ciphertext. */
export async function encryptText(plain: string): Promise<string> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(plain);
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
  const out = new Uint8Array(iv.length + cipher.byteLength);
  out.set(iv, 0);
  out.set(new Uint8Array(cipher), iv.length);
  return btoa(String.fromCharCode(...out));
}

export async function decryptText(encoded: string): Promise<string> {
  const key = await getKey();
  const all = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
  const iv = all.slice(0, 12);
  const cipher = all.slice(12);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
  return new TextDecoder().decode(plain);
}

/** Same scheme for binary blobs (photos, voice recordings). */
export async function encryptBlob(blob: Blob): Promise<Blob> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plain = await blob.arrayBuffer();
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plain);
  const out = new Uint8Array(iv.length + cipher.byteLength);
  out.set(iv, 0);
  out.set(new Uint8Array(cipher), iv.length);
  return new Blob([out], { type: 'application/octet-stream' });
}

export async function decryptBlob(encrypted: Blob, mime: string): Promise<Blob> {
  const key = await getKey();
  const all = new Uint8Array(await encrypted.arrayBuffer());
  const iv = all.slice(0, 12);
  const cipher = all.slice(12);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
  return new Blob([plain], { type: mime });
}

/**
 * Key-loss policy, stated honestly (mirrors Part 15.3): if the platform
 * secure store is wiped (factory reset, app data cleared outside a backup
 * flow), the on-device key is gone and locally encrypted rows are
 * unrecoverable by design. The authoritative record is the last successful
 * server sync — see sync.ts's `dataFreshAsOf`.
 */
export async function resetKeyDangerously(): Promise<void> {
  cachedKey = null;
  try {
    await SecureStoragePlugin.remove({ key: KEY_ID });
  } catch {
    // already absent
  }
}
