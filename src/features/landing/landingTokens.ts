/**
 * Tokens landing marketing — s’adaptent au mode clair / sombre (préférence système).
 */

import { useMemo } from 'react';

import { useAppTheme } from '@/context/ThemePreferenceContext';
import type { ThemeMode } from '@/constants/theme';

export type LandingTokens = {
  ink: string;
  inkSoft: string;
  cream: string;
  creamMuted: string;
  creamFaint: string;
  coral: string;
  coralDeep: string;
  plum: string;
  border: string;
  surface: string;
  phoneChrome: string;
  phoneNotch: string;
  maxWidth: number;
};

const SHARED = {
  coral: '#E07A5F',
  coralDeep: '#C45D45',
  plum: '#6B3A5C',
  maxWidth: 1120,
} as const;

const DARK: LandingTokens = {
  ...SHARED,
  ink: '#2A1824',
  inkSoft: '#3A2434',
  cream: '#F7F0E8',
  creamMuted: 'rgba(247, 240, 232, 0.62)',
  creamFaint: 'rgba(247, 240, 232, 0.4)',
  border: 'rgba(247, 240, 232, 0.12)',
  surface: 'rgba(247, 240, 232, 0.06)',
  phoneChrome: 'rgba(16, 12, 14, 0.85)',
  phoneNotch: 'rgba(247, 240, 232, 0.18)',
};

const LIGHT: LandingTokens = {
  ...SHARED,
  ink: '#F7F0E8',
  inkSoft: '#EDE4D8',
  cream: '#2A1F24',
  creamMuted: 'rgba(42, 31, 36, 0.62)',
  creamFaint: 'rgba(42, 31, 36, 0.42)',
  border: 'rgba(42, 31, 36, 0.12)',
  surface: 'rgba(42, 31, 36, 0.04)',
  phoneChrome: 'rgba(255, 252, 250, 0.95)',
  phoneNotch: 'rgba(42, 31, 36, 0.14)',
};

/** @deprecated Préférer `useLandingTokens()` — conservé pour maxWidth / layouts non colorés. */
export const LANDING = DARK;

export function getLandingTokens(mode: ThemeMode): LandingTokens {
  return mode === 'light' ? LIGHT : DARK;
}

export function useLandingTokens(): LandingTokens {
  const { mode } = useAppTheme();
  return useMemo(() => getLandingTokens(mode), [mode]);
}
