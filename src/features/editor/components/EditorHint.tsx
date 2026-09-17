import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { fontFamilies } from '@/constants/theme';
import { useStudioChrome } from '../useStudioChrome';

/** Consigne courte en tête d’écran — chrome app. */
export function EditorHint({ children }: { children: string }) {
  const c = useStudioChrome();

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
    fontFamily: fontFamilies.sans,
    fontSize: 13,
    lineHeight: 18,
  },
});
