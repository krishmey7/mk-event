/**
 * Palettes du modèle actif — le choix peint l’invitation tout de suite.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fontFamilies, spacing } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemePreferenceContext';
import { useEditor } from '../EditorContext';

export function TemplateThemePicker() {
  const { themes, theme, setThemeKey } = useEditor();
  const { theme: appTheme } = useAppTheme();
  const c = appTheme.colors;

  return (
    <View style={styles.root}>
      <Text style={[styles.heading, { color: c.textPrimary }]}>Palette</Text>
      <View style={styles.row}>
        {themes.map((item) => {
          const selected = item.key === theme.key;
          return (
            <Pressable
              key={item.key}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={item.label}
              onPress={() => setThemeKey(item.key)}
              style={styles.item}
            >
              <View
                style={[
                  styles.swatch,
                  { backgroundColor: item.swatch, borderColor: selected ? c.textPrimary : c.border },
                  selected && styles.swatchOn,
                ]}
              />
              <Text
                numberOfLines={1}
                style={[
                  styles.label,
                  { color: selected ? c.textPrimary : c.textMuted },
                  selected && styles.labelOn,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { marginTop: spacing.sm, marginBottom: 8 },
  heading: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 15,
    marginBottom: 10,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  item: { width: 72, alignItems: 'center', gap: 6 },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
  },
  swatchOn: { borderWidth: 2.5 },
  label: { fontFamily: fontFamilies.sansMedium, fontSize: 11, textAlign: 'center' },
  labelOn: { fontFamily: fontFamilies.sansSemiBold },
});