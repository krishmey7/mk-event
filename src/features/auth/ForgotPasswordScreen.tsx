/**
 * Mot de passe oublié — saisie e-mail + confirmation neutre.
 */

import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { AuthShell } from './AuthShell';
import { Input } from '@/components/ui/Input';
import { ApiError } from '@/services/apiClient';
import { requestPasswordReset } from '@/services/authService';
import { isValidEmail } from '@/utils/validation';
import { fontFamilies, radii, shadows, spacing } from '@/constants/theme';

const ACCENT = '#E07A5F';
const INK = '#2A1F24';

export function ForgotPasswordScreen() {
  const router = useRouter();

  return (
    <AuthShell
      tone="dark"
      title="Mot de passe oublié"
      subtitle="Indiquez votre e-mail : nous vous enverrons un lien pour en choisir un nouveau."
      showSocial={false}
      footer={
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/login')}
          hitSlop={8}
          style={({ pressed }) => [pressed && styles.pressed]}
        >
          <Text style={styles.backLink}>Retour à la connexion</Text>
        </Pressable>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}

function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setFormError(null);
    if (!isValidEmail(email)) {
      setFieldError('Renseignez un e-mail valide.');
      return;
    }
    setFieldError(undefined);
    setLoading(true);
    try {
      const result = await requestPasswordReset({ email: email.trim().toLowerCase() });
      setSentMessage(result.detail);
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

  if (sentMessage) {
    return (
      <View style={styles.successBox}>
        <Ionicons name="mail-outline" size={28} color={ACCENT} />
        <Text style={styles.successTitle}>Vérifiez votre boîte mail</Text>
        <Text style={styles.successBody}>{sentMessage}</Text>
      </View>
    );
  }

  return (
    <>
      {formError ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle-outline" size={18} color="#F06570" />
          <Text style={styles.errorBannerText}>{formError}</Text>
        </View>
      ) : null}

      <Input
        label="E-mail"
        leftIcon="mail-outline"
        value={email}
        onChangeText={(value) => {
          setEmail(value);
          setFieldError(undefined);
        }}
        placeholder="sarah@exemple.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        error={fieldError}
        returnKeyType="done"
        onSubmitEditing={() => void handleSubmit()}
      />

      <Pressable
        accessibilityRole="button"
        disabled={loading}
        onPress={() => void handleSubmit()}
        style={({ pressed }) => [styles.cta, (pressed || loading) && styles.pressed]}
      >
        {loading ? (
          <ActivityIndicator color={INK} />
        ) : (
          <Text style={styles.ctaLabel}>Envoyer le lien</Text>
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
    color: INK,
  },
  successBox: {
    gap: spacing.sm,
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  successTitle: {
    fontFamily: fontFamilies.serifSemiBold,
    fontSize: 20,
    lineHeight: 26,
    color: '#F7F0E8',
  },
  successBody: {
    fontFamily: fontFamilies.sans,
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(247, 240, 232, 0.72)',
  },
  backLink: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 14,
    lineHeight: 19,
    color: ACCENT,
  },
  pressed: { opacity: 0.78 },
});
