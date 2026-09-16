import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useEditor } from '../EditorContext';

/** Consigne courte en tête d’écran — une phrase, pas un mode d’emploi. */
export function EditorHint({ children }: { children: string }) {
  const { theme } = useEditor();
  const c = theme.colors;

  return (
    <View style={[styles.row, { backgroundColor: c.chip }]}>
      <Ionicons name="information-circle-outline" size={16} color={c.primary} />
      <Text style={[styles.text, { color: c.textMuted }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  text: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 18,
  },
});
