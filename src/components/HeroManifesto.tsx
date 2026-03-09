import { motion } from 'motion/react';

export default function HeroManifesto() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center px-6 py-20 overflow-hidden">
      <div className="max-w-6xl mx-auto text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <span className="font-sans text-sm md:text-base tracking-[0.3em] uppercase text-serana-olive mb-6 block">
            The Manifesto
          </span>
          <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl leading-[0.9] text-serana-forest mb-8">
            Conscious <br />
            <span className="italic font-light text-serana-terracotta">Well-being</span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="max-w-2xl mx-auto"
        >
          <p className="font-sans text-lg md:text-xl text-serana-forest/80 leading-relaxed font-light">
            Redefining nutrition through purity, purpose, and connection. 
            We believe that what you consume shapes your reality.
          </p>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-serana-olive pointer-events-none"
      />
    </section>
  );
}
