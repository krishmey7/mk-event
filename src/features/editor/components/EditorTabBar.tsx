/**
 * Barre du studio — parcours guidé selon le type d’événement.
 */

import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { useActiveEvent } from '@/context/ActiveEventContext';
import { useAppTheme } from '@/context/ThemePreferenceContext';
import { fontFamilies } from '@/constants/theme';
import { useEditor } from '../EditorContext';
import { getStudioSteps } from '../studioSteps';

export function EditorTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { guests, template } = useEditor();
  const { type: activeType } = useActiveEvent();
  /** Le modèle ouvert prime : évite un type ActiveEvent obsolète. */
  const eventType = template.category || activeType;
  const steps = getStudioSteps(eventType);
  const { theme } = useAppTheme();
  const c = theme.colors;
  const currentKey = state.routes[state.index]?.name;

  const items = useMemo(() => {
    return steps.flatMap((step, stepIndex) => {
      const route = state.routes.find((item) => item.name === step.route);
      if (!route) return [];
      return [{ route, step, stepIndex }];
    });
  }, [steps, state.routes]);

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
      <Text style={[styles.caption, { color: c.textMuted }]}>Mode libre</Text>
      <View style={styles.row}>
        {items.map(({ route, step, stepIndex }) => {
          const focused = currentKey === route.name;
          const showDot = route.name === 'plus' && guests.length === 0;

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={`Étape ${stepIndex + 1}, ${step.title}`}
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
                    borderColor: focused ? c.accent : c.border,
                    backgroundColor: focused ? c.accent : c.surfaceElevated,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    { color: focused ? c.onAccent : c.textMuted },
                  ]}
                >
                  {stepIndex + 1}
                </Text>
                {showDot ? (
                  <View style={[styles.alert, { backgroundColor: c.accent, borderColor: c.surface }]} />
                ) : null}
              </View>
              <Text
                style={[
                  styles.label,
                  { color: focused ? c.textPrimary : c.textMuted },
                  focused && styles.labelOn,
                ]}
              >
                {step.title}
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
    paddingHorizontal: 6,
  },
  caption: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 8,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  item: { flex: 1, alignItems: 'center', gap: 4 },
  badge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontFamily: fontFamilies.sansSemiBold, fontSize: 12 },
  alert: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
  },
  label: { fontFamily: fontFamilies.sansMedium, fontSize: 10 },
  labelOn: { fontFamily: fontFamilies.sansSemiBold },
  pressed: { opacity: 0.75 },
});
