/**
 * MK EVENTS — QR déterministe (zéro dépendance).
 * Motif de démonstration stable à partir d'une graine (guestId,
 * slug…) : le QR final scannable sera généré par le serveur.
 */

/** Hash FNV-1a 32 bits — graine stable pour le générateur. */
export function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

/** Grille déterministe (motifs de repère aux 3 coins, comme un QR). */
export function qrCells(seed: string, size = 21): boolean[] {
  let state = fnv1a(seed) || 1;
  const rand = () => {
    state = (Math.imul(state, 1103515245) + 12345) % 2147483648;
    return state / 2147483648 > 0.52;
  };
  const cells = Array.from({ length: size * size }, () => rand());
  const finder = (ox: number, oy: number) => {
    for (let y = 0; y < 7; y += 1) {
      for (let x = 0; x < 7; x += 1) {
        const edge = x === 0 || x === 6 || y === 0 || y === 6;
        const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        cells[(oy + y) * size + (ox + x)] = edge || core;
      }
    }
  };
  finder(0, 0);
  finder(size - 7, 0);
  finder(0, size - 7);
  return cells;
}

/** « INV-1234 », « INV-1235 »… */
export function makeGuestId(index: number): string {
  return `INV-${1234 + index}`;
}

/** « Léa & Thomas » → « lea-thomas » (accents retirés). */
export function slugifyCouple(couple: string): string {
  return couple
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'invitation';
}

/** Jeton utilisé dans les liens / QR (access_token Django, sinon id studio). */
export function guestAccessKey(guest: { id: string; accessToken?: string }): string {
  return guest.accessToken?.trim() || guest.id;
}

/**
 * Lien personnel — préfère `?guest=` (access_token Django).
 * Base surchargeable via EXPO_PUBLIC_INVITE_BASE.
 */
export function buildGuestLink(slug: string, accessKey: string): string {
  const base =
    process.env.EXPO_PUBLIC_INVITE_BASE
    ?? (typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://mkevent.app');
  return `${base.replace(/\/$/, '')}/inv/${slug}?guest=${encodeURIComponent(accessKey)}`;
}