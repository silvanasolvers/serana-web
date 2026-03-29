import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, Users, Copy, Check, Sparkles } from 'lucide-react';
import { products } from '../data/products';

export default function LoyaltySection() {
  const [copied, setCopied] = useState(false);
  const referralCode = "SERANA-AMIGOS";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rewardExamples = products.filter(p => ['jugo-verde', 'ensalada-cesar', 'baby-bowl-berry'].includes(p.id));

  return (
    <section className="py-16 px-6 bg-serana-cream relative overflow-hidden">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        
        {/* Left: Referral Program */}
        <div className="bg-white rounded-[1.5rem] p-6 md:p-8 shadow-lg relative overflow-hidden group border border-serana-forest/5">
          <div className="absolute top-0 right-0 w-20 h-20 bg-serana-ochre/10 rounded-bl-[60px] transition-transform duration-500 group-hover:scale-110" />
          
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 text-serana-terracotta font-bold tracking-[0.2em] uppercase text-[9px] mb-3 border border-serana-terracotta/20 px-2.5 py-1 rounded-full bg-serana-terracotta/5">
              <Users size={10} /> Programa de Referidos
            </span>
            
            <h3 className="text-2xl md:text-3xl font-serif text-serana-forest mb-3 leading-tight">
              Comparte Serana, <br />
              <span className="italic text-serana-olive">multiplica el bienestar</span>.
            </h3>
            
            <p className="text-serana-forest/70 mb-6 leading-relaxed font-light text-xs">
              Invita a un amigo a descubrir Serana y reciban un beneficio especial en su compra. Porque lo que te hace bien también merece compartirse.
            </p>

            <div className="bg-serana-forest/5 p-4 rounded-xl border border-serana-forest/10 flex flex-col sm:flex-row items-center justify-between gap-3 group-hover:border-serana-olive/30 transition-colors">
              <div className="text-center sm:text-left">
                <span className="text-[9px] uppercase tracking-widest text-serana-forest/60 block mb-0.5">Tu código para compartir</span>
                <code className="text-sm font-mono font-bold text-serana-forest tracking-wider">{referralCode}</code>
              </div>
              
              <button 
                onClick={handleCopy}
                className="bg-serana-forest text-serana-cream px-4 py-2 rounded-lg hover:bg-serana-olive transition-all active:scale-95 flex items-center gap-2 shadow-sm hover:shadow-md w-full sm:w-auto justify-center"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span className="font-bold text-[10px] uppercase tracking-wide">{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Rewards Tiers */}
        <div className="relative">
          <div className="mb-6">
            <span className="inline-flex items-center gap-2 text-serana-olive font-bold tracking-[0.2em] uppercase text-[9px] mb-3 border border-serana-olive/20 px-2.5 py-1 rounded-full bg-serana-olive/5">
              <Gift size={10} /> Club Serana
            </span>
            <h3 className="text-2xl md:text-3xl font-serif text-serana-forest mb-3 leading-tight">
              Tu bienestar también <br /> merece <span className="italic text-serana-ochre">recompensa</span>.
            </h3>
            <p className="text-serana-forest/70 leading-relaxed font-light text-xs">
              Con cada compra acumula semillas que puedes convertir en beneficios, productos y experiencias pensadas para seguir acompañando tu bienestar.
            </p>
          </div>

          <div className="space-y-2.5 mb-6">
            {[
              { level: "Semilla", points: "0 - 500 pts", benefit: "Envíos gratis + Regalo de cumpleaños — Empieza a sumar beneficios desde tu primera compra", color: "bg-serana-cream border-serana-forest/10" },
              { level: "Brote", points: "500 - 1500 pts", benefit: "5% Cashback + Acceso anticipado a menús — Más puntos, más acceso y más razones para volver", color: "bg-white border-serana-olive/20 shadow-sm" },
              { level: "Cosecha", points: "1500+ pts", benefit: "10% Cashback + Eventos exclusivos + Sorpresas mensuales — Una experiencia premium para quienes hacen de Serana parte de su rutina", color: "bg-serana-forest text-serana-cream border-serana-forest shadow-lg scale-[1.02]" }
            ].map((tier, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className={`p-3.5 rounded-xl border flex items-center gap-3 ${tier.color}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${idx === 2 ? 'bg-serana-ochre text-serana-forest' : 'bg-serana-forest/5 text-serana-forest'}`}>
                  <Sparkles size={14} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="font-serif text-sm font-bold">{tier.level}</h4>
                    <span className={`text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-full ${idx === 2 ? 'bg-white/20' : 'bg-black/5'}`}>{tier.points}</span>
                  </div>
                  <p className={`text-[10px] ${idx === 2 ? 'opacity-90' : 'opacity-70'}`}>{tier.benefit}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Reward Examples */}
          <div>
            <h4 className="text-[9px] font-bold uppercase tracking-widest text-serana-forest/60 mb-2.5">Canjea por tus favoritos</h4>
            <div className="grid grid-cols-3 gap-2.5">
              {rewardExamples.map((product) => (
                <div key={product.id} className="bg-white p-2 rounded-lg border border-serana-forest/10 text-center shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-8 h-8 mx-auto rounded-full overflow-hidden mb-1.5">
                    <img loading="lazy" src={product.image} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <p className="text-[9px] font-bold text-serana-forest line-clamp-1">{product.name}</p>
                  <p className="text-[8px] text-serana-olive font-mono mt-0.5">500 pts</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
