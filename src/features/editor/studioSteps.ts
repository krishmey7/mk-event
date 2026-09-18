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
    hint: 'Photo, textes, lieu et dress code — tout se règle ici. Les couleurs viennent du thème déjà choisi.',
  },
  {
    route: 'photos',
    title: 'Photos',
    headerTitle: 'Photos',
    hint: 'Ajoutez vos photos. La mise en page de la galerie est définie par le modèle.',
  },
  {
    route: 'jour',
    title: 'Récit',
    headerTitle: 'Récit',
    hint: 'Histoire, déroulé de la journée et compte à rebours — choisissez via les pastilles.',
  },
  {
    route: 'plus',
    title: 'Invités',
    headerTitle: 'Invités',
    hint: 'Ajoutez vos invités puis configurez les choix RSVP.',
  },
  {
    route: 'publier',
    title: 'Publier',
    headerTitle: 'Aperçu & publier',
    hint: 'Vérifiez le rendu, puis publiez pour générer les liens invités.',
  },
];

const BIRTHDAY_STEPS: StudioStepDef[] = [
  {
    route: 'index',
    title: 'Affiche',
    headerTitle: 'Affiche',
    hint: 'Personnalisez l’affiche : textes, date et lieu. Une seule page pour vos invités.',
  },
  {
    route: 'theme',
    title: 'Décor',
    headerTitle: 'Décor & ambiance',
    hint: 'Choisissez le décor et l’ambiance de l’affiche.',
  },
  {
    route: 'plus',
    title: 'Invités',
    headerTitle: 'Invités',
    hint: 'Ajoutez vos invités puis configurez les choix RSVP.',
  },
  {
    route: 'publier',
    title: 'Publier',
    headerTitle: 'Aperçu & publier',
    hint: 'Vérifiez le rendu, puis publiez pour générer les liens invités.',
  },
];

const CONFERENCE_STEPS: StudioStepDef[] = [
  {
    route: 'index',
    title: 'Infos',
    headerTitle: 'Infos événement',
    hint: 'Nom de l’événement, dates et accroche. L’agenda et les intervenants viennent ensuite.',
  },
  {
    route: 'programme',
    title: 'Agenda',
    headerTitle: 'Programme',
    hint: 'Construisez l’agenda : horaires, sessions et salles.',
  },
  {
    route: 'histoire',
    title: 'Speakers',
    headerTitle: 'Intervenants',
    hint: 'Présentez vos intervenants (photo, bio, rôle).',
  },
  {
    route: 'theme',
    title: 'Lieu',
    headerTitle: 'Lieu & pratiques',
    hint: 'Lieu, accès et infos pratiques pour les participants.',
  },
  {
    route: 'plus',
    title: 'Invités',
    headerTitle: 'Invités / inscrits',
    hint: 'Gérez la liste des inscrits et les options RSVP.',
  },
  {
    route: 'publier',
    title: 'Publier',
    headerTitle: 'Aperçu & publier',
    hint: 'Vérifiez le rendu, puis publiez pour générer les liens invités.',
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
