/**
 * Événement actif (type + thème) — choisi au wizard, consommé par Modèles / Studio.
 * Le wizard ne crée plus d’événement serveur : seulement des préférences locales.
 * `needsSetup` = préférences pas encore choisies (et aucun événement API).
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Platform } from 'react-native';

import { eventsService } from '@/services/eventsService';
import type { Event, EventType } from '@/types';

const STORAGE_KEY = 'mkevent.activeEvent';

export interface ActiveEventState {
  eventId: number | null;
  type: EventType;
  themeKey: string;
  /** Wizard type/thème terminé — sans événement créé côté API. */
  preferencesReady?: boolean;
}

interface ActiveEventContextValue extends ActiveEventState {
  ready: boolean;
  /** True seulement après sync serveur, s’il faut encore passer le wizard. */
  needsSetup: boolean;
  setActiveEvent: (next: ActiveEventState) => void;
  clearActiveEvent: () => void;
  /** Aligne l’événement actif sur la liste API. Retourne needsSetup. */
  syncFromServer: () => Promise<boolean>;
}

const DEFAULT: ActiveEventState = {
  eventId: null,
  type: 'wedding',
  themeKey: 'sauge',
  preferencesReady: false,
};

const ActiveEventContext = createContext<ActiveEventContextValue | null>(null);

function themeFromEvent(event: Event): string {
  if (typeof event.theme_key === 'string' && event.theme_key.trim()) return event.theme_key;
  const fromConfig =
    event.studio_config && typeof event.studio_config === 'object'
      ? (event.studio_config as { themeKey?: unknown }).themeKey
      : null;
  return typeof fromConfig === 'string' && fromConfig.trim() ? fromConfig : 'sauge';
}

function normalizeStored(raw: ActiveEventState | null): ActiveEventState | null {
  if (!raw) return null;
  return {
    eventId: raw.eventId ?? null,
    type: raw.type || 'wedding',
    themeKey: raw.themeKey || 'sauge',
    /* Anciens comptes avec un eventId : déjà « setup ». Sans id : dépend du flag. */
    preferencesReady:
      raw.preferencesReady === true || raw.eventId != null,
  };
}

async function readStored(): Promise<ActiveEventState | null> {
  try {
    if (Platform.OS === 'web') {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return normalizeStored(JSON.parse(raw) as ActiveEventState);
    }
  } catch {
    /* ignore */
  }
  return null;
}

async function writeStored(value: ActiveEventState | null): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (!value) localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    }
  } catch {
    /* ignore */
  }
}

export function homeAfterAuth(needsSetup: boolean): '/setup' | '/dashboard' {
  return needsSetup ? '/setup' : '/dashboard';
}

export function ActiveEventProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ActiveEventState>(DEFAULT);
  const [storageReady, setStorageReady] = useState(false);
  const [serverSynced, setServerSynced] = useState(false);

  useEffect(() => {
    void readStored().then((stored) => {
      if (stored) setState(stored);
      setStorageReady(true);
    });
  }, []);

  const setActiveEvent = useCallback((next: ActiveEventState) => {
    const normalized: ActiveEventState = {
      ...next,
      preferencesReady: next.preferencesReady ?? next.eventId != null,
    };
    setState(normalized);
    void writeStored(normalized);
  }, []);

  const clearActiveEvent = useCallback(() => {
    setState(DEFAULT);
    void writeStored(null);
  }, []);

  const syncFromServer = useCallback(async (): Promise<boolean> => {
    try {
      const { results } = await eventsService.getEvents();
      if (results.length === 0) {
        const stored = await readStored();
        if (stored?.preferencesReady) {
          setState({
            eventId: null,
            type: stored.type,
            themeKey: stored.themeKey,
            preferencesReady: true,
          });
          void writeStored({
            eventId: null,
            type: stored.type,
            themeKey: stored.themeKey,
            preferencesReady: true,
          });
          setServerSynced(true);
          return false;
        }
        setState(DEFAULT);
        void writeStored(null);
        setServerSynced(true);
        return true;
      }

      const stored = await readStored();
      const match =
        stored?.eventId != null
          ? results.find((event) => event.id === stored.eventId)
          : undefined;
      const pick = match ?? results[0];
      const next: ActiveEventState = {
        eventId: pick.id,
        type: pick.type,
        themeKey: themeFromEvent(pick),
        preferencesReady: true,
      };
      setState(next);
      void writeStored(next);
      setServerSynced(true);
      return false;
    } catch {
      /* Réseau KO : ne force pas le wizard si préférences déjà choisies. */
      const stored = await readStored();
      setServerSynced(true);
      return !(stored?.preferencesReady || stored?.eventId != null);
    }
  }, []);

  const ready = storageReady;
  const needsSetup =
    serverSynced && state.eventId == null && state.preferencesReady !== true;

  const value = useMemo(
    () => ({
      ...state,
      ready,
      needsSetup,
      setActiveEvent,
      clearActiveEvent,
      syncFromServer,
    }),
    [state, ready, needsSetup, setActiveEvent, clearActiveEvent, syncFromServer],
  );

  return (
    <ActiveEventContext.Provider value={value}>
      {children}
    </ActiveEventContext.Provider>
  );
}

export function useActiveEvent(): ActiveEventContextValue {
  const ctx = useContext(ActiveEventContext);
  if (!ctx) throw new Error('useActiveEvent must be used within ActiveEventProvider');
  return ctx;
}
