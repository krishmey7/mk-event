/**
 * Parcours « Comment ça marche » — animation scroll + hover.
 */

import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { fontFamilies } from '@/constants/theme';
import { landingFonts } from '../landingFonts';
import { LANDING } from '../landingTokens';
import { LandingScrollContext } from './LandingReveal';

export type HowStepDef = {
  key: string;
  title: string;
  text: string;
  icon: keyof typeof Ionicons.glyphMap;
};

function stepIndexFromProgress(p: number, count: number) {
  const slot = 1 / count;
  for (let i = count - 1; i >= 0; i -= 1) {
    if (p >= i * slot + slot * 0.35) return i;
  }
  return 0;
}

function AnimatedHowStep({
  step,
  index,
  count,
  isDesktop,
  active,
  passed,
  dimmed,
  revealed,
  onHoverChange,
}: {
  step: HowStepDef;
  index: number;
  count: number;
  isDesktop: boolean;
  active: boolean;
  passed: boolean;
  dimmed: boolean;
  revealed: boolean;
  onHoverChange: (hovered: boolean) => void;
}) {
  const n = String(index + 1).padStart(2, '0');
  const rise = useRef(new Animated.Value(28)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const dotScale = useRef(new Animated.Value(1)).current;
  const iconLift = useRef(new Animated.Value(0)).current;
  const playedEntrance = useRef(false);

  useEffect(() => {
    if (!revealed || playedEntrance.current) return;
    playedEntrance.current = true;
    const delay = index * 110;
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 520,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(rise, {
        toValue: 0,
        duration: 560,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, index, revealed, rise]);

  useEffect(() => {
    if (!active) {
      dotScale.setValue(1);
      Animated.spring(iconLift, {
        toValue: 0,
        friction: 9,
        tension: 100,
        useNativeDriver: true,
      }).start();
      return;
    }
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(dotScale, {
          toValue: 1.35,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(dotScale, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    Animated.spring(iconLift, {
      toValue: -3,
      friction: 8,
      tension: 120,
      useNativeDriver: true,
    }).start();
    return () => pulse.stop();
  }, [active, dotScale, iconLift]);

  const webHover =
    Platform.OS === 'web'
      ? ({
          onMouseEnter: () => onHoverChange(true),
          onMouseLeave: () => onHoverChange(false),
          transition: 'opacity 320ms ease',
        } as object)
      : null;

  const bodyStyle = {
    opacity: fade,
    transform: [{ translateY: rise }],
  };

  const indexColor = active ? LANDING.coral : passed ? LANDING.plum : 'rgba(107, 58, 92, 0.45)';

  if (isDesktop) {
    return (
      <Animated.View
        style={[
          styles.stepCol,
          index === 0 && styles.stepColFirst,
          dimmed && styles.stepDimmed,
          bodyStyle,
          webHover,
        ]}
      >
        <View style={styles.stepRail}>
          <Animated.View
            style={[
              styles.stepDot,
              active && styles.stepDotActive,
              passed && !active && styles.stepDotPassed,
              { transform: [{ scale: active ? dotScale : 1 }] },
            ]}
          />
        </View>
        <Text style={[styles.stepIndex, { color: indexColor }]}>{n}</Text>
        <Animated.View style={[styles.iconWrap, { transform: [{ translateY: iconLift }] }]}>
          <Ionicons name={step.icon} size={18} color={active ? LANDING.coral : LANDING.textMuted} />
        </Animated.View>
        <Text style={[styles.stepTitle, active && styles.stepTitleActive]}>{step.title}</Text>
        <Text style={styles.stepText}>{step.text}</Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.stepRow, dimmed && styles.stepDimmed, bodyStyle]}>
      <View style={styles.mobileRail}>
        <Animated.View
          style={[
            styles.stepDot,
            active && styles.stepDotActive,
            passed && !active && styles.stepDotPassed,
            { transform: [{ scale: active ? dotScale : 1 }] },
          ]}
        />
        {index < count - 1 ? (
          <View style={styles.mobileLineTrack}>
            <View
              style={[
                styles.mobileLineFill,
                { height: passed ? '100%' : active ? '55%' : '0%' },
              ]}
            />
          </View>
        ) : null}
      </View>
      <View style={styles.mobileBody}>
        <Text style={[styles.stepIndex, styles.stepIndexMobile, { color: indexColor }]}>{n}</Text>
        <View style={styles.mobileTitleRow}>
          <Ionicons name={step.icon} size={16} color={active ? LANDING.coral : LANDING.textMuted} />
          <Text style={[styles.stepTitle, active && styles.stepTitleActive]}>{step.title}</Text>
        </View>
        <Text style={styles.stepText}>{step.text}</Text>
      </View>
    </Animated.View>
  );
}

export function HowItWorksTrack({
  steps,
  isDesktop,
}: {
  steps: readonly HowStepDef[];
  isDesktop: boolean;
}) {
  const bridge = useContext(LandingScrollContext);
  const hostRef = useRef<View>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const beadX = useRef(new Animated.Value(0)).current;
  const [activeStep, setActiveStep] = useState(0);

  const applyProgress = useCallback(
    (raw: number) => {
      const p = Math.max(0, Math.min(1, raw));
      progress.setValue(p);
      beadX.setValue(p);
      const idx = stepIndexFromProgress(p, steps.length);
      setActiveStep((cur) => (cur === idx ? cur : idx));
      if (p > 0.04) setRevealed(true);
    },
    [beadX, progress, steps.length],
  );

  const computeFromScroll = useCallback(
    (scrollY: number) => {
      hostRef.current?.measureInWindow((_x, winY, _w, h) => {
        const vh = bridge?.viewportH ?? 800;
        const top = scrollY + winY;
        const start = top - vh * 0.72;
        const end = top + Math.max(1, h) * 0.35;
        const span = Math.max(1, end - start);
        applyProgress((scrollY - start) / span);
      });
    },
    [applyProgress, bridge?.viewportH],
  );

  useEffect(() => {
    if (!bridge) {
      applyProgress(0.35);
      setRevealed(true);
      return;
    }
    computeFromScroll(bridge.getOffset());
    const id = bridge.scrollY.addListener(({ value }) => computeFromScroll(value));
    return () => bridge.scrollY.removeListener(id);
  }, [applyProgress, bridge, computeFromScroll]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (reduced) {
      applyProgress(1);
      setRevealed(true);
    }
  }, [applyProgress]);

  const onLayout = (_e: LayoutChangeEvent) => {
    if (bridge) computeFromScroll(bridge.getOffset());
  };

  const lineScale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.001, 1],
  });

  const beadLeft = beadX.interpolate({
    inputRange: [0, 1],
    outputRange: ['6%', '94%'],
  });

  const resolvedActive = hovered ?? activeStep;

  return (
    <View
      ref={hostRef}
      collapsable={false}
      onLayout={onLayout}
      style={[styles.track, isDesktop && styles.trackDesktop]}
    >
      {isDesktop ? (
        <View style={styles.lineLayer} pointerEvents="none">
          <View style={styles.lineTrack} />
          <Animated.View
            style={[
              styles.lineFill,
              {
                transform: [{ scaleX: lineScale }],
                ...(Platform.OS === 'web'
                  ? ({ transformOrigin: 'left center' } as object)
                  : null),
              },
            ]}
          />
          <Animated.View style={[styles.lineBead, { left: beadLeft }]} />
        </View>
      ) : null}

      {steps.map((step, index) => {
        const active = resolvedActive === index;
        const passed =
          hovered != null ? index < hovered : index < activeStep;
        return (
          <AnimatedHowStep
            key={step.key}
            step={step}
            index={index}
            count={steps.length}
            isDesktop={isDesktop}
            active={active}
            passed={passed}
            dimmed={hovered != null && hovered !== index}
            revealed={revealed}
            onHoverChange={(on) => setHovered(on ? index : null)}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    gap: 0,
  },
  trackDesktop: {
    flexDirection: 'row',
    alignItems: 'stretch',
    position: 'relative',
    paddingTop: 18,
  },
  lineLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 24,
    height: 10,
  },
  lineTrack: {
    position: 'absolute',
    left: '6%',
    right: '6%',
    top: 4,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(224, 122, 95, 0.22)',
  },
  lineFill: {
    position: 'absolute',
    left: '6%',
    right: '6%',
    top: 4,
    height: 2,
    borderRadius: 1,
    backgroundColor: LANDING.coral,
  },
  lineBead: {
    position: 'absolute',
    top: 0,
    width: 10,
    height: 10,
    marginLeft: -5,
    borderRadius: 5,
    backgroundColor: LANDING.coral,
    borderWidth: 2,
    borderColor: LANDING.bg,
    ...Platform.select({
      web: { boxShadow: '0 0 0 4px rgba(224, 122, 95, 0.2)' } as object,
      default: {},
    }),
  },
  stepCol: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 8,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: 'rgba(42, 31, 36, 0.12)',
  },
  stepColFirst: {
    borderLeftWidth: 0,
    paddingLeft: 0,
  },
  stepRail: {
    height: 14,
    marginBottom: 18,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: LANDING.bg,
    borderWidth: 2,
    borderColor: 'rgba(224, 122, 95, 0.45)',
  },
  stepDotActive: {
    backgroundColor: LANDING.coral,
    borderColor: LANDING.coral,
  },
  stepDotPassed: {
    borderColor: LANDING.coral,
    backgroundColor: LANDING.coralSoft,
  },
  stepIndex: {
    fontFamily: fontFamilies.serifSemiBold,
    fontSize: 42,
    lineHeight: 46,
    letterSpacing: -1.2,
    marginBottom: 12,
  },
  stepIndexMobile: {
    fontSize: 36,
    lineHeight: 40,
  },
  iconWrap: {
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  stepTitle: {
    ...landingFonts.semibold,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.25,
    color: LANDING.text,
    marginBottom: 8,
  },
  stepTitleActive: {
    color: LANDING.plum,
  },
  stepText: {
    ...landingFonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: LANDING.textMuted,
  },
  stepDimmed: {
    opacity: 0.38,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 16,
    minHeight: 112,
  },
  mobileRail: {
    width: 14,
    alignItems: 'center',
  },
  mobileLineTrack: {
    flex: 1,
    width: 2,
    marginTop: 4,
    borderRadius: 1,
    backgroundColor: 'rgba(224, 122, 95, 0.18)',
    overflow: 'hidden',
  },
  mobileLineFill: {
    width: '100%',
    backgroundColor: LANDING.coral,
    borderRadius: 1,
  },
  mobileBody: {
    flex: 1,
    paddingBottom: 28,
  },
  mobileTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
});
