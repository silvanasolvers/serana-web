import { useScroll, useTransform, motion } from 'motion/react';
import { useRef } from 'react';

/**
 * Right-edge vine that draws itself as the user scrolls the page. Pure SVG
 * (no Three.js), so it stays cheap. Decoupled from any specific section so
 * we can drop it once at the page layer and it spans the whole document.
 *
 * On mobile the vine is positioned even closer to the edge with a smaller
 * stroke so it never competes with content.
 */
export default function ScrollVine() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  // Path draw progress 0..1 follows scroll progress 0..0.95 (so it's already
  // mostly drawn when the user nears the footer).
  const pathLength = useTransform(scrollYProgress, [0, 0.95], [0, 1]);
  // Small parallax: vine drifts up just slightly, leaves opacity ramps in.
  const y = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const leafOpacity = useTransform(scrollYProgress, [0, 0.1, 1], [0, 0.6, 1]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="fixed inset-y-0 right-0 w-[120px] sm:w-[180px] md:w-[220px] pointer-events-none z-0 hidden md:block"
    >
      <motion.svg
        viewBox="0 0 220 1600"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
        style={{ y }}
      >
        <defs>
          <linearGradient id="vineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5F6C37" stopOpacity="0.55" />
            <stop offset="60%" stopColor="#BC6C25" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#DCA15D" stopOpacity="0.15" />
          </linearGradient>
          <radialGradient id="leafGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#5F6C37" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#5F6C37" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Main vine */}
        <motion.path
          d="M170 0 C 90 220, 240 380, 110 560 S 0 880, 150 1080 S 60 1380, 180 1600"
          stroke="url(#vineGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          style={{ pathLength }}
        />

        {/* Decorative leaves anchored along the path. Each fades in based on
            its own threshold of scroll progress so they appear sequentially. */}
        {[
          { cx: 170, cy: 0, r: 8, threshold: 0.0 },
          { cx: 95, cy: 240, r: 14, threshold: 0.12 },
          { cx: 195, cy: 360, r: 9, threshold: 0.22 },
          { cx: 115, cy: 540, r: 16, threshold: 0.34 },
          { cx: 35, cy: 760, r: 11, threshold: 0.46 },
          { cx: 165, cy: 1000, r: 14, threshold: 0.6 },
          { cx: 60, cy: 1280, r: 12, threshold: 0.74 },
          { cx: 185, cy: 1480, r: 10, threshold: 0.88 },
        ].map((l, i) => (
          <ScrollLeaf key={i} {...l} progress={scrollYProgress} />
        ))}

        {/* Floating dust particles for depth */}
        <motion.g style={{ opacity: leafOpacity }}>
          {[
            { cx: 60, cy: 120, r: 1.6 },
            { cx: 130, cy: 420, r: 1.2 },
            { cx: 70, cy: 720, r: 1.8 },
            { cx: 160, cy: 940, r: 1.4 },
            { cx: 100, cy: 1180, r: 1.6 },
            { cx: 200, cy: 1380, r: 1.2 },
          ].map((d, i) => (
            <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill="#BC6C25" opacity="0.5" />
          ))}
        </motion.g>
      </motion.svg>
    </div>
  );
}

function ScrollLeaf({
  cx,
  cy,
  r,
  threshold,
  progress,
}: {
  cx: number;
  cy: number;
  r: number;
  threshold: number;
  progress: ReturnType<typeof useScroll>['scrollYProgress'];
}) {
  // Each leaf appears as the scroll threshold passes, with a tiny lead-in.
  const opacity = useTransform(progress, [threshold - 0.05, threshold + 0.04], [0, 1]);
  const scale = useTransform(progress, [threshold - 0.05, threshold + 0.04], [0.4, 1]);
  return (
    <motion.g style={{ opacity }} transform={`translate(${cx} ${cy})`}>
      <motion.ellipse
        rx={r}
        ry={r * 0.55}
        fill="#5F6C37"
        opacity="0.5"
        style={{ scale }}
        transform="rotate(-25)"
      />
      <motion.ellipse
        rx={r * 0.85}
        ry={r * 0.45}
        fill="#BC6C25"
        opacity="0.25"
        style={{ scale }}
        transform="rotate(35) translate(2 2)"
      />
    </motion.g>
  );
}
