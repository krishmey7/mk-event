/**
 * Typo landing = ID Grotesk (Edulex).
 * Injection @font-face avec poids corrects (le CSS CDN mappe mal le Semibold).
 */

import { Platform, type TextStyle } from 'react-native';

const FAMILY =
  Platform.OS === 'web'
    ? '"ID Grotesk", "Space Grotesk", system-ui, -apple-system, "Segoe UI", sans-serif'
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

const STYLE_ID = 'mk-landing-id-grotesk-faces';

const FONT_CSS = `
@font-face {
  font-family: 'ID Grotesk';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('https://fonts.cdnfonts.com/s/105609/IDGrotesk-Regular-BF652cb1b4787d7.woff') format('woff');
}
@font-face {
  font-family: 'ID Grotesk';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url('https://fonts.cdnfonts.com/s/105609/IDGrotesk-Medium-BF652cb1b4765e1.woff') format('woff');
}
@font-face {
  font-family: 'ID Grotesk';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url('https://fonts.cdnfonts.com/s/105609/IDGrotesk-Semibold-BF652cb1b467d9d.woff') format('woff');
}
@font-face {
  font-family: 'ID Grotesk';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('https://fonts.cdnfonts.com/s/105609/IDGrotesk-Bold-BF652cb1b4740d2.woff') format('woff');
}
.mk-landing-root {
  font-family: 'ID Grotesk', 'Space Grotesk', system-ui, -apple-system, 'Segoe UI', sans-serif;
}
`;

/** Charge ID Grotesk avec les bons poids dès l’arrivée sur la landing web. */
export function ensureLandingFontsLoaded(): () => void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return () => undefined;
  }
  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = FONT_CSS;
    document.head.appendChild(style);
  }
  document.documentElement.classList.add('mk-landing-root');
  document.body?.classList.add('mk-landing-root');
  return () => {
    document.documentElement.classList.remove('mk-landing-root');
    document.body?.classList.remove('mk-landing-root');
  };
}
