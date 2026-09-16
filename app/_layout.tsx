/**
 * Root Layout — Expo Router.
 * • Charge Fraunces (titres) et Inter (UI) via expo-font.
 * • Fournit la session globale (AuthProvider / useAuth).
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
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
import * as SplashScreen from 'expo-splash-screen';

import { AuthProvider } from '@/context/AuthContext';
import { ThemePreferenceProvider, useAppTheme } from '@/context/ThemePreferenceContext';
import { PwaInstallPrompt } from '@/features/pwa/PwaInstallPrompt';

/* Le splash reste affiché tant que les polices ne sont pas prêtes. */
void SplashScreen.preventAutoHideAsync().catch(() => {
  // Déjà masqué (fast-refresh) — ignorer.
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fraunces_400Regular,
    Fraunces_400Regular_Italic,
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync().catch(() => {
        // noop
      });
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemePreferenceProvider>
      <AuthProvider>
        <RootChrome />
      </AuthProvider>
    </ThemePreferenceProvider>
  );
}

function RootChrome() {
  const { theme, mode } = useAppTheme();
  return (
    <>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      />
      <PwaInstallPrompt />
    </>
  );
}

