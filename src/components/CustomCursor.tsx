import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Only on desktop
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const cursor = cursorRef.current;
    if (!cursor) return;

    const onMove = (e: MouseEvent) => {
      cursor.style.transform = `translate(${e.clientX - 2}px, ${e.clientY - 2}px)`;
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // Hide on mobile/touch devices
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 pointer-events-none z-[9999] will-change-transform hidden md:block"
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
