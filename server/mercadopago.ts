import { isIP } from 'node:net';

export const DIRECT_PAYMENT_METHODS = [
  'credit_card',
  'debit_card',
  'bank_transfer',
] as const;

export type DirectPaymentMethod = (typeof DIRECT_PAYMENT_METHODS)[number];
export type BrickPaymentMethod =
  | DirectPaymentMethod
  | 'ticket'
  | 'wallet_purchase'
  | 'atm';

type JsonRecord = Record<string, unknown>;

export type MercadoPagoPaymentBody = {
  transaction_amount: number;
  payment_method_id: string;
  description: string;
  external_reference: string;
  statement_descriptor: string;
  metadata: {
    checkout_id: string;
    attempt_id: string;
  };
  notification_url: string;
  token?: string;
  installments?: number;
  issuer_id?: number;
  callback_url?: string;
  payer: {
    email: string;
    identification?: {
      type: string;
      number: string;
    };
    entity_type?: 'individual' | 'association';
    first_name?: string;
    last_name?: string;
  };
  transaction_details?: {
    financial_institution: string;
  };
  additional_info?: {
    ip_address: string;
  };
};

export type BuildPaymentBodyInput = {
  selectedPaymentMethod: unknown;
  formData: unknown;
  checkoutId: string;
  checkoutToken: string;
  attemptId: string;
  total: number;
  appUrl: string;
  notificationUrl: string | undefined;
  payerIp?: string;
  payerEntityType?: unknown;
};

export class PaymentPayloadError extends Error {
  readonly code: string;

  constructor(code: string) {
    super(code);
    this.name = 'PaymentPayloadError';
    this.code = code;
  }
}

export type MercadoPagoApiError = {
  httpStatus: number;
  retryable: boolean;
  status: string;
  statusDetail: string;
  message: string;
  metadata: JsonRecord;
};

function record(value: unknown): JsonRecord {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as JsonRecord
    : {};
}

function requiredString(value: unknown, code: string, maxLength: number) {
  if (typeof value !== 'string') throw new PaymentPayloadError(code);
  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength) throw new PaymentPayloadError(code);
  return normalized;
}

function optionalString(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  return normalized && normalized.length <= maxLength ? normalized : undefined;
}

function requiredEmail(value: unknown) {
  const email = requiredString(value, 'payer_email_invalid', 320).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new PaymentPayloadError('payer_email_invalid');
  }
  return email;
}

function requiredPaymentMethodId(value: unknown) {
  const id = requiredString(value, 'payment_method_id_invalid', 50).toLowerCase();
  if (!/^[a-z0-9_-]+$/.test(id)) {
    throw new PaymentPayloadError('payment_method_id_invalid');
  }
  return id;
}

function requiredIdentification(value: unknown) {
  const identification = record(value);
  const type = requiredString(
    identification.type,
    'payer_identification_type_invalid',
    10,
  ).toUpperCase();
  const allowed = new Set(['CC', 'CE', 'NIT', 'OTRO', 'TE', 'RC', 'TI', 'PAS', 'DI']);
  if (!allowed.has(type)) {
    throw new PaymentPayloadError('payer_identification_type_invalid');
  }

  const number = requiredString(
    identification.number,
    'payer_identification_number_invalid',
    15,
  );
  const validNumber = type === 'PAS'
    ? /^[a-z0-9]{1,15}$/i.test(number)
    : /^\d{1,15}$/.test(number);
  if (!validNumber) {
    throw new PaymentPayloadError('payer_identification_number_invalid');
  }

  return {
    type: type === 'OTRO' ? 'Otro' : type,
    number,
  };
}

function requiredPositiveInteger(value: unknown, code: string, max: number) {
  const normalized = typeof value === 'string' && /^\d+$/.test(value)
    ? Number(value)
    : value;
  if (!Number.isInteger(normalized) || Number(normalized) < 1 || Number(normalized) > max) {
    throw new PaymentPayloadError(code);
  }
  return Number(normalized);
}

function normalizePayerEntityType(value: unknown) {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim().toLowerCase();
  return normalized === 'individual' || normalized === 'association'
    ? normalized
    : undefined;
}

function requirePublicUrl(value: string | undefined, code: string) {
  if (!value) throw new PaymentPayloadError(code);
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new PaymentPayloadError(code);
  }
  if (!['https:', 'http:'].includes(parsed.protocol)) {
    throw new PaymentPayloadError(code);
  }
  return parsed;
}

function commonBody(input: BuildPaymentBodyInput, paymentMethodId: string) {
  if (!Number.isFinite(input.total) || input.total <= 0) {
    throw new PaymentPayloadError('transaction_amount_invalid');
  }
  const notificationUrl = requirePublicUrl(
    input.notificationUrl,
    'notification_url_invalid',
  ).toString();

  return {
    transaction_amount: input.total,
    payment_method_id: paymentMethodId,
    description: 'Compra Serana',
    external_reference: input.checkoutId,
    statement_descriptor: 'SERANA',
    metadata: {
      checkout_id: input.checkoutId,
      attempt_id: input.attemptId,
    },
    notification_url: notificationUrl,
  };
}

export function buildMercadoPagoPaymentBody(
  input: BuildPaymentBodyInput,
): MercadoPagoPaymentBody {
  const selected = requiredString(
    input.selectedPaymentMethod,
    'selected_payment_method_invalid',
    40,
  ) as BrickPaymentMethod;
  const formData = record(input.formData);
  const payer = record(formData.payer);
  const paymentMethodId = requiredPaymentMethodId(formData.payment_method_id);

  if (selected === 'credit_card' || selected === 'debit_card') {
    if (['pse', 'efecty'].includes(paymentMethodId)) {
      throw new PaymentPayloadError('card_payment_method_mismatch');
    }
    const token = requiredString(formData.token, 'card_token_invalid', 512);
    const installments = requiredPositiveInteger(
      formData.installments,
      'installments_invalid',
      36,
    );
    const issuerId = requiredPositiveInteger(formData.issuer_id, 'issuer_id_invalid', 9_999_999);

    return {
      ...commonBody(input, paymentMethodId),
      token,
      installments,
      issuer_id: issuerId,
      payer: {
        email: requiredEmail(payer.email),
        identification: requiredIdentification(payer.identification),
      },
    };
  }

  if (selected === 'bank_transfer') {
    if (paymentMethodId !== 'pse') {
      throw new PaymentPayloadError('bank_transfer_method_not_supported');
    }
    const transactionDetails = record(formData.transaction_details);
    const financialInstitution = requiredString(
      transactionDetails.financial_institution,
      'financial_institution_invalid',
      40,
    );
    if (!/^[a-z0-9_-]+$/i.test(financialInstitution)) {
      throw new PaymentPayloadError('financial_institution_invalid');
    }

    const brickEntityType = normalizePayerEntityType(payer.entity_type);
    const selectedEntityType = normalizePayerEntityType(input.payerEntityType);
    if (
      payer.entity_type !== undefined
      && !brickEntityType
    ) {
      throw new PaymentPayloadError('payer_entity_type_invalid');
    }
    if (
      input.payerEntityType !== undefined
      && !selectedEntityType
    ) {
      throw new PaymentPayloadError('payer_entity_type_invalid');
    }
    if (
      brickEntityType
      && selectedEntityType
      && brickEntityType !== selectedEntityType
    ) {
      throw new PaymentPayloadError('payer_entity_type_mismatch');
    }
    const entityType = brickEntityType ?? selectedEntityType;
    if (!entityType) throw new PaymentPayloadError('payer_entity_type_invalid');

    const identification = requiredIdentification(payer.identification);
    if (entityType === 'association' && identification.type !== 'NIT') {
      throw new PaymentPayloadError('association_requires_nit');
    }
    if (entityType === 'individual' && identification.type === 'NIT') {
      throw new PaymentPayloadError('individual_identification_invalid');
    }

    const callbackUrl = requirePublicUrl(input.appUrl, 'callback_url_invalid');
    callbackUrl.pathname = '/checkout/pending';
    callbackUrl.search = '';
    callbackUrl.searchParams.set('checkout', input.checkoutToken);

    const firstName = optionalString(payer.first_name, 32);
    const lastName = optionalString(payer.last_name, 32);
    const payerIp = input.payerIp && isIP(input.payerIp) ? input.payerIp : undefined;

    return {
      ...commonBody(input, 'pse'),
      callback_url: callbackUrl.toString(),
      payer: {
        email: requiredEmail(payer.email),
        entity_type: entityType,
        identification,
        ...(firstName ? { first_name: firstName } : {}),
        ...(lastName ? { last_name: lastName } : {}),
      },
      transaction_details: {
        financial_institution: financialInstitution,
      },
      ...(payerIp ? { additional_info: { ip_address: payerIp } } : {}),
    };
  }

  if (selected === 'wallet_purchase') {
    throw new PaymentPayloadError('wallet_must_use_preference');
  }
  if (selected === 'ticket' || selected === 'atm') {
    throw new PaymentPayloadError('payment_method_not_enabled');
  }
  throw new PaymentPayloadError('selected_payment_method_invalid');
}

export function normalizeMercadoPagoApiError(error: unknown): MercadoPagoApiError {
  const metadata = record(error);
  const rawStatus = Number(
    metadata.status
      ?? record(metadata.api_response).status
      ?? 502,
  );
  const httpStatus = Number.isInteger(rawStatus) && rawStatus >= 400 && rawStatus <= 599
    ? rawStatus
    : 502;
  const cause = Array.isArray(metadata.cause)
    ? record(metadata.cause[0])
    : {};
  const statusDetail = optionalString(
    metadata.status_detail ?? cause.code ?? metadata.error,
    160,
  ) ?? 'unknown';
  const message = optionalString(
    metadata.message ?? cause.description,
    240,
  ) ?? 'No pudimos procesar el pago';
  const retryable = httpStatus === 408
    || httpStatus === 409
    || httpStatus === 425
    || httpStatus === 429
    || httpStatus >= 500;

  return {
    httpStatus,
    retryable,
    status: optionalString(metadata.status, 40) ?? (retryable ? 'error' : 'rejected'),
    statusDetail,
    message,
    metadata,
  };
}

export function safeMercadoPagoRedirectUrl(value: unknown) {
  if (typeof value !== 'string' || value.length > 2_048) return undefined;
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return undefined;
  }
  if (parsed.protocol !== 'https:') return undefined;
  const hostname = parsed.hostname.toLowerCase();
  const allowed = hostname === 'mercadopago.com'
    || hostname.endsWith('.mercadopago.com')
    || hostname === 'mercadopago.com.co'
    || hostname.endsWith('.mercadopago.com.co');
  return allowed ? parsed.toString() : undefined;
}
