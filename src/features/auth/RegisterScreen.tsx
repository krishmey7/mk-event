/**
 * Inscription — charte atelier (brume + eucalyptus).
 */

import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useAuth } from '@/context/AuthContext';
import { AuthShell, useAuthNotice } from './AuthShell';
import { Input } from '@/components/ui/Input';
import { ApiError } from '@/services/apiClient';
import { register } from '@/services/authService';
import {
  isValidEmail,
  isValidFullName,
  isValidPassword,
  passwordsMatch,
} from '@/utils/validation';
import { fontFamilies, radii, shadows, spacing } from '@/constants/theme';

interface RegisterFieldErrors {
  full_name?: string;
  email?: string;
  password?: string;
  password_confirm?: string;
}

const ACCENT = '#2F6F69';
const ON_ACCENT = '#FFFFFF';

export function RegisterScreen() {
  const router = useRouter();

  return (
    <AuthShell
      tone="light"
      title="Créer un compte"
      subtitle="Rejoignez MK Event et lancez votre première invitation."
      footer={
        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Déjà un compte ?</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/login')}
            hitSlop={8}
            style={({ pressed }) => [pressed && styles.pressed]}
          >
            <Text style={styles.switchLink}>Se connecter</Text>
          </Pressable>
        </View>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}

function RegisterForm() {
  const router = useRouter();
  const { signIn } = useAuth();
  const showNotice = useAuthNotice();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const clearFieldError = (key: keyof RegisterFieldErrors) => {
    setFieldErrors((previous) => (previous[key] ? { ...previous, [key]: undefined } : previous));
  };

  const toggleTerms = () => {
    setAcceptedTerms((accepted) => !accepted);
    setTermsError(null);
  };

  const validate = (): boolean => {
    const errors: RegisterFieldErrors = {};
    if (!isValidFullName(fullName)) {
      errors.full_name = 'Indiquez votre nom complet (2 caractères minimum).';
    }
    if (!isValidEmail(email)) {
      errors.email = 'Adresse e-mail invalide.';
    }
    if (!isValidPassword(password)) {
      errors.password = 'Le mot de passe doit contenir au moins 8 caractères.';
    }
    if (!passwordsMatch(password, confirmPassword)) {
      errors.password_confirm = 'Les mots de passe ne correspondent pas.';
    }
    setFieldErrors(errors);

    let isValid = Object.keys(errors).length === 0;
    if (!acceptedTerms) {
      setTermsError('Acceptez les Conditions d’utilisation pour continuer.');
      isValid = false;
    }
    return isValid;
  };

  const handleSubmit = async () => {
    setFormError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const session = await register({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        password_confirm: confirmPassword,
      });
      await signIn(session);
      router.replace('/dashboard');
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
          <Ionicons name="alert-circle-outline" size={18} color="#A45A45" />
          <Text style={styles.errorBannerText}>{formError}</Text>
        </View>
      ) : null}

      <Input
        label="Nom complet"
        leftIcon="person-outline"
        tone="light"
        value={fullName}
        onChangeText={(value) => {
          setFullName(value);
          clearFieldError('full_name');
        }}
        placeholder="Sarah Morgan"
        autoCapitalize="words"
        autoComplete="name"
        error={fieldErrors.full_name}
        returnKeyType="next"
      />

      <Input
        label="Adresse e-mail"
        leftIcon="mail-outline"
        tone="light"
        value={email}
        onChangeText={(value) => {
          setEmail(value);
          clearFieldError('email');
        }}
        placeholder="sarah@exemple.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        error={fieldErrors.email}
        returnKeyType="next"
      />

      <Input
        label="Mot de passe"
        leftIcon="lock-closed-outline"
        tone="light"
        value={password}
        onChangeText={(value) => {
          setPassword(value);
          clearFieldError('password');
        }}
        placeholder="••••••••"
        secureTextEntry
        autoComplete="new-password"
        helperText="8 caractères minimum."
        error={fieldErrors.password}
        returnKeyType="next"
      />

      <Input
        label="Confirmer le mot de passe"
        leftIcon="shield-checkmark-outline"
        tone="light"
        value={confirmPassword}
        onChangeText={(value) => {
          setConfirmPassword(value);
          clearFieldError('password_confirm');
        }}
        placeholder="••••••••"
        secureTextEntry
        autoComplete="new-password"
        error={fieldErrors.password_confirm}
        returnKeyType="done"
        onSubmitEditing={() => void handleSubmit()}
      />

      <View style={styles.consentRow}>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: acceptedTerms }}
          onPress={toggleTerms}
          hitSlop={6}
          style={[
            styles.checkbox,
            acceptedTerms && styles.checkboxChecked,
            termsError && !acceptedTerms && styles.checkboxError,
          ]}
        >
          {acceptedTerms ? <Ionicons name="checkmark" size={15} color={ON_ACCENT} /> : null}
        </Pressable>
        <Text style={styles.consentText}>
          J'accepte les{' '}
          <Text
            style={styles.consentLink}
            onPress={() =>
              showNotice('Les Conditions d’utilisation seront disponibles prochainement.')
            }
          >
            Conditions d'utilisation
          </Text>
          {' '}et la{' '}
          <Text
            style={styles.consentLink}
            onPress={() =>
              showNotice('La Politique de confidentialité sera disponible prochainement.')
            }
          >
            Politique de confidentialité
          </Text>
        </Text>
      </View>
      {termsError ? <Text style={styles.consentError}>{termsError}</Text> : null}

      <Pressable
        accessibilityRole="button"
        disabled={loading}
        onPress={() => void handleSubmit()}
        style={({ pressed }) => [styles.cta, (pressed || loading) && styles.pressed]}
      >
        {loading ? (
          <ActivityIndicator color={ON_ACCENT} />
        ) : (
          <Text style={styles.ctaLabel}>Créer mon compte</Text>
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
    backgroundColor: 'rgba(220, 53, 69, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(220, 53, 69, 0.30)',
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  errorBannerText: {
    flex: 1,
    fontFamily: fontFamilies.sansMedium,
    fontSize: 13,
    lineHeight: 18,
    color: '#A45A45',
  },
  consentRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#C5CDD6',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: { backgroundColor: ACCENT, borderColor: ACCENT },
  checkboxError: { borderColor: '#A45A45' },
  consentText: {
    flex: 1,
    fontFamily: fontFamilies.sans,
    fontSize: 13,
    lineHeight: 19,
    color: '#5A6270',
  },
  consentLink: {
    fontFamily: fontFamilies.sansMedium,
    color: ACCENT,
  },
  consentError: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 12,
    lineHeight: 16,
    color: '#A45A45',
  },
  cta: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  ctaLabel: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 15,
    color: ON_ACCENT,
  },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  switchText: {
    fontFamily: fontFamilies.sans,
    fontSize: 14,
    lineHeight: 19,
    color: '#5A6270',
  },
  switchLink: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 14,
    lineHeight: 19,
    color: ACCENT,
  },
  pressed: { opacity: 0.78 },
});
