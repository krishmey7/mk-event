/**
 * Icône Iconify (SVG distant) — décor templates sans assets locaux.
 * API : https://api.iconify.design/{prefix}/{name}.svg
 */

import { useMemo } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { SvgUri } from 'react-native-svg';

export function iconifySvgUrl(
  icon: string,
  options?: { color?: string; width?: number; height?: number },
): string {
  const [prefix, name] = icon.includes(':') ? icon.split(':') : ['mdi', icon];
  const params = new URLSearchParams();
  if (options?.color) params.set('color', options.color);
  if (options?.width) params.set('width', String(options.width));
  if (options?.height) params.set('height', String(options.height));
  const query = params.toString();
  return `https://api.iconify.design/${prefix}/${name}.svg${query ? `?${query}` : ''}`;
}

export function IconifyIcon({
  icon,
  size = 24,
  color,
  style,
}: {
  /** Ex. `ph:gift-light`, `noto:balloon`, `mdi:star-outline`. */
  icon: string;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const uri = useMemo(
    () => iconifySvgUrl(icon, { color, width: size, height: size }),
    [icon, color, size],
  );

  return (
    <View style={[{ width: size, height: size }, style]}>
      <SvgUri uri={uri} width={size} height={size} />
    </View>
  );
}
