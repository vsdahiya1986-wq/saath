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

export default function GameFrame({
  person,
  activity,
  session,
  progress,
  prompt,
  onListen,
  onHelp,
  doneTitle,
  doneExtra,
  onRestart,
  notice,
  children,
}: {
  person: Person;
  activity: Activity;
  session: CstSession;
  progress?: { current: number; total: number };
  prompt?: ReactNode;
  onListen?: () => void;
  onHelp?: () => void;
  doneTitle?: string;
  doneExtra?: ReactNode;
  onRestart: () => void;
  notice?: ReactNode;
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
      <header className="shrink-0 w-full max-w-3xl mx-auto px-5 pt-5 pb-3 flex flex-col gap-4 rise">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <IconTile icon={info.icon} size={30} fg={color} />
            <div className="min-w-0">
              <div style={{ fontSize: 12, color, letterSpacing: '0.14em' }} className="font-bold uppercase truncate">
                {info.cstSession}
              </div>
              <h1 style={{ fontSize: 28, letterSpacing: '-0.02em' }} className="font-extrabold leading-tight">
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
          <div className="flex items-center gap-3" aria-label={`Step ${progress.current} of ${progress.total}`}>
            <div className="progress-track flex-1">
              <div className="progress-fill" style={{ transform: `scaleX(${Math.max(0.04, (progress.current - 1) / progress.total)})` }} />
            </div>
            <span style={{ fontSize: 16 }} className="muted font-semibold tabular-nums">
              {Math.min(progress.current, progress.total)} of {progress.total}
            </span>
          </div>
        )}
      </header>

      {phase === 'done' ? (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="max-w-xl mx-auto px-6 py-10 flex flex-col items-center gap-6 text-center">
            <div
              className="rise flex items-center justify-center rounded-full"
              style={{
                width: 150,
                height: 150,
                color: completed ? 'var(--on-accent)' : '#3b0a24',
                background: completed
                  ? 'radial-gradient(circle at 35% 30%, #ccfbf1, #5eead4 50%, #0d9488)'
                  : 'radial-gradient(circle at 35% 30%, #fce7f3, #f9a8d4 50%, #db2777)',
                boxShadow: completed ? '0 30px 90px -20px rgba(94,234,212,0.8)' : '0 30px 90px -20px rgba(249,168,212,0.7)',
              }}
            >
              <Icon name={completed ? 'check' : 'heart'} size={72} strokeWidth={2.6} />
            </div>
            <h2 className="title-lg rise rise-1">{doneTitle ?? t(completed ? 'game.well_done' : 'game.gentle_end', lang)}</h2>
            {doneExtra && <div className="w-full rise rise-2 flex justify-center">{doneExtra}</div>}
            {session.nextPreview && decision && (
              <div className="w-full flex justify-center rise rise-3">
                <SessionOutcomeNote preview={session.nextPreview} playedDifficulty={session.difficulty} playedCue={session.cueUsed} />
              </div>
            )}
            <div className="flex flex-wrap gap-3 justify-center rise rise-4">
              <button onClick={onRestart} className="btn btn-primary btn-xl">
                <Icon name="refresh" size={26} strokeWidth={2.4} /> Play again
              </button>
              <button onClick={() => router.push('/play')} className="btn btn-ghost btn-xl">
                More activities
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-5 pb-6 flex flex-col gap-5">
              {notice && (
                <p style={{ fontSize: 15 }} className="muted flex items-center gap-2">
                  <Icon name="sparkle" size={16} /> {notice}
                </p>
              )}
              {prompt && (
                <div className="shell rise rise-1">
                  <div
                    className="core p-5 flex items-center gap-4"
                    style={{ background: `radial-gradient(100% 140% at 0% 0%, color-mix(in srgb, ${color} 14%, transparent), transparent 60%), linear-gradient(180deg, var(--surface-2), var(--surface))` }}
                  >
                    <div className="flex-1 min-w-0" aria-live="polite">
                      {prompt}
                    </div>
                    {onListen && (
                      <button onClick={onListen} aria-label={t('a11y.listen', lang)} className="btn btn-ghost btn-icon shrink-0" style={{ width: 76, height: 76, color }}>
                        <Icon name="listen" size={32} />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {children}

              {onHelp && phase === 'playing' && (
                <div className="flex justify-center pt-1">
                  <button onClick={onHelp} className="btn btn-ghost" style={{ color: 'var(--accent-warm)', borderColor: 'rgba(252,211,77,0.45)' }}>
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
            onSkip={() => session.leave('skipped', '/play')}
            onStop={() => session.leave('withdrawn', '/')}
          />

          {phase === 'paused' && (
            <div
              className="fixed inset-0 flex flex-col items-center justify-center gap-6 p-6 text-center"
              style={{ zIndex: 40, background: 'rgba(6,10,19,0.78)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
            >
              <span style={{ color: 'var(--accent)' }} className="breathe">
                <Icon name="pause" size={80} />
              </span>
              <p className="title-lg">{t('exit.pause', lang)}</p>
              <p style={{ fontSize: 20 }} className="muted max-w-sm">
                {t('common.pause', lang)}
              </p>
              <button onClick={session.togglePause} className="btn btn-primary btn-xl">
                <Icon name="play" size={26} /> {t('common.continue', lang)}
              </button>
              <button onClick={() => session.leave('withdrawn', '/')} className="btn btn-ghost" style={{ color: 'var(--alert)', borderColor: 'var(--alert)' }}>
                <Icon name="stop" size={22} /> {t('exit.stop', lang)}
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
