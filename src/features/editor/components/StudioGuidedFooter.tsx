/**
 * Pied sticky du studio guidé — Retour / Continuer.
 * Dernière étape : Retour seul (la publication se fait dans la page).
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { useActiveEvent } from '@/context/ActiveEventContext';
import { useAppTheme } from '@/context/ThemePreferenceContext';
import { fontFamilies, shadows } from '@/constants/theme';
import { useEditor } from '../EditorContext';
import {
  getStudioSteps,
  nextStudioStep,
  prevStudioStep,
} from '../studioSteps';

export function StudioGuidedFooter({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { template } = useEditor();
  const { type: activeType } = useActiveEvent();
  const eventType = activeType || template.category;
  const { theme } = useAppTheme();
  const c = theme.colors;

  const currentKey = state.routes[state.index]?.name ?? 'index';
  const steps = getStudioSteps(eventType);
  const prev = prevStudioStep(currentKey, eventType);
  const next = nextStudioStep(currentKey, eventType);
  const isLast = !next && steps.some((step) => step.route === currentKey);

  const goTo = (routeName: string) => {
    const route = state.routes.find((item) => item.name === routeName);
    if (!route) return;
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });
    if (!event.defaultPrevented) {
      navigation.navigate(route.name, route.params);
    }
  };

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
      <View style={styles.row}>
        {prev ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Étape précédente"
            onPress={() => goTo(prev.route)}
            style={({ pressed }) => [
              styles.backBtn,
              isLast && styles.backBtnGrow,
              { borderColor: c.border, backgroundColor: c.surfaceElevated },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="arrow-back" size={18} color={c.textPrimary} />
            <Text style={[styles.backLabel, { color: c.textPrimary }]}>Retour</Text>
          </Pressable>
        ) : (
          <View style={styles.backSpacer} />
        )}

        {!isLast ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Étape suivante"
            onPress={() => {
              if (next) goTo(next.route);
            }}
            style={({ pressed }) => [
              styles.cta,
              { backgroundColor: c.accent },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.ctaLabel, { color: c.onAccent }]}>Continuer</Text>
            <Ionicons name="arrow-forward" size={18} color={c.onAccent} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderTopWidth: 1,
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 52,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  backBtnGrow: { flex: 1, justifyContent: 'center' },
  backSpacer: { width: 0 },
  backLabel: { fontFamily: fontFamilies.sansSemiBold, fontSize: 14 },
  cta: {
    flex: 1,
    minHeight: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...shadows.sm,
  },
  ctaLabel: { fontFamily: fontFamilies.sansSemiBold, fontSize: 15 },
  pressed: { opacity: 0.85 },
});
