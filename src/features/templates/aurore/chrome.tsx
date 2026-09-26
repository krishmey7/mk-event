/**
 * Or métallique et pages intérieures d’Aurore — même langage que le panneau de couverture.
 */

import { type ReactNode } from 'react';
import { Platform, Image, Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { IconName } from '@/features/templates/elegance/data';

/** Titre en feuille d’or : dégradé clair / ombre, pas un aplat. */
export function GoldText({
  children,
  gold,
  style,
  numberOfLines,
}: {
  children: string;
  gold: string;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}) {
  const foil = (
    Platform.OS === 'web'
      ? {
          color: 'transparent',
          backgroundImage: `linear-gradient(115deg, #7A5A16 0%, #F8E7A8 18%, ${gold} 40%, #FFF6D0 50%, #A67C2A 74%, ${gold} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }
      : { color: gold }
  ) as TextStyle;

  return (
    <Text style={[style, foil]} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
}

export function AurorePage({
  gold,
  panel,
  children,
  style,
}: {
  gold: string;
  panel: string;
  children: ReactNode;
  style?: object;
}) {
  return (
    <View style={[styles.page, { backgroundColor: panel }, style]}>
      <View style={[styles.pageRule, { backgroundColor: gold }]} />
      {children}
    </View>
  );
}

export function AuroreBreak({ gold }: { gold: string }) {
  return (
    <View style={styles.breakRow}>
      <View style={[styles.breakLine, { backgroundColor: gold }]} />
      <View style={[styles.breakDiamond, { borderColor: gold }]} />
      <View style={[styles.breakLine, { backgroundColor: gold }]} />
    </View>
  );
}

export function AuroreSectionHeader({
  kicker,
  title,
  subtitle,
  gold,
  muted,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  gold: string;
  muted: string;
}) {
  return (
    <View style={styles.header}>
      {kicker ? (
        <GoldText gold={gold} style={styles.kicker}>{kicker}</GoldText>
      ) : null}
      <GoldText gold={gold} style={styles.title}>{title}</GoldText>
      <AuroreBreak gold={gold} />
      {subtitle ? <Text style={[styles.subtitle, { color: muted }]}>{subtitle}</Text> : null}
    </View>
  );
}

export function AuroreStoryItem({
  year,
  title,
  text,
  imageUri,
  gold,
  cream,
  onPress,
}: {
  year: string;
  title: string;
  text: string;
  imageUri?: string;
  gold: string;
  cream: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Lire l'étape ${title}`} onPress={onPress} style={styles.story}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={[styles.storyPhoto, { borderColor: gold }]} resizeMode="cover" />
      ) : null}
      <GoldText gold={gold} style={styles.year}>{year}</GoldText>
      <GoldText gold={gold} style={styles.storyTitle}>{title}</GoldText>
      <Text numberOfLines={3} style={[styles.body, { color: cream }]}>{text}</Text>
      <GoldText gold={gold} style={styles.read}>Lire le récit</GoldText>
      <View style={[styles.itemRule, { backgroundColor: gold }]} />
    </Pressable>
  );
}

export function AuroreProgramItem({
  time,
  title,
  place,
  icon,
  gold,
  ink,
  cream,
}: {
  time: string;
  title: string;
  place: string;
  icon: IconName;
  gold: string;
  ink: string;
  cream: string;
}) {
  return (
    <View style={styles.program}>
      <View style={[styles.medallion, { backgroundColor: '#D4AF37' }]}>
        <Ionicons name={icon} size={16} color={ink} />
      </View>
      <View style={styles.programCopy}>
        <GoldText gold={gold} style={styles.time}>{time}</GoldText>
        <GoldText gold={gold} style={styles.programTitle}>{title}</GoldText>
        <Text style={[styles.place, { color: cream }]}>{place}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 26, paddingTop: 28, paddingBottom: 36 },
  pageRule: { alignSelf: 'center', width: 42, height: 1, marginBottom: 22, opacity: 0.9 },
  breakRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 12 },
  breakLine: { width: 36, height: 1, opacity: 0.85 },
  breakDiamond: { width: 7, height: 7, borderWidth: 1, transform: [{ rotate: '45deg' }] },
  header: { alignItems: 'center', marginBottom: 8 },
  kicker: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 3.2,
    textAlign: 'center',
  },
  title: {
    fontFamily: 'CormorantGaramond_500Medium',
    fontSize: 36,
    lineHeight: 40,
    textAlign: 'center',
    marginTop: 6,
  },
  subtitle: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  story: { alignItems: 'center', paddingVertical: 16, gap: 4 },
  storyPhoto: {
    width: 168,
    height: 112,
    borderRadius: 2,
    borderWidth: 1,
    marginBottom: 8,
  },
  year: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 13,
    letterSpacing: 2.4,
  },
  storyTitle: {
    fontFamily: 'CormorantGaramond_500Medium',
    fontSize: 26,
    lineHeight: 30,
    textAlign: 'center',
  },
  body: {
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 4,
  },
  read: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    marginTop: 8,
  },
  itemRule: { width: 28, height: 1, marginTop: 14 },
  program: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 },
  medallion: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  programCopy: { flex: 1, gap: 1 },
  time: { fontFamily: 'Inter_600SemiBold', fontSize: 11, letterSpacing: 1.6 },
  programTitle: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 22, lineHeight: 26 },
  place: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 15, lineHeight: 20 },
});
