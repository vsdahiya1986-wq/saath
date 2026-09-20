'use client';
import { usePerson } from '@/lib/usePerson';
import BackButton from '@/components/ui/BackButton';
import Icon from '@/components/ui/Icon';
import { ACTIVITIES, DOMAIN_COLOR } from '@/content/activities';
import { t } from '@/lib/i18n';

/**
 * "Why these activities" (fix pack 10, Tier 1.1). The seven activities and the
 * well-established assessment tasks each one resembles, for a family member or
 * a health worker.
 *
 * Every line on this screen is a claim about the app, so each one is checked
 * against what the activity actually does — `cstSession` is the CST session it
 * already declares in src/content/activities.ts, not a new claim invented here.
 * Resemblance is not equivalence: `why.not_a_test` says so on screen and a
 * test asserts it is present.
 */
export default function WhyTheseActivities() {
  const { person } = usePerson();
  const lang = person?.language ?? 'en';

  return (
    <main className="flex-1 min-h-0 flex flex-col">
      <header className="shrink-0 w-full max-w-3xl mx-auto px-5 pt-2 pb-3 flex flex-col items-start gap-3">
        <BackButton href="/circle" label="Circle" />
        <h1 className="title-xl">{t('why.title', lang)}</h1>
        <p style={{ fontSize: 18 }} className="muted">
          {t('why.intro', lang)}
        </p>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto w-full max-w-3xl mx-auto px-5 pb-6 flex flex-col gap-4">
        <section
          data-testid="why-disclaimer"
          className="core p-5 flex flex-col gap-2"
          style={{ borderTop: '6px solid var(--accent-warm)' }}
        >
          <p style={{ fontSize: 18, overflowWrap: 'anywhere' }} className="font-bold leading-snug">
            {t('why.not_a_test', lang)}
          </p>
          <p style={{ fontSize: 17 }} className="muted">
            {t('why.ask_doctor', lang)}
          </p>
        </section>

        {ACTIVITIES.map((a) => {
          const color = DOMAIN_COLOR[a.domainKey];
          return (
            <section key={a.activity} data-testid="why-activity" className="core p-5 flex flex-col gap-3" style={{ borderTop: `6px solid ${color}` }}>
              <div className="flex items-center gap-3">
                <span className="nub" style={{ width: 52, height: 52, color }}>
                  <Icon name={a.icon} size={28} strokeWidth={1.9} />
                </span>
                <h2 style={{ fontSize: 22, overflowWrap: 'anywhere' }} className="font-extrabold leading-tight">
                  {t(a.labelKey, lang)}
                </h2>
              </div>

              <dl className="flex flex-col gap-2">
                <div>
                  <dt style={{ fontSize: 14, letterSpacing: '0.08em' }} className="font-bold uppercase muted">
                    {t('why.works_on', lang)}
                  </dt>
                  <dd style={{ fontSize: 18, overflowWrap: 'anywhere' }} className="font-bold leading-snug">
                    {t(`why.${a.activity}.works_on`, lang)}
                  </dd>
                </div>
                <div>
                  <dt style={{ fontSize: 14, letterSpacing: '0.08em' }} className="font-bold uppercase muted">
                    {t('why.similar_to', lang)}
                  </dt>
                  <dd style={{ fontSize: 18, overflowWrap: 'anywhere' }} className="leading-snug">
                    {t(`why.${a.activity}.similar_to`, lang)}
                  </dd>
                </div>
              </dl>

              <p style={{ fontSize: 17, overflowWrap: 'anywhere' }} className="muted leading-snug">
                {t(`why.${a.activity}.reason`, lang)}
              </p>
              {/* The CST session this activity already declares — English, as it names a published programme. */}
              <span className="chip self-start" style={{ color }}>
                {a.cstSession}
              </span>
            </section>
          );
        })}
      </div>
    </main>
  );
}
