/**
 * Groupe (app) — espace organisateur connecté.
 * Règle n°3 : mobile → dock flottant (Accueil · Invitations ·
 * Modèles · Profil) ; desktop (≥768 px) → dock masqué + Sidebar
 * latérale fixe de 260 px. Exige une session : sinon /login.
 */

import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Tabs, usePathname, useRouter } from 'expo-router';

import { AppTabBar } from '@/components/layout/AppTabBar';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useAppTheme } from '@/context/ThemePreferenceContext';
import { useBreakpoint } from '@/hooks/useBreakpoint';

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { isDesktop } = useBreakpoint();
  const { theme } = useAppTheme();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const onManageScreen = /\/invitations\/[^/]+$/.test(pathname);

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }, isDesktop && styles.rootDesktop]}>
      {isDesktop ? <Sidebar /> : null}
      <View style={[styles.slot, { backgroundColor: theme.colors.background }]}>
        <Tabs
          tabBar={(props) => {
            if (isDesktop) return null;
            const active = props.state.routes[props.state.index]?.name;
            if (active === 'editor' || active === 'reponses' || onManageScreen) return null;
            return <AppTabBar {...props} />;
          }}
          screenOptions={{
            headerShown: false,
          }}
        >
          <Tabs.Screen name="dashboard" options={{ title: 'Accueil' }} />
          <Tabs.Screen name="invitations" options={{ title: 'Invitations' }} />
          <Tabs.Screen name="modeles" options={{ title: 'Modèles' }} />
          <Tabs.Screen name="profil" options={{ title: 'Profil' }} />
          <Tabs.Screen
            name="reponses"
            options={{
              href: null,
              title: 'Réponses',
            }}
          />
          <Tabs.Screen
            name="editor"
            options={{
              href: null,
              title: 'Studio',
            }}
          />
        </Tabs>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  rootDesktop: { flexDirection: 'row' },
  slot: { flex: 1 },
});
