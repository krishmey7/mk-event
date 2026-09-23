/**
 * Onglet RSVP — choix proposés aux invités (mariage / anniversaire).
 */

import { ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EditorHint } from '@/features/editor/components/EditorHint';
import { RsvpEditorPanel } from '@/features/editor/components/RsvpEditorPanel';
import { useEditor } from '@/features/editor/EditorContext';
import { studioStepHint } from '@/features/editor/studioSteps';
import { useActiveEvent } from '@/context/ActiveEventContext';
import { useAppTheme } from '@/context/ThemePreferenceContext';
import { fontFamilies, spacing } from '@/constants/theme';

export default function PlusTabScreen() {
  const insets = useSafeAreaInsets();
  const { template } = useEditor();
  const { type: activeType } = useActiveEvent();
  const eventType = activeType || template.category;
  const { theme } = useAppTheme();
  const c = theme.colors;
  const hint = studioStepHint('plus', eventType);

  return (
    <ScrollView
      style={{ backgroundColor: c.background }}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: c.textPrimary }]}>Réponses</Text>
      {hint ? <EditorHint>{hint}</EditorHint> : null}
      <RsvpEditorPanel />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg },
  title: { fontFamily: fontFamilies.sansSemiBold, fontSize: 18, marginBottom: 8 },
});
