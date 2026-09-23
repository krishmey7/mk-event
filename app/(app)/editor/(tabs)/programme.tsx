/**
 * Onglet « Programme » — personnalisation (planche 2, écran 4).
 * Liste de la journée (icônes, horaires, lieux) + choix du style
 * (Classique, Minimaliste, Icônes, Personnalisé) + ajout d'étape.
 */

import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { EditorHint } from '@/features/editor/components/EditorHint';
import { ProgrammeStepSheet } from '@/features/editor/components/ProgrammeStepSheet';
import { confirmDelete } from '@/features/editor/confirmDelete';
import { useEditor } from '@/features/editor/EditorContext';
import { studioStepHint } from '@/features/editor/studioSteps';
import { useStudioChrome } from '@/features/editor/useStudioChrome';
import type { ProgramStep } from '@/features/templates/elegance/data';

export default function ProgrammeTabScreen({ embedded = false }: { embedded?: boolean }) {
  const { program, programStyle, removeProgramStep, template } = useEditor();
  const colors = useStudioChrome();
  const isConference = template.category === 'corporate';
  const [sheetIndex, setSheetIndex] = useState<number | null>(null);

  /* 4 layouts — le choix met à jour la liste instantanément. */
  const renderStep = (step: ProgramStep, index: number) => {
    const open = () => setSheetIndex(index);
    const key = `${index}-${step.time}-${step.title}`;
    const remove = () =>
      confirmDelete(
        isConference ? 'Supprimer ce créneau ?' : 'Supprimer ce moment ?',
        isConference
          ? 'Il disparaîtra de l’agenda de l’invitation.'
          : 'Il disparaîtra du programme de l’invitation.',
        () => removeProgramStep(index),
      );

    const actions = (
      <View style={styles.actions}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Modifier ${step.title}`} onPress={open} hitSlop={8} style={styles.iconBtn}>
          <Ionicons name="create-outline" size={18} color={colors.textMuted} />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={`Supprimer ${step.title}`} onPress={remove} hitSlop={8} style={styles.iconBtn}>
          <Ionicons name="trash-outline" size={18} color="#A45A45" />
        </Pressable>
      </View>
    );

    if (programStyle === 'minimaliste') {
      return (
        <View key={key} style={styles.rowShell}>
          <Pressable accessibilityRole="button" onPress={open} style={({ pressed }) => [styles.minRow, { borderBottomColor: colors.border }, pressed && styles.pressed]}>
            <View style={[styles.minDot, { backgroundColor: colors.accent }]} />
            <View style={styles.body}>
              <Text style={[styles.time, { color: colors.primary }]}>{step.time}</Text>
              <Text style={[styles.title, { color: colors.text }]}>{step.title}</Text>
              <Text style={[styles.place, { color: colors.textMuted }]}>{step.place}</Text>
            </View>
          </Pressable>
          {actions}
        </View>
      );
    }

    if (programStyle === 'icones') {
      return (
        <View key={key} style={styles.rowShell}>
          <Pressable accessibilityRole="button" onPress={open} style={({ pressed }) => [styles.icoRow, pressed && styles.pressed]}>
            <View style={[styles.icoCircle, { borderColor: colors.accent }]}>
              <Ionicons name={step.icon} size={21} color={colors.primary} />
            </View>
            <View style={styles.body}>
              <Text style={[styles.time, { color: colors.primary }]}>{step.time}</Text>
              <Text style={[styles.title, { color: colors.text }]}>{step.title}</Text>
              <Text style={[styles.place, { color: colors.textMuted }]}>{step.place}</Text>
            </View>
          </Pressable>
          {actions}
        </View>
      );
    }

    return (
      <View
        key={key}
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
          programStyle === 'personnalise' && [styles.cardAccent, { borderLeftColor: colors.accent }],
        ]}
      >
        <Pressable accessibilityRole="button" onPress={open} style={({ pressed }) => [styles.cardMain, pressed && styles.pressed]}>
          <View style={[styles.bubble, { backgroundColor: colors.chip }]}>
            <Ionicons name={step.icon} size={17} color={colors.primary} />
          </View>
          <View style={styles.body}>
            <Text style={[styles.time, { color: colors.primary }]}>{step.time}</Text>
            <Text style={[styles.title, { color: colors.text }]}>{step.title}</Text>
            <Text style={[styles.place, { color: colors.textMuted }]}>{step.place}</Text>
          </View>
        </Pressable>
        {actions}
      </View>
    );
  };

  const body = (
    <>
      {embedded ? null : (
        <EditorHint>
          {isConference
            ? (studioStepHint('programme', 'corporate')
              ?? 'Construisez l’agenda : horaires, sessions et salles.')
            : 'Modifiez ou supprimez chaque moment. Le crayon ouvre le détail, la corbeille l’enlève.'}
        </EditorHint>
      )}
      <Text style={[styles.heading, { color: colors.text }]}>
        {isConference ? 'Agenda' : 'Programme de la journée'}
      </Text>

      {program.length === 0 ? (
        <Text style={[styles.empty, { color: colors.textMuted }]}>
          {isConference
            ? 'Aucun créneau pour l’instant. Ajoutez la première session.'
            : 'Aucun moment pour l’instant. Ajoutez la première étape.'}
        </Text>
      ) : (
        <View style={styles.list}>{program.map(renderStep)}</View>
      )}

      {embedded ? null : (
        <EditorHint>Le style du programme est figé par le modèle. Ajoutez ou modifiez les étapes.</EditorHint>
      )}

      <Pressable
        accessibilityRole="button"
        onPress={() => setSheetIndex(-1)}
        style={({ pressed }) => [styles.addBtn, { backgroundColor: colors.primary }, pressed && styles.pressed]}
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
      <ProgrammeStepSheet
        visible={sheetIndex !== null}
        editIndex={sheetIndex ?? -1}
        onClose={() => setSheetIndex(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 32 },
  contentEmbedded: { padding: 20, paddingBottom: 12 },
  heading: { fontFamily: 'Inter_600SemiBold', fontSize: 17, color: '#121318', marginBottom: 12 },
  empty: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, color: '#8A7E6E', marginBottom: 8 },
  list: { gap: 10 },
  pressed: { opacity: 0.8 },
  rowShell: { flexDirection: 'row', alignItems: 'center' },
  actions: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    padding: 10,
    paddingRight: 4,
  },
  cardMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardAccent: { borderLeftWidth: 3, borderRadius: 14 },
  bubble: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, gap: 1 },
  time: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  title: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  place: { fontFamily: 'Inter_400Regular', fontSize: 12 },
  /* Minimaliste — lignes épurées sans fonds */
  minRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  minDot: { width: 7, height: 7, borderRadius: 4 },
  /* Icônes — cercles filaires sans cartes */
  icoRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 8, paddingHorizontal: 4 },
  icoCircle: {
    width: 44, height: 44, borderRadius: 22,
    borderWidth: 1.2, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 46,
    borderRadius: 999,
    marginTop: 20,
  },
  addLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
});
