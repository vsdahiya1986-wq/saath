'use client';
import { useState } from 'react';
import { usePerson } from '@/lib/usePerson';
import FamiliarPairs from '@/components/play/FamiliarPairs';
import SoundAndSight from '@/components/play/SoundAndSight';
import PatternGarden from '@/components/play/PatternGarden';
import MyNextStep from '@/components/play/MyNextStep';
import TogetherMoment from '@/components/play/TogetherMoment';
import SaahPat from '@/components/play/SaahPat';
import AponMukh from '@/components/play/AponMukh';
import type { Activity } from '@/lib/db';

export default function ActivityRunnerClient({ activity }: { activity: Activity }) {
  const { person, loading } = usePerson();
  const [run, setRun] = useState(0);

  if (loading || !person) return null;
  const props = { person, onRestart: () => setRun((r) => r + 1) };

  switch (activity) {
    case 'familiar_pairs':
      return <FamiliarPairs key={run} {...props} />;
    case 'sound_sight':
      return <SoundAndSight key={run} {...props} />;
    case 'pattern_garden':
      return <PatternGarden key={run} {...props} />;
    case 'my_next_step':
      return <MyNextStep key={run} {...props} />;
    case 'together':
      return <TogetherMoment key={run} {...props} />;
    case 'saah_pat':
      return <SaahPat key={run} {...props} />;
    case 'apon_mukh':
      return <AponMukh key={run} {...props} />;
    default:
      return null;
  }
}
