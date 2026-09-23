/**
 * Décor onboarding — vague, botanique or, médaillons.
 */

import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';

const GOLD = '#C4A574';
const GOLD_SOFT = '#A98246';
const CORAL = '#E07A5F';
const PAPER = '#F7F0E8';

/** Vague asymétrique en bas du héro photo. */
export function OnboardingWave({ width, height = 58 }: { width: number; height?: number }) {
  const path = [
    `M0 ${height * 0.38}`,
    `C ${width * 0.2} ${height * 1.02}`,
    `${width * 0.36} ${height * 1.08}`,
    `${width * 0.5} ${height * 0.7}`,
    `C ${width * 0.64} ${height * 0.32}`,
    `${width * 0.8} ${height * 0.22}`,
    `${width} ${height * 0.52}`,
    `L ${width} ${height + 2}`,
    `L 0 ${height + 2}`,
    'Z',
  ].join(' ');

  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={styles.wave}
      pointerEvents="none"
    >
      <Path d={path} fill={PAPER} />
    </Svg>
  );
}

/** Feuille botanique or — trait fin. */
export function BotanicalLeaf({
  width = 72,
  height = 96,
  flip = false,
  opacity = 0.55,
}: {
  width?: number;
  height?: number;
  flip?: boolean;
  opacity?: number;
}) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 72 96"
      style={{ opacity, transform: [{ scaleX: flip ? -1 : 1 }] }}
      pointerEvents="none"
    >
      <Path
        d="M36 8 C28 28 18 48 22 72 C26 88 34 92 36 94 C38 92 46 88 50 72 C54 48 44 28 36 8 Z"
        fill="none"
        stroke={GOLD}
        strokeWidth={1.4}
      />
      <Path d="M36 22 C36 40 36 58 36 90" fill="none" stroke={GOLD_SOFT} strokeWidth={1.1} />
      <Path
        d="M36 34 C28 38 24 46 22 54 M36 48 C44 52 48 58 50 66 M36 62 C29 66 26 72 25 78"
        fill="none"
        stroke={GOLD}
        strokeWidth={1}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export type MedallionKind = 'rings' | 'cake' | 'conference';

/** Médaillon central sur la ligne de vague. */
export function OnboardingMedallion({ kind }: { kind: MedallionKind }) {
  return (
    <View style={styles.medallion}>
      <Svg width={44} height={44} viewBox="0 0 44 44">
        {kind === 'rings' ? <RingsIcon /> : null}
        {kind === 'cake' ? <CakeIcon /> : null}
        {kind === 'conference' ? <ConferenceIcon /> : null}
      </Svg>
    </View>
  );
}

function RingsIcon() {
  return (
    <G fill="none" stroke={GOLD_SOFT} strokeWidth={1.6}>
      <Circle cx={17} cy={24} r={9} />
      <Circle cx={27} cy={24} r={9} />
      <Path
        d="M22 11 C23.2 9.2 25.4 9.2 26.2 11.2 C26.8 12.8 25.6 14.2 24.2 15.4 C23.4 16.1 22.6 16.6 22 17 C21.4 16.6 20.6 16.1 19.8 15.4 C18.4 14.2 17.2 12.8 17.8 11.2 C18.6 9.2 20.8 9.2 22 11 Z"
        fill={CORAL}
        stroke="none"
      />
    </G>
  );
}

function CakeIcon() {
  return (
    <G fill="none" stroke={GOLD_SOFT} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 34 H32 V24 C32 21 30 19 27 19 H17 C14 19 12 21 12 24 Z" />
      <Path d="M14 24 H30" />
      <Path d="M18 19 V15" />
      <Path d="M22 19 V14" />
      <Path d="M26 19 V15" />
      <Circle cx={18} cy={13} r={1.6} fill={CORAL} stroke="none" />
      <Circle cx={22} cy={12} r={1.6} fill={CORAL} stroke="none" />
      <Circle cx={26} cy={13} r={1.6} fill={CORAL} stroke="none" />
    </G>
  );
}

function ConferenceIcon() {
  return (
    <G fill="none" stroke={GOLD_SOFT} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M14 28 V18 C14 14 17 11 22 11 C27 11 30 14 30 18 V28" />
      <Path d="M11 24 C11 29 15 33 22 33 C29 33 33 29 33 24" />
      <Path d="M22 33 V37" />
      <Path d="M17 37 H27" />
      <Circle cx={22} cy={18} r={2} fill={CORAL} stroke="none" />
    </G>
  );
}

const styles = StyleSheet.create({
  wave: {
    position: 'absolute',
    left: 0,
    bottom: -1,
  },
  medallion: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: PAPER,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(196, 165, 116, 0.45)',
    shadowColor: '#2A1824',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
});
