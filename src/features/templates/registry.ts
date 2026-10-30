/**
 * MK EVENTS — Registre des modèles d’invitation.
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
import {
  AURORE_GALLERY,
  AURORE_IMAGES,
  AURORE_PROGRAM,
  AURORE_STORY,
  AURORE_VENUE,
  AURORE_WEDDING,
} from './aurore/data';
import { AURORE_THEME_ORDER, AURORE_THEMES } from './aurore/themes';
import {
  PELLICULE_GALLERY,
  PELLICULE_IMAGES,
  PELLICULE_PROGRAM,
  PELLICULE_STORY,
  PELLICULE_VENUE,
  PELLICULE_WEDDING,
} from './pellicule/data';
import { PELLICULE_THEME_ORDER, PELLICULE_THEMES } from './pellicule/themes';
import {
  NEON_GALLERY,
  NEON_IMAGES,
  NEON_PROGRAM,
  NEON_STORY,
  NEON_VENUE,
  NEON_WEDDING,
} from './neon/data';
import { NEON_THEME_ORDER, NEON_THEMES } from './neon/themes';
import { PAPETERIE_IMAGES, PAPETERIE_PROGRAM } from './papeterie/data';
import { OLIVIER_IMAGES, OLIVIER_PROGRAM } from './olivier/data';
import { FOI_AMOUR_IMAGES, FOI_AMOUR_PROGRAM } from './foi-amour/data';
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
  /** Heure couverture (Pellicule / Néon). */
  timeLabel?: string;
}

export type CoverLayout =
  | 'classic'
  | 'winterPoster'
  | 'birthdayPoster'
  | 'conference'
  | 'splitPanel'
  | 'filmStrip'
  | 'neonScript'
  | 'editorial'
  | 'oliveInvitation'
  | 'botanicalInvitation';

export interface TemplateDefinition {
  /**
   * Slug canonique — seule référence stable côté API (`template: key`).
   * Les IDs numériques dépendent de l'ordre des migrations/seed.
   */
  key: string;
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

const auroreThemes: TemplateThemeDefinition[] = AURORE_THEME_ORDER.map((key) => ({
  key,
  label: AURORE_THEMES[key].label,
  swatch: AURORE_THEMES[key].swatch,
  isDark: AURORE_THEMES[key].isDark,
  dressLabel: AURORE_THEMES[key].dressLabel,
  dressHint: AURORE_THEMES[key].dressHint,
  colors: AURORE_THEMES[key].colors,
}));

const pelliculeThemes: TemplateThemeDefinition[] = PELLICULE_THEME_ORDER.map((key) => ({
  key,
  label: PELLICULE_THEMES[key].label,
  swatch: PELLICULE_THEMES[key].swatch,
  isDark: PELLICULE_THEMES[key].isDark,
  dressLabel: PELLICULE_THEMES[key].dressLabel,
  dressHint: PELLICULE_THEMES[key].dressHint,
  colors: PELLICULE_THEMES[key].colors,
}));

const neonThemes: TemplateThemeDefinition[] = NEON_THEME_ORDER.map((key) => ({
  key,
  label: NEON_THEMES[key].label,
  swatch: NEON_THEMES[key].swatch,
  isDark: NEON_THEMES[key].isDark,
  dressLabel: NEON_THEMES[key].dressLabel,
  dressHint: NEON_THEMES[key].dressHint,
  colors: NEON_THEMES[key].colors,
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
    key: 'foi-amour',
    name: 'Foi & Amour',
    category: 'wedding',
    description: 'Invitation ivoire et feuillage, cérémonie, itinéraire, places réservées et confirmation.',
    coverImage: FOI_AMOUR_IMAGES.cover,
    galleryImages: FOI_AMOUR_IMAGES.gallery,
    countdownImage: FOI_AMOUR_IMAGES.couple,
    couplePhoto: { uri: FOI_AMOUR_IMAGES.couple, frame: normalizePhotoFrame('soft') },
    story: [],
    program: FOI_AMOUR_PROGRAM,
    defaultCover: {
      title: 'Notre mariage',
      dateLabel: 'Vendredi 14 avril 2028',
      couple: 'Rafaela & Josué',
      guestLine: 'C’est avec une grande joie que nous vous invitons à célébrer notre union, {{Nom}}.',
    },
    defaultThemeKey: 'sauge',
    coverLayout: 'botanicalInvitation',
    ornaments: 'elegance',
    motions: { coverEnter: true, sectionReveal: true },
    defaultVenue: {
      name: 'Villa des Fleurs',
      street: '45 allée du Jardin',
      zip: '1234',
      city: 'Lisbonne',
    },
    themes: eleganceThemes,
    photoFrames: [],
  },
  {
    key: 'olivier',
    name: 'Vert d’olive',
    category: 'wedding',
    description: 'Invitation végétale, galerie photo, programme et livre d’or dans des tons olive et ivoire.',
    coverImage: OLIVIER_IMAGES.cover,
    galleryImages: OLIVIER_IMAGES.gallery,
    countdownImage: OLIVIER_IMAGES.couple,
    couplePhoto: { uri: OLIVIER_IMAGES.couple, frame: normalizePhotoFrame('soft') },
    story: [],
    program: OLIVIER_PROGRAM,
    defaultCover: {
      title: 'Invitation au mariage',
      dateLabel: '12 octobre 2026',
      couple: 'Léa & Gabriel',
      guestLine: 'Nous serions très heureux de partager cette journée avec vous, {{Nom}}.',
    },
    defaultThemeKey: 'sauge',
    coverLayout: 'oliveInvitation',
    ornaments: 'elegance',
    motions: { coverEnter: true, sectionReveal: true },
    defaultVenue: {
      name: 'Domaine des Oliviers',
      street: '12 chemin des Oliviers',
      zip: '84100',
      city: 'Orange',
    },
    themes: eleganceThemes,
    photoFrames: [],
  },
  {
    key: 'papeterie',
    name: 'Papier végétal',
    category: 'wedding',
    description: 'Papeterie ivoire, photo pleine page, détails raffinés et programme en ligne.',
    coverImage: PAPETERIE_IMAGES.cover,
    galleryImages: PAPETERIE_IMAGES.gallery,
    countdownImage: PAPETERIE_IMAGES.couple,
    couplePhoto: { uri: PAPETERIE_IMAGES.couple, frame: normalizePhotoFrame('soft') },
    story: [],
    program: PAPETERIE_PROGRAM,
    defaultCover: {
      title: 'Réservez la date',
      dateLabel: '14 septembre 2026',
      couple: 'Olivia & Ethan',
      guestLine: 'Nous serions heureux de célébrer ce jour avec vous, {{Nom}}.',
    },
    defaultThemeKey: 'champagne',
    coverLayout: 'editorial',
    ornaments: 'elegance',
    motions: { coverEnter: true, sectionReveal: true },
    defaultVenue: {
      name: 'Domaine des Roseaux',
      street: '12 allée des Tilleuls',
      zip: '78100',
      city: 'Saint-Germain-en-Laye',
      lat: 48.8989,
      lng: 2.0938,
    },
    themes: eleganceThemes,
    photoFrames: [],
  },
  {
    key: 'hiver',
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
    key: 'aurore',
    name: 'Aurore',
    category: 'wedding',
    description: 'Save the date émeraude et or — portrait plein cadre, calligraphie dorée.',
    coverImage: AURORE_IMAGES.cover,
    galleryImages: AURORE_GALLERY,
    countdownImage: AURORE_IMAGES.countdown,
    couplePhoto: { uri: AURORE_IMAGES.couple, frame: normalizePhotoFrame('soft') },
    story: AURORE_STORY,
    program: AURORE_PROGRAM,
    defaultCover: {
      title: 'Save the Date',
      dateLabel: AURORE_WEDDING.dateLabel,
      couple: AURORE_WEDDING.couple,
      guestLine: AURORE_WEDDING.guestLine,
    },
    defaultThemeKey: 'emeraude',
    coverLayout: 'splitPanel',
    ornaments: 'elegance',
    motions: { coverEnter: true, sectionReveal: true },
    defaultKicker: AURORE_WEDDING.kicker,
    defaultVenue: AURORE_VENUE,
    themes: auroreThemes,
    photoFrames: [],
  },
  {
    key: 'pellicule',
    name: 'Pellicule',
    category: 'wedding',
    description: 'Bande photo et panneau sombre calligraphié — réservez la date, fond texturé.',
    coverImage: PELLICULE_IMAGES.cover,
    galleryImages: PELLICULE_GALLERY,
    countdownImage: PELLICULE_IMAGES.countdown,
    couplePhoto: { uri: PELLICULE_IMAGES.couple, frame: normalizePhotoFrame('soft') },
    story: PELLICULE_STORY,
    program: PELLICULE_PROGRAM,
    defaultCover: {
      title: PELLICULE_WEDDING.kicker,
      dateLabel: PELLICULE_WEDDING.dateLabel,
      couple: PELLICULE_WEDDING.couple,
      guestLine: PELLICULE_WEDDING.guestLine,
      timeLabel: PELLICULE_WEDDING.timeLabel,
    },
    defaultThemeKey: 'ivoire',
    coverLayout: 'filmStrip',
    ornaments: 'elegance',
    motions: { coverEnter: true, sectionReveal: true },
    defaultKicker: PELLICULE_WEDDING.kicker,
    defaultVenue: PELLICULE_VENUE,
    themes: pelliculeThemes,
    photoFrames: [],
  },
  {
    key: 'neon',
    name: 'Néon',
    category: 'wedding',
    description: 'Photo plein cadre, script lumineux et or — timeline, lieu, détails, compte à rebours.',
    coverImage: NEON_IMAGES.cover,
    galleryImages: NEON_GALLERY,
    countdownImage: NEON_IMAGES.countdown,
    couplePhoto: { uri: NEON_IMAGES.couple, frame: normalizePhotoFrame('soft') },
    story: NEON_STORY,
    program: NEON_PROGRAM,
    defaultCover: {
      title: NEON_WEDDING.heroScript,
      dateLabel: NEON_WEDDING.dateLabel,
      couple: NEON_WEDDING.couple,
      guestLine: NEON_WEDDING.guestLine,
      timeLabel: NEON_WEDDING.timeLabel,
    },
    defaultThemeKey: 'noirOr',
    coverLayout: 'neonScript',
    ornaments: 'elegance',
    motions: { coverEnter: true, sectionReveal: true },
    defaultKicker: NEON_WEDDING.inviteLine,
    defaultVenue: NEON_VENUE,
    themes: neonThemes,
    photoFrames: [],
  },
  {
    key: 'celebration',
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
      timeLabel: 'À 21h',
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

/** Retrouve un modèle par son slug canonique, sans repli. */
export function findTemplate(key?: string | null): TemplateDefinition | undefined {
  return key ? TEMPLATES.find((template) => template.key === key) : undefined;
}

export function getTemplate(key?: string | null): TemplateDefinition {
  return findTemplate(key) ?? TEMPLATES[0];
}

export function getTemplatesForCategory(category: EventType): TemplateDefinition[] {
  return TEMPLATES.filter((template) => template.category === category);
}
