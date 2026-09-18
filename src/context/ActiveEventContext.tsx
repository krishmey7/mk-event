/**
 * Événement actif (type + thème) — choisi au wizard, consommé par Modèles / Studio.
 * `needsSetup` se base sur les événements serveur (pas seulement le stockage local).
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
}

interface ActiveEventContextValue extends ActiveEventState {
  ready: boolean;
  /** True seulement après sync serveur, s’il n’existe aucun événement. */
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

async function readStored(): Promise<ActiveEventState | null> {
  try {
    if (Platform.OS === 'web') {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as ActiveEventState;
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
      if (stored?.eventId != null && stored.themeKey) setState(stored);
      setStorageReady(true);
    });
  }, []);

  const setActiveEvent = useCallback((next: ActiveEventState) => {
    setState(next);
    void writeStored(next);
  }, []);

  const clearActiveEvent = useCallback(() => {
    setState(DEFAULT);
    void writeStored(null);
  }, []);

  const syncFromServer = useCallback(async (): Promise<boolean> => {
    try {
      const { results } = await eventsService.getEvents();
      if (results.length === 0) {
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
      };
      setState(next);
      void writeStored(next);
      setServerSynced(true);
      return false;
    } catch {
      /* Réseau KO : ne force pas le wizard si un id local existe. */
      const stored = await readStored();
      setServerSynced(true);
      return stored?.eventId == null;
    }
  }, []);

  const ready = storageReady;
  const needsSetup = serverSynced && state.eventId == null;

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
  if (!ctx) {
    throw new Error('useActiveEvent doit être utilisé dans ActiveEventProvider.');
  }
  return ctx;
}
