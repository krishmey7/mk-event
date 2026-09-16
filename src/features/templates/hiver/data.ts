/**
 * Modèle « Hiver » — contenus de démonstration (Jack & Sofia).
 */

import type { ProgramStep, StoryMilestone } from '../elegance/data';

const u = (id: string, w = 900): string =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const HIVER_WEDDING = {
  couple: 'Jack & Sofia',
  dateLabel: '22 octobre 2025',
  dateCta: 'Rejoignez-nous le 22 octobre',
  guestSentence: 'Cher(e) {{Nom}}, vous êtes invité(e) à célébrer notre mariage d’hiver.',
  kicker: 'Cérémonie à 10h',
} as const;

export const HIVER_IMAGES = {
  /** Fond de couverture : marine uni (l’affiche n’a pas de photo pleine page). */
  cover: u('photo-1483664852095-d6cc859c3974', 1100),
  countdown: u('photo-1482514194978-c97c4d7c9dca', 1200),
  couple: u('photo-1511285560929-80b456fea0bc', 800),
} as const;

export const HIVER_STORY: StoryMilestone[] = [
  {
    year: '2019',
    title: 'La première neige',
    text: 'Un café trop chaud, des flocons trop timides — et l’évidence, tout de suite.',
    image: u('photo-1516589178581-6cd7833ae3b2', 400),
  },
  {
    year: '2021',
    title: 'Un hiver à deux',
    text: 'On a appris à ralentir, à se choisir, à faire du froid une fête.',
    image: u('photo-1522673607200-164d1b6ce486', 400),
  },
  {
    year: '2024',
    title: 'La demande',
    text: 'Un oui tout simple, sous les lumières d’une allée givrée.',
    image: u('photo-1523438885200-e635ba2c371e', 400),
  },
  {
    year: '2025',
    title: 'Le grand jour',
    text: 'On ouvre le plus bel hiver — avec vous, autour de nous.',
    image: u('photo-1465495976277-4387d4b0b4c6', 400),
  },
];

export const HIVER_PROGRAM: ProgramStep[] = [
  { time: '10h00', title: 'Cérémonie', place: 'Sheraton Kauai Resort', icon: 'sparkles-outline' },
  { time: '12h00', title: 'Vin d’honneur', place: 'Terrasse océan', icon: 'wine-outline' },
  { time: '13h30', title: 'Déjeuner', place: 'Salle des palmiers', icon: 'cafe-outline' },
  { time: '16h00', title: 'Photos', place: 'Jardin tropical', icon: 'camera-outline' },
  { time: '19h00', title: 'Soirée', place: 'Salon or & marine', icon: 'moon-outline' },
];

export const HIVER_GALLERY = [
  u('photo-1519741497674-611481863552', 700),
  u('photo-1469371670807-013ccf25f16a', 700),
  u('photo-1519225421980-715cb0215aed', 700),
  u('photo-1482514194978-c97c4d7c9dca', 700),
  u('photo-1511285560929-80b456fea0bc', 700),
  u('photo-1465495976277-4387d4b0b4c6', 700),
];

export const HIVER_VENUE = {
  name: 'Sheraton Kauai Resort',
  street: '2440 Hoonani Rd',
  zip: '96746',
  city: 'Koloa, Hawaii',
};
