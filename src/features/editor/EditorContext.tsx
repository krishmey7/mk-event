/**
 * ──────────────────────────────────────────────────────────────
 *  MK EVENTS — STUDIO D'ÉDITION · ÉTAT PARTAGÉ (contexte)
 * ──────────────────────────────────────────────────────────────
 *  Le studio est instancié DEPUIS un modèle (/editor?template={key})
 *  : la définition (thèmes, contenus par défaut) vient du registre
 *  src/features/templates/registry. La couverture (photo, textes,
 *  thème) est partagée en temps réel entre l'aperçu, les écrans
 *  d'édition et la prévisualisation. « Enregistrer » simule la
 *  persistance — sera branché sur PATCH /api/events/{id}/ (Django).
 * ──────────────────────────────────────────────────────────────
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import {
  getTemplate,
  type TemplateDefinition,
  type TemplateThemeDefinition,
} from '@/features/templates/registry';
import type { ProgramStep, StoryMilestone } from '@/features/templates/elegance/data';
import { DEFAULT_COUPLE_PHOTO, DEFAULT_DIETS, DEFAULT_DRINKS, DEFAULT_VENUE, publishInvitationConfig } from '@/features/invitation/guestRegistry';
import {
  musicFromEventType,
  personaFromEventType,
  type VoicePersonaKey,
} from '@/features/invitation/audioCatalog';
import { makeGuestId, slugifyCouple } from '@/features/invitation/qr';
import { normalizePhotoFrame } from '@/features/invitation/types';
import type { GalleryStyleKey, Guest, PhotoFrameKey, RevealEffectKey, Venue } from '@/features/invitation/types';
import { normalizeVenue } from '@/features/invitation/types';
import { eventsService } from '@/services/eventsService';
import { EVENT_TYPE_LABELS } from '@/types';
import { resolveTemplateTheme, resolveTemplateThemeKey } from '@/features/templates/resolveTheme';
import {
  CONFERENCE_DEMO,
  CONFERENCE_SPEAKERS,
  type ConferenceSpeaker,
} from '@/features/templates/conference/data';
import { parseFrenchDateLabel, toRemoteImageUrl, type EditorSnapshot } from './snapshot';
import { resolvePublishableAudio } from './resolvePublishableAudio';
import { resolvePublishableImage } from './resolvePublishableImage';
import { ensureGuestNameToken, lockGuestNameToken } from './guestNameToken';
import { useActiveEvent } from '@/context/ActiveEventContext';

export type { VoicePersonaKey };
export { MUSIC_TRACKS as VOICE_MUSICS, VOICE_PERSONAS } from '@/features/invitation/audioCatalog';

export interface CoverConfig {
  photoUri: string;
  /** « Save the Date » — limite 40 caractères. */
  title: string;
  /** « 14 juin 2025 » */
  dateLabel: string;
  /** « Léa & Thomas » — limite 50. */
  couple: string;
  /** « Pour notre invité(e) {{Nom}} » — limite 100. */
  guestLine: string;
  /** Photo du couple entre le logo et le titre — + style de cadre. */
  couplePhotoUri: string;
  coupleFrame: PhotoFrameKey;
  /** Clé du thème actif DU modèle en cours d'édition. */
  themeKey: string;
  /** Accroche (ex. « Cérémonie à 10h » / « RÉSERVEZ LA DATE! »). */
  kicker: string;
  /** Heure affichée sur la couverture (Pellicule, Néon…). */
  timeLabel: string;
}

/* ── Styles de mise en page (appliqués en temps réel) ── */

export type ProgramStyleKey = 'classique' | 'minimaliste' | 'icones' | 'personnalise';
export type CountdownStyleKey = 'classique' | 'cercle' | 'minimaliste' | 'sceau';
export type GalleryCategory = 'ceremonie' | 'cocktail' | 'soiree';

export interface GalleryItem {
  id: string;
  uri: string;
  category: GalleryCategory;
}

export interface VoixConfig {
  /** Préréglage d’ambiance (si pas d’upload). */
  musicKey: string;
  /** Fichier audio uploadé par l’organisateur (prioritaire). */
  ambientUri: string | null;
  /** Nom du fichier uploadé (affichage studio). */
  ambientName: string | null;
  /** Lance l’ambiance après l’accueil (ou dès l’ouverture si pas de voix). */
  autoplay: boolean;
  /** Boucle pendant toute la visite. */
  loop: boolean;
  /** Message vocal d’accueil (TTS système, prénom de l’invité). */
  voiceGreeting: boolean;
  /** Ton de l’assistante : mariage | anniversaire | conference. */
  voicePersona: VoicePersonaKey;
}

interface EditorContextValue {
  /** Modèle en cours d'édition (thèmes, contenus par défaut). */
  template: TemplateDefinition;
  cover: CoverConfig;
  /** Thème actif, résolu depuis cover.themeKey. */
  theme: TemplateThemeDefinition;
  /** Thèmes du modèle, dans l'ordre d'affichage. */
  themes: TemplateThemeDefinition[];
  updateCover: (patch: Partial<CoverConfig>) => void;
  /** Change la palette du modèle (studio + événement actif). */
  setThemeKey: (key: string) => void;
  /** Enregistre + publie (slug + sync invités / access_token Django). */
  saveToLibrary: (mode?: 'publish' | 'free' | 'prepare') => Promise<number>;
  saving: boolean;
  /** true si la dernière publication a bien renvoyé des jetons Django. */
  published: boolean;
  /** Invitation liée dans Mes invitations. */
  boundEventId: number | null;
  dirty: boolean;
  lastSavedAt: number | null;
  /** Dress code / ambiance demandés à l’organisateur. */
  dressCode: string;
  setDressCode: (value: string) => void;
  /** Histoire du modèle — copie éditable en temps réel. */
  story: StoryMilestone[];
  /** Programme du modèle — copie éditable en temps réel. */
  program: ProgramStep[];
  /** Crée ou met à jour une étape d'histoire (index -1 = ajout). */
  saveStoryStep: (index: number, step: StoryMilestone) => void;
  removeStoryStep: (index: number) => void;
  /** Crée ou met à jour une étape du programme (index -1 = ajout). */
  saveProgramStep: (index: number, step: ProgramStep) => void;
  removeProgramStep: (index: number) => void;
  /** Style de mise en page du programme (4 layouts). */
  programStyle: ProgramStyleKey;
  setProgramStyle: (style: ProgramStyleKey) => void;
  /** Style du compte à rebours (3 layouts). */
  countdownStyle: CountdownStyleKey;
  setCountdownStyle: (style: CountdownStyleKey) => void;
  /** Photos de la galerie de l'invitation, par catégorie. */
  gallery: GalleryItem[];
  addGalleryPhotos: (uris: string[], category: GalleryCategory) => void;
  removeGalleryPhoto: (id: string) => void;
  /** Voix assistant & musique de fond. */
  voix: VoixConfig;
  updateVoix: (patch: Partial<VoixConfig>) => void;
  /** Boissons configurées — deviennent le « Choix de la boisson » du RSVP invité. */
  drinks: string[];
  addDrink: (label: string) => void;
  removeDrink: (label: string) => void;
  /** Renomme une boisson — édition inline dans l'éditeur. */
  updateDrink: (oldLabel: string, newLabel: string) => void;
  /** Régimes alimentaires proposés (cases à cocher de l'invité). */
  diets: string[];
  addDiet: (label: string) => void;
  removeDiet: (label: string) => void;
  /** Renomme un régime — édition inline dans l'éditeur. */
  updateDiet: (oldLabel: string, newLabel: string) => void;
  /** Invités (liens & QR personnels générés automatiquement). */
  guests: Guest[];
  addGuest: (input: { firstName: string; lastName: string; contact: string; seats: number }) => void;
  removeGuest: (id: string) => void;
  /** Slug public de l'invitation — /inv/{slug}?guestId=…. */
  invitationSlug: string;
  /** Effet d'apparition des contenus au défilement. */
  revealEffect: RevealEffectKey;
  setRevealEffect: (effect: RevealEffectKey) => void;
  /** Style d'affichage de la galerie (grille / carrousel / maçonnerie). */
  galleryStyle: GalleryStyleKey;
  setGalleryStyle: (style: GalleryStyleKey) => void;
  /** Lieu du mariage — adresse complète + itinéraire. */
  venue: Venue;
  updateVenue: (patch: Partial<Venue>) => void;
  /** Intervenants (conférence). */
  speakers: ConferenceSpeaker[];
  saveSpeaker: (index: number, speaker: ConferenceSpeaker) => void;
  removeSpeaker: (index: number) => void;
  /** Infos pratiques (conférence). */
  practical: { access: string; parking: string; hotel: string };
  updatePractical: (patch: Partial<{ access: string; parking: string; hotel: string }>) => void;
}

const EditorContext = createContext<EditorContextValue | null>(null);

function bootFromParams(
  eventId?: string | null,
  initialSnapshot?: EditorSnapshot | null,
) {
  const id = eventId ? Number(eventId) : Number.NaN;
  if (!Number.isFinite(id)) return { id: null as number | null, snap: null as EditorSnapshot | null };
  if (initialSnapshot) return { id, snap: initialSnapshot };
  return { id, snap: eventsService.readSnapshot(id) };
}

export function EditorProvider({
  templateKey,
  initialThemeKey,
  eventId,
  initialSnapshot,
  children,
}: {
  templateKey?: string;
  initialThemeKey?: string;
  eventId?: string;
  /** Snapshot déjà résolu (serveur / local) — évite un second read au mount. */
  initialSnapshot?: EditorSnapshot | null;
  children: ReactNode;
}) {
  const activeEvent = useActiveEvent();
  const boot = useMemo(
    () => bootFromParams(eventId, initialSnapshot),
    [eventId, initialSnapshot],
  );
  const snap = boot.snap;
  const template = useMemo(
    () => getTemplate(snap?.templateKey ?? templateKey),
    [snap?.templateKey, templateKey],
  );

  const resolvedThemeKey = resolveTemplateThemeKey(
    template,
    snap?.cover.themeKey
      ?? initialThemeKey
      ?? activeEvent.themeKey
      ?? template.defaultThemeKey,
  );

  const [boundEventId, setBoundEventId] = useState<number | null>(boot.id);
  const [dressCode, setDressCode] = useState(snap?.dressCode ?? '');
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(!snap);
  const skipDirty = useRef(true);

  const [cover, setCover] = useState<CoverConfig>(() => snap?.cover
    ? {
        ...snap.cover,
        coupleFrame: normalizePhotoFrame(snap.cover.coupleFrame, template.key),
        kicker: snap.cover.kicker ?? template.defaultKicker ?? '',
        timeLabel: snap.cover.timeLabel ?? '',
        guestLine: ensureGuestNameToken(snap.cover.guestLine),
        themeKey: resolvedThemeKey,
      }
    : {
    photoUri: template.coverImage,
    title: template.defaultCover.title,
    dateLabel: template.defaultCover.dateLabel,
    couple: template.defaultCover.couple,
    guestLine: ensureGuestNameToken(template.defaultCover.guestLine),
    couplePhotoUri: template.couplePhoto?.uri ?? DEFAULT_COUPLE_PHOTO.uri,
    coupleFrame: normalizePhotoFrame(template.couplePhoto?.frame, template.key),
    themeKey: resolvedThemeKey,
    kicker: template.defaultKicker ?? '',
    timeLabel: template.defaultCover.timeLabel ?? '',
  });
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(snap ? Date.now() : null);

  const updateCover = useCallback((patch: Partial<CoverConfig>) => {
    // Thème verrouillé ici : utiliser setThemeKey (profil / Décor).
    // {{Nom}} reste verrouillé dans le message invité.
    setCover((prev) => {
      const next = { ...prev, ...patch, themeKey: prev.themeKey };
      if (patch.guestLine !== undefined) {
        next.guestLine = lockGuestNameToken(patch.guestLine, prev.guestLine);
      }
      return next;
    });
  }, []);

  const setThemeKey = useCallback(
    (key: string) => {
      const next = resolveTemplateThemeKey(template, key);
      setCover((prev) => {
        if (prev.themeKey === next) return prev;
        return { ...prev, themeKey: next };
      });
      if (activeEvent.themeKey !== next) {
        activeEvent.setActiveEvent({
          eventId: activeEvent.eventId,
          type: activeEvent.type,
          themeKey: next,
          preferencesReady: true,
        });
      }
    },
    [template, activeEvent],
  );

  const [story, setStory] = useState<StoryMilestone[]>(() => snap?.story ?? template.story);
  const [program, setProgram] = useState<ProgramStep[]>(() => snap?.program ?? template.program);

  const saveStoryStep = useCallback((index: number, step: StoryMilestone) => {
    setStory((prev) => {
      if (index >= 0 && index < prev.length) {
        const next = [...prev];
        next[index] = step;
        return next;
      }
      return [...prev, step];
    });
  }, []);

  const saveProgramStep = useCallback((index: number, step: ProgramStep) => {
    setProgram((prev) => {
      if (index >= 0 && index < prev.length) {
        const next = [...prev];
        next[index] = step;
        return next;
      }
      return [...prev, step];
    });
  }, []);

  const removeStoryStep = useCallback((index: number) => {
    setStory((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const removeProgramStep = useCallback((index: number) => {
    setProgram((prev) => prev.filter((_, i) => i !== index));
  }, []);

  /* Styles de mise en page — appliqués instantanément. */
  const [programStyle, setProgramStyle] = useState<ProgramStyleKey>(
    () => (snap?.programStyle as ProgramStyleKey) ?? 'personnalise',
  );
  const [countdownStyle, setCountdownStyle] = useState<CountdownStyleKey>(() => {
    const saved = snap?.countdownStyle as CountdownStyleKey | undefined;
    if (saved === 'classique' || saved === 'cercle' || saved === 'minimaliste' || saved === 'sceau') {
      return saved;
    }
    return template.key === 'aurore' ? 'sceau' : 'cercle';
  });

  const [gallery, setGallery] = useState<GalleryItem[]>(() => {
    const saved = snap?.gallery?.filter((item) => item.uri?.trim()) ?? [];
    if (saved.length > 0) {
      return saved.map((item) => ({
        id: item.id,
        uri: item.uri,
        category: item.category as GalleryCategory,
      }));
    }
    return template.galleryImages.map((uri, index) => ({
      id: `tpl-${index}`,
      uri,
      category: (['ceremonie', 'cocktail', 'soiree'] as const)[index % 3],
    }));
  });

  const addGalleryPhotos = useCallback((uris: string[], category: GalleryCategory) => {
    if (uris.length === 0) return;
    const stamp = Date.now();
    setGallery((prev) => [
      ...prev,
      ...uris.map((uri, index) => ({ id: `ph-${stamp}-${index}`, uri, category })),
    ]);
  }, []);

  const removeGalleryPhoto = useCallback((id: string) => {
    setGallery((prev) => prev.filter((item) => item.id !== id));
  }, []);

  /* Voix assistant & musique — persona / ambiance figées par type d’événement. */
  const [voix, setVoix] = useState<VoixConfig>(() => {
    const category = template.category;
    return {
      musicKey: musicFromEventType(category),
      ambientUri: null,
      ambientName: null,
      autoplay: snap?.voix?.autoplay ?? true,
      loop: snap?.voix?.loop ?? true,
      voiceGreeting: snap?.voix?.voiceGreeting ?? true,
      voicePersona: personaFromEventType(category),
    };
  });

  const updateVoix = useCallback((patch: Partial<VoixConfig>) => {
    setVoix((prev) => ({ ...prev, ...patch }));
  }, []);

  useEffect(() => {
    const persona = personaFromEventType(template.category);
    const musicKey = musicFromEventType(template.category);
    setVoix((prev) => {
      if (prev.voicePersona === persona && prev.musicKey === musicKey && !prev.ambientUri) {
        return prev;
      }
      return {
        ...prev,
        voicePersona: persona,
        musicKey,
        ambientUri: null,
        ambientName: null,
      };
    });
  }, [template.category]);

  /* Boissons RSVP — la liste exacte proposée aux invités. */
  const [drinks, setDrinks] = useState<string[]>(() => snap?.drinks?.length ? [...snap.drinks] : [...DEFAULT_DRINKS]);

  const addDrink = useCallback((label: string) => {
    const clean = label.trim();
    if (!clean) return;
    setDrinks((prev) =>
      prev.some((item) => item.toLowerCase() === clean.toLowerCase()) ? prev : [...prev, clean],
    );
  }, []);

  const removeDrink = useCallback((label: string) => {
    setDrinks((prev) => (prev.length > 1 ? prev.filter((item) => item !== label) : prev));
  }, []);

  /* Édition inline d'une boisson. */
  const updateDrink = useCallback((oldLabel: string, newLabel: string) => {
    const clean = newLabel.trim();
    if (!clean || oldLabel === clean) return;
    setDrinks((prev) => prev.map((item) => (item === oldLabel ? clean : item)));
  }, []);

  /* Régimes alimentaires — cases à cocher du formulaire invité. */
  const [diets, setDiets] = useState<string[]>(() => snap?.diets?.length ? [...snap.diets] : [...DEFAULT_DIETS]);

  const addDiet = useCallback((label: string) => {
    const clean = label.trim();
    if (!clean) return;
    setDiets((prev) =>
      prev.some((item) => item.toLowerCase() === clean.toLowerCase()) ? prev : [...prev, clean],
    );
  }, []);

  const removeDiet = useCallback((label: string) => {
    setDiets((prev) => (prev.length > 1 ? prev.filter((item) => item !== label) : prev));
  }, []);

  /* Édition inline d'un régime. */
  const updateDiet = useCallback((oldLabel: string, newLabel: string) => {
    const clean = newLabel.trim();
    if (!clean || oldLabel === clean) return;
    setDiets((prev) => prev.map((item) => (item === oldLabel ? clean : item)));
  }, []);

  /* Invités — clé stable générée localement puis confirmée par le serveur. */
  const [guests, setGuests] = useState<Guest[]>(() => snap?.guests ? [...snap.guests] : []);
  /* Invités retirés du studio : supprimés explicitement à la publication. */
  const [removedGuestKeys, setRemovedGuestKeys] = useState<string[]>([]);
  const [removedGuestIds, setRemovedGuestIds] = useState<number[]>([]);

  const addGuest = useCallback(
    (input: { firstName: string; lastName: string; contact: string; seats: number }) => {
      setGuests((prev) => [
        ...prev,
        {
          id: makeGuestId(),
          firstName: input.firstName.trim(),
          lastName: input.lastName.trim(),
          contact: input.contact.trim(),
          seats: input.seats,
        },
      ]);
    },
    [],
  );

  const removeGuest = useCallback(
    (id: string) => {
      const target = guests.find((guest) => guest.id === id);
      setGuests((prev) => prev.filter((guest) => guest.id !== id));
      if (!target) return;
      setRemovedGuestKeys((prev) => (prev.includes(id) ? prev : [...prev, id]));
      if (target.serverId != null) {
        setRemovedGuestIds((prev) =>
          prev.includes(target.serverId!) ? prev : [...prev, target.serverId!],
        );
      }
    },
    [guests],
  );

  /* Publication temps réel vers /inv/{slug} (registre local + API). */
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);
  const invitationSlug = useMemo(
    () => publishedSlug ?? slugifyCouple(cover.couple),
    [publishedSlug, cover.couple],
  );
  const [published, setPublished] = useState(
    () => snap?.eventStatus === 'published'
      || Boolean(snap?.guests?.some((guest) => Boolean(guest.accessToken))),
  );

  /* Effet d'apparition des contenus — testé en direct en prévisualisation. */
  const [revealEffect, setRevealEffect] = useState<RevealEffectKey>(
    () => snap?.revealEffect ?? (template.coverLayout === 'winterPoster' ? 'snowfall' : 'fade'),
  );
  const [galleryStyle, setGalleryStyle] = useState<GalleryStyleKey>(
    () => snap?.galleryStyle ?? 'masonry',
  );
  const [venue, setVenue] = useState<Venue>(() =>
    normalizeVenue(snap?.venue ?? template.defaultVenue, DEFAULT_VENUE),
  );

  const updateVenue = useCallback((patch: Partial<Venue>) => {
    setVenue((prev) => normalizeVenue({ ...prev, ...patch }, prev));
  }, []);

  const [speakers, setSpeakers] = useState<ConferenceSpeaker[]>(() =>
    template.category === 'corporate' ? CONFERENCE_SPEAKERS.map((item) => ({ ...item })) : [],
  );
  const [practical, setPractical] = useState({
    access: CONFERENCE_DEMO.access,
    parking: CONFERENCE_DEMO.parking,
    hotel: CONFERENCE_DEMO.hotel,
  });

  const saveSpeaker = useCallback((index: number, speaker: ConferenceSpeaker) => {
    setSpeakers((prev) => {
      if (index >= 0 && index < prev.length) {
        const next = [...prev];
        next[index] = speaker;
        return next;
      }
      return [...prev, speaker];
    });
  }, []);

  const removeSpeaker = useCallback((index: number) => {
    setSpeakers((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updatePractical = useCallback(
    (patch: Partial<{ access: string; parking: string; hotel: string }>) => {
      setPractical((prev) => ({ ...prev, ...patch }));
    },
    [],
  );

  const saveToLibrary = useCallback(async (mode: 'publish' | 'free' | 'prepare' = 'publish') => {
    setSaving(true);
    try {
      const desiredSlug = slugifyCouple(cover.couple);
      const snapshot: EditorSnapshot = {
        templateKey: template.key,
        dressCode,
        cover,
        story,
        program,
        programStyle,
        countdownStyle,
        gallery,
        voix,
        drinks,
        diets,
        guests,
        revealEffect,
        galleryStyle,
        venue,
      };
      const eventType = activeEvent.type || template.category;
      const name = cover.couple.trim()
        ? `${EVENT_TYPE_LABELS[eventType]} – ${cover.couple.trim()}`
        : template.name;
      const base = {
        name,
        type: eventType,
        event_date: parseFrenchDateLabel(cover.dateLabel),
        venue_name: venue.name,
        venue_city: venue.city,
        message: dressCode.trim() || null,
        template: template.key,
        theme_key: cover.themeKey,
      };

      /* Créer / lier l’événement avant upload médias (besoin de l’id). */
      let event = boundEventId
        ? await eventsService.updateEvent(boundEventId, base)
        : await eventsService.createEvent(base);
      setBoundEventId(event.id);

      const uploadOpts = { eventId: event.id };
      const publishedCoverPhoto = await resolvePublishableImage(cover.photoUri, uploadOpts);
      const publishedCouplePhoto = await resolvePublishableImage(cover.couplePhotoUri, uploadOpts);
      const publishedGallerySource = gallery.length > 0
        ? gallery
        : template.galleryImages.map((uri, index) => ({
            id: `tpl-${index}`,
            uri,
            category: (['ceremonie', 'cocktail', 'soiree'] as const)[index % 3],
          }));
      const publishedGallery = await Promise.all(
        publishedGallerySource.map(async (item) => ({
          uri: await resolvePublishableImage(item.uri, uploadOpts),
          category: item.category,
        })),
      );
      const publishedStory = await Promise.all(
        story.map(async (step) => ({
          ...step,
          image: step.image
            ? await resolvePublishableImage(step.image, uploadOpts)
            : step.image,
        })),
      );
      const publishedCountdown = await resolvePublishableImage(
        template.countdownImage,
        uploadOpts,
      );
      const publishedAmbient = await resolvePublishableAudio(voix.ambientUri, {
        ...uploadOpts,
        fileName: voix.ambientName,
      });
      const publishedVoix = {
        ...voix,
        ambientUri: publishedAmbient || null,
        ambientName: publishedAmbient ? voix.ambientName : null,
      };

      const extras = {
        cover_image_url: toRemoteImageUrl(publishedCoverPhoto),
        theme_key: cover.themeKey,
      };
      event = await eventsService.updateEvent(event.id, extras);

      const studioConfig = {
        templateKey: template.key,
        drinks,
        diets,
        themeKey: cover.themeKey,
        revealEffect,
        galleryStyle,
        venue,
        couplePhoto: { uri: publishedCouplePhoto, frame: cover.coupleFrame },
        dressCode,
        cover: {
          title: cover.title,
          dateLabel: cover.dateLabel,
          couple: cover.couple,
          guestLine: cover.guestLine,
          kicker: cover.kicker,
          timeLabel: cover.timeLabel,
          photoUri: publishedCoverPhoto,
        },
        story: publishedStory,
        program,
        gallery: publishedGallery,
        countdownImage: publishedCountdown || template.countdownImage,
        voix: publishedVoix,
        speakers,
        practical,
      };

      // Garde les URIs publiables dans le studio (évite de republier des blob: morts).
      setCover((prev) => ({
        ...prev,
        photoUri: publishedCoverPhoto || prev.photoUri,
        couplePhotoUri: publishedCouplePhoto || prev.couplePhotoUri,
      }));
      setVoix(publishedVoix);
      setStory(publishedStory);
      if (gallery.length > 0) {
        setGallery(
          publishedGallery.map((item, index) => ({
            id: gallery[index]?.id ?? `pub-${index}`,
            uri: item.uri,
            category: item.category as GalleryCategory,
          })),
        );
      }

      const publishPayload = {
        slug: desiredSlug,
        guests: guests.map((guest) => ({
          guest_id: guest.serverId,
          studio_key: guest.id,
          full_name: `${guest.firstName} ${guest.lastName}`.trim(),
          contact: guest.contact,
          seats: guest.seats,
        })),
        deleted_guest_keys: removedGuestKeys,
        deleted_guest_ids: removedGuestIds,
        studio_config: studioConfig,
        theme_key: cover.themeKey,
      };
      const publishedResult = mode === 'prepare'
        ? await eventsService.prepareEvent(event.id, publishPayload)
        : await eventsService.publishEvent(event.id, {
            ...publishPayload,
            ...(mode === 'free' ? { free_publication: true } : {}),
          });

      if (activeEvent.eventId !== event.id || activeEvent.themeKey !== cover.themeKey) {
        activeEvent.setActiveEvent({
          eventId: event.id,
          type: eventType,
          themeKey: cover.themeKey,
        });
      }

      /* Le serveur est l'autorité sur la clé studio (nouvel invité, legacy…). */
      const byServerId = new Map(
        publishedResult.guests.map((item) => [item.id, item] as const),
      );
      const byStudioKey = new Map(
        publishedResult.guests.map((item) => [(item.studio_key || '').trim(), item] as const),
      );
      const guestsWithTokens = guests.map((guest) => {
        const publishedGuest =
          (guest.serverId != null ? byServerId.get(guest.serverId) : undefined)
          ?? byStudioKey.get(guest.id);
        return {
          ...guest,
          id: publishedGuest?.studio_key?.trim() || guest.id,
          serverId: publishedGuest?.id ?? guest.serverId,
          accessToken: publishedGuest?.has_personal_link
            ? publishedGuest.access_token
            : '',
        };
      });
      setGuests(guestsWithTokens);
      setRemovedGuestKeys([]);
      setRemovedGuestIds([]);
      setPublishedSlug(publishedResult.event.slug);
      setPublished(mode !== 'prepare');

      eventsService.saveSnapshot(event.id, {
        ...snapshot,
        eventStatus: mode === 'prepare' ? 'draft' : 'published',
        cover: {
          ...snapshot.cover,
          photoUri: publishedCoverPhoto || snapshot.cover.photoUri,
          couplePhotoUri: publishedCouplePhoto || snapshot.cover.couplePhotoUri,
        },
        story: publishedStory,
        gallery: publishedGallery.map((item, index) => ({
          id: gallery[index]?.id ?? `pub-${index}`,
          uri: item.uri,
          category: item.category,
        })),
        guests: guestsWithTokens,
      });
      setBoundEventId(event.id);
      setDirty(false);
      setLastSavedAt(Date.now());
      return event.id;
    } finally {
      setSaving(false);
    }
  }, [
    activeEvent, boundEventId, cover, countdownStyle, diets, dressCode, drinks, gallery, galleryStyle,
    guests, removedGuestKeys, removedGuestIds, program, programStyle, revealEffect, story, template,
    venue, voix, speakers, practical,
  ]);

  useEffect(() => {
    if (skipDirty.current) {
      skipDirty.current = false;
      return;
    }
    setDirty(true);
  }, [
    cover, story, program, guests, drinks, diets, voix, venue, dressCode,
    revealEffect, galleryStyle, programStyle, countdownStyle, gallery,
    speakers, practical,
  ]);

  useEffect(() => {
    publishInvitationConfig(invitationSlug, {
      templateKey: template.key,
      guests,
      drinks,
      diets,
      themeKey: cover.themeKey,
      revealEffect,
      galleryStyle,
      venue,
      couplePhoto: { uri: cover.couplePhotoUri, frame: cover.coupleFrame },
      dressCode,
      cover: {
        title: cover.title,
        dateLabel: cover.dateLabel,
        couple: cover.couple,
        guestLine: cover.guestLine,
        kicker: cover.kicker,
        timeLabel: cover.timeLabel,
        photoUri: cover.photoUri,
      },
      story,
      program,
      gallery: (gallery.length > 0 ? gallery : template.galleryImages.map((uri, index) => ({
        uri,
        category: (['ceremonie', 'cocktail', 'soiree'] as const)[index % 3],
      }))).map((item) => ({ uri: item.uri, category: item.category })),
      countdownImage: template.countdownImage,
      voix,
      speakers,
      practical,
    });
  }, [
    invitationSlug, guests, drinks, diets, cover, revealEffect, galleryStyle, venue, dressCode,
    story, program, gallery, template.key, template.countdownImage, template.galleryImages, voix,
    speakers, practical,
  ]);

  const theme = useMemo(
    () => resolveTemplateTheme(template, cover.themeKey),
    [template, cover.themeKey],
  );

  const value = useMemo(
    () => ({
      template,
      cover,
      theme,
      themes: template.themes,
      updateCover,
      setThemeKey,
      saveToLibrary,
      saving,
      published,
      boundEventId,
      dirty,
      lastSavedAt,
      dressCode,
      setDressCode,
      story,
      program,
      saveStoryStep,
      removeStoryStep,
      saveProgramStep,
      removeProgramStep,
      programStyle,
      setProgramStyle,
      countdownStyle,
      setCountdownStyle,
      gallery,
      addGalleryPhotos,
      removeGalleryPhoto,
      voix,
      updateVoix,
      drinks,
      addDrink,
      removeDrink,
      updateDrink,
      diets,
      addDiet,
      removeDiet,
      updateDiet,
      guests,
      addGuest,
      removeGuest,
      invitationSlug,
      revealEffect,
      setRevealEffect,
      galleryStyle,
      setGalleryStyle,
      venue,
      updateVenue,
      speakers,
      saveSpeaker,
      removeSpeaker,
      practical,
      updatePractical,
    }),
    [
      template,
      cover,
      theme,
      updateCover,
      setThemeKey,
      saveToLibrary,
      saving,
      published,
      boundEventId,
      dirty,
      lastSavedAt,
      dressCode,
      story,
      program,
      saveStoryStep,
      removeStoryStep,
      saveProgramStep,
      removeProgramStep,
      programStyle,
      setProgramStyle,
      countdownStyle,
      setCountdownStyle,
      gallery,
      addGalleryPhotos,
      removeGalleryPhoto,
      voix,
      updateVoix,
      drinks,
      addDrink,
      removeDrink,
      updateDrink,
      diets,
      addDiet,
      removeDiet,
      updateDiet,
      guests,
      addGuest,
      removeGuest,
      invitationSlug,
      revealEffect,
      setRevealEffect,
      galleryStyle,
      setGalleryStyle,
      venue,
      updateVenue,
      speakers,
      saveSpeaker,
      removeSpeaker,
      practical,
      updatePractical,
    ],
  );

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

export function useEditor(): EditorContextValue {
  const ctx = useContext(EditorContext);
  if (!ctx) {
    throw new Error('useEditor doit être utilisé à l\u2019intérieur de <EditorProvider>.');
  }
  return ctx;
}
