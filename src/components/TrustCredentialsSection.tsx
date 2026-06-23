import { Award, BookOpenCheck, ShieldCheck, UsersRound } from 'lucide-react';
import { motion } from 'motion/react';

const TRUST_ITEMS = [
  {
    title: 'Equipo preparado',
    detail: 'Procesos pensados para sostener una experiencia fresca, clara y confiable.',
    Icon: UsersRound,
  },
  {
    title: 'Criterio nutricional',
    detail: 'Selección de beneficios y combinaciones alineadas con bienestar cotidiano.',
    Icon: BookOpenCheck,
  },
  {
    title: 'Manipulación consciente',
    detail: 'Avisos visibles para revisar alérgenos, conservación y condiciones antes de ordenar.',
    Icon: ShieldCheck,
  },
];

export default function TrustCredentialsSection() {
  return (
    <section className="py-14 md:py-18 px-6 bg-serana-cream">
      <div className="max-w-6xl mx-auto">
        <div className="rounded-[2rem] border border-serana-forest/10 bg-white/65 p-6 md:p-9">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4">
              <span className="inline-flex items-center gap-2 text-serana-olive font-bold tracking-[0.3em] uppercase text-[10px] mb-4">
                <Award className="w-4 h-4" />
                Garantía de confianza
              </span>
              <h2 className="font-serif text-3xl md:text-4xl text-serana-forest leading-tight">
                Respaldo de un equipo <span className="italic text-serana-terracotta">preparado</span>.
              </h2>
              <p className="mt-4 text-sm text-serana-forest/65 font-light leading-relaxed">
                Los certificados específicos quedan listos para cargarse cuando el equipo los adjunte.
              </p>
            </div>

            <div className="lg:col-span-8 grid md:grid-cols-3 gap-4">
              {TRUST_ITEMS.map(({ title, detail, Icon }, idx) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.06 }}
                  className="rounded-2xl border border-serana-forest/10 bg-serana-cream/60 p-5"
                >
                  <span className="w-11 h-11 rounded-xl bg-serana-forest text-serana-ochre flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" strokeWidth={1.7} />
                  </span>
                  <h3 className="font-serif text-xl text-serana-forest leading-tight">{title}</h3>
                  <p className="mt-2 text-[13px] text-serana-forest/65 leading-relaxed font-light">{detail}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
