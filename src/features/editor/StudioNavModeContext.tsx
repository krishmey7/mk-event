/**
 * Mode de navigation du studio — guidé (défaut) ou libre.
 * Préférence persistée sur l’appareil.
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
import * as SecureStore from 'expo-secure-store';

const STORAGE_KEY = 'mk_event_studio_nav_mode';

export type StudioNavMode = 'guided' | 'free';

interface StudioNavModeValue {
  mode: StudioNavMode;
  setMode: (next: StudioNavMode) => void;
  toggleMode: () => void;
}

const StudioNavModeContext = createContext<StudioNavModeValue | null>(null);

async function readMode(): Promise<StudioNavMode> {
  try {
    const raw = await SecureStore.getItemAsync(STORAGE_KEY);
    if (raw === 'guided' || raw === 'free') return raw;
  } catch {
    /* web / indisponible */
  }
  return 'guided';
}

async function writeMode(value: StudioNavMode): Promise<void> {
  try {
    await SecureStore.setItemAsync(STORAGE_KEY, value);
  } catch {
    /* ignore */
  }
}

export function StudioNavModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<StudioNavMode>('guided');

  useEffect(() => {
    void readMode().then(setModeState);
  }, []);

  const setMode = useCallback((next: StudioNavMode) => {
    setModeState(next);
    void writeMode(next);
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((prev) => {
      const next: StudioNavMode = prev === 'guided' ? 'free' : 'guided';
      void writeMode(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ mode, setMode, toggleMode }),
    [mode, setMode, toggleMode],
  );

  return (
    <StudioNavModeContext.Provider value={value}>
      {children}
    </StudioNavModeContext.Provider>
  );
}

export function useStudioNavMode(): StudioNavModeValue {
  const ctx = useContext(StudioNavModeContext);
  if (!ctx) {
    throw new Error('useStudioNavMode doit être utilisé dans StudioNavModeProvider.');
  }
  return ctx;
}
