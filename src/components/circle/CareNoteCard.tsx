'use client';
import { useState } from 'react';
import { CareChip, putCareNote } from '@/lib/db';
import { MePicker, useCircleMe } from './CircleMe';

export const CHIP_LABEL: Record<CareChip, string> = { meals: 'Meals', sleep: 'Sleep', mood: 'Mood', fall: 'A fall' };

/**
 * Care Note (F8): a 30-second log. Tap a chip, tap Save — the time and the
 * member's name are stamped automatically; the line of text is optional.
 */
export default function CareNoteCard({ personId }: { personId: string | null }) {
  const circle = useCircleMe(personId);
  const [chips, setChips] = useState<CareChip[]>([]);
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);

  if (!personId) return null;

  function toggle(c: CareChip) {
    setSaved(false);
    setChips((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]));
  }

  async function save() {
    await putCareNote({
      id: crypto.randomUUID(),
      person_id: personId!,
      chips,
      text: text.trim() || undefined,
      by: circle.me || 'Circle',
      created_at: new Date().toISOString(),
    });
    setChips([]);
    setText('');
    setSaved(true);
  }

  return (
    <section className="core col-span-2 p-5 flex flex-col gap-3" style={{ borderTop: '6px solid var(--accent)' }} data-testid="care-note">
      <h2 style={{ fontSize: 22 }} className="font-extrabold">
        Add care note
      </h2>
      <div className="flex flex-wrap gap-2" role="group" aria-label="What is this note about">
        {(Object.keys(CHIP_LABEL) as CareChip[]).map((c) => (
          <button key={c} onClick={() => toggle(c)} aria-pressed={chips.includes(c)} className={`btn ${chips.includes(c) ? 'btn-primary' : 'btn-ghost'}`}>
            {CHIP_LABEL[c]}
          </button>
        ))}
      </div>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        aria-label="One line (optional)"
        placeholder="One line (optional)"
        maxLength={140}
        style={{ fontSize: 17, padding: '10px 12px', border: '2px solid var(--card-border)', borderRadius: 12, background: 'var(--surface)' }}
      />
      <MePicker {...circle} />
      <div className="flex items-center gap-3">
        <button onClick={save} disabled={!chips.length} className="btn btn-primary">
          Save note
        </button>
        {saved && (
          <span role="status" style={{ fontSize: 16, color: 'var(--ok)' }} className="font-bold">
            Saved. It is on the Circle Board and the Visit Card.
          </span>
        )}
      </div>
    </section>
  );
}
