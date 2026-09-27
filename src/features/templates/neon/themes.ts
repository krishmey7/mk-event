/**
 * Néon — noir, blanc, or (palettes claires pour les pages intérieures).
 */

import type { TemplateColors } from '../elegance/themes';

export type NeonThemeKey = 'noirOr' | 'graphite' | 'ivoire' | 'marine' | 'bordeaux' | 'champagne';

export const NEON_THEME_ORDER: NeonThemeKey[] = [
  'noirOr',
  'graphite',
  'ivoire',
  'marine',
  'bordeaux',
  'champagne',
];

function palette(
  key: NeonThemeKey,
  label: string,
  swatch: string,
  bg: string,
  surface: string,
  text: string,
  muted: string,
  gold: string,
  ink: string,
  isDark: boolean,
  dressLabel: string,
  dressHint: string,
): {
  key: NeonThemeKey;
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
    isDark,
    dressLabel,
    dressHint,
    colors: {
      bg,
      surface,
      surfaceAlt: surface,
      border: muted,
      text,
      textMuted: muted,
      primary: ink,
      onPrimary: isDark ? '#F7F4EF' : '#FFFFFF',
      accent: gold,
      chip: isDark ? '#2A2A2A' : '#F0EBE3',
      coverOverlay: 'rgba(0, 0, 0, 0.35)',
      coverOverlayDeep: 'rgba(0, 0, 0, 0.72)',
    },
  };
}

export const NEON_THEMES = {
  noirOr: palette(
    'noirOr',
    'Noir & or',
    '#111111',
    '#FAFAF8',
    '#FFFFFF',
    '#141414',
    '#6B6B6B',
    '#C6A25A',
    '#111111',
    false,
    'Noir & or',
    'Pages claires, accents or',
  ),
  graphite: palette(
    'graphite',
    'Graphite',
    '#2C2C2C',
    '#F6F5F2',
    '#FFFFFF',
    '#1A1A1A',
    '#6A6A6A',
    '#B89755',
    '#222222',
    false,
    'Graphite & or',
    'Gris profond et or doux',
  ),
  ivoire: palette(
    'ivoire',
    'Ivoire',
    '#F2EADF',
    '#FBF8F2',
    '#FFFFFF',
    '#1C1814',
    '#7A7064',
    '#C4A06A',
    '#2A2218',
    false,
    'Ivoire & or',
    'Crème chaude et or',
  ),
  marine: palette(
    'marine',
    'Marine',
    '#1A2433',
    '#F4F6F8',
    '#FFFFFF',
    '#121820',
    '#5C6A78',
    '#C4A86A',
    '#162030',
    false,
    'Marine & or',
    'Bleu nuit et or',
  ),
  bordeaux: palette(
    'bordeaux',
    'Bordeaux',
    '#3A1820',
    '#FBF6F4',
    '#FFFFFF',
    '#1A1012',
    '#7A5C62',
    '#C4A06A',
    '#2E1218',
    false,
    'Bordeaux & or',
    'Velours et or',
  ),
  champagne: palette(
    'champagne',
    'Champagne',
    '#E8D9B8',
    '#FBF8F0',
    '#FFFFFF',
    '#1C1810',
    '#7A7060',
    '#D4AF37',
    '#2A2216',
    false,
    'Champagne',
    'Or champagne lumineux',
  ),
} as const;
