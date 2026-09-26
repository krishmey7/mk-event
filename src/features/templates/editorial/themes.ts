/**
 * Revue — quiet luxury 2026 : papier, encre, une seule accentuation.
 */

import type { TemplateColors } from '@/features/templates/elegance/themes';

export interface EditorialTheme {
  key: string;
  label: string;
  swatch: string;
  isDark: boolean;
  dressLabel: string;
  dressHint: string;
  colors: TemplateColors;
}

export const EDITORIAL_THEME_ORDER = ['avoine', 'encre', 'sauge', 'caramel'] as const;

export const EDITORIAL_THEMES: Record<(typeof EDITORIAL_THEME_ORDER)[number], EditorialTheme> = {
  avoine: {
    key: 'avoine',
    label: 'Avoine',
    swatch: '#E7DFD2',
    isDark: false,
    dressLabel: 'Ivoire & lin',
    dressHint: 'Quiet luxury, tons chauds',
    colors: {
      bg: '#F4EFE6',
      surface: '#FBF8F3',
      surfaceAlt: '#EBE4D8',
      border: '#DDD4C6',
      text: '#1C1916',
      textMuted: '#6F675C',
      primary: '#1C1916',
      onPrimary: '#F4EFE6',
      accent: '#8C6A45',
      chip: '#E7DFD2',
      coverOverlay: 'rgba(28, 25, 22, 0.18)',
      coverOverlayDeep: 'rgba(28, 25, 22, 0.45)',
    },
  },
  encre: {
    key: 'encre',
    label: 'Encre',
    swatch: '#1C1916',
    isDark: true,
    dressLabel: 'Noir & argent',
    dressHint: 'Soirée éditoriale',
    colors: {
      bg: '#12100E',
      surface: '#1C1916',
      surfaceAlt: '#2A2622',
      border: '#3A342C',
      text: '#F4EFE6',
      textMuted: '#B7AFA3',
      primary: '#F4EFE6',
      onPrimary: '#12100E',
      accent: '#C8C2B8',
      chip: '#2A2622',
      coverOverlay: 'rgba(0, 0, 0, 0.28)',
      coverOverlayDeep: 'rgba(0, 0, 0, 0.55)',
    },
  },
  sauge: {
    key: 'sauge',
    label: 'Pierre & sauge',
    swatch: '#C9D2C4',
    isDark: false,
    dressLabel: 'Sauge douce',
    dressHint: 'Jardin, lin naturel',
    colors: {
      bg: '#EEF0EA',
      surface: '#F7F8F4',
      surfaceAlt: '#E0E5DA',
      border: '#D0D6C8',
      text: '#1E2822',
      textMuted: '#5E6B62',
      primary: '#2C4036',
      onPrimary: '#F4F6F1',
      accent: '#6E8A74',
      chip: '#E0E5DA',
      coverOverlay: 'rgba(30, 40, 34, 0.2)',
      coverOverlayDeep: 'rgba(30, 40, 34, 0.48)',
    },
  },
  caramel: {
    key: 'caramel',
    label: 'Caramel',
    swatch: '#C4A484',
    isDark: false,
    dressLabel: 'Sable & caramel',
    dressHint: 'Lumière de fin d’après-midi',
    colors: {
      bg: '#F6EFE6',
      surface: '#FFF9F3',
      surfaceAlt: '#EFE2D2',
      border: '#E4D3C0',
      text: '#2A2118',
      textMuted: '#7A6A58',
      primary: '#6B4A2E',
      onPrimary: '#FFF8F0',
      accent: '#A67C52',
      chip: '#EFE2D2',
      coverOverlay: 'rgba(42, 33, 24, 0.2)',
      coverOverlayDeep: 'rgba(42, 33, 24, 0.5)',
    },
  },
};
