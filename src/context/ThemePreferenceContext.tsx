/**
 * Préférence d’apparence — clair / sombre / système.
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
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { getTheme, type AppTheme, type ThemeMode } from '@/constants/theme';

const STORAGE_KEY = 'mk_event_appearance';

export type AppearancePreference = 'light' | 'dark' | 'system';

interface ThemePreferenceValue {
  preference: AppearancePreference;
  mode: ThemeMode;
  theme: AppTheme;
  setPreference: (next: AppearancePreference) => void;
}

const ThemePreferenceContext = createContext<ThemePreferenceValue | null>(null);

async function readPreference(): Promise<AppearancePreference> {
  try {
    const raw = await SecureStore.getItemAsync(STORAGE_KEY);
    if (raw === 'light' || raw === 'dark' || raw === 'system') return raw;
  } catch {
    /* web / indisponible */
  }
  return 'system';
}

async function writePreference(value: AppearancePreference): Promise<void> {
  try {
    await SecureStore.setItemAsync(STORAGE_KEY, value);
  } catch {
    /* ignore */
  }
}

export function ThemePreferenceProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [preference, setPreferenceState] = useState<AppearancePreference>('system');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void readPreference().then((value) => {
      setPreferenceState(value);
      setReady(true);
    });
  }, []);

  const setPreference = useCallback((next: AppearancePreference) => {
    setPreferenceState(next);
    void writePreference(next);
  }, []);

  const mode: ThemeMode =
    preference === 'system'
      ? system === 'dark'
        ? 'dark'
        : 'light'
      : preference;

  const theme = useMemo(() => getTheme(mode), [mode]);

  const value = useMemo(
    () => ({ preference, mode, theme, setPreference }),
    [preference, mode, theme, setPreference],
  );

  if (!ready) return null;

  return (
    <ThemePreferenceContext.Provider value={value}>
      {children}
    </ThemePreferenceContext.Provider>
  );
}

export function useAppTheme(): ThemePreferenceValue {
  const ctx = useContext(ThemePreferenceContext);
  if (!ctx) {
    throw new Error('useAppTheme doit être utilisé dans ThemePreferenceProvider.');
  }
  return ctx;
}
