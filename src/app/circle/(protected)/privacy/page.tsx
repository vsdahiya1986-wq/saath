'use client';
import { useState } from 'react';
import BackButton from '@/components/ui/BackButton';
import Icon from '@/components/ui/Icon';
import { clearActivePersonId, usePerson } from '@/lib/usePerson';
import { db, deletePerson } from '@/lib/db';
import { t } from '@/lib/i18n';

/**
 * "What we keep, and where" (fix pack 10, Tier 1.2). Plain language, and only
 * claims the code makes good on:
 *  - encrypted fields: db.putPerson / putMember / putPack / putReminder /
 *    putCareNote / putBlob, AES-256-GCM with a key minted on-device (crypto.ts).
 *  - what sync sends: syncTrials() pushes `trials` rows and nothing else.
 *  - deleting everything: the button below, which is why the claim is true.
 * The DPDP Act is named once, describing what the app does — no compliance or
 * certification claim; `privacy.dpdp` says that in as many words.
 */
function Block({ title, body, testid }: { title: string; body: string; testid?: string }) {
  return (
    <section className="core p-5 flex flex-col gap-2" data-testid={testid}>
      <h2 style={{ fontSize: 20 }} className="font-extrabold">
        {title}
      </h2>
      <p style={{ fontSize: 18, overflowWrap: 'anywhere' }} className="leading-snug">
        {body}
      </p>
    </section>
  );
}

export default function PrivacyScreen() {
  const { person } = usePerson();
  const lang = person?.language ?? 'en';
  const [armed, setArmed] = useState(false);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  /** Two taps, like a Care Note — no browser confirm dialog anywhere in this app. */
  async function remove() {
    if (!armed) {
      setArmed(true);
      return;
    }
    setBusy(true);
    for (const p of await db.persons.toArray()) await deletePerson(p.id);
    await clearActivePersonId();
    setArmed(false);
    setBusy(false);
    setDone(true);
  }

  return (
    <main className="flex-1 min-h-0 flex flex-col">
      <header className="shrink-0 w-full max-w-3xl mx-auto px-5 pt-2 pb-3 flex flex-col items-start gap-3">
        <BackButton href="/circle" label="Circle" />
        <h1 className="title-xl">{t('privacy.title', lang)}</h1>
        <p style={{ fontSize: 18, overflowWrap: 'anywhere' }} className="muted">
          {t('privacy.on_device', lang)}
        </p>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto w-full max-w-3xl mx-auto px-5 pb-6 flex flex-col gap-4">
        <Block title={t('privacy.stored_title', lang)} body={t('privacy.stored_list', lang)} />
        <Block title={t('privacy.locked_title', lang)} body={t('privacy.locked', lang)} testid="privacy-encryption" />

        <section className="core p-5 flex flex-col gap-2" data-testid="privacy-leaves">
          <h2 style={{ fontSize: 20 }} className="font-extrabold">
            {t('privacy.leaves_title', lang)}
          </h2>
          <p style={{ fontSize: 18, overflowWrap: 'anywhere' }} className="leading-snug">
            {t('privacy.leaves', lang)}
          </p>
          <p style={{ fontSize: 17, overflowWrap: 'anywhere' }} className="muted leading-snug">
            {t('privacy.sync_on', lang)}
          </p>
        </section>

        <section className="core p-5 flex flex-col gap-3" style={{ borderTop: '6px solid var(--alert)' }} data-testid="privacy-delete">
          <h2 style={{ fontSize: 20 }} className="font-extrabold">
            {t('privacy.delete_title', lang)}
          </h2>
          <p style={{ fontSize: 18, overflowWrap: 'anywhere' }} className="leading-snug">
            {t('privacy.delete_how', lang)}
          </p>
          {done ? (
            <p style={{ fontSize: 18 }} className="font-bold" data-testid="privacy-deleted">
              {t('privacy.deleted', lang)}
            </p>
          ) : (
            <button
              onClick={remove}
              disabled={busy}
              data-testid="privacy-delete-all"
              className="btn btn-ghost self-start"
              style={{ minHeight: 64, color: 'var(--alert)', borderColor: 'var(--alert)' }}
            >
              <Icon name="stop" size={22} />
              <span style={{ overflowWrap: 'anywhere' }}>{armed ? t('privacy.delete_confirm', lang) : t('privacy.delete_button', lang)}</span>
            </button>
          )}
        </section>

        <p style={{ fontSize: 16, overflowWrap: 'anywhere' }} className="muted leading-snug" data-testid="privacy-dpdp">
          {t('privacy.dpdp', lang)}
        </p>
      </div>
    </main>
  );
}
