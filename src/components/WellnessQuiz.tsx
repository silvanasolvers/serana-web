import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Check, Sparkles, ChevronRight } from 'lucide-react';

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

  const handleOptionSelect = (optionId: string) => {
    setAnswers(prev => ({ ...prev, [QUESTIONS[currentStep].id]: optionId }));
    
    if (currentStep < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentStep(prev => prev + 1), 300);
    } else {
      setTimeout(() => setIsCompleted(true), 300);
    }
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setAnswers({});
    setIsCompleted(false);
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
            Diagnóstico Personalizado
          </span>
          <h2 className="text-3xl md:text-4xl font-serif mb-4 leading-tight">
            Descubre tu <span className="italic text-serana-ochre">Ritual Ideal</span>
          </h2>
          {!isCompleted && (
            <p className="text-serana-cream/70 max-w-lg mx-auto font-light text-sm">
              Responde 3 preguntas rápidas y te recomendaremos el plan perfecto para tu cuerpo y estilo de vida.
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
                
                <div className="flex flex-col md:flex-row gap-3 justify-center">
                  <button className="bg-serana-ochre text-serana-forest px-6 py-3 rounded-full font-bold hover:bg-white transition-colors shadow-lg hover:scale-105 flex items-center justify-center gap-2 text-sm">
                    Ver Mi Plan Personalizado <ArrowRight size={16} />
                  </button>
                  <button 
                    onClick={resetQuiz}
                    className="px-6 py-3 rounded-full font-bold border border-white/20 hover:bg-white/10 transition-colors text-xs uppercase tracking-wide"
                  >
                    Volver a empezar
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
