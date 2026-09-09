/** Analog clock face — non-literate/basic tiers show time as hands, not digits. */
export default function AnalogClock({ hour, minute, size = 72 }: { hour: number; minute: number; size?: number }) {
  const hourAngle = ((hour % 12) + minute / 60) * 30 - 90;
  const minuteAngle = minute * 6 - 90;
  const r = size / 2;
  const hourLen = r * 0.5;
  const minLen = r * 0.75;

  const point = (angleDeg: number, len: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: r + len * Math.cos(rad), y: r + len * Math.sin(rad) };
  };
  const hp = point(hourAngle, hourLen);
  const mp = point(minuteAngle, minLen);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle cx={r} cy={r} r={r - 3} fill="none" stroke="var(--border)" strokeWidth={3} />
      {[...Array(12)].map((_, i) => {
        const p1 = point(i * 30 - 90, r - 6);
        const p2 = point(i * 30 - 90, r - 12);
        return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="var(--border)" strokeWidth={2} />;
      })}
      <line x1={r} y1={r} x2={hp.x} y2={hp.y} stroke="var(--text)" strokeWidth={4} strokeLinecap="round" />
      <line x1={r} y1={r} x2={mp.x} y2={mp.y} stroke="var(--accent)" strokeWidth={3} strokeLinecap="round" />
      <circle cx={r} cy={r} r={3} fill="var(--text)" />
    </svg>
  );
}
