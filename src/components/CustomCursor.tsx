import { useEffect, useRef, useState } from 'react';

/**
 * Carrot cursor.
 *
 * Updates the position synchronously inside `pointermove`. The browser already
 * coalesces pointer events to one per frame, so adding our own
 * requestAnimationFrame in the middle just delays paint by a frame and feels
 * "sticky". A `translate3d` transform keeps the element on its own compositor
 * layer, so even when Three.js is busy on the main thread the carrot moves
 * with the pointer.
 */
export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  // Decide once whether to render the carrot at all (fine pointer = mouse /
  // trackpad). Keep listening so a user plugging in a mouse mid-session
  // re-enables it without a refresh.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const finePointer = window.matchMedia('(pointer: fine)');
    setEnabled(finePointer.matches);
    const handleChange = (e: MediaQueryListEvent) => setEnabled(e.matches);
    finePointer.addEventListener('change', handleChange);
    return () => finePointer.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const cursor = cursorRef.current;
    if (!cursor) return;

    // Hidden until the first real movement so we never paint a stranded carrot
    // at (0,0) while the user mouse is still elsewhere.
    cursor.style.opacity = '0';

    const offset = 4; // tip of the carrot

    const onMove = (e: PointerEvent) => {
      // Direct transform write — no rAF. Browsers already deliver one
      // pointermove per frame, batching here just adds a frame of latency.
      cursor.style.transform = `translate3d(${e.clientX - offset}px, ${e.clientY - offset}px, 0)`;
      if (cursor.style.opacity !== '1') cursor.style.opacity = '1';
    };

    const onLeave = () => {
      cursor.style.opacity = '0';
    };

    const onEnter = (e: PointerEvent) => {
      cursor.style.transform = `translate3d(${e.clientX - offset}px, ${e.clientY - offset}px, 0)`;
      cursor.style.opacity = '1';
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    document.addEventListener('pointerenter', onEnter);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('pointerenter', onEnter);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={cursorRef}
      aria-hidden
      className="fixed top-0 left-0 pointer-events-none z-[9999] will-change-transform"
      style={{
        // Keep the layer composited and never animate the transform — only
        // fade in/out the opacity.
        transition: 'opacity 120ms ease-out',
        contain: 'layout style paint',
      }}
    >
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
        <path
          d="M2 2C2 2 12 0 20 8C25 13 22 19 18 22C12 20 6 14 2 2Z"
          fill="#BC6C25" stroke="#273617" strokeWidth="1.5" strokeLinejoin="round"
        />
        <path d="M8 8C9 9 11 9 12 8" stroke="#273617" strokeWidth="0.5" strokeOpacity="0.3" strokeLinecap="round" />
        <path d="M12 12C13 13 15 13 16 12" stroke="#273617" strokeWidth="0.5" strokeOpacity="0.3" strokeLinecap="round" />
        <path d="M15 16C16 17 18 17 19 16" stroke="#273617" strokeWidth="0.5" strokeOpacity="0.3" strokeLinecap="round" />
        <path
          d="M19 15 C21 12 25 10 29 10 M19 15 C23 15 27 15 31 15 M19 15 C21 18 25 20 29 20"
          stroke="#5F6C37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
