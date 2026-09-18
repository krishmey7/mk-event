/**
 * Étape 1 — Infos / Affiche selon le type d’événement.
 * Mariage : couverture éditable ici (plus d’écran secondaire ni bandeau thème).
 */

import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { EditorCoverPreview } from '@/features/editor/components/EditorCoverPreview';
import { EditorHint } from '@/features/editor/components/EditorHint';
import { EditorInput } from '@/features/editor/components/EditorInput';
import { FieldWithCounter } from '@/features/editor/components/FieldWithCounter';
import { useEditor } from '@/features/editor/EditorContext';
import { pickLibraryImage } from '@/features/editor/imagePicker';
import { studioStepHint } from '@/features/editor/studioSteps';
import { VenuePlaceEditor } from '@/features/venue/VenuePlaceEditor';
import { useActiveEvent } from '@/context/ActiveEventContext';
import { useAppTheme } from '@/context/ThemePreferenceContext';
import { fontFamilies, spacing } from '@/constants/theme';
import type { PhotoFrameKey } from '@/features/invitation/types';
import type { IconName } from '@/features/templates/elegance/data';

export default function EditorInfosScreen() {
  const router = useRouter();
  const {
    cover,
    dressCode,
    setDressCode,
    venue,
    updateVenue,
    template,
    updateCover,
  } = useEditor();
  const { type: activeType } = useActiveEvent();
  const eventType = activeType || template.category;
  const { theme: appTheme } = useAppTheme();
  const c = appTheme.colors;
  const [showFrame, setShowFrame] = useState(false);

  const birthday = eventType === 'birthday';
  const conference = eventType === 'corporate';
  const wedding = !birthday && !conference;
  const hint = studioStepHint('index', eventType);

  const importPhoto = async () => {
    const uri = await pickLibraryImage();
    if (uri) updateCover({ photoUri: uri });
  };

  const importCouplePhoto = async () => {
    const uri = await pickLibraryImage();
    if (uri) updateCover({ couplePhotoUri: uri });
  };

  return (
    <ScrollView
      style={{ backgroundColor: c.background }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {hint ? <EditorHint>{hint}</EditorHint> : null}

      <View style={styles.previewWrap}>
        <EditorCoverPreview embedded />
      </View>

      {wedding ? (
        <>
          <Text style={[styles.heading, { color: c.textPrimary }]}>Couverture</Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Changer la photo de fond"
            onPress={importPhoto}
            style={({ pressed }) => [styles.photoZone, pressed && styles.pressed]}
          >
            <Image source={{ uri: cover.photoUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(10, 8, 6, 0.38)' }]} />
            <View style={styles.photoPill}>
              <Ionicons name="camera-outline" size={16} color="#121318" />
              <Text style={styles.photoPillLabel}>Changer la photo de fond</Text>
            </View>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/editor/couverture-photo')}
            style={({ pressed }) => [styles.styleRow, pressed && styles.pressed]}
          >
            <Ionicons name="images-outline" size={17} color={c.accent} />
            <Text style={[styles.styleRowLabel, { color: c.accent }]}>
              Choisir une photo du modèle
            </Text>
          </Pressable>

          <FieldWithCounter label="Titre principal" value={cover.title} maxLength={40}>
            <EditorInput
              value={cover.title}
              onChangeText={(value) => updateCover({ title: value })}
              placeholder="Save the Date"
              maxLength={40}
            />
          </FieldWithCounter>

          <View style={styles.gap} />
          <Text style={[styles.fieldLabel, { color: c.textMuted }]}>Date</Text>
          <EditorInput
            value={cover.dateLabel}
            onChangeText={(value) => updateCover({ dateLabel: value })}
            placeholder="14 juin 2025"
            rightElement={<Ionicons name="calendar-outline" size={19} color={c.textMuted} />}
          />

          <View style={styles.gap} />
          <FieldWithCounter label="Accroche" value={cover.kicker} maxLength={40}>
            <EditorInput
              value={cover.kicker}
              onChangeText={(value) => updateCover({ kicker: value })}
              placeholder="Cérémonie à 10h"
              maxLength={40}
            />
          </FieldWithCounter>

          <View style={styles.gap} />
          <FieldWithCounter label="Noms des mariés" value={cover.couple} maxLength={50}>
            <EditorInput
              value={cover.couple}
              onChangeText={(value) => updateCover({ couple: value })}
              placeholder="Léa & Thomas"
              maxLength={50}
            />
          </FieldWithCounter>

          <View style={styles.gap} />
          <FieldWithCounter label="Message invité" value={cover.guestLine} maxLength={100}>
            <EditorInput
              value={cover.guestLine}
              onChangeText={(value) => updateCover({ guestLine: value })}
              placeholder="Pour notre invité(e) {{Nom}}"
              maxLength={100}
            />
          </FieldWithCounter>

          <Text style={[styles.heading, { color: c.textPrimary }]}>Photo du couple</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Choisir la photo du couple"
            onPress={importCouplePhoto}
            style={({ pressed }) => [styles.coupleZone, pressed && styles.pressed]}
          >
            {cover.couplePhotoUri ? (
              <Image
                source={{ uri: cover.couplePhotoUri }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
            ) : null}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(10, 8, 6, 0.35)' }]} />
            <View style={styles.photoPill}>
              <Ionicons name="camera-outline" size={15} color="#121318" />
              <Text style={styles.photoPillLabel}>
                {cover.couplePhotoUri ? 'Changer la photo du couple' : 'Ajouter la photo du couple'}
              </Text>
            </View>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => setShowFrame((value) => !value)}
            style={({ pressed }) => [
              styles.lookToggle,
              { backgroundColor: c.surface, borderColor: c.border },
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.lookToggleCopy}>
              <Text style={[styles.lookToggleTitle, { color: c.textPrimary }]}>Cadre photo</Text>
              <Text style={[styles.lookToggleHint, { color: c.textMuted }]}>
                Forme du cadre sur la couverture
              </Text>
            </View>
            <Ionicons
              name={showFrame ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={c.textMuted}
            />
          </Pressable>

          {showFrame ? (
            <View style={styles.frameGrid}>
              {template.photoFrames.map((option) => {
                const selected = cover.coupleFrame === option.key;
                return (
                  <Pressable
                    key={option.key}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    onPress={() => updateCover({ coupleFrame: option.key as PhotoFrameKey })}
                    style={[
                      styles.frameCard,
                      { backgroundColor: c.surface, borderColor: c.border },
                      selected && { borderColor: c.accent, backgroundColor: c.accentMuted },
                    ]}
                  >
                    <Ionicons
                      name={option.icon as IconName}
                      size={16}
                      color={selected ? c.accent : c.textMuted}
                    />
                    <Text
                      style={[
                        styles.frameLabel,
                        { color: selected ? c.accent : c.textMuted },
                        selected && styles.frameLabelOn,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </>
      ) : null}

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
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/editor/couverture')}
            style={({ pressed }) => [styles.styleRow, { marginTop: 12 }, pressed && styles.pressed]}
          >
            <Ionicons name="image-outline" size={17} color={c.accent} />
            <Text style={[styles.styleRowLabel, { color: c.accent }]}>Photos & apparence</Text>
          </Pressable>
        </>
      ) : null}

      {conference ? (
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

      {!conference ? <VenuePlaceEditor venue={venue} onChange={updateVenue} /> : null}

      {!birthday ? (
        <>
          <Text style={[styles.heading, { color: c.textPrimary }]}>Dress code</Text>
          <Text style={[styles.lead, { color: c.textMuted }]}>
            Tenue ou ambiance affichée sur l’invitation.
          </Text>
          <EditorInput
            value={dressCode}
            onChangeText={setDressCode}
            placeholder={
              conference ? 'Ex. Business casual' : 'Ex. Tenue cocktail, tons eucalyptus'
            }
          />
        </>
      ) : null}
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
  heading: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 15,
    marginTop: spacing.md,
    marginBottom: 8,
  },
  fieldLabel: { fontFamily: fontFamilies.sansMedium, fontSize: 12.5, marginBottom: 6 },
  lead: { fontFamily: fontFamilies.sans, fontSize: 13, lineHeight: 18, marginBottom: 8 },
  gap: { height: 10 },
  photoZone: {
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1E1B18',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  coupleZone: {
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1E1B18',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  photoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  photoPillLabel: { fontFamily: fontFamilies.sansSemiBold, fontSize: 13, color: '#121318' },
  styleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  styleRowLabel: { fontFamily: fontFamilies.sansMedium, fontSize: 13 },
  lookToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 4,
  },
  lookToggleCopy: { flex: 1, gap: 2 },
  lookToggleTitle: { fontFamily: fontFamilies.sansSemiBold, fontSize: 14 },
  lookToggleHint: { fontFamily: fontFamilies.sans, fontSize: 12 },
  frameGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  frameCard: {
    flexGrow: 1,
    flexBasis: '47%',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.4,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  frameLabel: { fontFamily: fontFamilies.sansMedium, fontSize: 11.5 },
  frameLabelOn: { fontFamily: fontFamilies.sansSemiBold },
  pressed: { opacity: 0.9 },
});
