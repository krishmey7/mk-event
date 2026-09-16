/**
 * Cadres photo du couple — propres à chaque modèle.
 */

import type { PhotoFrameOption } from '@/features/invitation/types';

export const ELEGANCE_PHOTO_FRAMES: PhotoFrameOption[] = [
  { key: 'circle', label: 'Cercle minimaliste', hint: 'Bordure fine dorée', icon: 'ellipse-outline' },
  { key: 'circleFloral', label: 'Cercle floral', hint: 'Fleurs autour', icon: 'flower-outline' },
  { key: 'heart', label: 'Cœur élégant', hint: 'Cœur épuré', icon: 'heart-outline' },
  { key: 'heartFloral', label: 'Cœur floral', hint: 'Cœur orné de fleurs', icon: 'heart-circle-outline' },
  { key: 'soft', label: 'Sans cadre', hint: 'Bordures adoucies', icon: 'square-outline' },
];

export const HIVER_PHOTO_FRAMES: PhotoFrameOption[] = [
  { key: 'hex', label: 'Hexagone or', hint: 'Signature de l’affiche', icon: 'diamond-outline' },
  { key: 'hexFloral', label: 'Hexagone rinceaux', hint: 'Vignes dorées', icon: 'leaf-outline' },
  { key: 'circle', label: 'Cercle givré', hint: 'Bordure dorée', icon: 'ellipse-outline' },
  { key: 'circleFloral', label: 'Cercle flocons', hint: 'Flocons autour', icon: 'snow-outline' },
  { key: 'heart', label: 'Cœur d’hiver', hint: 'Cœur épuré', icon: 'heart-outline' },
  { key: 'soft', label: 'Coins adoucis', hint: 'Cadre léger', icon: 'square-outline' },
];
