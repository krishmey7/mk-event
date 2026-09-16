/**
 * Chrome des pages invité du modèle Hiver — fond, décors, timeline centrée.
 */

import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Polygon } from 'react-native-svg';

import type { IconName } from '@/features/templates/elegance/data';
import type { TemplateColors } from '@/features/templates/elegance/themes';
import { SnowflakeSvg, WinterPageDecor } from './WinterArt';
import { WinterHexThumb } from './WinterPhotoFrames';

export function WinterPage({
  colors,
  children,
  style,
}: {
  colors: TemplateColors;
  children: ReactNode;
  style?: object;
}) {
  return (
    <View style={[styles.page, { backgroundColor: colors.bg }, style]}>
      <WinterPageDecor gold={colors.accent} frost={colors.textMuted} />
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

/** Séparateur moderne & discret — transition entre sections (pas un cadre). */
export function WinterSectionDivider({ gold, frost }: { gold: string; frost: string }) {
  return (
    <View style={styles.divider} pointerEvents="none">
      <View style={[styles.dividerLine, { backgroundColor: `${gold}66` }]} />
      <View style={[styles.dividerDot, { borderColor: `${gold}AA`, backgroundColor: `${frost}22` }]}>
        <Svg width={10} height={10} viewBox="0 0 10 10">
          <Polygon points="5,1 9,5 5,9 1,5" fill="none" stroke={gold} strokeWidth={0.9} opacity={0.75} />
        </Svg>
      </View>
      <View style={[styles.dividerLine, { backgroundColor: `${gold}66` }]} />
    </View>
  );
}

export function WinterSectionHeader({
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
    <View style={styles.header}>
      {kicker ? (
        <Text style={[styles.kicker, { color: colors.textMuted }]}>{kicker}</Text>
      ) : null}
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
      ) : null}
      <View style={[styles.rule, { backgroundColor: colors.accent }]} />
    </View>
  );
}

export function WinterFlora({ colors }: { colors: TemplateColors }) {
  return (
    <View style={styles.flora} pointerEvents="none">
      <SnowflakeSvg color={colors.textMuted} size={18} />
      <SnowflakeSvg color={colors.accent} size={28} />
      <SnowflakeSvg color={colors.textMuted} size={16} />
    </View>
  );
}

export function WinterIconBubble({
  name,
  colors,
  size = 44,
}: {
  name: IconName;
  colors: TemplateColors;
  size?: number;
}) {
  return (
    <View
      style={[
        styles.iconHex,
        {
          width: size,
          height: size,
          borderColor: colors.accent,
          backgroundColor: colors.chip,
        },
      ]}
    >
      <View style={styles.iconInner}>
        <Ionicons name={name} size={size * 0.42} color={colors.accent} />
      </View>
    </View>
  );
}

export function WinterStoryItem({
  colors,
  imageUri,
  year,
  title,
  text,
  last,
  onPress,
}: {
  colors: TemplateColors;
  imageUri: string;
  year: string;
  title: string;
  text: string;
  last: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Lire l'étape ${title}`}
      onPress={onPress}
      style={({ pressed }) => [styles.centerItem, pressed && { opacity: 0.85 }]}
    >
      <WinterHexThumb uri={imageUri} gold={colors.accent} size={52} />
      <Text style={[styles.itemYear, { color: colors.accent }]}>{year}</Text>
      <Text style={[styles.itemTitle, { color: colors.text }]}>{title}</Text>
      <Text numberOfLines={2} style={[styles.itemText, { color: colors.textMuted }]}>
        {text}
      </Text>
      <View style={styles.readRow}>
        <Text style={[styles.readLabel, { color: colors.accent }]}>Lire le récit</Text>
        <Ionicons name="chevron-forward" size={13} color={colors.accent} />
      </View>
      {last ? null : (
        <View style={[styles.connector, { backgroundColor: colors.accent }]} />
      )}
    </Pressable>
  );
}

export function WinterProgramItem({
  colors,
  icon,
  time,
  title,
  place,
  last,
}: {
  colors: TemplateColors;
  icon: IconName;
  time: string;
  title: string;
  place: string;
  last: boolean;
}) {
  return (
    <View style={styles.centerItem}>
      <WinterIconBubble name={icon} colors={colors} />
      <Text style={[styles.itemYear, { color: colors.accent }]}>{time}</Text>
      <Text style={[styles.itemTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.itemText, { color: colors.textMuted }]}>{place}</Text>
      {last ? null : (
        <View style={[styles.connector, { backgroundColor: colors.accent }]} />
      )}
    </View>
  );
}

export function WinterVenueCard({
  colors,
  venueName,
  address,
  onDirections,
}: {
  colors: TemplateColors;
  venueName: string;
  address: string;
  onDirections: () => void;
}) {
  return (
    <View style={[styles.venueCard, { backgroundColor: colors.surface, borderColor: `${colors.accent}88` }]}>
      <WinterIconBubble name="snow-outline" colors={colors} size={48} />
      <Text style={[styles.venueKicker, { color: colors.textMuted }]}>LE LIEU</Text>
      <Text style={[styles.venueName, { color: colors.text }]}>{venueName}</Text>
      <Text style={[styles.venueAddress, { color: colors.textMuted }]}>{address}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Voir l'itinéraire"
        onPress={onDirections}
        style={({ pressed }) => [
          styles.venueBtn,
          { backgroundColor: colors.accent },
          pressed && { opacity: 0.88 },
        ]}
      >
        <View style={styles.venueBtnInner}>
          <Ionicons name="navigate-outline" size={15} color={colors.onPrimary} />
          <Text style={[styles.venueBtnLabel, { color: colors.onPrimary }]}>Voir l'itinéraire</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { position: 'relative' },
  inner: {
    width: '100%',
    paddingHorizontal: 22,
    paddingVertical: 34,
    zIndex: 1,
    alignItems: 'stretch',
  },
  divider: {
    width: '42%',
    maxWidth: 140,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 2,
  },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth },
  dividerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: { alignItems: 'center', gap: 7, marginBottom: 22, width: '100%' },
  kicker: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    letterSpacing: 3.2,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12.5,
    lineHeight: 18,
    textAlign: 'center',
    maxWidth: 280,
  },
  rule: { width: 42, height: 1, marginTop: 6, opacity: 0.85 },
  flora: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    marginTop: 12,
    opacity: 0.7,
  },
  iconHex: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    transform: [{ rotate: '30deg' }],
  },
  iconInner: { transform: [{ rotate: '-30deg' }] },
  centerItem: {
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 300,
    paddingBottom: 8,
    gap: 4,
  },
  itemYear: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    letterSpacing: 1.6,
    marginTop: 8,
    textAlign: 'center',
  },
  itemTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    textAlign: 'center',
  },
  itemText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    alignSelf: 'center',
    maxWidth: 260,
  },
  readRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    marginTop: 4,
  },
  readLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  connector: {
    width: 1,
    height: 28,
    opacity: 0.45,
    marginTop: 12,
    marginBottom: 4,
    alignSelf: 'center',
  },
  venueCard: {
    width: '100%',
    maxWidth: 300,
    alignSelf: 'center',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    gap: 8,
    marginTop: 18,
  },
  venueKicker: {
    fontFamily: 'Inter_500Medium',
    fontSize: 9,
    letterSpacing: 2.6,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  venueName: {
    fontFamily: 'Fraunces_500Medium',
    fontSize: 18,
    textAlign: 'center',
  },
  venueAddress: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  venueBtn: {
    width: '100%',
    minHeight: 46,
    borderRadius: 999,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  venueBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  venueBtnLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13.5,
    textAlign: 'center',
  },
});
