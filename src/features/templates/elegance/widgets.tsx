/**
 * MK EVENT — Modèle « Élégance » · briques UI thématisées partagées.
 * Règles : zéro Text hors <Text />, ombres via `shadows.*`.
 */

import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { IconName } from './data';
import type { TemplateTheme } from './themes';

export { Ionicons };
export type { IconName };

/* En-tête de section : kicker espacé + titre serif + sous-titre italique. */
export function SectionHeader({ kicker, title, subtitle, theme }: {
  kicker?: string; title: string; subtitle?: string; theme: TemplateTheme;
}) {
  return (
    <View style={styles.section}>
      {kicker ? (
        <Text style={[styles.kicker, { color: theme.colors.primary, paddingLeft: 3.2 }]}>{kicker}</Text>
      ) : null}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.sectionSubtitle, { color: theme.colors.textMuted }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

/* Bouton pilule — plein (bronze/or) ou contour. */
export function PillButton({ label, onPress, theme, variant = 'solid', disabled = false, icon, style }: {
  label: string; onPress: () => void; theme: TemplateTheme;
  variant?: 'solid' | 'outline'; disabled?: boolean; icon?: IconName; style?: StyleProp<ViewStyle>;
}) {
  const solid = variant === 'solid';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.pill, {
        backgroundColor: solid ? theme.colors.primary : 'transparent',
        borderColor: solid ? 'transparent' : theme.colors.border,
        borderWidth: solid ? 0 : 1.4,
        opacity: disabled ? 0.55 : pressed ? 0.85 : 1,
      }, style]}>
      {icon ? <Ionicons name={icon} size={17} color={solid ? theme.colors.onPrimary : theme.colors.text} /> : null}
      <Text style={[styles.pillLabel, { color: solid ? theme.colors.onPrimary : theme.colors.text }]}>{label}</Text>
    </Pressable>
  );
}

/* Pilule de filtre (galerie) — active = fond texte, texte inversé. */
export function FilterPill({ label, active, onPress, theme }: {
  label: string; active: boolean; onPress: () => void; theme: TemplateTheme;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.filterPill, {
      backgroundColor: active ? theme.colors.text : 'transparent',
      borderColor: theme.colors.border,
    }]}>
      <Text style={[styles.filterLabel, { color: active ? theme.colors.bg : theme.colors.textMuted }]}>{label}</Text>
    </Pressable>
  );
}

/* Champ étiqueté. */
export function LabeledField({ label, theme, children }: {
  label: string; theme: TemplateTheme; children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>{label}</Text>
      {children}
    </View>
  );
}

/* Input / TextArea thématisé. */
export function ThemedInput({ theme, style, ...props }: TextInputProps & { theme: TemplateTheme }) {
  return (
    <TextInput
      placeholderTextColor={theme.colors.textMuted}
      {...props}
      style={[styles.input, {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        color: theme.colors.text,
      }, style]}
    />
  );
}

/* Stepper « − 1 + » (nombre d'invités). */
export function Stepper({ value, onChange, min = 1, max = 10, theme }: {
  value: number; onChange: (next: number) => void; min?: number; max?: number; theme: TemplateTheme;
}) {
  return (
    <View style={[styles.inputRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Ionicons name="people-outline" size={17} color={theme.colors.textMuted} />
      <View style={styles.stepperRight}>
        <Pressable accessibilityRole="button" onPress={() => onChange(Math.max(min, value - 1))} style={styles.stepBtn}>
          <Ionicons name="remove" size={18} color={theme.colors.text} />
        </Pressable>
        <Text style={[styles.stepValue, { color: theme.colors.text }]}>{value}</Text>
        <Pressable accessibilityRole="button" onPress={() => onChange(Math.min(max, value + 1))} style={styles.stepBtn}>
          <Ionicons name="add" size={18} color={theme.colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

/* Pastille ronde à icône (timeline programme). */
export function IconBubble({ name, theme, size = 40 }: { name: IconName; theme: TemplateTheme; size?: number }) {
  return (
    <View style={[styles.bubble, { width: size, height: size, borderRadius: size / 2, backgroundColor: theme.colors.chip }]}>
      <Ionicons name={name} size={size * 0.44} color={theme.colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { alignItems: 'center', gap: 6, marginBottom: 22 },
  kicker: { fontFamily: 'Inter_600SemiBold', fontSize: 11, letterSpacing: 3.2, textTransform: 'uppercase' },
  sectionTitle: { fontFamily: 'Fraunces_500Medium', fontSize: 26, lineHeight: 33, textAlign: 'center' },
  sectionSubtitle: { fontFamily: 'Fraunces_400Regular_Italic', fontSize: 14, lineHeight: 20, textAlign: 'center' },
  pill: {
    minHeight: 50, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', gap: 8, paddingHorizontal: 22,
  },
  pillLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14, letterSpacing: 0.2 },
  filterPill: {
    minHeight: 34, paddingHorizontal: 16, borderRadius: 999, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  filterLabel: { fontFamily: 'Inter_500Medium', fontSize: 12.5 },
  field: { gap: 8 },
  fieldLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  input: {
    minHeight: 48, borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12,
    fontFamily: 'Inter_400Regular', fontSize: 14,
  },
  inputRow: {
    minHeight: 48, borderRadius: 14, borderWidth: 1, flexDirection: 'row',
    alignItems: 'center', paddingHorizontal: 14, gap: 10,
  },
  stepperRight: { flexDirection: 'row', alignItems: 'center', marginLeft: 'auto' },
  stepBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  stepValue: { fontFamily: 'Inter_600SemiBold', fontSize: 15, minWidth: 30, textAlign: 'center' },
  bubble: { alignItems: 'center', justifyContent: 'center' },
});


