import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="relative min-h-[60vh] flex items-center bg-[#F9F7F2] overflow-hidden pt-20 pb-10 px-4 md:px-8">
      
      {/* Dynamic Background - More Visible & Organic */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -right-[10%] w-[35vw] h-[35vw] bg-[#5F6C37] opacity-15 rounded-full blur-[80px] mix-blend-multiply"
        />
        <motion.div 
          animate={{ 
            x: [0, -50, 0],
            y: [0, 80, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[30%] -left-[10%] w-[30vw] h-[30vw] bg-[#BC6C25] opacity-10 rounded-full blur-[100px] mix-blend-multiply"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-[10%] right-[20%] w-[35vw] h-[35vw] bg-[#DCA15D] opacity-15 rounded-full blur-[80px] mix-blend-multiply"
        />
      </div>

      <div className="max-w-[1000px] mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Text Content - Overlapping & Bold */}
          <div className="lg:col-span-7 relative z-20 order-2 lg:order-1">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="w-8 h-[2px] bg-[#BC6C25]"></span>
                <span className="text-[#BC6C25] font-sans text-[9px] font-bold tracking-[0.3em] uppercase">
                  Alimentación Consciente
                </span>
              </div>

              <h1 className="font-serif text-3xl md:text-5xl lg:text-[4rem] text-[#273617] leading-[0.95] mb-3 tracking-tight">
                Nutrición <br />
                <span className="relative inline-block text-[#5F6C37] pr-4">
                  <span className="font-semibold not-italic">Qué</span>{" "}
                  <span className="italic font-normal">se siente</span>
                  <motion.svg 
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className="absolute -bottom-1 left-0 w-full h-3 text-[#DCA15D]" 
                    viewBox="0 0 300 20" 
                    fill="none"
                  >
                     <path d="M5 15 Q 150 5 295 15" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  </motion.svg>
                </span>
              </h1>

              <p className="text-sm md:text-base text-[#273617]/80 font-light leading-relaxed max-w-md mb-5 ml-1">
                En Serana transformamos ingredientes reales en experiencias que nutren tu cuerpo, elevan tu energía y acompañan tu ritmo de vida.
              </p>

              <div className="flex flex-wrap gap-3 ml-1">
                <Link 
                  to="/shop" 
                  className="group relative inline-flex items-center gap-2 px-5 py-2.5 bg-[#273617] text-[#F9F7F2] rounded-full overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                  <div className="absolute inset-0 bg-[#5F6C37] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                  <span className="relative font-sans font-medium tracking-widest text-[9px] uppercase z-10">Ver Menú</span>
                  <ArrowRight size={14} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link 
                  to="/about"
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-[#273617] font-sans font-medium tracking-widest text-[9px] uppercase hover:text-[#BC6C25] transition-colors"
                >
                  Conoce Serana
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Image - Organic Shape Mask */}
          <div className="lg:col-span-5 relative z-10 order-1 lg:order-2 mb-4 lg:mb-0 flex justify-center lg:justify-end">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="relative w-full max-w-[280px] lg:max-w-[350px]"
            >
              {/* Main Image Container with Organic Radius */}
              <motion.div 
                animate={{ 
                  borderRadius: [
                    "30% 70% 70% 30% / 30% 30% 70% 70%",
                    "58% 42% 75% 25% / 76% 46% 54% 24%",
                    "50% 50% 33% 67% / 55% 27% 73% 45%",
                    "30% 70% 70% 30% / 30% 30% 70% 70%"
                  ],
                  rotate: [0, 4, -4, 0]
                }}
                transition={{ 
                  duration: 12, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="relative w-full aspect-[4/5] overflow-hidden shadow-xl border-[3px] border-white/50"
              >
                <motion.img 
                  animate={{ scale: [1.1, 1.2, 1.1] }}
                  transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1760&auto=format&fit=crop" 
                  alt="Healthy Bowl" 
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#273617]/20 to-transparent pointer-events-none" />
              </motion.div>

              {/* Floating Badge */}
              <motion.div 
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-8 -left-8 w-40 h-40 bg-[#F9F7F2] rounded-full p-3 shadow-xl flex items-center justify-center hidden md:flex"
              >
                <div className="w-full h-full rounded-full border border-[#273617]/10 flex items-center justify-center relative">
                   <svg className="absolute inset-0 w-full h-full animate-spin-slow" viewBox="0 0 100 100">
                      <path id="circlePath" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" fill="none" />
                      <text className="text-[11px] uppercase font-bold tracking-[0.15em] fill-[#273617]">
                        <textPath href="#circlePath" startOffset="0%">
                          100% Orgánico • Natural • Fresco •
                        </textPath>
                      </text>
                   </svg>
                   <span className="font-serif text-4xl text-[#BC6C25] italic">S</span>
                </div>
              </motion.div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
