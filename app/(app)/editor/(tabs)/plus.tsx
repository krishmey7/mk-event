/**
 * Onglet « Plus » — modules hors onglets, regroupés par usage.
 */

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EditorHint } from '@/features/editor/components/EditorHint';
import { SaveToLibraryCard } from '@/features/editor/components/SaveToLibraryCard';
import { useEditor } from '@/features/editor/EditorContext';

const GROUPS = [
  {
    title: 'Vos invités',
    items: [
      { icon: 'people-outline' as const, label: 'Invités', hint: 'Liste, places, liens personnels', route: '/editor/invites' },
      { icon: 'checkbox-outline' as const, label: 'RSVP', hint: 'Boissons proposées aux invités', route: '/editor/rsvp' },
    ],
  },
  {
    title: 'Souvenirs',
    items: [
      { icon: 'images-outline' as const, label: 'Galerie', hint: 'Photos et style d’affichage', route: '/editor/galerie' },
      { icon: 'book-outline' as const, label: 'Livre d’or', hint: 'Messages des invités', route: '/editor/livredor' },
    ],
  },
  {
    title: 'Ambiance',
    items: [
      { icon: 'musical-notes-outline' as const, label: 'Voix & musique', hint: 'Ambiance et message d’accueil', route: '/editor/voix' },
    ],
  },
];

export default function PlusTabScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, guests } = useEditor();
  const c = theme.colors;

  return (
    <ScrollView
      style={{ backgroundColor: c.bg }}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: c.text }]}>Invités et extras</Text>
      <EditorHint>
        Étape 4 : la liste d’invités d’abord. RSVP ne gère que les boissons. Enregistrez ensuite dans Mes invitations.
      </EditorHint>
      <SaveToLibraryCard />

      {GROUPS.map((group) => (
        <View key={group.title} style={styles.group}>
          <Text style={[styles.groupTitle, { color: c.textMuted }]}>{group.title}</Text>
          <View style={[styles.sections, { backgroundColor: c.surface }]}>
            {group.items.map((item) => {
              const inviteEmpty = item.route === '/editor/invites' && guests.length === 0;
              return (
                <Pressable
                  key={item.route}
                  accessibilityRole="button"
                  onPress={() => router.push(item.route)}
                  style={({ pressed }) => [
                    styles.sectionRow,
                    { borderBottomColor: c.border },
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons name={item.icon} size={19} color={c.primary} />
                  <View style={styles.sectionCopy}>
                    <View style={styles.labelRow}>
                      <Text style={[styles.sectionLabel, { color: c.text }]}>{item.label}</Text>
                      {inviteEmpty ? (
                        <Text style={[styles.badge, { color: c.onPrimary, backgroundColor: c.primary }]}>À faire</Text>
                      ) : null}
                    </View>
                    <Text style={[styles.sectionHint, { color: c.textMuted }]}>{item.hint}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={15} color={c.accent} />
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, paddingTop: 20 },
  title: {
    fontFamily: 'Fraunces_500Medium', fontSize: 22, lineHeight: 28,
    marginBottom: 10,
  },
  group: { marginBottom: 18 },
  groupTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  sections: { borderRadius: 18, overflow: 'hidden' },
  sectionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1,
  },
  sectionCopy: { flex: 1, gap: 2 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  badge: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  sectionHint: { fontFamily: 'Inter_400Regular', fontSize: 12 },
  pressed: { opacity: 0.8 },
});
