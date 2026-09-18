/**
 * MK EVENT — Registre des modèles d’invitation.
 */

import type { EventType } from '@/types';

import {
  GALLERY,
  IMAGES,
  PROGRAM,
  STORY,
  WEDDING,
  type ProgramStep,
  type StoryMilestone,
} from './elegance/data';
import { TEMPLATE_THEMES, TEMPLATE_THEME_ORDER, type TemplateColors } from './elegance/themes';
import { HIVER_GALLERY, HIVER_IMAGES, HIVER_PROGRAM, HIVER_STORY, HIVER_VENUE, HIVER_WEDDING } from './hiver/data';
import { HIVER_THEME_ORDER, HIVER_THEMES } from './hiver/themes';
import { BIRTHDAY_DEMO, BIRTHDAY_IMAGES, BIRTHDAY_THEME_ORDER, BIRTHDAY_THEMES } from './birthday/themes';
import {
  CONFERENCE_DEMO,
  CONFERENCE_IMAGES,
  CONFERENCE_PROGRAM,
  CONFERENCE_THEME_ORDER,
  CONFERENCE_THEMES,
} from './conference/data';
import type { PhotoFrameOption } from '@/features/invitation/types';
import { normalizePhotoFrame } from '@/features/invitation/types';
import { ELEGANCE_PHOTO_FRAMES, HIVER_PHOTO_FRAMES } from './photoFrames';
import type { OrnamentKey } from './ornaments';

export type { TemplateColors };

export interface TemplateThemeDefinition {
  key: string;
  label: string;
  swatch: string;
  isDark?: boolean;
  dressLabel?: string;
  dressHint?: string;
  colors: TemplateColors;
}

export interface TemplateDefaultCover {
  title: string;
  dateLabel: string;
  couple: string;
  guestLine: string;
}

export type CoverLayout = 'classic' | 'winterPoster' | 'birthdayPoster' | 'conference';

export interface TemplateDefinition {
  key: string;
  id: number;
  name: string;
  category: EventType;
  description: string;
  coverImage: string;
  galleryImages: string[];
  countdownImage: string;
  couplePhoto: { uri: string; frame: string };
  story: StoryMilestone[];
  program: ProgramStep[];
  defaultCover: TemplateDefaultCover;
  defaultThemeKey: string;
  coverLayout: CoverLayout;
  ornaments: OrnamentKey;
  motions: { coverEnter: boolean; sectionReveal: boolean };
  defaultKicker?: string;
  defaultVenue?: {
    name: string;
    street: string;
    zip: string;
    city: string;
    lat?: number | null;
    lng?: number | null;
  };
  themes: TemplateThemeDefinition[];
  photoFrames: PhotoFrameOption[];
}

const ELEGANCE_DRESS: Record<string, { dressLabel: string; dressHint: string }> = {
  champagne: { dressLabel: 'Champagne & ivoire', dressHint: 'Tenue cocktail, tons clairs' },
  rose: { dressLabel: 'Rose poudré', dressHint: 'Romantique, pastels' },
  sauge: { dressLabel: 'Jardin sauge', dressHint: 'Nature, lin et vert doux' },
  marine: { dressLabel: 'Marine & or', dressHint: 'Soirée élégante' },
  bordeaux: { dressLabel: 'Bordeaux', dressHint: 'Hiver, velours' },
  noir: { dressLabel: 'Noir élégant', dressHint: 'Black tie' },
};

const eleganceThemes: TemplateThemeDefinition[] = TEMPLATE_THEME_ORDER.map((key) => ({
  key,
  label: TEMPLATE_THEMES[key].label,
  swatch: TEMPLATE_THEMES[key].swatch,
  isDark: TEMPLATE_THEMES[key].isDark,
  dressLabel: ELEGANCE_DRESS[key]?.dressLabel,
  dressHint: ELEGANCE_DRESS[key]?.dressHint,
  colors: TEMPLATE_THEMES[key].colors,
}));

const hiverThemes: TemplateThemeDefinition[] = HIVER_THEME_ORDER.map((key) => ({
  key,
  label: HIVER_THEMES[key].label,
  swatch: HIVER_THEMES[key].swatch,
  isDark: HIVER_THEMES[key].isDark,
  dressLabel: HIVER_THEMES[key].dressLabel,
  dressHint: HIVER_THEMES[key].dressHint,
  colors: HIVER_THEMES[key].colors,
}));

const birthdayThemes: TemplateThemeDefinition[] = BIRTHDAY_THEME_ORDER.map((key) => ({
  key,
  label: BIRTHDAY_THEMES[key].label,
  swatch: BIRTHDAY_THEMES[key].swatch,
  isDark: BIRTHDAY_THEMES[key].isDark,
  dressLabel: BIRTHDAY_THEMES[key].dressLabel,
  dressHint: BIRTHDAY_THEMES[key].dressHint,
  colors: BIRTHDAY_THEMES[key].colors,
}));

const conferenceThemes: TemplateThemeDefinition[] = CONFERENCE_THEME_ORDER.map((key) => ({
  key,
  label: CONFERENCE_THEMES[key].label,
  swatch: CONFERENCE_THEMES[key].swatch,
  isDark: CONFERENCE_THEMES[key].isDark,
  dressLabel: CONFERENCE_THEMES[key].dressLabel,
  dressHint: CONFERENCE_THEMES[key].dressHint,
  colors: CONFERENCE_THEMES[key].colors,
}));

export const TEMPLATES: TemplateDefinition[] = [
  {
    key: 'elegance',
    id: 1,
    name: 'Élégance',
    category: 'wedding',
    description: 'Histoire, programme, compte à rebours, RSVP, galerie — 6 thèmes.',
    coverImage: IMAGES.cover,
    galleryImages: [IMAGES.cover, ...GALLERY.slice(0, 5).map((photo) => photo.uri)],
    countdownImage: IMAGES.countdown,
    couplePhoto: { uri: IMAGES.couple, frame: normalizePhotoFrame('circle') },
    story: STORY,
    program: PROGRAM,
    defaultCover: {
      title: 'Save the Date',
      dateLabel: '14 juin 2025',
      couple: WEDDING.couple,
      guestLine: 'Pour notre invité(e) {{Nom}}',
    },
    defaultThemeKey: 'champagne',
    coverLayout: 'classic',
    ornaments: 'elegance',
    motions: { coverEnter: true, sectionReveal: true },
    themes: eleganceThemes,
    photoFrames: ELEGANCE_PHOTO_FRAMES,
  },
  {
    key: 'hiver',
    id: 2,
    name: 'Hiver',
    category: 'wedding',
    description: 'Affiche marine & or, photo hexagonale — 6 palettes d’hiver.',
    coverImage: HIVER_IMAGES.cover,
    galleryImages: HIVER_GALLERY,
    countdownImage: HIVER_IMAGES.countdown,
    couplePhoto: { uri: HIVER_IMAGES.couple, frame: normalizePhotoFrame('hexFloral', 'hiver') },
    story: HIVER_STORY,
    program: HIVER_PROGRAM,
    defaultCover: {
      title: 'Save the Date',
      dateLabel: '22 octobre 2025',
      couple: HIVER_WEDDING.couple,
      guestLine: HIVER_WEDDING.guestSentence,
    },
    defaultThemeKey: 'navyGold',
    coverLayout: 'winterPoster',
    ornaments: 'hiver',
    motions: { coverEnter: true, sectionReveal: true },
    defaultKicker: HIVER_WEDDING.kicker,
    defaultVenue: HIVER_VENUE,
    themes: hiverThemes,
    photoFrames: HIVER_PHOTO_FRAMES,
  },
  {
    key: 'celebration',
    id: 3,
    name: 'Célébration',
    category: 'birthday',
    description: 'Affiche anniversaire une page — or & crème, décor Iconify.',
    coverImage: BIRTHDAY_IMAGES.cover,
    galleryImages: BIRTHDAY_IMAGES.gallery,
    countdownImage: BIRTHDAY_IMAGES.cover,
    couplePhoto: { uri: BIRTHDAY_IMAGES.cover, frame: normalizePhotoFrame('soft') },
    story: [],
    program: [],
    defaultCover: {
      title: BIRTHDAY_DEMO.title,
      dateLabel: BIRTHDAY_DEMO.dateLabel,
      couple: BIRTHDAY_DEMO.celebrant,
      guestLine: 'Pour {{Nom}}',
    },
    defaultThemeKey: 'orCreme',
    coverLayout: 'birthdayPoster',
    ornaments: 'birthday',
    motions: { coverEnter: true, sectionReveal: false },
    defaultKicker: BIRTHDAY_DEMO.ageLine,
    defaultVenue: {
      name: 'Numbers Night Club',
      street: '300 Westheimer Rd',
      zip: '',
      city: 'Houston',
      lat: 29.7436,
      lng: -95.3845,
    },
    themes: birthdayThemes,
    photoFrames: ELEGANCE_PHOTO_FRAMES,
  },
  {
    key: 'summit',
    id: 4,
    name: 'Summit',
    category: 'corporate',
    description: 'Invitation pro multi-pages : agenda, intervenants, inscription.',
    coverImage: CONFERENCE_IMAGES.cover,
    galleryImages: CONFERENCE_IMAGES.gallery,
    countdownImage: CONFERENCE_IMAGES.cover,
    couplePhoto: { uri: CONFERENCE_IMAGES.cover, frame: normalizePhotoFrame('soft') },
    story: [],
    program: CONFERENCE_PROGRAM,
    defaultCover: {
      title: CONFERENCE_DEMO.title,
      dateLabel: CONFERENCE_DEMO.dateLabel,
      couple: CONFERENCE_DEMO.title,
      guestLine: 'Participant · {{Nom}}',
    },
    defaultThemeKey: 'slate',
    coverLayout: 'conference',
    ornaments: 'conference',
    motions: { coverEnter: true, sectionReveal: true },
    defaultKicker: CONFERENCE_DEMO.tagline,
    defaultVenue: {
      name: CONFERENCE_DEMO.venueName,
      street: '',
      zip: '',
      city: CONFERENCE_DEMO.venueCity,
      lat: 48.8794,
      lng: 2.2839,
    },
    themes: conferenceThemes,
    photoFrames: ELEGANCE_PHOTO_FRAMES,
  },
];

export const DEFAULT_TEMPLATE_KEY = 'elegance';

export function getTemplate(key?: string | null): TemplateDefinition {
  return TEMPLATES.find((template) => template.key === key) ?? TEMPLATES[0];
}

export function getTemplateById(id?: number | null): TemplateDefinition {
  return TEMPLATES.find((template) => template.id === id) ?? TEMPLATES[0];
}

export function getTemplatesForCategory(category: EventType): TemplateDefinition[] {
  return TEMPLATES.filter((template) => template.category === category);
}
