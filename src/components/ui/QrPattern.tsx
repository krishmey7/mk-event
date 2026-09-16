/**
 * MK EVENT — UI / QrPattern · rendu d'un motif QR déterministe.
 * Utilisé par la gestion des invités et le pass invité.
 * Le QR final scannable est généré côté serveur (règle zéro
 * dépendance locale — simple grille de vues).
 */

import { useMemo } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { qrCells } from '@/features/invitation/qr';

export function QrPattern({ seed, size = 21, cell = 8, dark = '#121318', light = '#FFFFFF', style }: {
  seed: string;
  /** Nombre de modules par côté. */
  size?: number;
  /** Taille d'un module en px. */
  cell?: number;
  dark?: string;
  light?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const cells = useMemo(() => qrCells(seed, size), [seed, size]);

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel="Code QR"
      style={[styles.grid, { width: size * cell, height: size * cell, backgroundColor: light }, style]}
    >
      {cells.map((isDark, index) => (
        <View
          key={index}
          style={{ width: cell, height: cell, backgroundColor: isDark ? dark : light }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
});