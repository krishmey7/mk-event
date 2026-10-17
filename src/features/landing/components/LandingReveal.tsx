/**
 * Apparition façon Edulex / Framer Motion :
 * - mode "view"  → whileInView once (opacity + y/x)
 * - mode "mount" → animate au chargement (hero)
 */

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Easing,
  Platform,
  View,
  type LayoutChangeEvent,
  type ViewStyle,
} from 'react-native';

type ScrollBridge = {
  scrollY: Animated.Value;
  viewportH: number;
  getOffset: () => number;
};

export const LandingScrollContext = createContext<ScrollBridge | null>(null);

export function LandingScrollProvider({
  scrollY,
  viewportH,
  getOffset,
  children,
}: ScrollBridge & { children: ReactNode }) {
  return (
    <LandingScrollContext.Provider value={{ scrollY, viewportH, getOffset }}>
      {children}
    </LandingScrollContext.Provider>
  );
}

function resolveDomNode(ref: View | null): Element | null {
  if (!ref) return null;
  const anyRef = ref as unknown as {
    getNode?: () => unknown;
    _nativeNode?: unknown;
  };
  if (typeof Element !== 'undefined' && (ref as unknown) instanceof Element) {
    return ref as unknown as Element;
  }
  const native = anyRef._nativeNode;
  if (typeof Element !== 'undefined' && native instanceof Element) return native;
  try {
    const node = anyRef.getNode?.();
    if (typeof Element !== 'undefined' && node instanceof Element) return node;
  } catch {
    /* noop */
  }
  return null;
}

export function LandingReveal({
  children,
  style,
  delay = 0,
  /** Décalage vertical initial (Edulex défaut : 20). */
  y = 20,
  /** Décalage horizontal initial (listes Edulex : -20). */
  x = 0,
  /** Durée ms (Edulex blocs : 600, items liste : 500). */
  duration = 600,
  /** view = whileInView ; mount = animate au chargement. */
  mode = 'view',
  onLayout,
  once = true,
}: {
  children: ReactNode;
  style?: ViewStyle;
  delay?: number;
  y?: number;
  x?: number;
  duration?: number;
  mode?: 'view' | 'mount';
  onLayout?: (event: LayoutChangeEvent) => void;
  once?: boolean;
}) {
  const bridge = useContext(LandingScrollContext);
  const hostRef = useRef<View>(null);
  const contentYRef = useRef<number | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(y)).current;
  const translateX = useRef(new Animated.Value(x)).current;
  const [played, setPlayed] = useState(false);
  const playedRef = useRef(false);

  const play = useCallback(() => {
    if (playedRef.current && once) return;
    playedRef.current = true;
    setPlayed(true);
    const ease = Easing.out(Easing.cubic);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        easing: ease,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        easing: ease,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration,
        delay,
        easing: ease,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, duration, once, opacity, translateX, translateY]);

  const captureContentY = useCallback(() => {
    const node = hostRef.current;
    if (!node || !bridge) return;
    node.measureInWindow((_x, winY) => {
      contentYRef.current = bridge.getOffset() + winY;
    });
  }, [bridge]);

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      onLayout?.(event);
      captureContentY();
    },
    [captureContentY, onLayout],
  );

  // Mount (hero Edulex : animate, pas whileInView)
  useEffect(() => {
    if (mode !== 'mount') return;
    const id = requestAnimationFrame(() => play());
    return () => cancelAnimationFrame(id);
  }, [mode, play]);

  // Web : IntersectionObserver = whileInView
  useEffect(() => {
    if (mode !== 'view') return;
    if (playedRef.current && once) return;
    if (Platform.OS !== 'web' || typeof IntersectionObserver === 'undefined') return;

    let observer: IntersectionObserver | null = null;
    let cancelled = false;
    let tries = 0;

    const attach = () => {
      if (cancelled || playedRef.current) return;
      const dom = resolveDomNode(hostRef.current);
      if (!dom) {
        tries += 1;
        if (tries < 12) requestAnimationFrame(attach);
        return;
      }
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting && entry.intersectionRatio > 0.05)) {
            play();
            if (once) observer?.disconnect();
          }
        },
        { threshold: [0.08, 0.2], rootMargin: '0px 0px -10% 0px' },
      );
      observer.observe(dom);
    };

    const raf = requestAnimationFrame(attach);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      observer?.disconnect();
    };
  }, [mode, once, play]);

  // Fallback scroll
  useEffect(() => {
    if (mode !== 'view') return;
    if (!bridge) return;
    if (playedRef.current && once) return;

    const check = (offset: number) => {
      const top = contentYRef.current;
      if (top == null) {
        captureContentY();
        return;
      }
      if (offset + bridge.viewportH * 0.82 >= top) play();
    };

    check(bridge.getOffset());
    const id = bridge.scrollY.addListener(({ value }) => check(value));
    return () => bridge.scrollY.removeListener(id);
  }, [bridge, captureContentY, mode, once, play, played]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (reduced) {
      opacity.setValue(1);
      translateY.setValue(0);
      translateX.setValue(0);
      playedRef.current = true;
      setPlayed(true);
    }
  }, [opacity, translateX, translateY]);

  return (
    <View ref={hostRef} collapsable={false} style={style} onLayout={handleLayout}>
      <Animated.View
        style={{ opacity, transform: [{ translateX }, { translateY }] }}
      >
        {children}
      </Animated.View>
    </View>
  );
}
