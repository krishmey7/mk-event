/**
 * MK EVENT — Design system (Coral + Plum + Cream).
 * Joie chaude pour le chrome app — les modèles d’invitation gardent leurs palettes.
 */

import { Platform, type TextStyle, type ViewStyle } from 'react-native';
import type { RsvpStatus } from '../types';

/* ═══════════════════════════ Types ═══════════════════════════ */

export type ThemeMode = 'light' | 'dark';

export interface ThemePalette {
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  borderStrong: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  accent: string;
  accentSoft: string;
  accentMuted: string;
  onAccent: string;
  inkButton: string;
  onInkButton: string;
  overlay: string;
}

export interface BadgePalette {
  text: string;
  background: string;
  border: string;
}

export interface AppTheme {
  mode: ThemeMode;
  colors: ThemePalette;
  semantic: typeof semanticColors;
  fontFamilies: typeof fontFamilies;
  typography: typeof typography;
  spacing: typeof spacing;
  radii: typeof radii;
  shadows: typeof shadows;
  layout: typeof layout;
}

/* ══════════════════ Marque Coral · Plum · Cream ══════════════════ */

export const brandColors = {
  /** Coral — CTA, accents joyeux (chrome app). */
  coral: '#E07A5F',
  coralDeep: '#C45D45',
  coralSoft: '#F0A090',
  /** Plum — profondeur, titres, mode sombre. */
  plum: '#6B3A5C',
  plumDeep: '#4A2740',
  plumSoft: '#9B6B8A',
  /** Cream — fonds chauds. */
  cream: '#F7F0E8',
  creamDeep: '#EDE4D8',
  creamSoft: '#FBF6F0',
  /**
   * Champagne — identité des invitations / logo modèle.
   * Ne pas confondre avec `coral` (chrome app).
   */
  gold: '#C4A574',
  goldSoft: '#A98246',
  goldGradient: ['#C4A574', '#A98246'] as [string, string],
  ink: '#2A1F24',
  charcoal: '#2A1F24',
} as const;

export const semanticColors = {
  success: '#5C7A4A',
  warning: '#D4A017',
  danger: '#C45D45',
  info: '#6B3A5C',
} as const;

/* ════════════════════════ Palettes des modes ════════════════════════ */

/** Mode sombre — plum profond + coral. */
const darkPalette: ThemePalette = {
  background: '#2A1824',
  surface: '#3A2434',
  surfaceElevated: '#4A3044',
  border: 'rgba(247, 240, 232, 0.12)',
  borderStrong: 'rgba(224, 122, 95, 0.35)',
  textPrimary: '#F7F0E8',
  textSecondary: '#D4C4CE',
  textMuted: 'rgba(212, 196, 206, 0.65)',
  textInverse: '#2A1F24',
  accent: '#E07A5F',
  accentSoft: '#F0A090',
  accentMuted: 'rgba(224, 122, 95, 0.18)',
  onAccent: '#2A1F24',
  inkButton: '#F7F0E8',
  onInkButton: '#2A1F24',
  overlay: 'rgba(20, 12, 18, 0.72)',
};

/** Mode clair — cream chaud + coral + plum. */
const lightPalette: ThemePalette = {
  background: '#F7F0E8',
  surface: '#FFFCFA',
  surfaceElevated: '#FFFFFF',
  border: '#E8D9CE',
  borderStrong: '#D4B8A8',
  textPrimary: '#2A1F24',
  textSecondary: '#6B5560',
  textMuted: '#9A8490',
  textInverse: '#FFFFFF',
  accent: '#E07A5F',
  accentSoft: '#C45D45',
  accentMuted: 'rgba(224, 122, 95, 0.14)',
  onAccent: '#FFFFFF',
  inkButton: '#6B3A5C',
  onInkButton: '#F7F0E8',
  overlay: 'rgba(42, 31, 36, 0.42)',
};

/* ════════════════════════ Badges RSVP ════════════════════════ */

export const rsvpBadgeColors: Record<ThemeMode, Record<RsvpStatus, BadgePalette>> = {
  light: {
    confirmed: { text: '#3F5A32', background: 'rgba(92, 122, 74, 0.14)', border: 'rgba(92, 122, 74, 0.28)' },
    pending: { text: '#8A6A20', background: 'rgba(212, 160, 23, 0.16)', border: 'rgba(212, 160, 23, 0.32)' },
    maybe: { text: '#5A3A4E', background: 'rgba(107, 58, 92, 0.12)', border: 'rgba(107, 58, 92, 0.26)' },
    declined: { text: '#8A4034', background: 'rgba(196, 93, 69, 0.12)', border: 'rgba(196, 93, 69, 0.28)' },
  },
  dark: {
    confirmed: { text: '#C5D0B4', background: 'rgba(92, 122, 74, 0.28)', border: 'rgba(197, 208, 180, 0.28)' },
    pending: { text: '#E8D090', background: 'rgba(212, 160, 23, 0.22)', border: 'rgba(232, 208, 144, 0.28)' },
    maybe: { text: '#D4B8C8', background: 'rgba(107, 58, 92, 0.28)', border: 'rgba(212, 184, 200, 0.24)' },
    declined: { text: '#F0B8A8', background: 'rgba(196, 93, 69, 0.24)', border: 'rgba(240, 184, 168, 0.28)' },
  },
};

export const rsvpStatusColors: Record<RsvpStatus, string> = {
  confirmed: semanticColors.success,
  pending: semanticColors.warning,
  maybe: semanticColors.info,
  declined: semanticColors.danger,
};

/* ════════════════════════ Typographie ════════════════════════ */

export const fontFamilies = {
  serif: Platform.select({
    web: 'Fraunces_400Regular, "Iowan Old Style", Georgia, serif',
    default: 'Fraunces_400Regular',
  }),
  serifMedium: Platform.select({
    web: 'Fraunces_500Medium, Georgia, serif',
    default: 'Fraunces_500Medium',
  }),
  serifSemiBold: Platform.select({
    web: 'Fraunces_600SemiBold, Georgia, serif',
    default: 'Fraunces_600SemiBold',
  }),
  serifItalic: Platform.select({
    web: 'Fraunces_400Regular_Italic, Georgia, serif',
    default: 'Fraunces_400Regular_Italic',
  }),
  sans: Platform.select({
    web: '"Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    default: 'Inter_400Regular',
  }),
  sansMedium: Platform.select({
    web: '"Inter", "Segoe UI", Arial, sans-serif',
    default: 'Inter_500Medium',
  }),
  sansSemiBold: Platform.select({
    web: '"Inter", "Segoe UI", Arial, sans-serif',
    default: 'Inter_600SemiBold',
  }),
};

export const typography = {
  display: { fontFamily: fontFamilies.serifSemiBold, fontSize: 34, lineHeight: 42, letterSpacing: -0.5 },
  h1: { fontFamily: fontFamilies.serifSemiBold, fontSize: 28, lineHeight: 36, letterSpacing: -0.4 },
  h2: { fontFamily: fontFamilies.serifMedium, fontSize: 24, lineHeight: 32, letterSpacing: -0.3 },
  h3: { fontFamily: fontFamilies.serifMedium, fontSize: 20, lineHeight: 28 },
  quote: { fontFamily: fontFamilies.serifItalic, fontSize: 18, lineHeight: 26 },
  title: { fontFamily: fontFamilies.sansSemiBold, fontSize: 17, lineHeight: 24 },
  body: { fontFamily: fontFamilies.sans, fontSize: 15, lineHeight: 23 },
  bodyMedium: { fontFamily: fontFamilies.sansMedium, fontSize: 15, lineHeight: 23 },
  bodySmall: { fontFamily: fontFamilies.sans, fontSize: 13, lineHeight: 19 },
  caption: { fontFamily: fontFamilies.sansMedium, fontSize: 12, lineHeight: 16 },
  overline: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.6,
    textTransform: 'uppercase' as const,
  },
  button: { fontFamily: fontFamilies.sansSemiBold, fontSize: 15, lineHeight: 20, letterSpacing: 0.2 },
} satisfies Record<string, TextStyle>;

/* ════════════════════ Espacements & rayons ════════════════════ */

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

/* ════════════════════════ Ombres ════════════════════════ */

const nativeShadow = (
  color: string,
  offsetY: number,
  opacity: number,
  radius: number,
  elevation: number,
): ViewStyle => ({
  shadowColor: color,
  shadowOffset: { width: 0, height: offsetY },
  shadowOpacity: opacity,
  shadowRadius: radius,
  elevation,
});

export const shadows = {
  sm: Platform.select<ViewStyle>({
    web: { boxShadow: '0 1px 3px rgba(42, 31, 36, 0.07), 0 1px 2px rgba(42, 31, 36, 0.05)' },
    default: nativeShadow('#2A1F24', 1, 0.07, 3, 1),
  }),
  md: Platform.select<ViewStyle>({
    web: { boxShadow: '0 4px 14px rgba(42, 31, 36, 0.10)' },
    default: nativeShadow('#2A1F24', 4, 0.1, 8, 3),
  }),
  lg: Platform.select<ViewStyle>({
    web: { boxShadow: '0 12px 32px rgba(42, 31, 36, 0.14)' },
    default: nativeShadow('#2A1F24', 12, 0.14, 24, 8),
  }),
  gold: Platform.select<ViewStyle>({
    web: { boxShadow: '0 4px 16px rgba(224, 122, 95, 0.22)' },
    default: nativeShadow('#E07A5F', 4, 0.2, 12, 3),
  }),
};

/* ══════════════════ Layout & points de rupture ══════════════════ */

export const layout = {
  screenPadding: 20,
  cardPadding: 16,
  headerHeight: 56,
  tabBarHeight: 64,
  sidebarWidth: 260,
  formMaxWidth: 480,
  contentMaxWidth: 1200,
} as const;

export const breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1200,
} as const;

export type Breakpoint = keyof typeof breakpoints;

export const getBreakpoint = (width: number): Breakpoint => {
  if (width >= breakpoints.desktop) return 'desktop';
  if (width >= breakpoints.tablet) return 'tablet';
  return 'mobile';
};

/* ════════════════════════ Thèmes ════════════════════════ */

export const darkTheme: AppTheme = {
  mode: 'dark',
  colors: darkPalette,
  semantic: semanticColors,
  fontFamilies,
  typography,
  spacing,
  radii,
  shadows,
  layout,
};

export const lightTheme: AppTheme = {
  mode: 'light',
  colors: lightPalette,
  semantic: semanticColors,
  fontFamilies,
  typography,
  spacing,
  radii,
  shadows,
  layout,
};

export const themes: Record<ThemeMode, AppTheme> = {
  dark: darkTheme,
  light: lightTheme,
};

export const getTheme = (mode?: ThemeMode | null): AppTheme =>
  themes[mode === 'dark' ? 'dark' : 'light'];
