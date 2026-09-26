/**
 * Or métallique et pages intérieures d’Aurore — même langage que le panneau de couverture.
 */

import { createElement, type ReactNode } from 'react';
import { Platform, Image, Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { IconName } from '@/features/templates/elegance/data';

function mixHex(hex: string, toward: number, amount: number): string {
  const raw = hex.replace('#', '');
  const channels = [0, 1, 2].map((i) => parseInt(raw.slice(i * 2, i * 2 + 2), 16));
  return `#${channels
    .map((c) => Math.max(0, Math.min(255, Math.round(c + (toward - c) * amount))).toString(16).padStart(2, '0'))
    .join('')}`;
}

/**
 * Fond émeraude non plat (affiche Save the Date) — nœud DOM pour que le CSS
 * radial-gradient passe sur React Native Web.
 */
export function AuroreAtmosphere({
  panel,
  /** Couverture : halo collé au joint photo. Pages : halo centré. */
  cover = false,
}: {
  panel: string;
  cover?: boolean;
}) {
  if (Platform.OS !== 'web') return null;
  const lift = mixHex(panel, 255, 0.2);
  const mid = mixHex(panel, 255, 0.08);
  const shade = mixHex(panel, 0, 0.2);
  const deep = mixHex(panel, 0, 0.42);
  const at = cover ? '8% 32%' : '42% 28%';
  return createElement('div', {
    'aria-hidden': true,
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 0,
      pointerEvents: 'none',
      backgroundColor: panel,
      backgroundImage: [
        `radial-gradient(ellipse 130% 95% at ${at}, ${lift} 0%, ${mid} 22%, ${panel} 48%, ${shade} 76%, ${deep} 100%)`,
        `linear-gradient(180deg, ${mixHex(panel, 0, 0.12)} 0%, transparent 18%, transparent 72%, ${mixHex(panel, 0, 0.22)} 100%)`,
      ].join(', '),
    },
  });
}

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
      <AuroreAtmosphere panel={panel} />
      <View style={styles.pageInner}>
        <View style={[styles.pageRule, { backgroundColor: gold }]} />
        {children}
      </View>
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

/** Lieu + carte + bouton itinéraire, dans le langage Aurore. */
export function AuroreVenueCard({
  venueName,
  address,
  gold,
  muted,
  ink,
  map,
  onDirections,
}: {
  venueName: string;
  address: string;
  gold: string;
  muted: string;
  ink: string;
  map?: ReactNode;
  onDirections: () => void;
}) {
  if (!address && !venueName) return null;
  return (
    <View style={styles.venue}>
      <AuroreBreak gold={gold} />
      <GoldText gold={gold} style={styles.venueKicker}>LE LIEU</GoldText>
      <GoldText gold={gold} style={styles.venueName}>{venueName || 'Lieu à définir'}</GoldText>
      {address ? <Text style={[styles.venueAddress, { color: muted }]}>{address}</Text> : null}
      {map ? <View style={[styles.venueMap, { borderColor: gold }]}>{map}</View> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Y aller"
        onPress={onDirections}
        style={({ pressed }) => [
          styles.venueBtn,
          { backgroundColor: gold },
          pressed && { opacity: 0.88 },
        ]}
      >
        <Ionicons name="navigate-outline" size={15} color={ink} />
        <Text style={[styles.venueBtnLabel, { color: ink }]}>Y aller</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 26, paddingTop: 28, paddingBottom: 36, position: 'relative', overflow: 'hidden' },
  pageInner: { zIndex: 1 },
  pageRule: { alignSelf: 'center', width: 42, height: 1, marginBottom: 22, opacity: 0.9 },
  breakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 10,
    marginVertical: 12,
  },
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
  venue: { alignItems: 'center', marginTop: 20, gap: 6, width: '100%' },
  venueKicker: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 3.2,
    textAlign: 'center',
    marginTop: 4,
  },
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
    paddingHorizontal: 8,
  },
  venueMap: {
    width: '100%',
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 2,
    overflow: 'hidden',
  },
  venueBtn: {
    marginTop: 14,
    minHeight: 44,
    paddingHorizontal: 22,
    borderRadius: 2,
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
