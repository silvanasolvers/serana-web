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

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <CartDrawer />
      <main>
        <Hero />
        <ValueProposition />
        
        {/* Loyalty Focus - Main Feed */}
        <LoyaltySection />
        
        <WellnessQuiz />
        <B2BSection />
        
        {/* Video Section */}
        <VideoSection />
        
        {/* Community Poll Section */}
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
        
        {/* About Teaser */}
        <section className="py-16 md:py-24 px-6 relative z-10 bg-serana-cream/50">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row rounded-[2rem] overflow-hidden shadow-2xl bg-serana-forest text-serana-cream">
            <div className="w-full md:w-1/2 h-[40vh] md:h-auto relative order-2 md:order-1">
              <div className="absolute inset-0 bg-serana-forest/20 mix-blend-multiply z-10" />
              <img 
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
      </main>
      
      <Footer />
    </div>
  );
}
