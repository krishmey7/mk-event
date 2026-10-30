import type { ProgramStep } from '../elegance/data';

const image = (id: string, width = 1000) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

export const PAPETERIE_IMAGES = {
  cover: image('photo-1529634806980-85c3dd6d34ac', 1400),
  couple: image('photo-1511285560929-80b456fea0bc', 1400),
  details: image('photo-1519741497674-611481863552', 1000),
  gallery: [
    image('photo-1515934751635-c81c6bc9a2d8', 800),
    image('photo-1465495976277-4387d4b0b4c6', 800),
    image('photo-1519225421980-715cb0215aed', 800),
    image('photo-1523438885200-e635ba2c371e', 800),
  ],
};

export const PAPETERIE_PROGRAM: ProgramStep[] = [
  { time: '15 h 00', title: 'Cérémonie', place: 'Lieu de la cérémonie', icon: 'heart-outline' },
  { time: '17 h 00', title: 'Vin d’honneur', place: 'Jardin de réception', icon: 'wine-outline' },
  { time: '19 h 30', title: 'Dîner & toasts', place: 'Salle de réception', icon: 'restaurant-outline' },
  { time: '22 h 00', title: 'Soirée dansante', place: 'Piste de danse', icon: 'musical-notes-outline' },
];
