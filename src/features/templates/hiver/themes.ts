/**
 * Modèle « Hiver » — palettes calées sur l’affiche marine & or.
 */

import type { TemplateColors } from '../elegance/themes';

export type HiverThemeKey = 'navyGold' | 'givre' | 'minuit' | 'glacier' | 'grenat' | 'neige';

export const HIVER_THEMES: Record<
  HiverThemeKey,
  {
    key: HiverThemeKey;
    label: string;
    swatch: string;
    isDark: boolean;
    dressLabel: string;
    dressHint: string;
    colors: TemplateColors;
  }
> = {
  navyGold: {
    key: 'navyGold',
    label: 'Marine & or',
    swatch: '#0D2744',
    isDark: true,
    dressLabel: 'Cocktail marine & or',
    dressHint: 'Tenue de soirée, tons froids',
    colors: {
      bg: '#0A2240',
      surface: '#123052',
      surfaceAlt: '#071A32',
      border: '#2C4E72',
      text: '#C8D9EA',
      textMuted: '#8FAEC4',
      primary: '#D4B45A',
      onPrimary: '#0B1A2C',
      accent: '#D4B45A',
      chip: '#1A3A5C',
      coverOverlay: 'rgba(8, 24, 44, 0.08)',
      coverOverlayDeep: 'rgba(6, 18, 36, 0.12)',
    },
  },
  givre: {
    key: 'givre',
    label: 'Givre argenté',
    swatch: '#8FB4CE',
    isDark: true,
    dressLabel: 'White tie givré',
    dressHint: 'Blanc cassé, argent, bleu glacier',
    colors: {
      bg: '#16344C',
      surface: '#1E425C',
      surfaceAlt: '#102838',
      border: '#3A5C74',
      text: '#F4F7FA',
      textMuted: '#B7C9D6',
      primary: '#C5D4DE',
      onPrimary: '#122838',
      accent: '#E8F0F6',
      chip: '#244860',
      coverOverlay: 'rgba(16, 40, 56, 0.1)',
      coverOverlayDeep: 'rgba(10, 28, 40, 0.14)',
    },
  },
  minuit: {
    key: 'minuit',
    label: 'Minuit',
    swatch: '#081018',
    isDark: true,
    dressLabel: 'Black tie d’hiver',
    dressHint: 'Noir profond, or pâle',
    colors: {
      bg: '#071018',
      surface: '#121A24',
      surfaceAlt: '#05080C',
      border: '#2A3440',
      text: '#F2EFE6',
      textMuted: '#9AA3AE',
      primary: '#C4A574',
      onPrimary: '#0A1016',
      accent: '#D8C09A',
      chip: '#1A222C',
      coverOverlay: 'rgba(4, 8, 12, 0.12)',
      coverOverlayDeep: 'rgba(2, 4, 8, 0.18)',
    },
  },
  glacier: {
    key: 'glacier',
    label: 'Glacier',
    swatch: '#2F6A7A',
    isDark: true,
    dressLabel: 'Cocktail glacier',
    dressHint: 'Bleu-vert, or chaud',
    colors: {
      bg: '#163A44',
      surface: '#1E4A56',
      surfaceAlt: '#0E2C34',
      border: '#32606C',
      text: '#F3F6F4',
      textMuted: '#A8C4C8',
      primary: '#D2B17A',
      onPrimary: '#102428',
      accent: '#E0C48A',
      chip: '#245058',
      coverOverlay: 'rgba(12, 36, 42, 0.1)',
      coverOverlayDeep: 'rgba(8, 24, 30, 0.16)',
    },
  },
  grenat: {
    key: 'grenat',
    label: 'Grenat d’hiver',
    swatch: '#5A2030',
    isDark: true,
    dressLabel: 'Velours grenat',
    dressHint: 'Bordeaux, or, soirée d’hiver',
    colors: {
      bg: '#3A1822',
      surface: '#4A222C',
      surfaceAlt: '#2A1018',
      border: '#6A3844',
      text: '#F7ECE6',
      textMuted: '#D0A8A8',
      primary: '#D6A35C',
      onPrimary: '#2A1016',
      accent: '#E0B878',
      chip: '#542830',
      coverOverlay: 'rgba(40, 12, 18, 0.12)',
      coverOverlayDeep: 'rgba(24, 8, 12, 0.18)',
    },
  },
  neige: {
    key: 'neige',
    label: 'Neige ivoire',
    swatch: '#EEF3F8',
    isDark: false,
    dressLabel: 'Tenue claire d’hiver',
    dressHint: 'Ivoire, marine, or discret',
    colors: {
      bg: '#E8EEF4',
      surface: '#FFFFFF',
      surfaceAlt: '#D8E4EE',
      border: '#C5D4E0',
      text: '#0C2340',
      textMuted: '#5A7388',
      primary: '#8A6A3A',
      onPrimary: '#FFF8EC',
      accent: '#C9A56A',
      chip: '#DCE6EE',
      coverOverlay: 'rgba(12, 35, 64, 0.04)',
      coverOverlayDeep: 'rgba(12, 35, 64, 0.08)',
    },
  },
};

export const HIVER_THEME_ORDER: HiverThemeKey[] = [
  'navyGold',
  'givre',
  'minuit',
  'glacier',
  'grenat',
  'neige',
];
