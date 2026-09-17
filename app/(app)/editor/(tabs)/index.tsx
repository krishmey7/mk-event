/**
 * Étape 1 — Infos / Affiche selon le type d’événement.
 */

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { EditorCoverPreview } from '@/features/editor/components/EditorCoverPreview';
import { EditorHint } from '@/features/editor/components/EditorHint';
import { EditorInput } from '@/features/editor/components/EditorInput';
import { useEditor } from '@/features/editor/EditorContext';
import { useActiveEvent } from '@/context/ActiveEventContext';
import { useAppTheme } from '@/context/ThemePreferenceContext';
import { fontFamilies, spacing } from '@/constants/theme';

export default function EditorInfosScreen() {
  const router = useRouter();
  const { cover, dressCode, setDressCode, venue, updateVenue, theme, template, updateCover } =
    useEditor();
  const { type: activeType } = useActiveEvent();
  const eventType = activeType || template.category;
  const { theme: appTheme } = useAppTheme();
  const c = appTheme.colors;

  const birthday = eventType === 'birthday';
  const conference = eventType === 'corporate';

  return (
    <ScrollView
      style={{ backgroundColor: c.background }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <EditorHint>
        {birthday
          ? 'Personnalisez l’affiche : textes, date et lieu. Une seule page pour vos invités.'
          : conference
            ? 'Nom de l’événement, dates et accroche. L’agenda et les intervenants viennent ensuite.'
            : 'Textes, lieu et dress code. Le design du modèle et les couleurs sont déjà fixés.'}
      </EditorHint>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Modifier la couverture"
        onPress={() => router.push('/editor/couverture')}
        style={({ pressed }) => [styles.previewWrap, pressed && styles.pressed]}
      >
        <EditorCoverPreview embedded />
        <View style={[styles.previewCta, { backgroundColor: 'rgba(15,18,22,0.72)' }]}>
          <Ionicons name="create-outline" size={16} color="#F6F1E8" />
          <Text style={styles.previewCtaLabel}>
            {birthday ? 'Modifier l’affiche' : 'Modifier la couverture'}
          </Text>
        </View>
      </Pressable>

      {birthday ? (
        <>
          <Text style={[styles.heading, { color: c.textPrimary }]}>Textes de l’affiche</Text>
          <EditorInput
            value={cover.title}
            onChangeText={(value) => updateCover({ title: value })}
            placeholder="Save the Date"
          />
          <View style={styles.gap} />
          <EditorInput
            value={cover.kicker}
            onChangeText={(value) => updateCover({ kicker: value })}
            placeholder="happy 28th"
          />
          <View style={styles.gap} />
          <EditorInput
            value={cover.couple}
            onChangeText={(value) => updateCover({ couple: value })}
            placeholder="Prénom du/de la fêté(e)"
          />
          <View style={styles.gap} />
          <EditorInput
            value={cover.dateLabel}
            onChangeText={(value) => updateCover({ dateLabel: value })}
            placeholder="04 | 05 | 2026"
          />
          <View style={styles.gap} />
          <EditorInput
            value={dressCode}
            onChangeText={setDressCode}
            placeholder="À 21h · Nom du lieu"
          />
        </>
      ) : conference ? (
        <>
          <Text style={[styles.heading, { color: c.textPrimary }]}>Événement</Text>
          <EditorInput
            value={cover.title}
            onChangeText={(value) => updateCover({ title: value, couple: value })}
            placeholder="Nom de la conférence"
          />
          <View style={styles.gap} />
          <EditorInput
            value={cover.kicker}
            onChangeText={(value) => updateCover({ kicker: value })}
            placeholder="Accroche · Innovation · Networking"
          />
          <View style={styles.gap} />
          <EditorInput
            value={cover.dateLabel}
            onChangeText={(value) => updateCover({ dateLabel: value })}
            placeholder="12–13 mars 2026"
          />
        </>
      ) : null}

      <Text style={[styles.heading, { color: c.textPrimary }]}>Lieu</Text>
      <EditorInput
        value={venue.name}
        onChangeText={(value) => updateVenue({ name: value })}
        placeholder="Nom du lieu"
      />
      <View style={styles.gap} />
      <EditorInput
        value={venue.city}
        onChangeText={(value) => updateVenue({ city: value })}
        placeholder="Ville"
      />
      {(birthday || conference) && (
        <>
          <View style={styles.gap} />
          <EditorInput
            value={venue.street}
            onChangeText={(value) => updateVenue({ street: value })}
            placeholder="Adresse"
          />
        </>
      )}

      {!birthday ? (
        <>
          <Text style={[styles.heading, { color: c.textPrimary }]}>
            {conference ? 'Dress code' : 'Dress code'}
          </Text>
          <Text style={[styles.lead, { color: c.textMuted }]}>
            Indiquez l’ambiance ou la tenue attendue. Palette : {theme.label}.
          </Text>
          <EditorInput
            value={dressCode}
            onChangeText={setDressCode}
            placeholder={
              conference
                ? 'Ex. Business casual'
                : 'Ex. Tenue cocktail, tons eucalyptus'
            }
          />
        </>
      ) : null}

      <View style={[styles.swatchRow, { borderColor: c.border, backgroundColor: c.surface }]}>
        <View style={[styles.swatch, { backgroundColor: theme.swatch || c.accent }]} />
        <Text style={[styles.swatchLabel, { color: c.textSecondary }]}>
          Thème · {cover.couple || cover.title || 'À personnaliser'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: 40, gap: 4 },
  previewWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    height: 280,
    marginBottom: spacing.md,
  },
  previewCta: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  previewCtaLabel: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 13,
    color: '#F6F1E8',
  },
  heading: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 15,
    marginTop: spacing.md,
    marginBottom: 8,
  },
  lead: { fontFamily: fontFamilies.sans, fontSize: 13, lineHeight: 18, marginBottom: 8 },
  gap: { height: 10 },
  swatchRow: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  swatch: { width: 22, height: 22, borderRadius: 11 },
  swatchLabel: { fontFamily: fontFamilies.sansMedium, fontSize: 13, flex: 1 },
  pressed: { opacity: 0.9 },
});
