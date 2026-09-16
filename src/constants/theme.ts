/**
 * ──────────────────────────────────────────────────────────────
 *  MK EVENT — DESIGN SYSTEM (tokens, typographie & thèmes)
 * ──────────────────────────────────────────────────────────────
 *  Atelier clair — pierre froide, encre ardoise, accent eucalyptus.
 *  (Les invitations gardent leur or champagne via brandColors.)
 *
 *  1. « Ardoise » — chrome sombre (login / mode sombre)
 *  2. « Brume » — dashboard, listes, formulaires
 *
 *  Règles React Native respectées ici :
 *  • Règle n°2 (compat web/mobile) : aucune ombre brute dans les
 *    composants — tout passe par `shadows.*` qui isole via
 *    Platform.select() le `boxShadow` (web) du couple
 *    shadowColor/elevation (natif). Aucun calc() dans les styles.
 *  • Tokens strictement typés (`AppTheme`) pour une autocomplétion
 *    et une refactorisation sûres.
 * ──────────────────────────────────────────────────────────────
 */

import { Platform, type TextStyle, type ViewStyle } from 'react-native';
import type { RsvpStatus } from '../types';

/* ═══════════════════════════ Types ═══════════════════════════ */

export type ThemeMode = 'light' | 'dark';

/** Contrat identique pour les deux univers (Dark Luxury / Clean Editorial). */
export interface ThemePalette {
  /* Fonds */
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  borderStrong: string;
  /* Textes */
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  /* Marque — or miel */
  accent: string;
  accentSoft: string;
  accentMuted: string;
  onAccent: string;
  /* Boutons charbon (« Suivant », « Valider », « Publier l'invitation ») */
  inkButton: string;
  onInkButton: string;
  /* Overlay (modales, aperçu plein écran) */
  overlay: string;
}

/** Couleurs d'un badge (RSVP, statut d'invitation…). */
export interface BadgePalette {
  text: string;
  background: string;
  border: string;
}

/** Thème complet consommé par les composants (via useTheme — étape suivante). */
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

/* ══════════════════ Marque & couleurs sémantiques ══════════════════ */

/** Couleurs de marque — clés `gold*` conservées (compat) = champagne mat. */
export const brandColors = {
  /** Champagne mat — CTA, accents. Ancien or vif retiré. */
  gold: '#C4A574',
  /** Bronze plus profond — icônes, états secondaires. */
  goldSoft: '#A98246',
  goldGradient: ['#C4A574', '#A98246'] as [string, string],
  /** Encre posée sur champagne (contraste CTA). */
  ink: '#1C1712',
  cream: '#F3EEE4',
  creamDeep: '#E8DFD0',
  charcoal: '#1C1915',
} as const;

/** RSVP & états — sauge / ocre / terre cuite / ardoise (plus Bootstrap). */
export const semanticColors = {
  success: '#5C6B4A',
  warning: '#B0894F',
  danger: '#A45A45',
  info: '#5C6670',
} as const;

/* ════════════════════════ Palettes des modes ════════════════════════ */

/** Univers sombre — ardoise froide (landing, login, mode sombre). */
const darkPalette: ThemePalette = {
  background: '#121820',
  surface: '#1A222C',
  surfaceElevated: '#232C38',
  border: 'rgba(242, 244, 247, 0.1)',
  borderStrong: 'rgba(91, 168, 159, 0.32)',
  textPrimary: '#F2F4F7',
  textSecondary: '#B0B8C4',
  textMuted: 'rgba(176, 184, 196, 0.62)',
  textInverse: '#0F1419',
  accent: '#5BA89F',
  accentSoft: '#7BC4BB',
  accentMuted: 'rgba(91, 168, 159, 0.16)',
  onAccent: '#0F1419',
  inkButton: '#F2F4F7',
  onInkButton: '#0F1419',
  overlay: 'rgba(8, 10, 14, 0.72)',
};

/** Univers clair — brume froide (dashboard, listes, formulaires). */
const lightPalette: ThemePalette = {
  background: '#EEF1F4',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  border: '#DCE1E8',
  borderStrong: '#C5CDD6',
  textPrimary: '#15181E',
  textSecondary: '#5A6270',
  textMuted: '#8B93A1',
  textInverse: '#FFFFFF',
  accent: '#2F6F69',
  accentSoft: '#245A55',
  accentMuted: 'rgba(47, 111, 105, 0.12)',
  onAccent: '#FFFFFF',
  inkButton: '#15181E',
  onInkButton: '#FFFFFF',
  overlay: 'rgba(21, 24, 30, 0.42)',
};

/* ════════════════════════ Badges RSVP ════════════════════════ */

/** Badges RSVP : sauge / ocre / ardoise / terre cuite. */
export const rsvpBadgeColors: Record<ThemeMode, Record<RsvpStatus, BadgePalette>> = {
  light: {
    confirmed: { text: '#3F4A32', background: 'rgba(92, 107, 74, 0.14)', border: 'rgba(92, 107, 74, 0.28)' },
    pending: { text: '#7A5C2E', background: 'rgba(176, 137, 79, 0.16)', border: 'rgba(176, 137, 79, 0.32)' },
    maybe: { text: '#3F464D', background: 'rgba(92, 102, 112, 0.12)', border: 'rgba(92, 102, 112, 0.26)' },
    declined: { text: '#7A4034', background: 'rgba(164, 90, 69, 0.12)', border: 'rgba(164, 90, 69, 0.28)' },
  },
  dark: {
    confirmed: { text: '#C5D0B4', background: 'rgba(92, 107, 74, 0.28)', border: 'rgba(197, 208, 180, 0.28)' },
    pending: { text: '#E4C896', background: 'rgba(176, 137, 79, 0.22)', border: 'rgba(228, 200, 150, 0.28)' },
    maybe: { text: '#C5CBD1', background: 'rgba(92, 102, 112, 0.28)', border: 'rgba(197, 203, 209, 0.24)' },
    declined: { text: '#E2B4A8', background: 'rgba(164, 90, 69, 0.24)', border: 'rgba(226, 180, 168, 0.28)' },
  },
};

/** Couleur pleine associée à chaque statut RSVP (points de légende, icônes…). */
export const rsvpStatusColors: Record<RsvpStatus, string> = {
  confirmed: semanticColors.success,
  pending: semanticColors.warning,
  maybe: semanticColors.info,
  declined: semanticColors.danger,
};

/* ════════════════════════ Typographie ════════════════════════ */

/**
 * Titres : Fraunces (serif éditoriale 2020s, moins « template mariage »
 * que Playfair). Corps : Inter.
 */
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

/** Échelle typographique — presets réutilisables (couleur gérée par la palette). */
export const typography = {
  display: { fontFamily: fontFamilies.serifSemiBold, fontSize: 34, lineHeight: 42, letterSpacing: -0.5 },
  h1: { fontFamily: fontFamilies.serifSemiBold, fontSize: 28, lineHeight: 36, letterSpacing: -0.4 },
  h2: { fontFamily: fontFamilies.serifMedium, fontSize: 24, lineHeight: 32, letterSpacing: -0.3 },
  h3: { fontFamily: fontFamilies.serifMedium, fontSize: 20, lineHeight: 28 },
  /** « Vous êtes invité ! », devises des cartes d'invitation. */
  quote: { fontFamily: fontFamilies.serifItalic, fontSize: 18, lineHeight: 26 },
  title: { fontFamily: fontFamilies.sansSemiBold, fontSize: 17, lineHeight: 24 },
  body: { fontFamily: fontFamilies.sans, fontSize: 15, lineHeight: 23 },
  bodyMedium: { fontFamily: fontFamilies.sansMedium, fontSize: 15, lineHeight: 23 },
  bodySmall: { fontFamily: fontFamilies.sans, fontSize: 13, lineHeight: 19 },
  caption: { fontFamily: fontFamilies.sansMedium, fontSize: 12, lineHeight: 16 },
  /** Labels de section, sous-titre du logo « MK EVENT ». */
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

/**
 * Règle n°2 — isolation des ombres par plateforme :
 *  • web   → `boxShadow` (CSS) ;
 *  • natif → `shadowColor/Offset/Opacity/Radius` (iOS) + `elevation` (Android).
 * Toujours consommer `shadows.*`, jamais d'ombre codée en dur dans un composant.
 */
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
    web: { boxShadow: '0 1px 3px rgba(11, 12, 16, 0.08), 0 1px 2px rgba(11, 12, 16, 0.06)' },
    default: nativeShadow('#1C1712', 1, 0.08, 3, 1),
  }),
  /** Cartes « Clean & Editorial ». */
  md: Platform.select<ViewStyle>({
    web: { boxShadow: '0 4px 12px rgba(11, 12, 16, 0.10)' },
    default: nativeShadow('#1C1712', 4, 0.1, 8, 3),
  }),
  /** Modales, aperçu plein écran, cartes flottantes. */
  lg: Platform.select<ViewStyle>({
    web: { boxShadow: '0 12px 32px rgba(11, 12, 16, 0.16)' },
    default: nativeShadow('#1C1712', 12, 0.14, 24, 8),
  }),
  /** Halo champagne discret (plus de glow fintech). */
  gold: Platform.select<ViewStyle>({
    web: { boxShadow: '0 4px 14px rgba(169, 130, 70, 0.18)' },
    default: nativeShadow('#A98246', 4, 0.18, 12, 3),
  }),
};

/* ══════════════════ Layout & points de rupture ══════════════════ */

export const layout = {
  screenPadding: 20,
  cardPadding: 16,
  headerHeight: 56,
  tabBarHeight: 64,
  /** Sidebar du dashboard desktop (maquette « Tableau de bord »). */
  sidebarWidth: 260,
  /** Largeur max des formulaires Connexion / Inscription. */
  formMaxWidth: 480,
  /** Conteneur principal desktop. */
  contentMaxWidth: 1200,
} as const;

/** Règle n°3 — bascule fluide flux vertical (mobile) → sidebar + grille (desktop). */
export const breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1200,
} as const;

export type Breakpoint = keyof typeof breakpoints;

/** Point de rupture courant pour une largeur donnée. */
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

/**
 * Résout le thème courant (accepte `null`/`undefined` retournés par
 * `useColorScheme()` et bascule sur « light » par défaut).
 */
export const getTheme = (mode?: ThemeMode | null): AppTheme => themes[mode === 'dark' ? 'dark' : 'light'];

