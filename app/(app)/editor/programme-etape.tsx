/**
 * STUDIO — Formulaire d'étape de programme (planche 2, écran 4bis).
 * Ouvert depuis une carte de l'onglet Programme (`?index=`) ou en
 * ajout : sélecteur d'icône, horaire auto-formaté (« 15h00 »), titre
 * et lieu. Enregistrement → liste mise à jour en temps réel.
 */

import { useState } from 'react';
import type { ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { EditorInput } from '@/features/editor/components/EditorInput';
import { EditorHeader } from '@/features/editor/components/EditorHeader';
import { FieldWithCounter } from '@/features/editor/components/FieldWithCounter';
import { useEditor } from '@/features/editor/EditorContext';
import { useStudioChrome } from '@/features/editor/useStudioChrome';
import { goBackInEditor } from '@/features/editor/navigation';
import { confirmDelete } from '@/features/editor/confirmDelete';

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

const ICON_CHOICES: { key: IoniconsName; label: string }[] = [
  { key: 'business-outline', label: 'Mairie' },
  { key: 'heart-outline', label: 'Cœur' },
  { key: 'wine-outline', label: 'Cocktail' },
  { key: 'restaurant-outline', label: 'Dîner' },
  { key: 'musical-notes-outline', label: 'Danse' },
  { key: 'sparkles-outline', label: 'Cérémonie' },
  { key: 'diamond-outline', label: 'Alliance' },
  { key: 'camera-outline', label: 'Photos' },
  { key: 'flower-outline', label: 'Fleurs' },
  { key: 'time-outline', label: 'Pause' },
];

/** Saisie progressive « 1500 » → « 15h00 ». */
function formatTime(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}h${digits.slice(2)}`;
}

export default function ProgrammeEtapeScreen() {
  const router = useRouter();
  const { index } = useLocalSearchParams<{ index?: string }>();
  const {program, saveProgramStep, removeProgramStep} = useEditor();
  const colors = useStudioChrome();

  const editIndex = index !== undefined ? Number.parseInt(index, 10) : -1;
  const existing = editIndex >= 0 ? program[editIndex] : undefined;
  const isEditing = Boolean(existing);

  const [icon, setIcon] = useState<IoniconsName>(existing?.icon ?? 'heart-outline');
  const [time, setTime] = useState(existing?.time ?? '');
  const [title, setTitle] = useState(existing?.title ?? '');
  const [place, setPlace] = useState(existing?.place ?? '');

  const canSave = title.trim().length > 0 && time.trim().length > 0;

  const submit = () => {
    if (!canSave) return;
    saveProgramStep(editIndex, {
      time: time.trim(),
      title: title.trim(),
      place: place.trim() || 'Lieu à définir',
      icon,
    });
    router.back();
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <EditorHeader
        title={isEditing ? 'Modifier l’étape' : 'Nouvelle étape'}
        onBack={() => goBackInEditor(router)}
        showPreview={false}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Icône de l'étape */}
        <Text style={styles.label}>Icône</Text>
        <View style={styles.iconGrid}>
          {ICON_CHOICES.map((choice) => {
            const selected = icon === choice.key;
            return (
              <Pressable
                key={choice.key}
                accessibilityRole="radio"
                accessibilityLabel={`Icône ${choice.label}`}
                accessibilityState={{ selected }}
                onPress={() => setIcon(choice.key)}
                style={[styles.iconCell, selected && { borderColor: colors.primary, backgroundColor: colors.chip }]}
              >
                <Ionicons name={choice.key} size={19} color={selected ? colors.primary : '#8A8278'} />
                <Text style={[styles.iconLabel, selected && { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
                  {choice.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <FieldWithCounter label="Heure" value={time} maxLength={5}>
            <EditorInput
            value={time}
            onChangeText={(value) => setTime(formatTime(value))}
            placeholder="15h00"
            keyboardType="number-pad"
            maxLength={5}
          />
        </FieldWithCounter>

        <FieldWithCounter label="Titre" value={title} maxLength={50}>
            <EditorInput
            value={title}
            onChangeText={setTitle}
            placeholder="Cérémonie laïque"
            maxLength={50}
          />
        </FieldWithCounter>

        <FieldWithCounter label="Lieu" value={place} maxLength={60}>
            <EditorInput
            value={place}
            onChangeText={setPlace}
            placeholder="Jardin des Tuileries"
            maxLength={60}
          />
        </FieldWithCounter>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSave }}
          onPress={submit}
          disabled={!canSave}
          style={({ pressed }) => [styles.saveBtn, { backgroundColor: colors.primary }, !canSave && styles.saveDisabled, pressed && styles.pressed]}
        >
          <Ionicons name="checkmark" size={16} color={colors.onPrimary} />
          <Text style={[styles.saveLabel, { color: colors.onPrimary }]}>
            {isEditing ? 'Enregistrer les modifications' : 'Ajouter au programme'}
          </Text>
        </Pressable>

        {isEditing ? (
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              confirmDelete('Supprimer ce moment ?', 'Il disparaîtra du programme de l’invitation.', () => {
                removeProgramStep(editIndex);
                router.back();
              })
            }
            style={({ pressed }) => [styles.deleteBtn, pressed && styles.pressed]}
          >
            <Ionicons name="trash-outline" size={16} color="#A45A45" />
            <Text style={styles.deleteLabel}>Supprimer ce moment</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 20, paddingBottom: 40, gap: 16 },
  pressed: { opacity: 0.85 },
  label: { fontFamily: 'Inter_500Medium', fontSize: 12.5, color: '#6F675C' },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: -6 },
  iconCell: {
    flexGrow: 1,
    flexBasis: '30%',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.4,
    borderColor: '#E6DCCB',
    borderRadius: 12,
    paddingVertical: 10,
  },
  iconCellSelected: {},
  iconLabel: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#8A8278' },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    minHeight: 50,
    borderRadius: 999,
    marginTop: 8,
  },
  saveDisabled: { opacity: 0.45 },
  saveLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14.5 },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    minHeight: 46,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(164, 90, 69, 0.35)',
    backgroundColor: 'rgba(164, 90, 69, 0.08)',
  },
  deleteLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#A45A45' },
});
