/**
 * Onglet « Compte à rebours » — aperçu live calé sur la date de couverture.
 */

import { useEffect, useMemo, useState } from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';

import { EditorHint } from '@/features/editor/components/EditorHint';
import { useEditor } from '@/features/editor/EditorContext';
import { resolveCountdownTargetMs } from '@/features/editor/snapshot';
import { useStudioChrome } from '@/features/editor/useStudioChrome';
import { SealCountdown } from '@/features/templates/aurore/SealCountdown';
import { FilmCountdown } from '@/features/templates/pellicule/FilmCountdown';

const pad2 = (n: number): string => String(n).padStart(2, '0');

export default function CompteurTabScreen({ embedded = false }: { embedded?: boolean }) {
  const { template, countdownStyle, cover, theme: invitationTheme } = useEditor();
  const colors = useStudioChrome();
  const [now, setNow] = useState(() => Date.now());
  const targetMs = useMemo(
    () => resolveCountdownTargetMs(cover.dateLabel),
    [cover.dateLabel],
  );

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const ms = Math.max(0, targetMs - now);
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);

  const blocks = [
    { value: pad2(hours), label: 'Heures' },
    { value: pad2(minutes), label: 'Minutes' },
    { value: pad2(seconds), label: 'Secondes' },
  ];

  const sealBody = (
    <>
      {embedded ? null : (
        <EditorHint>
          {`Aperçu calé sur la date de couverture (${cover.dateLabel || 'non définie'}).`}
        </EditorHint>
      )}
      {embedded ? (
        <Text style={[styles.dateHint, { color: colors.textMuted }]}>
          Basé sur la date Infos · {cover.dateLabel || 'non définie'}
        </Text>
      ) : null}
      <View style={[styles.previewCard, styles.sealCard]}>
        <SealCountdown
          days={days}
          hours={pad2(hours)}
          minutes={pad2(minutes)}
          seconds={pad2(seconds)}
          gold={invitationTheme.colors.accent}
          panel={invitationTheme.colors.bg}
          footer={(
            <Text style={[styles.sealVite, { color: invitationTheme.colors.accent }]}>À très vite</Text>
          )}
        />
      </View>
    </>
  );

  const filmBody = (
    <>
      {embedded ? null : (
        <EditorHint>
          {`Aperçu calé sur la date de couverture (${cover.dateLabel || 'non définie'}).`}
        </EditorHint>
      )}
      {embedded ? (
        <Text style={[styles.dateHint, { color: colors.textMuted }]}>
          Basé sur la date Infos · {cover.dateLabel || 'non définie'}
        </Text>
      ) : null}
      <View style={[styles.previewCard, styles.sealCard]}>
        <FilmCountdown
          days={days}
          hours={pad2(hours)}
          minutes={pad2(minutes)}
          seconds={pad2(seconds)}
          ink={invitationTheme.colors.text}
          frame={invitationTheme.colors.primary}
          paper={invitationTheme.colors.bg}
          footer={(
            <Text style={[styles.sealVite, { color: invitationTheme.colors.text }]}>À très vite</Text>
          )}
        />
      </View>
    </>
  );

  const body = template.coverLayout === 'splitPanel'
    ? sealBody
    : template.coverLayout === 'filmStrip'
      ? filmBody
      : (
    <>
      {embedded ? null : (
        <EditorHint>
          {`Aperçu calé sur la date de couverture (${cover.dateLabel || 'non définie'}).`}
        </EditorHint>
      )}
      {embedded ? (
        <Text style={[styles.dateHint, { color: colors.textMuted }]}>
          Basé sur la date Infos · {cover.dateLabel || 'non définie'}
        </Text>
      ) : null}
      <View style={styles.previewCard}>
        <ImageBackground
          source={{ uri: template.countdownImage }}
          style={styles.preview}
          resizeMode="cover"
        >
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(6, 6, 10, 0.72)' }]} />
          <View style={styles.previewBody}>
            <Text style={styles.previewKicker}>Le grand jour dans</Text>
            <Text style={styles.previewDays}>{days}</Text>
            <Text style={[styles.previewDaysLabel, { color: colors.accent }]}>Jours</Text>

            <View
              style={[
                styles.previewRow,
                countdownStyle === 'minimaliste' && styles.previewRowMinimal,
              ]}
            >
              {blocks.map((block, index) => (
                <View key={block.label} style={styles.previewBlockWrap}>
                  {countdownStyle === 'classique' && index > 0 ? (
                    <View style={styles.previewDivider} />
                  ) : null}
                  <View
                    style={[
                      styles.previewBlock,
                      countdownStyle === 'classique' && styles.blockClassique,
                      countdownStyle === 'cercle' && [
                        styles.blockCercle,
                        { borderColor: colors.accent },
                      ],
                    ]}
                  >
                    <Text style={styles.previewValue}>{block.value}</Text>
                    <Text style={[styles.previewLabel, { color: colors.accent }]}>
                      {block.label}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <Text style={[styles.previewVite, { color: colors.accent }]}>À très vite !</Text>
          </View>
        </ImageBackground>
      </View>
    </>
  );

  if (embedded) {
    return <View style={styles.content}>{body}</View>;
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {body}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 32 },
  dateHint: { fontFamily: 'Inter_400Regular', fontSize: 12, marginBottom: 10 },
  previewCard: { borderRadius: 16, overflow: 'hidden', marginBottom: 18 },
  sealCard: { height: 460 },
  sealVite: {
    fontFamily: 'GreatVibes_400Regular',
    fontSize: 28,
    marginTop: 8,
  },
  preview: { height: 232, justifyContent: 'center' },
  previewBody: { alignItems: 'center', gap: 3 },
  previewKicker: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#FFFFFF' },
  previewDays: {
    fontFamily: 'Fraunces_500Medium',
    fontSize: 44,
    lineHeight: 52,
    color: '#FFFFFF',
  },
  previewDaysLabel: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 13,
    color: '#E9D9A8',
    marginTop: -4,
  },
  previewRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  previewRowMinimal: { gap: 18, marginTop: 14 },
  previewBlockWrap: { flexDirection: 'row', alignItems: 'center' },
  previewDivider: { width: 1, height: 24, backgroundColor: 'rgba(255, 255, 255, 0.25)' },
  previewBlock: { alignItems: 'center', paddingHorizontal: 12, gap: 2 },
  blockClassique: {},
  blockCercle: {
    borderWidth: 1.5,
    borderRadius: 999,
    width: 56,
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  previewValue: { fontFamily: 'Fraunces_500Medium', fontSize: 19, color: '#FFFFFF' },
  previewLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 8,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  previewVite: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 15,
    color: '#E9D9A8',
    marginTop: 12,
  },
});
