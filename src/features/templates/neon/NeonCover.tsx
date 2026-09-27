/**
 * Couverture Néon — photo plein cadre B&W, script « We Do », cœur or, bloc date.
 */

import { createElement, type ReactNode, useMemo } from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { fillGuestNameToken } from '@/features/editor/guestNameToken';
import type { Guest } from '@/features/invitation/types';
import type { TemplateColors } from '@/features/templates/elegance/themes';
import { NEON_WEDDING } from './data';

function splitCouple(couple: string): { left: string; right: string } | null {
  const parts = couple.split(/\s*&\s*/);
  if (parts.length === 2 && parts[0].trim() && parts[1].trim()) {
    return { left: parts[0].trim(), right: parts[1].trim() };
  }
  return null;
}

function parseFrenchDate(label: string): {
  month: string;
  day: string;
  year: string;
  weekday: string;
} {
  const months: Record<string, string> = {
    janvier: 'Janvier',
    février: 'Février',
    fevrier: 'Février',
    mars: 'Mars',
    avril: 'Avril',
    mai: 'Mai',
    juin: 'Juin',
    juillet: 'Juillet',
    août: 'Août',
    aout: 'Août',
    septembre: 'Septembre',
    octobre: 'Octobre',
    novembre: 'Novembre',
    décembre: 'Décembre',
    decembre: 'Décembre',
  };
  const monthIndex: Record<string, number> = {
    janvier: 0,
    février: 1,
    fevrier: 1,
    mars: 2,
    avril: 3,
    mai: 4,
    juin: 5,
    juillet: 6,
    août: 7,
    aout: 7,
    septembre: 8,
    octobre: 9,
    novembre: 10,
    décembre: 11,
    decembre: 11,
  };
  const match = label.trim().match(/^(\d{1,2})\s+([A-Za-zÀ-ÿ]+)\s+(\d{4})$/i);
  if (!match) {
    return {
      month: NEON_WEDDING.month,
      day: NEON_WEDDING.day,
      year: NEON_WEDDING.year,
      weekday: NEON_WEDDING.weekday,
    };
  }
  const day = match[1];
  const monthKey = match[2].toLowerCase();
  const year = match[3];
  const month = months[monthKey] ?? match[2];
  const mi = monthIndex[monthKey];
  const weekdays = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  let weekday: string = NEON_WEDDING.weekday;
  if (mi != null) {
    const parsed = new Date(Number(year), mi, Number(day));
    if (!Number.isNaN(parsed.getTime())) weekday = weekdays[parsed.getDay()];
  }
  return { month, day, year, weekday };
}

function GoldHeart({ color, size = 120 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 110" accessibilityElementsHidden>
      <Path
        d="M60 98
           C60 98 12 68 12 38
           C12 22 24 12 38 12
           C48 12 56 18 60 26
           C64 18 72 12 82 12
           C96 12 108 22 108 38
           C108 68 60 98 60 98Z"
        stroke={color}
        strokeWidth="1.6"
        fill="none"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CoverScrim() {
  if (Platform.OS === 'web') {
    return createElement('div', {
      'aria-hidden': true,
      style: {
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        backgroundImage: [
          'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.18) 28%, rgba(0,0,0,0.35) 58%, rgba(0,0,0,0.78) 100%)',
          'radial-gradient(ellipse 80% 50% at 50% 18%, rgba(255,255,255,0.12) 0%, transparent 70%)',
        ].join(', '),
        filter: 'grayscale(0.15)',
      },
    });
  }
  return (
    <View style={styles.nativeScrim} pointerEvents="none">
      <View style={styles.nativeScrimTop} />
      <View style={styles.nativeScrimBottom} />
    </View>
  );
}

export function NeonCover({
  colors,
  guest,
  coverUri,
  title,
  dateLabel,
  timeLabel,
  couple,
  guestSentence,
  inviteLine,
  venueStreet,
  venueCity,
  hint,
}: {
  colors: TemplateColors;
  guest: Guest;
  coverUri: string;
  title: string;
  dateLabel: string;
  timeLabel?: string;
  couple: string;
  guestSentence: string;
  inviteLine?: string;
  venueStreet?: string;
  venueCity?: string;
  hint?: ReactNode;
}) {
  const gold = colors.accent;
  const names = splitCouple(couple);
  const hero = (title || NEON_WEDDING.heroScript).trim() || NEON_WEDDING.heroScript;
  const welcome = fillGuestNameToken(guestSentence, guest.firstName).trim();
  const invite = (inviteLine || NEON_WEDDING.inviteLine).trim();
  const date = useMemo(() => parseFrenchDate(dateLabel), [dateLabel]);
  const time = (timeLabel || NEON_WEDDING.timeLabel).trim();
  const address = [venueStreet, venueCity].filter(Boolean).join(', ').toUpperCase();

  return (
    <View style={styles.fill}>
      <Image source={{ uri: coverUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <CoverScrim />

      <View style={[styles.content, { paddingBottom: hint ? 78 : 28 }]}>
        <View style={styles.heroBlock}>
          <View style={styles.heartWrap} pointerEvents="none">
            <GoldHeart color={gold} size={132} />
          </View>
          <Text style={[styles.heroScript, { color: '#FFFFFF' }]}>{hero}</Text>
        </View>

        {names ? (
          <View style={styles.namesRow}>
            <Text style={styles.name}>{names.left.toUpperCase()}</Text>
            <Text style={[styles.and, { color: gold }]}>et</Text>
            <Text style={styles.name}>{names.right.toUpperCase()}</Text>
          </View>
        ) : (
          <Text style={styles.name}>{couple.trim().toUpperCase()}</Text>
        )}

        <Text style={styles.invite}>{invite}</Text>
        {welcome ? <Text style={styles.welcome}>{welcome}</Text> : null}

        <View style={[styles.dateRule, { backgroundColor: gold }]} />

        <View style={styles.dateBlock}>
          <Text style={styles.month}>{date.month.toUpperCase()}</Text>
          <View style={styles.dateCenter}>
            <Text style={styles.weekday}>{date.weekday.toUpperCase()}</Text>
            <Text style={styles.day}>{date.day}</Text>
            <Text style={[styles.at, { color: gold }]}>À {time}</Text>
          </View>
          <Text style={styles.year}>{date.year}</Text>
        </View>

        {address ? <Text style={styles.address}>{address}</Text> : null}
      </View>

      {hint ? <View style={styles.hint}>{hint}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, overflow: 'hidden', backgroundColor: '#0A0A0A' },
  nativeScrim: { ...StyleSheet.absoluteFillObject },
  nativeScrimTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '38%',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  nativeScrimBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '48%',
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 48,
    gap: 10,
  },
  heroBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    minHeight: 110,
  },
  heartWrap: {
    position: 'absolute',
    opacity: 0.92,
  },
  heroScript: {
    fontFamily: 'GreatVibes_400Regular',
    fontSize: 78,
    lineHeight: 86,
    textAlign: 'center',
    textShadowColor: 'rgba(255,255,255,0.35)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  namesRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  name: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 22,
    letterSpacing: 3.2,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  and: {
    fontFamily: 'GreatVibes_400Regular',
    fontSize: 22,
    lineHeight: 24,
  },
  invite: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.82)',
    textAlign: 'center',
    maxWidth: 300,
    marginTop: 4,
  },
  welcome: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 15,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.78)',
    textAlign: 'center',
  },
  dateRule: {
    width: 42,
    height: 1,
    marginTop: 8,
    marginBottom: 4,
    opacity: 0.9,
  },
  dateBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    marginTop: 2,
  },
  month: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 2.4,
    color: '#FFFFFF',
    width: 72,
    textAlign: 'right',
  },
  dateCenter: { alignItems: 'center', minWidth: 88 },
  weekday: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    letterSpacing: 1.8,
    color: 'rgba(255,255,255,0.75)',
  },
  day: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 44,
    lineHeight: 46,
    color: '#FFFFFF',
  },
  at: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 1.6,
    marginTop: 2,
  },
  year: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 2.4,
    color: '#FFFFFF',
    width: 72,
    textAlign: 'left',
  },
  address: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    letterSpacing: 1.8,
    color: 'rgba(255,255,255,0.78)',
    textAlign: 'center',
    marginTop: 8,
  },
  hint: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 18,
    alignItems: 'center',
  },
});
