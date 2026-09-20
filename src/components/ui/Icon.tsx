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
  | 'jhola'
  | 'people'
  | 'profile'
  | 'chart'
  | 'sun'
  | 'moon'
  | 'sunset'
  | 'rain'
  | 'leaf'
  | 'snow'
  | 'heart'
  | 'face_good'
  | 'face_ok'
  | 'face_low'
  | 'music'
  | 'sparkle'
  | 'arrow'
  | 'refresh'
  | 'calendar'
  | 'shield'
  | 'gamosa'
  | 'xorai'
  | 'fern'
  | 'claypot'
  | 'net'
  | 'areca'
  | 'loom'
  | 'ricepot'
  | 'soap'
  | 'shirt'
  | 'sunrise'
  | 'night'
  | 'flower'
  | 'seat'
  | 'lampoff';

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
  listen: (
    <>
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" strokeLinejoin="round" />
      <path d="M15.5 9a4.2 4.2 0 0 1 0 6M18.3 6.3a8 8 0 0 1 0 11.4" strokeLinecap="round" />
    </>
  ),
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
  /* 07 C6: was a bowl-like half-circle. A kettle: round body, lid and knob, spout, arched handle. */
  kettle: (
    <>
      <path d="M6 19h12a1 1 0 0 0 1-1c0-3.9-3.1-7-7-7s-7 3.1-7 7a1 1 0 0 0 1 1z" strokeLinejoin="round" />
      <path d="M9.5 11.4a2.5 1.2 0 0 1 5 0M12 9.2v1" strokeLinecap="round" />
      <path d="M18.4 14.5 21 12" strokeLinecap="round" />
      <path d="M8 11.8C8 8.5 9.8 6 12 6s4 2.5 4 5.8" />
    </>
  ),
  /* mora — a rounded, woven bamboo stool (barrel silhouette, horizontal weave lines). */
  /* 07 C6: the straight barrel read as a database glyph. A mora pinches at the waist. */
  stool: (
    <>
      <ellipse cx="12" cy="5.5" rx="7" ry="2" />
      <path d="M5 5.5c0 3.5 4.5 4.8 4.5 6.5S5 15 5 18.5M19 5.5c0 3.5-4.5 4.8-4.5 6.5s4.5 3 4.5 6.5" />
      <path d="M5 18.5c0 1.1 3.1 2 7 2s7-.9 7-2" />
      <path d="M9.5 12h5M7.2 8.6l9.6 0M7.2 15.4h9.6" opacity="0.5" />
    </>
  ),
  triangle: <path d="M12 4 21 20H3L12 4z" strokeLinejoin="round" />,
  square: <rect x="5" y="5" width="14" height="14" rx="1" />,
  star: <path d="M12 3l2.6 6.2 6.7.5-5.1 4.4 1.7 6.5L12 17l-5.9 3.6 1.7-6.5-5.1-4.4 6.7-.5L12 3z" strokeLinejoin="round" />,
  /* 07 C6: the crossed square read as a broken-image placeholder. A deliberate
     card back instead: a woven border and a centre diamond, gamosa-style. */
  cardback: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <rect x="5.5" y="5.5" width="13" height="13" rx="1.5" opacity="0.55" />
      <path d="M12 8.5 15.5 12 12 15.5 8.5 12z" strokeLinejoin="round" />
      <path d="M7 3v2.5M10 3v2.5M14 3v2.5M17 3v2.5M7 18.5V21M10 18.5V21M14 18.5V21M17 18.5V21" opacity="0.55" />
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
  /* 04_CONTENT §1: eight more household items and two routine steps, same
     outline register as the set above. Shape carries identity, not colour. */
  gamosa: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="1" />
      <path d="M4 8h16M4 16h16" />
      <path d="M6 19v2M9 19v2M12 19v2M15 19v2M18 19v2" strokeLinecap="round" />
    </>
  ),
  xorai: (
    <>
      <path d="M5 8h14l-2 3H7L5 8z" strokeLinejoin="round" />
      <path d="M12 3v5M10 5l2-2 2 2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 11v6M8 21h8M9 17h6l1 4H8l1-4z" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  fern: (
    <>
      <path d="M12 21C12 13 9 7 6 4" strokeLinecap="round" />
      <path d="M11 16l-4 1M10 12l-4 0M9 9l-3-1M11 16l2-3M10 12l3-2M9 9l2-3" strokeLinecap="round" />
    </>
  ),
  claypot: (
    <>
      <path d="M9 4h6M10 4v2c-4 1-6 4-6 8a8 7 0 0 0 16 0c0-4-2-7-6-8V4" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  net: (
    <>
      <circle cx="10" cy="10" r="7" />
      <path d="M15 15l6 6" strokeLinecap="round" />
      <path d="M5 7l8 8M4 11l6 6M7 4l9 9M10 3l7 7M4 13l9-9M7 16l9-9" opacity="0.5" />
    </>
  ),
  areca: (
    <>
      <ellipse cx="12" cy="15" rx="9" ry="4" />
      <circle cx="9.5" cy="12" r="2" />
      <circle cx="14.5" cy="12" r="2" />
    </>
  ),
  loom: (
    <>
      <path d="M4 4v17M20 4v17M4 6h16M4 18h16" strokeLinecap="round" />
      <path d="M8 6v12M12 6v12M16 6v12" opacity="0.6" />
    </>
  ),
  ricepot: (
    <>
      <path d="M5 10h14v5a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6v-5z" strokeLinejoin="round" />
      <path d="M3 10h18M10 7h4" strokeLinecap="round" />
    </>
  ),
  soap: (
    <>
      <rect x="4" y="11" width="16" height="9" rx="3" />
      <circle cx="9" cy="6" r="2" />
      <circle cx="15" cy="5" r="1.5" />
    </>
  ),
  shirt: (
    <>
      <path d="M9 3l3 2 3-2 5 3-2 4-2-1v12H8V9l-2 1-2-4 5-3z" strokeLinejoin="round" />
    </>
  ),
  /* The circle of people around a person — new for the home screen's Circle
     card and the Circle roster link (Part 66). Generic two-person mark, not
     tied to any one community, matching camera/mic/check's plain-utility
     register rather than the NER household-object set (japi/diya/mora). */
  people: (
    <>
      <circle cx="8.5" cy="8.5" r="3" />
      <circle cx="16" cy="9.5" r="2.4" />
      <path d="M3 20c.5-3.8 2.8-6 5.5-6s5 2.2 5.5 6" strokeLinecap="round" />
      <path d="M14.5 14.3c2.2.2 3.9 2.1 4.3 5.7" strokeLinecap="round" opacity="0.75" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="8.5" r="4" />
      <path d="M4 20c.7-4.3 3.6-6.8 8-6.8s7.3 2.5 8 6.8" strokeLinecap="round" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20V10M11 20V4M18 20v-7" strokeLinecap="round" />
      <path d="M3 20h18" strokeLinecap="round" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" strokeLinecap="round" />
    </>
  ),
  moon: <path d="M20 14.5A8.2 8.2 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" strokeLinejoin="round" />,
  /* 08 item 2: the four parts of the day must never share a glyph. Sunrise
     rises (arrow up), sunset sets (arrow down), afternoon is the full sun,
     night is the moon with stars — evening and night were both a moon. */
  sunset: (
    <path d="M3 18h18M6.5 18a5.5 5.5 0 0 1 11 0M12 4v6.5M9.5 8 12 10.5 14.5 8M8 21h8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  sunrise: (
    <path d="M3 18h18M6.5 18a5.5 5.5 0 0 1 11 0M12 10.5V4M9.5 6.5 12 4l2.5 2.5M4.6 13.2l1.6.9M19.4 13.2l-1.6.9" strokeLinecap="round" strokeLinejoin="round" />
  ),
  night: (
    <>
      <path d="M15 16.5A7 7 0 1 1 7.5 6a5.5 5.5 0 0 0 7.5 10.5z" strokeLinejoin="round" />
      <path d="M17.5 3.5v3M16 5h3M20 9.5v2M19 10.5h2" strokeLinecap="round" />
    </>
  ),
  flower: (
    <>
      <circle cx="12" cy="8.5" r="1.6" />
      <circle cx="12" cy="5" r="1.9" />
      <circle cx="15.3" cy="7.4" r="1.9" />
      <circle cx="14.1" cy="11.3" r="1.9" />
      <circle cx="9.9" cy="11.3" r="1.9" />
      <circle cx="8.7" cy="7.4" r="1.9" />
      <path d="M12 13.2V21M12 17.5c-1.6-1.6-3.6-1.6-4.6-1" strokeLinecap="round" />
    </>
  ),
  /* 08 item 4: a plain seat for "sit" steps — the mora (hourglass) stays for the object. */
  seat: (
    <>
      <rect x="5" y="7.5" width="14" height="3" rx="1.2" />
      <path d="M7 10.5 6 20M17 10.5l1 10M8.3 15.5h7.4" strokeLinecap="round" />
    </>
  ),
  /* An unlit diya, for putting the lamp out: the lamp's bowl with no flame. */
  lampoff: (
    <>
      <path d="M4 15.5c0-1.7 3.6-2.8 8-2.8s8 1.1 8 2.8-3.6 3.3-8 3.3-8-1.6-8-3.3z" strokeLinejoin="round" />
      <path d="M9.5 14.3c1-.3 4-.3 5 0" strokeLinecap="round" opacity="0.6" />
      <path d="M12 9.5v1.5M9.5 7.5l.8.9M14.5 7.5l-.8.9" strokeLinecap="round" opacity="0.45" />
    </>
  ),
  rain: (
    <>
      <path d="M7 14.5a4 4 0 1 1 .9-7.9A5 5 0 0 1 17.6 7.5 3.5 3.5 0 0 1 17 14.5H7z" strokeLinejoin="round" />
      <path d="M8.5 17.5 7.5 20M12.5 17.5l-1 2.5M16.5 17.5l-1 2.5" strokeLinecap="round" />
    </>
  ),
  leaf: (
    <>
      <path d="M5 19C5 11 10 5 20 5c0 10-6 15-14 15" strokeLinejoin="round" />
      <path d="M5 19l8-8" strokeLinecap="round" />
    </>
  ),
  snow: <path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.5 4.5 12 6.5l2.5-2M9.5 19.5 12 17.5l2.5 2" strokeLinecap="round" strokeLinejoin="round" />,
  heart: (
    <path d="M12 20s-7-4.4-9-9.2C1.8 7.4 4 4.5 7 4.5c2 0 3.3 1.1 5 3 1.7-1.9 3-3 5-3 3 0 5.2 2.9 4 6.3C19 15.6 12 20 12 20z" strokeLinejoin="round" />
  ),
  // Fix pack 11: the three faces of the optional mood tap. Deliberately plain
  // circles — the mouth is the only thing that differs, so the three read
  // apart at arm's length without colour.
  face_good: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.4 14.2c.9 1.4 2.1 2.1 3.6 2.1s2.7-.7 3.6-2.1" strokeLinecap="round" />
      <path d="M9 9.6v.01M15 9.6v.01" strokeLinecap="round" strokeWidth={2.6} />
    </>
  ),
  face_ok: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.6 15h6.8" strokeLinecap="round" />
      <path d="M9 9.6v.01M15 9.6v.01" strokeLinecap="round" strokeWidth={2.6} />
    </>
  ),
  face_low: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.4 16.1c.9-1.4 2.1-2.1 3.6-2.1s2.7.7 3.6 2.1" strokeLinecap="round" />
      <path d="M9 9.6v.01M15 9.6v.01" strokeLinecap="round" strokeWidth={2.6} />
    </>
  ),
  music: (
    <>
      <path d="M9 18V6l10-2v12" strokeLinejoin="round" />
      <circle cx="6.8" cy="18" r="2.2" />
      <circle cx="16.8" cy="16" r="2.2" />
    </>
  ),
  sparkle: (
    <>
      <path d="M11 3l1.8 5.4L18 10l-5.2 1.6L11 17l-1.8-5.4L4 10l5.2-1.6L11 3z" strokeLinejoin="round" />
      <path d="M18.5 15.5v4M16.5 17.5h4" strokeLinecap="round" />
    </>
  ),
  arrow: <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />,
  refresh: <path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5" strokeLinecap="round" strokeLinejoin="round" />,
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="2.5" />
      <path d="M4 9.5h16M8 3v4M16 3v4" strokeLinecap="round" />
      <circle cx="12" cy="14.5" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" strokeLinejoin="round" />
      <path d="M8.5 12l2.5 2.5 4.5-5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
};

/** Runtime view of the icon set, so JSON content can be checked against it. */
export const ICON_NAMES = Object.keys(PATHS) as IconName[];

export default function Icon({ name, size = 32, strokeWidth = 2 }: { name: IconName; size?: number; strokeWidth?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      style={{ flexShrink: 0 }}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
