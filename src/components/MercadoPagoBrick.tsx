import { useEffect, useRef, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

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

type BrickSettings = {
  initialization: {
    amount: number;
    preferenceId?: string;
    payer?: { email?: string };
  };
  customization?: {
    paymentMethods?: Record<string, string>;
    visual?: { style?: Record<string, unknown> };
  };
  callbacks: {
    onReady: () => void;
    onError: (err: { type: string; message: string; cause?: unknown }) => void;
    onSubmit: (data: {
      selectedPaymentMethod: string;
      formData: BrickFormData;
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
  orderId: string;
  payerEmail?: string;
  onApproved: (paymentId: string) => void;
  onRejected: (info: { status: string; status_detail: string; message?: string }) => void;
};

const CONTAINER_ID = 'mp-payment-brick';

export default function MercadoPagoBrick({
  publicKey, preferenceId, amount, orderId, payerEmail,
  onApproved, onRejected,
}: Props) {
  const controllerRef = useRef<BrickController | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

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
            ...(payerEmail ? { payer: { email: payerEmail } } : {}),
          },
          customization: {
            paymentMethods: {
              creditCard: 'all',
              debitCard: 'all',
              ticket: 'all',
              bankTransfer: 'all',
              mercadoPago: 'all',
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
              const resp = await fetch('/api/checkout/mp/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  order_id: orderId,
                  selectedPaymentMethod,
                  formData,
                }),
              });
              const data = await resp.json().catch(() => ({}));

              if (!resp.ok) {
                onRejected({
                  status: data?.status ?? 'rejected',
                  status_detail: data?.status_detail ?? 'unknown',
                  message: data?.message ?? data?.error ?? 'No pudimos procesar el pago',
                });
                throw new Error(data?.message ?? 'mp_process_failed');
              }

              if (data.redirect_url) {
                // PSE / bank transfer: MP returns a URL to send the user to
                window.location.href = data.redirect_url;
                return;
              }

              if (data.status === 'approved') {
                onApproved(String(data.id));
                return;
              }

              if (data.status === 'in_process' || data.status === 'pending') {
                // Card under review — treat as success-with-pending; webhook will finalize
                onApproved(String(data.id));
                return;
              }

              onRejected({
                status: data.status ?? 'rejected',
                status_detail: data.status_detail ?? 'unknown',
                message: data.message,
              });
              throw new Error(data?.message ?? 'mp_payment_rejected');
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
    // Only re-mount the brick when the preference changes — recreating it on
    // every parent render would reset the user's typed-in card details.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferenceId]);

  return (
    <div className="space-y-3">
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
      <div id={CONTAINER_ID} className={status === 'ready' ? '' : 'hidden'} />
    </div>
  );
}
