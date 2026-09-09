import protocol from '@/content/cst/protocol.json';
import Link from 'next/link';

export default function CstProtocolMap() {
  return (
    <main className="min-h-screen bg-[var(--bg)] p-5 flex flex-col gap-5 max-w-2xl mx-auto">
      <h1 style={{ fontSize: 26 }} className="font-black text-[var(--text)]">
        CST Protocol Map
      </h1>
      <p style={{ fontSize: 15 }}>{protocol.framing}</p>

      <section style={cardStyle}>
        <h2 style={{ fontSize: 16, fontWeight: 900, marginBottom: 8 }}>Evidence base</h2>
        <ul style={{ fontSize: 14 }} className="flex flex-col gap-2 list-disc pl-5">
          {protocol.evidence.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      </section>

      <section style={{ ...cardStyle, borderColor: 'var(--warn)' }}>
        <p style={{ fontSize: 14, fontWeight: 700 }}>{protocol.honestLimit}</p>
      </section>

      <section className="flex flex-col gap-3">
        {protocol.mapping.map((m) => (
          <div key={m.activity} style={cardStyle}>
            <div style={{ fontSize: 16 }} className="font-black">
              {m.label} <span style={{ fontSize: 12, fontWeight: 400 }} className="text-[var(--text-muted)]">— PS {m.psRequirement}</span>
            </div>
            <p style={{ fontSize: 14 }} className="mt-1">
              {m.cstTheme}
            </p>
            <p style={{ fontSize: 13 }} className="text-[var(--text-muted)] mt-1">
              {m.note}
            </p>
          </div>
        ))}
      </section>

      <Link href="/inspector" className="underline text-center" style={{ fontSize: 14, color: 'var(--text-muted)' }}>
        Back to Evidence Inspector
      </Link>
    </main>
  );
}

const cardStyle = { border: 'var(--border-w) solid var(--border)', borderRadius: 'var(--radius)', padding: 16 } as const;
