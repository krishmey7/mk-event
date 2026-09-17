/**
 * ──────────────────────────────────────────────────────────────
 *  MK EVENT — LANDING / BentoCard
 * ──────────────────────────────────────────────────────────────
 *  Carte du « Bento Grid » de la landing (univers Dark Luxury) :
 *  icône or dans une pastille teintée, titre et description.
 *  Largeur pilotée par le parent (flex: 1 dans sa rangée de grille).
 * ──────────────────────────────────────────────────────────────
 */

import { type ComponentProps } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { brandColors, darkTheme, radii, spacing } from '@/constants/theme';

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

export interface BentoCardProps {
  icon: IoniconsName;
  title: string;
  description: string;
  style?: StyleProp<ViewStyle>;
}

export function BentoCard({ icon, title, description, style }: BentoCardProps) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.iconShell}>
        <Ionicons name={icon} size={22} color={brandColors.coralDeep} />
      </View>
      <Text style={[darkTheme.typography.title, styles.title]}>{title}</Text>
      <Text style={[darkTheme.typography.bodySmall, styles.description]}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: darkTheme.colors.surface,
    borderWidth: 1,
    borderColor: darkTheme.colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  iconShell: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: darkTheme.colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: darkTheme.colors.textPrimary, marginTop: 2 },
  description: { color: darkTheme.colors.textSecondary, lineHeight: 19 },
});
