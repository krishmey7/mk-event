/**
 * Invités, tables, check-in, invitation publique & RSVP (Django).
 */

import { apiClient } from './apiClient';
import { SIMULATE_BACKEND } from '@/constants/config';
import type {
  Event,
  Guest,
  PaginatedResponse,
  RSVPResponse,
  RSVPSubmitPayload,
  Table,
} from '@/types';

export interface PublicInvitationPayload {
  event: Event;
  guest: Guest | null;
}

function unwrapList<T>(data: PaginatedResponse<T> | T[]): T[] {
  return Array.isArray(data) ? data : data.results;
}

export const guestsService = {
  async listGuests(eventId: number): Promise<Guest[]> {
    const data = await apiClient.get<PaginatedResponse<Guest> | Guest[]>(
      `/events/${eventId}/guests/`,
    );
    return unwrapList(data);
  },

  async createGuest(
    eventId: number,
    payload: {
      full_name: string;
      email?: string | null;
      phone?: string | null;
      adults_count?: number;
      children_count?: number;
      rsvp_status?: Guest['rsvp_status'];
      table?: number | null;
      drink?: string | null;
    },
  ): Promise<Guest> {
    return apiClient.post<Guest>(`/events/${eventId}/guests/`, payload);
  },

  async updateGuest(
    eventId: number,
    guestId: number,
    patch: Partial<{
      full_name: string;
      email: string | null;
      phone: string | null;
      adults_count: number;
      children_count: number;
      rsvp_status: Guest['rsvp_status'];
      table: number | null;
      drink: string | null;
    }>,
  ): Promise<Guest> {
    return apiClient.patch<Guest>(`/events/${eventId}/guests/${guestId}/`, patch);
  },

  async deleteGuest(eventId: number, guestId: number): Promise<void> {
    await apiClient.delete(`/events/${eventId}/guests/${guestId}/`);
  },

  async checkInGuest(eventId: number, guestId: number): Promise<Guest> {
    return apiClient.post<Guest>(`/events/${eventId}/guests/${guestId}/check-in/`);
  },

  async listTables(eventId: number): Promise<Table[]> {
    const data = await apiClient.get<PaginatedResponse<Table> | Table[]>(
      `/events/${eventId}/tables/`,
    );
    return unwrapList(data);
  },

  async createTable(
    eventId: number,
    payload: { name: string; seats?: number; notes?: string | null },
  ): Promise<Table> {
    return apiClient.post<Table>(`/events/${eventId}/tables/`, payload);
  },

  async updateTable(
    eventId: number,
    tableId: number,
    patch: Partial<{ name: string; seats: number; notes: string | null }>,
  ): Promise<Table> {
    return apiClient.patch<Table>(`/events/${eventId}/tables/${tableId}/`, patch);
  },

  async deleteTable(eventId: number, tableId: number): Promise<void> {
    await apiClient.delete(`/events/${eventId}/tables/${tableId}/`);
  },

  async getPublicInvitation(
    slug: string,
    guestToken?: string | null,
  ): Promise<PublicInvitationPayload> {
    const query = guestToken ? `?guest=${encodeURIComponent(guestToken)}` : '';
    return apiClient.get<PublicInvitationPayload>(`/inv/${slug}/${query}`, { token: null });
  },

  async submitPublicRsvp(
    slug: string,
    payload: RSVPSubmitPayload,
  ): Promise<RSVPResponse & { guest_detail?: Guest }> {
    return apiClient.post(`/inv/${slug}/rsvp/`, payload, { token: null });
  },
};

export { SIMULATE_BACKEND };
