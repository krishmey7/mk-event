/**
 * Rail de progression du studio en mode guidé.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fontFamilies } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemePreferenceContext';

export function StudioProgressRail({
  stepIndex,
  stepCount,
  onOpenSteps,
}: {
  stepIndex: number;
  stepCount: number;
  onOpenSteps: () => void;
}) {
  const { theme } = useAppTheme();
  const c = theme.colors;
  const safeIndex = Math.max(0, stepIndex);
  const progress = stepCount > 0 ? ((safeIndex + 1) / stepCount) * 100 : 0;

  return (
    <View style={[styles.wrap, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
      <View style={[styles.track, { backgroundColor: c.surfaceElevated }]}>
        <View style={[styles.fill, { width: `${progress}%`, backgroundColor: c.accent }]} />
      </View>
      <View style={styles.row}>
        <Text style={[styles.meta, { color: c.textMuted }]}>
          Étape {safeIndex + 1} sur {stepCount}
        </Text>
        <Pressable accessibilityRole="button" onPress={onOpenSteps} hitSlop={8}>
          <Text style={[styles.link, { color: c.accent }]}>Toutes les étapes</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  track: {
    height: 3,
    borderRadius: 99,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 99 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  meta: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 12,
  },
  link: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 12,
  },
});
