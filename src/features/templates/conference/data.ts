/**
 * Modèle Conférence — multi-sections (accueil, agenda, speakers, pratiques, inscription).
 */

import type { TemplateColors } from '@/features/templates/elegance/themes';
import type { ProgramStep } from '@/features/templates/elegance/data';

export type ConferenceThemeKey = 'slate' | 'teal' | 'navy' | 'graphite';

export const CONFERENCE_THEME_ORDER: ConferenceThemeKey[] = ['slate', 'teal', 'navy', 'graphite'];

function palette(
  bg: string,
  surface: string,
  text: string,
  textMuted: string,
  accent: string,
  border: string,
  isDark = false,
): TemplateColors {
  return {
    bg,
    surface,
    surfaceAlt: isDark ? '#1C1C1C' : '#EEF1F5',
    border,
    text,
    textMuted,
    primary: accent,
    onPrimary: isDark ? '#161616' : '#FFFFFF',
    accent,
    chip: isDark ? '#2A2A2A' : '#E8ECF2',
    coverOverlay: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(20,30,50,0.35)',
    coverOverlayDeep: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(10,15,30,0.45)',
  };
}

export const CONFERENCE_THEMES: Record<
  ConferenceThemeKey,
  {
    label: string;
    swatch: string;
    isDark?: boolean;
    dressLabel: string;
    dressHint: string;
    colors: TemplateColors;
  }
> = {
  slate: {
    label: 'Ardoise',
    swatch: '#4A5568',
    dressLabel: 'Business casual',
    dressHint: 'Tenue professionnelle',
    colors: palette('#F5F6F8', '#FFFFFF', '#1A202C', '#718096', '#4A5568', '#E2E8F0'),
  },
  teal: {
    label: 'Sarcelle',
    swatch: '#2F6F69',
    dressLabel: 'Smart casual',
    dressHint: 'Confortable et soigné',
    colors: palette('#F2F6F5', '#FFFFFF', '#1A2422', '#5A6B66', '#2F6F69', '#C9D6D2'),
  },
  navy: {
    label: 'Marine',
    swatch: '#2C3E6B',
    dressLabel: 'Formal',
    dressHint: 'Costume recommandé',
    colors: palette('#F3F5F9', '#FFFFFF', '#1A2233', '#5A6578', '#2C3E6B', '#C5CDD8'),
  },
  graphite: {
    label: 'Graphite',
    swatch: '#2D2D2D',
    isDark: true,
    dressLabel: 'Evening',
    dressHint: 'Soirée networking',
    colors: palette('#161616', '#222222', '#F0F0F0', '#9A9A9A', '#6B9BD1', '#333333', true),
  },
};

export interface ConferenceSpeaker {
  id: string;
  name: string;
  role: string;
  bio: string;
  photoUri?: string;
}

export const CONFERENCE_DEMO = {
  title: 'Summit 2026',
  tagline: 'Innovation · Leadership · Networking',
  dateLabel: '12–13 mars 2026',
  venueName: 'Palais des Congrès',
  venueCity: 'Paris',
  access: 'Métro ligne 1 — Porte Maillot',
  parking: 'Parking souterrain sur place',
  hotel: 'Hôtels partenaires à 5 min à pied',
};

export const CONFERENCE_PROGRAM: ProgramStep[] = [
  { time: '09:00', title: 'Accueil & café', place: 'Hall A', icon: 'cafe-outline' },
  { time: '10:00', title: 'Keynote d’ouverture', place: 'Amphi principal', icon: 'mic-outline' },
  { time: '11:30', title: 'Ateliers parallèles', place: 'Salles 1–3', icon: 'people-outline' },
  { time: '14:00', title: 'Table ronde', place: 'Amphi principal', icon: 'chatbubbles-outline' },
  { time: '17:00', title: 'Networking cocktail', place: 'Rooftop', icon: 'wine-outline' },
];

export const CONFERENCE_SPEAKERS: ConferenceSpeaker[] = [
  {
    id: 'sp-1',
    name: 'Camille Dupont',
    role: 'CEO · Nova Labs',
    bio: 'Spécialiste produit et croissance des plateformes B2B.',
  },
  {
    id: 'sp-2',
    name: 'Jordan Lee',
    role: 'VP Engineering',
    bio: 'Architectures cloud et équipes distribuées.',
  },
  {
    id: 'sp-3',
    name: 'Samira Benali',
    role: 'Designer principale',
    bio: 'Expériences utilisateurs pour événements live.',
  },
];

export const CONFERENCE_IMAGES = {
  cover:
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
  gallery: [
    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80',
  ],
};
