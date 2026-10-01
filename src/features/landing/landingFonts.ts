/**
 * Typo landing = ID Grotesk (comme Edulex).
 * Une seule famille pour titres et corps — graisses via fontWeight.
 */

import { Platform, type TextStyle } from 'react-native';

const FAMILY =
  Platform.OS === 'web'
    ? 'ID Grotesk, "Space Grotesk", system-ui, -apple-system, "Segoe UI", sans-serif'
    : 'SpaceGrotesk_500Medium';

export const landingFonts = {
  regular: {
    fontFamily: Platform.OS === 'web' ? FAMILY : 'SpaceGrotesk_400Regular',
    fontWeight: Platform.OS === 'web' ? ('400' as const) : undefined,
  },
  medium: {
    fontFamily: Platform.OS === 'web' ? FAMILY : 'SpaceGrotesk_500Medium',
    fontWeight: Platform.OS === 'web' ? ('500' as const) : undefined,
  },
  semibold: {
    fontFamily: Platform.OS === 'web' ? FAMILY : 'SpaceGrotesk_600SemiBold',
    fontWeight: Platform.OS === 'web' ? ('600' as const) : undefined,
  },
  bold: {
    fontFamily: Platform.OS === 'web' ? FAMILY : 'SpaceGrotesk_700Bold',
    fontWeight: Platform.OS === 'web' ? ('700' as const) : undefined,
  },
} satisfies Record<string, TextStyle>;

/** Charge ID Grotesk (CDN) dès l’arrivée sur la landing web. */
export function ensureLandingFontsLoaded(): () => void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return () => undefined;
  }
  const id = 'mk-landing-id-grotesk';
  let link = document.getElementById(id) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.cdnfonts.com/css/id-grotesk';
    document.head.appendChild(link);
  }
  return () => undefined;
}
