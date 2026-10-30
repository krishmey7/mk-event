import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/context/AuthContext';
import { useAppTheme } from '@/context/ThemePreferenceContext';
import { fontFamilies, radii, spacing } from '@/constants/theme';
import {
  adminWalletService,
  type AdminWalletDashboard,
  type AdminWalletTransaction,
  type PayoutCurrency,
} from '@/services/adminWalletService';
import { ApiError } from '@/services/apiClient';

const CURRENCIES: PayoutCurrency[] = ['USD', 'CDF'];

function money(value: string | number, currency: PayoutCurrency) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return `${value} ${currency}`;
  return `${amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

function transactionLabel(transaction: AdminWalletTransaction) {
  if (transaction.type === 'incoming_payment') {
    const label = transaction.status === 'succeeded'
      ? 'Paiement reçu'
      : transaction.status === 'pending'
        ? 'Paiement en attente'
        : 'Paiement échoué';
    return `${label} · ${transaction.event_name}`;
  }
  if (transaction.type === 'earning') {
    return transaction.event_name
      ? `Part sur le paiement · ${transaction.event_name}`
      : `Part administrateur · ${transaction.share_percent ?? '0'} %`;
  }
  return `Retrait Mobile Money · ${transaction.account}`;
}

export function AdminWalletScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { theme } = useAppTheme();
  const c = theme.colors;
  const eligible = Boolean(user?.is_superuser || user?.role === 'admin');
  const [dashboard, setDashboard] = useState<AdminWalletDashboard | null>(null);
  const [currency, setCurrency] = useState<PayoutCurrency>('USD');
  const [amount, setAmount] = useState('');
  const [account, setAccount] = useState(user?.phone ?? '');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPage, setNextPage] = useState<number | null>(null);

  const available = Number(dashboard?.balances[currency] ?? 0);
  const requestedAmount = Number(amount.replace(',', '.'));
  const fee = Number.isFinite(requestedAmount)
    ? Math.round(requestedAmount * 0.01 * 100) / 100
    : 0;
  const debit = requestedAmount + fee;
  const canWithdraw = Number.isFinite(requestedAmount)
    && requestedAmount >= 1
    && debit <= available
    && account.trim().length >= 8
    && !submitting;

  const loadDashboard = useCallback(async (page = 1, append = false) => {
    if (page === 1) setError(null);
    try {
      const result = await adminWalletService.getDashboard(page);
      setDashboard((current) => append && current
        ? {
            ...result,
            transactions: [...current.transactions, ...result.transactions],
          }
        : result);
      setNextPage(result.next_page);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : 'Impossible de charger le portefeuille administrateur.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (!eligible) {
      router.replace('/profil');
      return;
    }
    void loadDashboard();
  }, [eligible, loadDashboard, router]);

  const refresh = () => {
    setRefreshing(true);
    void loadDashboard();
  };

  const loadMore = () => {
    if (nextPage == null || loadingMore) return;
    setLoadingMore(true);
    void loadDashboard(nextPage, true);
  };

  const submitWithdrawal = async () => {
    if (!canWithdraw) return;
    setError(null);
    setNotice(null);
    setSubmitting(true);
    try {
      const result = await adminWalletService.withdraw({
        amount: requestedAmount.toFixed(2),
        currency,
        account: account.trim(),
      });
      setNotice(
        `Retrait demandé : ${money(result.amount, currency)} envoyés, ` +
        `${money(result.amount_debited, currency)} réservés, frais inclus. ` +
        'Le statut sera actualisé par confirmation KibaWallet.',
      );
      setAmount('');
      await loadDashboard();
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : 'Le retrait n’a pas pu être demandé. Vérifiez le statut avant de réessayer.',
      );
      await loadDashboard();
    } finally {
      setSubmitting(false);
    }
  };

  const transactions = useMemo(
    () => dashboard?.transactions ?? [],
    [dashboard?.transactions],
  );

  if (!eligible) return null;

  return (
    <View style={[styles.screen, { backgroundColor: c.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.xl },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={c.accent}
          />
        }
      >
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Ionicons name="arrow-back" size={20} color={c.accent} />
          <Text style={[styles.backText, { color: c.accent }]}>Profil</Text>
        </Pressable>
        <Text style={[styles.title, { color: c.textPrimary }]}>Portefeuille KibaWallet</Text>
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>
          Vos parts sur les paiements confirmés et vos retraits Mobile Money.
        </Text>

        {loading ? (
          <ActivityIndicator color={c.accent} style={styles.loader} />
        ) : (
          <>
            <View style={styles.balanceRow}>
              {CURRENCIES.map((item) => (
                <Pressable
                  key={item}
                  accessibilityRole="button"
                  accessibilityState={{ selected: currency === item }}
                  onPress={() => setCurrency(item)}
                  style={[
                    styles.balanceCard,
                    { backgroundColor: c.surface, borderColor: currency === item ? c.accent : c.border },
                  ]}
                >
                  <Text style={[styles.currency, { color: c.textMuted }]}>{item} disponibles</Text>
                  <Text style={[styles.balance, { color: c.textPrimary }]}>
                    {money(dashboard?.balances[item] ?? '0.00', item)}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
              <Text style={[styles.cardTitle, { color: c.textPrimary }]}>
                {dashboard?.is_superuser ? 'Vue globale administrateur' : 'Demander un retrait'}
              </Text>
              <Text style={[styles.helper, { color: c.textSecondary }]}>
                Part configurée : {dashboard?.share_percent ?? '0.00'} %. Les revenus sont crédités
                après confirmation KibaWallet, selon le montant net reçu.
              </Text>
              {dashboard?.is_superuser ? (
                <Text style={[styles.helper, { color: c.textMuted }]}>
                  Les superusers peuvent aussi retirer selon leur part configurée dans Django admin.
                  La liste ci-dessous inclut les soldes de tous les administrateurs.
                </Text>
              ) : null}
              <Text style={[styles.label, { color: c.textSecondary }]}>Numéro Mobile Money</Text>
              <TextInput
                accessibilityLabel="Numéro Mobile Money pour le retrait"
                keyboardType="phone-pad"
                value={account}
                onChangeText={setAccount}
                placeholder="+243..."
                placeholderTextColor={c.textMuted}
                style={[styles.input, { color: c.textPrimary, borderColor: c.border }]}
              />
              <Text style={[styles.label, { color: c.textSecondary }]}>
                Montant à envoyer ({currency})
              </Text>
              <TextInput
                accessibilityLabel={`Montant du retrait en ${currency}`}
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
                placeholder="1.00"
                placeholderTextColor={c.textMuted}
                style={[styles.input, { color: c.textPrimary, borderColor: c.border }]}
              />
              <Text style={[styles.helper, { color: c.textMuted }]}>
                Frais KibaWallet estimés (1 %) : {money(fee, currency)} · Débit total estimé : {money(debit, currency)}.
              </Text>
              <Pressable
                onPress={() => void submitWithdrawal()}
                disabled={!canWithdraw}
                style={[
                  styles.button,
                  { backgroundColor: c.accent },
                  !canWithdraw && styles.disabled,
                ]}
              >
                {submitting ? <ActivityIndicator color={c.onAccent} /> : null}
                <Text style={[styles.buttonText, { color: c.onAccent }]}>
                  {submitting ? 'Envoi en cours…' : `Retirer en ${currency}`}
                </Text>
              </Pressable>
            </View>

            {dashboard?.is_superuser ? (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Soldes des admins</Text>
                {dashboard.admin_balances.map((item) => (
                  <View
                    key={item.user_id}
                    style={[styles.listItem, { backgroundColor: c.surface, borderColor: c.border }]}
                  >
                    <Text style={[styles.listTitle, { color: c.textPrimary }]}>{item.user_name}</Text>
                    <Text style={[styles.helper, { color: c.textSecondary }]}>
                      {item.share_percent}% · {money(item.USD, 'USD')} · {money(item.CDF, 'CDF')}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Transactions</Text>
              {transactions.length === 0 ? (
                <Text style={[styles.helper, { color: c.textMuted }]}>
                  Aucune transaction de portefeuille pour le moment.
                </Text>
              ) : transactions.map((item) => (
                <View
                  key={item.id}
                  style={[styles.listItem, { backgroundColor: c.surface, borderColor: c.border }]}
                >
                  <View style={styles.transactionTop}>
                    <View style={styles.transactionCopy}>
                      <Text style={[styles.listTitle, { color: c.textPrimary }]}>
                        {transactionLabel(item)}
                      </Text>
                      {dashboard?.is_superuser ? (
                        <Text style={[styles.helper, { color: c.textMuted }]}>{item.user_name}</Text>
                      ) : null}
                      <Text style={[styles.helper, { color: c.textMuted }]}>
                        {new Date(item.created_at).toLocaleString('fr-FR')} · {item.external_reference}
                      </Text>
                    </View>
                    <View>
                      <Text style={[styles.transactionAmount, { color: c.textPrimary }]}>
                        {item.type === 'withdrawal' ? '−' : '+'}{money(item.amount, item.currency)}
                      </Text>
                      <Text style={[styles.status, { color: item.status === 'failed' ? '#B42318' : c.textMuted }]}>
                        {item.status === 'succeeded' ? 'Confirmé' : item.status === 'failed' ? 'Échoué' : 'En attente'}
                      </Text>
                    </View>
                  </View>
                  {item.type === 'withdrawal' ? (
                    <Text style={[styles.helper, { color: c.textMuted }]}>
                      Frais {money(item.fee, item.currency)} · total débité {money(item.amount_debited, item.currency)}
                    </Text>
                  ) : null}
                </View>
              ))}
              {nextPage != null ? (
                <Pressable
                  onPress={loadMore}
                  disabled={loadingMore}
                  style={[styles.moreButton, { borderColor: c.border }]}
                >
                  {loadingMore ? <ActivityIndicator color={c.accent} /> : null}
                  <Text style={[styles.moreLabel, { color: c.accent }]}>Charger plus</Text>
                </Pressable>
              ) : null}
            </View>
          </>
        )}

        {notice ? <Text style={[styles.notice, { color: c.accent }]}>{notice}</Text> : null}
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <Text style={[styles.disclaimer, { color: c.textMuted }]}>
          Les retraits sont versés au numéro indiqué. Les frais réels et le statut final dépendent
          de la confirmation KibaWallet. Un retrait en attente reste réservé jusqu’au webhook.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, gap: 14, maxWidth: 760, width: '100%', alignSelf: 'center' },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  backText: { fontFamily: fontFamilies.sansSemiBold, fontSize: 14 },
  title: { fontFamily: fontFamilies.serifSemiBold, fontSize: 28 },
  subtitle: { fontFamily: fontFamilies.sans, fontSize: 14, lineHeight: 21, marginTop: -8 },
  loader: { marginTop: 40 },
  balanceRow: { flexDirection: 'row', gap: 10 },
  balanceCard: { flex: 1, borderWidth: 1, borderRadius: radii.lg, padding: 14, gap: 8 },
  currency: { fontFamily: fontFamilies.sansMedium, fontSize: 12 },
  balance: { fontFamily: fontFamilies.sansSemiBold, fontSize: 18 },
  card: { borderWidth: 1, borderRadius: radii.lg, padding: 16, gap: 11 },
  cardTitle: { fontFamily: fontFamilies.sansSemiBold, fontSize: 17 },
  label: { fontFamily: fontFamilies.sansMedium, fontSize: 13, marginTop: 2 },
  input: { borderWidth: 1, borderRadius: 12, minHeight: 48, paddingHorizontal: 13, fontSize: 15 },
  helper: { fontFamily: fontFamilies.sans, fontSize: 12, lineHeight: 18 },
  button: { minHeight: 48, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  buttonText: { fontFamily: fontFamilies.sansSemiBold, fontSize: 14 },
  disabled: { opacity: 0.45 },
  section: { gap: 9, marginTop: 4 },
  sectionTitle: { fontFamily: fontFamilies.sansSemiBold, fontSize: 18, marginBottom: 2 },
  listItem: { borderWidth: 1, borderRadius: 13, padding: 12, gap: 6 },
  listTitle: { fontFamily: fontFamilies.sansSemiBold, fontSize: 13, flexShrink: 1 },
  transactionTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  transactionCopy: { flex: 1, gap: 4 },
  transactionAmount: { fontFamily: fontFamilies.sansSemiBold, fontSize: 13, textAlign: 'right' },
  status: { fontFamily: fontFamilies.sans, fontSize: 11, textAlign: 'right', marginTop: 3 },
  moreButton: { minHeight: 42, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  moreLabel: { fontFamily: fontFamilies.sansSemiBold, fontSize: 13 },
  notice: { fontFamily: fontFamilies.sansMedium, fontSize: 13, lineHeight: 19 },
  error: { color: '#B42318', fontFamily: fontFamilies.sansMedium, fontSize: 13, lineHeight: 19 },
  disclaimer: { fontFamily: fontFamilies.sans, fontSize: 11, lineHeight: 16, textAlign: 'center', paddingHorizontal: 8 },
});
