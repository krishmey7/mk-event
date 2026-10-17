/**
 * Confirmation en bottom sheet — alternative à window.confirm / Alert.
 */

import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fontFamilies, radii, shadows, spacing } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemePreferenceContext';

export function ConfirmSheet({
  visible,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const c = theme.colors;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onCancel} accessibilityRole="button" />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: c.surface,
              paddingBottom: Math.max(insets.bottom, spacing.md),
            },
            shadows.lg,
          ]}
        >
          <View style={[styles.handle, { backgroundColor: c.border }]} />
          <Text style={[styles.title, { color: c.textPrimary }]}>{title}</Text>
          <Text style={[styles.message, { color: c.textMuted }]}>{message}</Text>
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={onCancel}
              style={({ pressed }) => [
                styles.btn,
                styles.btnGhost,
                { borderColor: c.border },
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.btnGhostLabel, { color: c.textSecondary }]}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.btn,
                { backgroundColor: c.accent },
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.btnLabel, { color: c.onAccent }]}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 12, 16, 0.45)',
  },
  sheet: {
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: 10,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 14,
  },
  title: {
    fontFamily: fontFamilies.serifSemiBold,
    fontSize: 22,
    lineHeight: 28,
    marginBottom: 8,
  },
  message: {
    fontFamily: fontFamilies.sans,
    fontSize: 14.5,
    lineHeight: 21,
    marginBottom: spacing.lg,
  },
  actions: { flexDirection: 'row', gap: 10 },
  btn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnGhost: { borderWidth: 1.5, backgroundColor: 'transparent' },
  btnLabel: { fontFamily: fontFamilies.sansSemiBold, fontSize: 14.5 },
  btnGhostLabel: { fontFamily: fontFamilies.sansSemiBold, fontSize: 14.5 },
  pressed: { opacity: 0.86 },
});
