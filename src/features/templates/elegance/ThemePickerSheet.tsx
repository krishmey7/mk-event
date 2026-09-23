/**
 * MK EVENTS — Modèle « Élégance » · VUE 8 — Sélecteur de thème.
 * Feuille basse : 6 pastilles rondes (Champagne par défaut, Rose
 * poudré, Vert sauge, Bleu marine, Bordeaux, Noir élégant),
 * légende de la sélection + bouton « Appliquer ». Le thème actif
 * est appliqué en direct sur toutes les vues.
 */

import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { shadows } from '@/constants/theme';
import { PillButton } from './widgets';
import { TEMPLATE_THEMES, TEMPLATE_THEME_ORDER, type TemplateTheme, type TemplateThemeKey } from './themes';

export function ThemePickerSheet({ visible, onClose, value, onChange, theme }: {
  visible: boolean;
  onClose: () => void;
  value: TemplateThemeKey;
  onChange: (key: TemplateThemeKey) => void;
  /** Thème courant — pour habiller la feuille elle-même. */
  theme: TemplateTheme;
}) {
  const insets = useSafeAreaInsets();
  const selected = TEMPLATE_THEMES[value];

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.touchCatch} onPress={onClose} accessibilityLabel="Fermer" />
        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, paddingBottom: insets.bottom + 16 }, shadows.lg]}>
          <View style={[styles.grabber, { backgroundColor: theme.colors.border }]} />
          <Pressable accessibilityRole="button" onPress={onClose} hitSlop={8} style={styles.close}>
            <Ionicons name="close" size={18} color={theme.colors.textMuted} />
          </Pressable>

          <Text style={[styles.title, { color: theme.colors.text }]}>
            Choisissez la couleur de votre thème
          </Text>

          <View style={styles.swatches}>
            {TEMPLATE_THEME_ORDER.map((key) => {
              const item = TEMPLATE_THEMES[key];
              const isActive = key === value;
              return (
                <Pressable
                  key={key}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                  accessibilityState={{ selected: isActive }}
                  onPress={() => onChange(key)}
                  style={[styles.swatchRing, isActive && { borderColor: theme.colors.primary }]}
                >
                  <View style={[styles.swatch, { backgroundColor: item.swatch, borderColor: theme.colors.border }]}>
                    {isActive ? <Ionicons name="checkmark" size={14} color={item.isDark ? '#F5F1E8' : '#33291B'} /> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.caption, { color: theme.colors.textMuted }]}>
            {selected.label}
            {value === 'champagne' ? ' (par défaut)' : ''}
          </Text>

          <PillButton label="Appliquer" onPress={onClose} theme={theme} style={styles.apply} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(8, 8, 12, 0.5)', justifyContent: 'flex-end' },
  touchCatch: { flex: 1 },
  card: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1,
    paddingTop: 8, paddingHorizontal: 20, alignItems: 'center',
  },
  grabber: { alignSelf: 'center', width: 42, height: 4, borderRadius: 2, marginBottom: 12 },
  close: { position: 'absolute', top: 14, right: 14, width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  title: {
    fontFamily: 'Fraunces_500Medium', fontSize: 17, lineHeight: 23,
    textAlign: 'center', marginBottom: 16, maxWidth: 260,
  },
  swatches: { flexDirection: 'row', gap: 12 },
  swatchRing: {
    width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: 'transparent',
    alignItems: 'center', justifyContent: 'center',
  },
  swatch: {
    width: 34, height: 34, borderRadius: 17, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  caption: { fontFamily: 'Inter_500Medium', fontSize: 12.5, marginTop: 12 },
  apply: { alignSelf: 'stretch', marginTop: 14 },
});
