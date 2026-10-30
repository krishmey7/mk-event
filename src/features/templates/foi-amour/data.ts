import type { ProgramStep } from '../elegance/data';

const image = (id: string, width = 1000) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

export const FOI_AMOUR_IMAGES = {
  cover: image('photo-1519741497674-611481863552', 1400),
  couple: image('photo-1529634806980-85c3dd6d34ac', 1200),
  gallery: [
    image('photo-1515934751635-c81c6bc9a2d8', 800),
    image('photo-1465495976277-4387d4b0b4c6', 800),
    image('photo-1519225421980-715cb0215aed', 800),
    image('photo-1523438885200-e635ba2c371e', 800),
    image('photo-1511285560929-80b456fea0bc', 800),
    image('photo-1511795409834-ef04bbd61622', 800),
  ],
};

export const FOI_AMOUR_PROGRAM: ProgramStep[] = [
  { time: '17 h 00', title: 'Cérémonie religieuse', place: 'Église Saint-Patrick', icon: 'business-outline' },
  { time: '18 h 30', title: 'Réception', place: 'Villa des Fleurs', icon: 'heart-outline' },
  { time: '19 h 45', title: 'Entrée des mariés', place: 'Villa des Fleurs', icon: 'sparkles-outline' },
  { time: '20 h 00', title: 'Dîner', place: 'Villa des Fleurs', icon: 'restaurant-outline' },
  { time: '21 h 00', title: 'Soirée dansante', place: 'Villa des Fleurs', icon: 'musical-notes-outline' },
  { time: '03 h 30', title: 'Fin de la célébration', place: 'À très bientôt !', icon: 'moon-outline' },
];
