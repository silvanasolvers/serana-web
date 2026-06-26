import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle, Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../components/AuthProvider';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getAuthReturnParams, replaceWithCleanPasswordResetUrl } from '../lib/authRecovery';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { user, loading, updatePassword, authError, passwordRecovery } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [checkingRecoveryLink, setCheckingRecoveryLink] = useState(true);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function openRecoveryLink() {
      if (!isSupabaseConfigured) {
        setCheckingRecoveryLink(false);
        return;
      }

      try {
        const params = getAuthReturnParams();
        const urlError = params.get('error_description') ?? params.get('error_code') ?? params.get('error');
        if (urlError) {
          throw new Error(urlError);
        }

        const type = params.get('type');
        const isRecoveryType = !type || type === 'recovery';
        const code = params.get('code');
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const tokenHash = params.get('token_hash');
        const token = params.get('token');
        const email = params.get('email');

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          if (mounted) setRecoveryReady(true);
          replaceWithCleanPasswordResetUrl();
          return;
        }

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
          if (mounted) setRecoveryReady(true);
          replaceWithCleanPasswordResetUrl();
          return;
        }

        if (tokenHash && isRecoveryType) {
          const { error } = await supabase.auth.verifyOtp({
            type: 'recovery',
            token_hash: tokenHash,
          });
          if (error) throw error;
          if (mounted) setRecoveryReady(true);
          replaceWithCleanPasswordResetUrl();
          return;
        }

        if (token && email && isRecoveryType) {
          const { error } = await supabase.auth.verifyOtp({
            type: 'recovery',
            token,
            email,
          });
          if (error) throw error;
          if (mounted) setRecoveryReady(true);
          replaceWithCleanPasswordResetUrl();
          return;
        }

        const { data } = await supabase.auth.getSession();
        if (mounted && data.session) {
          setRecoveryReady(true);
        }
      } catch (err) {
        if (mounted) setLinkError(recoveryLinkErrorMessage(err));
      } finally {
        if (mounted) setCheckingRecoveryLink(false);
      }
    }

    void openRecoveryLink();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setLocalError(null);
  }, [password, confirmPassword]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (password.length < 6) {
      setLocalError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Las contraseñas no coinciden.');
      return;
    }

    setBusy(true);
    try {
      await updatePassword(password);
      navigate('/cuenta', {
        replace: true,
        state: { welcomeToast: 'Contraseña actualizada. Ya puedes seguir en Serana.' },
      });
    } catch {
      // AuthProvider keeps the readable error.
    } finally {
      setBusy(false);
    }
  };

  const canReset = Boolean(user || recoveryReady || passwordRecovery);
  const checkingLink = loading || checkingRecoveryLink;
  const unavailable = !checkingLink && !canReset;

  return (
    <div className="min-h-screen pt-32">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 pb-20 grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-start">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-8"
        >
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-serana-terracotta font-bold tracking-widest uppercase text-xs hover:text-serana-ochre transition-colors mb-8"
          >
            <ArrowLeft size={14} /> Volver a entrar
          </Link>
          <p className="text-serana-terracotta font-bold tracking-[0.3em] uppercase text-[10px] mb-4">
            Acceso Serana
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-serana-forest leading-tight mb-6">
            Crea una
            <span className="block italic text-serana-olive">nueva contraseña.</span>
          </h1>
          <p className="text-lg text-serana-forest/70 font-light leading-relaxed max-w-xl">
            Usa una contraseña que recuerdes y que no compartas con otros servicios.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="bg-white/75 backdrop-blur-md border border-serana-forest/5 rounded-[1.75rem] shadow-sm p-6 md:p-8"
        >
          {checkingLink ? (
            <div className="flex items-center justify-center py-16 text-serana-olive">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
          ) : unavailable ? (
            <div className="space-y-5">
              <div className="rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 p-4 text-sm leading-relaxed">
                {linkError ?? 'El enlace expiró o no pudimos abrir la sesión de recuperación. Solicita un nuevo enlace desde la pantalla de entrada.'}
              </div>
              <Link
                to="/login"
                className="w-full inline-flex items-center justify-center gap-2 bg-serana-forest text-serana-cream px-8 py-4 rounded-full font-bold tracking-widest uppercase text-xs hover:bg-serana-olive transition"
              >
                Solicitar nuevo enlace
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="rounded-2xl bg-serana-olive/10 border border-serana-olive/20 p-4 flex gap-3">
                <CheckCircle className="w-5 h-5 text-serana-olive shrink-0 mt-0.5" />
                <p className="text-sm text-serana-forest/70 leading-relaxed">
                  Enlace validado. Escribe tu nueva contraseña para terminar el proceso.
                </p>
              </div>

              <PasswordField
                value={password}
                onChange={setPassword}
                placeholder="Nueva contraseña"
                visible={showPassword}
                onToggle={() => setShowPassword((visible) => !visible)}
              />
              <PasswordField
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Confirmar contraseña"
                visible={showConfirmPassword}
                onToggle={() => setShowConfirmPassword((visible) => !visible)}
              />

              {(localError || authError) && (
                <p className="text-sm leading-relaxed text-rose-600">
                  {localError ?? authError}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full inline-flex items-center justify-center gap-2 bg-serana-forest text-serana-cream px-8 py-4 rounded-full font-bold tracking-widest uppercase text-xs hover:bg-serana-olive transition disabled:opacity-60"
              >
                {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                Guardar contraseña
              </button>
            </form>
          )}
        </motion.section>
      </main>
      <Footer />
    </div>
  );
}

function recoveryLinkErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? '');
  let normalized = message.replace(/\+/g, ' ').toLowerCase();
  try {
    normalized = decodeURIComponent(normalized);
  } catch {
    // Keep the raw message when it contains malformed URL escapes.
  }

  if (normalized.includes('expired') || normalized.includes('otp_expired')) {
    return 'El enlace de recuperación expiró. Solicita uno nuevo desde la pantalla de entrada.';
  }
  if (normalized.includes('invalid') || normalized.includes('token') || normalized.includes('otp')) {
    return 'No pudimos validar este enlace de recuperación. Solicita uno nuevo desde la pantalla de entrada.';
  }
  if (normalized.includes('redirect')) {
    return 'El enlace llegó con una redirección no válida. Solicita un nuevo enlace desde serana.food.';
  }

  return 'No pudimos abrir la recuperación de contraseña. Solicita un nuevo enlace desde la pantalla de entrada.';
}

function PasswordField({
  value,
  onChange,
  placeholder,
  visible,
  onToggle,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <FieldIcon>
      <input
        required
        minLength={6}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent outline-none"
      />
      <button
        type="button"
        onClick={onToggle}
        className="text-serana-forest/45 hover:text-serana-forest transition-colors"
        aria-label={visible ? `Ocultar ${placeholder.toLowerCase()}` : `Ver ${placeholder.toLowerCase()}`}
      >
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </FieldIcon>
  );
}

function FieldIcon({ children }: { children: ReactNode }) {
  return (
    <label className="flex items-center gap-3 px-4 py-4 rounded-2xl border border-serana-forest/10 bg-serana-cream/35 focus-within:bg-white focus-within:border-serana-forest/30 transition">
      <Lock className="w-4 h-4 text-serana-olive shrink-0" />
      {children}
    </label>
  );
}
