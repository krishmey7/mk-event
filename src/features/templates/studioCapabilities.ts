/**
 * Réglages du studio qui ont un effet visible, selon le modèle.
 * Un réglage absent est masqué (ou grisé) dans le studio de ce modèle seulement.
 */

import type { CoverLayout } from './registry';

export interface TemplateStudioCapabilities {
  /** Photo plein cadre derrière les textes (cover.photoUri). */
  backgroundPhoto: boolean;
  /** Portrait principal (photo du couple, ou photo d’affiche). */
  couplePhoto: boolean;
  /** Formes de cadre de ce portrait. */
  coupleFrames: boolean;
  /** Champ Accroche séparé (cover.kicker). */
  accroche: boolean;
  /** Titre / en-tête éditable visible sur la cover. */
  coverTitle: boolean;
  /** Champ heure dédié (cover.timeLabel). */
  heure: boolean;
  /** Script Néon distinct de la ligne d’invitation. */
  neonScript: boolean;
  /** La galerie alimente la couverture (bande Pellicule). */
  galleryFeedsCover: boolean;
}

export function templateStudio(layout: CoverLayout): TemplateStudioCapabilities {
  switch (layout) {
    case 'classic':
      return {
        backgroundPhoto: true,
        couplePhoto: true,
        coupleFrames: true,
        accroche: true,
        coverTitle: true,
        heure: false,
        neonScript: false,
        galleryFeedsCover: false,
      };
    case 'winterPoster':
      return {
        backgroundPhoto: false,
        couplePhoto: true,
        coupleFrames: true,
        accroche: true,
        coverTitle: true,
        heure: false,
        neonScript: false,
        galleryFeedsCover: false,
      };
    case 'splitPanel':
      return {
        backgroundPhoto: false,
        couplePhoto: true,
        coupleFrames: false,
        accroche: false,
        coverTitle: true,
        heure: false,
        neonScript: false,
        galleryFeedsCover: false,
      };
    case 'filmStrip':
      return {
        backgroundPhoto: false,
        couplePhoto: false,
        coupleFrames: false,
        accroche: false,
        coverTitle: true,
        heure: true,
        neonScript: false,
        galleryFeedsCover: true,
      };
    case 'editorial':
      return {
        backgroundPhoto: true,
        couplePhoto: true,
        coupleFrames: false,
        accroche: true,
        coverTitle: true,
        heure: false,
        neonScript: false,
        galleryFeedsCover: false,
      };
    case 'oliveInvitation':
      return {
        backgroundPhoto: true,
        couplePhoto: true,
        coupleFrames: false,
        accroche: true,
        coverTitle: true,
        heure: false,
        neonScript: false,
        galleryFeedsCover: false,
      };
    case 'neonScript':
      return {
        backgroundPhoto: true,
        couplePhoto: false,
        coupleFrames: false,
        accroche: false,
        coverTitle: true,
        heure: true,
        neonScript: true,
        galleryFeedsCover: false,
      };
    case 'birthdayPoster':
    case 'conference':
      return {
        backgroundPhoto: false,
        couplePhoto: false,
        coupleFrames: false,
        accroche: true,
        coverTitle: true,
        heure: false,
        neonScript: false,
        galleryFeedsCover: false,
      };
    default:
      return {
        backgroundPhoto: true,
        couplePhoto: true,
        coupleFrames: true,
        accroche: true,
        coverTitle: true,
        heure: false,
        neonScript: false,
        galleryFeedsCover: false,
      };
  }
}

/** Libellés studio selon le layout. */
export function studioFieldLabels(layout: CoverLayout): {
  title: string;
  titlePlaceholder: string;
  accroche: string;
  accrochePlaceholder: string;
} {
  switch (layout) {
    case 'filmStrip':
      return {
        title: 'En-tête',
        titlePlaceholder: 'RÉSERVEZ LA DATE!',
        accroche: 'Accroche',
        accrochePlaceholder: 'Cérémonie à 10h',
      };
    case 'neonScript':
      return {
        title: 'Grand titre',
        titlePlaceholder: 'On se dit oui',
        accroche: 'Phrase d’invitation',
        accrochePlaceholder: 'Avec leurs familles, ils vous invitent…',
      };
    case 'winterPoster':
      return {
        title: 'Titre principal',
        titlePlaceholder: 'Save the Date',
        accroche: 'Ligne sous le logo',
        accrochePlaceholder: 'Cérémonie à 10h',
      };
    case 'splitPanel':
      return {
        title: 'Titre principal',
        titlePlaceholder: 'Save the Date',
        accroche: 'Phrase d’accueil',
        accrochePlaceholder: 'Cérémonie à 10h',
      };
    case 'editorial':
      return {
        title: 'Titre de couverture',
        titlePlaceholder: 'Réservez la date',
        accroche: 'Invitation',
        accrochePlaceholder: 'Nous serions heureux de célébrer ce jour avec vous…',
      };
    case 'oliveInvitation':
      return {
        title: 'Titre de l’invitation',
        titlePlaceholder: 'Invitation au mariage',
        accroche: 'Message aux invités',
        accrochePlaceholder: 'Nous serions très heureux de partager cette journée avec vous…',
      };
    default:
      return {
        title: 'Titre principal',
        titlePlaceholder: 'Save the Date',
        accroche: 'Phrase sous les noms',
        accrochePlaceholder: 'Pour notre grand jour',
      };
  }
}
