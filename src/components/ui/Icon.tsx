import type { ReactElement } from 'react';

export type IconName =
  | 'play'
  | 'help'
  | 'today'
  | 'listen'
  | 'pause'
  | 'skip'
  | 'stop'
  | 'home'
  | 'camera'
  | 'mic'
  | 'check'
  | 'photo'
  | 'clock'
  | 'circle'
  | 'warning'
  | 'tumbler'
  | 'lamp'
  | 'basket'
  | 'umbrella'
  | 'kettle'
  | 'stool'
  | 'triangle'
  | 'square'
  | 'star'
  | 'cardback'
  | 'back'
  | 'comb'
  | 'torch'
  | 'slipper'
  | 'thali'
  | 'broom'
  | 'ghoti'
  | 'mirror'
  | 'pankha'
  | 'keylock'
  | 'jhola';

const PATHS: Record<IconName, ReactElement> = {
  play: (
    <path d="M8 5.5v13l11-6.5-11-6.5z" fill="currentColor" stroke="none" />
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.7 2.2c-.9.6-1.2 1-1.2 2.1" strokeLinecap="round" />
      <circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" />
    </>
  ),
  today: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 9h16M8 3v4M16 3v4" strokeLinecap="round" />
    </>
  ),
  listen: <path d="M8 5.5v13l11-6.5-11-6.5z" fill="currentColor" stroke="none" />,
  pause: (
    <>
      <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" />
      <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" />
    </>
  ),
  skip: (
    <>
      <path d="M6 5.5v13l9-6.5-9-6.5z" fill="currentColor" stroke="none" />
      <rect x="16" y="5" width="3" height="14" rx="1" fill="currentColor" stroke="none" />
    </>
  ),
  stop: <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" stroke="none" />,
  home: <path d="M4 11.5 12 4l8 7.5M6 10v9h12v-9" strokeLinecap="round" strokeLinejoin="round" />,
  camera: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <circle cx="12" cy="13.5" r="3.5" />
      <path d="M9 7l1.5-2h3L15 7" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6" strokeLinecap="round" />
    </>
  ),
  check: <path d="M5 13l4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />,
  photo: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path d="M3 17l5-5 4 4 3-3 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  circle: <circle cx="12" cy="12" r="9" />,
  warning: (
    <>
      <path d="M12 3.5 21.5 20h-19L12 3.5z" strokeLinejoin="round" />
      <path d="M12 10v4" strokeLinecap="round" />
      <circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" />
    </>
  ),
  /* Regional-fallback objects — Part 20, redesigned per SIH26003 requirement
     (d). Still deliberately plain line art, not photographs: there is no
     licensed regional photo library to ship, and the intent stays the same
     — nudge the household to replace these with their own things (see
     FamiliarPairs/SoundAndSight/MyNextStep's "Using general pictures/
     routine" banners). What changed is the SHAPE: umbrella/lamp/stool read
     as generic international clip-art, not as anything from a North-East
     Indian home, so those three are now a japi (conical bamboo/cane hat),
     a diya (oil lamp), and a mora (woven bamboo stool) — common, everyday,
     not community- or festival-specific to any one group. */
  tumbler: (
    <path d="M8 4h8l-1 15a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2L8 4z" strokeLinejoin="round" />
  ),
  /* diya — a shallow oil-lamp bowl with a small flame above it. */
  lamp: (
    <>
      <path d="M4 15.5c0-1.7 3.6-2.8 8-2.8s8 1.1 8 2.8-3.6 3.3-8 3.3-8-1.6-8-3.3z" strokeLinejoin="round" />
      <path d="M9.5 14.3c1-.3 4-.3 5 0" strokeLinecap="round" opacity="0.6" />
      <path
        d="M12 5.2c1.4 1.1 1.9 2.7.9 4-.6.8-1.7.8-2.2-.1-.5-.9-.1-2 .5-2.8.2-.3.5-.7.8-1.1z"
        fill="currentColor"
        stroke="none"
      />
    </>
  ),
  /* khorai — a bamboo basket with a visible over-under weave texture. */
  basket: (
    <>
      <path d="M4 10h16l-2 9H6l-2-9z" strokeLinejoin="round" />
      <path d="M8 10 9 5h6l1 5" strokeLinejoin="round" />
      <path d="M5 13h14M5.6 16h12.8" opacity="0.5" />
      <path d="M8 10.5v8M12 10.5v8.3M16 10.5v8" opacity="0.5" />
    </>
  ),
  /* japi — a conical cane/bamboo hat with a wide brim and radiating ribs. */
  umbrella: (
    <>
      <path d="M12 3 4.5 16.3a8.5 3 0 0 0 15 0L12 3z" strokeLinejoin="round" />
      <ellipse cx="12" cy="16.3" rx="7.5" ry="2.7" />
      <path d="M12 6.5v9.8M9 9l1.3 7.3M15 9l-1.3 7.3" strokeLinecap="round" opacity="0.6" />
    </>
  ),
  kettle: (
    <>
      <path d="M5 13a7 5 0 0 0 14 0z" strokeLinejoin="round" />
      <path d="M12 8v-.5M18 12l3-2M4 10l3 2" strokeLinecap="round" />
      <path d="M10 13v3M14 13v3" strokeLinecap="round" />
    </>
  ),
  /* mora — a rounded, woven bamboo stool (barrel silhouette, horizontal weave lines). */
  stool: (
    <>
      <path
        d="M6.5 8.5c0-1.9 2.5-3 5.5-3s5.5 1.1 5.5 3v8c0 1.9-2.5 3-5.5 3s-5.5-1.1-5.5-3v-8z"
        strokeLinejoin="round"
      />
      <path d="M6.5 8.5c0 1.9 2.5 3 5.5 3s5.5-1.1 5.5-3" />
      <path d="M7 12.5h10M7 16h10" opacity="0.5" />
    </>
  ),
  triangle: <path d="M12 4 21 20H3L12 4z" strokeLinejoin="round" />,
  square: <rect x="5" y="5" width="14" height="14" rx="1" />,
  star: <path d="M12 3l2.6 6.2 6.7.5-5.1 4.4 1.7 6.5L12 17l-5.9 3.6 1.7-6.5-5.1-4.4 6.7-.5L12 3z" strokeLinejoin="round" />,
  cardback: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M3 3l18 18M21 3 3 21" strokeWidth={1} opacity={0.5} />
    </>
  ),
  back: <path d="M15 5 7 12l8 7" strokeLinecap="round" strokeLinejoin="round" />,
  /* Additional regional-fallback objects (Part 20 expansion) — same rule as
     tumbler/lamp/basket/umbrella/kettle/stool above: common, everyday NER
     household items, plain original line art, not photographs, not tied to
     any one festival or community. Added to break the memory-game pool out
     of only 6 items — see FamiliarPairs/SoundAndSight's root-cause note. */
  comb: (
    <>
      <rect x="5" y="4" width="14" height="4" rx="1" />
      <path d="M7 8v11M10 8v11M13 8v11M16 8v11" strokeLinecap="round" opacity="0.7" />
    </>
  ),
  torch: (
    <>
      <rect x="9" y="9" width="6" height="12" rx="2" />
      <path d="M8.5 9 9.5 5h5l1 4" strokeLinejoin="round" />
      <path d="M12 3v1.5" strokeLinecap="round" opacity="0.6" />
    </>
  ),
  slipper: (
    <>
      <ellipse cx="11" cy="14" rx="6.5" ry="4.2" />
      <path d="M9 10 6 5.5M9 10 12 5.5" strokeLinecap="round" />
    </>
  ),
  thali: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" opacity="0.5" />
    </>
  ),
  broom: (
    <>
      <path d="M15 3 7 15" strokeLinecap="round" />
      <path d="M7 15 4 21M7 15 6 21M7 15 8 21M7 15 10 21" strokeLinecap="round" />
    </>
  ),
  ghoti: (
    <>
      <path d="M8 9c0-2 1.8-3 4-3s4 1 4 3v6a4 4 0 0 1-8 0V9z" strokeLinejoin="round" />
      <path d="M10 6V4M14 6V4" strokeLinecap="round" />
    </>
  ),
  mirror: (
    <>
      <circle cx="12" cy="9" r="6" />
      <path d="M12 15v6" strokeLinecap="round" />
      <path d="M9 21h6" strokeLinecap="round" />
    </>
  ),
  pankha: (
    <>
      <path d="M4 12a8 8 0 0 1 16 0" strokeLinejoin="round" />
      <path d="M8 12 12 4M12 12V3.5M16 12 12 4" strokeLinecap="round" opacity="0.6" />
      <path d="M12 12v9" strokeLinecap="round" />
    </>
  ),
  keylock: (
    <>
      <rect x="6" y="11" width="12" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      <circle cx="12" cy="15.5" r="1.3" fill="currentColor" stroke="none" />
    </>
  ),
  jhola: (
    <>
      <path d="M6 9h12l-1 11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 9z" strokeLinejoin="round" />
      <path d="M9 9V7a3 3 0 0 1 6 0v2" strokeLinecap="round" />
    </>
  ),
};

export default function Icon({ name, size = 32 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
