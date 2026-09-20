'use client';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { Activity, Person } from '@/lib/db';
import type { CstSession } from '@/lib/useCstSession';
import { t } from '@/lib/i18n';
import { activityInfo, DOMAIN_COLOR } from '@/content/activities';
import Icon from '@/components/ui/Icon';
import IconTile from '@/components/ui/IconTile';
import ExitBar from '@/components/ui/ExitBar';
import AdaptiveBadge from '@/components/ui/AdaptiveBadge';
import StatusBadge from '@/components/ui/StatusBadge';
import SessionOutcomeNote from '@/components/ui/SessionOutcomeNote';
import MoodCheck from './MoodCheck';

/** Shared activity screen (SIH26003 a, b, h): header, progress, spoken prompt, Help, and the always-present Pause/Skip/Stop bar. */
export default function GameFrame({
  person,
  activity,
  session,
  progress,
  prompt,
  onListen,
  onHelp,
  onSkipStep,
  doneTitle,
  doneExtra,
  onRestart,
  notice,
  retry,
  children,
}: {
  person: Person;
  activity: Activity;
  session: CstSession;
  progress?: { current: number; total: number };
  prompt?: ReactNode;
  onListen?: () => void;
  onHelp?: () => void;
  /** Skips the current step only (B4). Omitted by activities with no steps. */
  onSkipStep?: () => void;
  doneTitle?: string;
  doneExtra?: ReactNode;
  onRestart: () => void;
  notice?: ReactNode;
  /** 07 C4: after a first wrong answer, say so on screen too — the spoken cue may not play. */
  retry?: boolean;
  children: ReactNode;
}) {
  const router = useRouter();
  const info = activityInfo(activity);
  const color = DOMAIN_COLOR[info.domainKey];
  const lang = person.language;
  const { phase, decision } = session;

  if (phase === 'loading') {
    return (
      <main className="min-h-[100dvh] flex flex-col items-center justify-center gap-5">
        <IconTile icon={info.icon} size={56} fg={color} />
        <div className="spinner" aria-label="Loading" />
      </main>
    );
  }

  const completed = session.outcome === 'completed';

  return (
    <main className="h-[100dvh] flex flex-col">
      <header className="shrink-0 w-full max-w-3xl mx-auto px-5 pt-5 pb-3 flex flex-col gap-4">
        {/* 08 item 5: at phone width the badges wrap below the title rather
            than squeezing it (Assamese titles are long). */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 grow basis-56">
            <IconTile icon={info.icon} size={30} fg={color} />
            <div className="min-w-0">
              {/* Fix pack A2: "CST Session 10 · Orientation" is clinician metadata —
                  it meant nothing to the person and was English on every
                  Assamese screen. It stays in the Evidence Inspector. */}
              <h1 style={{ fontSize: 28, overflowWrap: 'anywhere' }} className="font-extrabold leading-tight">
                {t(info.labelKey, lang)}
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            {decision && <AdaptiveBadge decision={decision} lang={lang} />}
            <StatusBadge lang={lang} />
          </div>
        </div>
        {progress && phase !== 'done' && (
          <div className="flex items-center gap-3" data-testid="progress" aria-label={`${Math.min(progress.current, progress.total)} / ${progress.total}`}>
            <div className="progress-track flex-1">
              <div className="progress-fill" style={{ transform: `scaleX(${Math.max(0.04, (progress.current - 1) / progress.total)})` }} />
            </div>
            <span style={{ fontSize: 17 }} className="muted font-semibold tabular-nums">
              {Math.min(progress.current, progress.total)} / {progress.total}
            </span>
          </div>
        )}
      </header>

      {phase === 'done' ? (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div
            data-testid={completed ? 'activity-complete' : 'activity-ended'}
            className="max-w-xl mx-auto px-6 py-8 flex flex-col items-center gap-6 text-center"
          >
            <div
              className="rise flex items-center justify-center rounded-full"
              style={{
                width: 140,
                height: 140,
                background: completed ? 'var(--accent)' : 'var(--accent-warm-soft)',
                color: completed ? 'var(--on-accent)' : 'var(--accent-warm)',
                boxShadow: 'var(--shadow-raised)',
              }}
            >
              <Icon name={completed ? 'check' : 'heart'} size={68} strokeWidth={2.6} />
            </div>
            <h2 className="title-lg">{doneTitle ?? t(completed ? 'game.well_done' : 'game.gentle_end', lang)}</h2>
            {doneExtra && <div className="w-full flex justify-center">{doneExtra}</div>}
            {session.nextPreview && decision && (
              <div className="w-full flex justify-center">
                <SessionOutcomeNote preview={session.nextPreview} playedDifficulty={session.difficulty} playedCue={session.cueUsed} lang={lang} />
              </div>
            )}
            <MoodCheck lang={lang} mood={session.mood} onPick={session.setMood} />
            <div className="flex flex-wrap gap-3 justify-center">
              <button onClick={onRestart} className="btn btn-primary btn-xl">
                <Icon name="refresh" size={26} strokeWidth={2.4} /> {t('game.play_again', lang)}
              </button>
              <button onClick={() => router.push('/play')} className="btn btn-ghost btn-xl">
                {t('game.more_activities', lang)}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-5 pb-6 flex flex-col gap-5">
              {notice && (
                <p style={{ fontSize: 16 }} className="muted flex items-center gap-2">
                  <Icon name="sparkle" size={16} /> {notice}
                </p>
              )}
              {prompt && (
                <div className="core p-5 flex flex-wrap items-center gap-4" style={{ borderLeft: `8px solid ${color}` }}>
                  <div className="flex-1 min-w-0 basis-48" aria-live="polite">
                    {prompt}
                    {retry && (
                      <p data-testid="retry-message" role="status" style={{ fontSize: 20, color: 'var(--accent-warm)' }} className="font-bold mt-2">
                        {t('game.look_again', lang)}
                      </p>
                    )}
                  </div>
                  {onListen && (
                    <button onClick={onListen} aria-label={t('a11y.listen', lang)} className="btn btn-ghost btn-icon shrink-0" style={{ width: 76, height: 76, color }}>
                      <Icon name="listen" size={32} />
                    </button>
                  )}
                </div>
              )}

              {children}

              {onHelp && phase === 'playing' && (
                <div className="flex justify-center pt-1">
                  <button onClick={onHelp} className="btn btn-ghost" style={{ color: 'var(--accent-warm)', borderColor: 'var(--accent-warm)' }}>
                    <Icon name="sparkle" size={24} /> {t('home.help', lang)}
                  </button>
                </div>
              )}
            </div>
          </div>

          <ExitBar
            person={person}
            paused={phase === 'paused'}
            onPauseToggle={session.togglePause}
            onSkipOne={onSkipStep}
            onEnd={() => session.leave('withdrawn', '/play')}
          />

          {phase === 'paused' && (
            <div className="fixed inset-0 flex flex-col items-center justify-center gap-5 p-6 text-center" style={{ zIndex: 40, background: 'var(--bg)' }}>
              <span style={{ color: 'var(--accent)' }}>
                <Icon name="pause" size={80} />
              </span>
              <p className="title-lg">{t('exit.pause', lang)}</p>
              <p style={{ fontSize: 20 }} className="muted max-w-sm">
                {t('common.pause', lang)}
              </p>
              <button onClick={session.togglePause} className="btn btn-primary btn-xl">
                <Icon name="play" size={26} /> {t('common.continue', lang)}
              </button>
              <button onClick={() => session.leave('withdrawn', '/play')} className="btn btn-ghost">
                <Icon name="stop" size={22} /> {t('exit.end', lang)}
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
