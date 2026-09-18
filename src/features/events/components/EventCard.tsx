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
import { Ionicons } from '@expo/vector-icons';

import {
  fontFamilies,
  semanticColors,
  spacing,
} from '@/constants/theme';
import { useAppTheme } from '@/context/ThemePreferenceContext';
import type { Event, EventType } from '@/types';

const COVERS_LIGHT: Record<EventType, { background: string; text: string }> = {
  wedding: { background: '#FCECE7', text: '#C45D45' },
  birthday: { background: '#6B3A5C', text: '#F7F0E8' },
  baptism: { background: '#F0E8F2', text: '#6B3A5C' },
  corporate: { background: '#EDE4D8', text: '#2A1F24' },
  other: { background: '#EDE4D8', text: '#2A1F24' },
};

const COVERS_DARK: Record<EventType, { background: string; text: string }> = {
  wedding: { background: 'rgba(224, 122, 95, 0.22)', text: '#F0A090' },
  birthday: { background: 'rgba(247, 240, 232, 0.1)', text: '#F7F0E8' },
  baptism: { background: 'rgba(155, 107, 138, 0.25)', text: '#D4B8C8' },
  corporate: { background: 'rgba(247, 240, 232, 0.08)', text: '#D4C4CE' },
  other: { background: 'rgba(247, 240, 232, 0.08)', text: '#D4C4CE' },
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
  onDelete?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function EventCard({ event, onPress, onDelete, style }: EventCardProps) {
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

      {onDelete ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Supprimer ${event.name}`}
          hitSlop={8}
          onPress={(e) => {
            e?.stopPropagation?.();
            onDelete();
          }}
          style={({ pressed }) => [
            styles.deleteBtn,
            { backgroundColor: theme.mode === 'dark' ? c.surfaceElevated : c.background, borderColor: c.border },
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="trash-outline" size={18} color="#A45A45" />
        </Pressable>
      ) : null}
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
  deleteBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
