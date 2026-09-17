/**
 * Groupe (app) — espace organisateur connecté.
 * Règle n°3 : mobile → dock flottant ; desktop → Sidebar.
 * Sans événement configuré → wizard /setup obligatoire.
 */

import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Tabs, usePathname, useRouter } from 'expo-router';

import { AppTabBar } from '@/components/layout/AppTabBar';
import { Sidebar } from '@/components/layout/Sidebar';
import { useActiveEvent } from '@/context/ActiveEventContext';
import { useAuth } from '@/context/AuthContext';
import { useAppTheme } from '@/context/ThemePreferenceContext';
import { useBreakpoint } from '@/hooks/useBreakpoint';

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const { ready, needsSetup } = useActiveEvent();
  const router = useRouter();
  const pathname = usePathname();
  const { isDesktop } = useBreakpoint();
  const { theme } = useAppTheme();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && ready && needsSetup) {
      const onSetup = pathname.includes('/setup');
      if (!onSetup) router.replace('/setup');
    }
  }, [isAuthenticated, isLoading, needsSetup, pathname, ready, router]);

  if (isLoading || !isAuthenticated || !ready) {
    return null;
  }

  const onManageScreen = /\/invitations\/[^/]+$/.test(pathname);
  const onSetup = pathname.includes('/setup');

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }, isDesktop && styles.rootDesktop]}>
      {isDesktop && !onSetup ? <Sidebar /> : null}
      <View style={[styles.slot, { backgroundColor: theme.colors.background }]}>
        <Tabs
          tabBar={(props) => {
            if (isDesktop || onSetup) return null;
            const active = props.state.routes[props.state.index]?.name;
            if (active === 'editor' || active === 'reponses' || active === 'setup' || onManageScreen) {
              return null;
            }
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
          <Tabs.Screen name="setup" options={{ href: null, title: 'Configuration' }} />
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
