/**
 * Jetons JWT courants — renseignés par AuthContext / refresh, lus par apiClient.
 */

let accessToken: string | null = null;
let refreshToken: string | null = null;

/** Callback pour persister un access (et refresh optionnel) après refresh API. */
type TokensListener = (tokens: { access: string; refresh?: string }) => void;
let onTokensRefreshed: TokensListener | null = null;

/** Callback quand le refresh échoue — AuthContext déconnecte. */
type SessionClearedListener = () => void;
let onSessionCleared: SessionClearedListener | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function setRefreshToken(token: string | null): void {
  refreshToken = token;
}

export function getRefreshToken(): string | null {
  return refreshToken;
}

export function setSessionTokens(tokens: { access: string; refresh: string } | null): void {
  accessToken = tokens?.access ?? null;
  refreshToken = tokens?.refresh ?? null;
}

export function setOnTokensRefreshed(listener: TokensListener | null): void {
  onTokensRefreshed = listener;
}

export function setOnSessionCleared(listener: SessionClearedListener | null): void {
  onSessionCleared = listener;
}

export function notifyTokensRefreshed(tokens: { access: string; refresh?: string }): void {
  accessToken = tokens.access;
  if (tokens.refresh) refreshToken = tokens.refresh;
  onTokensRefreshed?.(tokens);
}

export function notifySessionCleared(): void {
  accessToken = null;
  refreshToken = null;
  onSessionCleared?.();
}
