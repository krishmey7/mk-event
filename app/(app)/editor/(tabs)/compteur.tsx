/**
 * Onglet « Compte à rebours » — personnalisation (planche 2, écran 5).
 * Aperçu live du compteur, choix du style (Classique / Cercle /
 * Minimaliste). Les couleurs se règlent à l’étape Thème.
 */

import { useEffect, useState } from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';

import { COUNTDOWN_TARGET } from '@/features/templates/elegance/data';
import { EditorHint } from '@/features/editor/components/EditorHint';
import { useEditor } from '@/features/editor/EditorContext';
import { useStudioChrome } from '@/features/editor/useStudioChrome';

const pad2 = (n: number): string => String(n).padStart(2, '0');

export default function CompteurTabScreen() {
  const {template, countdownStyle} = useEditor();
  const colors = useStudioChrome();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const ms = Math.max(0, COUNTDOWN_TARGET - now);
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);

  const blocks = [
    { value: pad2(hours), label: 'Heures' },
    { value: pad2(minutes), label: 'Minutes' },
    { value: pad2(seconds), label: 'Secondes' },
  ];

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <EditorHint>Aperçu du compte à rebours. Style figé par le modèle ; la date vient de la couverture.</EditorHint>
      <View style={styles.previewCard}>
        <ImageBackground source={{ uri: template.countdownImage }} style={styles.preview} resizeMode="cover">
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(6, 6, 10, 0.72)' }]} />
          <View style={styles.previewBody}>
            <Text style={styles.previewKicker}>Le grand jour dans</Text>
            <Text style={styles.previewDays}>{days}</Text>
            <Text style={[styles.previewDaysLabel, { color: colors.accent }]}>Jours</Text>

            <View style={[styles.previewRow, countdownStyle === 'minimaliste' && styles.previewRowMinimal]}>
              {blocks.map((block, index) => (
                <View key={block.label} style={styles.previewBlockWrap}>
                  {countdownStyle === 'classique' && index > 0 ? <View style={styles.previewDivider} /> : null}
                  <View
                    style={[
                      styles.previewBlock,
                      countdownStyle === 'classique' && styles.blockClassique,
                      countdownStyle === 'cercle' && [styles.blockCercle, { borderColor: colors.accent }],
                    ]}
                  >
                    <Text style={styles.previewValue}>{block.value}</Text>
                    <Text style={[styles.previewLabel, { color: colors.accent }]}>{block.label}</Text>
                  </View>
                </View>
              ))}
            </View>

            <Text style={[styles.previewVite, { color: colors.accent }]}>À très vite !</Text>
          </View>
        </ImageBackground>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 32 },
  previewCard: { borderRadius: 16, overflow: 'hidden', marginBottom: 18 },
  preview: { height: 232, justifyContent: 'center' },
  previewBody: { alignItems: 'center', gap: 3 },
  previewKicker: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#FFFFFF' },
  previewDays: { fontFamily: 'Fraunces_500Medium', fontSize: 44, lineHeight: 52, color: '#FFFFFF' },
  previewDaysLabel: { fontFamily: 'Fraunces_400Regular_Italic', fontSize: 13, color: '#E9D9A8', marginTop: -4 },
  previewRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  previewRowMinimal: { gap: 18, marginTop: 14 },
  previewBlockWrap: { flexDirection: 'row', alignItems: 'center' },
  previewDivider: { width: 1, height: 24, backgroundColor: 'rgba(255, 255, 255, 0.25)' },
  previewBlock: { alignItems: 'center', paddingHorizontal: 12, gap: 2 },
  /* Classique — pavés rectangulaires arrondis */
  blockClassique: {
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  /* Cercle — chiffres dans des cercles fins dorés */
  blockCercle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.2,
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  previewValue: { fontFamily: 'Fraunces_500Medium', fontSize: 19, color: '#FFFFFF' },
  previewLabel: {
    fontFamily: 'Inter_600SemiBold', fontSize: 8.5, letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  previewVite: { fontFamily: 'Fraunces_400Regular_Italic', fontSize: 15, color: '#E9D9A8', marginTop: 12 },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14, marginTop: 6, marginBottom: 10 },
  styleRow: { flexDirection: 'row', gap: 10 },
  styleCard: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.4,
    borderRadius: 14,
    paddingVertical: 14,
  },
  styleLabel: { fontFamily: 'Inter_500Medium', fontSize: 12 },
});
