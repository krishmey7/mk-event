/**
 * ──────────────────────────────────────────────────────────────
 *  MK EVENT — UI / Logo
 * ──────────────────────────────────────────────────────────────
 *  Monogramme vertical de la marque (identité maquette) :
 *  • « MK » : serif doré #C4A574, très grand corps (30 → 56 px
 *    selon la variante), lettres espacées (letterSpacing 2) ;
 *  • « E V E N T » : capitales champagne #C4A574, letterSpacing
 *    très prononcé (5 → 10), calé sur la largeur optique du
 *    monogramme.
 *  Conteneur centré (alignItems: 'center'). Sur la landing, le
 *  header réserve au logo une zone verticale généreuse
 *  (paddingTop ≈ 48 px sous la barre d'état).
 * ──────────────────────────────────────────────────────────────
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
  /** Couleur : or (invitations), blanc, ou encre (chrome clair). */
  variant?: LogoVariant;
  style?: StyleProp<ViewStyle>;
}

const SIZES: Record<
  LogoSize,
  { monogram: number; wordmark: number; gap: number; tracking: number }
> = {
  sm: { monogram: 30, wordmark: 10, gap: 3, tracking: 5 },
  md: { monogram: 52, wordmark: 16, gap: 8, tracking: 10 },
  lg: { monogram: 56, wordmark: 16, gap: 8, tracking: 10 },
  /* Landing — marque dominante. */
  xl: { monogram: 78, wordmark: 20, gap: 10, tracking: 12 },
};

export function Logo({ size = 'md', variant = 'gold', style }: LogoProps) {
  const spec = SIZES[size];
  const ink = variant === 'ink';
  const light = variant === 'light';

  return (
    <View style={[styles.lockup, { gap: spec.gap }, style]}>
      <Text
        style={[
          styles.monogram,
          { fontSize: spec.monogram, lineHeight: spec.monogram + 4 },
          ink && styles.monogramInk,
          light && styles.monogramLight,
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
  monogramInk: { color: '#15181E' },
  monogramLight: { color: '#F2F4F7' },
  wordmark: {
    fontFamily: darkTheme.fontFamilies.sansSemiBold,
    textTransform: 'uppercase',
    color: brandColors.goldSoft,
  },
  wordmarkInk: { color: '#5A6270' },
  wordmarkLight: { color: 'rgba(242, 244, 247, 0.72)' },
});
