/**
 * Héros onboarding — WebP légers + préchargement sûr (web + natif).
 */

import { Image, type ImageSourcePropType } from 'react-native';

export const ONBOARDING_HERO_MARIAGE = require('../../../assets/onboarding/hero-mariage.webp');
export const ONBOARDING_HERO_ANNIVERSAIRE = require('../../../assets/onboarding/hero-anniversaire.webp');
export const ONBOARDING_HERO_CONFERENCE = require('../../../assets/onboarding/hero-conference.webp');

export const ONBOARDING_HERO_SOURCES: ImageSourcePropType[] = [
  ONBOARDING_HERO_MARIAGE,
  ONBOARDING_HERO_ANNIVERSAIRE,
  ONBOARDING_HERO_CONFERENCE,
];

function uriFromSource(source: ImageSourcePropType): string | null {
  try {
    if (typeof source === 'object' && source !== null && !Array.isArray(source)) {
      const uri = (source as { uri?: string }).uri;
      if (typeof uri === 'string' && uri.length > 0) return uri;
    }
    const resolve = Image.resolveAssetSource;
    if (typeof resolve === 'function') {
      const resolved = resolve(source as number);
      if (resolved?.uri) return resolved.uri;
    }
    // Expo web : parfois le module est déjà une URL string
    if (typeof source === 'string') return source;
  } catch {
    return null;
  }
  return null;
}

/** Ne doit jamais faire planter l’app (landing / onboarding). */
export function prefetchOnboardingHeroes() {
  try {
    for (const source of ONBOARDING_HERO_SOURCES) {
      const uri = uriFromSource(source);
      if (!uri) continue;
      if (typeof Image.prefetch === 'function') {
        void Image.prefetch(uri).catch(() => undefined);
      }
    }
  } catch {
    // ignore
  }
}
