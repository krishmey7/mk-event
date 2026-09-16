/**
 * Route « /invitations/[id] » — gestion des invités / stats / entrée.
 */

import { useLocalSearchParams } from 'expo-router';

import { EventManageScreen } from '@/features/events/EventManageScreen';

export default function InvitationManageRoute() {
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const raw = Array.isArray(params.id) ? params.id[0] : params.id;
  const eventId = Number(raw);

  return <EventManageScreen eventId={Number.isFinite(eventId) ? eventId : -1} />;
}
