/**
 * Livre d’or — messages texte publics + gestion organisateur.
 */

import { apiClient } from './apiClient';
import { SIMULATE_BACKEND } from '@/constants/config';

export interface GuestbookEntry {
  id: number;
  event: number;
  guest: number | null;
  author_name: string;
  message: string;
  is_visible: boolean;
  created_at: string;
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Mémoire locale pour SIMULATE_BACKEND (clé = slug). */
const simStore = new Map<string, GuestbookEntry[]>();
let simId = 1;

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diffMin = Math.round((Date.now() - then) / 60_000);
  if (diffMin < 1) return 'À l’instant';
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `Il y a ${diffH} h`;
  const diffD = Math.round(diffH / 24);
  return `Il y a ${diffD} j`;
}

export const guestbookService = {
  formatRelative,

  async listPublic(slug: string): Promise<GuestbookEntry[]> {
    if (SIMULATE_BACKEND) {
      await delay(120);
      return [...(simStore.get(slug) ?? [])];
    }
    return apiClient.get<GuestbookEntry[]>(`/inv/${slug}/guestbook/`, { token: null });
  },

  async createPublic(
    slug: string,
    payload: { message: string; access_token?: string | null },
  ): Promise<GuestbookEntry> {
    if (SIMULATE_BACKEND) {
      await delay(180);
      const entry: GuestbookEntry = {
        id: simId++,
        event: 0,
        guest: null,
        author_name: 'Invité',
        message: payload.message.trim(),
        is_visible: true,
        created_at: new Date().toISOString(),
      };
      const prev = simStore.get(slug) ?? [];
      simStore.set(slug, [entry, ...prev]);
      return entry;
    }
    return apiClient.post<GuestbookEntry>(
      `/inv/${slug}/guestbook/`,
      {
        message: payload.message,
        ...(payload.access_token ? { access_token: payload.access_token } : {}),
      },
      { token: null },
    );
  },

  async listForEvent(eventId: number): Promise<GuestbookEntry[]> {
    if (SIMULATE_BACKEND) {
      await delay(120);
      return [];
    }
    return apiClient.get<GuestbookEntry[]>(`/events/${eventId}/guestbook/`);
  },

  async deleteEntry(eventId: number, entryId: number): Promise<void> {
    if (SIMULATE_BACKEND) {
      await delay(100);
      return;
    }
    await apiClient.delete(`/events/${eventId}/guestbook/${entryId}/`);
  },
};
