/**
 * « Mes événements » — liste complète des événements de l’organisateur.
 */

import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EventCard } from './components/EventCard';
import { useEvents } from './useEvents';
import { confirmDelete } from '@/features/editor/confirmDelete';
import { openEventManage } from '@/features/editor/navigation';
import { eventsService } from '@/services/eventsService';
import { useActiveEvent } from '@/context/ActiveEventContext';
import { brandColors, spacing } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemePreferenceContext';

export function InvitationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { events, isLoading, error, reload } = useEvents();
  const { eventId, syncFromServer } = useActiveEvent();
  const { theme, mode } = useAppTheme();
  const c = theme.colors;

  const handleDelete = (id: number, name: string) => {
    confirmDelete(
      'Supprimer cet événement ?',
      `« ${name} » sera définitivement supprimé.`,
      () => {
        void (async () => {
          try {
            await eventsService.deleteEvent(id);
            if (eventId === id) await syncFromServer();
            await reload();
          } catch {
            /* ignore — reload montrera l’état réel */
            await reload();
          }
        })();
      },
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: c.background }]}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />

      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text style={[theme.typography.h2, { color: c.textPrimary }]}>Mes événements</Text>
        <Text style={[styles.subtitle, { color: c.textMuted }]}>
          Appuyez sur un événement pour gérer les invités.
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
        ) : events.length === 0 ? (
          <Text style={[styles.empty, { color: c.textMuted }]}>
            Aucun événement. Créez-en un depuis Accueil ou Modèles.
          </Text>
        ) : (
          <View style={styles.cards}>
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onPress={() => openEventManage(router, event)}
                onDelete={() => handleDelete(event.id, event.name)}
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
  empty: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.md,
  },
  cards: { gap: spacing.md },
});
