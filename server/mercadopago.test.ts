import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import test from 'node:test';
import {
  InvalidWebhookSignatureError,
  WebhookSignatureValidator,
} from 'mercadopago';
import {
  buildMercadoPagoPaymentBody,
  normalizeMercadoPagoApiError,
  PaymentPayloadError,
  safeMercadoPagoRedirectUrl,
} from './mercadopago.ts';

const base = {
  checkoutId: 'd11261f3-8087-44ca-809b-50d063691d8c',
  checkoutToken: '061eb9b0-3c4a-47c0-8344-0cb8f0d22db2',
  attemptId: '2178dccd-8d61-4b9d-a13a-a5816baad946',
  total: 108_200,
  appUrl: 'https://serana.solversai.cloud',
  notificationUrl: 'https://serana.solversai.cloud/api/webhooks/mercadopago',
};

test('card body is server-authoritative and strips unknown browser fields', () => {
  const body = buildMercadoPagoPaymentBody({
    ...base,
    selectedPaymentMethod: 'credit_card',
    formData: {
      token: 'card-token',
      issuer_id: '310',
      payment_method_id: 'visa',
      transaction_amount: 1,
      currency_id: 'USD',
      installments: 1,
      payer: {
        email: 'CLIENTE@EXAMPLE.COM',
        identification: { type: 'CC', number: '123456789' },
        admin: true,
      },
      capture: false,
      application_fee: 100_000,
    },
  });

  assert.equal(body.transaction_amount, 108_200);
  assert.equal(body.payment_method_id, 'visa');
  assert.equal(body.issuer_id, 310);
  assert.equal(body.payer.email, 'cliente@example.com');
  assert.equal('currency_id' in body, false);
  assert.equal('capture' in body, false);
  assert.equal('application_fee' in body, false);
  assert.deepEqual(body.metadata, {
    checkout_id: base.checkoutId,
    attempt_id: base.attemptId,
  });
});

test('PSE body contains the documented redirect and payer fields', () => {
  const body = buildMercadoPagoPaymentBody({
    ...base,
    payerIp: '203.0.113.10',
    selectedPaymentMethod: 'bank_transfer',
    formData: {
      payment_method_id: 'pse',
      transaction_amount: 1,
      transaction_details: {
        financial_institution: '1009',
      },
      payer: {
        email: 'pse@example.com',
        entity_type: 'individual',
        first_name: 'Silvana',
        last_name: 'Solvers',
        identification: {
          type: 'CC',
          number: '1030123456',
        },
      },
    },
  });

  assert.equal(body.transaction_amount, 108_200);
  assert.equal(body.payment_method_id, 'pse');
  assert.equal(body.callback_url, `${base.appUrl}/checkout/pending?checkout=${base.checkoutToken}`);
  assert.equal(
    body.notification_url,
    'https://serana.solversai.cloud/api/webhooks/mercadopago',
  );
  assert.deepEqual(body.transaction_details, { financial_institution: '1009' });
  assert.deepEqual(body.additional_info, { ip_address: '203.0.113.10' });
  assert.equal('currency_id' in body, false);
});

test('PSE rejects an incomplete payer instead of forwarding malformed data', () => {
  assert.throws(
    () => buildMercadoPagoPaymentBody({
      ...base,
      selectedPaymentMethod: 'bank_transfer',
      formData: {
        payment_method_id: 'pse',
        transaction_details: { financial_institution: '1009' },
        payer: {
          email: 'pse@example.com',
          identification: { type: 'CC', number: '1030123456' },
        },
      },
    }),
    (error) => error instanceof PaymentPayloadError
      && error.code === 'payer_entity_type_invalid',
  );
});

test('wallet and unimplemented ticket methods never reach /v1/payments', () => {
  for (const selectedPaymentMethod of ['wallet_purchase', 'ticket']) {
    assert.throws(
      () => buildMercadoPagoPaymentBody({
        ...base,
        selectedPaymentMethod,
        formData: {
          payment_method_id: selectedPaymentMethod === 'ticket' ? 'efecty' : 'account_money',
          payer: { email: 'payer@example.com' },
        },
      }),
      PaymentPayloadError,
    );
  }
});

test('Mercado Pago errors retain retryability without leaking arbitrary values', () => {
  const rateLimit = normalizeMercadoPagoApiError({
    status: 429,
    error: 'too_many_requests',
    message: 'Retry later',
  });
  assert.equal(rateLimit.retryable, true);
  assert.equal(rateLimit.httpStatus, 429);

  const invalid = normalizeMercadoPagoApiError({
    status: 400,
    error: 'bad_request',
    message: 'The name of the following parameters is wrong : currency_id',
  });
  assert.equal(invalid.retryable, false);
  assert.equal(invalid.status, 'rejected');
});

test('official webhook validator accepts the documented manifest', () => {
  const secret = 'test-secret';
  const dataId = 'abc123';
  const requestId = 'request-123';
  const timestamp = '1776174584000';
  const manifest = `id:${dataId};request-id:${requestId};ts:${timestamp};`;
  const signature = createHmac('sha256', secret).update(manifest).digest('hex');

  assert.doesNotThrow(() => WebhookSignatureValidator.validate({
    xSignature: `ts=${timestamp},v1=${signature}`,
    xRequestId: requestId,
    dataId,
    secret,
  }));
  assert.throws(
    () => WebhookSignatureValidator.validate({
      xSignature: `ts=${timestamp},v1=${signature}`,
      xRequestId: requestId,
      dataId: 'different',
      secret,
    }),
    InvalidWebhookSignatureError,
  );
});

test('only Mercado Pago HTTPS redirect URLs are returned to the browser', () => {
  assert.equal(
    safeMercadoPagoRedirectUrl(
      'https://www.mercadopago.com.co/sandbox/payments/123/bank_transfer',
    ),
    'https://www.mercadopago.com.co/sandbox/payments/123/bank_transfer',
  );
  assert.equal(
    safeMercadoPagoRedirectUrl('https://mercadopago.com.evil.example/phishing'),
    undefined,
  );
  assert.equal(
    safeMercadoPagoRedirectUrl('javascript:alert(1)'),
    undefined,
  );
});
