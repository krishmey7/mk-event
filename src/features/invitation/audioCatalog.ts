/**
 * Catalogue audio invitation — ambiances + scripts d’accueil par type d’événement.
 */

import type { IconName } from '@/features/templates/elegance/data';
import type { EventType } from '@/types';

export interface MusicTrack {
  key: string;
  label: string;
  icon: IconName;
  uri: string;
}

export type VoicePersonaKey = 'mariage' | 'anniversaire' | 'conference';

export interface VoicePersona {
  key: VoicePersonaKey;
  label: string;
  icon: IconName;
}

export interface WelcomeSpeechContext {
  persona: VoicePersonaKey;
  guestFirstName: string;
  /** Noms des mariés / fêté / titre de la conférence (couverture). */
  hosts: string;
}

/** Ambiances préréglées (volume toujours capé côté player). */
export const MUSIC_TRACKS: MusicTrack[] = [
  {
    key: 'acoustique',
    label: 'Acoustique',
    icon: 'musical-notes-outline',
    uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    key: 'classique',
    label: 'Classique',
    icon: 'disc-outline',
    uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    key: 'jazz',
    label: 'Jazz',
    icon: 'mic-outline',
    uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  },
  {
    key: 'pop',
    label: 'Pop douce',
    icon: 'headset-outline',
    uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3',
  },
];

export const VOICE_PERSONAS: VoicePersona[] = [
  { key: 'mariage', label: 'Mariage', icon: 'heart-outline' },
  { key: 'anniversaire', label: 'Anniversaire', icon: 'gift-outline' },
  { key: 'conference', label: 'Conférence', icon: 'briefcase-outline' },
];

/** Volume max de l’ambiance pendant la visite (toujours doux). */
export const AMBIENT_VOLUME = 0.22;

export function musicTrackByKey(key: string): MusicTrack {
  return MUSIC_TRACKS.find((item) => item.key === key) ?? MUSIC_TRACKS[0];
}

export function voicePersonaByKey(key: string | undefined): VoicePersona {
  return VOICE_PERSONAS.find((item) => item.key === key) ?? VOICE_PERSONAS[0];
}

export function personaFromEventType(type: EventType | string | undefined): VoicePersonaKey {
  switch (type) {
    case 'birthday':
      return 'anniversaire';
    case 'corporate':
      return 'conference';
    case 'wedding':
    case 'baptism':
    default:
      return 'mariage';
  }
}

/** URI effective : upload organisateur, sinon préréglage. */
export function resolveAmbientUri(musicKey: string, ambientUri?: string | null): string {
  const custom = (ambientUri ?? '').trim();
  if (custom) return custom;
  return musicTrackByKey(musicKey).uri;
}

/**
 * Présentation + accueil chaleureux (sans date / lieu / programme).
 * Mariage : « Bonjour {invité}, je suis l’assistante du mariage du couple {mariés}… »
 */
export function buildWelcomeSpeech(input: WelcomeSpeechContext): string {
  const name = input.guestFirstName.trim() || 'cher invité';
  const hosts = input.hosts.trim() || 'les organisateurs';

  switch (input.persona) {
    case 'anniversaire':
      return (
        `Bonjour ${name}. ` +
        `Je suis l’assistante de l’anniversaire de ${hosts}. ` +
        `Quelle joie de vous compter parmi nous pour célébrer ce beau jour. ` +
        `Prenez le temps de parcourir l’invitation, et n’oubliez pas de confirmer votre présence. ` +
        `Bonne fête !`
      );
    case 'conference':
      return (
        `Bonjour ${name}. ` +
        `Je suis l’assistante de la conférence ${hosts}. ` +
        `Merci d’être avec nous. ` +
        `Découvrez le contenu à votre rythme, puis confirmez votre participation. ` +
        `Bonne session.`
      );
    case 'mariage':
    default:
      return (
        `Bonjour ${name}. ` +
        `Je suis l’assistante du mariage du couple ${hosts}. ` +
        `C’est un vrai plaisir de vous accueillir pour ce moment si précieux. ` +
        `Parcourez leur invitation avec tendresse, puis confirmez votre présence quand vous le souhaitez. ` +
        `À très bientôt.`
      );
  }
}
