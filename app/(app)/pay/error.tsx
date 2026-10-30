import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useAppTheme } from '@/context/ThemePreferenceContext';
import { fontFamilies, spacing } from '@/constants/theme';
import { paymentsService } from '@/services/paymentsService';

export default function PaymentErrorScreen() {
  const params = useLocalSearchParams<{
    eventId?: string | string[];
    paymentId?: string | string[];
  }>();
  const router = useRouter();
  const { theme } = useAppTheme();
  const c = theme.colors;
  const eventId = Number(Array.isArray(params.eventId) ? params.eventId[0] : params.eventId);
  const paymentId = Array.isArray(params.paymentId) ? params.paymentId[0] : params.paymentId;
  const [quota, setQuota] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [eventPublished, setEventPublished] = useState(false);

  useEffect(() => {
    if (!Number.isSafeInteger(eventId) || eventId < 1) return;
    let active = true;
    void paymentsService.getStatus(eventId, paymentId || undefined).then((status) => {
      if (active) {
        setQuota(Math.max(1, status.pending_count - status.available_credits));
        setEventPublished(status.event_status === 'published');
      }
    }).catch((requestError: unknown) => {
      if (active) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Impossible de récupérer le nombre d’invités à couvrir.',
        );
      }
    });
    return () => {
      active = false;
    };
  }, [eventId, paymentId]);

  return (
    <View style={[styles.screen, { backgroundColor: c.background }]}>
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Ionicons name="close-circle" size={54} color="#C45D45" />
        <Text style={[styles.title, { color: c.textPrimary }]}>Paiement non confirmé</Text>
        <Text style={[styles.copy, { color: c.textSecondary }]}>
          {eventPublished
            ? 'Votre événement reste en ligne, mais ces nouveaux liens n’ont pas été activés. Vous pouvez réessayer le paiement.'
            : 'L’événement reste en brouillon. Vous pouvez réessayer ou revenir à la liste de vos invitations.'}
        </Text>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <Pressable
          accessibilityRole="button"
          disabled={quota === null || quota < 1}
          onPress={() => router.replace({
            pathname: '/pay/[eventId]',
            params: { eventId: String(eventId), guestQuota: String(quota ?? '') },
          })}
          style={[styles.button, { backgroundColor: c.accent }, (quota === null || quota < 1) && styles.disabled]}
        >
          {quota === null ? <ActivityIndicator color={c.onAccent} /> : null}
          <Text style={[styles.buttonText, { color: c.onAccent }]}>Réessayer le paiement</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/invitations')}
          style={[styles.button, { backgroundColor: c.surfaceElevated, borderColor: c.border, borderWidth: 1 }]}
        >
          <Text style={[styles.buttonText, { color: c.textPrimary }]}>Retour aux invitations</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  card: { width: '100%', maxWidth: 520, alignSelf: 'center', alignItems: 'center', borderWidth: 1, borderRadius: 22, padding: 24, gap: 14 },
  title: { fontFamily: fontFamilies.serifSemiBold, fontSize: 27, textAlign: 'center' },
  copy: { fontFamily: fontFamilies.sans, fontSize: 14, lineHeight: 21, textAlign: 'center' },
  error: { color: '#A45A45', fontFamily: fontFamilies.sansMedium, fontSize: 13, textAlign: 'center' },
  button: { minHeight: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, paddingHorizontal: 18, width: '100%' },
  buttonText: { fontFamily: fontFamilies.sansSemiBold, fontSize: 14 },
  disabled: { opacity: 0.6 },
});
