/**
 * Sheet — liste de toutes les étapes du parcours guidé.
 */

import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fontFamilies, radii, spacing } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemePreferenceContext';
import type { StudioStepDef } from '../studioSteps';

export function StudioStepsSheet({
  visible,
  steps,
  currentRoute,
  onClose,
  onSelect,
}: {
  visible: boolean;
  steps: StudioStepDef[];
  currentRoute: string;
  onClose: () => void;
  onSelect: (route: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const c = theme.colors;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: c.surface,
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: c.border }]} />
          <View style={styles.header}>
            <Text style={[styles.title, { color: c.textPrimary }]}>Toutes les étapes</Text>
            <Pressable accessibilityRole="button" onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color={c.textMuted} />
            </Pressable>
          </View>
          <Text style={[styles.subtitle, { color: c.textMuted }]}>
            Sautez où vous voulez — rien n’est verrouillé.
          </Text>

          <View style={styles.list}>
            {steps.map((step, index) => {
              const on = step.route === currentRoute;
              return (
                <Pressable
                  key={step.route}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  onPress={() => {
                    onSelect(step.route);
                    onClose();
                  }}
                  style={({ pressed }) => [
                    styles.row,
                    {
                      borderColor: on ? c.accent : c.border,
                      backgroundColor: on ? c.accentMuted : c.surfaceElevated,
                    },
                    pressed && styles.pressed,
                  ]}
                >
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: on ? c.accent : c.surface,
                        borderColor: on ? c.accent : c.border,
                      },
                    ]}
                  >
                    <Text style={[styles.badgeText, { color: on ? c.onAccent : c.textMuted }]}>
                      {index + 1}
                    </Text>
                  </View>
                  <View style={styles.rowText}>
                    <Text style={[styles.rowTitle, { color: c.textPrimary }]}>{step.title}</Text>
                    <Text style={[styles.rowHint, { color: c.textMuted }]} numberOfLines={2}>
                      {step.hint}
                    </Text>
                  </View>
                  {on ? (
                    <Ionicons name="checkmark-circle" size={22} color={c.accent} />
                  ) : (
                    <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 12, 16, 0.45)',
  },
  sheet: {
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: 8,
    maxHeight: '86%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: { fontFamily: fontFamilies.serifSemiBold, fontSize: 22 },
  subtitle: {
    fontFamily: fontFamilies.sans,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  list: { gap: 10, paddingBottom: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: radii.md,
    borderWidth: 1.5,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontFamily: fontFamilies.sansSemiBold, fontSize: 12 },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { fontFamily: fontFamilies.sansSemiBold, fontSize: 15 },
  rowHint: { fontFamily: fontFamilies.sans, fontSize: 12, lineHeight: 16 },
  pressed: { opacity: 0.85 },
});
