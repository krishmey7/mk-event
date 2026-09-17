/**
 * Palettes proposées au wizard « Avez-vous un thème… ? ».
 */

import type { EventType } from '@/types';

export interface SetupThemeOption {
  key: string;
  label: string;
  swatch: string;
  hint: string;
}

/** Aucune palette forcée — chaque modèle garde ses couleurs d’origine. */
export const SETUP_THEME_NONE_KEY = 'aucun';

export const SETUP_THEMES: SetupThemeOption[] = [
  {
    key: SETUP_THEME_NONE_KEY,
    label: 'Aucun',
    swatch: '#DCE1E8',
    hint: 'Couleurs d’origine du modèle',
  },
  { key: 'sauge', label: 'Eucalyptus', swatch: '#2F6F69', hint: 'Frais et contemporain' },
  { key: 'champagne', label: 'Champagne', swatch: '#C9A86A', hint: 'Classique et lumineux' },
  { key: 'rose', label: 'Rose poudré', swatch: '#BC7B88', hint: 'Doux et romantique' },
  { key: 'marine', label: 'Marine', swatch: '#3A4F6A', hint: 'Élégant et profond' },
  { key: 'bordeaux', label: 'Bordeaux', swatch: '#7A3040', hint: 'Chaleureux' },
  { key: 'noir', label: 'Noir & or', swatch: '#1A1A1A', hint: 'Soirée chic' },
];

export const SETUP_EVENT_TYPES = [
  {
    type: 'wedding' as const,
    label: 'Mariage',
    hint: 'Cérémonie, réception, réponses des invités',
    icon: 'heart-outline' as const,
  },
  {
    type: 'birthday' as const,
    label: 'Anniversaire',
    hint: 'Fête, cadeaux, ambiance joyeuse',
    icon: 'balloon-outline' as const,
  },
  {
    type: 'corporate' as const,
    label: 'Conférence',
    hint: 'Événement pro, programme, networking',
    icon: 'briefcase-outline' as const,
  },
];

export function themeQuestionForEvent(type: EventType | null): string {
  switch (type) {
    case 'wedding':
      return 'Avez-vous un thème pour votre mariage ?';
    case 'birthday':
      return 'Avez-vous un thème pour votre anniversaire ?';
    case 'corporate':
      return 'Avez-vous un thème pour votre conférence ?';
    default:
      return 'Avez-vous un thème pour votre événement ?';
  }
}

/** Clé stockée côté événement (vide = thème d’origine du modèle). */
export function toStoredThemeKey(selection: string): string {
  return selection === SETUP_THEME_NONE_KEY ? '' : selection;
}

/** Sélection UI à partir de la clé stockée. */
export function toSetupThemeSelection(stored: string | null | undefined): string {
  const value = (stored ?? '').trim();
  return value || SETUP_THEME_NONE_KEY;
}
