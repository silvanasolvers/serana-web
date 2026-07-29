import { useEffect, useRef, useState } from 'react';
import { Loader2, AlertCircle, Building2, UserRound } from 'lucide-react';
import {
  createBrowserUuid,
  isBrowserUuid,
  readBrowserStorage,
  removeBrowserStorage,
  writeBrowserStorage,
} from '../lib/browserRuntime';

const MP_SDK_SRC = 'https://sdk.mercadopago.com/js/v2';

declare global {
  interface Window {
    // The MP SDK exposes itself on window.MercadoPago.
    MercadoPago?: new (publicKey: string, opts?: { locale?: string }) => {
      bricks: () => {
        create: (
          type: 'payment',
          containerId: string,
          settings: BrickSettings,
        ) => Promise<BrickController>;
      };
    };
  }
}

type BrickController = {
  unmount: () => void;
};

type BrickFormData = {
  token?: string;
  payment_method_id?: string;
  payer?: { email?: string };
  [k: string]: unknown;
};

type BrickPaymentMethod =
  | 'credit_card'
  | 'debit_card'
  | 'ticket'
  | 'bank_transfer'
  | 'wallet_purchase'
  | 'atm';

type PayerEntityType = 'individual' | 'association';

type BrickSettings = {
  initialization: {
    amount: number;
    preferenceId?: string;
    payer?: {
      email?: string;
      entityType?: PayerEntityType;
    };
  };
  customization?: {
    paymentMethods?: Record<string, string | string[]>;
    visual?: { style?: Record<string, unknown> };
  };
  callbacks: {
    onReady: () => void;
    onError: (err: { type: string; message: string; cause?: unknown }) => void;
    onSubmit: (data: {
      selectedPaymentMethod: BrickPaymentMethod;
      formData: BrickFormData | null;
    }) => Promise<void>;
  };
};

let sdkPromise: Promise<void> | null = null;

function loadMercadoPagoSdk(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('window unavailable'));
  if (window.MercadoPago) return Promise.resolve();
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${MP_SDK_SRC}"]`) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('mp_sdk_failed')));
      return;
    }
    const script = document.createElement('script');
    script.src = MP_SDK_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('mp_sdk_failed'));
    document.head.appendChild(script);
  });

  return sdkPromise;
}

type Props = {
  publicKey: string;
  preferenceId: string;
  amount: number;
  checkoutToken: string;
  payerEmail?: string;
  onApproved: (result: { paymentId: string; orderNumber: number }) => void;
  onPending: (result: { paymentId: string }) => void;
  onRejected: (info: { status: string; status_detail: string; message?: string }) => void;
};

const CONTAINER_ID = 'mp-payment-brick';

export default function MercadoPagoBrick({
  publicKey, preferenceId, amount, checkoutToken, payerEmail,
  onApproved, onPending, onRejected,
}: Props) {
  const controllerRef = useRef<BrickController | null>(null);
  const submittingRef = useRef(false);
  const attemptIdRef = useRef<string | null>(null);
  const [payerEntityType, setPayerEntityType] =
    useState<PayerEntityType>('individual');
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setErrorMsg(null);

    (async () => {
      try {
        if (!publicKey) throw new Error('Missing VITE_MP_PUBLIC_KEY');
        await loadMercadoPagoSdk();
        if (cancelled) return;
        if (!window.MercadoPago) throw new Error('mp_sdk_missing');

        const mp = new window.MercadoPago(publicKey, { locale: 'es-CO' });
        const builder = mp.bricks();

        const controller = await builder.create('payment', CONTAINER_ID, {
          initialization: {
            amount,
            preferenceId,
            payer: {
              entityType: payerEntityType,
              ...(payerEmail ? { email: payerEmail } : {}),
            },
          },
          customization: {
            paymentMethods: {
              creditCard: 'all',
              debitCard: 'all',
              // Efecty remains hidden until its delayed-payment operational
              // workflow is explicitly enabled and tested end to end.
              ticket: [],
              bankTransfer: ['pse'],
              mercadoPago: 'wallet_purchase',
            },
            visual: {
              style: {
                theme: 'default',
                customVariables: {
                  baseColor: '#273617',
                  textPrimaryColor: '#273617',
                  borderRadiusMedium: '12px',
                  borderRadiusLarge: '20px',
                },
              },
            },
          },
          callbacks: {
            onReady: () => {
              if (!cancelled) setStatus('ready');
            },
            onError: (err) => {
              console.error('[mp/brick] error:', err);
              if (!cancelled) {
                setStatus('error');
                setErrorMsg(err.message || 'Error en el formulario de pago.');
              }
            },
            onSubmit: async ({ selectedPaymentMethod, formData }) => {
              // Wallet is completed by Mercado Pago through the preferenceId.
              // Sending its null formData to /v1/payments is explicitly
              // unsupported by the Payment Brick contract.
              if (selectedPaymentMethod === 'wallet_purchase') return;
              if (submittingRef.current) return;
              if (!formData) throw new Error('mp_form_data_missing');
              submittingRef.current = true;
              const attemptStorageKey = `serana:mp-attempt:${checkoutToken}`;
              const savedAttempt = readBrowserStorage('localStorage', attemptStorageKey);
              attemptIdRef.current ??= isBrowserUuid(savedAttempt)
                ? savedAttempt
                : createBrowserUuid();
              writeBrowserStorage(
                'localStorage',
                attemptStorageKey,
                attemptIdRef.current,
              );
              try {
                const resp = await fetch('/api/checkout/mp/process', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    checkout_token: checkoutToken,
                    attempt_id: attemptIdRef.current,
                    selectedPaymentMethod,
                    payerEntityType,
                    formData,
                  }),
                });
                const data = await resp.json().catch(() => ({}));

                if (!resp.ok) {
                  // A rejected payment is a completed attempt; the next user
                  // submit may intentionally create a new one. For ambiguous
                  // gateway/network failures retain the same UUID so retrying
                  // cannot create a second charge.
                  if (data?.retryable !== true) {
                    attemptIdRef.current = null;
                    removeBrowserStorage('localStorage', attemptStorageKey);
                  }
                  onRejected({
                    status: data?.status ?? 'error',
                    status_detail: data?.status_detail ?? 'unknown',
                    message: data?.message ?? data?.error ?? 'No pudimos procesar el pago',
                  });
                  throw new Error(data?.message ?? 'mp_process_failed');
                }

                if (data.redirect_url) {
                  window.location.href = data.redirect_url;
                  return;
                }

                if (data.status === 'approved') {
                  if (!data.order_number) throw new Error('approved_payment_missing_order');
                  removeBrowserStorage('localStorage', attemptStorageKey);
                  onApproved({ paymentId: String(data.id), orderNumber: Number(data.order_number) });
                  return;
                }

                if (data.status === 'in_process' || data.status === 'pending') {
                  onPending({ paymentId: String(data.id) });
                  return;
                }

                onRejected({
                  status: data?.status ?? 'rejected',
                  status_detail: data?.status_detail ?? 'unknown',
                  message: data?.message,
                });
                attemptIdRef.current = null;
                removeBrowserStorage('localStorage', attemptStorageKey);
                throw new Error(data?.message ?? 'mp_process_failed');
              } catch (err) {
                if (err instanceof TypeError) {
                  onRejected({
                    status: 'error',
                    status_detail: 'network_error',
                    message: 'La conexión se interrumpió. Puedes reintentar sin riesgo de duplicar el cobro.',
                  });
                }
                throw err;
              } finally {
                submittingRef.current = false;
              }
            },
          },
        });

        controllerRef.current = controller;
      } catch (err: any) {
        if (cancelled) return;
        setStatus('error');
        setErrorMsg(err?.message ?? 'No pudimos cargar Mercado Pago.');
      }
    })();

    return () => {
      cancelled = true;
      try {
        controllerRef.current?.unmount();
      } catch { /* ignore */ }
      controllerRef.current = null;
    };
    // Re-mount only when the preference or PSE person type changes. Recreating
    // it on ordinary parent renders would reset typed-in payment details.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferenceId, payerEntityType]);

  return (
    <div className="space-y-3 min-w-0">
      <div className="mx-4 sm:mx-0 rounded-2xl border border-serana-forest/10 bg-white/70 p-3.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-serana-forest/55 mb-2.5">
          Si pagas por PSE
        </p>
        <div
          className="grid grid-cols-2 gap-2"
          role="group"
          aria-label="Tipo de persona para PSE"
        >
          <button
            type="button"
            aria-pressed={payerEntityType === 'individual'}
            onClick={() => setPayerEntityType('individual')}
            className={`flex min-w-0 items-center justify-center gap-2 rounded-xl border px-3 py-3 text-xs font-semibold transition ${
              payerEntityType === 'individual'
                ? 'border-serana-forest bg-serana-forest text-white'
                : 'border-serana-forest/15 bg-white text-serana-forest hover:border-serana-forest/35'
            }`}
          >
            <UserRound className="h-4 w-4 shrink-0" />
            <span>Persona natural</span>
          </button>
          <button
            type="button"
            aria-pressed={payerEntityType === 'association'}
            onClick={() => setPayerEntityType('association')}
            className={`flex min-w-0 items-center justify-center gap-2 rounded-xl border px-3 py-3 text-xs font-semibold transition ${
              payerEntityType === 'association'
                ? 'border-serana-forest bg-serana-forest text-white'
                : 'border-serana-forest/15 bg-white text-serana-forest hover:border-serana-forest/35'
            }`}
          >
            <Building2 className="h-4 w-4 shrink-0" />
            <span>Empresa</span>
          </button>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-serana-forest/55">
          Para empresa, selecciona NIT como documento dentro del formulario.
        </p>
      </div>
      {status === 'loading' && (
        <div className="flex items-center gap-3 text-serana-forest/70 px-4 py-8 rounded-2xl bg-white/60 border border-serana-forest/10 justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-serana-olive" />
          <span className="text-sm font-medium">Cargando formulario seguro de Mercado Pago…</span>
        </div>
      )}
      {status === 'error' && (
        <div className="flex items-start gap-3 px-4 py-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">No pudimos cargar el pago.</p>
            {errorMsg && <p className="mt-1 text-rose-600/80 text-[13px]">{errorMsg}</p>}
          </div>
        </div>
      )}
      <div
        id={CONTAINER_ID}
        className={`${status === 'ready' ? '' : 'hidden'} min-w-0 w-full`}
      />
    </div>
  );
}
