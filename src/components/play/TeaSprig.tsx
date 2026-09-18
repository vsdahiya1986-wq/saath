/**
 * Original tea sprigs for Saah Pat (F4), drawn here rather than sourced, the
 * same way IconTile draws everything else.
 *
 * The target — "two leaves and a bud" — is the real picking standard on an
 * Assam tea garden, which is why it is the thing worth looking for. The four
 * shapes differ by *silhouette*, never by colour alone: one stroke colour is
 * used for all of them so a person who cannot separate greens is not
 * disadvantaged.
 */

export type SprigKind = 'two_and_bud' | 'three_leaves' | 'one_leaf' | 'bud_only';

/** How alike the distractors are to the target, by difficulty. */
export const SIMILAR_DISTRACTORS: SprigKind[] = ['three_leaves'];
export const PLAIN_DISTRACTORS: SprigKind[] = ['one_leaf', 'bud_only'];

export const SPRIG_LABEL: Record<SprigKind, string> = {
  two_and_bud: 'Two leaves and a bud',
  three_leaves: 'Three leaves',
  one_leaf: 'One leaf',
  bud_only: 'A bud on its own',
};

function Leaf({ x, y, rotate }: { x: number; y: number; rotate: number }) {
  return <path d="M0 0 C 11 -8, 25 -5, 30 0 C 25 5, 11 8, 0 0 Z" transform={`translate(${x} ${y}) rotate(${rotate})`} />;
}

/** A closed, unopened tip — visibly narrower and pointed, not just smaller. */
function Bud({ x, y, rotate }: { x: number; y: number; rotate: number }) {
  return <path d="M0 0 C 5 -7, 7 -15, 4 -22 C 1 -15, -3 -7, 0 0 Z" transform={`translate(${x} ${y}) rotate(${rotate})`} />;
}

export default function TeaSprig({ kind, size = 84 }: { kind: SprigKind; size?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={SPRIG_LABEL[kind]} fill="none" stroke="currentColor" strokeWidth={3.2} strokeLinejoin="round">
      {/* Every sprig shares the same stem, so only the tips distinguish them. */}
      <path d="M50 92 L50 46" strokeLinecap="round" />

      {kind === 'two_and_bud' && (
        <>
          <Leaf x={50} y={62} rotate={-155} />
          <Leaf x={50} y={62} rotate={-25} />
          <Bud x={50} y={46} rotate={0} />
        </>
      )}

      {kind === 'three_leaves' && (
        <>
          <Leaf x={50} y={70} rotate={-155} />
          <Leaf x={50} y={70} rotate={-25} />
          <Leaf x={50} y={46} rotate={-90} />
        </>
      )}

      {kind === 'one_leaf' && <Leaf x={50} y={56} rotate={-25} />}

      {kind === 'bud_only' && <Bud x={50} y={48} rotate={0} />}
    </svg>
  );
}
