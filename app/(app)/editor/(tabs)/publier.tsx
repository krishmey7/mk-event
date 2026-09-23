/**
 * Étape Publier — aperçu + CTA publication.
 */

import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { EditorCoverPreview } from '@/features/editor/components/EditorCoverPreview';
import { EditorHint } from '@/features/editor/components/EditorHint';
import { SaveToLibraryCard } from '@/features/editor/components/SaveToLibraryCard';
import { useEditor } from '@/features/editor/EditorContext';
import { studioStepHint } from '@/features/editor/studioSteps';
import { useActiveEvent } from '@/context/ActiveEventContext';
import { useAppTheme } from '@/context/ThemePreferenceContext';
import { fontFamilies, spacing } from '@/constants/theme';

export default function PublierTabScreen() {
  const { cover, template } = useEditor();
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

      <View style={styles.previewWrap}>
        <EditorCoverPreview embedded />
      </View>

      <Text style={[styles.meta, { color: c.textSecondary }]}>
        {cover.couple || cover.title || 'Sans titre'}
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
    marginBottom: spacing.sm,
  },
  meta: {
    fontFamily: fontFamilies.sans,
    fontSize: 13,
    marginBottom: spacing.md,
  },
});
