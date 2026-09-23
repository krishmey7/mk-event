/**
 * Sheet — créer / modifier une étape d’histoire.
 */

import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { EditorInput } from '@/features/editor/components/EditorInput';
import { FieldWithCounter } from '@/features/editor/components/FieldWithCounter';
import { StudioBottomSheet } from '@/features/editor/components/StudioBottomSheet';
import { confirmDelete } from '@/features/editor/confirmDelete';
import { useEditor } from '@/features/editor/EditorContext';
import { pickLibraryImage } from '@/features/editor/imagePicker';
import { useStudioChrome } from '@/features/editor/useStudioChrome';

type Mode = 'photo-texte' | 'texte-seul';

export function HistoireStepSheet({
  visible,
  editIndex,
  onClose,
  embedded = false,
}: {
  visible: boolean;
  /** -1 = création */
  editIndex: number;
  onClose: () => void;
  embedded?: boolean;
}) {
  const { story, saveStoryStep, removeStoryStep } = useEditor();
  const colors = useStudioChrome();
  const existing = editIndex >= 0 ? story[editIndex] : undefined;
  const isEditing = Boolean(existing);

  const [mode, setMode] = useState<Mode>('texte-seul');
  const [photoUri, setPhotoUri] = useState('');
  const [year, setYear] = useState('');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');

  useEffect(() => {
    if (!visible) return;
    setMode(existing?.image ? 'photo-texte' : 'texte-seul');
    setPhotoUri(existing?.image ?? '');
    setYear(existing?.year ?? '');
    setTitle(existing?.title ?? '');
    setText(existing?.text ?? '');
  }, [visible, existing?.image, existing?.year, existing?.title, existing?.text, editIndex]);

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
    onClose();
  };

  return (
    <StudioBottomSheet
      visible={visible}
      embedded={embedded}
      title={isEditing ? 'Modifier l’étape' : 'Nouvelle étape'}
      subtitle="Souvenir affiché dans le récit de l’invitation."
      onClose={onClose}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.label, { color: colors.textMuted }]}>Type d’étape</Text>
        <View style={styles.modeRow}>
          {(
            [
              { key: 'photo-texte' as const, label: 'Photo + texte', icon: 'image-outline' as const },
              { key: 'texte-seul' as const, label: 'Texte seul', icon: 'document-text-outline' as const },
            ]
          ).map((option) => {
            const selected = mode === option.key;
            return (
              <Pressable
                key={option.key}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => setMode(option.key)}
                style={[
                  styles.modeCard,
                  { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
                  selected && { borderColor: colors.primary, backgroundColor: colors.chip },
                ]}
              >
                <Ionicons
                  name={option.icon}
                  size={18}
                  color={selected ? colors.primary : colors.textMuted}
                />
                <Text
                  style={[
                    styles.modeLabel,
                    { color: selected ? colors.primary : colors.textMuted },
                    selected && styles.modeLabelOn,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {mode === 'photo-texte' ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Choisir la photo de l’étape"
            onPress={importPhoto}
            style={({ pressed }) => [
              styles.photoZone,
              { borderColor: colors.border, backgroundColor: colors.surfaceAlt },
              pressed && styles.pressed,
            ]}
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
          style={({ pressed }) => [
            styles.saveBtn,
            { backgroundColor: colors.primary },
            !canSave && styles.saveDisabled,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="checkmark" size={16} color={colors.onPrimary} />
          <Text style={[styles.saveLabel, { color: colors.onPrimary }]}>
            {isEditing ? 'Enregistrer' : 'Ajouter cette étape'}
          </Text>
        </Pressable>

        {isEditing ? (
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              confirmDelete('Supprimer cette étape ?', 'Elle disparaîtra de l’invitation.', () => {
                removeStoryStep(editIndex);
                onClose();
              })
            }
            style={({ pressed }) => [styles.deleteBtn, pressed && styles.pressed]}
          >
            <Ionicons name="trash-outline" size={16} color="#A45A45" />
            <Text style={styles.deleteLabel}>Supprimer cette étape</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </StudioBottomSheet>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 8, gap: 14 },
  pressed: { opacity: 0.85 },
  label: { fontFamily: 'Inter_500Medium', fontSize: 12.5 },
  modeRow: { flexDirection: 'row', gap: 10, marginTop: -4 },
  modeCard: {
    flexGrow: 1,
    flexBasis: '48%',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.4,
    borderRadius: 14,
    paddingVertical: 14,
  },
  modeLabel: { fontFamily: 'Inter_500Medium', fontSize: 12.5 },
  modeLabelOn: { fontFamily: 'Inter_600SemiBold' },
  photoZone: {
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderStyle: 'dashed',
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
  textArea: { minHeight: 100, textAlignVertical: 'top', paddingTop: 14 },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    minHeight: 50,
    borderRadius: 999,
    marginTop: 4,
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
