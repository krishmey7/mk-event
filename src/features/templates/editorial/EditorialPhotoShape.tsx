/**
 * Formes de la photo Revue — planche, volume (hexagone), médaillon.
 * Image React Native (les URI locales du studio passent), découpe par forme.
 */

import { Animated, Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import type { PhotoFrameKey } from '@/features/invitation/types';

const HEX_CLIP = {
  overflow: 'hidden',
  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
} as ViewStyle;

export function EditorialPhotoShape({
  uri,
  frame,
  color,
  fallbackColor,
  imageStyle,
}: {
  uri: string;
  frame: PhotoFrameKey | string;
  color: string;
  fallbackColor: string;
  imageStyle?: StyleProp<ViewStyle>;
}) {
  const hex = frame === 'hex' || frame === 'hexFloral';
  const circle = frame === 'circle' || frame === 'circleFloral';

  return (
    <View
      style={[
        styles.fill,
        styles.clip,
        hex ? HEX_CLIP : null,
        circle ? styles.circle : null,
        hex ? styles.noBorder : { borderColor: color },
        { backgroundColor: fallbackColor },
      ]}
    >
      {uri ? (
        <Animated.View style={[styles.photoShift, imageStyle]}>
          <Image source={{ uri }} style={styles.photo} resizeMode="cover" />
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject },
  clip: { overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth },
  noBorder: { borderWidth: 0 },
  circle: { borderRadius: 999 },
  photoShift: { width: '100%', height: '120%' },
  photo: { width: '100%', height: '100%' },
});
