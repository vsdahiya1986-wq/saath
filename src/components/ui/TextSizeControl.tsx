'use client';
import { useEffect, useState } from 'react';
import { getPerson, Person, putPerson, TEXT_SCALES, TextScale } from '@/lib/db';
import { preparePerson } from '@/lib/usePerson';
import { t } from '@/lib/i18n';

const LABEL: Record<TextScale, string> = { 1: 'A', 1.15: 'A+', 1.3: 'A++' };
const NAME: Record<TextScale, string> = { 1: 'Normal text', 1.15: 'Larger text', 1.3: 'Largest text' };

/** Easy View (F12): text size, saved on the person and applied at once. */
export default function TextSizeControl({ personId }: { personId: string | null }) {
  const [person, setPerson] = useState<Person | null>(null);

  useEffect(() => {
    if (personId) getPerson(personId).then((p) => setPerson(p ?? null));
  }, [personId]);

  if (!person) return null;
  const current = person.text_scale ?? 1;

  async function choose(scale: TextScale) {
    const next = { ...person!, text_scale: scale };
    await putPerson(next);
    await preparePerson(next);
    setPerson(next);
  }

  return (
    <div className="flex items-center gap-2" role="group" aria-label={t('display.text_size', person.language)} data-testid="text-size">
      {TEXT_SCALES.map((s) => (
        <button
          key={s}
          onClick={() => choose(s)}
          aria-pressed={s === current}
          aria-label={NAME[s]}
          // Not btn-icon: that is a fixed square for one glyph, and "A++" at
          // this size overflowed it on the fonts Linux and Android use (it fit
          // on Windows, so only CI saw it). `.btn` keeps the 64 px touch
          // target and grows with the label instead.
          className={`btn ${s === current ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: 18 + (s - 1) * 40, padding: '0 16px' }}
        >
          {LABEL[s]}
        </button>
      ))}
    </div>
  );
}
