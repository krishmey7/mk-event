import type { ProgramStep } from '../elegance/data';

const image = (id: string, width = 1000) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

export const OLIVIER_IMAGES = {
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

export const OLIVIER_PROGRAM: ProgramStep[] = [
  { time: '14 h 00', title: 'Cérémonie', place: 'Retrouvons-nous pour célébrer notre union', icon: 'heart-outline' },
  { time: '16 h 30', title: 'Vin d’honneur', place: 'Un moment convivial au jardin', icon: 'wine-outline' },
  { time: '19 h 00', title: 'Dîner festif', place: 'Dîner, discours et belles surprises', icon: 'restaurant-outline' },
  { time: '22 h 00', title: 'Soirée dansante', place: 'La fête continue sur la piste', icon: 'musical-notes-outline' },
];
