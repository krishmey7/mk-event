/**
 * Ornements anniversaire (Iconify) — pastille compacte pour chrome studio.
 */

import { View, StyleSheet } from 'react-native';

import { IconifyIcon } from '@/components/ui/IconifyIcon';

export function BirthdayOrnaments({
  gold,
  compact,
}: {
  gold: string;
  compact?: boolean;
}) {
  const size = compact ? 16 : 22;
  return (
    <View style={styles.row}>
      <IconifyIcon icon="ph:gift-light" size={size} color={gold} />
      <IconifyIcon icon="mdi:star-outline" size={size - 2} color={gold} />
      <IconifyIcon icon="noto:balloon" size={size + 4} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' },
});
