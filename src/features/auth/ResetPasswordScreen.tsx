/**
 * Nouveau mot de passe — lit uid/token depuis la query du lien e-mail.
 */

import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AuthShell } from './AuthShell';
import { Input } from '@/components/ui/Input';
import { ApiError } from '@/services/apiClient';
import { confirmPasswordReset } from '@/services/authService';
import { isValidPassword, passwordsMatch } from '@/utils/validation';
import { fontFamilies, radii, shadows, spacing } from '@/constants/theme';

const ACCENT = '#E07A5F';
const INK = '#2A1F24';

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

export function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ uid?: string | string[]; token?: string | string[] }>();
  const uid = useMemo(() => firstParam(params.uid).trim(), [params.uid]);
  const token = useMemo(() => firstParam(params.token).trim(), [params.token]);
  const linkValid = Boolean(uid && token);

  return (
    <AuthShell
      tone="dark"
      title="Nouveau mot de passe"
      subtitle={
        linkValid
          ? 'Choisissez un mot de passe d’au moins 8 caractères.'
          : 'Ce lien est incomplet ou invalide. Demandez un nouvel e-mail depuis la connexion.'
      }
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
      {linkValid ? <ResetPasswordForm uid={uid} token={token} /> : null}
    </AuthShell>
  );
}

function ResetPasswordForm({ uid, token }: { uid: string; token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; password_confirm?: string }>(
    {},
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const errors: { password?: string; password_confirm?: string } = {};
    if (!isValidPassword(password)) {
      errors.password = 'Le mot de passe doit contenir au moins 8 caractères.';
    }
    if (!passwordsMatch(password, passwordConfirm)) {
      errors.password_confirm = 'Les mots de passe ne correspondent pas.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    setFormError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      await confirmPasswordReset({
        uid,
        token,
        password,
        password_confirm: passwordConfirm,
      });
      setDone(true);
    } catch (error) {
      if (error instanceof ApiError) {
        const next = {
          password: error.messageForField('password') ?? error.messageForField('token'),
          password_confirm: error.messageForField('password_confirm'),
        };
        if (next.password || next.password_confirm) {
          setFieldErrors(next);
        }
        setFormError(error.message);
      } else {
        setFormError('Une erreur inattendue est survenue. Merci de réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <View style={styles.successBox}>
        <Ionicons name="checkmark-circle-outline" size={28} color={ACCENT} />
        <Text style={styles.successTitle}>Mot de passe mis à jour</Text>
        <Text style={styles.successBody}>Vous pouvez vous connecter avec votre nouveau mot de passe.</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/login')}
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
        >
          <Text style={styles.ctaLabel}>Se connecter</Text>
        </Pressable>
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
        label="Nouveau mot de passe"
        leftIcon="lock-closed-outline"
        value={password}
        onChangeText={(value) => {
          setPassword(value);
          setFieldErrors((prev) => ({ ...prev, password: undefined }));
        }}
        placeholder="••••••••"
        secureTextEntry
        autoComplete="new-password"
        error={fieldErrors.password}
        returnKeyType="next"
      />

      <Input
        label="Confirmer le mot de passe"
        leftIcon="lock-closed-outline"
        value={passwordConfirm}
        onChangeText={(value) => {
          setPasswordConfirm(value);
          setFieldErrors((prev) => ({ ...prev, password_confirm: undefined }));
        }}
        placeholder="••••••••"
        secureTextEntry
        autoComplete="new-password"
        error={fieldErrors.password_confirm}
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
          <Text style={styles.ctaLabel}>Enregistrer</Text>
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
    alignSelf: 'stretch',
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
    width: '100%',
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
    marginBottom: spacing.sm,
  },
  backLink: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 14,
    lineHeight: 19,
    color: ACCENT,
  },
  pressed: { opacity: 0.78 },
});
