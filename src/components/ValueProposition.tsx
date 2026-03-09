import { motion } from 'motion/react';
import { Leaf, Clock, Heart, Sparkles, Sprout, Recycle, ArrowUpRight } from 'lucide-react';
import clsx from 'clsx';

const features = [
  {
    icon: Leaf,
    title: "Nutrición Real",
    description: "Combos frescos, sin procesados. Comida de verdad para gente real.",
    variant: "dark",
    colSpan: "md:col-span-2",
    delay: 0.1
  },
  {
    icon: Clock,
    title: "Tiempo para Ti",
    description: "Olvídate de cocinar. Recupera horas de tu semana mientras disfrutas.",
    variant: "accent",
    colSpan: "md:col-span-2",
    delay: 0.2
  },
  {
    icon: Heart,
    title: "Bienestar 360",
    description: "Cuerpo sano, mente clara. El equilibrio que buscas.",
    variant: "minimal",
    colSpan: "md:col-span-1",
    delay: 0.3
  },
  {
    icon: Sparkles,
    title: "Detalles Únicos",
    description: "Cada entrega es un regalo para ti mismo.",
    variant: "minimal",
    colSpan: "md:col-span-1",
    delay: 0.4
  },
  {
    icon: Sprout,
    title: "Innovación",
    description: "Recetas modernas que rompen la rutina.",
    variant: "minimal",
    colSpan: "md:col-span-1",
    delay: 0.5
  },
  {
    icon: Recycle,
    title: "Eco-Friendly",
    description: "Cuidamos de ti y del planeta en cada paso.",
    variant: "minimal",
    colSpan: "md:col-span-1",
    delay: 0.6
  }
];

export default function ValueProposition() {
  return (
    <section className="py-16 px-6 bg-serana-cream relative overflow-hidden">
      {/* Elegant Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-serana-olive/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-serana-ochre/5 rounded-full blur-[80px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="max-w-2xl">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block text-serana-forest font-medium tracking-[0.2em] uppercase text-[10px] mb-2 border-b border-serana-forest/20 pb-1"
            >
              Nuestra Filosofía
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl font-serif text-serana-forest leading-[1.1]"
            >
              Más que comida, <br/>
              <span className="italic text-serana-olive">un estilo de vida.</span>
            </motion.h2>
          </div>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-sm text-serana-forest/60 leading-relaxed font-light max-w-xs"
          >
            Redefinimos tu relación con la alimentación. Sin complicaciones, sin culpas, solo disfrute y bienestar real.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: feature.delay * 0.5, ease: "easeOut" }}
              viewport={{ once: true }}
              className={clsx(
                feature.colSpan,
                "group relative p-5 rounded-xl transition-all duration-300 overflow-hidden",
                feature.variant === 'dark' && "bg-serana-forest text-serana-cream shadow-lg",
                feature.variant === 'accent' && "bg-serana-olive text-white shadow-lg",
                feature.variant === 'minimal' && "bg-white border border-serana-forest/5 hover:border-serana-forest/20 hover:shadow-md"
              )}
            >
              {/* Hover Gradient Overlay */}
              <div className={clsx(
                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
                feature.variant === 'dark' && "bg-gradient-to-br from-white/5 to-transparent",
                feature.variant === 'accent' && "bg-gradient-to-br from-white/10 to-transparent",
                feature.variant === 'minimal' && "bg-gradient-to-br from-serana-cream/30 to-transparent"
              )} />

              <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                <div className="flex justify-between items-start">
                  <div className={clsx(
                    "p-2 rounded-lg transition-colors duration-300",
                    feature.variant === 'dark' && "bg-white/10 text-serana-cream",
                    feature.variant === 'accent' && "bg-white/20 text-white",
                    feature.variant === 'minimal' && "bg-serana-cream text-serana-forest"
                  )}>
                    <feature.icon size={18} strokeWidth={1.5} />
                  </div>
                  
                  <div className={clsx(
                    "opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0",
                    feature.variant === 'minimal' ? "text-serana-forest/40" : "text-white/60"
                  )}>
                    <ArrowUpRight size={16} />
                  </div>
                </div>
                
                <div>
                  <h3 className={clsx(
                    "text-lg font-serif mb-1.5",
                    feature.variant === 'minimal' ? "text-serana-forest" : "text-white"
                  )}>
                    {feature.title}
                  </h3>
                  
                  <p className={clsx(
                    "text-xs leading-relaxed font-light",
                    feature.variant === 'dark' && "text-serana-cream/70",
                    feature.variant === 'accent' && "text-white/80",
                    feature.variant === 'minimal' && "text-serana-forest/60"
                  )}>
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
