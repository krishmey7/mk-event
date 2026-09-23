/**
 * ──────────────────────────────────────────────────────────────
 *  MK Events — CONTRAT DE DONNÉES API (prêt pour Django REST Framework)
 * ──────────────────────────────────────────────────────────────
 *  Conventions alignées sur un backend DRF à venir :
 *  • champs en snake_case (sérialiseurs Django) ;
 *  • identifiants entiers (PK Django) — les ressources exposées aux
 *    invités utilisent un `slug` / `access_token` opaque
 *    (URL publique : https://mkevent.app/inv/{slug}) ;
 *  • dates au format ISO 8601 (string) ;
 *  • listes paginées au format DRF ({ count, next, previous, results }).
 *
 *  Les énumérations sont exportées en `as const` afin d'être à la fois
 *  utilisées comme types (unions) et itérables dans l'UI (filtres,
 *  formulaires, badges).
 * ──────────────────────────────────────────────────────────────
 */

/* ════════════════════════ Primitives ════════════════════════ */

/** Date/heure ISO 8601 (ex. « 2025-06-14T15:00:00Z »). */
export type ISODateString = string;

/** Clé primaire Django (AutoField / BigAutoField). */
export type ID = number;

/** Réponse de liste paginée côté DRF (PageNumberPagination / LimitOffsetPagination). */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/** Erreur de validation de champ (400 DRF). */
export interface FieldError {
  field?: string;
  code?: string;
  message: string;
}

/** Corps d'erreur normalisé renvoyé par la couche apiClient. */
export interface ApiErrorResponse {
  detail?: string;
  status?: number;
  errors?: FieldError[];
}

/* ════════════════════════ Énumérations ════════════════════════ */

/** Type d'événement — filtres des maquettes : Mariage, Anniversaire, Baptême, Événement pro. */
export const EVENT_TYPES = ['wedding', 'birthday', 'baptism', 'corporate', 'other'] as const;
export type EventType = (typeof EVENT_TYPES)[number];

/** Cycle de vie d'une invitation. */
export const EVENT_STATUSES = ['draft', 'published', 'archived'] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

/**
 * Statut RSVP vu côté organisateur :
 *  • `confirmed` → « Confirmé »   (sauge)
 *  • `pending`   → « En attente » (ocre)
 *  • `maybe`     → « Peut-être »  (ardoise)
 *  • `declined`  → « Refusé »     (terre cuite)
 */
export const RSVP_STATUSES = ['confirmed', 'pending', 'maybe', 'declined'] as const;
export type RsvpStatus = (typeof RSVP_STATUSES)[number];

/** Réponse exprimée côté invité : « Oui » / « Non » / « Peut-être ». */
export const RSVP_ANSWERS = ['yes', 'no', 'maybe'] as const;
export type RsvpAnswer = (typeof RSVP_ANSWERS)[number];

export type UserRole = 'organizer' | 'admin';

/* ═══════════════════ Libellés français (UI) ═══════════════════ */

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  wedding: 'Mariage',
  birthday: 'Anniversaire',
  baptism: 'Baptême',
  corporate: 'Événement pro',
  other: 'Autre',
};

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  draft: 'Brouillon',
  published: 'Publiée',
  archived: 'Archivée',
};

export const RSVP_STATUS_LABELS: Record<RsvpStatus, string> = {
  confirmed: 'Confirmé',
  pending: 'En attente',
  maybe: 'Peut-être',
  declined: 'Refusé',
};

export const RSVP_ANSWER_LABELS: Record<RsvpAnswer, string> = {
  yes: 'Oui, je serai présent(e)',
  no: 'Non, je ne pourrai pas être là',
  maybe: 'Peut-être',
};

/** Correspondance réponse invité → statut organisateur. */
export const ANSWER_TO_STATUS: Record<RsvpAnswer, RsvpStatus> = {
  yes: 'confirmed',
  no: 'declined',
  maybe: 'maybe',
};

/* ════════════════════════ Authentification ════════════════════════ */

/** Utilisateur MK Events (organisateur). */
export interface User {
  id: ID;
  email: string;
  /** Connexion possible par e-mail OU téléphone (maquette Login). */
  phone: string | null;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  date_joined: ISODateString;
}

/** Jetons JWT (djangorestframework-simplejwt). */
export interface AuthTokens {
  access: string;
  refresh: string;
}

/** POST /api/auth/token/ — champ « Email ou numéro de téléphone ». */
export interface LoginPayload {
  identifier: string;
  password: string;
}

/** POST /api/auth/register/ — maquette Inscription. */
export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
  password_confirm: string;
}

/* ═══════════════════ Modèles d'invitation ═══════════════════ */

/** Charte de couleurs d'un modèle (ex. ivoire floral, noir or « Moderne »). */
export interface TemplatePalette {
  background: string;
  accent: string;
  text: string;
  secondary_text?: string;
}

/** Modèle d'invitation — grille du choix : Élégance, Romantique, Moderne, Nature, Minimaliste, Chic. */
export interface InvitationTemplate {
  id: ID;
  slug: string;
  name: string;
  /** Catégorie = filtres « Tous / Mariage / Anniversaire / Baptême / Événement pro ». */
  category: EventType;
  thumbnail_url: string;
  preview_url: string | null;
  palette: TemplatePalette;
  is_premium: boolean;
  is_active: boolean;
  created_at: ISODateString;
}

/* ══════════════════ Tables & plans de salle ══════════════════ */

/** Table d'un événement (« Tables & plans de salle »). */
export interface Table {
  id: ID;
  event: ID;
  /** « Table 3 », « Table d'honneur »… */
  name: string;
  seats: number;
  seats_taken?: number;
  notes: string | null;
}

/* ══════════════════ Sections de l'invitation ══════════════════ */

/** Étape du plan de l'événement — ex. 15:00 Cérémonie, 19:00 Dîner, 22:00 Soirée. */
export interface ProgramStep {
  id: ID;
  /** Heure « HH:mm » (sans fuseau : heure locale de l'événement). */
  time: string;
  title: string;
  description: string | null;
}

/** Piste de la playlist partagée. */
export interface PlaylistTrack {
  id: ID;
  title: string;
  artist: string;
  cover_url: string | null;
  audio_url: string | null;
}

/** Entrée de la liste de cadeaux — Amazon, Maisons du Monde, Leroy Merlin… */
export interface GiftItem {
  id: ID;
  store: string;
  title: string;
  url: string | null;
  image_url: string | null;
}

/** Bloc « Informations pratiques » (label + contenu libre). */
export interface PracticalInfo {
  id: ID;
  label: string;
  content: string;
}

/** Compteurs RSVP du dashboard (Total 120 / Confirmés 98 / En attente 18 / Refusés 4). */
export interface RsvpSummary {
  total: number;
  confirmed: number;
  pending: number;
  maybe: number;
  declined: number;
}

/* ════════════════════════ Événement ════════════════════════ */

/**
 * Événement = projet d'invitation de l'organisateur
 * (« Mes invitations » : Mariage - Léa & Thomas, Anniversaire - 30 ans…).
 */
export interface Event {
  id: ID;
  organizer: ID;
  name: string;
  type: EventType;
  status: EventStatus;
  /** Modèle utilisé (FK InvitationTemplate) — `template_detail` si ?expand=template. */
  template: ID | null;
  template_detail?: InvitationTemplate;
  /** Date de l'événement — « 14 JUIN 2025 » sur les cartes. */
  event_date: ISODateString;
  /** Lieu — « Église Saint-Pierre » / « Château de Bellevue ». */
  venue_name: string;
  venue_city: string;
  /** Message personnalisé (« Nous aurons hâte de célébrer ce jour spécial avec vous ! »). */
  message: string | null;
  /** Slug public : https://mkevent.app/inv/{slug}. */
  slug: string;
  qr_code_url: string | null;
  cover_image_url: string | null;
  /** Palette choisie au wizard (ex. sauge, champagne). */
  theme_key?: string | null;
  /** Snapshot studio publié — servi aux invités via /api/inv/{slug}/. */
  studio_config?: Record<string, unknown> | null;
  guests_count: number;
  rsvp_summary: RsvpSummary;
  program: ProgramStep[];
  playlist: PlaylistTrack[];
  gifts: GiftItem[];
  practical_info: PracticalInfo[];
  created_at: ISODateString;
  updated_at: ISODateString;
}

/** Payload de création (étape 1 du stepper « Créer une invitation »). */
export type EventDraftPayload = Pick<
  Event,
  'name' | 'type' | 'event_date' | 'venue_name' | 'venue_city' | 'message'
> & { template?: ID | null; theme_key?: string | null };

/* ════════════════════════ Invités ════════════════════════ */

/** Invité d'un événement (liste « Invités & RSVP »). */
export interface Guest {
  id: ID;
  event: ID;
  full_name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  /** Statut affiché en badge : Confirmé / En attente / Peut-être / Refusé. */
  rsvp_status: RsvpStatus;
  /** « Nombre de personnes — Adultes : 2 ». */
  adults_count: number;
  /** « Nombre de personnes — Enfants : 0 ». */
  children_count: number;
  /** Table assignée (plan de salle) — `table_detail` si ?expand=table. */
  table: ID | null;
  table_detail?: Table | null;
  /** Boisson (e-bar / RSVP). */
  drink?: string | null;
  checked_in?: boolean;
  checked_in_at?: ISODateString | null;
  /** Jeton d'accès personnel (lien/QR de l'invité). */
  access_token: string;
  /** Clé studio (INV-1234) pour resynchroniser une publication. */
  studio_key?: string | null;
  responded_at: ISODateString | null;
  created_at: ISODateString;
}

/* ════════════════════════ RSVP ════════════════════════ */

/** Réponse RSVP enregistrée (écran « Confirmer ma présence »). */
export interface RSVPResponse {
  id: ID;
  guest: ID;
  event: ID;
  /** Choix de l'invité : Oui / Non / Peut-être. */
  answer: RsvpAnswer;
  adults_count: number;
  children_count: number;
  /** « Ajouter un message (optionnel) ». */
  message: string | null;
  responded_at: ISODateString;
}

/** Payload envoyé par l'invité — POST /api/inv/{slug}/rsvp/. */
export interface RSVPSubmitPayload {
  answer: RsvpAnswer;
  adults_count: number;
  children_count: number;
  message?: string;
  access_token?: string;
  drink?: string | null;
}

