import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useAppTheme } from '@/context/ThemePreferenceContext';
import { fontFamilies, spacing } from '@/constants/theme';
import { ApiError } from '@/services/apiClient';
import { paymentsService, type EventPaymentStatus } from '@/services/paymentsService';

const POLL_INTERVAL_MS = 3_000;

export default function PaymentSuccessScreen() {
  const params = useLocalSearchParams<{
    eventId?: string | string[];
    paymentId?: string | string[];
  }>();
  const router = useRouter();
  const { theme } = useAppTheme();
  const c = theme.colors;
  const eventId = Number(Array.isArray(params.eventId) ? params.eventId[0] : params.eventId);
  const paymentId = Array.isArray(params.paymentId) ? params.paymentId[0] : params.paymentId;
  const [payment, setPayment] = useState<EventPaymentStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const confirmed = payment?.payment?.status === 'succeeded' && payment.event_status === 'published';

  const checkStatus = useCallback(async () => {
    try {
      const current = await paymentsService.getStatus(eventId, paymentId || undefined);
      setPayment(current);
      setError(null);
      if (current.payment?.status === 'failed') {
        router.replace({
          pathname: '/pay/error',
          params: { eventId: String(eventId), paymentId: paymentId ?? '' },
        });
      }
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : 'Impossible de vérifier le paiement.',
      );
    }
  }, [eventId, paymentId, router]);

  useEffect(() => {
    if (!Number.isSafeInteger(eventId) || eventId < 1) {
      setError('Événement invalide.');
      return;
    }
    if (confirmed) return;
    void checkStatus();
    const timer = setInterval(() => void checkStatus(), POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [checkStatus, confirmed, eventId, refreshKey]);

  return (
    <View style={[styles.screen, { backgroundColor: c.background }]}>
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
        {confirmed ? (
          <Ionicons name="checkmark-circle" size={54} color="#5C7A4A" />
        ) : (
          <ActivityIndicator size="large" color={c.accent} />
        )}
        <Text style={[styles.title, { color: c.textPrimary }]}>
          {confirmed ? 'Paiement confirmé' : 'Confirmation en cours'}
        </Text>
        <Text style={[styles.copy, { color: c.textSecondary }]}>
          {confirmed
            ? 'Votre événement est publié. Les liens personnels sont activés dans la limite des crédits achetés.'
            : 'Nous attendons la confirmation sécurisée de KibaWallet. La page se met à jour automatiquement.'}
        </Text>
        {payment && confirmed ? (
          <View style={[styles.summary, { borderColor: c.border }]}>
            <Text style={[styles.summaryText, { color: c.textPrimary }]}>
              {payment.paid_guest_count} lien(s) activé(s) sur {payment.paid_guest_quota} crédit(s)
            </Text>
            <Text style={[styles.summaryHint, { color: c.textMuted }]}>
              {payment.available_credits} crédit(s) disponible(s) pour de nouveaux invités
            </Text>
          </View>
        ) : null}
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {confirmed ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace(`/invitations/${eventId}?welcome=1`)}
            style={[styles.button, { backgroundColor: c.accent }]}
          >
            <Text style={[styles.buttonText, { color: c.onAccent }]}>Gérer mes invitations</Text>
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={() => setRefreshKey((key) => key + 1)}
            style={[styles.button, { backgroundColor: c.surfaceElevated, borderColor: c.border, borderWidth: 1 }]}
          >
            <Text style={[styles.buttonText, { color: c.textPrimary }]}>Vérifier maintenant</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  card: { width: '100%', maxWidth: 520, alignSelf: 'center', alignItems: 'center', borderWidth: 1, borderRadius: 22, padding: 24, gap: 14 },
  title: { fontFamily: fontFamilies.serifSemiBold, fontSize: 27, textAlign: 'center' },
  copy: { fontFamily: fontFamilies.sans, fontSize: 14, lineHeight: 21, textAlign: 'center' },
  summary: { width: '100%', borderTopWidth: 1, borderBottomWidth: 1, paddingVertical: 14, gap: 5, alignItems: 'center' },
  summaryText: { fontFamily: fontFamilies.sansSemiBold, fontSize: 14, textAlign: 'center' },
  summaryHint: { fontFamily: fontFamilies.sans, fontSize: 12, textAlign: 'center' },
  error: { color: '#A45A45', fontFamily: fontFamilies.sansMedium, fontSize: 13, textAlign: 'center' },
  button: { minHeight: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, width: '100%' },
  buttonText: { fontFamily: fontFamilies.sansSemiBold, fontSize: 14 },
});
