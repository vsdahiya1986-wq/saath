'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { allPersons, db, Lang, Person } from '@/lib/db';
import { clearActivePersonId, getActivePersonId, setActivePersonId } from '@/lib/usePerson';
import { DEMO_PERSONAS, removeDemoPersonas, seedDemoPersonas } from '@/lib/demoSeed';
import { stopAllAudio } from '@/lib/audio';
import BackButton from '@/components/ui/BackButton';
import Icon from '@/components/ui/Icon';
import IconTile from '@/components/ui/IconTile';

interface Row {
  person: Person;
  sessions: number;
  lastActive: string | null;
}

const LITERACY_LABEL: Record<Person['literacy'], string> = {
  'non-literate': 'Icon + audio',
  basic: 'Icon + text',
  fluent: 'Text-led',
};

async function fetchRows(): Promise<{ active: string | null; built: Row[] }> {
  const [persons, active, trials] = await Promise.all([allPersons(), getActivePersonId(), db.trials.toArray()]);
  const built = persons.map((person) => {
    const own = trials.filter((x) => x.person_id === person.id && !x.synthetic);
    return { person, sessions: own.length, lastActive: own.map((x) => x.created_at).sort().at(-1) ?? null };
  });
  built.sort((a, b) => Number(b.person.id === active) - Number(a.person.id === active) || Number(!!a.person.is_demo) - Number(!!b.person.is_demo));
  return { active, built };
}

/**
 * Patient selector (SIH26003 f, h). One shared device, several people.
 * Every table in IndexedDB is keyed by person_id, so switching only changes
 * which person every screen reads — one person's sessions, reminders, photos
 * and circle are never read on another person's screens.
 */
/** Fix pack 12: three interface languages, so this is no longer a ternary. */
const LANG_LABEL: Record<Lang, string> = { as: 'Assamese', hi: 'Hindi', en: 'English' };

export default function PeopleOnDevice() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { active, built } = await fetchRows();
    setActiveId(active);
    setRows(built);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchRows().then(({ active, built }) => {
      if (cancelled) return;
      setActiveId(active);
      setRows(built);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function switchTo(id: string) {
    stopAllAudio();
    await setActivePersonId(id);
    router.push('/');
  }

  async function loadDemos() {
    setBusy(true);
    await seedDemoPersonas();
    await load();
    setBusy(false);
  }

  async function removeDemos() {
    setBusy(true);
    const active = await getActivePersonId();
    await removeDemoPersonas();
    if (active && DEMO_PERSONAS.some((d) => d.id === active)) {
      const remaining = await allPersons();
      if (remaining[0]) await setActivePersonId(remaining[0].id);
      else await clearActivePersonId();
    }
    await load();
    setBusy(false);
  }

  const hasDemos = !!rows?.some((r) => r.person.is_demo);

  return (
    <main className="flex-1 flex flex-col">
      <div className="w-full max-w-5xl mx-auto px-5 pt-2 pb-10 flex flex-col gap-5">
        <header className="flex flex-col items-start gap-3">
          <BackButton href="/circle" label="Back to Circle" />
          <h1 className="title-xl">People on this device</h1>
          <p style={{ fontSize: 18 }} className="muted max-w-2xl">
            One shared tablet can care for several people. Each person&apos;s games, reminders, photos and circle are stored separately under
            their own record — switching only changes whose screens are shown.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {rows?.map(({ person, sessions, lastActive }) => {
            const active = person.id === activeId;
            return (
              <div
                key={person.id}
                data-testid={`person-card-${person.id}`}
                className="core p-5 flex flex-col gap-3"
                style={{ borderTop: `6px solid ${active ? 'var(--accent)' : person.is_demo ? 'var(--accent-warm)' : 'var(--card-border)'}` }}
              >
                <div className="flex items-start gap-3">
                  {/* F9 Ghor Tile: a big initial, recognisable without reading the name. */}
                  <span
                    aria-hidden="true"
                    className="flex items-center justify-center rounded-full shrink-0 font-extrabold"
                    style={{ width: 72, height: 72, fontSize: 36, color: '#fff', background: person.is_demo || person.is_sample ? 'var(--accent-warm)' : 'var(--accent)' }}
                  >
                    {person.display_name.trim().charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div style={{ fontSize: 23, overflowWrap: 'anywhere' }} className="font-extrabold leading-tight">
                      {person.display_name}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {active && (
                        <span className="chip" style={{ color: 'var(--accent)' }}>
                          <Icon name="check" size={14} /> Active now
                        </span>
                      )}
                      {person.is_demo && (
                        <span className="chip" style={{ color: 'var(--accent-warm)' }} data-testid="demo-badge">
                          DEMO DATA
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 17 }} className="muted">
                  {LANG_LABEL[person.language]} · {LITERACY_LABEL[person.literacy]} · {sessions} sessions
                  {lastActive ? ` · last ${new Date(lastActive).toLocaleDateString()}` : ''}
                </div>
                <button
                  onClick={() => switchTo(person.id)}
                  disabled={active}
                  className={`btn btn-block mt-auto ${active ? 'btn-ghost' : 'btn-primary'}`}
                >
                  {active ? 'Currently active' : `Switch to ${person.display_name}`}
                </button>
              </div>
            );
          })}

          <button onClick={() => router.push('/circle/setup?new=1')} className="core hover-lift p-5 flex flex-col items-start gap-3 text-left" style={{ borderTop: '6px solid var(--accent)' }}>
            <IconTile icon="people" size={34} fg="var(--accent)" />
            <span style={{ fontSize: 23 }} className="font-extrabold">
              Add a new person
            </span>
            <span style={{ fontSize: 17 }} className="muted">
              Create a separate profile on this device.
            </span>
          </button>
        </div>

        <section className="core p-5 flex flex-col gap-3" style={{ borderTop: '6px solid var(--accent-warm)' }}>
          <h2 style={{ fontSize: 22 }} className="font-extrabold">
            Demo personas
          </h2>
          <p style={{ fontSize: 17 }} className="muted">
            Two fictional people with 8 weeks of generated session history — one improving, one finding things harder over time — so the Circle Board trends and
            Evidence Inspector can be demonstrated. Clearly marked DEMO DATA; not real patients.
          </p>
          <div className="flex flex-wrap gap-3">
            <button onClick={loadDemos} disabled={busy} className="btn btn-ghost">
              <Icon name="sparkle" size={20} /> {hasDemos ? 'Reset demo personas' : 'Load demo personas'}
            </button>
            {hasDemos && (
              <button onClick={removeDemos} disabled={busy} className="btn btn-ghost" style={{ color: 'var(--alert)', borderColor: 'var(--alert)' }}>
                Remove demo personas
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
