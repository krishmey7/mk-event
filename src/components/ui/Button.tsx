/**
 * ──────────────────────────────────────────────────────────────
 *  MK EVENT — UI / Button
 * ──────────────────────────────────────────────────────────────
 *  Bouton universel du design system.
 *  Variantes : primary (champagne + encre) · dark (charbon) · glass.
 *
 *  Règle n°2 : ombres uniquement via `shadows.*` (Platform.select) ;
 *  le reflet du bouton primaire est une simple vue translucide —
 *  aucune dépendance de dégradé natif requise.
 * ──────────────────────────────────────────────────────────────
 */

import { type ComponentProps } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { brandColors, darkTheme, radii, shadows } from '@/constants/theme';

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

export type ButtonVariant = 'primary' | 'dark' | 'glass';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Icône Ionicons affichée à gauche du libellé. */
  icon?: IoniconsName;
  /** Icône Ionicons affichée à droite du libellé. */
  iconRight?: IoniconsName;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

interface SizeSpec {
  paddingVertical: number;
  paddingHorizontal: number;
  fontSize: number;
  lineHeight: number;
  iconSize: number;
  minHeight: number;
}

const SIZES: Record<ButtonSize, SizeSpec> = {
  sm: { paddingVertical: 9, paddingHorizontal: 16, fontSize: 13, lineHeight: 18, iconSize: 15, minHeight: 38 },
  md: { paddingVertical: 12, paddingHorizontal: 22, fontSize: 15, lineHeight: 21, iconSize: 18, minHeight: 48 },
  lg: { paddingVertical: 15, paddingHorizontal: 30, fontSize: 16, lineHeight: 22, iconSize: 20, minHeight: 54 },
};

interface VariantSpec {
  container: ViewStyle;
  label: TextStyle;
  iconColor: string;
  spinnerColor: string;
  /** Reflet translucide du haut (primaire uniquement). */
  hasSheen?: boolean;
}

const VARIANTS: Record<ButtonVariant, VariantSpec> = {
  primary: {
    container: { backgroundColor: brandColors.gold, ...shadows.gold },
    label: { color: brandColors.ink },
    iconColor: brandColors.ink,
    spinnerColor: brandColors.ink,
    hasSheen: false,
  },
  dark: {
    container: { backgroundColor: brandColors.charcoal, ...shadows.sm },
    label: { color: '#F6F1E8' },
    iconColor: '#F6F1E8',
    spinnerColor: '#F6F1E8',
  },
  glass: {
    container: {
      backgroundColor: 'rgba(246, 241, 232, 0.06)',
      borderWidth: 1,
      borderColor: 'rgba(196, 165, 116, 0.38)',
    },
    label: { color: '#F6F1E8' },
    iconColor: brandColors.gold,
    spinnerColor: brandColors.gold,
  },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  labelStyle,
}: ButtonProps) {
  const sizeSpec = SIZES[size];
  const variantSpec = VARIANTS[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: isDisabled }}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          paddingVertical: sizeSpec.paddingVertical,
          paddingHorizontal: sizeSpec.paddingHorizontal,
          minHeight: sizeSpec.minHeight,
        },
        variantSpec.container,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {({ pressed }) => (
        <>
          <View style={styles.row}>
            {loading ? (
              <ActivityIndicator size="small" color={variantSpec.spinnerColor} style={styles.leadingIcon} />
            ) : icon ? (
              <Ionicons
                name={icon}
                size={sizeSpec.iconSize}
                color={variantSpec.iconColor}
                style={styles.leadingIcon}
              />
            ) : null}
            <Text
              style={[
                darkTheme.typography.button,
                { fontSize: sizeSpec.fontSize, lineHeight: sizeSpec.lineHeight },
                variantSpec.label,
                labelStyle,
              ]}
            >
              {label}
            </Text>
            {!loading && iconRight ? (
              <Ionicons
                name={iconRight}
                size={sizeSpec.iconSize}
                color={variantSpec.iconColor}
                style={styles.trailingIcon}
              />
            ) : null}
          </View>
          {variantSpec.hasSheen ? <View pointerEvents="none" style={styles.sheen} /> : null}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: { alignSelf: 'stretch', width: '100%' },
  pressed: { opacity: 0.88, transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.45 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  leadingIcon: { marginRight: -2 },
  trailingIcon: { marginLeft: -2 },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '52%',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderTopLeftRadius: radii.full,
    borderTopRightRadius: radii.full,
  },
});
