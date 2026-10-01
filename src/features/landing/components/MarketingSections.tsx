/**
 * Sections landing clair — cartes soft, rythme espacé (inspiré Edulex).
 */

import { type ReactNode, useRef } from 'react';
import {
  Platform,
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
import { LANDING } from '../landingTokens';

function SectionShell({
  children,
  onLayout,
  padTop = 56,
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
  const steps = [
    {
      n: '01',
      title: 'Choisissez un modèle',
      text: 'Une identité visuelle prête pour votre événement.',
    },
    {
      n: '02',
      title: 'Personnalisez',
      text: 'Textes, photos, programme et RSVP en temps réel.',
    },
    {
      n: '03',
      title: 'Publiez',
      text: 'Chaque invité reçoit son lien, son pass QR et répond.',
    },
  ];

  return (
    <SectionShell onLayout={onLayout}>
      <Text style={styles.kicker}>Parcours</Text>
      <Text style={styles.title}>Comment ça marche</Text>
      <Text style={styles.lead}>Trois étapes. Rien de superflu.</Text>

      <View style={styles.stepGrid}>
        {steps.map((step) => (
          <View key={step.n} style={styles.stepCard}>
            <Text style={styles.stepN}>{step.n}</Text>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepText}>{step.text}</Text>
          </View>
        ))}
      </View>
    </SectionShell>
  );
}

export function TemplatesShowcase({ onLayout }: { onLayout?: (e: LayoutChangeEvent) => void }) {
  const scrollRef = useRef<ScrollView>(null);
  const showcases = TEMPLATES.filter((t) =>
    ['aurore', 'neon', 'pellicule', 'hiver', 'elegance', 'celebration', 'summit'].includes(t.key),
  );

  return (
    <SectionShell onLayout={onLayout} padTop={48}>
      <Text style={styles.kicker}>Collection</Text>
      <Text style={styles.title}>Les modèles</Text>
      <Text style={styles.lead}>
        Chaque univers garde sa mise en page. Vous personnalisez le contenu.
      </Text>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.galleryTrack}
        decelerationRate="fast"
        snapToInterval={252}
      >
        {showcases.map((template) => (
          <View key={template.key} style={styles.galleryItem}>
            <MarketingTemplatePreview template={template} width={232} />
          </View>
        ))}
      </ScrollView>
    </SectionShell>
  );
}

export function FinalCtaSection() {
  const router = useRouter();

  return (
    <SectionShell padTop={48}>
      <View style={styles.finalCard}>
        <Text style={styles.finalTitle}>Créez votre invitation</Text>
        <Text style={styles.finalText}>Publiez quand vous êtes prêt.</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/onboarding')}
          style={({ pressed }) => [styles.finalCta, pressed && { opacity: 0.88 }]}
        >
          <Text style={styles.finalCtaLabel}>Commencer</Text>
        </Pressable>
      </View>
    </SectionShell>
  );
}

export function MarketingFooter() {
  const router = useRouter();

  return (
    <View style={styles.footer}>
      <View style={styles.footerInner}>
        <Text style={styles.footerBrand}>MK Events</Text>
        <View style={styles.footerLinks}>
          <Pressable onPress={() => router.push('/login')} hitSlop={8}>
            <Text style={styles.footerLink}>Connexion</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/onboarding')} hitSlop={8}>
            <Text style={styles.footerLink}>Commencer</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const cardShadow =
  Platform.OS === 'web'
    ? ({ boxShadow: `0 18px 48px ${LANDING.shadow}` } as const)
    : ({
        shadowColor: '#2A1F24',
        shadowOpacity: 0.08,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
        elevation: 3,
      } as const);

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
  kicker: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 12,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: LANDING.coral,
    marginBottom: 10,
  },
  title: {
    fontFamily: fontFamilies.serifSemiBold,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.4,
    color: LANDING.text,
    marginBottom: 8,
  },
  lead: {
    fontFamily: fontFamilies.sans,
    fontSize: 15,
    lineHeight: 22,
    color: LANDING.textMuted,
    marginBottom: 28,
    maxWidth: 420,
  },
  stepGrid: {
    gap: 12,
  },
  stepCard: {
    backgroundColor: LANDING.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: LANDING.border,
    paddingVertical: 22,
    paddingHorizontal: 22,
    gap: 8,
    ...cardShadow,
  },
  stepN: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 12,
    letterSpacing: 1.6,
    color: LANDING.coral,
  },
  stepTitle: {
    fontFamily: fontFamilies.serifMedium,
    fontSize: 22,
    lineHeight: 28,
    color: LANDING.text,
  },
  stepText: {
    fontFamily: fontFamilies.sans,
    fontSize: 14,
    lineHeight: 21,
    color: LANDING.textMuted,
    maxWidth: 440,
  },
  galleryTrack: {
    paddingRight: 20,
    gap: 18,
    paddingBottom: 12,
  },
  galleryItem: {
    marginRight: 4,
  },
  finalCard: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 40,
    paddingHorizontal: 24,
    borderRadius: 28,
    backgroundColor: LANDING.surface,
    borderWidth: 1,
    borderColor: LANDING.border,
    ...cardShadow,
  },
  finalTitle: {
    fontFamily: fontFamilies.serifSemiBold,
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'center',
    color: LANDING.text,
    letterSpacing: -0.3,
  },
  finalText: {
    fontFamily: fontFamilies.sans,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: LANDING.textMuted,
  },
  finalCta: {
    marginTop: 8,
    minWidth: 200,
    minHeight: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    backgroundColor: LANDING.coral,
    shadowColor: LANDING.coral,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  finalCtaLabel: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  footer: {
    width: '100%',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: LANDING.border,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    marginTop: 28,
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
    color: LANDING.text,
  },
  footerLinks: {
    flexDirection: 'row',
    gap: 20,
  },
  footerLink: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 13,
    color: LANDING.textMuted,
  },
});
