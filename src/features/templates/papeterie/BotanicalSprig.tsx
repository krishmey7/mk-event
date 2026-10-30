import Svg, { Path } from 'react-native-svg';

export function BotanicalSprig({ color = '#A8A18D', size = 96 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Path d="M12 91C34 72 49 48 78 9" stroke={color} strokeWidth="1.1" strokeLinecap="round" />
      <Path d="M30 72C18 70 13 61 14 51C25 53 31 60 30 72Z" stroke={color} strokeWidth="1" />
      <Path d="M40 59C29 55 27 46 30 37C40 42 44 49 40 59Z" stroke={color} strokeWidth="1" />
      <Path d="M51 44C43 36 45 27 50 20C58 28 59 36 51 44Z" stroke={color} strokeWidth="1" />
      <Path d="M61 30C57 20 62 12 70 7C74 17 71 25 61 30Z" stroke={color} strokeWidth="1" />
      <Path d="M34 68C39 58 48 55 57 57C52 66 44 70 34 68Z" stroke={color} strokeWidth="1" />
      <Path d="M48 51C54 41 63 39 72 42C66 51 58 54 48 51Z" stroke={color} strokeWidth="1" />
      <Path d="M60 34C68 25 77 25 85 29C78 37 70 39 60 34Z" stroke={color} strokeWidth="1" />
    </Svg>
  );
}
