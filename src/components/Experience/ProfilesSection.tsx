import { motion } from 'motion/react';
import { useState } from 'react';

const profiles = [
  {
    title: "Madres Jóvenes",
    desc: "Energía vital para criar y crecer.",
    color: "from-serana-terracotta/20 to-serana-ochre/20",
    vibe: "bg-serana-terracotta/5"
  },
  {
    title: "Ejecutivos Ajetreados",
    desc: "Enfoque mental y resistencia.",
    color: "from-serana-forest/20 to-serana-olive/20",
    vibe: "bg-serana-forest/5"
  },
  {
    title: "Emprendedores Digitales",
    desc: "Creatividad sostenida sin burnout.",
    color: "from-slate-800/20 to-gray-900/20",
    vibe: "bg-slate-900/5"
  }
];

export default function ProfilesSection() {
  const [activeVibe, setActiveVibe] = useState("");

  return (
    <div className={`relative flex flex-col items-center justify-center w-full h-full transition-colors duration-700 ${activeVibe}`}>
      <h2 className="mb-16 font-serif text-5xl text-center text-serana-forest">Diseñado para ti</h2>
      
      <div className="grid grid-cols-1 gap-8 px-4 md:grid-cols-3 max-w-7xl">
        {profiles.map((profile, index) => (
          <motion.div
            key={index}
            whileHover={{ y: -20, scale: 1.05 }}
            onHoverStart={() => setActiveVibe(profile.vibe)}
            onHoverEnd={() => setActiveVibe("")}
            className={`relative p-10 overflow-hidden border rounded-2xl border-white/30 backdrop-blur-lg bg-gradient-to-br ${profile.color} shadow-2xl cursor-pointer group h-96 flex flex-col justify-end`}
          >
            <div className="absolute inset-0 transition-opacity duration-500 opacity-0 bg-white/20 group-hover:opacity-100" />
            <h3 className="relative z-10 mb-4 font-serif text-3xl font-bold text-serana-forest group-hover:text-serana-terracotta transition-colors">{profile.title}</h3>
            <p className="relative z-10 font-sans text-lg font-medium text-serana-forest/80">{profile.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
