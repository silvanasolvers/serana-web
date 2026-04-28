import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2, Check, Calendar as CalendarIcon } from 'lucide-react';
import { captureLead } from '../lib/api/leads';

export type EnrollEventInfo = {
  event_id: string;
  event_title: string;
  event_kicker: string;
  event_date: string;
  event_cta: string;
};

type Props = {
  open: boolean;
  event: EnrollEventInfo | null;
  onClose: () => void;
};

export default function EventEnrollModal({ open, event, onClose }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setStatus('idle');
    setErrorMsg(null);
  }, [open, event?.event_id]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || status === 'sending' || status === 'sent') return;
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (trimmedName.length < 2) {
      setErrorMsg('Cuéntanos tu nombre.');
      setStatus('error');
      return;
    }
    if (!/^.+@.+\..+$/.test(trimmedEmail)) {
      setErrorMsg('Revisa tu correo.');
      setStatus('error');
      return;
    }
    setStatus('sending');
    setErrorMsg(null);
    const id = await captureLead({
      channel: 'community_event',
      full_name: trimmedName,
      email: trimmedEmail,
      phone: phone.trim() ? phone.replace(/\D/g, '') : undefined,
      metadata: {
        event_id: event.event_id,
        event_title: event.event_title,
        event_kicker: event.event_kicker,
        event_date: event.event_date,
        event_cta: event.event_cta,
        submitted_at: new Date().toISOString(),
      },
    });
    if (id) {
      setStatus('sent');
    } else {
      setErrorMsg('No pudimos guardar tu inscripción. Intenta de nuevo.');
      setStatus('error');
    }
  };

  return (
    <AnimatePresence>
      {open && event && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-serana-forest/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 30, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="relative w-full max-w-md bg-serana-cream border border-serana-forest/10 rounded-3xl shadow-2xl shadow-serana-forest/30 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-serana-forest/5 hover:bg-serana-forest/10 flex items-center justify-center text-serana-forest/70 hover:text-serana-forest transition z-10"
            >
              <X className="w-4 h-4" strokeWidth={1.8} />
            </button>

            <div className="p-7 md:p-8">
              <span className="text-[10px] font-black uppercase tracking-[0.35em] text-serana-terracotta">
                {event.event_kicker}
              </span>
              <h3 className="font-serif text-2xl md:text-[1.7rem] text-serana-forest leading-tight mt-2 tracking-tight">
                {event.event_title}
              </h3>
              <p className="mt-3 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-serana-forest/65">
                <CalendarIcon className="w-3.5 h-3.5 text-serana-olive" strokeWidth={1.8} />
                {event.event_date}
              </p>

              {status === 'sent' ? (
                <div className="mt-7 text-center py-6">
                  <span className="inline-flex w-14 h-14 rounded-full bg-serana-olive/15 items-center justify-center text-serana-olive">
                    <Check className="w-7 h-7" strokeWidth={2} />
                  </span>
                  <p className="font-serif text-lg text-serana-forest mt-4">
                    Te apartamos un puesto.
                  </p>
                  <p className="text-sm text-serana-forest/65 mt-2 leading-snug">
                    Te escribimos al correo con los detalles del encuentro.
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-serana-forest text-serana-cream text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-serana-olive transition"
                  >
                    Cerrar
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-7 space-y-3">
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={status === 'sending'}
                    className="w-full bg-white border border-serana-forest/15 rounded-full px-5 py-3 text-sm text-serana-forest placeholder-serana-forest/40 focus:outline-none focus:border-serana-olive transition"
                  />
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === 'sending'}
                    className="w-full bg-white border border-serana-forest/15 rounded-full px-5 py-3 text-sm text-serana-forest placeholder-serana-forest/40 focus:outline-none focus:border-serana-olive transition"
                  />
                  <input
                    type="tel"
                    placeholder="WhatsApp (opcional)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={status === 'sending'}
                    className="w-full bg-white border border-serana-forest/15 rounded-full px-5 py-3 text-sm text-serana-forest placeholder-serana-forest/40 focus:outline-none focus:border-serana-olive transition"
                  />

                  {errorMsg && (
                    <p className="text-[12px] text-rose-600 px-2">{errorMsg}</p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="w-full mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-serana-forest text-serana-cream text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-serana-olive transition disabled:opacity-60"
                  >
                    {status === 'sending' ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Enviando…
                      </>
                    ) : (
                      <>{event.event_cta}</>
                    )}
                  </button>

                  <p className="text-[10px] text-serana-forest/50 leading-snug px-2 pt-1">
                    Te contactamos solo para este encuentro. Datos según Ley 1581/2012.
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
