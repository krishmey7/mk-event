/**
 * Sections landing clair — cartes soft, rythme espacé (inspiré Edulex).
 */

import { type ReactNode, useRef, useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';

import { landingFonts } from '../landingFonts';
import { useBreakpoint } from '@/hooks/useBreakpoint';
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

export function PlatformSection({ onLayout }: { onLayout?: (e: LayoutChangeEvent) => void }) {
  const { isDesktop } = useBreakpoint();

  return (
    <SectionShell padTop={72} onLayout={onLayout}>
      <View style={[styles.platformGrid, isDesktop && styles.platformGridDesktop]}>
        <View style={styles.platformCopy}>
          <Text style={styles.kicker}>La plateforme</Text>
          <Text style={styles.title}>Tout votre événement, dans un seul parcours</Text>
          <Text style={styles.lead}>
            La création côté organisateur et l’expérience côté invité restent reliées,
            du premier texte au contrôle des entrées.
          </Text>
          <View style={styles.miniFeatureList}>
            {[
              ['sparkles-outline', 'Studio visuel en temps réel'],
              ['people-outline', 'Invités, RSVP et tables'],
              ['qr-code-outline', 'Pass personnels et check-in'],
            ].map(([icon, label]) => (
              <View key={label} style={styles.miniFeature}>
                <View style={styles.miniFeatureIcon}>
                  <Ionicons
                    name={icon as keyof typeof Ionicons.glyphMap}
                    size={17}
                    color={LANDING.coral}
                  />
                </View>
                <Text style={styles.miniFeatureLabel}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.productCanvas}>
          <View style={styles.productGlow} />
          <View style={[styles.productWindow, cardShadow]}>
            <View style={styles.productWindowTop}>
              <View style={styles.windowDots}>
                <View style={styles.windowDot} />
                <View style={styles.windowDot} />
                <View style={styles.windowDot} />
              </View>
              <Text style={styles.windowTitle}>Tableau de bord</Text>
              <View style={styles.livePill}>
                <View style={styles.liveDot} />
                <Text style={styles.liveLabel}>Publié</Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              {[
                ['Invités', '84'],
                ['Confirmés', '61'],
                ['En attente', '18'],
              ].map(([label, value], index) => (
                <View key={label} style={[styles.stat, index === 1 && styles.statAccent]}>
                  <Text style={styles.statValue}>{value}</Text>
                  <Text style={styles.statLabel}>{label}</Text>
                </View>
              ))}
            </View>
            <View style={styles.productBody}>
              <View style={styles.responseCard}>
                <View style={styles.responseAvatar}>
                  <Text style={styles.responseAvatarLabel}>AM</Text>
                </View>
                <View style={styles.responseCopy}>
                  <Text style={styles.responseName}>Alice & Marc</Text>
                  <Text style={styles.responseMeta}>2 places · Table Jardin</Text>
                </View>
                <View style={styles.responseStatus}>
                  <Ionicons name="checkmark" size={13} color="#47723B" />
                  <Text style={styles.responseStatusLabel}>Confirmé</Text>
                </View>
              </View>
              <View style={styles.timelineCard}>
                <View style={styles.timelineHead}>
                  <Text style={styles.timelineTitle}>Progression</Text>
                  <Text style={styles.timelineValue}>3 / 4</Text>
                </View>
                <View style={styles.timelineTrack}>
                  <View style={styles.timelineFill} />
                </View>
                <View style={styles.timelineLabels}>
                  <Text style={styles.timelineLabel}>Invitation</Text>
                  <Text style={styles.timelineLabel}>Invités</Text>
                  <Text style={styles.timelineLabel}>Jour J</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </SectionShell>
  );
}

export function HowItWorksSection({ onLayout }: { onLayout?: (e: LayoutChangeEvent) => void }) {
  const { isDesktop } = useBreakpoint();
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

      <View style={[styles.stepGrid, isDesktop && styles.stepGridDesktop]}>
        {steps.map((step) => (
          <View key={step.n} style={[styles.stepCard, isDesktop && styles.stepCardDesktop]}>
            <Text style={styles.stepN}>{step.n}</Text>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepText}>{step.text}</Text>
          </View>
        ))}
      </View>
    </SectionShell>
  );
}

export function CapabilitiesSection() {
  const { isDesktop } = useBreakpoint();
  const capabilities = [
    {
      icon: 'create-outline' as const,
      title: 'Studio guidé',
      text: 'Modifiez l’invitation sans toucher à sa cohérence visuelle.',
    },
    {
      icon: 'calendar-outline' as const,
      title: 'Programme vivant',
      text: 'Horaires, lieux, récit et compte à rebours dans la même page.',
    },
    {
      icon: 'mail-open-outline' as const,
      title: 'RSVP structuré',
      text: 'Présence, accompagnants, boissons et régimes sans tableur.',
    },
    {
      icon: 'grid-outline' as const,
      title: 'Plan de tables',
      text: 'Organisez et assignez les invités depuis leur fiche.',
    },
    {
      icon: 'images-outline' as const,
      title: 'Galerie & livre d’or',
      text: 'Prolongez l’expérience avant et après l’événement.',
    },
    {
      icon: 'scan-outline' as const,
      title: 'Entrée QR',
      text: 'Scannez les pass et visualisez les arrivées en direct.',
    },
  ];

  return (
    <SectionShell padTop={80}>
      <View style={styles.centerHead}>
        <Text style={styles.kicker}>Fonctionnalités</Text>
        <Text style={[styles.title, styles.centerText]}>Simple à créer. Complet à gérer.</Text>
        <Text style={[styles.lead, styles.centerText]}>
          Des outils utiles avant, pendant et après votre événement.
        </Text>
      </View>
      <View style={[styles.capabilityGrid, isDesktop && styles.capabilityGridDesktop]}>
        {capabilities.map((item) => (
          <View
            key={item.title}
            style={[styles.capabilityCard, isDesktop && styles.capabilityCardDesktop]}
          >
            <View style={styles.capabilityIcon}>
              <Ionicons name={item.icon} size={21} color={LANDING.coral} />
            </View>
            <Text style={styles.capabilityTitle}>{item.title}</Text>
            <Text style={styles.capabilityText}>{item.text}</Text>
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

const AUDIENCES = [
  {
    key: 'wedding',
    label: 'Mariage',
    title: 'Une expérience à la hauteur du grand jour',
    text: 'Invitation, récit, programme, RSVP, tables, galerie et livre d’or.',
    icon: 'heart-outline' as const,
  },
  {
    key: 'birthday',
    label: 'Célébration',
    title: 'Réunir simplement, célébrer pleinement',
    text: 'Une page expressive pour inviter, informer et recueillir les réponses.',
    icon: 'sparkles-outline' as const,
  },
  {
    key: 'professional',
    label: 'Professionnel',
    title: 'Des inscriptions jusqu’au contrôle d’accès',
    text: 'Informations, confirmations et pass QR réunis dans un parcours fluide.',
    icon: 'briefcase-outline' as const,
  },
] as const;

export function AudienceSection() {
  const [active, setActive] = useState(0);
  const selected = AUDIENCES[active];

  return (
    <SectionShell padTop={76}>
      <View style={styles.audienceCard}>
        <View style={styles.audienceTabs}>
          {AUDIENCES.map((item, index) => (
            <Pressable
              key={item.key}
              onPress={() => setActive(index)}
              style={[styles.audienceTab, index === active && styles.audienceTabActive]}
            >
              <Text
                style={[
                  styles.audienceTabLabel,
                  index === active && styles.audienceTabLabelActive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.audienceBody}>
          <View style={styles.audienceIcon}>
            <Ionicons name={selected.icon} size={28} color={LANDING.coral} />
          </View>
          <Text style={styles.audienceTitle}>{selected.title}</Text>
          <Text style={styles.audienceText}>{selected.text}</Text>
          <View style={styles.audienceProgress}>
            {AUDIENCES.map((item, index) => (
              <View
                key={item.key}
                style={[
                  styles.audienceProgressItem,
                  index === active && styles.audienceProgressItemActive,
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    </SectionShell>
  );
}

const FAQS = [
  {
    q: 'Les invités doivent-ils installer une application ?',
    a: 'Non. Chaque invitation s’ouvre depuis un lien personnel, directement dans le navigateur.',
  },
  {
    q: 'Puis-je modifier l’invitation après sa publication ?',
    a: 'Oui. Vous pouvez ajuster le contenu puis republier pour rendre les changements visibles.',
  },
  {
    q: 'Comment fonctionnent les réponses et les pass QR ?',
    a: 'L’invité répond depuis sa page. Après confirmation, son pass personnel devient disponible pour le jour J.',
  },
  {
    q: 'Quels événements puis-je créer ?',
    a: 'MK Events couvre les mariages, célébrations et événements professionnels avec des modèles dédiés.',
  },
];

export function FaqSection({ onLayout }: { onLayout?: (e: LayoutChangeEvent) => void }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <SectionShell padTop={76} onLayout={onLayout}>
      <Text style={styles.kicker}>Questions fréquentes</Text>
      <Text style={styles.title}>L’essentiel, avant de commencer</Text>
      <View style={styles.faqList}>
        {FAQS.map((item, index) => {
          const expanded = open === index;
          return (
            <Pressable
              key={item.q}
              accessibilityRole="button"
              accessibilityState={{ expanded }}
              onPress={() => setOpen(expanded ? null : index)}
              style={styles.faqItem}
            >
              <View style={styles.faqQuestionRow}>
                <Text style={styles.faqQuestion}>{item.q}</Text>
                <View style={[styles.faqPlus, expanded && styles.faqPlusOpen]}>
                  <Ionicons name={expanded ? 'remove' : 'add'} size={18} color={LANDING.text} />
                </View>
              </View>
              {expanded ? <Text style={styles.faqAnswer}>{item.a}</Text> : null}
            </Pressable>
          );
        })}
      </View>
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
    ...landingFonts.semibold,
    fontSize: 12,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: LANDING.coral,
    marginBottom: 10,
  },
  title: {
    ...landingFonts.bold,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.4,
    color: LANDING.text,
    marginBottom: 8,
  },
  lead: {
    ...landingFonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: LANDING.textMuted,
    marginBottom: 28,
    maxWidth: 420,
  },
  platformGrid: {
    gap: 36,
    alignItems: 'center',
  },
  platformGridDesktop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 64,
  },
  platformCopy: {
    flex: 1,
    maxWidth: 470,
  },
  miniFeatureList: {
    gap: 12,
  },
  miniFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  miniFeatureIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: LANDING.coralSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniFeatureLabel: {
    ...landingFonts.medium,
    fontSize: 14,
    color: LANDING.text,
  },
  productCanvas: {
    width: '100%',
    maxWidth: 540,
    position: 'relative',
    paddingVertical: 20,
  },
  productGlow: {
    position: 'absolute',
    width: '82%',
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: LANDING.plumSoft,
    alignSelf: 'center',
    top: -20,
  },
  productWindow: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: LANDING.border,
    backgroundColor: LANDING.surface,
    overflow: 'hidden',
  },
  productWindowTop: {
    minHeight: 58,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: LANDING.border,
  },
  windowDots: {
    flexDirection: 'row',
    gap: 5,
  },
  windowDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(42, 31, 36, 0.16)',
  },
  windowTitle: {
    flex: 1,
    textAlign: 'center',
    ...landingFonts.semibold,
    fontSize: 12,
    color: LANDING.textMuted,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(92, 122, 74, 0.12)',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#5C7A4A',
  },
  liveLabel: {
    ...landingFonts.semibold,
    fontSize: 10,
    color: '#47723B',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    padding: 14,
  },
  stat: {
    flex: 1,
    minHeight: 78,
    borderRadius: 16,
    backgroundColor: LANDING.bgSoft,
    padding: 13,
    justifyContent: 'center',
  },
  statAccent: {
    backgroundColor: LANDING.coralSoft,
  },
  statValue: {
    ...landingFonts.bold,
    fontSize: 24,
    color: LANDING.text,
  },
  statLabel: {
    ...landingFonts.regular,
    fontSize: 10,
    color: LANDING.textMuted,
  },
  productBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 10,
  },
  responseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: LANDING.border,
    padding: 12,
  },
  responseAvatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: LANDING.plum,
    alignItems: 'center',
    justifyContent: 'center',
  },
  responseAvatarLabel: {
    ...landingFonts.semibold,
    fontSize: 10,
    color: '#FFFFFF',
  },
  responseCopy: {
    flex: 1,
    gap: 2,
  },
  responseName: {
    ...landingFonts.semibold,
    fontSize: 12,
    color: LANDING.text,
  },
  responseMeta: {
    ...landingFonts.regular,
    fontSize: 10,
    color: LANDING.textMuted,
  },
  responseStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: 'rgba(92, 122, 74, 0.12)',
  },
  responseStatusLabel: {
    ...landingFonts.semibold,
    fontSize: 9,
    color: '#47723B',
  },
  timelineCard: {
    borderRadius: 16,
    backgroundColor: LANDING.bgSoft,
    padding: 14,
  },
  timelineHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  timelineTitle: {
    ...landingFonts.semibold,
    fontSize: 11,
    color: LANDING.text,
  },
  timelineValue: {
    ...landingFonts.semibold,
    fontSize: 10,
    color: LANDING.coral,
  },
  timelineTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(42, 31, 36, 0.08)',
    overflow: 'hidden',
  },
  timelineFill: {
    width: '74%',
    height: '100%',
    borderRadius: 3,
    backgroundColor: LANDING.coral,
  },
  timelineLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timelineLabel: {
    ...landingFonts.regular,
    fontSize: 9,
    color: LANDING.textFaint,
  },
  stepGrid: {
    gap: 12,
  },
  stepGridDesktop: {
    flexDirection: 'row',
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
  stepCardDesktop: {
    flex: 1,
    minHeight: 190,
  },
  stepN: {
    ...landingFonts.semibold,
    fontSize: 12,
    letterSpacing: 1.6,
    color: LANDING.coral,
  },
  stepTitle: {
    ...landingFonts.semibold,
    fontSize: 22,
    lineHeight: 28,
    color: LANDING.text,
  },
  stepText: {
    ...landingFonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: LANDING.textMuted,
    maxWidth: 440,
  },
  centerHead: {
    alignItems: 'center',
    marginBottom: 2,
  },
  centerText: {
    textAlign: 'center',
  },
  capabilityGrid: {
    gap: 12,
  },
  capabilityGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  capabilityCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: LANDING.border,
    backgroundColor: LANDING.surfaceGlass,
    padding: 22,
  },
  capabilityCardDesktop: {
    width: '31.8%',
    flexGrow: 1,
  },
  capabilityIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: LANDING.coralSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  capabilityTitle: {
    ...landingFonts.semibold,
    fontSize: 19,
    color: LANDING.text,
    marginBottom: 6,
  },
  capabilityText: {
    ...landingFonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: LANDING.textMuted,
  },
  galleryTrack: {
    paddingRight: 20,
    gap: 18,
    paddingBottom: 12,
  },
  galleryItem: {
    marginRight: 4,
  },
  audienceCard: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: LANDING.border,
    backgroundColor: LANDING.surface,
    overflow: 'hidden',
    ...cardShadow,
  },
  audienceTabs: {
    flexDirection: 'row',
    padding: 8,
    gap: 6,
    backgroundColor: LANDING.bgSoft,
  },
  audienceTab: {
    flex: 1,
    minHeight: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  audienceTabActive: {
    backgroundColor: LANDING.surface,
    shadowColor: '#2A1F24',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  audienceTabLabel: {
    ...landingFonts.medium,
    fontSize: 12,
    color: LANDING.textFaint,
  },
  audienceTabLabelActive: {
    ...landingFonts.semibold,
    color: LANDING.text,
  },
  audienceBody: {
    alignItems: 'center',
    paddingVertical: 42,
    paddingHorizontal: 24,
  },
  audienceIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: LANDING.coralSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  audienceTitle: {
    ...landingFonts.bold,
    fontSize: 26,
    lineHeight: 32,
    textAlign: 'center',
    color: LANDING.text,
    maxWidth: 560,
    marginBottom: 10,
  },
  audienceText: {
    ...landingFonts.regular,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    color: LANDING.textMuted,
    maxWidth: 520,
  },
  audienceProgress: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 26,
  },
  audienceProgressItem: {
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: LANDING.borderStrong,
  },
  audienceProgressItemActive: {
    width: 48,
    backgroundColor: LANDING.coral,
  },
  faqList: {
    borderTopWidth: 1,
    borderTopColor: LANDING.border,
  },
  faqItem: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: LANDING.border,
  },
  faqQuestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  faqQuestion: {
    flex: 1,
    ...landingFonts.semibold,
    fontSize: 15,
    lineHeight: 22,
    color: LANDING.text,
  },
  faqPlus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: LANDING.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faqPlusOpen: {
    backgroundColor: LANDING.coralSoft,
    borderColor: 'transparent',
  },
  faqAnswer: {
    ...landingFonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: LANDING.textMuted,
    maxWidth: 700,
    paddingTop: 12,
    paddingRight: 44,
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
    ...landingFonts.bold,
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'center',
    color: LANDING.text,
    letterSpacing: -0.3,
  },
  finalText: {
    ...landingFonts.regular,
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
    ...landingFonts.semibold,
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
    ...landingFonts.bold,
    fontSize: 16,
    color: LANDING.text,
  },
  footerLinks: {
    flexDirection: 'row',
    gap: 20,
  },
  footerLink: {
    ...landingFonts.medium,
    fontSize: 13,
    color: LANDING.textMuted,
  },
});
