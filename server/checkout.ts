import {
  STORE_PICKUP_CHECKOUT_ADDRESS,
  type WebDeliveryType,
} from '../shared/checkout.ts';

export type PublicCheckoutPaymentMethod =
  | 'mercado_pago'
  | 'transferencia'
  | 'efectivo';

function clippedString(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function normalizePhone(value: unknown) {
  return clippedString(value, 80).replace(/\D/g, '');
}

function isUuid(value: unknown): value is string {
  return typeof value === 'string'
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function sanitizeCheckoutPayload(value: unknown) {
  const payload = value && typeof value === 'object'
    ? value as Record<string, unknown>
    : {};
  const rawItems = Array.isArray(payload.items) ? payload.items.slice(0, 50) : [];
  const paymentMethod: PublicCheckoutPaymentMethod = (
    ['mercado_pago', 'transferencia', 'efectivo'] as const
  ).includes(payload.payment_method as PublicCheckoutPaymentMethod)
    ? payload.payment_method as PublicCheckoutPaymentMethod
    : 'mercado_pago';
  const sourceCode = ['web', 'whatsapp_bot', 'presencial', 'telefono'].includes(String(payload.source_code))
    ? String(payload.source_code)
    : 'web';
  const deliveryType: WebDeliveryType = payload.type === 'recogida'
    ? 'recogida'
    : 'domicilio';

  return {
    customer_phone: normalizePhone(payload.customer_phone),
    customer_name: clippedString(payload.customer_name, 160),
    customer_email: clippedString(payload.customer_email, 320).toLowerCase() || undefined,
    delivery_address: deliveryType === 'recogida'
      ? STORE_PICKUP_CHECKOUT_ADDRESS
      : clippedString(payload.delivery_address, 500),
    notes: clippedString(payload.notes, 1000) || undefined,
    // The public website accepts only its two visible fulfillment choices.
    // Financial and operational state remains authoritative in Supabase.
    type: deliveryType,
    payment_method: paymentMethod,
    source_code: sourceCode,
    coupon_code: clippedString(payload.coupon_code, 80) || undefined,
    items: rawItems.map((raw) => {
      const item = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
      return {
        product_slug: clippedString(item.product_slug, 160) || undefined,
        product_id: isUuid(item.product_id) ? item.product_id : undefined,
        quantity: Math.max(1, Math.min(100, Math.trunc(Number(item.quantity) || 1))),
        variant_label: clippedString(item.variant_label, 120) || undefined,
        customizations: clippedString(item.customizations, 2000) || undefined,
      };
    }),
  };
}
