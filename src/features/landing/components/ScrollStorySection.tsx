/**
 * Récit scroll-driven façon Edulex :
 * sticky orb par étape, titre inline mobile, progress continu.
 */

import { Platform, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useBreakpoint } from '@/hooks/useBreakpoint';
import { landingFonts } from '../landingFonts';
import { LANDING } from '../landingTokens';
import { LandingReveal } from './LandingReveal';

const STEPS = [
  {
    icon: 'color-wand-outline' as const,
    label: 'Créer',
    title: 'Votre univers prend forme',
    text: 'Choisissez un modèle, puis adaptez les textes, les photos, le programme et chaque détail.',
    tag: 'Studio en temps réel',
  },
  {
    icon: 'paper-plane-outline' as const,
    label: 'Inviter',
    title: 'Un lien personnel pour chacun',
    text: 'Ajoutez vos invités et partagez une invitation pensée pour eux, sans fichier à télécharger.',
    tag: 'Lien invité unique',
  },
  {
    icon: 'checkmark-circle-outline' as const,
    label: 'Répondre',
    title: 'Les réponses arrivent au même endroit',
    text: 'RSVP, accompagnants, boissons et régimes alimentaires sont structurés automatiquement.',
    tag: 'Suivi RSVP',
  },
  {
    icon: 'qr-code-outline' as const,
    label: 'Accueillir',
    title: 'Le jour J reste fluide',
    text: 'Chaque invité confirmé dispose de son pass QR. Vous contrôlez les entrées depuis votre espace.',
    tag: 'Check-in QR',
  },
] as const;

export const SCROLL_STORY_STEP_COUNT = STEPS.length;

/** Interpolation soft 0→1 pour l’entrée d’une étape dans le progress global. */
function stepPresence(progress: number, index: number, count: number) {
  const start = index / count;
  const peak = (index + 0.45) / count;
  const fade = (index + 1.05) / count;
  if (progress <= start) return 0;
  if (progress >= fade) return 1;
  if (progress <= peak) return (progress - start) / Math.max(0.001, peak - start);
  return 1;
}

export function ScrollStorySection({
  activeStep,
  progress,
  onLayout,
}: {
  activeStep: number;
  /** Progression continue 0→1 dans la section. */
  progress: number;
  onLayout?: (event: LayoutChangeEvent) => void;
}) {
  const { isDesktop } = useBreakpoint();
  const safeActive = Math.max(0, Math.min(STEPS.length - 1, activeStep));
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <View style={styles.section} onLayout={onLayout}>
      <View style={styles.inner}>
        <View style={styles.heading}>
          <LandingReveal y={20} duration={600}>
            <Text style={styles.kicker}>Parcours</Text>
            <Text style={styles.title}>De l’idée au jour J, sans rupture</Text>
            <Text style={styles.lead}>
              Créer, inviter, répondre, accueillir — chaque étape s’illumine au fil du scroll.
            </Text>
          </LandingReveal>
        </View>

        <View style={styles.timeline}>
          {/* Trait de progression continu (colonne gauche) */}
          <View style={[styles.progressTrack, isDesktop && styles.progressTrackDesktop]} pointerEvents="none">
            <View style={[styles.progressFill, { height: `${clamped * 100}%` }]} />
          </View>

          {STEPS.map((step, index) => {
            const active = index === safeActive;
            const complete = index < safeActive;
            const presence = stepPresence(clamped, index, STEPS.length);
            const lift = Math.round((1 - presence) * (isDesktop ? 36 : 22));
            const cardOpacity = 0.42 + presence * 0.58;

            return (
              <View
                key={step.label}
                style={[styles.row, isDesktop && styles.rowDesktop, index === 0 && styles.rowFirst]}
              >
                {/* Sticky : orb (+ label desktop) */}
                <View style={[styles.stickyCol, isDesktop && styles.stickyColDesktop]}>
                  <View
                    style={[
                      styles.orbShell,
                      (active || complete) && styles.orbShellReached,
                      active && styles.orbShellActive,
                    ]}
                  >
                    <View
                      style={[
                        styles.orbCore,
                        (active || complete) && styles.orbCoreReached,
                        active && styles.orbCoreActive,
                      ]}
                    />
                  </View>
                  {isDesktop ? (
                    <Text
                      style={[
                        styles.stickyLabel,
                        (active || complete) && styles.stickyLabelReached,
                        active && styles.stickyLabelActive,
                      ]}
                    >
                      {step.label}
                    </Text>
                  ) : null}
                </View>

                {/* Contenu : titre mobile inline + carte */}
                <View
                  style={[
                    styles.content,
                    {
                      opacity: cardOpacity,
                      transform: [{ translateY: lift }],
                    },
                  ]}
                >
                  {!isDesktop ? (
                    <Text
                      style={[
                        styles.mobileTitle,
                        (active || complete) && styles.mobileTitleReached,
                        active && styles.mobileTitleActive,
                      ]}
                    >
                      {step.label}
                    </Text>
                  ) : null}

                  <View style={[styles.card, active ? styles.cardActive : styles.cardIdle]}>
                    <View style={[styles.iconShell, active && styles.iconShellActive]}>
                      <Ionicons
                        name={step.icon}
                        size={24}
                        color={active ? LANDING.coral : 'rgba(255,249,245,0.45)'}
                      />
                    </View>
                    <Text style={[styles.cardTag, active && styles.cardTagActive]}>{step.tag}</Text>
                    <Text style={[styles.cardTitle, !active && styles.cardTextIdle]}>
                      {step.title}
                    </Text>
                    <Text style={[styles.cardText, !active && styles.cardTextIdle]}>{step.text}</Text>
                    <View style={styles.cardIndex}>
                      <Text style={[styles.cardIndexText, active && styles.cardIndexTextActive]}>
                        0{index + 1}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const stickyWeb =
  Platform.OS === 'web'
    ? ({
        position: 'sticky',
        // Nav hors ScrollView → coller près du haut du viewport de scroll.
        top: 24,
        alignSelf: 'flex-start',
        zIndex: 6,
      } as object)
    : null;

const styles = StyleSheet.create({
  section: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 72,
    paddingBottom: 64,
    backgroundColor: '#3D2434',
    overflow: Platform.OS === 'web' ? 'visible' : 'hidden',
  },
  inner: {
    width: '100%',
    maxWidth: LANDING.maxWidth,
    alignSelf: 'center',
  },
  heading: {
    maxWidth: 620,
    marginBottom: 40,
  },
  kicker: {
    ...landingFonts.medium,
    fontSize: 12,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: '#F0A090',
    marginBottom: 12,
  },
  title: {
    ...landingFonts.bold,
    fontSize: 34,
    lineHeight: 41,
    letterSpacing: -0.5,
    color: '#FFF9F5',
    marginBottom: 12,
  },
  lead: {
    ...landingFonts.regular,
    fontSize: 15,
    lineHeight: 23,
    color: 'rgba(255, 249, 245, 0.66)',
    maxWidth: 520,
  },
  timeline: {
    position: 'relative',
    paddingBottom: 12,
  },
  progressTrack: {
    position: 'absolute',
    left: 19,
    top: 14,
    bottom: 40,
    width: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
    zIndex: 0,
  },
  progressTrackDesktop: {
    left: 19,
  },
  progressFill: {
    width: '100%',
    borderRadius: 1,
    backgroundColor: LANDING.coral,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    paddingTop: 28,
    minHeight: 300,
  },
  rowFirst: {
    paddingTop: 8,
  },
  rowDesktop: {
    gap: 36,
    paddingTop: 56,
    minHeight: 420,
  },
  stickyCol: {
    width: 40,
    alignItems: 'center',
    paddingTop: 4,
    ...stickyWeb,
  },
  stickyColDesktop: {
    width: 200,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 8,
  },
  orbShell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    zIndex: 2,
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        } as object)
      : null),
  },
  orbShellReached: {
    borderColor: 'rgba(224, 122, 95, 0.45)',
  },
  orbShellActive: {
    backgroundColor: 'rgba(224, 122, 95, 0.18)',
  },
  orbCore: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 249, 245, 0.35)',
  },
  orbCoreReached: {
    backgroundColor: LANDING.coral,
  },
  orbCoreActive: {
    width: 14,
    height: 14,
    borderRadius: 7,
    shadowColor: LANDING.coral,
    shadowOpacity: 0.75,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  stickyLabel: {
    ...landingFonts.regular,
    fontSize: 22,
    lineHeight: 28,
    color: 'rgba(255, 249, 245, 0.32)',
    flexShrink: 1,
  },
  stickyLabelReached: {
    color: 'rgba(255, 249, 245, 0.62)',
  },
  stickyLabelActive: {
    ...landingFonts.medium,
    fontSize: 28,
    lineHeight: 34,
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingBottom: 8,
  },
  mobileTitle: {
    ...landingFonts.regular,
    fontSize: 26,
    lineHeight: 32,
    color: 'rgba(255, 249, 245, 0.38)',
    marginBottom: 14,
    marginTop: 2,
  },
  mobileTitleReached: {
    color: 'rgba(255, 249, 245, 0.7)',
  },
  mobileTitleActive: {
    ...landingFonts.medium,
    color: '#FFFFFF',
  },
  card: {
    position: 'relative',
    minHeight: 260,
    borderRadius: 26,
    padding: 26,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  cardActive: {
    backgroundColor: '#FFFCFA',
    borderColor: 'rgba(255, 255, 255, 0.85)',
    shadowColor: '#160C13',
    shadowOpacity: 0.28,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 16 },
    elevation: 8,
  },
  cardIdle: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconShell: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 18,
  },
  iconShellActive: {
    backgroundColor: LANDING.coralSoft,
  },
  cardTag: {
    ...landingFonts.semibold,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.48)',
    marginBottom: 8,
  },
  cardTagActive: {
    color: LANDING.coral,
  },
  cardTitle: {
    ...landingFonts.bold,
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.3,
    color: LANDING.text,
    marginBottom: 10,
    maxWidth: 480,
  },
  cardText: {
    ...landingFonts.regular,
    fontSize: 15,
    lineHeight: 24,
    color: LANDING.textMuted,
    maxWidth: 520,
  },
  cardTextIdle: {
    color: 'rgba(255, 255, 255, 0.68)',
  },
  cardIndex: {
    position: 'absolute',
    right: 22,
    top: 18,
  },
  cardIndexText: {
    ...landingFonts.bold,
    fontSize: 44,
    color: 'rgba(255, 249, 245, 0.08)',
  },
  cardIndexTextActive: {
    color: 'rgba(224, 122, 95, 0.12)',
  },
});
