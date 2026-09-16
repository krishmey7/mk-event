import { View } from 'react-native';

export function SnowflakeSvg({ color, size = 28 }: { color: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {[0, 60, 120].map((deg) => (
        <View
          key={deg}
          style={{
            position: 'absolute',
            width: 1.1,
            height: size * 0.88,
            borderRadius: 1,
            backgroundColor: color,
            opacity: 0.7,
            transform: [{ rotate: `${deg}deg` }],
          }}
        />
      ))}
    </View>
  );
}
