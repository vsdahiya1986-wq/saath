'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuid } from 'uuid';
import { putPerson, Person, Literacy, Lang, Nav, Difficulty, CueType } from '@/lib/db';
import { getActivePersonId, setActivePersonId } from '@/lib/usePerson';
import BackButton from '@/components/ui/BackButton';

const ALL_CUES: CueType[] = ['none', 'repeat_audio', 'highlight', 'reduce_choices', 'demonstrate'];

export default function PersonSetup() {
  const router = useRouter();
  const [existingId, setExistingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [language, setLanguage] = useState<Lang>('as');
  const [literacy, setLiteracy] = useState<Literacy>('non-literate');
  const [navigation, setNavigation] = useState<Nav>('visual');
  const [maxDifficulty, setMaxDifficulty] = useState<Difficulty>(2);
  const [sensoryMode, setSensoryMode] = useState<'both' | 'visual_only' | 'audio_supported'>('both');
  const [consentRef, setConsentRef] = useState('');

  useEffect(() => {
    getActivePersonId().then(setExistingId);
  }, []);

  async function save() {
    if (!name.trim()) return;
    const id = existingId ?? uuid();
    const person: Person = {
      id,
      display_name: name.trim(),
      language,
      literacy,
      navigation,
      care_config: {
        max_difficulty: maxDifficulty,
        allowed_cues: ALL_CUES,
        excluded_pack_ids: [],
        sensory_mode: sensoryMode,
        source: 'caregiver_preference',
        set_by: 'circle_setup_screen',
        set_at: new Date().toISOString(),
        clinical_stage_supplied: false,
      },
      consent_ref: consentRef.trim(),
      created_at: new Date().toISOString(),
    };
    await putPerson(person);
    await setActivePersonId(id);
    router.push('/circle');
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] p-5 flex flex-col gap-4 max-w-md mx-auto">
      <header className="flex items-center gap-3">
        <BackButton href="/circle" label="Back to Circle" />
        <h1 style={{ fontSize: 26 }} className="font-black text-[var(--text)]">
          Person profile
        </h1>
      </header>

      <label className="flex flex-col gap-1">
        <span style={{ fontSize: 15 }}>Name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ border: 'var(--border-w) solid var(--border)', borderRadius: 'var(--radius)', minHeight: 60, padding: '0 12px', fontSize: 18 }}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span style={{ fontSize: 15 }}>Language</span>
        <select value={language} onChange={(e) => setLanguage(e.target.value as Lang)} style={selectStyle}>
          <option value="as">Assamese</option>
          <option value="en">English</option>
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span style={{ fontSize: 15 }}>Literacy tier</span>
        <select value={literacy} onChange={(e) => setLiteracy(e.target.value as Literacy)} style={selectStyle}>
          <option value="non-literate">Non-literate — icon + audio dominant</option>
          <option value="basic">Basic — icon and text equal weight</option>
          <option value="fluent">Fluent — text primary</option>
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span style={{ fontSize: 15 }}>Navigation</span>
        <select value={navigation} onChange={(e) => setNavigation(e.target.value as Nav)} style={selectStyle}>
          <option value="visual">Visual (tap to choose)</option>
          <option value="voice-guided">Voice-guided (gestures + audio)</option>
        </select>
      </label>

      <fieldset style={{ border: 'var(--border-w) solid var(--border)', borderRadius: 'var(--radius)', padding: 12 }}>
        <legend style={{ fontSize: 15 }} className="px-1">
          Care-team configuration
        </legend>
        <p style={{ fontSize: 13 }} className="text-[var(--text-muted)] mb-2">
          Bounds what the model may ever propose. Not an inferred disease stage — see Part 22 of the plan.
        </p>
        <label className="flex flex-col gap-1 mb-2">
          <span style={{ fontSize: 14 }}>Maximum difficulty (1-4)</span>
          <select value={maxDifficulty} onChange={(e) => setMaxDifficulty(Number(e.target.value) as Difficulty)} style={selectStyle}>
            {[1, 2, 3, 4].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span style={{ fontSize: 14 }}>Sensory mode</span>
          <select value={sensoryMode} onChange={(e) => setSensoryMode(e.target.value as typeof sensoryMode)} style={selectStyle}>
            <option value="both">Both sound and sight</option>
            <option value="visual_only">Visual only (hearing loss)</option>
            <option value="audio_supported">Audio-supported</option>
          </select>
        </label>
      </fieldset>

      <fieldset style={{ border: 'var(--border-w) solid var(--border)', borderRadius: 'var(--radius)', padding: 12 }}>
        <legend style={{ fontSize: 15 }} className="px-1">
          Data & consent
        </legend>
        <p style={{ fontSize: 13 }} className="text-[var(--text-muted)] mb-2">
          Name, care-plan text, and photos/recordings are stored AES-256-encrypted on this device, keyed by a
          secret in the platform&apos;s secure hardware store — never a password or anything guessable (see
          src/lib/crypto.ts). This device does not sync anywhere unless a Supabase backend is configured for the
          deployment (not configured in this demo build). Record what this person (or their authorized
          representative) actually consented to below — a form ID, a verbal consent log entry, whatever your care
          team already uses. This field is not itself a consent mechanism.
        </p>
        <label className="flex flex-col gap-1">
          <span style={{ fontSize: 15 }}>Consent reference</span>
          <input
            value={consentRef}
            onChange={(e) => setConsentRef(e.target.value)}
            placeholder="e.g. consent form ID"
            style={{ border: 'var(--border-w) solid var(--border)', borderRadius: 'var(--radius)', minHeight: 60, padding: '0 12px', fontSize: 16 }}
          />
        </label>
      </fieldset>

      <button
        onClick={save}
        disabled={!name.trim()}
        style={{ minHeight: 60, background: 'var(--accent)', borderRadius: 'var(--radius)' }}
        className="text-[var(--on-accent)] font-black px-8 text-lg active:opacity-80 disabled:opacity-40 mt-2"
      >
        Save profile
      </button>
    </main>
  );
}

const selectStyle = {
  border: 'var(--border-w) solid var(--border)',
  borderRadius: 'var(--radius)',
  minHeight: 60,
  padding: '0 12px',
  fontSize: 16,
} as const;
