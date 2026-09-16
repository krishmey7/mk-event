/**
 * ──────────────────────────────────────────────────────────────
 *  MK EVENT — MODÈLE « ÉLÉGANCE » · THÈMES DE COULEUR (planche 3)
 * ──────────────────────────────────────────────────────────────
 *  6 thèmes sélectionnables par les mariés (Vue 8 de la maquette) :
 *  Champagne (défaut) · Rose poudré · Vert sauge · Bleu marine ·
 *  Bordeaux · Noir élégant (mode sombre immersif).
 *
 *  Chaque thème pilote TOUTES les vues du modèle : fond de page,
 *  surface des cartes, couleur d'accent (boutons pilules, ligne
 *  de timeline), voile de la photo de couverture.
 * ──────────────────────────────────────────────────────────────
 */

export type TemplateThemeKey = 'champagne' | 'rose' | 'sauge' | 'marine' | 'bordeaux' | 'noir';

export interface TemplateColors {
  /** Fond de page des vues intérieures. */
  bg: string;
  /** Cartes / champs de formulaire. */
  surface: string;
  /** Fond secondaire (bulles d'icônes, puces). */
  surfaceAlt: string;
  /** Bordures fines des champs / cartes. */
  border: string;
  /** Texte principal. */
  text: string;
  /** Texte secondaire / descriptions. */
  textMuted: string;
  /** Couleur des boutons pilules & icônes (bronze/or selon thème). */
  primary: string;
  /** Texte posé sur `primary`. */
  onPrimary: string;
  /** Ligne d'or des timelines & détails floraux. */
  accent: string;
  /** Fond des pastilles rondes du programme. */
  chip: string;
  /** Voile posé sur la photo de couverture. */
  coverOverlay: string;
  /** Voile complémentaire bas de couverture (lisibilité carte d'accueil). */
  coverOverlayDeep: string;
}

export interface TemplateTheme {
  key: TemplateThemeKey;
  label: string;
  /** Pastille du sélecteur (Vue 8). */
  swatch: string;
  isDark: boolean;
  colors: TemplateColors;
}

export const TEMPLATE_THEMES: Record<TemplateThemeKey, TemplateTheme> = {
  champagne: {
    key: 'champagne',
    label: 'Thème champagne',
    swatch: '#EFE3CD',
    isDark: false,
    colors: {
      bg: '#F7F4ED',
      surface: '#FFFFFF',
      surfaceAlt: '#F0E8D8',
      border: '#E7DECB',
      text: '#33291B',
      textMuted: '#8A7E68',
      primary: '#A98246',
      onPrimary: '#FFF9EC',
      accent: '#C9A86A',
      chip: '#F0E7D4',
      coverOverlay: 'rgba(24, 14, 6, 0.42)',
      coverOverlayDeep: 'rgba(12, 8, 4, 0.35)',
    },
  },
  rose: {
    key: 'rose',
    label: 'Rose poudré',
    swatch: '#E8B7B0',
    isDark: false,
    colors: {
      bg: '#F9EEEC',
      surface: '#FFFFFF',
      surfaceAlt: '#F4E0DC',
      border: '#EDD8D3',
      text: '#4A3234',
      textMuted: '#A38482',
      primary: '#BC7B88',
      onPrimary: '#FFF6F4',
      accent: '#D8A0AC',
      chip: '#F4E2DE',
      coverOverlay: 'rgba(120, 52, 64, 0.42)',
      coverOverlayDeep: 'rgba(74, 26, 34, 0.38)',
    },
  },
  sauge: {
    key: 'sauge',
    label: 'Vert sauge',
    swatch: '#AEBFA3',
    isDark: false,
    colors: {
      bg: '#EFF2EA',
      surface: '#FFFFFF',
      surfaceAlt: '#E3EADB',
      border: '#DEE5D4',
      text: '#33402C',
      textMuted: '#7F8C74',
      primary: '#7C8B5F',
      onPrimary: '#F7FAF1',
      accent: '#9AAB7F',
      chip: '#E5EBDB',
      coverOverlay: 'rgba(42, 58, 36, 0.45)',
      coverOverlayDeep: 'rgba(24, 34, 20, 0.38)',
    },
  },
  marine: {
    key: 'marine',
    label: 'Bleu marine',
    swatch: '#2C3E55',
    isDark: true,
    colors: {
      bg: '#243247',
      surface: '#2C3D57',
      surfaceAlt: '#1E2A3D',
      border: '#3A4D6B',
      text: '#F2EFE7',
      textMuted: '#A9B4C4',
      primary: '#C9A86B',
      onPrimary: '#1C2636',
      accent: '#C9A86B',
      chip: '#33455F',
      coverOverlay: 'rgba(14, 22, 38, 0.52)',
      coverOverlayDeep: 'rgba(8, 14, 26, 0.45)',
    },
  },
  bordeaux: {
    key: 'bordeaux',
    label: 'Bordeaux',
    swatch: '#5E2530',
    isDark: true,
    colors: {
      bg: '#482028',
      surface: '#54262F',
      surfaceAlt: '#3B191F',
      border: '#6B3640',
      text: '#F7ECE4',
      textMuted: '#CFA89E',
      primary: '#D6A35C',
      onPrimary: '#3B191F',
      accent: '#D6A35C',
      chip: '#63313B',
      coverOverlay: 'rgba(38, 8, 14, 0.52)',
      coverOverlayDeep: 'rgba(24, 4, 8, 0.45)',
    },
  },
  noir: {
    key: 'noir',
    label: 'Noir élégant',
    swatch: '#191A20',
    isDark: true,
    colors: {
      bg: '#121318',
      surface: '#1B1D24',
      surfaceAlt: '#0C0D11',
      border: '#2A2C35',
      text: '#F5F1E8',
      textMuted: '#9A9EA7',
      primary: '#C4A574',
      onPrimary: '#121318',
      accent: '#C4A574',
      chip: '#22242C',
      coverOverlay: 'rgba(5, 5, 8, 0.55)',
      coverOverlayDeep: 'rgba(3, 3, 5, 0.48)',
    },
  },
};

/** Ordre d'affichage dans le sélecteur (Vue 8). */
export const TEMPLATE_THEME_ORDER: TemplateThemeKey[] = [
  'champagne',
  'rose',
  'sauge',
  'marine',
  'bordeaux',
  'noir',
];

/** Vues navigables du modèle (bottom bar + feuille « Plus »). */
export type TemplateViewKey =
  | 'accueil' // Vue 1 — Couverture / Save the Date
  | 'histoire' // Vue 2 — Notre histoire
  | 'programme' // Vue 3 — Programme
  | 'compteur' // Vue 4 — Compte à rebours
  | 'rsvp' // Vue 5 — Formulaire RSVP
  | 'galerie' // Vue 6 — Galerie photos
  | 'livredor'; // Vue 7 — Vœux / Livre d'or
