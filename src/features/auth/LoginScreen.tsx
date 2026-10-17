/**
 * Connexion — Dark Luxury raffiné.
 */

import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useAuth } from '@/context/AuthContext';
import { homeAfterAuth, useActiveEvent } from '@/context/ActiveEventContext';
import { AuthShell } from './AuthShell';
import { Input } from '@/components/ui/Input';
import { ApiError } from '@/services/apiClient';
import { login } from '@/services/authService';
import { isValidIdentifier, isValidPassword } from '@/utils/validation';
import { fontFamilies, radii, spacing } from '@/constants/theme';

interface LoginFieldErrors {
  identifier?: string;
  password?: string;
}

const ACCENT = '#E07A5F';
const ON_ACCENT = '#2A1218';

export function LoginScreen() {
  const router = useRouter();

  return (
    <AuthShell
      tone="dark"
      title="Bon retour"
      subtitle="Entrez dans votre studio pour créer, peaufiner et suivre vos invitations."
      footer={
        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Pas encore de compte ?</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/register')}
            hitSlop={8}
            style={({ pressed }) => [pressed && styles.pressed]}
          >
            <Text style={styles.switchLink}>Créer un compte</Text>
          </Pressable>
        </View>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}

function LoginForm() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { syncFromServer } = useActiveEvent();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const clearFieldError = (key: keyof LoginFieldErrors) => {
    setFieldErrors((previous) => (previous[key] ? { ...previous, [key]: undefined } : previous));
  };

  const validate = (): boolean => {
    const errors: LoginFieldErrors = {};
    if (!isValidIdentifier(identifier)) {
      errors.identifier = 'Renseignez un e-mail ou un numéro de téléphone valide.';
    }
    if (!isValidPassword(password)) {
      errors.password = 'Le mot de passe doit contenir au moins 8 caractères.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    setFormError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const session = await login({ identifier: identifier.trim(), password });
      await signIn(session);
      const needsSetup = await syncFromServer();
      router.replace(homeAfterAuth(needsSetup));
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : 'Une erreur inattendue est survenue. Merci de réessayer.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {formError ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle-outline" size={18} color="#F06570" />
          <Text style={styles.errorBannerText}>{formError}</Text>
        </View>
      ) : null}

      <Input
        label="Email ou téléphone"
        leftIcon="mail-outline"
        value={identifier}
        onChangeText={(value) => {
          setIdentifier(value);
          clearFieldError('identifier');
        }}
        placeholder="sarah@exemple.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        error={fieldErrors.identifier}
        returnKeyType="next"
      />

      <Input
        label="Mot de passe"
        leftIcon="lock-closed-outline"
        value={password}
        onChangeText={(value) => {
          setPassword(value);
          clearFieldError('password');
        }}
        placeholder="••••••••"
        secureTextEntry
        autoComplete="current-password"
        error={fieldErrors.password}
        returnKeyType="done"
        onSubmitEditing={() => void handleSubmit()}
      />

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/forgot-password')}
        hitSlop={8}
        style={({ pressed }) => [styles.forgot, pressed && styles.pressed]}
      >
        <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        disabled={loading}
        onPress={() => void handleSubmit()}
        style={({ pressed }) => [styles.cta, (pressed || loading) && styles.pressed]}
      >
        {loading ? (
          <ActivityIndicator color={ON_ACCENT} />
        ) : (
          <Text style={styles.ctaLabel}>Se connecter</Text>
        )}
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(220, 53, 69, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(220, 53, 69, 0.35)',
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  errorBannerText: {
    flex: 1,
    fontFamily: fontFamilies.sansMedium,
    fontSize: 13,
    lineHeight: 18,
    color: '#F06570',
  },
  forgot: { alignSelf: 'flex-end', paddingVertical: 2, marginTop: -4 },
  forgotText: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(247, 240, 232, 0.52)',
  },
  cta: {
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  ctaLabel: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 15,
    letterSpacing: 0.3,
    color: ON_ACCENT,
  },
  switchRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', gap: 6 },
  switchText: {
    fontFamily: fontFamilies.sans,
    fontSize: 14,
    lineHeight: 19,
    color: 'rgba(247, 240, 232, 0.52)',
  },
  switchLink: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 14,
    lineHeight: 19,
    color: ACCENT,
  },
  pressed: { opacity: 0.78 },
});
