/**
 * CTA landing — mouvement Edulex au survol :
 * scale 1.05 + halo coloré qui s’élargit (200ms).
 */

import { useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { landingFonts } from '../landingFonts';
import { LANDING } from '../landingTokens';

type Variant = 'coral' | 'white' | 'ink' | 'ghost';

const GLOW = {
  coral: {
    rest: '0 10px 28px rgba(180, 85, 63, 0.32)',
    hover: '0 18px 52px rgba(180, 85, 63, 0.52)',
  },
  white: {
    rest: '0 8px 24px rgba(42, 31, 36, 0.1)',
    hover: '0 14px 36px rgba(42, 31, 36, 0.16)',
  },
  ink: {
    rest: '0 10px 28px rgba(42, 31, 36, 0.22)',
    hover: '0 16px 44px rgba(42, 31, 36, 0.32)',
  },
  ghost: {
    rest: '0 8px 24px rgba(12, 7, 12, 0.16)',
    hover: '0 14px 36px rgba(12, 7, 12, 0.3)',
  },
} as const;

export function LandingCta({
  label,
  onPress,
  variant = 'coral',
  withArrow,
  compact,
  accessibilityLabel,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: Variant;
  withArrow?: boolean;
  compact?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const arrowX = useRef(new Animated.Value(0)).current;
  const isWeb = Platform.OS === 'web';

  const animateNative = (nextScale: number, nextArrow: number) => {
    if (isWeb) return;
    Animated.parallel([
      Animated.timing(scale, {
        toValue: nextScale,
        duration: 200,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
      Animated.timing(arrowX, {
        toValue: nextArrow,
        duration: 200,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const shell =
    variant === 'white'
      ? styles.shellWhite
      : variant === 'ink'
        ? styles.shellInk
        : variant === 'ghost'
          ? styles.shellGhost
          : styles.shellCoral;
  const labelStyle =
    variant === 'white'
      ? styles.labelDark
      : variant === 'ink' || variant === 'ghost'
        ? styles.labelInk
        : styles.labelLight;

  const webScale = pressed ? 0.97 : hovered ? 1.05 : 1;
  const webLift = pressed ? 0 : hovered ? -2 : 0;
  const glow = GLOW[variant];
  const arrowColor = variant === 'white' ? LANDING.plum : '#FFFFFF';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      hitSlop={compact ? 6 : undefined}
      onHoverIn={() => {
        setHovered(true);
        animateNative(1.05, 4);
      }}
      onHoverOut={() => {
        setHovered(false);
        animateNative(1, 0);
      }}
      onPressIn={() => {
        setPressed(true);
        animateNative(0.97, 2);
      }}
      onPressOut={() => {
        setPressed(false);
        animateNative(hovered ? 1.05 : 1, hovered ? 4 : 0);
      }}
    >
      <Animated.View
        style={[
          styles.shell,
          shell,
          compact && styles.shellCompact,
          style,
          isWeb
            ? ({
                transition:
                  'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease',
                transform: `translateY(${webLift}px) scale(${webScale})`,
                boxShadow: hovered || pressed ? glow.hover : glow.rest,
                willChange: 'transform, box-shadow',
              } as object)
            : { transform: [{ scale }] },
        ]}
      >
        <Text style={[styles.label, labelStyle, compact && styles.labelCompact]}>{label}</Text>
        {withArrow ? (
          <Animated.View
            style={[
              styles.arrow,
              isWeb
                ? ({
                    transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: `translateX(${hovered || pressed ? 4 : 0}px)`,
                  } as object)
                : { transform: [{ translateX: arrowX }] },
            ]}
          >
            <Ionicons
              name="arrow-forward"
              size={compact ? 14 : 16}
              color={arrowColor}
            />
          </Animated.View>
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shell: {
    minHeight: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 26,
  },
  shellCompact: {
    minHeight: 40,
    paddingHorizontal: 14,
  },
  shellCoral: {
    backgroundColor: LANDING.coralDeep,
    ...(Platform.OS !== 'web'
      ? {
          shadowColor: LANDING.coralDeep,
          shadowOpacity: 0.45,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 8 },
          elevation: 4,
        }
      : null),
  },
  shellWhite: {
    backgroundColor: '#FFFFFF',
  },
  shellInk: {
    backgroundColor: LANDING.text,
  },
  shellGhost: {
    backgroundColor: 'rgba(255, 249, 245, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 249, 245, 0.38)',
  },
  label: {
    ...landingFonts.semibold,
    fontSize: 15,
  },
  labelCompact: {
    fontSize: 13,
  },
  labelLight: {
    color: '#FFFFFF',
  },
  labelDark: {
    color: LANDING.plum,
  },
  labelInk: {
    color: '#FFFFFF',
  },
  arrow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
