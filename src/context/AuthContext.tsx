/**
 * ──────────────────────────────────────────────────────────────
 *  MK EVENTS — CONTEXTE D'AUTHENTIFICATION GLOBAL
 * ──────────────────────────────────────────────────────────────
 *  • AuthProvider + useAuth() : session { user, tokens } partagée ;
 *  • persistance via expo-secure-store (natif) / localStorage (web) ;
 *  • restauration asynchrone au démarrage (`isLoading`) ;
 *  • garde de route : les écrans invités (/, /onboarding, /login,
 *    /register) redirigent vers /(app)/dashboard via le composant
 *    `RedirectIfAuthenticated` ; le groupe (app) exige une session.
 * ──────────────────────────────────────────────────────────────
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
import * as SecureStore from 'expo-secure-store';

import type { AuthSession } from '@/services/authService';
import {
  setOnSessionCleared,
  setOnTokensRefreshed,
  setSessionTokens,
} from '@/services/sessionToken';
import type { AuthTokens, User } from '@/types';

const SESSION_KEY = 'mkevent.auth.session';

/** Stockage unifié : expo-secure-store (natif) · localStorage (web). */
const sessionStorage = {
  async get(): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem(SESSION_KEY);
      } catch {
        return null;
      }
    }
    return SecureStore.getItemAsync(SESSION_KEY);
  },
  async set(value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(SESSION_KEY, value);
      } catch {
        // Quota indisponible — la session restera en mémoire.
      }
      return;
    }
    await SecureStore.setItemAsync(SESSION_KEY, value);
  },
  async clear(): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem(SESSION_KEY);
      } catch {
        // noop
      }
      return;
    }
    await SecureStore.deleteItemAsync(SESSION_KEY);
  },
};

export interface AuthContextValue {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  /** Restauration de la session en cours au démarrage de l'app. */
  isLoading: boolean;
  signIn: (session: AuthSession) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /* Restauration de la session persistée au démarrage. */
  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        const raw = await sessionStorage.get();
        if (raw && mounted) {
          const session = JSON.parse(raw) as AuthSession;
          if (session?.user && session?.tokens) {
            setUser(session.user);
            setTokens(session.tokens);
            setSessionTokens(session.tokens);
          }
        }
      } catch {
        // Session corrompue ou stockage indisponible — démarrage invité.
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  /* apiClient peut rafraîchir / invalider la session hors React. */
  useEffect(() => {
    setOnTokensRefreshed((next) => {
      setTokens((prev) => {
        if (!prev) return prev;
        const merged: AuthTokens = {
          access: next.access,
          refresh: next.refresh ?? prev.refresh,
        };
        void (async () => {
          const raw = await sessionStorage.get();
          if (!raw) return;
          try {
            const session = JSON.parse(raw) as AuthSession;
            await sessionStorage.set(JSON.stringify({ ...session, tokens: merged }));
          } catch {
            /* ignore */
          }
        })();
        return merged;
      });
    });
    setOnSessionCleared(() => {
      setUser(null);
      setTokens(null);
      void sessionStorage.clear();
    });
    return () => {
      setOnTokensRefreshed(null);
      setOnSessionCleared(null);
    };
  }, []);

  const signIn = useCallback(async (session: AuthSession) => {
    setUser(session.user);
    setTokens(session.tokens);
    setSessionTokens(session.tokens);
    await sessionStorage.set(JSON.stringify(session));
  }, []);

  const signOut = useCallback(async () => {
    setUser(null);
    setTokens(null);
    setSessionTokens(null);
    await sessionStorage.clear();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      tokens,
      isAuthenticated: user !== null && tokens !== null,
      isLoading,
      signIn,
      signOut,
    }),
    [user, tokens, isLoading, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l’intérieur d’un <AuthProvider>.');
  }
  return context;
}
