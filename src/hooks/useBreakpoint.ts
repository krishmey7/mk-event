/**
 * ──────────────────────────────────────────────────────────────
 *  MK EVENT — HOOK DE RESPONSIVITÉ (règle n°3)
 * ──────────────────────────────────────────────────────────────
 *  Point de rupture courant dérivé de la largeur de fenêtre :
 *  bascule fluide mobile (flux vertical) → tablette → desktop
 *  (sidebar + grilles multi-colonnes). Se réabonne aux changements
 *  de dimensions (rotation, redimensionnement web).
 * ──────────────────────────────────────────────────────────────
 */

import { useWindowDimensions } from 'react-native';

import { getBreakpoint, type Breakpoint } from '@/constants/theme';

export interface BreakpointInfo {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  /** Tablette ou desktop — pour passer en grilles multi-colonnes. */
  isWide: boolean;
}

export function useBreakpoint(): BreakpointInfo {
  const { width, height } = useWindowDimensions();
  const breakpoint = getBreakpoint(width);

  return {
    width,
    height,
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    isWide: breakpoint !== 'mobile',
  };
}
