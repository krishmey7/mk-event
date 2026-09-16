/**
 * Carte d'invitation — surface ton sur ton, badge discret.
 */

import { useMemo } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import {
  fontFamilies,
  semanticColors,
  spacing,
} from '@/constants/theme';
import { useAppTheme } from '@/context/ThemePreferenceContext';
import type { Event, EventType } from '@/types';

const COVERS_LIGHT: Record<EventType, { background: string; text: string }> = {
  wedding: { background: '#E4EEEC', text: '#2F6F69' },
  birthday: { background: '#15181E', text: '#F2F4F7' },
  baptism: { background: '#E8EDF4', text: '#3D5A80' },
  corporate: { background: '#E7EAEF', text: '#15181E' },
  other: { background: '#E7EAEF', text: '#15181E' },
};

const COVERS_DARK: Record<EventType, { background: string; text: string }> = {
  wedding: { background: 'rgba(91, 168, 159, 0.2)', text: '#7BC4BB' },
  birthday: { background: 'rgba(242, 244, 247, 0.08)', text: '#F2F4F7' },
  baptism: { background: 'rgba(120, 150, 190, 0.2)', text: '#A8C0E0' },
  corporate: { background: 'rgba(242, 244, 247, 0.08)', text: '#D0D5DC' },
  other: { background: 'rgba(242, 244, 247, 0.08)', text: '#D0D5DC' },
};

function buildCover(
  event: Event,
  mode: 'light' | 'dark',
): { background: string; text: string; initials: string } {
  const palette = (mode === 'dark' ? COVERS_DARK : COVERS_LIGHT)[event.type];
  const detail = event.name.split('–').pop()?.trim() ?? event.name;
  const numberMatch = detail.match(/^\d+/);
  if (numberMatch) {
    return { ...palette, initials: numberMatch[0] };
  }
  const initials = detail
    .split(/\s+/)
    .filter((word) => /^[A-Za-zÀ-ÿ]/.test(word))
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join(' & ');
  return { ...palette, initials: initials || 'MK' };
}

export interface EventCardProps {
  event: Event;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function EventCard({ event, onPress, style }: EventCardProps) {
  const { theme } = useAppTheme();
  const c = theme.colors;
  const cover = useMemo(() => buildCover(event, theme.mode), [event, theme.mode]);

  const dateLabel = useMemo(
    () =>
      new Date(event.event_date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    [event.event_date],
  );

  const complete = event.rsvp_summary.pending === 0;
  const dotColor = complete ? semanticColors.success : semanticColors.warning;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: c.surface,
          borderColor: c.border,
        },
        pressed && styles.pressed,
        style,
      ]}
    >
      {event.cover_image_url ? (
        <Image source={{ uri: event.cover_image_url }} style={styles.thumb} resizeMode="cover" />
      ) : (
        <View style={[styles.thumb, { backgroundColor: cover.background }]}>
          <Text style={[styles.thumbText, { color: cover.text }]}>{cover.initials}</Text>
        </View>
      )}

      <View style={styles.meta}>
        <Text style={[styles.title, { color: c.textPrimary }]} numberOfLines={1}>
          {event.name}
        </Text>
        <Text style={[styles.date, { color: c.textMuted }]}>{dateLabel}</Text>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: theme.mode === 'dark' ? c.surfaceElevated : c.background,
              borderColor: c.border,
            },
          ]}
        >
          <View style={[styles.dot, { backgroundColor: dotColor }]} />
          <Text style={[styles.badgeText, { color: c.textSecondary }]}>
            {event.rsvp_summary.confirmed}/{event.guests_count} confirmés
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  pressed: { opacity: 0.88 },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  thumbText: {
    fontFamily: fontFamilies.serifSemiBold,
    fontSize: 13,
    lineHeight: 17,
    letterSpacing: 0.3,
  },
  meta: { flex: 1, gap: 4, minWidth: 0, justifyContent: 'center' },
  title: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 14.5,
    lineHeight: 19,
  },
  date: {
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    lineHeight: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 2,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 11,
    lineHeight: 14,
  },
});
