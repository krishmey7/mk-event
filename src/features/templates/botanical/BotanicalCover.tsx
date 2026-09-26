/**
 * Couverture Herbier — papier, bouquet dessiné, portrait en couronne.
 */

import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';

import { fontFamilies } from '@/constants/theme';
import { fillGuestNameToken } from '@/features/editor/guestNameToken';
import type { CouplePhoto, Guest } from '@/features/invitation/types';
import type { TemplateColors } from '@/features/templates/elegance/themes';
import { BotanicalPortrait, BotanicalSprig, CornerBouquet } from './BotanicalArt';

function splitCouple(couple: string): [string, string] {
  const parts = couple.split(/\s*[&+]\s*/).map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2) return [parts[0], parts.slice(1).join(' & ')];
  return [couple.trim() || 'Nous', ''];
}

export function BotanicalCover({
  colors,
  couplePhoto,
  guest,
  title,
  dateLabel,
  couple,
  phrase,
  venueName,
  venueCity,
  dressCode,
  compact,
  paddingTop = 28,
  paddingBottom = 18,
  hint,
  onHintPress,
}: {
  colors: TemplateColors;
  isDark?: boolean;
  couplePhoto: CouplePhoto;
  coverUri?: string;
  guest: Guest;
  title: string;
  dateLabel: string;
  couple: string;
  phrase: string;
  kicker?: string;
  venueName: string;
  venueCity: string;
  dressCode?: string;
  compact?: boolean;
  paddingTop?: number;
  paddingBottom?: number;
  hint?: ReactNode;
  onHintPress?: () => void;
}) {
  const sway = useRef(new Animated.Value(0)).current;
  const [first, second] = splitCouple(couple);
  const guestLine = fillGuestNameToken(phrase, guest.firstName);
  const ink = colors.text;
  const petal = colors.accent;
  const leaf = colors.primary;
  const bouquet = compact ? 92 : 150;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(sway, {
          toValue: 1,
          duration: compact ? 1 : 5200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(sway, {
          toValue: 0,
          duration: compact ? 1 : 5200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [compact, sway]);

  const tilt = sway.interpolate({ inputRange: [0, 1], outputRange: ['-2.2deg', '2.2deg'] });
  const tiltBack = sway.interpolate({ inputRange: [0, 1], outputRange: ['2deg', '-2deg'] });

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.bg,
          paddingTop,
          paddingBottom,
          flex: compact ? undefined : 1,
        },
      ]}
    >
      <View pointerEvents="none" style={[styles.frame, { borderColor: colors.border }]} />

      <Animated.View style={[styles.bouquetLeft, { transform: [{ rotate: tilt }] }]} pointerEvents="none">
        <CornerBouquet width={bouquet} petal={petal} ink={ink} leaf={leaf} />
      </Animated.View>
      <Animated.View style={[styles.bouquetRight, { transform: [{ rotate: tiltBack }, { scaleX: -1 }] }]} pointerEvents="none">
        <CornerBouquet width={Math.round(bouquet * 0.72)} petal={petal} ink={ink} leaf={leaf} />
      </Animated.View>

      <View style={styles.copy}>
        <Text style={[styles.kicker, { color: colors.textMuted }]} numberOfLines={1}>
          {(title || 'Nous nous marions').toUpperCase()}
        </Text>

        <Text style={[styles.name, { color: ink, fontSize: compact ? 34 : 48 }]} numberOfLines={1}>
          {first}
        </Text>
        {second ? (
          <>
            <Text style={[styles.amp, { color: petal }]}>&</Text>
            <Text style={[styles.name, { color: ink, fontSize: compact ? 34 : 48 }]} numberOfLines={1}>
              {second}
            </Text>
          </>
        ) : null}

        <BotanicalSprig width={compact ? 64 : 92} petal={petal} ink={ink} leaf={leaf} />

        <View style={[styles.datePill, { borderColor: ink }]}>
          <Text style={[styles.date, { color: ink }]}>{dateLabel}</Text>
        </View>

        <BotanicalPortrait
          uri={couplePhoto.uri}
          frame={couplePhoto.frame || 'circleFloral'}
          petal={petal}
          ink={ink}
          leaf={leaf}
          width={compact ? 250 : 320}
        />

        <Text style={[styles.guest, { color: colors.textMuted }]} numberOfLines={2}>
          {guestLine}
        </Text>

        <View style={styles.footer}>
          <View style={styles.footerCol}>
            <Text style={[styles.footerLabel, { color: petal }]}>LIEU</Text>
            <Text style={[styles.footerValue, { color: ink }]} numberOfLines={2}>
              {[venueName, venueCity].filter(Boolean).join('\n') || 'À préciser'}
            </Text>
          </View>
          <View style={styles.footerCol}>
            <Text style={[styles.footerLabel, { color: petal }]}>TENUE</Text>
            <Text style={[styles.footerValue, { color: ink }]} numberOfLines={2}>
              {dressCode || 'Au choix'}
            </Text>
          </View>
        </View>

        {hint ? (
          onHintPress ? (
            <Pressable accessibilityRole="button" onPress={onHintPress} style={styles.hint}>
              {hint}
            </Pressable>
          ) : (
            <View style={styles.hint}>{hint}</View>
          )
        ) : null}
      </View>
    </View>
  );
}

export function BotanicalSectionHeader({
  title,
  subtitle,
  colors,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  colors: TemplateColors;
}) {
  return (
    <View style={styles.section}>
      <BotanicalSprig width={76} petal={colors.accent} ink={colors.text} leaf={colors.primary} />
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.sectionSub, { color: colors.textMuted }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

export function BotanicalStoryRow({
  colors,
  year,
  title,
  text,
  onPress,
}: {
  colors: TemplateColors;
  year: string;
  title: string;
  text: string;
  imageUri?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.story, { borderColor: colors.text }]}
    >
      <Text style={[styles.storyYear, { color: colors.accent }]}>{year}</Text>
      <Text style={[styles.storyTitle, { color: colors.text }]}>{title}</Text>
      <Text numberOfLines={2} style={[styles.storyText, { color: colors.textMuted }]}>
        {text}
      </Text>
    </Pressable>
  );
}

export function BotanicalProgramRow({
  colors,
  time,
  title,
  place,
}: {
  colors: TemplateColors;
  time: string;
  title: string;
  place: string;
}) {
  return (
    <View style={styles.program}>
      <Text style={[styles.programTime, { color: colors.accent }]}>{time}</Text>
      <View style={styles.programCopy}>
        <Text style={[styles.programTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.programPlace, { color: colors.textMuted }]}>{place}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { overflow: 'hidden', minHeight: 640 },
  frame: {
    ...StyleSheet.absoluteFillObject,
    margin: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  bouquetLeft: { position: 'absolute', top: -8, left: -28 },
  bouquetRight: { position: 'absolute', bottom: 12, right: -36 },
  copy: { alignItems: 'center', paddingHorizontal: 36, zIndex: 1, gap: 2 },
  kicker: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 11,
    letterSpacing: 2.4,
    marginBottom: 8,
  },
  name: {
    fontFamily: fontFamilies.serifItalic,
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  amp: {
    fontFamily: fontFamilies.serifItalic,
    fontSize: 28,
    lineHeight: 32,
    marginVertical: -2,
  },
  datePill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 5,
    marginTop: 6,
    marginBottom: 8,
  },
  date: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 12,
    letterSpacing: 1.2,
  },
  guest: {
    fontFamily: fontFamilies.serifItalic,
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 10,
  },
  footer: { flexDirection: 'row', gap: 18, marginTop: 4 },
  footerCol: { flex: 1, alignItems: 'center', gap: 2 },
  footerLabel: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 9,
    letterSpacing: 1.6,
  },
  footerValue: {
    fontFamily: fontFamilies.serif,
    fontSize: 14,
    lineHeight: 18,
    textAlign: 'center',
  },
  hint: { alignItems: 'center', marginTop: 10 },
  section: { alignItems: 'center', marginBottom: 16 },
  sectionTitle: {
    fontFamily: fontFamilies.serifItalic,
    fontSize: 32,
    lineHeight: 36,
    textAlign: 'center',
  },
  sectionSub: {
    marginTop: 4,
    fontFamily: fontFamilies.sans,
    fontSize: 13,
    textAlign: 'center',
  },
  story: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  storyYear: { fontFamily: fontFamilies.serifItalic, fontSize: 16 },
  storyTitle: { fontFamily: fontFamilies.serif, fontSize: 18, marginTop: 2 },
  storyText: { fontFamily: fontFamilies.sans, fontSize: 13, lineHeight: 18, marginTop: 4 },
  program: { flexDirection: 'row', alignItems: 'baseline', gap: 14, paddingVertical: 8 },
  programTime: { fontFamily: fontFamilies.serifItalic, fontSize: 16, width: 64 },
  programCopy: { flex: 1 },
  programTitle: { fontFamily: fontFamilies.serif, fontSize: 17 },
  programPlace: { fontFamily: fontFamilies.sans, fontSize: 13, marginTop: 1 },
});
