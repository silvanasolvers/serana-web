import { useScroll, useTransform, motion } from 'motion/react';

/**
 * Editorial background for Serana.
 *
 * Layers, top to bottom:
 *  - Solid cream base (matches body bg).
 *  - SVG paper-grain noise at very low opacity for tactile feel.
 *  - Two large hand-drawn botanical sketches in opposite corners with slow
 *    parallax tied to scroll progress. They never compete with copy because
 *    they sit at ~7% opacity.
 *  - A faint topographical contour band crossing the page.
 *
 * No 3D, no expensive blur orbs. Everything is composited GPU layers driven
 * by Motion's useScroll, so it stays smooth on mid-tier laptops and mobiles.
 */
export default function LivingBackground() {
  const { scrollYProgress } = useScroll();

  // Parallax: top-right sketch drifts up, bottom-left drifts down. Contour
  // band slides slightly horizontally, creating depth without distracting.
  const yTopRight = useTransform(scrollYProgress, [0, 1], ['0%', '-22%']);
  const yBottomLeft = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const xContour = useTransform(scrollYProgress, [0, 1], ['0%', '-8%']);
  const grainOpacity = useTransform(scrollYProgress, [0, 0.4, 1], [0.18, 0.12, 0.06]);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-serana-cream">
      {/* Paper grain — desaturates into the page as the user scrolls deeper */}
      <motion.div
        aria-hidden
        className="absolute inset-0 mix-blend-multiply"
        style={{ opacity: grainOpacity }}
      >
        <svg viewBox="0 0 600 600" preserveAspectRatio="none" className="w-full h-full">
          <filter id="serana-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.15  0 0 0 0 0.21  0 0 0 0 0.09  0 0 0 0.5 0"
            />
          </filter>
          <rect width="600" height="600" filter="url(#serana-grain)" />
        </svg>
      </motion.div>

      {/* Soft contour band — like a topographical map line crossing the page */}
      <motion.svg
        aria-hidden
        viewBox="0 0 1440 800"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full text-serana-olive"
        style={{ x: xContour, opacity: 0.06 }}
      >
        <path
          d="M-100 520 C 220 460, 420 600, 720 510 C 1020 420, 1240 600, 1540 480"
          stroke="currentColor"
          strokeWidth="1.3"
          fill="none"
        />
        <path
          d="M-100 600 C 200 560, 420 660, 760 590 C 1080 530, 1280 660, 1540 580"
          stroke="currentColor"
          strokeWidth="1.0"
          fill="none"
          opacity="0.55"
        />
        <path
          d="M-100 460 C 240 380, 480 540, 800 440 C 1120 350, 1280 540, 1540 420"
          stroke="currentColor"
          strokeWidth="1.0"
          fill="none"
          opacity="0.4"
        />
      </motion.svg>

      {/* Top-right botanical sketch — olive branch */}
      <motion.div
        aria-hidden
        className="absolute -top-12 -right-16 w-[55vw] max-w-[640px] aspect-square text-serana-olive"
        style={{ y: yTopRight, opacity: 0.07 }}
      >
        <svg viewBox="0 0 400 400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M380 30 C 300 90, 230 170, 200 290 C 195 320, 200 360, 220 380" />
          {Array.from({ length: 9 }).map((_, i) => {
            const t = (i + 1) / 10;
            const cx = 380 - t * 180;
            const cy = 30 + t * 360;
            const angle = -25 - t * 8;
            const len = 60 + Math.sin(t * Math.PI) * 20;
            return (
              <g key={i} transform={`translate(${cx} ${cy}) rotate(${angle})`}>
                <path
                  d={`M0 0 C ${len * 0.4} ${-len * 0.25}, ${len * 0.85} ${-len * 0.15}, ${len} 0 C ${len * 0.85} ${len * 0.15}, ${len * 0.4} ${len * 0.25}, 0 0 Z`}
                />
                <path d={`M0 0 L ${len} 0`} strokeWidth="1" opacity="0.45" />
              </g>
            );
          })}
          {[60, 130, 220].map((cy, i) => (
            <circle key={i} cx={360 - i * 50} cy={cy} r="6" fill="currentColor" opacity="0.4" />
          ))}
        </svg>
      </motion.div>

      {/* Bottom-left botanical sketch — wheat / grain bundle */}
      <motion.div
        aria-hidden
        className="absolute -bottom-16 -left-16 w-[50vw] max-w-[560px] aspect-square text-serana-terracotta"
        style={{ y: yBottomLeft, opacity: 0.06 }}
      >
        <svg viewBox="0 0 400 400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {[
            { x: 110, rot: -8 },
            { x: 170, rot: -2 },
            { x: 230, rot: 4 },
            { x: 290, rot: 12 },
          ].map((stalk, i) => (
            <g key={i} transform={`translate(${stalk.x} 380) rotate(${stalk.rot})`}>
              <path d="M0 0 L 0 -300" />
              {[-90, -160, -220, -270].map((y, j) => (
                <g key={j}>
                  <path d={`M0 ${y} C -16 ${y - 18}, -22 ${y - 8}, -18 ${y + 8} C -8 ${y - 4}, -2 ${y - 8}, 0 ${y} Z`} />
                  <path d={`M0 ${y} C 16 ${y - 18}, 22 ${y - 8}, 18 ${y + 8} C 8 ${y - 4}, 2 ${y - 8}, 0 ${y} Z`} />
                </g>
              ))}
            </g>
          ))}
        </svg>
      </motion.div>

      {/* Subtle vertical hairline running through the middle, paper-feel anchor */}
      <div className="absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-transparent via-serana-forest/8 to-transparent" />
    </div>
  );
}
