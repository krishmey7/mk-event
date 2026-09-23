/**
 * Route « /invitations/[id] » — gestion des invités / suivi / check-in.
 */

import { useLocalSearchParams } from 'expo-router';

import { EventManageScreen } from '@/features/events/EventManageScreen';

export default function InvitationManageRoute() {
  const params = useLocalSearchParams<{ id: string | string[]; welcome?: string | string[] }>();
  const raw = Array.isArray(params.id) ? params.id[0] : params.id;
  const eventId = Number(raw);
  const welcomeRaw = Array.isArray(params.welcome) ? params.welcome[0] : params.welcome;
  const showWelcome = welcomeRaw === '1' || welcomeRaw === 'true';

  return (
    <EventManageScreen
      eventId={Number.isFinite(eventId) ? eventId : -1}
      showWelcome={showWelcome}
    />
  );
}
