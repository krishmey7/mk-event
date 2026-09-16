/**
 * Visuels onboarding — même langage que le studio (eucalyptus, ardoise, blanc).
 */

import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { fontFamilies, radii, shadows } from '@/constants/theme';

const TEAL = '#2F6F69';
const TEAL_SOFT = '#5BA89F';
const INK = '#15181E';
const MIST = '#EEF1F4';
const BORDER = '#DCE1E8';

const LEAF_POSITIONS = [
  { top: 30, left: 12 },
  { top: 30, left: 43 },
  { top: 46, left: 12 },
  { top: 46, left: 43 },
  { top: 62, left: 13 },
  { top: 62, left: 42 },
];

function BotanicalSprig({ s = 1 }: { s?: number }) {
  return (
    <View style={{ width: 64 * s, height: 84 * s }}>
      <View
        style={[
          styles.sprigLeaf,
          { top: 0, left: 27 * s, width: 10 * s, height: 24 * s, borderRadius: 5 * s },
        ]}
      />
      <View
        style={[
          styles.sprigStem,
          { top: 18 * s, left: 31 * s, width: 2 * s, height: 60 * s, borderRadius: 1 * s },
        ]}
      />
      {LEAF_POSITIONS.map((position, index) => (
        <View
          key={index}
          style={[
            styles.sprigLeaf,
            {
              top: position.top * s,
              left: position.left * s,
              width: 9 * s,
              height: 22 * s,
              borderRadius: 4.5 * s,
            },
            { transform: [{ rotate: index % 2 === 0 ? '-42deg' : '42deg' }] },
          ]}
        />
      ))}
    </View>
  );
}

function TemplatesFanMockup() {
  return (
    <View style={styles.fanStage}>
      <View style={[styles.fanBackCard, styles.fanBackLeft]}>
        <View style={styles.fanInnerFrame}>
          <View style={styles.fanOrnament} />
        </View>
      </View>

      <View style={[styles.fanBackCard, styles.fanBackRight, { backgroundColor: INK }]}>
        <View style={styles.fanInnerFrameDark}>
          <View style={styles.fanRule} />
          <View style={[styles.fanRule, { width: 56 }]} />
          <View style={styles.fanRule} />
        </View>
      </View>

      <View style={styles.fanFrontCard}>
        <BotanicalSprig />
        <Text style={styles.fanCardTitle}>MARIAGE</Text>
        <View style={styles.fanDivider} />
        <Text style={styles.fanCardDate}>14.06.2025</Text>
      </View>
    </View>
  );
}

function EditorPhoneMockup() {
  return (
    <View style={styles.phone}>
      <View style={styles.phoneScreen}>
        <View style={styles.phoneIsland} />

        <View style={styles.editorCanvas}>
          <View style={styles.editorSelection}>
            <View style={styles.editorCursor} />
            <BotanicalSprig s={0.5} />
          </View>
          <Text style={styles.editorTitle}>MARIAGE</Text>
          <Text style={styles.editorDate}>14.06.2025</Text>
        </View>

        <View style={styles.editorToolbar}>
          {(['text-outline', 'color-palette-outline', 'image-outline', 'add-circle-outline'] as const).map(
            (name) => (
              <View key={name} style={styles.editorToolChip}>
                <Ionicons name={name} size={13} color={TEAL} />
              </View>
            ),
          )}
        </View>
      </View>
    </View>
  );
}

function ShareCircleMockup() {
  return (
    <View style={styles.shareStage}>
      <View style={[styles.shareBubble, { left: 134, top: 4 }]}>
        <Ionicons name="mail-outline" size={22} color={TEAL} />
      </View>
      <View style={[styles.shareBubble, { left: 258, top: 94 }]}>
        <Ionicons name="chatbubble-ellipses-outline" size={22} color={TEAL} />
      </View>
      <View style={[styles.shareBubble, { left: 210, top: 239 }]}>
        <Ionicons name="people-outline" size={22} color={TEAL} />
      </View>
      <View style={[styles.shareBubble, { left: 58, top: 239 }]}>
        <Ionicons name="heart-outline" size={22} color={TEAL} />
      </View>
      <View style={[styles.shareBubble, { left: 10, top: 94 }]}>
        <Ionicons name="share-social-outline" size={22} color={TEAL} />
      </View>

      <View style={styles.shareCard}>
        <BotanicalSprig s={0.6} />
        <Text style={styles.shareCardTitle}>Notre{'\n'}Mariage</Text>
        <View style={styles.shareDivider} />
        <Text style={styles.shareCardDate}>14.06.2025</Text>
      </View>
    </View>
  );
}

export function SlideIllustration({ variant }: { variant: 1 | 2 | 3 }) {
  if (variant === 1) return <TemplatesFanMockup />;
  if (variant === 2) return <EditorPhoneMockup />;
  return <ShareCircleMockup />;
}

const styles = StyleSheet.create({
  sprigLeaf: { position: 'absolute', backgroundColor: TEAL_SOFT },
  sprigStem: { position: 'absolute', backgroundColor: TEAL },

  fanStage: { width: 300, height: 330 },
  fanBackCard: {
    position: 'absolute',
    width: 172,
    height: 232,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  fanBackLeft: { left: 10, top: 48, transform: [{ rotate: '-14deg' }] },
  fanBackRight: { right: 10, top: 48, transform: [{ rotate: '14deg' }] },
  fanInnerFrame: {
    width: 132,
    height: 192,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(47, 111, 105, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fanInnerFrameDark: {
    width: 132,
    height: 192,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(91, 168, 159, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  fanOrnament: {
    width: 12,
    height: 12,
    backgroundColor: TEAL_SOFT,
    transform: [{ rotate: '45deg' }],
  },
  fanRule: { width: 84, height: 1.5, backgroundColor: 'rgba(91, 168, 159, 0.55)' },
  fanFrontCard: {
    position: 'absolute',
    left: 50,
    top: 28,
    width: 200,
    height: 264,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    paddingTop: 28,
    ...shadows.lg,
  },
  fanCardTitle: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 4,
    color: TEAL,
    marginTop: 10,
  },
  fanDivider: { width: 34, height: 1.5, backgroundColor: TEAL_SOFT, marginTop: 10 },
  fanCardDate: {
    fontFamily: fontFamilies.sans,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 2,
    color: '#5A6270',
    marginTop: 8,
  },

  phone: {
    width: 168,
    height: 330,
    borderRadius: 30,
    backgroundColor: INK,
    padding: 8,
    ...shadows.lg,
  },
  phoneScreen: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    alignItems: 'center',
  },
  phoneIsland: {
    width: 60,
    height: 16,
    borderRadius: 8,
    backgroundColor: INK,
    marginTop: 8,
  },
  editorCanvas: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: MIST,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingBottom: 40,
  },
  editorSelection: {
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: TEAL_SOFT,
    borderStyle: 'dashed',
    borderRadius: radii.sm,
    padding: 8,
  },
  editorCursor: {
    position: 'absolute',
    right: -5,
    top: 10,
    width: 2,
    height: 22,
    borderRadius: 1,
    backgroundColor: TEAL,
  },
  editorTitle: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 3,
    color: TEAL,
  },
  editorDate: {
    fontFamily: fontFamilies.sans,
    fontSize: 9,
    lineHeight: 13,
    letterSpacing: 1.5,
    color: '#5A6270',
  },
  editorToolbar: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 8,
    paddingVertical: 5,
    ...shadows.md,
  },
  editorToolChip: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: MIST,
    alignItems: 'center',
    justifyContent: 'center',
  },

  shareStage: { width: 320, height: 320 },
  shareBubble: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  shareCard: {
    position: 'absolute',
    left: 75,
    top: 75,
    width: 170,
    height: 170,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  shareCardTitle: {
    fontFamily: fontFamilies.serifMedium,
    fontSize: 20,
    lineHeight: 27,
    textAlign: 'center',
    color: INK,
    marginTop: 8,
  },
  shareDivider: { width: 30, height: 1.5, backgroundColor: TEAL_SOFT, marginTop: 8 },
  shareCardDate: {
    fontFamily: fontFamilies.sans,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1.5,
    color: '#5A6270',
    marginTop: 6,
  },
});
