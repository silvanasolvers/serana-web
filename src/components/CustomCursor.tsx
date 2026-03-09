import { useEffect, useState } from 'react';
import { motion, useMotionValue } from 'motion/react';

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 2);
      cursorY.set(e.clientY - 2);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('button') || target.closest('a')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [cursorX, cursorY]);

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999]"
      style={{
        x: cursorX,
        y: cursorY,
        translateX: "-2px",
        translateY: "-2px",
      }}
    >
      <motion.div
        animate={{ 
          scale: isHovering ? 1.2 : 1,
          rotate: isHovering ? -15 : 0
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
          {/* Carrot Body - Curved and Pointy */}
          <path 
            d="M2 2C2 2 12 0 20 8C25 13 22 19 18 22C12 20 6 14 2 2Z" 
            fill="#BC6C25" 
            stroke="#273617" 
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          
          {/* Texture Lines */}
          <path d="M8 8C9 9 11 9 12 8" stroke="#273617" strokeWidth="0.5" strokeOpacity="0.3" strokeLinecap="round" />
          <path d="M12 12C13 13 15 13 16 12" stroke="#273617" strokeWidth="0.5" strokeOpacity="0.3" strokeLinecap="round" />
          <path d="M15 16C16 17 18 17 19 16" stroke="#273617" strokeWidth="0.5" strokeOpacity="0.3" strokeLinecap="round" />

          {/* Leaves - Centered and fanned out from the back */}
          <path 
            d="M19 15 C21 12 25 10 29 10 M19 15 C23 15 27 15 31 15 M19 15 C21 18 25 20 29 20" 
            stroke="#5F6C37" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}
