'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ContentPack, Person, getBlob, putPack } from '@/lib/db';
import { usablePacks } from '@/lib/familyContent';
import { useCstSession } from '@/lib/useCstSession';
import { playCue, playPackAudio, queueAutoCue } from '@/lib/audio';
import { t } from '@/lib/i18n';
import { REMINISCENCE_PROMPTS, shuffle, togetherKey } from '@/content/cstContent';
import Icon from '@/components/ui/Icon';
import IconTile from '@/components/ui/IconTile';
import GameFrame from './GameFrame';

/**
 * "Together Moment" — CST reminiscence (SIH26003 a.5, d). Never scored. Uses
 * the family's own photos and voices when prepared; otherwise open CST
 * discussion prompts about opinions and stories, never invented memories.
 */

type Prompt = (typeof REMINISCENCE_PROMPTS)[number];
const EMOTION = '#9d174d';

export default function TogetherMoment({ person, onRestart }: { person: Person; onRestart: () => void }) {
  const router = useRouter();
  const lang = person.language;
  const [pack, setPack] = useState<ContentPack | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [index, setIndex] = useState(0);
  const [showFollow, setShowFollow] = useState(false);
  const [confirmingReject, setConfirmingReject] = useState(false);

  const session = useCstSession({
    person,
    activity: 'together',
    version: '2',
    scored: false,
    onStart: async (_d, isCancelled) => {
      const packs = await usablePacks(person.id);
      const candidates = packs.filter((p) => p.permitted_uses.includes('together'));
      if (isCancelled()) return;
      setPrompts(shuffle(REMINISCENCE_PROMPTS).slice(0, 3));
      if (candidates.length) {
        const chosen = candidates[Math.floor(Math.random() * candidates.length)];
        setPack(chosen);
        const key = chosen.media.photo ?? chosen.media.place_photo;
        const blob = key ? await getBlob(key) : undefined;
        if (isCancelled()) return;
        if (blob) setPhotoUrl(URL.createObjectURL(blob));
        if (chosen.media.audio_key) playPackAudio(chosen.media.audio_key);
        else {
          queueAutoCue('play.together.intro', lang);
          queueAutoCue('together.who', lang);
        }
      }
    },
  });

  const prompt = prompts[index];

  useEffect(() => {
    if (!pack && prompt && session.phase === 'playing') queueAutoCue(togetherKey(prompt.theme, 'q'), lang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pack, prompt?.question, session.phase === 'playing']);

  async function rejectForever() {
    if (!pack) return;
    if (!confirmingReject) {
      setConfirmingReject(true);
      return;
    }
    await putPack({ ...pack, state: 'withdrawn' });
    await session.leave('skipped', '/play');
  }

  function nextPrompt() {
    setShowFollow(false);
    setIndex((i) => (i + 1) % prompts.length);
  }

  return (
    <GameFrame
      person={person}
      activity="together"
      session={session}
      onRestart={onRestart}
      doneTitle={t('together.thanks', lang)}
      doneExtra={
        <p style={{ fontSize: 19 }} className="muted max-w-md">
          {t('together.done_note', lang)}
        </p>
      }
    >
      {pack ? (
        <div className="flex flex-col items-center gap-5">
          <div className="core w-full p-4 flex flex-col items-center gap-4">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt={pack.title} className="w-full object-contain" style={{ maxHeight: '42vh', borderRadius: 14 }} />
            ) : (
              <span style={{ color: 'var(--accent)' }}>
                <Icon name="photo" size={110} />
              </span>
            )}
            <p className="title-lg text-center">{pack.title}</p>
            <p data-testid="question" style={{ fontSize: 20 }} className="muted text-center">
              {t('together.who', lang)}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => (pack.media.audio_key ? playPackAudio(pack.media.audio_key) : playCue('together.who', lang))}
              className="btn btn-ghost btn-xl"
              style={{ color: 'var(--accent)' }}
            >
              <Icon name="listen" size={28} /> {t('a11y.listen', lang)}
            </button>
            <button onClick={() => session.finish('completed')} data-testid="together-done" className="btn btn-primary btn-xl">
              <Icon name="heart" size={26} /> {t('together.done', lang)}
            </button>
          </div>
          <button onClick={rejectForever} style={{ fontSize: 18, color: 'var(--alert)', minHeight: 60 }} className="underline underline-offset-4 px-4">
            {t(confirmingReject ? 'together.reject_confirm' : 'together.reject', lang)}
          </button>
        </div>
      ) : (
        prompt && (
          <div className="flex flex-col gap-5">
            <div className="core p-6 flex flex-col items-center gap-5 text-center" key={prompt.theme} style={{ borderTop: `6px solid ${EMOTION}` }}>
              <span className="eyebrow" style={{ color: EMOTION, background: '#fce7f3' }}>
                {t(togetherKey(prompt.theme, 'theme'), lang)}
              </span>
              <IconTile icon={prompt.icon} size={72} fg={EMOTION} />
              <p data-testid="question" className="title-lg">{t(togetherKey(prompt.theme, 'q'), lang)}</p>
              {showFollow ? (
                <p style={{ fontSize: 22 }} className="muted">
                  {t(togetherKey(prompt.theme, 'follow'), lang)}
                </p>
              ) : (
                <button
                  onClick={() => {
                    setShowFollow(true);
                    playCue(togetherKey(prompt.theme, 'follow'), lang);
                  }}
                  className="btn btn-ghost"
                >
                  {t('together.tell_more', lang)}
                </button>
              )}
              <button onClick={() => playCue(togetherKey(prompt.theme, 'q'), lang)} className="btn btn-ghost btn-icon" aria-label={t('a11y.listen', lang)} style={{ color: EMOTION, width: 72, height: 72 }}>
                <Icon name="listen" size={30} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button onClick={nextPrompt} className="btn btn-ghost btn-xl">
                <Icon name="refresh" size={24} /> {t('together.another', lang)}
              </button>
              <button onClick={() => session.finish('completed')} data-testid="together-done" className="btn btn-primary btn-xl">
                <Icon name="heart" size={24} /> {t('together.done', lang)}
              </button>
            </div>
            <p style={{ fontSize: 17 }} className="muted text-center">
              {t('together.add_photos', lang)}{' '}
              <button onClick={() => router.push('/circle/packs')} className="underline underline-offset-4" style={{ minHeight: 64, minWidth: 64 }}>
                {t('common.open', lang)}
              </button>
            </p>
          </div>
        )
      )}
    </GameFrame>
  );
}
