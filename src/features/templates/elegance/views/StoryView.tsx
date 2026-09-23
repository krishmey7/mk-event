/**
 * MK EVENTS — Modèle « Élégance » · VUE 2 — « NOTRE HISTOIRE ».
 * Timeline verticale à pastilles photo : 2018 → 2020 → 2023 → 2025.
 */

import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SectionHeader } from '../widgets';
import { STORY, WEDDING } from '../data';
import type { TemplateTheme } from '../themes';

export function StoryView({ theme }: { theme: TemplateTheme }) {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <SectionHeader
        kicker="NOTRE HISTOIRE"
        title={WEDDING.couple}
        subtitle="Une belle aventure…"
        theme={theme}
      />

      <View>
        {STORY.map((item, index) => {
          const last = index === STORY.length - 1;
          return (
            <View key={item.year} style={styles.row}>
              <View style={styles.rail}>
                <Image
                  source={{ uri: item.image }}
                  style={[styles.photo, { borderColor: theme.colors.surface }]}
                />
                {last ? null : (
                  <View style={[styles.line, { backgroundColor: theme.colors.accent }]} />
                )}
              </View>
              <View style={[styles.body, last && styles.bodyLast]}>
                <Text style={[styles.year, { color: theme.colors.primary }]}>{item.year}</Text>
                <Text style={[styles.title, { color: theme.colors.text }]}>{item.title}</Text>
                <Text style={[styles.text, { color: theme.colors.textMuted }]}>{item.text}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 22, paddingTop: 6, paddingBottom: 36 },
  row: { flexDirection: 'row', gap: 14 },
  rail: { width: 44, alignItems: 'center' },
  photo: { width: 44, height: 44, borderRadius: 22, borderWidth: 3, backgroundColor: '#E5DECf' },
  line: { width: 2, flex: 1, borderRadius: 1, marginVertical: 6, opacity: 0.45 },
  body: { flex: 1, paddingBottom: 22, paddingTop: 2, gap: 3 },
  bodyLast: { paddingBottom: 0 },
  year: { fontFamily: 'Inter_600SemiBold', fontSize: 12, letterSpacing: 1.5 },
  title: { fontFamily: 'Inter_600SemiBold', fontSize: 15.5 },
  text: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19 },
});
