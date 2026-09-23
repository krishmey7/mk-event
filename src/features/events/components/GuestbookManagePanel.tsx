/**
 * Liste + suppression des messages du livre d’or (organisateur).
 */

import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { fontFamilies, radii, spacing, type AppTheme } from '@/constants/theme';
import {
  guestbookService,
  type GuestbookEntry,
} from '@/services/guestbookService';

export function GuestbookManagePanel({
  eventId,
  theme,
}: {
  eventId: number;
  theme: AppTheme;
}) {
  const c = theme.colors;
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await guestbookService.listForEvent(eventId);
      setEntries(list);
    } catch {
      setError('Impossible de charger le livre d’or.');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    void load();
  }, [load]);

  const remove = async (entryId: number) => {
    setBusyId(entryId);
    try {
      await guestbookService.deleteEntry(eventId, entryId);
      setEntries((prev) => prev.filter((item) => item.id !== entryId));
    } catch {
      setError('Suppression impossible. Réessayez.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <View style={styles.block}>
      <Text style={[styles.title, { color: c.textPrimary }]}>Livre d’or</Text>
      <Text style={[styles.hint, { color: c.textMuted }]}>
        Messages laissés par vos invités sur l’invitation.
      </Text>

      {loading ? (
        <ActivityIndicator color={c.accent} style={{ marginTop: 12 }} />
      ) : null}

      {error ? (
        <Text style={[styles.error, { color: '#A45A45' }]}>{error}</Text>
      ) : null}

      {!loading && entries.length === 0 ? (
        <Text style={[styles.empty, { color: c.textMuted }]}>
          Aucun message pour le moment.
        </Text>
      ) : null}

      {entries.map((entry) => (
        <View
          key={entry.id}
          style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}
        >
          <View style={styles.cardBody}>
            <Text style={[styles.message, { color: c.textPrimary }]}>{entry.message}</Text>
            <Text style={[styles.meta, { color: c.textMuted }]}>
              {entry.author_name} · {guestbookService.formatRelative(entry.created_at)}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Supprimer le message"
            disabled={busyId === entry.id}
            onPress={() => void remove(entry.id)}
            hitSlop={8}
            style={styles.deleteBtn}
          >
            {busyId === entry.id ? (
              <ActivityIndicator size="small" color={c.textMuted} />
            ) : (
              <Ionicons name="trash-outline" size={18} color={c.textMuted} />
            )}
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { gap: spacing.sm, marginTop: spacing.lg },
  title: { fontFamily: fontFamilies.serifMedium, fontSize: 18 },
  hint: { fontFamily: fontFamilies.sans, fontSize: 13, lineHeight: 18 },
  error: { fontFamily: fontFamilies.sansMedium, fontSize: 13 },
  empty: { fontFamily: fontFamilies.sans, fontSize: 13, marginTop: 4 },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: 12,
  },
  cardBody: { flex: 1, gap: 4 },
  message: { fontFamily: fontFamilies.sans, fontSize: 14, lineHeight: 20 },
  meta: { fontFamily: fontFamilies.sans, fontSize: 11 },
  deleteBtn: { padding: 4 },
});
