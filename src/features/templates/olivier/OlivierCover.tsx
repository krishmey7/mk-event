import { Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { fillGuestNameToken } from '@/features/editor/guestNameToken';
import type { Guest } from '@/features/invitation/types';
import type { TemplateColors } from '../elegance/themes';

export function OlivierCover({
  colors,
  photoUri,
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
  photoUri: string;
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
    <ImageBackground
      source={{ uri: photoUri }}
      resizeMode="cover"
      style={[styles.cover, compact && styles.compactCover, { backgroundColor: colors.primary }]}
      imageStyle={styles.backgroundImage}
    >
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.coverOverlayDeep }]} />
      <View style={[styles.content, compact && styles.compactContent]}>
        <Text style={styles.eyebrow}>NOTRE HISTOIRE, NOTRE JOUR</Text>
        <Text style={[styles.names, compact && styles.compactNames]}>{couple}</Text>
        <Image
          source={{ uri: portraitUri }}
          resizeMode="cover"
          style={[styles.portrait, compact && styles.compactPortrait, { borderColor: colors.accent }]}
        />
        <View style={styles.titleBlock}>
          <Text style={[styles.title, compact && styles.compactTitle]}>{title || 'Invitation au mariage'}</Text>
          <View style={[styles.rule, { backgroundColor: colors.accent }]} />
          <Text style={styles.invitation}>{fillGuestNameToken(guestSentence, guest.firstName)}</Text>
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
            <Text style={styles.personalText}>POUR {guest.firstName.toLocaleUpperCase('fr-FR')}</Text>
          </View>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  cover: { width: '100%', minHeight: 620, flex: 1, justifyContent: 'center', overflow: 'hidden' },
  compactCover: { minHeight: 420 },
  backgroundImage: { width: '100%', height: '100%' },
  content: { alignItems: 'center', justifyContent: 'center', gap: 18, paddingHorizontal: 28, paddingVertical: 46 },
  compactContent: { gap: 10, paddingHorizontal: 14, paddingVertical: 22 },
  eyebrow: { color: 'rgba(255,255,255,0.78)', fontFamily: 'Inter_500Medium', fontSize: 8, letterSpacing: 2.4 },
  names: {
    color: '#FFFFFF',
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
    color: '#FFFFFF',
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: 32,
    letterSpacing: 2.4,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  compactTitle: { fontSize: 21, letterSpacing: 1.2 },
  rule: { width: 34, height: 1 },
  invitation: {
    color: 'rgba(255,255,255,0.88)',
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    lineHeight: 18,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  date: { fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 2 },
  hint: { alignItems: 'center', padding: 6 },
  personal: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 4 },
  personalText: { color: 'rgba(255,255,255,0.78)', fontFamily: 'Inter_500Medium', fontSize: 8, letterSpacing: 1.8 },
});
