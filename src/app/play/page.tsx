'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePerson } from '@/lib/usePerson';
import { t } from '@/lib/i18n';
import { playCue, queueAutoCue } from '@/lib/audio';
import Icon from '@/components/ui/Icon';
import IconTile from '@/components/ui/IconTile';
import StatusBadge from '@/components/ui/StatusBadge';
import BackButton from '@/components/ui/BackButton';
import BottomNav from '@/components/ui/BottomNav';
import { ACTIVITIES, DOMAIN_COLOR } from '@/content/activities';

export default function PlayPicker() {
  const router = useRouter();
  const { person, loading } = usePerson();

  useEffect(() => {
    if (!person) return;
    queueAutoCue('play.title', person.language);
    if (person.literacy !== 'non-literate') return;
    for (const { labelKey } of ACTIVITIES) queueAutoCue(labelKey, person.language);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [person?.id, person?.literacy, person?.language]);

  if (loading || !person) return null;
  const big = person.literacy === 'non-literate';

  return (
    <main className="h-[100dvh] flex flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-5 pt-6 pb-8 flex flex-col gap-6">
          <header className="flex items-center justify-between gap-3 rise">
            <BackButton href="/" label={t('common.back', person.language)} />
            <StatusBadge lang={person.language} />
          </header>

          <div className="flex flex-col gap-3 rise rise-1">
            <span className="eyebrow self-start">
              <Icon name="sparkle" size={14} /> Cognitive Stimulation Therapy
            </span>
            <h1 className="title-xl">{t('play.title', person.language)}</h1>
            <p className="muted" style={{ fontSize: 19 }}>
              Short, gentle sessions. There are no wrong answers — just try your best and enjoy.
            </p>
          </div>

          {ACTIVITIES.map(({ activity, icon, labelKey, domainKey, cstSession, blurb }, i) => {
            const color = DOMAIN_COLOR[domainKey];
            return (
              <div key={activity} data-testid={`activity-card-${activity}`} className={`shell hover-lift rise rise-${Math.min(i + 2, 6)}`}>
                <div
                  className="core p-5 flex flex-col gap-4"
                  style={{ background: `radial-gradient(90% 120% at 0% 0%, color-mix(in srgb, ${color} 12%, transparent) 0%, transparent 55%), linear-gradient(180deg, var(--surface-2), var(--surface))` }}
                >
                  <div className="flex items-start gap-4">
                    <IconTile icon={icon} size={big ? 52 : 40} fg={color} />
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <span style={{ fontSize: 13, color, letterSpacing: '0.12em' }} className="font-bold uppercase">
                        {cstSession}
                      </span>
                      <span style={{ fontSize: big ? 32 : 28, letterSpacing: '-0.02em' }} className="font-extrabold leading-tight">
                        {t(labelKey, person.language)}
                      </span>
                      {!big && (
                        <span style={{ fontSize: 17 }} className="muted">
                          {blurb}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => playCue(labelKey, person.language)}
                      aria-label={t('a11y.listen', person.language)}
                      className="btn btn-ghost btn-icon"
                      style={{ color }}
                    >
                      <Icon name="listen" size={24} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <span className="chip" style={{ color }} data-testid={`domain-badge-${activity}`}>
                      {t(domainKey, person.language)}
                    </span>
                    <button onClick={() => router.push(`/play/${activity}`)} className="btn btn-primary" style={{ paddingRight: 10 }}>
                      {t('common.open', person.language)}
                      <span className="nub">
                        <Icon name="arrow" size={22} strokeWidth={2.6} />
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <BottomNav lang={person.language} backHref="/" backLabel={t('common.back', person.language)} />
    </main>
  );
}
