import { motion } from 'motion/react';
import clsx from 'clsx';
import {
  Leaf,
  Hourglass,
  Drop,
  Spark,
  Sprout,
  Seed,
} from './SeranaIcons';
import type { ComponentType, SVGProps } from 'react';

type IconCmp = ComponentType<SVGProps<SVGSVGElement>>;

const features: Array<{
  icon: IconCmp;
  number: string;
  title: string;
  description: string;
  variant: 'dark' | 'accent' | 'minimal';
  colSpan: string;
}> = [
  {
    icon: Leaf,
    number: '01',
    title: 'Comida de verdad',
    description: 'Ingredientes reales, preparaciones honestas y sabor que se siente fresco y delicioso.',
    variant: 'dark',
    colSpan: 'md:col-span-2',
  },
  {
    icon: Hourglass,
    number: '02',
    title: 'Más tiempo para ti',
    description: 'Nosotros nos encargamos de nutrirte bien para que tú recuperes tiempo, energía y agilidad en tu día.',
    variant: 'accent',
    colSpan: 'md:col-span-2',
  },
  {
    icon: Drop,
    number: '03',
    title: 'Bienestar que se nota',
    description: 'Cuerpo sano, mente clara. El equilibrio que buscas.',
    variant: 'minimal',
    colSpan: 'md:col-span-1',
  },
  {
    icon: Spark,
    number: '04',
    title: 'Cada detalle importa',
    description: 'Cada ingrediente y cada entrega es un regalo para ti mismo.',
    variant: 'minimal',
    colSpan: 'md:col-span-1',
  },
  {
    icon: Sprout,
    number: '05',
    title: 'Sabores que sorprenden',
    description: 'Recetas pensadas para disfrutar y salir de lo típico.',
    variant: 'minimal',
    colSpan: 'md:col-span-1',
  },
  {
    icon: Seed,
    number: '06',
    title: 'Origen consciente',
    description: 'Cuidamos de ti y de quienes cultivan, en cada decisión que tomamos.',
    variant: 'minimal',
    colSpan: 'md:col-span-1',
  },
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
              Alimentarte bien <br/>
              <span className="italic text-serana-olive">es una forma de vivir mejor.</span>
            </motion.h2>
          </div>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-sm text-serana-forest/60 leading-relaxed font-light max-w-xs"
          >
            En Serana creemos que comer bien puede ser fácil, delicioso y estar profundamente alineado con cómo quieres sentirte.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true, margin: '-60px' }}
                className={clsx(
                  feature.colSpan,
                  'group relative p-6 rounded-2xl transition-all duration-300 overflow-hidden border',
                  feature.variant === 'dark' && 'bg-serana-forest text-serana-cream border-serana-forest shadow-lg',
                  feature.variant === 'accent' && 'bg-serana-olive text-white border-serana-olive shadow-lg',
                  feature.variant === 'minimal' &&
                    'bg-white text-serana-forest border-serana-forest/10 hover:border-serana-forest/30 hover:shadow-md',
                )}
              >
                {/* Editorial number watermark */}
                <span
                  aria-hidden
                  className={clsx(
                    'absolute -top-3 right-4 font-serif italic text-[5.5rem] leading-none select-none pointer-events-none transition-opacity duration-500',
                    feature.variant === 'dark' && 'text-serana-cream/8 group-hover:text-serana-cream/15',
                    feature.variant === 'accent' && 'text-white/12 group-hover:text-white/20',
                    feature.variant === 'minimal' && 'text-serana-forest/6 group-hover:text-serana-forest/12',
                  )}
                >
                  {feature.number}
                </span>

                {/* Hover paper grain */}
                <div
                  className={clsx(
                    'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none mix-blend-overlay',
                    feature.variant === 'dark' && 'bg-gradient-to-br from-white/8 to-transparent',
                    feature.variant === 'accent' && 'bg-gradient-to-br from-white/12 to-transparent',
                    feature.variant === 'minimal' && 'bg-gradient-to-br from-serana-cream/40 to-transparent',
                  )}
                />

                <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                  <div className="flex items-start gap-3">
                    <div
                      className={clsx(
                        'w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 transition-colors duration-300',
                        feature.variant === 'dark' && 'border-serana-cream/25 text-serana-ochre group-hover:border-serana-ochre',
                        feature.variant === 'accent' && 'border-white/30 text-white group-hover:border-white/60',
                        feature.variant === 'minimal' && 'border-serana-forest/15 text-serana-olive group-hover:border-serana-olive',
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={clsx(
                        'text-[10px] font-black uppercase tracking-[0.3em] mt-1.5',
                        feature.variant === 'dark' && 'text-serana-ochre/80',
                        feature.variant === 'accent' && 'text-white/80',
                        feature.variant === 'minimal' && 'text-serana-olive/70',
                      )}
                    >
                      / {feature.number}
                    </span>
                  </div>

                  <div>
                    <h3
                      className={clsx(
                        'text-xl md:text-2xl font-serif leading-tight mb-2 tracking-tight',
                        feature.variant === 'minimal' ? 'text-serana-forest' : 'text-white',
                      )}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className={clsx(
                        'text-[13px] leading-relaxed font-light',
                        feature.variant === 'dark' && 'text-serana-cream/75',
                        feature.variant === 'accent' && 'text-white/85',
                        feature.variant === 'minimal' && 'text-serana-forest/65',
                      )}
                    >
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
