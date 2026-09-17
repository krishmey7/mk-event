/**
 * « Mes invitations » — liste complète des invitations de
 * l'organisateur (mêmes cartes que le tableau de bord).
 */

import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EventCard } from './components/EventCard';
import { useEvents } from './useEvents';
import { openEventManage } from '@/features/editor/navigation';
import { brandColors, spacing } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemePreferenceContext';

export function InvitationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { events, isLoading, error } = useEvents();
  const { theme, mode } = useAppTheme();
  const c = theme.colors;

  return (
    <View style={[styles.screen, { backgroundColor: c.background }]}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />

      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text style={[theme.typography.h2, { color: c.textPrimary }]}>Mes invitations</Text>
        <Text style={[styles.subtitle, { color: c.textMuted }]}>
          Suivez les réponses RSVP de tous vos événements.
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <ActivityIndicator color={brandColors.coralDeep} style={styles.loader} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <View style={styles.cards}>
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onPress={() => openEventManage(router, event)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 19,
  },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, gap: spacing.md },
  loader: { marginVertical: spacing.xl },
  errorText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    lineHeight: 18,
    color: '#A45A45',
  },
  cards: { gap: spacing.md },
});
