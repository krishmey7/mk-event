/**
 * Onglet Invités — liste + RSVP uniquement (parcours guidé).
 */

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EditorHint } from '@/features/editor/components/EditorHint';
import { useEditor } from '@/features/editor/EditorContext';
import { useAppTheme } from '@/context/ThemePreferenceContext';
import { fontFamilies, spacing } from '@/constants/theme';

const ITEMS = [
  { icon: 'people-outline' as const, label: 'Invités', hint: 'Liste, places, liens personnels', route: '/editor/invites' },
  { icon: 'checkbox-outline' as const, label: 'RSVP', hint: 'Boissons et régimes proposés', route: '/editor/rsvp' },
];

export default function PlusTabScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { guests } = useEditor();
  const { theme } = useAppTheme();
  const c = theme.colors;

  return (
    <ScrollView
      style={{ backgroundColor: c.background }}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: c.textPrimary }]}>Invités & RSVP</Text>
      <EditorHint>
        Étape Invités : ajoutez vos invités puis configurez les choix RSVP.
      </EditorHint>

      <View style={[styles.sections, { backgroundColor: c.surface, borderColor: c.border }]}>
        {ITEMS.map((item) => {
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
              <Ionicons name={item.icon} size={19} color={c.accent} />
              <View style={styles.sectionCopy}>
                <View style={styles.labelRow}>
                  <Text style={[styles.sectionLabel, { color: c.textPrimary }]}>{item.label}</Text>
                  {inviteEmpty ? (
                    <Text style={[styles.badge, { color: c.onAccent, backgroundColor: c.accent }]}>À faire</Text>
                  ) : null}
                </View>
                <Text style={[styles.sectionHint, { color: c.textMuted }]}>{item.hint}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={c.textMuted} />
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg },
  title: { fontFamily: fontFamilies.sansSemiBold, fontSize: 18, marginBottom: 8 },
  sections: { borderWidth: 1, borderRadius: 14, overflow: 'hidden', marginTop: spacing.md },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sectionCopy: { flex: 1, gap: 2 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionLabel: { fontFamily: fontFamilies.sansSemiBold, fontSize: 15 },
  sectionHint: { fontFamily: fontFamilies.sans, fontSize: 12.5 },
  badge: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  pressed: { opacity: 0.85 },
});
