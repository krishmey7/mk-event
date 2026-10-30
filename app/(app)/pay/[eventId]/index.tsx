import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useAppTheme } from '@/context/ThemePreferenceContext';
import { fontFamilies, spacing } from '@/constants/theme';
import { ApiError } from '@/services/apiClient';
import {
  paymentsService,
  type EventPaymentStatus,
  type PaymentMethod,
} from '@/services/paymentsService';

const POLL_INTERVAL_MS = 3_000;

function getInstructionText(value: unknown): string | null {
  if (typeof value === 'string') return value.trim() || null;
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  for (const key of ['instructions', 'message', 'description', 'detail', 'ussd']) {
    const candidate = record[key];
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
  }
  return getInstructionText(record.kelpay);
}

export default function EventPaymentScreen() {
  const params = useLocalSearchParams<{
    eventId: string | string[];
    guestQuota?: string | string[];
  }>();
  const router = useRouter();
  const { theme } = useAppTheme();
  const c = theme.colors;
  const eventId = Number(Array.isArray(params.eventId) ? params.eventId[0] : params.eventId);
  const quotaParam = Array.isArray(params.guestQuota) ? params.guestQuota[0] : params.guestQuota;
  const quota = Number(quotaParam);
  const [method, setMethod] = useState<PaymentMethod>('mobile_money');
  const [mobileNumber, setMobileNumber] = useState('');
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [instructions, setInstructions] = useState<string | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusInfo, setStatusInfo] = useState<EventPaymentStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const amount = Number.isSafeInteger(quota) && quota > 0 ? (quota * 50 / 100).toFixed(2) : '0.00';
  const validEvent = Number.isSafeInteger(eventId) && eventId > 0;
  const validQuota = Number.isSafeInteger(quota) && quota > 0;

  useEffect(() => {
    if (!waiting || !validEvent) return;
    let active = true;
    let checking = false;

    const checkPayment = async () => {
      if (checking) return;
      checking = true;
      try {
        const current = await paymentsService.getStatus(eventId, paymentId ?? undefined);
        if (!active) return;
        setStatusInfo(current);
        if (current.payment?.status === 'succeeded' && current.event_status === 'published') {
          router.replace({
            pathname: '/pay/success',
            params: {
              eventId: String(eventId),
              paymentId: paymentId ?? '',
            },
          });
        } else if (current.payment?.status === 'failed') {
          router.replace({
            pathname: '/pay/error',
            params: {
              eventId: String(eventId),
              paymentId: paymentId ?? '',
            },
          });
        }
      } catch (requestError) {
        if (active) {
          setError(
            requestError instanceof ApiError
              ? requestError.message
              : 'Impossible de vérifier le paiement. La vérification va réessayer.',
          );
        }
      } finally {
        checking = false;
      }
    };

    void checkPayment();
    const timer = setInterval(() => void checkPayment(), POLL_INTERVAL_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [eventId, paymentId, router, validEvent, waiting]);

  const startPayment = async () => {
    if (!validEvent || !validQuota || (method === 'mobile_money' && !mobileNumber.trim())) {
      setError('Vérifiez le nombre d’invités et les informations de paiement.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const initiated = await paymentsService.createPayment(eventId, {
        guest_quota: quota,
        payment_method: method,
        ...(method === 'mobile_money' ? { mobilenumber: mobileNumber.trim() } : {}),
      });
      setPaymentId(initiated.payment_id);
      setCheckoutUrl(initiated.checkout_url);
      setInstructions(getInstructionText(initiated.instructions));
      setWaiting(true);
    } catch (requestError) {
      const message = requestError instanceof ApiError
        ? requestError.message
        : 'Impossible d’initialiser le paiement.';
      setError(message);
      if (
        requestError instanceof ApiError
        && (requestError.status === 503 || requestError.status === 409)
      ) {
        try {
          const current = await paymentsService.getStatus(eventId);
          if (current.payment?.status === 'pending') {
            setPaymentId(current.payment.payment_id);
            setWaiting(true);
          }
        } catch {
          // Keep the original initialization error visible.
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const openCheckout = async () => {
    if (!checkoutUrl) return;
    try {
      await Linking.openURL(checkoutUrl);
    } catch {
      setError('Impossible d’ouvrir la page de paiement. Réessayez depuis votre navigateur.');
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable onPress={() => router.back()} accessibilityRole="button" style={styles.back}>
        <Ionicons name="chevron-back" size={20} color={c.textPrimary} />
        <Text style={[styles.backText, { color: c.textPrimary }]}>Retour</Text>
      </Pressable>

      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Text style={[styles.eyebrow, { color: c.accent }]}>LIENS INVITÉS</Text>
        <Text style={[styles.title, { color: c.textPrimary }]}>Finaliser la publication</Text>
        <Text style={[styles.copy, { color: c.textSecondary }]}>
          {validQuota
            ? `${quota} lien(s) personnel(s) à 0,50 $ par invité.`
            : 'Nombre d’invités invalide. Revenez à la finalisation et choisissez une quantité supérieure à zéro.'}
        </Text>
        <View style={[styles.amountRow, { borderColor: c.border }]}>
          <Text style={[styles.amountLabel, { color: c.textSecondary }]}>Total à payer</Text>
          <Text style={[styles.amount, { color: c.textPrimary }]}>{amount} $ USD</Text>
        </View>

        {!waiting ? (
          <>
            <Text style={[styles.sectionLabel, { color: c.textPrimary }]}>Moyen de paiement</Text>
            <View style={styles.methodRow}>
              {([
                ['mobile_money', 'Mobile Money', 'phone-portrait-outline'],
                ['card', 'Carte bancaire', 'card-outline'],
              ] as const).map(([value, label, icon]) => (
                <Pressable
                  key={value}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: method === value }}
                  onPress={() => setMethod(value)}
                  style={[
                    styles.method,
                    { borderColor: method === value ? c.accent : c.border },
                    method === value && { backgroundColor: c.accentMuted },
                  ]}
                >
                  <Ionicons name={icon} size={19} color={method === value ? c.accent : c.textMuted} />
                  <Text style={[styles.methodLabel, { color: c.textPrimary }]}>{label}</Text>
                </Pressable>
              ))}
            </View>
            {method === 'mobile_money' ? (
              <>
                <Text style={[styles.fieldLabel, { color: c.textSecondary }]}>Numéro Mobile Money</Text>
                <TextInput
                  accessibilityLabel="Numéro Mobile Money"
                  keyboardType="phone-pad"
                  value={mobileNumber}
                  onChangeText={setMobileNumber}
                  placeholder="+243..."
                  placeholderTextColor={c.textMuted}
                  style={[styles.input, { color: c.textPrimary, borderColor: c.border }]}
                />
              </>
            ) : null}
          </>
        ) : (
          <View style={[styles.waiting, { backgroundColor: c.accentMuted }]}>
            <ActivityIndicator color={c.accent} />
            <Text style={[styles.waitingTitle, { color: c.textPrimary }]}>Confirmation du paiement</Text>
            <Text style={[styles.copy, { color: c.textSecondary }]}>
              {instructions
                ?? (checkoutUrl
                  ? 'Finalisez le paiement sur la page sécurisée. Nous confirmerons la publication après le retour du prestataire.'
                  : paymentId
                    ? 'Validez la demande sur votre téléphone. La publication ne sera activée qu’après confirmation du prestataire.'
                    : 'Le prestataire n’a pas confirmé la prise en charge. Nous vérifions le statut ; ne relancez pas le paiement pendant cette vérification.')}
            </Text>
            {checkoutUrl ? (
              <Pressable onPress={() => void openCheckout()} style={[styles.button, { backgroundColor: c.accent }]}>
                <Text style={[styles.buttonText, { color: c.onAccent }]}>Ouvrir la page de paiement</Text>
              </Pressable>
            ) : null}
            {statusInfo ? (
              <Text style={[styles.statusText, { color: c.textMuted }]}>
                {statusInfo.pending_count} lien(s) en attente · vérification automatique
              </Text>
            ) : null}
          </View>
        )}

        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {!waiting ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => void startPayment()}
            disabled={submitting || !validQuota || (method === 'mobile_money' && !mobileNumber.trim())}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: c.accent },
              (pressed || submitting || !validQuota || (method === 'mobile_money' && !mobileNumber.trim())) && styles.disabled,
            ]}
          >
            {submitting ? <ActivityIndicator color={c.onAccent} /> : null}
            <Text style={[styles.buttonText, { color: c.onAccent }]}>
              {submitting ? 'Initialisation…' : `Payer ${amount.replace('.', ',')} $`}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  back: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: 16 },
  backText: { fontFamily: fontFamilies.sansMedium, fontSize: 14 },
  card: { width: '100%', maxWidth: 560, alignSelf: 'center', borderWidth: 1, borderRadius: 22, padding: 22, gap: 14 },
  eyebrow: { fontFamily: fontFamilies.sansSemiBold, fontSize: 11, letterSpacing: 1.4 },
  title: { fontFamily: fontFamilies.serifSemiBold, fontSize: 28 },
  copy: { fontFamily: fontFamilies.sans, fontSize: 14, lineHeight: 21 },
  amountRow: { borderTopWidth: 1, borderBottomWidth: 1, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amountLabel: { fontFamily: fontFamilies.sans, fontSize: 14 },
  amount: { fontFamily: fontFamilies.sansSemiBold, fontSize: 18 },
  sectionLabel: { fontFamily: fontFamilies.sansSemiBold, fontSize: 13, marginTop: 4 },
  methodRow: { flexDirection: 'row', gap: 10 },
  method: { flex: 1, minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderRadius: 12, paddingHorizontal: 8 },
  methodLabel: { fontFamily: fontFamilies.sansMedium, fontSize: 12 },
  fieldLabel: { fontFamily: fontFamilies.sansMedium, fontSize: 12 },
  input: { minHeight: 46, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, fontFamily: fontFamilies.sans, fontSize: 14 },
  waiting: { borderRadius: 14, padding: 16, alignItems: 'center', gap: 10 },
  waitingTitle: { fontFamily: fontFamilies.sansSemiBold, fontSize: 15 },
  statusText: { fontFamily: fontFamilies.sans, fontSize: 12, textAlign: 'center' },
  button: { minHeight: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginTop: 4 },
  buttonText: { fontFamily: fontFamilies.sansSemiBold, fontSize: 14 },
  disabled: { opacity: 0.5 },
  error: { color: '#A45A45', fontFamily: fontFamilies.sansMedium, fontSize: 13 },
});
