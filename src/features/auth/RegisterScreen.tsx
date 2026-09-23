/**
 * Inscription — assistant question / réponse (une étape à la fois).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/context/AuthContext';
import { homeAfterAuth, useActiveEvent } from '@/context/ActiveEventContext';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/ui/Logo';
import { ApiError } from '@/services/apiClient';
import { register } from '@/services/authService';
import {
  isValidEmail,
  isValidFullName,
  isValidPassword,
  passwordsMatch,
} from '@/utils/validation';
import { fontFamilies, layout, radii, shadows, spacing } from '@/constants/theme';

type StepId = 'name' | 'email' | 'password' | 'confirm' | 'terms';

interface StepConfig {
  id: StepId;
  question: string;
  hint: string;
}

const STEPS: StepConfig[] = [
  {
    id: 'name',
    question: 'Quel est votre nom ?',
    hint: 'Prénom et nom, comme sur vos invitations.',
  },
  {
    id: 'email',
    question: 'Quel est votre e-mail ?',
    hint: 'Vous l’utiliserez pour vous connecter.',
  },
  {
    id: 'password',
    question: 'Choisissez un mot de passe',
    hint: 'Au moins 8 caractères.',
  },
  {
    id: 'confirm',
    question: 'Confirmez votre mot de passe',
    hint: 'Saisissez-le une seconde fois.',
  },
  {
    id: 'terms',
    question: 'Dernière étape',
    hint: 'Acceptez les conditions pour créer votre compte.',
  },
];

const ACCENT = '#E07A5F';
const ON_ACCENT = '#FFFFFF';
const INK = '#2A1F24';
const MUTED = '#6B5560';
const BG = '#F7F0E8';

export function RegisterScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { clearActiveEvent, syncFromServer } = useActiveEvent();
  const insets = useSafeAreaInsets();

  const [stepIndex, setStepIndex] = useState(0);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const fade = useRef(new Animated.Value(1)).current;
  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;
  const progress = (stepIndex + 1) / STEPS.length;

  const animateStep = useCallback(
    (next: number) => {
      Animated.timing(fade, { toValue: 0, duration: 120, useNativeDriver: true }).start(() => {
        setStepIndex(next);
        setFieldError(null);
        setFormError(null);
        Animated.timing(fade, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      });
    },
    [fade],
  );

  const validateCurrent = (): boolean => {
    switch (step.id) {
      case 'name':
        if (!isValidFullName(fullName)) {
          setFieldError('Indiquez votre nom complet (2 caractères minimum).');
          return false;
        }
        break;
      case 'email':
        if (!isValidEmail(email)) {
          setFieldError('Adresse e-mail invalide.');
          return false;
        }
        break;
      case 'password':
        if (!isValidPassword(password)) {
          setFieldError('Le mot de passe doit contenir au moins 8 caractères.');
          return false;
        }
        break;
      case 'confirm':
        if (!passwordsMatch(password, confirmPassword)) {
          setFieldError('Les mots de passe ne correspondent pas.');
          return false;
        }
        break;
      case 'terms':
        if (!acceptedTerms) {
          setFieldError('Acceptez les Conditions d’utilisation pour continuer.');
          return false;
        }
        break;
    }
    setFieldError(null);
    return true;
  };

  const createAccount = async () => {
    setFormError(null);
    setLoading(true);
    try {
      const session = await register({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        password_confirm: confirmPassword,
      });
      // Nouvelle inscription : forcer le wizard type + thème.
      clearActiveEvent();
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

  const goNext = () => {
    if (!validateCurrent()) return;
    if (isLast) {
      void createAccount();
      return;
    }
    animateStep(stepIndex + 1);
  };

  const goBack = () => {
    if (stepIndex === 0) {
      router.back();
      return;
    }
    animateStep(stepIndex - 1);
  };

  useEffect(() => {
    setFieldError(null);
  }, [fullName, email, password, confirmPassword, acceptedTerms]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top + spacing.md }]}>
      <StatusBar style="dark" />

      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retour"
          onPress={goBack}
          hitSlop={10}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        >
          <Ionicons name="arrow-back" size={22} color={INK} />
        </Pressable>
        <Logo size="sm" variant="ink" />
        <View style={styles.backBtn} />
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` as `${number}%` }]} />
      </View>
      <Text style={styles.stepMeta}>
        Étape {stepIndex + 1} sur {STEPS.length}
      </Text>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + spacing.xl },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.panel, { opacity: fade, maxWidth: layout.formMaxWidth }]}>
            <Text style={styles.question}>{step.question}</Text>
            <Text style={styles.hint}>{step.hint}</Text>

            {formError ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle-outline" size={18} color="#A45A45" />
                <Text style={styles.errorBannerText}>{formError}</Text>
              </View>
            ) : null}

            {step.id === 'name' ? (
              <Input
                label="Nom complet"
                leftIcon="person-outline"
                tone="light"
                value={fullName}
                onChangeText={setFullName}
                placeholder="Camille Dupont"
                autoCapitalize="words"
                autoComplete="name"
                autoFocus
                error={fieldError}
                returnKeyType="next"
                onSubmitEditing={goNext}
              />
            ) : null}

            {step.id === 'email' ? (
              <Input
                label="Adresse e-mail"
                leftIcon="mail-outline"
                tone="light"
                value={email}
                onChangeText={setEmail}
                placeholder="camille@exemple.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                autoFocus
                error={fieldError}
                returnKeyType="next"
                onSubmitEditing={goNext}
              />
            ) : null}

            {step.id === 'password' ? (
              <Input
                label="Mot de passe"
                leftIcon="lock-closed-outline"
                tone="light"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
                autoComplete="new-password"
                autoFocus
                error={fieldError}
                returnKeyType="next"
                onSubmitEditing={goNext}
              />
            ) : null}

            {step.id === 'confirm' ? (
              <Input
                label="Confirmation"
                leftIcon="shield-checkmark-outline"
                tone="light"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="••••••••"
                secureTextEntry
                autoComplete="new-password"
                autoFocus
                error={fieldError}
                returnKeyType="next"
                onSubmitEditing={goNext}
              />
            ) : null}

            {step.id === 'terms' ? (
              <View style={styles.termsBlock}>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>Récapitulatif</Text>
                  <Text style={styles.summaryLine}>{fullName.trim()}</Text>
                  <Text style={styles.summaryLineMuted}>{email.trim().toLowerCase()}</Text>
                </View>

                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: acceptedTerms }}
                  onPress={() => setAcceptedTerms((v) => !v)}
                  style={styles.consentRow}
                >
                  <View
                    style={[
                      styles.checkbox,
                      acceptedTerms && styles.checkboxChecked,
                      fieldError && !acceptedTerms && styles.checkboxError,
                    ]}
                  >
                    {acceptedTerms ? (
                      <Ionicons name="checkmark" size={15} color={ON_ACCENT} />
                    ) : null}
                  </View>
                  <Text style={styles.consentText}>
                    J’accepte les{' '}
                    <Text
                      style={styles.consentLink}
                      onPress={() =>
                        setNotice(
                          'Les Conditions d’utilisation seront disponibles prochainement.',
                        )
                      }
                    >
                      Conditions d’utilisation
                    </Text>{' '}
                    et la{' '}
                    <Text
                      style={styles.consentLink}
                      onPress={() =>
                        setNotice(
                          'La Politique de confidentialité sera disponible prochainement.',
                        )
                      }
                    >
                      Politique de confidentialité
                    </Text>
                    .
                  </Text>
                </Pressable>
                {fieldError ? <Text style={styles.consentError}>{fieldError}</Text> : null}
              </View>
            ) : null}

            {notice ? (
              <View style={styles.notice}>
                <Ionicons name="information-circle-outline" size={18} color={ACCENT} />
                <Text style={styles.noticeText}>{notice}</Text>
                <Pressable onPress={() => setNotice(null)} hitSlop={8}>
                  <Ionicons name="close" size={18} color={MUTED} />
                </Pressable>
              </View>
            ) : null}

            <Pressable
              accessibilityRole="button"
              disabled={loading}
              onPress={goNext}
              style={({ pressed }) => [styles.cta, (pressed || loading) && styles.pressed]}
            >
              {loading ? (
                <ActivityIndicator color={ON_ACCENT} />
              ) : (
                <>
                  <Text style={styles.ctaLabel}>{isLast ? 'Créer mon compte' : 'Continuer'}</Text>
                  {!isLast ? <Ionicons name="arrow-forward" size={18} color={ON_ACCENT} /> : null}
                </>
              )}
            </Pressable>

            {stepIndex === 0 ? (
              <View style={styles.switchRow}>
                <Text style={styles.switchText}>Déjà un compte ?</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push('/login')}
                  hitSlop={8}
                >
                  <Text style={styles.switchLink}>Se connecter</Text>
                </Pressable>
              </View>
            ) : null}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: {
    height: 3,
    marginHorizontal: spacing.lg,
    borderRadius: 99,
    backgroundColor: '#E8D9CE',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: ACCENT,
    borderRadius: 99,
  },
  stepMeta: {
    marginTop: spacing.sm,
    marginHorizontal: spacing.lg,
    fontFamily: fontFamilies.sansMedium,
    fontSize: 12,
    lineHeight: 16,
    color: MUTED,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    alignItems: 'center',
  },
  panel: { width: '100%', gap: spacing.md },
  question: {
    fontFamily: fontFamilies.serifSemiBold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.4,
    color: INK,
  },
  hint: {
    fontFamily: fontFamilies.sans,
    fontSize: 15,
    lineHeight: 22,
    color: MUTED,
    marginBottom: spacing.sm,
  },
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
  termsBlock: { gap: spacing.md },
  summaryCard: {
    backgroundColor: '#FFFCFA',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#E8D9CE',
    padding: spacing.md,
    gap: 4,
  },
  summaryLabel: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 12,
    color: MUTED,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  summaryLine: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 16,
    color: INK,
  },
  summaryLineMuted: {
    fontFamily: fontFamilies.sans,
    fontSize: 14,
    color: MUTED,
  },
  consentRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#C5CDD6',
    backgroundColor: '#FFFCFA',
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
    color: MUTED,
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
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ACCENT,
    backgroundColor: `${ACCENT}18`,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  noticeText: {
    flex: 1,
    fontFamily: fontFamilies.sansMedium,
    fontSize: 13,
    lineHeight: 18,
    color: '#C45D45',
  },
  cta: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: spacing.sm,
    ...shadows.sm,
  },
  ctaLabel: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 15,
    color: ON_ACCENT,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.md,
  },
  switchText: {
    fontFamily: fontFamilies.sans,
    fontSize: 14,
    color: MUTED,
  },
  switchLink: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 14,
    color: ACCENT,
  },
  pressed: { opacity: 0.78 },
});
