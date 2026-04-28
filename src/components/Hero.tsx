import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const today = new Date();
const editionNumber = String(((today.getMonth() + 1) % 12) + 1).padStart(2, '0'); // simple monthly counter

export default function Hero() {
  return (
    <section className="relative min-h-[60vh] flex items-center bg-[#F9F7F2] overflow-hidden pt-36 md:pt-40 pb-12 px-4 md:px-8">
      {/* Editorial corner ornaments — quiet, no animation */}
      <CornerSprig className="absolute -top-2 right-2 lg:right-6 w-32 lg:w-44 text-serana-olive/12 pointer-events-none" />
      <CornerSprig
        className="absolute -bottom-2 left-2 lg:left-6 w-24 lg:w-32 text-serana-terracotta/10 pointer-events-none"
        flipped
      />

      <div className="max-w-[1100px] mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Text Content */}
          <div className="lg:col-span-7 relative z-20 order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="w-10 h-px bg-[#BC6C25]"></span>
                <span className="text-[#BC6C25] font-sans text-[9px] font-bold tracking-[0.4em] uppercase">
                  Mercado Serana · Bogotá · Edición {editionNumber}
                </span>
              </div>

              <h1 className="font-serif text-3xl md:text-5xl lg:text-[4.2rem] text-[#273617] leading-[0.95] mb-4 tracking-tight">
                Nutrición <br />
                <span className="relative inline-block text-[#5F6C37] pr-4">
                  <span className="font-semibold not-italic">Qué</span>{' '}
                  <span className="italic font-normal">se siente</span>
                  <motion.svg
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.2, delay: 0.4, ease: [0.65, 0, 0.35, 1] }}
                    className="absolute -bottom-1 left-0 w-full h-3 text-[#DCA15D]"
                    viewBox="0 0 300 20"
                    fill="none"
                  >
                    <path d="M5 15 Q 150 5 295 15" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  </motion.svg>
                </span>
              </h1>

              <p className="text-sm md:text-base text-[#273617]/80 font-light leading-relaxed max-w-md mb-7 ml-1">
                Cocina honesta, ingredientes reales y un menú que cambia con la temporada. Hecho en Bogotá, para acompañar tu semana.
              </p>

              <div className="flex flex-wrap items-center gap-4 ml-1">
                <Link
                  to="/shop"
                  className="group relative inline-flex items-center gap-2 px-6 py-3 bg-[#273617] text-[#F9F7F2] rounded-full overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                  <div className="absolute inset-0 bg-[#5F6C37] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                  <span className="relative font-sans font-bold tracking-[0.3em] text-[10px] uppercase z-10">
                    Ver Menú
                  </span>
                  <ArrowRight size={14} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 text-[#273617] font-sans font-medium tracking-[0.3em] text-[10px] uppercase hover:text-[#BC6C25] transition-colors border-b border-[#273617]/20 hover:border-[#BC6C25] pb-1"
                >
                  Conoce Serana
                </Link>
              </div>

              {/* Hours strip — restraint, in Spanish */}
              <div className="mt-10 flex items-center gap-4 text-[#273617]/55 text-[9px] font-bold tracking-[0.4em] uppercase">
                <span>Mar — Sáb</span>
                <span className="w-1 h-1 rounded-full bg-[#273617]/30" />
                <span>10am — 6pm</span>
                <span className="w-1 h-1 rounded-full bg-[#273617]/30" />
                <span>Cra · Bogotá</span>
              </div>
            </motion.div>
          </div>

          {/* Image */}
          <div className="lg:col-span-5 relative z-10 order-1 lg:order-2 mb-4 lg:mb-0 flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-[300px] lg:max-w-[360px]"
            >
              {/* Static organic shape — sober */}
              <div
                className="relative w-full aspect-[4/5] overflow-hidden shadow-xl border-[3px] border-white/50"
                style={{ borderRadius: '40% 60% 65% 35% / 40% 35% 65% 60%' }}
              >
                <img
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1760&auto=format&fit=crop"
                  alt="Bowl Serana"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#273617]/25 to-transparent pointer-events-none" />
              </div>

              {/* Signature rotating seal — kept, but slowed */}
              <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-[#F9F7F2] rounded-full p-3 shadow-xl items-center justify-center hidden md:flex">
                <div className="w-full h-full rounded-full border border-[#273617]/10 flex items-center justify-center relative">
                  <svg className="absolute inset-0 w-full h-full animate-spin-slow" viewBox="0 0 100 100">
                    <path
                      id="circlePath"
                      d="M 50, 50 m -42, 0 a 42,42 0 1,1 84,0 a 42,42 0 1,1 -84,0"
                      fill="none"
                    />
                    <text className="text-[10px] uppercase font-bold tracking-[0.08em] fill-[#273617]">
                      <textPath href="#circlePath" startOffset="0%">
                        Serana · Mercado consciente · Hecho en Bogotá ·
                      </textPath>
                    </text>
                  </svg>
                  <span className="font-serif text-4xl text-[#BC6C25] italic">S</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CornerSprig({ className, flipped = false }: { className?: string; flipped?: boolean }) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ transform: flipped ? 'scaleX(-1) scaleY(-1)' : undefined }}
      aria-hidden
    >
      <path d="M170 30 C 130 60, 95 95, 70 140 C 60 160, 55 180, 60 195" strokeWidth="1.6" />
      {[
        { x: 160, y: 38, len: 36, rot: -28 },
        { x: 140, y: 58, len: 32, rot: -22 },
        { x: 120, y: 80, len: 30, rot: -18 },
        { x: 100, y: 105, len: 30, rot: -10 },
        { x: 84, y: 130, len: 28, rot: 0 },
        { x: 72, y: 156, len: 26, rot: 12 },
      ].map((leaf, i) => (
        <g key={i} transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.rot})`}>
          <path
            d={`M0 0 C ${leaf.len * 0.4} ${-leaf.len * 0.25}, ${leaf.len * 0.85} ${-leaf.len * 0.15}, ${leaf.len} 0 C ${leaf.len * 0.85} ${leaf.len * 0.15}, ${leaf.len * 0.4} ${leaf.len * 0.25}, 0 0 Z`}
          />
          <path d={`M0 0 L ${leaf.len} 0`} strokeWidth="0.9" opacity="0.5" />
        </g>
      ))}
    </svg>
  );
}
