import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

/**
 * Brand splash that runs once per browser session. Uses inline SVG so it has
 * zero asset dependencies — it can render before any other React tree.
 * Disappears after the longer of (a) the staged animation finishing and (b)
 * the window's `load` event firing.
 */
export default function SerenaSplash() {
  const [show, setShow] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    if (window.location.pathname.startsWith('/checkout')) return false;
    try {
      return sessionStorage.getItem('serana:splash:seen') !== '1';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (!show) return;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const minDuration = 1900;
    const start = performance.now();

    const dismiss = () => {
      const elapsed = performance.now() - start;
      const remaining = Math.max(0, minDuration - elapsed);
      timer = setTimeout(() => {
        try {
          sessionStorage.setItem('serana:splash:seen', '1');
        } catch {
          // ignore
        }
        setShow(false);
      }, remaining);
    };

    if (document.readyState === 'complete') {
      dismiss();
    } else {
      window.addEventListener('load', dismiss, { once: true });
    }

    // Hard fallback in case `load` never fires (slow image / blocked CDN).
    const safety = setTimeout(dismiss, 4500);

    return () => {
      if (timer) clearTimeout(timer);
      clearTimeout(safety);
      window.removeEventListener('load', dismiss);
    };
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="serana-splash"
          aria-hidden
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.55, ease: [0.65, 0, 0.35, 1] } }}
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-serana-cream"
        >
          {/* organic gradient backdrop */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              initial={{ scale: 1.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.4, ease: 'easeOut' }}
              className="absolute -top-1/3 -left-1/4 w-[80vw] h-[80vw] bg-serana-olive/15 rounded-full blur-[120px]"
            />
            <motion.div
              initial={{ scale: 1.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.6, ease: 'easeOut', delay: 0.1 }}
              className="absolute -bottom-1/3 -right-1/4 w-[80vw] h-[80vw] bg-serana-ochre/15 rounded-full blur-[140px]"
            />
          </div>

          {/* Carrot + leaves */}
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="relative mb-8"
          >
            <svg
              width="120"
              height="120"
              viewBox="0 0 120 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_15px_30px_rgba(188,108,37,0.25)]"
            >
              {/* Carrot body draws in */}
              <motion.path
                d="M22 24 C30 22 56 22 78 44 C94 60 88 80 70 90 C50 84 32 64 22 24 Z"
                fill="#BC6C25"
                stroke="#273617"
                strokeWidth="1.5"
                strokeLinejoin="round"
                initial={{ pathLength: 0, fillOpacity: 0 }}
                animate={{ pathLength: 1, fillOpacity: 1 }}
                transition={{ pathLength: { duration: 1, ease: 'easeOut' }, fillOpacity: { duration: 0.7, delay: 0.7 } }}
              />
              {/* Detail strokes */}
              {[
                { d: 'M32 32 C36 36 44 36 48 32', delay: 1.0 },
                { d: 'M44 48 C48 52 56 52 60 48', delay: 1.1 },
                { d: 'M52 64 C56 68 64 68 68 64', delay: 1.2 },
              ].map((s, i) => (
                <motion.path
                  key={i}
                  d={s.d}
                  stroke="#273617"
                  strokeOpacity="0.35"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: s.delay }}
                />
              ))}
              {/* Leaves */}
              <motion.g
                initial={{ scale: 0.4, opacity: 0, transformOrigin: '70px 60px' }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.85, type: 'spring', stiffness: 220, damping: 18 }}
              >
                <path
                  d="M70 60 C82 48 100 38 116 38 M70 60 C86 60 102 60 118 60 M70 60 C82 76 100 86 116 86"
                  stroke="#5F6C37"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </motion.g>
            </svg>
          </motion.div>

          {/* Wordmark */}
          <div className="overflow-hidden mb-3">
            <motion.h1
              initial={{ y: 60 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.7 }}
              className="font-serif text-5xl md:text-7xl text-serana-forest tracking-tight"
            >
              Ser<span className="italic font-normal text-serana-olive">ana</span>.
            </motion.h1>
          </div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 0.7, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-serana-forest/70"
          >
            Alimentación · Consciente · Colombia
          </motion.p>

          {/* Loader bar */}
          <div className="mt-12 w-40 h-[2px] rounded-full bg-serana-forest/10 overflow-hidden">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 1.2, ease: [0.65, 0, 0.35, 1], repeat: Infinity }}
              className="h-full w-1/2 bg-gradient-to-r from-transparent via-serana-terracotta to-transparent"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
