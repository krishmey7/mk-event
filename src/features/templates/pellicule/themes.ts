/**
 * Pellicule — fond sombre texturé, texte clair et or (pas d’aplat).
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
  panel: string,
  cream: string,
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
    isDark: true,
    dressLabel,
    dressHint,
    colors: {
      bg: panel,
      surface: mixToward(panel, '#FFFFFF', 0.08),
      surfaceAlt: panel,
      border: muted,
      text: cream,
      textMuted: muted,
      primary: frame,
      onPrimary: cream,
      accent: gold,
      chip: mixToward(panel, '#FFFFFF', 0.12),
      coverOverlay: 'rgba(255, 255, 255, 0.04)',
      coverOverlayDeep: 'rgba(0, 0, 0, 0.22)',
    },
  };
}

function mixToward(hex: string, toward: string, amount: number): string {
  const parse = (value: string) => {
    const raw = value.replace('#', '');
    return [0, 1, 2].map((i) => parseInt(raw.slice(i * 2, i * 2 + 2), 16));
  };
  const a = parse(hex);
  const b = parse(toward);
  return `#${a
    .map((c, i) => Math.max(0, Math.min(255, Math.round(c + (b[i] - c) * amount))).toString(16).padStart(2, '0'))
    .join('')}`;
}

export const PELLICULE_THEMES = {
  ivoire: palette(
    'ivoire',
    'Espresso & ivoire',
    '#2A1C16',
    '#2A1C16',
    '#F3E6D4',
    '#C4A06A',
    '#E0C07A',
    '#B8A090',
    'Espresso & or',
    'Fond brun profond, écriture ivoire',
  ),
  rose: palette(
    'rose',
    'Grenat & blush',
    '#3A1C26',
    '#3A1C26',
    '#F6E6E4',
    '#D4A070',
    '#E8C090',
    '#C4A0A4',
    'Grenat & or',
    'Fond grenat, texte blush',
  ),
  sauge: palette(
    'sauge',
    'Forêt & crème',
    '#1C2A22',
    '#1C2A22',
    '#E8F0E6',
    '#C4A86A',
    '#D8C080',
    '#A0B0A4',
    'Forêt & or',
    'Vert profond et crème',
  ),
  marine: palette(
    'marine',
    'Nuit & or',
    '#162030',
    '#162030',
    '#E6EEF4',
    '#C4A86A',
    '#D8C080',
    '#90A0B0',
    'Marine & or',
    'Bleu nuit et or',
  ),
  bordeaux: palette(
    'bordeaux',
    'Velours & or',
    '#2E1218',
    '#2E1218',
    '#F6E8E0',
    '#D4A070',
    '#E8C090',
    '#C09098',
    'Bordeaux',
    'Velours sombre et or',
  ),
  champagne: palette(
    'champagne',
    'Bronze & champagne',
    '#2A2216',
    '#2A2216',
    '#F5ECD8',
    '#D4AF37',
    '#E8D080',
    '#B8A888',
    'Champagne',
    'Bronze profond et champagne',
  ),
} as const;
