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
  | 'cardback';

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
  /* Generic regional-fallback objects — Part 20. Deliberately plain shapes,
     not photographs: we have no licensed regional photo library to ship,
     and the plan itself requires these to read as "general", nagging the
     household to replace them with their own things. */
  tumbler: (
    <path d="M8 4h8l-1 15a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2L8 4z" strokeLinejoin="round" />
  ),
  lamp: (
    <>
      <path d="M9 3h6l1 6H8l1-6z" strokeLinejoin="round" />
      <path d="M6 9h12l-2 4H8l-2-4z" strokeLinejoin="round" />
      <path d="M12 13v7M9 20h6" strokeLinecap="round" />
    </>
  ),
  basket: (
    <>
      <path d="M4 10h16l-2 9H6l-2-9z" strokeLinejoin="round" />
      <path d="M8 10 9 5h6l1 5" strokeLinejoin="round" />
      <path d="M7 13h10M7.5 16h9" />
    </>
  ),
  umbrella: (
    <>
      <path d="M4 12a8 8 0 0 1 16 0z" strokeLinejoin="round" />
      <path d="M12 12v8a2 2 0 0 1-3 1.7" strokeLinecap="round" />
      <path d="M12 4v1" strokeLinecap="round" />
    </>
  ),
  kettle: (
    <>
      <path d="M5 13a7 5 0 0 0 14 0z" strokeLinejoin="round" />
      <path d="M12 8v-.5M18 12l3-2M4 10l3 2" strokeLinecap="round" />
      <path d="M10 13v3M14 13v3" strokeLinecap="round" />
    </>
  ),
  stool: (
    <>
      <path d="M5 8h14l-1.5 4H6.5L5 8z" strokeLinejoin="round" />
      <path d="M7 12l-1 9M17 12l1 9" strokeLinecap="round" />
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
