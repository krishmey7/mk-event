/**
 * Alias conservé : les anciens liens /invitation/{slug} rejoignent
 * la route publique unique /inv/{slug}.
 */

import { Redirect, useLocalSearchParams } from 'expo-router';

export default function InvitationAliasScreen() {
  const params = useLocalSearchParams<{ slug: string; guestId?: string | string[] }>();
  const slug = (Array.isArray(params.slug) ? params.slug[0] : params.slug) ?? 'invitation';
  const guestId = Array.isArray(params.guestId) ? params.guestId[0] : params.guestId;

  return (
    <Redirect
      href={{
        pathname: '/inv/[slug]',
        params: guestId ? { slug, guestId } : { slug },
      }}
    />
  );
}
