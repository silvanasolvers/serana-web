import { useState } from 'react';
import { motion } from 'motion/react';
import { Check, BarChart3, Users } from 'lucide-react';
import { captureLead } from '../lib/api/leads';

const POLL = {
  question: "¿Qué ingrediente te gustaría ver en el próximo menú?",
  options: [
    { id: 'matcha', label: "Matcha Ceremonial", votes: 120 },
    { id: 'cacao', label: "Cacao Puro", votes: 85 },
    { id: 'spirulina', label: "Spirulina Azul", votes: 45 },
    { id: 'maca', label: "Maca Andina", votes: 60 }
  ]
};

export default function CommunityPoll() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [pollData, setPollData] = useState(POLL);

  const handleVote = (optionId: string) => {
    if (hasVoted) return;

    setPollData(prev => ({
      ...prev,
      options: prev.options.map(opt =>
        opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
      )
    }));
    setSelectedOption(optionId);
    setHasVoted(true);

    // Anonymous signal — useful for marketing without spamming the user with
    // a sign-up prompt for a one-question poll.
    void captureLead({
      channel: 'community_poll',
      message: `Voto: ${pollData.options.find(o => o.id === optionId)?.label ?? optionId}`,
      metadata: {
        poll_question: pollData.question,
        choice: optionId,
      },
    });
  };

  const totalVotes = pollData.options.reduce((acc, curr) => acc + curr.votes, 0);

  return (
    <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-lg relative overflow-hidden border border-serana-forest/5">
      <div className="absolute top-0 right-0 w-48 h-48 bg-serana-olive/10 rounded-full blur-[60px] -z-10" />
      
      <div className="flex items-center justify-between mb-4">
        <span className="inline-flex items-center gap-2 text-serana-forest font-bold tracking-[0.2em] uppercase text-[10px] border border-serana-forest/20 px-3 py-1.5 rounded-full bg-serana-forest/5">
          <BarChart3 size={12} /> Tu Voz Importa
        </span>
        <span className="text-[10px] text-serana-forest/50 font-mono flex items-center gap-1">
          <Users size={10} /> {totalVotes} votos
        </span>
      </div>

      <h3 className="text-xl md:text-2xl font-serif text-serana-forest mb-6 leading-tight">
        {pollData.question}
      </h3>

      <div className="space-y-2">
        {pollData.options.map((option) => {
          const percentage = Math.round((option.votes / totalVotes) * 100);
          const isSelected = selectedOption === option.id;

          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={hasVoted}
              className={`relative w-full text-left p-3 rounded-xl border transition-all duration-500 overflow-hidden group ${
                hasVoted 
                  ? isSelected 
                    ? 'border-serana-olive bg-serana-olive/5 ring-1 ring-serana-olive ring-offset-1' 
                    : 'border-transparent bg-serana-cream/30 opacity-60'
                  : 'border-serana-forest/10 hover:border-serana-olive hover:bg-serana-cream/50'
              }`}
            >
              {/* Progress Bar Background */}
              {hasVoted && (
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`absolute top-0 left-0 h-full ${isSelected ? 'bg-serana-olive/20' : 'bg-serana-forest/5'} -z-10`}
                />
              )}

              <div className="flex justify-between items-center relative z-10">
                <span className={`font-medium text-sm ${isSelected ? 'text-serana-olive font-bold' : 'text-serana-forest'}`}>
                  {option.label}
                </span>
                
                {hasVoted && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="font-mono text-xs font-bold text-serana-forest/70"
                  >
                    {percentage}%
                  </motion.span>
                )}
                
                {!hasVoted && (
                  <div className="w-5 h-5 rounded-full border border-serana-forest/20 flex items-center justify-center group-hover:border-serana-olive group-hover:bg-serana-olive group-hover:text-white transition-all">
                    <Check size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
      
      {hasVoted && (
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center text-xs text-serana-forest/60 italic"
        >
          ¡Gracias por votar! Los resultados se anunciarán en nuestro próximo Live.
        </motion.p>
      )}
    </div>
  );
}
