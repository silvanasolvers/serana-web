export const OFFICIAL_APP_ORIGIN = 'https://serana.food';
export const PASSWORD_RESET_PATH = '/reset-password';

export function getPasswordResetRedirectUrl() {
  if (typeof window === 'undefined') {
    return `${OFFICIAL_APP_ORIGIN}${PASSWORD_RESET_PATH}`;
  }

  const { hostname, origin } = window.location;
  const isLocalHost = hostname === 'localhost'
    || hostname === '127.0.0.1'
    || hostname === '::1'
    || hostname.endsWith('.local');

  return `${isLocalHost ? origin : OFFICIAL_APP_ORIGIN}${PASSWORD_RESET_PATH}`;
}

export function getAuthReturnParams() {
  if (typeof window === 'undefined') {
    return new URLSearchParams();
  }

  const params = new URLSearchParams(window.location.search);
  const hash = window.location.hash.replace(/^#/, '');
  const hashParams = new URLSearchParams(hash);

  hashParams.forEach((value, key) => {
    if (!params.has(key)) params.set(key, value);
  });

  return params;
}

export function hasPasswordRecoveryReturn() {
  const params = getAuthReturnParams();
  const type = params.get('type');
  const hasRecoveryToken = Boolean(
    params.get('code')
      || params.get('token_hash')
      || (params.get('access_token') && params.get('refresh_token')),
  );

  return type === 'recovery'
    || params.get('error_code') === 'otp_expired'
    || (hasRecoveryToken && typeof window !== 'undefined' && (
      window.location.pathname === '/'
      || window.location.pathname.includes('reset')
      || window.location.pathname.includes('callback')
      || window.location.pathname.includes('restablecer')
    ));
}

export function getPasswordRecoveryRouteWithParams() {
  if (typeof window === 'undefined') return PASSWORD_RESET_PATH;
  return `${PASSWORD_RESET_PATH}${window.location.search}${window.location.hash}`;
}

export function replaceWithCleanPasswordResetUrl() {
  if (typeof window === 'undefined') return;
  window.history.replaceState({}, document.title, PASSWORD_RESET_PATH);
}
