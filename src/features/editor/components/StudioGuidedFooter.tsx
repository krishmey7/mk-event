/**
 * Pied sticky du studio en mode guidé — Retour / Continuer.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';

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
  const router = useRouter();
  const { template } = useEditor();
  const { type: activeType } = useActiveEvent();
  const eventType = template.category || activeType;
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

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isLast ? 'Voir l’aperçu' : 'Étape suivante'}
          onPress={() => {
            if (next) {
              goTo(next.route);
              return;
            }
            router.push('/editor/previsualisation');
          }}
          style={({ pressed }) => [
            styles.cta,
            { backgroundColor: c.accent },
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.ctaLabel, { color: c.onAccent }]}>
            {isLast ? 'Aperçu & publier' : 'Continuer'}
          </Text>
          <Ionicons
            name={isLast ? 'eye-outline' : 'arrow-forward'}
            size={18}
            color={c.onAccent}
          />
        </Pressable>
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
