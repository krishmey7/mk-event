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
}

const WEDDING_STEPS: StudioStepDef[] = [
  { route: 'index', title: 'Infos', headerTitle: 'Infos' },
  { route: 'photos', title: 'Photos', headerTitle: 'Photos' },
  { route: 'jour', title: 'Récit', headerTitle: 'Récit' },
  { route: 'plus', title: 'Invités', headerTitle: 'Invités' },
  { route: 'publier', title: 'Publier', headerTitle: 'Aperçu & publier' },
];

const BIRTHDAY_STEPS: StudioStepDef[] = [
  { route: 'index', title: 'Affiche', headerTitle: 'Affiche' },
  { route: 'theme', title: 'Décor', headerTitle: 'Décor & ambiance' },
  { route: 'plus', title: 'Invités', headerTitle: 'Invités' },
  { route: 'publier', title: 'Publier', headerTitle: 'Aperçu & publier' },
];

const CONFERENCE_STEPS: StudioStepDef[] = [
  { route: 'index', title: 'Infos', headerTitle: 'Infos événement' },
  { route: 'programme', title: 'Agenda', headerTitle: 'Programme' },
  { route: 'histoire', title: 'Speakers', headerTitle: 'Intervenants' },
  { route: 'theme', title: 'Lieu', headerTitle: 'Lieu & pratiques' },
  { route: 'plus', title: 'Invités', headerTitle: 'Invités / inscrits' },
  { route: 'publier', title: 'Publier', headerTitle: 'Aperçu & publier' },
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
  return {
    ...steps[index],
    title: steps[index].title,
    headerTitle: steps[index].headerTitle,
  };
}

export function studioStepNumber(
  route: string,
  type: EventType | null | undefined,
): number {
  const index = getStudioSteps(type).findIndex((step) => step.route === route);
  return index >= 0 ? index + 1 : 1;
}
