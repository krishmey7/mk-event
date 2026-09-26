/**
 * Herbier — papier, encre, pétale et feuille.
 * `primary` sert aux tiges, `accent` aux pétales.
 */

import type { TemplateColors } from '@/features/templates/elegance/themes';

export interface BotanicalTheme {
  key: string;
  label: string;
  swatch: string;
  isDark: boolean;
  dressLabel: string;
  dressHint: string;
  colors: TemplateColors;
}

export const BOTANICAL_THEME_ORDER = ['ivoire', 'sauge', 'pivoine', 'nuit'] as const;

export const BOTANICAL_THEMES: Record<(typeof BOTANICAL_THEME_ORDER)[number], BotanicalTheme> = {
  ivoire: {
    key: 'ivoire',
    label: 'Ivoire',
    swatch: '#F3E6D8',
    isDark: false,
    dressLabel: 'Ivoire & rose',
    dressHint: 'Lin clair, une touche de pivoine',
    colors: {
      bg: '#F6F0E6',
      surface: '#FFFBF6',
      surfaceAlt: '#EFE4D4',
      border: '#E0D2C0',
      text: '#2C261F',
      textMuted: '#7A7066',
      primary: '#3E5340',
      onPrimary: '#F6F0E6',
      accent: '#C4616C',
      chip: '#F3D5D4',
      coverOverlay: 'rgba(44, 38, 31, 0.12)',
      coverOverlayDeep: 'rgba(44, 38, 31, 0.4)',
    },
  },
  sauge: {
    key: 'sauge',
    label: 'Sauge',
    swatch: '#D5E3D4',
    isDark: false,
    dressLabel: 'Jardin',
    dressHint: 'Vert feuille et rose séchée',
    colors: {
      bg: '#E7EFE4',
      surface: '#F5FAF3',
      surfaceAlt: '#D5E2D2',
      border: '#C5D4C2',
      text: '#1E2A22',
      textMuted: '#5C6A5E',
      primary: '#3D5A40',
      onPrimary: '#F5FAF3',
      accent: '#C46B78',
      chip: '#E7D0D2',
      coverOverlay: 'rgba(30, 42, 34, 0.12)',
      coverOverlayDeep: 'rgba(30, 42, 34, 0.4)',
    },
  },
  pivoine: {
    key: 'pivoine',
    label: 'Pivoine',
    swatch: '#F0D0D2',
    isDark: false,
    dressLabel: 'Pivoine',
    dressHint: 'Rose soutenu, papier chaud',
    colors: {
      bg: '#F8EEEA',
      surface: '#FFF8F6',
      surfaceAlt: '#F0DDD6',
      border: '#E6CFC8',
      text: '#3A2828',
      textMuted: '#8A706C',
      primary: '#5C6B48',
      onPrimary: '#FFF8F6',
      accent: '#B84D62',
      chip: '#F3D0D4',
      coverOverlay: 'rgba(58, 40, 40, 0.12)',
      coverOverlayDeep: 'rgba(58, 40, 40, 0.42)',
    },
  },
  nuit: {
    key: 'nuit',
    label: 'Nuit',
    swatch: '#1A2820',
    isDark: true,
    dressLabel: 'Soir au jardin',
    dressHint: 'Encre sombre, fleurs pâles',
    colors: {
      bg: '#15201A',
      surface: '#1E2C24',
      surfaceAlt: '#24342A',
      border: '#314438',
      text: '#F4EFE6',
      textMuted: '#C9C0B2',
      primary: '#D7E2C8',
      onPrimary: '#15201A',
      accent: '#E7A8A4',
      chip: '#3A2E30',
      coverOverlay: 'rgba(0, 0, 0, 0.28)',
      coverOverlayDeep: 'rgba(0, 0, 0, 0.55)',
    },
  },
};
