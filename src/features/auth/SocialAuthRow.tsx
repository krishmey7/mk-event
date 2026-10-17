/**
 * Connexion Google — bouton pleine largeur, sous le formulaire e-mail.
 */

import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { fontFamilies, layout, spacing } from '@/constants/theme';
import { useGoogleSignIn } from './useGoogleSignIn';

interface SocialAuthRowProps {
  isDark: boolean;
  muted: string;
  onNotice: (message: string) => void;
}

export function SocialAuthRow({ isDark, muted, onNotice }: SocialAuthRowProps) {
  const { signInWithGoogle, googleLoading, googleConfigured } = useGoogleSignIn(onNotice);

  return (
    <View style={[styles.wrap, { maxWidth: layout.formMaxWidth }]}>
      {googleConfigured ? (
        <View style={styles.dividerRow}>
          <View
            style={[
              styles.divider,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E8D9CE' },
            ]}
          />
          <Text style={[styles.dividerText, { color: muted }]}>ou</Text>
          <View
            style={[
              styles.divider,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E8D9CE' },
            ]}
          />
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={googleConfigured ? 'Continuer avec Google' : 'Google bientôt disponible'}
        accessibilityState={{ disabled: googleLoading || !googleConfigured }}
        disabled={googleLoading || !googleConfigured}
        onPress={() => void signInWithGoogle()}
        style={({ pressed }) => [
          styles.googleBtn,
          isDark ? styles.googleBtnDark : styles.googleBtnLight,
          !googleConfigured && styles.disabled,
          pressed && googleConfigured && styles.pressed,
        ]}
      >
        {googleLoading ? (
          <ActivityIndicator color={isDark ? '#F7F0E8' : '#2A1F24'} />
        ) : (
          <>
            <Ionicons
              name="logo-google"
              size={18}
              color={
                googleConfigured
                  ? isDark
                    ? '#F7F0E8'
                    : '#2A1F24'
                  : isDark
                    ? 'rgba(247,240,232,0.35)'
                    : 'rgba(42,31,36,0.35)'
              }
            />
            <Text
              style={[
                styles.googleLabel,
                {
                  color: googleConfigured
                    ? isDark
                      ? '#F7F0E8'
                      : '#2A1F24'
                    : isDark
                      ? 'rgba(247,240,232,0.4)'
                      : 'rgba(42,31,36,0.4)',
                },
              ]}
            >
              Continuer avec Google
            </Text>
          </>
        )}
      </Pressable>

      {!googleConfigured ? (
        <Text style={[styles.hint, { color: muted }]}>
          Google sera activé dès la configuration OAuth. En attendant, connectez-vous par e-mail.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  googleBtn: {
    minHeight: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  googleBtnDark: {
    backgroundColor: 'rgba(247, 240, 232, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(247, 240, 232, 0.16)',
  },
  googleBtnLight: {
    backgroundColor: '#FFFCFA',
    borderWidth: 1,
    borderColor: '#E8D9CE',
  },
  googleLabel: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  disabled: { opacity: 0.7 },
  pressed: { opacity: 0.78 },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  divider: { flex: 1, height: StyleSheet.hairlineWidth },
  dividerText: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 12,
    lineHeight: 16,
    marginHorizontal: spacing.md,
    letterSpacing: 0.2,
  },
  hint: {
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    width: '100%',
  },
});
