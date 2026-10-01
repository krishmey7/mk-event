/**
 * Carte du Bento Grid — suit le thème app (clair / sombre).
 */

import { type ComponentProps } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '@/context/ThemePreferenceContext';
import { brandColors, radii, spacing } from '@/constants/theme';

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

export interface BentoCardProps {
  icon: IoniconsName;
  title: string;
  description: string;
  style?: StyleProp<ViewStyle>;
}

export function BentoCard({ icon, title, description, style }: BentoCardProps) {
  const { theme } = useAppTheme();
  const c = theme.colors;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: c.surface,
          borderColor: c.border,
        },
        style,
      ]}
    >
      <View style={[styles.iconShell, { backgroundColor: c.accentMuted }]}>
        <Ionicons name={icon} size={22} color={brandColors.coralDeep} />
      </View>
      <Text style={[theme.typography.title, styles.title, { color: c.textPrimary }]}>
        {title}
      </Text>
      <Text style={[theme.typography.bodySmall, styles.description, { color: c.textSecondary }]}>
        {description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  iconShell: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { marginTop: 2 },
  description: { lineHeight: 19 },
});
