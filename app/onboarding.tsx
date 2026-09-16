/**
 * Route « /onboarding » — Carrousel d'introduction (3 slides,
 * Écrans 2 à 4 des maquettes, fond ivoire).
 * Garde de route : un utilisateur connecté est renvoyé vers /dashboard.
 */

import { RedirectIfAuthenticated } from '@/components/layout/RedirectIfAuthenticated';
import { OnboardingScreen } from '@/features/onboarding/OnboardingScreen';

export default function Onboarding() {
  return (
    <RedirectIfAuthenticated>
      <OnboardingScreen />
    </RedirectIfAuthenticated>
  );
}

