import { supabase, isSupabaseConfigured } from '../supabase';

export type OrderType = 'domicilio' | 'recogida' | 'mesa';
export type PaymentMethod =
  | 'efectivo'
  | 'tarjeta'
  | 'transferencia'
  | 'link_pago'
  | 'wompi'
  | 'mercado_pago';

export type CreateOrderItem = {
  product_slug: string;
  quantity: number;
  variant_label?: string;
  customizations?: string;
};

export type CheckoutPayload = {
  customer_phone: string;
  customer_name?: string;
  customer_email?: string;
  delivery_address?: string;
  notes?: string;
  type?: OrderType;
  payment_method?: PaymentMethod;
  source_code?: 'web' | 'whatsapp_bot' | 'presencial' | 'telefono';
  coupon_code?: string;
  items: CreateOrderItem[];
};

export type CheckoutSessionResult = {
  checkout_id: string;
  checkout_token: string;
  status: 'draft' | 'payment_processing' | 'payment_pending' | 'payment_failed' | 'awaiting_transfer' | 'confirmed' | 'paid' | 'expired' | 'cancelled';
  payment_method: PaymentMethod;
  total_amount: number;
  subtotal: number;
  discount_amount: number;
  delivery_fee: number;
  coupon_code: string | null;
  preference_id: string | null;
  version: number;
  expires_at: string;
  order_id: string | null;
  order_number: number | null;
  order_status: string | null;
  payment_status: string | null;
};

export type CheckoutPublicStatus = Pick<
  CheckoutSessionResult,
  'status' | 'payment_method' | 'payment_status' | 'order_status' | 'order_number' |
  'subtotal' | 'discount_amount' | 'delivery_fee' | 'total_amount' | 'coupon_code' | 'expires_at'
>;

export type CouponValidation = {
  valid: boolean;
  reason: 'ok' | 'empty' | 'not_found' | 'inactive' | 'expired' | 'not_yet_active' | 'usage_limit' | 'min_subtotal' | string;
  code: string | null;
  discount_kind: 'percent' | 'fixed' | null;
  discount_amount: number;
};

export async function validateCoupon(code: string, subtotal: number): Promise<CouponValidation> {
  if (!isSupabaseConfigured) {
    return { valid: false, reason: 'not_found', code, discount_kind: null, discount_amount: 0 };
  }
  const { data, error } = await supabase.rpc('validate_coupon', {
    p_code: code,
    p_subtotal: subtotal,
  });
  if (error) throw error;
  const row = data as any;
  return {
    valid: !!row.valid,
    reason: row.reason,
    code: row.code,
    discount_kind: row.discount_kind,
    discount_amount: Number(row.discount_amount ?? 0),
  };
}

async function checkoutRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error ?? `checkout_request_${response.status}`);
  }
  return data as T;
}

export function createOrUpdateCheckoutSession(
  checkoutKey: string,
  payload: CheckoutPayload,
): Promise<CheckoutSessionResult> {
  return checkoutRequest('/api/checkout/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ checkout_key: checkoutKey, payload }),
  });
}

export function confirmOfflineCheckout(checkoutToken: string): Promise<CheckoutSessionResult> {
  return checkoutRequest('/api/checkout/offline/confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ checkout_token: checkoutToken }),
  });
}

export function getCheckoutStatus(checkoutToken: string): Promise<CheckoutPublicStatus> {
  return checkoutRequest(`/api/checkout/status/${encodeURIComponent(checkoutToken)}`);
}

export type TrackedOrder = {
  order_number: number;
  status: string;
  type: OrderType;
  payment_status: string;
  total_amount: number;
  created_at: string;
  ready_at: string | null;
  delivered_at: string | null;
};

export async function trackOrder(orderNumber: number, phone: string): Promise<TrackedOrder> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase no está configurado en este entorno.');
  }
  const { data, error } = await supabase.rpc('track_order', {
    p_order_number: orderNumber,
    p_phone: phone,
  });
  if (error) throw error;
  return data as TrackedOrder;
}
