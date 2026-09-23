/**
 * Route stack RSVP — redirige vers l’étape guidée (même contenu).
 */

import { Redirect } from 'expo-router';

export default function RsvpScreen() {
  return <Redirect href="/editor/plus" />;
}
