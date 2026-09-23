/**
 * Sheet — créer / modifier un moment du programme.
 */

import { useEffect, useState, type ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { EditorInput } from '@/features/editor/components/EditorInput';
import { FieldWithCounter } from '@/features/editor/components/FieldWithCounter';
import { StudioBottomSheet } from '@/features/editor/components/StudioBottomSheet';
import { confirmDelete } from '@/features/editor/confirmDelete';
import { useEditor } from '@/features/editor/EditorContext';
import { useStudioChrome } from '@/features/editor/useStudioChrome';

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

const WEDDING_ICON_CHOICES: { key: IoniconsName; label: string }[] = [
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

const CONFERENCE_ICON_CHOICES: { key: IoniconsName; label: string }[] = [
  { key: 'mic-outline', label: 'Keynote' },
  { key: 'people-outline', label: 'Panel' },
  { key: 'cafe-outline', label: 'Pause' },
  { key: 'laptop-outline', label: 'Atelier' },
  { key: 'business-outline', label: 'Salle' },
  { key: 'wine-outline', label: 'Networking' },
  { key: 'time-outline', label: 'Créneau' },
  { key: 'map-outline', label: 'Visite' },
];

function formatTime(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}h${digits.slice(2)}`;
}

export function ProgrammeStepSheet({
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
  const { program, saveProgramStep, removeProgramStep, template } = useEditor();
  const colors = useStudioChrome();
  const isConference = template.category === 'corporate';
  const ICON_CHOICES = isConference ? CONFERENCE_ICON_CHOICES : WEDDING_ICON_CHOICES;
  const existing = editIndex >= 0 ? program[editIndex] : undefined;
  const isEditing = Boolean(existing);

  const [icon, setIcon] = useState<IoniconsName>(
    isConference ? 'mic-outline' : 'heart-outline',
  );
  const [time, setTime] = useState('');
  const [title, setTitle] = useState('');
  const [place, setPlace] = useState('');

  useEffect(() => {
    if (!visible) return;
    setIcon(existing?.icon ?? (isConference ? 'mic-outline' : 'heart-outline'));
    setTime(existing?.time ?? '');
    setTitle(existing?.title ?? '');
    setPlace(existing?.place ?? '');
  }, [visible, existing?.icon, existing?.time, existing?.title, existing?.place, editIndex, isConference]);

  const canSave = title.trim().length > 0 && time.trim().length > 0;

  const submit = () => {
    if (!canSave) return;
    saveProgramStep(editIndex, {
      time: time.trim(),
      title: title.trim(),
      place: place.trim() || (isConference ? 'Salle à définir' : 'Lieu à définir'),
      icon,
    });
    onClose();
  };

  return (
    <StudioBottomSheet
      visible={visible}
      embedded={embedded}
      title={
        isEditing
          ? isConference
            ? 'Modifier la session'
            : 'Modifier le moment'
          : isConference
            ? 'Nouvelle session'
            : 'Nouveau moment'
      }
      subtitle={
        isConference
          ? 'Horaire, titre et salle affichés sur l’invitation.'
          : 'Horaire, titre et lieu affichés sur l’invitation.'
      }
      onClose={onClose}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.label, { color: colors.textMuted }]}>Icône</Text>
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
                style={[
                  styles.iconCell,
                  { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
                  selected && { borderColor: colors.primary, backgroundColor: colors.chip },
                ]}
              >
                <Ionicons
                  name={choice.key}
                  size={19}
                  color={selected ? colors.primary : colors.textMuted}
                />
                <Text
                  style={[
                    styles.iconLabel,
                    { color: selected ? colors.primary : colors.textMuted },
                    selected && styles.iconLabelOn,
                  ]}
                >
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
            placeholder={isConference ? 'Keynote d’ouverture' : 'Cérémonie laïque'}
            maxLength={50}
          />
        </FieldWithCounter>

        <FieldWithCounter label={isConference ? 'Salle' : 'Lieu'} value={place} maxLength={60}>
          <EditorInput
            value={place}
            onChangeText={setPlace}
            placeholder={isConference ? 'Amphi A' : 'Jardin des Tuileries'}
            maxLength={60}
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
            {isEditing
              ? 'Enregistrer'
              : isConference
                ? 'Ajouter à l’agenda'
                : 'Ajouter au programme'}
          </Text>
        </Pressable>

        {isEditing ? (
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              confirmDelete(
                'Supprimer ce moment ?',
                'Il disparaîtra du programme de l’invitation.',
                () => {
                  removeProgramStep(editIndex);
                  onClose();
                },
              )
            }
            style={({ pressed }) => [styles.deleteBtn, pressed && styles.pressed]}
          >
            <Ionicons name="trash-outline" size={16} color="#A45A45" />
            <Text style={styles.deleteLabel}>Supprimer ce moment</Text>
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
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: -4 },
  iconCell: {
    flexGrow: 1,
    flexBasis: '30%',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.4,
    borderRadius: 12,
    paddingVertical: 10,
  },
  iconLabel: { fontFamily: 'Inter_500Medium', fontSize: 11 },
  iconLabelOn: { fontFamily: 'Inter_600SemiBold' },
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
