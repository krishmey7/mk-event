/**
 * STUDIO — Bibliothèque média (planche 2, écran 11bis).
 * Résumé vivant des médias de l'invitation : photos par catégorie,
 * musique sélectionnée et raccourcis vers les écrans de gestion.
 */

import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { EditorHeader } from '@/features/editor/components/EditorHeader';
import { useEditor, VOICE_MUSICS } from '@/features/editor/EditorContext';
import { goBackInEditor } from '@/features/editor/navigation';

const CATEGORY_LABELS: Record<string, string> = {
  ceremonie: 'Cérémonie',
  cocktail: 'Cocktail',
  soiree: 'Soirée',
};

export default function BibliothequeScreen() {
  const router = useRouter();
  const { template, gallery, voix, theme } = useEditor();
  const colors = theme.colors;

  const music = VOICE_MUSICS.find((item) => item.key === voix.musicKey);
  const counts = gallery.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] ?? 0) + 1;
    return acc;
  }, {});

  const shortcuts = [
    { icon: 'images-outline', label: 'Gérer la galerie', hint: `${gallery.length} photos`, route: '/editor/galerie' },
    { icon: 'musical-notes-outline', label: 'Voix & musique', hint: music?.label ?? '—', route: '/editor/voix' },
    { icon: 'image-outline', label: 'Photo de couverture', hint: 'Choisir dans le modèle', route: '/editor/couverture-photo' },
  ] as const;

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <EditorHeader title="Médias" onBack={() => goBackInEditor(router)} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Photos de l'invitation</Text>
        <View style={styles.countRow}>
          <View style={[styles.countCard, { backgroundColor: colors.chip }]}>
            <Text style={[styles.countValue, { color: colors.primary }]}>{gallery.length}</Text>
            <Text style={[styles.countLabel, { color: colors.primary }]}>Total</Text>
          </View>
          {Object.keys(CATEGORY_LABELS).map((key) => (
            <View key={key} style={[styles.countCard, { backgroundColor: colors.chip }]}>
              <Text style={[styles.countValue, { color: colors.primary }]}>{counts[key] ?? 0}</Text>
              <Text style={[styles.countLabel, { color: colors.primary }]}>{CATEGORY_LABELS[key]}</Text>
            </View>
          ))}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.strip}>
          {gallery.map((item) => (
            <Image key={item.id} source={{ uri: item.uri }} style={styles.stripImage} />
          ))}
        </ScrollView>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Musique sélectionnée</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.row}>
            <View style={[styles.musicIcon, { backgroundColor: colors.chip }]}>
              <Ionicons name={music?.icon ?? 'musical-notes-outline'} size={17} color={colors.primary} />
            </View>
            <View style={styles.rowBody}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>{music?.label ?? 'Aucune'}</Text>
              <Text style={[styles.rowHint, { color: colors.textMuted }]}>
                Lecture automatique {voix.autoplay ? 'activée' : 'désactivée'} · Boucle {voix.loop ? 'activée' : 'désactivée'}
              </Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Gérer</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {shortcuts.map((shortcut, index) => (
            <View key={shortcut.label}>
              {index > 0 ? <View style={styles.divider} /> : null}
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push(shortcut.route)}
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}
              >
                <Ionicons name={shortcut.icon} size={18} color={colors.primary} />
                <View style={styles.rowBody}>
                  <Text style={[styles.rowLabel, { color: colors.text }]}>{shortcut.label}</Text>
                  <Text style={[styles.rowHint, { color: colors.textMuted }]}>{shortcut.hint}</Text>
                </View>
                <Ionicons name="chevron-forward" size={15} color={colors.accent} />
              </Pressable>
            </View>
          ))}
        </View>

        <Text style={[styles.footnote, { color: colors.textMuted }]}>
          Photos du modèle « {template.name} » — vos propres imports s'ajoutent depuis la galerie.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  pressed: { opacity: 0.85 },
  sectionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#121318', marginBottom: 10 },
  countRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  countCard: {
    flexGrow: 1,
    alignItems: 'center',
    gap: 2,
    borderRadius: 14,
    paddingVertical: 12,
  },
  countValue: { fontFamily: 'Inter_600SemiBold', fontSize: 19 },
  countLabel: { fontFamily: 'Inter_500Medium', fontSize: 10.5 },
  strip: { marginBottom: 18 },
  stripImage: { width: 96, height: 96, borderRadius: 12, marginRight: 8 },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6DCCB',
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
  rowBody: { flex: 1, gap: 2 },
  rowLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13.5, color: '#121318' },
  rowHint: { fontFamily: 'Inter_400Regular', fontSize: 11.5, color: '#9A9EA7' },
  musicIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  divider: { height: 1, backgroundColor: '#EDE6D8' },
  footnote: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10.5,
    lineHeight: 15,
    color: '#9A9EA7',
    textAlign: 'center',
  },
});
