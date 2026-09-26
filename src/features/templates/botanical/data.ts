import type { ProgramStep, StoryMilestone } from '@/features/templates/elegance/data';

const u = (id: string, w = 1200): string =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const BOTANICAL_WEDDING = {
  couple: 'Camille & Adrien',
  kicker: 'Nous nous marions',
  guestSentence: 'Pour {{Nom}}, avec toute notre joie.',
};

export const BOTANICAL_IMAGES = {
  cover: u('photo-1464366400600-7168b8af9bc3', 1400),
  couple: u('photo-1522673607200-164d1b6ce486', 900),
  countdown: u('photo-1520854221256-17451cc331bf', 1400),
  gallery: [
    u('photo-1529634806980-85c3dd6d34ac', 1000),
    u('photo-1519741497674-611481863552', 1000),
    u('photo-1465495976277-4387d4b0b4c6', 1000),
    u('photo-1520854221256-17451cc331bf', 1000),
  ],
};

export const BOTANICAL_STORY: StoryMilestone[] = [
  {
    year: '2018',
    title: 'Le marché',
    text: 'Deux bouquets trop grands, et plus assez de place pour être deux.',
    image: u('photo-1490750967868-88aa4486c946', 800),
  },
  {
    year: '2021',
    title: 'La maison',
    text: 'Un jardin trop petit, des dimanches trop longs.',
    image: u('photo-1465495976277-4387d4b0b4c6', 800),
  },
  {
    year: '2024',
    title: 'La demande',
    text: 'Posée entre deux pivoines, sans public.',
    image: u('photo-1529634597503-139d3726fed5', 800),
  },
  {
    year: '2026',
    title: 'Le jardin',
    text: 'Vous y êtes. C’est tout ce que nous voulions.',
    image: u('photo-1519741497674-611481863552', 800),
  },
];

export const BOTANICAL_PROGRAM: ProgramStep[] = [
  { time: '15:00', title: 'Cérémonie', place: 'Sous la charmille', icon: 'flower-outline' },
  { time: '16:30', title: 'Jardin', place: 'Vin et ombre', icon: 'leaf-outline' },
  { time: '19:30', title: 'Dîner', place: 'Orangerie', icon: 'restaurant-outline' },
  { time: '22:30', title: 'Danse', place: 'La pelouse', icon: 'musical-notes-outline' },
];

export const BOTANICAL_VENUE = {
  name: 'Clos des Pivoines',
  street: 'Chemin des roses',
  zip: '27620',
  city: 'Giverny',
  lat: 49.0756,
  lng: 1.5339,
};
