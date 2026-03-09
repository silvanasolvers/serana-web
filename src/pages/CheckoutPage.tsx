import React, { useState } from 'react';
import { useCartStore } from '../store/useCartStore';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'motion/react';
import { CheckCircle, CreditCard, Truck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore();
  const [step, setStep] = useState<'form' | 'success'>('form');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate processing
    setTimeout(() => {
      setStep('success');
      clearCart();
    }, 1500);
  };

  if (items.length === 0 && step === 'form') {
    return (
      <div className="min-h-screen pt-32">
        <Navbar />
        <div className="max-w-md mx-auto text-center px-6 py-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h2 className="text-4xl font-serif text-serana-forest mb-6">Your cart is empty</h2>
            <p className="text-gray-600 mb-8 font-light">It seems you haven't selected your ritual yet.</p>
            <Link to="/shop" className="inline-flex items-center gap-2 text-serana-terracotta font-bold tracking-widest uppercase text-xs hover:text-serana-ochre transition-colors border-b border-serana-terracotta/30 pb-1">
              <ArrowLeft size={14} /> Return to Market
            </Link>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-12">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {step === 'form' ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-2 gap-16"
          >
            {/* Form Section */}
            <div>
              <div className="mb-12">
                <span className="text-serana-terracotta font-bold tracking-[0.3em] uppercase text-xs mb-4 block">
                  Final Step
                </span>
                <h1 className="text-5xl font-serif text-serana-forest mb-4">Complete Ritual</h1>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-12">
                <section>
                  <h2 className="text-2xl font-serif text-serana-forest mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-serana-forest text-serana-cream flex items-center justify-center text-sm font-sans font-bold">1</span>
                    Shipping Details
                  </h2>
                  <div className="grid grid-cols-2 gap-6">
                    <input required placeholder="First Name" className="col-span-1 p-4 rounded-xl border border-serana-forest/10 bg-white/50 focus:bg-white focus:border-serana-forest/30 outline-none transition-all" />
                    <input required placeholder="Last Name" className="col-span-1 p-4 rounded-xl border border-serana-forest/10 bg-white/50 focus:bg-white focus:border-serana-forest/30 outline-none transition-all" />
                    <input required placeholder="Address" className="col-span-2 p-4 rounded-xl border border-serana-forest/10 bg-white/50 focus:bg-white focus:border-serana-forest/30 outline-none transition-all" />
                    <input required placeholder="City" className="col-span-1 p-4 rounded-xl border border-serana-forest/10 bg-white/50 focus:bg-white focus:border-serana-forest/30 outline-none transition-all" />
                    <input required placeholder="Postal Code" className="col-span-1 p-4 rounded-xl border border-serana-forest/10 bg-white/50 focus:bg-white focus:border-serana-forest/30 outline-none transition-all" />
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-serif text-serana-forest mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-serana-forest text-serana-cream flex items-center justify-center text-sm font-sans font-bold">2</span>
                    Payment Method
                  </h2>
                  <div className="space-y-6">
                    <input required placeholder="Card Number" className="w-full p-4 rounded-xl border border-serana-forest/10 bg-white/50 focus:bg-white focus:border-serana-forest/30 outline-none transition-all" />
                    <div className="grid grid-cols-2 gap-6">
                      <input required placeholder="MM/YY" className="p-4 rounded-xl border border-serana-forest/10 bg-white/50 focus:bg-white focus:border-serana-forest/30 outline-none transition-all" />
                      <input required placeholder="CVC" className="p-4 rounded-xl border border-serana-forest/10 bg-white/50 focus:bg-white focus:border-serana-forest/30 outline-none transition-all" />
                    </div>
                  </div>
                </section>

                <button 
                  type="submit"
                  className="w-full bg-serana-forest text-serana-cream py-5 rounded-full font-bold text-lg hover:bg-serana-olive transition-all shadow-xl hover:scale-[1.02]"
                >
                  Confirm & Pay {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(total())}
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:pl-12">
              <div className="bg-white/60 backdrop-blur-md p-10 rounded-[2rem] shadow-sm border border-serana-forest/5 sticky top-32">
                <h2 className="text-2xl font-serif text-serana-forest mb-8">Order Summary</h2>
                <div className="space-y-6 mb-8 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-6 items-center group">
                      <div className="w-20 h-20 rounded-xl overflow-hidden shadow-sm">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-serif text-lg text-serana-forest leading-tight mb-1">{item.name}</h4>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-serana-forest">
                        {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-serana-forest/10 pt-6 space-y-3">
                  <div className="flex justify-between text-gray-600 font-light">
                    <span>Subtotal</span>
                    <span>
                      {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(total())}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600 font-light">
                    <span>Shipping</span>
                    <span className="text-serana-olive font-medium">Free</span>
                  </div>
                  <div className="flex justify-between text-2xl font-serif text-serana-forest pt-4 border-t border-serana-forest/10 mt-4">
                    <span>Total</span>
                    <span>
                      {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(total())}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl mx-auto text-center py-24"
          >
            <div className="w-32 h-32 bg-serana-olive/10 rounded-full flex items-center justify-center mx-auto mb-8 relative">
              <motion.div 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }} 
                transition={{ delay: 0.2, type: "spring" }}
                className="bg-serana-olive text-white p-6 rounded-full shadow-xl"
              >
                <CheckCircle size={48} />
              </motion.div>
              <motion.div 
                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 bg-serana-olive/20 rounded-full"
              />
            </div>
            
            <h1 className="text-5xl md:text-6xl font-serif text-serana-forest mb-6">Order Confirmed</h1>
            <p className="text-xl text-gray-600 mb-12 font-light leading-relaxed">
              Thank you for choosing Serana. Your ritual of well-being is being prepared with care and will arrive shortly.
            </p>
            <Link 
              to="/" 
              className="inline-block bg-serana-forest text-serana-cream px-10 py-4 rounded-full font-bold hover:bg-serana-olive transition-colors shadow-lg"
            >
              Return Home
            </Link>
          </motion.div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
