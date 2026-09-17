/**
 * STUDIO — RSVP : uniquement la liste de boissons proposées aux invités.
 */

import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { EditorInput } from '@/features/editor/components/EditorInput';
import { EditorHeader } from '@/features/editor/components/EditorHeader';
import { EditorHint } from '@/features/editor/components/EditorHint';
import { useEditor } from '@/features/editor/EditorContext';
import { useStudioChrome } from '@/features/editor/useStudioChrome';
import { goBackInEditor } from '@/features/editor/navigation';

export default function RsvpScreen() {
  const router = useRouter();
  const {drinks, addDrink, removeDrink, updateDrink} = useEditor();
  const colors = useStudioChrome();
  const [newDrink, setNewDrink] = useState('');
  const [editingDrink, setEditingDrink] = useState<string | null>(null);
  const [drinkDraft, setDrinkDraft] = useState('');

  const finishDrinkEdit = () => {
    if (editingDrink) updateDrink(editingDrink, drinkDraft);
    setEditingDrink(null);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <EditorHeader title="RSVP" onBack={() => goBackInEditor(router)} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <EditorHint>
          Les invités confirment leur présence et choisissent une boisson parmi cette liste. Rien d’autre.
        </EditorHint>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Choix de la boisson</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {drinks.map((drink, index) => (
            <View key={drink}>
              {index > 0 ? <View style={[styles.divider, { backgroundColor: colors.border }]} /> : null}
              {editingDrink === drink ? (
                <View style={styles.editRow}>
                  <EditorInput
                    value={drinkDraft}
                    onChangeText={setDrinkDraft}
                    autoFocus
                    containerStyle={styles.editInput}
                    onSubmitEditing={finishDrinkEdit}
                    returnKeyType="done"
                  />
                  <Pressable accessibilityRole="button" onPress={finishDrinkEdit} hitSlop={6} style={styles.editIconBtn}>
                    <Ionicons name="checkmark" size={17} color={colors.primary} />
                  </Pressable>
                  <Pressable accessibilityRole="button" onPress={() => setEditingDrink(null)} hitSlop={6} style={styles.editIconBtn}>
                    <Ionicons name="close" size={17} color="#9A9EA7" />
                  </Pressable>
                </View>
              ) : (
                <View style={styles.row}>
                  <Ionicons name="wine-outline" size={16} color={colors.primary} />
                  <Text style={[styles.rowLabel, styles.drinkLabel, { color: colors.text }]}>{drink}</Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Modifier ${drink}`}
                    onPress={() => { setEditingDrink(drink); setDrinkDraft(drink); }}
                    hitSlop={6}
                    style={styles.removeBtn}
                  >
                    <Ionicons name="pencil-outline" size={15} color={colors.primary} />
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Retirer ${drink}`}
                    onPress={() => removeDrink(drink)}
                    hitSlop={6}
                    style={styles.removeBtn}
                  >
                    <Ionicons name="trash-outline" size={16} color="#A45A45" />
                  </Pressable>
                </View>
              )}
            </View>
          ))}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.addRow}>
            <EditorInput
              value={newDrink}
              onChangeText={setNewDrink}
              placeholder="Ex. Vin blanc sec"
              containerStyle={styles.addContainer}
              onSubmitEditing={() => { addDrink(newDrink); setNewDrink(''); }}
              returnKeyType="done"
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ajouter la boisson"
              onPress={() => { addDrink(newDrink); setNewDrink(''); }}
              style={({ pressed }) => [styles.addBtn, { backgroundColor: colors.primary }, pressed && styles.pressed]}
            >
              <Ionicons name="add" size={17} color={colors.onPrimary} />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  pressed: { opacity: 0.85 },
  sectionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, marginBottom: 10 },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
  drinkLabel: { flex: 1 },
  removeBtn: { padding: 4 },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  addContainer: { flex: 1 },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10 },
  editInput: { flex: 1 },
  editIconBtn: { padding: 4 },
  rowLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13.5 },
  divider: { height: 1, backgroundColor: '#EDE6D8' },
});
