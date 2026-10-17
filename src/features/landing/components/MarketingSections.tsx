/**
 * Sections landing clair — rythme éditorial MK Events.
 */

import { type ReactNode, useRef, useState } from 'react';
import {
  Image,
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

import { fontFamilies } from '@/constants/theme';
import { landingFonts } from '../landingFonts';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { TEMPLATES } from '@/features/templates/registry';
import { MarketingTemplatePreview } from './MarketingTemplatePreview';
import { LandingReveal } from './LandingReveal';
import { LandingCta } from './LandingCta';
import { HowItWorksTrack } from './HowItWorksTrack';
import { LANDING } from '../landingTokens';

const PLATFORM_PHOTO = require('../../../../assets/landing/platform-moment.jpg');
const AUDIENCE_PHOTOS = {
  wedding: require('../../../../assets/landing/audience-mariage.jpg'),
  birthday: require('../../../../assets/landing/audience-moment.jpg'),
  professional: require('../../../../assets/landing/audience-professionnel.jpg'),
} as const;

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

function SectionIntro({
  kicker,
  title,
  lead,
  center,
}: {
  kicker: string;
  title: string;
  lead?: string;
  center?: boolean;
}) {
  // Un seul bloc motion (comme la colonne gauche Edulex plateforme).
  return (
    <LandingReveal y={20} duration={600}>
      <View style={center ? styles.centerHead : undefined}>
        <Text style={[styles.kicker, center && styles.centerText]}>{kicker}</Text>
        <Text style={[styles.title, center && styles.centerText]}>{title}</Text>
        {lead ? <Text style={[styles.lead, center && styles.centerText]}>{lead}</Text> : null}
      </View>
    </LandingReveal>
  );
}

export function PlatformSection({ onLayout }: { onLayout?: (e: LayoutChangeEvent) => void }) {
  const { isDesktop } = useBreakpoint();

  return (
    <SectionShell padTop={72} onLayout={onLayout}>
      <View style={[styles.platformGrid, isDesktop && styles.platformGridDesktop]}>
        <View style={styles.platformCopy}>
          <SectionIntro
            kicker="La plateforme"
            title="Tout votre événement, dans un seul parcours"
            lead="La création côté organisateur et l’expérience côté invité restent reliées, du premier texte au contrôle des entrées."
          />
          <View style={styles.miniFeatureList}>
            {[
              ['sparkles-outline', 'Studio visuel en temps réel'],
              ['people-outline', 'Invités, RSVP et tables'],
              ['qr-code-outline', 'Pass personnels et check-in'],
            ].map(([icon, label], index) => (
              <LandingReveal
                key={label}
                x={-20}
                y={0}
                delay={index * 100}
                duration={500}
              >
                <View style={styles.miniFeature}>
                  <View style={styles.miniFeatureIcon}>
                    <Ionicons
                      name={icon as keyof typeof Ionicons.glyphMap}
                      size={17}
                      color={LANDING.coral}
                    />
                  </View>
                  <Text style={styles.miniFeatureLabel}>{label}</Text>
                </View>
              </LandingReveal>
            ))}
          </View>
        </View>

        <LandingReveal y={20} duration={600} style={isDesktop ? { flex: 1 } : undefined}>
          <View style={[styles.photoStage, isDesktop && styles.photoStageDesktop]}>
            <View style={styles.photoOffset} />
            <View style={[styles.photoFrame, cardShadow]}>
              <Image
                source={PLATFORM_PHOTO}
                style={styles.photoImage}
                resizeMode="cover"
                accessibilityLabel="Couple célébrant son mariage, pétales de roses en l’air"
              />
            </View>
          </View>
        </LandingReveal>
      </View>
    </SectionShell>
  );
}

const HOW_STEPS = [
  {
    key: 'types',
    title: 'Choisissez un modèle',
    text: 'Une identité visuelle prête pour votre événement.',
    icon: 'color-palette-outline' as const,
  },
  {
    key: 'studio',
    title: 'Personnalisez',
    text: 'Textes, photos, programme et RSVP dans le même studio.',
    icon: 'create-outline' as const,
  },
  {
    key: 'invite',
    title: 'Publiez & invitez',
    text: 'Chaque invité reçoit son lien personnel et son pass QR.',
    icon: 'send-outline' as const,
  },
  {
    key: 'day',
    title: 'Accueillez',
    text: 'Check-in, galerie et livre d’or le jour J — tout reste lié.',
    icon: 'qr-code-outline' as const,
  },
] as const;

export function HowItWorksSection({ onLayout }: { onLayout?: (e: LayoutChangeEvent) => void }) {
  const { isDesktop } = useBreakpoint();

  return (
    <SectionShell onLayout={onLayout} padTop={80}>
      <LandingReveal y={20} duration={600}>
        <View style={styles.howHead}>
          <Text style={styles.howKicker}>Comment ça marche</Text>
          <Text style={styles.howTitle}>De l’idée au jour J, en un seul parcours</Text>
          <Text style={styles.howLead}>
            Du modèle choisi à l’accueil des invités — sans fichier à télécharger.
          </Text>
        </View>
      </LandingReveal>

      <HowItWorksTrack steps={HOW_STEPS} isDesktop={!!isDesktop} />

      <LandingReveal y={16} duration={600} delay={140}>
        <View style={styles.howQuote}>
          <View style={styles.howQuoteRule} />
          <Text style={styles.howQuoteText}>
            Nous ne remplaçons pas votre événement. Nous le rendons plus simple à partager.
          </Text>
        </View>
      </LandingReveal>
    </SectionShell>
  );
}

const COMPARISON_ROWS = [
  {
    without: 'PDFs figés envoyés par mail',
    with: 'Invitation vivante, toujours à jour',
  },
  {
    without: 'Réponses éparpillées sur WhatsApp',
    with: 'RSVP structuré, centralisé',
  },
  {
    without: 'Tableurs Excel pour les tables',
    with: 'Plan de tables lié aux invités',
  },
  {
    without: 'Pas de contrôle à l’entrée',
    with: 'Pass QR et check-in en direct',
  },
  {
    without: 'Fichier statique, oublié après',
    with: 'Galerie et livre d’or partagés',
  },
] as const;

const CAPABILITIES = [
  {
    icon: 'create-outline' as const,
    title: 'Studio guidé',
    text: 'Modifiez l’invitation sans toucher à sa cohérence visuelle. Textes, photos et rythme restent alignés.',
  },
  {
    icon: 'calendar-outline' as const,
    title: 'Programme vivant',
    text: 'Horaires, lieux, récit et compte à rebours dans la même page — visibles dès la publication.',
  },
  {
    icon: 'mail-open-outline' as const,
    title: 'RSVP structuré',
    text: 'Présence, accompagnants, boissons et régimes collectés proprement, sans tableur ni fils de messages.',
  },
  {
    icon: 'grid-outline' as const,
    title: 'Plan de tables',
    text: 'Organisez et assignez les invités depuis leur fiche. Le placement suit les réponses en temps réel.',
  },
  {
    icon: 'images-outline' as const,
    title: 'Galerie & livre d’or',
    text: 'Prolongez l’expérience avant et après l’événement avec photos et messages des proches.',
  },
  {
    icon: 'scan-outline' as const,
    title: 'Entrée QR',
    text: 'Scannez les pass personnels et visualisez les arrivées en direct le jour J.',
  },
] as const;

export function CapabilitiesSection() {
  const { isDesktop } = useBreakpoint();
  const [compareMode, setCompareMode] = useState<'sans' | 'avec'>('avec');
  const [activeCap, setActiveCap] = useState(0);
  const selected = CAPABILITIES[activeCap];

  return (
    <SectionShell padTop={80}>
      <SectionIntro
        center
        kicker="Fonctionnalités"
        title="Transformez l’expérience de vos invités"
        lead="Découvrez comment MK Events remplace les fichiers et les tableurs par un parcours vivant."
      />

      <LandingReveal y={20} duration={600}>
        <View style={styles.compareBlock}>
          {!isDesktop ? (
            <View style={styles.compareToggle}>
              {([
                ['sans', 'Sans MK'],
                ['avec', 'Avec MK'],
              ] as const).map(([key, label]) => {
                const active = compareMode === key;
                return (
                  <Pressable
                    key={key}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => setCompareMode(key)}
                    style={[
                      styles.comparePill,
                      active && (key === 'avec' ? styles.comparePillAvec : styles.comparePillSans),
                    ]}
                  >
                    <Text
                      style={[
                        styles.comparePillLabel,
                        active &&
                          (key === 'avec'
                            ? styles.comparePillLabelAvec
                            : styles.comparePillLabelSans),
                      ]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          {isDesktop ? (
            <View style={styles.compareColumns}>
              <View style={[styles.compareCol, styles.compareColSans]}>
                <Text style={styles.compareColHeadSans}>Sans MK</Text>
                {COMPARISON_ROWS.map((row) => (
                  <View key={row.without} style={styles.compareRow}>
                    <Ionicons name="close-outline" size={18} color={LANDING.textFaint} />
                    <Text style={styles.compareTextSans}>{row.without}</Text>
                  </View>
                ))}
              </View>
              <View style={[styles.compareCol, styles.compareColAvec]}>
                <Text style={styles.compareColHeadAvec}>Avec MK</Text>
                {COMPARISON_ROWS.map((row) => (
                  <View key={row.with} style={styles.compareRow}>
                    <Ionicons name="checkmark-outline" size={18} color={LANDING.coral} />
                    <Text style={styles.compareTextAvec}>{row.with}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View
              style={[
                styles.compareCol,
                compareMode === 'avec' ? styles.compareColAvec : styles.compareColSans,
              ]}
            >
              <Text
                style={
                  compareMode === 'avec' ? styles.compareColHeadAvec : styles.compareColHeadSans
                }
              >
                {compareMode === 'avec' ? 'Avec MK' : 'Sans MK'}
              </Text>
              {COMPARISON_ROWS.map((row) => (
                <View key={row.without} style={styles.compareRow}>
                  <Ionicons
                    name={compareMode === 'avec' ? 'checkmark-outline' : 'close-outline'}
                    size={18}
                    color={compareMode === 'avec' ? LANDING.coral : LANDING.textFaint}
                  />
                  <Text
                    style={
                      compareMode === 'avec' ? styles.compareTextAvec : styles.compareTextSans
                    }
                  >
                    {compareMode === 'avec' ? row.with : row.without}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </LandingReveal>

      <LandingReveal y={20} duration={600} delay={120}>
        <View style={[styles.capExplorer, isDesktop && styles.capExplorerDesktop]}>
          <View style={[styles.capList, isDesktop && styles.capListDesktop]}>
            {CAPABILITIES.map((item, index) => {
              const active = activeCap === index;
              const num = String(index + 1).padStart(2, '0');
              return (
                <Pressable
                  key={item.title}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => setActiveCap(index)}
                  style={[styles.capRow, active && styles.capRowActive]}
                >
                  <View style={styles.capRowHead}>
                    <Text style={[styles.capNum, active && styles.capNumActive]}>{num}</Text>
                    <Text style={[styles.capTitle, active && styles.capTitleActive]}>
                      {item.title}
                    </Text>
                  </View>
                  {!isDesktop && active ? (
                    <View style={styles.capExpand}>
                      <View style={styles.capExpandIcon}>
                        <Ionicons name={item.icon} size={20} color={LANDING.coral} />
                      </View>
                      <Text style={styles.capExpandText}>{item.text}</Text>
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>

          {isDesktop ? (
            <View style={styles.capDetail}>
              <View style={styles.capDetailIcon}>
                <Ionicons name={selected.icon} size={28} color={LANDING.coral} />
              </View>
              <Text style={styles.capDetailNum}>
                {String(activeCap + 1).padStart(2, '0')}
              </Text>
              <Text style={styles.capDetailTitle}>{selected.title}</Text>
              <Text style={styles.capDetailText}>{selected.text}</Text>
            </View>
          ) : null}
        </View>
      </LandingReveal>
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
      <SectionIntro
        kicker="Collection"
        title="Les modèles"
        lead="Chaque univers garde sa mise en page. Vous personnalisez le contenu."
      />
      <LandingReveal y={20} duration={600}>
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
      </LandingReveal>
    </SectionShell>
  );
}

const AUDIENCES = [
  {
    key: 'wedding' as const,
    label: 'Mariages',
    title: 'Une expérience à la hauteur du grand jour',
    text: 'Invitez vos proches avec une page soignée : récit, programme, RSVP et book du jour J.',
    points: [
      'Invitation, histoire et programme réunis',
      'RSVP, tables et régimes sans tableur',
      'Pass QR pour accueillir sereinement',
    ],
    photoLabel: 'Couple enlacé avec bouquet de fleurs',
  },
  {
    key: 'birthday' as const,
    label: 'Célébrations',
    title: 'Réunir simplement, célébrer pleinement',
    text: 'Une page expressive pour annoncer, informer et recueillir les réponses — sans fichier à renvoyer.',
    points: [
      'Design prêt à personnaliser en quelques minutes',
      'Confirmations et détails pratiques centralisés',
      'Galerie et livre d’or pour prolonger le moment',
    ],
    photoLabel: 'Couple célébrant, gâteau et ballons',
  },
  {
    key: 'professional' as const,
    label: 'Professionnel',
    title: 'Des inscriptions jusqu’au contrôle d’accès',
    text: 'Conférences et événements pro : infos claires, confirmations structurées, entrée fluide.',
    points: [
      'Programme et infos mises à jour en direct',
      'Inscriptions et RSVP suivis au même endroit',
      'Check-in QR le jour de l’événement',
    ],
    photoLabel: 'Participants attentifs en formation professionnelle',
  },
] as const;

export function AudienceSection() {
  const { isDesktop } = useBreakpoint();
  const [active, setActive] = useState(0);
  const selected = AUDIENCES[active];
  const go = (dir: -1 | 1) => {
    setActive((current) => (current + dir + AUDIENCES.length) % AUDIENCES.length);
  };

  return (
    <SectionShell padTop={88}>
      <LandingReveal y={20} duration={600}>
        <View style={styles.whoHead}>
          <View style={styles.whoBadge}>
            <Text style={styles.whoBadgeLabel}>Pour qui ?</Text>
          </View>
          <Text style={styles.whoTitle}>À qui s’adresse MK Events ?</Text>
          <Text style={styles.whoLead}>
            Des parcours adaptés à chaque type d’événement.
          </Text>
        </View>
      </LandingReveal>

      <LandingReveal y={24} duration={650} delay={80}>
        <View style={[styles.whoGrid, isDesktop && styles.whoGridDesktop]}>
          <View style={[styles.whoPhotoStage, isDesktop && styles.whoPhotoStageDesktop]}>
            <View style={styles.whoPhotoGlow} />
            <View style={styles.whoPhotoFrame}>
              <Image
                key={selected.key}
                source={AUDIENCE_PHOTOS[selected.key]}
                style={styles.whoPhotoImage}
                resizeMode="cover"
                accessibilityLabel={selected.photoLabel}
              />
            </View>
          </View>

          <View style={styles.whoCopy}>
            <View style={styles.whoTabs}>
              {AUDIENCES.map((item, index) => {
                const on = index === active;
                return (
                  <Pressable
                    key={item.key}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    onPress={() => setActive(index)}
                    style={[styles.whoTab, on && styles.whoTabActive]}
                  >
                    <Text style={[styles.whoTabLabel, on && styles.whoTabLabelActive]}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.whoFeatureTitle}>{selected.title}</Text>
            <Text style={styles.whoFeatureText}>{selected.text}</Text>

            <View style={styles.whoPoints}>
              {selected.points.map((point) => (
                <View key={point} style={styles.whoPoint}>
                  <View style={styles.whoCheck}>
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  </View>
                  <Text style={styles.whoPointText}>{point}</Text>
                </View>
              ))}
            </View>

            <View style={styles.whoNav}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Profil précédent"
                onPress={() => go(-1)}
                style={({ pressed }) => [styles.whoNavBtn, pressed && styles.pressed]}
              >
                <Ionicons name="chevron-back" size={18} color={LANDING.text} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Profil suivant"
                onPress={() => go(1)}
                style={({ pressed }) => [styles.whoNavBtn, pressed && styles.pressed]}
              >
                <Ionicons name="chevron-forward" size={18} color={LANDING.text} />
              </Pressable>
            </View>
          </View>
        </View>
      </LandingReveal>
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
      <SectionIntro
        kicker="Questions fréquentes"
        title="L’essentiel, avant de commencer"
      />
      <View style={styles.faqList}>
        {FAQS.map((item, index) => {
          const expanded = open === index;
          return (
            <LandingReveal key={item.q} x={-20} y={0} delay={index * 100} duration={500}>
              <Pressable
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
            </LandingReveal>
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
      <LandingReveal y={20} duration={600}>
        <View style={styles.finalCard}>
          <Text style={styles.finalTitle}>Créez votre invitation</Text>
          <Text style={styles.finalText}>Publiez quand vous êtes prêt.</Text>
          <LandingCta label="Commencer" onPress={() => router.push('/onboarding')} />
        </View>
      </LandingReveal>
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
          <Pressable onPress={() => router.push('/cgu')} hitSlop={8}>
            <Text style={styles.footerLink}>CGU</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/confidentialite')} hitSlop={8}>
            <Text style={styles.footerLink}>Confidentialité</Text>
          </Pressable>
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
  photoStage: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    position: 'relative',
    paddingTop: 12,
    paddingRight: 12,
    paddingBottom: 8,
  },
  photoStageDesktop: {
    maxWidth: 520,
    alignSelf: 'stretch',
  },
  photoOffset: {
    position: 'absolute',
    top: 28,
    left: 18,
    right: 0,
    bottom: 0,
    borderRadius: 28,
    backgroundColor: LANDING.coralSoft,
    transform: [{ rotate: '3deg' }],
  },
  photoFrame: {
    width: '100%',
    aspectRatio: 0.82,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: LANDING.surface,
    borderWidth: 1,
    borderColor: LANDING.border,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  howHead: {
    alignItems: 'flex-start',
    marginBottom: 48,
    maxWidth: 640,
  },
  howKicker: {
    ...landingFonts.medium,
    fontSize: 13,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: LANDING.coral,
    marginBottom: 14,
  },
  howTitle: {
    fontFamily: fontFamilies.serifSemiBold,
    fontSize: 40,
    lineHeight: 46,
    letterSpacing: -0.8,
    color: LANDING.text,
    marginBottom: 14,
  },
  howLead: {
    ...landingFonts.regular,
    fontSize: 17,
    lineHeight: 26,
    color: LANDING.textMuted,
    maxWidth: 480,
  },
  howQuote: {
    marginTop: 56,
    paddingTop: 28,
    maxWidth: 720,
    alignSelf: 'center',
    width: '100%',
  },
  howQuoteRule: {
    width: 48,
    height: 2,
    backgroundColor: LANDING.coral,
    marginBottom: 22,
    alignSelf: 'center',
  },
  howQuoteText: {
    fontFamily: fontFamilies.serifItalic,
    fontSize: 24,
    lineHeight: 34,
    letterSpacing: -0.3,
    color: LANDING.text,
    textAlign: 'center',
  },
  centerHead: {
    alignItems: 'center',
    marginBottom: 2,
  },
  centerText: {
    textAlign: 'center',
  },
  compareBlock: {
    marginTop: 8,
    marginBottom: 48,
    gap: 16,
  },
  compareToggle: {
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 6,
    padding: 5,
    borderRadius: 999,
    backgroundColor: LANDING.bgSoft,
    borderWidth: 1,
    borderColor: LANDING.border,
  },
  comparePill: {
    minHeight: 40,
    paddingHorizontal: 18,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comparePillSans: {
    backgroundColor: LANDING.surface,
  },
  comparePillAvec: {
    backgroundColor: LANDING.coral,
  },
  comparePillLabel: {
    ...landingFonts.medium,
    fontSize: 13,
    color: LANDING.textFaint,
  },
  comparePillLabelSans: {
    ...landingFonts.semibold,
    color: LANDING.text,
  },
  comparePillLabelAvec: {
    ...landingFonts.semibold,
    color: '#FFFFFF',
  },
  compareColumns: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'stretch',
  },
  compareCol: {
    flex: 1,
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 24,
    gap: 18,
  },
  compareColSans: {
    backgroundColor: LANDING.bgSoft,
    borderWidth: 1,
    borderColor: LANDING.border,
  },
  compareColAvec: {
    backgroundColor: LANDING.coralSoft,
    borderWidth: 1,
    borderColor: 'rgba(224, 122, 95, 0.28)',
  },
  compareColHeadSans: {
    ...landingFonts.semibold,
    fontSize: 13,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: LANDING.textFaint,
    marginBottom: 4,
  },
  compareColHeadAvec: {
    ...landingFonts.semibold,
    fontSize: 13,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: LANDING.coral,
    marginBottom: 4,
  },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  compareTextSans: {
    flex: 1,
    ...landingFonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: LANDING.textMuted,
  },
  compareTextAvec: {
    flex: 1,
    ...landingFonts.medium,
    fontSize: 15,
    lineHeight: 22,
    color: LANDING.text,
  },
  capExplorer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: LANDING.border,
  },
  capExplorerDesktop: {
    flexDirection: 'row',
    gap: 48,
    alignItems: 'flex-start',
    paddingTop: 8,
  },
  capList: {
    width: '100%',
  },
  capListDesktop: {
    flex: 1.15,
    maxWidth: 520,
  },
  capRow: {
    paddingVertical: 22,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: LANDING.border,
  },
  capRowActive: {
    borderBottomColor: 'rgba(224, 122, 95, 0.35)',
  },
  capRowHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 16,
  },
  capNum: {
    ...landingFonts.semibold,
    fontSize: 13,
    letterSpacing: 1.2,
    color: LANDING.textFaint,
    minWidth: 28,
  },
  capNumActive: {
    color: LANDING.coral,
  },
  capTitle: {
    flex: 1,
    ...landingFonts.bold,
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.4,
    color: LANDING.textFaint,
  },
  capTitleActive: {
    color: LANDING.text,
  },
  capExpand: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginTop: 14,
    paddingLeft: 44,
    paddingRight: 4,
  },
  capExpandIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: LANDING.coralSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  capExpandText: {
    flex: 1,
    ...landingFonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: LANDING.textMuted,
  },
  capDetail: {
    flex: 1,
    paddingTop: 28,
    paddingLeft: 8,
    maxWidth: 420,
  },
  capDetailIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: LANDING.coralSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  capDetailNum: {
    ...landingFonts.semibold,
    fontSize: 12,
    letterSpacing: 1.8,
    color: LANDING.coral,
    marginBottom: 10,
  },
  capDetailTitle: {
    ...landingFonts.bold,
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -0.6,
    color: LANDING.text,
    marginBottom: 14,
  },
  capDetailText: {
    ...landingFonts.regular,
    fontSize: 16,
    lineHeight: 26,
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
  whoHead: {
    alignItems: 'center',
    marginBottom: 36,
  },
  whoBadge: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: LANDING.coralSoft,
    marginBottom: 16,
  },
  whoBadgeLabel: {
    ...landingFonts.semibold,
    fontSize: 12,
    letterSpacing: 0.2,
    color: LANDING.coral,
  },
  whoTitle: {
    ...landingFonts.bold,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.5,
    color: LANDING.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  whoLead: {
    ...landingFonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: LANDING.textMuted,
    textAlign: 'center',
    maxWidth: 420,
  },
  whoGrid: {
    gap: 28,
    alignItems: 'stretch',
  },
  whoGridDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 48,
  },
  whoPhotoStage: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    position: 'relative',
  },
  whoPhotoStageDesktop: {
    flex: 1.05,
    maxWidth: 520,
    alignSelf: 'stretch',
  },
  whoPhotoGlow: {
    position: 'absolute',
    top: 18,
    left: -10,
    right: 24,
    bottom: 10,
    borderRadius: 32,
    backgroundColor: LANDING.coralSoft,
    ...(Platform.OS === 'web'
      ? ({ filter: 'blur(28px)', opacity: 0.9 } as object)
      : { opacity: 0.7 }),
  },
  whoPhotoFrame: {
    width: '100%',
    aspectRatio: 0.92,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: LANDING.surface,
    borderWidth: 1,
    borderColor: LANDING.border,
    zIndex: 1,
  },
  whoPhotoImage: {
    width: '100%',
    height: '100%',
  },
  whoCopy: {
    flex: 1,
    maxWidth: 480,
    gap: 14,
    alignSelf: 'center',
    width: '100%',
  },
  whoTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  whoTab: {
    minHeight: 40,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: LANDING.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  whoTabActive: {
    backgroundColor: LANDING.coral,
    borderColor: LANDING.coral,
  },
  whoTabLabel: {
    ...landingFonts.medium,
    fontSize: 13,
    color: LANDING.textMuted,
  },
  whoTabLabelActive: {
    ...landingFonts.semibold,
    color: '#FFFFFF',
  },
  whoFeatureTitle: {
    ...landingFonts.bold,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.3,
    color: LANDING.text,
  },
  whoFeatureText: {
    ...landingFonts.regular,
    fontSize: 15,
    lineHeight: 23,
    color: LANDING.textMuted,
  },
  whoPoints: {
    gap: 12,
    marginTop: 4,
  },
  whoPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  whoCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: LANDING.coral,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  whoPointText: {
    flex: 1,
    ...landingFonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: LANDING.text,
  },
  whoNav: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  whoNavBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: LANDING.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LANDING.surface,
  },
  pressed: { opacity: 0.82 },
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
