/**
 * Ornements et pages intérieures Pellicule — papier, cadres, filets calligraphiés.
 */

import { createElement, type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';

import type { IconName } from '@/features/templates/elegance/data';

/** Volute symétrique haut / bas, comme sur l’affiche. */
export function PelliculeFlourish({ color, width = 220 }: { color: string; width?: number }) {
  const h = Math.round(width * 0.18);
  return (
    <Svg width={width} height={h} viewBox="0 0 220 40" accessibilityElementsHidden>
      <Path
        d="M8 20 C28 8, 42 8, 58 20 C74 32, 88 32, 110 20 C132 8, 146 8, 162 20 C178 32, 192 32, 212 20"
        stroke={color}
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M40 20 C48 12, 56 12, 64 20 M156 20 C164 12, 172 12, 180 20"
        stroke={color}
        strokeWidth="0.9"
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M100 20 L110 10 L120 20 L110 30 Z"
        stroke={color}
        strokeWidth="0.9"
        fill="none"
      />
    </Svg>
  );
}

function paperStyle(paper: string) {
  if (Platform.OS !== 'web') return { backgroundColor: paper };
  return {
    backgroundColor: paper,
    backgroundImage: `radial-gradient(ellipse 120% 80% at 50% 0%, rgba(255,255,255,0.55) 0%, transparent 55%), linear-gradient(135deg, rgba(0,0,0,0.03) 0%, transparent 40%, rgba(0,0,0,0.04) 100%)`,
  };
}

export function PelliculePage({
  paper,
  ink,
  children,
  style,
}: {
  paper: string;
  ink: string;
  children: ReactNode;
  style?: object;
}) {
  const webPaper =
    Platform.OS === 'web'
      ? createElement('div', {
          'aria-hidden': true,
          style: {
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
            ...paperStyle(paper),
          },
        })
      : null;

  return (
    <View style={[styles.page, { backgroundColor: paper }, style]}>
      {webPaper}
      <View style={styles.pageInner}>
        <PelliculeFlourish color={ink} width={160} />
        <View style={{ height: 14 }} />
        {children}
        <View style={{ height: 18 }} />
        <PelliculeFlourish color={ink} width={160} />
      </View>
    </View>
  );
}

export function PelliculeSectionHeader({
  kicker,
  title,
  subtitle,
  ink,
  muted,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  ink: string;
  muted: string;
}) {
  return (
    <View style={styles.header}>
      {kicker ? <Text style={[styles.kicker, { color: ink }]}>{kicker}</Text> : null}
      <Text style={[styles.title, { color: ink }]}>{title}</Text>
      <View style={[styles.rule, { backgroundColor: ink }]} />
      {subtitle ? <Text style={[styles.subtitle, { color: muted }]}>{subtitle}</Text> : null}
    </View>
  );
}

export function PelliculeStoryItem({
  year,
  title,
  text,
  ink,
  muted,
  onPress,
}: {
  year: string;
  title: string;
  text: string;
  ink: string;
  muted: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Lire l'étape ${title}`} onPress={onPress} style={styles.story}>
      <View style={[styles.storyMark, { borderColor: ink }]}>
        <Ionicons name="film-outline" size={16} color={ink} />
      </View>
      <Text style={[styles.year, { color: ink }]}>{year}</Text>
      <Text style={[styles.storyTitle, { color: ink }]}>{title}</Text>
      <Text numberOfLines={3} style={[styles.body, { color: muted }]}>{text}</Text>
      <View style={styles.readRow}>
        <Text style={[styles.read, { color: ink }]}>Lire le récit</Text>
        <Ionicons name="chevron-forward" size={12} color={ink} />
      </View>
      <View style={[styles.itemRule, { backgroundColor: ink }]} />
    </Pressable>
  );
}

export function PelliculeProgramItem({
  time,
  title,
  place,
  icon,
  ink,
  frame,
  paper,
  muted,
}: {
  time: string;
  title: string;
  place: string;
  icon: IconName;
  ink: string;
  frame: string;
  paper: string;
  muted: string;
}) {
  return (
    <View style={styles.program}>
      <View style={[styles.frameIcon, { backgroundColor: frame }]}>
        <Ionicons name={icon} size={16} color={paper} />
      </View>
      <View style={styles.programCopy}>
        <Text style={[styles.time, { color: ink }]}>{time}</Text>
        <Text style={[styles.programTitle, { color: ink }]}>{title}</Text>
        <Text style={[styles.place, { color: muted }]}>{place}</Text>
      </View>
    </View>
  );
}

export function PelliculeVenueCard({
  venueName,
  address,
  ink,
  frame,
  paper,
  muted,
  map,
  onDirections,
}: {
  venueName: string;
  address: string;
  ink: string;
  frame: string;
  paper: string;
  muted: string;
  map?: ReactNode;
  onDirections: () => void;
}) {
  if (!address && !venueName) return null;
  return (
    <View style={styles.venue}>
      <View style={[styles.rule, { backgroundColor: ink, width: 48, marginVertical: 12 }]} />
      <Text style={[styles.kicker, { color: ink }]}>LE LIEU</Text>
      <Text style={[styles.venueName, { color: ink }]}>{venueName || 'Lieu à définir'}</Text>
      {address ? <Text style={[styles.venueAddress, { color: muted }]}>{address}</Text> : null}
      {map ? <View style={[styles.venueMap, { borderColor: frame }]}>{map}</View> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Y aller"
        onPress={onDirections}
        style={({ pressed }) => [styles.venueBtn, { backgroundColor: frame }, pressed && { opacity: 0.88 }]}
      >
        <Ionicons name="navigate-outline" size={15} color={paper} />
        <Text style={[styles.venueBtnLabel, { color: paper }]}>Y aller</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 26, paddingTop: 28, paddingBottom: 36, position: 'relative', overflow: 'hidden' },
  pageInner: { zIndex: 1, alignItems: 'center' },
  header: { alignItems: 'center', marginBottom: 10, width: '100%' },
  kicker: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 12,
    letterSpacing: 3.2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  title: {
    fontFamily: 'GreatVibes_400Regular',
    fontSize: 40,
    lineHeight: 46,
    textAlign: 'center',
    marginTop: 4,
  },
  rule: { width: 36, height: 1, marginVertical: 10, opacity: 0.75 },
  subtitle: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
  },
  story: { alignItems: 'center', paddingVertical: 16, gap: 4, width: '100%' },
  storyMark: {
    width: 40,
    height: 40,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
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
  },
  readRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  itemRule: { width: 28, height: 1, marginTop: 14 },
  program: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, width: '100%' },
  frameIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  programCopy: { flex: 1, gap: 1 },
  time: { fontFamily: 'Inter_600SemiBold', fontSize: 11, letterSpacing: 1.6 },
  programTitle: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 22, lineHeight: 26 },
  place: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 15, lineHeight: 20 },
  venue: { alignItems: 'center', marginTop: 12, gap: 6, width: '100%' },
  venueName: {
    fontFamily: 'CormorantGaramond_500Medium',
    fontSize: 28,
    lineHeight: 32,
    textAlign: 'center',
  },
  venueAddress: {
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
  },
  venueMap: {
    width: '100%',
    marginTop: 12,
    borderWidth: 2,
    overflow: 'hidden',
  },
  venueBtn: {
    marginTop: 14,
    minHeight: 44,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  venueBtnLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
});
