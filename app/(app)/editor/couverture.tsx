/**
 * Route legacy — la couverture se gère dans Infos (onglet index).
 * Redirige pour éviter Infos → Couverture → Photo.
 */

import { Redirect } from 'expo-router';

export default function CouvertureScreen() {
  return <Redirect href="/editor" />;
}
