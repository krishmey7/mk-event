/** Jeton personnalisé dans le message invité — remplacé par le prénom à l’envoi. */
export const GUEST_NAME_TOKEN = '{{Nom}}';

/**
 * Empêche de modifier ou supprimer `{{Nom}}`.
 * Toute saisie qui casse le jeton est ignorée (on garde la valeur précédente).
 */
export function lockGuestNameToken(next: string, previous: string): string {
  if (next.includes(GUEST_NAME_TOKEN)) return next;
  if (previous.includes(GUEST_NAME_TOKEN)) return previous;
  return ensureGuestNameToken(next);
}

export function ensureGuestNameToken(value: string): string {
  if (value.includes(GUEST_NAME_TOKEN)) return value;
  const base = value.trimEnd();
  return base ? `${base} ${GUEST_NAME_TOKEN}` : GUEST_NAME_TOKEN;
}

/** Remplace `{{Nom}}` par le prénom de l’invité (affichage invitation). */
export function fillGuestNameToken(text: string, firstName: string): string {
  const name = firstName.trim() || 'invité(e)';
  return text.replace(/\{\{\s*Nom\s*\}\}/gi, name);
}
