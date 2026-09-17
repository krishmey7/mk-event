/**
 * TabBar organisateur — dock flottant, accent réservé à l’onglet actif.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { shadows } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemePreferenceContext';

const TABS: Record<
  string,
  { label: string; icon: keyof typeof Ionicons.glyphMap; iconOn: keyof typeof Ionicons.glyphMap }
> = {
  dashboard: { label: 'Accueil', icon: 'home-outline', iconOn: 'home' },
  invitations: { label: 'Invitations', icon: 'mail-outline', iconOn: 'mail' },
  modeles: { label: 'Modèles', icon: 'grid-outline', iconOn: 'grid' },
  profil: { label: 'Profil', icon: 'person-outline', iconOn: 'person' },
};

export function AppTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const routes = state.routes.filter((route) => route.name in TABS);
  const { theme } = useAppTheme();
  const c = theme.colors;
  const isDark = theme.mode === 'dark';

  return (
    <View
      pointerEvents="box-none"
      style={[styles.host, { paddingBottom: Math.max(insets.bottom, 14) }]}
    >
      <View
        style={[
          styles.dock,
          shadows.md,
          {
            backgroundColor: isDark ? c.surfaceElevated : c.surfaceElevated,
            borderColor: isDark ? 'rgba(224, 122, 95, 0.28)' : c.border,
          },
        ]}
      >
        {routes.map((route) => {
          const meta = TABS[route.name];
          const focused = state.routes[state.index]?.name === route.name;

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={meta.label}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (event.defaultPrevented) return;

                if (route.name === 'invitations') {
                  navigation.navigate('invitations', { screen: 'index' });
                  return;
                }

                if (!focused) {
                  navigation.navigate(route.name, route.params);
                }
              }}
              style={({ pressed }) => [
                styles.item,
                focused && [
                  styles.itemOn,
                  { backgroundColor: c.accentMuted },
                ],
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name={focused ? meta.iconOn : meta.icon}
                size={focused ? 16 : 20}
                color={focused ? c.accent : c.textMuted}
              />
              {focused ? (
                <Text style={[styles.labelOn, { color: c.accent }]} numberOfLines={1}>
                  {meta.label}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 8,
  },
  dock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 6,
    width: '100%',
    maxWidth: 348,
  },
  item: {
    flex: 1,
    maxWidth: 104,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  itemOn: {
    flexDirection: 'row',
    flexGrow: 1.35,
    gap: 6,
    paddingHorizontal: 12,
  },
  labelOn: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12.5,
    letterSpacing: 0.15,
  },
  pressed: { opacity: 0.8 },
});
