import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Check, Sparkles, ChevronRight, Loader2 } from 'lucide-react';
import { captureLead } from '../lib/api/leads';

const QUESTIONS = [
  {
    id: 'goal',
    question: "¿Cuál es tu principal objetivo de bienestar hoy?",
    options: [
      { id: 'energy', label: "Aumentar mi energía", icon: "⚡" },
      { id: 'calm', label: "Reducir el estrés", icon: "🌿" },
      { id: 'balance', label: "Mejorar mi digestión", icon: "🍎" },
      { id: 'focus', label: "Mayor enfoque mental", icon: "🧠" }
    ]
  },
  {
    id: 'time',
    question: "¿Cuánto tiempo tienes para cocinar?",
    options: [
      { id: 'none', label: "Cero tiempo (Lo quiero listo)", icon: "⏱️" },
      { id: 'little', label: "15-20 minutos", icon: "🍳" },
      { id: 'weekend', label: "Solo los fines de semana", icon: "📅" }
    ]
  },
  {
    id: 'diet',
    question: "¿Sigues alguna preferencia alimentaria?",
    options: [
      { id: 'omni', label: "Como de todo", icon: "🍽️" },
      { id: 'veggie', label: "Vegetariano/Vegano", icon: "🥦" },
      { id: 'keto', label: "Keto / Low Carb", icon: "🥑" },
      { id: 'gluten', label: "Sin Gluten", icon: "🌾" }
    ]
  }
];

export default function WellnessQuiz() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [contact, setContact] = useState({ name: '', phone: '' });
  const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  // Captura anónima del recorrido apenas el usuario termina, así no perdemos
  // la señal aunque cierre la pestaña antes de dar contacto.
  useEffect(() => {
    if (!isCompleted) return;
    void captureLead({
      channel: 'wellness_quiz',
      metadata: { answers, completed_at: new Date().toISOString(), contact_provided: false },
    });
  }, [isCompleted, answers]);

  const handleOptionSelect = (optionId: string) => {
    setAnswers(prev => ({ ...prev, [QUESTIONS[currentStep].id]: optionId }));

    if (currentStep < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentStep(prev => prev + 1), 300);
    } else {
      setTimeout(() => setIsCompleted(true), 300);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (contactStatus === 'sending' || contactStatus === 'sent') return;
    const phoneDigits = contact.phone.replace(/\D/g, '');
    if (phoneDigits.length < 7 || contact.name.trim().length < 2) {
      setContactStatus('error');
      return;
    }
    setContactStatus('sending');
    const id = await captureLead({
      channel: 'wellness_quiz',
      full_name: contact.name.trim(),
      phone: phoneDigits,
      metadata: { answers, contact_provided: true },
    });
    setContactStatus(id ? 'sent' : 'error');
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setAnswers({});
    setIsCompleted(false);
    setContact({ name: '', phone: '' });
    setContactStatus('idle');
  };

  return (
    <section className="py-16 px-6 bg-serana-forest text-serana-cream relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-serana-olive rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-serana-terracotta rounded-full blur-[100px]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <span className="inline-block text-serana-ochre font-bold tracking-[0.2em] uppercase text-[10px] mb-3 border border-serana-ochre/20 px-3 py-1.5 rounded-full">
            Guía Personalizada
          </span>
          <h2 className="text-3xl md:text-4xl font-serif mb-4 leading-tight">
            Descubre tu <span className="italic text-serana-ochre">Ritual Ideal</span>
          </h2>
          {!isCompleted && (
            <p className="text-serana-cream/70 max-w-lg mx-auto font-light text-sm">
              En menos de un minuto te guiamos hacia la experiencia Serana que mejor conecta con cómo quieres sentirte hoy.
            </p>
          )}
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-[2rem] p-6 md:p-10 border border-white/10 shadow-xl min-h-[350px] flex items-center justify-center relative overflow-hidden">
          <AnimatePresence mode="wait">
            {!isCompleted ? (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-xl"
              >
                <div className="flex justify-between items-center mb-6 text-[10px] font-bold tracking-widest uppercase text-serana-cream/40">
                  <span>Pregunta {currentStep + 1} de {QUESTIONS.length}</span>
                  <div className="flex gap-2">
                    {QUESTIONS.map((_, idx) => (
                      <div 
                        key={idx} 
                        className={`h-1 w-6 rounded-full transition-colors duration-300 ${idx <= currentStep ? 'bg-serana-ochre' : 'bg-white/10'}`}
                      />
                    ))}
                  </div>
                </div>

                <h3 className="text-xl md:text-2xl font-serif mb-8 text-center leading-snug">
                  {QUESTIONS[currentStep].question}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {QUESTIONS[currentStep].options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleOptionSelect(option.id)}
                      className="group flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-serana-ochre hover:text-serana-forest border border-white/10 hover:border-serana-ochre transition-all duration-300 text-left"
                    >
                      <span className="text-xl group-hover:scale-110 transition-transform duration-300">{option.icon}</span>
                      <span className="font-medium text-sm">{option.label}</span>
                      <ChevronRight className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" size={16} />
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center w-full"
              >
                <div className="w-16 h-16 bg-serana-ochre rounded-full flex items-center justify-center mx-auto mb-6 text-serana-forest shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                  <Sparkles size={32} />
                </div>
                <h3 className="text-2xl md:text-3xl font-serif mb-3">
                  ¡Tu plan ideal es <span className="text-serana-ochre italic">Energía Matutina</span>!
                </h3>
                <p className="text-serana-cream/80 text-base mb-8 max-w-md mx-auto leading-relaxed">
                  Basado en tus respuestas, necesitas un impulso de vitalidad que se adapte a tu agenda ocupada.
                </p>

                {contactStatus !== 'sent' ? (
                  <form
                    onSubmit={handleContactSubmit}
                    className="max-w-md mx-auto bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 text-left space-y-3"
                  >
                    <p className="text-[11px] uppercase tracking-widest text-serana-ochre font-bold">
                      Recibe tu plan completo por WhatsApp
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        required
                        placeholder="Nombre"
                        value={contact.name}
                        onChange={(e) => setContact((p) => ({ ...p, name: e.target.value }))}
                        disabled={contactStatus === 'sending'}
                        className="bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-serana-cream placeholder-serana-cream/40 focus:outline-none focus:border-serana-ochre transition"
                      />
                      <input
                        type="tel"
                        required
                        placeholder="Celular WhatsApp"
                        value={contact.phone}
                        onChange={(e) => setContact((p) => ({ ...p, phone: e.target.value }))}
                        disabled={contactStatus === 'sending'}
                        className="bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-serana-cream placeholder-serana-cream/40 focus:outline-none focus:border-serana-ochre transition"
                      />
                    </div>
                    {contactStatus === 'error' && (
                      <p className="text-[11px] text-rose-300">Revisa tus datos: nombre y celular válidos.</p>
                    )}
                    <div className="flex flex-col md:flex-row gap-3">
                      <button
                        type="submit"
                        disabled={contactStatus === 'sending'}
                        className="flex-1 bg-serana-ochre text-serana-forest px-6 py-3 rounded-full font-bold hover:bg-white transition-colors shadow-lg flex items-center justify-center gap-2 text-sm disabled:opacity-60"
                      >
                        {contactStatus === 'sending' ? (
                          <><Loader2 size={16} className="animate-spin" /> Enviando…</>
                        ) : (
                          <>Recibir mi plan <ArrowRight size={16} /></>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={resetQuiz}
                        className="px-6 py-3 rounded-full font-bold border border-white/20 hover:bg-white/10 transition-colors text-xs uppercase tracking-wide"
                      >
                        Volver a empezar
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="max-w-md mx-auto bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 mb-6 flex items-center gap-3 text-emerald-100">
                    <Check className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium leading-snug text-left">
                      ¡Listo! Te enviaremos tu plan personalizado por WhatsApp en las próximas horas.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
