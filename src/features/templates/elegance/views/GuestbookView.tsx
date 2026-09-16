/**
 * MK EVENT — Modèle « Élégance » · VUE 7 — Livre d'or / Vœux.
 * « Laisse-nous un petit mot » — champ 0/500, ajout photo
 * (optionnel), envoi + remerciement « Merci d'être là ! ».
 */

import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { LabeledField, PillButton, SectionHeader, ThemedInput } from '../widgets';
import { WEDDING } from '../data';
import type { TemplateTheme } from '../themes';

interface GuestNote {
  id: number;
  text: string;
  when: string;
}

export function GuestbookView({ theme }: { theme: TemplateTheme }) {
  const [text, setText] = useState('');
  const [notes, setNotes] = useState<GuestNote[]>([]);
  const [error, setError] = useState(false);
  const c = theme.colors;

  const send = () => {
    if (text.trim().length === 0) {
      setError(true);
      return;
    }
    setNotes((prev) => [{ id: Date.now(), text: text.trim(), when: 'À l\u2019instant' }, ...prev]);
    setText('');
    setError(false);
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <SectionHeader
        title="Laisse-nous un petit mot"
        subtitle="Un message, un vœu, une pensée, tout nous fera chaud au cœur !"
        theme={theme}
      />

      <View style={[styles.inputCard, { backgroundColor: c.surface, borderColor: error ? '#A45A45' : c.border }]}>
        <ThemedInput
          theme={theme}
          multiline
          maxLength={500}
          value={text}
          onChangeText={(value) => { setText(value); setError(false); }}
          placeholder="Écris ici ton message..."
          style={styles.textarea}
        />
        <Text style={[styles.counter, { color: c.textMuted }]}>{text.length}/500</Text>
      </View>

      <LabeledField label="Ajouter une photo (optionnel)" theme={theme}>
        <Pressable
          accessibilityRole="button"
          style={[styles.photoBox, { backgroundColor: c.surface, borderColor: c.border }]}
        >
          <Ionicons name="camera-outline" size={20} color={c.primary} />
          <Text style={[styles.photoLabel, { color: c.textMuted }]}>Ajouter une photo</Text>
        </Pressable>
      </LabeledField>

      {error ? (
        <Text style={styles.error}>{"Écris d\u2019abord un petit mot 💛"}</Text>
      ) : null}

      <PillButton label="Envoyer mon message" onPress={send} theme={theme} />

      {notes.map((note) => (
        <View key={note.id} style={[styles.note, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Text style={[styles.noteText, { color: c.text }]}>{note.text}</Text>
          <Text style={[styles.noteWhen, { color: c.textMuted }]}>{note.when}</Text>
        </View>
      ))}

      <View style={styles.thanks}>
        <Ionicons name="leaf-outline" size={16} color={c.accent} />
        <Text style={[styles.thanksTitle, { color: c.text }]}>{"Merci d\u2019être là !"}</Text>
        <Text style={[styles.thanksNames, { color: c.primary }]}>{WEDDING.couple}</Text>
        <Ionicons name="flower-outline" size={14} color={c.accent} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 22, paddingTop: 6, paddingBottom: 36, gap: 16 },
  inputCard: {
    borderRadius: 14, borderWidth: 1, padding: 12, gap: 4,
  },
  textarea: {
    minHeight: 96, borderWidth: 0, backgroundColor: 'transparent',
    paddingHorizontal: 2, textAlignVertical: 'top', paddingTop: 4,
  },
  counter: { fontFamily: 'Inter_400Regular', fontSize: 11, textAlign: 'right', paddingRight: 4 },
  photoBox: {
    minHeight: 86, borderRadius: 14, borderWidth: 1.4, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  photoLabel: { fontFamily: 'Inter_500Medium', fontSize: 13 },
  error: {
    fontFamily: 'Inter_500Medium', fontSize: 12.5, color: '#A45A45', textAlign: 'center', marginTop: -6,
  },
  note: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 6 },
  noteText: { fontFamily: 'Inter_400Regular', fontSize: 13.5, lineHeight: 20 },
  noteWhen: { fontFamily: 'Inter_400Regular', fontSize: 11 },
  thanks: { alignItems: 'center', gap: 6, marginTop: 14, marginBottom: 8 },
  thanksTitle: { fontFamily: 'Fraunces_500Medium', fontSize: 19 },
  thanksNames: { fontFamily: 'Fraunces_400Regular_Italic', fontSize: 15 },
});
