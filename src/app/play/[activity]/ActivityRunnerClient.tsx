'use client';
import { usePerson } from '@/lib/usePerson';
import FamiliarPairs from '@/components/play/FamiliarPairs';
import SoundAndSight from '@/components/play/SoundAndSight';
import PatternGarden from '@/components/play/PatternGarden';
import MyNextStep from '@/components/play/MyNextStep';
import TogetherMoment from '@/components/play/TogetherMoment';
import type { Activity } from '@/lib/db';

export default function ActivityRunnerClient({ activity }: { activity: Activity }) {
  const { person, loading } = usePerson();

  if (loading || !person) return null;

  switch (activity) {
    case 'familiar_pairs':
      return <FamiliarPairs person={person} />;
    case 'sound_sight':
      return <SoundAndSight person={person} />;
    case 'pattern_garden':
      return <PatternGarden person={person} />;
    case 'my_next_step':
      return <MyNextStep person={person} />;
    case 'together':
      return <TogetherMoment person={person} />;
    default:
      return null;
  }
}
