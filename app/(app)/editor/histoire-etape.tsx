/**
 * STUDIO — Formulaire d'étape d'histoire (planche 2, écran 3bis).
 * Ouvert depuis une carte de l'onglet Histoire (`?index=`) ou en
 * ajout : sélecteur Photo + texte / Texte seul, galerie native,
 * compteurs 0/50 et 0/500. L'enregistrement met à jour la liste
 * en temps réel via le contexte du studio.
 */

import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { EditorInput } from '@/features/editor/components/EditorInput';
import { EditorHeader } from '@/features/editor/components/EditorHeader';
import { FieldWithCounter } from '@/features/editor/components/FieldWithCounter';
import { useEditor } from '@/features/editor/EditorContext';
import { useStudioChrome } from '@/features/editor/useStudioChrome';
import { goBackInEditor } from '@/features/editor/navigation';
import { confirmDelete } from '@/features/editor/confirmDelete';
import { pickLibraryImage } from '@/features/editor/imagePicker';
import type { StoryMilestone } from '@/features/templates/elegance/data';

type Mode = 'photo-texte' | 'texte-seul';

export default function HistoireEtapeScreen() {
  const router = useRouter();
  const { index } = useLocalSearchParams<{ index?: string }>();
  const {story, saveStoryStep, removeStoryStep} = useEditor();
  const colors = useStudioChrome();

  const editIndex = index !== undefined ? Number.parseInt(index, 10) : -1;
  const existing = editIndex >= 0 ? story[editIndex] : undefined;
  const isEditing = Boolean(existing);

  const [mode, setMode] = useState<Mode>(existing?.image ? 'photo-texte' : 'texte-seul');
  const [photoUri, setPhotoUri] = useState(existing?.image ?? '');
  const [year, setYear] = useState(existing?.year ?? '');
  const [title, setTitle] = useState(existing?.title ?? '');
  const [text, setText] = useState(existing?.text ?? '');

  /* Galerie native du téléphone — vignette de l'étape. */
  const importPhoto = async () => {
    const uri = await pickLibraryImage();
    if (uri) setPhotoUri(uri);
  };

  const canSave = title.trim().length > 0 && (mode !== 'photo-texte' || photoUri !== '');

  const submit = () => {
    if (!canSave) return;
    saveStoryStep(editIndex, {
      year: year.trim() || '••••',
      title: title.trim(),
      text: text.trim(),
      image: mode === 'photo-texte' ? photoUri : '',
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
        {/* Type d'étape — Photo + texte / Texte seul */}
        <Text style={styles.label}>Type d'étape</Text>
        <View style={styles.modeRow}>
          {(
            [
              { key: 'photo-texte', label: 'Photo + texte', icon: 'image-outline' },
              { key: 'texte-seul', label: 'Texte seul', icon: 'document-text-outline' },
            ] as const
          ).map((option) => {
            const selected = mode === option.key;
            return (
              <Pressable
                key={option.key}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => setMode(option.key)}
                style={[styles.modeCard, selected && { borderColor: colors.primary, backgroundColor: colors.chip }]}
              >
                <Ionicons name={option.icon} size={18} color={selected ? colors.primary : '#8A8278'} />
                <Text style={[styles.modeLabel, selected && { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Vignette — galerie native (mode Photo + texte uniquement) */}
        {mode === 'photo-texte' ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Choisir la photo de l'étape"
            onPress={importPhoto}
            style={({ pressed }) => [styles.photoZone, pressed && styles.pressed]}
          >
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            ) : null}
            <View style={[StyleSheet.absoluteFill, photoUri ? styles.photoScrim : null]} />
            <View style={styles.photoPill}>
              <Ionicons name="camera-outline" size={15} color="#121318" />
              <Text style={styles.photoPillLabel}>
                {photoUri ? 'Changer la photo' : 'Ajouter une photo'}
              </Text>
            </View>
          </Pressable>
        ) : null}

        <FieldWithCounter label="Année" value={year} maxLength={4}>
            <EditorInput
            value={year}
            onChangeText={(value) => setYear(value.replace(/\D/g, '').slice(0, 4))}
            placeholder="2018"
            keyboardType="number-pad"
            maxLength={4}
          />
        </FieldWithCounter>

        <FieldWithCounter label="Titre" value={title} maxLength={50}>
            <EditorInput
            value={title}
            onChangeText={setTitle}
            placeholder="Notre rencontre"
            maxLength={50}
          />
        </FieldWithCounter>

        <FieldWithCounter label="Texte" value={text} maxLength={500}>
            <EditorInput
            value={text}
            onChangeText={setText}
            placeholder="Racontez ce souvenir…"
            multiline
            maxLength={500}
            style={styles.textArea}
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
            {isEditing ? 'Enregistrer les modifications' : 'Ajouter cette étape'}
          </Text>
        </Pressable>

        {isEditing ? (
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              confirmDelete('Supprimer cette étape ?', 'Elle disparaîtra de l’invitation.', () => {
                removeStoryStep(editIndex);
                router.back();
              })
            }
            style={({ pressed }) => [styles.deleteBtn, pressed && styles.pressed]}
          >
            <Ionicons name="trash-outline" size={16} color="#A45A45" />
            <Text style={styles.deleteLabel}>Supprimer cette étape</Text>
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
  modeRow: { flexDirection: 'row', gap: 10, marginTop: -6 },
  modeCard: {
    flexGrow: 1,
    flexBasis: '48%',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.4,
    borderColor: '#E6DCCB',
    borderRadius: 14,
    paddingVertical: 14,
  },
  modeCardSelected: {},
  modeLabel: { fontFamily: 'Inter_500Medium', fontSize: 12.5, color: '#8A8278' },
  photoZone: {
    height: 150,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#D4C8B3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoScrim: { backgroundColor: 'rgba(10, 8, 6, 0.32)' },
  photoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  photoPillLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 12.5, color: '#121318' },
  textArea: { minHeight: 110, textAlignVertical: 'top', paddingTop: 14 },
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
