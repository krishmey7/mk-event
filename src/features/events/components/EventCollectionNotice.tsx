import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import type { EventType } from '@/types';
import { fontFamilies, radii, spacing } from '@/constants/theme';

interface EventCollectionNoticeProps {
  type: EventType | null;
  colors: {
    surface: string;
    border: string;
    accent: string;
    accentSurface: string;
    title: string;
    body: string;
  };
}

export function EventCollectionNotice({ type, colors }: EventCollectionNoticeProps) {
  if (type !== 'birthday' && type !== 'corporate') return null;

  const isBirthday = type === 'birthday';

  return (
    <View
      accessibilityRole="text"
      style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.accentSurface }]}>
        <Ionicons name="sparkles-outline" size={18} color={colors.accent} />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.title, { color: colors.title }]}>
          {isBirthday ? 'Modèle anniversaire en version d’essai' : 'Une collection qui grandit'}
        </Text>
        <Text style={[styles.body, { color: colors.body }]}>
          {isBirthday
            ? 'Le modèle « Célébration » est une première version d’essai, à découvrir pendant que nous préparons la suite de la collection. Vous pouvez déjà commencer votre invitation : vos informations et réglages seront conservés.'
            : 'Un premier modèle est déjà disponible. D’autres créations pour les conférences sont en préparation. Vous pouvez commencer dès maintenant : votre événement et vos réglages seront conservés.'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: radii.md,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, gap: 4 },
  title: { fontFamily: fontFamilies.sansSemiBold, fontSize: 14 },
  body: { fontFamily: fontFamilies.sans, fontSize: 13, lineHeight: 19 },
});
