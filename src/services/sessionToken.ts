/**
 * Jeton d’accès JWT courant — renseigné par AuthContext, lu par apiClient.
 */

let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}
