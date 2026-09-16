/**
 * Gestion d’une invitation — invités, tables, boissons, stats, check-in QR.
 */

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { QrPattern } from '@/components/ui/QrPattern';
import { openEventEditor } from '@/features/editor/navigation';
import { fontFamilies, radii, semanticColors, shadows, spacing, type AppTheme } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemePreferenceContext';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { buildGuestLink, guestAccessKey } from '@/features/invitation/qr';
import { eventsService } from '@/services/eventsService';
import type { Event } from '@/types';
import {
  addEventTable,
  addEventTableRange,
  addManagedGuest,
  checkInGuest,
  computeManageStats,
  findGuestByCode,
  getEventManageState,
  loadEventManageFromServer,
  removeEventTable,
  removeManagedGuest,
  renameEventTable,
  replaceGuestsFromImport,
  storePeek,
  subscribeEventManage,
  updateManagedGuest,
  type ManagedGuest,
  type ManageRsvp,
} from './eventManageStore';
import {
  exportGuestListFiles,
  parseGuestListImport,
  pickImportFileOnWeb,
} from './guestListIo';
import { parseGuestQrPayload, QrCheckInScanner } from './QrCheckInScanner';
import { SIMULATE_BACKEND } from '@/constants/config';

type TabKey = 'invites' | 'stats' | 'entrance';

const RSVP_LABELS: Record<ManageRsvp, string> = {
  confirmed: 'Confirmé',
  pending: 'En attente',
  declined: 'Refusé',
};

const RSVP_COLORS: Record<ManageRsvp, string> = {
  confirmed: semanticColors.success,
  pending: semanticColors.warning,
  declined: semanticColors.danger,
};

export function EventManageScreen({ eventId }: { eventId: number }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDesktop } = useBreakpoint();
  const { theme, mode } = useAppTheme();
  const c = theme.colors;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>('invites');
  const [error, setError] = useState<string | null>(null);

  const manageVersion = useSyncExternalStore(
    subscribeEventManage,
    () => {
      const state = storePeek(eventId);
      if (!state) return 'empty';
      const guestSig = state.guests
        .map((g) => `${g.id}:${g.rsvp}:${g.drink}:${g.table}:${g.checkedIn}`)
        .join('|');
      return `${state.tables.join(',')}:${guestSig}`;
    },
    () => 'empty',
  );

  const manage = useMemo(() => {
    void manageVersion;
    return getEventManageState(eventId, event);
  }, [eventId, event, manageVersion]);

  const stats = useMemo(() => computeManageStats(manage), [manage]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const page = await eventsService.getEvents();
        const found = page.results.find((item) => item.id === eventId) ?? null;
        if (!alive) return;
        if (!found) {
          setError('Invitation introuvable.');
          setEvent(null);
        } else {
          if (SIMULATE_BACKEND) {
            getEventManageState(eventId, found);
          } else {
            await loadEventManageFromServer(eventId, found);
          }
          setEvent(found);
        }
      } catch {
        if (alive) setError('Impossible de charger l’invitation.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [eventId]);

  if (loading) {
    return (
      <View style={[styles.screen, styles.center, { backgroundColor: c.background }]}>
        <ActivityIndicator color={c.accent} />
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={[styles.screen, styles.center, { backgroundColor: c.background, padding: 24 }]}>
        <Text style={styles.errorText}>{error ?? 'Invitation introuvable.'}</Text>
        <Pressable onPress={() => router.back()} style={styles.backLink}>
          <Text style={[styles.backLinkLabel, { color: c.accent }]}>Retour</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: c.background }]}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <View
        style={[
          styles.topBar,
          {
            paddingTop: insets.top + 10,
            borderBottomColor: c.border,
            backgroundColor: c.surface,
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retour"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/invitations'))}
          hitSlop={8}
          style={[styles.iconBtn, { backgroundColor: c.background }]}
        >
          <Ionicons name="chevron-back" size={22} color={c.textPrimary} />
        </Pressable>
        <View style={styles.topCopy}>
          <Text style={[styles.topKicker, { color: c.accent }]}>Gestion</Text>
          <Text style={[styles.topTitle, { color: c.textPrimary }]} numberOfLines={1}>
            {event.name}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Modifier le design"
          onPress={() => openEventEditor(router, event)}
          hitSlop={8}
          style={[styles.iconBtn, { backgroundColor: c.background }]}
        >
          <Ionicons name="color-palette-outline" size={20} color={c.accent} />
        </Pressable>
      </View>

      <View style={[styles.tabs, isDesktop && styles.tabsDesktop]}>
        {(
          [
            { key: 'invites', label: 'Invités', icon: 'people-outline' },
            { key: 'stats', label: 'Stats', icon: 'stats-chart-outline' },
            { key: 'entrance', label: 'Entrée', icon: 'qr-code-outline' },
          ] as const
        ).map((item) => {
          const active = tab === item.key;
          return (
            <Pressable
              key={item.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onPress={() => setTab(item.key)}
              style={[
                styles.tab,
                {
                  backgroundColor: active ? c.accent : c.surface,
                  borderColor: active ? c.accent : c.border,
                },
              ]}
            >
              <Ionicons
                name={item.icon}
                size={16}
                color={active ? c.onAccent : c.textMuted}
              />
              <Text style={[styles.tabLabel, { color: active ? c.onAccent : c.textMuted }]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.body,
          isDesktop && styles.bodyDesktop,
          { paddingBottom: insets.bottom + 36 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryRow}>
          <SummaryPill label="Confirmés" value={String(stats.confirmed)} tone={semanticColors.success} theme={theme} />
          <SummaryPill label="En attente" value={String(stats.pending)} tone={semanticColors.warning} theme={theme} />
          <SummaryPill label="Refusés" value={String(stats.declined)} tone={semanticColors.danger} theme={theme} />
          <SummaryPill
            label="À l’entrée"
            value={`${stats.checkedIn}/${stats.confirmed}`}
            tone={c.accent}
            theme={theme}
          />
        </View>

        {tab === 'invites' ? (
          <InvitesTab
            eventId={eventId}
            eventName={event.name}
            eventSlug={event.slug}
            guests={manage.guests}
            drinks={manage.drinks}
            tables={manage.tables}
            theme={theme}
          />
        ) : null}
        {tab === 'stats' ? <StatsTab stats={stats} drinks={manage.drinks} theme={theme} /> : null}
        {tab === 'entrance' ? (
          <EntranceTab eventId={eventId} guests={manage.guests} theme={theme} />
        ) : null}
      </ScrollView>
    </View>
  );
}

function SummaryPill({
  label,
  value,
  tone,
  theme,
}: {
  label: string;
  value: string;
  tone: string;
  theme: AppTheme;
}) {
  const c = theme.colors;
  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: c.surface, borderColor: c.border },
        shadows.sm,
      ]}
    >
      <Text style={[styles.pillValue, { color: tone }]}>{value}</Text>
      <Text style={[styles.pillLabel, { color: c.textMuted }]}>{label}</Text>
    </View>
  );
}

function InvitesTab({
  eventId,
  eventName,
  eventSlug,
  guests,
  drinks,
  tables,
  theme,
}: {
  eventId: number;
  eventName: string;
  eventSlug: string;
  guests: ManagedGuest[];
  drinks: string[];
  tables: string[];
  theme: AppTheme;
}) {
  const c = theme.colors;
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contact, setContact] = useState('');
  const [seats, setSeats] = useState(2);
  const [table, setTable] = useState<string | null>(tables[0] ?? null);
  const [tablesManageOpen, setTablesManageOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [ioMessage, setIoMessage] = useState<string | null>(null);
  const [openGuestId, setOpenGuestId] = useState<string | null>(null);
  const canAdd = firstName.trim() && lastName.trim();

  const slug = eventSlug?.trim() || 'invitation';

  const linkFor = (guest: ManagedGuest) =>
    buildGuestLink(slug, guestAccessKey(guest));

  const guestInviteMessage = (guest: ManagedGuest) => {
    const link = linkFor(guest);
    return (
      `Bonjour ${guest.firstName},\n\n` +
      `Quelle joie de vous compter parmi nous pour « ${eventName} » !\n` +
      `Voici votre invitation personnelle — elle est rien qu’à vous :\n${link}\n\n` +
      `On a hâte de vous y retrouver.\nÀ très bientôt !`
    );
  };

  const shareGuestLink = (guest: ManagedGuest) => {
    void Share.share({
      message: guestInviteMessage(guest),
      title: `Invitation pour ${guest.firstName}`,
    });
  };

  const shareWhatsApp = (guest: ManagedGuest) => {
    void Linking.openURL(
      `https://wa.me/?text=${encodeURIComponent(guestInviteMessage(guest))}`,
    );
  };

  const applyImport = useCallback(
    (raw: string, mode: 'replace' | 'merge') => {
      try {
        const parsed = parseGuestListImport(raw);
        replaceGuestsFromImport(eventId, parsed.guests, {
          tables: parsed.tables,
          drinks: parsed.drinks,
          mode,
        });
        setImportOpen(false);
        setImportText('');
        setIoMessage(
          `${parsed.guests.length} invité(s) importé(s) (${parsed.format.toUpperCase()}, ${
            mode === 'replace' ? 'remplacement' : 'fusion'
          }).`,
        );
      } catch (error) {
        setIoMessage(error instanceof Error ? error.message : 'Import impossible.');
      }
    },
    [eventId],
  );

  const handleExport = useCallback(async () => {
    try {
      const state = getEventManageState(eventId);
      const result = await exportGuestListFiles(state, eventName);
      setIoMessage(
        result === 'downloaded'
          ? 'Export téléchargé (JSON complet + CSV Excel).'
          : 'Export partagé (JSON avec tous les détails).',
      );
    } catch {
      setIoMessage('Export impossible.');
    }
  }, [eventId, eventName]);

  const handleImportPress = useCallback(async () => {
    if (Platform.OS === 'web') {
      const raw = await pickImportFileOnWeb();
      if (!raw) return;
      setImportText(raw);
      setImportOpen(true);
      return;
    }
    setImportOpen(true);
  }, []);

  return (
    <View style={styles.block}>
      <View style={styles.ioRow}>
        <Pressable onPress={() => void handleExport()} style={[styles.ioBtn, { borderColor: c.border, backgroundColor: c.surface }]}>
          <Ionicons name="download-outline" size={16} color={c.accent} />
          <Text style={[styles.ioBtnLabel, { color: c.textPrimary }]}>Exporter</Text>
        </Pressable>
        <Pressable onPress={() => void handleImportPress()} style={[styles.ioBtn, { borderColor: c.border, backgroundColor: c.surface }]}>
          <Ionicons name="cloud-upload-outline" size={16} color={c.accent} />
          <Text style={[styles.ioBtnLabel, { color: c.textPrimary }]}>Importer</Text>
        </Pressable>
      </View>
      {ioMessage ? (
        <Text style={[styles.ioHint, { color: c.textSecondary }]}>{ioMessage}</Text>
      ) : (
        <Text style={[styles.ioHint, { color: c.textMuted }]}>
          L’export inclut code, nom, contact, places, RSVP, boisson, table et check-in (JSON + CSV).
        </Text>
      )}

      <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Plan de tables</Text>
      <Pressable
        onPress={() => setTablesManageOpen(true)}
        style={[styles.card, styles.tablesSummary, { backgroundColor: c.surface, borderColor: c.border }, shadows.sm]}
      >
        <View style={[styles.tablesSummaryIcon, { backgroundColor: c.background }]}>
          <Ionicons name="grid-outline" size={18} color={c.accent} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[styles.tablesSummaryTitle, { color: c.textPrimary }]}>
            {tables.length} table{tables.length > 1 ? 's' : ''}
          </Text>
          <Text style={[styles.tablesSummaryHint, { color: c.textMuted }]} numberOfLines={1}>
            {tables.length === 0
              ? 'Aucune table — toucher pour en créer'
              : tables.slice(0, 3).join(' · ') + (tables.length > 3 ? '…' : '')}
          </Text>
        </View>
        <Text style={[styles.tablesSummaryAction, { color: c.accent }]}>Gérer</Text>
        <Ionicons name="chevron-forward" size={16} color={c.textMuted} />
      </Pressable>

      <TablesManagerModal
        visible={tablesManageOpen}
        onClose={() => setTablesManageOpen(false)}
        eventId={eventId}
        tables={tables}
        theme={theme}
        onTablesChanged={(removed) => {
          if (removed && table === removed) setTable(null);
        }}
        onMessage={setIoMessage}
      />

      <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Ajouter un invité</Text>
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }, shadows.sm]}>
        <Field theme={theme} value={firstName} onChangeText={setFirstName} placeholder="Prénom" />
        <Field theme={theme} value={lastName} onChangeText={setLastName} placeholder="Nom" />
        <Field theme={theme} value={contact} onChangeText={setContact} placeholder="Téléphone ou e-mail" />
        <View style={styles.seatRow}>
          <Text style={[styles.seatLabel, { color: c.textSecondary }]}>Places</Text>
          {[1, 2, 3, 4].map((n) => (
            <Pressable
              key={n}
              onPress={() => setSeats(n)}
              style={[
                styles.seatChip,
                {
                  backgroundColor: seats === n ? c.accent : c.background,
                  borderColor: seats === n ? c.accent : c.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.seatChipText,
                  { color: seats === n ? c.onAccent : c.textMuted },
                ]}
              >
                {n}
              </Text>
            </Pressable>
          ))}
        </View>
        <TablePicker theme={theme} tables={tables} value={table} onChange={setTable} />
        <Pressable
          disabled={!canAdd}
          onPress={() => {
            if (!canAdd) return;
            addManagedGuest(eventId, { firstName, lastName, contact, seats, table });
            setFirstName('');
            setLastName('');
            setContact('');
            setSeats(2);
            setTable(tables[0] ?? null);
          }}
          style={[
            styles.primaryBtn,
            { backgroundColor: c.accent },
            !canAdd && styles.disabled,
          ]}
        >
          <Text style={[styles.primaryBtnLabel, { color: c.onAccent }]}>Ajouter</Text>
        </Pressable>
      </View>

      <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Liste ({guests.length})</Text>
      {guests.map((guest) => {
        const open = openGuestId === guest.id;
        return (
          <View
            key={guest.id}
            style={[styles.guestCard, { backgroundColor: c.surface, borderColor: c.border }]}
          >
            <View style={styles.guestHead}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded: open }}
                accessibilityLabel={`${open ? 'Replier' : 'Déplier'} ${guest.firstName} ${guest.lastName}`}
                onPress={() => setOpenGuestId(open ? null : guest.id)}
                style={styles.guestHeadMain}
              >
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[styles.guestName, { color: c.textPrimary }]}>
                    {guest.firstName} {guest.lastName}
                  </Text>
                  <Text style={[styles.guestMeta, { color: c.textMuted }]}>
                    {RSVP_LABELS[guest.rsvp]}
                    {' · '}
                    {guest.seats} place{guest.seats > 1 ? 's' : ''}
                    {guest.table ? ` · ${guest.table}` : ''}
                    {guest.checkedIn ? ' · Entré' : ''}
                  </Text>
                </View>
                <Ionicons
                  name={open ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={c.textMuted}
                />
              </Pressable>
              {!open ? (
                <>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Partager le lien de ${guest.firstName}`}
                    onPress={() => shareGuestLink(guest)}
                    hitSlop={8}
                    style={[styles.shareIconBtn, { backgroundColor: c.background, borderColor: c.border }]}
                  >
                    <Ionicons name="share-outline" size={16} color={c.textPrimary} />
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Envoyer le lien à ${guest.firstName} sur WhatsApp`}
                    onPress={() => shareWhatsApp(guest)}
                    hitSlop={8}
                    style={[styles.whatsAppBtn, { backgroundColor: '#25D366' }]}
                  >
                    <Ionicons name="logo-whatsapp" size={16} color="#FFFFFF" />
                  </Pressable>
                  <Pressable onPress={() => removeManagedGuest(eventId, guest.id)} hitSlop={8}>
                    <Ionicons name="trash-outline" size={18} color={semanticColors.danger} />
                  </Pressable>
                </>
              ) : null}
            </View>

            {open ? (
              <View style={styles.guestDetails}>
                <View style={styles.shareRow}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => shareGuestLink(guest)}
                    style={({ pressed }) => [
                      styles.shareLinkBtn,
                      { backgroundColor: c.accent, flex: 1 },
                      pressed && styles.pressed,
                    ]}
                  >
                    <Ionicons name="share-outline" size={15} color={c.onAccent} />
                    <Text style={[styles.shareLinkBtnLabel, { color: c.onAccent }]}>Partager le lien</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => shareWhatsApp(guest)}
                    style={({ pressed }) => [
                      styles.shareLinkBtn,
                      { backgroundColor: '#25D366' },
                      pressed && styles.pressed,
                    ]}
                  >
                    <Ionicons name="logo-whatsapp" size={15} color="#FFFFFF" />
                    <Text style={[styles.shareLinkBtnLabel, { color: '#FFFFFF' }]}>WhatsApp</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Supprimer ${guest.firstName}`}
                    onPress={() => removeManagedGuest(eventId, guest.id)}
                    hitSlop={8}
                    style={[styles.shareIconBtn, { backgroundColor: c.background, borderColor: c.border }]}
                  >
                    <Ionicons name="trash-outline" size={16} color={semanticColors.danger} />
                  </Pressable>
                </View>

                <View style={styles.rsvpRow}>
                  {(['confirmed', 'pending', 'declined'] as ManageRsvp[]).map((status) => (
                    <Pressable
                      key={status}
                      onPress={() =>
                        updateManagedGuest(eventId, guest.id, {
                          rsvp: status,
                          drink: status === 'confirmed' ? guest.drink ?? drinks[0] ?? null : null,
                        })
                      }
                      style={[
                        styles.rsvpChip,
                        {
                          backgroundColor: guest.rsvp === status ? RSVP_COLORS[status] : c.background,
                          borderColor: guest.rsvp === status ? RSVP_COLORS[status] : c.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.rsvpChipText,
                          { color: guest.rsvp === status ? '#FFF' : c.textSecondary },
                        ]}
                      >
                        {RSVP_LABELS[status]}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <TablePicker
                  theme={theme}
                  tables={tables}
                  value={guest.table}
                  onChange={(next) => updateManagedGuest(eventId, guest.id, { table: next })}
                />

                {guest.rsvp === 'confirmed' ? (
                  <View style={styles.drinkWrap}>
                    <Text style={[styles.drinkLabel, { color: c.textMuted }]}>Boisson</Text>
                    <View style={styles.drinkRow}>
                      {drinks.map((drink) => (
                        <Pressable
                          key={drink}
                          onPress={() => updateManagedGuest(eventId, guest.id, { drink })}
                          style={[
                            styles.drinkChip,
                            {
                              backgroundColor:
                                guest.drink === drink ? c.accentMuted : c.background,
                              borderColor: guest.drink === drink ? c.accent : c.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.drinkChipText,
                              {
                                color:
                                  guest.drink === drink
                                    ? c.accentSoft
                                    : c.textSecondary,
                                fontFamily:
                                  guest.drink === drink
                                    ? fontFamilies.sansSemiBold
                                    : fontFamilies.sans,
                              },
                            ]}
                          >
                            {drink}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                ) : null}

                {guest.checkedIn ? (
                  <Text style={styles.checkedHint}>
                    ✓ Entré
                    {guest.checkedInAt
                      ? ` · ${new Date(guest.checkedInAt).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}`
                      : ''}
                  </Text>
                ) : null}
              </View>
            ) : null}
          </View>
        );
      })}

      <Modal visible={importOpen} animationType="slide" transparent onRequestClose={() => setImportOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Text style={[styles.sectionTitle, { color: c.textPrimary, marginTop: 0 }]}>
              Coller JSON ou CSV
            </Text>
            <TextInput
              value={importText}
              onChangeText={setImportText}
              multiline
              placeholder="Collez le contenu exporté…"
              placeholderTextColor={c.textMuted}
              style={[
                styles.importArea,
                { borderColor: c.border, backgroundColor: c.background, color: c.textPrimary },
              ]}
            />
            <View style={styles.ioRow}>
              <Pressable
                onPress={() => applyImport(importText, 'merge')}
                style={[styles.ioBtn, { borderColor: c.border, backgroundColor: c.background }]}
              >
                <Text style={[styles.ioBtnLabel, { color: c.textPrimary }]}>Fusionner</Text>
              </Pressable>
              <Pressable
                onPress={() => applyImport(importText, 'replace')}
                style={[styles.ioBtn, { borderColor: c.accent, backgroundColor: c.accent }]}
              >
                <Text style={[styles.ioBtnLabel, { color: c.onAccent }]}>Remplacer</Text>
              </Pressable>
            </View>
            <Pressable onPress={() => setImportOpen(false)}>
              <Text style={[styles.ioHint, { color: c.textMuted, textAlign: 'center' }]}>Annuler</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function TablePicker({
  theme,
  tables,
  value,
  onChange,
}: {
  theme: AppTheme;
  tables: string[];
  value: string | null;
  onChange: (next: string | null) => void;
}) {
  const c = theme.colors;
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.drinkWrap}>
      <Text style={[styles.drinkLabel, { color: c.textMuted }]}>Table</Text>
      <Pressable
        onPress={() => setOpen(true)}
        style={[
          styles.tableSelectBtn,
          { backgroundColor: c.background, borderColor: c.border },
        ]}
      >
        <Ionicons name="grid-outline" size={16} color={c.accent} />
        <Text style={[styles.tableSelectValue, { color: c.textPrimary }]} numberOfLines={1}>
          {value ?? 'Aucune table'}
        </Text>
        <Ionicons name="chevron-down" size={16} color={c.textMuted} />
      </Pressable>

      <TableSelectModal
        visible={open}
        onClose={() => setOpen(false)}
        tables={tables}
        value={value}
        theme={theme}
        onChange={(next) => {
          onChange(next);
          setOpen(false);
        }}
      />
    </View>
  );
}

function TableSelectModal({
  visible,
  onClose,
  tables,
  value,
  theme,
  onChange,
}: {
  visible: boolean;
  onClose: () => void;
  tables: string[];
  value: string | null;
  theme: AppTheme;
  onChange: (next: string | null) => void;
}) {
  const c = theme.colors;
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tables;
    return tables.filter((name) => name.toLowerCase().includes(q));
  }, [tables, query]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCardTall, { backgroundColor: c.surface, borderColor: c.border }]}>
          <View style={styles.modalHead}>
            <Text style={[styles.sectionTitle, { color: c.textPrimary, marginTop: 0 }]}>
              Choisir une table
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color={c.textMuted} />
            </Pressable>
          </View>

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Rechercher une table…"
            placeholderTextColor={c.textMuted}
            style={[
              styles.input,
              { borderColor: c.border, backgroundColor: c.background, color: c.textPrimary },
            ]}
          />

          <Pressable
            onPress={() => onChange(null)}
            style={[
              styles.tableListRow,
              {
                backgroundColor: value == null ? 'rgba(196, 165, 116, 0.14)' : 'transparent',
                borderColor: c.border,
              },
            ]}
          >
            <Text style={[styles.tableManageName, { color: c.textPrimary }]}>Aucune</Text>
            {value == null ? <Ionicons name="checkmark" size={18} color={c.accent} /> : null}
          </Pressable>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            style={styles.tableList}
            ListEmptyComponent={
              <Text style={[styles.ioHint, { color: c.textMuted, paddingVertical: 16 }]}>
                Aucune table ne correspond.
              </Text>
            }
            renderItem={({ item }) => {
              const on = value === item;
              return (
                <Pressable
                  onPress={() => onChange(item)}
                  style={[
                    styles.tableListRow,
                    {
                      backgroundColor: on ? 'rgba(196, 165, 116, 0.14)' : 'transparent',
                      borderColor: c.border,
                    },
                  ]}
                >
                  <Text style={[styles.tableManageName, { color: c.textPrimary }]} numberOfLines={1}>
                    {item}
                  </Text>
                  {on ? <Ionicons name="checkmark" size={18} color={c.accent} /> : null}
                </Pressable>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

function TablesManagerModal({
  visible,
  onClose,
  eventId,
  tables,
  theme,
  onTablesChanged,
  onMessage,
}: {
  visible: boolean;
  onClose: () => void;
  eventId: number;
  tables: string[];
  theme: AppTheme;
  onTablesChanged: (removed?: string) => void;
  onMessage: (message: string) => void;
}) {
  const c = theme.colors;
  const [query, setQuery] = useState('');
  const [newTable, setNewTable] = useState('');
  const [rangeTo, setRangeTo] = useState('80');
  const [editingTable, setEditingTable] = useState<string | null>(null);
  const [editTableValue, setEditTableValue] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tables;
    return tables.filter((name) => name.toLowerCase().includes(q));
  }, [tables, query]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCardTall, { backgroundColor: c.surface, borderColor: c.border }]}>
          <View style={styles.modalHead}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[styles.sectionTitle, { color: c.textPrimary, marginTop: 0 }]}>
                Gérer les tables
              </Text>
              <Text style={[styles.ioHint, { color: c.textMuted }]}>
                {tables.length} table{tables.length > 1 ? 's' : ''} — recherchez plutôt que scroller.
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color={c.textMuted} />
            </Pressable>
          </View>

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Filtrer…"
            placeholderTextColor={c.textMuted}
            style={[
              styles.input,
              { borderColor: c.border, backgroundColor: c.background, color: c.textPrimary },
            ]}
          />

          <View style={styles.tableAddRow}>
            <TextInput
              value={newTable}
              onChangeText={setNewTable}
              placeholder="Nouvelle table…"
              placeholderTextColor={c.textMuted}
              style={[
                styles.input,
                styles.tableEditInput,
                { borderColor: c.border, backgroundColor: c.background, color: c.textPrimary },
              ]}
            />
            <Pressable
              onPress={() => {
                if (addEventTable(eventId, newTable)) {
                  setNewTable('');
                } else {
                  onMessage('Table invalide ou déjà existante.');
                }
              }}
              style={[
                styles.tableAddBtn,
                { backgroundColor: c.accent },
                !newTable.trim() && styles.disabled,
              ]}
            >
              <Text style={[styles.tableAddBtnLabel, { color: c.onAccent }]}>Ajouter</Text>
            </Pressable>
          </View>

          <View style={[styles.bulkRow, { borderColor: c.border, backgroundColor: c.background }]}>
            <Text style={[styles.bulkLabel, { color: c.textSecondary }]}>Série Table 1 →</Text>
            <TextInput
              value={rangeTo}
              onChangeText={setRangeTo}
              keyboardType="number-pad"
              placeholder="80"
              placeholderTextColor={c.textMuted}
              style={[
                styles.bulkInput,
                { borderColor: c.border, backgroundColor: c.surface, color: c.textPrimary },
              ]}
            />
            <Pressable
              onPress={() => {
                const to = Number(rangeTo);
                if (!Number.isFinite(to) || to < 1) {
                  onMessage('Indiquez un nombre valide (ex. 80).');
                  return;
                }
                const added = addEventTableRange(eventId, 1, Math.floor(to));
                onMessage(
                  added > 0
                    ? `${added} table(s) ajoutée(s) (Table 1 → Table ${Math.floor(to)}).`
                    : 'Ces tables existent déjà.',
                );
              }}
              style={[styles.tableAddBtn, { backgroundColor: c.accent }]}
            >
              <Text style={[styles.tableAddBtnLabel, { color: c.onAccent }]}>Créer</Text>
            </Pressable>
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            style={styles.tableList}
            ListEmptyComponent={
              <Text style={[styles.ioHint, { color: c.textMuted, paddingVertical: 16 }]}>
                Aucune table.
              </Text>
            }
            renderItem={({ item: name }) => (
              <View style={[styles.tableManageRow, { borderBottomColor: c.border }]}>
                {editingTable === name ? (
                  <>
                    <TextInput
                      value={editTableValue}
                      onChangeText={setEditTableValue}
                      placeholderTextColor={c.textMuted}
                      style={[
                        styles.input,
                        styles.tableEditInput,
                        { borderColor: c.border, backgroundColor: c.background, color: c.textPrimary },
                      ]}
                    />
                    <Pressable
                      onPress={() => {
                        if (renameEventTable(eventId, name, editTableValue)) {
                          onTablesChanged();
                          setEditingTable(null);
                        } else {
                          onMessage('Impossible de renommer (vide ou déjà utilisé).');
                        }
                      }}
                      hitSlop={6}
                    >
                      <Ionicons name="checkmark" size={20} color={semanticColors.success} />
                    </Pressable>
                    <Pressable onPress={() => setEditingTable(null)} hitSlop={6}>
                      <Ionicons name="close" size={20} color={c.textMuted} />
                    </Pressable>
                  </>
                ) : (
                  <>
                    <Text style={[styles.tableManageName, { color: c.textPrimary }]} numberOfLines={1}>
                      {name}
                    </Text>
                    <Pressable
                      onPress={() => {
                        setEditingTable(name);
                        setEditTableValue(name);
                      }}
                      hitSlop={6}
                    >
                      <Ionicons name="pencil-outline" size={18} color={c.textMuted} />
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        removeEventTable(eventId, name);
                        onTablesChanged(name);
                      }}
                      hitSlop={6}
                    >
                      <Ionicons name="trash-outline" size={18} color={semanticColors.danger} />
                    </Pressable>
                  </>
                )}
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

function StatsTab({
  stats,
  drinks,
  theme,
}: {
  stats: ReturnType<typeof computeManageStats>;
  drinks: string[];
  theme: AppTheme;
}) {
  const c = theme.colors;
  const rsvpTotal = Math.max(1, stats.confirmed + stats.pending + stats.declined);
  const drinkEntries = drinks
    .map((drink) => ({ drink, count: stats.drinkCounts[drink] ?? 0 }))
    .filter((row) => row.count > 0);
  const drinkMax = Math.max(1, ...drinkEntries.map((row) => row.count));
  const tableEntries = Object.entries(stats.tableCounts)
    .map(([table, count]) => ({ table, count }))
    .sort((a, b) => b.count - a.count);
  const tableMax = Math.max(1, ...tableEntries.map((row) => row.count));

  return (
    <View style={styles.block}>
      <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Réponses RSVP</Text>
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }, shadows.sm]}>
        <BarRow theme={theme} label="Confirmés" value={stats.confirmed} max={rsvpTotal} color={semanticColors.success} />
        <BarRow theme={theme} label="En attente" value={stats.pending} max={rsvpTotal} color={semanticColors.warning} />
        <BarRow theme={theme} label="Refusés" value={stats.declined} max={rsvpTotal} color={semanticColors.danger} />
        <Text style={[styles.statFoot, { color: c.textMuted }]}>
          {stats.seatsConfirmed} places confirmées · {stats.checkedIn} entrées
        </Text>
      </View>

      <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Plan de tables</Text>
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }, shadows.sm]}>
        {tableEntries.length === 0 ? (
          <Text style={[styles.emptyHint, { color: c.textMuted }]}>Aucune table assignée.</Text>
        ) : (
          tableEntries.map((row) => (
            <BarRow
              key={row.table}
              theme={theme}
              label={row.table}
              value={row.count}
              max={tableMax}
              color={c.accent}
            />
          ))
        )}
      </View>

      <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Choix de boissons</Text>
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }, shadows.sm]}>
        {drinkEntries.length === 0 ? (
          <Text style={[styles.emptyHint, { color: c.textMuted }]}>Aucun choix de boisson pour l’instant.</Text>
        ) : (
          drinkEntries.map((row) => (
            <BarRow
              key={row.drink}
              theme={theme}
              label={row.drink}
              value={row.count}
              max={drinkMax}
              color={c.accent}
            />
          ))
        )}
      </View>

      <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Répartition visuelle</Text>
      <View
        style={[
          styles.card,
          styles.pieCard,
          { backgroundColor: c.surface, borderColor: c.border },
          shadows.sm,
        ]}
      >
        <MiniPie
          theme={theme}
          slices={[
            { value: stats.confirmed, color: semanticColors.success },
            { value: stats.pending, color: '#B0894F' },
            { value: stats.declined, color: semanticColors.danger },
          ]}
        />
        <View style={styles.pieLegend}>
          <LegendDot theme={theme} color={semanticColors.success} label={`Confirmés (${stats.confirmed})`} />
          <LegendDot theme={theme} color={semanticColors.warning} label={`En attente (${stats.pending})`} />
          <LegendDot theme={theme} color={semanticColors.danger} label={`Refusés (${stats.declined})`} />
        </View>
      </View>
    </View>
  );
}

function BarRow({
  label,
  value,
  max,
  color,
  theme,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  theme: AppTheme;
}) {
  const c = theme.colors;
  const width = `${Math.max(6, Math.round((value / max) * 100))}%`;
  return (
    <View style={styles.barRow}>
      <View style={styles.barMeta}>
        <Text style={[styles.barLabel, { color: c.textPrimary }]}>{label}</Text>
        <Text style={[styles.barValue, { color: c.textSecondary }]}>{value}</Text>
      </View>
      <View style={[styles.barTrack, { backgroundColor: c.background }]}>
        <View style={[styles.barFill, { width: width as `${number}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

function MiniPie({
  slices,
  theme,
}: {
  slices: { value: number; color: string }[];
  theme: AppTheme;
}) {
  const c = theme.colors;
  const total = Math.max(1, slices.reduce((sum, slice) => sum + slice.value, 0));
  let cursor = 0;
  const stops = slices
    .filter((slice) => slice.value > 0)
    .map((slice) => {
      const start = (cursor / total) * 100;
      cursor += slice.value;
      const end = (cursor / total) * 100;
      return `${slice.color} ${start}% ${end}%`;
    })
    .join(', ');

  return (
    <View
      style={[
        styles.pie,
        {
          backgroundColor: slices[0]?.color ?? c.border,
          ...(stops ? ({ backgroundImage: `conic-gradient(${stops})` } as object) : null),
        },
      ]}
    >
      <View style={[styles.pieHole, { backgroundColor: c.surface }]}>
        <Text style={[styles.pieHoleText, { color: c.textPrimary }]}>{total}</Text>
        <Text style={[styles.pieHoleSub, { color: c.textMuted }]}>invités</Text>
      </View>
    </View>
  );
}

function LegendDot({
  color,
  label,
  theme,
}: {
  color: string;
  label: string;
  theme: AppTheme;
}) {
  return (
    <View style={styles.legendRow}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={[styles.legendLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

function EntranceTab({
  eventId,
  guests,
  theme,
}: {
  eventId: number;
  guests: ManagedGuest[];
  theme: AppTheme;
}) {
  const c = theme.colors;
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [last, setLast] = useState<ManagedGuest | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  const processCode = useCallback(
    (raw: string) => {
      const normalized = parseGuestQrPayload(raw) || raw.trim();
      const found = findGuestByCode(eventId, normalized);
      if (!found) {
        setMessage('QR / code non reconnu.');
        setLast(null);
        return;
      }
      if (found.rsvp !== 'confirmed') {
        setMessage(`${found.firstName} n’a pas confirmé sa présence (${RSVP_LABELS[found.rsvp]}).`);
        setLast(found);
        return;
      }
      if (found.checkedIn) {
        setMessage(`${found.firstName} est déjà entré(e).`);
        setLast(found);
        return;
      }
      const updated = checkInGuest(eventId, found.id);
      setLast(updated);
      const tableHint = found.table ? ` — ${found.table}` : '';
      setMessage(`Bienvenue ${found.firstName} ${found.lastName} !${tableHint}`);
      setCode('');
    },
    [eventId],
  );

  const waiting = guests.filter((guest) => guest.rsvp === 'confirmed' && !guest.checkedIn);
  const inside = guests.filter((guest) => guest.checkedIn);

  return (
    <View style={styles.block}>
      <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Contrôle d’entrée</Text>
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }, shadows.sm]}>
        <Text style={[styles.entranceHint, { color: c.textMuted }]}>
          Scannez le QR du pass invité avec la caméra, ou saisissez le code manuellement.
        </Text>

        <Pressable
          onPress={() => setScannerOpen(true)}
          style={[styles.primaryBtn, { backgroundColor: c.accent }]}
        >
          <Ionicons name="camera-outline" size={18} color={c.onAccent} />
          <Text style={[styles.primaryBtnLabel, { color: c.onAccent }]}>Ouvrir le scanner QR</Text>
        </Pressable>

        <Field
          theme={theme}
          value={code}
          onChangeText={setCode}
          placeholder="INV-1001 ou Prénom Nom"
          autoCapitalize="characters"
        />
        <Pressable
          onPress={() => processCode(code)}
          style={[
            styles.primaryBtn,
            styles.secondaryBtn,
            { backgroundColor: c.surface, borderWidth: 1.4, borderColor: c.accent },
          ]}
        >
          <Ionicons name="keypad-outline" size={18} color={c.accent} />
          <Text style={[styles.primaryBtnLabel, { color: c.accent }]}>Vérifier le code</Text>
        </Pressable>

        {message ? (
          <Text style={[styles.scanMessage, { color: c.textPrimary }]}>{message}</Text>
        ) : null}

        {last ? (
          <View
            style={[
              styles.doorCard,
              {
                backgroundColor: theme.mode === 'dark' ? 'rgba(196, 165, 116, 0.12)' : 'rgba(196, 165, 116, 0.16)',
                borderColor: c.accent,
              },
            ]}
          >
            <View style={styles.doorHead}>
              <QrPattern seed={last.id} size={14} cell={5} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.guestName, { color: c.textPrimary }]}>
                  {last.firstName} {last.lastName}
                </Text>
                <Text style={[styles.guestMeta, { color: c.textMuted }]}>{last.id}</Text>
              </View>
              {last.checkedIn ? (
                <View style={styles.doorBadge}>
                  <Text style={styles.doorBadgeText}>Entré</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.doorInfoGrid}>
              <View style={[styles.doorInfoCell, { backgroundColor: c.surface, borderColor: c.border }]}>
                <Ionicons name="grid-outline" size={16} color={c.accent} />
                <Text style={[styles.doorInfoLabel, { color: c.textMuted }]}>Table</Text>
                <Text style={[styles.doorInfoValue, { color: c.textPrimary }]}>
                  {last.table ?? 'Non assignée'}
                </Text>
              </View>
              <View style={[styles.doorInfoCell, { backgroundColor: c.surface, borderColor: c.border }]}>
                <Ionicons name="wine-outline" size={16} color={c.accent} />
                <Text style={[styles.doorInfoLabel, { color: c.textMuted }]}>Boisson</Text>
                <Text style={[styles.doorInfoValue, { color: c.textPrimary }]}>
                  {last.drink ?? '—'}
                </Text>
              </View>
              <View style={[styles.doorInfoCell, { backgroundColor: c.surface, borderColor: c.border }]}>
                <Ionicons name="people-outline" size={16} color={c.accent} />
                <Text style={[styles.doorInfoLabel, { color: c.textMuted }]}>Places</Text>
                <Text style={[styles.doorInfoValue, { color: c.textPrimary }]}>{last.seats}</Text>
              </View>
            </View>
          </View>
        ) : null}
      </View>

      <QrCheckInScanner
        visible={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={processCode}
      />

      <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>
        En attente d’entrée ({waiting.length})
      </Text>
      {waiting.length === 0 ? (
        <Text style={[styles.emptyHint, { color: c.textMuted }]}>Tous les confirmés sont entrés.</Text>
      ) : (
        waiting.map((guest) => (
          <Pressable
            key={guest.id}
            style={[styles.guestCard, { backgroundColor: c.surface, borderColor: c.border }]}
            onPress={() => processCode(guest.id)}
          >
            <Text style={[styles.guestName, { color: c.textPrimary }]}>
              {guest.firstName} {guest.lastName}
            </Text>
            <Text style={[styles.guestMeta, { color: c.textMuted }]}>
              {guest.id}
              {guest.table ? ` · ${guest.table}` : ''}
              {guest.drink ? ` · ${guest.drink}` : ''}
              {' · Toucher pour faire entrer'}
            </Text>
          </Pressable>
        ))
      )}

      <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>
        Déjà entrés ({inside.length})
      </Text>
      {inside.map((guest) => (
        <View
          key={guest.id}
          style={[styles.guestCard, { backgroundColor: c.surface, borderColor: c.border }]}
        >
          <Text style={[styles.guestName, { color: c.textPrimary }]}>
            {guest.firstName} {guest.lastName}
          </Text>
          <Text style={[styles.guestMeta, { color: c.textMuted }]}>
            {guest.table ? `${guest.table} · ` : ''}
            {guest.checkedInAt
              ? new Date(guest.checkedInAt).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '—'}
          </Text>
        </View>
      ))}
    </View>
  );
}

function Field({
  theme,
  value,
  onChangeText,
  placeholder,
  style,
  autoCapitalize,
}: {
  theme: AppTheme;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  style?: object;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}) {
  const c = theme.colors;
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={c.textMuted}
      autoCapitalize={autoCapitalize}
      style={[
        styles.input,
        {
          borderColor: c.border,
          backgroundColor: c.background,
          color: c.textPrimary,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: spacing.md,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topCopy: { flex: 1 },
  topKicker: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  topTitle: {
    fontFamily: fontFamilies.serifMedium,
    fontSize: 18,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  tabsDesktop: { maxWidth: 960, alignSelf: 'center', width: '100%' },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  tabLabel: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 13,
  },
  body: { paddingHorizontal: spacing.md, gap: 16 },
  bodyDesktop: { maxWidth: 960, width: '100%', alignSelf: 'center', paddingHorizontal: 28 },
  summaryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    flexGrow: 1,
    minWidth: '45%',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  pillValue: { fontFamily: fontFamilies.sansSemiBold, fontSize: 20 },
  pillLabel: {
    fontFamily: fontFamilies.sans,
    fontSize: 11,
    marginTop: 2,
  },
  block: { gap: 12 },
  sectionTitle: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 15,
    marginTop: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  ioRow: { flexDirection: 'row', gap: 8 },
  ioBtn: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 10,
  },
  ioBtnLabel: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 13,
  },
  ioHint: {
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    lineHeight: 17,
  },
  tableManageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 44,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 4,
  },
  tableManageName: {
    flex: 1,
    minWidth: 0,
    fontFamily: fontFamilies.sansMedium,
    fontSize: 14,
  },
  tableAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  tableEditInput: {
    flex: 1,
    minWidth: 0,
  },
  tableAddBtn: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  tableAddBtnLabel: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 13,
  },
  tablesSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tablesSummaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tablesSummaryTitle: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 15,
  },
  tablesSummaryHint: {
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    marginTop: 2,
  },
  tablesSummaryAction: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 13,
  },
  tableSelectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  tableSelectValue: {
    flex: 1,
    minWidth: 0,
    fontFamily: fontFamilies.sansMedium,
    fontSize: 14,
  },
  modalCardTall: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 10,
    maxHeight: '88%',
    minHeight: '55%',
  },
  modalHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tableList: {
    flexGrow: 0,
    maxHeight: 320,
  },
  tableListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 6,
  },
  bulkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  bulkLabel: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 12,
  },
  bulkInput: {
    width: 56,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 8,
    textAlign: 'center',
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 14,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  modalCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    maxHeight: '80%',
  },
  importArea: {
    minHeight: 160,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontFamily: fontFamilies.sans,
    fontSize: 13,
    textAlignVertical: 'top',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontFamily: fontFamilies.sans,
    fontSize: 14,
    width: '100%',
  },
  seatRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  seatLabel: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 13,
    marginRight: 4,
  },
  seatChip: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  seatChipText: { fontFamily: fontFamilies.sansSemiBold },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radii.full,
    minHeight: 46,
    paddingHorizontal: 16,
  },
  secondaryBtn: {},
  primaryBtnLabel: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 14,
  },
  secondaryBtnLabel: {},
  disabled: { opacity: 0.45 },
  guestCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  guestHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  guestHeadMain: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  guestDetails: { gap: 10, paddingTop: 2 },
  shareRow: { flexDirection: 'row', gap: 8 },
  shareLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  shareLinkBtnLabel: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 12.5,
  },
  pressed: { opacity: 0.85 },
  shareIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  whatsAppBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestName: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 15,
  },
  guestMeta: {
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    marginTop: 2,
  },
  rsvpRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  rsvpChip: {
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
  },
  rsvpChipText: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 11,
  },
  drinkWrap: { gap: 6 },
  drinkLabel: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 12,
  },
  drinkRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  drinkChip: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
  },
  drinkChipText: {
    fontSize: 11,
  },
  checkedHint: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 12,
    color: semanticColors.success,
  },
  barRow: { gap: 6, marginBottom: 8 },
  barMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  barLabel: { fontFamily: fontFamilies.sansMedium, fontSize: 13 },
  barValue: { fontFamily: fontFamilies.sansSemiBold, fontSize: 13 },
  barTrack: {
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 999 },
  statFoot: {
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    marginTop: 4,
  },
  pieCard: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  pie: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pieHole: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieHoleText: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 18,
  },
  pieHoleSub: {
    fontFamily: fontFamilies.sans,
    fontSize: 10,
  },
  pieLegend: { flex: 1, gap: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: {
    fontFamily: fontFamilies.sans,
    fontSize: 13,
  },
  entranceHint: {
    fontFamily: fontFamilies.sans,
    fontSize: 13,
    lineHeight: 19,
  },
  scanMessage: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 13,
    textAlign: 'center',
  },
  doorCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 12,
    marginTop: 4,
  },
  doorHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  doorBadge: {
    backgroundColor: semanticColors.success,
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  doorBadgeText: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 11,
    color: '#FFF',
  },
  doorInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  doorInfoCell: {
    flexGrow: 1,
    minWidth: '28%',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 4,
  },
  doorInfoLabel: {
    fontFamily: fontFamilies.sans,
    fontSize: 11,
  },
  doorInfoValue: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 14,
  },
  emptyHint: {
    fontFamily: fontFamilies.sans,
    fontSize: 13,
  },
  errorText: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 14,
    color: semanticColors.danger,
    textAlign: 'center',
  },
  backLink: { marginTop: 16 },
  backLinkLabel: {
    fontFamily: fontFamilies.sansSemiBold,
  },
});
