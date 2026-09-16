/**
 * Export / import de la liste d’invités (JSON complet + CSV tableur).
 */

import { Platform, Share } from 'react-native';

import type { EventManageState, ManagedGuest, ManageRsvp } from './eventManageStore';

export interface GuestListExportBundle {
  version: 1;
  kind: 'mk-event-guests';
  eventId: number;
  eventName?: string;
  exportedAt: string;
  tables: string[];
  drinks: string[];
  guests: ManagedGuest[];
}

const CSV_HEADERS = [
  'id',
  'firstName',
  'lastName',
  'contact',
  'seats',
  'rsvp',
  'drink',
  'table',
  'checkedIn',
  'checkedInAt',
] as const;

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildExportBundle(
  state: EventManageState,
  eventName?: string,
): GuestListExportBundle {
  return {
    version: 1,
    kind: 'mk-event-guests',
    eventId: state.eventId,
    eventName,
    exportedAt: new Date().toISOString(),
    tables: [...state.tables],
    drinks: [...state.drinks],
    guests: state.guests.map((guest) => ({ ...guest })),
  };
}

/** CSV avec tous les détails invité (ouvert dans Excel / Sheets). */
export function guestsToCsv(guests: ManagedGuest[]): string {
  const lines = [
    CSV_HEADERS.join(','),
    ...guests.map((guest) =>
      [
        guest.id,
        guest.firstName,
        guest.lastName,
        guest.contact,
        String(guest.seats),
        guest.rsvp,
        guest.drink ?? '',
        guest.table ?? '',
        guest.checkedIn ? 'true' : 'false',
        guest.checkedInAt ?? '',
      ]
        .map((cell) => csvEscape(String(cell)))
        .join(','),
    ),
  ];
  return `\uFEFF${lines.join('\n')}`;
}

export function bundleToJson(bundle: GuestListExportBundle): string {
  return JSON.stringify(bundle, null, 2);
}

export interface ParsedGuestImport {
  guests: ManagedGuest[];
  tables: string[];
  drinks: string[];
  format: 'json' | 'csv';
}

export function parseGuestListImport(raw: string): ParsedGuestImport {
  const text = raw.replace(/^\uFEFF/, '').trim();
  if (!text) {
    throw new Error('Fichier vide.');
  }

  if (text.startsWith('{')) {
    const data = JSON.parse(text) as Partial<GuestListExportBundle>;
    if (!Array.isArray(data.guests)) {
      throw new Error('JSON invalide : champ « guests » manquant.');
    }
    return {
      format: 'json',
      guests: data.guests.map((guest, index) => coerceGuest(guest, index)),
      tables: Array.isArray(data.tables) ? data.tables.map(String) : [],
      drinks: Array.isArray(data.drinks) ? data.drinks.map(String) : [],
    };
  }

  return {
    format: 'csv',
    guests: parseCsvGuests(text),
    tables: [],
    drinks: [],
  };
}

function coerceGuest(raw: Partial<ManagedGuest>, index: number): ManagedGuest {
  const rsvp = normalizeRsvp(raw.rsvp);
  return {
    id: String(raw.id ?? `INV-IMP${String(index + 1).padStart(3, '0')}`),
    firstName: String(raw.firstName ?? '').trim() || 'Invité',
    lastName: String(raw.lastName ?? '').trim() || String(index + 1),
    contact: String(raw.contact ?? '').trim(),
    seats: Math.max(1, Number(raw.seats) || 1),
    rsvp,
    drink: raw.drink ? String(raw.drink) : null,
    table: raw.table ? String(raw.table) : null,
    checkedIn: Boolean(raw.checkedIn),
    checkedInAt: raw.checkedInAt ? String(raw.checkedInAt) : null,
  };
}

function normalizeRsvp(value: unknown): ManageRsvp {
  const raw = String(value ?? '').toLowerCase();
  if (['confirmed', 'confirmé', 'confirme', 'oui', 'yes'].includes(raw)) return 'confirmed';
  if (['declined', 'refusé', 'refuse', 'non', 'no'].includes(raw)) return 'declined';
  return 'pending';
}

function parseCsvGuests(text: string): ManagedGuest[] {
  const rows = parseCsvRows(text);
  if (rows.length < 2) throw new Error('CSV : aucune ligne d’invité.');

  const header = rows[0].map((cell) => cell.trim().toLowerCase());
  const idx = (names: string[]) => header.findIndex((h) => names.includes(h));

  const iId = idx(['id', 'code', 'identifiant']);
  const iFirst = idx(['firstname', 'prénom', 'prenom', 'first_name']);
  const iLast = idx(['lastname', 'nom', 'last_name']);
  const iContact = idx(['contact', 'email', 'e-mail', 'téléphone', 'telephone', 'phone']);
  const iSeats = idx(['seats', 'places', 'place']);
  const iRsvp = idx(['rsvp', 'statut', 'status', 'réponse', 'reponse']);
  const iDrink = idx(['drink', 'boisson']);
  const iTable = idx(['table', 'table_name', 'placement']);
  const iChecked = idx(['checkedin', 'checked_in', 'entré', 'entre', 'checkin']);
  const iCheckedAt = idx(['checkedinat', 'checked_in_at', 'entré_à', 'heure']);

  if (iFirst < 0 && iLast < 0) {
    throw new Error('CSV : colonnes Prénom / Nom introuvables.');
  }

  return rows.slice(1).filter((row) => row.some((cell) => cell.trim())).map((row, index) => {
    const get = (i: number) => (i >= 0 ? row[i]?.trim() ?? '' : '');
    return coerceGuest(
      {
        id: get(iId) || undefined,
        firstName: get(iFirst),
        lastName: get(iLast),
        contact: get(iContact),
        seats: Number(get(iSeats)) || 1,
        rsvp: normalizeRsvp(get(iRsvp)),
        drink: get(iDrink) || null,
        table: get(iTable) || null,
        checkedIn: /^(1|true|oui|yes|x)$/i.test(get(iChecked)),
        checkedInAt: get(iCheckedAt) || null,
      },
      index,
    );
  });
}

/** Parse CSV simple (guillemets supportés). */
function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(cell);
      cell = '';
    } else if (ch === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else if (ch === '\r') {
      /* ignore */
    } else {
      cell += ch;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}

function downloadOnWeb(filename: string, content: string, mime: string): boolean {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return false;
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
  return true;
}

export async function exportGuestListFiles(
  state: EventManageState,
  eventName?: string,
): Promise<'downloaded' | 'shared'> {
  const bundle = buildExportBundle(state, eventName);
  const stamp = new Date().toISOString().slice(0, 10);
  const base = `mk-event-${state.eventId}-invites-${stamp}`;
  const json = bundleToJson(bundle);
  const csv = guestsToCsv(bundle.guests);

  if (downloadOnWeb(`${base}.json`, json, 'application/json;charset=utf-8')) {
    downloadOnWeb(`${base}.csv`, csv, 'text/csv;charset=utf-8');
    return 'downloaded';
  }

  await Share.share({
    title: `Invités — ${eventName ?? `événement ${state.eventId}`}`,
    message: json,
  });
  return 'shared';
}

export function pickImportFileOnWeb(): Promise<string | null> {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.csv,text/csv,application/json,text/plain';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsText(file);
    };
    input.click();
  });
}
