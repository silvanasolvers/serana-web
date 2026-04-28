import { motion } from 'motion/react';
import { Sprout, Pot, Bowl, SerenaMark } from './SeranaIcons';
import type { ComponentType, SVGProps } from 'react';

type Chapter = {
  number: string;
  kicker: string;
  title: string;
  italic: string;
  body: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const CHAPTERS: Chapter[] = [
  {
    number: '01',
    kicker: 'Origen · Campo',
    title: 'Sembrado por',
    italic: 'manos colombianas',
    body: 'Ingredientes traídos directo de pequeños productores de Cundinamarca y Boyacá. Trazabilidad real, no certificados decorativos: sabes quién cosechó cada lechuga.',
    Icon: Sprout,
  },
  {
    number: '02',
    kicker: 'Preparación · Cocina',
    title: 'Cocinado con',
    italic: 'precisión y oficio',
    body: 'Cada plato pasa por chefs que entienden la nutrición sin comprometer el sabor. Sin conservantes ni atajos industriales, solo técnica honesta.',
    Icon: Pot,
  },
  {
    number: '03',
    kicker: 'Entrega · Mesa',
    title: 'Servido cuando',
    italic: 'tu cuerpo lo pide',
    body: 'Despachado en empaques 100% compostables, justo cuando lo necesitas. Tú decides el ritmo: a domicilio, suscripción semanal o recogida.',
    Icon: Bowl,
  },
];

export default function ScrollStory() {
  return (
    <section className="relative bg-serana-cream py-24 md:py-32 px-6 lg:px-12 overflow-hidden">
      {/* Decorative side rules */}
      <div aria-hidden className="absolute inset-y-0 left-12 w-px bg-serana-forest/5 hidden lg:block" />
      <div aria-hidden className="absolute inset-y-0 right-12 w-px bg-serana-forest/5 hidden lg:block" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="text-center max-w-2xl mx-auto mb-14 md:mb-20">
          <span className="inline-flex items-center gap-3 text-serana-olive font-bold tracking-[0.4em] uppercase text-[10px] mb-6">
            <span className="w-10 h-px bg-serana-olive/60" />
            El recorrido Serana
            <span className="w-10 h-px bg-serana-olive/60" />
          </span>
          <h2 className="font-serif text-serana-forest text-4xl md:text-5xl lg:text-6xl leading-[1.02] tracking-tight">
            De la <span className="italic text-serana-olive">tierra</span>
            {' '}
            a tu <span className="italic text-serana-terracotta">mesa</span>.
          </h2>
          <p className="mt-6 text-serana-forest/65 text-base md:text-lg leading-relaxed font-light">
            Tres tiempos que respetan el ingrediente, la persona y el planeta.
          </p>
        </div>

        {/* ── Cards grid ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-7">
          {CHAPTERS.map((chapter, i) => (
            <ChapterCard key={chapter.number} chapter={chapter} index={i} total={CHAPTERS.length} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ChapterCard({
  chapter,
  index,
  total,
}: {
  chapter: Chapter;
  index: number;
  total: number;
}) {
  const Icon = chapter.Icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="group relative bg-white rounded-[1.75rem] border border-serana-forest/10 p-7 md:p-8 shadow-[0_20px_60px_-40px_rgba(39,54,23,0.25)] hover:shadow-[0_30px_80px_-30px_rgba(39,54,23,0.35)] hover:-translate-y-1 transition-all duration-500 flex flex-col"
    >
      {/* Watermark number */}
      <span
        aria-hidden
        className="absolute top-3 right-5 font-serif italic text-[7rem] leading-none text-serana-forest/[0.04] select-none pointer-events-none"
      >
        {chapter.number}
      </span>

      {/* Top row — kicker + icon */}
      <div className="flex items-start justify-between gap-3 mb-7 relative z-10">
        <span className="text-[9px] font-black uppercase tracking-[0.35em] text-serana-terracotta leading-snug pt-1">
          {chapter.kicker}
        </span>
        <span className="w-14 h-14 rounded-full bg-serana-olive/8 flex items-center justify-center text-serana-olive shrink-0 group-hover:bg-serana-olive/15 group-hover:rotate-3 transition-all duration-500">
          <Icon className="w-8 h-8" />
        </span>
      </div>

      {/* Title */}
      <h3 className="font-serif text-2xl md:text-[1.7rem] text-serana-forest leading-[1.1] tracking-tight relative z-10">
        {chapter.title}
        <br />
        <span className="italic text-serana-olive">{chapter.italic}</span>.
      </h3>

      {/* Body */}
      <p className="mt-5 text-serana-forest/70 text-[14.5px] leading-relaxed font-light relative z-10 flex-1">
        {chapter.body}
      </p>

      {/* Footer signature */}
      <div className="mt-7 pt-5 border-t border-serana-forest/8 flex items-center gap-2.5 relative z-10">
        <SerenaMark className="w-5 h-5 text-serana-ochre shrink-0" />
        <span className="text-[9px] font-black uppercase tracking-[0.35em] text-serana-forest/55">
          Serana · Capítulo {chapter.number} / {String(total).padStart(2, '0')}
        </span>
      </div>
    </motion.article>
  );
}
