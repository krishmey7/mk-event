/**
 * Route publique : /inv/{slug}?guestId= — config locale ou API Django.
 */

import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { brandColors } from '@/constants/theme';
import { SIMULATE_BACKEND } from '@/constants/config';
import { GuestInvitation } from '@/features/invitation/GuestInvitation';
import { getInvitationConfig, resolveGuest } from '@/features/invitation/guestRegistry';
import type { Guest } from '@/features/invitation/types';
import type { InvitationConfig } from '@/features/invitation/guestRegistry';
import { guestsService } from '@/services/guestsService';

function mapApiGuestToLocal(guest: {
  id: number;
  full_name: string;
  email: string | null;
  phone: string | null;
  adults_count: number;
  children_count: number;
  access_token: string;
}): Guest {
  const parts = guest.full_name.trim().split(/\s+/);
  const firstName = parts[0] || 'Invité';
  const lastName = parts.slice(1).join(' ');
  return {
    id: guest.access_token || String(guest.id),
    firstName,
    lastName,
    contact: guest.email || guest.phone || '',
    seats: Math.max(1, guest.adults_count + guest.children_count),
  };
}

export default function PublicInvitationScreen() {
  const params = useLocalSearchParams<{
    slug: string;
    guestId?: string | string[];
    guest?: string | string[];
  }>();
  const slug = (Array.isArray(params.slug) ? params.slug[0] : params.slug) ?? 'invitation';
  const guestRaw = params.guest ?? params.guestId;
  const guestParam = Array.isArray(guestRaw) ? guestRaw[0] : guestRaw;

  const localConfig = useMemo(() => getInvitationConfig(slug), [slug]);
  const localGuest = useMemo(() => resolveGuest(localConfig, guestParam), [localConfig, guestParam]);

  const [config, setConfig] = useState<InvitationConfig | null>(
    SIMULATE_BACKEND ? localConfig : null,
  );
  const [guest, setGuest] = useState<Guest | null>(SIMULATE_BACKEND ? localGuest : null);
  const [loading, setLoading] = useState(!SIMULATE_BACKEND);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (SIMULATE_BACKEND) {
      setConfig(localConfig);
      setGuest(localGuest);
      setLoading(false);
      return;
    }

    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const payload = await guestsService.getPublicInvitation(slug, guestParam ?? null);
        if (!alive) return;
        const event = payload.event;
        const mappedGuest = payload.guest
          ? mapApiGuestToLocal(payload.guest)
          : localGuest;
        const nextConfig: InvitationConfig = {
          ...localConfig,
          venue: {
            ...localConfig.venue,
            name: event.venue_name || localConfig.venue.name,
            city: event.venue_city || localConfig.venue.city,
          },
          cover: {
            ...localConfig.cover,
            title: event.name || localConfig.cover.title,
            dateLabel: new Date(event.event_date).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }),
          },
          guests: payload.guest ? [mappedGuest] : localConfig.guests,
        };
        setConfig(nextConfig);
        setGuest(mappedGuest);
      } catch {
        if (!alive) return;
        /* Repli sur la config locale publiée / démo. */
        setConfig(localConfig);
        setGuest(localGuest);
        setError(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [slug, guestParam, localConfig, localGuest]);

  if (loading || !config || !guest) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={brandColors.goldSoft} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    );
  }

  return <GuestInvitation slug={slug} config={config} guest={guest} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  error: { color: '#A45A45', fontFamily: 'Inter_500Medium', fontSize: 13 },
});
