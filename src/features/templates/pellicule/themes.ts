/**
 * Pellicule — papier ivoire et cadres colorés (pas du noir & blanc).
 */

import type { TemplateColors } from '../elegance/themes';

export type PelliculeThemeKey = 'ivoire' | 'rose' | 'sauge' | 'marine' | 'bordeaux' | 'champagne';

export const PELLICULE_THEME_ORDER: PelliculeThemeKey[] = [
  'ivoire',
  'rose',
  'sauge',
  'marine',
  'bordeaux',
  'champagne',
];

function palette(
  key: PelliculeThemeKey,
  label: string,
  swatch: string,
  paper: string,
  ink: string,
  frame: string,
  gold: string,
  muted: string,
  dressLabel: string,
  dressHint: string,
): {
  key: PelliculeThemeKey;
  label: string;
  swatch: string;
  isDark: boolean;
  dressLabel: string;
  dressHint: string;
  colors: TemplateColors;
} {
  return {
    key,
    label,
    swatch,
    isDark: false,
    dressLabel,
    dressHint,
    colors: {
      bg: paper,
      surface: '#FFFFFF',
      surfaceAlt: paper,
      border: muted,
      text: ink,
      textMuted: muted,
      primary: frame,
      onPrimary: paper,
      accent: gold,
      chip: '#F0E6D6',
      coverOverlay: 'rgba(58, 42, 34, 0.04)',
      coverOverlayDeep: 'rgba(58, 42, 34, 0.1)',
    },
  };
}

export const PELLICULE_THEMES = {
  ivoire: palette(
    'ivoire',
    'Ivoire & espresso',
    '#F7F0E4',
    '#F7F0E4',
    '#3A2A22',
    '#4A3428',
    '#B8923E',
    '#8A7464',
    'Ivoire & or',
    'Tons crème, cadres espresso',
  ),
  rose: palette(
    'rose',
    'Blush & grenat',
    '#F6EAE6',
    '#F6EAE6',
    '#5C2E3A',
    '#7A3B4A',
    '#C4A06A',
    '#9A7A7E',
    'Blush & or',
    'Papier rose, cadres grenat',
  ),
  sauge: palette(
    'sauge',
    'Sauge & bronze',
    '#EEF2EA',
    '#EEF2EA',
    '#2F4034',
    '#3D5344',
    '#B08D4A',
    '#6F7F70',
    'Jardin sauge',
    'Vert doux et bronze',
  ),
  marine: palette(
    'marine',
    'Ciel & marine',
    '#EAF0F4',
    '#EAF0F4',
    '#243448',
    '#2E4560',
    '#B8964A',
    '#6A7A8A',
    'Marine & or',
    'Bleu doux et or',
  ),
  bordeaux: palette(
    'bordeaux',
    'Crème & bordeaux',
    '#F8F1E8',
    '#F8F1E8',
    '#4A1E28',
    '#6B2A36',
    '#C4A06A',
    '#8A6A6E',
    'Bordeaux',
    'Cadres rouge profond',
  ),
  champagne: palette(
    'champagne',
    'Champagne & bronze',
    '#F5ECD8',
    '#F5ECD8',
    '#4A3A28',
    '#6B5638',
    '#C9A227',
    '#8A7A60',
    'Champagne',
    'Or chaud sur papier miel',
  ),
} as const;
