/**
 * MK EVENTS — Modèle « Élégance » · menu déroulant thématisé
 * (« Choix du menu » — Vue 5). Modal maison, zéro dépendance.
 */

import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { shadows } from '@/constants/theme';
import type { TemplateTheme } from './themes';

export function SelectField({ value, placeholder, options, onSelect, theme }: {
  value: string | null;
  placeholder: string;
  options: string[];
  onSelect: (option: string) => void;
  theme: TemplateTheme;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        onPress={() => setOpen(true)}
        style={[styles.row, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
      >
        <Text
          numberOfLines={1}
          style={[styles.value, { color: value === null ? theme.colors.textMuted : theme.colors.text }]}
        >
          {value ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={16} color={theme.colors.textMuted} />
      </Pressable>

      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, shadows.lg]}>
            {options.map((option) => (
              <Pressable
                key={option}
                accessibilityRole="menuitem"
                onPress={() => { onSelect(option); setOpen(false); }}
                style={({ pressed }) => [styles.item, pressed && { opacity: 0.6 }]}
              >
                <Text style={[styles.itemLabel, { color: theme.colors.text }]}>{option}</Text>
                {value === option ? <Ionicons name="checkmark" size={17} color={theme.colors.primary} /> : null}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 48, borderRadius: 14, borderWidth: 1, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, gap: 10,
  },
  value: { fontFamily: 'Inter_400Regular', fontSize: 14, flex: 1 },
  backdrop: {
    flex: 1, backgroundColor: 'rgba(10, 10, 14, 0.45)',
    alignItems: 'center', justifyContent: 'center', padding: 28,
  },
  card: { width: '100%', maxWidth: 320, borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  item: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 13,
  },
  itemLabel: { fontFamily: 'Inter_400Regular', fontSize: 14 },
});
