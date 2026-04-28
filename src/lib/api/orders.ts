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
  customizations?: string;
};

export type CreateOrderPayload = {
  customer_phone: string;
  customer_name?: string;
  customer_email?: string;
  delivery_address?: string;
  type?: OrderType;
  payment_method?: PaymentMethod;
  payment_status?: 'pendiente' | 'parcial' | 'pagado';
  source_code?: 'web' | 'whatsapp_bot' | 'presencial' | 'telefono';
  station_code?: string;
  items: CreateOrderItem[];
};

export type CreateOrderResult = {
  order_id: string;
  order_number: number;
  total_amount: number;
  customer_id: string;
};

export async function createOrderAnon(payload: CreateOrderPayload): Promise<CreateOrderResult> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase no está configurado en este entorno.');
  }
  const { data, error } = await supabase.rpc('create_order_anon', { payload });
  if (error) throw error;
  return data as CreateOrderResult;
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
