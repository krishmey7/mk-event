/**
 * Chrome audio invité — activer le son (politique autoplay web)
 * + couper / relancer.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function InvitationAudioChrome({
  needsGesture,
  muted,
  onEnable,
  onToggleMute,
  accent = '#C4A574',
}: {
  needsGesture: boolean;
  muted: boolean;
  onEnable: () => void;
  onToggleMute: () => void;
  accent?: string;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="box-none" style={[styles.host, { top: insets.top + 54 }]}>
      {needsGesture ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Activer le message vocal et la musique"
          onPress={onEnable}
          style={({ pressed }) => [styles.enable, pressed && styles.pressed]}
        >
          <Ionicons name="volume-high-outline" size={16} color="#FFFFFF" />
          <Text style={styles.enableLabel}>Activer le son</Text>
        </Pressable>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={muted ? 'Réactiver le son' : 'Couper le son'}
          onPress={onToggleMute}
          hitSlop={8}
          style={({ pressed }) => [
            styles.mute,
            { borderColor: `${accent}88` },
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name={muted ? 'volume-mute-outline' : 'volume-medium-outline'}
            size={16}
            color="#FFFFFF"
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    right: 14,
    zIndex: 30,
    alignItems: 'flex-end',
    gap: 8,
  },
  enable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(18, 19, 24, 0.72)',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  enableLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12.5,
    color: '#FFFFFF',
  },
  mute: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(18, 19, 24, 0.55)',
    borderWidth: 1,
  },
  pressed: { opacity: 0.82 },
});
