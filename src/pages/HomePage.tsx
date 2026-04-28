import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ValueProposition from '../components/ValueProposition';
import B2BSection from '../components/B2BSection';
import WellnessQuiz from '../components/WellnessQuiz';
import LoyaltySection from '../components/LoyaltySection';
import CommunityPoll from '../components/CommunityPoll';
import CartDrawer from '../components/CartDrawer';
import Footer from '../components/Footer';
import VideoSection from '../components/VideoSection';
import SectionDivider from '../components/SectionDivider';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <CartDrawer />
      <main>
        {/* Panel 1 — Hero (Me atrae) */}
        <Hero />

        <SectionDivider label="Filosofía" />

        {/* Panel 2 — Filosofía (Me identifico) */}
        <ValueProposition />

        <SectionDivider variant="brush" />

        {/* Panel 3 — Experiencia / Calidad real (Confío) */}
        <VideoSection />

        {/* Panel 4 — Diagnóstico personalizado (Siento que puede ser para mí) */}
        <WellnessQuiz />

        <SectionDivider label="Club Serana" />

        {/* Panel 5 — Club Serana (Veo razones para quedarme) */}
        <LoyaltySection />

        {/* Panel 6 — Comunidad activa (Siento que puedo participar) */}
        <section className="py-12 md:py-16 px-6 bg-serana-cream/50 relative overflow-hidden">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8 md:mb-10">
              <span className="inline-block text-serana-olive font-bold tracking-[0.2em] uppercase text-xs mb-3 border border-serana-olive/20 px-4 py-1.5 rounded-full">
                Comunidad Activa
              </span>
              <h2 className="text-3xl md:text-4xl font-serif text-serana-forest mb-4">
                Serana también se <span className="italic text-serana-ochre">construye contigo</span>
              </h2>
              <p className="text-sm md:text-base text-serana-forest/70 max-w-lg mx-auto font-light">
                Tu opinión sí transforma el menú. Participa en las decisiones semanales y sé parte de la evolución de Serana.
              </p>
            </div>
            <div className="flex justify-center mb-6">
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-serana-forest text-serana-cream rounded-full font-sans font-medium tracking-widest text-[10px] uppercase hover:bg-serana-olive transition-all hover:shadow-lg hover:-translate-y-0.5">
                Participar ahora
              </button>
            </div>
            <CommunityPoll />
          </div>
        </section>

        {/* Panel 7 — Historia de impacto (Entiendo que hay algo más grande detrás) */}
        <section className="py-16 md:py-24 px-6 relative z-10 bg-serana-cream/50">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row rounded-[2rem] overflow-hidden shadow-2xl bg-serana-forest text-serana-cream">
            <div className="w-full md:w-1/2 h-[40vh] md:h-auto relative order-2 md:order-1">
              <div className="absolute inset-0 bg-serana-forest/20 mix-blend-multiply z-10" />
              <img loading="lazy" 
                src="https://qlgjqvgjuscquhspjqdp.supabase.co/storage/v1/object/public/AETHERA-DOCS/serana%20campo.png" 
                alt="Campo colombiano" 
                className="absolute inset-0 w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-12 lg:p-16 order-1 md:order-2">
              <div className="max-w-md mx-auto md:mx-0">
                <span className="inline-block text-serana-ochre font-bold tracking-[0.2em] uppercase text-xs mb-6 border border-serana-ochre/20 px-4 py-2 rounded-full">
                  Desde el origen
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif mb-6 leading-tight">
                  Cada bocado cuenta una <br className="hidden lg:block" />
                  <span className="italic text-serana-ochre">historia de impacto</span>.
                </h2>
                <p className="text-base md:text-lg text-serana-cream/80 leading-relaxed font-light">
                  En Serana creemos que nutrir bien también implica elegir con más consciencia lo que hay detrás de cada ingrediente, su origen, sus manos y la forma en que llega hasta tu mesa.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Panel 8 — CTA Final (Actúo) */}
        <section className="py-20 md:py-28 px-6 bg-serana-forest relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-15">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-serana-olive rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-serana-ochre rounded-full blur-[100px]" />
          </div>

          <div className="max-w-3xl mx-auto text-center relative z-10">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block text-serana-ochre font-bold tracking-[0.2em] uppercase text-[10px] mb-4 border border-serana-ochre/20 px-4 py-1.5 rounded-full"
            >
              Empieza hoy
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl lg:text-6xl font-serif text-serana-cream mb-6 leading-tight"
            >
              Tu cuerpo merece <br />
              <span className="italic text-serana-ochre">lo que Serana prepara para ti</span>.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-base md:text-lg text-serana-cream/70 font-light leading-relaxed max-w-xl mx-auto mb-10"
            >
              Explora el menú, elige lo que resuene contigo y deja que Serana se convierta en parte de tu rutina de bienestar.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/shop"
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-serana-ochre text-serana-forest rounded-full overflow-hidden transition-all hover:shadow-xl hover:-translate-y-0.5"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                <span className="relative font-sans font-bold tracking-widest text-[11px] uppercase z-10">Ver Menú</span>
                <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/about"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-serana-cream/30 text-serana-cream rounded-full font-sans font-medium tracking-widest text-[11px] uppercase hover:bg-serana-cream/10 transition-all"
              >
                Conoce nuestra historia
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Panel 9 — Soluciones Corporativas (Bajado al final) */}
        <B2BSection />
      </main>
      
      <Footer />
    </div>
  );
}
