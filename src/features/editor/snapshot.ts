/**
 * Instantané du studio — enregistré avec l’invitation dans Mes invitations.
 */

import type { ProgramStep, StoryMilestone } from '@/features/templates/elegance/data';
import type { GalleryStyleKey, Guest, PhotoFrameKey, RevealEffectKey, Venue } from '@/features/invitation/types';
import {
  normalizeGalleryStyle,
  normalizePhotoFrame,
  normalizeRevealEffect,
} from '@/features/invitation/types';

export interface EditorSnapshot {
  templateKey: string;
  dressCode: string;
  cover: {
    photoUri: string;
    title: string;
    dateLabel: string;
    couple: string;
    guestLine: string;
    couplePhotoUri: string;
    coupleFrame: PhotoFrameKey;
    themeKey: string;
    kicker: string;
  };
  story: StoryMilestone[];
  program: ProgramStep[];
  programStyle: string;
  countdownStyle: string;
  gallery: { id: string; uri: string; category: string }[];
  voix: {
    musicKey: string;
    ambientUri?: string | null;
    ambientName?: string | null;
    autoplay: boolean;
    loop: boolean;
    voiceGreeting: boolean;
    voicePersona?: 'mariage' | 'anniversaire' | 'conference';
    /** @deprecated ancien SFX court — ignoré */
    afterGreetingSound?: string;
  };
  drinks: string[];
  diets: string[];
  guests: Guest[];
  revealEffect: RevealEffectKey;
  galleryStyle: GalleryStyleKey;
  venue: Venue;
}

const MONTHS: Record<string, number> = {
  janvier: 0, fevrier: 1, février: 1, mars: 2, avril: 3, mai: 4, juin: 5,
  juillet: 6, aout: 7, août: 7, septembre: 8, octobre: 9, novembre: 10,
  decembre: 11, décembre: 11,
};

/**
 * Parse une date libre saisie en studio (« 14 juin 2025 », « 04 | 05 | 2026 », …).
 * Retourne une Date UTC à 15:00, ou null si non reconnue.
 */
export function parseEventDate(
  label: string,
  fallbackIso?: string | null,
): Date | null {
  const raw = (label ?? '').trim();
  if (raw) {
    /* 14/06/2025 · 04 | 05 | 2026 · 14-06-2025 */
    const numeric = raw.match(
      /(\d{1,2})\s*[|/.–-]\s*(\d{1,2})\s*[|/.–-]\s*(\d{4})/,
    );
    if (numeric) {
      const day = Number(numeric[1]);
      const month = Number(numeric[2]) - 1;
      const year = Number(numeric[3]);
      if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
        return new Date(Date.UTC(year, month, day, 15, 0, 0));
      }
    }

    /* 14 juin 2025 · 14 JUIN 2025 · plage « 12–13 mars 2026 » (1re date) */
    const normalized = raw
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    const french = normalized.match(/(\d{1,2})\s+([a-z]+)\s+(\d{4})/);
    if (french) {
      const monthKey = french[2];
      const month = MONTHS[monthKey];
      if (month != null) {
        return new Date(Date.UTC(Number(french[3]), month, Number(french[1]), 15, 0, 0));
      }
    }

    const isoGuess = Date.parse(raw);
    if (!Number.isNaN(isoGuess)) return new Date(isoGuess);
  }

  if (fallbackIso) {
    const fromIso = new Date(fallbackIso);
    if (!Number.isNaN(fromIso.getTime())) return fromIso;
  }
  return null;
}

/** « 14 juin 2025 » → ISO (pour event_date API). */
export function parseFrenchDateLabel(label: string): string {
  const parsed = parseEventDate(label);
  if (parsed) return parsed.toISOString();
  /* Repli : dans ~3 mois pour ne pas publier une date « maintenant ». */
  const fallback = new Date();
  fallback.setUTCMonth(fallback.getUTCMonth() + 3);
  fallback.setUTCHours(15, 0, 0, 0);
  return fallback.toISOString();
}

/** Timestamp cible du compte à rebours (ms). */
export function resolveCountdownTargetMs(
  dateLabel: string,
  eventDateIso?: string | null,
): number {
  const parsed = parseEventDate(dateLabel, eventDateIso);
  if (parsed) return parsed.getTime();
  const fallback = new Date();
  fallback.setUTCMonth(fallback.getUTCMonth() + 3);
  fallback.setUTCHours(15, 0, 0, 0);
  return fallback.getTime();
}

/** Django URLField n’accepte que http(s). data: reste dans studio_config pour les miniatures. */
export function toRemoteImageUrl(uri: string | null | undefined): string | null {
  const value = (uri ?? '').trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  return null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asCoord(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

/**
 * Reconstruit un EditorSnapshot depuis `event.studio_config` (organisateur).
 * Retourne null si le snapshot est inutilisable (pas de cover).
 */
export function editorSnapshotFromStudioConfig(
  studioConfig: unknown,
  guests: Guest[] = [],
): EditorSnapshot | null {
  const root = asRecord(studioConfig);
  if (!root) return null;
  const coverRow = asRecord(root.cover);
  if (!coverRow) return null;

  const couplePhotoRow = asRecord(root.couplePhoto);
  const voixRow = asRecord(root.voix);
  const venueRow = asRecord(root.venue);

  const story = Array.isArray(root.story)
    ? root.story
        .map((item) => {
          const row = asRecord(item);
          if (!row) return null;
          return {
            year: asString(row.year),
            title: asString(row.title),
            text: asString(row.text),
            image: asString(row.image),
          } satisfies StoryMilestone;
        })
        .filter((item): item is StoryMilestone => item !== null)
    : [];

  const program = Array.isArray(root.program)
    ? root.program
        .map((item) => {
          const row = asRecord(item);
          if (!row) return null;
          const title = asString(row.title);
          if (!title) return null;
          return {
            time: asString(row.time),
            title,
            place: asString(row.place, asString(row.detail)),
            icon: (asString(row.icon, 'time-outline') || 'time-outline') as ProgramStep['icon'],
          } satisfies ProgramStep;
        })
        .filter((item): item is ProgramStep => item !== null)
    : [];

  const gallery = Array.isArray(root.gallery)
    ? root.gallery
        .map((item, index) => {
          const row = asRecord(item);
          if (!row) return null;
          const uri = asString(row.uri);
          if (!uri) return null;
          return {
            id: `g-${index}`,
            uri,
            category: asString(row.category, 'ceremonie'),
          };
        })
        .filter((item): item is { id: string; uri: string; category: string } => item !== null)
    : [];

  const drinks = Array.isArray(root.drinks)
    ? root.drinks.filter((item): item is string => typeof item === 'string')
    : [];
  const diets = Array.isArray(root.diets)
    ? root.diets.filter((item): item is string => typeof item === 'string')
    : [];

  return {
    templateKey: asString(root.templateKey, 'elegance'),
    dressCode: asString(root.dressCode),
    cover: {
      photoUri: asString(coverRow.photoUri),
      title: asString(coverRow.title, 'Save the Date'),
      dateLabel: asString(coverRow.dateLabel),
      couple: asString(coverRow.couple),
      guestLine: asString(coverRow.guestLine),
      couplePhotoUri: asString(couplePhotoRow?.uri),
      coupleFrame: normalizePhotoFrame(asString(couplePhotoRow?.frame, 'circle')),
      themeKey: asString(root.themeKey, asString(coverRow.themeKey, 'champagne')),
      kicker: asString(coverRow.kicker),
    },
    story,
    program,
    programStyle: asString(root.programStyle, 'classique'),
    countdownStyle: asString(root.countdownStyle, 'classique'),
    gallery,
    voix: {
      musicKey: asString(voixRow?.musicKey, 'soft-piano'),
      ambientUri: typeof voixRow?.ambientUri === 'string' ? voixRow.ambientUri : null,
      ambientName: typeof voixRow?.ambientName === 'string' ? voixRow.ambientName : null,
      autoplay: Boolean(voixRow?.autoplay),
      loop: voixRow?.loop !== false,
      voiceGreeting: voixRow?.voiceGreeting !== false,
      voicePersona:
        voixRow?.voicePersona === 'anniversaire' || voixRow?.voicePersona === 'conference'
          ? voixRow.voicePersona
          : 'mariage',
    },
    drinks,
    diets,
    guests,
    revealEffect: normalizeRevealEffect(asString(root.revealEffect, 'fade')),
    galleryStyle: normalizeGalleryStyle(asString(root.galleryStyle, 'masonry')),
    venue: {
      name: asString(venueRow?.name),
      street: asString(venueRow?.street),
      zip: asString(venueRow?.zip),
      city: asString(venueRow?.city),
      lat: asCoord(venueRow?.lat),
      lng: asCoord(venueRow?.lng),
    },
  };
}

/** Mappe les invités DRF vers le modèle éditeur. */
export function mapApiGuestsToEditor(apiGuests: {
  full_name: string;
  email?: string | null;
  phone?: string | null;
  adults_count?: number;
  children_count?: number;
  access_token?: string;
  studio_key?: string | null;
}[]): Guest[] {
  return apiGuests.map((guest, index) => {
    const parts = guest.full_name.trim().split(/\s+/);
    const firstName = parts[0] || 'Invité';
    const lastName = parts.slice(1).join(' ');
    const seats = Math.max(
      1,
      (guest.adults_count ?? 1) + (guest.children_count ?? 0),
    );
    return {
      id: (guest.studio_key || '').trim() || `INV-${index + 1}`,
      firstName,
      lastName,
      contact: guest.email || guest.phone || '',
      seats,
      ...(guest.access_token ? { accessToken: guest.access_token } : {}),
    };
  });
}
