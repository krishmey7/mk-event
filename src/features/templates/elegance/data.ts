/**
 * ──────────────────────────────────────────────────────────────
 *  MK EVENTS — MODÈLE « ÉLÉGANCE » · DONNÉES DE DÉMONSTRATION
 * ──────────────────────────────────────────────────────────────
 *  Jeu de données statique fidèle à la planche 3 (Léa & Thomas,
 *  14 juin 2025). Sera remplacé par les réponses du backend Django
 *  (GET /api/events/{slug}/, /program/, /gallery/, …).
 * ──────────────────────────────────────────────────────────────
 */

import type { Ionicons } from '@expo/vector-icons';

export type IconName = keyof typeof Ionicons.glyphMap;

const u = (id: string, w = 900): string =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const WEDDING = {
  couple: 'Léa & Thomas',
  dateLabel: '14 JUIN 2025',
  guestName: 'Camille',
  guestSentence: 'Tu es officiellement invitée à notre mariage !',
} as const;

export const IMAGES = {
  cover: u('photo-1519741497674-611481863552', 1100),
  countdown: u('photo-1519167758481-83f550bb49b3', 1200),
  templateCard: u('photo-1519741497674-611481863552', 700),
  /** Photo du couple — libre de droit (Unsplash). */
  couple: u('photo-1529634806980-85c3dd6d34ac', 600),
} as const;

/* ── Vue 2 — Notre histoire (timeline à pastilles photo) ── */

export interface StoryMilestone {
  year: string;
  title: string;
  text: string;
  image: string;
}

export const STORY: StoryMilestone[] = [
  {
    year: '2018',
    title: 'Notre rencontre',
    text: 'Tout a commencé par un simple café… et depuis, on ne s\u2019est plus quittés.',
    image: u('photo-1516589178581-6cd7833ae3b2', 300),
  },
  {
    year: '2020',
    title: 'Notre première maison',
    text: 'Une nouvelle étape, notre cocon, notre chez-nous.',
    image: u('photo-1522673607200-164d1b6ce486', 300),
  },
  {
    year: '2023',
    title: 'La demande',
    text: 'Un « Oui » pour la vie, dans un lieu magique.',
    image: u('photo-1523438885200-e635ba2c371e', 300),
  },
  {
    year: '2025',
    title: 'Notre mariage',
    text: 'Le plus beau chapitre… à écrire ensemble, avec vous !',
    image: u('photo-1511285560929-80b456fea0bc', 300),
  },
];

/* ── Vue 3 — Programme (timeline dorée à icônes) ── */

export interface ProgramStep {
  time: string;
  title: string;
  place: string;
  icon: IconName;
}

export const PROGRAM: ProgramStep[] = [
  { time: '15h00', title: 'Cérémonie civile', place: 'Mairie de Paris', icon: 'business-outline' },
  { time: '16h30', title: 'Cérémonie laïque', place: 'Jardin des Tuileries', icon: 'heart-outline' },
  { time: '18h00', title: 'Cocktail', place: 'Terrasse du Château', icon: 'wine-outline' },
  { time: '20h00', title: 'Dîner', place: 'Salle des Fêtes', icon: 'restaurant-outline' },
  { time: '23h00', title: 'Soirée & Danse', place: 'On se lâche !', icon: 'musical-notes-outline' },
];

/* ── Vue 4 — Compte à rebours ──
 * Cible calée à 142 j 08 h 36 min 12 s au chargement du module
 * (nombres exacts de la maquette) puis décompte en temps réel. */

export const COUNTDOWN_TARGET =
  Date.now() + ((142 * 24 + 8) * 3600 + 36 * 60 + 12) * 1000;

/* ── Vue 5 — Options RSVP ── */

export const MENU_OPTIONS = ['Menu carné', 'Menu végétarien', 'Menu poisson', 'Menu enfant'];

/* ── Vue 6 — Galerie (grille asymétrique + filtres) ── */

export const GALLERY_FILTERS = [
  { key: 'tous', label: 'Tous' },
  { key: 'ceremonie', label: 'Cérémonie' },
  { key: 'cocktail', label: 'Cocktail' },
  { key: 'soiree', label: 'Soirée' },
] as const;

export type GalleryCategory = (typeof GALLERY_FILTERS)[number]['key'];

export interface GalleryPhoto {
  id: string;
  uri: string;
  category: Exclude<GalleryCategory, 'tous'>;
  height: number;
}

export const GALLERY: GalleryPhoto[] = [
  { id: 'g1', uri: u('photo-1469371670807-013ccf25f16a', 700), category: 'ceremonie', height: 235 },
  { id: 'g2', uri: u('photo-1519225421980-715cb0215aed', 700), category: 'cocktail', height: 165 },
  { id: 'g3', uri: u('photo-1520854221256-17451cc331bf', 700), category: 'ceremonie', height: 160 },
  { id: 'g4', uri: u('photo-1515934751635-c81c6bc9a2d8', 700), category: 'soiree', height: 225 },
  { id: 'g5', uri: u('photo-1465495976277-4387d4b0b4c6', 700), category: 'ceremonie', height: 210 },
  { id: 'g6', uri: u('photo-1470337458703-46ad1756a187', 700), category: 'cocktail', height: 160 },
  { id: 'g7', uri: u('photo-1583939003579-730e3918a45a', 700), category: 'ceremonie', height: 200 },
  { id: 'g8', uri: u('photo-1530103862676-de8c9debad1d', 700), category: 'soiree', height: 165 },
  { id: 'g9', uri: u('photo-1492684223066-81342ee5ff30', 700), category: 'soiree', height: 180 },
];
