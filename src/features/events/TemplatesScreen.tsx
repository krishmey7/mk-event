/**
 * Catalogue — miniatures teintes, filtrées strictement par type d’événement.
 * Clic → aperçu = vue invité complète + bouton flottant Éditer.
 */

import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { openTemplateEditor } from '@/features/editor/navigation';
import { brandColors, fontFamilies, shadows, spacing } from '@/constants/theme';
import { useActiveEvent } from '@/context/ActiveEventContext';
import { useAppTheme } from '@/context/ThemePreferenceContext';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { CoverDiscoverHint, ScaledInvitationStage } from '@/features/invitation/InvitationCover';
import { TemplateCover } from '@/features/invitation/TemplateCover';
import { GuestInvitation } from '@/features/invitation/GuestInvitation';
import {
  DEMO_GUESTS,
  STUDIO_PREVIEW_GUEST,
  buildCatalogPreviewConfig,
} from '@/features/invitation/guestRegistry';
import { normalizePhotoFrame } from '@/features/invitation/types';
import { TEMPLATES, type TemplateDefinition } from '@/features/templates/registry';
import { resolveTemplateTheme } from '@/features/templates/resolveTheme';
import { EVENT_TYPE_LABELS, type EventType } from '@/types';

const COMING_SOON: { name: string; tint: string; categories: EventType[] }[] = [
  { name: 'Romantique', tint: '#F4E4E0', categories: ['wedding'] },
  { name: 'Jardin', tint: '#E4EADF', categories: ['wedding'] },
  { name: 'Ballons pastel', tint: '#E8F0FA', categories: ['birthday'] },
  { name: 'Forum', tint: '#E6EBF2', categories: ['corporate'] },
  { name: 'Keynote', tint: '#EDE8F2', categories: ['corporate'] },
];

export function TemplatesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isDesktop } = useBreakpoint();
  const { theme, mode } = useAppTheme();
  const { type, themeKey } = useActiveEvent();
  const columns = isDesktop ? 3 : 2;
  const cellWidth = columns === 3 ? '31.5%' : '48.2%';
  const c = theme.colors;
  const [preview, setPreview] = useState<TemplateDefinition | null>(null);

  const templates = useMemo(
    () => TEMPLATES.filter((item) => item.category === type),
    [type],
  );
  const soon = useMemo(
    () => COMING_SOON.filter((item) => item.categories.includes(type)),
    [type],
  );

  return (
    <View style={[styles.screen, { backgroundColor: c.background }]}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xxl + 72 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[theme.typography.h2, { color: c.textPrimary }]}>Modèles</Text>
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>
          {EVENT_TYPE_LABELS[type]} · teintés avec votre thème. Changez le type dans Profil.
        </Text>

        <View style={styles.grid}>
          {templates.map((template) => (
            <View key={template.key} style={[styles.cell, { width: cellWidth }]}>
              <TemplateThumb
                template={template}
                eventThemeKey={themeKey}
                onPress={() => setPreview(template)}
              />
            </View>
          ))}

          {soon.map((item) => (
            <View key={item.name} style={[styles.cell, { width: cellWidth }]}>
              <ComingSoonThumb name={item.name} tint={item.tint} />
            </View>
          ))}
        </View>

        {templates.length === 0 ? (
          <View style={[styles.emptyBox, { borderColor: c.border, backgroundColor: c.surface }]}>
            <Ionicons name="color-palette-outline" size={22} color={c.accent} />
            <Text style={[styles.emptyTitle, { color: c.textPrimary }]}>
              Pas encore de modèle {EVENT_TYPE_LABELS[type].toLowerCase()}
            </Text>
            <Text style={[styles.empty, { color: c.textMuted }]}>
              Les aperçus « Bientôt » arrivent. Pour voir les modèles mariage, changez le type
              d’événement dans Profil.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/profil')}
              style={[styles.profileCta, { backgroundColor: c.accent }]}
            >
              <Text style={[styles.profileCtaLabel, { color: c.onAccent }]}>Ouvrir le profil</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>

      <TemplatePreviewModal
        template={preview}
        eventThemeKey={themeKey}
        onClose={() => setPreview(null)}
        onEdit={() => {
          if (!preview) return;
          const key = preview.key;
          setPreview(null);
          openTemplateEditor(router, key, themeKey);
        }}
      />
    </View>
  );
}

function TemplatePreviewModal({
  template,
  eventThemeKey,
  onClose,
  onEdit,
}: {
  template: TemplateDefinition | null;
  eventThemeKey: string;
  onClose: () => void;
  onEdit: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const c = theme.colors;

  const config = useMemo(
    () => (template ? buildCatalogPreviewConfig(template, eventThemeKey) : null),
    [template, eventThemeKey],
  );
  const guest = DEMO_GUESTS[0] ?? STUDIO_PREVIEW_GUEST;
  const themed = template ? resolveTemplateTheme(template, eventThemeKey) : null;
  const statusStyle = themed?.isDark ? 'light' : 'dark';

  return (
    <Modal
      visible={template !== null && config !== null}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.guestPreview}>
        <StatusBar style={statusStyle} />

        {config && template ? (
          <GuestInvitation
            key={`${template.key}-${eventThemeKey}`}
            slug={`catalog-${template.key}`}
            config={config}
            guest={guest}
          />
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fermer l’aperçu"
          onPress={onClose}
          hitSlop={8}
          style={[styles.guestClose, { top: insets.top + 10 }]}
        >
          <Ionicons name="close" size={18} color="#FFFFFF" />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Éditer ce modèle"
          onPress={onEdit}
          style={[
            styles.editFab,
            {
              backgroundColor: c.accent,
              bottom: Math.max(insets.bottom, 12) + 16,
            },
            shadows.lg,
          ]}
        >
          <Ionicons name="create-outline" size={20} color={c.onAccent} />
          <Text style={[styles.editFabLabel, { color: c.onAccent }]}>Éditer</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

function TemplateThumb({
  template,
  eventThemeKey,
  onPress,
}: {
  template: TemplateDefinition;
  eventThemeKey: string;
  onPress: () => void;
}) {
  const { theme } = useAppTheme();
  const c = theme.colors;
  const [stageWidth, setStageWidth] = useState(0);
  const themed = resolveTemplateTheme(template, eventThemeKey);
  const guest = DEMO_GUESTS[0];
  const couplePhoto = {
    uri: template.couplePhoto.uri,
    frame: normalizePhotoFrame(template.couplePhoto.frame),
  };

  if (!themed) return null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Aperçu ${template.name}`}
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <View
        style={[
          styles.phone,
          { backgroundColor: c.surfaceElevated, borderColor: c.border },
          shadows.sm,
        ]}
      >
        <View style={styles.notch} />
        <View
          style={styles.phoneScreen}
          onLayout={(event) => {
            const next = Math.round(event.nativeEvent.layout.width);
            if (next !== stageWidth) setStageWidth(next);
          }}
        >
          {stageWidth <= 0 ? <View style={styles.coverPlaceholder} /> : (
            <ScaledInvitationStage width={stageWidth}>
              <TemplateCover
                compact
                layout={template.coverLayout}
                ornaments={template.ornaments}
                colors={themed.colors}
                isDark={themed.isDark}
                coverUri={template.coverImage}
                couplePhoto={couplePhoto}
                guest={guest}
                title={template.defaultCover.title}
                dateLabel={template.defaultCover.dateLabel}
                couple={template.defaultCover.couple}
                phrase={template.defaultKicker || 'Pour notre grand jour'}
                guestSentence={template.defaultCover.guestLine}
                kicker={template.defaultKicker}
                venueName={template.defaultVenue?.name}
                venueStreet={template.defaultVenue?.street}
                venueCity={template.defaultVenue?.city}
                stripPhotos={template.galleryImages}
                timePlace={template.key === 'pellicule' ? '20H00' : undefined}
                hint={<CoverDiscoverHint color={template.coverLayout === 'filmStrip' ? themed.colors.text : undefined} />}
              />
            </ScaledInvitationStage>
          )}
        </View>
      </View>
      <Text style={[styles.thumbName, { color: c.textPrimary }]} numberOfLines={1}>
        {template.name}
      </Text>
      <Text style={[styles.thumbMeta, { color: c.textMuted }]}>
        {EVENT_TYPE_LABELS[template.category]} · {themed.label}
      </Text>
    </Pressable>
  );
}

function ComingSoonThumb({ name, tint }: { name: string; tint: string }) {
  const { theme } = useAppTheme();
  const c = theme.colors;
  return (
    <View accessibilityState={{ disabled: true }}>
      <View
        style={[
          styles.phone,
          styles.phoneSoon,
          { backgroundColor: c.surface, borderColor: c.border },
        ]}
      >
        <View style={[styles.notch, styles.notchSoon]} />
        <View style={[styles.phoneScreen, { backgroundColor: tint }]}>
          <View style={styles.soonInner}>
            <View style={styles.soonRule} />
            <Text style={styles.soonMark}>MK</Text>
            <View style={styles.soonRule} />
          </View>
        </View>
      </View>
      <Text style={[styles.thumbName, { color: c.textPrimary }]}>{name}</Text>
      <Text style={[styles.thumbMeta, { color: c.textMuted }]}>Bientôt</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: spacing.lg },
  subtitle: {
    fontFamily: fontFamilies.sans,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    marginBottom: spacing.lg,
  },
  emptyBox: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.lg,
    gap: 10,
    alignItems: 'flex-start',
  },
  emptyTitle: { fontFamily: fontFamilies.sansSemiBold, fontSize: 15 },
  empty: { fontFamily: fontFamilies.sans, fontSize: 13, lineHeight: 19 },
  profileCta: {
    marginTop: 4,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  profileCtaLabel: { fontFamily: fontFamilies.sansSemiBold, fontSize: 13 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cell: { marginBottom: 22 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.985 }] },
  phone: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 7,
    paddingBottom: 10,
  },
  phoneSoon: { borderStyle: 'dashed' },
  notch: {
    alignSelf: 'center',
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(28, 23, 18, 0.18)',
    marginBottom: 6,
  },
  notchSoon: { backgroundColor: 'rgba(28, 23, 18, 0.08)' },
  phoneScreen: {
    borderRadius: 12,
    overflow: 'hidden',
    aspectRatio: 390 / 780,
    backgroundColor: '#1A1A1A',
  },
  coverPlaceholder: { flex: 1, backgroundColor: brandColors.coralDeep },
  thumbName: { fontFamily: fontFamilies.sansSemiBold, fontSize: 14, marginTop: 10 },
  thumbMeta: { fontFamily: fontFamilies.sans, fontSize: 12, marginTop: 2 },
  soonInner: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  soonRule: { width: 36, height: 1, backgroundColor: 'rgba(28,23,18,0.2)' },
  soonMark: {
    fontFamily: fontFamilies.serifSemiBold,
    fontSize: 22,
    letterSpacing: 4,
    color: 'rgba(28,23,18,0.45)',
  },
  guestPreview: { flex: 1, backgroundColor: '#100E0B' },
  guestClose: {
    position: 'absolute',
    left: 14,
    zIndex: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  editFab: {
    position: 'absolute',
    alignSelf: 'center',
    left: 24,
    right: 24,
    zIndex: 20,
    minHeight: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  editFabLabel: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 16,
    letterSpacing: 0.2,
  },
});
