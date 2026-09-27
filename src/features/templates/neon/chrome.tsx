/**
 * Pages intérieures Néon — timeline or, lieu photo, détails pratiques.
 */

import { type ReactNode } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';

import type { IconName } from '@/features/templates/elegance/data';

export function NeonHeartOutline({ color, size = 220 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size * 0.92} viewBox="0 0 120 110" accessibilityElementsHidden>
      <Path
        d="M60 98
           C60 98 12 68 12 38
           C12 22 24 12 38 12
           C48 12 56 18 60 26
           C64 18 72 12 82 12
           C96 12 108 22 108 38
           C108 68 60 98 60 98Z"
        stroke={color}
        strokeWidth="1.1"
        fill="none"
        strokeLinejoin="round"
        opacity={0.28}
      />
    </Svg>
  );
}

export function NeonPage({
  paper,
  children,
  style,
}: {
  paper: string;
  children: ReactNode;
  style?: object;
}) {
  return (
    <View style={[styles.page, { backgroundColor: paper }, style]}>
      {children}
    </View>
  );
}

export function NeonSectionHeader({
  kicker,
  title,
  subtitle,
  ink,
  gold,
  muted,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  ink: string;
  gold: string;
  muted: string;
}) {
  return (
    <View style={styles.header}>
      {kicker ? <Text style={[styles.kicker, { color: gold }]}>{kicker}</Text> : null}
      <Text style={[styles.title, { color: ink }]}>{title}</Text>
      <View style={[styles.goldRule, { backgroundColor: gold }]} />
      {subtitle ? <Text style={[styles.subtitle, { color: muted }]}>{subtitle}</Text> : null}
    </View>
  );
}

export function NeonProgramItem({
  time,
  title,
  place,
  icon,
  ink,
  gold,
  muted,
  last,
}: {
  time: string;
  title: string;
  place: string;
  icon: IconName;
  ink: string;
  gold: string;
  muted: string;
  last?: boolean;
}) {
  return (
    <View style={styles.programRow}>
      <View style={styles.rail}>
        <View style={[styles.node, { borderColor: gold, backgroundColor: '#FFFFFF' }]}>
          <Ionicons name={icon} size={14} color={ink} />
        </View>
        {last ? null : <View style={[styles.railLine, { backgroundColor: gold }]} />}
      </View>
      <View style={[styles.programCopy, last && { paddingBottom: 4 }]}>
        <Text style={[styles.time, { color: gold }]}>{time}</Text>
        <Text style={[styles.programTitle, { color: ink }]}>{title}</Text>
        <Text style={[styles.place, { color: muted }]}>{place}</Text>
      </View>
    </View>
  );
}

export function NeonVenueCard({
  venueName,
  address,
  photoUri,
  ink,
  gold,
  muted,
  map,
  onDirections,
}: {
  venueName: string;
  address: string;
  photoUri?: string;
  ink: string;
  gold: string;
  muted: string;
  map?: ReactNode;
  onDirections: () => void;
}) {
  if (!address && !venueName) return null;
  return (
    <View style={styles.venue}>
      <NeonSectionHeader kicker="LE LIEU" title="The Venue" ink={ink} gold={gold} muted={muted} />
      {photoUri ? (
        <View style={styles.venuePhotoWrap}>
          <Image source={{ uri: photoUri }} style={styles.venuePhoto} resizeMode="cover" />
        </View>
      ) : null}
      <Text style={[styles.venueName, { color: ink }]}>{venueName || 'Lieu à définir'}</Text>
      {address ? <Text style={[styles.venueAddress, { color: muted }]}>{address}</Text> : null}
      {map ? <View style={styles.venueMap}>{map}</View> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Y aller"
        onPress={onDirections}
        style={({ pressed }) => [styles.venueBtn, { backgroundColor: gold }, pressed && { opacity: 0.88 }]}
      >
        <Ionicons name="navigate-outline" size={15} color="#141414" />
        <Text style={styles.venueBtnLabel}>Y aller</Text>
      </Pressable>
    </View>
  );
}

export function NeonDetailsSection({
  dress,
  transport,
  hotel,
  ink,
  gold,
  muted,
}: {
  dress?: string;
  transport?: string;
  hotel?: string;
  ink: string;
  gold: string;
  muted: string;
}) {
  const blocks = [
    dress ? { title: 'Dress code', body: dress, icon: 'shirt-outline' as const } : null,
    transport ? { title: 'Transport', body: transport, icon: 'bus-outline' as const } : null,
    hotel ? { title: 'Hébergement', body: hotel, icon: 'bed-outline' as const } : null,
  ].filter(Boolean) as { title: string; body: string; icon: keyof typeof Ionicons.glyphMap }[];

  if (blocks.length === 0) return null;

  return (
    <View style={styles.details}>
      <NeonSectionHeader kicker="INFOS" title="The Details" ink={ink} gold={gold} muted={muted} />
      {blocks.map((block) => (
        <View key={block.title} style={styles.detailBlock}>
          <View style={styles.detailHead}>
            <Ionicons name={block.icon} size={16} color={gold} />
            <Text style={[styles.detailTitle, { color: ink }]}>{block.title}</Text>
          </View>
          <Text style={[styles.detailBody, { color: muted }]}>{block.body}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 40,
  },
  header: { alignItems: 'center', marginBottom: 22, width: '100%' },
  kicker: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 3.2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  title: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 34,
    lineHeight: 40,
    textAlign: 'center',
    marginTop: 6,
  },
  goldRule: { width: 36, height: 1.5, marginTop: 12, marginBottom: 10 },
  subtitle: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
  },
  programRow: { flexDirection: 'row', width: '100%', minHeight: 78 },
  rail: { width: 36, alignItems: 'center' },
  node: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  railLine: { width: 1.5, flex: 1, marginTop: 2, marginBottom: 2, opacity: 0.85 },
  programCopy: { flex: 1, paddingLeft: 12, paddingBottom: 18 },
  time: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  programTitle: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 22,
    lineHeight: 26,
    marginTop: 2,
  },
  place: {
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: 15,
    lineHeight: 20,
    marginTop: 2,
  },
  venue: { alignItems: 'center', width: '100%', marginTop: 8 },
  venuePhotoWrap: {
    width: '100%',
    aspectRatio: 4 / 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  venuePhoto: { width: '100%', height: '100%' },
  venueName: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 26,
    lineHeight: 30,
    textAlign: 'center',
  },
  venueAddress: {
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 6,
  },
  venueMap: {
    width: '100%',
    marginTop: 14,
    overflow: 'hidden',
  },
  venueBtn: {
    marginTop: 16,
    minHeight: 46,
    paddingHorizontal: 24,
    borderRadius: 23,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  venueBtnLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#141414',
  },
  details: { width: '100%', alignItems: 'center' },
  detailBlock: { width: '100%', marginBottom: 20 },
  detailHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  detailTitle: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 20,
    lineHeight: 24,
  },
  detailBody: {
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: 16,
    lineHeight: 23,
  },
});
