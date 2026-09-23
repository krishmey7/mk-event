/**
 * ──────────────────────────────────────────────────────────────
 *  MK EVENTS — CONFIGURATION APPLICATIVE
 * ──────────────────────────────────────────────────────────────
 *  Réglages centralisés consommés par la couche `services`.
 *  L'URL de l'API Django est surchargeable sans recompilation via
 *  la variable d'environnement Expo `EXPO_PUBLIC_API_URL`
 *  (fichier `.env.local` à la racine — ex. http://192.168.1.20:8000/api).
 * ──────────────────────────────────────────────────────────────
 */

/**
 * URL de base de l'API Django REST Framework (sans slash final).
 * Prod (Vercel) : définir EXPO_PUBLIC_API_URL=https://<api-railway>/api
 */
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api';

/** Endpoints d'authentification (DRF + simplejwt). */
export const AUTH_ENDPOINTS = {
  login: '/auth/login/',
  register: '/auth/register/',
  tokenRefresh: '/auth/token/refresh/',
  passwordReset: '/auth/password-reset/',
  passwordResetConfirm: '/auth/password-reset/confirm/',
  google: '/auth/google/',
} as const;

/**
 * Tant que le backend Django n'est pas démarré localement, laisser à `true`.
 * Pour brancher l'API : `cd backend && uv run python manage.py runserver`
 * puis passer à `false` (et éventuellement EXPO_PUBLIC_API_URL).
 */
export const SIMULATE_BACKEND = false;

/**
 * Client OAuth Google (type Web). Absent → bouton Google désactivé.
 * Vercel : EXPO_PUBLIC_GOOGLE_CLIENT_ID
 */
export const GOOGLE_CLIENT_ID = (process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '').trim();

/** Durée maximale d'une requête HTTP avant abort (ms). Publication peut être lourde. */
export const REQUEST_TIMEOUT_MS = 60_000;
