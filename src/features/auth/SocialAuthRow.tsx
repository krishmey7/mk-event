/**
 * Rangée sociale Google / Apple pour AuthShell.
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

  const handleApple = () => {
    onNotice(
      'Connexion Apple bientôt disponible — un compte Apple Developer est requis. Utilisez votre e-mail en attendant.',
    );
  };

  return (
    <>
      <View style={[styles.dividerRow, { maxWidth: layout.formMaxWidth }]}>
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

      <View style={[styles.socialRow, { maxWidth: layout.formMaxWidth }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={googleConfigured ? 'Continuer avec Google' : 'Google bientôt disponible'}
          accessibilityState={{ disabled: googleLoading || !googleConfigured }}
          disabled={googleLoading}
          onPress={() => void signInWithGoogle()}
          style={({ pressed }) => [
            styles.socialCircle,
            isDark ? styles.socialCircleDark : styles.socialCircleLight,
            !googleConfigured && styles.socialDisabled,
            pressed && googleConfigured && styles.pressed,
          ]}
        >
          {googleLoading ? (
            <ActivityIndicator color={isDark ? '#F7F0E8' : '#2A1F24'} />
          ) : (
            <Ionicons
              name="logo-google"
              size={22}
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
          )}
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Apple bientôt disponible"
          accessibilityState={{ disabled: true }}
          onPress={handleApple}
          style={({ pressed }) => [
            styles.socialCircle,
            isDark ? styles.socialCircleDark : styles.socialCircleLight,
            styles.socialDisabled,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="logo-apple"
            size={24}
            color={isDark ? 'rgba(247,240,232,0.35)' : 'rgba(42,31,36,0.35)'}
          />
        </Pressable>
      </View>

      <Text style={[styles.socialHint, { color: muted, maxWidth: layout.formMaxWidth }]}>
        {googleConfigured
          ? 'Apple arrive bientôt (compte Developer requis).'
          : 'Google et Apple seront activés dès la configuration OAuth. En attendant, connectez-vous par e-mail.'}
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.75 },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: spacing.lg,
  },
  divider: { flex: 1, height: StyleSheet.hairlineWidth },
  dividerText: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 12,
    lineHeight: 16,
    marginHorizontal: spacing.md,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    width: '100%',
    marginTop: spacing.md,
  },
  socialCircle: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialCircleDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  socialCircleLight: {
    backgroundColor: '#FFFCFA',
    borderWidth: 1,
    borderColor: '#E8D9CE',
  },
  socialDisabled: {
    opacity: 0.72,
  },
  socialHint: {
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: spacing.sm,
    width: '100%',
  },
});
