/**
 * MK EVENT — Logo marque.
 * Variante `gold` = champagne invitation (indépendant du coral chrome app).
 * Sur une invitation, passer `color` pour respecter le design du modèle.
 */

import {
  Platform,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { brandColors, darkTheme } from '@/constants/theme';

export type LogoSize = 'sm' | 'md' | 'lg' | 'xl';
export type LogoVariant = 'gold' | 'light' | 'ink';

export interface LogoProps {
  size?: LogoSize;
  /** Couleur : or champagne (invitations), blanc, ou encre (chrome clair). */
  variant?: LogoVariant;
  /** Surcharge monogramme — ex. or Hiver `#D4B45A` propre au modèle. */
  color?: string;
  /** Surcharge wordmark (défaut = color un peu plus profond ou goldSoft). */
  wordmarkColor?: string;
  style?: StyleProp<ViewStyle>;
}

const SIZES: Record<
  LogoSize,
  { monogram: number; wordmark: number; gap: number; tracking: number }
> = {
  sm: { monogram: 30, wordmark: 10, gap: 3, tracking: 5 },
  md: { monogram: 52, wordmark: 16, gap: 8, tracking: 10 },
  lg: { monogram: 56, wordmark: 16, gap: 8, tracking: 10 },
  xl: { monogram: 78, wordmark: 20, gap: 10, tracking: 12 },
};

export function Logo({ size = 'md', variant = 'gold', color, wordmarkColor, style }: LogoProps) {
  const spec = SIZES[size];
  const ink = variant === 'ink';
  const light = variant === 'light';
  const monoColor = color ?? (ink ? undefined : light ? undefined : brandColors.gold);
  const markColor = wordmarkColor ?? color ?? (ink ? undefined : light ? undefined : brandColors.goldSoft);

  return (
    <View style={[styles.lockup, { gap: spec.gap }, style]}>
      <Text
        style={[
          styles.monogram,
          { fontSize: spec.monogram, lineHeight: spec.monogram + 4 },
          ink && styles.monogramInk,
          light && styles.monogramLight,
          monoColor ? { color: monoColor } : null,
        ]}
      >
        MK
      </Text>
      <Text
        style={[
          styles.wordmark,
          {
            fontSize: spec.wordmark,
            lineHeight: spec.wordmark + 5,
            letterSpacing: spec.tracking,
            marginRight: -spec.tracking,
          },
          ink && styles.wordmarkInk,
          light && styles.wordmarkLight,
          markColor ? { color: markColor } : null,
        ]}
      >
        EVENT
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  lockup: { alignItems: 'center' },
  monogram: {
    fontFamily: darkTheme.fontFamilies.serifSemiBold,
    ...Platform.select<TextStyle>({ web: { fontWeight: '700' }, default: {} }),
    color: brandColors.gold,
    letterSpacing: 2,
  },
  monogramInk: { color: '#2A1F24' },
  monogramLight: { color: '#F7F0E8' },
  wordmark: {
    fontFamily: darkTheme.fontFamilies.sansSemiBold,
    textTransform: 'uppercase',
    color: brandColors.goldSoft,
  },
  wordmarkInk: { color: '#6B5560' },
  wordmarkLight: { color: 'rgba(247, 240, 232, 0.72)' },
});
