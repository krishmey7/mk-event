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
import {
  Fraunces_400Regular,
  Fraunces_400Regular_Italic,
  Fraunces_500Medium,
  Fraunces_600SemiBold,
} from '@expo-google-fonts/fraunces';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { GreatVibes_400Regular } from '@expo-google-fonts/great-vibes';
import {
  CormorantGaramond_400Regular,
  CormorantGaramond_400Regular_Italic,
  CormorantGaramond_500Medium,
  CormorantGaramond_600SemiBold,
} from '@expo-google-fonts/cormorant-garamond';
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_500Medium,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import { Allura_400Regular } from '@expo-google-fonts/allura';
import * as SplashScreen from 'expo-splash-screen';

import { AuthProvider } from '@/context/AuthContext';
import { ActiveEventProvider } from '@/context/ActiveEventContext';
import { ThemePreferenceProvider, useAppTheme } from '@/context/ThemePreferenceContext';
import { PwaInstallPrompt } from '@/features/pwa/PwaInstallPrompt';

/* Le splash reste affiché tant que les polices ne sont pas prêtes. */
void SplashScreen.preventAutoHideAsync().catch(() => {
  // Déjà masqué (fast-refresh) — ignorer.
});

/** Contour / autofill navigateur — alignés sur le chrome MK Events. */
function useWebInputChromeFix(mode: 'light' | 'dark') {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const id = 'mk-event-input-chrome-fix';
    let style = document.getElementById(id) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement('style');
      style.id = id;
      document.head.appendChild(style);
    }
    const fill = mode === 'dark' ? '#2A1824' : '#F7F0E8';
    const text = mode === 'dark' ? '#F7F0E8' : '#2A1F24';
    style.textContent = `
      input, textarea, select, [contenteditable="true"] {
        outline: none !important;
        -webkit-tap-highlight-color: transparent;
      }
      input:-webkit-autofill,
      input:-webkit-autofill:hover,
      input:-webkit-autofill:focus,
      input:-webkit-autofill:active,
      textarea:-webkit-autofill,
      textarea:-webkit-autofill:hover,
      textarea:-webkit-autofill:focus {
        -webkit-box-shadow: 0 0 0 1000px ${fill} inset !important;
        box-shadow: 0 0 0 1000px ${fill} inset !important;
        -webkit-text-fill-color: ${text} !important;
        caret-color: ${text} !important;
        background-color: ${fill} !important;
        background-clip: content-box !important;
        transition: background-color 99999s ease-out 0s !important;
      }
    `;
  }, [mode]);
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

function RootChrome() {
  const { theme, mode } = useAppTheme();
  useWebInputChromeFix(mode);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const bg = theme.colors.background;
    document.documentElement.style.backgroundColor = bg;
    document.body.style.backgroundColor = bg;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', mode === 'dark' ? '#2A1824' : bg);
  }, [theme.colors.background, mode]);

  return (
    <>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} translucent />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background, flex: 1 },
        }}
      />
      <PwaInstallPrompt />
    </>
  );
}

