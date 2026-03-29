import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

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
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <Link to="/" className="text-3xl font-serif font-bold mb-4 block tracking-tighter">Serana.</Link>
            <p className="max-w-sm opacity-70 font-light text-sm leading-relaxed">
              Hacer de Colombia un país que come mejor, con consciencia y satisfacción.
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
              <li><a href="#" className="hover:text-serana-ochre transition-colors">TikTok</a></li>
              <li><a href="#" className="hover:text-serana-ochre transition-colors">Contáctanos</a></li>
              <li><a href="#" className="hover:text-serana-ochre transition-colors">FAQ</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-serana-cream/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 opacity-50 text-[9px] uppercase tracking-widest">
          <p>© 2026 Serana Wellness. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Política de Privacidad</a>
            <a href="#" className="hover:text-white">Términos de Servicio</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
