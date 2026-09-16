/**
 * Groupe (auth) — écrans Connexion / Inscription.
 * Stack sans header : chaque écran dessine sa propre coquille
 * (fonds unis + SafeArea). Garde de route : un utilisateur connecté
 * est renvoyé vers /dashboard.
 */

import { Stack } from 'expo-router';

import { RedirectIfAuthenticated } from '@/components/layout/RedirectIfAuthenticated';
import { darkTheme } from '@/constants/theme';

export default function AuthLayout() {
  return (
    <RedirectIfAuthenticated>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: darkTheme.colors.background },
        }}
      />
    </RedirectIfAuthenticated>
  );
}

