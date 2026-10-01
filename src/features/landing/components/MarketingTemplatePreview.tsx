/**
 * Miniature invitation marketing — vrai TemplateCover du registre.
 */

import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CoverDiscoverHint, ScaledInvitationStage } from '@/features/invitation/InvitationCover';
import { TemplateCover } from '@/features/invitation/TemplateCover';
import { DEMO_GUESTS } from '@/features/invitation/guestRegistry';
import { normalizePhotoFrame } from '@/features/invitation/types';
import { resolveTemplateTheme } from '@/features/templates/resolveTheme';
import type { TemplateDefinition } from '@/features/templates/registry';
import { fontFamilies } from '@/constants/theme';
import { LANDING } from '../landingTokens';

export function MarketingTemplatePreview({
  template,
  width = 220,
  showLabel = true,
}: {
  template: TemplateDefinition;
  width?: number;
  showLabel?: boolean;
}) {
  const [stageWidth, setStageWidth] = useState(0);
  const themed = resolveTemplateTheme(template, template.defaultThemeKey);
  const guest = DEMO_GUESTS[0];
  const couplePhoto = {
    uri: template.couplePhoto.uri,
    frame: normalizePhotoFrame(template.couplePhoto.frame),
  };
  const screenW = width - 14;

  if (!themed) return null;

  return (
    <View style={[styles.wrap, { width }]}>
      <View style={[styles.phone, { width }]}>
        <View style={styles.notch} />
        <View
          style={[styles.screen, { width: screenW }]}
          onLayout={(event) => {
            const next = Math.round(event.nativeEvent.layout.width);
            if (next !== stageWidth) setStageWidth(next);
          }}
        >
          {stageWidth <= 0 ? (
            <View style={[styles.placeholder, { backgroundColor: themed.colors.bg }]} />
          ) : (
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
                timePlace={
                  template.key === 'pellicule'
                    ? '20H00'
                    : template.key === 'neon'
                      ? '15H30'
                      : undefined
                }
                hint={
                  <CoverDiscoverHint
                    color={
                      template.coverLayout === 'filmStrip'
                        ? themed.colors.text
                        : template.coverLayout === 'neonScript'
                          ? '#FFFFFF'
                          : undefined
                    }
                  />
                }
              />
            </ScaledInvitationStage>
          )}
        </View>
      </View>
      {showLabel ? (
        <View style={styles.meta}>
          <Text style={styles.name}>{template.name}</Text>
          <Text style={styles.category}>
            {template.category === 'wedding'
              ? 'Mariage'
              : template.category === 'birthday'
                ? 'Anniversaire'
                : 'Professionnel'}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  phone: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: LANDING.border,
    backgroundColor: 'rgba(16, 12, 14, 0.85)',
    padding: 7,
    paddingBottom: 10,
  },
  notch: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(247, 240, 232, 0.18)',
    marginBottom: 6,
  },
  screen: {
    borderRadius: 14,
    overflow: 'hidden',
    aspectRatio: 390 / 780,
    backgroundColor: '#111',
    alignSelf: 'center',
  },
  placeholder: { flex: 1 },
  meta: { alignItems: 'center', marginTop: 12, gap: 2 },
  name: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 14,
    color: LANDING.cream,
  },
  category: {
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    color: LANDING.creamFaint,
  },
});
