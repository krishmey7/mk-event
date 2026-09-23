/**
 * MK Events — Logo marque (PNG).
 * - `light` : crème (fonds sombres)
 * - `ink`   : coral (pages claires uniquement)
 * - `gold` / color : lockup typographique pour les invitations
 */

import {
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
  type ImageStyle,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { brandColors, darkTheme } from '@/constants/theme';

const LOGO_CREAM = require('../../../assets/brand/mk-events-wordmark-cream.png');
const LOGO_CORAL = require('../../../assets/brand/mk-events-wordmark-coral.png');

export type LogoSize = 'sm' | 'md' | 'lg' | 'xl';
export type LogoVariant = 'gold' | 'light' | 'ink';

export interface LogoProps {
  size?: LogoSize;
  /** Crème sur fond sombre, coral sur page claire, or pour invitations. */
  variant?: LogoVariant;
  /** Surcharge monogramme — ex. or Hiver `#D4B45A` propre au modèle. */
  color?: string;
  /** Surcharge wordmark (défaut = color un peu plus profond ou goldSoft). */
  wordmarkColor?: string;
  style?: StyleProp<ViewStyle>;
}

const IMAGE_HEIGHT: Record<LogoSize, number> = {
  sm: 36,
  md: 56,
  lg: 68,
  xl: 92,
};

/** Ratio approx. après trim des PNG wordmark. */
const IMAGE_ASPECT = 1020 / 720;

const TYPE_SIZES: Record<
  LogoSize,
  { monogram: number; wordmark: number; gap: number; tracking: number }
> = {
  sm: { monogram: 30, wordmark: 10, gap: 3, tracking: 5 },
  md: { monogram: 52, wordmark: 16, gap: 8, tracking: 10 },
  lg: { monogram: 56, wordmark: 16, gap: 8, tracking: 10 },
  xl: { monogram: 78, wordmark: 20, gap: 10, tracking: 12 },
};

export function Logo({ size = 'md', variant = 'light', color, wordmarkColor, style }: LogoProps) {
  const useBrandPng = !color && !wordmarkColor && variant !== 'gold';

  if (useBrandPng) {
    const height = IMAGE_HEIGHT[size];
    const width = Math.round(height * IMAGE_ASPECT);
    return (
      <View style={[styles.imageWrap, style]}>
        <Image
          source={variant === 'ink' ? LOGO_CORAL : LOGO_CREAM}
          style={{ width, height } as ImageStyle}
          resizeMode="contain"
          accessibilityLabel="MK Events"
        />
      </View>
    );
  }

  return (
    <TypographicLogo
      size={size}
      variant={variant}
      color={color}
      wordmarkColor={wordmarkColor}
      style={style}
    />
  );
}

function TypographicLogo({
  size = 'md',
  variant = 'gold',
  color,
  wordmarkColor,
  style,
}: LogoProps) {
  const spec = TYPE_SIZES[size];
  const ink = variant === 'ink';
  const light = variant === 'light';
  const monoColor = color ?? (ink || light ? undefined : brandColors.gold);
  const markColor =
    wordmarkColor ?? color ?? (ink || light ? undefined : brandColors.goldSoft);

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
        EVENTS
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  imageWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
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
