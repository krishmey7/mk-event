/**
 * Couverture du modèle (SAVE THE DATE) — même composition que l’écran invité.
 * Utilisée en plein écran et, réduite, comme miniature du catalogue.
 */

import { type ReactNode } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Logo } from '@/components/ui/Logo';
import { fillGuestNameToken } from '@/features/editor/guestNameToken';
import { CouplePhotoFrame } from './CouplePhotoFrame';
import type { CouplePhoto, Guest } from './types';
import type { TemplateColors } from '@/features/templates/elegance/themes';

/** Marque Élégance — champagne fixe, indépendant du thème événement. */
const ELEGANCE_LOGO = '#C4A574';
const ELEGANCE_LOGO_SOFT = '#A98246';

export const COVER_STAGE = { width: 390, height: 780 };

export function InvitationCover({
  colors,
  coverUri,
  couplePhoto,
  guest,
  dateLabel,
  couple,
  phrase = 'Pour notre grand jour',
  guestSentence,
  dressCode,
  compact = false,
  paddingTop,
  paddingBottom,
  hint,
  onHintPress,
}: {
  colors: TemplateColors;
  coverUri: string;
  couplePhoto: CouplePhoto;
  guest: Guest;
  dateLabel: string;
  couple: string;
  phrase?: string;
  guestSentence: string;
  dressCode?: string;
  compact?: boolean;
  paddingTop?: number;
  paddingBottom?: number;
  hint?: ReactNode;
  onHintPress?: () => void;
}) {
  const padTop = paddingTop ?? (compact ? 18 : 22);
  const padBottom = paddingBottom ?? (compact ? 16 : 14);
  const personalized = fillGuestNameToken(guestSentence, guest.firstName);
  /* Évite le doublon si phrase = message invité. */
  const rawPhrase = (phrase ?? '').trim();
  const heroPhrase =
    rawPhrase && rawPhrase !== guestSentence.trim()
      ? fillGuestNameToken(rawPhrase, guest.firstName)
      : 'Pour notre grand jour';

  return (
    <View style={styles.fill}>
      <Image source={{ uri: coverUri }} style={styles.coverImage} resizeMode="cover" />
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: colors.coverOverlay }]}
      />
      <View
        pointerEvents="none"
        style={[styles.coverDeep, { backgroundColor: colors.coverOverlayDeep }]}
      />

      <View style={[styles.content, { paddingTop: padTop, paddingBottom: padBottom }]}>
        <Logo size="sm" color={ELEGANCE_LOGO} wordmarkColor={ELEGANCE_LOGO_SOFT} />

        <View style={styles.photoSlot}>
          <CouplePhotoFrame
            key={`${couplePhoto.frame}-${couplePhoto.uri}`}
            couplePhoto={couplePhoto}
            accent={colors.accent}
          />
        </View>

        <View style={styles.hero}>
          <Text style={[styles.save, { paddingLeft: 6 }]}>{"SAVE\nTHE DATE"}</Text>
          <View style={styles.ruleRow}>
            <View style={styles.rule} />
            <Ionicons name="heart" size={11} color="#E9D9A8" />
            <View style={styles.rule} />
          </View>
          <Text style={[styles.date, { paddingLeft: 3 }]}>{dateLabel}</Text>
          <Text style={styles.names}>{couple}</Text>
          <Text style={styles.phrase}>{heroPhrase}</Text>
          {dressCode?.trim() && !compact ? (
            <Text style={styles.dress}>{dressCode.trim()}</Text>
          ) : null}
        </View>

        <View style={styles.spacer} />

        <View style={[styles.guestCard, { borderColor: `${colors.accent}66` }]}>
          <View pointerEvents="none" style={styles.guestCardFill} />
          <Text style={styles.guestHello}>Bonjour {guest.firstName}</Text>
          <Text style={styles.guestSentence}>{personalized}</Text>
          <View style={styles.seatRow}>
            <Ionicons name="people" size={13} color={colors.accent} />
            <Text style={[styles.seatText, { color: colors.accent }]}>
              {guest.seats} place{guest.seats > 1 ? 's' : ''} vous {guest.seats > 1 ? 'sont' : 'est'} réservée
              {guest.seats > 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {hint ? (
          onHintPress ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Faire défiler vers la suite"
              onPress={onHintPress}
              hitSlop={12}
              style={styles.scrollHint}
            >
              {hint}
            </Pressable>
          ) : (
            <View style={styles.scrollHint}>{hint}</View>
          )
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, width: '100%', height: '100%', backgroundColor: '#14110E', overflow: 'hidden' },
  coverImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  coverDeep: { ...StyleSheet.absoluteFillObject, bottom: '46%' },
  content: { flex: 1, paddingHorizontal: 18, alignItems: 'center', zIndex: 1 },
  photoSlot: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: { alignItems: 'center', gap: 10 },
  save: {
    fontFamily: 'Fraunces_500Medium',
    fontSize: 33,
    lineHeight: 41,
    color: '#FFFFFF',
    letterSpacing: 6,
    textAlign: 'center',
  },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rule: { width: 34, height: 1, backgroundColor: 'rgba(233, 217, 168, 0.7)' },
  date: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    letterSpacing: 3,
    color: '#E9D9A8',
    textAlign: 'center',
  },
  names: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 31,
    lineHeight: 39,
    color: '#FFFFFF',
  },
  phrase: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  dress: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    letterSpacing: 0.4,
    color: '#E9D9A8',
    textAlign: 'center',
    marginTop: 2,
  },
  spacer: { flex: 1 },
  guestCard: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 6,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  guestCardFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#100E0B',
    opacity: 0.55,
  },
  guestHello: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 20,
    color: '#FFFFFF',
  },
  guestSentence: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(255, 255, 255, 0.78)',
    textAlign: 'center',
  },
  seatRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  seatText: { fontFamily: 'Inter_600SemiBold', fontSize: 11.5 },
  scrollHint: { alignSelf: 'center', alignItems: 'center', gap: 2, marginTop: 14, padding: 6 },
  scrollHintLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10.5,
    letterSpacing: 3,
    color: 'rgba(255, 255, 255, 0.85)',
    textTransform: 'uppercase',
  },
});

export function CoverDiscoverHint({
  chevron,
  color = 'rgba(255, 255, 255, 0.85)',
}: {
  chevron?: ReactNode;
  color?: string;
}) {
  return (
    <>
      <Text style={[styles.scrollHintLabel, { color }]}>Découvrir</Text>
      {chevron ?? <Ionicons name="chevron-down" size={24} color={color} />}
    </>
  );
}

/** Réduit une couverture 390×780 à la largeur du cadre (catalogue). */
export function ScaledInvitationStage({ width, children }: { width: number; children: ReactNode }) {
  if (width <= 0) return null;
  const scale = width / COVER_STAGE.width;
  return (
    <View pointerEvents="none" style={{ width, height: COVER_STAGE.height * scale, overflow: 'hidden' }}>
      <View
        style={{
          width: COVER_STAGE.width,
          height: COVER_STAGE.height,
          transform: [{ scale }],
          marginLeft: ((scale - 1) * COVER_STAGE.width) / 2,
          marginTop: ((scale - 1) * COVER_STAGE.height) / 2,
        }}
      >
        {children}
      </View>
    </View>
  );
}
