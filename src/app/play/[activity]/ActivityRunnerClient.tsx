'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePerson } from '@/lib/usePerson';
import FamiliarPairs from '@/components/play/FamiliarPairs';
import SoundAndSight from '@/components/play/SoundAndSight';
import PatternGarden from '@/components/play/PatternGarden';
import MyNextStep from '@/components/play/MyNextStep';
import TogetherMoment from '@/components/play/TogetherMoment';
import SaahPat from '@/components/play/SaahPat';
import AponMukh from '@/components/play/AponMukh';
import RestPause from '@/components/play/RestPause';
import { logRest, nextRun, readRun, restDue, writeRun } from '@/lib/restPause';
import type { Activity } from '@/lib/db';

export default function ActivityRunnerClient({ activity }: { activity: Activity }) {
  const { person, loading } = usePerson();
  const router = useRouter();
  const [run, setRun] = useState(0);
  const [resting, setResting] = useState<boolean | null>(null);

  // F13: decided once per activity start, before the game mounts.
  useEffect(() => {
    if (!person) return;
    const now = Date.now();
    const playRun = readRun();
    if (restDue(playRun, now)) {
      logRest(person.id, 'rest_prompt_shown');
    } else {
      writeRun(nextRun(playRun, now));
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResting(restDue(playRun, now));
  }, [person]);

  if (loading || !person || resting === null) return null;

  if (resting) {
    return (
      <RestPause
        person={person}
        onRest={() => {
          writeRun(null);
          logRest(person.id, 'rest_now');
          router.push('/');
        }}
        onOneMore={() => {
          const now = Date.now();
          writeRun({ since: now, last: now });
          logRest(person.id, 'rest_one_more');
          setResting(false);
        }}
      />
    );
  }

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
