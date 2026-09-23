/**
 * Étape 3 — récit : histoire, journée et compteur dans un seul flux.
 * Défilement naturel, sans pastilles à choisir.
 */

import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { EditorHint } from '@/features/editor/components/EditorHint';
import { useEditor } from '@/features/editor/EditorContext';
import { studioStepHint } from '@/features/editor/studioSteps';
import { useStudioChrome } from '@/features/editor/useStudioChrome';
import { useActiveEvent } from '@/context/ActiveEventContext';

import HistoireTabScreen from './histoire';
import ProgrammeTabScreen from './programme';
import CompteurTabScreen from './compteur';

export default function JourTabScreen() {
  const c = useStudioChrome();
  const { template } = useEditor();
  const { type: activeType } = useActiveEvent();
  const hint = studioStepHint('jour', activeType || template.category);

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: c.bg }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {hint ? (
        <View style={styles.hintWrap}>
          <EditorHint>{hint}</EditorHint>
        </View>
      ) : null}

      <HistoireTabScreen embedded />

      <View style={[styles.divider, { backgroundColor: c.border }]} />
      <ProgrammeTabScreen embedded />

      <View style={[styles.divider, { backgroundColor: c.border }]} />
      <Text style={[styles.sectionLabel, { color: c.textMuted }]}>Compte à rebours</Text>
      <CompteurTabScreen embedded />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingBottom: 40, paddingTop: 4 },
  hintWrap: { paddingHorizontal: 16, paddingTop: 8 },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 20,
    marginVertical: 8,
  },
  sectionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    marginBottom: 4,
  },
});
