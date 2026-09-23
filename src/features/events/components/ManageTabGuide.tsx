/**
 * Guide d’onglet : phrase fixe + bandeau 1ʳᵉ visite (fermable, non bloquant).
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { fontFamilies, type AppTheme } from '@/constants/theme';

export interface ManageTabGuideProps {
  theme: AppTheme;
  alwaysHint: string;
  firstVisitText?: string;
  showFirstVisit?: boolean;
  onDismissFirstVisit?: () => void;
}

export function ManageTabGuide({
  theme,
  alwaysHint,
  firstVisitText,
  showFirstVisit = false,
  onDismissFirstVisit,
}: ManageTabGuideProps) {
  const c = theme.colors;

  return (
    <View style={styles.wrap}>
      <Text style={[styles.always, { color: c.textMuted }]}>{alwaysHint}</Text>

      {showFirstVisit && firstVisitText ? (
        <View
          style={[
            styles.banner,
            { backgroundColor: c.accentMuted, borderColor: c.accent },
          ]}
        >
          <Text style={[styles.bannerText, { color: c.textPrimary }]}>{firstVisitText}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Compris"
            onPress={onDismissFirstVisit}
            hitSlop={8}
            style={[styles.gotIt, { backgroundColor: c.accent }]}
          >
            <Text style={[styles.gotItLabel, { color: c.onAccent }]}>Compris</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fermer"
            onPress={onDismissFirstVisit}
            hitSlop={8}
            style={styles.close}
          >
            <Ionicons name="close" size={16} color={c.textMuted} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  always: {
    fontFamily: fontFamilies.sans,
    fontSize: 13.5,
    lineHeight: 19,
  },
  banner: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    paddingRight: 36,
    gap: 10,
  },
  bannerText: {
    fontFamily: fontFamilies.sans,
    fontSize: 14,
    lineHeight: 20,
  },
  gotIt: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  gotItLabel: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 13,
  },
  close: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});
