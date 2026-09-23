/**
 * Étape Photos — ajouter / retirer. Pas de catégories ni filtres.
 */

import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { EditorHint } from '@/features/editor/components/EditorHint';
import { useEditor } from '@/features/editor/EditorContext';
import { pickLibraryImages } from '@/features/editor/imagePicker';
import { studioStepHint } from '@/features/editor/studioSteps';
import { useActiveEvent } from '@/context/ActiveEventContext';
import { useAppTheme } from '@/context/ThemePreferenceContext';
import { fontFamilies, spacing } from '@/constants/theme';

export default function PhotosTabScreen() {
  const { gallery, addGalleryPhotos, removeGalleryPhoto, template } = useEditor();
  const { type: activeType } = useActiveEvent();
  const eventType = activeType || template.category;
  const { theme } = useAppTheme();
  const c = theme.colors;
  const [importing, setImporting] = useState(false);
  const hint = studioStepHint('photos', eventType);

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
    <ScrollView
      style={{ backgroundColor: c.background }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {hint ? <EditorHint>{hint}</EditorHint> : null}

      <Pressable
        accessibilityRole="button"
        onPress={() => void handleImport()}
        style={[styles.importBtn, { backgroundColor: c.accent }]}
      >
        <Ionicons name="images-outline" size={18} color={c.onAccent} />
        <Text style={[styles.importLabel, { color: c.onAccent }]}>
          {importing ? 'Import…' : 'Ajouter des photos'}
        </Text>
      </Pressable>

      <View style={styles.grid}>
        {gallery.map((item) => (
          <View key={item.id} style={styles.cell}>
            <Image source={{ uri: item.uri }} style={styles.thumb} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Supprimer"
              onPress={() => removeGalleryPhoto(item.id)}
              style={styles.remove}
            >
              <Ionicons name="close" size={14} color="#fff" />
            </Pressable>
          </View>
        ))}
      </View>

      {gallery.length === 0 ? (
        <Text style={[styles.empty, { color: c.textMuted }]}>
          Aucune photo pour l’instant.
        </Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: 40, gap: 12 },
  importBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
    borderRadius: 12,
  },
  importLabel: { fontFamily: fontFamilies.sansSemiBold, fontSize: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cell: { width: '31%', aspectRatio: 1, borderRadius: 10, overflow: 'hidden' },
  thumb: { width: '100%', height: '100%' },
  remove: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { fontFamily: fontFamilies.sans, fontSize: 13, marginTop: 8 },
});
