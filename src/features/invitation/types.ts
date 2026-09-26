/**
 * MK EVENTS — Workflow invité · types partagés organisateur ↔ invité.
 */

/** Invité d'une invitation (créé côté organisateur). */
export interface Guest {
  /** Identifiant studio stable — « INV-1234 » (studio_key Django). */
  id: string;
  /** Jeton Django `access_token` — utilisé pour lien/QR après publication. */
  accessToken?: string;
  firstName: string;
  lastName: string;
  /** Téléphone ou email de l'invité. */
  contact: string;
  /** Nombre de places attribuées (limite du stepper RSVP). */
  seats: number;
}

/** Réponse RSVP d'un invité (validée depuis son lien personnel). */
export interface RsvpAnswer {
  guestId: string;
  attending: 'yes' | 'no';
  guestsCount: number;
  menu: string | null;
  drink: string | null;
  /** Régimes cochés par l'invité (liste configurée par l'organisateur). */
  diets: string[];
  allergies: string;
}

/* ── Effets d'apparition au défilement ── */

export type RevealEffectKey = 'fade' | 'slideup' | 'zoom' | 'bounce' | 'snowfall' | 'drift' | 'sparkle' | 'none';

export interface RevealEffectOption {
  key: RevealEffectKey;
  label: string;
  hint: string;
  icon: string;
}

/** Les 5 styles proposés à l'organisateur dans l'éditeur. */
export const REVEAL_EFFECTS: RevealEffectOption[] = [
  { key: 'fade', label: 'Douceur', hint: 'Fondu délicat', icon: 'sparkles-outline' },
  { key: 'slideup', label: 'Élévation', hint: 'Glissé du bas', icon: 'arrow-up-circle-outline' },
  { key: 'zoom', label: 'Focus', hint: 'Zoom progressif', icon: 'search-outline' },
  { key: 'bounce', label: 'Moderne', hint: 'Rebond discret', icon: 'pulse-outline' },
  { key: 'snowfall', label: 'Neige', hint: 'Descente légère', icon: 'snow-outline' },
  { key: 'drift', label: 'Vent', hint: 'Glissé de côté', icon: 'reorder-four-outline' },
  { key: 'sparkle', label: 'Éclat', hint: 'Apparition lumineuse', icon: 'star-outline' },
  { key: 'none', label: 'Aucun', hint: 'Affichage fixe', icon: 'ban-outline' },
];

/** Valide une clé d'effet (config publiée / URL). */
export function normalizeRevealEffect(value?: string | null): RevealEffectKey {
  return REVEAL_EFFECTS.some((option) => option.key === value)
    ? (value as RevealEffectKey)
    : 'fade';
}

/* ── Photo du couple — styles de cadre ── */

export type PhotoFrameKey =
  | 'circle'
  | 'circleFloral'
  | 'heart'
  | 'heartFloral'
  | 'soft'
  | 'hex'
  | 'hexFloral';

export interface PhotoFrameOption {
  key: PhotoFrameKey;
  label: string;
  hint: string;
  icon: string;
}

const PHOTO_FRAME_KEYS: PhotoFrameKey[] = [
  'circle', 'circleFloral', 'heart', 'heartFloral', 'soft', 'hex', 'hexFloral',
];

/** Cadres Élégance — rétrocompatibilité ; préférer `template.photoFrames`. */
export const PHOTO_FRAMES: PhotoFrameOption[] = [
  { key: 'circle', label: 'Cercle minimaliste', hint: 'Bordure fine dorée', icon: 'ellipse-outline' },
  { key: 'circleFloral', label: 'Cercle floral', hint: 'Fleurs autour', icon: 'flower-outline' },
  { key: 'heart', label: 'Cœur élégant', hint: 'Cœur épuré', icon: 'heart-outline' },
  { key: 'heartFloral', label: 'Cœur floral', hint: 'Cœur orné de fleurs', icon: 'heart-circle-outline' },
  { key: 'soft', label: 'Sans cadre', hint: 'Bordures adoucies', icon: 'square-outline' },
];

export function normalizePhotoFrame(value?: string | null, templateKey?: string | null): PhotoFrameKey {
  if (value && PHOTO_FRAME_KEYS.includes(value as PhotoFrameKey)) {
    return value as PhotoFrameKey;
  }
  if (templateKey === 'hiver') return 'hexFloral';
  if (templateKey === 'editorial') return 'soft';
  if (templateKey === 'herbier') return 'circleFloral';
  return 'circle';
}

/** Photo du couple — URI + cadre choisi par l'organisateur. */
export interface CouplePhoto {
  uri: string;
  frame: PhotoFrameKey;
}

/* ── Style d'affichage de la galerie ── */

export type GalleryStyleKey = 'grid' | 'slider' | 'masonry';

export interface GalleryStyleOption {
  key: GalleryStyleKey;
  label: string;
  hint: string;
  icon: string;
}

export const GALLERY_STYLES: GalleryStyleOption[] = [
  { key: 'grid', label: 'Grille', hint: 'Mosaïque de cartes', icon: 'grid-outline' },
  { key: 'slider', label: 'Carrousel', hint: 'Défilement horizontal', icon: 'swap-horizontal-outline' },
  { key: 'masonry', label: 'Maçonnerie', hint: 'Style Pinterest', icon: 'apps-outline' },
];

export function normalizeGalleryStyle(value?: string | null): GalleryStyleKey {
  return GALLERY_STYLES.some((option) => option.key === value)
    ? (value as GalleryStyleKey)
    : 'masonry';
}

/* ── Lieu du mariage ── */

export interface Venue {
  /** Nom du domaine / de la salle. */
  name: string;
  /** Rue, numéro… */
  street: string;
  /** Code postal. */
  zip: string;
  /** Ville. */
  city: string;
  /** Latitude WGS84 — null si non localisé. */
  lat: number | null;
  /** Longitude WGS84 — null si non localisé. */
  lng: number | null;
}

/** True si le lieu a un pin carte utilisable. */
export function venueHasCoords(venue: Pick<Venue, 'lat' | 'lng'>): boolean {
  return (
    typeof venue.lat === 'number'
    && typeof venue.lng === 'number'
    && Number.isFinite(venue.lat)
    && Number.isFinite(venue.lng)
  );
}

/** Normalise un venue partiel (anciens snapshots sans lat/lng). */
export function normalizeVenue(input?: Partial<Venue> | null, fallback: Venue = {
  name: '',
  street: '',
  zip: '',
  city: '',
  lat: null,
  lng: null,
}): Venue {
  return {
    name: input?.name ?? fallback.name,
    street: input?.street ?? fallback.street,
    zip: input?.zip ?? fallback.zip,
    city: input?.city ?? fallback.city,
    lat: typeof input?.lat === 'number' && Number.isFinite(input.lat) ? input.lat : (fallback.lat ?? null),
    lng: typeof input?.lng === 'number' && Number.isFinite(input.lng) ? input.lng : (fallback.lng ?? null),
  };
}

/** Adresse complète lisible — pour la carte et l'itinéraire. */
export function venueFullAddress(venue: Venue): string {
  return [venue.name, venue.street, [venue.zip, venue.city].filter(Boolean).join(' ')]
    .filter((part) => part.trim().length > 0)
    .join(', ');
}

/** URL d’itinéraire (OSM / Apple / Google selon plateforme). */
export function venueDirectionsUrl(venue: Venue, platform: 'ios' | 'android' | 'web' = 'web'): string {
  if (venueHasCoords(venue)) {
    const { lat, lng } = venue;
    if (platform === 'ios') {
      return `https://maps.apple.com/?daddr=${lat},${lng}`;
    }
    if (platform === 'android') {
      return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    }
    return `https://www.openstreetmap.org/directions?to=${lat}%2C${lng}#map=16/${lat}/${lng}`;
  }
  const query = encodeURIComponent(venueFullAddress(venue));
  if (platform === 'ios') return `https://maps.apple.com/?q=${query}`;
  if (platform === 'android') return `https://www.google.com/maps/search/?api=1&query=${query}`;
  return `https://www.openstreetmap.org/search?query=${query}`;
}