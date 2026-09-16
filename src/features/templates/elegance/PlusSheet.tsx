/**
 * MK EVENT — Modèle « Élégance » · feuille « Plus » (onglet ⋯).
 * Raccourcis vers les vues secondaires + sélecteur de thème
 * + sortie de l'aperçu.
 */

import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { shadows } from '@/constants/theme';
import type { IconName } from './data';
import type { TemplateTheme, TemplateViewKey } from './themes';

interface PlusRow {
  icon: IconName;
  label: string;
  action: 'compteur' | 'galerie' | 'livredor' | 'theme' | 'exit';
}

const ROWS: PlusRow[] = [
  { icon: 'time-outline', label: 'Compteur à rebours', action: 'compteur' },
  { icon: 'images-outline', label: 'Galerie photos', action: 'galerie' },
  { icon: 'chatbubble-ellipses-outline', label: "Livre d'or", action: 'livredor' },
  { icon: 'color-palette-outline', label: 'Changer le thème', action: 'theme' },
  { icon: 'close-outline', label: "Quitter l'aperçu", action: 'exit' },
];

export function PlusSheet({ visible, onClose, theme, onGo, onTheme, onExit }: {
  visible: boolean;
  onClose: () => void;
  theme: TemplateTheme;
  onGo: (view: TemplateViewKey) => void;
  onTheme: () => void;
  onExit: () => void;
}) {
  const insets = useSafeAreaInsets();

  const handle = (action: PlusRow['action']) => {
    onClose();
    if (action === 'theme') onTheme();
    else if (action === 'exit') onExit();
    else onGo(action);
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, paddingBottom: insets.bottom + 14 }, shadows.lg]}>
          <View style={[styles.grabber, { backgroundColor: theme.colors.border }]} />
          <Text style={[styles.title, { color: theme.colors.text }]}>{"Plus d\u2019options"}</Text>
          {ROWS.map((row) => (
            <Pressable
              key={row.action}
              accessibilityRole="button"
              onPress={() => handle(row.action)}
              style={({ pressed }) => [
                styles.row,
                pressed && { backgroundColor: theme.colors.surfaceAlt },
              ]}
            >
              <View style={[styles.rowIcon, { backgroundColor: theme.colors.chip }]}>
                <Ionicons name={row.icon} size={17} color={theme.colors.primary} />
              </View>
              <Text style={[styles.rowLabel, { color: theme.colors.text }]}>{row.label}</Text>
              <Ionicons name="chevron-forward" size={15} color={theme.colors.textMuted} />
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(8, 8, 12, 0.5)', justifyContent: 'flex-end' },
  card: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1,
    paddingTop: 8, paddingHorizontal: 18,
  },
  grabber: { alignSelf: 'center', width: 42, height: 4, borderRadius: 2, marginBottom: 10 },
  title: { fontFamily: 'Fraunces_500Medium', fontSize: 17, textAlign: 'center', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, borderRadius: 12 },
  rowIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontFamily: 'Inter_500Medium', fontSize: 14.5, flex: 1 },
});
