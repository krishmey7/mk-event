/**
 * Coquille bottom sheet du studio — Modal transparent + poignée.
 * `embedded` : rendu sans Modal (route `transparentModal`).
 */

import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fontFamilies, radii, spacing } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemePreferenceContext';

export function StudioBottomSheet({
  visible,
  title,
  subtitle,
  onClose,
  children,
  maxHeight = '88%',
  embedded = false,
}: {
  visible: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  maxHeight?: `${number}%` | number;
  /** true = déjà présenté via Stack transparentModal (pas de Modal RN). */
  embedded?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const c = theme.colors;

  if (!visible && !embedded) return null;

  const sheet = (
    <View style={styles.modalRoot}>
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Fermer"
      />
      <View
        style={[
          styles.sheet,
          {
            backgroundColor: c.surface,
            paddingBottom: Math.max(insets.bottom, 16),
            maxHeight,
          },
        ]}
      >
        <View style={[styles.handle, { backgroundColor: c.border }]} />
        <View style={styles.header}>
          <Text style={[styles.title, { color: c.textPrimary }]}>{title}</Text>
          <Pressable accessibilityRole="button" onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={22} color={c.textMuted} />
          </Pressable>
        </View>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: c.textMuted }]}>{subtitle}</Text>
        ) : null}
        <View style={styles.body}>{children}</View>
      </View>
    </View>
  );

  if (embedded) {
    return <View style={styles.embeddedRoot}>{sheet}</View>;
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {sheet}
    </Modal>
  );
}

const styles = StyleSheet.create({
  embeddedRoot: { flex: 1 },
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
  title: { fontFamily: fontFamilies.serifSemiBold, fontSize: 22, flex: 1, paddingRight: 12 },
  subtitle: {
    fontFamily: fontFamilies.sans,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  body: { flexGrow: 1, flexShrink: 1 },
});
