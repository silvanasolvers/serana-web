/**
 * Hand-drawn line-art icon set for Serana.
 *
 * All icons share:
 *  - A 24×24 viewBox so they scale alongside any heading.
 *  - `currentColor` strokes — colour comes from Tailwind classes.
 *  - 1.4 stroke-width with round caps/joins → consistent "etched" feel.
 *  - Organic curves, never closed bowls of fill: this is editorial line art,
 *    not flat icons.
 *
 * Replaces the emoji set previously used in WellnessQuiz, ValueProposition
 * and the hero. They're meant to feel like little woodcut prints.
 */
import type { SVGProps } from 'react';

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  xmlns: 'http://www.w3.org/2000/svg',
};

type IconProps = SVGProps<SVGSVGElement>;

export const Leaf = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 20 C 6 11, 12 4, 20 4 C 20 12, 13 18, 4 20 Z" />
    <path d="M20 4 L 8 17" />
    <path d="M14 9 L 11 12" opacity="0.55" />
    <path d="M16 12 L 13 15" opacity="0.55" />
  </svg>
);

export const Sprout = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 21 L 12 12" />
    <path d="M12 12 C 6 12, 4 7, 4 5 C 7 5, 11 7, 12 12 Z" />
    <path d="M12 12 C 18 12, 20 7, 20 4 C 17 4, 13 6, 12 12 Z" />
    <path d="M9 21 L 15 21" />
  </svg>
);

export const Bowl = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M3 11 H 21 C 20.5 16, 17 20, 12 20 C 7 20, 3.5 16, 3 11 Z" />
    <path d="M2 11 H 22" />
    <path d="M9 7 C 9 5, 10.5 4.5, 11.5 5.5 C 12.5 4.5, 14 5, 14 7" />
  </svg>
);

export const Seed = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 3 C 7 7, 7 14, 12 21 C 17 14, 17 7, 12 3 Z" />
    <path d="M12 6 L 12 18" opacity="0.5" />
  </svg>
);

export const Sun = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 3 V 5" />
    <path d="M12 19 V 21" />
    <path d="M3 12 H 5" />
    <path d="M19 12 H 21" />
    <path d="M5.5 5.5 L 6.8 6.8" />
    <path d="M17.2 17.2 L 18.5 18.5" />
    <path d="M5.5 18.5 L 6.8 17.2" />
    <path d="M17.2 6.8 L 18.5 5.5" />
  </svg>
);

export const Drop = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 3 C 7 9, 5 13, 7 17 C 9 21, 15 21, 17 17 C 19 13, 17 9, 12 3 Z" />
    <path d="M9 16 C 10 17.5, 12 17.5, 13 16" opacity="0.55" />
  </svg>
);

export const Citrus = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 4 L 12 20" />
    <path d="M4 12 L 20 12" />
    <path d="M6.4 6.4 L 17.6 17.6" />
    <path d="M17.6 6.4 L 6.4 17.6" />
  </svg>
);

export const Wheat = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 22 L 12 6" />
    <path d="M12 6 C 9 4, 8 7, 9 9 C 11 8, 12 7, 12 6 Z" />
    <path d="M12 6 C 15 4, 16 7, 15 9 C 13 8, 12 7, 12 6 Z" />
    <path d="M12 12 C 9 10, 8 13, 9 15 C 11 14, 12 13, 12 12 Z" />
    <path d="M12 12 C 15 10, 16 13, 15 15 C 13 14, 12 13, 12 12 Z" />
    <path d="M12 18 C 9 16, 8 19, 9 21 C 11 20, 12 19, 12 18 Z" />
    <path d="M12 18 C 15 16, 16 19, 15 21 C 13 20, 12 19, 12 18 Z" />
  </svg>
);

export const Hourglass = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M6 3 H 18" />
    <path d="M6 21 H 18" />
    <path d="M7 3 C 7 9, 17 9, 17 3" opacity="0.7" />
    <path d="M7 21 C 7 15, 17 15, 17 21" />
    <path d="M11 8 H 13" opacity="0.5" />
  </svg>
);

export const Compass = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 6 L 14 12 L 12 18 L 10 12 Z" />
    <circle cx="12" cy="12" r="0.6" fill="currentColor" />
  </svg>
);

export const Pot = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M5 11 H 19 V 17 C 19 19, 17.5 20, 15 20 H 9 C 6.5 20, 5 19, 5 17 Z" />
    <path d="M3 11 H 21" />
    <path d="M9 11 V 8 C 9 7, 10 6, 12 6 C 14 6, 15 7, 15 8 V 11" opacity="0.7" />
    <path d="M11 4 C 11 5, 13 5, 13 4" opacity="0.55" />
  </svg>
);

export const Calendar = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="5" width="17" height="15" rx="2" />
    <path d="M3.5 10 H 20.5" />
    <path d="M8 3 V 7" />
    <path d="M16 3 V 7" />
    <circle cx="9" cy="14.5" r="0.7" fill="currentColor" />
    <circle cx="13" cy="14.5" r="0.7" fill="currentColor" />
  </svg>
);

export const Spark = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 3 L 14 10 L 21 12 L 14 14 L 12 21 L 10 14 L 3 12 L 10 10 Z" />
  </svg>
);

export const SerenaMark = (p: IconProps) => (
  <svg {...base} {...p} viewBox="0 0 48 48">
    {/* Two stylised leaves cradling a seed — the brand mark */}
    <path d="M24 6 C 10 12, 8 26, 24 42 C 40 26, 38 12, 24 6 Z" />
    <path d="M24 6 L 24 42" opacity="0.45" />
    <path d="M14 18 C 18 18, 22 22, 24 28" opacity="0.6" />
    <path d="M34 18 C 30 18, 26 22, 24 28" opacity="0.6" />
    <circle cx="24" cy="32" r="1.4" fill="currentColor" />
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
