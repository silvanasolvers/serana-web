import { ArrowRight, CalendarDays, Gift, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { buildWhatsAppUrl } from '../lib/contact';

export default function LoyaltySection() {
  return (
    <section className="bg-serana-cream px-6 py-16 md:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-serana-olive/20 bg-serana-olive/5 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-serana-olive">
            <Sparkles size={12} />
            Club Serana
          </span>

          <h2 className="max-w-3xl font-serif text-3xl leading-tight text-serana-forest md:text-5xl">
            🏆 Membresía Serana
            <span className="mt-2 block italic text-serana-ochre">
              Transforma tu vida en 90 días
            </span>
          </h2>

          <p className="mt-5 max-w-xl text-base font-light leading-relaxed text-serana-forest/75 md:text-lg">
            No es solo un programa. Es tu experiencia renaciendo.
          </p>

          <p className="mt-4 max-w-2xl text-sm font-light leading-relaxed text-serana-forest/70 md:text-base">
            En Serana creemos que el bienestar se siente y es el primer paso hacia una vida plena. Por eso creamos el Programa de Transformación de 90 Días, un viaje diseñado para que reconectes con tu cuerpo, tu energía y tu bienestar.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={buildWhatsAppUrl('Hola, quiero conocer la Membresía Serana de 90 días.')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-serana-forest px-7 py-3 text-[11px] font-bold uppercase tracking-widest text-serana-cream transition-all hover:-translate-y-0.5 hover:bg-serana-olive hover:shadow-lg"
            >
              Conocer membresía
              <ArrowRight size={15} />
            </a>
            <Link
              to="/shop"
              className="inline-flex items-center justify-center rounded-full border border-serana-forest/20 px-7 py-3 text-[11px] font-bold uppercase tracking-widest text-serana-forest transition-all hover:-translate-y-0.5 hover:border-serana-olive hover:bg-white/70"
            >
              Ver productos Serana
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-serana-olive/20 bg-white/75 p-6 shadow-xl shadow-serana-forest/5 md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-serana-ochre/15 text-serana-forest">
              <CalendarDays size={22} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-serana-terracotta">
                ¿Qué incluye tu membresía?
              </p>
              <h3 className="font-serif text-2xl leading-tight text-serana-forest">
                90 días de acompañamiento
              </h3>
            </div>
          </div>

          <div className="rounded-2xl border border-serana-forest/10 bg-serana-cream/65 p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-serana-olive shadow-sm">
                <Gift size={20} />
              </div>
              <h4 className="font-serif text-xl leading-tight text-serana-forest">
                🎁 Kit de Bienvenida Premium
              </h4>
            </div>
            <p className="text-sm font-light leading-relaxed text-serana-forest/72">
              Llega a tu casa con todo lo que necesitas para empezar: productos Serana seleccionados, guía de inicio y herramientas de seguimiento.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
