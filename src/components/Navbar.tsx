import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCartStore } from '../store/useCartStore';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import clsx from 'clsx';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const { scrollY } = useScroll();
  
  // Simplified professional navbar state

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Menú', path: '/shop' },
    { name: 'Nosotros', path: '/about' },
    { name: 'Comunidad', path: '/community' },
  ];

  return (
    <motion.nav
      className={clsx(
        "fixed top-0 left-0 right-0 z-50 px-6 transition-all duration-500 border-b",
        isScrolled 
          ? "bg-serana-cream backdrop-blur-md border-serana-forest/5 py-3 shadow-sm" 
          : "bg-serana-cream border-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="relative group block z-50">
          <img 
            src="https://qlgjqvgjuscquhspjqdp.supabase.co/storage/v1/object/public/AETHERA-DOCS/LOGO%20PRINCIPAL-07.png" 
            alt="Serana Logo" 
            className={clsx(
              "w-auto object-contain transition-all duration-500",
              isScrolled ? "h-18 md:h-22" : "h-28 md:h-32"
            )} 
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-12">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="relative text-serana-forest font-medium text-xs tracking-[0.15em] uppercase hover:text-serana-olive transition-colors group py-2"
            >
              {link.name}
              <span className="absolute bottom-0 left-0 w-full h-[1px] bg-serana-olive scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            </Link>
          ))}
        </div>

        <div className="flex items-center space-x-6">
          <button
            onClick={toggleCart}
            className="relative p-2 text-serana-forest hover:text-serana-olive transition-colors group"
          >
            <ShoppingCart size={22} strokeWidth={1.5} />
            <span className="absolute inset-0 bg-serana-forest/5 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></span>
            {cartCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-serana-terracotta text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
              >
                {cartCount}
              </motion.span>
            )}
          </button>
          
          <button 
            className="md:hidden p-2 text-serana-forest"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-serana-cream z-[60] flex flex-col p-8 md:hidden"
          >
            <div className="flex justify-between items-center mb-16">
              <img 
                src="https://qlgjqvgjuscquhspjqdp.supabase.co/storage/v1/object/public/AETHERA-DOCS/LOGO%20PRINCIPAL-07.png" 
                alt="Serana Logo" 
                className="h-12 w-auto object-contain" 
              />
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2">
                <X size={28} className="text-serana-forest" strokeWidth={1.5} />
              </button>
            </div>
            
            <div className="flex flex-col space-y-6 items-center justify-center flex-1">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + (i * 0.05) }}
                >
                  <Link
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-3xl font-serif text-serana-forest hover:text-serana-olive transition-colors"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
