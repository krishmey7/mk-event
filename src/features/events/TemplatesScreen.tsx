/**
 * Catalogue — une miniature par modèle (les thèmes se choisissent dans le studio).
 * La miniature est la vraie couverture, réduite dans un cadre téléphone.
 */

import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { openTemplateEditor } from '@/features/editor/navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { brandColors, shadows, spacing } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemePreferenceContext';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { CoverDiscoverHint, COVER_STAGE, ScaledInvitationStage } from '@/features/invitation/InvitationCover';
import { TemplateCover } from '@/features/invitation/TemplateCover';
import { DEMO_GUESTS } from '@/features/invitation/guestRegistry';
import { normalizePhotoFrame } from '@/features/invitation/types';
import { TEMPLATES, type TemplateDefinition } from '@/features/templates/registry';
import { EVENT_TYPE_LABELS } from '@/types';

const COMING_SOON = [
  { name: 'Romantique', tint: '#F4E4E0' },
  { name: 'Nature', tint: '#E4EADF' },
  { name: 'Minimaliste', tint: '#EEEAE3' },
];

export function TemplatesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isDesktop } = useBreakpoint();
  const { theme, mode } = useAppTheme();
  const columns = isDesktop ? 3 : 2;
  const cellWidth = columns === 3 ? '31.5%' : '48.2%';
  const c = theme.colors;

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
          Touchez une miniature pour l’ouvrir dans le studio.
        </Text>

        <View style={styles.grid}>
          {TEMPLATES.map((template) => (
            <View key={template.key} style={[styles.cell, { width: cellWidth }]}>
              <TemplateThumb
                template={template}
                onPress={() => openTemplateEditor(router, template.key)}
              />
            </View>
          ))}

          {COMING_SOON.map((item) => (
            <View key={item.name} style={[styles.cell, { width: cellWidth }]}>
              <ComingSoonThumb name={item.name} tint={item.tint} />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function TemplateThumb({
  template,
  onPress,
}: {
  template: TemplateDefinition;
  onPress: () => void;
}) {
  const { theme } = useAppTheme();
  const c = theme.colors;
  const [stageWidth, setStageWidth] = useState(0);
  const defaultTheme =
    template.themes.find((item) => item.key === template.defaultThemeKey) ?? template.themes[0];
  const guest = DEMO_GUESTS[0];
  const couplePhoto = {
    uri: template.couplePhoto.uri,
    frame: normalizePhotoFrame(template.couplePhoto.frame),
  };

  if (!defaultTheme) return null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={template.name}
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
                colors={defaultTheme.colors}
                isDark={defaultTheme.isDark}
                coverUri={template.coverImage}
                couplePhoto={couplePhoto}
                guest={guest}
                title={template.defaultCover.title}
                dateLabel={template.defaultCover.dateLabel}
                couple={template.defaultCover.couple}
                phrase={template.defaultCover.guestLine}
                guestSentence={template.defaultCover.guestLine}
                kicker={template.defaultKicker}
                venueName={template.defaultVenue?.name}
                venueCity={template.defaultVenue?.city}
                hint={<CoverDiscoverHint />}
              />
            </ScaledInvitationStage>
          )}
        </View>
      </View>
      <Text style={[styles.thumbName, { color: c.textPrimary }]} numberOfLines={1}>
        {template.name}
      </Text>
      <Text style={[styles.thumbMeta, { color: c.textMuted }]}>
        {EVENT_TYPE_LABELS[template.category]}
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
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    marginBottom: spacing.lg,
  },
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
  phoneSoon: {
    borderStyle: 'dashed',
  },
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
    aspectRatio: COVER_STAGE.width / COVER_STAGE.height,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#14110E',
  },
  coverPlaceholder: { flex: 1 },
  thumbName: {
    marginTop: 8,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13.5,
  },
  thumbMeta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    flex: 1,
  },
  soonInner: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, opacity: 0.55 },
  soonRule: { width: 28, height: 1, backgroundColor: brandColors.goldSoft },
  soonMark: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 16,
    letterSpacing: 2,
    color: brandColors.ink,
  },
});
