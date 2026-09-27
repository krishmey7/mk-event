/**
 * Néon — Emma & Lucas, couverture photo B&W, or et script « We Do ».
 */

import type { ProgramStep, StoryMilestone } from '../elegance/data';

const u = (id: string, w = 900): string =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const NEON_WEDDING = {
  couple: 'Emma & Lucas',
  dateLabel: '22 juillet 2026',
  timeLabel: '15H30',
  weekday: 'Samedi',
  month: 'Juillet',
  day: '22',
  year: '2026',
  heroScript: 'We Do',
  inviteLine: 'Avec leurs familles, ils vous invitent à célébrer leur mariage',
  guestLine: '{{Nom}}, nous avons hâte de célébrer avec vous.',
  closing: 'On a hâte de fêter ça',
} as const;

export const NEON_IMAGES = {
  cover: u('photo-1519741497674-611481863552', 1400),
  couple: u('photo-1511285560929-80b456fea0bc', 1400),
  venue: u('photo-1519225421980-715cb0215aed', 1200),
  countdown: u('photo-1515934751635-c81c6bc9a2d8', 900),
  rings: u('photo-1515934751635-c81c6bc9a2d8', 600),
} as const;

export const NEON_STORY: StoryMilestone[] = [];

export const NEON_PROGRAM: ProgramStep[] = [
  { time: '15h30', title: 'Cérémonie', place: 'Jardin Sunset', icon: 'heart-outline' },
  { time: '16h30', title: 'Cocktail', place: 'Terrasse', icon: 'wine-outline' },
  { time: '17h00', title: 'Photos', place: 'Parc adjacent', icon: 'camera-outline' },
  { time: '18h30', title: 'Dîner', place: 'Grande salle', icon: 'restaurant-outline' },
  { time: '20h00', title: 'Danse', place: 'Piste', icon: 'musical-notes-outline' },
];

export const NEON_GALLERY = [
  NEON_IMAGES.cover,
  NEON_IMAGES.couple,
  NEON_IMAGES.venue,
  u('photo-1465495976277-4387d4b0b4c6', 700),
  u('photo-1529634806980-85c3dd6d34ac', 700),
  u('photo-1511285560929-80b456fea0bc', 700),
];

export const NEON_VENUE = {
  name: 'Sunset Boulevard Hall',
  street: '8221 Sunset Blvd',
  zip: '90046',
  city: 'West Hollywood',
  lat: 34.0959,
  lng: -118.3677,
};

export const NEON_DETAILS = {
  dress:
    'Tenue semi-formelle et élégante. N’hésitez pas à ajouter une touche pastel pour coller à notre thème.',
  transport:
    'Des navettes circulent entre l’hôtel partenaire et le lieu à partir de 14h30, puis jusqu’à 1h du matin.',
  hotel:
    'Un contingent de chambres est réservé au Sunset Inn. Mentionnez « Mariage Emma & Lucas » au +1 310 555 0182.',
};
