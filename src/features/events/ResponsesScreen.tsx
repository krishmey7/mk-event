/**
 * Réponses globales — toutes les RSVP de toutes les invitations.
 */

import { useEffect, useMemo, useSyncExternalStore } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { brandColors, fontFamilies, radii, shadows, spacing } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemePreferenceContext';
import { openEventManage } from '@/features/editor/navigation';
import {
  getEventManageState,
  getManageRevision,
  loadEventManageFromServer,
  subscribeEventManage,
  type ManagedGuest,
  type ManageRsvp,
} from '@/features/events/eventManageStore';
import { useEvents } from '@/features/events/useEvents';
import { SIMULATE_BACKEND } from '@/constants/config';
import type { Event } from '@/types';

const RSVP_LABELS: Record<ManageRsvp, string> = {
  confirmed: 'Confirmé',
  pending: 'En attente',
  declined: 'Refusé',
};

const RSVP_COLORS: Record<ManageRsvp, string> = {
  confirmed: '#5C6B4A',
  pending: '#B0894F',
  declined: '#A45A45',
};

interface ResponseRow {
  event: Event;
  guest: ManagedGuest;
}

export function ResponsesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { events, isLoading, error } = useEvents();
  const { theme, mode } = useAppTheme();
  const c = theme.colors;

  const manageVersion = useSyncExternalStore(
    subscribeEventManage,
    getManageRevision,
    () => 0,
  );

  useEffect(() => {
    if (SIMULATE_BACKEND || events.length === 0) return;
    let alive = true;
    (async () => {
      for (const event of events) {
        if (!alive) return;
        try {
          await loadEventManageFromServer(event.id, event);
        } catch {
          getEventManageState(event.id, event);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [events]);

  const rows = useMemo(() => {
    void manageVersion;
    const list: ResponseRow[] = [];
    events.forEach((event) => {
      const state = getEventManageState(event.id, event);
      state.guests.forEach((guest) => {
        list.push({ event, guest });
      });
    });
    return list;
  }, [events, manageVersion]);

  const grouped = useMemo(() => {
    const map = new Map<number, { event: Event; guests: ManagedGuest[] }>();
    rows.forEach(({ event, guest }) => {
      const bucket = map.get(event.id) ?? { event, guests: [] };
      bucket.guests.push(guest);
      map.set(event.id, bucket);
    });
    return Array.from(map.values());
  }, [rows]);

  const totals = useMemo(() => {
    const confirmed = rows.filter((row) => row.guest.rsvp === 'confirmed').length;
    const pending = rows.filter((row) => row.guest.rsvp === 'pending').length;
    const declined = rows.filter((row) => row.guest.rsvp === 'declined').length;
    return { confirmed, pending, declined, total: rows.length };
  }, [rows]);

  return (
    <View style={[styles.screen, { backgroundColor: c.background }]}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />

      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retour"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/dashboard'))}
          hitSlop={8}
          style={[styles.backBtn, { backgroundColor: c.surface, borderColor: c.border }]}
        >
          <Ionicons name="chevron-back" size={20} color={c.textPrimary} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={[styles.kicker, { color: brandColors.coralDeep }]}>Vue globale</Text>
          <Text style={[styles.title, { color: c.textPrimary }]}>Réponses</Text>
          <Text style={[styles.subtitle, { color: c.textMuted }]}>
            Toutes les RSVP de vos invitations, regroupées par événement.
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 110 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryRow}>
          <SummaryChip label="Total" value={String(totals.total)} color={c.textPrimary} themeBg={c.surface} border={c.border} />
          <SummaryChip label="Confirmés" value={String(totals.confirmed)} color="#5C6B4A" themeBg={c.surface} border={c.border} />
          <SummaryChip label="Attente" value={String(totals.pending)} color="#B0894F" themeBg={c.surface} border={c.border} />
          <SummaryChip label="Refusés" value={String(totals.declined)} color="#A45A45" themeBg={c.surface} border={c.border} />
        </View>

        {isLoading ? (
          <ActivityIndicator color={brandColors.coralDeep} style={{ marginTop: 24 }} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : grouped.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Ionicons name="people-outline" size={28} color={brandColors.coralDeep} />
            <Text style={[styles.emptyTitle, { color: c.textPrimary }]}>Aucune réponse pour l’instant</Text>
            <Text style={[styles.emptyHint, { color: c.textMuted }]}>
              Dès que vos invitations auront des invités, leurs réponses apparaîtront ici.
            </Text>
          </View>
        ) : (
          grouped.map(({ event, guests }) => {
            const confirmed = guests.filter((g) => g.rsvp === 'confirmed').length;
            return (
              <View
                key={event.id}
                style={[styles.eventBlock, { backgroundColor: c.surface, borderColor: c.border }, shadows.sm]}
              >
                <Pressable
                  onPress={() => openEventManage(router, event)}
                  style={styles.eventHead}
                >
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={[styles.eventName, { color: c.textPrimary }]} numberOfLines={1}>
                      {event.name}
                    </Text>
                    <Text style={[styles.eventMeta, { color: c.textMuted }]}>
                      {confirmed}/{guests.length} confirmés · Toucher pour gérer
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
                </Pressable>

                {guests.map((guest) => (
                  <View
                    key={`${event.id}-${guest.id}`}
                    style={[styles.guestRow, { borderTopColor: c.border }]}
                  >
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={[styles.guestName, { color: c.textPrimary }]} numberOfLines={1}>
                        {guest.firstName} {guest.lastName}
                      </Text>
                      <Text style={[styles.guestMeta, { color: c.textMuted }]} numberOfLines={1}>
                        {guest.id}
                        {guest.table ? ` · ${guest.table}` : ''}
                        {guest.drink ? ` · ${guest.drink}` : ''}
                        {guest.checkedIn ? ' · Entré' : ''}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.rsvpPill,
                        { backgroundColor: RSVP_COLORS[guest.rsvp] },
                      ]}
                    >
                      <Text style={styles.rsvpPillText}>{RSVP_LABELS[guest.rsvp]}</Text>
                    </View>
                  </View>
                ))}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

function SummaryChip({
  label,
  value,
  color,
  themeBg,
  border,
}: {
  label: string;
  value: string;
  color: string;
  themeBg: string;
  border: string;
}) {
  return (
    <View style={[styles.chip, { backgroundColor: themeBg, borderColor: border }]}>
      <Text style={[styles.chipValue, { color }]}>{value}</Text>
      <Text style={styles.chipLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: { gap: 4 },
  kicker: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 11,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fontFamilies.serifSemiBold,
    fontSize: 28,
    lineHeight: 34,
  },
  subtitle: {
    fontFamily: fontFamilies.sans,
    fontSize: 13.5,
    lineHeight: 20,
  },
  content: {
    paddingHorizontal: spacing.lg,
    gap: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexGrow: 1,
    minWidth: '22%',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  chipValue: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 18,
  },
  chipLabel: {
    fontFamily: fontFamilies.sans,
    fontSize: 11,
    color: '#9A9EA7',
    marginTop: 2,
  },
  eventBlock: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  eventHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  eventName: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 15,
  },
  eventMeta: {
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    marginTop: 2,
  },
  guestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  guestName: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 14,
  },
  guestMeta: {
    fontFamily: fontFamilies.sans,
    fontSize: 11.5,
    marginTop: 2,
  },
  rsvpPill: {
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  rsvpPillText: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 11,
    color: '#FFF',
  },
  empty: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 36,
    paddingHorizontal: 20,
    borderRadius: 18,
    borderWidth: 1,
  },
  emptyTitle: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 15,
    marginTop: 4,
  },
  emptyHint: {
    fontFamily: fontFamilies.sans,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  errorText: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 13,
    color: '#A45A45',
  },
});
