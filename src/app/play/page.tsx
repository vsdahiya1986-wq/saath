'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePerson } from '@/lib/usePerson';
import { t } from '@/lib/i18n';
import { queueAutoCue } from '@/lib/audio';
import BigChoice from '@/components/ui/BigChoice';
import StatusBadge from '@/components/ui/StatusBadge';
import BackButton from '@/components/ui/BackButton';
import BottomNav from '@/components/ui/BottomNav';
import { ACTIVITIES, ActivityInfo, DOMAIN_COLOR } from '@/content/activities';
import { aajirTiniFor } from '@/lib/rotation';

/** Activity picker (SIH26003 a, h): Aajir Tini plus all seven CST activities as literacy-tiered BigChoice cards. */
export default function PlayPicker() {
  const router = useRouter();
  const { person, loading } = usePerson();
  const [three, setThree] = useState<ActivityInfo[]>([]);

  useEffect(() => {
    if (person) queueAutoCue('play.title', person.language);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [person?.id, person?.language]);

  useEffect(() => {
    if (person) aajirTiniFor(person.id).then(setThree);
  }, [person]);

  if (loading || !person) return null;

  return (
    <main className="h-[100dvh] flex flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="w-full max-w-5xl mx-auto px-5 pt-5 pb-6 flex flex-col gap-5">
          <header className="flex items-center justify-between gap-3">
            <BackButton href="/" label={t('common.back', person.language)} />
            <StatusBadge lang={person.language} />
          </header>

          <div className="flex flex-col gap-2">
            <span className="eyebrow self-start">Cognitive Stimulation Therapy</span>
            <h1 className="title-xl">{t('play.title', person.language)}</h1>
            <p className="muted" style={{ fontSize: 19 }}>
              Short, gentle sessions. There are no wrong answers — just try your best.
            </p>
          </div>

          {/* F6 — Aajir Tini: three from three different domains, least recently
              played first. The full list stays right below it. */}
          {three.length > 0 && (
            <section className="flex flex-col gap-3" data-testid="aajir-tini">
              <h2 style={{ fontSize: 22 }} className="font-extrabold">
                {t('play.today_three', person.language)}
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {three.map((a) => (
                  <BigChoice
                    key={a.activity}
                    testId={`today-three-${a.activity}`}
                    icon={a.icon}
                    labelKey={a.labelKey}
                    subKey={a.domainKey}
                    tag={a.cstSession}
                    color={DOMAIN_COLOR[a.domainKey]}
                    person={person}
                    onSelect={() => router.push(`/play/${a.slug}`)}
                  />
                ))}
              </div>
            </section>
          )}

          <h2 style={{ fontSize: 22 }} className="font-extrabold">
            {t('play.all_activities', person.language)}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {ACTIVITIES.map((a) => (
              <BigChoice
                key={a.activity}
                testId={`activity-card-${a.activity}`}
                icon={a.icon}
                labelKey={a.labelKey}
                subKey={a.domainKey}
                tag={a.cstSession}
                color={DOMAIN_COLOR[a.domainKey]}
                person={person}
                onSelect={() => router.push(`/play/${a.slug}`)}
              />
            ))}
          </div>
        </div>
      </div>
      <BottomNav lang={person.language} backHref="/" backLabel={t('common.back', person.language)} />
    </main>
  );
}
