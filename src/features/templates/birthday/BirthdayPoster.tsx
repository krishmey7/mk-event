/**
 * Couverture / invitation 1 page — anniversaire (maquette or & crème).
 * Décor via Iconify (cadeau, étoiles, ballons, fioritures).
 */

import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconifyIcon } from '@/components/ui/IconifyIcon';
import { fontFamilies } from '@/constants/theme';
import type { TemplateColors } from '@/features/templates/elegance/themes';

export function BirthdayPoster({
  colors,
  isDark,
  title,
  subtitle,
  ageLine,
  headline,
  scriptLine,
  dateLabel,
  timePlace,
  address,
  closing,
  celebrant,
  compact,
  style,
}: {
  colors: TemplateColors;
  isDark?: boolean;
  title: string;
  subtitle?: string;
  ageLine: string;
  headline: string;
  scriptLine?: string;
  dateLabel: string;
  timePlace?: string;
  address?: string;
  closing?: string;
  celebrant?: string;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const insets = useSafeAreaInsets();
  const gold = colors.accent;
  const pad = compact ? 20 : 28;

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.bg,
          paddingTop: compact ? pad : Math.max(insets.top, 24) + 12,
          paddingBottom: compact ? pad : Math.max(insets.bottom, 28),
          paddingHorizontal: pad,
        },
        style,
      ]}
    >
      <View style={[styles.frame, { borderColor: gold }]}>
        <View style={[styles.frameInner, { borderColor: gold }]}>
          {/* Ballons haut droite */}
          <View style={[styles.cluster, styles.clusterTop]} pointerEvents="none">
            <IconifyIcon icon="noto:balloon" size={compact ? 36 : 48} style={{ transform: [{ rotate: '12deg' }] }} />
            <IconifyIcon icon="noto:balloon" size={compact ? 28 : 38} style={{ marginLeft: -8, marginTop: 10 }} />
            <IconifyIcon icon="twemoji:heart-decoration" size={compact ? 18 : 22} style={{ marginLeft: -4 }} />
            <IconifyIcon icon="mdi:star-four-points" size={14} color={gold} style={{ position: 'absolute', right: 4, top: 8 }} />
          </View>

          {/* Ballons bas gauche */}
          <View style={[styles.cluster, styles.clusterBottom]} pointerEvents="none">
            <IconifyIcon icon="noto:balloon" size={compact ? 32 : 44} style={{ transform: [{ rotate: '-8deg' }] }} />
            <IconifyIcon icon="noto:balloon" size={compact ? 26 : 34} style={{ marginLeft: 6, marginTop: -6 }} />
            <IconifyIcon icon="mdi:star-outline" size={16} color={gold} />
          </View>

          <Text style={[styles.save, { color: colors.text }]}>{title || 'Save the Date'}</Text>
          <Text style={[styles.invite, { color: colors.textMuted }]}>
            {subtitle || 'we invite you to celebrate'}
          </Text>

          <View style={styles.giftWrap}>
            <IconifyIcon icon="ph:gift-light" size={compact ? 28 : 36} color={gold} />
          </View>

          <View style={styles.ruleRow}>
            <IconifyIcon icon="mdi:star-outline" size={10} color={gold} />
            <View style={[styles.rule, { backgroundColor: gold }]} />
            <View style={[styles.ruleDot, { backgroundColor: gold }]} />
            <View style={[styles.rule, { backgroundColor: gold }]} />
            <IconifyIcon icon="mdi:star-outline" size={10} color={gold} />
          </View>

          <Text style={[styles.age, { color: colors.text }]}>{ageLine || 'happy birthday'}</Text>
          <Text style={[styles.birthday, { color: colors.text }]}>{headline || 'birthday'}</Text>
          {scriptLine ? (
            <Text style={[styles.script, { color: gold }]}>{scriptLine}</Text>
          ) : null}
          {celebrant ? (
            <Text style={[styles.celebrant, { color: colors.textMuted }]}>{celebrant}</Text>
          ) : null}

          <View style={styles.flourishRow}>
            <IconifyIcon icon="ph:spiral-light" size={22} color={gold} />
            <View style={[styles.ruleWide, { backgroundColor: gold }]} />
            <IconifyIcon icon="ph:spiral-light" size={22} color={gold} style={{ transform: [{ scaleX: -1 }] }} />
          </View>

          <Text style={[styles.date, { color: colors.text }]}>{dateLabel}</Text>
          {timePlace ? (
            <Text style={[styles.meta, { color: colors.textMuted }]}>{timePlace}</Text>
          ) : null}
          {address ? (
            <Text style={[styles.address, { color: colors.textMuted }]}>{address}</Text>
          ) : null}
          <Text style={[styles.closing, { color: gold }]}>{closing || 'see you!'}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, minHeight: 520 },
  frame: {
    flex: 1,
    borderWidth: 1.5,
    padding: 8,
    minHeight: 480,
  },
  frameInner: {
    flex: 1,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    paddingHorizontal: 18,
    overflow: 'hidden',
  },
  cluster: { position: 'absolute', zIndex: 2, flexDirection: 'row', alignItems: 'flex-start' },
  clusterTop: { top: 8, right: 6 },
  clusterBottom: { bottom: 12, left: 6 },
  save: {
    fontFamily: fontFamilies.serifSemiBold,
    fontSize: 13,
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  invite: {
    fontFamily: fontFamilies.serif,
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },
  giftWrap: { marginTop: 14, marginBottom: 10 },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    width: '70%',
    justifyContent: 'center',
  },
  rule: { flex: 1, height: 1, maxWidth: 48 },
  ruleDot: { width: 4, height: 4, borderRadius: 2 },
  age: {
    fontFamily: fontFamilies.serif,
    fontSize: 18,
    textAlign: 'center',
    textTransform: 'lowercase',
  },
  birthday: {
    fontFamily: fontFamilies.serifSemiBold,
    fontSize: 42,
    lineHeight: 48,
    textAlign: 'center',
    textTransform: 'lowercase',
    marginTop: 2,
  },
  script: {
    fontFamily: fontFamilies.serif,
    fontSize: 22,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 2,
  },
  celebrant: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
  flourishRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 16,
    width: '78%',
  },
  ruleWide: { flex: 1, height: 1 },
  date: {
    fontFamily: fontFamilies.serifSemiBold,
    fontSize: 16,
    letterSpacing: 2,
    textAlign: 'center',
  },
  meta: {
    fontFamily: fontFamilies.serif,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
  address: {
    fontFamily: fontFamilies.serif,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  closing: {
    fontFamily: fontFamilies.serif,
    fontSize: 20,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 16,
  },
});
