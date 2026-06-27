export const CHECKOUT_SOURCE_KEY = 'serana:checkout:source';

export type CheckoutSource = 'web' | 'whatsapp_bot';

export function markCheckoutFromBot() {
  try {
    sessionStorage.setItem(CHECKOUT_SOURCE_KEY, 'whatsapp_bot');
  } catch {
    // sessionStorage can be blocked in private contexts.
  }
}

export function readCheckoutSource(): CheckoutSource {
  try {
    return sessionStorage.getItem(CHECKOUT_SOURCE_KEY) === 'whatsapp_bot'
      ? 'whatsapp_bot'
      : 'web';
  } catch {
    return 'web';
  }
}

export function clearCheckoutSource() {
  try {
    sessionStorage.removeItem(CHECKOUT_SOURCE_KEY);
  } catch {
    // ignore
  }
}
