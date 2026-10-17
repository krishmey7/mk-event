/**
 * Bandeau bas de hero — disposition Edulex :
 * label fixe à gauche + piste qui défile à droite.
 * Items = types d’événements MK (sens du label « Des invitations pour… »).
 */

import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';

import { landingFonts } from '../landingFonts';

/** Uniquement ce que le label introduit : des invitations pour… */
const ITEMS = ['Mariages', 'Anniversaires', 'Conférences'] as const;

const WEB_STYLE_ID = 'mk-hero-marquee-keyframes';

function ensureWebKeyframes() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  if (document.getElementById(WEB_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = WEB_STYLE_ID;
  style.textContent = `
    @keyframes mk-hero-marquee {
      from { transform: translate3d(0, 0, 0); }
      to { transform: translate3d(-50%, 0, 0); }
    }
  `;
  document.head.appendChild(style);
}

function ItemRow({ prefix = '' }: { prefix?: string }) {
  return (
    <View style={styles.trackRow}>
      {ITEMS.map((item) => (
        <Text key={`${prefix}${item}`} style={styles.item} numberOfLines={1}>
          {item}
        </Text>
      ))}
    </View>
  );
}

export function HeroMarquee() {
  const nativeOffset = useRef(new Animated.Value(0)).current;
  const [trackWidth, setTrackWidth] = useState(0);

  useEffect(() => {
    ensureWebKeyframes();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web' || trackWidth <= 0) return;
    nativeOffset.setValue(0);
    const anim = Animated.loop(
      Animated.timing(nativeOffset, {
        toValue: -trackWidth,
        duration: Math.max(16000, trackWidth * 24),
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    anim.start();
    return () => anim.stop();
  }, [nativeOffset, trackWidth]);

  const onTrackLayout = (event: LayoutChangeEvent) => {
    const w = Math.round(event.nativeEvent.layout.width);
    if (w > 0 && w !== trackWidth) setTrackWidth(w);
  };

  /** Liste courte → on répète 2× dans chaque demi-piste pour remplir sans tasser. */
  const webTrack = (
    <>
      <ItemRow />
      <ItemRow prefix="b-" />
      <ItemRow prefix="c-" />
      <ItemRow prefix="d-" />
    </>
  );

  return (
    <View style={styles.root}>
      <View style={styles.rule} />
      <View style={styles.row}>
        <Text style={styles.label}>
          {'Des invitations pour\nchaque moment'}
        </Text>

        <View style={styles.divider} />

        <View style={styles.viewport}>
          {Platform.OS === 'web' ? (
            <View
              style={[
                styles.track,
                {
                  animationName: 'mk-hero-marquee',
                  animationDuration: '28s',
                  animationTimingFunction: 'linear',
                  animationIterationCount: 'infinite',
                  width: 'max-content',
                } as object,
              ]}
            >
              {webTrack}
              {webTrack}
            </View>
          ) : (
            <Animated.View
              style={[
                styles.track,
                { transform: [{ translateX: nativeOffset }] },
              ]}
            >
              <View style={styles.trackRow} onLayout={onTrackLayout}>
                {[...ITEMS, ...ITEMS, ...ITEMS, ...ITEMS].map((item, i) => (
                  <Text key={`a-${i}-${item}`} style={styles.item} numberOfLines={1}>
                    {item}
                  </Text>
                ))}
              </View>
              <View style={styles.trackRow} pointerEvents="none">
                {[...ITEMS, ...ITEMS, ...ITEMS, ...ITEMS].map((item, i) => (
                  <Text key={`b-${i}-${item}`} style={styles.item} numberOfLines={1}>
                    {item}
                  </Text>
                ))}
              </View>
            </Animated.View>
          )}
          <View pointerEvents="none" style={styles.fade} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    paddingTop: 8,
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
    backgroundColor: 'rgba(255, 249, 245, 0.22)',
    marginBottom: 26,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    minHeight: 44,
  },
  label: {
    ...landingFonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255, 249, 245, 0.58)',
    flexShrink: 0,
    width: 132,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 40,
    backgroundColor: 'rgba(255, 249, 245, 0.28)',
    flexShrink: 0,
  },
  viewport: {
    flex: 1,
    overflow: 'hidden',
    minWidth: 0,
    position: 'relative',
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: 64,
    paddingRight: 64,
  },
  item: {
    ...landingFonts.medium,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: -0.2,
    color: 'rgba(255, 249, 245, 0.92)',
    flexShrink: 0,
  },
  fade: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 64,
    ...(Platform.OS === 'web'
      ? ({
          backgroundImage:
            'linear-gradient(90deg, rgba(26,15,22,0) 0%, #1A0F16 88%)',
        } as object)
      : {
          backgroundColor: 'rgba(26, 15, 22, 0.45)',
        }),
  },
});
