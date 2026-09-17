/**
 * MK EVENT — Modèle « Élégance » · VUE 1 — Couverture « SAVE THE DATE ».
 * Photo plein écran + voile du thème, logo MK compact, sélecteur de
 * thème (bouton pastel en haut à droite), carte flottante ivoire
 * « Bonjour Sarah 👋 » et chevron d'entrée dans l'invitation.
 */

import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { shadows } from '@/constants/theme';
import { Logo } from '@/components/ui/Logo';
import { IMAGES, WEDDING } from '../data';
import type { TemplateTheme } from '../themes';

/** Or champagne du modèle Élégance — pas le coral chrome app ni le thème wizard. */
const ELEGANCE_LOGO = '#C4A574';
const ELEGANCE_LOGO_SOFT = '#A98246';
export function CoverView({ theme, onThemePress, onEnter }: {
  theme: TemplateTheme;
  onThemePress: () => void;
  onEnter: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.fill}>
      <ImageBackground source={{ uri: IMAGES.cover }} style={styles.fill}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.coverOverlay }]} />
        <View style={[styles.overlayDeep, { backgroundColor: theme.colors.coverOverlayDeep }]} />

        <View style={[styles.content, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 6 }]}>
          <View style={styles.topRow}>
            <Logo size="sm" color={ELEGANCE_LOGO} wordmarkColor={ELEGANCE_LOGO_SOFT} />
            <View style={styles.flex} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Choisir le thème"
              onPress={onThemePress}
              hitSlop={6}
              style={styles.roundBtn}
            >
              <Ionicons name="color-palette-outline" size={17} color="#FFFFFF" />
            </Pressable>
          </View>

          <View style={styles.spacer} />

          <View style={styles.hero}>
            <Text style={[styles.save, { paddingLeft: 6 }]}>{"SAVE\nTHE DATE"}</Text>
            <View style={styles.ruleRow}>
              <View style={styles.rule} />
              <Ionicons name="heart" size={11} color="#E9D9A8" />
              <View style={styles.rule} />
            </View>
            <Text style={[styles.date, { paddingLeft: 3 }]}>{WEDDING.dateLabel}</Text>
            <Text style={styles.names}>{WEDDING.couple}</Text>
            <Text style={styles.phrase}>Pour notre grand jour</Text>
          </View>

          <View style={styles.spacer} />

          {/* Bienvenue — carte sombre translucide, bordure fine du thème */}
          <View style={[styles.guestCard, { borderColor: `${theme.colors.accent}66` }]}>
            <Text style={styles.guestHello}>Bonjour {WEDDING.guestName}</Text>
            <Text style={styles.guestSentence}>{WEDDING.guestSentence}</Text>
          </View>

          <Pressable accessibilityRole="button" onPress={onEnter} hitSlop={10} style={styles.chevronBtn}>
            <Ionicons name="chevron-down" size={22} color="rgba(255, 255, 255, 0.9)" />
          </Pressable>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#141210' },
  overlayDeep: { ...StyleSheet.absoluteFillObject, bottom: '46%' },
  content: { flex: 1, paddingHorizontal: 18 },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  flex: { flex: 1 },
  roundBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center', justifyContent: 'center',
  },
  spacer: { flex: 1 },
  hero: { alignItems: 'center', gap: 10 },
  save: {
    fontFamily: 'Fraunces_500Medium', fontSize: 33, lineHeight: 41,
    color: '#FFFFFF', letterSpacing: 6, textAlign: 'center',
  },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rule: { width: 34, height: 1, backgroundColor: 'rgba(233, 217, 168, 0.7)' },
  date: {
    fontFamily: 'Inter_600SemiBold', fontSize: 12, letterSpacing: 3,
    color: '#E9D9A8', textAlign: 'center',
  },
  names: {
    fontFamily: 'Fraunces_400Regular_Italic', fontSize: 31, lineHeight: 39,
    color: '#FFFFFF',
  },
  phrase: {
    fontFamily: 'Fraunces_400Regular_Italic', fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  guestCard: {
    backgroundColor: 'rgba(16, 14, 11, 0.55)',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 6,
  },
  guestHello: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 20,
    color: '#FFFFFF',
  },
  guestSentence: {
    fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19,
    color: 'rgba(255, 255, 255, 0.78)', textAlign: 'center',
  },
  chevronBtn: { alignSelf: 'center', marginTop: 8, padding: 6 },
});
