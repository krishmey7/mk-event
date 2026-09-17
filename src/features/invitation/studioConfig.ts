/**
 * Mappe le snapshot studio renvoyé par l’API publique vers InvitationConfig.
 */

import type { InvitationConfig } from './guestRegistry';
import {
  DEFAULT_COUPLE_PHOTO,
  DEFAULT_DIETS,
  DEFAULT_DRINKS,
  DEFAULT_VENUE,
  DEMO_GUESTS,
  getInvitationConfig,
} from './guestRegistry';
import type { Guest, Venue } from './types';
import type { ProgramStep, StoryMilestone } from '@/features/templates/elegance/data';

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asGuestList(value: unknown): Guest[] {
  if (!Array.isArray(value)) return DEMO_GUESTS;
  const guests = value
    .map((item) => {
      const row = asRecord(item);
      if (!row) return null;
      return {
        id: asString(row.id, `INV-${Math.random().toString(36).slice(2, 8)}`),
        firstName: asString(row.firstName, 'Invité'),
        lastName: asString(row.lastName),
        contact: asString(row.contact),
        seats: typeof row.seats === 'number' ? row.seats : 1,
        ...(typeof row.accessToken === 'string' ? { accessToken: row.accessToken } : {}),
      } as Guest;
    })
    .filter((item): item is Guest => item !== null);
  return guests.length > 0 ? guests : DEMO_GUESTS;
}

function asStringList(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  const list = value.filter((item): item is string => typeof item === 'string');
  return list.length > 0 ? list : fallback;
}

function asVenue(value: unknown): Venue {
  const row = asRecord(value);
  if (!row) return { ...DEFAULT_VENUE };
  return {
    name: asString(row.name, DEFAULT_VENUE.name),
    street: asString(row.street, DEFAULT_VENUE.street),
    zip: asString(row.zip, DEFAULT_VENUE.zip),
    city: asString(row.city, DEFAULT_VENUE.city),
  };
}

function isGuestVisibleImageUri(uri: string): boolean {
  const value = uri.trim();
  return /^https?:\/\//i.test(value) || value.startsWith('data:');
}

function asStory(value: unknown): StoryMilestone[] {
  if (!Array.isArray(value)) return [];
  return value
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
    .map((item) => ({
      ...item,
      image: item.image && isGuestVisibleImageUri(item.image) ? item.image : '',
    }));
}

function asProgram(value: unknown): ProgramStep[] {
  if (!Array.isArray(value)) return [];
  return value
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
    .filter((item): item is ProgramStep => item !== null);
}

function asGallery(value: unknown): { uri: string; category: string }[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const row = asRecord(item);
      if (!row) return null;
      const uri = asString(row.uri);
      if (!uri || !isGuestVisibleImageUri(uri)) return null;
      return { uri, category: asString(row.category, 'ceremonie') };
    })
    .filter((item): item is { uri: string; category: string } => item !== null);
}

/** True si le payload API contient un snapshot studio utilisable. */
export function hasStudioConfig(value: unknown): value is Record<string, unknown> {
  const row = asRecord(value);
  return Boolean(row && asRecord(row.cover));
}

/**
 * Construit la config invitée depuis `event.studio_config`.
 * Fallback : seed local du slug (démo) si le snapshot est incomplet.
 */
export function invitationConfigFromStudio(
  studioConfig: unknown,
  slugFallback: string,
): InvitationConfig {
  const fallback = getInvitationConfig(slugFallback);
  if (!hasStudioConfig(studioConfig)) return fallback;

  const coverRow = asRecord(studioConfig.cover) ?? {};
  const couplePhotoRow = asRecord(studioConfig.couplePhoto);
  const voixRow = asRecord(studioConfig.voix);

  return {
    templateKey: asString(studioConfig.templateKey, fallback.templateKey),
    guests: asGuestList(studioConfig.guests),
    drinks: asStringList(studioConfig.drinks, DEFAULT_DRINKS),
    diets: asStringList(studioConfig.diets, DEFAULT_DIETS),
    themeKey: asString(studioConfig.themeKey, fallback.themeKey),
    revealEffect: asString(studioConfig.revealEffect, fallback.revealEffect),
    galleryStyle: asString(studioConfig.galleryStyle, fallback.galleryStyle),
    venue: asVenue(studioConfig.venue),
    couplePhoto: {
      uri: (() => {
        const uri = asString(couplePhotoRow?.uri, DEFAULT_COUPLE_PHOTO.uri);
        return isGuestVisibleImageUri(uri) ? uri : DEFAULT_COUPLE_PHOTO.uri;
      })(),
      frame: asString(couplePhotoRow?.frame, DEFAULT_COUPLE_PHOTO.frame),
    },
    dressCode: asString(studioConfig.dressCode, fallback.dressCode),
    cover: {
      title: asString(coverRow.title, fallback.cover.title),
      dateLabel: asString(coverRow.dateLabel, fallback.cover.dateLabel),
      couple: asString(coverRow.couple, fallback.cover.couple),
      guestLine: asString(coverRow.guestLine, fallback.cover.guestLine),
      kicker: asString(coverRow.kicker, fallback.cover.kicker),
      photoUri: (() => {
        const uri = asString(coverRow.photoUri, fallback.cover.photoUri);
        return isGuestVisibleImageUri(uri) ? uri : fallback.cover.photoUri;
      })(),
    },
    story: asStory(studioConfig.story).length > 0 ? asStory(studioConfig.story) : fallback.story,
    program:
      asProgram(studioConfig.program).length > 0 ? asProgram(studioConfig.program) : fallback.program,
    gallery:
      asGallery(studioConfig.gallery).length > 0 ? asGallery(studioConfig.gallery) : fallback.gallery,
    countdownImage: (() => {
      const uri = asString(studioConfig.countdownImage, fallback.countdownImage);
      return isGuestVisibleImageUri(uri) ? uri : fallback.countdownImage;
    })(),
    voix: voixRow
      ? {
          musicKey: asString(voixRow.musicKey, 'soft-piano'),
          ambientUri: typeof voixRow.ambientUri === 'string' ? voixRow.ambientUri : null,
          ambientName: typeof voixRow.ambientName === 'string' ? voixRow.ambientName : null,
          autoplay: Boolean(voixRow.autoplay),
          loop: voixRow.loop !== false,
          voiceGreeting: voixRow.voiceGreeting !== false,
          voicePersona:
            voixRow.voicePersona === 'anniversaire' || voixRow.voicePersona === 'conference'
              ? voixRow.voicePersona
              : 'mariage',
        }
      : fallback.voix,
    speakers: asSpeakers(studioConfig.speakers),
    practical: asPractical(studioConfig.practical),
  };
}

function asSpeakers(value: unknown): InvitationConfig['speakers'] {
  if (!Array.isArray(value)) return undefined;
  const list = value
    .map((item) => {
      const row = asRecord(item);
      if (!row) return null;
      return {
        id: asString(row.id, `sp-${Math.random().toString(36).slice(2, 7)}`),
        name: asString(row.name),
        role: asString(row.role),
        bio: asString(row.bio),
        photoUri: typeof row.photoUri === 'string' ? row.photoUri : undefined,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null && Boolean(item.name));
  return list.length > 0 ? list : undefined;
}

function asPractical(value: unknown): InvitationConfig['practical'] {
  const row = asRecord(value);
  if (!row) return undefined;
  return {
    access: asString(row.access) || undefined,
    parking: asString(row.parking) || undefined,
    hotel: asString(row.hotel) || undefined,
  };
}
