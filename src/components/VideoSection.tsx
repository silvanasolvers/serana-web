import { motion, useInView } from 'motion/react';
import { Leaf, Heart, ShieldCheck } from 'lucide-react';
import { useRef, useEffect } from 'react';

export default function VideoSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(containerRef, { amount: 0.5 });

  useEffect(() => {
    if (videoRef.current) {
      if (isInView) {
        videoRef.current.play().catch(e => console.log("Autoplay prevented:", e));
      } else {
        videoRef.current.pause();
      }
    }
  }, [isInView]);

  const valueProps = [
    {
      icon: Leaf,
      title: "Ingredientes 100% Locales",
      description: "Apoyamos a agricultores de la región, garantizando frescura y reduciendo nuestra huella de carbono."
    },
    {
      icon: ShieldCheck,
      title: "Cero Conservantes",
      description: "Nuestros platos son preparados diariamente sin químicos añadidos. Comida real para cuerpos reales."
    },
    {
      icon: Heart,
      title: "Nutrición Balanceada",
      description: "Cada receta está diseñada por nutricionistas para ofrecerte el equilibrio perfecto de macros."
    }
  ];

  return (
    <section ref={containerRef} className="min-h-[100svh] py-12 lg:py-16 px-6 bg-serana-forest text-serana-cream relative overflow-hidden flex items-center">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-serana-olive rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-serana-ochre rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          
          {/* Left: Information */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-xl"
          >
            <span className="inline-block text-serana-ochre font-bold tracking-[0.2em] uppercase text-[10px] mb-3 border border-serana-ochre/20 px-3 py-1.5 rounded-full">
              La Experiencia Serana
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif mb-4 leading-tight">
              Siente la <span className="italic text-serana-ochre">Diferencia</span>
            </h2>
            <p className="text-serana-cream/80 font-light text-sm md:text-base leading-relaxed mb-8">
              Detrás de cada plato hay una historia de ingredientes reales, pasión por la nutrición y un profundo respeto por la naturaleza. Descubre cómo transformamos lo simple en extraordinario.
            </p>

            <div className="space-y-4">
              {valueProps.map((prop, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + (idx * 0.1), duration: 0.5 }}
                  className="flex gap-3"
                >
                  <div className="mt-1 bg-serana-ochre/10 p-2 rounded-xl text-serana-ochre shrink-0 h-fit border border-serana-ochre/20">
                    <prop.icon size={18} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="font-serif text-lg mb-0.5 text-white">{prop.title}</h4>
                    <p className="text-serana-cream/60 text-xs font-light leading-relaxed">{prop.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Vertical Video */}
          <motion.div 
            initial={{ opacity: 0, x: 30, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)] aspect-[9/16] max-h-[75vh] max-w-[320px] md:max-w-[380px] mx-auto lg:mx-0 lg:ml-auto w-full group cursor-pointer border border-white/10 bg-black/20"
          >
            {/* Video Element */}
            <video 
              ref={videoRef}
              loop 
              muted 
              playsInline
              className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000 ease-out opacity-90 group-hover:opacity-100"
              poster="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800"
            >
              <source src="https://qlgjqvgjuscquhspjqdp.supabase.co/storage/v1/object/public/AETHERA-DOCS/video%20serana.mp4" type="video/mp4" />
              Tu navegador no soporta el elemento de video.
            </video>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-serana-forest/90 via-serana-forest/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
            
            {/* Floating Badge */}
            <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
              <p className="text-serana-cream font-serif text-lg mb-0.5">Sabor Auténtico</p>
              <p className="text-serana-cream/70 text-[10px] uppercase tracking-widest">Preparado diariamente para ti</p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
