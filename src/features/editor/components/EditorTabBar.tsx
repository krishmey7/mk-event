/**
 * Barre du studio — 4 étapes (Page → Thème → Récit → Invités).
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { useEditor } from '../EditorContext';

const LABELS: Record<string, { step: string; title: string }> = {
  index: { step: '1', title: 'Page' },
  theme: { step: '2', title: 'Thème' },
  jour: { step: '3', title: 'Récit' },
  plus: { step: '4', title: 'Invités' },
};

export function EditorTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { guests, theme } = useEditor();
  const c = theme.colors;
  const currentKey = state.routes[state.index]?.name;
  const routes = state.routes.filter((route) => route.name in LABELS);

  return (
    <View
      style={[
        styles.wrap,
        {
          paddingBottom: Math.max(insets.bottom, 12),
          backgroundColor: c.surface,
          borderTopColor: c.border,
        },
      ]}
    >
      <Text style={[styles.caption, { color: c.textMuted }]}>Dans l’ordre</Text>
      <View style={styles.row}>
        {routes.map((route, index) => {
          const meta = LABELS[route.name] ?? { step: String(index + 1), title: route.name };
          const focused = currentKey === route.name;
          const showDot = route.name === 'plus' && guests.length === 0;

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={`Étape ${meta.step}, ${meta.title}`}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name, route.params);
                }
              }}
              style={({ pressed }) => [styles.item, pressed && styles.pressed]}
            >
              <View
                style={[
                  styles.badge,
                  {
                    borderColor: focused ? c.primary : c.border,
                    backgroundColor: focused ? c.primary : c.chip,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    { color: focused ? c.onPrimary : c.textMuted },
                  ]}
                >
                  {meta.step}
                </Text>
                {showDot ? (
                  <View style={[styles.alert, { backgroundColor: c.accent, borderColor: c.surface }]} />
                ) : null}
              </View>
              <Text style={[styles.label, { color: focused ? c.text : c.textMuted }, focused && styles.labelOn]}>
                {meta.title}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderTopWidth: 1,
    paddingTop: 10,
    paddingHorizontal: 10,
  },
  caption: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 8,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  item: { flex: 1, alignItems: 'center', gap: 6 },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  alert: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
  },
  label: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  labelOn: { fontFamily: 'Inter_600SemiBold' },
  pressed: { opacity: 0.75 },
});
