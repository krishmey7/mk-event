/**
 * Histoire (mariage) ou Intervenants (conférence).
 */

import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { HistoireStepSheet } from '@/features/editor/components/HistoireStepSheet';
import { useEditor } from '@/features/editor/EditorContext';
import { useActiveEvent } from '@/context/ActiveEventContext';
import { useStudioChrome } from '@/features/editor/useStudioChrome';
import { EditorHint } from '@/features/editor/components/EditorHint';
import { EditorInput } from '@/features/editor/components/EditorInput';
import { confirmDelete } from '@/features/editor/confirmDelete';
import { studioStepHint } from '@/features/editor/studioSteps';

export default function HistoireTabScreen({ embedded = false }: { embedded?: boolean }) {
  const { story, removeStoryStep, speakers, saveSpeaker, removeSpeaker, template } = useEditor();
  const { type: activeType } = useActiveEvent();
  const eventType = activeType || template.category;
  const colors = useStudioChrome();
  const [sheetIndex, setSheetIndex] = useState<number | null>(null);

  if (eventType === 'corporate') {
    return (
      <ScrollView
        style={{ backgroundColor: colors.bg }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <EditorHint>
          {studioStepHint('histoire', 'corporate')
            ?? 'Nom, rôle et bio de chaque intervenant.'}
        </EditorHint>
        <Text style={[styles.heading, { color: colors.text }]}>Intervenants</Text>
        {speakers.map((speaker, index) => (
          <View
            key={speaker.id}
            style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <EditorInput
              value={speaker.name}
              onChangeText={(value) => saveSpeaker(index, { ...speaker, name: value })}
              placeholder="Nom"
            />
            <View style={styles.gap} />
            <EditorInput
              value={speaker.role}
              onChangeText={(value) => saveSpeaker(index, { ...speaker, role: value })}
              placeholder="Titre / entreprise"
            />
            <View style={styles.gap} />
            <EditorInput
              value={speaker.bio}
              onChangeText={(value) => saveSpeaker(index, { ...speaker, bio: value })}
              placeholder="Bio courte"
            />
            <Pressable
              onPress={() =>
                confirmDelete('Supprimer cet intervenant ?', '', () => removeSpeaker(index))
              }
              style={styles.remove}
            >
              <Ionicons name="trash-outline" size={16} color="#A45A45" />
              <Text style={styles.removeLabel}>Supprimer</Text>
            </Pressable>
          </View>
        ))}
        <Pressable
          onPress={() =>
            saveSpeaker(-1, {
              id: `sp-${Date.now()}`,
              name: '',
              role: '',
              bio: '',
            })
          }
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="person-add-outline" size={16} color={colors.onPrimary} />
          <Text style={[styles.addLabel, { color: colors.onPrimary }]}>Ajouter un intervenant</Text>
        </Pressable>
      </ScrollView>
    );
  }

  const body = (
    <>
      {embedded ? null : (
        <EditorHint>
          Touchez une étape pour la modifier, ou la corbeille pour la retirer.
        </EditorHint>
      )}
      <Text style={[styles.heading, { color: colors.text }]}>Notre histoire</Text>

      {story.length === 0 ? (
        <Text style={[styles.empty, { color: colors.textMuted }]}>
          Aucune étape pour l’instant. Ajoutez le premier souvenir.
        </Text>
      ) : (
        <View style={styles.list}>
          {story.map((item, index) => (
            <View
              key={`${index}-${item.year}-${item.title}`}
              style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Pressable
                accessibilityRole="button"
                onPress={() => setSheetIndex(index)}
                style={({ pressed }) => [styles.rowMain, pressed && styles.pressed]}
              >
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.thumb} resizeMode="cover" />
                ) : (
                  <View style={[styles.thumb, styles.thumbEmpty]}>
                    <Ionicons name="heart-outline" size={20} color={colors.accent} />
                  </View>
                )}
                <View style={styles.body}>
                  <Text style={[styles.year, { color: colors.primary }]}>{item.year}</Text>
                  <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
                  <Text numberOfLines={2} style={[styles.text, { color: colors.textMuted }]}>
                    {item.text}
                  </Text>
                </View>
              </Pressable>
              <Pressable
                onPress={() =>
                  confirmDelete('Supprimer cette étape ?', '', () => removeStoryStep(index))
                }
                hitSlop={8}
                style={styles.iconBtn}
              >
                <Ionicons name="trash-outline" size={18} color="#A45A45" />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <Pressable
        onPress={() => setSheetIndex(-1)}
        style={[styles.addBtn, { backgroundColor: colors.primary }]}
      >
        <Ionicons name="add" size={16} color={colors.onPrimary} />
        <Text style={[styles.addLabel, { color: colors.onPrimary }]}>Ajouter une étape</Text>
      </Pressable>
    </>
  );

  return (
    <>
      {embedded ? (
        <View style={styles.contentEmbedded}>{body}</View>
      ) : (
        <ScrollView
          style={{ backgroundColor: colors.bg }}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {body}
        </ScrollView>
      )}
      <HistoireStepSheet
        visible={sheetIndex !== null}
        editIndex={sheetIndex ?? -1}
        onClose={() => setSheetIndex(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  contentEmbedded: { padding: 20, paddingBottom: 12 },
  heading: { fontFamily: 'Inter_600SemiBold', fontSize: 16, marginBottom: 12 },
  empty: { fontFamily: 'Inter_400Regular', fontSize: 13, marginBottom: 16 },
  list: { gap: 10 },
  row: { borderWidth: 1, borderRadius: 14, padding: 12, marginBottom: 10 },
  rowMain: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  thumb: { width: 56, height: 56, borderRadius: 10 },
  thumbEmpty: {
    backgroundColor: '#EDE6D8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 2 },
  year: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  title: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  text: { fontFamily: 'Inter_400Regular', fontSize: 12 },
  iconBtn: { padding: 6, alignSelf: 'flex-start' },
  addBtn: {
    marginTop: 8,
    minHeight: 46,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  gap: { height: 8 },
  remove: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  removeLabel: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#A45A45' },
  pressed: { opacity: 0.85 },
});
