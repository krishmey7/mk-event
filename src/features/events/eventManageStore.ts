/**
 * Gestion d’invitation — seed local (démo) ou sync Django.
 */

import { SIMULATE_BACKEND } from '@/constants/config';
import { eventsService } from '@/services/eventsService';
import { guestsService } from '@/services/guestsService';
import { DEFAULT_DRINKS } from '@/features/invitation/guestRegistry';
import type { Guest as StudioGuest } from '@/features/invitation/types';
import type { Event, Guest as ApiGuest, Table as ApiTable } from '@/types';

export type ManageRsvp = 'confirmed' | 'pending' | 'declined';

export const DEFAULT_TABLES = [
  "Table d'honneur",
  'Table 1',
  'Table 2',
  'Table 3',
  'Table 4',
  'Table 5',
  'Table 6',
];

export const GUEST_TABLES = DEFAULT_TABLES;

export interface ManagedGuest {
  id: string;
  /** PK Django (absent en mode démo pur). */
  apiId?: number;
  accessToken?: string;
  firstName: string;
  lastName: string;
  contact: string;
  seats: number;
  rsvp: ManageRsvp;
  drink: string | null;
  table: string | null;
  tableId?: number | null;
  checkedIn: boolean;
  checkedInAt: string | null;
}

export interface EventManageState {
  eventId: number;
  drinks: string[];
  tables: string[];
  /** name → id Django */
  tableIds: Record<string, number>;
  guests: ManagedGuest[];
  summaryKey: string;
  source: 'local' | 'api';
}

const store = new Map<number, EventManageState>();
const listeners = new Set<() => void>();
let manageRevision = 0;

const FIRST_NAMES = [
  'Sarah', 'Marc', 'Emma', 'Paul', 'Léa', 'Hugo', 'Chloé', 'Noah', 'Inès', 'Julie',
  'Antoine', 'Camille', 'Lucas', 'Manon', 'Thomas', 'Claire', 'Nicolas', 'Alice', 'Julien', 'Sophie',
  'Louis', 'Eva', 'Gabriel', 'Jade', 'Arthur', 'Lina', 'Raphaël', 'Zoé', 'Adam', 'Nina',
];

const LAST_NAMES = [
  'Dubois', 'Lefèvre', 'Petit', 'Martin', 'Bernard', 'Moreau', 'Garcia', 'Roux', 'Blanc', 'Faure',
  'Girard', 'André', 'Meyer', 'Lambert', 'Fontaine', 'Chevalier', 'Robin', 'Guerin', 'Boyer', 'Lopez',
];

function emit(): void {
  manageRevision += 1;
  listeners.forEach((listener) => listener());
}

export function getManageRevision(): number {
  return manageRevision;
}

function assignTable(tables: string[], index: number, rsvp: ManageRsvp): string | null {
  if (rsvp === 'declined' || tables.length === 0) return null;
  return tables[index % tables.length] ?? null;
}

export function storePeek(eventId: number): EventManageState | null {
  return store.get(eventId) ?? null;
}

export function subscribeEventManage(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function summaryKeyOf(event: Event): string {
  const r = event.rsvp_summary;
  return `${event.id}:${event.guests_count}:${r.confirmed}:${r.pending}:${r.maybe}:${r.declined}`;
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return { firstName: 'Invité', lastName: '' };
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

function mapRsvp(status: ApiGuest['rsvp_status']): ManageRsvp {
  if (status === 'confirmed') return 'confirmed';
  if (status === 'declined') return 'declined';
  return 'pending';
}

function mapApiGuest(guest: ApiGuest): ManagedGuest {
  const { firstName, lastName } = splitName(guest.full_name);
  return {
    id: String(guest.id),
    apiId: guest.id,
    accessToken: guest.access_token,
    firstName,
    lastName,
    contact: guest.email || guest.phone || '',
    seats: Math.max(1, guest.adults_count + guest.children_count),
    rsvp: mapRsvp(guest.rsvp_status),
    drink: guest.drink ?? null,
    table: guest.table_detail?.name ?? null,
    tableId: guest.table,
    checkedIn: Boolean(guest.checked_in),
    checkedInAt: guest.checked_in_at ?? null,
  };
}

function buildFromApi(
  eventId: number,
  event: Event | null | undefined,
  apiGuests: ApiGuest[],
  apiTables: ApiTable[],
): EventManageState {
  const snap = eventsService.readSnapshot(eventId);
  const drinks = snap?.drinks?.length ? snap.drinks : DEFAULT_DRINKS;
  const tableIds: Record<string, number> = {};
  const tables = apiTables.map((table) => {
    tableIds[table.name] = table.id;
    return table.name;
  });
  return {
    eventId,
    drinks,
    tables,
    tableIds,
    guests: apiGuests.map(mapApiGuest),
    summaryKey: event ? summaryKeyOf(event) : `${eventId}:api`,
    source: 'api',
  };
}

/** Charge invités + tables depuis Django (remplace le seed local). */
export async function loadEventManageFromServer(
  eventId: number,
  event?: Event | null,
): Promise<EventManageState> {
  const [apiGuests, apiTables] = await Promise.all([
    guestsService.listGuests(eventId),
    guestsService.listTables(eventId),
  ]);
  const next = buildFromApi(eventId, event, apiGuests, apiTables);
  store.set(eventId, next);
  emit();
  return next;
}

function seedFromEvent(event: Event): EventManageState {
  const snap = eventsService.readSnapshot(event.id);
  const drinks = snap?.drinks?.length ? snap.drinks : DEFAULT_DRINKS;
  const tables = [...DEFAULT_TABLES];
  const key = summaryKeyOf(event);

  if (snap?.guests?.length) {
    const guests = distributeStudioGuests(snap.guests, event, drinks, tables);
    return { eventId: event.id, drinks, tables, tableIds: {}, guests, summaryKey: key, source: 'local' };
  }

  return {
    eventId: event.id,
    drinks,
    tables,
    tableIds: {},
    guests: demoGuestsForEvent(event, drinks, tables),
    summaryKey: key,
    source: 'local',
  };
}

function distributeStudioGuests(
  guests: StudioGuest[],
  event: Event,
  drinks: string[],
  tables: string[],
): ManagedGuest[] {
  const statuses = buildStatusList(event);
  return guests.map((guest, index) => {
    const rsvp = statuses[index] ?? 'pending';
    return {
      id: guest.id,
      firstName: guest.firstName,
      lastName: guest.lastName,
      contact: guest.contact,
      seats: guest.seats,
      rsvp,
      drink: rsvp === 'confirmed' ? drinks[index % drinks.length] ?? null : null,
      table: assignTable(tables, index, rsvp),
      checkedIn: false,
      checkedInAt: null,
    };
  });
}

function buildStatusList(event: Event): ManageRsvp[] {
  const { confirmed, pending, maybe, declined } = event.rsvp_summary;
  const statuses: ManageRsvp[] = [
    ...Array.from({ length: confirmed }, () => 'confirmed' as const),
    ...Array.from({ length: pending + maybe }, () => 'pending' as const),
    ...Array.from({ length: declined }, () => 'declined' as const),
  ];
  const target = Math.max(event.guests_count, event.rsvp_summary.total, statuses.length);
  while (statuses.length < target) statuses.push('pending');
  return statuses.slice(0, target);
}

function demoGuestsForEvent(
  event: Event,
  drinks: string[],
  tables: string[],
): ManagedGuest[] {
  const statuses = buildStatusList(event);
  return statuses.map((rsvp, index) => {
    const firstName = FIRST_NAMES[index % FIRST_NAMES.length];
    const lastName = LAST_NAMES[index % LAST_NAMES.length];
    const id = `INV-${event.id}${String(index + 1).padStart(3, '0')}`;
    return {
      id,
      firstName,
      lastName,
      contact: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.fr`,
      seats: 1,
      rsvp,
      drink: rsvp === 'confirmed' ? drinks[index % drinks.length] ?? null : null,
      table: assignTable(tables, index, rsvp),
      checkedIn: false,
      checkedInAt: null,
    };
  });
}

export function getEventManageState(eventId: number, event?: Event | null): EventManageState {
  const existing = store.get(eventId);

  if (!SIMULATE_BACKEND && existing?.source === 'api') {
    return existing;
  }

  if (event) {
    const key = summaryKeyOf(event);
    if (!existing || existing.summaryKey !== key || existing.guests.length === 0) {
      if (!SIMULATE_BACKEND && existing?.source === 'api') return existing;
      const seeded = seedFromEvent(event);
      store.set(eventId, seeded);
      if (existing) emit();
      return seeded;
    }
    return normalizeState(existing);
  }

  if (existing) return normalizeState(existing);
  return {
    eventId,
    drinks: DEFAULT_DRINKS,
    tables: [...DEFAULT_TABLES],
    tableIds: {},
    guests: [],
    summaryKey: `${eventId}:empty`,
    source: 'local',
  };
}

function normalizeState(state: EventManageState): EventManageState {
  const tables =
    Array.isArray(state.tables) && state.tables.length > 0 ? state.tables : [...DEFAULT_TABLES];
  const tableIds = state.tableIds ?? {};
  const needsGuestFix = state.guests.some((guest) => !('table' in guest));
  const needsTablesFix = !Array.isArray(state.tables) || state.tables.length === 0;

  if (!needsGuestFix && !needsTablesFix && state.tableIds) {
    return { ...state, tables, tableIds, source: state.source ?? 'local' };
  }

  const next: EventManageState = {
    ...state,
    tables,
    tableIds,
    source: state.source ?? 'local',
    guests: state.guests.map((guest, index) => ({
      ...guest,
      table: guest.table ?? assignTable(tables, index, guest.rsvp),
    })),
  };
  store.set(state.eventId, next);
  return next;
}

function isApi(state: EventManageState): boolean {
  return !SIMULATE_BACKEND && state.source === 'api';
}

async function syncGuestPatch(
  state: EventManageState,
  guest: ManagedGuest,
  patch: Partial<ManagedGuest>,
): Promise<void> {
  if (!isApi(state) || guest.apiId == null) return;
  const merged = { ...guest, ...patch };
  const tableId =
    merged.table == null
      ? null
      : state.tableIds[merged.table] ?? merged.tableId ?? null;
  await guestsService.updateGuest(state.eventId, guest.apiId, {
    full_name: `${merged.firstName} ${merged.lastName}`.trim(),
    email: merged.contact.includes('@') ? merged.contact : null,
    phone: merged.contact && !merged.contact.includes('@') ? merged.contact : null,
    adults_count: merged.seats,
    children_count: 0,
    rsvp_status: merged.rsvp,
    table: tableId,
    drink: merged.drink,
  });
}

export function updateManagedGuest(
  eventId: number,
  guestId: string,
  patch: Partial<ManagedGuest>,
): void {
  const state = store.get(eventId);
  if (!state) return;
  const previous = state.guests.find((guest) => guest.id === guestId);
  store.set(eventId, {
    ...state,
    guests: state.guests.map((guest) =>
      guest.id === guestId ? { ...guest, ...patch } : guest,
    ),
  });
  emit();
  if (previous) {
    void syncGuestPatch(state, previous, patch).catch(() => undefined);
  }
}

export function addManagedGuest(
  eventId: number,
  input: {
    firstName: string;
    lastName: string;
    contact: string;
    seats: number;
    table?: string | null;
  },
): void {
  const state = store.get(eventId);
  if (!state) return;

  if (isApi(state)) {
    void (async () => {
      const created = await guestsService.createGuest(eventId, {
        full_name: `${input.firstName.trim()} ${input.lastName.trim()}`.trim(),
        email: input.contact.includes('@') ? input.contact.trim() : null,
        phone: input.contact && !input.contact.includes('@') ? input.contact.trim() : null,
        adults_count: input.seats,
        children_count: 0,
        rsvp_status: 'pending',
        table: input.table ? state.tableIds[input.table] ?? null : null,
      });
      const current = store.get(eventId);
      if (!current) return;
      store.set(eventId, {
        ...current,
        guests: [...current.guests, mapApiGuest(created)],
      });
      emit();
    })().catch(() => undefined);
    return;
  }

  const id = `INV-${Date.now().toString().slice(-4)}`;
  store.set(eventId, {
    ...state,
    guests: [
      ...state.guests,
      {
        id,
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        contact: input.contact.trim(),
        seats: input.seats,
        rsvp: 'pending',
        drink: null,
        table: input.table ?? null,
        checkedIn: false,
        checkedInAt: null,
      },
    ],
  });
  emit();
}

export function removeManagedGuest(eventId: number, guestId: string): void {
  const state = store.get(eventId);
  if (!state) return;
  const guest = state.guests.find((item) => item.id === guestId);
  store.set(eventId, {
    ...state,
    guests: state.guests.filter((item) => item.id !== guestId),
  });
  emit();
  if (isApi(state) && guest?.apiId != null) {
    void guestsService.deleteGuest(eventId, guest.apiId).catch(() => undefined);
  }
}

export function addEventTable(eventId: number, name: string): boolean {
  const state = store.get(eventId);
  if (!state) return false;
  const trimmed = name.trim();
  if (!trimmed) return false;
  if (state.tables.some((table) => table.toLowerCase() === trimmed.toLowerCase())) {
    return false;
  }

  if (isApi(state)) {
    void (async () => {
      const created = await guestsService.createTable(eventId, { name: trimmed, seats: 8 });
      const current = store.get(eventId);
      if (!current) return;
      store.set(eventId, {
        ...current,
        tables: [...current.tables, created.name],
        tableIds: { ...current.tableIds, [created.name]: created.id },
      });
      emit();
    })().catch(() => undefined);
    return true;
  }

  store.set(eventId, { ...state, tables: [...state.tables, trimmed] });
  emit();
  return true;
}

export function renameEventTable(eventId: number, from: string, to: string): boolean {
  const state = store.get(eventId);
  if (!state) return false;
  const trimmed = to.trim();
  if (!trimmed || trimmed === from) return false;
  if (state.tables.some((table) => table.toLowerCase() === trimmed.toLowerCase() && table !== from)) {
    return false;
  }

  const tableId = state.tableIds[from];
  const tableIds = { ...state.tableIds };
  delete tableIds[from];
  if (tableId != null) tableIds[trimmed] = tableId;

  store.set(eventId, {
    ...state,
    tables: state.tables.map((table) => (table === from ? trimmed : table)),
    tableIds,
    guests: state.guests.map((guest) =>
      guest.table === from ? { ...guest, table: trimmed } : guest,
    ),
  });
  emit();

  if (isApi(state) && tableId != null) {
    void guestsService.updateTable(eventId, tableId, { name: trimmed }).catch(() => undefined);
  }
  return true;
}

export function removeEventTable(eventId: number, name: string): void {
  const state = store.get(eventId);
  if (!state) return;
  const tableId = state.tableIds[name];
  const tableIds = { ...state.tableIds };
  delete tableIds[name];
  store.set(eventId, {
    ...state,
    tables: state.tables.filter((table) => table !== name),
    tableIds,
    guests: state.guests.map((guest) =>
      guest.table === name ? { ...guest, table: null, tableId: null } : guest,
    ),
  });
  emit();
  if (isApi(state) && tableId != null) {
    void guestsService.deleteTable(eventId, tableId).catch(() => undefined);
  }
}

export function replaceGuestsFromImport(
  eventId: number,
  guests: ManagedGuest[],
  options?: { tables?: string[]; drinks?: string[]; mode?: 'replace' | 'merge' },
): void {
  const state = store.get(eventId);
  if (!state) return;

  const mode = options?.mode ?? 'replace';
  const importedTables = options?.tables?.map((t) => t.trim()).filter(Boolean) ?? [];
  const guestTables = guests.map((g) => g.table).filter((t): t is string => Boolean(t));
  const mergedTables = Array.from(
    new Set([...state.tables, ...importedTables, ...guestTables]),
  );

  const nextGuests =
    mode === 'merge'
      ? mergeGuests(state.guests, guests)
      : guests.map((guest, index) => normalizeImportedGuest(guest, index, eventId));

  store.set(eventId, {
    ...state,
    tables: mergedTables.length > 0 ? mergedTables : state.tables,
    drinks: options?.drinks?.length ? options.drinks : state.drinks,
    guests: nextGuests,
  });
  emit();

  /* Import bulk API : création best-effort des nouveaux invités. */
  if (isApi(state)) {
    void (async () => {
      for (const guest of nextGuests) {
        if (guest.apiId != null) continue;
        const created = await guestsService.createGuest(eventId, {
          full_name: `${guest.firstName} ${guest.lastName}`.trim(),
          email: guest.contact.includes('@') ? guest.contact : null,
          adults_count: guest.seats,
          rsvp_status: guest.rsvp,
          table: guest.table ? state.tableIds[guest.table] ?? null : null,
          drink: guest.drink,
        });
        guest.apiId = created.id;
        guest.id = String(created.id);
        guest.accessToken = created.access_token;
      }
      const current = store.get(eventId);
      if (!current) return;
      store.set(eventId, { ...current, guests: [...nextGuests] });
      emit();
    })().catch(() => undefined);
  }
}

function mergeGuests(current: ManagedGuest[], incoming: ManagedGuest[]): ManagedGuest[] {
  const map = new Map(current.map((guest) => [guest.id.toUpperCase(), guest]));
  incoming.forEach((guest, index) => {
    const normalized = normalizeImportedGuest(guest, index, 0);
    const key = normalized.id.toUpperCase();
    map.set(key, { ...map.get(key), ...normalized, id: map.get(key)?.id ?? normalized.id });
  });
  return Array.from(map.values());
}

function normalizeImportedGuest(
  guest: Partial<ManagedGuest>,
  index: number,
  eventId: number,
): ManagedGuest {
  const rsvp = parseRsvp(guest.rsvp);
  return {
    id: (guest.id?.trim() || `INV-${eventId || 'X'}${String(index + 1).padStart(3, '0')}`),
    firstName: (guest.firstName ?? '').trim() || 'Invité',
    lastName: (guest.lastName ?? '').trim() || String(index + 1),
    contact: (guest.contact ?? '').trim(),
    seats: Math.max(1, Number(guest.seats) || 1),
    rsvp,
    drink: guest.drink?.trim() || null,
    table: guest.table?.trim() || null,
    checkedIn: Boolean(guest.checkedIn),
    checkedInAt: guest.checkedInAt ?? null,
  };
}

function parseRsvp(value: unknown): ManageRsvp {
  const raw = String(value ?? '').toLowerCase();
  if (raw === 'confirmed' || raw === 'confirmé' || raw === 'confirme') return 'confirmed';
  if (raw === 'declined' || raw === 'refusé' || raw === 'refuse') return 'declined';
  return 'pending';
}

function patchGuestLocal(eventId: number, guestId: string, patch: Partial<ManagedGuest>): void {
  const state = store.get(eventId);
  if (!state) return;
  store.set(eventId, {
    ...state,
    guests: state.guests.map((guest) =>
      guest.id === guestId ? { ...guest, ...patch } : guest,
    ),
  });
  emit();
}

/** Check-in local + API. En cas d’échec réseau, l’état local est annulé. */
export async function checkInGuest(
  eventId: number,
  guestId: string,
): Promise<{ guest: ManagedGuest | null; error?: string }> {
  const state = store.get(eventId);
  if (!state) return { guest: null, error: 'Événement introuvable.' };
  const guest = state.guests.find((item) => item.id === guestId);
  if (!guest) return { guest: null, error: 'Invité introuvable.' };
  const previous = { checkedIn: guest.checkedIn, checkedInAt: guest.checkedInAt };
  const checkedInAt = new Date().toISOString();
  patchGuestLocal(eventId, guestId, { checkedIn: true, checkedInAt });
  if (isApi(state) && guest.apiId != null) {
    try {
      await guestsService.checkInGuest(eventId, guest.apiId);
    } catch {
      patchGuestLocal(eventId, guestId, previous);
      return {
        guest: null,
        error: 'Impossible d’enregistrer l’entrée. Vérifiez la connexion et réessayez.',
      };
    }
  }
  return { guest: { ...guest, checkedIn: true, checkedInAt } };
}

export function findGuestByCode(eventId: number, code: string): ManagedGuest | null {
  const state = store.get(eventId);
  if (!state) return null;
  const raw = code.trim();
  if (!raw) return null;
  const normalized = raw.toUpperCase();

  const byToken = state.guests.find((guest) => guest.accessToken === raw);
  if (byToken) return byToken;

  const byId = state.guests.find((guest) => guest.id.toUpperCase() === normalized);
  if (byId) return byId;

  const byName = state.guests.find(
    (guest) => `${guest.firstName} ${guest.lastName}`.toUpperCase() === normalized,
  );
  if (byName) return byName;

  const idMatch = normalized.match(/INV-[\w-]+/);
  if (idMatch) {
    return state.guests.find((guest) => guest.id.toUpperCase() === idMatch[0]) ?? null;
  }

  return null;
}

export function computeManageStats(state: EventManageState) {
  const confirmed = state.guests.filter((guest) => guest.rsvp === 'confirmed');
  const pending = state.guests.filter((guest) => guest.rsvp === 'pending');
  const declined = state.guests.filter((guest) => guest.rsvp === 'declined');
  const seatsConfirmed = confirmed.reduce((sum, guest) => sum + guest.seats, 0);
  const checkedIn = state.guests.filter((guest) => guest.checkedIn).length;

  const drinkCounts: Record<string, number> = {};
  confirmed.forEach((guest) => {
    if (!guest.drink) return;
    drinkCounts[guest.drink] = (drinkCounts[guest.drink] ?? 0) + guest.seats;
  });

  const tableCounts: Record<string, number> = {};
  state.guests.forEach((guest) => {
    if (!guest.table || guest.rsvp === 'declined') return;
    tableCounts[guest.table] = (tableCounts[guest.table] ?? 0) + guest.seats;
  });

  return {
    total: state.guests.length,
    confirmed: confirmed.length,
    pending: pending.length,
    declined: declined.length,
    seatsConfirmed,
    checkedIn,
    drinkCounts,
    tableCounts,
  };
}
