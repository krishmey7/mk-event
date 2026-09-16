/**
 * MK EVENT — Studio d'édition · champ à compteur de caractères.
 */

import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useEditor } from '../EditorContext';

export function FieldWithCounter({ label, value, maxLength, children }: {
  label: string;
  value: string;
  maxLength: number;
  children: ReactNode;
}) {
  const { theme } = useEditor();
  const c = theme.colors;

  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: c.textMuted }]}>{label}</Text>
        <Text style={[styles.counter, { color: c.textMuted }]}>
          {value.length}/{maxLength}
        </Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontFamily: 'Inter_500Medium', fontSize: 12.5 },
  counter: { fontFamily: 'Inter_400Regular', fontSize: 11.5 },
});
