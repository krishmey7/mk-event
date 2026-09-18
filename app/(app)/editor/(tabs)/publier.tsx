/**
 * Étape Publier — aperçu + enregistrement Mes invitations.
 */

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { EditorCoverPreview } from '@/features/editor/components/EditorCoverPreview';
import { EditorHint } from '@/features/editor/components/EditorHint';
import { SaveToLibraryCard } from '@/features/editor/components/SaveToLibraryCard';
import { useEditor } from '@/features/editor/EditorContext';
import { studioStepHint } from '@/features/editor/studioSteps';
import { useActiveEvent } from '@/context/ActiveEventContext';
import { useAppTheme } from '@/context/ThemePreferenceContext';
import { fontFamilies, spacing } from '@/constants/theme';

export default function PublierTabScreen() {
  const router = useRouter();
  const { guests, cover, template } = useEditor();
  const { type: activeType } = useActiveEvent();
  const eventType = activeType || template.category;
  const { theme } = useAppTheme();
  const c = theme.colors;
  const hint = studioStepHint('publier', eventType);

  return (
    <ScrollView
      style={{ backgroundColor: c.background }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {hint ? <EditorHint>{hint}</EditorHint> : null}

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/editor/previsualisation')}
        style={({ pressed }) => [styles.previewWrap, pressed && styles.pressed]}
      >
        <EditorCoverPreview embedded />
        <View style={styles.previewCta}>
          <Ionicons name="eye-outline" size={16} color="#F6F1E8" />
          <Text style={styles.previewCtaLabel}>Voir comme un invité</Text>
        </View>
      </Pressable>

      <Text style={[styles.meta, { color: c.textSecondary }]}>
        {cover.couple || 'Sans titre'} · {guests.length} invité{guests.length > 1 ? 's' : ''}
      </Text>

      <SaveToLibraryCard />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: 40 },
  previewWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    height: 320,
    marginBottom: spacing.md,
  },
  previewCta: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(15,18,22,0.72)',
  },
  previewCtaLabel: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 13,
    color: '#F6F1E8',
  },
  meta: {
    fontFamily: fontFamilies.sans,
    fontSize: 13,
    marginBottom: spacing.md,
  },
  pressed: { opacity: 0.9 },
});
