/**
 * MK EVENTS — Modèle « Élégance » · VUE 6 — Galerie photos.
 * Grille asymétrique à deux colonnes (sans filtres).
 */

import { Image, ScrollView, StyleSheet, View } from 'react-native';

import { SectionHeader } from '../widgets';
import { GALLERY } from '../data';
import type { TemplateTheme } from '../themes';

export function GalleryView({ theme }: { theme: TemplateTheme }) {
  const leftColumn = GALLERY.filter((_, index) => index % 2 === 0);
  const rightColumn = GALLERY.filter((_, index) => index % 2 === 1);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <SectionHeader
        title="Notre galerie"
        subtitle="Revivez les plus beaux moments de notre histoire…"
        theme={theme}
      />

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
  grid: { flexDirection: 'row', gap: 10 },
  column: { flex: 1, gap: 10 },
  photo: { width: '100%', borderRadius: 16 },
});
