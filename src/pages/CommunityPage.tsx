import Navbar from '../components/Navbar';
import CartDrawer from '../components/CartDrawer';
import Footer from '../components/Footer';
import SectionDivider from '../components/SectionDivider';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Calendar, Sprout, Drop, Spark, Sun, SerenaMark } from '../components/SeranaIcons';
import type { ComponentType, SVGProps } from 'react';

const today = new Date();
const editionNumber = String(((today.getMonth() + 1) % 12) + 1).padStart(2, '0');

type IconCmp = ComponentType<SVGProps<SVGSVGElement>>;

type Event = {
  number: string;
  kicker: string;
  date: string;
  title: string;
  italic: string;
  body: string;
  cta: string;
  Icon: IconCmp;
  image: string;
};

const EVENTS: Event[] = [
  {
    number: '01',
    kicker: 'Reto · 7 días',
    date: '15 Oct',
    title: 'Reinicio digestivo',
    italic: 'guiado',
    body: 'Una semana para reiniciar tu sistema digestivo con guías diarias, recetas de la casa y apoyo en grupo cerrado.',
    cta: 'Inscribirme',
    Icon: Sprout,
    image: 'https://images.unsplash.com/photo-1544367563-12123d8965cd?auto=format&fit=crop&q=80&w=1000',
  },
  {
    number: '02',
    kicker: 'Webinar · En línea',
    date: '22 Oct',
    title: 'Nutrición para el',
    italic: 'flow del trabajo',
    body: 'Cómo combinar alimentos para mantener foco, energía y ánimo durante una jornada larga. Sesión en vivo + grabación.',
    cta: 'Reservar cupo',
    Icon: Spark,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1000',
  },
  {
    number: '03',
    kicker: 'Encuentro · Cada domingo',
    date: 'Dom · 9 am',
    title: 'Círculo de',
    italic: 'bienestar',
    body: 'Sesiones de meditación y mindfulness exclusivas para suscriptores. Un domingo lento que abre la semana con calma.',
    cta: 'Conocer agenda',
    Icon: Sun,
    image: 'https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?auto=format&fit=crop&q=80&w=1000',
  },
];

const STATS = [
  { number: '480', label: 'Suscriptoras activas' },
  { number: '24', label: 'Encuentros este año' },
  { number: '12', label: 'Productores aliados' },
];

const RITUALS: Array<{ Icon: IconCmp; title: string; italic: string; body: string }> = [
  {
    Icon: Calendar,
    title: 'Calendario',
    italic: 'editorial',
    body: 'Cada mes lanzamos un menú nuevo, un reto y un encuentro físico en el atelier. La agenda llega a tu correo antes que a Instagram.',
  },
  {
    Icon: Drop,
    title: 'Café del',
    italic: 'productor',
    body: 'Los segundos viernes recibimos a una huerta o productor aliado. Conoces de dónde viene lo que comes y cocinamos algo juntos.',
  },
  {
    Icon: Spark,
    title: 'Drops',
    italic: 'limitados',
    body: 'Recetas de temporada que solo aparecen unas semanas al año. Las anunciamos primero a la comunidad — los demás se enteran después.',
  },
];

export default function CommunityPage() {
  return (
    <div className="min-h-screen pt-24 bg-[#F9F7F2]">
      <Navbar />
      <CartDrawer />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* ── Editorial header ──────────────────────────────────────────── */}
        <header className="pt-12 md:pt-20 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-8">
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-3 text-serana-terracotta font-bold tracking-[0.4em] uppercase text-[10px] mb-5"
              >
                <span className="w-10 h-px bg-serana-terracotta/60" />
                Atelier Serana · Comunidad · Edición {editionNumber}
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="font-serif text-serana-forest text-5xl md:text-6xl lg:text-[5.5rem] leading-[0.92] tracking-tight"
              >
                Más que un menú.
                <br />
                Una <span className="italic text-serana-olive">forma de juntarnos</span>.
              </motion.h1>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-4 lg:pt-12"
            >
              <p className="text-base text-serana-forest/70 font-light leading-relaxed border-l border-serana-forest/15 pl-5 max-w-sm">
                Retos cortos, encuentros lentos y conversaciones con quienes cultivan lo que comemos. Aquí entras como cliente y te quedas como vecino.
              </p>
              <div className="mt-5 flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-serana-forest/50 font-bold">
                <span>Mar — Sáb</span>
                <span className="w-1 h-1 rounded-full bg-serana-forest/30" />
                <span>10 — 18 h</span>
                <span className="w-1 h-1 rounded-full bg-serana-forest/30" />
                <span>Bogotá</span>
              </div>
            </motion.div>
          </div>
        </header>

        {/* ── Stats strip ───────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-3 divide-x divide-serana-forest/10 bg-white border border-serana-forest/8 rounded-2xl overflow-hidden mb-16"
        >
          {STATS.map((s) => (
            <div key={s.label} className="px-5 sm:px-8 py-6 text-center">
              <p className="font-serif italic text-3xl md:text-4xl text-serana-forest tracking-tight">
                {s.number}
              </p>
              <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] font-bold text-serana-forest/55 mt-2">
                {s.label}
              </p>
            </div>
          ))}
        </motion.section>

        <SectionDivider variant="brush" />

        {/* ── Events / Rituales ─────────────────────────────────────────── */}
        <section className="my-12 md:my-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 items-end">
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-3 text-serana-olive font-bold tracking-[0.4em] uppercase text-[10px] mb-4">
                <span className="w-10 h-px bg-serana-olive/60" />
                Próximos encuentros
              </span>
              <h2 className="font-serif text-serana-forest text-3xl md:text-5xl tracking-tight leading-tight">
                Tres formas de entrar
                <br />
                <span className="italic text-serana-ochre">en la conversación</span>.
              </h2>
            </div>
            <p className="lg:col-span-5 text-sm text-serana-forest/65 font-light leading-relaxed border-l border-serana-forest/15 pl-5 max-w-md">
              Pequeños grupos, agendas claras y un lugar al que volver. Lo que pasa aquí no se transmite por Instagram.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {EVENTS.map((event, i) => {
              const Icon = event.Icon;
              return (
                <motion.article
                  key={event.number}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="group relative bg-white border border-serana-forest/8 rounded-[1.6rem] overflow-hidden hover:border-serana-forest/20 transition-colors"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-serana-forest/40 via-transparent to-transparent" />
                    <span className="absolute top-4 left-4 px-2.5 py-1 bg-serana-cream/90 backdrop-blur-sm rounded text-[9px] font-black uppercase tracking-widest text-serana-forest">
                      {event.date}
                    </span>
                  </div>

                  <div className="p-7 relative">
                    <span
                      aria-hidden
                      className="absolute -top-3 right-5 font-serif italic text-[5rem] leading-none text-serana-forest/5 group-hover:text-serana-forest/12 transition-colors select-none pointer-events-none"
                    >
                      {event.number}
                    </span>

                    <div className="flex items-center gap-3 mb-4 relative z-10">
                      <div className="w-10 h-10 rounded-xl border border-serana-forest/15 flex items-center justify-center text-serana-olive">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-serana-terracotta">
                        {event.kicker}
                      </span>
                    </div>

                    <h3 className="font-serif text-2xl text-serana-forest leading-tight tracking-tight relative z-10">
                      {event.title} <span className="italic text-serana-olive">{event.italic}</span>.
                    </h3>
                    <p className="mt-4 text-sm text-serana-forest/70 font-light leading-relaxed relative z-10">
                      {event.body}
                    </p>

                    <button
                      type="button"
                      className="mt-6 inline-flex items-center gap-2 text-serana-forest font-bold text-[10px] uppercase tracking-[0.3em] hover:text-serana-terracotta transition-colors group/btn relative z-10"
                    >
                      {event.cta}
                      <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </section>

        <SectionDivider label="Rituales del atelier" />

        {/* ── Rituales ──────────────────────────────────────────────────── */}
        <section className="my-12 md:my-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {RITUALS.map((r, i) => {
              const Icon = r.Icon;
              const number = String(i + 1).padStart(2, '0');
              return (
                <motion.article
                  key={r.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="group relative bg-white border border-serana-forest/8 rounded-[1.6rem] p-7 overflow-hidden hover:border-serana-forest/20 transition-colors"
                >
                  <span
                    aria-hidden
                    className="absolute -top-3 right-5 font-serif italic text-[5rem] leading-none text-serana-forest/5 group-hover:text-serana-forest/12 transition-colors select-none pointer-events-none"
                  >
                    {number}
                  </span>

                  <div className="w-11 h-11 rounded-xl border border-serana-forest/15 flex items-center justify-center text-serana-olive mb-5 relative z-10">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-2xl text-serana-forest leading-tight tracking-tight relative z-10">
                    {r.title} <span className="italic text-serana-olive">{r.italic}</span>.
                  </h3>
                  <p className="mt-4 text-sm text-serana-forest/70 font-light leading-relaxed relative z-10">
                    {r.body}
                  </p>
                </motion.article>
              );
            })}
          </div>
        </section>

        <SectionDivider />

        {/* ── Editorial story / "comparte tu historia" ──────────────────── */}
        <section className="my-12 md:my-24">
          <div className="grid md:grid-cols-12 gap-10 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="md:col-span-5 relative"
            >
              <div
                className="relative aspect-[4/5] overflow-hidden border-[3px] border-white/60 shadow-2xl"
                style={{ borderRadius: '40% 60% 65% 35% / 40% 35% 65% 60%' }}
              >
                <img
                  src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=1000"
                  alt="Compartir comida en el atelier"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-serana-forest/30 to-transparent pointer-events-none" />
              </div>
              <div className="absolute -bottom-6 -right-4 hidden md:flex items-center gap-3 bg-serana-forest text-serana-cream rounded-full px-4 py-2 shadow-xl">
                <SerenaMark className="w-5 h-5 text-serana-ochre" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">
                  Cuaderno · Comunidad
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="md:col-span-7"
            >
              <span className="inline-flex items-center gap-3 text-serana-olive font-bold tracking-[0.4em] uppercase text-[10px] mb-4">
                <span className="w-10 h-px bg-serana-olive/60" />
                Cuaderno abierto
              </span>
              <h2 className="font-serif text-serana-forest text-4xl md:text-5xl leading-[0.95] tracking-tight">
                Cuéntanos qué te
                <br />
                <span className="italic text-serana-ochre">cambió comer así</span>.
              </h2>
              <p className="mt-6 text-serana-forest/70 font-light leading-relaxed text-base max-w-md">
                Estamos armando el primer cuaderno físico de Serana — historias reales de personas que cambiaron su relación con la comida. Si la tuya cabe ahí, queremos escucharla.
              </p>
              <p className="mt-3 text-serana-forest/55 font-light text-sm max-w-md italic">
                Las historias seleccionadas reciben un detalle de la edición y aparecen, si quieres, con tu nombre.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <a
                  href="mailto:contacto@serana.co?subject=Mi%20historia%20Serana"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-serana-forest text-serana-cream rounded-full transition-all hover:bg-serana-olive hover:-translate-y-0.5 font-sans font-bold tracking-widest text-[11px] uppercase shadow-lg"
                >
                  Comparte tu historia
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="https://www.instagram.com/serana.ac"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-serana-forest/20 text-serana-forest rounded-full font-sans font-medium tracking-widest text-[11px] uppercase hover:bg-serana-forest/5 transition-all"
                >
                  Síguenos · @serana.ac
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        <SectionDivider variant="brush" />

        {/* ── Closing CTA ───────────────────────────────────────────────── */}
        <section className="my-12 md:my-24">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-serana-forest text-serana-cream">
            <div className="absolute inset-0 pointer-events-none opacity-[0.07]">
              <svg
                viewBox="0 0 600 400"
                preserveAspectRatio="none"
                className="w-full h-full text-serana-cream"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              >
                <path d="M-20 320 C 120 250, 240 360, 380 290 C 480 240, 560 320, 620 270" />
                <path d="M-20 360 C 100 320, 240 380, 380 340 C 500 310, 560 360, 620 330" opacity="0.65" />
                <path d="M-20 280 C 130 200, 260 320, 380 240 C 500 180, 560 280, 620 220" opacity="0.4" />
              </svg>
            </div>

            <div className="relative z-10 p-10 md:p-14 lg:p-20 text-center">
              <SerenaMark className="w-10 h-10 text-serana-ochre mx-auto mb-6" />
              <span className="inline-flex items-center gap-3 text-serana-ochre font-bold tracking-[0.4em] uppercase text-[10px] mb-5">
                Te esperamos
              </span>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[0.95] max-w-3xl mx-auto">
                Una mesa larga,
                <br />
                <span className="italic text-serana-ochre">muchos plates</span>.
              </h2>
              <p className="mt-6 text-base text-serana-cream/70 font-light leading-relaxed max-w-xl mx-auto">
                La comunidad Serana se construye un domingo a la vez. Empieza por probar el menú, después te invitamos al primer encuentro.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/shop"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-serana-ochre text-serana-forest rounded-full transition-all hover:shadow-xl hover:-translate-y-0.5 font-sans font-bold tracking-widest text-[11px] uppercase"
                >
                  Ver el menú
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-serana-cream/30 text-serana-cream rounded-full font-sans font-medium tracking-widest text-[11px] uppercase hover:bg-serana-cream/10 transition-all"
                >
                  Conocer el atelier
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
