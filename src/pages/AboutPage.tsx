import Navbar from '../components/Navbar';
import CartDrawer from '../components/CartDrawer';
import Footer from '../components/Footer';
import { motion, useScroll, useTransform } from 'motion/react';
import { Leaf, Heart, Sparkles, Clock, Sprout, Recycle } from 'lucide-react';

export default function AboutPage() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -100]);

  return (
    <div className="min-h-screen pt-32 bg-[#F9F7F2]">
      <Navbar />
      <CartDrawer />
      
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-24"
        >
          <span className="text-serana-terracotta font-bold tracking-[0.3em] uppercase text-xs mb-6 block">Nuestra Esencia</span>
          <h1 className="text-5xl md:text-7xl font-serif text-serana-forest mb-8 leading-tight">
            Bienestar con <br />
            <span className="italic text-serana-olive">Consciencia y Cariño</span>
          </h1>
          <p className="max-w-3xl mx-auto text-lg text-serana-forest/80 leading-relaxed font-light">
            Tu aliado en alimentación consciente. Facilitamos tu bienestar con alimentos frescos, naturales y una experiencia Prime.
          </p>
        </motion.div>

        {/* Mission & Vision Section */}
        <div className="grid md:grid-cols-2 gap-12 mb-32">
          <motion.div 
            whileHover={{ y: -10 }}
            className="bg-white p-10 rounded-[2rem] shadow-sm border border-serana-forest/5 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-serana-olive/10 rounded-bl-[100px] -mr-10 -mt-10 transition-all duration-500 group-hover:scale-150"></div>
            <h3 className="text-serana-ochre font-bold tracking-widest uppercase text-xs mb-4">Nuestra Misión</h3>
            <h2 className="text-3xl font-serif text-serana-forest mb-6">
              Comer bien nunca fue tan <span className="italic">fácil, fresco y consciente.</span>
            </h2>
            <p className="text-serana-forest/70 leading-relaxed">
              Transformamos tu alimentación en bienestar consciente. Combos frescos y nutritivos, entregados con dedicación.
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -10 }}
            className="bg-white p-10 rounded-[2rem] shadow-sm border border-serana-forest/5 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-serana-terracotta/10 rounded-bl-[100px] -mr-10 -mt-10 transition-all duration-500 group-hover:scale-150"></div>
            <h3 className="text-serana-terracotta font-bold tracking-widest uppercase text-xs mb-4">Nuestra Visión</h3>
            <h2 className="text-3xl font-serif text-serana-forest mb-6">
              Inspirar una vida más <span className="italic">sana, práctica y sostenible.</span>
            </h2>
            <p className="text-serana-forest/70 leading-relaxed">
              Ser el referente de alimentación consciente en Colombia. Convertimos cada comida en una experiencia de bienestar y satisfacción.
            </p>
          </motion.div>
        </div>

        {/* Flagship Values Section */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-serana-forest mb-4">Valores Insignia</h2>
            <p className="text-serana-forest/60">Los pilares que sostienen nuestra promesa.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Leaf,
                title: "Consciencia",
                desc: "Alimentación presente y responsable: contigo, tu salud y el planeta.",
                micro: "Elegir SERANA es elegir consciencia.",
                color: "text-serana-olive",
                bg: "bg-serana-olive/10"
              },
              {
                icon: Heart,
                title: "Bienestar Integral",
                desc: "Más que nutrición: experiencias que aportan calma, energía y satisfacción.",
                micro: "Comer bien es sentirte bien.",
                color: "text-serana-terracotta",
                bg: "bg-serana-terracotta/10"
              },
              {
                icon: Sparkles,
                title: "Amor en el Detalle",
                desc: "Preparación y entrega con dedicación. Lo pequeño hace la gran diferencia.",
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

        {/* Complementary Values & Image Section */}
        <div className="space-y-32">
          <section className="grid md:grid-cols-2 gap-20 items-center">
            <motion.div style={{ y: y1 }} className="relative">
              <div className="absolute inset-0 bg-serana-forest/10 rounded-full blur-3xl transform -translate-x-10 translate-y-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1595855709940-5105711e9383?auto=format&fit=crop&q=80&w=800" 
                alt="Hands holding soil" 
                className="rounded-[3rem] shadow-2xl relative z-10 rotate-2 hover:rotate-0 transition-transform duration-700"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-serif text-serana-forest mb-12 leading-tight">
                Cultura <br /><span className="italic text-serana-ochre">Serana</span>
              </h2>
              
              <div className="space-y-8">
                {[
                  {
                    icon: Clock,
                    title: "Practicidad Premium",
                    desc: "Soluciones prácticas que simplifican tu vida sin sacrificar calidad."
                  },
                  {
                    icon: Sprout,
                    title: "Innovación Consciente",
                    desc: "Nuevas formas de nutrir. Equilibrio perfecto entre lo moderno y lo natural."
                  },
                  {
                    icon: Recycle,
                    title: "Sostenibilidad",
                    desc: "Consumo responsable. Trabajamos para que cada elección tenga un impacto positivo."
                  }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1 text-serana-olive">
                      <item.icon size={24} />
                    </div>
                    <div>
                      <h4 className="font-serif text-xl text-serana-forest mb-2">{item.title}</h4>
                      <p className="text-serana-forest/70 font-light leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </section>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
