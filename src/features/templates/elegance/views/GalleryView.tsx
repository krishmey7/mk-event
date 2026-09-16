/**
 * MK EVENT — Modèle « Élégance » · VUE 6 — Galerie photos.
 * Pilules de filtre (Tous / Cérémonie / Cocktail / Soirée) et
 * grille asymétrique à deux colonnes.
 */

import { useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';

import { FilterPill, SectionHeader } from '../widgets';
import { GALLERY, GALLERY_FILTERS, type GalleryCategory } from '../data';
import type { TemplateTheme } from '../themes';

export function GalleryView({ theme }: { theme: TemplateTheme }) {
  const [filter, setFilter] = useState<GalleryCategory>('tous');

  const photos = filter === 'tous' ? GALLERY : GALLERY.filter((p) => p.category === filter);
  const leftColumn = photos.filter((_, index) => index % 2 === 0);
  const rightColumn = photos.filter((_, index) => index % 2 === 1);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <SectionHeader
        title="Notre galerie"
        subtitle="Revivez les plus beaux moments de notre histoire…"
        theme={theme}
      />

      <View style={styles.filters}>
        {GALLERY_FILTERS.map((item) => (
          <FilterPill
            key={item.key}
            label={item.label}
            active={filter === item.key}
            onPress={() => setFilter(item.key)}
            theme={theme}
          />
        ))}
      </View>

      <View style={styles.grid}>
        <View style={styles.column}>
          {leftColumn.map((photo) => (
            <Image
              key={photo.id}
              source={{ uri: photo.uri }}
              resizeMode="cover"
              style={[styles.photo, { height: photo.height, backgroundColor: theme.colors.surfaceAlt }]}
            />
          ))}
        </View>
        <View style={styles.column}>
          {rightColumn.map((photo) => (
            <Image
              key={photo.id}
              source={{ uri: photo.uri }}
              resizeMode="cover"
              style={[styles.photo, { height: photo.height, backgroundColor: theme.colors.surfaceAlt }]}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 36, gap: 16 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  grid: { flexDirection: 'row', gap: 10 },
  column: { flex: 1, gap: 10 },
  photo: { width: '100%', borderRadius: 16 },
});
