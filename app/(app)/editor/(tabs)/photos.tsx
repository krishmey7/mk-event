/**
 * Étape Photos — galerie uniquement (style d’affichage figé par le modèle).
 */

import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { EditorHint } from '@/features/editor/components/EditorHint';
import { useEditor, type GalleryCategory } from '@/features/editor/EditorContext';
import { pickLibraryImages } from '@/features/editor/imagePicker';
import { useAppTheme } from '@/context/ThemePreferenceContext';
import { fontFamilies, spacing } from '@/constants/theme';

const FILTERS = [
  { key: 'toutes', label: 'Toutes' },
  { key: 'ceremonie', label: 'Cérémonie' },
  { key: 'cocktail', label: 'Cocktail' },
  { key: 'soiree', label: 'Soirée' },
] as const;

const CATEGORIES: GalleryCategory[] = ['ceremonie', 'cocktail', 'soiree'];

export default function PhotosTabScreen() {
  const { gallery, addGalleryPhotos, removeGalleryPhoto } = useEditor();
  const { theme } = useAppTheme();
  const c = theme.colors;
  const [filter, setFilter] = useState<'toutes' | GalleryCategory>('toutes');
  const [target, setTarget] = useState<GalleryCategory>('ceremonie');
  const [importing, setImporting] = useState(false);

  const visible = filter === 'toutes' ? gallery : gallery.filter((item) => item.category === filter);

  const handleImport = async () => {
    if (importing) return;
    setImporting(true);
    try {
      const uris = await pickLibraryImages();
      addGalleryPhotos(uris, target);
      if (filter !== 'toutes') setFilter(target);
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
      <EditorHint>
        Étape 2 : ajoutez vos photos. La mise en page de la galerie est définie par le modèle.
      </EditorHint>

      <Text style={[styles.label, { color: c.textPrimary }]}>Catégorie d’import</Text>
      <View style={styles.row}>
        {CATEGORIES.map((key) => {
          const on = target === key;
          return (
            <Pressable
              key={key}
              onPress={() => setTarget(key)}
              style={[
                styles.chip,
                { borderColor: c.border, backgroundColor: c.surface },
                on && { borderColor: c.accent, backgroundColor: c.accentSoft },
              ]}
            >
              <Text style={{ color: on ? c.accent : c.textMuted, fontFamily: fontFamilies.sansMedium, fontSize: 12 }}>
                {key}
              </Text>
            </Pressable>
          );
        })}
      </View>

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

      <View style={styles.row}>
        {FILTERS.map((item) => {
          const on = filter === item.key;
          return (
            <Pressable
              key={item.key}
              onPress={() => setFilter(item.key)}
              style={[
                styles.chip,
                { borderColor: c.border, backgroundColor: c.surface },
                on && { borderColor: c.accent, backgroundColor: c.accentSoft },
              ]}
            >
              <Text style={{ color: on ? c.accent : c.textMuted, fontFamily: fontFamilies.sansMedium, fontSize: 12 }}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.grid}>
        {visible.map((item) => (
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

      {visible.length === 0 ? (
        <Text style={[styles.empty, { color: c.textMuted }]}>Aucune photo pour ce filtre.</Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: 40, gap: 12 },
  label: { fontFamily: fontFamilies.sansSemiBold, fontSize: 14 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
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
