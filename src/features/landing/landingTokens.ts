/**
 * Tokens landing — toujours mode clair (indépendant du thème système).
 * Langage Edulex adapté : blancs doux, orbes, glass, ombres soft.
 */

export type LandingTokens = {
  bg: string;
  bgSoft: string;
  surface: string;
  surfaceGlass: string;
  text: string;
  textMuted: string;
  textFaint: string;
  coral: string;
  coralSoft: string;
  plum: string;
  plumSoft: string;
  border: string;
  borderStrong: string;
  phoneChrome: string;
  phoneNotch: string;
  shadow: string;
  maxWidth: number;
};

export const LANDING: LandingTokens = {
  bg: '#FAF7F3',
  bgSoft: '#F3ECE4',
  surface: '#FFFFFF',
  surfaceGlass: 'rgba(255, 255, 255, 0.72)',
  text: '#2A1F24',
  textMuted: 'rgba(42, 31, 36, 0.62)',
  textFaint: 'rgba(42, 31, 36, 0.42)',
  coral: '#E07A5F',
  coralSoft: 'rgba(224, 122, 95, 0.16)',
  plum: '#6B3A5C',
  plumSoft: 'rgba(107, 58, 92, 0.12)',
  border: 'rgba(42, 31, 36, 0.08)',
  borderStrong: 'rgba(42, 31, 36, 0.14)',
  phoneChrome: '#FFFFFF',
  phoneNotch: 'rgba(42, 31, 36, 0.12)',
  shadow: 'rgba(42, 31, 36, 0.1)',
  maxWidth: 1120,
};

/** Alias stable pour les imports existants. */
export function useLandingTokens(): LandingTokens {
  return LANDING;
}
