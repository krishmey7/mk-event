/**
 * Garde de route « invité » : si une session est active, redirige
 * automatiquement vers /(app)/dashboard. Appliqué aux écrans publics
 * (/, /onboarding, /login, /register).
 */

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'expo-router';

import { useAuth } from '@/context/AuthContext';

export function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return null;
  }
  return <>{children}</>;
}
