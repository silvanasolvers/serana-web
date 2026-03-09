import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Building2, Users, Check, Send } from 'lucide-react';

export default function B2BSection() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    company: '',
    employees: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    // Mock submission
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <section className="py-16 px-6 bg-serana-forest text-serana-cream relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-serana-olive/10 skew-x-12 -translate-x-1/2" />
      
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Left: Value Prop */}
        <div>
          <span className="inline-flex items-center gap-2 text-serana-ochre font-bold tracking-[0.2em] uppercase text-[10px] mb-4 border border-serana-ochre/20 px-3 py-1.5 rounded-full bg-serana-ochre/5">
            <Building2 size={12} /> Soluciones Corporativas
          </span>
          
          <h2 className="text-3xl md:text-4xl font-serif mb-6 leading-tight">
            Nutrición que impulsa <br />
            <span className="italic text-serana-olive">equipos de alto rendimiento</span>.
          </h2>
          
          <p className="text-serana-cream/70 mb-8 leading-relaxed font-light text-sm">
            Ofrecemos planes de alimentación saludable para empresas, coworkings y gimnasios. Mejora la productividad y el bienestar de tu equipo con menús diseñados por expertos.
          </p>

          <ul className="space-y-3 mb-8">
            {[
              "Planes personalizados según objetivos",
              "Entregas diarias en oficina o remoto",
              "Talleres de bienestar y nutrición incluidos",
              "Facturación consolidada mensual"
            ].map((item, idx) => (
              <li key={idx} className="flex items-center gap-3 text-serana-cream/80 text-sm">
                <div className="w-5 h-5 rounded-full bg-serana-olive/20 flex items-center justify-center shrink-0">
                  <Check size={12} className="text-serana-olive" />
                </div>
                {item}
              </li>
            ))}
          </ul>

          <div className="flex gap-3">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-serana-forest bg-serana-cream overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="text-xs">
              <p className="font-bold text-serana-cream">Confían en nosotros</p>
              <p className="text-serana-cream/50">Más de 50 empresas</p>
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 md:p-8 rounded-2xl">
          <h3 className="text-xl font-serif mb-4">Solicita una propuesta</h3>
          
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-serana-cream/50 mb-1">Nombre</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-serana-cream focus:outline-none focus:border-serana-olive transition-colors"
                  value={formState.name}
                  onChange={(e) => setFormState({...formState, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-serana-cream/50 mb-1">Empresa</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-serana-cream focus:outline-none focus:border-serana-olive transition-colors"
                  value={formState.company}
                  onChange={(e) => setFormState({...formState, company: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-serana-cream/50 mb-1">Email</label>
                <input 
                  type="email" 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-serana-cream focus:outline-none focus:border-serana-olive transition-colors"
                  value={formState.email}
                  onChange={(e) => setFormState({...formState, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-serana-cream/50 mb-1">Empleados</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-serana-cream focus:outline-none focus:border-serana-olive transition-colors appearance-none"
                  value={formState.employees}
                  onChange={(e) => setFormState({...formState, employees: e.target.value})}
                >
                  <option value="" className="text-black">Seleccionar</option>
                  <option value="1-10" className="text-black">1-10</option>
                  <option value="11-50" className="text-black">11-50</option>
                  <option value="50+" className="text-black">50+</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-serana-cream/50 mb-1">Mensaje</label>
              <textarea 
                rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-serana-cream focus:outline-none focus:border-serana-olive transition-colors resize-none"
                value={formState.message}
                onChange={(e) => setFormState({...formState, message: e.target.value})}
              />
            </div>

            <button 
              type="submit"
              disabled={isSubmitted}
              className="w-full bg-serana-olive text-white py-3 rounded-lg font-bold uppercase tracking-wider hover:bg-serana-ochre transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
            >
              {isSubmitted ? (
                <>Enviado <Check size={16} /></>
              ) : (
                <>Enviar Solicitud <Send size={16} /></>
              )}
            </button>
          </form>
        </div>

      </div>
    </section>
  );
}
