/**
 * Récit scroll-driven — rail sticky inspiré d’Edulex, contenu MK.
 */

import { Platform, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useBreakpoint } from '@/hooks/useBreakpoint';
import { fontFamilies } from '@/constants/theme';
import { LANDING } from '../landingTokens';

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

export function ScrollStorySection({
  activeStep,
  onLayout,
}: {
  activeStep: number;
  onLayout?: (event: LayoutChangeEvent) => void;
}) {
  const { isDesktop } = useBreakpoint();
  const safeActive = Math.max(0, Math.min(STEPS.length - 1, activeStep));

  return (
    <View style={styles.section} onLayout={onLayout}>
      <View style={styles.inner}>
        <View style={styles.heading}>
          <Text style={styles.kicker}>De l’idée au jour J</Text>
          <Text style={styles.title}>Une invitation qui avance avec vous</Text>
          <Text style={styles.lead}>
            Suivez le parcours : chaque étape active révèle ce que MK Events prend en charge.
          </Text>
        </View>

        <View style={[styles.story, isDesktop && styles.storyDesktop]}>
          <View style={[styles.rail, isDesktop && styles.railDesktop]}>
            <View style={styles.track}>
              <View
                style={[
                  styles.trackFill,
                  { height: `${((safeActive + 1) / STEPS.length) * 100}%` },
                ]}
              />
            </View>
            {STEPS.map((step, index) => {
              const active = index === safeActive;
              const complete = index < safeActive;
              return (
                <View key={step.label} style={styles.railItem}>
                  <View
                    style={[
                      styles.dot,
                      (active || complete) && styles.dotReached,
                      active && styles.dotActive,
                    ]}
                  >
                    {complete ? <Ionicons name="checkmark" size={10} color="#FFFFFF" /> : null}
                  </View>
                  <Text
                    style={[
                      styles.railLabel,
                      (active || complete) && styles.railLabelReached,
                      active && styles.railLabelActive,
                    ]}
                  >
                    {step.label}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={styles.cards}>
            {STEPS.map((step, index) => {
              const active = index === safeActive;
              return (
                <View
                  key={step.title}
                  style={[
                    styles.card,
                    isDesktop && styles.cardDesktop,
                    active ? styles.cardActive : styles.cardIdle,
                  ]}
                >
                  <View style={[styles.iconShell, active && styles.iconShellActive]}>
                    <Ionicons
                      name={step.icon}
                      size={24}
                      color={active ? LANDING.coral : LANDING.textFaint}
                    />
                  </View>
                  <Text style={[styles.cardTag, active && styles.cardTagActive]}>{step.tag}</Text>
                  <Text style={[styles.cardTitle, !active && styles.cardTextIdle]}>{step.title}</Text>
                  <Text style={[styles.cardText, !active && styles.cardTextIdle]}>{step.text}</Text>
                  <View style={styles.cardIndex}>
                    <Text style={styles.cardIndexText}>0{index + 1}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

const stickyWeb =
  Platform.OS === 'web'
    ? ({
        position: 'sticky',
        top: 132,
        alignSelf: 'flex-start',
      } as object)
    : null;

const styles = StyleSheet.create({
  section: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 88,
    paddingBottom: 36,
    backgroundColor: LANDING.plum,
    overflow: Platform.OS === 'web' ? 'visible' : 'hidden',
  },
  inner: {
    width: '100%',
    maxWidth: LANDING.maxWidth,
    alignSelf: 'center',
  },
  heading: {
    maxWidth: 620,
    marginBottom: 52,
  },
  kicker: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 12,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: '#F0A090',
    marginBottom: 12,
  },
  title: {
    fontFamily: fontFamilies.serifSemiBold,
    fontSize: 34,
    lineHeight: 41,
    letterSpacing: -0.5,
    color: '#FFF9F5',
    marginBottom: 12,
  },
  lead: {
    fontFamily: fontFamilies.sans,
    fontSize: 15,
    lineHeight: 23,
    color: 'rgba(255, 249, 245, 0.66)',
    maxWidth: 520,
  },
  story: {
    gap: 28,
  },
  storyDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 60,
  },
  rail: {
    position: 'relative',
    paddingLeft: 4,
    gap: 18,
    marginBottom: 8,
  },
  railDesktop: {
    width: 210,
    paddingVertical: 6,
    gap: 38,
    ...stickyWeb,
  },
  track: {
    position: 'absolute',
    left: 10,
    top: 11,
    bottom: 11,
    width: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    overflow: 'hidden',
  },
  trackFill: {
    width: '100%',
    borderRadius: 1,
    backgroundColor: LANDING.coral,
  },
  railItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 24,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.24)',
    backgroundColor: LANDING.plum,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  dotReached: {
    borderColor: LANDING.coral,
    backgroundColor: LANDING.coral,
  },
  dotActive: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginLeft: -2,
    shadowColor: LANDING.coral,
    shadowOpacity: 0.7,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },
  railLabel: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 15,
    color: 'rgba(255, 249, 245, 0.36)',
  },
  railLabelReached: {
    color: 'rgba(255, 249, 245, 0.7)',
  },
  railLabelActive: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 18,
    color: '#FFFFFF',
  },
  cards: {
    flex: 1,
    gap: 24,
  },
  card: {
    position: 'relative',
    minHeight: 250,
    borderRadius: 26,
    padding: 26,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardDesktop: {
    minHeight: 310,
    justifyContent: 'center',
    padding: 36,
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
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.48,
  },
  iconShell: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 20,
  },
  iconShellActive: {
    backgroundColor: LANDING.coralSoft,
  },
  cardTag: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 8,
  },
  cardTagActive: {
    color: LANDING.coral,
  },
  cardTitle: {
    fontFamily: fontFamilies.serifSemiBold,
    fontSize: 25,
    lineHeight: 31,
    letterSpacing: -0.3,
    color: LANDING.text,
    marginBottom: 10,
    maxWidth: 480,
  },
  cardText: {
    fontFamily: fontFamilies.sans,
    fontSize: 15,
    lineHeight: 23,
    color: LANDING.textMuted,
    maxWidth: 520,
  },
  cardTextIdle: {
    color: 'rgba(255, 255, 255, 0.68)',
  },
  cardIndex: {
    position: 'absolute',
    right: 24,
    top: 22,
  },
  cardIndexText: {
    fontFamily: fontFamilies.serifSemiBold,
    fontSize: 42,
    color: 'rgba(224, 122, 95, 0.1)',
  },
});
