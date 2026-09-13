import protocol from '@/content/cst/protocol.json';
import BackButton from '@/components/ui/BackButton';
import Icon from '@/components/ui/Icon';
import IconTile from '@/components/ui/IconTile';
import { DOMAIN_COLOR, activityInfo } from '@/content/activities';
import type { Activity } from '@/lib/db';
import { STRINGS } from '@/content/strings';

export default function CstProtocolMap() {
  return (
    <main className="min-h-[100dvh]">
      <div className="max-w-4xl mx-auto px-5 pt-6 pb-16 flex flex-col gap-8">
        <header className="rise">
          <BackButton href="/inspector" label="Back to Evidence Inspector" />
        </header>

        <section className="flex flex-col gap-3 rise rise-1">
          <span className="eyebrow self-start">
            <Icon name="shield" size={14} /> Cognitive Stimulation Therapy
          </span>
          <h1 className="title-xl">CST Protocol Map</h1>
          <p style={{ fontSize: 19 }} className="muted max-w-3xl">
            {protocol.framing}
          </p>
        </section>

        <section className="flex flex-col gap-4">
          {protocol.mapping.map((m, i) => {
            const info = activityInfo(m.activity as Activity);
            const color = DOMAIN_COLOR[info.domainKey];
            return (
              <div key={m.activity} className={`shell rise rise-${Math.min(i + 2, 6)}`}>
                <div className="core p-5 flex gap-4 items-start">
                  <IconTile icon={info.icon} size={36} fg={color} />
                  <div className="flex flex-col gap-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span style={{ fontSize: 24 }} className="font-extrabold">
                        {m.label}
                      </span>
                      <span className="chip" style={{ color }}>
                        {STRINGS[info.domainKey]}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="chip" style={{ color: 'var(--accent)' }}>
                        {m.cstSession}
                      </span>
                      <span className="chip" style={{ color: 'var(--text-muted)' }}>
                        PS {m.psRequirement}
                      </span>
                    </div>
                    <p style={{ fontSize: 18 }}>{m.cstTheme}</p>
                    <p style={{ fontSize: 16 }} className="muted">
                      {m.note}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="title-lg" style={{ fontSize: 28 }}>
            CST principles built in
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {protocol.principles.map((p) => (
              <div key={p} className="panel p-4 flex gap-3 items-start">
                <span style={{ color: 'var(--accent)' }} className="mt-0.5">
                  <Icon name="check" size={22} strokeWidth={2.6} />
                </span>
                <p style={{ fontSize: 17 }}>{p}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="title-lg" style={{ fontSize: 28 }}>
            Evidence base
          </h2>
          <ul className="flex flex-col gap-3">
            {protocol.evidence.map((e, i) => (
              <li key={i} className="panel p-4 flex gap-3" style={{ fontSize: 16 }}>
                <span className="font-extrabold" style={{ color: 'var(--accent-2)' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>{e}</span>
              </li>
            ))}
          </ul>
          <div className="panel p-5 flex gap-3 items-center" style={{ borderColor: 'var(--warn)' }}>
            <span style={{ color: 'var(--warn)' }}>
              <Icon name="warning" size={28} />
            </span>
            <p style={{ fontSize: 18 }} className="font-bold">
              {protocol.honestLimit}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
