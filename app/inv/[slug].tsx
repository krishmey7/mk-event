/**
 * Route publique : /inv/{slug}?guest= — contenu studio publié via API.
 */

import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { brandColors } from '@/constants/theme';
import { SIMULATE_BACKEND } from '@/constants/config';
import { GuestInvitation } from '@/features/invitation/GuestInvitation';
import { getInvitationConfig, resolveGuest } from '@/features/invitation/guestRegistry';
import {
  hasStudioConfig,
  invitationConfigFromStudio,
} from '@/features/invitation/studioConfig';
import type { Guest } from '@/features/invitation/types';
import type { InvitationConfig } from '@/features/invitation/guestRegistry';
import { guestsService } from '@/services/guestsService';

const ANONYMOUS_GUEST: Guest = {
  id: '',
  firstName: 'Invité',
  lastName: '',
  contact: '',
  seats: 1,
};

function mapApiGuestToLocal(guest: {
  id: number;
  full_name: string;
  adults_count: number;
  children_count: number;
  access_token: string;
}): Guest {
  const parts = guest.full_name.trim().split(/\s+/);
  const firstName = parts[0] || 'Invité';
  const lastName = parts.slice(1).join(' ');
  return {
    id: guest.access_token,
    accessToken: guest.access_token,
    firstName,
    lastName,
    contact: '',
    seats: Math.max(1, guest.adults_count + guest.children_count),
  };
}

function emptyPublishedConfig(slug: string, event: {
  name: string;
  venue_name: string;
  venue_city: string;
  event_date: string;
  cover_image_url: string | null;
  message: string | null;
}): InvitationConfig {
  const base = getInvitationConfig(slug);
  return {
    ...base,
    guests: [],
    venue: {
      ...base.venue,
      name: event.venue_name || base.venue.name,
      city: event.venue_city || base.venue.city,
    },
    cover: {
      ...base.cover,
      title: event.name || base.cover.title,
      dateLabel: new Date(event.event_date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      photoUri: event.cover_image_url || base.cover.photoUri,
    },
    dressCode: event.message || base.dressCode,
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
          : ANONYMOUS_GUEST;

        let nextConfig: InvitationConfig;
        if (hasStudioConfig(event.studio_config)) {
          nextConfig = invitationConfigFromStudio(event.studio_config, slug);
          if (payload.guest) {
            nextConfig = { ...nextConfig, guests: [mappedGuest] };
          } else {
            nextConfig = { ...nextConfig, guests: [] };
          }
        } else {
          nextConfig = emptyPublishedConfig(slug, event);
          if (payload.guest) {
            nextConfig = { ...nextConfig, guests: [mappedGuest] };
          }
        }

        setConfig(nextConfig);
        setGuest(mappedGuest);
      } catch {
        if (!alive) return;
        setConfig(null);
        setGuest(null);
        setError('Invitation introuvable ou indisponible.');
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [slug, guestParam, localConfig, localGuest]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={brandColors.goldSoft} />
      </View>
    );
  }

  if (error || !config || !guest) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error ?? 'Invitation introuvable.'}</Text>
      </View>
    );
  }

  return <GuestInvitation slug={slug} config={config} guest={guest} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  error: {
    color: '#A45A45',
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    textAlign: 'center',
  },
});
