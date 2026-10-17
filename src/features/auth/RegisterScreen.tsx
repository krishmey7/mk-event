/**
 * Inscription — expérience type Google Account (mobile) :
 * une question à la fois, glissement latéral, CTA collé en bas.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Appearance,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  FadeIn,
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

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
import { fontFamilies, radii, spacing } from '@/constants/theme';

type StepId = 'name' | 'email' | 'password' | 'confirm' | 'terms';

interface StepConfig {
  id: StepId;
  question: string;
  hint: string;
}

const STEPS: StepConfig[] = [
  {
    id: 'name',
    question: 'Comment vous appeler ?',
    hint: 'Prénom et nom, comme sur vos invitations.',
  },
  {
    id: 'email',
    question: 'Quelle est votre adresse e-mail ?',
    hint: 'Vous l’utiliserez pour vous connecter.',
  },
  {
    id: 'password',
    question: 'Créez un mot de passe',
    hint: 'Au moins 8 caractères.',
  },
  {
    id: 'confirm',
    question: 'Confirmez votre mot de passe',
    hint: 'Saisissez le même mot de passe une seconde fois.',
  },
  {
    id: 'terms',
    question: 'Acceptez les conditions',
    hint: 'Dernière étape avant d’entrer dans votre studio.',
  },
];

const ACCENT = '#E07A5F';
const ON_ACCENT = '#FFFFFF';
const INK = '#1F1A1C';
const MUTED = '#5F5659';
const BG = '#FFFCFA';
const SURFACE = '#FFFFFF';
const BORDER = '#E6DDD6';

const easeOut = Easing.out(Easing.cubic);

export function RegisterScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { clearActiveEvent, syncFromServer } = useActiveEvent();
  const insets = useSafeAreaInsets();

  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const progress = useSharedValue((1) / STEPS.length);
  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;

  useEffect(() => {
    /* Inscription toujours claire — évite le TextInput Android sombre (mode système). */
    if (Platform.OS !== 'android') return;
    Appearance.setColorScheme('light');
    return () => {
      Appearance.setColorScheme(null);
    };
  }, []);

  useEffect(() => {
    progress.value = withTiming((stepIndex + 1) / STEPS.length, {
      duration: 320,
      easing: easeOut,
    });
  }, [progress, stepIndex]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const entering = useMemo(
    () =>
      direction > 0
        ? SlideInRight.duration(280).easing(easeOut)
        : SlideInLeft.duration(280).easing(easeOut),
    [direction],
  );
  const exiting = useMemo(
    () =>
      direction > 0
        ? SlideOutLeft.duration(220).easing(easeOut)
        : SlideOutRight.duration(220).easing(easeOut),
    [direction],
  );

  const goToStep = useCallback((next: number, dir: 1 | -1) => {
    setDirection(dir);
    setFieldError(null);
    setFormError(null);
    setStepIndex(next);
  }, []);

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
    goToStep(stepIndex + 1, 1);
  };

  const goBack = () => {
    if (stepIndex === 0) {
      router.back();
      return;
    }
    goToStep(stepIndex - 1, -1);
  };

  useEffect(() => {
    setFieldError(null);
  }, [fullName, email, password, confirmPassword, acceptedTerms]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* App bar type Google */}
      <View style={styles.appBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retour"
          onPress={goBack}
          hitSlop={12}
          style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
        >
          <Ionicons name="arrow-back" size={22} color={INK} />
        </Pressable>
        <Logo size="sm" variant="ink" />
        <View style={styles.iconBtn} />
      </View>

      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, progressStyle]} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <View style={styles.body}>
          <Animated.View
            key={step.id}
            entering={entering}
            exiting={exiting}
            style={styles.stepPane}
          >
            <Text
              style={styles.question}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.82}
            >
              {step.question}
            </Text>
            <Text style={styles.hint}>{step.hint}</Text>

            {formError ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle-outline" size={18} color="#A45A45" />
                <Text style={styles.errorBannerText}>{formError}</Text>
              </View>
            ) : null}

            <View style={styles.fieldBlock}>
              {step.id === 'name' ? (
                <Input
                  label="Nom complet"
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
                  containerStyle={styles.input}
                />
              ) : null}

              {step.id === 'email' ? (
                <Input
                  label="Adresse e-mail"
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
                  containerStyle={styles.input}
                />
              ) : null}

              {step.id === 'password' ? (
                <Input
                  label="Mot de passe"
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
                  containerStyle={styles.input}
                />
              ) : null}

              {step.id === 'confirm' ? (
                <Input
                  label="Confirmation"
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
                  containerStyle={styles.input}
                />
              ) : null}

              {step.id === 'terms' ? (
                <View style={styles.termsBlock}>
                  <Animated.View entering={FadeIn.duration(280)} style={styles.summaryCard}>
                    <Text style={styles.summaryName}>{fullName.trim()}</Text>
                    <Text style={styles.summaryEmail}>{email.trim().toLowerCase()}</Text>
                  </Animated.View>

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
                        <Ionicons name="checkmark" size={14} color={ON_ACCENT} />
                      ) : null}
                    </View>
                    <Text style={styles.consentText}>
                      J’accepte les{' '}
                      <Text style={styles.consentLink} onPress={() => router.push('/cgu')}>
                        Conditions d’utilisation
                      </Text>{' '}
                      et la{' '}
                      <Text
                        style={styles.consentLink}
                        onPress={() => router.push('/confidentialite')}
                      >
                        Politique de confidentialité
                      </Text>
                      .
                    </Text>
                  </Pressable>
                  {fieldError ? <Text style={styles.consentError}>{fieldError}</Text> : null}
                </View>
              ) : null}
            </View>
          </Animated.View>
        </View>

        {/* CTA collé en bas — lien + bouton pleine largeur (compact Android) */}
        <View
          style={[
            styles.footer,
            {
              paddingBottom: Math.max(insets.bottom, spacing.md),
              borderTopColor: BORDER,
            },
          ]}
        >
          {stepIndex === 0 ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/login')}
              hitSlop={8}
              style={styles.switchHit}
            >
              <Text style={styles.switchText} numberOfLines={1}>
                Déjà un compte ?{' '}
                <Text style={styles.switchLink}>Se connecter</Text>
              </Text>
            </Pressable>
          ) : (
            <Text style={styles.stepCounter}>
              {stepIndex + 1} / {STEPS.length}
            </Text>
          )}

          <Pressable
            accessibilityRole="button"
            disabled={loading}
            onPress={goNext}
            style={({ pressed }) => [styles.cta, (pressed || loading) && styles.pressed]}
          >
            {loading ? (
              <ActivityIndicator color={ON_ACCENT} />
            ) : (
              <Text style={styles.ctaLabel}>{isLast ? 'Créer mon compte' : 'Suivant'}</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
  },
  flex: { flex: 1 },

  appBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  progressTrack: {
    height: 3,
    backgroundColor: '#EFE6DF',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: ACCENT,
  },

  body: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl + spacing.sm,
    overflow: 'hidden',
  },
  stepPane: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },

  question: {
    fontFamily: fontFamilies.serifSemiBold,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.2,
    color: INK,
    marginBottom: spacing.sm,
  },
  hint: {
    fontFamily: fontFamilies.sans,
    fontSize: 14,
    lineHeight: 20,
    color: MUTED,
    marginBottom: spacing.lg,
  },

  fieldBlock: {
    gap: spacing.md,
  },
  input: {
    width: '100%',
  },

  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(164, 90, 69, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(164, 90, 69, 0.28)',
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  errorBannerText: {
    flex: 1,
    fontFamily: fontFamilies.sansMedium,
    fontSize: 13,
    lineHeight: 18,
    color: '#A45A45',
  },

  termsBlock: { gap: spacing.lg },
  summaryCard: {
    backgroundColor: SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: 2,
  },
  summaryName: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 16,
    color: INK,
  },
  summaryEmail: {
    fontFamily: fontFamilies.sans,
    fontSize: 14,
    color: MUTED,
  },
  consentRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#B7AEA8',
    backgroundColor: SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: { backgroundColor: ACCENT, borderColor: ACCENT },
  checkboxError: { borderColor: '#A45A45' },
  consentText: {
    flex: 1,
    fontFamily: fontFamilies.sans,
    fontSize: 14,
    lineHeight: 20,
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

  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    backgroundColor: BG,
    gap: spacing.sm,
  },
  switchHit: { alignSelf: 'flex-start', paddingVertical: 2 },
  switchText: {
    fontFamily: fontFamilies.sans,
    fontSize: 13,
    lineHeight: 18,
    color: MUTED,
  },
  switchLink: {
    fontFamily: fontFamilies.sansSemiBold,
    color: ACCENT,
  },
  stepCounter: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 13,
    color: MUTED,
  },
  cta: {
    minHeight: 48,
    width: '100%',
    paddingHorizontal: spacing.lg,
    borderRadius: 24,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaLabel: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 15,
    color: ON_ACCENT,
    letterSpacing: 0.15,
  },
  pressed: { opacity: 0.82 },
});
