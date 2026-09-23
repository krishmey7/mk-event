/**
 * MK EVENTS — Modèle « Élégance » · VUE 4 — Compte à rebours sombre.
 * « LE GRAND JOUR DANS » — 142 J / 08 H / 36 M / 12 S (valeurs de la
 * maquette au chargement, décompte en temps réel) + « À très vite ! ».
 */

import { useEffect, useState } from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COUNTDOWN_TARGET, IMAGES } from '../data';

export function CountdownView({ onBack, liked, onToggleLike }: {
  onBack: () => void;
  liked: boolean;
  onToggleLike: () => void;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const ms = Math.max(0, COUNTDOWN_TARGET - now);
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const p2 = (n: number): string => String(n).padStart(2, '0');

  const blocks: { value: string; label: string }[] = [
    { value: String(days), label: 'Jours' },
    { value: p2(hours), label: 'Heures' },
    { value: p2(minutes), label: 'Minutes' },
    { value: p2(seconds), label: 'Secondes' },
  ];

  return (
    <View style={styles.fill}>
      <ImageBackground source={{ uri: IMAGES.countdown }} style={styles.fill}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(6, 6, 10, 0.74)' }]} />

        <View style={styles.header}>
          <Pressable accessibilityRole="button" onPress={onBack} hitSlop={8} style={styles.circle}>
            <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
          </Pressable>
          <View style={styles.flex} />
          <Pressable accessibilityRole="button" onPress={onToggleLike} hitSlop={8} style={styles.circle}>
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={19}
              color={liked ? '#E25555' : '#FFFFFF'}
            />
          </Pressable>
        </View>

        <View style={styles.center}>
          <Text style={[styles.kicker, { paddingLeft: 5 }]}>LE GRAND JOUR</Text>
          <Text style={[styles.kickerGold, { paddingLeft: 6 }]}>DANS</Text>
          <Text style={styles.big}>{days}</Text>
          <Text style={styles.bigLabel}>Jours</Text>

          <View style={styles.row}>
            {blocks.map((block, index) => (
              <View key={block.label} style={styles.blockWrap}>
                {index > 0 ? <View style={styles.divider} /> : null}
                <View style={styles.block}>
                  <Text style={styles.blockValue}>{block.value}</Text>
                  <Text style={styles.blockLabel}>{block.label}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.viteRow}>
            <Ionicons name="heart" size={13} color="#E9D9A8" />
            <Text style={styles.vite}>À très vite !</Text>
            <Ionicons name="heart" size={13} color="#E9D9A8" />
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#0A0A0E' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 10 },
  circle: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingBottom: 30 },
  kicker: {
    fontFamily: 'Inter_600SemiBold', fontSize: 13, letterSpacing: 5,
    color: '#FFFFFF', textAlign: 'center',
  },
  kickerGold: {
    fontFamily: 'Inter_600SemiBold', fontSize: 12, letterSpacing: 6,
    color: '#E9D9A8', textAlign: 'center',
  },
  big: { fontFamily: 'Fraunces_500Medium', fontSize: 86, lineHeight: 96, color: '#FFFFFF' },
  bigLabel: {
    fontFamily: 'Fraunces_400Regular_Italic', fontSize: 16,
    color: '#E9D9A8', marginTop: -6,
  },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 18 },
  blockWrap: { flexDirection: 'row', alignItems: 'center' },
  block: { alignItems: 'center', paddingHorizontal: 13, gap: 3 },
  divider: { width: 1, height: 28, backgroundColor: 'rgba(255, 255, 255, 0.25)' },
  blockValue: { fontFamily: 'Fraunces_500Medium', fontSize: 26, color: '#FFFFFF' },
  blockLabel: {
    fontFamily: 'Inter_600SemiBold', fontSize: 9, letterSpacing: 1.6,
    color: '#E9D9A8', textTransform: 'uppercase',
  },
  viteRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 26 },
  vite: { fontFamily: 'Fraunces_400Regular_Italic', fontSize: 18, color: '#E9D9A8' },
});
