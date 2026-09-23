/**
 * Étape 1 — Infos / Affiche selon le type d’événement.
 */

import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { CoverPhotoSheet } from '@/features/editor/components/CoverPhotoSheet';
import { CoupleFramePicker } from '@/features/editor/components/CoupleFramePicker';
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

export default function EditorInfosScreen() {
  const {
    cover,
    dressCode,
    setDressCode,
    venue,
    updateVenue,
    template,
    theme,
    updateCover,
  } = useEditor();
  const { type: activeType } = useActiveEvent();
  const eventType = activeType || template.category;
  const { theme: appTheme } = useAppTheme();
  const c = appTheme.colors;
  const [photoSheet, setPhotoSheet] = useState(false);

  const birthday = eventType === 'birthday';
  const conference = eventType === 'corporate';
  const wedding = !birthday && !conference;
  const hint = studioStepHint('index', eventType);

  const importCouplePhoto = async () => {
    const uri = await pickLibraryImage();
    if (uri) updateCover({ couplePhotoUri: uri });
  };

  return (
    <>
      <ScrollView
        style={{ backgroundColor: c.background }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {hint ? <EditorHint>{hint}</EditorHint> : null}

        {wedding ? (
          <>
            <Text style={[styles.heading, { color: c.textPrimary }]}>Couverture</Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Changer la photo de fond"
              onPress={() => setPhotoSheet(true)}
              style={({ pressed }) => [styles.photoZone, pressed && styles.pressed]}
            >
              <Image
                source={{ uri: cover.photoUri }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
              <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(10, 8, 6, 0.38)' }]} />
              <View style={styles.photoPill}>
                <Ionicons name="camera-outline" size={16} color="#121318" />
                <Text style={styles.photoPillLabel}>Changer la photo de fond</Text>
              </View>
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

            <Text style={[styles.heading, { color: c.textPrimary }]}>Photo du couple</Text>
            <CoupleFramePicker
              uri={cover.couplePhotoUri}
              frame={cover.coupleFrame}
              options={template.photoFrames}
              accent={theme.colors.accent}
              onChangeFrame={(key) => updateCover({ coupleFrame: key })}
              onChangePhoto={() => void importCouplePhoto()}
            />

            <VenuePlaceEditor venue={venue} onChange={updateVenue} />

            <Text style={[styles.heading, { color: c.textPrimary }]}>Dress code</Text>
            <EditorInput
              value={dressCode}
              onChangeText={setDressCode}
              placeholder="Ex. Tenue cocktail, tons eucalyptus"
            />
          </>
        ) : null}

        {birthday ? (
          <>
            <Text style={[styles.heading, { color: c.textPrimary }]}>Textes de l’affiche</Text>
            <Text style={[styles.fieldLabel, { color: c.textMuted }]}>Titre</Text>
            <EditorInput
              value={cover.title}
              onChangeText={(value) => updateCover({ title: value })}
              placeholder="Save the Date"
            />
            <View style={styles.gap} />
            <Text style={[styles.fieldLabel, { color: c.textMuted }]}>Accroche</Text>
            <EditorInput
              value={cover.kicker}
              onChangeText={(value) => updateCover({ kicker: value })}
              placeholder="happy 28th"
            />
            <View style={styles.gap} />
            <Text style={[styles.fieldLabel, { color: c.textMuted }]}>Qui fête</Text>
            <EditorInput
              value={cover.couple}
              onChangeText={(value) => updateCover({ couple: value })}
              placeholder="Prénom"
            />
            <View style={styles.gap} />
            <Text style={[styles.fieldLabel, { color: c.textMuted }]}>Date</Text>
            <EditorInput
              value={cover.dateLabel}
              onChangeText={(value) => updateCover({ dateLabel: value })}
              placeholder="04 | 05 | 2026"
            />
            <View style={styles.gap} />
            <Text style={[styles.fieldLabel, { color: c.textMuted }]}>Heure & lieu</Text>
            <EditorInput
              value={dressCode}
              onChangeText={setDressCode}
              placeholder="À 21h · Nom du lieu"
            />
            <Pressable
              accessibilityRole="button"
              onPress={() => setPhotoSheet(true)}
              style={({ pressed }) => [styles.styleRow, { marginTop: 12 }, pressed && styles.pressed]}
            >
              <Ionicons name="image-outline" size={17} color={c.accent} />
              <Text style={[styles.styleRowLabel, { color: c.accent }]}>Photo de fond</Text>
            </Pressable>
          </>
        ) : null}

        {conference ? (
          <>
            <Text style={[styles.heading, { color: c.textPrimary }]}>Événement</Text>
            <Text style={[styles.fieldLabel, { color: c.textMuted }]}>Nom</Text>
            <EditorInput
              value={cover.title}
              onChangeText={(value) => updateCover({ title: value, couple: value })}
              placeholder="Nom de la conférence"
            />
            <View style={styles.gap} />
            <Text style={[styles.fieldLabel, { color: c.textMuted }]}>Accroche</Text>
            <EditorInput
              value={cover.kicker}
              onChangeText={(value) => updateCover({ kicker: value })}
              placeholder="Innovation · Networking"
            />
            <View style={styles.gap} />
            <Text style={[styles.fieldLabel, { color: c.textMuted }]}>Dates</Text>
            <EditorInput
              value={cover.dateLabel}
              onChangeText={(value) => updateCover({ dateLabel: value })}
              placeholder="12–13 mars 2026"
            />
          </>
        ) : null}
      </ScrollView>
      <CoverPhotoSheet visible={photoSheet} onClose={() => setPhotoSheet(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: 40, gap: 4 },
  heading: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 15,
    marginTop: spacing.md,
    marginBottom: 8,
  },
  fieldLabel: { fontFamily: fontFamilies.sansMedium, fontSize: 12.5, marginBottom: 6 },
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
  pressed: { opacity: 0.9 },
});
