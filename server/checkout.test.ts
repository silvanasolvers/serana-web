import assert from 'node:assert/strict';
import test from 'node:test';
import {
  STORE_PICKUP_CHECKOUT_ADDRESS,
} from '../shared/checkout.ts';
import { sanitizeCheckoutPayload } from './checkout.ts';

test('preserves a valid domicilio checkout and sanitizes browser fields', () => {
  const result = sanitizeCheckoutPayload({
    customer_phone: '+57 (300) 123-4567',
    customer_name: '  Cliente Serana  ',
    customer_email: '  CLIENTE@EXAMPLE.COM ',
    delivery_address: '  Calle 10 # 20-30, Medellín  ',
    type: 'domicilio',
    payment_method: 'transferencia',
    source_code: 'web',
    items: [{ product_slug: 'ensalada-serana', quantity: 2.8 }],
  });

  assert.equal(result.customer_phone, '573001234567');
  assert.equal(result.customer_name, 'Cliente Serana');
  assert.equal(result.customer_email, 'cliente@example.com');
  assert.equal(result.delivery_address, 'Calle 10 # 20-30, Medellín');
  assert.equal(result.type, 'domicilio');
  assert.equal(result.payment_method, 'transferencia');
  assert.equal(result.items[0]?.quantity, 2);
});

test('accepts recogida, forces the canonical store address, and keeps every web payment method', () => {
  for (const paymentMethod of ['mercado_pago', 'transferencia', 'efectivo'] as const) {
    const result = sanitizeCheckoutPayload({
      customer_phone: '3001234567',
      delivery_address: 'Dirección manipulada desde el navegador',
      type: 'recogida',
      payment_method: paymentMethod,
      items: [{ product_slug: 'producto', quantity: 1 }],
    });

    assert.equal(result.type, 'recogida');
    assert.equal(result.delivery_address, STORE_PICKUP_CHECKOUT_ADDRESS);
    assert.equal(result.payment_method, paymentMethod);
  }
});

test('does not expose internal order types or unsupported payment methods to public checkout', () => {
  const result = sanitizeCheckoutPayload({
    customer_phone: '3001234567',
    delivery_address: 'Calle 1',
    type: 'mesa',
    payment_method: 'tarjeta',
    items: [{ product_slug: 'producto', quantity: 999 }],
  });

  assert.equal(result.type, 'domicilio');
  assert.equal(result.payment_method, 'mercado_pago');
  assert.equal(result.items[0]?.quantity, 100);
});
