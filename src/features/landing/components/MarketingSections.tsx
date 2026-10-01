/**
 * Sections marketing sous le fold.
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
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useBreakpoint } from '@/hooks/useBreakpoint';
import { fontFamilies, shadows } from '@/constants/theme';
import { TEMPLATES } from '@/features/templates/registry';
import { BentoCard } from './BentoCard';
import { MarketingTemplatePreview } from './MarketingTemplatePreview';
import { LANDING } from '../landingTokens';

export function SectionShell({
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

export function SectionHead({
  kicker,
  title,
  subtitle,
}: {
  kicker: string;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.head}>
      <Text style={styles.kicker}>{kicker}</Text>
      <Text style={styles.headTitle}>{title}</Text>
      <Text style={styles.headSubtitle}>{subtitle}</Text>
    </View>
  );
}

export function HowItWorksSection({ onLayout }: { onLayout?: (e: LayoutChangeEvent) => void }) {
  const steps = [
    {
      n: '01',
      title: 'Choisissez un modèle',
      text: 'Mariage, anniversaire ou conférence — une identité visuelle prête à personnaliser.',
    },
    {
      n: '02',
      title: 'Personnalisez le studio',
      text: 'Textes, photos, récit, programme et RSVP : tout se règle en temps réel.',
    },
    {
      n: '03',
      title: 'Publiez et suivez',
      text: 'Chaque invité reçoit son lien. Vous voyez les réponses et le check-in QR.',
    },
  ];

  return (
    <SectionShell onLayout={onLayout}>
      <SectionHead
        kicker="Parcours"
        title="Trois gestes, une invitation vivante"
        subtitle="De l’idée au jour J, sans PDF figé ni tableur d’invités."
      />
      <View style={styles.steps}>
        {steps.map((step) => (
          <View key={step.n} style={styles.step}>
            <Text style={styles.stepN}>{step.n}</Text>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepText}>{step.text}</Text>
          </View>
        ))}
      </View>
    </SectionShell>
  );
}

export function FeaturesSection({ onLayout }: { onLayout?: (e: LayoutChangeEvent) => void }) {
  const { isDesktop } = useBreakpoint();
  const features = [
    {
      icon: 'create-outline' as const,
      title: 'Studio guidé',
      description: 'Édition pas à pas : infos, photos, récit, boissons et publication.',
    },
    {
      icon: 'mail-open-outline' as const,
      title: 'RSVP intelligent',
      description: 'Oui, non, peut-être — avec options boissons et suivi en direct.',
    },
    {
      icon: 'qr-code-outline' as const,
      title: 'Pass QR',
      description: 'Chaque invité a son lien personnel et son pass pour le check-in.',
    },
    {
      icon: 'people-outline' as const,
      title: 'Plan de tables',
      description: 'Organisez les places, importez vos listes, gardez le contrôle.',
    },
    {
      icon: 'images-outline' as const,
      title: 'Galerie & livre d’or',
      description: 'Moments partagés et messages des proches, au même endroit.',
    },
    {
      icon: 'color-palette-outline' as const,
      title: 'Modèles signature',
      description: 'Aurore, Néon, Pellicule, Hiver… chaque invitation a son caractère.',
    },
  ];

  return (
    <SectionShell onLayout={onLayout}>
      <SectionHead
        kicker="Fonctionnalités"
        title="Tout ce qu’il faut le jour J"
        subtitle="Création, diffusion et accueil des invités — dans une seule expérience."
      />
      <View style={[styles.bento, isDesktop && styles.bentoDesktop]}>
        {features.map((item) => (
          <View key={item.title} style={[styles.bentoCell, isDesktop && styles.bentoCellDesktop]}>
            <BentoCard icon={item.icon} title={item.title} description={item.description} />
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
      <SectionHead
        kicker="Modèles"
        title="Des univers, pas des gabarits"
        subtitle="Chaque modèle garde sa palette et sa mise en page — vous personnalisez le contenu."
      />
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

export function GuestTeaserSection() {
  const points = [
    { icon: 'link-outline' as const, label: 'Un lien personnel' },
    { icon: 'checkmark-circle-outline' as const, label: 'RSVP en un geste' },
    { icon: 'ticket-outline' as const, label: 'Pass QR le jour J' },
  ];

  return (
    <SectionShell padTop={40}>
      <View style={styles.guestBand}>
        <Text style={styles.kicker}>Côté invité</Text>
        <Text style={styles.guestTitle}>Ouvrir. Répondre. Entrer.</Text>
        <Text style={styles.guestText}>
          L’invitation se lit d’un scroll : couverture, programme, compte à rebours,
          réponse et pass — sans application à installer.
        </Text>
        <View style={styles.guestRow}>
          {points.map((point) => (
            <View key={point.label} style={styles.guestPoint}>
              <Ionicons name={point.icon} size={18} color={LANDING.coral} />
              <Text style={styles.guestPointLabel}>{point.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </SectionShell>
  );
}

export function FinalCtaSection() {
  const router = useRouter();

  return (
    <SectionShell padTop={48}>
      <View style={styles.final}>
        <Text style={styles.finalTitle}>Prêt à faire vivre{'\n'}votre invitation ?</Text>
        <Text style={styles.finalText}>
          Créez votre événement en quelques minutes. Publiez quand vous êtes prêt.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/onboarding')}
          style={({ pressed }) => [styles.finalCta, pressed && { opacity: 0.88 }, shadows.sm]}
        >
          <Text style={styles.finalCtaLabel}>Créer mon invitation</Text>
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
        <Text style={styles.footerTag}>Invitations numériques vivantes</Text>
        <View style={styles.footerLinks}>
          <Pressable onPress={() => router.push('/login')} hitSlop={8}>
            <Text style={styles.footerLink}>Connexion</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/register')} hitSlop={8}>
            <Text style={styles.footerLink}>Inscription</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/onboarding')} hitSlop={8}>
            <Text style={styles.footerLink}>Commencer</Text>
          </Pressable>
        </View>
        <Text style={styles.footerCopy}>© {new Date().getFullYear()} MK Events</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  sectionInner: {
    maxWidth: LANDING.maxWidth,
    width: '100%',
    alignSelf: 'center',
  },
  head: {
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 28,
    maxWidth: 560,
  },
  kicker: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 12,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    color: LANDING.coral,
  },
  headTitle: {
    fontFamily: fontFamilies.serifSemiBold,
    fontSize: 30,
    lineHeight: 36,
    color: LANDING.cream,
    letterSpacing: -0.4,
  },
  headSubtitle: {
    fontFamily: fontFamilies.sans,
    fontSize: 15,
    lineHeight: 22,
    color: LANDING.creamMuted,
  },
  steps: {
    gap: 22,
  },
  step: {
    gap: 6,
    paddingBottom: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: LANDING.border,
  },
  stepN: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 12,
    letterSpacing: 2,
    color: LANDING.coral,
  },
  stepTitle: {
    fontFamily: fontFamilies.serifMedium,
    fontSize: 22,
    lineHeight: 28,
    color: LANDING.cream,
  },
  stepText: {
    fontFamily: fontFamilies.sans,
    fontSize: 14,
    lineHeight: 21,
    color: LANDING.creamMuted,
    maxWidth: 480,
  },
  bento: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  bentoDesktop: {
    gap: 14,
  },
  bentoCell: {
    width: '100%',
  },
  bentoCellDesktop: {
    width: '31.5%',
    flexGrow: 1,
  },
  galleryTrack: {
    paddingRight: 20,
    gap: 18,
    paddingBottom: 8,
  },
  galleryItem: {
    marginRight: 4,
  },
  guestBand: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: LANDING.border,
    backgroundColor: LANDING.surface,
    paddingVertical: 36,
    paddingHorizontal: 24,
    gap: 12,
  },
  guestTitle: {
    fontFamily: fontFamilies.serifSemiBold,
    fontSize: 28,
    lineHeight: 34,
    color: LANDING.cream,
    letterSpacing: -0.3,
  },
  guestText: {
    fontFamily: fontFamilies.sans,
    fontSize: 15,
    lineHeight: 22,
    color: LANDING.creamMuted,
    maxWidth: 520,
  },
  guestRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 12,
  },
  guestPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  guestPointLabel: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 13,
    color: LANDING.cream,
  },
  final: {
    alignItems: 'center',
    gap: 14,
    paddingVertical: 28,
  },
  finalTitle: {
    fontFamily: fontFamilies.serifSemiBold,
    fontSize: 32,
    lineHeight: 38,
    color: LANDING.cream,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  finalText: {
    fontFamily: fontFamilies.sans,
    fontSize: 15,
    lineHeight: 22,
    color: LANDING.creamMuted,
    textAlign: 'center',
    maxWidth: 400,
  },
  finalCta: {
    marginTop: 8,
    minWidth: 260,
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: LANDING.coral,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  finalCtaLabel: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  footer: {
    width: '100%',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: LANDING.border,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 40,
  },
  footerInner: {
    maxWidth: LANDING.maxWidth,
    width: '100%',
    alignSelf: 'center',
    gap: 8,
  },
  footerBrand: {
    fontFamily: fontFamilies.serifSemiBold,
    fontSize: 18,
    color: LANDING.cream,
  },
  footerTag: {
    fontFamily: fontFamilies.sans,
    fontSize: 13,
    color: LANDING.creamFaint,
  },
  footerLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
    marginTop: 12,
  },
  footerLink: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 13,
    color: LANDING.creamMuted,
  },
  footerCopy: {
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    color: LANDING.creamFaint,
    marginTop: 18,
  },
});
