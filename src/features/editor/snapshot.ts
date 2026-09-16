/**
 * Instantané du studio — enregistré avec l’invitation dans Mes invitations.
 */

import type { ProgramStep, StoryMilestone } from '@/features/templates/elegance/data';
import type { GalleryStyleKey, Guest, PhotoFrameKey, RevealEffectKey, Venue } from '@/features/invitation/types';

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

/** « 14 juin 2025 » → ISO. */
export function parseFrenchDateLabel(label: string): string {
  const match = label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .match(/(\d{1,2})\s+([a-z]+)\s+(\d{4})/);
  if (!match) return new Date().toISOString();
  const month = MONTHS[match[2]] ?? MONTHS[`${match[2]}`] ?? 5;
  return new Date(Date.UTC(Number(match[3]), month, Number(match[1]), 15, 0, 0)).toISOString();
}

/** Django URLField n’accepte que http(s) — ignore blob:/file:/chemins locaux. */
export function toRemoteImageUrl(uri: string | null | undefined): string | null {
  const value = (uri ?? '').trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  return null;
}
