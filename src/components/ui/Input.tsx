/**
 * ──────────────────────────────────────────────────────────────
 *  MK EVENTS — UI / Input
 * ──────────────────────────────────────────────────────────────
 *  Champ de saisie du design system : label, icône à gauche,
 *  action à droite (toggle œil intégré pour les mots de passe),
 *  message d'aide et affichage des erreurs.
 *
 *  `tone='dark'`  → univers Dark Luxury (connexion) ;
 *  `tone='light'` → univers clair (inscription, studio).
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

  /* Fond opaque, aligné sur la palette (studio sombre ≠ blanc + texte ivoire). */
  const fieldBackground = palette
    ? colors.surface
    : tone === 'light'
      ? '#FFFFFF'
      : colors.surface;

  const webAutofillStyle =
    Platform.OS === 'web'
      ? ({
          outlineStyle: 'none',
          outlineWidth: 0,
          boxShadow: `0 0 0 1000px ${fieldBackground} inset`,
          WebkitBoxShadow: `0 0 0 1000px ${fieldBackground} inset`,
          WebkitTextFillColor: colors.textPrimary,
          caretColor: colors.textPrimary,
        } as object)
      : null;

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
            backgroundColor: fieldBackground,
            overflow: 'hidden',
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
          {...(Platform.OS === 'web'
            ? ({ dataSet: { mkTone: tone } } as object)
            : {
                importantForAutofill: 'yes' as const,
              })}
          secureTextEntry={isSecure && !isPasswordVisible}
          underlineColorAndroid="transparent"
          style={[
            styles.input,
            {
              color: colors.textPrimary,
              fontFamily: theme.fontFamilies.sans,
              backgroundColor: fieldBackground,
            },
            webAutofillStyle,
            style as StyleProp<TextStyle>,
          ]}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.accent}
          cursorColor={colors.accent}
          keyboardAppearance={tone === 'dark' ? 'dark' : 'light'}
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
  },
  toggle: { padding: 4 },
  pressed: { opacity: 0.7 },
  message: { fontFamily: fontFamilies.sansMedium, fontSize: 12, lineHeight: 16 },
});
