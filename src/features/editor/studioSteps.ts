/**
 * Parcours studio guidé — unique par type d’événement.
 */

import type { EventType } from '@/types';

export type StudioRouteName =
  | 'index'
  | 'photos'
  | 'jour'
  | 'plus'
  | 'voix'
  | 'publier'
  | 'theme'
  | 'histoire'
  | 'programme'
  | 'compteur';

export interface StudioStepDef {
  route: StudioRouteName;
  /** Libellé court dans la barre. */
  title: string;
  /** Titre header. */
  headerTitle: string;
  /** Consigne courte affichée en tête d’étape. */
  hint: string;
}

const WEDDING_STEPS: StudioStepDef[] = [
  {
    route: 'index',
    title: 'Infos',
    headerTitle: 'Infos',
    hint: 'Photo, textes, lieu et dress code.',
  },
  {
    route: 'photos',
    title: 'Photos',
    headerTitle: 'Photos',
    hint: 'Ajoutez les photos de votre galerie.',
  },
  {
    route: 'jour',
    title: 'Récit',
    headerTitle: 'Récit',
    hint: 'Histoire, journée et compte à rebours.',
  },
  {
    route: 'plus',
    title: 'RSVP',
    headerTitle: 'RSVP',
    hint: 'Choix proposés aux invités pour leur réponse.',
  },
  {
    route: 'publier',
    title: 'Publier',
    headerTitle: 'Aperçu & publier',
    hint: 'Vérifiez le rendu, puis publiez.',
  },
];

const BIRTHDAY_STEPS: StudioStepDef[] = [
  {
    route: 'index',
    title: 'Affiche',
    headerTitle: 'Affiche',
    hint: 'Textes, date, heure et lieu de la fête.',
  },
  {
    route: 'theme',
    title: 'Décor',
    headerTitle: 'Décor',
    hint: 'Palette de couleurs de l’affiche.',
  },
  {
    route: 'plus',
    title: 'RSVP',
    headerTitle: 'RSVP',
    hint: 'Choix proposés aux invités pour leur réponse.',
  },
  {
    route: 'publier',
    title: 'Publier',
    headerTitle: 'Aperçu & publier',
    hint: 'Vérifiez le rendu, puis publiez.',
  },
];

const CONFERENCE_STEPS: StudioStepDef[] = [
  {
    route: 'index',
    title: 'Infos',
    headerTitle: 'Infos événement',
    hint: 'Nom, dates et accroche.',
  },
  {
    route: 'programme',
    title: 'Agenda',
    headerTitle: 'Programme',
    hint: 'Horaires, sessions et salles.',
  },
  {
    route: 'histoire',
    title: 'Intervenants',
    headerTitle: 'Intervenants',
    hint: 'Nom, rôle et bio de chaque intervenant.',
  },
  {
    route: 'theme',
    title: 'Lieu',
    headerTitle: 'Lieu & pratiques',
    hint: 'Lieu, accès et infos pratiques.',
  },
  {
    route: 'publier',
    title: 'Publier',
    headerTitle: 'Aperçu & publier',
    hint: 'Vérifiez le rendu, puis publiez.',
  },
];

export function getStudioSteps(type: EventType | null | undefined): StudioStepDef[] {
  switch (type) {
    case 'birthday':
      return BIRTHDAY_STEPS;
    case 'corporate':
      return CONFERENCE_STEPS;
    case 'wedding':
    default:
      return WEDDING_STEPS;
  }
}

export function isStudioRouteVisible(
  route: string,
  type: EventType | null | undefined,
): boolean {
  return getStudioSteps(type).some((step) => step.route === route);
}

export function studioStepMeta(
  route: string,
  type: EventType | null | undefined,
): StudioStepDef | null {
  const steps = getStudioSteps(type);
  const index = steps.findIndex((step) => step.route === route);
  if (index < 0) return null;
  return steps[index];
}

export function studioStepNumber(
  route: string,
  type: EventType | null | undefined,
): number {
  const index = getStudioSteps(type).findIndex((step) => step.route === route);
  return index >= 0 ? index + 1 : 1;
}

export function studioStepIndex(
  route: string,
  type: EventType | null | undefined,
): number {
  return getStudioSteps(type).findIndex((step) => step.route === route);
}

export function studioStepHint(
  route: string,
  type: EventType | null | undefined,
): string | null {
  return studioStepMeta(route, type)?.hint ?? null;
}

export function nextStudioStep(
  route: string,
  type: EventType | null | undefined,
): StudioStepDef | null {
  const steps = getStudioSteps(type);
  const index = steps.findIndex((step) => step.route === route);
  if (index < 0 || index >= steps.length - 1) return null;
  return steps[index + 1];
}

export function prevStudioStep(
  route: string,
  type: EventType | null | undefined,
): StudioStepDef | null {
  const steps = getStudioSteps(type);
  const index = steps.findIndex((step) => step.route === route);
  if (index <= 0) return null;
  return steps[index - 1];
}
