/**
 * Wizard post-inscription : type d’événement → thème → préférences locales.
 * Aucun événement serveur n’est créé ici (ça se fait à la publication).
 */

import { useState } from 'react';
import {
  ActivityIndicator,
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

import { Logo } from '@/components/ui/Logo';
import { useActiveEvent } from '@/context/ActiveEventContext';
import { fontFamilies, radii, spacing } from '@/constants/theme';
import type { EventType } from '@/types';
import { SETUP_EVENT_TYPES, SETUP_THEMES, themeQuestionForEvent, toStoredThemeKey } from './setupOptions';

const ACCENT = '#E07A5F';
const ON_ACCENT = '#FFFFFF';
const INK = '#2A1F24';
const MUTED = '#6B5560';
const BG = '#F7F0E8';

type Step = 'type' | 'theme';

export function EventSetupWizard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setActiveEvent } = useActiveEvent();

  const [step, setStep] = useState<Step>('type');
  const [eventType, setEventType] = useState<EventType | null>(null);
  const [themeKey, setThemeKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const finish = (type: EventType, theme: string) => {
    setLoading(true);
    const storedTheme = toStoredThemeKey(theme);
    setActiveEvent({
      eventId: null,
      type,
      themeKey: storedTheme,
      preferencesReady: true,
    });
    router.replace('/dashboard');
  };

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.md },
      ]}
    >
      <StatusBar style="dark" />
      <View style={styles.brand}>
        <Logo size="sm" variant="ink" />
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: step === 'type' ? '50%' : '100%' }]} />
      </View>
      <Text style={styles.stepMeta}>{step === 'type' ? 'Étape 1 sur 2' : 'Étape 2 sur 2'}</Text>

      {step === 'type' ? (
        <>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.question}>Quel événement organisez-vous ?</Text>
            <Text style={styles.hint}>Nous adapterons les modèles et le studio.</Text>
            {SETUP_EVENT_TYPES.map((item) => {
              const on = eventType === item.type;
              return (
                <Pressable
                  key={item.type}
                  accessibilityRole="button"
                  onPress={() => setEventType(item.type)}
                  style={[styles.card, on && styles.cardOn]}
                >
                  <View style={[styles.iconWrap, on && styles.iconWrapOn]}>
                    <Ionicons name={item.icon} size={22} color={on ? ON_ACCENT : ACCENT} />
                  </View>
                  <View style={styles.cardText}>
                    <Text style={[styles.cardTitle, on && styles.cardTitleOn]}>{item.label}</Text>
                    <Text style={styles.cardHint}>{item.hint}</Text>
                  </View>
                  {on ? <Ionicons name="checkmark-circle" size={22} color={ACCENT} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
          <Pressable
            accessibilityRole="button"
            disabled={!eventType}
            onPress={() => eventType && setStep('theme')}
            style={[styles.cta, !eventType && styles.ctaDisabled]}
          >
            <Text style={styles.ctaLabel}>Continuer</Text>
            <Ionicons name="arrow-forward" size={18} color={ON_ACCENT} />
          </Pressable>
        </>
      ) : (
        <>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Pressable onPress={() => setStep('type')} style={styles.backRow} hitSlop={8}>
              <Ionicons name="arrow-back" size={18} color={MUTED} />
              <Text style={styles.backText}>Retour</Text>
            </Pressable>
            <Text style={styles.question}>{themeQuestionForEvent(eventType)}</Text>
            <Text style={styles.hint}>
              Choisissez une palette, ou « Aucun » pour garder les couleurs d’origine de chaque modèle.
            </Text>
            <View style={styles.themeGrid}>
              {SETUP_THEMES.map((item) => {
                const on = themeKey === item.key;
                return (
                  <Pressable
                    key={item.key}
                    accessibilityRole="button"
                    onPress={() => setThemeKey(item.key)}
                    style={[styles.themeCard, on && styles.themeCardOn]}
                  >
                    <View style={[styles.swatch, { backgroundColor: item.swatch }]} />
                    <Text style={styles.themeLabel}>{item.label}</Text>
                    <Text style={styles.themeHint}>{item.hint}</Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
          <Pressable
            accessibilityRole="button"
            disabled={!themeKey || !eventType || loading}
            onPress={() => {
              if (eventType && themeKey) finish(eventType, themeKey);
            }}
            style={[styles.cta, (!themeKey || loading) && styles.ctaDisabled]}
          >
            {loading ? (
              <ActivityIndicator color={ON_ACCENT} />
            ) : (
              <>
                <Text style={styles.ctaLabel}>Voir mon mur</Text>
                <Ionicons name="arrow-forward" size={18} color={ON_ACCENT} />
              </>
            )}
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG, paddingHorizontal: spacing.lg },
  brand: { alignItems: 'center', marginBottom: spacing.md },
  progressTrack: {
    height: 3,
    borderRadius: 99,
    backgroundColor: '#E8D9CE',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: ACCENT },
  stepMeta: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    fontFamily: fontFamilies.sansMedium,
    fontSize: 12,
    color: MUTED,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
    flexGrow: 1,
  },
  question: {
    fontFamily: fontFamilies.serifSemiBold,
    fontSize: 26,
    lineHeight: 32,
    color: INK,
  },
  hint: {
    fontFamily: fontFamilies.sans,
    fontSize: 15,
    lineHeight: 22,
    color: MUTED,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: '#E8D9CE',
    backgroundColor: '#FFFCFA',
  },
  cardOn: { borderColor: ACCENT, backgroundColor: '#FCECE7' },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FCECE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapOn: { backgroundColor: ACCENT },
  cardText: { flex: 1, gap: 2 },
  cardTitle: { fontFamily: fontFamilies.sansSemiBold, fontSize: 16, color: INK },
  cardTitleOn: { color: INK },
  cardHint: { fontFamily: fontFamilies.sans, fontSize: 13, color: MUTED },
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  themeCard: {
    width: '48%',
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: '#E8D9CE',
    backgroundColor: '#FFFCFA',
    padding: spacing.md,
    gap: 6,
  },
  themeCardOn: { borderColor: ACCENT, backgroundColor: '#FCECE7' },
  swatch: { width: 28, height: 28, borderRadius: 14 },
  themeLabel: { fontFamily: fontFamilies.sansSemiBold, fontSize: 14, color: INK },
  themeHint: { fontFamily: fontFamilies.sans, fontSize: 12, color: MUTED },
  cta: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: ACCENT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: spacing.sm,
  },
  ctaDisabled: { opacity: 0.45 },
  ctaLabel: { fontFamily: fontFamilies.sansSemiBold, fontSize: 15, color: ON_ACCENT },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backText: { fontFamily: fontFamilies.sansMedium, fontSize: 14, color: MUTED },
});
