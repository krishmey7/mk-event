/**
 * ──────────────────────────────────────────────────────────────
 *  MK EVENTS — VALIDATION LOCALE DES FORMULAIRES
 * ──────────────────────────────────────────────────────────────
 *  Règles simples côté client (les mêmes contraintes restent
 *  validées côté Django — jamais de confiance aveugle au client).
 * ──────────────────────────────────────────────────────────────
 */

/** E-mail simple (nom@domaine.tld) — la confirmation officielle passe par un e-mail de vérification. */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Téléphone : chiffres, espaces, points, tirets, préfixe + optionnel. */
const PHONE_REGEX = /^[+0-9][0-9\s.-]{5,}$/;

export const isValidEmail = (value: string): boolean => EMAIL_REGEX.test(value.trim());

/** Champ « Email ou numéro de téléphone » de la maquette Login. */
export const isValidIdentifier = (value: string): boolean =>
  isValidEmail(value) || PHONE_REGEX.test(value.trim());

/** Mot de passe : 8 caractères minimum. */
export const isValidPassword = (value: string): boolean => value.length >= 8;

export const isValidFullName = (value: string): boolean => value.trim().length >= 2;

export const passwordsMatch = (password: string, confirm: string): boolean =>
  password.length > 0 && password === confirm;
