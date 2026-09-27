/**
 * Pellicule — Lydia & Hector, réservez la date, bande photo.
 */

import type { ProgramStep, StoryMilestone } from '../elegance/data';

const u = (id: string, w = 900): string =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const PELLICULE_WEDDING = {
  couple: 'Lydia & Hector',
  dateLabel: '15 décembre 2025',
  timeLabel: '20H00',
  kicker: 'RÉSERVEZ LA DATE!',
  guestLine: '{{Nom}}, réservez votre place pour ce jour-là.',
} as const;

export const PELLICULE_IMAGES = {
  cover: u('photo-1519741497674-611481863552', 1200),
  couple: u('photo-1511285560929-80b456fea0bc', 1400),
  countdown: u('photo-1465495976277-4387d4b0b4c6', 1200),
  /** Quatre cases de la bande (bagues, portraits, cérémonie). */
  strip: [
    u('photo-1515934751635-c81c6bc9a2d8', 600),
    u('photo-1511285560929-80b456fea0bc', 600),
    u('photo-1519741497674-611481863552', 600),
    u('photo-1465495976277-4387d4b0b4c6', 600),
  ],
} as const;

export const PELLICULE_STORY: StoryMilestone[] = [
  {
    year: '2018',
    title: 'La rencontre',
    text: 'Une soirée ordinaire, un regard qui change tout.',
    image: u('photo-1516589178581-6cd7833ae3b2', 400),
  },
  {
    year: '2021',
    title: 'Les voyages',
    text: 'Des valises partagées et des cartes annotées à deux.',
    image: u('photo-1522673607200-164d1b6ce486', 400),
  },
  {
    year: '2024',
    title: 'La demande',
    text: 'Une question simple, sous une lumière douce.',
    image: u('photo-1523438885200-e635ba2c371e', 400),
  },
  {
    year: '2025',
    title: 'Le grand jour',
    text: 'On vous attend au Concordia Hôtel.',
    image: u('photo-1519225421980-715cb0215aed', 400),
  },
];

export const PELLICULE_PROGRAM: ProgramStep[] = [
  { time: '18h00', title: 'Accueil', place: 'Hall Concordia', icon: 'sparkles-outline' },
  { time: '19h00', title: 'Cérémonie', place: 'Salon principal', icon: 'heart-outline' },
  { time: '20h00', title: 'Dîner', place: 'Grande salle', icon: 'restaurant-outline' },
  { time: '22h30', title: 'Soirée', place: 'Piste', icon: 'musical-notes-outline' },
];

export const PELLICULE_GALLERY = [
  ...PELLICULE_IMAGES.strip,
  u('photo-1519225421980-715cb0215aed', 700),
  u('photo-1529634806980-85c3dd6d34ac', 700),
];

export const PELLICULE_VENUE = {
  name: 'Concordia Hôtel',
  street: '12 avenue des Cèdres',
  zip: '75016',
  city: 'Paris',
  lat: 48.8637,
  lng: 2.277,
};
