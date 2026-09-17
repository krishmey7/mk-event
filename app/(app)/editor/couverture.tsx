/**
 * ──────────────────────────────────────────────────────────────
 *  STUDIO — « Modifier la couverture » (planche 2, écran 2)
 * ──────────────────────────────────────────────────────────────
 *  Zone photo (aperçu + « Ajouter une photo » + changement de
 *  style), champs à compteurs (Titre 40 · Noms 50 · Message 100),
 *  date avec icône calendrier. Couleurs du thème : étape Thème.
 *  Chaque saisie met à jour l'aperçu en temps réel (EditorContext).
 * ──────────────────────────────────────────────────────────────
 */

import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { EditorInput } from '@/features/editor/components/EditorInput';
import { EditorHeader } from '@/features/editor/components/EditorHeader';
import { EditorHint } from '@/features/editor/components/EditorHint';
import { FieldWithCounter } from '@/features/editor/components/FieldWithCounter';
import { useEditor } from '@/features/editor/EditorContext';
import { useStudioChrome } from '@/features/editor/useStudioChrome';
import { goBackInEditor } from '@/features/editor/navigation';
import { pickLibraryImage } from '@/features/editor/imagePicker';
import type { PhotoFrameKey } from '@/features/invitation/types';
import type { IconName } from '@/features/templates/elegance/data';

export default function CouvertureScreen() {
  const router = useRouter();
  const {template, cover, updateCover} = useEditor();
  const c = useStudioChrome();
  const [showLook, setShowLook] = useState(false);

  /* Galerie native du téléphone — prévisualisation instantanée. */
  const importPhoto = async () => {
    const uri = await pickLibraryImage();
    if (uri) updateCover({ photoUri: uri });
  };

  /* Photo du couple — galerie native (champ dédié). */
  const importCouplePhoto = async () => {
    const uri = await pickLibraryImage();
    if (uri) updateCover({ couplePhotoUri: uri });
  };

  return (
    <View style={[styles.screen, { backgroundColor: c.bg }]}>
      <EditorHeader title="Couverture" onBack={() => goBackInEditor(router)} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <EditorHint>
          Commencez par la photo de fond, la date et vos noms. Les couleurs et animations sont plus bas, dans Apparence.
        </EditorHint>
        {/* Zone photo — appui = galerie native ; coin = choix du modèle */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ajouter une photo depuis la galerie"
          onPress={importPhoto}
          style={({ pressed }) => [styles.photoZone, pressed && styles.pressed]}
        >
          <Image source={{ uri: cover.photoUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(10, 8, 6, 0.38)' }]} />

          <View style={styles.photoPill}>
            <Ionicons name="camera-outline" size={16} color={c.text} />
            <Text style={[styles.photoPillLabel, { color: c.text }]}>Changer la photo de fond</Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Choisir dans la galerie du modèle"
            onPress={() => router.push('/editor/couverture-photo')}
            hitSlop={6}
            style={styles.photoCorner}
          >
            <Ionicons name="image-outline" size={16} color="#FFFFFF" />
          </Pressable>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/editor/couverture-photo')}
          style={({ pressed }) => [styles.styleRow, pressed && styles.pressed]}
        >
          <Ionicons name="images-outline" size={17} color={c.primary} />
          <Text style={[styles.styleRowLabel, { color: c.primary }]}>Choisir une photo du modèle</Text>
        </Pressable>

        {/* Champs de la couverture */}
        <FieldWithCounter label="Titre principal" value={cover.title} maxLength={40}>
          <EditorInput
            value={cover.title}
            onChangeText={(value) => updateCover({ title: value })}
            placeholder="Save the Date"
            maxLength={40}
          />
        </FieldWithCounter>

        <View style={styles.dateField}>
          <Text style={[styles.fieldLabel, { color: c.textMuted }]}>Date</Text>
          <EditorInput
            value={cover.dateLabel}
            onChangeText={(value) => updateCover({ dateLabel: value })}
            placeholder="14 juin 2025"
            rightElement={
              <Pressable hitSlop={8}>
                <Ionicons name="calendar-outline" size={19} color={c.textMuted} />
              </Pressable>
            }
          />
        </View>

        <FieldWithCounter label="Accroche" value={cover.kicker} maxLength={40}>
          <EditorInput
            value={cover.kicker}
            onChangeText={(value) => updateCover({ kicker: value })}
            placeholder="Cérémonie à 10h"
            maxLength={40}
          />
        </FieldWithCounter>

        <FieldWithCounter label="Noms des mariés" value={cover.couple} maxLength={50}>
          <EditorInput
            value={cover.couple}
            onChangeText={(value) => updateCover({ couple: value })}
            placeholder="Léa & Thomas"
            maxLength={50}
          />
        </FieldWithCounter>

        <FieldWithCounter label="Message invité" value={cover.guestLine} maxLength={100}>
          <EditorInput
            value={cover.guestLine}
            onChangeText={(value) => updateCover({ guestLine: value })}
            placeholder="Pour notre invité(e) {{Nom}}"
            maxLength={100}
          />
        </FieldWithCounter>

        {/* Photo du couple — upload + style de cadre */}
        <Text style={[styles.fieldLabel, { color: c.textMuted }]}>Photo de couverture du couple</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Choisir la photo du couple"
          onPress={importCouplePhoto}
          style={({ pressed }) => [styles.coupleZone, pressed && styles.pressed]}
        >
          <Image source={{ uri: cover.couplePhotoUri }} style={styles.couplePreview} resizeMode="cover" />
          <View style={styles.photoPill}>
            <Ionicons name="camera-outline" size={15} color={c.text} />
            <Text style={[styles.photoPillLabel, { color: c.text }]}>
              {cover.couplePhotoUri ? 'Changer la photo du couple' : 'Ajouter la photo du couple'}
            </Text>
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => setShowLook((value) => !value)}
          style={({ pressed }) => [
            styles.lookToggle,
            { backgroundColor: c.surface, borderColor: c.border },
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.lookToggleCopy}>
            <Text style={[styles.lookToggleTitle, { color: c.text }]}>Apparence</Text>
            <Text style={[styles.lookToggleHint, { color: c.textMuted }]}>Cadre et animations</Text>
          </View>
          <Ionicons name={showLook ? 'chevron-up' : 'chevron-down'} size={18} color={c.textMuted} />
        </Pressable>

        {showLook ? (
          <View style={styles.lookBlock}>
        <Text style={[styles.fieldLabel, { color: c.textMuted }]}>Style du cadre de photo</Text>
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
                  selected && { borderColor: c.primary, backgroundColor: c.chip },
                ]}
              >
                <Ionicons name={option.icon as IconName} size={16} color={selected ? c.primary : c.textMuted} />
                <Text
                  style={[styles.frameLabel, { color: selected ? c.primary : c.textMuted }, selected && { fontFamily: 'Inter_600SemiBold' }]}
                >
                  {option.label}
                </Text>
                <Text style={[styles.frameHint, { color: c.textMuted }]}>{option.hint}</Text>
              </Pressable>
            );
          })}
        </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 20, paddingBottom: 40, gap: 16 },
  pressed: { opacity: 0.85 },
  photoZone: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1E1B18',
    alignItems: 'center',
    justifyContent: 'center',
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
  photoPillLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#121318' },
  photoCorner: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  styleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    marginTop: -4,
  },
  styleRowLabel: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#6B5E4A' },
  dateField: { gap: 6 },
  fieldLabel: { fontFamily: 'Inter_500Medium', fontSize: 12.5, color: '#6F675C' },
  lookToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6DCCB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  lookToggleCopy: { flex: 1, gap: 2 },
  lookToggleTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#1C1712' },
  lookToggleHint: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#8A7E6E' },
  lookBlock: { gap: 16 },
  effectsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: -6 },
  effectCard: {
    flexGrow: 1,
    flexBasis: '47%',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.4,
    borderColor: '#E6DCCB',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 6,
  },
  effectLabel: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#8A8278' },
  effectHint: { fontFamily: 'Inter_400Regular', fontSize: 9.5, color: '#ADB5BD' },
  effectsNote: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10.5,
    lineHeight: 15,
    color: '#9A9EA7',
    marginTop: -4,
  },
  coupleZone: {
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1E1B18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  couplePreview: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  frameGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: -6 },
  frameCard: {
    flexGrow: 1,
    flexBasis: '47%',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.4,
    borderColor: '#E6DCCB',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  frameLabel: { fontFamily: 'Inter_500Medium', fontSize: 11.5, color: '#8A8278' },
  frameHint: { fontFamily: 'Inter_400Regular', fontSize: 9.5, color: '#ADB5BD' },
});
