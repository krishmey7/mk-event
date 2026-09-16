/**
 * ──────────────────────────────────────────────────────────────
 *  MK EVENT — SERVICE D'AUTHENTIFICATION
 * ──────────────────────────────────────────────────────────────
 *  Prêt pour le backend Django :
 *  • login    → POST /api/auth/login/    (simplejwt, champ identifier) ;
 *  • register → POST /api/auth/register/.
 *
 *  En attendant, `SIMULATE_BACKEND` (src/constants/config.ts) renvoie
 *  une session fictive après une latence réaliste : les écrans sont
 *  démontrables de bout en bout et les signatures resteront
 *  strictement identiques au branchement DRF.
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

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/* ─────────────── Simulation (backend à venir) ─────────────── */

const buildMockSession = (payload: LoginPayload | RegisterPayload): AuthSession => {
  const email = 'email' in payload ? payload.email : `${payload.identifier}@mkevent.app`;
  const fullName = 'full_name' in payload ? payload.full_name : 'Sarah Morgan';
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
 * Connexion — `identifier` = e-mail OU numéro de téléphone (maquette).
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
