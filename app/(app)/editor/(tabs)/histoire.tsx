/**
 * Onglet « Histoire » — chaque étape se modifie ou se supprime.
 */

import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useEditor } from '@/features/editor/EditorContext';
import { EditorHint } from '@/features/editor/components/EditorHint';
import { confirmDelete } from '@/features/editor/confirmDelete';

export default function HistoireTabScreen() {
  const router = useRouter();
  const { story, theme, removeStoryStep } = useEditor();

  return (
    <ScrollView style={{ backgroundColor: theme.colors.bg }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <EditorHint>
        Touchez une étape pour la modifier, ou la corbeille pour la retirer. Vous pouvez tout réécrire.
      </EditorHint>
      <Text style={[styles.heading, { color: theme.colors.text }]}>Notre histoire</Text>

      {story.length === 0 ? (
        <Text style={[styles.empty, { color: theme.colors.textMuted }]}>Aucune étape pour l’instant. Ajoutez le premier souvenir.</Text>
      ) : (
        <View style={styles.list}>
          {story.map((item, index) => (
            <View key={`${index}-${item.year}-${item.title}`} style={[styles.row, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Modifier l'étape ${item.title}`}
                onPress={() => router.push({ pathname: '/editor/histoire-etape', params: { index: String(index) } })}
                style={({ pressed }) => [styles.rowMain, pressed && styles.pressed]}
              >
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.thumb} resizeMode="cover" />
                ) : (
                  <View style={[styles.thumb, styles.thumbEmpty]}>
                    <Ionicons name="heart-outline" size={20} color={theme.colors.accent} />
                  </View>
                )}
                <View style={styles.body}>
                  <Text style={[styles.year, { color: theme.colors.primary }]}>{item.year}</Text>
                  <Text style={[styles.title, { color: theme.colors.text }]}>{item.title}</Text>
                  <Text numberOfLines={2} style={[styles.text, { color: theme.colors.textMuted }]}>{item.text}</Text>
                </View>
              </Pressable>
              <View style={styles.actions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Modifier ${item.title}`}
                  onPress={() => router.push({ pathname: '/editor/histoire-etape', params: { index: String(index) } })}
                  hitSlop={8}
                  style={styles.iconBtn}
                >
                  <Ionicons name="create-outline" size={18} color={theme.colors.textMuted} />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Supprimer ${item.title}`}
                  onPress={() =>
                    confirmDelete(
                      'Supprimer cette étape ?',
                      'Elle disparaîtra de l’invitation.',
                      () => removeStoryStep(index),
                    )
                  }
                  hitSlop={8}
                  style={styles.iconBtn}
                >
                  <Ionicons name="trash-outline" size={18} color="#A45A45" />
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/editor/histoire-etape')}
        style={({ pressed }) => [styles.addBtn, { backgroundColor: theme.colors.primary }, pressed && styles.pressed]}
      >
        <Ionicons name="add" size={16} color={theme.colors.onPrimary} />
        <Text style={[styles.addLabel, { color: theme.colors.onPrimary }]}>Ajouter une étape</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 32 },
  heading: { fontFamily: 'Inter_600SemiBold', fontSize: 17, marginBottom: 12 },
  empty: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, marginBottom: 8 },
  list: { gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    padding: 10,
    paddingRight: 6,
  },
  rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  pressed: { opacity: 0.8 },
  thumb: { width: 56, height: 56, borderRadius: 10, backgroundColor: 'transparent' },
  thumbEmpty: { alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, gap: 2 },
  year: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  title: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  text: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 17 },
  actions: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 46,
    borderRadius: 999,
    marginTop: 16,
  },
  addLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
});
