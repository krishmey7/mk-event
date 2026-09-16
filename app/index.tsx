/**
 * Route « / » — Landing MK Event (Écran 1 des maquettes).
 * Garde de route : un utilisateur connecté est renvoyé vers /dashboard.
 */

import { RedirectIfAuthenticated } from '@/components/layout/RedirectIfAuthenticated';
import { LandingScreen } from '@/features/landing/LandingScreen';

export default function Index() {
  return (
    <RedirectIfAuthenticated>
      <LandingScreen />
    </RedirectIfAuthenticated>
  );
}

