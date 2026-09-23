/**
 * Gestion d’une invitation — invités, tables, boissons, stats, check-in QR.
 */

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type RefObject } from 'react';
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
import { GuestbookManagePanel } from '@/features/events/components/GuestbookManagePanel';
import { fontFamilies, radii, semanticColors, shadows, spacing, type AppTheme } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemePreferenceContext';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { buildGuestLink, guestAccessKey } from '@/features/invitation/qr';
import { eventsService } from '@/services/eventsService';
import type { Event } from '@/types';
import { EVENT_STATUS_LABELS } from '@/types';
import {
  addEventTable,
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
import { ManagePostPublishSheet } from './components/ManagePostPublishSheet';
import { GuestComposeCard } from './components/GuestComposeCard';
import {
  hydrateManageCoach,
  markEntranceSeen,
  markWelcomeSeen,
  resetWelcomeCoach,
} from './manageCoach';

type TabKey = 'invites' | 'stats' | 'entrance';

const TABS = [
  {
    key: 'invites' as const,
    label: 'Invités',
    icon: 'people-outline' as const,
  },
  {
    key: 'stats' as const,
    label: 'Réponses',
    icon: 'stats-chart-outline' as const,
  },
  {
    key: 'entrance' as const,
    label: 'Entrée',
    icon: 'qr-code-outline' as const,
  },
];

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

export function EventManageScreen({
  eventId,
  showWelcome = false,
}: {
  eventId: number;
  showWelcome?: boolean;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDesktop } = useBreakpoint();
  const { theme, mode } = useAppTheme();
  const c = theme.colors;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>('invites');
  const [error, setError] = useState<string | null>(null);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [welcomeFromPublish, setWelcomeFromPublish] = useState(false);
  const [entranceTip, setEntranceTip] = useState(false);

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

  const statusLabel = EVENT_STATUS_LABELS[event?.status ?? 'draft'] ?? 'Invitation';

  useEffect(() => {
    if (eventId < 0) return;
    let alive = true;
    void hydrateManageCoach(eventId).then((coach) => {
      if (!alive) return;
      if (showWelcome && !coach.welcomeSeen) {
        setWelcomeFromPublish(true);
        setWelcomeOpen(true);
      }
    });
    return () => {
      alive = false;
    };
  }, [eventId, showWelcome]);

  useEffect(() => {
    if (tab !== 'entrance' || eventId < 0) return;
    let alive = true;
    void hydrateManageCoach(eventId).then((coach) => {
      if (!alive) return;
      if (!coach.entranceSeen) {
        setEntranceTip(true);
      }
    });
    return () => {
      alive = false;
    };
  }, [tab, eventId]);

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
          <Text style={[styles.topTitle, { color: c.textPrimary }]} numberOfLines={1}>
            {event.name}
          </Text>
          <Text style={[styles.topSubtitle, { color: c.textMuted }]} numberOfLines={1}>
            {statusLabel}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Aide organisation"
          onPress={() => {
            resetWelcomeCoach(eventId);
            setWelcomeFromPublish(false);
            setWelcomeOpen(true);
          }}
          hitSlop={8}
          style={[styles.helpBtn, { backgroundColor: c.background, borderColor: c.border }]}
        >
          <Text style={[styles.helpBtnLabel, { color: c.textSecondary }]}>?</Text>
        </Pressable>
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
        {TABS.map((item) => {
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
        {tab === 'stats' ? (
          <View style={{ gap: 8 }}>
            <StatsTab stats={stats} drinks={manage.drinks} theme={theme} />
            <GuestbookManagePanel eventId={eventId} theme={theme} />
          </View>
        ) : null}
        {tab === 'entrance' ? (
          <EntranceTab
            eventId={eventId}
            guests={manage.guests}
            theme={theme}
            showTip={entranceTip}
            onDismissTip={() => {
              markEntranceSeen(eventId);
              setEntranceTip(false);
            }}
          />
        ) : null}
      </ScrollView>

      <ManagePostPublishSheet
        visible={welcomeOpen}
        theme={theme}
        onStart={() => {
          markWelcomeSeen(eventId);
          setWelcomeOpen(false);
          setWelcomeFromPublish(false);
          setTab('invites');
        }}
        onLater={() => {
          markWelcomeSeen(eventId);
          setWelcomeOpen(false);
          if (welcomeFromPublish) {
            setWelcomeFromPublish(false);
            router.replace('/invitations');
            return;
          }
          setWelcomeFromPublish(false);
        }}
      />
    </View>
  );
}

function InvitesTab({
  eventId,
  eventName,
  eventSlug,
  guests,
  drinks: _drinks,
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
  const [seats, setSeats] = useState(2);
  const [table, setTable] = useState<string | null>(tables[0] ?? null);
  const [tablesManageOpen, setTablesManageOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [ioMessage, setIoMessage] = useState<string | null>(null);
  const [openGuestId, setOpenGuestId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(guests.length === 0);
  const firstNameInputRef = useRef<TextInput>(null);
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

  const openAddForm = () => {
    setAddOpen(true);
    setTimeout(() => firstNameInputRef.current?.focus(), 80);
  };

  return (
    <View style={styles.block}>
      <View style={styles.invitesHeader}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[styles.invitesHeaderTitle, { color: c.textPrimary }]}>
            {guests.length === 0
              ? 'Qui invitez-vous ?'
              : `${guests.length} personne${guests.length > 1 ? 's' : ''}`}
          </Text>
        </View>
        {guests.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            onPress={openAddForm}
            style={[styles.addChip, { backgroundColor: c.accent }]}
          >
            <Ionicons name="add" size={18} color={c.onAccent} />
            <Text style={[styles.addChipLabel, { color: c.onAccent }]}>Ajouter</Text>
          </Pressable>
        ) : null}
      </View>

      {guests.length > 0 ? (
        <View
          style={[
            styles.plainTip,
            { backgroundColor: c.accentMuted, borderColor: c.accent },
          ]}
        >
          <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
          <Text style={[styles.plainTipText, { color: c.textPrimary }]}>
            Pour envoyer l’invitation : appuyez sur le bouton vert WhatsApp à côté du nom.
          </Text>
        </View>
      ) : null}

      {guests.length === 0 || addOpen ? (
        <GuestComposeCard
          theme={theme}
          firstName={firstName}
          lastName={lastName}
          seats={seats}
          canSave={Boolean(canAdd)}
          showClose={guests.length > 0}
          firstNameRef={firstNameInputRef}
          tableSlot={
            <TablePicker
              theme={theme}
              tables={tables}
              value={table}
              onChange={setTable}
              onManageTables={() => setTablesManageOpen(true)}
            />
          }
          onChangeFirstName={setFirstName}
          onChangeLastName={setLastName}
          onChangeSeats={setSeats}
          onClose={() => setAddOpen(false)}
          onImport={() => void handleImportPress()}
          onSave={() => {
            if (!canAdd) return;
            addManagedGuest(eventId, { firstName, lastName, contact: '', seats, table });
            setFirstName('');
            setLastName('');
            setSeats(2);
            setTable(tables[0] ?? null);
            if (guests.length > 0) setAddOpen(false);
          }}
        />
      ) : null}

      {guests.length === 0 ? null : (
        guests.map((guest) => {
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
                      accessibilityLabel={`Envoyer l’invitation à ${guest.firstName} sur WhatsApp`}
                      onPress={() => shareWhatsApp(guest)}
                      hitSlop={8}
                      style={[styles.sendWhatsAppBtn, { backgroundColor: '#25D366' }]}
                    >
                      <Ionicons name="logo-whatsapp" size={16} color="#FFFFFF" />
                      <Text style={styles.sendWhatsAppLabel}>Envoyer</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Autre façon de partager le lien de ${guest.firstName}`}
                      onPress={() => shareGuestLink(guest)}
                      hitSlop={8}
                      style={[styles.shareIconBtn, { backgroundColor: c.background, borderColor: c.border }]}
                    >
                      <Ionicons name="share-outline" size={16} color={c.textPrimary} />
                    </Pressable>
                    <Pressable onPress={() => removeManagedGuest(eventId, guest.id)} hitSlop={8}>
                      <Ionicons name="trash-outline" size={18} color={semanticColors.danger} />
                    </Pressable>
                  </>
                ) : null}
              </View>

              {open ? (
                <View style={styles.guestDetails}>
                  <View style={styles.guestChoiceGrid}>
                    <View style={[styles.guestChoiceCell, { backgroundColor: c.background }]}>
                      <Text style={[styles.guestChoiceLabel, { color: c.textMuted }]}>Réponse</Text>
                      <Text
                        style={[styles.guestChoiceValue, { color: RSVP_COLORS[guest.rsvp] }]}
                        numberOfLines={1}
                      >
                        {RSVP_LABELS[guest.rsvp]}
                      </Text>
                    </View>
                    <View style={[styles.guestChoiceCell, { backgroundColor: c.background }]}>
                      <Text style={[styles.guestChoiceLabel, { color: c.textMuted }]}>Boisson</Text>
                      <Text style={[styles.guestChoiceValue, { color: c.textPrimary }]} numberOfLines={1}>
                        {guest.rsvp === 'confirmed' ? guest.drink ?? '—' : '—'}
                      </Text>
                    </View>
                    <View style={[styles.guestChoiceCell, { backgroundColor: c.background }]}>
                      <Text style={[styles.guestChoiceLabel, { color: c.textMuted }]}>Places</Text>
                      <Text style={[styles.guestChoiceValue, { color: c.textPrimary }]}>
                        {guest.seats}
                      </Text>
                    </View>
                  </View>

                  <TablePicker
                    theme={theme}
                    tables={tables}
                    value={guest.table}
                    onChange={(next) => updateManagedGuest(eventId, guest.id, { table: next })}
                    onManageTables={() => setTablesManageOpen(true)}
                    compact
                  />

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
        })
      )}

      <View style={[styles.toolsBlock, { borderTopColor: c.border }]}>
        <Text style={[styles.toolsTitle, { color: c.textMuted }]}>Aussi disponible</Text>
        <Pressable
          onPress={() => setTablesManageOpen(true)}
          style={[styles.toolsRow, { backgroundColor: c.surface, borderColor: c.border }]}
        >
          <Ionicons name="grid-outline" size={16} color={c.accent} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={[styles.toolsRowLabel, { color: c.textPrimary }]}>
              {tables.length === 0
                ? 'Créer le plan de tables'
                : `Plan de tables (${tables.length})`}
            </Text>
            {tables.length === 0 ? (
              <Text style={[styles.toolsRowHint, { color: c.textMuted }]}>
                Pour y placer vos invités ensuite
              </Text>
            ) : null}
          </View>
          <Ionicons name="chevron-forward" size={16} color={c.textMuted} />
        </Pressable>
        <View style={styles.toolsLinks}>
          <Pressable onPress={() => void handleImportPress()} hitSlop={6}>
            <Text style={[styles.toolsLink, { color: c.accent }]}>Importer une liste</Text>
          </Pressable>
          <Text style={{ color: c.border }}>·</Text>
          <Pressable onPress={() => void handleExport()} hitSlop={6}>
            <Text style={[styles.toolsLink, { color: c.accent }]}>Exporter</Text>
          </Pressable>
        </View>
        {ioMessage ? (
          <Text style={[styles.ioHint, { color: c.textSecondary }]}>{ioMessage}</Text>
        ) : null}
      </View>

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
  compact = false,
  onManageTables,
}: {
  theme: AppTheme;
  tables: string[];
  value: string | null;
  onChange: (next: string | null) => void;
  compact?: boolean;
  onManageTables?: () => void;
}) {
  const c = theme.colors;
  const [open, setOpen] = useState(false);

  if (tables.length === 0) {
    return (
      <View style={compact ? styles.tablePickerCompact : styles.drinkWrap}>
        {compact ? (
          <Text style={[styles.guestChoiceLabel, { color: c.textMuted }]}>Table</Text>
        ) : (
          <Text style={[styles.drinkLabel, { color: c.textMuted }]}>Table</Text>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Créer des tables pour y placer les invités"
          onPress={onManageTables}
          style={[
            styles.tableEmptyCta,
            compact && styles.tableEmptyCtaCompact,
            { backgroundColor: c.accentMuted, borderColor: c.accent },
          ]}
        >
          <Ionicons name="grid-outline" size={18} color={c.accent} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={[styles.tableEmptyTitle, { color: c.textPrimary }]}>
              Pas encore de tables
            </Text>
            {!compact ? (
              <Text style={[styles.tableEmptyHint, { color: c.textMuted }]}>
                Créez-en d’abord, puis assignez vos invités.
              </Text>
            ) : null}
          </View>
          <Text style={[styles.tableEmptyAction, { color: c.accent }]}>Créer</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={compact ? styles.tablePickerCompact : styles.drinkWrap}>
      {compact ? (
        <Text style={[styles.guestChoiceLabel, { color: c.textMuted }]}>Table</Text>
      ) : (
        <Text style={[styles.drinkLabel, { color: c.textMuted }]}>Table</Text>
      )}
      <Pressable
        onPress={() => setOpen(true)}
        style={[
          styles.tableSelectBtn,
          compact && styles.tableSelectBtnCompact,
          { backgroundColor: c.background, borderColor: c.border },
        ]}
      >
        <Ionicons name="grid-outline" size={16} color={c.accent} />
        <Text style={[styles.tableSelectValue, { color: c.textPrimary }]} numberOfLines={1}>
          {value ?? 'Sans table'}
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
                {tables.length === 0
                  ? 'Ajoutez des tables (ex. Table 1), puis assignez-y vos invités.'
                  : `${tables.length} table${tables.length > 1 ? 's' : ''} — recherchez plutôt que scroller.`}
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

          <FlatList
            data={filtered}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            style={styles.tableList}
            ListEmptyComponent={
              <Text style={[styles.ioHint, { color: c.textMuted, paddingVertical: 16 }]}>
                {tables.length === 0
                  ? 'Aucune table pour l’instant — ajoutez-en ci-dessus.'
                  : 'Aucune table ne correspond.'}
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
  const total = stats.confirmed + stats.pending + stats.declined;
  const drinkEntries = drinks
    .map((drink) => ({ drink, count: stats.drinkCounts[drink] ?? 0 }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count);
  const tableEntries = Object.entries(stats.tableCounts)
    .map(([table, count]) => ({ table, count }))
    .sort((a, b) => b.count - a.count);

  if (total === 0) {
    return (
      <View style={styles.block}>
        <Text style={[styles.invitesHeaderTitle, { color: c.textPrimary }]}>Qui vient ?</Text>
        <Text style={[styles.plainTipText, { color: c.textMuted }]}>
          Les réponses de vos invités apparaîtront ici.
        </Text>
        <View style={[styles.emptyListCard, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Ionicons name="mail-open-outline" size={22} color={c.textMuted} />
          <Text style={[styles.emptyHint, { color: c.textMuted, textAlign: 'center' }]}>
            Ajoutez des invités et envoyez-leur l’invitation. Leurs réponses s’afficheront ensuite.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.block}>
      <Text style={[styles.invitesHeaderTitle, { color: c.textPrimary }]}>Qui vient ?</Text>
      <Text style={[styles.plainTipText, { color: c.textMuted }]}>
        Un coup d’œil rapide sur les réponses.
      </Text>

      <View
        style={[
          styles.statsHero,
          { backgroundColor: c.surface, borderColor: c.border },
          shadows.sm,
        ]}
      >
        <Text style={[styles.statsHeroNumber, { color: semanticColors.success }]}>
          {stats.confirmed}
        </Text>
        <Text style={[styles.statsHeroLabel, { color: c.textPrimary }]}>
          {stats.confirmed <= 1 ? 'personne a dit oui' : 'personnes ont dit oui'}
        </Text>
        <Text style={[styles.statsHeroMeta, { color: c.textMuted }]}>
          {stats.pending} en attente · {stats.declined}{' '}
          {stats.declined <= 1 ? 'a dit non' : 'ont dit non'}
        </Text>
        <Text style={[styles.statsHeroMeta, { color: c.textSecondary }]}>
          {stats.seatsConfirmed} place{stats.seatsConfirmed > 1 ? 's' : ''} · {stats.checkedIn}{' '}
          déjà entré{stats.checkedIn > 1 ? 's' : ''}
        </Text>
      </View>

      <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Par table</Text>
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }, shadows.sm]}>
        {tableEntries.length === 0 ? (
          <Text style={[styles.emptyHint, { color: c.textMuted }]}>
            Aucune table assignée pour l’instant.
          </Text>
        ) : (
          tableEntries.map((row) => (
            <SimpleCountRow
              key={row.table}
              label={row.table}
              value={row.count}
              theme={theme}
            />
          ))
        )}
      </View>

      <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Boissons</Text>
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }, shadows.sm]}>
        {drinkEntries.length === 0 ? (
          <Text style={[styles.emptyHint, { color: c.textMuted }]}>
            Pas encore de choix de boisson.
          </Text>
        ) : (
          drinkEntries.map((row) => (
            <SimpleCountRow
              key={row.drink}
              label={row.drink}
              value={row.count}
              theme={theme}
            />
          ))
        )}
      </View>
    </View>
  );
}

function SimpleCountRow({
  label,
  value,
  theme,
}: {
  label: string;
  value: number;
  theme: AppTheme;
}) {
  const c = theme.colors;
  return (
    <View style={styles.simpleCountRow}>
      <Text style={[styles.simpleCountLabel, { color: c.textPrimary }]} numberOfLines={1}>
        {label}
      </Text>
      <Text style={[styles.simpleCountValue, { color: c.accent }]}>{value}</Text>
    </View>
  );
}

function EntranceTab({
  eventId,
  guests,
  theme,
  showTip,
  onDismissTip,
}: {
  eventId: number;
  guests: ManagedGuest[];
  theme: AppTheme;
  showTip?: boolean;
  onDismissTip?: () => void;
}) {
  const c = theme.colors;
  const [message, setMessage] = useState<string | null>(null);
  const [last, setLast] = useState<ManagedGuest | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  const processCode = useCallback(
    (raw: string) => {
      const normalized = parseGuestQrPayload(raw) || raw.trim();
      const found = findGuestByCode(eventId, normalized);
      if (!found) {
        setMessage('QR non reconnu.');
        setLast(null);
        return;
      }
      if (found.rsvp !== 'confirmed') {
        setMessage(`${found.firstName} n’a pas encore confirmé sa présence.`);
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
    },
    [eventId],
  );

  const waiting = guests.filter((guest) => guest.rsvp === 'confirmed' && !guest.checkedIn);
  const inside = guests.filter((guest) => guest.checkedIn);

  return (
    <View style={styles.block}>
      {showTip ? (
        <View
          style={[
            styles.checkinTip,
            { backgroundColor: c.accentMuted, borderColor: c.accent },
          ]}
        >
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={[styles.checkinTipTitle, { color: c.accentSoft }]}>Petit conseil</Text>
            <Text style={[styles.checkinTipBody, { color: c.textSecondary }]}>
              L’invité doit d’abord répondre « oui ». Ensuite le QR apparaît sur son téléphone.
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fermer l’astuce"
            onPress={onDismissTip}
            hitSlop={8}
          >
            <Ionicons name="close" size={18} color={c.textMuted} />
          </Pressable>
        </View>
      ) : null}

      <View
        style={[
          styles.checkinHero,
          { backgroundColor: c.surface, borderColor: c.border },
          shadows.sm,
        ]}
      >
        <View style={[styles.checkinHeroIcon, { backgroundColor: c.accentMuted }]}>
          <Ionicons name="qr-code-outline" size={26} color={c.accent} />
        </View>
        <Text style={[styles.checkinHeroTitle, { color: c.textPrimary }]}>
          Faire entrer les invités
        </Text>
        <Text style={[styles.checkinHeroBody, { color: c.textMuted }]}>
          Demandez le QR sur le téléphone de l’invité, puis scannez-le.
        </Text>

        <Pressable
          onPress={() => setScannerOpen(true)}
          style={[styles.scannerCta, { backgroundColor: c.accent }]}
        >
          <Ionicons name="qr-code-outline" size={22} color={c.onAccent} />
          <Text style={[styles.scannerCtaLabel, { color: c.onAccent }]}>Scanner le QR</Text>
        </Pressable>

        {Platform.OS === 'web' ? (
          <Text style={[styles.webCamNote, { color: c.textMuted }]}>
            Autorisez la caméra du navigateur si demandé.
          </Text>
        ) : null}

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
        En attente ({waiting.length})
      </Text>
      {waiting.length === 0 ? (
        <View style={[styles.emptyListCard, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Ionicons name="checkmark-circle-outline" size={22} color={c.textMuted} />
          <Text style={[styles.emptyHint, { color: c.textMuted, textAlign: 'center' }]}>
            {guests.some((g) => g.rsvp === 'confirmed')
              ? 'Tous les confirmés sont entrés.'
              : 'Aucun invité confirmé pour le moment.'}
          </Text>
        </View>
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
              {[guest.table, guest.drink].filter(Boolean).join(' · ') || 'Confirmé'}
              {' · Toucher pour faire entrer'}
            </Text>
          </Pressable>
        ))
      )}

      <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>
        Déjà entrés ({inside.length})
      </Text>
      {inside.length === 0 ? (
        <View style={[styles.emptyListCard, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Ionicons name="enter-outline" size={22} color={c.textMuted} />
          <Text style={[styles.emptyHint, { color: c.textMuted, textAlign: 'center' }]}>
            Les entrées validées apparaîtront ici.
          </Text>
        </View>
      ) : (
        inside.map((guest) => (
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
        ))
      )}
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
  inputRef,
}: {
  theme: AppTheme;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  style?: object;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  inputRef?: RefObject<TextInput | null>;
}) {
  const c = theme.colors;
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      ref={inputRef}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={c.textMuted}
      autoCapitalize={autoCapitalize}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      selectionColor={c.accent}
      style={[
        styles.input,
        {
          borderColor: focused ? c.accent : c.border,
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
  topCopy: { flex: 1, minWidth: 0 },
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
  topSubtitle: {
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  helpBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpBtnLabel: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 16,
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
    paddingVertical: 11,
    paddingHorizontal: 6,
    borderRadius: 14,
    borderWidth: 1,
    minHeight: 44,
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
  tableEmptyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  tableEmptyCtaCompact: {
    flex: 1,
    minHeight: 40,
    paddingVertical: 8,
  },
  tableEmptyTitle: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 13.5,
  },
  tableEmptyHint: {
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  tableEmptyAction: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 13,
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
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none', outlineWidth: 0 } as object) : null),
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
  guestDetails: { gap: 8, paddingTop: 4 },
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
  guestChoiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  guestChoiceGrid: {
    flexDirection: 'row',
    gap: 6,
  },
  guestChoiceCell: {
    flex: 1,
    minWidth: 0,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 8,
    gap: 2,
  },
  guestChoiceLabel: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 10,
  },
  guestChoiceValue: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 12.5,
  },
  guestChoiceBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  guestChoiceBadgeText: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  tableEditHint: {
    fontFamily: fontFamilies.sans,
    fontSize: 11.5,
    lineHeight: 16,
    marginTop: -2,
  },
  tablePickerCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tableSelectBtnCompact: {
    flex: 1,
    minHeight: 40,
    paddingVertical: 8,
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
  statsHero: {
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 22,
    paddingHorizontal: 18,
    alignItems: 'center',
    gap: 4,
  },
  statsHeroNumber: {
    fontFamily: fontFamilies.serifMedium,
    fontSize: 48,
    lineHeight: 54,
  },
  statsHeroLabel: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 16,
    textAlign: 'center',
  },
  statsHeroMeta: {
    fontFamily: fontFamilies.sans,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  simpleCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 8,
  },
  simpleCountLabel: {
    flex: 1,
    fontFamily: fontFamilies.sansMedium,
    fontSize: 14,
  },
  simpleCountValue: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 16,
  },
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
  inviteLinkHint: {
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  invitesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  invitesHeaderTitle: {
    fontFamily: fontFamilies.serifMedium,
    fontSize: 20,
  },
  plainTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  plainTipText: {
    flex: 1,
    fontFamily: fontFamilies.sans,
    fontSize: 14,
    lineHeight: 20,
  },
  sendWhatsAppBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  sendWhatsAppLabel: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  addChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  addChipLabel: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 13,
  },
  addFormHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  toolsBlock: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  toolsTitle: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  toolsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  toolsRowLabel: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 13,
  },
  toolsRowHint: {
    fontFamily: fontFamilies.sans,
    fontSize: 11.5,
    lineHeight: 15,
    marginTop: 2,
  },
  toolsLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 2,
  },
  toolsLink: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 13,
  },
  emptyInvites: {
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 10,
  },
  emptyInvitesIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyInvitesTitle: {
    fontFamily: fontFamilies.serifMedium,
    fontSize: 18,
    textAlign: 'center',
  },
  emptyInvitesHint: {
    fontFamily: fontFamilies.sans,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    maxWidth: 280,
  },
  emptyInvitesActions: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    marginTop: 8,
  },
  shareTextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  shareTextBtnLabel: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 11,
  },
  checkinTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  checkinTipTitle: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 13,
  },
  checkinTipBody: {
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  checkinHero: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    gap: 12,
    alignItems: 'stretch',
  },
  checkinHeroIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  checkinHeroTitle: {
    fontFamily: fontFamilies.serifMedium,
    fontSize: 20,
  },
  checkinHeroBody: {
    fontFamily: fontFamilies.sans,
    fontSize: 14,
    lineHeight: 20,
    marginTop: -4,
  },
  scannerCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 54,
    borderRadius: 16,
    marginTop: 4,
  },
  scannerCtaLabel: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 16,
  },
  webCamNote: {
    fontFamily: fontFamilies.sans,
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'center',
  },
  checkinSecondaryLabel: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 12,
    marginTop: 4,
  },
  emptyListCard: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
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
