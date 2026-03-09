import { motion } from 'motion/react';

const values = [
  {
    title: "Pureza",
    description: "Ingredientes sin procesar, directos de la tierra. Sin aditivos, sin compromisos.",
    color: "bg-serana-olive",
    textColor: "text-serana-cream"
  },
  {
    title: "Practicidad Premium",
    description: "Nutrición elevada que se adapta a tu ritmo de vida sin sacrificar calidad.",
    color: "bg-serana-ochre",
    textColor: "text-serana-forest"
  },
  {
    title: "Sostenibilidad",
    description: "Un ciclo de respeto: cuidamos de ti mientras cuidamos del planeta.",
    color: "bg-serana-terracotta",
    textColor: "text-serana-cream"
  }
];

export default function ValuesSection() {
  return (
    <section className="py-20 px-6 relative z-10">
      <div className="max-w-6xl mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif text-3xl md:text-4xl text-serana-forest mb-12 text-center"
        >
          Our Core Values
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.8 }}
              className={`relative group cursor-pointer overflow-hidden rounded-2xl p-6 h-[320px] flex flex-col justify-between transition-all duration-500 hover:shadow-lg border border-serana-forest/5 bg-white/40 backdrop-blur-sm hover:bg-white/60`}
            >
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full border border-serana-forest/20 flex items-center justify-center font-mono text-[10px] opacity-50">
                0{index + 1}
              </div>
              
              <h3 className="font-serif text-2xl text-serana-forest mt-8 group-hover:translate-y-[-5px] transition-transform duration-500">
                {value.title}
              </h3>
              
              <div className="relative overflow-hidden">
                <p className="font-sans text-sm text-serana-forest/70 leading-relaxed transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                  {value.description}
                </p>
                <div className={`h-1 w-10 mt-4 ${value.color.replace('bg-', 'bg-')} rounded-full`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
