/**
 * STUDIO — « Choisir la photo de couverture » (planche 2, écran 11).
 * Zone d'upload (JPG/PNG · 10 Mo) + sélection dans la galerie :
 * la photo choisie alimente l'aperçu temps réel du studio.
 */

import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { EditorHeader } from '@/features/editor/components/EditorHeader';
import { useEditor } from '@/features/editor/EditorContext';
import { useStudioChrome } from '@/features/editor/useStudioChrome';
import { goBackInEditor } from '@/features/editor/navigation';
import { pickLibraryImage } from '@/features/editor/imagePicker';

export default function CouverturePhotoScreen() {
  const router = useRouter();
  const {template, cover, updateCover} = useEditor();
  const colors = useStudioChrome();
  const candidates = template.galleryImages;

  const pick = (uri: string) => {
    updateCover({ photoUri: uri });
    router.back();
  };

  /* Import depuis la vraie galerie du téléphone. */
  const importFromDevice = async () => {
    const uri = await pickLibraryImage();
    if (uri) pick(uri);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <EditorHeader title="Photo de fond" onBack={() => goBackInEditor(router)} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Importer une photo depuis la galerie du téléphone"
          onPress={importFromDevice}
          style={({ pressed }) => [
            styles.dropZone,
            { backgroundColor: colors.surface, borderColor: colors.border },
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="cloud-upload-outline" size={24} color={colors.primary} />
          <Text style={[styles.dropTitle, { color: colors.text }]}>Importer depuis la galerie</Text>
          <Text style={[styles.dropHint, { color: colors.textMuted }]}>JPG, PNG · Max 10 Mo</Text>
        </Pressable>

        <Text style={[styles.galleryLabel, { color: colors.textMuted }]}>Ou choisir dans votre galerie</Text>
        <View style={styles.grid}>
          {candidates.map((uri) => {
            const selected = cover.photoUri === uri;
            return (
              <Pressable
                key={uri}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => pick(uri)}
                style={({ pressed }) => [styles.cell, selected && { borderColor: colors.primary }, pressed && styles.pressed]}
              >
                <Image source={{ uri }} style={styles.cellImage} resizeMode="cover" />
                {selected ? (
                  <View style={[styles.check, { backgroundColor: colors.primary }]}>
                    <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  pressed: { opacity: 0.85 },
  dropZone: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 150,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#D4C8B3',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  dropTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13.5, color: '#121318', marginTop: 4 },
  dropHint: { fontFamily: 'Inter_400Regular', fontSize: 11.5, color: '#9A9EA7' },
  galleryLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12.5,
    color: '#6F675C',
    marginTop: 20,
    marginBottom: 12,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cell: {
    flexGrow: 1,
    flexBasis: '30%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2.5,
    borderColor: 'transparent',
  },
  cellSelected: {},
  cellImage: { width: '100%', height: '100%' },
  check: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
