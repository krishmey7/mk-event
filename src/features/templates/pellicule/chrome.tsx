/**
 * Ornements et pages intérieures Pellicule — papier, cadres, filets calligraphiés.
 */

import { createElement, type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';

import type { IconName } from '@/features/templates/elegance/data';

/** Volute calligraphiée symétrique — calquée sur l’affiche Lydia & Hector. */
export function PelliculeFlourish({ color, width = 240 }: { color: string; width?: number }) {
  const h = Math.round(width * 0.2);
  return (
    <Svg width={width} height={h} viewBox="0 0 320 64" accessibilityElementsHidden>
      {/* Branche gauche : pointe → boucles → centre */}
      <Path
        d="M14 32
           C34 32 42 32 52 32
           C62 18 78 14 86 26
           C90 34 82 40 74 36
           C68 32 72 26 80 28
           C96 32 104 48 120 44
           C132 40 130 24 118 26
           C110 28 114 36 126 36
           C140 36 148 22 160 28"
        stroke={color}
        strokeWidth="1.15"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Branche droite (miroir) */}
      <Path
        d="M306 32
           C286 32 278 32 268 32
           C258 18 242 14 234 26
           C230 34 238 40 246 36
           C252 32 248 26 240 28
           C224 32 216 48 200 44
           C188 40 190 24 202 26
           C210 28 206 36 194 36
           C180 36 172 22 160 28"
        stroke={color}
        strokeWidth="1.15"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Fleur centrale à quatre boucles */}
      <Path
        d="M160 32
           C160 20 146 14 144 24
           C142 32 154 36 160 32
           C160 20 174 14 176 24
           C178 32 166 36 160 32
           C148 32 142 44 152 46
           C160 48 164 38 160 32
           C172 32 178 44 168 46
           C160 48 156 38 160 32"
        stroke={color}
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Accents intérieurs des boucles latérales */}
      <Path
        d="M74 30 C70 22 80 20 82 28 M246 30 C250 22 240 20 238 28
           M118 32 C114 40 124 42 126 34 M202 32 C206 40 196 42 194 34"
        stroke={color}
        strokeWidth="0.85"
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function mixHex(hex: string, toward: number, amount: number): string {
  const raw = hex.replace('#', '');
  const channels = [0, 1, 2].map((i) => parseInt(raw.slice(i * 2, i * 2 + 2), 16));
  return `#${channels
    .map((c) => Math.max(0, Math.min(255, Math.round(c + (toward - c) * amount))).toString(16).padStart(2, '0'))
    .join('')}`;
}

/** Fond sombre non plat : halo plus clair au centre, coins plus profonds. */
export function pelliculeAtmosphere(panel: string): Record<string, string> {
  if (Platform.OS !== 'web') return { backgroundColor: panel };
  const lift = mixHex(panel, 255, 0.16);
  const mid = mixHex(panel, 255, 0.06);
  const deep = mixHex(panel, 0, 0.28);
  return {
    backgroundColor: panel,
    backgroundImage: [
      `radial-gradient(ellipse 120% 90% at 58% 32%, ${lift} 0%, ${mid} 28%, ${panel} 55%, ${deep} 100%)`,
      `linear-gradient(180deg, ${mixHex(panel, 0, 0.12)} 0%, transparent 20%, transparent 75%, ${mixHex(panel, 0, 0.2)} 100%)`,
    ].join(', '),
  };
}

function paperStyle(paper: string) {
  return pelliculeAtmosphere(paper);
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
