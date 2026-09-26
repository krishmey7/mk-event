/**
 * Aurore — Daniel & Sophia, affiche Save the Date.
 */

import type { ProgramStep, StoryMilestone } from '../elegance/data';

const u = (id: string, w = 900): string =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const AURORE_WEDDING = {
  couple: 'Daniel & Sophia',
  dateLabel: '12 septembre 2026',
  kicker: '',
  guestLine: '{{Nom}}, nous serions heureux de vous accueillir à notre mariage.',
} as const;

export const AURORE_IMAGES = {
  cover: u('photo-1583939003579-730e3918a45a', 1200),
  couple: u('photo-1583939003579-730e3918a45a', 1400),
  countdown: u('photo-1519741497674-611481863552', 1200),
} as const;

export const AURORE_STORY: StoryMilestone[] = [
  {
    year: '2019',
    title: 'La première soirée',
    text: 'Une salle trop bruyante, deux regards qui se trouvent, et la soirée qui s’allonge.',
    image: u('photo-1516589178581-6cd7833ae3b2', 400),
  },
  {
    year: '2022',
    title: 'La ville à deux',
    text: 'On a appris les rues, les dimanches lents, et le plaisir de se choisir.',
    image: u('photo-1522673607200-164d1b6ce486', 400),
  },
  {
    year: '2025',
    title: 'Le oui',
    text: 'Une question simple, une lumière dorée, et plus aucune hésitation.',
    image: u('photo-1523438885200-e635ba2c371e', 400),
  },
  {
    year: '2026',
    title: 'Le grand jour',
    text: 'On vous attend au Grand Aurora Hall — tenue de soirée, cœurs légers.',
    image: u('photo-1519741497674-611481863552', 400),
  },
];

export const AURORE_PROGRAM: ProgramStep[] = [
  { time: '15h00', title: 'Cérémonie', place: 'The Grand Aurora Hall', icon: 'sparkles-outline' },
  { time: '17h00', title: 'Vin d’honneur', place: 'Salon doré', icon: 'wine-outline' },
  { time: '19h30', title: 'Dîner', place: 'Grande salle', icon: 'restaurant-outline' },
  { time: '22h00', title: 'Soirée', place: 'Piste & orchestre', icon: 'musical-notes-outline' },
];

export const AURORE_GALLERY = [
  u('photo-1519741497674-611481863552', 700),
  u('photo-1511285560929-80b456fea0bc', 700),
  u('photo-1465495976277-4387d4b0b4c6', 700),
  u('photo-1519225421980-715cb0215aed', 700),
  u('photo-1583939003579-730e3918a45a', 700),
  u('photo-1529634806980-85c3dd6d34ac', 700),
];

export const AURORE_VENUE = {
  name: 'The Grand Aurora Hall',
  street: '245 Skyline Boulevard',
  zip: '',
  city: 'Downtown District',
  lat: 40.758,
  lng: -73.9855,
};
