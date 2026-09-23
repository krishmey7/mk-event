/**
 * MK EVENTS — Modèle « Élégance » · VUE 3 — « LE PROGRAMME ».
 * Timeline dorée à icônes : 15h00 → 23h00 + motif floral en pied
 * de page (rappel botanique de la maquette).
 */

import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { IconBubble, Ionicons, SectionHeader } from '../widgets';
import { PROGRAM, WEDDING } from '../data';
import type { TemplateTheme } from '../themes';

export function ProgramView({ theme }: { theme: TemplateTheme }) {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <SectionHeader
        kicker="LE PROGRAMME"
        title="Notre journée"
        subtitle={`${WEDDING.dateLabel.charAt(0)}${WEDDING.dateLabel.slice(1).toLowerCase()}`}
        theme={theme}
      />

      <View>
        {PROGRAM.map((step, index) => {
          const last = index === PROGRAM.length - 1;
          return (
            <View key={step.time} style={styles.row}>
              <View style={styles.rail}>
                <IconBubble name={step.icon} theme={theme} />
                {last ? null : (
                  <View style={[styles.line, { backgroundColor: theme.colors.accent }]} />
                )}
              </View>
              <View style={[styles.body, last && styles.bodyLast]}>
                <Text style={[styles.time, { color: theme.colors.primary }]}>{step.time}</Text>
                <Text style={[styles.title, { color: theme.colors.text }]}>{step.title}</Text>
                <Text style={[styles.place, { color: theme.colors.textMuted }]}>{step.place}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.floraRow} pointerEvents="none">
        <Ionicons name="leaf-outline" size={26} color={theme.colors.accent} style={styles.leaf} />
        <Ionicons name="flower-outline" size={78} color={theme.colors.accent} />
        <Ionicons name="leaf-outline" size={20} color={theme.colors.accent} style={styles.leafRight} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 22, paddingTop: 6, paddingBottom: 30 },
  row: { flexDirection: 'row', gap: 14 },
  rail: { width: 44, alignItems: 'center' },
  line: { width: 2, flex: 1, borderRadius: 1, marginVertical: 6, opacity: 0.5 },
  body: { flex: 1, paddingBottom: 24, paddingTop: 2, gap: 3 },
  bodyLast: { paddingBottom: 0 },
  time: { fontFamily: 'Inter_600SemiBold', fontSize: 12.5, letterSpacing: 1 },
  title: { fontFamily: 'Inter_600SemiBold', fontSize: 15.5 },
  place: { fontFamily: 'Inter_400Regular', fontSize: 13 },
  floraRow: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center',
    marginTop: 6, opacity: 0.4,
  },
  leaf: { marginBottom: 10, marginRight: -6 },
  leafRight: { marginBottom: 18, marginLeft: -8 },
});
