import Navbar from '../components/Navbar';
import CartDrawer from '../components/CartDrawer';
import Footer from '../components/Footer';
import { Calendar, Users, Heart, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function CommunityPage() {
  const events = [
    {
      title: "Reto Detox de 7 Días",
      date: "15 Oct",
      description: "Una semana para reiniciar tu sistema digestivo con guías diarias y apoyo grupal.",
      icon: <Calendar className="w-6 h-6 text-serana-terracotta" />,
      image: "https://images.unsplash.com/photo-1544367563-12123d8965cd?auto=format&fit=crop&q=80&w=600"
    },
    {
      title: "Webinar: Nutrición para el Flow",
      date: "22 Oct",
      description: "Aprende a combinar alimentos para mantener el enfoque durante tu jornada laboral.",
      icon: <Users className="w-6 h-6 text-serana-olive" />,
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=600"
    },
    {
      title: "Círculo de Bienestar",
      date: "Cada Domingo",
      description: "Sesiones de meditación y mindfulness exclusivas para suscriptores.",
      icon: <Heart className="w-6 h-6 text-serana-ochre" />,
      image: "https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?auto=format&fit=crop&q=80&w=600"
    }
  ];

  return (
    <div className="min-h-screen pt-32">
      <Navbar />
      <CartDrawer />
      
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <div className="text-center mb-24">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-serana-terracotta font-bold tracking-[0.3em] uppercase text-xs mb-6 block"
          >
            El Ecosistema
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-serif text-serana-forest mb-8"
          >
            Comunidad <span className="italic text-serana-olive">Serana</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-serana-forest/70 max-w-2xl mx-auto font-light leading-relaxed"
          >
            Más que una tienda, somos un movimiento. Únete a nuestros retos, eventos y círculos.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-32">
          {events.map((event, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2, duration: 0.8 }}
              className="group relative bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500"
            >
              <div className="h-48 overflow-hidden relative">
                <img src={event.image} alt={event.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-serana-forest/20 group-hover:bg-serana-forest/0 transition-colors duration-500"></div>
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-serana-forest">
                  {event.date}
                </div>
              </div>
              
              <div className="p-8">
                <div className="bg-serana-cream w-12 h-12 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  {event.icon}
                </div>
                <h3 className="text-2xl font-serif text-serana-forest mb-4 group-hover:text-serana-olive transition-colors">{event.title}</h3>
                <p className="text-serana-forest/70 text-sm leading-relaxed mb-6 font-light">{event.description}</p>
                <button className="flex items-center gap-2 text-serana-forest font-bold text-xs uppercase tracking-widest hover:text-serana-terracotta transition-colors group/btn">
                  Unirse al Evento <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-serana-forest rounded-[3rem] p-12 md:p-24 text-center text-serana-cream relative overflow-hidden"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at center, #FEFADF 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">¿Tienes una historia de transformación?</h2>
            <p className="mb-10 opacity-80 text-lg font-light leading-relaxed">
              Nos encanta escuchar cómo Serana ha impactado tu vida. Comparte tu historia y recibe un regalo especial en tu próxima caja.
            </p>
            <button className="bg-serana-ochre text-serana-forest px-10 py-4 rounded-full font-bold hover:bg-white transition-all shadow-lg hover:scale-105">
              Comparte Tu Historia
            </button>
          </div>
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
}
