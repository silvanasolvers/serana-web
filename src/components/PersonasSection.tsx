import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Briefcase, Palette, ArrowRight } from 'lucide-react';

const personas = [
  {
    id: 'mariana',
    name: 'Mariana',
    role: 'Family Peace',
    icon: User,
    quote: "Busco nutrir a mi familia con confianza y sin complicaciones.",
    painPoint: "Falta de tiempo para cocinar saludable.",
    solution: "Kits de comidas balanceadas listos en 15 minutos.",
    color: "bg-serana-olive"
  },
  {
    id: 'juan',
    name: 'Juan',
    role: 'Executive Performance',
    icon: Briefcase,
    quote: "Mi energía es mi mayor activo. Necesito combustible real.",
    painPoint: "Bajones de energía a media tarde y snacks procesados.",
    solution: "Snacks funcionales de alta densidad nutricional.",
    color: "bg-serana-forest"
  },
  {
    id: 'laura',
    name: 'Laura',
    role: 'Creative Lifestyle',
    icon: Palette,
    quote: "La estética y el origen de lo que consumo me inspiran.",
    painPoint: "Productos aburridos que no alinean con mis valores.",
    solution: "Ingredientes exóticos y sostenibles con historia.",
    color: "bg-serana-terracotta"
  }
];

export default function PersonasSection() {
  const [activePersona, setActivePersona] = useState(personas[0]);

  return (
    <section className="py-20 px-6 relative z-10 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-serana-terracotta mb-3 block">
            Who is Serana for?
          </span>
          <h2 className="font-serif text-3xl md:text-5xl text-serana-forest">
            Designed for <span className="italic text-serana-ochre">Real Lives</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Persona Selector */}
          <div className="lg:col-span-5 space-y-3">
            {personas.map((persona) => (
              <motion.div
                key={persona.id}
                onClick={() => setActivePersona(persona)}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border ${
                  activePersona.id === persona.id 
                    ? 'bg-white shadow-md border-transparent scale-102' 
                    : 'bg-transparent border-serana-forest/10 hover:bg-white/30'
                }`}
                whileHover={{ x: 5 }}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-full ${activePersona.id === persona.id ? 'bg-serana-cream text-serana-forest' : 'bg-serana-forest/5 text-serana-forest/60'}`}>
                    <persona.icon size={20} />
                  </div>
                  <div>
                    <h3 className={`font-serif text-lg ${activePersona.id === persona.id ? 'text-serana-forest' : 'text-serana-forest/60'}`}>
                      {persona.name}
                    </h3>
                    <p className="font-sans text-[10px] uppercase tracking-wider text-serana-forest/40">
                      {persona.role}
                    </p>
                  </div>
                  {activePersona.id === persona.id && (
                    <motion.div 
                      layoutId="activeIndicator"
                      className="ml-auto text-serana-ochre"
                    >
                      <ArrowRight size={18} />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Persona Detail Card */}
          <div className="lg:col-span-7 h-[400px] relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePersona.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className={`absolute inset-0 rounded-[2rem] p-8 md:p-12 flex flex-col justify-center ${activePersona.color} text-serana-cream shadow-xl overflow-hidden`}
              >
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                
                <div className="relative z-10">
                  <span className="inline-block px-3 py-1 rounded-full border border-white/20 text-[10px] uppercase tracking-widest mb-6 bg-white/5 backdrop-blur-sm">
                    The Challenge
                  </span>
                  
                  <h3 className="font-serif text-2xl md:text-3xl mb-5 leading-tight">
                    "{activePersona.painPoint}"
                  </h3>
                  
                  <div className="w-12 h-1 bg-white/30 mb-6" />
                  
                  <div className="space-y-2">
                    <p className="font-sans text-[10px] uppercase tracking-wider opacity-60">
                      The Serana Solution
                    </p>
                    <p className="font-serif text-lg md:text-xl italic opacity-90">
                      {activePersona.solution}
                    </p>
                  </div>
                </div>

                <div className="absolute bottom-6 right-6 opacity-10 font-serif text-8xl pointer-events-none">
                  {activePersona.name[0]}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
