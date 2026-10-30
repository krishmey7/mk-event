/**
 * Root Layout — Expo Router.
 * • Charge Fraunces (titres) et Inter (UI) via expo-font.
 * • Fournit la session globale (AuthProvider / useAuth).
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Fraunces_400Regular } from '@expo-google-fonts/fraunces/400Regular';
import { Fraunces_400Regular_Italic } from '@expo-google-fonts/fraunces/400Regular_Italic';
import { Fraunces_500Medium } from '@expo-google-fonts/fraunces/500Medium';
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces/600SemiBold';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { GreatVibes_400Regular } from '@expo-google-fonts/great-vibes/400Regular';
import { CormorantGaramond_400Regular } from '@expo-google-fonts/cormorant-garamond/400Regular';
import { CormorantGaramond_400Regular_Italic } from '@expo-google-fonts/cormorant-garamond/400Regular_Italic';
import { CormorantGaramond_500Medium } from '@expo-google-fonts/cormorant-garamond/500Medium';
import { CormorantGaramond_600SemiBold } from '@expo-google-fonts/cormorant-garamond/600SemiBold';
import { PlayfairDisplay_400Regular } from '@expo-google-fonts/playfair-display/400Regular';
import { PlayfairDisplay_500Medium } from '@expo-google-fonts/playfair-display/500Medium';
import { PlayfairDisplay_600SemiBold } from '@expo-google-fonts/playfair-display/600SemiBold';
import { PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display/700Bold';
import { Allura_400Regular } from '@expo-google-fonts/allura/400Regular';
import { SpaceGrotesk_400Regular } from '@expo-google-fonts/space-grotesk/400Regular';
import { SpaceGrotesk_500Medium } from '@expo-google-fonts/space-grotesk/500Medium';
import { SpaceGrotesk_600SemiBold } from '@expo-google-fonts/space-grotesk/600SemiBold';
import { SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk/700Bold';
import * as SplashScreen from 'expo-splash-screen';
import * as WebBrowser from 'expo-web-browser';

import { AuthProvider } from '@/context/AuthContext';
import { ActiveEventProvider } from '@/context/ActiveEventContext';
import { ThemePreferenceProvider, useAppTheme } from '@/context/ThemePreferenceContext';
import { OfflineScreen } from '@/features/pwa/OfflineScreen';
import { PwaInstallPrompt } from '@/features/pwa/PwaInstallPrompt';

/**
 * Doit tourner dès le chargement du bundle — y compris dans la popup OAuth
 * qui retombe sur `/` (landing). Sinon la fenêtre reste ouverte sur l’accueil.
 */
if (typeof window !== 'undefined') {
  const completed = WebBrowser.maybeCompleteAuthSession();
  if (
    completed.type === 'failed' &&
    window.opener &&
    /(?:^|[?#&])(?:state|id_token|access_token)=/.test(window.location.href)
  ) {
    WebBrowser.maybeCompleteAuthSession({ skipRedirectCheck: true });
  }
}

/* Le splash reste affiché tant que les polices ne sont pas prêtes. */
void SplashScreen.preventAutoHideAsync().catch(() => {
  // Déjà masqué (fast-refresh) — ignorer.
});

/** Contour / autofill navigateur — respectent le tone du champ (clair ≠ sombre). */
function useWebInputChromeFix() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const id = 'mk-event-input-chrome-fix';
    let style = document.getElementById(id) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement('style');
      style.id = id;
      document.head.appendChild(style);
    }
    style.textContent = `
      input, textarea, select, [contenteditable="true"] {
        outline: none !important;
        -webkit-tap-highlight-color: transparent;
      }
      /* Champs clairs (inscription, etc.) — jamais le fill dark du mode système. */
      input[data-mk-tone="light"]:-webkit-autofill,
      input[data-mk-tone="light"]:-webkit-autofill:hover,
      input[data-mk-tone="light"]:-webkit-autofill:focus,
      input[data-mk-tone="light"]:-webkit-autofill:active,
      textarea[data-mk-tone="light"]:-webkit-autofill,
      textarea[data-mk-tone="light"]:-webkit-autofill:hover,
      textarea[data-mk-tone="light"]:-webkit-autofill:focus {
        -webkit-box-shadow: 0 0 0 1000px #FFFFFF inset !important;
        box-shadow: 0 0 0 1000px #FFFFFF inset !important;
        -webkit-text-fill-color: #2A1F24 !important;
        caret-color: #2A1F24 !important;
        background-color: #FFFFFF !important;
        background-clip: content-box !important;
        transition: background-color 99999s ease-out 0s !important;
      }
      /* Champs dark luxury (connexion). */
      input[data-mk-tone="dark"]:-webkit-autofill,
      input[data-mk-tone="dark"]:-webkit-autofill:hover,
      input[data-mk-tone="dark"]:-webkit-autofill:focus,
      input[data-mk-tone="dark"]:-webkit-autofill:active,
      textarea[data-mk-tone="dark"]:-webkit-autofill,
      textarea[data-mk-tone="dark"]:-webkit-autofill:hover,
      textarea[data-mk-tone="dark"]:-webkit-autofill:focus {
        -webkit-box-shadow: 0 0 0 1000px #3A2434 inset !important;
        box-shadow: 0 0 0 1000px #3A2434 inset !important;
        -webkit-text-fill-color: #F7F0E8 !important;
        caret-color: #F7F0E8 !important;
        background-color: #3A2434 !important;
        background-clip: content-box !important;
        transition: background-color 99999s ease-out 0s !important;
      }
    `;
  }, []);
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_400Regular,
    Fraunces_400Regular_Italic,
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    GreatVibes_400Regular,
    CormorantGaramond_400Regular,
    CormorantGaramond_400Regular_Italic,
    CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_500Medium,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
    Allura_400Regular,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync().catch(() => {
        // noop
      });
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemePreferenceProvider>
      <AuthProvider>
        <ActiveEventProvider>
          <RootChrome />
        </ActiveEventProvider>
      </AuthProvider>
    </ThemePreferenceProvider>
  );
}

/** Plein écran web : hauteur visuelle + fond edge-to-edge sous les barres OS. */
function useWebFullscreenShell(background: string, mode: 'light' | 'dark') {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;

    const root = document.documentElement;
    const applyChrome = () => {
      root.style.setProperty('--mk-bg', background);
      root.style.colorScheme = mode;
      root.style.backgroundColor = background;
      document.body.style.backgroundColor = background;
      const rootEl = document.getElementById('root');
      if (rootEl) rootEl.style.backgroundColor = background;

      const metas = document.querySelectorAll('meta[name="theme-color"]');
      metas.forEach((meta) => {
        const media = meta.getAttribute('media');
        if (!media) {
          meta.setAttribute('content', background);
          return;
        }
        if (media.includes('dark') && mode === 'dark') meta.setAttribute('content', background);
        if (media.includes('light') && mode === 'light') meta.setAttribute('content', background);
      });
    };

    const syncHeight = () => {
      const h =
        window.visualViewport?.height ??
        window.innerHeight ??
        document.documentElement.clientHeight;
      if (h > 0) root.style.setProperty('--mk-app-height', `${Math.round(h)}px`);
    };

    applyChrome();
    syncHeight();

    window.addEventListener('resize', syncHeight);
    window.addEventListener('orientationchange', syncHeight);
    window.visualViewport?.addEventListener('resize', syncHeight);
    window.visualViewport?.addEventListener('scroll', syncHeight);
    document.addEventListener('visibilitychange', syncHeight);

    return () => {
      window.removeEventListener('resize', syncHeight);
      window.removeEventListener('orientationchange', syncHeight);
      window.visualViewport?.removeEventListener('resize', syncHeight);
      window.visualViewport?.removeEventListener('scroll', syncHeight);
      document.removeEventListener('visibilitychange', syncHeight);
    };
  }, [background, mode]);
}

function RootChrome() {
  const { theme, mode } = useAppTheme();
  useWebInputChromeFix();
  useWebFullscreenShell(theme.colors.background, mode);

  return (
    <>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} translucent />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: theme.colors.background,
            flex: 1,
            minHeight: '100%',
          },
        }}
      />
      <PwaInstallPrompt />
      <OfflineScreen />
    </>
  );
}
