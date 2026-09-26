import type { ProgramStep, StoryMilestone } from '@/features/templates/elegance/data';

const u = (id: string, w = 1200): string =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const EDITORIAL_WEDDING = {
  couple: 'Inès & Marc',
  kicker: 'Volume 01',
  guestSentence: 'Pour {{Nom}} — vous êtes attendu(e).',
};

export const EDITORIAL_IMAGES = {
  cover: u('photo-1519741497674-611481863552', 1400),
  couple: u('photo-1529634806980-85c3dd6d34ac', 900),
  countdown: u('photo-1465495976277-4387d4b0b4c6', 1400),
  gallery: [
    u('photo-1511285560929-80b456fea0bc', 1000),
    u('photo-1522673607200-164d1b6ce486', 1000),
    u('photo-1464366400600-7168b8af9bc3', 1000),
    u('photo-1519225421980-715cb0215aed', 1000),
  ],
};

export const EDITORIAL_STORY: StoryMilestone[] = [
  {
    year: '2019',
    title: 'Le premier regard',
    text: 'Une table trop petite, une conversation trop longue.',
    image: u('photo-1529634597503-139d3726fed5', 800),
  },
  {
    year: '2022',
    title: 'La ville à deux',
    text: 'Même trottoir, même rythme, un appartement trop clair.',
    image: u('photo-1522673607200-164d1b6ce486', 800),
  },
  {
    year: '2025',
    title: 'La question',
    text: 'Posée sans discours, retenue sans hésiter.',
    image: u('photo-1520854221256-17451cc331bf', 800),
  },
  {
    year: '2026',
    title: 'Le jour',
    text: 'Une page blanche, écrite avec vous.',
    image: u('photo-1519741497674-611481863552', 800),
  },
];

export const EDITORIAL_PROGRAM: ProgramStep[] = [
  { time: '15:30', title: 'Cérémonie', place: 'Orangerie', icon: 'ellipse-outline' },
  { time: '17:00', title: 'Vin d’honneur', place: 'Cour pavée', icon: 'ellipse-outline' },
  { time: '20:00', title: 'Dîner', place: 'Grande salle', icon: 'ellipse-outline' },
  { time: '23:30', title: 'Danse', place: 'Sous les arbres', icon: 'ellipse-outline' },
];

export const EDITORIAL_VENUE = {
  name: 'Domaine des Ifs',
  street: 'Allée des tilleuls',
  zip: '37500',
  city: 'Chinon',
  lat: 47.1667,
  lng: 0.2444,
};
