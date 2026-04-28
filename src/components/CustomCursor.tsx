import { useEffect, useRef, useState } from 'react';

/**
 * Carrot-shaped cursor.
 *
 * Renders only on devices with a fine pointer (mouse / trackpad). Tracks the
 * pointer with `pointermove` (more universal than `mousemove`) and stays
 * hidden until the first event so we don't paint a stray carrot at the
 * top-left corner before the user has moved their mouse.
 *
 * The OS cursor is hidden via `cursor: none` in `index.css`, restored on
 * coarse-pointer media via the same stylesheet.
 */
export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);

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

    let frame = 0;
    let lastX = 0;
    let lastY = 0;
    const offset = 4; // tip of the carrot

    const apply = () => {
      cursor.style.transform = `translate3d(${lastX - offset}px, ${lastY - offset}px, 0)`;
      frame = 0;
    };

    const onMove = (e: PointerEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;
      if (!visible) setVisible(true);
      if (!frame) frame = requestAnimationFrame(apply);
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [enabled, visible]);

  if (!enabled) return null;

  return (
    <div
      ref={cursorRef}
      aria-hidden
      className="fixed top-0 left-0 pointer-events-none z-[9999] will-change-transform"
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 120ms ease-out',
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
