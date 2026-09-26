/**
 * Bloc de studio — grisé et inactif quand le modèle ne l’utilise pas.
 */

import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { fontFamilies } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemePreferenceContext';

export function StudioField({
  enabled,
  note = 'Non utilisé sur ce modèle',
  children,
}: {
  enabled: boolean;
  note?: string;
  children: ReactNode;
}) {
  const { theme } = useAppTheme();

  if (enabled) return <>{children}</>;

  return (
    <View pointerEvents="none" style={styles.off}>
      {children}
      <Text style={[styles.note, { color: theme.colors.textMuted }]}>{note}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  off: { opacity: 0.38 },
  note: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
    marginBottom: 8,
  },
});
