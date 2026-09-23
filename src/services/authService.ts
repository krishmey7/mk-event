/**
 * ──────────────────────────────────────────────────────────────
 *  MK EVENTS — SERVICE D'AUTHENTIFICATION
 * ──────────────────────────────────────────────────────────────
 *  login / register / password-reset / google → API Django.
 *  `SIMULATE_BACKEND` renvoie une session fictive pour la démo.
 * ──────────────────────────────────────────────────────────────
 */

import { apiClient } from './apiClient';
import { AUTH_ENDPOINTS, SIMULATE_BACKEND } from '@/constants/config';
import type { AuthTokens, LoginPayload, RegisterPayload, User } from '@/types';

/** Session renvoyée après une authentification réussie. */
export interface AuthSession {
  user: User;
  tokens: AuthTokens;
}

export interface PasswordResetRequestPayload {
  email: string;
}

export interface PasswordResetConfirmPayload {
  uid: string;
  token: string;
  password: string;
  password_confirm: string;
}

export interface PasswordResetMessage {
  detail: string;
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/* ─────────────── Simulation (backend à venir) ─────────────── */

const buildMockSession = (payload: LoginPayload | RegisterPayload | { email: string; full_name?: string }): AuthSession => {
  const email =
    'email' in payload
      ? payload.email
      : 'identifier' in payload
        ? `${payload.identifier}@mkevent.app`
        : 'demo@mkevent.app';
  const fullName =
    'full_name' in payload && payload.full_name
      ? payload.full_name
      : 'Sarah Morgan';
  const now = new Date().toISOString();

  return {
    user: {
      id: 1,
      email,
      phone: null,
      full_name: fullName,
      avatar_url: null,
      role: 'organizer',
      is_active: true,
      date_joined: now,
    },
    tokens: {
      access: 'simulated.access.token',
      refresh: 'simulated.refresh.token',
    },
  };
};

/* ─────────────────────── API publique ─────────────────────── */

/**
 * Connexion — `identifier` = e-mail OU numéro de téléphone.
 * POST /api/auth/login/
 */
export async function login(payload: LoginPayload): Promise<AuthSession> {
  if (SIMULATE_BACKEND) {
    await delay(900);
    return buildMockSession(payload);
  }
  return apiClient.post<AuthSession>(AUTH_ENDPOINTS.login, payload);
}

/**
 * Inscription.
 * POST /api/auth/register/
 */
export async function register(payload: RegisterPayload): Promise<AuthSession> {
  if (SIMULATE_BACKEND) {
    await delay(1_100);
    return buildMockSession(payload);
  }
  return apiClient.post<AuthSession>(AUTH_ENDPOINTS.register, payload);
}

/**
 * Demande de réinitialisation — toujours un message neutre (anti-énumération).
 * POST /api/auth/password-reset/
 */
export async function requestPasswordReset(
  payload: PasswordResetRequestPayload,
): Promise<PasswordResetMessage> {
  if (SIMULATE_BACKEND) {
    await delay(800);
    return {
      detail:
        'Si un compte existe pour cet e-mail, un lien de réinitialisation vient d’être envoyé.',
    };
  }
  return apiClient.post<PasswordResetMessage>(AUTH_ENDPOINTS.passwordReset, payload);
}

/**
 * Confirme un nouveau mot de passe via le lien e-mail (uid + token).
 * POST /api/auth/password-reset/confirm/
 */
export async function confirmPasswordReset(
  payload: PasswordResetConfirmPayload,
): Promise<PasswordResetMessage> {
  if (SIMULATE_BACKEND) {
    await delay(900);
    return { detail: 'Mot de passe mis à jour. Vous pouvez vous connecter.' };
  }
  return apiClient.post<PasswordResetMessage>(AUTH_ENDPOINTS.passwordResetConfirm, payload);
}

/**
 * Connexion Google via id_token (OIDC).
 * POST /api/auth/google/
 */
export async function loginWithGoogle(idToken: string): Promise<AuthSession> {
  if (SIMULATE_BACKEND) {
    await delay(900);
    return buildMockSession({ email: 'google.user@gmail.com', full_name: 'Compte Google' });
  }
  return apiClient.post<AuthSession>(AUTH_ENDPOINTS.google, { id_token: idToken });
}

/**
 * Renouvelle l’access JWT.
 * POST /api/auth/token/refresh/
 */
export async function refreshTokens(refresh: string): Promise<{ access: string; refresh?: string }> {
  if (SIMULATE_BACKEND) {
    await delay(200);
    return { access: 'simulated.access.token', refresh };
  }
  return apiClient.post<{ access: string; refresh?: string }>(
    AUTH_ENDPOINTS.tokenRefresh,
    { refresh },
    { token: null },
  );
}
