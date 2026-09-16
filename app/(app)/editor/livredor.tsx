/**
 * STUDIO — Livre d'or audio (planche 2, écran 12).
 * Enregistrement vocal (bouton micro + onde sonore animée) et liste
 * des messages reçus avec lecteurs — le flux est fonctionnel en
 * local ; les fichiers audio seront envoyés au backend.
 */

import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { EditorHeader } from '@/features/editor/components/EditorHeader';
import { useEditor } from '@/features/editor/EditorContext';
import { goBackInEditor } from '@/features/editor/navigation';

interface VoiceMessage {
  id: string;
  name: string;
  duration: string;
  bars: number[];
}

const DEMO_MESSAGES: VoiceMessage[] = [
  { id: 'm1', name: 'Sarah', duration: '0:12', bars: [8, 14, 20, 12, 24, 16, 10, 18, 22, 9, 15, 11] },
  { id: 'm2', name: 'Marc & Julie', duration: '0:08', bars: [10, 16, 9, 21, 14, 23, 12, 8, 17, 19, 10, 13] },
  { id: 'm3', name: 'Emma', duration: '0:15', bars: [12, 9, 18, 22, 11, 16, 24, 14, 8, 20, 13, 17] },
];

/** Onde pseudo-aléatoire déterministe pour les nouveaux messages. */
const makeBars = (seed: number): number[] =>
  Array.from({ length: 12 }, (_, index) => 8 + ((seed * (index + 3) * 7) % 17));

export default function LivredorScreen() {
  const router = useRouter();
  const { theme } = useEditor();
  const colors = theme.colors;
  const [enabled, setEnabled] = useState(true);
  const [maxDuration, setMaxDuration] = useState<30 | 60>(30);
  const [messages, setMessages] = useState<VoiceMessage[]>(DEMO_MESSAGES);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
  }, []);

  const toggleRecording = () => {
    if (recording) {
      if (timer.current) clearInterval(timer.current);
      setRecording(false);
      const captured = Math.max(3, seconds);
      setMessages((prev) => [
        {
          id: `me-${Date.now()}`,
          name: 'Vous (démo)',
          duration: `0:${String(captured).padStart(2, '0')}`,
          bars: makeBars(captured),
        },
        ...prev,
      ]);
      setSeconds(0);
      return;
    }
    setSeconds(0);
    setRecording(true);
    timer.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev + 1 >= maxDuration) {
          if (timer.current) clearInterval(timer.current);
          setRecording(false);
          return maxDuration;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const play = (id: string) => {
    setPlayingId(id);
    setTimeout(() => setPlayingId((prev) => (prev === id ? null : prev)), 2400);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <EditorHeader title="Livre d'or" onBack={() => goBackInEditor(router)} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.row}>
            <View style={styles.rowBody}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>Activer le livre d'or audio</Text>
              <Text style={[styles.rowHint, { color: colors.textMuted }]}>Les invités laissent un message vocal depuis l'invitation</Text>
            </View>
            <Switch
              value={enabled}
              onValueChange={setEnabled}
              trackColor={{ true: colors.primary, false: colors.border }}
              thumbColor={colors.onPrimary}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>Durée maximale d'un message</Text>
            <View style={styles.durations}>
              {([30, 60] as const).map((value) => (
                <Pressable
                  key={value}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: maxDuration === value }}
                  onPress={() => setMaxDuration(value)}
                  style={[
                    styles.durationPill,
                    maxDuration === value && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                >
                  <Text style={[styles.durationLabel, maxDuration === value && { color: colors.onPrimary }]}>
                    {value} s
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Enregistrement — micro + onde sonore */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Enregistrer un message test</Text>
        <View style={[styles.recordCard, { borderColor: colors.border }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ busy: recording }}
            onPress={toggleRecording}
            disabled={!enabled}
            style={({ pressed }) => [
              styles.mic,
              { backgroundColor: recording ? '#A45A45' : colors.primary },
              (!enabled || pressed) && styles.micDisabled,
            ]}
          >
            <Ionicons name={recording ? 'stop' : 'mic'} size={26} color={colors.onPrimary} />
          </Pressable>
          <View style={styles.wave}>
            {makeBars(recording ? seconds + 1 : 3).map((bar, index) => (
              <View
                key={index}
                style={[
                  styles.waveBar,
                  {
                    height: recording ? bar + ((index * 5 + seconds * 3) % 14) : bar,
                    backgroundColor: recording ? colors.accent : '#D8DCE1',
                  },
                ]}
              />
            ))}
          </View>
          <Text style={[styles.recordHint, { color: colors.textMuted }]}>
            {!enabled
              ? 'Livre d\u2019or désactivé'
              : recording
                ? `Enregistrement… ${seconds}s / ${maxDuration}s — appuyez pour arrêter`
                : 'Appuyez sur le micro pour commencer'}
          </Text>
        </View>

        {/* Messages reçus avec lecteurs */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Messages reçus ({messages.length})</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {messages.map((message, index) => (
            <View key={message.id}>
              {index > 0 ? <View style={styles.divider} /> : null}
              <View style={styles.row}>
                <View style={[styles.avatar, { backgroundColor: colors.chip }]}>
                  <Text style={[styles.avatarText, { color: colors.primary }]}>{message.name.charAt(0)}</Text>
                </View>
                <View style={styles.rowBody}>
                  <Text style={styles.rowLabel}>{message.name}</Text>
                  <View style={styles.wave}>
                    {message.bars.map((bar, barIndex) => (
                      <View
                        key={barIndex}
                        style={[
                          styles.waveBar,
                          { height: bar, backgroundColor: playingId === message.id ? colors.accent : '#D8DCE1' },
                        ]}
                      />
                    ))}
                  </View>
                </View>
                <Text style={styles.duration}>{message.duration}</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Écouter le message de ${message.name}`}
                  onPress={() => play(message.id)}
                  hitSlop={8}
                  style={styles.playBtn}
                >
                  <Ionicons name={playingId === message.id ? 'pause' : 'play'} size={16} color={colors.primary} />
                </Pressable>
              </View>
            </View>
          ))}
        </View>
        <Text style={styles.footnote}>
          Lecture simulée en local — les fichiers audio seront hébergés et diffusés par le backend.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  sectionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#121318', marginBottom: 10 },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6DCCB',
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
  rowBody: { flex: 1, gap: 3 },
  rowLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13.5, color: '#121318' },
  rowHint: { fontFamily: 'Inter_400Regular', fontSize: 11.5, color: '#9A9EA7' },
  divider: { height: 1, backgroundColor: '#EDE6D8' },
  durations: { flexDirection: 'row', gap: 6 },
  durationPill: {
    borderRadius: 999,
    borderWidth: 1.2,
    borderColor: '#E2E5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  durationLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 11.5, color: '#8A8278' },
  recordCard: {
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  mic: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micDisabled: { opacity: 0.4 },
  wave: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  waveBar: { width: 3, borderRadius: 2 },
  recordHint: { fontFamily: 'Inter_400Regular', fontSize: 11.5, color: '#9A9EA7', textAlign: 'center' },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  duration: { fontFamily: 'Inter_500Medium', fontSize: 11.5, color: '#9A9EA7' },
  playBtn: { padding: 6 },
  footnote: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10.5,
    lineHeight: 15,
    color: '#9A9EA7',
    textAlign: 'center',
    marginTop: 14,
  },
});
