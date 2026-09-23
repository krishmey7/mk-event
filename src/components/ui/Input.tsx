/**
 * ──────────────────────────────────────────────────────────────
 *  MK EVENTS — UI / Input
 * ──────────────────────────────────────────────────────────────
 *  Champ de saisie du design system : label, icône à gauche,
 *  action à droite (toggle œil intégré pour les mots de passe),
 *  message d'aide et affichage des erreurs.
 *
 *  `tone='dark'`  → univers Dark Luxury (connexion, inscription) ;
 *  `tone='light'` → univers Clean & Editorial (futurs formulaires
 *  du dashboard organisateur).
 *
 *  Règle n°2 : les anneaux de focus / erreur sont isolés via
 *  Platform.select (boxShadow web · shadow + elevation natif).
 * ──────────────────────────────────────────────────────────────
 */

import { type ComponentProps, useState, type ReactNode } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { darkTheme, fontFamilies, lightTheme, radii, type AppTheme } from '@/constants/theme';

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

export interface InputProps extends TextInputProps {
  label?: string;
  /** Icône Ionicons à gauche du champ. */
  leftIcon?: IoniconsName;
  /** Message d'erreur — passe la bordure en rouge et masque l'aide. */
  error?: string | null;
  /** Texte d'aide sous le champ (si aucune erreur). */
  helperText?: string | null;
  /** Élément libre à droite (prioritaire sur le toggle œil). */
  rightElement?: ReactNode;
  /** Affiche l'œil afficher/masquer quand `secureTextEntry` est actif (défaut : true). */
  showPasswordToggle?: boolean;
  tone?: 'dark' | 'light';
  /** Remplace les couleurs du tone (studio d’édition thématisé). */
  palette?: {
    surface: string;
    border: string;
    textPrimary: string;
    textMuted: string;
    accent: string;
  };
  containerStyle?: StyleProp<ViewStyle>;
}

/** Anneau de focus doré — isolé par plateforme (règle n°2). */
const focusRing = Platform.select<ViewStyle>({
  web: { boxShadow: '0 0 0 3px rgba(196, 165, 116, 0.22)' },
  default: {
    shadowColor: '#C4A574',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 1,
  },
});

const errorRing = Platform.select<ViewStyle>({
  web: { boxShadow: '0 0 0 3px rgba(164, 90, 69, 0.18)' },
  default: {
    shadowColor: '#A45A45',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 1,
  },
});

export function Input({
  label,
  leftIcon,
  error,
  helperText,
  rightElement,
  showPasswordToggle = true,
  tone = 'dark',
  palette,
  containerStyle,
  style,
  onFocus,
  onBlur,
  secureTextEntry,
  ...textInputProps
}: InputProps) {
  const theme: AppTheme = tone === 'light' ? lightTheme : darkTheme;
  const colors = palette
    ? {
        ...theme.colors,
        surface: palette.surface,
        border: palette.border,
        textPrimary: palette.textPrimary,
        textMuted: palette.textMuted,
        accent: palette.accent,
      }
    : theme.colors;

  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const hasError = Boolean(error);
  const isSecure = Boolean(secureTextEntry);
  const showToggle = isSecure && showPasswordToggle && !rightElement;
  const errorMessageColor = tone === 'dark' ? '#F06570' : '#A45A45';

  const borderColor = hasError
    ? theme.semantic.danger
    : isFocused
      ? colors.accent
      : colors.border;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text style={[theme.typography.caption, { color: colors.textMuted }]}>{label}</Text>
      ) : null}

      <View
        style={[
          styles.field,
          {
            borderColor,
            backgroundColor: tone === 'dark' ? 'rgba(255, 255, 255, 0.045)' : colors.surface,
          },
          isFocused && !hasError && focusRing,
          hasError && isFocused && errorRing,
        ]}
      >
        {leftIcon ? (
          <Ionicons
            name={leftIcon}
            size={19}
            color={hasError ? errorMessageColor : isFocused ? colors.accent : colors.textMuted}
          />
        ) : null}

        <TextInput
          {...textInputProps}
          secureTextEntry={isSecure && !isPasswordVisible}
          style={[
            styles.input,
            { color: colors.textPrimary, fontFamily: theme.fontFamilies.sans },
            style as StyleProp<TextStyle>,
          ]}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.accent}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
        />

        {rightElement ? (
          rightElement
        ) : showToggle ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              isPasswordVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
            }
            onPress={() => setIsPasswordVisible((visible) => !visible)}
            hitSlop={8}
            style={({ pressed }) => [styles.toggle, pressed && styles.pressed]}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
        ) : null}
      </View>

      {hasError ? (
        <Text style={[styles.message, { color: errorMessageColor }]}>{error}</Text>
      ) : helperText ? (
        <Text style={[styles.message, { color: colors.textMuted }]}>{helperText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: 16,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 14,
    backgroundColor: 'transparent',
    ...(Platform.OS === 'web'
      ? ({
          outlineStyle: 'none',
          outlineWidth: 0,
          // Autofill Chrome : évite le rectangle blanc tant que le CSS global charge.
          boxShadow: '0 0 0 1000px transparent inset',
        } as object)
      : null),
  },
  toggle: { padding: 4 },
  pressed: { opacity: 0.7 },
  message: { fontFamily: fontFamilies.sansMedium, fontSize: 12, lineHeight: 16 },
});
