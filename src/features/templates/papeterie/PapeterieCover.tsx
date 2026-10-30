import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { fillGuestNameToken } from '@/features/editor/guestNameToken';
import type { Guest } from '@/features/invitation/types';
import type { TemplateColors } from '../elegance/themes';
import { BotanicalSprig } from './BotanicalSprig';

export function PapeterieCover({
  colors,
  photoUri,
  guest,
  title,
  dateLabel,
  couple,
  guestSentence,
  venueName,
  venueCity,
  compact = false,
  hint,
  onHintPress,
}: {
  colors: TemplateColors;
  photoUri: string;
  guest: Guest;
  title: string;
  dateLabel: string;
  couple: string;
  guestSentence: string;
  venueName?: string;
  venueCity?: string;
  compact?: boolean;
  hint?: ReactNode;
  onHintPress?: () => void;
}) {
  const content = (
    <View style={[styles.content, compact && styles.compactContent]}>
      <View style={styles.top}>
        <Text style={styles.together}>AVEC LEURS FAMILLES</Text>
        <View style={[styles.topRule, { backgroundColor: colors.accent }]} />
      </View>
      <View style={styles.identity}>
        <Text style={[styles.title, compact && styles.compactTitle]}>{title || 'RÉSERVEZ LA DATE'}</Text>
        <View style={styles.heartRule}>
          <View style={[styles.rule, { backgroundColor: colors.accent }]} />
          <Ionicons name="heart" size={12} color={colors.accent} />
          <View style={[styles.rule, { backgroundColor: colors.accent }]} />
        </View>
        <Text style={[styles.names, compact && styles.compactNames]}>{couple}</Text>
        <Text style={styles.invitation}>{fillGuestNameToken(guestSentence, guest.firstName)}</Text>
        <Text style={[styles.date, { color: colors.accent }]}>{dateLabel}</Text>
        {[venueName, venueCity].filter(Boolean).length ? (
          <Text style={styles.place}>{[venueName, venueCity].filter(Boolean).join(' · ')}</Text>
        ) : null}
      </View>
      <View style={styles.bottom}>
        <Text style={styles.personal}>POUR {guest.firstName.toLocaleUpperCase('fr-FR')}</Text>
        {hint && onHintPress ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Découvrir les détails de l’invitation"
            onPress={onHintPress}
            style={styles.hint}
          >
            {hint}
          </Pressable>
        ) : null}
      </View>
      <View pointerEvents="none" style={styles.sprig}>
        <BotanicalSprig color={colors.accent} size={compact ? 72 : 116} />
      </View>
    </View>
  );

  return (
    <ImageBackground
      source={{ uri: photoUri }}
      resizeMode="cover"
      style={[styles.cover, { backgroundColor: colors.primary }]}
      imageStyle={styles.image}
    >
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.coverOverlayDeep }]} />
      {content}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  cover: { flex: 1, width: '100%', minHeight: 420, overflow: 'hidden', justifyContent: 'flex-end' },
  image: { width: '100%', height: '100%' },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 26,
    paddingTop: 54,
    paddingBottom: 26,
  },
  compactContent: { paddingHorizontal: 12, paddingTop: 16, paddingBottom: 12 },
  top: { alignItems: 'center', gap: 9 },
  together: { color: 'rgba(255,255,255,0.83)', fontFamily: 'Inter_500Medium', fontSize: 9, letterSpacing: 2 },
  topRule: { height: 1, width: 30 },
  identity: { alignItems: 'center', gap: 13, paddingBottom: 20 },
  title: {
    color: '#FFFFFF',
    fontFamily: 'CormorantGaramond_500Medium',
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: 5,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  compactTitle: { fontSize: 22, lineHeight: 25, letterSpacing: 2.4 },
  heartRule: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rule: { width: 38, height: 1 },
  names: {
    color: '#FFFFFF',
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: 34,
    letterSpacing: 2,
    textAlign: 'center',
  },
  compactNames: { fontSize: 21, letterSpacing: 1 },
  invitation: {
    maxWidth: 280,
    color: 'rgba(255,255,255,0.86)',
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    lineHeight: 18,
    letterSpacing: 1.1,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  date: { fontFamily: 'Inter_500Medium', fontSize: 11, letterSpacing: 2 },
  place: {
    color: 'rgba(255,255,255,0.78)',
    fontFamily: 'Inter_400Regular',
    fontSize: 9,
    letterSpacing: 1.4,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  bottom: { alignItems: 'center', gap: 8 },
  personal: { color: 'rgba(255,255,255,0.76)', fontFamily: 'Inter_500Medium', fontSize: 8, letterSpacing: 2 },
  hint: { alignItems: 'center', padding: 4 },
  sprig: { position: 'absolute', top: 44, right: -14, opacity: 0.8 },
});
