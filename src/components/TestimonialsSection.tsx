import { Quote, Star } from 'lucide-react';
import { motion } from 'motion/react';

const TESTIMONIALS = [
  {
    title: 'Más práctico para la semana',
    text: 'La experiencia está pensada para elegir rápido, recibir fresco y sostener una rutina más ordenada.',
  },
  {
    title: 'Sabor con intención',
    text: 'Las combinaciones se sienten frescas, cuidadas y fáciles de integrar a un día ocupado.',
  },
  {
    title: 'Una comunidad que participa',
    text: 'Las decisiones del menú se abren a la comunidad para que Serana evolucione con quienes la consumen.',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-14 md:py-20 px-6 bg-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-8 items-end mb-10">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 text-serana-terracotta font-bold tracking-[0.3em] uppercase text-[10px] mb-4">
              <Quote className="w-4 h-4" />
              Reseñas Serana
            </span>
            <h2 className="font-serif text-3xl md:text-5xl text-serana-forest leading-tight">
              Lo que se vive cuando comer bien se vuelve <span className="italic text-serana-olive">más fácil</span>.
            </h2>
          </div>
          <p className="lg:col-span-5 text-sm text-serana-forest/65 font-light leading-relaxed border-l border-serana-forest/15 pl-5">
            Historias positivas de una experiencia que combina frescura, practicidad y bienestar cotidiano.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {TESTIMONIALS.map((item, idx) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className="rounded-2xl border border-serana-forest/10 bg-serana-cream/45 p-6"
            >
              <div className="flex items-center gap-1 text-serana-ochre mb-5" aria-label="Reseña positiva">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <h3 className="font-serif text-xl text-serana-forest leading-tight mb-3">{item.title}</h3>
              <p className="text-sm text-serana-forest/68 font-light leading-relaxed">{item.text}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
