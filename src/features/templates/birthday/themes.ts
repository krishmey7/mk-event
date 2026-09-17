/**
 * Modèle Anniversaire — affiche 1 page (maquette or / crème).
 */

import type { TemplateColors } from '@/features/templates/elegance/themes';

export type BirthdayThemeKey = 'orCreme' | 'rose' | 'sauge' | 'marine' | 'bordeaux' | 'noir';

export const BIRTHDAY_THEME_ORDER: BirthdayThemeKey[] = [
  'orCreme',
  'rose',
  'sauge',
  'marine',
  'bordeaux',
  'noir',
];

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
    surfaceAlt: isDark ? '#222222' : '#F5EFE6',
    border,
    text,
    textMuted,
    primary: accent,
    onPrimary: isDark ? '#141414' : '#FFFFFF',
    accent,
    chip: isDark ? '#2A2A2A' : '#F0E8D8',
    coverOverlay: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(40,30,20,0.15)',
    coverOverlayDeep: isDark ? 'rgba(0,0,0,0.35)' : 'rgba(20,15,10,0.25)',
  };
}

export const BIRTHDAY_THEMES: Record<
  BirthdayThemeKey,
  {
    label: string;
    swatch: string;
    isDark?: boolean;
    dressLabel: string;
    dressHint: string;
    colors: TemplateColors;
  }
> = {
  orCreme: {
    label: 'Or & crème',
    swatch: '#C5A059',
    dressLabel: 'Chic festif',
    dressHint: 'Tenue cocktail, tons or',
    colors: palette('#FDF8F5', '#FFFFFF', '#1A1A1A', '#6F675C', '#C5A059', '#E6D4B8'),
  },
  rose: {
    label: 'Rose poudré',
    swatch: '#BC7B88',
    dressLabel: 'Doux',
    dressHint: 'Pastels',
    colors: palette('#FDF6F7', '#FFFFFF', '#2A1F22', '#8A6F75', '#BC7B88', '#E8D0D4'),
  },
  sauge: {
    label: 'Eucalyptus',
    swatch: '#2F6F69',
    dressLabel: 'Nature',
    dressHint: 'Vert doux',
    colors: palette('#F4F7F5', '#FFFFFF', '#1A2422', '#5A6B66', '#2F6F69', '#C9D6D2'),
  },
  marine: {
    label: 'Marine',
    swatch: '#3A4F6A',
    dressLabel: 'Élégant',
    dressHint: 'Soirée',
    colors: palette('#F3F5F8', '#FFFFFF', '#1A2230', '#5A6578', '#3A4F6A', '#C5CDD8'),
  },
  bordeaux: {
    label: 'Bordeaux',
    swatch: '#7A3040',
    dressLabel: 'Chaleureux',
    dressHint: 'Velours',
    colors: palette('#F9F4F4', '#FFFFFF', '#2A181C', '#7A5A60', '#7A3040', '#E0C8CC'),
  },
  noir: {
    label: 'Noir & or',
    swatch: '#1A1A1A',
    isDark: true,
    dressLabel: 'Soirée chic',
    dressHint: 'Black tie',
    colors: palette('#141414', '#1E1E1E', '#F6F1E8', '#A89F90', '#C5A059', '#333333', true),
  },
};

export const BIRTHDAY_DEMO = {
  title: 'Save the Date',
  subtitle: 'we invite you to celebrate',
  ageLine: 'happy 28th',
  headline: 'birthday',
  script: 'celebration',
  dateLabel: '04 | 05 | 2026',
  timePlace: 'À 21h · Numbers Night Club',
  address: '300 Westheimer Rd, Houston',
  closing: 'see you!',
  celebrant: 'Alex',
};

export const BIRTHDAY_IMAGES = {
  cover:
    'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80',
  gallery: [
    'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80',
  ],
};
