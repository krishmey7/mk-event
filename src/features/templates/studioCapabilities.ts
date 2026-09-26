/**
 * Réglages du studio qui ont un effet visible, selon le modèle.
 * Un réglage absent est grisé dans le studio de ce modèle seulement.
 */

import type { CoverLayout } from './registry';

export interface TemplateStudioCapabilities {
  /** Photo plein cadre derrière les textes (cover.photoUri). */
  backgroundPhoto: boolean;
  /** Portrait principal (photo du couple, ou photo d’affiche). */
  couplePhoto: boolean;
  /** Formes de cadre de ce portrait. */
  coupleFrames: boolean;
}

export function templateStudio(layout: CoverLayout): TemplateStudioCapabilities {
  switch (layout) {
    case 'classic':
      return { backgroundPhoto: true, couplePhoto: true, coupleFrames: true };
    case 'winterPoster':
    case 'editorial':
      return { backgroundPhoto: false, couplePhoto: true, coupleFrames: true };
    case 'birthdayPoster':
    case 'conference':
      return { backgroundPhoto: false, couplePhoto: false, coupleFrames: false };
    default:
      return { backgroundPhoto: true, couplePhoto: true, coupleFrames: true };
  }
}
