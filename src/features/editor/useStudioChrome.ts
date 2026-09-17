/**
 * Chrome UI du studio — tokens app (coral / plum / cream), jamais la palette invitation.
 * L’aperçu couverture / invité garde `useEditor().theme`.
 */

import { useMemo } from 'react';

import { useAppTheme } from '@/context/ThemePreferenceContext';

export interface StudioChromeColors {
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  onPrimary: string;
  accent: string;
  chip: string;
}

export function useStudioChrome(): StudioChromeColors {
  const { theme } = useAppTheme();
  const c = theme.colors;

  return useMemo(
    () => ({
      bg: c.background,
      surface: c.surface,
      surfaceAlt: c.surfaceElevated,
      border: c.border,
      text: c.textPrimary,
      textMuted: c.textMuted,
      primary: c.accent,
      onPrimary: c.onAccent,
      accent: c.accent,
      chip: c.accentMuted,
    }),
    [c],
  );
}
