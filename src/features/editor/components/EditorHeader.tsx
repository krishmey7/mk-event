/**
 * Header du studio — chrome app (coral), pas les couleurs invitation.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { fontFamilies } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemePreferenceContext';
import { rememberEditorTemplate, rememberEditorTheme } from '../navigation';
import { useEditor } from '../EditorContext';

export function EditorHeader({
  title,
  onBack,
  leftLabel = 'Retour',
  showPreview = true,
  stepMeta,
}: {
  title: string;
  onBack: () => void;
  leftLabel?: string;
  showPreview?: boolean;
  /** Ex. « Étape 2 sur 5 » — affiché sous le titre. */
  stepMeta?: string | null;
}) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { dirty, boundEventId, template, cover } = useEditor();
  const { theme } = useAppTheme();
  const c = theme.colors;
  const status = !boundEventId
    ? 'Pas encore enregistré'
    : dirty
      ? 'Modifications non enregistrées'
      : 'Enregistré dans Mes événements';

  const openPreview = () => {
    rememberEditorTemplate(template.key);
    rememberEditorTheme(cover.themeKey);
    router.push({
      pathname: '/editor/previsualisation',
      params: {
        template: template.key,
        theme: cover.themeKey,
        ...(boundEventId ? { event: boundEventId } : {}),
      },
    });
  };

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: insets.top + 6,
          backgroundColor: c.surface,
          borderBottomColor: c.border,
        },
      ]}
    >
      <Pressable accessibilityRole="button" onPress={onBack} hitSlop={6} style={styles.left}>
        <Ionicons name="chevron-back" size={19} color={c.textPrimary} />
        <Text style={[styles.leftLabel, { color: c.textPrimary }]}>{leftLabel}</Text>
      </Pressable>

      <View style={styles.center}>
        <Text numberOfLines={1} style={[styles.title, { color: c.textPrimary }]}>
          {title}
        </Text>
        {stepMeta ? (
          <Text style={[styles.saved, { color: c.textMuted }]}>{stepMeta}</Text>
        ) : (
          <Text style={[styles.saved, { color: c.textMuted }]}>{status}</Text>
        )}
      </View>

      {showPreview ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voir l'invitation comme un invité"
          onPress={openPreview}
          style={({ pressed }) => [
            styles.pill,
            { backgroundColor: c.surfaceElevated, borderColor: c.border },
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="eye-outline" size={14} color={c.textPrimary} />
          <Text style={[styles.pillLabel, { color: c.textPrimary }]}>Voir</Text>
        </Pressable>
      ) : (
        <View style={styles.rightSpacer} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  left: { flexDirection: 'row', alignItems: 'center', minWidth: 72, gap: 2 },
  leftLabel: { fontFamily: fontFamilies.sansMedium, fontSize: 13.5 },
  center: { flex: 1, alignItems: 'center' },
  title: { fontFamily: fontFamilies.sansSemiBold, fontSize: 14.5 },
  saved: {
    fontFamily: fontFamilies.sans,
    fontSize: 10,
    marginTop: 1,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 64,
    borderWidth: 1,
  },
  pillLabel: { fontFamily: fontFamilies.sansSemiBold, fontSize: 12.5 },
  rightSpacer: { minWidth: 64 },
  pressed: { opacity: 0.75 },
});
