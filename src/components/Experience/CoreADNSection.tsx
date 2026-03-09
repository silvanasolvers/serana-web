import { motion } from 'motion/react';
import { Canvas } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial, Torus, Icosahedron, Octahedron } from '@react-three/drei';
import * as THREE from 'three';

function ADNObject({ type }: { type: 'pureza' | 'practicidad' | 'innovacion' }) {
  if (type === 'pureza') {
    return (
      <Float speed={2} rotationIntensity={2} floatIntensity={2}>
        <Icosahedron args={[1, 0]} scale={1.5}>
          <MeshTransmissionMaterial 
            thickness={0.5} 
            roughness={0.2} 
            transmission={1} 
            ior={1.5} 
            chromaticAberration={0.1} 
            background={new THREE.Color("#FEFADF")}
            resolution={512}
            samples={6}
          />
        </Icosahedron>
      </Float>
    );
  }
  if (type === 'practicidad') {
    return (
      <Float speed={3} rotationIntensity={3} floatIntensity={1}>
        <Torus args={[1, 0.4, 16, 32]} scale={1.2}>
          <MeshTransmissionMaterial 
            thickness={0.5} 
            roughness={0.1} 
            transmission={1} 
            ior={1.2} 
            chromaticAberration={0.2} 
            background={new THREE.Color("#FEFADF")}
            color="#5F6C37" 
            resolution={512}
            samples={6}
          />
        </Torus>
      </Float>
    );
  }
  return (
    <Float speed={1} rotationIntensity={1} floatIntensity={3}>
      <Octahedron args={[1, 0]} scale={1.8}>
        <MeshTransmissionMaterial 
          thickness={1} 
          roughness={0} 
          transmission={0.9} 
          ior={1.8} 
          chromaticAberration={0.5} 
          background={new THREE.Color("#FEFADF")}
          color="#BC6C25" 
          resolution={512}
          samples={6}
        />
      </Octahedron>
    </Float>
  );
}

export default function CoreADNSection() {
  const items = [
    { title: "Pureza del Origen", desc: "Ingredientes seleccionados con rigor científico.", type: 'pureza' },
    { title: "Practicidad Premium", desc: "Nutrición compleja en formatos simples.", type: 'practicidad' },
    { title: "Innovación Consciente", desc: "Tecnología al servicio de la naturaleza.", type: 'innovacion' },
  ];

  return (
    <div className="relative flex flex-col items-center justify-center w-full min-h-screen py-20 overflow-hidden">
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-serana-forest/20 -translate-x-1/2 z-0" />
      
      {items.map((item, index) => (
        <motion.div 
          key={index}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: index * 0.2 }}
          viewport={{ once: true, margin: "-100px" }}
          className={`relative z-10 flex items-center justify-between w-full max-w-5xl my-20 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
        >
          <div className={`w-1/2 px-8 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
            <h2 className="font-serif text-4xl italic text-serana-forest">{item.title}</h2>
            <p className="mt-4 font-sans text-lg text-serana-forest/80">{item.desc}</p>
          </div>
          
          <div className="relative flex items-center justify-center w-1/2 h-64">
            <Canvas camera={{ position: [0, 0, 5] }}>
              <ambientLight intensity={1} />
              <directionalLight position={[5, 5, 5]} intensity={2} />
              {/* @ts-ignore */}
              <ADNObject type={item.type as any} />
            </Canvas>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
