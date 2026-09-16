/**
 * Étape Thème — dress code / ambiance + couleurs du modèle.
 */

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { EditorInput } from '@/features/editor/components/EditorInput';
import { EditorHint } from '@/features/editor/components/EditorHint';
import { SaveToLibraryCard } from '@/features/editor/components/SaveToLibraryCard';
import { useEditor } from '@/features/editor/EditorContext';

export default function ThemeTabScreen() {
  const { themes, cover, updateCover, dressCode, setDressCode, theme } = useEditor();
  const colors = theme.colors;

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <EditorHint>
        Indiquez le dress code ou l’ambiance. Les couleurs s’appliquent tout de suite à cet écran et à l’invitation.
      </EditorHint>

      <Text style={[styles.heading, { color: colors.text }]}>Dress code ou thème</Text>
      <Text style={[styles.lead, { color: colors.textMuted }]}>
        Que devront porter vos invités ? Quelle ambiance voulez-vous ?
      </Text>

      <EditorInput
        value={dressCode}
        onChangeText={setDressCode}
        placeholder="Ex. Tenue de cocktail, champagne et ivoire"
      />

      <View style={styles.ideas}>
        {themes.map((item) => {
          const label = item.dressLabel ?? item.label;
          const on = dressCode === label;
          return (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              onPress={() => {
                setDressCode(label);
                updateCover({ themeKey: item.key });
              }}
              style={[
                styles.idea,
                { borderColor: colors.border, backgroundColor: colors.surface },
                on && { borderColor: colors.primary, backgroundColor: colors.chip },
              ]}
            >
              <Text style={[styles.ideaLabel, { color: on ? colors.primary : colors.text }]}>{label}</Text>
              <Text style={[styles.ideaHint, { color: colors.textMuted }]}>{item.dressHint ?? item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.heading, { color: colors.text }]}>Couleurs de l’invitation</Text>
      <View style={styles.themeList}>
        {themes.map((item) => {
          const selected = cover.themeKey === item.key;
          return (
            <Pressable
              key={item.key}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => updateCover({ themeKey: item.key })}
              style={[
                styles.themeRow,
                { borderColor: colors.border, backgroundColor: colors.surface },
                selected && { borderColor: colors.primary, backgroundColor: colors.chip },
              ]}
            >
              <View style={[styles.swatch, { backgroundColor: item.swatch }]} />
              <Text style={[styles.themeLabel, { color: colors.text }]}>{item.label}</Text>
              {selected ? <Ionicons name="checkmark-circle" size={18} color={colors.primary} /> : null}
            </Pressable>
          );
        })}
      </View>

      <SaveToLibraryCard />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 36 },
  heading: { fontFamily: 'Inter_600SemiBold', fontSize: 16, marginTop: 16, marginBottom: 6 },
  lead: { fontFamily: 'Inter_400Regular', fontSize: 13.5, lineHeight: 19, marginBottom: 10 },
  ideas: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  idea: {
    flexGrow: 1,
    flexBasis: '47%',
    borderWidth: 1.4,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 2,
  },
  ideaLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  ideaHint: { fontFamily: 'Inter_400Regular', fontSize: 11 },
  themeList: { gap: 8, marginBottom: 8 },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.4,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  swatch: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)' },
  themeLabel: { flex: 1, fontFamily: 'Inter_600SemiBold', fontSize: 14 },
});
