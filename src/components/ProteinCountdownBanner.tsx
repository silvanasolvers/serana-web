import { CalendarClock, Drumstick, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

const PROTEIN_OPTIONS = ['Pollo', 'Cerdo', 'Res'];

export default function ProteinCountdownBanner() {
  return (
    <section className="px-6 py-6 bg-serana-forest text-serana-cream">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto grid gap-5 md:grid-cols-[1fr_auto] md:items-center"
      >
        <div className="flex items-start gap-4">
          <span className="w-12 h-12 rounded-2xl bg-serana-ochre text-serana-forest flex items-center justify-center shrink-0">
            <Drumstick className="w-6 h-6" strokeWidth={1.7} />
          </span>
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-serana-ochre font-bold mb-2">
              Próximamente en el menú
            </p>
            <h2 className="font-serif text-2xl md:text-4xl leading-tight">
              Llegan más opciones de <span className="italic text-serana-ochre">proteína</span>
            </h2>
            <p className="mt-2 text-sm text-serana-cream/70 max-w-2xl">
              Estamos preparando nuevas alternativas para completar tus bowls, kits y pedidos semanales.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-serana-cream/15 bg-white/5 p-4 min-w-[260px]">
          <div className="flex items-center gap-2 text-serana-ochre mb-3">
            <CalendarClock className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-[0.25em] font-bold">Cuenta regresiva</span>
          </div>
          <p className="font-serif text-xl text-serana-cream leading-tight">Fecha por confirmar</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {PROTEIN_OPTIONS.map((item) => (
              <span
                key={item}
                className="inline-flex items-center justify-center gap-1 rounded-full bg-serana-cream/10 px-3 py-2 text-[10px] uppercase tracking-[0.2em] font-bold"
              >
                <Sparkles className="w-3 h-3 text-serana-ochre" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
