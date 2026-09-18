/**
 * ──────────────────────────────────────────────────────────────
 *  MK EVENT — INVITATION INVITÉ (landing continue — planche 3)
 * ──────────────────────────────────────────────────────────────
 *  Page fluide SANS TabBar, lue d'un seul scroll : couverture
 *  pré-personnalisée + flèche animée, histoire cliquable (modale
 *  plein format), programme, compte à rebours, RSVP pré-rempli
 *  (boissons de l'organisateur) activant le QR pass individuel,
 *  galerie, livre d'or. Thème/invités/boissons viennent de la
 *  config publiée par l'éditeur (guestRegistry).
 * ──────────────────────────────────────────────────────────────
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  ImageBackground,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shadows } from '@/constants/theme';
import { CoverDiscoverHint } from './InvitationCover';
import { TemplateCover } from './TemplateCover';
import { QrPattern } from '@/components/ui/QrPattern';
import { FilterPill, IconBubble, LabeledField, PillButton, SectionHeader, ThemedInput } from '@/features/templates/elegance/widgets';
import { SelectField } from '@/features/templates/elegance/SelectField';
import {
  WinterFlora,
  WinterPage,
  WinterProgramItem,
  WinterSectionDivider,
  WinterSectionHeader,
  WinterStoryItem,
  WinterVenueCard,
} from '@/features/templates/hiver/GuestWinter';
import { SnowflakeSvg, WinterPageDecor } from '@/features/templates/hiver/WinterArt';
import type { OrnamentKey } from '@/features/templates/ornaments';
import {
  COUNTDOWN_TARGET,
  GALLERY_FILTERS,
  IMAGES,
  type GalleryCategory,
  type ProgramStep,
  type StoryMilestone,
} from '@/features/templates/elegance/data';
import { type TemplateTheme, type TemplateThemeKey } from '@/features/templates/elegance/themes';
import { getTemplate, type TemplateThemeDefinition } from '@/features/templates/registry';
import type { InvitationConfig } from './guestRegistry';
import { BirthdayPoster } from '@/features/templates/birthday/BirthdayPoster';
import { ConferenceInvitation } from '@/features/templates/conference/ConferenceInvitation';
import { CONFERENCE_SPEAKERS } from '@/features/templates/conference/data';
import { BIRTHDAY_DEMO } from '@/features/templates/birthday/themes';
import { SIMULATE_BACKEND } from '@/constants/config';
import { guestsService } from '@/services/guestsService';
import {
  normalizeGalleryStyle,
  normalizePhotoFrame,
  normalizeRevealEffect,
  venueDirectionsUrl,
  venueFullAddress,
  venueHasCoords,
} from './types';
import type { CouplePhoto, GalleryStyleKey, Guest, RevealEffectKey, RsvpAnswer, Venue } from './types';
import { VenueMap } from '@/features/venue/VenueMap';
import { InvitationAudioChrome } from './InvitationAudioChrome';
import { useInvitationAudio } from './useInvitationAudio';
import { musicFromEventType, personaFromEventType } from './audioCatalog';

const DEFAULT_VOIX = {
  musicKey: 'classique',
  ambientUri: null as string | null,
  ambientName: null as string | null,
  autoplay: true,
  loop: true,
  voiceGreeting: true,
  voicePersona: 'mariage' as const,
};

function asGuestTheme(def: TemplateThemeDefinition): TemplateTheme {
  return {
    key: def.key as TemplateThemeKey,
    label: def.label,
    swatch: def.swatch,
    isDark: Boolean(def.isDark),
    colors: def.colors,
  };
}

function resolveGalleryItems(
  config: InvitationConfig,
  template: ReturnType<typeof getTemplate>,
): { uri: string; category: string }[] {
  const saved = config.gallery?.filter((item) => item.uri?.trim()) ?? [];
  if (saved.length > 0) return saved;
  return template.galleryImages.map((uri, index) => ({
    uri,
    category: (['ceremonie', 'cocktail', 'soiree'] as const)[index % 3],
  }));
}

export function GuestInvitation({ slug, config, guest }: {
  slug: string;
  config: InvitationConfig;
  guest: Guest;
}) {
  const template = getTemplate(config.templateKey);
  const themeDef = template.themes.find((item) => item.key === config.themeKey) ?? template.themes[0];
  const theme = asGuestTheme(themeDef);
  const layout = template.coverLayout;
  const insets = useSafeAreaInsets();
  const revealEffect = normalizeRevealEffect(config.revealEffect);
  const couplePhoto: CouplePhoto = {
    uri: config.couplePhoto?.uri ?? '',
    frame: normalizePhotoFrame(config.couplePhoto?.frame, config.templateKey),
  };
  const pageCover = config.cover ?? {
    title: template.defaultCover.title,
    dateLabel: template.defaultCover.dateLabel,
    couple: template.defaultCover.couple,
    guestLine: template.defaultCover.guestLine,
    kicker: template.defaultKicker ?? '',
    photoUri: template.coverImage,
  };
  const storyItems = config.story?.length ? config.story : template.story;
  const programItems = config.program?.length ? config.program : template.program;
  const galleryItems = resolveGalleryItems(config, template);
  const countdownImage = config.countdownImage || template.countdownImage;

  const scrollRef = useRef<ScrollView>(null);
  const storyY = useRef(0);
  const scrollYRef = useRef(0);
  const listenersRef = useRef(new Set<(scrollY: number) => void>());
  const [liked, setLiked] = useState(false);
  const [story, setStory] = useState<StoryMilestone | null>(null);

  /* Bus de reveal — chaque section s'anime quand elle entre à l'écran. */
  const bus = useMemo<RevealBusValue>(() => ({
    effect: revealEffect,
    getScroll: () => scrollYRef.current,
    viewport: () => Dimensions.get('window').height,
    addListener: (listener: (scrollY: number) => void) => {
      listenersRef.current.add(listener);
      return () => { listenersRef.current.delete(listener); };
    },
  }), [revealEffect]);

  const handleScroll = useCallback((event: { nativeEvent: { contentOffset: { y: number } } }) => {
    scrollYRef.current = event.nativeEvent.contentOffset.y;
    listenersRef.current.forEach((listener) => listener(scrollYRef.current));
  }, []);

  /* La flèche de la couverture guide vers la suite du contenu. */
  const scrollToStory = () => {
    scrollRef.current?.scrollTo({ y: Math.max(0, storyY.current - 10), animated: true });
  };

  const winter = layout === 'winterPoster';
  const voix = {
    ...DEFAULT_VOIX,
    ...config.voix,
    musicKey: musicFromEventType(template.category),
    ambientUri: config.voix?.ambientUri ?? DEFAULT_VOIX.ambientUri,
    ambientName: config.voix?.ambientName ?? DEFAULT_VOIX.ambientName,
    voicePersona: personaFromEventType(template.category),
  };
  const audio = useInvitationAudio({
    enabled: voix.voiceGreeting || voix.autoplay,
    voix,
    speech: {
      persona: voix.voicePersona,
      guestFirstName: guest.firstName,
      hosts: pageCover.couple,
    },
  });

  /* Anniversaire — une seule page affiche. */
  if (layout === 'birthdayPoster') {
    return (
      <View style={[styles.fill, { backgroundColor: theme.colors.bg }]}>
        <StatusBar style={theme.isDark ? 'light' : 'dark'} />
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 16 }}
          showsVerticalScrollIndicator={false}
        >
          <BirthdayPoster
            colors={theme.colors}
            isDark={theme.isDark}
            title={pageCover.title}
            subtitle={pageCover.guestLine || BIRTHDAY_DEMO.subtitle}
            ageLine={pageCover.kicker || BIRTHDAY_DEMO.ageLine}
            headline="birthday"
            scriptLine={BIRTHDAY_DEMO.script}
            dateLabel={pageCover.dateLabel}
            timePlace={config.dressCode || BIRTHDAY_DEMO.timePlace}
            address={
              [config.venue.name, config.venue.street, config.venue.city].filter(Boolean).join(' · ')
              || BIRTHDAY_DEMO.address
            }
            closing={BIRTHDAY_DEMO.closing}
            celebrant={pageCover.couple}
          />
        </ScrollView>
      </View>
    );
  }

  /* Conférence — multi-sections métier. */
  if (layout === 'conference') {
    return (
      <ConferenceInvitation
        colors={theme.colors}
        isDark={theme.isDark}
        title={pageCover.title || pageCover.couple}
        tagline={pageCover.kicker}
        dateLabel={pageCover.dateLabel}
        venue={config.venue}
        access={config.practical?.access}
        parking={config.practical?.parking}
        hotel={config.practical?.hotel}
        dressCode={config.dressCode}
        program={programItems}
        speakers={config.speakers?.length ? config.speakers : CONFERENCE_SPEAKERS}
        guest={guest}
      />
    );
  }

  return (
    <RevealBusContext.Provider value={bus}>
      <View style={[styles.fill, { backgroundColor: theme.colors.bg }]}>
        <StatusBar style={theme.isDark ? 'light' : 'dark'} />

        <InvitationAudioChrome
          needsGesture={audio.needsGesture}
          muted={audio.muted}
          onEnable={() => { void audio.enableFromGesture(); }}
          onToggleMute={() => { void audio.toggleMute(); }}
          accent={theme.colors.accent}
        />

        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: insets.bottom + 26 }}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <GuestCoverSection
            theme={theme}
            layout={layout}
            ornaments={template.ornaments}
            guest={guest}
            couplePhoto={couplePhoto}
            dressCode={config.dressCode}
            cover={pageCover}
            venue={config.venue}
            onScrollDown={scrollToStory}
          />

          <View onLayout={(event) => { storyY.current = event.nativeEvent.layout.y; }}>
            <GuestStorySection
              theme={theme}
              winter={winter}
              story={storyItems}
              couple={pageCover.couple}
              onSelect={setStory}
            />
          </View>

          {winter ? <WinterBreak theme={theme} /> : null}

          <GuestProgramSection
            theme={theme}
            winter={winter}
            venue={config.venue}
            program={programItems}
            dateLabel={pageCover.dateLabel}
          />

          {winter ? <WinterBreak theme={theme} /> : null}

          <GuestCountdownSection
            liked={liked}
            onToggleLike={() => setLiked((value) => !value)}
            imageUri={countdownImage}
            theme={theme}
            winter={winter}
          />

          {winter ? <WinterBreak theme={theme} /> : null}

          <GuestRsvpSection
            slug={slug}
            guest={guest}
            drinks={config.drinks}
            theme={theme}
            winter={winter}
          />

          {winter ? <WinterBreak theme={theme} /> : null}

          <GuestGallerySection
            theme={theme}
            winter={winter}
            styleKey={normalizeGalleryStyle(config.galleryStyle)}
            photos={galleryItems}
          />

          {winter ? <WinterBreak theme={theme} /> : null}

          <GuestGuestbookSection theme={theme} winter={winter} />

          <View style={styles.footer}>
            {winter ? (
              <SnowflakeSvg color={theme.colors.accent} size={18} />
            ) : (
              <Ionicons name="leaf-outline" size={16} color={theme.colors.accent} />
            )}
            <Text style={[styles.footerNames, { color: theme.colors.primary }]}>
              {pageCover.couple} · {pageCover.dateLabel}
            </Text>
          </View>
        </ScrollView>

        {winter ? <FallingSnow /> : null}

        <StoryDetailModal story={story} theme={theme} onClose={() => setStory(null)} />
      </View>
    </RevealBusContext.Provider>
  );
}

/* ── Modale de détail d'étape — photo plein format + récit intégral ── */

function StoryDetailModal({ story, theme, onClose }: {
  story: StoryMilestone | null;
  theme: TemplateTheme;
  onClose: () => void;
}) {
  const c = theme.colors;
  return (
    <Modal transparent visible={story !== null} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable
          style={[styles.modalCard, { backgroundColor: c.surface, borderColor: c.border }, shadows.lg]}
          onPress={(event) => event.stopPropagation()}
        >
          {story ? (
            <View>
              <Image source={{ uri: story.image }} style={styles.modalImage} resizeMode="cover" />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Fermer"
                onPress={onClose}
                hitSlop={8}
                style={[styles.modalClose, { backgroundColor: c.surface }]}
              >
                <Ionicons name="close" size={17} color={c.text} />
              </Pressable>
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <Text style={[styles.modalYear, { color: c.primary }]}>{story.year}</Text>
                <Text style={[styles.modalTitle, { color: c.text }]}>{story.title}</Text>
                <Text style={[styles.modalText, { color: c.textMuted }]}>{story.text}</Text>
                <View style={styles.modalFlora}>
                  <Ionicons name="heart" size={12} color={c.accent} />
                </View>
              </ScrollView>
            </View>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* ── Moteur d'apparition au défilement (fade / slide / zoom / spring) ── */

interface RevealBusValue {
  effect: RevealEffectKey;
  getScroll: () => number;
  viewport: () => number;
  addListener: (listener: (scrollY: number) => void) => () => void;
}

const RevealBusContext = createContext<RevealBusValue | null>(null);

function useRevealBus(): RevealBusValue {
  const bus = useContext(RevealBusContext);
  if (!bus) throw new Error('RevealBus manquant — utiliser dans <GuestInvitation>.');
  return bus;
}

/** Lance l'animation d'apparition selon l'effet choisi. */
function playReveal(anim: Animated.Value, effect: RevealEffectKey, delay: number): void {
  if (effect === 'none') return;
  if (effect === 'bounce') {
    Animated.spring(anim, {
      toValue: 1,
      delay,
      friction: 4.2,
      tension: 120,
      useNativeDriver: true,
    }).start();
    return;
  }
  if (effect === 'snowfall' || effect === 'sparkle' || effect === 'drift') {
    Animated.timing(anim, {
      toValue: 1,
      delay,
      duration: effect === 'snowfall' ? 780 : 620,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    return;
  }
  Animated.timing(anim, {
    toValue: 1,
    delay,
    duration: 540,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  }).start();
}

/** Interpolations par effet (opacity / translateY / scale). */
function revealStyles(anim: Animated.Value, effect: RevealEffectKey) {
  if (effect === 'slideup') {
    return {
      opacity: anim.interpolate({ inputRange: [0, 0.45], outputRange: [0, 1] }),
      transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [28, 0] }) }],
    };
  }
  if (effect === 'zoom') {
    return {
      opacity: anim.interpolate({ inputRange: [0, 0.45], outputRange: [0, 1] }),
      transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.93, 1] }) }],
    };
  }
  if (effect === 'bounce') {
    return {
      opacity: anim.interpolate({ inputRange: [0, 0.35], outputRange: [0, 1] }),
      transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
    };
  }
  if (effect === 'snowfall') {
    return {
      opacity: anim.interpolate({ inputRange: [0, 0.5], outputRange: [0, 1] }),
      transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-18, 0] }) }],
    };
  }
  if (effect === 'drift') {
    return {
      opacity: anim.interpolate({ inputRange: [0, 0.45], outputRange: [0, 1] }),
      transform: [{ translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [-28, 0] }) }],
    };
  }
  if (effect === 'sparkle') {
    return {
      opacity: anim.interpolate({ inputRange: [0, 0.4], outputRange: [0, 1] }),
      transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.84, 1] }) }],
    };
  }
  /* fade */
  return { opacity: anim };
}

/** Enveloppe d'apparition : anime l'enfant quand il entre à l'écran. */
function Reveal({ effect, delay = 0, style, children }: {
  effect: RevealEffectKey;
  delay?: number;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  const bus = useRevealBus();
  const anim = useRef<Animated.Value>(new Animated.Value(effect === 'none' ? 1 : 0)).current;
  const holderRef = useRef<View | null>(null);
  const contentYRef = useRef<number | null>(null);
  const shownRef = useRef(effect === 'none');

  /* Position absolue dans le contenu (mesure fenêtre + scroll courant). */
  const measure = useCallback(() => {
    holderRef.current?.measureInWindow((_x, y) => {
      contentYRef.current = y + bus.getScroll();
    });
  }, [bus]);

  /* Re-mesure après chaque layout (le contenu peut changer de hauteur). */
  const handleLayout = useCallback(() => {
    measure();
  }, [measure]);

  /* (Re)joue l'effet — changer d'effet rejoue en direct les blocs visibles. */
  useEffect(() => {
    if (effect === 'none') {
      anim.setValue(1);
      shownRef.current = true;
      return undefined;
    }
    shownRef.current = false;
    anim.setValue(0);
    const check = (scrollY: number) => {
      if (shownRef.current || contentYRef.current === null) return;
      if (contentYRef.current <= scrollY + bus.viewport() * 0.88) {
        shownRef.current = true;
        playReveal(anim, effect, delay);
      }
    };
    check(bus.getScroll());
    return bus.addListener(check);
  }, [effect, delay, anim, bus]);

  if (effect === 'none') {
    return <View style={style}>{children}</View>;
  }

  return (
    <Animated.View ref={holderRef} onLayout={handleLayout} style={[revealStyles(anim, effect), style]}>
      {children}
    </Animated.View>
  );
}

function FallingSnow() {
  const height = Dimensions.get('window').height;
  const flakes = useRef(
    Array.from({ length: 16 }, (_, index) => ({
      anim: new Animated.Value(0),
      left: 8 + ((index * 37) % Math.max(280, Dimensions.get('window').width - 24)),
      size: index % 4 === 0 ? 4.5 : index % 3 === 0 ? 3.5 : 2.5,
      opacity: 0.28 + (index % 5) * 0.06,
      duration: 7200 + index * 420,
      delay: index * 220,
    })),
  ).current;

  useEffect(() => {
    const loops = flakes.map((flake) =>
      Animated.loop(
        Animated.timing(flake.anim, {
          toValue: 1,
          duration: flake.duration,
          delay: flake.delay,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ),
    );
    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
  }, [flakes]);

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.snowLayer]}>
      {flakes.map((flake, index) => (
        <Animated.View
          key={index}
          style={{
            position: 'absolute',
            top: 0,
            left: flake.left,
            opacity: flake.opacity,
            transform: [
              {
                translateY: flake.anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-28, height + 40],
                }),
              },
              {
                translateX: flake.anim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, index % 2 === 0 ? 10 : -10, 0],
                }),
              },
            ],
          }}
        >
          <View
            style={{
              width: flake.size,
              height: flake.size,
              borderRadius: flake.size,
              backgroundColor: '#EAF2F8',
            }}
          />
        </Animated.View>
      ))}
    </View>
  );
}

function SectionShell({ winter, theme, children, style }: {
  winter: boolean;
  theme: TemplateTheme;
  children: ReactNode;
  style?: object;
}) {
  if (winter) {
    return (
      <WinterPage colors={theme.colors} style={style}>
        {children}
      </WinterPage>
    );
  }
  return <View style={[styles.section, style]}>{children}</View>;
}

function WinterBreak({ theme }: { theme: TemplateTheme }) {
  return (
    <View style={styles.winterBreak}>
      <WinterSectionDivider gold={theme.colors.accent} frost={theme.colors.textMuted} />
    </View>
  );
}

function SectionHead({
  winter,
  theme,
  kicker,
  title,
  subtitle,
}: {
  winter: boolean;
  theme: TemplateTheme;
  kicker?: string;
  title: string;
  subtitle?: string;
}) {
  if (winter) {
    return (
      <WinterSectionHeader kicker={kicker} title={title} subtitle={subtitle} colors={theme.colors} />
    );
  }
  return <SectionHeader kicker={kicker} title={title} subtitle={subtitle} theme={theme} />;
}

function GuestCoverSection({
  theme,
  layout,
  ornaments,
  guest,
  couplePhoto,
  dressCode,
  cover,
  venue,
  onScrollDown,
}: {
  theme: TemplateTheme;
  layout: 'classic' | 'winterPoster';
  ornaments: OrnamentKey;
  guest: Guest;
  couplePhoto: CouplePhoto;
  dressCode?: string;
  cover: InvitationConfig['cover'];
  venue: Venue;
  onScrollDown: () => void;
}) {
  const insets = useSafeAreaInsets();
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: 1, duration: 850, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0, duration: 850, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [bounce]);

  const chevronY = bounce.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <View style={{ height: Dimensions.get('window').height }}>
      <TemplateCover
        layout={layout}
        ornaments={ornaments}
        colors={theme.colors}
        isDark={theme.isDark}
        coverUri={cover.photoUri || IMAGES.cover}
        couplePhoto={couplePhoto}
        guest={guest}
        title={cover.title}
        dateLabel={cover.dateLabel}
        couple={cover.couple}
        phrase={cover.guestLine}
        guestSentence={cover.guestLine || 'Vous êtes invité(e) à célébrer avec nous.'}
        kicker={cover.kicker}
        venueName={venue.name}
        venueCity={venue.city}
        dressCode={dressCode}
        paddingTop={insets.top + 10}
        paddingBottom={insets.bottom + 6}
        onHintPress={onScrollDown}
        hint={(
          <CoverDiscoverHint
            chevron={(
              <Animated.View style={{ transform: [{ translateY: chevronY }] }}>
                <Ionicons name="chevron-down" size={24} color={theme.isDark ? 'rgba(212, 180, 90, 0.95)' : theme.colors.accent} />
              </Animated.View>
            )}
          />
        )}
      />
    </View>
  );
}

/* ── 2. Notre histoire — cartes CLIQUABLES vers le détail ── */

function GuestStorySection({ theme, winter, story, couple, onSelect }: {
  theme: TemplateTheme;
  winter: boolean;
  story: StoryMilestone[];
  couple: string;
  onSelect: (story: StoryMilestone) => void;
}) {
  const c = theme.colors;
  const { effect: revealEffect } = useRevealBus();
  return (
    <SectionShell winter={winter} theme={theme}>
      <Reveal effect={revealEffect} delay={0}>
        <SectionHead
          winter={winter}
          theme={theme}
          kicker="NOTRE HISTOIRE"
          title={couple}
          subtitle="Une belle aventure… touchez une étape pour la revivre"
        />
      </Reveal>

      <View style={winter ? styles.winterStack : undefined}>
        {story.map((item, index) => {
          const last = index === story.length - 1;
          return (
            <Reveal key={item.year} effect={revealEffect} delay={index * 90}>
              {winter ? (
                <WinterStoryItem
                  colors={c}
                  imageUri={item.image}
                  year={item.year}
                  title={item.title}
                  text={item.text}
                  last={last}
                  onPress={() => onSelect(item)}
                />
              ) : (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Lire l'étape ${item.title}`}
                  onPress={() => onSelect(item)}
                  style={({ pressed }) => [styles.storyRow, pressed && styles.pressed]}
                >
                  <View style={styles.rail}>
                    <Image
                      source={{ uri: item.image }}
                      style={[styles.storyPhoto, { borderColor: c.surface }]}
                    />
                    {last ? null : <View style={[styles.railLine, { backgroundColor: c.accent }]} />}
                  </View>
                  <View style={[styles.storyBody, last && styles.bodyLast]}>
                    <Text style={[styles.storyYear, { color: c.primary }]}>{item.year}</Text>
                    <Text style={[styles.storyTitle, { color: c.text }]}>{item.title}</Text>
                    <Text numberOfLines={2} style={[styles.storyText, { color: c.textMuted }]}>
                      {item.text}
                    </Text>
                    <View style={styles.readRow}>
                      <Text style={[styles.readLabel, { color: c.primary }]}>Lire le récit</Text>
                      <Ionicons name="chevron-forward" size={13} color={c.primary} />
                    </View>
                  </View>
                </Pressable>
              )}
            </Reveal>
          );
        })}
      </View>
    </SectionShell>
  );
}

/* ── 3. Le programme — timeline dorée + carte du lieu ── */

function GuestProgramSection({ theme, winter, venue, program, dateLabel }: {
  theme: TemplateTheme;
  winter: boolean;
  venue: Venue;
  program: ProgramStep[];
  dateLabel: string;
}) {
  const c = theme.colors;
  const { effect: revealEffect } = useRevealBus();
  return (
    <SectionShell winter={winter} theme={theme} style={winter ? undefined : { backgroundColor: c.bg }}>
      <Reveal effect={revealEffect} delay={0}>
        <SectionHead
          winter={winter}
          theme={theme}
          kicker="LE PROGRAMME"
          title="Notre journée"
          subtitle={dateLabel}
        />
      </Reveal>

      <View style={winter ? styles.winterStack : undefined}>
        {program.map((step, index) => {
          const last = index === program.length - 1;
          return (
            <Reveal key={step.time} effect={revealEffect} delay={index * 80}>
              {winter ? (
                <WinterProgramItem
                  colors={c}
                  icon={step.icon}
                  time={step.time}
                  title={step.title}
                  place={step.place}
                  last={last}
                />
              ) : (
                <View style={styles.storyRow}>
                  <View style={styles.rail}>
                    <IconBubble name={step.icon} theme={theme} />
                    {last ? null : <View style={[styles.railLine, { backgroundColor: c.accent }]} />}
                  </View>
                  <View style={[styles.storyBody, last && styles.bodyLast]}>
                    <Text style={[styles.storyYear, { color: c.primary }]}>{step.time}</Text>
                    <Text style={[styles.storyTitle, { color: c.text }]}>{step.title}</Text>
                    <Text style={[styles.storyText, { color: c.textMuted }]}>{step.place}</Text>
                  </View>
                </View>
              )}
            </Reveal>
          );
        })}
      </View>

      {winter ? (
        <WinterVenueCard
          colors={c}
          venueName={venue.name || 'Lieu à définir'}
          address={[venue.street, [venue.zip, venue.city].filter(Boolean).join(' ')].filter(Boolean).join(' · ')}
          map={
            venueHasCoords(venue) ? (
              <VenueMap lat={venue.lat!} lng={venue.lng!} height={180} />
            ) : null
          }
          onDirections={() => {
            const platform = Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web';
            void Linking.openURL(venueDirectionsUrl(venue, platform));
          }}
        />
      ) : (
        <VenueCard venue={venue} theme={theme} />
      )}

      {winter ? (
        <WinterFlora colors={c} />
      ) : (
        <View style={styles.floraRow} pointerEvents="none">
          <Ionicons name="leaf-outline" size={24} color={c.accent} style={styles.leafLeft} />
          <Ionicons name="flower-outline" size={64} color={c.accent} />
          <Ionicons name="leaf-outline" size={18} color={c.accent} style={styles.leafRight} />
        </View>
      )}
    </SectionShell>
  );
}

/* ── Lieu du mariage — carte élégante + itinéraire Maps ── */

function VenueCard({ venue, theme }: { venue: Venue; theme: TemplateTheme }) {
  const c = theme.colors;
  const { effect: revealEffect } = useRevealBus();
  const address = venueFullAddress(venue);

  if (!address) return null;

  const openDirections = () => {
    const platform = Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web';
    void Linking.openURL(venueDirectionsUrl(venue, platform));
  };

  return (
    <Reveal effect={revealEffect} delay={120}>
      <View style={[styles.venueCard, { backgroundColor: c.surface, borderColor: `${c.accent}88` }]}>
        <View style={styles.venueHead}>
          <View style={[styles.venueIcon, { backgroundColor: c.chip }]}>
            <Ionicons name="compass-outline" size={20} color={c.primary} />
          </View>
          <View style={styles.venueBody}>
            <Text style={[styles.venueKicker, { color: c.primary }]}>LE LIEU</Text>
            <Text style={[styles.venueName, { color: c.text }]}>{venue.name || 'Lieu à définir'}</Text>
            <Text style={[styles.venueAddress, { color: c.textMuted }]}>
              {[venue.street, [venue.zip, venue.city].filter(Boolean).join(' ')].filter(Boolean).join(' · ')}
            </Text>
          </View>
        </View>
        {venueHasCoords(venue) ? (
          <View style={styles.venueMap}>
            <VenueMap lat={venue.lat!} lng={venue.lng!} height={180} />
          </View>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Y aller"
          onPress={openDirections}
          style={({ pressed }) => [styles.venueBtn, { backgroundColor: c.primary }, pressed && styles.pressed]}
        >
          <Ionicons name="navigate-outline" size={15} color={c.onPrimary} />
          <Text style={[styles.venueBtnLabel, { color: c.onPrimary }]}>Y aller</Text>
        </Pressable>
      </View>
    </Reveal>
  );
}

/* ── 4. Compte à rebours — bloc sombre immersif ── */

function GuestCountdownSection({ liked, onToggleLike, imageUri, theme, winter }: {
  liked: boolean;
  onToggleLike: () => void;
  imageUri: string;
  theme: TemplateTheme;
  winter: boolean;
}) {
  const c = theme.colors;
  const { effect: revealEffect } = useRevealBus();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const ms = Math.max(0, COUNTDOWN_TARGET - now);
  const days = Math.floor(ms / 86400000);
  const p2 = (n: number): string => String(n).padStart(2, '0');
  const blocks = [
    { value: p2(Math.floor((ms % 86400000) / 3600000)), label: 'Heures' },
    { value: p2(Math.floor((ms % 3600000) / 60000)), label: 'Minutes' },
    { value: p2(Math.floor((ms % 60000) / 1000)), label: 'Secondes' },
  ];

  const inner = (
    <>
      <View style={styles.countdownLike}>
        <Pressable accessibilityRole="button" onPress={onToggleLike} hitSlop={8} style={styles.circleBtn}>
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={19} color={liked ? '#E25555' : '#FFFFFF'} />
        </Pressable>
      </View>

      <View style={styles.countdownCenter}>
        <Text style={[styles.countdownKicker, winter && { color: c.textMuted }]}>LE GRAND JOUR</Text>
        <Text style={[styles.countdownGold, winter && { color: c.accent }]}>DANS</Text>

        <Reveal effect={revealEffect} delay={0}>
          <View style={styles.countdownBigWrap}>
            <Text style={[styles.countdownBig, winter && { color: c.text }]}>{days}</Text>
            <Text style={[styles.countdownBigLabel, winter && { color: c.accent }]}>Jours</Text>
          </View>
        </Reveal>

        <View style={styles.countdownRow}>
          {blocks.map((block, index) => (
            <Reveal key={block.label} effect={revealEffect} delay={150 + index * 130}>
              <View style={styles.blockWrap}>
                {index > 0 ? <View style={[styles.blockDivider, winter && { backgroundColor: `${c.accent}55` }]} /> : null}
                <View style={styles.block}>
                  <Text style={[styles.blockValue, winter && { color: c.text }]}>{block.value}</Text>
                  <Text style={[styles.blockLabel, winter && { color: c.accent }]}>{block.label}</Text>
                </View>
              </View>
            </Reveal>
          ))}
        </View>

        <Reveal effect={revealEffect} delay={560}>
          <View style={styles.viteRow}>
            {winter ? <SnowflakeSvg color={c.accent} size={14} /> : <Ionicons name="heart" size={12} color="#E9D9A8" />}
            <Text style={[styles.viteText, winter && { color: c.accent }]}>À très vite !</Text>
            {winter ? <SnowflakeSvg color={c.accent} size={14} /> : <Ionicons name="heart" size={12} color="#E9D9A8" />}
          </View>
        </Reveal>
      </View>
    </>
  );

  if (winter) {
    return (
      <View style={[styles.countdown, { backgroundColor: c.bg, overflow: 'hidden' }]}>
        <WinterPageDecor gold={c.accent} frost={c.textMuted} />
        <View style={{ flex: 1, zIndex: 1 }}>{inner}</View>
      </View>
    );
  }

  return (
    <View style={styles.countdown}>
      <ImageBackground source={{ uri: imageUri }} style={styles.fill}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(6, 6, 10, 0.74)' }]} />
        {inner}
      </ImageBackground>
    </View>
  );
}

/* ── 5. RSVP — pré-rempli, boissons de l'organisateur, QR pass ── */

function GuestRsvpSection({ slug, guest, drinks, theme, winter }: {
  slug: string;
  guest: Guest;
  drinks: string[];
  theme: TemplateTheme;
  winter: boolean;
}) {
  const c = theme.colors;
  const { effect: revealEffect } = useRevealBus();
  const [attending, setAttending] = useState<'yes' | 'no' | null>(null);
  const [drink, setDrink] = useState<string | null>(null);
  const [answer, setAnswer] = useState<RsvpAnswer | null>(null);

  const canSubmit =
    attending === 'no' || (attending === 'yes' && drink !== null);

  const submit = async () => {
    if (!canSubmit || attending === null) return;
    const nextAnswer = {
      guestId: guest.id,
      attending,
      guestsCount: guest.seats,
      menu: null,
      drink,
      diets: [],
      allergies: '',
    };
    try {
      if (!SIMULATE_BACKEND) {
        await guestsService.submitPublicRsvp(slug, {
          access_token: guest.id,
          answer: attending === 'yes' ? 'yes' : 'no',
          adults_count: guest.seats,
          children_count: 0,
          drink: attending === 'yes' ? drink : null,
        });
      }
      setAnswer(nextAnswer);
    } catch {
      /* Affiche quand même le succès local pour ne pas bloquer l’UX démo hors-ligne. */
      setAnswer(nextAnswer);
    }
  };

  /* Après validation : le QR pass individuel s'active. */
  if (answer !== null) {
    return (
      <SectionShell winter={winter} theme={theme}>
        <SectionHead winter={winter} theme={theme} kicker="RSVP" title="Votre réponse" />

        <Reveal effect={revealEffect} delay={0}>
          <View style={[styles.successCard, { backgroundColor: c.surface, borderColor: c.border }]}>
            {answer.attending === 'yes' ? (
              <>
                <IconBubble name="checkmark" theme={theme} size={52} />
                <Text style={[styles.successTitle, { color: c.text }]}>Merci {guest.firstName} !</Text>
                <Text style={[styles.successText, { color: c.textMuted }]}>
                  Présence confirmée
                  {answer.drink ? ` · ${answer.drink}` : ''}
                </Text>

                {/* Pass d'entrée — QR individuel actif */}
                <View style={[styles.passCard, { borderColor: c.accent }]}>
                  <View style={styles.passBadge}>
                    <Ionicons name="qr-code" size={13} color={c.onPrimary} />
                    <Text style={[styles.passBadgeText, { color: c.onPrimary }]}>PASS D'ENTRÉE ACTIF</Text>
                  </View>
                  <QrPattern seed={`${slug}:${guest.id}`} size={25} cell={5} style={styles.passQr} />
                  <Text style={[styles.passId, { color: c.text }]}>{guest.id}</Text>
                  <Text style={[styles.passName, { color: c.textMuted }]}>
                    {guest.firstName} {guest.lastName}
                  </Text>
                  <Text style={[styles.passHint, { color: c.textMuted }]}>
                    Présentez ce code le jour J — il sert à l'émargement à l'entrée.
                  </Text>
                </View>
              </>
            ) : (
              <>
                <IconBubble name="heart-outline" theme={theme} size={52} />
                <Text style={[styles.successTitle, { color: c.text }]}>
                  C'est noté, {guest.firstName}…
                </Text>
                <Text style={[styles.successText, { color: c.textMuted }]}>
                  Vous nous manquerez — on pense très fort à vous 💛
                </Text>
              </>
            )}

            <PillButton label="Modifier ma réponse" onPress={() => setAnswer(null)} theme={theme} variant="outline" />
          </View>
        </Reveal>
      </SectionShell>
    );
  }

  return (
    <SectionShell winter={winter} theme={theme}>
      <Reveal effect={revealEffect} delay={0}>
        <SectionHead
          winter={winter}
          theme={theme}
          kicker="RSVP"
          title={`Confirme ta présence, ${guest.firstName}`}
          subtitle={`${guest.seats} place${guest.seats > 1 ? 's' : ''} attribuée${guest.seats > 1 ? 's' : ''} · ${guest.id}`}
        />
      </Reveal>

      <Reveal effect={revealEffect} delay={90}>
        <View style={styles.answers}>
          <PillButton
            label="Je confirme ma présence"
            icon={attending === 'yes' ? 'checkmark' : undefined}
            onPress={() => setAttending('yes')}
            theme={theme}
          />
          <PillButton
            label="Je ne peux pas être présent(e)"
            onPress={() => setAttending('no')}
            theme={theme}
            variant="outline"
            style={attending === 'no' ? { borderColor: c.primary, borderWidth: 1.6 } : null}
          />
        </View>
      </Reveal>

      {attending === 'yes' ? (
        <Reveal effect={revealEffect} delay={180}>
          <View style={styles.rsvpDetails}>
            <LabeledField label="Choix de la boisson" theme={theme}>
              <SelectField
                value={drink}
                placeholder="Sélectionner une boisson"
                options={drinks}
                onSelect={setDrink}
                theme={theme}
              />
            </LabeledField>
          </View>
        </Reveal>
      ) : null}

      {attending === 'no' ? (
        <Reveal effect={revealEffect} delay={180}>
          <View style={[styles.declineCard, { backgroundColor: c.surfaceAlt }]}>
            <Text style={[styles.declineText, { color: c.textMuted }]}>
              {"C'est dommage… on pense très fort à toi 💛"}
            </Text>
          </View>
        </Reveal>
      ) : null}

      <Reveal effect={revealEffect} delay={260}>
        <PillButton
          label={attending === 'yes' ? 'Valider & activer mon pass' : 'Valider ma réponse'}
          onPress={submit}
          disabled={!canSubmit}
          theme={theme}
          style={styles.rsvpSubmit}
        />
      </Reveal>
    </SectionShell>
  );
}

/* ── 6. Galerie — grille / carrousel / maçonnerie ── */

function GuestGallerySection({ theme, winter, styleKey, photos: incoming }: {
  theme: TemplateTheme;
  winter: boolean;
  styleKey: GalleryStyleKey;
  photos: { uri: string; category: string }[];
}) {
  const c = theme.colors;
  const { effect: revealEffect } = useRevealBus();
  const [filter, setFilter] = useState<GalleryCategory>('tous');
  const mapped = incoming.map((item, index) => ({
    id: `g-${index}`,
    uri: item.uri,
    category: item.category as Exclude<GalleryCategory, 'tous'>,
    height: 170 + (index % 3) * 28,
  }));
  const photos = filter === 'tous' ? mapped : mapped.filter((photo) => photo.category === filter);
  const leftColumn = photos.filter((_, index) => index % 2 === 0);
  const rightColumn = photos.filter((_, index) => index % 2 === 1);
  const photoReveal: RevealEffectKey = winter ? 'none' : revealEffect;

  return (
    <SectionShell winter={winter} theme={theme}>
      <Reveal effect={revealEffect} delay={0}>
        <SectionHead
          winter={winter}
          theme={theme}
          title="Notre galerie"
          subtitle="Revivez les plus beaux moments de notre histoire…"
        />
      </Reveal>

      <Reveal effect={revealEffect} delay={90}>
        <View style={[styles.galleryFilters, winter && styles.winterGalleryBlock]}>
          {GALLERY_FILTERS.map((item) => (
            <FilterPill
              key={item.key}
              label={item.label}
              active={filter === item.key}
              onPress={() => setFilter(item.key)}
              theme={theme}
            />
          ))}
        </View>
      </Reveal>

      {/* Carrousel — défilement horizontal avec arrêt sur photo */}
      {styleKey === 'slider' ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={262}
          decelerationRate="fast"
          style={[styles.slider, winter && styles.winterGalleryBlock]}
          contentContainerStyle={styles.sliderContent}
        >
          {photos.map((photo, index) => (
            <Reveal key={photo.id} effect={photoReveal} delay={index * 60}>
              <Image
                source={{ uri: photo.uri }}
                resizeMode="cover"
                style={[styles.sliderPhoto, { backgroundColor: c.surfaceAlt }]}
              />
            </Reveal>
          ))}
        </ScrollView>
      ) : (
        <View style={[styles.galleryGrid, winter && styles.winterGalleryBlock]}>
          {[leftColumn, rightColumn].map((column, columnIndex) => (
            <View key={columnIndex} style={styles.galleryColumn}>
              {column.map((photo, index) => (
                <Reveal key={photo.id} effect={photoReveal} delay={(columnIndex + index) * 60}>
                  <Image
                    source={{ uri: photo.uri }}
                    resizeMode="cover"
                    style={[
                      styles.galleryPhoto,
                      styleKey === 'grid'
                        ? styles.galleryPhotoSquare
                        : { height: photo.height },
                      { backgroundColor: c.surfaceAlt },
                    ]}
                  />
                </Reveal>
              ))}
            </View>
          ))}
        </View>
      )}
    </SectionShell>
  );
}

/* ── 7. Livre d'or ── */

function GuestGuestbookSection({ theme, winter }: { theme: TemplateTheme; winter: boolean }) {
  const c = theme.colors;
  const { effect: revealEffect } = useRevealBus();
  const [text, setText] = useState('');
  const [notes, setNotes] = useState<{ id: number; text: string; when: string }[]>([]);
  const [error, setError] = useState(false);

  const send = () => {
    if (text.trim().length === 0) {
      setError(true);
      return;
    }
    setNotes((prev) => [{ id: Date.now(), text: text.trim(), when: 'À l\u2019instant' }, ...prev]);
    setText('');
    setError(false);
  };

  return (
    <SectionShell winter={winter} theme={theme}>
      <Reveal effect={revealEffect} delay={0}>
        <SectionHead
          winter={winter}
          theme={theme}
          title="Laisse-nous un petit mot"
          subtitle="Un message, un vœu, une pensée, tout nous fera chaud au cœur !"
        />
      </Reveal>

      <Reveal effect={revealEffect} delay={90}>
        <View style={[styles.noteCard, { backgroundColor: c.surface, borderColor: error ? '#A45A45' : c.border }]}>
          <ThemedInput
            theme={theme}
            multiline
            maxLength={500}
            value={text}
            onChangeText={(value) => { setText(value); setError(false); }}
            placeholder="Écris ici ton message..."
            style={styles.noteTextarea}
          />
          <Text style={[styles.noteCounter, { color: c.textMuted }]}>{text.length}/500</Text>
        </View>
      </Reveal>

      {error ? (
        <Text style={styles.noteError}>{"Écris d\u2019abord un petit mot 💛"}</Text>
      ) : null}

      <Reveal effect={revealEffect} delay={180}>
        <PillButton label="Envoyer mon message" onPress={send} theme={theme} />
      </Reveal>

      {notes.map((note) => (
        <View key={note.id} style={[styles.noteItem, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Text style={[styles.noteText, { color: c.text }]}>{note.text}</Text>
          <Text style={[styles.noteWhen, { color: c.textMuted }]}>{note.when}</Text>
        </View>
      ))}
    </SectionShell>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#14110E' },
  scroll: { flex: 1 },
  pressed: { opacity: 0.8 },
  footer: { alignItems: 'center', gap: 6, paddingVertical: 30 },
  footerNames: { fontFamily: 'Fraunces_400Regular_Italic', fontSize: 14 },

  /* Régimes — cases à cocher */
  dietList: { gap: 8 },
  dietRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderRadius: 12, paddingVertical: 11, paddingHorizontal: 13,
  },
  dietLabel: { fontFamily: 'Inter_500Medium', fontSize: 13.5, flex: 1 },

  /* Sections */
  section: { paddingHorizontal: 22, paddingVertical: 34 },
  winterStack: { width: '100%', alignItems: 'center' },
  winterGalleryBlock: { width: '100%', alignSelf: 'stretch' },
  winterBreak: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 14,
  },
  snowLayer: {
    zIndex: 8,
    elevation: 8,
  },
  storyRow: { flexDirection: 'row', gap: 14 },
  rail: { width: 44, alignItems: 'center' },
  storyPhoto: { width: 44, height: 44, borderRadius: 22, borderWidth: 3, backgroundColor: '#E5DECF' },
  railLine: { width: 2, flex: 1, borderRadius: 1, marginVertical: 6, opacity: 0.45 },
  storyBody: { flex: 1, paddingBottom: 24, paddingTop: 2, gap: 3 },
  bodyLast: { paddingBottom: 0 },
  storyYear: { fontFamily: 'Inter_600SemiBold', fontSize: 12, letterSpacing: 1.5 },
  storyTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15.5 },
  storyText: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19 },
  readRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 4 },
  readLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  floraRow: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center',
    marginTop: 10, opacity: 0.4,
  },
  leafLeft: { marginBottom: 8, marginRight: -6 },
  leafRight: { marginBottom: 14, marginLeft: -8 },
  /* Compte à rebours */
  countdown: { height: 470 },
  countdownLike: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 16, paddingTop: 16 },
  circleBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  countdownCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 7, paddingBottom: 20 },
  countdownKicker: {
    fontFamily: 'Inter_600SemiBold', fontSize: 13, letterSpacing: 5,
    color: '#FFFFFF', textAlign: 'center', paddingLeft: 5,
  },
  countdownGold: {
    fontFamily: 'Inter_600SemiBold', fontSize: 12, letterSpacing: 6,
    color: '#E9D9A8', textAlign: 'center', paddingLeft: 6,
  },
  countdownBig: { fontFamily: 'Fraunces_500Medium', fontSize: 82, lineHeight: 92, color: '#FFFFFF' },
  countdownBigLabel: {
    fontFamily: 'Fraunces_400Regular_Italic', fontSize: 16, color: '#E9D9A8', marginTop: -6,
  },
  countdownRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  blockWrap: { flexDirection: 'row', alignItems: 'center' },
  blockDivider: { width: 1, height: 26, backgroundColor: 'rgba(255, 255, 255, 0.25)' },
  block: { alignItems: 'center', paddingHorizontal: 13, gap: 3 },
  blockValue: { fontFamily: 'Fraunces_500Medium', fontSize: 24, color: '#FFFFFF' },
  blockLabel: {
    fontFamily: 'Inter_600SemiBold', fontSize: 9, letterSpacing: 1.6,
    color: '#E9D9A8', textTransform: 'uppercase',
  },
  viteRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 22 },
  viteText: { fontFamily: 'Fraunces_400Regular_Italic', fontSize: 17, color: '#E9D9A8' },

  /* RSVP */
  answers: { gap: 10 },
  rsvpDetails: { gap: 16 },
  detailsTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  rsvpTextarea: { minHeight: 84, textAlignVertical: 'top', paddingTop: 13 },
  declineCard: { borderRadius: 14, padding: 14 },
  declineText: { fontFamily: 'Fraunces_400Regular_Italic', fontSize: 14, textAlign: 'center' },
  rsvpSubmit: { marginTop: 2 },
  successCard: {
    borderRadius: 18, borderWidth: 1, padding: 24, alignItems: 'center', gap: 10,
  },
  successTitle: { fontFamily: 'Fraunces_500Medium', fontSize: 21 },
  successText: { fontFamily: 'Inter_400Regular', fontSize: 13.5, textAlign: 'center', marginBottom: 4 },
  passCard: {
    width: '100%', alignItems: 'center', gap: 7,
    borderRadius: 18, borderWidth: 1.4, borderStyle: 'dashed',
    paddingVertical: 20, paddingHorizontal: 16, marginVertical: 8,
  },
  passBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5,
    backgroundColor: 'rgba(122, 108, 62, 0.14)',
  },
  passBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 9.5, letterSpacing: 1.6 },
  passQr: { marginTop: 6, borderRadius: 10, overflow: 'hidden' },
  passId: { fontFamily: 'Inter_600SemiBold', fontSize: 15, letterSpacing: 2 },
  passName: { fontFamily: 'Inter_500Medium', fontSize: 12.5 },
  passHint: {
    fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 15.5,
    textAlign: 'center', paddingHorizontal: 8,
  },
  /* Galerie */
  galleryFilters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 16 },
  galleryGrid: { flexDirection: 'row', gap: 10 },
  galleryColumn: { flex: 1, gap: 10 },
  galleryPhoto: { width: '100%', borderRadius: 16 },

  /* Livre d'or */
  noteCard: { borderRadius: 14, borderWidth: 1, padding: 12, gap: 4 },
  noteTextarea: {
    minHeight: 92, borderWidth: 0, backgroundColor: 'transparent',
    paddingHorizontal: 2, textAlignVertical: 'top', paddingTop: 4,
  },
  noteCounter: { fontFamily: 'Inter_400Regular', fontSize: 11, textAlign: 'right', paddingRight: 4 },
  noteError: {
    fontFamily: 'Inter_500Medium', fontSize: 12.5, color: '#A45A45', textAlign: 'center', marginTop: -6,
  },
  noteItem: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 6 },
  noteText: { fontFamily: 'Inter_400Regular', fontSize: 13.5, lineHeight: 20 },
  noteWhen: { fontFamily: 'Inter_400Regular', fontSize: 11 },

  /* Lieu du mariage */
  venueCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 14,
    marginTop: 18,
  },
  venueHead: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  venueIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  venueBody: { flex: 1, gap: 2 },
  venueKicker: { fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 2.4 },
  venueName: { fontFamily: 'Fraunces_500Medium', fontSize: 18, lineHeight: 23 },
  venueAddress: { fontFamily: 'Inter_400Regular', fontSize: 12.5, lineHeight: 18 },
  venueMap: { marginTop: 2, borderRadius: 12, overflow: 'hidden' },
  venueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    minHeight: 46,
    borderRadius: 999,
  },
  venueBtnLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13.5, letterSpacing: 0.3 },

  /* Galerie — carrousel & grille */
  slider: { marginTop: 2 },
  sliderContent: { paddingLeft: 22, paddingRight: 22 },
  sliderPhoto: { width: 250, height: 320, borderRadius: 18, marginRight: 12 },
  galleryPhotoSquare: { height: 140 },

  /* Compte à rebours */
  countdownBigWrap: { alignItems: 'center' },

  /* Modale histoire */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 14, 0.62)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 26,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '86%',
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalImage: { width: '100%', height: 236 },
  modalClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: { paddingHorizontal: 20, paddingVertical: 16, maxHeight: 260 },
  modalYear: { fontFamily: 'Inter_600SemiBold', fontSize: 12, letterSpacing: 2 },
  modalTitle: { fontFamily: 'Fraunces_500Medium', fontSize: 24, lineHeight: 31, marginTop: 2 },
  modalText: { fontFamily: 'Inter_400Regular', fontSize: 14.5, lineHeight: 23, marginTop: 10 },
  modalFlora: { alignItems: 'center', marginTop: 18 },
});