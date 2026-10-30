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
    title: 'Boissons',
    headerTitle: 'Boissons',
    hint: 'Proposez les boissons que les invités choisiront en confirmant.',
  },
  {
    route: 'voix',
    title: 'Ambiance',
    headerTitle: 'Musique & accueil',
    hint: 'Musique de fond et message vocal d’accueil (optionnel).',
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
    route: 'photos',
    title: 'Photos',
    headerTitle: 'Photos',
    hint: 'Ajoutez les photos de la fête (galerie invité).',
  },
  {
    route: 'theme',
    title: 'Décor',
    headerTitle: 'Décor',
    hint: 'Choisissez la palette de couleurs de l’affiche.',
  },
  {
    route: 'plus',
    title: 'Boissons',
    headerTitle: 'Boissons',
    hint: 'Proposez les boissons que les invités choisiront en confirmant.',
  },
  {
    route: 'publier',
    title: 'Publier',
    headerTitle: 'Aperçu & publier',
    hint: 'Vérifiez le rendu, puis publiez.',
  },
];

const PAPETERIE_STEPS: StudioStepDef[] = [
  {
    route: 'index',
    title: 'Invitation',
    headerTitle: 'Invitation & détails',
    hint: 'Photo, noms, date, lieu et tenue.',
  },
  {
    route: 'programme',
    title: 'Programme',
    headerTitle: 'Déroulé de la journée',
    hint: 'Organisez les moments de votre journée dans l’ordre.',
  },
  {
    route: 'plus',
    title: 'Réponses',
    headerTitle: 'RSVP & choix',
    hint: 'Configurez les boissons proposées aux invités qui confirment leur présence.',
  },
  {
    route: 'publier',
    title: 'Publier',
    headerTitle: 'Aperçu & publier',
    hint: 'Vérifiez votre papeterie numérique, puis publiez.',
  },
];

const OLIVIER_STEPS: StudioStepDef[] = [
  {
    route: 'index',
    title: 'Invitation',
    headerTitle: 'Invitation & lieu',
    hint: 'Personnalisez la photo, les noms, la date et les informations du mariage.',
  },
  {
    route: 'photos',
    title: 'Photos',
    headerTitle: 'Galerie photo',
    hint: 'Choisissez les photos qui raconteront votre histoire.',
  },
  {
    route: 'programme',
    title: 'Programme',
    headerTitle: 'Les moments de la journée',
    hint: 'Présentez les horaires et les lieux importants.',
  },
  {
    route: 'plus',
    title: 'Réponses',
    headerTitle: 'RSVP & choix',
    hint: 'Configurez les boissons proposées et les réponses de vos invités.',
  },
  {
    route: 'publier',
    title: 'Publier',
    headerTitle: 'Aperçu & publier',
    hint: 'Vérifiez votre invitation vert d’olive, puis publiez.',
  },
];

const CONFERENCE_STEPS: StudioStepDef[] = [
  {
    route: 'index',
    title: 'Infos',
    headerTitle: 'Infos événement',
    hint: 'Nom, dates et sous-titre.',
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

export function getStudioSteps(
  type: EventType | null | undefined,
  templateKey?: string,
): StudioStepDef[] {
  if (templateKey === 'papeterie') return PAPETERIE_STEPS;
  if (templateKey === 'olivier') return OLIVIER_STEPS;
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
  templateKey?: string,
): boolean {
  return getStudioSteps(type, templateKey).some((step) => step.route === route);
}

export function studioStepMeta(
  route: string,
  type: EventType | null | undefined,
  templateKey?: string,
): StudioStepDef | null {
  const steps = getStudioSteps(type, templateKey);
  const index = steps.findIndex((step) => step.route === route);
  if (index < 0) return null;
  return steps[index];
}

export function studioStepNumber(
  route: string,
  type: EventType | null | undefined,
  templateKey?: string,
): number {
  const index = getStudioSteps(type, templateKey).findIndex((step) => step.route === route);
  return index >= 0 ? index + 1 : 1;
}

export function studioStepIndex(
  route: string,
  type: EventType | null | undefined,
  templateKey?: string,
): number {
  return getStudioSteps(type, templateKey).findIndex((step) => step.route === route);
}

export function studioStepHint(
  route: string,
  type: EventType | null | undefined,
  templateKey?: string,
): string | null {
  return studioStepMeta(route, type, templateKey)?.hint ?? null;
}

export function nextStudioStep(
  route: string,
  type: EventType | null | undefined,
  templateKey?: string,
): StudioStepDef | null {
  const steps = getStudioSteps(type, templateKey);
  const index = steps.findIndex((step) => step.route === route);
  if (index < 0 || index >= steps.length - 1) return null;
  return steps[index + 1];
}

export function prevStudioStep(
  route: string,
  type: EventType | null | undefined,
  templateKey?: string,
): StudioStepDef | null {
  const steps = getStudioSteps(type, templateKey);
  const index = steps.findIndex((step) => step.route === route);
  if (index <= 0) return null;
  return steps[index - 1];
}
