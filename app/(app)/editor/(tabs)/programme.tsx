/**
 * Onglet « Programme » — personnalisation (planche 2, écran 4).
 * Liste de la journée (icônes, horaires, lieux) + choix du style
 * (Classique, Minimaliste, Icônes, Personnalisé) + ajout d'étape.
 */

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { EditorInput } from '@/features/editor/components/EditorInput';
import { EditorHint } from '@/features/editor/components/EditorHint';
import { confirmDelete } from '@/features/editor/confirmDelete';
import { useEditor, type ProgramStyleKey } from '@/features/editor/EditorContext';
import type { ProgramStep } from '@/features/templates/elegance/data';

const STYLES = [
  { key: 'classique', label: 'Classique', icon: 'albums-outline' },
  { key: 'minimaliste', label: 'Minimaliste', icon: 'document-outline' },
  { key: 'icones', label: 'Icônes', icon: 'flower-outline' },
  { key: 'personnalise', label: 'Personnalisé', icon: 'color-palette-outline' },
] as const;

export default function ProgrammeTabScreen() {
  const router = useRouter();
  const { program, theme, programStyle, setProgramStyle, venue, updateVenue, removeProgramStep } = useEditor();
  const colors = theme.colors;

  /* 4 layouts — le choix met à jour la liste instantanément. */
  const renderStep = (step: ProgramStep, index: number) => {
    const open = () =>
      router.push({ pathname: '/editor/programme-etape', params: { index: String(index) } });
    const key = `${index}-${step.time}-${step.title}`;
    const remove = () =>
      confirmDelete(
        'Supprimer ce moment ?',
        'Il disparaîtra du programme de l’invitation.',
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

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <EditorHint>Modifiez ou supprimez chaque moment. Le crayon ouvre le détail, la corbeille l’enlève.</EditorHint>
      <Text style={[styles.heading, { color: colors.text }]}>Programme de la journée</Text>

      {program.length === 0 ? (
        <Text style={[styles.empty, { color: colors.textMuted }]}>Aucun moment pour l’instant. Ajoutez la première étape.</Text>
      ) : (
        <View style={styles.list}>{program.map(renderStep)}</View>
      )}

      {/* Lieu du mariage — adresse affichée avec itinéraire sur l'invitation */}
      <Text style={[styles.sectionLabel, { color: colors.text }]}>Lieu du mariage</Text>
      <View style={[styles.venueCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <EditorInput
          value={venue.name}
          onChangeText={(value) => updateVenue({ name: value })}
          placeholder="Nom du domaine / de la salle"
          leftIcon="business-outline"
        />
        <EditorInput
          value={venue.street}
          onChangeText={(value) => updateVenue({ street: value })}
          placeholder="Rue, numéro"
          leftIcon="location-outline"
        />
        <View style={styles.venueRow}>
          <EditorInput
            value={venue.zip}
            onChangeText={(value) => updateVenue({ zip: value })}
            placeholder="Code postal"
            keyboardType="number-pad"
            maxLength={5}
            containerStyle={styles.venueHalf}
          />
          <EditorInput
            value={venue.city}
            onChangeText={(value) => updateVenue({ city: value })}
            placeholder="Ville"
            containerStyle={styles.venueHalf}
          />
        </View>
        <Text style={[styles.venueNote, { color: colors.textMuted }]}>
          Affiché sur l'invitation avec le bouton « Voir l'itinéraire » (Maps).
        </Text>
      </View>

      <Text style={[styles.sectionLabel, { color: colors.text }]}>Choisir un style</Text>
      <View style={styles.styleGrid}>
        {STYLES.map((item) => {
          const selected = programStyle === item.key;
          return (
            <Pressable
              key={item.key}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => setProgramStyle(item.key as ProgramStyleKey)}
              style={[
                styles.styleCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
                selected && { borderColor: colors.primary, backgroundColor: colors.chip },
              ]}
            >
              <Ionicons name={item.icon} size={19} color={selected ? colors.primary : colors.textMuted} />
              <Text style={[styles.styleLabel, { color: selected ? colors.primary : colors.textMuted }, selected && { fontFamily: 'Inter_600SemiBold' }]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/editor/programme-etape')}
        style={({ pressed }) => [styles.addBtn, { backgroundColor: colors.primary }, pressed && styles.pressed]}
      >
        <Ionicons name="add" size={16} color={colors.onPrimary} />
        <Text style={[styles.addLabel, { color: colors.onPrimary }]}>Ajouter une étape</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 32 },
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
  sectionLabel: {
    fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#121318',
    marginTop: 20, marginBottom: 10,
  },
  venueCard: {
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6DCCB',
    borderRadius: 14,
    padding: 14,
  },
  venueRow: { flexDirection: 'row', gap: 10 },
  venueHalf: { flex: 1 },
  venueNote: { fontFamily: 'Inter_400Regular', fontSize: 10.5, lineHeight: 15, color: '#9A9EA7' },
  styleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  styleCard: {
    flexGrow: 1,
    flexBasis: '47%',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.4,
    borderColor: '#E6DCCB',
    borderRadius: 14,
    paddingVertical: 14,
  },
  styleLabel: { fontFamily: 'Inter_500Medium', fontSize: 12.5, color: '#8A8278' },
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
