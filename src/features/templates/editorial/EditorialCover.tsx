/**
 * Couverture « Revue » — planche magazine 2026.
 * Typographie en héros, photo décalée, filets, mouvement lent.
 */

import { useEffect, useRef, type ReactNode } from 'react';
import {
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { fontFamilies } from '@/constants/theme';
import type { CouplePhoto, Guest } from '@/features/invitation/types';
import type { TemplateColors } from '@/features/templates/elegance/themes';
import { fillGuestNameToken } from '@/features/editor/guestNameToken';
import { EditorialPhotoShape } from './EditorialPhotoShape';

function splitCouple(couple: string): [string, string] {
  const parts = couple.split(/\s*[&+]\s*/).map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2) return [parts[0], parts.slice(1).join(' & ')];
  return [couple.trim() || 'Nous', ''];
}

export function EditorialCover({
  colors,
  isDark,
  couplePhoto,
  coverUri,
  guest,
  title,
  dateLabel,
  couple,
  phrase,
  kicker,
  venueName,
  venueCity,
  dressCode,
  compact,
  paddingTop = 18,
  paddingBottom = 16,
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
  const drift = useRef(new Animated.Value(0)).current;
  const enter = useRef(new Animated.Value(0)).current;
  const [first, second] = splitCouple(couple);
  const guestLine = fillGuestNameToken(phrase, guest.firstName);
  const photoUri = couplePhoto.uri || coverUri || '';
  const frame = couplePhoto.frame || 'soft';
  const centered = frame === 'circle' || frame === 'circleFloral' || frame === 'hex' || frame === 'hexFloral';

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: compact ? 1 : 9000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: compact ? 1 : 9000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    Animated.timing(enter, {
      toValue: 1,
      duration: compact ? 1 : 980,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    return () => loop.stop();
  }, [compact, drift, enter]);

  const scale = drift.interpolate({ inputRange: [0, 1], outputRange: [1.12, 1] });
  const shift = drift.interpolate({ inputRange: [0, 1], outputRange: [8, -10] });
  const rise = enter.interpolate({ inputRange: [0, 1], outputRange: [18, 0] });
  const rule = enter.interpolate({ inputRange: [0, 1], outputRange: [0.15, 1] });

  const nameSize = compact ? 28 : 54;
  const spine = (kicker || title || 'Volume 01').toUpperCase();

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.bg,
          paddingTop,
          paddingBottom,
        },
      ]}
    >
      <Text style={[styles.spine, { color: colors.textMuted }]} numberOfLines={1}>
        {spine}  ·  MARIAGE
      </Text>

      <View style={styles.mast}>
        <Text style={[styles.mastItem, { color: colors.textMuted }]}>N° 01</Text>
        <Text style={[styles.mastItem, { color: colors.accent }]}>{title.toUpperCase()}</Text>
        <Text style={[styles.mastItem, { color: colors.textMuted }]} numberOfLines={1}>
          {(venueCity || '—').toUpperCase()}
        </Text>
      </View>

      <Animated.View style={{ opacity: enter, transform: [{ translateY: rise }] }}>
        <Text
          style={[
            styles.name,
            { color: colors.text, fontSize: nameSize, lineHeight: nameSize * 0.92 },
          ]}
          numberOfLines={2}
        >
          {first}
        </Text>
        {second ? (
          <Text
            style={[
              styles.name,
              styles.nameSecond,
              { color: colors.text, fontSize: nameSize, lineHeight: nameSize * 0.92 },
            ]}
            numberOfLines={2}
          >
            {second}
          </Text>
        ) : null}
      </Animated.View>

      <Animated.View style={[styles.ruleRow, { opacity: rule }]}>
        <View style={[styles.rule, { backgroundColor: colors.text }]} />
        <Text style={[styles.date, { color: colors.text }]}>{dateLabel.toUpperCase()}</Text>
        <View style={[styles.rule, { backgroundColor: colors.text }]} />
      </Animated.View>

      <View
        style={[
          centered ? styles.plateCenter : styles.plateWrap,
          !centered && compact && styles.plateCompact,
          frame === 'circle' || frame === 'circleFloral' ? styles.plateNarrow : null,
        ]}
      >
        <View style={centered ? styles.plateSquare : styles.plateRatio}>
          <EditorialPhotoShape
            uri={photoUri}
            frame={frame}
            color={colors.text}
            fallbackColor={colors.surfaceAlt}
            imageStyle={{ transform: [{ scale }, { translateY: shift }] }}
          />
          {isDark ? (
            <View pointerEvents="none" style={[styles.plateShade, { backgroundColor: colors.coverOverlay }]} />
          ) : null}
        </View>
        <Text style={[styles.credit, { color: colors.textMuted }]} numberOfLines={2}>
          {guestLine}
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerCol}>
          <Text style={[styles.footerLabel, { color: colors.accent }]}>LIEU</Text>
          <Text style={[styles.footerValue, { color: colors.text }]} numberOfLines={2}>
            {[venueName, venueCity].filter(Boolean).join('\n') || 'À préciser'}
          </Text>
        </View>
        <View style={[styles.footerRule, { backgroundColor: colors.border }]} />
        <View style={styles.footerCol}>
          <Text style={[styles.footerLabel, { color: colors.accent }]}>TENUE</Text>
          <Text style={[styles.footerValue, { color: colors.text }]} numberOfLines={2}>
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
  );
}

export function EditorialSectionHeader({
  kicker,
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
      <View style={styles.sectionTop}>
        <View style={[styles.sectionTick, { backgroundColor: colors.accent }]} />
        {kicker ? (
          <Text style={[styles.sectionKicker, { color: colors.textMuted }]}>{kicker}</Text>
        ) : null}
      </View>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.sectionSub, { color: colors.textMuted }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

export function EditorialStoryRow({
  colors,
  year,
  title,
  text,
  imageUri,
  onPress,
}: {
  colors: TemplateColors;
  year: string;
  title: string;
  text: string;
  imageUri: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.story}>
      <Image source={{ uri: imageUri }} style={styles.storyPhoto} />
      <View style={styles.storyCopy}>
        <Text style={[styles.storyYear, { color: colors.accent }]}>{year}</Text>
        <Text style={[styles.storyTitle, { color: colors.text }]}>{title}</Text>
        <Text numberOfLines={2} style={[styles.storyText, { color: colors.textMuted }]}>
          {text}
        </Text>
      </View>
    </Pressable>
  );
}

export function EditorialProgramRow({
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
    <View style={[styles.program, { borderTopColor: colors.border }]}>
      <Text style={[styles.programTime, { color: colors.accent }]}>{time}</Text>
      <View style={styles.programCopy}>
        <Text style={[styles.programTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.programPlace, { color: colors.textMuted }]}>{place}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 22, overflow: 'hidden' },
  spine: {
    position: 'absolute',
    left: -46,
    top: '46%',
    width: 140,
    textAlign: 'center',
    transform: [{ rotate: '-90deg' }],
    fontFamily: fontFamilies.sansMedium,
    fontSize: 9,
    letterSpacing: 2.4,
  },
  mast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    paddingLeft: 8,
  },
  mastItem: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 9,
    letterSpacing: 1.8,
    maxWidth: '34%',
  },
  name: {
    fontFamily: fontFamilies.serif,
    letterSpacing: -1.5,
    paddingLeft: 8,
  },
  nameSecond: { marginTop: -2, paddingLeft: 28 },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
    marginBottom: 18,
    paddingLeft: 8,
  },
  rule: { flex: 1, height: StyleSheet.hairlineWidth },
  date: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 10,
    letterSpacing: 2.2,
  },
  plateWrap: { alignSelf: 'flex-end', width: '78%', marginBottom: 16 },
  plateCompact: { width: '70%' },
  plateCenter: { alignSelf: 'center', width: '74%', marginBottom: 16 },
  plateNarrow: { width: '62%' },
  plateRatio: { width: '100%', aspectRatio: 3 / 4 },
  plateSquare: { width: '100%', aspectRatio: 1 },
  plateShade: { ...StyleSheet.absoluteFillObject },
  credit: {
    marginTop: 8,
    fontFamily: fontFamilies.sans,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.2,
  },
  footer: { flexDirection: 'row', gap: 14, paddingLeft: 8, marginTop: 'auto' },
  footerCol: { flex: 1, gap: 4 },
  footerRule: { width: StyleSheet.hairlineWidth },
  footerLabel: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 9,
    letterSpacing: 1.8,
  },
  footerValue: {
    fontFamily: fontFamilies.serif,
    fontSize: 15,
    lineHeight: 20,
  },
  hint: { alignItems: 'center', marginTop: 12 },
  section: { marginBottom: 18, paddingHorizontal: 4 },
  sectionTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  sectionTick: { width: 18, height: 1 },
  sectionKicker: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 10,
    letterSpacing: 2.4,
  },
  sectionTitle: {
    fontFamily: fontFamilies.serif,
    fontSize: 36,
    lineHeight: 38,
    letterSpacing: -0.8,
  },
  sectionSub: {
    marginTop: 6,
    fontFamily: fontFamilies.sans,
    fontSize: 13,
    letterSpacing: 0.3,
  },
  story: { marginBottom: 22 },
  storyPhoto: { width: '100%', height: 168, marginBottom: 10 },
  storyCopy: { gap: 2 },
  storyYear: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 11,
    letterSpacing: 2,
  },
  storyTitle: {
    fontFamily: fontFamilies.serif,
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.4,
  },
  storyText: { fontFamily: fontFamilies.sans, fontSize: 14, lineHeight: 20 },
  program: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  programTime: {
    width: 64,
    fontFamily: fontFamilies.sansMedium,
    fontSize: 13,
    letterSpacing: 0.6,
    paddingTop: 4,
  },
  programCopy: { flex: 1 },
  programTitle: {
    fontFamily: fontFamilies.serif,
    fontSize: 22,
    lineHeight: 26,
  },
  programPlace: { fontFamily: fontFamilies.sans, fontSize: 13, marginTop: 2 },
});
