import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { fillGuestNameToken } from '@/features/editor/guestNameToken';
import type { Guest } from '@/features/invitation/types';
import type { TemplateColors } from '../elegance/themes';
import { BotanicalSprig } from '../papeterie/BotanicalSprig';

export function OlivierCover({
  colors,
  portraitUri,
  guest,
  title,
  dateLabel,
  couple,
  guestSentence,
  compact = false,
  hint,
  onHintPress,
}: {
  colors: TemplateColors;
  portraitUri: string;
  guest: Guest;
  title: string;
  dateLabel: string;
  couple: string;
  guestSentence: string;
  compact?: boolean;
  hint?: ReactNode;
  onHintPress?: () => void;
}) {
  return (
    <View style={[styles.cover, compact && styles.compactCover, { backgroundColor: colors.primary }]}>
      <View pointerEvents="none" style={[styles.frame, { borderColor: colors.onPrimary }]} />
      <View pointerEvents="none" style={styles.topSprig}>
        <BotanicalSprig color={colors.accent} size={compact ? 92 : 142} />
      </View>
      <View pointerEvents="none" style={styles.bottomSprig}>
        <BotanicalSprig color={colors.accent} size={compact ? 78 : 118} />
      </View>
      <View pointerEvents="none" style={[styles.orbit, styles.orbitTop, { borderColor: colors.accent }]} />
      <View pointerEvents="none" style={[styles.orbit, styles.orbitBottom, { borderColor: colors.accent }]} />
      <View style={[styles.content, compact && styles.compactContent]}>
        <Text style={[styles.eyebrow, { color: colors.onPrimary }]}>NOTRE HISTOIRE, NOTRE JOUR</Text>
        <Text style={[styles.names, compact && styles.compactNames, { color: colors.onPrimary }]}>{couple}</Text>
        <Image
          source={{ uri: portraitUri }}
          resizeMode="cover"
          style={[styles.portrait, compact && styles.compactPortrait, { borderColor: colors.accent }]}
        />
        <View style={styles.titleBlock}>
          <Text style={[styles.title, compact && styles.compactTitle, { color: colors.onPrimary }]}>
            {title || 'Invitation au mariage'}
          </Text>
          <View style={[styles.rule, { backgroundColor: colors.accent }]} />
          <Text style={[styles.invitation, { color: colors.onPrimary, opacity: 0.88 }]}>
            {fillGuestNameToken(guestSentence, guest.firstName)}
          </Text>
          <Text style={[styles.date, { color: colors.accent }]}>{dateLabel}</Text>
        </View>
        {hint && onHintPress ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Découvrir les détails de l’invitation"
            onPress={onHintPress}
            style={styles.hint}
          >
            {hint}
          </Pressable>
        ) : (
          <View style={styles.personal}>
            <Ionicons name="leaf-outline" size={14} color={colors.accent} />
            <Text style={[styles.personalText, { color: colors.onPrimary }]}>
              POUR {guest.firstName.toLocaleUpperCase('fr-FR')}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cover: { width: '100%', minHeight: 620, flex: 1, justifyContent: 'center', overflow: 'hidden' },
  compactCover: { minHeight: 420 },
  frame: {
    ...StyleSheet.absoluteFillObject,
    top: 16,
    right: 16,
    bottom: 16,
    left: 16,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    opacity: 0.2,
  },
  topSprig: { position: 'absolute', top: 26, left: 8, opacity: 0.75, transform: [{ rotate: '4deg' }] },
  bottomSprig: { position: 'absolute', right: 3, bottom: 14, opacity: 0.7, transform: [{ rotate: '174deg' }] },
  orbit: { position: 'absolute', width: 220, height: 220, borderRadius: 110, borderWidth: 1, opacity: 0.14 },
  orbitTop: { top: -144, right: -88 },
  orbitBottom: { bottom: -156, left: -112 },
  content: { zIndex: 1, alignItems: 'center', justifyContent: 'center', gap: 18, paddingHorizontal: 28, paddingVertical: 46 },
  compactContent: { gap: 10, paddingHorizontal: 14, paddingVertical: 22 },
  eyebrow: { fontFamily: 'Inter_500Medium', fontSize: 8, letterSpacing: 2.4 },
  names: {
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: 38,
    letterSpacing: 1.4,
    textAlign: 'center',
  },
  compactNames: { fontSize: 25 },
  portrait: { width: 168, height: 224, borderWidth: 1.5, borderRadius: 84, marginVertical: 4 },
  compactPortrait: { width: 116, height: 150 },
  titleBlock: { alignItems: 'center', gap: 12, maxWidth: 330 },
  title: {
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: 32,
    letterSpacing: 2.4,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  compactTitle: { fontSize: 21, letterSpacing: 1.2 },
  rule: { width: 34, height: 1 },
  invitation: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    lineHeight: 18,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  date: { fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 2 },
  hint: { alignItems: 'center', padding: 6 },
  personal: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 4 },
  personalText: { fontFamily: 'Inter_500Medium', fontSize: 8, letterSpacing: 1.8 },
});
