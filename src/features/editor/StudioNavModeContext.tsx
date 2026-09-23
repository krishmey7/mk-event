/**
 * Navigation studio — mode guidé uniquement.
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react';

export type StudioNavMode = 'guided';

interface StudioNavModeValue {
  mode: StudioNavMode;
}

const StudioNavModeContext = createContext<StudioNavModeValue | null>(null);

export function StudioNavModeProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => ({ mode: 'guided' as const }), []);
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
