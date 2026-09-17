/**
 * Garde « déjà connecté » : redirige vers le wizard si l’événement
 * n’est pas encore configuré, sinon vers le dashboard.
 */

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'expo-router';

import { useAuth } from '@/context/AuthContext';
import { homeAfterAuth, useActiveEvent } from '@/context/ActiveEventContext';

export function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { ready, needsSetup } = useActiveEvent();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && ready) {
      router.replace(homeAfterAuth(needsSetup));
    }
  }, [isAuthenticated, isLoading, needsSetup, ready, router]);

  if (isLoading || (isAuthenticated && !ready)) {
    return null;
  }
  return <>{children}</>;
}
