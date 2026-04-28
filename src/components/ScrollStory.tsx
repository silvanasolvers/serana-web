import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Sprout, Pot, Bowl, SerenaMark } from './SeranaIcons';

const CHAPTERS = [
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
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // The "active" chapter index is derived from scrollYProgress without using
  // hooks per chapter — keeps the hook count constant and side-steps any
  // strict-mode hook-order edge case.
  const activeIndex = useTransform(scrollYProgress, (v) => {
    if (v < 0.33) return 0;
    if (v < 0.66) return 1;
    return 2;
  });

  return (
    <section
      ref={ref}
      className="relative bg-serana-cream"
      style={{ height: '320vh' }}
    >
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <div className="max-w-6xl w-full mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Pinned title block */}
          <div className="lg:col-span-5 relative z-10">
            <span className="inline-flex items-center gap-3 text-serana-olive font-bold tracking-[0.4em] uppercase text-[10px] mb-6">
              <span className="w-10 h-px bg-serana-olive/60" />
              El recorrido Serana
            </span>
            <h2 className="font-serif text-serana-forest text-5xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight">
              De la <span className="italic text-serana-olive">tierra</span>
              <br />
              a tu <span className="italic text-serana-terracotta">mesa</span>.
            </h2>
            <p className="mt-6 text-serana-forest/65 text-base leading-relaxed font-light max-w-md">
              Tres tiempos que respetan el ingrediente, la persona y el planeta. Desplázate para conocer cada uno.
            </p>

            <div className="mt-10 hidden lg:flex items-center gap-3">
              {CHAPTERS.map((c, i) => (
                <ProgressDot key={c.number} index={i} active={activeIndex} />
              ))}
            </div>
          </div>

          {/* Right: Chapter panels */}
          <div className="lg:col-span-7 relative h-[60vh] lg:h-[70vh]">
            {CHAPTERS.map((chapter, i) => (
              <ChapterCard key={chapter.number} index={i} chapter={chapter} active={activeIndex} total={CHAPTERS.length} />
            ))}
          </div>
        </div>

        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-y-0 left-12 w-px bg-serana-forest/5 hidden lg:block" />
          <div className="absolute inset-y-0 right-12 w-px bg-serana-forest/5 hidden lg:block" />
        </div>
      </div>
    </section>
  );
}

function ChapterCard({
  index,
  chapter,
  active,
  total,
}: {
  index: number;
  chapter: (typeof CHAPTERS)[number];
  active: ReturnType<typeof useTransform<number, number>>;
  total: number;
}) {
  // Derive opacity/y from the active index motion value via simple clamping.
  const opacity = useTransform(active, (v) => (Math.round(v) === index ? 1 : 0));
  const y = useTransform(active, (v) => {
    const diff = Math.round(v) - index;
    if (diff === 0) return 0;
    if (diff > 0) return -40;
    return 40;
  });

  const Icon = chapter.Icon;

  return (
    <motion.div
      aria-hidden={undefined}
      className="absolute inset-0 flex flex-col justify-center"
      style={{ opacity, y }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative bg-white/70 backdrop-blur-md rounded-[2rem] border border-serana-forest/10 p-8 md:p-10 shadow-[0_30px_80px_-40px_rgba(39,54,23,0.25)]">
        <span
          aria-hidden
          className="absolute top-2 right-6 font-serif italic text-[11rem] leading-none text-serana-forest/5 select-none pointer-events-none"
        >
          {chapter.number}
        </span>

        <div className="flex items-start justify-between gap-4 mb-8 relative z-10">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-serana-terracotta">
            {chapter.kicker}
          </span>
          <div className="text-serana-olive">
            <Icon className="w-20 h-20 md:w-24 md:h-24" />
          </div>
        </div>

        <h3 className="font-serif text-3xl md:text-5xl text-serana-forest leading-tight tracking-tight relative z-10">
          {chapter.title}
          <br />
          <span className="italic text-serana-olive">{chapter.italic}</span>.
        </h3>

        <p className="mt-6 text-serana-forest/70 text-base md:text-lg leading-relaxed font-light relative z-10 max-w-xl">
          {chapter.body}
        </p>

        <div className="mt-8 flex items-center gap-3 relative z-10">
          <SerenaMark className="w-7 h-7 text-serana-ochre" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-serana-forest/55">
            Serana — Capítulo {chapter.number} / {String(total).padStart(2, '0')}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function ProgressDot({
  index,
  active,
}: {
  index: number;
  active: ReturnType<typeof useTransform<number, number>>;
}) {
  const scale = useTransform(active, (v) => (Math.round(v) === index ? 1 : 0.5));
  const opacity = useTransform(active, (v) => (Math.round(v) === index ? 1 : 0.4));
  return (
    <motion.span
      style={{ scale, opacity }}
      className="block w-2 h-2 rounded-full bg-serana-olive"
    />
  );
}
