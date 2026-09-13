'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ContentPack, Person, getBlob, packsForPerson, putPack } from '@/lib/db';
import { useCstSession } from '@/lib/useCstSession';
import { playPackAudio, queueAutoCue, queueSpeak, speak } from '@/lib/audio';
import { REMINISCENCE_PROMPTS, shuffle } from '@/content/cstContent';
import Icon from '@/components/ui/Icon';
import IconTile from '@/components/ui/IconTile';
import GameFrame from './GameFrame';

/**
 * "Together Moment" — CST reminiscence (Sessions 3 & 5). Never scored. Uses
 * the family's own photos and voices when prepared; otherwise open CST
 * discussion prompts about opinions and stories, never invented memories.
 */

type Prompt = (typeof REMINISCENCE_PROMPTS)[number];

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
      const packs = await packsForPerson(person.id, 'approved');
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
        else queueAutoCue('play.together.intro', lang);
      }
    },
  });

  const prompt = prompts[index];

  useEffect(() => {
    if (!pack && prompt && session.phase === 'playing') queueSpeak(prompt.question, lang);
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
      doneTitle="Thank you for sharing."
      doneExtra={
        <p style={{ fontSize: 19 }} className="muted max-w-md">
          Talking about memories is good for the mind and the heart. There is no score here.
        </p>
      }
    >
      {pack ? (
        <div className="flex flex-col items-center gap-5">
          <div className="shell w-full rise">
            <div className="core p-4 flex flex-col items-center gap-4">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt={pack.title} className="w-full object-contain" style={{ maxHeight: '42vh', borderRadius: 18 }} />
              ) : (
                <span style={{ color: 'var(--accent)' }}>
                  <Icon name="photo" size={110} />
                </span>
              )}
              <p className="title-lg text-center">{pack.title}</p>
              <p style={{ fontSize: 20 }} className="muted text-center">
                Who is here? What do you remember about this?
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <button onClick={() => playPackAudio(pack.media.audio_key)} className="btn btn-ghost btn-xl" style={{ color: 'var(--accent)' }}>
              <Icon name="listen" size={28} /> Listen
            </button>
            <button onClick={() => session.finish('completed')} className="btn btn-primary btn-xl">
              <Icon name="heart" size={26} /> Done talking
            </button>
          </div>
          <button onClick={rejectForever} style={{ fontSize: 17, color: 'var(--alert)' }} className="underline underline-offset-4 py-3">
            {confirmingReject ? 'Tap again to remove this forever' : "I don't want to see this again"}
          </button>
        </div>
      ) : (
        prompt && (
          <div className="flex flex-col gap-5">
            <div className="shell rise" key={prompt.question}>
              <div
                className="core p-6 flex flex-col items-center gap-5 text-center"
                style={{ background: 'radial-gradient(100% 90% at 50% 0%, rgba(249,168,212,0.14), transparent 60%), linear-gradient(180deg, var(--surface-2), var(--surface))' }}
              >
                <span className="eyebrow" style={{ color: '#f9a8d4', background: 'rgba(249,168,212,0.12)', borderColor: 'rgba(249,168,212,0.35)' }}>
                  {prompt.theme}
                </span>
                <IconTile icon={prompt.icon} size={72} fg="#f9a8d4" />
                <p className="title-lg" style={{ lineHeight: 1.2 }}>
                  {prompt.question}
                </p>
                {showFollow ? (
                  <p style={{ fontSize: 22 }} className="muted rise">
                    {prompt.followUp}
                  </p>
                ) : (
                  <button
                    onClick={() => {
                      setShowFollow(true);
                      speak(prompt.followUp, lang);
                    }}
                    className="btn btn-ghost"
                  >
                    Tell me more
                  </button>
                )}
                <button onClick={() => speak(prompt.question, lang)} className="btn btn-ghost btn-icon" aria-label="Listen" style={{ color: '#f9a8d4', width: 72, height: 72 }}>
                  <Icon name="listen" size={30} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button onClick={nextPrompt} className="btn btn-ghost btn-xl">
                <Icon name="refresh" size={24} /> Another topic
              </button>
              <button onClick={() => session.finish('completed')} className="btn btn-primary btn-xl">
                <Icon name="heart" size={24} /> Done talking
              </button>
            </div>
            <p style={{ fontSize: 16 }} className="muted text-center">
              A family member can add real photos and voices in Pack Studio.{' '}
              <button onClick={() => router.push('/circle/packs')} className="underline underline-offset-4">
                Open
              </button>
            </p>
          </div>
        )
      )}
    </GameFrame>
  );
}
