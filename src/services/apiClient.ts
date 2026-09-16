/**
 * ──────────────────────────────────────────────────────────────
 *  MK EVENT — CLIENT HTTP CENTRALISÉ (prêt pour Django REST)
 * ──────────────────────────────────────────────────────────────
 *  Toutes les requêtes de l'application passent par ce module :
 *  • JSON entrant / sortant + `Authorization: Bearer <access>` ;
 *  • normalisation des erreurs DRF (`{ detail }` ou
 *    `{ champ: ["message"] }`) en une unique classe `ApiError`,
 *    consommée par les états loading/error des écrans ;
 *  • timeout via AbortController (compatible web & natif).
 * ──────────────────────────────────────────────────────────────
 */

import { API_BASE_URL, REQUEST_TIMEOUT_MS } from '@/constants/config';
import type { FieldError } from '@/types';
import { getAccessToken } from './sessionToken';

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

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  token?: string | null;
  headers?: Record<string, string>;
}

/** `AbortError` sans dépendre de DOMException (variable selon moteur). */
const isAbortError = (error: unknown): boolean =>
  typeof error === 'object' && error !== null && (error as { name?: string }).name === 'AbortError';

/** Transforme une réponse non-OK en `ApiError` (corps DRF ou générique). */
const toApiError = async (response: Response): Promise<ApiError> => {
  let detail = 'Une erreur est survenue. Merci de réessayer.';
  let fieldErrors: FieldError[] = [];

  try {
    const parsed: unknown = await response.json();
    if (parsed && typeof parsed === 'object') {
      const raw = parsed as Record<string, unknown>;
      if (typeof raw.detail === 'string') {
        detail = raw.detail;
      }
      if (Array.isArray(raw.errors)) {
        fieldErrors = raw.errors as FieldError[];
      } else {
        // Format DRF classique : { email: ["Cet e-mail existe déjà."] }
        fieldErrors = Object.entries(raw)
          .filter(([field, messages]) => field !== 'detail' && Array.isArray(messages))
          .map(([field, messages]) => ({
            field,
            message: String((messages as unknown[])[0]),
          }));
      }
    }
  } catch {
    // Corps non JSON (page HTML d'erreur…) — message générique conservé.
  }

  if (response.status === 401 && fieldErrors.length === 0 && detail === 'Une erreur est survenue. Merci de réessayer.') {
    detail = 'Identifiants incorrects. Vérifiez votre e-mail et votre mot de passe.';
  }
  return new ApiError(detail, response.status, fieldErrors);
};

const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { method = 'GET', body, token, headers } = options;
  const bearer = token === undefined ? getAccessToken() : token;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

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
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'DELETE' }),
};
