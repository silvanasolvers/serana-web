import Navbar from '../components/Navbar';
import CartDrawer from '../components/CartDrawer';
import Footer from '../components/Footer';
import { motion } from 'motion/react';
import { Leaf, Heart, Sparkles, Clock, Sprout, Recycle } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-32 bg-[#F9F7F2]">
      <Navbar />
      <CartDrawer />
      
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">

        {/* ═══ PANEL 1 — Nuestra Esencia ═══ */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-24"
        >
          <span className="text-serana-terracotta font-bold tracking-[0.3em] uppercase text-xs mb-6 block">Nuestra Esencia</span>
          <h1 className="text-5xl md:text-7xl font-serif text-serana-forest mb-8 leading-tight">
            Bienestar con <br />
            <span className="italic text-serana-olive">consciencia y cariño</span>
          </h1>
          <p className="max-w-3xl mx-auto text-lg text-serana-forest/80 leading-relaxed font-light">
            Serana nace para hacer del bienestar una experiencia más simple, deliciosa y consciente, con alimentos frescos y un cuidado que se siente.
          </p>
        </motion.div>

        {/* ═══ PANEL 2 — Lo que hacemos / Hacia dónde vamos ═══ */}
        <div className="grid md:grid-cols-2 gap-12 mb-32">
          <motion.div 
            whileHover={{ y: -10 }}
            className="bg-white p-10 rounded-[2rem] shadow-sm border border-serana-forest/5 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-serana-olive/10 rounded-bl-[100px] -mr-10 -mt-10 transition-all duration-500 group-hover:scale-150"></div>
            <h3 className="text-serana-ochre font-bold tracking-widest uppercase text-xs mb-4">Lo que hacemos</h3>
            <h2 className="text-3xl font-serif text-serana-forest mb-6">
              Hacemos que comer bien se sienta más <span className="italic">fácil, fresco y consciente</span>
            </h2>
            <p className="text-serana-forest/70 leading-relaxed">
              Creamos opciones prácticas y deliciosas que simplifican tu día sin desconectarte de lo que te hace bien.
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -10 }}
            className="bg-white p-10 rounded-[2rem] shadow-sm border border-serana-forest/5 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-serana-terracotta/10 rounded-bl-[100px] -mr-10 -mt-10 transition-all duration-500 group-hover:scale-150"></div>
            <h3 className="text-serana-terracotta font-bold tracking-widest uppercase text-xs mb-4">Hacia dónde vamos</h3>
            <h2 className="text-3xl font-serif text-serana-forest mb-6">
              Queremos inspirar una forma más <span className="italic">sana, práctica y sostenible</span> de alimentarse
            </h2>
            <p className="text-serana-forest/70 leading-relaxed">
              Soñamos con una cultura donde nutrirse bien sea parte natural de la rutina y no un esfuerzo extraordinario.
            </p>
          </motion.div>
        </div>

        {/* ═══ PANEL 3 — Valores Insignia ═══ */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-serana-forest mb-4">Valores Insignia</h2>
            <p className="text-serana-forest/60 font-light">Los principios que dan forma a cada experiencia Serana.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Leaf,
                title: "Consciencia",
                desc: "Elegimos con intención: lo que ofrecemos, cómo lo hacemos y el impacto que dejamos en cada paso.",
                micro: "Elegir Serana es elegir consciencia.",
                color: "text-serana-olive",
                bg: "bg-serana-olive/10"
              },
              {
                icon: Heart,
                title: "Bienestar Integral",
                desc: "Creemos en una alimentación que no solo nutre el cuerpo, sino que también aporta una mejor forma de vivir el día.",
                micro: "Comer bien también es sentirse bien.",
                color: "text-serana-terracotta",
                bg: "bg-serana-terracotta/10"
              },
              {
                icon: Sparkles,
                title: "Cuidado en cada detalle",
                desc: "Desde la preparación hasta la entrega, cuidamos cada punto de contacto para que la experiencia se sienta tan bien como el producto.",
                micro: "El cuidado se nota.",
                color: "text-serana-ochre",
                bg: "bg-serana-ochre/10"
              }
            ].map((val, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-3xl text-center hover:shadow-lg transition-all duration-300 border border-transparent hover:border-serana-forest/5"
              >
                <div className={`w-16 h-16 mx-auto ${val.bg} ${val.color} rounded-full flex items-center justify-center mb-6`}>
                  <val.icon size={32} strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-serif text-serana-forest mb-4">{val.title}</h3>
                <p className="text-serana-forest/70 mb-6 leading-relaxed text-sm">
                  {val.desc}
                </p>
                <div className="text-xs font-bold tracking-wider uppercase text-serana-forest/40 border-t border-serana-forest/5 pt-4">
                  {val.micro}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ═══ PANEL 4 — Cultura Serana ═══ */}
        <section className="mb-20">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Lado izquierdo: Imagen real y potente */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-serana-forest/10 rounded-[2rem] blur-2xl transform -translate-x-4 translate-y-4"></div>
              <img loading="lazy" 
                src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=800" 
                alt="Manos preparando alimentos frescos" 
                className="rounded-[2rem] shadow-2xl relative z-10 w-full aspect-[4/5] object-cover"
              />
            </motion.div>

            {/* Lado derecho: Título + párrafo + 3 principios */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-serif text-serana-forest mb-6 leading-tight">
                Cultura <span className="italic text-serana-ochre">Serana</span>
              </h2>
              <p className="text-serana-forest/70 font-light leading-relaxed mb-10 text-base">
                Nuestra cultura nace del equilibrio entre practicidad, consciencia e innovación. Así convertimos el bienestar en una experiencia más simple, cuidada y contemporánea.
              </p>
              
              <div className="space-y-8">
                {[
                  {
                    icon: Clock,
                    title: "Practicidad Premium",
                    desc: "Creamos soluciones que simplifican tu rutina sin sacrificar calidad, frescura ni experiencia."
                  },
                  {
                    icon: Sprout,
                    title: "Innovación Consciente",
                    desc: "Exploramos nuevas formas de nutrir, combinando funcionalidad, sabor y una mirada más inteligente sobre el bienestar."
                  },
                  {
                    icon: Recycle,
                    title: "Sostenibilidad",
                    desc: "Buscamos decisiones más responsables en lo que elegimos, en cómo operamos y en el impacto que dejamos."
                  }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 }}
                    className="flex gap-4"
                  >
                    <div className="mt-1 text-serana-olive bg-serana-olive/10 p-2.5 rounded-xl shrink-0 h-fit">
                      <item.icon size={22} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h4 className="font-serif text-xl text-serana-forest mb-2">{item.title}</h4>
                      <p className="text-serana-forest/70 font-light leading-relaxed text-sm">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  );
}
