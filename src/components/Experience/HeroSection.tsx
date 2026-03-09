import { motion, useScroll, useTransform } from 'motion/react';
import { Canvas } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, Float } from '@react-three/drei';

function HeroObject() {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <Sphere args={[1, 64, 64]} scale={2.2}>
        <MeshDistortMaterial
          color="#BC6C25" // Terracotta
          attach="material"
          distort={0.4}
          speed={1.5}
          roughness={0.4}
          metalness={0.5}
        />
      </Sphere>
    </Float>
  );
}

export default function HeroSection() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <div className="relative flex items-center justify-center w-full h-full overflow-hidden">
      {/* 3D Object Layer */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-40 blur-sm">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={1} />
          <directionalLight position={[2, 5, 2]} intensity={2} />
          <HeroObject />
        </Canvas>
      </div>

      {/* Typography Layer */}
      <motion.div 
        style={{ y, opacity }}
        className="z-10 flex flex-col items-center justify-center px-4 text-center"
      >
        <h1 className="font-serif text-5xl font-medium leading-tight md:text-7xl lg:text-8xl text-serana-forest">
          <span className="block mb-2">Tu bienestar</span>
          <span className="block mb-2">es un <span className="italic font-light text-serana-terracotta">ritual</span>,</span>
          <span className="block">no una rutina.</span>
        </h1>
      </motion.div>
    </div>
  );
}
