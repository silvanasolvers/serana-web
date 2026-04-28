import { Link } from 'react-router-dom';
import { CreditCard, Lock, ShieldCheck, Phone } from 'lucide-react';

export default function Footer() {
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
            <p className="max-w-sm opacity-50 text-[10px] uppercase tracking-widest mt-4 leading-relaxed">
              Serana Wellness S.A.S.
              <br />Bogotá, Colombia
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
