/**
 * Événement actif (type + thème) — choisi au wizard, consommé par Modèles / Studio.
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

import type { EventType } from '@/types';

const STORAGE_KEY = 'mkevent.activeEvent';

export interface ActiveEventState {
  eventId: number | null;
  type: EventType;
  themeKey: string;
}

interface ActiveEventContextValue extends ActiveEventState {
  ready: boolean;
  /** True tant qu’aucun brouillon n’a été créé via le wizard type/thème. */
  needsSetup: boolean;
  setActiveEvent: (next: ActiveEventState) => void;
  clearActiveEvent: () => void;
}

const DEFAULT: ActiveEventState = {
  eventId: null,
  type: 'wedding',
  themeKey: 'sauge',
};

const ActiveEventContext = createContext<ActiveEventContextValue | null>(null);

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
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void readStored().then((stored) => {
      if (stored?.eventId != null && stored.themeKey) setState(stored);
      setReady(true);
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

  const needsSetup = state.eventId == null;

  const value = useMemo(
    () => ({ ...state, ready, needsSetup, setActiveEvent, clearActiveEvent }),
    [state, ready, needsSetup, setActiveEvent, clearActiveEvent],
  );

  return (
    <ActiveEventContext.Provider value={value}>{children}</ActiveEventContext.Provider>
  );
}

export function useActiveEvent(): ActiveEventContextValue {
  const ctx = useContext(ActiveEventContext);
  if (!ctx) {
    throw new Error('useActiveEvent doit être utilisé dans ActiveEventProvider.');
  }
  return ctx;
}
