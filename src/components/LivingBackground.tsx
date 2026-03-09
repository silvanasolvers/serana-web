import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'motion/react';
import { useEffect } from 'react';

export default function LivingBackground() {
  const { scrollY } = useScroll();
  
  // Mouse movement tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Very smooth, slow spring for elegant movement
  const springConfig = { damping: 100, stiffness: 50, mass: 3 };
  const x1 = useSpring(useTransform(mouseX, [0, window.innerWidth], [-20, 20]), springConfig);
  const y1 = useSpring(useTransform(mouseY, [0, window.innerHeight], [-20, 20]), springConfig);
  
  const x2 = useSpring(useTransform(mouseX, [0, window.innerWidth], [20, -20]), springConfig);
  const y2 = useSpring(useTransform(mouseY, [0, window.innerHeight], [20, -20]), springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Subtle Scroll parallax
  const scrollY1 = useTransform(scrollY, [0, 2000], [0, 200]);
  const scrollY2 = useTransform(scrollY, [0, 2000], [0, -150]);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-serana-cream">
      {/* Dynamic Grainy Texture */}
      <div className="absolute inset-0 opacity-[0.4] pointer-events-none mix-blend-multiply" 
           style={{ 
             backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'1\'/%3E%3C/svg%3E")',
             filter: 'contrast(120%) brightness(100%)'
           }}></div>

      {/* Elegant, faint orbs - Professional and minimal */}
      <motion.div 
        style={{ x: x1, y: scrollY1 }}
        className="absolute -top-[10%] -left-[10%] w-[80vw] h-[80vw] bg-gradient-to-br from-serana-olive/10 to-transparent rounded-full blur-[120px]"
      />
      
      <motion.div 
        style={{ x: x2, y: scrollY2 }}
        className="absolute top-[20%] -right-[20%] w-[70vw] h-[70vw] bg-gradient-to-bl from-serana-ochre/10 to-serana-terracotta/10 rounded-full blur-[140px]"
      />

      <motion.div 
        style={{ 
          x: useTransform(mouseX, [0, window.innerWidth], [-10, 10]),
          y: useTransform(mouseY, [0, window.innerHeight], [-10, 10]),
        }}
        className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] bg-gradient-to-t from-serana-forest/5 to-transparent rounded-full blur-[130px]"
      />
    </div>
  );
}
