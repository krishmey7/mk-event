/**
 * Typo landing = Space Grotesk, déjà chargée par `app/_layout.tsx`.
 * Plus aucune dépendance CDN : la landing et la PWA fonctionnent hors ligne.
 */

import type { TextStyle } from 'react-native';

export const landingFonts = {
  regular: { fontFamily: 'SpaceGrotesk_400Regular' },
  medium: { fontFamily: 'SpaceGrotesk_500Medium' },
  semibold: { fontFamily: 'SpaceGrotesk_600SemiBold' },
  bold: { fontFamily: 'SpaceGrotesk_700Bold' },
} satisfies Record<string, TextStyle>;
