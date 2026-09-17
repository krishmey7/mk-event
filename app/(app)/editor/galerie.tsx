/**
 * STUDIO — Galerie photos (planche 2, écran 8).
 * Filtres Toutes / Cérémonie / Cocktail / Soirée, grille de gestion
 * avec suppression, et import multiple depuis la galerie du
 * téléphone (expo-image-picker, allowsMultipleSelection).
 */

import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { EditorHeader } from '@/features/editor/components/EditorHeader';
import { useEditor, type GalleryCategory } from '@/features/editor/EditorContext';
import { useStudioChrome } from '@/features/editor/useStudioChrome';
import { pickLibraryImages } from '@/features/editor/imagePicker';
import { goBackInEditor } from '@/features/editor/navigation';

const FILTERS = [
  { key: 'toutes', label: 'Toutes' },
  { key: 'ceremonie', label: 'Cérémonie' },
  { key: 'cocktail', label: 'Cocktail' },
  { key: 'soiree', label: 'Soirée' },
] as const;

const CATEGORIES: GalleryCategory[] = ['ceremonie', 'cocktail', 'soiree'];

export default function GalerieScreen() {
  const router = useRouter();
  const {gallery, addGalleryPhotos, removeGalleryPhoto} = useEditor();
  const colors = useStudioChrome();
  const [filter, setFilter] = useState<'toutes' | GalleryCategory>('toutes');
  const [target, setTarget] = useState<GalleryCategory>('ceremonie');
  const [importing, setImporting] = useState(false);

  const visible = filter === 'toutes' ? gallery : gallery.filter((item) => item.category === filter);

  /* Import multiple — galerie native du téléphone. */
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
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <EditorHeader title="Galerie" onBack={() => goBackInEditor(router)} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.styleNote, { color: colors.textMuted }]}>
          Style d’affichage figé par le modèle. Ajoutez ou retirez des photos ici.
        </Text>

        {/* Filtres par catégorie */}
        <Text style={[styles.galleryLabel, { color: colors.text }]}>Filtres par catégorie</Text>
        <View style={styles.filters}>
          {FILTERS.map((item) => {
            const selected = filter === item.key;
            return (
              <Pressable
                key={item.key}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => setFilter(item.key)}
                style={[
                  styles.filterPill,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  selected && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
              >
                <Text style={[styles.filterLabel, { color: selected ? colors.onPrimary : colors.textMuted }]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Catégorie cible de l'import */}
        <Text style={[styles.label, { color: colors.textMuted }]}>Catégorie des nouvelles photos</Text>
        <View style={styles.targetRow}>
          {CATEGORIES.map((key) => {
            const selected = target === key;
            const label = FILTERS.find((item) => item.key === key)?.label ?? key;
            return (
              <Pressable
                key={key}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => setTarget(key)}
                style={[
                  styles.targetPill,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  selected && { borderColor: colors.primary, backgroundColor: colors.chip },
                ]}
              >
                <Text style={[styles.targetLabel, selected && { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

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
          <Ionicons name={importing ? 'hourglass-outline' : 'add-circle-outline'} size={17} color={colors.onPrimary} />
          <Text style={[styles.addLabel, { color: colors.onPrimary }]}>
            {importing ? 'Import en cours…' : 'Ajouter des photos'}
          </Text>
        </Pressable>

        {/* Grille de gestion */}
        <Text style={styles.count}>
          {visible.length} photo{visible.length > 1 ? 's' : ''}
        </Text>
        <View style={styles.grid}>
          {visible.map((item) => (
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
              <View style={styles.catChip}>
                <Text style={styles.catLabel}>
                  {FILTERS.find((entry) => entry.key === item.category)?.label}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {visible.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="images-outline" size={22} color="#ADB5BD" />
            <Text style={styles.emptyText}>Aucune photo dans cette catégorie</Text>
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
  sectionLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#121318', marginBottom: 10 },
  galleryLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12.5,
    color: '#6F675C',
    marginTop: 20,
    marginBottom: 12,
  },
  styleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  styleCard: {
    flexGrow: 1,
    flexBasis: '30%',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.4,
    borderColor: '#E6DCCB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  styleLabel: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#8A8278' },
  styleHint: { fontFamily: 'Inter_400Regular', fontSize: 9.5, color: '#ADB5BD' },
  styleNote: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10.5,
    color: '#9A9EA7',
    marginTop: -2,
    marginBottom: 16,
  },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  filterPill: {
    borderRadius: 999,
    borderWidth: 1.2,
    borderColor: '#E2E5E9',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  filterLabel: { fontFamily: 'Inter_500Medium', fontSize: 12.5, color: '#6F675C' },
  label: { fontFamily: 'Inter_500Medium', fontSize: 12.5, color: '#6F675C', marginBottom: 8 },
  targetRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  targetPill: {
    flexGrow: 1,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.4,
    borderColor: '#E6DCCB',
    backgroundColor: '#FFFFFF',
    paddingVertical: 9,
  },
  targetLabel: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#8A8278' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    minHeight: 48,
    borderRadius: 999,
  },
  addLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  count: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#9A9EA7', marginTop: 18, marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cell: {
    flexGrow: 1,
    flexBasis: '30%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    backgroundColor: '#EDE6D8',
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
  catChip: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    backgroundColor: 'rgba(18, 19, 24, 0.55)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  catLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 9.5, color: '#FFFFFF' },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 34 },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#9A9EA7' },
});
