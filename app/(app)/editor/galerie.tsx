/**
 * Route legacy — même flux simple que l’étape Photos.
 */

import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { EditorHeader } from '@/features/editor/components/EditorHeader';
import { useEditor } from '@/features/editor/EditorContext';
import { useStudioChrome } from '@/features/editor/useStudioChrome';
import { pickLibraryImages } from '@/features/editor/imagePicker';
import { goBackInEditor } from '@/features/editor/navigation';

export default function GalerieScreen() {
  const router = useRouter();
  const { gallery, addGalleryPhotos, removeGalleryPhoto } = useEditor();
  const colors = useStudioChrome();
  const [importing, setImporting] = useState(false);

  const handleImport = async () => {
    if (importing) return;
    setImporting(true);
    try {
      const uris = await pickLibraryImages();
      addGalleryPhotos(uris, 'ceremonie');
    } finally {
      setImporting(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <EditorHeader title="Galerie" onBack={() => goBackInEditor(router)} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.styleNote, { color: colors.textMuted }]}>
          Style d’affichage figé par le modèle. Ajoutez ou retirez des photos ici.
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ busy: importing }}
          onPress={() => void handleImport()}
          disabled={importing}
          style={({ pressed }) => [
            styles.addBtn,
            { backgroundColor: colors.primary },
            pressed && styles.pressed,
            importing && styles.importing,
          ]}
        >
          <Ionicons
            name={importing ? 'hourglass-outline' : 'add-circle-outline'}
            size={17}
            color={colors.onPrimary}
          />
          <Text style={[styles.addLabel, { color: colors.onPrimary }]}>
            {importing ? 'Import en cours…' : 'Ajouter des photos'}
          </Text>
        </Pressable>

        <Text style={[styles.count, { color: colors.textMuted }]}>
          {gallery.length} photo{gallery.length > 1 ? 's' : ''}
        </Text>
        <View style={styles.grid}>
          {gallery.map((item) => (
            <View key={item.id} style={[styles.cell, { borderColor: colors.border }]}>
              <Image source={{ uri: item.uri }} style={styles.cellImage} resizeMode="cover" />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Supprimer la photo"
                onPress={() => removeGalleryPhoto(item.id)}
                hitSlop={5}
                style={styles.remove}
              >
                <Ionicons name="close" size={13} color="#FFFFFF" />
              </Pressable>
            </View>
          ))}
        </View>

        {gallery.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="images-outline" size={22} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Aucune photo pour l’instant
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  pressed: { opacity: 0.85 },
  importing: { opacity: 0.6 },
  styleNote: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    minHeight: 48,
    borderRadius: 999,
  },
  addLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  count: { fontFamily: 'Inter_500Medium', fontSize: 12, marginTop: 18, marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cell: {
    flexGrow: 1,
    flexBasis: '30%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  cellImage: { width: '100%', height: '100%' },
  remove: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(18, 19, 24, 0.62)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 34 },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 13 },
});
