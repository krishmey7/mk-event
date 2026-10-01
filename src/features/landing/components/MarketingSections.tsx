/**
 * Sections landing — claires, sans preuve sociale.
 */

import { type ReactNode, useRef } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { useRouter } from 'expo-router';

import { fontFamilies } from '@/constants/theme';
import { TEMPLATES } from '@/features/templates/registry';
import { MarketingTemplatePreview } from './MarketingTemplatePreview';
import { LANDING, useLandingTokens } from '../landingTokens';

function SectionShell({
  children,
  onLayout,
  padTop = 64,
}: {
  children: ReactNode;
  onLayout?: (event: LayoutChangeEvent) => void;
  padTop?: number;
}) {
  return (
    <View style={[styles.section, { paddingTop: padTop }]} onLayout={onLayout}>
      <View style={styles.sectionInner}>{children}</View>
    </View>
  );
}

export function HowItWorksSection({ onLayout }: { onLayout?: (e: LayoutChangeEvent) => void }) {
  const L = useLandingTokens();
  const steps = [
    { n: '1', title: 'Choisissez un modèle', text: 'Une identité visuelle prête pour votre événement.' },
    { n: '2', title: 'Personnalisez', text: 'Textes, photos, programme et RSVP en temps réel.' },
    { n: '3', title: 'Publiez', text: 'Chaque invité reçoit son lien, son pass QR et répond.' },
  ];

  return (
    <SectionShell onLayout={onLayout}>
      <Text style={[styles.title, { color: L.cream }]}>Comment ça marche</Text>
      <Text style={[styles.lead, { color: L.creamMuted }]}>
        Trois étapes. Rien de superflu.
      </Text>
      <View style={styles.steps}>
        {steps.map((step) => (
          <View key={step.n} style={styles.step}>
            <Text style={[styles.stepN, { color: L.coral }]}>{step.n}</Text>
            <View style={styles.stepCopy}>
              <Text style={[styles.stepTitle, { color: L.cream }]}>{step.title}</Text>
              <Text style={[styles.stepText, { color: L.creamMuted }]}>{step.text}</Text>
            </View>
          </View>
        ))}
      </View>
    </SectionShell>
  );
}

export function TemplatesShowcase({ onLayout }: { onLayout?: (e: LayoutChangeEvent) => void }) {
  const L = useLandingTokens();
  const scrollRef = useRef<ScrollView>(null);
  const showcases = TEMPLATES.filter((t) =>
    ['aurore', 'neon', 'pellicule', 'hiver', 'elegance', 'celebration', 'summit'].includes(t.key),
  );

  return (
    <SectionShell onLayout={onLayout} padTop={56}>
      <Text style={[styles.title, { color: L.cream }]}>Les modèles</Text>
      <Text style={[styles.lead, { color: L.creamMuted }]}>
        Chaque univers garde sa mise en page. Vous personnalisez le contenu.
      </Text>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.galleryTrack}
        decelerationRate="fast"
        snapToInterval={248}
      >
        {showcases.map((template) => (
          <View key={template.key} style={styles.galleryItem}>
            <MarketingTemplatePreview template={template} width={228} />
          </View>
        ))}
      </ScrollView>
    </SectionShell>
  );
}

export function FinalCtaSection() {
  const router = useRouter();
  const L = useLandingTokens();

  return (
    <SectionShell padTop={56}>
      <View style={styles.final}>
        <Text style={[styles.finalTitle, { color: L.cream }]}>
          Créez votre invitation
        </Text>
        <Text style={[styles.finalText, { color: L.creamMuted }]}>
          Publiez quand vous êtes prêt.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/onboarding')}
          style={({ pressed }) => [
            styles.finalCta,
            { backgroundColor: L.coral },
            pressed && { opacity: 0.88 },
          ]}
        >
          <Text style={styles.finalCtaLabel}>Commencer</Text>
        </Pressable>
      </View>
    </SectionShell>
  );
}

export function MarketingFooter() {
  const router = useRouter();
  const L = useLandingTokens();

  return (
    <View style={[styles.footer, { borderTopColor: L.border }]}>
      <View style={styles.footerInner}>
        <Text style={[styles.footerBrand, { color: L.cream }]}>MK Events</Text>
        <View style={styles.footerLinks}>
          <Pressable onPress={() => router.push('/login')} hitSlop={8}>
            <Text style={[styles.footerLink, { color: L.creamMuted }]}>Connexion</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/onboarding')} hitSlop={8}>
            <Text style={[styles.footerLink, { color: L.creamMuted }]}>Commencer</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  sectionInner: {
    maxWidth: LANDING.maxWidth,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontFamily: fontFamilies.serifSemiBold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  lead: {
    fontFamily: fontFamilies.sans,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 28,
    maxWidth: 420,
  },
  steps: {
    gap: 20,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  stepN: {
    fontFamily: fontFamilies.serifSemiBold,
    fontSize: 22,
    lineHeight: 28,
    width: 28,
  },
  stepCopy: {
    flex: 1,
    gap: 4,
    paddingTop: 2,
  },
  stepTitle: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 16,
    lineHeight: 22,
  },
  stepText: {
    fontFamily: fontFamilies.sans,
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 440,
  },
  galleryTrack: {
    paddingRight: 20,
    gap: 18,
    paddingBottom: 8,
  },
  galleryItem: {
    marginRight: 4,
  },
  final: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 36,
  },
  finalTitle: {
    fontFamily: fontFamilies.serifSemiBold,
    fontSize: 30,
    lineHeight: 36,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  finalText: {
    fontFamily: fontFamilies.sans,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  finalCta: {
    marginTop: 8,
    minWidth: 200,
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  finalCtaLabel: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  footer: {
    width: '100%',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    marginTop: 24,
  },
  footerInner: {
    maxWidth: LANDING.maxWidth,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  footerBrand: {
    fontFamily: fontFamilies.serifSemiBold,
    fontSize: 16,
  },
  footerLinks: {
    flexDirection: 'row',
    gap: 20,
  },
  footerLink: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 13,
  },
});
