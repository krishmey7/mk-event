/**
 * Aurore — panneau émeraude et or, calé sur l’affiche Save the Date.
 */

import type { TemplateColors } from '../elegance/themes';

export type AuroreThemeKey = 'emeraude' | 'sauge' | 'rose' | 'marine' | 'bordeaux' | 'noir';

export const AURORE_THEME_ORDER: AuroreThemeKey[] = [
  'emeraude',
  'sauge',
  'rose',
  'marine',
  'bordeaux',
  'noir',
];

function palette(
  key: AuroreThemeKey,
  label: string,
  swatch: string,
  panel: string,
  panelLift: string,
  gold: string,
  cream: string,
  muted: string,
  dressLabel: string,
  dressHint: string,
): {
  key: AuroreThemeKey;
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
      surface: panelLift,
      surfaceAlt: panel,
      border: muted,
      text: cream,
      textMuted: muted,
      primary: gold,
      onPrimary: panel,
      accent: gold,
      chip: panelLift,
      coverOverlay: 'rgba(0, 0, 0, 0.08)',
      coverOverlayDeep: 'rgba(0, 0, 0, 0.18)',
    },
  };
}

export const AURORE_THEMES = {
  emeraude: palette(
    'emeraude',
    'Émeraude & or',
    '#0C4632',
    '#0C4632',
    '#14543C',
    '#E4C56A',
    '#F3E6C4',
    '#C6A56A',
    'Soirée émeraude',
    'Vert profond et or',
  ),
  sauge: palette(
    'sauge',
    'Sauge dorée',
    '#1E4636',
    '#1E4636',
    '#2A5A46',
    '#E7D7A8',
    '#F6EEDC',
    '#CDB98A',
    'Jardin sauge',
    'Vert doux et or pâle',
  ),
  rose: palette(
    'rose',
    'Grenat & or',
    '#4A2430',
    '#4A2430',
    '#5C3040',
    '#E8C9A2',
    '#F8EDE4',
    '#D7B09A',
    'Soirée grenat',
    'Bordeaux poudré et or',
  ),
  marine: palette(
    'marine',
    'Minuit & or',
    '#0E2744',
    '#0E2744',
    '#163556',
    '#E0C27A',
    '#F4EBD4',
    '#B7C3D4',
    'Marine & or',
    'Bleu nuit et or',
  ),
  bordeaux: palette(
    'bordeaux',
    'Bordeaux',
    '#4A1824',
    '#4A1824',
    '#5E2432',
    '#E6C48A',
    '#F8E8D8',
    '#D4A98A',
    'Velours bordeaux',
    'Rouge profond et or',
  ),
  noir: palette(
    'noir',
    'Noir & or',
    '#141414',
    '#141414',
    '#222222',
    '#D4AF67',
    '#F3E6C8',
    '#A89878',
    'Black tie',
    'Noir et or',
  ),
} as const;
