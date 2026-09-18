/**
 * Garde « déjà connecté » : sync les événements serveur, puis
 * wizard seulement s’il n’en existe aucun.
 */

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'expo-router';

import { useAuth } from '@/context/AuthContext';
import { homeAfterAuth, useActiveEvent } from '@/context/ActiveEventContext';

export function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { ready, syncFromServer } = useActiveEvent();
  const router = useRouter();
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (isLoading || !isAuthenticated || !ready || checking) return;
    setChecking(true);
    void syncFromServer().then((needsSetup) => {
      router.replace(homeAfterAuth(needsSetup));
    });
  }, [checking, isAuthenticated, isLoading, ready, router, syncFromServer]);

  if (isLoading || (isAuthenticated && !ready) || (isAuthenticated && checking)) {
    return null;
  }
  return <>{children}</>;
}
