/**
 * QR scannable — encode une URL (lien invité) via la lib `qrcode`.
 */

import { useMemo } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import QRCode from 'qrcode';

export function GuestQr({
  value,
  size = 140,
  dark = '#121318',
  light = '#FFFFFF',
  style,
}: {
  value: string;
  size?: number;
  dark?: string;
  light?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const model = useMemo(() => {
    const symbol = QRCode.create(value, { errorCorrectionLevel: 'M' });
    const count = symbol.modules.size;
    const cells: boolean[] = [];
    for (let row = 0; row < count; row += 1) {
      for (let col = 0; col < count; col += 1) {
        cells.push(symbol.modules.get(row, col) === 1);
      }
    }
    return { count, cells };
  }, [value]);

  const quiet = 2;
  const modules = model.count + quiet * 2;
  const cell = size / modules;

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel="Code QR d’entrée"
      style={[{ width: size, height: size, backgroundColor: light }, style]}
    >
      <Svg width={size} height={size}>
        <Rect x={0} y={0} width={size} height={size} fill={light} />
        {model.cells.map((on, index) => {
          if (!on) return null;
          const row = Math.floor(index / model.count);
          const col = index % model.count;
          return (
            <Rect
              key={index}
              x={(col + quiet) * cell}
              y={(row + quiet) * cell}
              width={cell}
              height={cell}
              fill={dark}
            />
          );
        })}
      </Svg>
    </View>
  );
}
