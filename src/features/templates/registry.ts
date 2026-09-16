/**
 * ──────────────────────────────────────────────────────────────
 *  MK EVENT — REGISTRE DES MODÈLES D'INVITATION
 * ──────────────────────────────────────────────────────────────
 *  Source de vérité des modèles éditables dans le studio
 *  (EleganceTemplate aujourd'hui, prochains modèles ensuite).
 *  Chaque modèle apporte :
 *   • son système de thèmes (palettes au contrat TemplateColors) ;
 *   • ses contenus de démonstration (couverture par défaut,
 *     histoire, programme, galerie, photo du compte à rebours).
 *  Le studio /editor?template={key} reste ainsi agnostique du
 *  modèle : il ne consomme que ce contrat.
 * ──────────────────────────────────────────────────────────────
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
import type { PhotoFrameOption } from '@/features/invitation/types';
import { normalizePhotoFrame } from '@/features/invitation/types';
import { ELEGANCE_PHOTO_FRAMES, HIVER_PHOTO_FRAMES } from './photoFrames';

/** Ré-export : tout modèle définit ses palettes sur ce contrat. */
export type { TemplateColors };

export interface TemplateThemeDefinition {
  key: string;
  label: string;
  /** Pastille du sélecteur. */
  swatch: string;
  isDark?: boolean;
  dressLabel?: string;
  dressHint?: string;
  colors: TemplateColors;
}

export interface TemplateDefaultCover {
  /** « Save the Date » (limite 40). */
  title: string;
  /** « 14 juin 2025 » */
  dateLabel: string;
  /** « Léa & Thomas » (limite 50). */
  couple: string;
  /** « Pour notre invité(e) {{Nom}} » (limite 100). */
  guestLine: string;
}

export interface TemplateDefinition {
  /** Clé de route : /editor?template={key}. */
  key: string;
  /** PK Django (InvitationTemplate.id). */
  id: number;
  name: string;
  category: EventType;
  description: string;
  /** Photo de couverture par défaut. */
  coverImage: string;
  /** Photos proposées dans « Choisir la photo de couverture ». */
  galleryImages: string[];
  /** Fond du module compte à rebours. */
  countdownImage: string;
  /** Photo du couple + cadre par défaut. */
  couplePhoto: { uri: string; frame: string };
  story: StoryMilestone[];
  program: ProgramStep[];
  defaultCover: TemplateDefaultCover;
  defaultThemeKey: string;
  /** Composition de la couverture. */
  coverLayout: 'classic' | 'winterPoster';
  /** Accroche sous le logo (ex. « Cérémonie à 10h »). */
  defaultKicker?: string;
  defaultVenue?: { name: string; street: string; zip: string; city: string };
  /** Thèmes du modèle, dans l'ordre d'affichage. */
  themes: TemplateThemeDefinition[];
  /** Cadres photo du couple proposés dans le studio. */
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

export const TEMPLATES: TemplateDefinition[] = [
  {
    key: 'elegance',
    id: 1,
    name: 'Élégance',
    category: 'wedding',
    description: "Histoire, programme, compte à rebours, RSVP, galerie et livre d'or — 6 thèmes personnalisables.",
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
    themes: eleganceThemes,
    photoFrames: ELEGANCE_PHOTO_FRAMES,
  },
  {
    key: 'hiver',
    id: 2,
    name: 'Hiver',
    category: 'wedding',
    description: 'Affiche marine & or, photo hexagonale, flocons — 6 palettes d’hiver, tout est modifiable.',
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
    defaultKicker: HIVER_WEDDING.kicker,
    defaultVenue: HIVER_VENUE,
    themes: hiverThemes,
    photoFrames: HIVER_PHOTO_FRAMES,
  },
];

export const DEFAULT_TEMPLATE_KEY = 'elegance';

/** Résout un modèle par clé — repli sur le modèle par défaut. */
export function getTemplate(key?: string | null): TemplateDefinition {
  return TEMPLATES.find((template) => template.key === key) ?? TEMPLATES[0];
}

/** Résout un modèle par PK Django — repli sur le modèle par défaut. */
export function getTemplateById(id?: number | null): TemplateDefinition {
  return TEMPLATES.find((template) => template.id === id) ?? TEMPLATES[0];
}
