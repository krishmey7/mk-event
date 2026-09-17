/**
 * Étape 3 — récit de l’invitation (histoire, journée, compte à rebours).
 * Un seul bouton du bas ; le choix se fait par les pastilles.
 */

import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useStudioChrome } from '@/features/editor/useStudioChrome';

import HistoireTabScreen from './histoire';
import ProgrammeTabScreen from './programme';
import CompteurTabScreen from './compteur';

const PANES = [
  { key: 'histoire', label: 'Histoire' },
  { key: 'programme', label: 'Journée' },
  { key: 'compteur', label: 'Compteur' },
] as const;

type PaneKey = (typeof PANES)[number]['key'];

export default function JourTabScreen() {
  const [pane, setPane] = useState<PaneKey>('histoire');
  const c = useStudioChrome();

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      <View style={styles.pills}>
        {PANES.map((item) => {
          const on = pane === item.key;
          return (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              onPress={() => setPane(item.key)}
              style={[
                styles.pill,
                { backgroundColor: c.surface, borderColor: c.border },
                on && { backgroundColor: c.primary, borderColor: c.primary },
              ]}
            >
              <Text style={[styles.pillLabel, { color: on ? c.onPrimary : c.textMuted }]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.body}>
        {pane === 'histoire' ? <HistoireTabScreen /> : null}
        {pane === 'programme' ? <ProgrammeTabScreen /> : null}
        {pane === 'compteur' ? <CompteurTabScreen /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  pills: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  pill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12.5,
  },
  body: { flex: 1 },
});
