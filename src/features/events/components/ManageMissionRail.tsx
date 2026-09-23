/**
 * Progression orga compacte — une ligne, pas 3 cartes qui concurrencent les onglets.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { fontFamilies, spacing, type AppTheme } from '@/constants/theme';

export type ManageMissionId = 'guests' | 'share' | 'entrance';

export type ManageMission = {
  id: ManageMissionId;
  label: string;
  done: boolean;
  soft?: boolean;
};

export interface ManageMissionRailProps {
  missions: ManageMission[];
  theme: AppTheme;
  onSelect: (id: ManageMissionId) => void;
}

export function ManageMissionRail({ missions, theme, onSelect }: ManageMissionRailProps) {
  const c = theme.colors;
  const doneCount = missions.filter((m) => m.done).length;
  const next = missions.find((m) => !m.done) ?? null;

  if (doneCount >= missions.length) {
    return (
      <View style={[styles.strip, { borderBottomColor: c.border }]}>
        <Ionicons name="checkmark-circle" size={16} color={c.accent} />
        <Text style={[styles.stripText, { color: c.textSecondary }]}>
          Organisation prête — basculez sur Check-in le jour J
        </Text>
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={next ? `Prochaine étape : ${next.label}` : 'Progression organisation'}
      onPress={() => next && onSelect(next.id)}
      style={[styles.strip, { borderBottomColor: c.border, backgroundColor: c.surface }]}
    >
      <Text style={[styles.progress, { color: c.accent }]}>
        {doneCount}/{missions.length}
      </Text>
      <View style={styles.stripCopy}>
        <Text style={[styles.stripLabel, { color: c.textPrimary }]} numberOfLines={1}>
          {next ? `Ensuite : ${next.label}` : 'Organisation'}
        </Text>
        <View style={styles.dots}>
          {missions.map((m) => (
            <View
              key={m.id}
              style={[
                styles.dot,
                {
                  backgroundColor: m.done ? c.accent : c.border,
                },
              ]}
            />
          ))}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={c.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  progress: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 13,
    minWidth: 28,
  },
  stripCopy: { flex: 1, minWidth: 0, gap: 5 },
  stripLabel: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 13,
  },
  stripText: {
    flex: 1,
    fontFamily: fontFamilies.sans,
    fontSize: 12.5,
    lineHeight: 17,
  },
  dots: { flexDirection: 'row', gap: 5 },
  dot: { width: 7, height: 7, borderRadius: 4 },
});
