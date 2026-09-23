/**
 * Prévisualisation fidèle — toujours calée sur l’état LIVE du studio.
 */

import { useCallback, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GuestInvitation } from '@/features/invitation/GuestInvitation';
import { STUDIO_PREVIEW_GUEST } from '@/features/invitation/guestRegistry';
import { useEditor } from '@/features/editor/EditorContext';

export default function PrevisualisationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    template,
    cover,
    guests,
    drinks,
    diets,
    revealEffect,
    galleryStyle,
    venue,
    invitationSlug,
    dressCode,
    story,
    program,
    gallery,
    voix,
    speakers,
    practical,
  } = useEditor();

  /** Remonte GuestInvitation à chaque ouverture de Voir. */
  const [visitId, setVisitId] = useState(0);
  useFocusEffect(
    useCallback(() => {
      setVisitId((n) => n + 1);
    }, []),
  );

  const config = useMemo(
    () => ({
      templateKey: template.key,
      guests,
      drinks,
      diets,
      themeKey: cover.themeKey,
      revealEffect,
      galleryStyle,
      venue,
      couplePhoto: { uri: cover.couplePhotoUri, frame: cover.coupleFrame },
      dressCode,
      cover: {
        title: cover.title,
        dateLabel: cover.dateLabel,
        couple: cover.couple,
        guestLine: cover.guestLine,
        kicker: cover.kicker,
        photoUri: cover.photoUri,
      },
      story,
      program,
      gallery: (gallery.length > 0
        ? gallery
        : template.galleryImages.map((uri, index) => ({
            uri,
            category: (['ceremonie', 'cocktail', 'soiree'] as const)[index % 3],
          }))
      ).map((item) => ({ uri: item.uri, category: item.category })),
      countdownImage: template.countdownImage,
      voix,
      speakers,
      practical,
    }),
    [
      template,
      cover,
      guests,
      drinks,
      diets,
      revealEffect,
      galleryStyle,
      venue,
      dressCode,
      story,
      program,
      gallery,
      voix,
      speakers,
      practical,
    ],
  );

  const liveKey = [
    visitId,
    cover.coupleFrame,
    cover.couplePhotoUri,
    cover.photoUri,
    cover.title,
    cover.dateLabel,
    cover.couple,
    cover.kicker,
    cover.guestLine,
    dressCode,
    venue.name,
    venue.city,
    story.length,
    program.length,
    gallery.length,
    speakers.length,
  ].join('|');

  const guest = guests[0] ?? STUDIO_PREVIEW_GUEST;

  const exit = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/editor');
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      {Platform.OS === 'web' ? (
        <View style={styles.webBar}>
          <Pressable accessibilityRole="button" onPress={exit} hitSlop={8} style={styles.webBack}>
            <Ionicons name="chevron-back" size={18} color="#FFFFFF" />
            <Text style={styles.webLabel}>Retour au studio</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.body}>
        <GuestInvitation key={liveKey} slug={invitationSlug} config={config} guest={guest} />
      </View>

      {Platform.OS !== 'web' ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fermer la prévisualisation"
          onPress={exit}
          hitSlop={8}
          style={[styles.floatingClose, { top: insets.top + 10 }]}
        >
          <Ionicons name="close" size={16} color="#FFFFFF" />
          <Text style={styles.floatingLabel}>Retour</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#14110E' },
  body: { flex: 1 },
  webBar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#121318',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  webBack: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  webLabel: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#FFFFFF' },
  floatingClose: {
    position: 'absolute',
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(18, 19, 24, 0.55)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  floatingLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 11.5, color: '#FFFFFF' },
});
