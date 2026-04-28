/**
 * Hand-drawn icon set for Serana — woodcut / botanical print feel.
 *
 * Each icon is custom-drawn (not pulled from a generic library) and shares:
 *  - A 32×32 viewBox so we get more pixels for detail.
 *  - currentColor strokes only — colour comes from Tailwind classes.
 *  - 1.4 stroke-width for the silhouette + 1.0 for accent lines.
 *  - Slight asymmetry on purpose, plus shading dashes/dots so they read as
 *    botanical illustrations, not flat icons.
 *
 * Replaces the previous generic geometric set.
 */
import type { SVGProps } from 'react';

const base = {
  viewBox: '0 0 32 32',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  xmlns: 'http://www.w3.org/2000/svg',
};

type IconProps = SVGProps<SVGSVGElement>;

// A fresh herb sprig — twin asymmetric leaves on a curved stem with veins.
export const Leaf = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M6 27 C 8 18, 12 11, 23 6" />
    <path d="M23 6 C 24 12, 21 19, 13 22 C 11 17, 14 11, 23 6 Z" />
    <path d="M16 13 L 21 8" strokeWidth="0.9" opacity="0.55" />
    <path d="M14 17 L 19 12" strokeWidth="0.9" opacity="0.55" />
    <path d="M14 20 L 18 17" strokeWidth="0.9" opacity="0.55" />
    <circle cx="6" cy="27" r="0.9" fill="currentColor" />
  </svg>
);

// Twin sprout leaves with a stem rooted in suggested soil.
export const Sprout = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M16 28 L 16 14" />
    <path d="M16 14 C 10 14, 6 10, 5 5 C 10 5, 14 8, 16 14 Z" />
    <path d="M16 14 C 22 14, 26 10, 27 5 C 22 5, 18 8, 16 14 Z" />
    <path d="M9 9 L 14 12" strokeWidth="0.9" opacity="0.55" />
    <path d="M23 9 L 18 12" strokeWidth="0.9" opacity="0.55" />
    <path d="M9 28 H 13 M14.5 28 H 17.5 M19 28 H 23" strokeWidth="0.9" opacity="0.5" />
  </svg>
);

// A salad bowl with a leaf garnish and a hint of grain inside.
export const Bowl = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M3 14 H 29 C 28.5 21, 23 26, 16 26 C 9 26, 3.5 21, 3 14 Z" />
    <path d="M2 14 H 30" />
    <path d="M11 13 C 11 9, 14 7, 17 8 C 19 6, 22 6, 22 9 C 23 9, 23 12, 20 13" />
    <path d="M13 13 L 16 10" strokeWidth="0.9" opacity="0.55" />
    <circle cx="11" cy="19" r="0.7" fill="currentColor" opacity="0.55" />
    <circle cx="16" cy="20" r="0.7" fill="currentColor" opacity="0.55" />
    <circle cx="21" cy="19" r="0.7" fill="currentColor" opacity="0.55" />
  </svg>
);

// Almond-shaped seed with a center vein and grooves.
export const Seed = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M16 4 C 9 9, 9 21, 16 28 C 23 21, 23 9, 16 4 Z" />
    <path d="M16 7 L 16 25" strokeWidth="0.9" opacity="0.55" />
    <path d="M13 12 L 16 14" strokeWidth="0.9" opacity="0.4" />
    <path d="M19 12 L 16 14" strokeWidth="0.9" opacity="0.4" />
    <path d="M13 20 L 16 18" strokeWidth="0.9" opacity="0.4" />
    <path d="M19 20 L 16 18" strokeWidth="0.9" opacity="0.4" />
  </svg>
);

// Sun with rays of varied length, like a stamped seal.
export const Sun = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="16" cy="16" r="5.5" />
    <path d="M16 4 V 7" />
    <path d="M16 25 V 28" />
    <path d="M4 16 H 7" />
    <path d="M25 16 H 28" />
    <path d="M7.5 7.5 L 9.5 9.5" />
    <path d="M22.5 22.5 L 24.5 24.5" />
    <path d="M7.5 24.5 L 9.5 22.5" />
    <path d="M22.5 9.5 L 24.5 7.5" />
    <circle cx="16" cy="16" r="1.4" opacity="0.3" />
  </svg>
);

// Teardrop with inner highlight + a ripple beneath.
export const Drop = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M16 4 C 10 11, 7 16, 9 21 C 11 26, 21 26, 23 21 C 25 16, 22 11, 16 4 Z" />
    <path d="M12 18 C 12 21, 14 23, 17 23" strokeWidth="0.9" opacity="0.5" />
    <path d="M10 28 C 13 27.5, 19 27.5, 22 28" strokeWidth="0.9" opacity="0.4" />
  </svg>
);

// Half-cut citrus with segments, pith and a juice droplet falling.
export const Citrus = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="14" cy="14" r="9" />
    <circle cx="14" cy="14" r="6.5" strokeWidth="0.9" opacity="0.5" />
    <path d="M14 7.5 L 14 20.5" strokeWidth="0.9" opacity="0.45" />
    <path d="M7.5 14 L 20.5 14" strokeWidth="0.9" opacity="0.45" />
    <path d="M9.4 9.4 L 18.6 18.6" strokeWidth="0.9" opacity="0.45" />
    <path d="M18.6 9.4 L 9.4 18.6" strokeWidth="0.9" opacity="0.45" />
    <path d="M22 22 C 24 26, 28 26, 27 22 C 26 20, 23 20, 22 22 Z" />
  </svg>
);

// Wheat stalk with paired kernels and a slight wind lean.
export const Wheat = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M14 30 L 17 6" />
    <path d="M17 6 C 14 4, 12 6, 13 9 C 15 8, 16.5 7, 17 6 Z" />
    <path d="M17 6 C 20 4, 22 6, 21 9 C 19 8, 17.5 7, 17 6 Z" />
    <path d="M16 13 C 13 11, 11 13, 12 16 C 14 15, 15.5 14, 16 13 Z" />
    <path d="M16 13 C 19 11, 21 13, 20 16 C 18 15, 16.5 14, 16 13 Z" />
    <path d="M15 20 C 12 18, 10 20, 11 23 C 13 22, 14.5 21, 15 20 Z" />
    <path d="M15 20 C 18 18, 20 20, 19 23 C 17 22, 15.5 21, 15 20 Z" />
  </svg>
);

// Hourglass with sand line + a few falling grains.
export const Hourglass = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M8 4 H 24" />
    <path d="M8 28 H 24" />
    <path d="M9 4 C 9 12, 23 12, 23 4" opacity="0.7" />
    <path d="M9 28 C 9 20, 23 20, 23 28" />
    <path d="M14 11 H 18" strokeWidth="0.9" opacity="0.5" />
    <circle cx="16" cy="14" r="0.6" fill="currentColor" opacity="0.6" />
    <circle cx="15" cy="17" r="0.5" fill="currentColor" opacity="0.5" />
    <circle cx="17" cy="19" r="0.5" fill="currentColor" opacity="0.4" />
  </svg>
);

// Compass rose with cardinal needle and tick marks.
export const Compass = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="16" cy="16" r="11" />
    <circle cx="16" cy="16" r="8" strokeWidth="0.9" opacity="0.45" />
    <path d="M16 8 L 19 16 L 16 24 L 13 16 Z" />
    <path d="M16 4 L 16 6" />
    <path d="M16 26 L 16 28" />
    <path d="M4 16 L 6 16" />
    <path d="M26 16 L 28 16" />
    <circle cx="16" cy="16" r="1" fill="currentColor" />
  </svg>
);

// Cooking pot with steam curls and a hand-drawn lid handle.
export const Pot = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M5 14 H 27 V 22 C 27 25, 25 26, 22 26 H 10 C 7 26, 5 25, 5 22 Z" />
    <path d="M3 14 H 29" />
    <path d="M11 14 V 11 C 11 10, 13 9, 16 9 C 19 9, 21 10, 21 11 V 14" opacity="0.7" />
    <path d="M14 5 C 14 6, 16 6.5, 16 7" opacity="0.55" />
    <path d="M18 4 C 18 5, 20 5.5, 19 7" opacity="0.55" />
    <path d="M11 6 C 12 7, 11 8, 12 9" opacity="0.55" />
  </svg>
);

// Day calendar with a marked date + organic torn-edge feel.
export const Calendar = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="4" y="7" width="24" height="21" rx="2.5" />
    <path d="M4 13 H 28" />
    <path d="M10 4 V 9" />
    <path d="M22 4 V 9" />
    <circle cx="11" cy="19" r="0.9" fill="currentColor" />
    <circle cx="16" cy="19" r="0.9" fill="currentColor" />
    <circle cx="21" cy="19" r="0.9" fill="currentColor" />
    <circle cx="11" cy="24" r="0.9" fill="currentColor" opacity="0.5" />
    <rect x="14.5" y="22" width="3" height="3" rx="0.5" />
  </svg>
);

// Stylised botanical star: 8 petals around a kernel.
export const Spark = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M16 3 L 17.5 13 L 27 14.5 L 17.5 16.5 L 17 28 L 14.5 16.5 L 5 14.5 L 14.5 13 Z" />
    <path d="M16 3 L 16 28" strokeWidth="0.9" opacity="0.4" />
    <path d="M5 14.5 L 27 14.5" strokeWidth="0.9" opacity="0.4" />
    <circle cx="16" cy="15.5" r="1.2" fill="currentColor" />
  </svg>
);

// The Serana brand mark — two curving leaves cradling a kernel.
export const SerenaMark = (p: IconProps) => (
  <svg {...base} {...p} viewBox="0 0 56 56">
    <path d="M28 7 C 12 14, 10 30, 28 49 C 46 30, 44 14, 28 7 Z" />
    <path d="M28 7 L 28 49" strokeWidth="0.9" opacity="0.4" />
    <path d="M16 22 C 22 22, 26 28, 28 35" opacity="0.55" />
    <path d="M40 22 C 34 22, 30 28, 28 35" opacity="0.55" />
    <path d="M22 16 L 26 22" strokeWidth="0.9" opacity="0.4" />
    <path d="M34 16 L 30 22" strokeWidth="0.9" opacity="0.4" />
    <circle cx="28" cy="38" r="2" fill="currentColor" />
    <path d="M28 40 C 26 42, 26 44, 28 45 C 30 44, 30 42, 28 40 Z" opacity="0.5" />
  </svg>
);

export const SerenaIcons = {
  Leaf,
  Sprout,
  Bowl,
  Seed,
  Sun,
  Drop,
  Citrus,
  Wheat,
  Hourglass,
  Compass,
  Pot,
  Calendar,
  Spark,
  SerenaMark,
};

export type SerenaIconName = keyof typeof SerenaIcons;

export function SerenaIcon({ name, ...rest }: { name: SerenaIconName } & IconProps) {
  const Cmp = SerenaIcons[name];
  return <Cmp {...rest} />;
}
