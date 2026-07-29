export type BrowserStorageKind = 'localStorage' | 'sessionStorage';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isBrowserUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_PATTERN.test(value);
}

export function createBrowserUuid() {
  const cryptoApi = globalThis.crypto;
  if (typeof cryptoApi?.randomUUID === 'function') {
    return cryptoApi.randomUUID();
  }
  if (typeof cryptoApi?.getRandomValues !== 'function') {
    throw new Error('secure_random_unavailable');
  }

  const bytes = cryptoApi.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0'));
  return [
    hex.slice(0, 4).join(''),
    hex.slice(4, 6).join(''),
    hex.slice(6, 8).join(''),
    hex.slice(8, 10).join(''),
    hex.slice(10, 16).join(''),
  ].join('-');
}

function browserStorage(kind: BrowserStorageKind) {
  if (typeof window === 'undefined') return null;
  try {
    return window[kind];
  } catch {
    return null;
  }
}

export function readBrowserStorage(kind: BrowserStorageKind, key: string) {
  try {
    return browserStorage(kind)?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function writeBrowserStorage(
  kind: BrowserStorageKind,
  key: string,
  value: string,
) {
  try {
    browserStorage(kind)?.setItem(key, value);
  } catch {
    // Safari private mode and embedded webviews may deny storage. The
    // server-side checkout mutex still keeps retries idempotent.
  }
}

export function removeBrowserStorage(kind: BrowserStorageKind, key: string) {
  try {
    browserStorage(kind)?.removeItem(key);
  } catch {
    // Best-effort cleanup only.
  }
}
