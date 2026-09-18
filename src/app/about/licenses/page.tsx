import licenses from '@/content/licenses.json';
import BackButton from '@/components/ui/BackButton';

export default function Licenses() {
  return (
    <main className="min-h-screen bg-[var(--bg)] p-5 flex flex-col gap-4 max-w-2xl mx-auto">
      <header className="flex items-center gap-3">
        <BackButton href="/" label="Back to home" />
        <h1 style={{ fontSize: 26 }} className="font-black text-[var(--text)]">
          About &amp; licences
        </h1>
      </header>
      <p style={{ fontSize: 14 }} className="text-[var(--text-muted)]">
        SAATH is built for SIH26003, submitted under the standard student-team guidance to use verified open-source
        components only and acknowledge them appropriately. Every dependency, its licence, and its copyright notice
        is listed here.
      </p>
      <section style={cardStyle} data-testid="roadmap">
        <h2 style={{ fontSize: 18 }} className="font-black">
          Roadmap — not built yet
        </h2>
        <ul style={{ fontSize: 14 }} className="list-disc pl-5 flex flex-col gap-1">
          <li>
            <strong>Bol · Speak</strong> — answer by voice in Assamese through Bhashini speech recognition. Waiting on testing with native
            speakers.
          </li>
          <li>
            <strong>Circle Message</strong> — a WhatsApp note to the circle when the device is online. Waiting on Meta business verification.
          </li>
        </ul>
      </section>
      <div className="flex flex-col gap-3">
        {licenses.map((l) => (
          <div key={l.name} style={cardStyle}>
            <div style={{ fontSize: 16 }} className="font-black">
              {l.name} <span style={{ fontSize: 12, fontWeight: 400 }}>v{l.version}</span>
            </div>
            <div style={{ fontSize: 13 }} className="text-[var(--text-muted)]">
              {l.license} · {l.copyright}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

const cardStyle = { border: 'var(--border-w) solid var(--border)', borderRadius: 'var(--radius)', padding: 14 } as const;
