import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { fillGuestNameToken } from '@/features/editor/guestNameToken';
import type { Guest } from '@/features/invitation/types';
import type { TemplateColors } from '../elegance/themes';
import { BotanicalSprig } from '../papeterie/BotanicalSprig';

export function FoiAmourCover({
  colors,
  photoUri,
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
  photoUri: string;
  guest: Guest;
  title: string;
  dateLabel: string;
  couple: string;
  guestSentence: string;
  compact?: boolean;
  hint?: ReactNode;
  onHintPress?: () => void;
}) {
  const [firstName = 'A', secondName = 'B'] = couple.split(/[&+]/).map((name) => name.trim());

  return (
    <View style={[styles.cover, compact && styles.compactCover, { backgroundColor: colors.bg }]}>
      <View style={[styles.content, compact && styles.compactContent]}>
        <View pointerEvents="none" style={styles.topSprig}>
          <BotanicalSprig color={colors.accent} size={compact ? 100 : 150} />
        </View>
        <Text style={[styles.verse, compact && styles.compactVerse]}>
          « Trois choses demeurent : la foi, l’espérance et l’amour. La plus grande d’entre elles est l’amour. »
        </Text>
        <Text style={styles.verseReference}>1 CORINTHIENS 13:13</Text>
        <View style={styles.monogram}>
          <Text style={[styles.initial, compact && styles.compactInitial]}>{firstName.charAt(0) || 'A'}</Text>
          <View style={[styles.monogramRule, { backgroundColor: colors.accent }]} />
          <Text style={[styles.initial, compact && styles.compactInitial]}>{secondName.charAt(0) || 'B'}</Text>
        </View>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>{title || 'NOTRE MARIAGE'}</Text>
        <View style={[styles.heartRule, { backgroundColor: colors.accent }]}>
          <Ionicons name="heart" size={11} color={colors.accent} />
        </View>
        <Image source={{ uri: photoUri }} resizeMode="cover" style={styles.heroPhoto} />
        <Text style={[styles.invitation, { color: colors.textMuted }]}>
          {fillGuestNameToken(guestSentence, guest.firstName)}
        </Text>
        <Text style={[styles.names, { color: colors.text }]}>{couple}</Text>
        <Text style={[styles.date, { color: colors.primary }]}>{dateLabel}</Text>
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
            <Ionicons name="leaf-outline" size={14} color={colors.primary} />
            <Text style={[styles.personalText, { color: colors.textMuted }]}>
              POUR {guest.firstName.toLocaleUpperCase('fr-FR')}
            </Text>
          </View>
        )}
        <View pointerEvents="none" style={styles.bottomSprig}>
          <BotanicalSprig color={colors.accent} size={compact ? 72 : 105} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cover: { width: '100%', minHeight: 850, flex: 1, overflow: 'hidden' },
  compactCover: { minHeight: 520 },
  content: { alignItems: 'center', gap: 14, paddingHorizontal: 26, paddingVertical: 38, overflow: 'hidden' },
  compactContent: { gap: 8, paddingHorizontal: 14, paddingVertical: 18 },
  topSprig: { position: 'absolute', top: -25, left: -20, opacity: 0.6, transform: [{ rotate: '20deg' }] },
  bottomSprig: { position: 'absolute', bottom: 4, right: -14, opacity: 0.65, transform: [{ rotate: '-20deg' }] },
  verse: {
    maxWidth: 280,
    marginTop: 16,
    color: '#626658',
    fontFamily: 'CormorantGaramond_500Medium',
    fontSize: 14,
    letterSpacing: 0.45,
    lineHeight: 20,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  compactVerse: { fontSize: 9, lineHeight: 13, marginTop: 8 },
  verseReference: { color: '#777D6D', fontFamily: 'Inter_500Medium', fontSize: 7, letterSpacing: 1.5 },
  monogram: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 2 },
  initial: {
    color: '#34382E',
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: 82,
    lineHeight: 88,
    textAlign: 'center',
  },
  compactInitial: { fontSize: 49, lineHeight: 54 },
  monogramRule: { width: 1, height: 64 },
  eyebrow: { fontFamily: 'Inter_500Medium', fontSize: 8, letterSpacing: 3.2 },
  heartRule: { width: 54, height: 1, alignItems: 'center', justifyContent: 'center' },
  heroPhoto: { width: '100%', maxWidth: 420, height: 255, marginVertical: 2 },
  invitation: {
    maxWidth: 330,
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  names: { fontFamily: 'GreatVibes_400Regular', fontSize: 44, lineHeight: 54, textAlign: 'center' },
  date: { fontFamily: 'CormorantGaramond_500Medium', fontSize: 18, letterSpacing: 1.3, textAlign: 'center' },
  hint: { alignItems: 'center', padding: 6 },
  personal: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  personalText: { fontFamily: 'Inter_500Medium', fontSize: 7.5, letterSpacing: 1.6 },
});
