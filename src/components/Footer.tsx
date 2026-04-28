import { Link } from 'react-router-dom';
import { useState } from 'react';
import { CreditCard, Lock, ShieldCheck, Phone, Send, Check, Loader2 } from 'lucide-react';
import { captureLead } from '../lib/api/leads';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending' || status === 'sent') return;
    const trimmed = email.trim();
    if (!/^.+@.+\..+$/.test(trimmed)) {
      setStatus('error');
      return;
    }
    setStatus('sending');
    const id = await captureLead({
      channel: 'newsletter',
      email: trimmed,
      metadata: { source: 'footer' },
    });
    setStatus(id ? 'sent' : 'error');
  };

  return (
    <footer className="bg-serana-forest text-serana-cream pt-16 pb-8 px-6 overflow-hidden relative">
      {/* Decorative large text */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-5 pointer-events-none select-none flex items-center justify-center">
         <img 
            src="https://qlgjqvgjuscquhspjqdp.supabase.co/storage/v1/object/public/AETHERA-DOCS/ELEMENTOS.png" 
            alt="Serana Elements" 
            className="w-[120%] max-w-none object-cover opacity-30 mix-blend-overlay rotate-180"
         />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Trust strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-10 mb-10 border-b border-serana-cream/10">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-serana-ochre shrink-0" />
            <span className="text-[10px] uppercase tracking-widest opacity-70 leading-snug">Pago seguro<br />SSL + Mercado Pago</span>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-serana-ochre shrink-0" />
            <span className="text-[10px] uppercase tracking-widest opacity-70 leading-snug">Datos protegidos<br />ley 1581 / 2012</span>
          </div>
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-serana-ochre shrink-0" />
            <span className="text-[10px] uppercase tracking-widest opacity-70 leading-snug">Tarjeta · PSE · Nequi<br />Efectivo · Transferencia</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-serana-ochre shrink-0" />
            <span className="text-[10px] uppercase tracking-widest opacity-70 leading-snug">Soporte WhatsApp<br />Lun a Sáb · 8am – 6pm</span>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <Link to="/" className="text-3xl font-serif font-bold mb-4 block tracking-tighter">Serana.</Link>
            <p className="max-w-sm opacity-70 font-light text-sm leading-relaxed">
              Hacer de Colombia un país que come mejor, con consciencia y satisfacción.
            </p>

            {/* Visit block — boutique signal */}
            <div className="mt-6 inline-block border-l-2 border-serana-ochre/60 pl-4 py-1">
              <p className="text-serana-ochre font-bold tracking-[0.4em] uppercase text-[9px] mb-2">
                Visítanos
              </p>
              <p className="font-serif text-base leading-tight text-serana-cream">
                Cra · Bogotá, Colombia
              </p>
              <p className="text-[11px] mt-1 opacity-70 leading-snug">
                Martes a sábado <span className="opacity-60">·</span> 10 am — 6 pm
              </p>
            </div>

            <p className="max-w-sm opacity-50 text-[10px] uppercase tracking-widest mt-6 leading-relaxed">
              Serana Wellness S.A.S.
              <br />contacto@serana.co
            </p>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-[0.2em] text-[10px] mb-4 text-serana-ochre">Explorar</h4>
            <ul className="space-y-2.5 text-xs tracking-wide">
              <li><Link to="/shop" className="hover:text-serana-ochre transition-colors">Menú</Link></li>
              <li><Link to="/shop?filter=subscription" className="hover:text-serana-ochre transition-colors">Suscripciones</Link></li>
              <li><Link to="/about" className="hover:text-serana-ochre transition-colors">Nuestra Historia</Link></li>
              <li><Link to="/community" className="hover:text-serana-ochre transition-colors">Comunidad</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-[0.2em] text-[10px] mb-4 text-serana-ochre">Conectar</h4>
            <ul className="space-y-2.5 text-xs tracking-wide">
              <li><a href="https://www.instagram.com/serana.ac?igsh=bXhwYnprcnR2M25r" target="_blank" rel="noopener noreferrer" className="hover:text-serana-ochre transition-colors">Instagram</a></li>
              <li><a href="https://wa.me/573000000000" target="_blank" rel="noopener noreferrer" className="hover:text-serana-ochre transition-colors">WhatsApp</a></li>
              <li><a href="mailto:contacto@serana.co" className="hover:text-serana-ochre transition-colors">contacto@serana.co</a></li>
              <li><Link to="/community" className="hover:text-serana-ochre transition-colors">FAQ</Link></li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mb-12 bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="md:flex-1">
              <h4 className="font-serif text-lg mb-1">Recibe recetas + descuentos en tu correo</h4>
              <p className="text-[11px] text-serana-cream/60 leading-snug">
                Sin spam. Cancelas con un clic. Datos tratados según la Ley 1581/2012.
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'sending' || status === 'sent'}
                className="bg-serana-cream/10 border border-white/10 rounded-full px-4 py-2.5 text-sm text-serana-cream placeholder-serana-cream/40 focus:outline-none focus:border-serana-ochre transition w-full sm:w-64"
              />
              <button
                type="submit"
                disabled={status === 'sending' || status === 'sent'}
                className="bg-serana-ochre text-serana-forest px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white transition-colors disabled:opacity-60"
              >
                {status === 'sending' ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Enviando…</>
                ) : status === 'sent' ? (
                  <><Check className="w-4 h-4" /> ¡Listo!</>
                ) : (
                  <><Send className="w-4 h-4" /> Suscribir</>
                )}
              </button>
            </form>
          </div>
          {status === 'error' && (
            <p className="text-[11px] text-rose-300 mt-3">Revisa tu correo e intenta de nuevo.</p>
          )}
        </div>

        <div className="border-t border-serana-cream/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] uppercase tracking-widest opacity-50">
          <p>© {new Date().getFullYear()} Serana Wellness S.A.S. — Todos los derechos reservados.</p>
          <div className="flex flex-wrap gap-6 justify-center">
            <Link to="/privacidad" className="hover:text-white">Política de Privacidad</Link>
            <Link to="/terminos" className="hover:text-white">Términos y Condiciones</Link>
            <Link to="/devoluciones" className="hover:text-white">Devoluciones</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
