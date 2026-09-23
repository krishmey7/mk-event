/**
 * ──────────────────────────────────────────────────────────────
 *  MK EVENTS — CLIENT HTTP CENTRALISÉ (prêt pour Django REST)
 * ──────────────────────────────────────────────────────────────
 *  Toutes les requêtes de l'application passent par ce module :
 *  • JSON entrant / sortant + `Authorization: Bearer <access>` ;
 *  • refresh JWT automatique sur 401 (une fois) ;
 *  • normalisation des erreurs DRF (`{ detail }` ou
 *    `{ champ: ["message"] }`) en une unique classe `ApiError`,
 *    consommée par les états loading/error des écrans ;
 *  • timeout via AbortController (compatible web & natif).
 * ──────────────────────────────────────────────────────────────
 */

import { API_BASE_URL, AUTH_ENDPOINTS, REQUEST_TIMEOUT_MS } from '@/constants/config';
import type { FieldError } from '@/types';
import {
  getAccessToken,
  getRefreshToken,
  notifySessionCleared,
  notifyTokensRefreshed,
} from './sessionToken';

/** Erreur normalisée — les écrans n'attendent que celle-ci. */
export class ApiError extends Error {
  /** Statut HTTP (0 = réseau injoignable / timeout). */
  readonly status: number;
  /** Erreurs de validation par champ (400 DRF). */
  readonly fieldErrors: FieldError[];

  constructor(message: string, status = 0, fieldErrors: FieldError[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }

  /** Message d'erreur d'un champ précis (ex. « email », « password »). */
  messageForField(field: string): string | undefined {
    return this.fieldErrors.find((error) => error.field === field)?.message;
  }
}

/** Extrait un message lisible depuis n’importe quelle forme DRF / JS (évite `[object Object]`). */
export function formatApiMessage(value: unknown, depth = 0): string | null {
  if (value == null || depth > 6) return null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed || trimmed === '[object Object]') return null;
    return trimmed;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = formatApiMessage(item, depth + 1);
      if (found) return found;
    }
    return null;
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    for (const key of ['detail', 'message', 'error', 'non_field_errors', 'string'] as const) {
      if (key in record) {
        const found = formatApiMessage(record[key], depth + 1);
        if (found) return found;
      }
    }
    for (const nested of Object.values(record)) {
      const found = formatApiMessage(nested, depth + 1);
      if (found) return found;
    }
  }
  return null;
}

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  /** Corps FormData — ne pas forcer Content-Type JSON. */
  formData?: FormData;
  token?: string | null;
  headers?: Record<string, string>;
  /** Interne — ne pas relancer un refresh sur le retry. */
  _retried?: boolean;
}

/** `AbortError` sans dépendre de DOMException (variable selon moteur). */
const isAbortError = (error: unknown): boolean =>
  typeof error === 'object' && error !== null && (error as { name?: string }).name === 'AbortError';

/** Transforme une réponse non-OK en `ApiError` (corps DRF ou générique). */
const toApiError = async (response: Response): Promise<ApiError> => {
  let detail = 'Une erreur est survenue. Merci de réessayer.';
  let fieldErrors: FieldError[] = [];

  if (response.status === 413) {
    return new ApiError(
      'Les photos sont trop lourdes pour être publiées. Réduisez la galerie ou réessayez.',
      413,
    );
  }

  try {
    const parsed: unknown = await response.json();
    if (parsed && typeof parsed === 'object') {
      const raw = parsed as Record<string, unknown>;
      const fromDetail = formatApiMessage(raw.detail);
      if (fromDetail) detail = fromDetail;

      if (Array.isArray(raw.errors)) {
        const parsedErrors: FieldError[] = [];
        for (const item of raw.errors as unknown[]) {
          if (item && typeof item === 'object' && 'field' in item && 'message' in item) {
            const message = formatApiMessage((item as FieldError).message);
            if (message) {
              parsedErrors.push({ field: String((item as FieldError).field ?? 'detail'), message });
            }
            continue;
          }
          const message = formatApiMessage(item);
          if (message) parsedErrors.push({ field: 'detail', message });
        }
        fieldErrors = parsedErrors;
      } else {
        const parsedErrors: FieldError[] = [];
        for (const [field, messages] of Object.entries(raw)) {
          if (field === 'detail' || field === 'errors') continue;
          const message = formatApiMessage(messages);
          if (message) parsedErrors.push({ field, message });
        }
        fieldErrors = parsedErrors;
      }
    }
  } catch {
    // Corps non JSON (page HTML d'erreur…) — message générique conservé.
  }

  if (response.status === 401 && fieldErrors.length === 0 && detail === 'Une erreur est survenue. Merci de réessayer.') {
    detail = 'Identifiants incorrects. Vérifiez votre e-mail et votre mot de passe.';
  }
  if (response.status === 403 && detail === 'Une erreur est survenue. Merci de réessayer.') {
    detail = 'Action non autorisée. Reconnectez-vous puis réessayez.';
  }
  if (
    fieldErrors.length > 0
    && detail === 'Une erreur est survenue. Merci de réessayer.'
  ) {
    detail = fieldErrors[0].message;
  }
  return new ApiError(detail, response.status, fieldErrors);
};

/** Un seul refresh en vol pour toutes les requêtes concurrentes. */
let refreshInFlight: Promise<string | null> | null = null;

const AUTH_SKIP_REFRESH = new Set<string>([
  AUTH_ENDPOINTS.login,
  AUTH_ENDPOINTS.register,
  AUTH_ENDPOINTS.tokenRefresh,
  AUTH_ENDPOINTS.passwordReset,
  AUTH_ENDPOINTS.passwordResetConfirm,
  AUTH_ENDPOINTS.google,
]);

async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const refresh = getRefreshToken();
    if (!refresh) {
      notifySessionCleared();
      return null;
    }
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      try {
        const response = await fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.tokenRefresh}`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh }),
          signal: controller.signal,
        });
        if (!response.ok) {
          notifySessionCleared();
          return null;
        }
        const data = (await response.json()) as { access?: string; refresh?: string };
        if (!data.access) {
          notifySessionCleared();
          return null;
        }
        notifyTokensRefreshed({
          access: data.access,
          ...(data.refresh ? { refresh: data.refresh } : {}),
        });
        return data.access;
      } finally {
        clearTimeout(timeoutId);
      }
    } catch {
      notifySessionCleared();
      return null;
    }
  })().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
}

const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { method = 'GET', body, formData, token, headers, _retried } = options;
  const bearer = token === undefined ? getAccessToken() : token;
  const isMultipart = formData !== undefined;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(isMultipart || body === undefined
          ? {}
          : { 'Content-Type': 'application/json' }),
        ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
        ...headers,
      },
      body: isMultipart
        ? formData
        : body !== undefined
          ? JSON.stringify(body)
          : undefined,
      signal: controller.signal,
    });

    if (
      response.status === 401
      && !_retried
      && token === undefined
      && Boolean(bearer)
      && !AUTH_SKIP_REFRESH.has(path)
    ) {
      const nextAccess = await refreshAccessToken();
      if (nextAccess) {
        return request<T>(path, { ...options, _retried: true });
      }
    }

    if (!response.ok) {
      throw await toApiError(response);
    }
    if (response.status === 204) {
      return undefined as T;
    }
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (isAbortError(error)) {
      throw new ApiError('La requête a expiré. Vérifiez votre connexion puis réessayez.');
    }
    throw new ApiError(
      'Impossible de joindre le serveur. Vérifiez votre connexion ou réessayez plus tard.',
    );
  } finally {
    clearTimeout(timeoutId);
  }
};

/** API publique du client HTTP. */
export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  postForm: <T>(path: string, formData: FormData, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', formData }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'DELETE' }),
};
