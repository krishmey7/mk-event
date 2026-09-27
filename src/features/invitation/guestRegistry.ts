/**
 * MK EVENTS — Registre partagé organisateur → invité (local).
 * Le studio publie la config ; /inv/{slug} la consomme.
 * Sans backend, un jeu de démonstration garantit un lien consultable.
 */

import type { Guest, Venue } from './types';
import type { ProgramStep, StoryMilestone } from '@/features/templates/elegance/data';
import { GALLERY, IMAGES, PROGRAM, STORY, WEDDING } from '@/features/templates/elegance/data';

export interface InvitationCoverPayload {
  title: string;
  dateLabel: string;
  couple: string;
  guestLine: string;
  kicker: string;
  photoUri: string;
}

export interface InvitationConfig {
  templateKey: string;
  guests: Guest[];
  drinks: string[];
  diets: string[];
  themeKey: string;
  revealEffect: string;
  galleryStyle: string;
  venue: Venue;
  couplePhoto: { uri: string; frame: string };
  dressCode: string;
  cover: InvitationCoverPayload;
  story: StoryMilestone[];
  program: ProgramStep[];
  gallery: { uri: string; category: string }[];
  countdownImage: string;
  /** Voix & musique — optionnel (anciennes configs sans le champ). */
  voix?: {
    musicKey: string;
    ambientUri?: string | null;
    ambientName?: string | null;
    autoplay: boolean;
    loop: boolean;
    voiceGreeting: boolean;
    voicePersona?: 'mariage' | 'anniversaire' | 'conference';
  };
  /** Intervenants (conférence). */
  speakers?: {
    id: string;
    name: string;
    role: string;
    bio: string;
    photoUri?: string;
  }[];
  /** Infos pratiques (conférence). */
  practical?: {
    access?: string;
    parking?: string;
    hotel?: string;
  };
}

export const DEFAULT_DRINKS: string[] = [
  'Champagne',
  'Vin rouge',
  'Cocktail sans alcool',
  'Soda',
  'Eau pétillante',
];

/** Régimes alimentaires proposés par défaut (cases à cocher de l'invité). */
export const DEFAULT_DIETS: string[] = [
  'Sans porc',
  'Halal',
  'Végétarien',
  'Végan',
  'Sans gluten',
];

/** Photo du couple par défaut — libre de droit + cadre minimaliste. */
export const DEFAULT_COUPLE_PHOTO = {
  uri: 'https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?auto=format&fit=crop&w=600&q=80',
  frame: 'circle',
};

/** Lieu de démonstration (Domaine des Roseaux — pré-rempli dans l'éditeur). */
export const DEFAULT_VENUE: Venue = {
  name: 'Domaine des Roseaux',
  street: '12 allée des Tilleuls',
  zip: '78100',
  city: 'Saint-Germain-en-Laye',
  lat: 48.8989,
  lng: 2.0938,
};

/**
 * Invités d’exemple pour aperçus / fallback — prénoms distincts du
 * compte démo organisateur (Sarah Morgan) pour ne pas confondre.
 */
export const DEMO_GUESTS: Guest[] = [
  { id: 'INV-1234', firstName: 'Camille', lastName: 'Moreau', contact: 'camille.moreau@email.fr', seats: 2 },
  { id: 'INV-1235', firstName: 'Marc', lastName: 'Lefèvre', contact: '06 12 34 56 78', seats: 4 },
  { id: 'INV-1236', firstName: 'Emma', lastName: 'Petit', contact: 'emma.petit@email.fr', seats: 1 },
];

/** Invité d’aperçu studio (message « Bienvenue, … » avant la vraie liste). */
export const STUDIO_PREVIEW_GUEST: Guest = DEMO_GUESTS[0];

const store = new Map<string, InvitationConfig>();

/** Publié par l'éditeur à chaque modification (temps réel). */
export function publishInvitationConfig(slug: string, config: InvitationConfig): void {
  store.set(slug, config);
}

/** Configuration effective — repli sur la démo si inconnue. */
export function getInvitationConfig(slug: string): InvitationConfig {
  return (
    store.get(slug) ?? {
      templateKey: 'elegance',
      guests: DEMO_GUESTS,
      drinks: DEFAULT_DRINKS,
      diets: DEFAULT_DIETS,
      themeKey: 'champagne',
      revealEffect: 'fade',
      galleryStyle: 'masonry',
      venue: DEFAULT_VENUE,
      couplePhoto: DEFAULT_COUPLE_PHOTO,
      dressCode: '',
      cover: {
        title: 'Save the Date',
        dateLabel: WEDDING.dateLabel,
        couple: WEDDING.couple,
        guestLine: WEDDING.guestSentence,
        kicker: '',
        photoUri: IMAGES.cover,
      },
      story: STORY,
      program: PROGRAM,
      gallery: GALLERY.map((item) => ({ uri: item.uri, category: item.category })),
      countdownImage: IMAGES.countdown,
    }
  );
}

/** Résout l'invité depuis ?guestId= — repli sur le premier / l’échantillon studio. */
export function resolveGuest(config: InvitationConfig, guestId?: string | string[]): Guest {
  const id = Array.isArray(guestId) ? guestId[0] : guestId;
  return (
    config.guests.find((guest) => guest.id === id) ??
    config.guests[0] ??
    STUDIO_PREVIEW_GUEST
  );
}

/** Config démo pour l’aperçu catalogue = même rendu que la vue invité. */
export function buildCatalogPreviewConfig(
  template: {
    key: string;
    coverImage: string;
    countdownImage: string;
    galleryImages: string[];
    couplePhoto: { uri: string; frame: string };
    story: StoryMilestone[];
    program: ProgramStep[];
    defaultCover: {
      title: string;
      dateLabel: string;
      couple: string;
      guestLine: string;
    };
    defaultThemeKey: string;
    defaultKicker?: string;
    defaultVenue?: {
      name: string;
      street: string;
      zip: string;
      city: string;
      lat?: number | null;
      lng?: number | null;
    };
  },
  eventThemeKey?: string | null,
): InvitationConfig {
  const themeKey = (eventThemeKey ?? '').trim() || template.defaultThemeKey;
  const venue: Venue = template.defaultVenue
    ? {
        name: template.defaultVenue.name,
        street: template.defaultVenue.street,
        zip: template.defaultVenue.zip,
        city: template.defaultVenue.city,
        lat: template.defaultVenue.lat ?? null,
        lng: template.defaultVenue.lng ?? null,
      }
    : DEFAULT_VENUE;
  return {
    templateKey: template.key,
    guests: DEMO_GUESTS,
    drinks: DEFAULT_DRINKS,
    diets: DEFAULT_DIETS,
    themeKey,
    revealEffect: 'fade',
    galleryStyle: 'masonry',
    venue,
    couplePhoto: {
      uri: template.couplePhoto.uri || template.coverImage,
      frame: template.couplePhoto.frame || 'soft',
    },
    dressCode: '',
    cover: {
      title: template.defaultCover.title,
      dateLabel: template.defaultCover.dateLabel,
      couple: template.defaultCover.couple,
      guestLine: template.defaultCover.guestLine,
      kicker: template.defaultKicker ?? '',
      photoUri: template.coverImage,
    },
    story: template.story,
    program: template.program,
    gallery: template.galleryImages.map((uri, index) => ({
      uri,
      category: (['ceremonie', 'cocktail', 'soiree'] as const)[index % 3],
    })),
    countdownImage: template.countdownImage,
  };
}