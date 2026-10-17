/**
 * Formatage partagé du dress code sur les couvertures.
 */

export function formatDressCode(value?: string | null): string | null {
  const dress = (value ?? '').trim();
  if (!dress) return null;
  if (/^dress\s*code/i.test(dress)) return dress;
  return `Dress code · ${dress}`;
}
