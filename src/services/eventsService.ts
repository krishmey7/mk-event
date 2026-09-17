/**
 * ──────────────────────────────────────────────────────────────
 *  MK EVENT — SERVICE ÉVÉNEMENTS (prêt pour Django REST)
 * ──────────────────────────────────────────────────────────────
 *  • getEvents() → GET /api/events/ (PaginatedResponse<Event>) ;
 *  • tant que le backend est absent (SIMULATE_BACKEND), renvoie le
 *    jeu de démonstration de la maquette Écran 7 : Mariage – Léa &
 *    Thomas (14 juin 2025), Anniversaire – 30 ans (12 avril 2025),
 *    Baptême – Emma (5 mai 2025) avec leur résumé RSVP.
 * ──────────────────────────────────────────────────────────────
 */

import { apiClient } from './apiClient';
import { SIMULATE_BACKEND } from '@/constants/config';
import { getSnapshot, hydrateLibrary, persistLibrary, putSnapshot } from '@/features/editor/library';
import type { EditorSnapshot } from '@/features/editor/snapshot';
import type { Event, EventDraftPayload, Guest, PaginatedResponse } from '@/types';

export interface PublishGuestInput {
  studio_key: string;
  full_name: string;
  contact?: string;
  seats?: number;
}

export interface PublishEventResult {
  event: Event;
  guests: Guest[];
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Jeu de données de démonstration (fidèle à la maquette). */
const MOCK_EVENTS: Event[] = [
  {
    id: 1,
    organizer: 1,
    name: 'Mariage – Léa & Thomas',
    type: 'wedding',
    status: 'published',
    template: 1,
    event_date: '2025-06-14T15:00:00Z',
    venue_name: 'Château de Bellevue',
    venue_city: 'Blois',
    message: 'Nous aurons hâte de célébrer ce jour spécial avec vous !',
    slug: 'lea-thomas',
    qr_code_url: null,
    cover_image_url: null,
    guests_count: 4,
    rsvp_summary: { total: 4, confirmed: 3, pending: 0, maybe: 0, declined: 1 },
    program: [],
    playlist: [],
    gifts: [],
    practical_info: [],
    created_at: '2025-05-02T09:00:00Z',
    updated_at: '2025-05-20T14:30:00Z',
  },
  {
    id: 2,
    organizer: 1,
    name: 'Anniversaire – 30 ans',
    type: 'birthday',
    status: 'published',
    template: 2,
    event_date: '2025-04-12T19:00:00Z',
    venue_name: 'Loft des Arts',
    venue_city: 'Lyon',
    message: null,
    slug: 'anniversaire-30-ans',
    qr_code_url: null,
    cover_image_url: null,
    guests_count: 20,
    rsvp_summary: { total: 20, confirmed: 12, pending: 6, maybe: 0, declined: 2 },
    program: [],
    playlist: [],
    gifts: [],
    practical_info: [],
    created_at: '2025-03-10T10:00:00Z',
    updated_at: '2025-04-01T18:00:00Z',
  },
  {
    id: 3,
    organizer: 1,
    name: 'Baptême – Emma',
    type: 'baptism',
    status: 'published',
    template: 3,
    event_date: '2025-05-05T11:00:00Z',
    venue_name: 'Église Saint-Pierre',
    venue_city: 'Tours',
    message: null,
    slug: 'bapteme-emma',
    qr_code_url: null,
    cover_image_url: null,
    guests_count: 15,
    rsvp_summary: { total: 15, confirmed: 8, pending: 0, maybe: 1, declined: 6 },
    program: [],
    playlist: [],
    gifts: [],
    practical_info: [],
    created_at: '2025-04-05T08:30:00Z',
    updated_at: '2025-04-22T12:00:00Z',
  },
];

export const eventsService = {
  /** GET /api/events/ — liste paginée des invitations de l'organisateur. */
  async getEvents(): Promise<PaginatedResponse<Event>> {
    if (SIMULATE_BACKEND) {
      hydrateLibrary(MOCK_EVENTS);
      await delay(280);
      const results = [...MOCK_EVENTS].sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      );
      return {
        count: results.length,
        next: null,
        previous: null,
        results,
      };
    }
    return apiClient.get<PaginatedResponse<Event>>('/events/');
  },

  /**
   * POST /api/events/ — création d'une invitation (stepper 4 étapes).
   * En simulation : génère un brouillon (`status: 'draft'`, 0 invité,
   * RSVP à zéro) inséré en tête de la liste mock — visible
   * immédiatement sur le dashboard et « Mes invitations ».
   */
  async createEvent(payload: EventDraftPayload): Promise<Event> {
    if (SIMULATE_BACKEND) {
      hydrateLibrary(MOCK_EVENTS);
      await delay(600);
      const id = Math.max(...MOCK_EVENTS.map((event) => event.id)) + 1;
      const now = new Date().toISOString();
      const baseSlug =
        payload.name
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') || 'invitation';
      const event: Event = {
        id,
        organizer: 1,
        name: payload.name,
        type: payload.type,
        status: 'draft',
        template: payload.template ?? null,
        event_date: payload.event_date,
        venue_name: payload.venue_name,
        venue_city: payload.venue_city,
        message: payload.message,
        slug: `${baseSlug}-${id}`,
        qr_code_url: null,
        cover_image_url: null,
        theme_key: payload.theme_key ?? '',
        studio_config: payload.theme_key ? { themeKey: payload.theme_key } : {},
        guests_count: 0,
        rsvp_summary: { total: 0, confirmed: 0, pending: 0, maybe: 0, declined: 0 },
        program: [],
        playlist: [],
        gifts: [],
        practical_info: [],
        created_at: now,
        updated_at: now,
      };
      MOCK_EVENTS.unshift(event);
      persistLibrary(MOCK_EVENTS);
      return event;
    }
    return apiClient.post<Event>('/events/', payload);
  },

  /** PATCH /api/events/{id}/ — met à jour une invitation déjà dans Mes invitations. */
  async updateEvent(id: number, patch: Partial<Event>): Promise<Event> {
    if (SIMULATE_BACKEND) {
      hydrateLibrary(MOCK_EVENTS);
      await delay(280);
      const index = MOCK_EVENTS.findIndex((item) => item.id === id);
      if (index < 0) throw new Error('Invitation introuvable');
      const now = new Date().toISOString();
      MOCK_EVENTS[index] = { ...MOCK_EVENTS[index], ...patch, id, updated_at: now };
      persistLibrary(MOCK_EVENTS);
      return MOCK_EVENTS[index];
    }
    return apiClient.patch<Event>(`/events/${id}/`, patch);
  },

  /** Enregistre l’instantané du studio auprès de l’invitation. */
  saveSnapshot(eventId: number, snapshot: EditorSnapshot): void {
    putSnapshot(eventId, snapshot);
    persistLibrary(MOCK_EVENTS);
  },

  readSnapshot(eventId: number): EditorSnapshot | null {
    hydrateLibrary(MOCK_EVENTS);
    return getSnapshot(eventId);
  },

  /**
   * POST /api/events/{id}/publish/ — statut published + slug + sync invités studio.
   * Réponse : `{ event, guests }` (chaque guest porte access_token + studio_key).
   */
  async publishEvent(
    id: number,
    payload: {
      slug?: string;
      guests?: PublishGuestInput[];
      /** Contenu édité (cover, story, galerie…) — requis pour l’affichage invité. */
      studio_config?: Record<string, unknown>;
      theme_key?: string | null;
    },
  ): Promise<PublishEventResult> {
    if (SIMULATE_BACKEND) {
      hydrateLibrary(MOCK_EVENTS);
      await delay(320);
      const index = MOCK_EVENTS.findIndex((item) => item.id === id);
      if (index < 0) throw new Error('Invitation introuvable');
      const now = new Date().toISOString();
      const slug = payload.slug?.trim() || MOCK_EVENTS[index].slug;
      const themeFromConfig =
        typeof payload.studio_config?.themeKey === 'string'
          ? payload.studio_config.themeKey
          : null;
      MOCK_EVENTS[index] = {
        ...MOCK_EVENTS[index],
        slug,
        status: 'published',
        theme_key: payload.theme_key ?? themeFromConfig ?? MOCK_EVENTS[index].theme_key ?? '',
        studio_config: payload.studio_config ?? MOCK_EVENTS[index].studio_config ?? null,
        guests_count: payload.guests?.length ?? MOCK_EVENTS[index].guests_count,
        updated_at: now,
      };
      const guests: Guest[] = (payload.guests ?? []).map((item, offset) => ({
        id: 9000 + offset,
        event: id,
        full_name: item.full_name,
        email: item.contact?.includes('@') ? item.contact : null,
        phone: item.contact && !item.contact.includes('@') ? item.contact : null,
        avatar_url: null,
        rsvp_status: 'pending',
        adults_count: Math.max(1, item.seats ?? 1),
        children_count: 0,
        table: null,
        drink: null,
        checked_in: false,
        checked_in_at: null,
        access_token: `sim-${item.studio_key}-${id}`,
        studio_key: item.studio_key,
        responded_at: null,
        created_at: now,
      }));
      persistLibrary(MOCK_EVENTS);
      return { event: MOCK_EVENTS[index], guests };
    }
    return apiClient.post<PublishEventResult>(`/events/${id}/publish/`, payload);
  },
};
