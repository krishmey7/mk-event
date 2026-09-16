/**
 * ──────────────────────────────────────────────────────────────
 *  MK EVENT — UI / Badge
 * ──────────────────────────────────────────────────────────────
 *  Pastille RSVP : Confirmé (sauge), En attente (ocre),
 *  Peut-être (ardoise), Refusé (terre cuite).
 *  Teintes lisibles par mode via `rsvpBadgeColors`, point plein
 *  optionnel via `rsvpStatusColors` (charte sémantique stricte).
 * ──────────────────────────────────────────────────────────────
 */

import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import {
  fontFamilies,
  radii,
  rsvpBadgeColors,
  rsvpStatusColors,
  type ThemeMode,
} from '@/constants/theme';
import { RSVP_STATUS_LABELS, type RsvpStatus } from '@/types';

export interface BadgeProps {
  status: RsvpStatus;
  /** Libellé personnalisé (défaut : libellé français du statut). */
  label?: string;
  /** Mode du thème pour la lisibilité des teintes (défaut : 'light' — dashboard). */
  mode?: ThemeMode;
  /** Point coloré plein devant le libellé. */
  showDot?: boolean;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
}

export function Badge({
  status,
  label,
  mode = 'light',
  showDot = false,
  size = 'md',
  style,
}: BadgeProps) {
  const palette = rsvpBadgeColors[mode][status];
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.base,
        isSmall ? styles.small : styles.medium,
        { backgroundColor: palette.background, borderColor: palette.border },
        style,
      ]}
    >
      {showDot ? <View style={[styles.dot, { backgroundColor: rsvpStatusColors[status] }]} /> : null}
      <Text style={[styles.label, isSmall ? styles.labelSmall : styles.labelMedium, { color: palette.text }]}>
        {label ?? RSVP_STATUS_LABELS[status]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radii.full,
    borderWidth: 1,
    gap: 6,
  },
  small: { paddingHorizontal: 9, paddingVertical: 3 },
  medium: { paddingHorizontal: 12, paddingVertical: 5 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  label: { fontFamily: fontFamilies.sansSemiBold, letterSpacing: 0.2 },
  labelSmall: { fontSize: 11, lineHeight: 14 },
  labelMedium: { fontSize: 12, lineHeight: 16 },
});
