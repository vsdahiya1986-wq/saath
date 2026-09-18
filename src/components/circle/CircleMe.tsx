'use client';
import { useEffect, useState } from 'react';
import { CircleMember, membersForPerson } from '@/lib/db';

const KEY = 'saath_circle_me';

/**
 * Which circle member is using Circle right now, so a Care Note or an
 * acknowledgement is stamped with their name without typing. Remembered per
 * device as a convenience only — the PIN is what guards Circle.
 */
export function useCircleMe(personId: string | null) {
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [me, setMeState] = useState<string>('');

  useEffect(() => {
    if (!personId) return;
    membersForPerson(personId).then((ms) => {
      setMembers(ms);
      let saved = '';
      try {
        saved = localStorage.getItem(KEY) ?? '';
      } catch {}
      setMeState(ms.some((m) => m.name === saved) ? saved : (ms[0]?.name ?? ''));
    });
  }, [personId]);

  function setMe(name: string) {
    setMeState(name);
    try {
      localStorage.setItem(KEY, name);
    } catch {}
  }

  return { members, me, setMe };
}

export function MePicker({ members, me, setMe }: ReturnType<typeof useCircleMe>) {
  if (members.length < 2) return null;
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Who is writing">
      <span style={{ fontSize: 15 }} className="muted">
        You are:
      </span>
      {members.map((m) => (
        <button key={m.id} onClick={() => setMe(m.name)} aria-pressed={m.name === me} className={`btn ${m.name === me ? 'btn-primary' : 'btn-ghost'}`}>
          {m.name}
        </button>
      ))}
    </div>
  );
}
