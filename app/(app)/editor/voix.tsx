/**
 * STUDIO — Accueil vocal + ambiance douce.
 */

import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';

import { EditorHeader } from '@/features/editor/components/EditorHeader';
import { useEditor, VOICE_MUSICS, VOICE_PERSONAS } from '@/features/editor/EditorContext';
import { goBackInEditor } from '@/features/editor/navigation';
import { pickLibraryAudio } from '@/features/editor/audioPicker';
import {
  AMBIENT_VOLUME,
  buildWelcomeSpeech,
  musicTrackByKey,
  resolveAmbientUri,
} from '@/features/invitation/audioCatalog';
import { previewRemoteAudio, previewWelcomeSpeech } from '@/features/invitation/useInvitationAudio';
import { STUDIO_PREVIEW_GUEST } from '@/features/invitation/guestRegistry';

export default function VoixScreen() {
  const router = useRouter();
  const { voix, updateVoix, theme, cover, guests } = useEditor();
  const colors = theme.colors;
  const [playingMusic, setPlayingMusic] = useState(false);
  const [previewingVoice, setPreviewingVoice] = useState(false);
  const stopMusicRef = useRef<null | (() => Promise<void>)>(null);

  const sampleGuest = guests[0] ?? STUDIO_PREVIEW_GUEST;
  const welcomeScript = buildWelcomeSpeech({
    persona: voix.voicePersona,
    guestFirstName: sampleGuest.firstName,
    hosts: cover.couple,
  });
  const hasUpload = Boolean(voix.ambientUri?.trim());

  useEffect(() => () => {
    Speech.stop();
    void stopMusicRef.current?.();
  }, []);

  const stopMusicPreview = async () => {
    if (stopMusicRef.current) {
      await stopMusicRef.current();
      stopMusicRef.current = null;
    }
    setPlayingMusic(false);
  };

  const previewAmbient = async (uri: string) => {
    if (playingMusic) {
      await stopMusicPreview();
      return;
    }
    await stopMusicPreview();
    try {
      const stop = await previewRemoteAudio(uri, AMBIENT_VOLUME);
      stopMusicRef.current = stop;
      setPlayingMusic(true);
      setTimeout(() => {
        void (async () => {
          if (stopMusicRef.current === stop) await stopMusicPreview();
        })();
      }, 10000);
    } catch {
      setPlayingMusic(false);
    }
  };

  const selectPreset = (key: string) => {
    updateVoix({ musicKey: key, ambientUri: null, ambientName: null });
    void previewAmbient(musicTrackByKey(key).uri);
  };

  const uploadAmbient = async () => {
    const picked = await pickLibraryAudio();
    if (!picked) return;
    updateVoix({ ambientUri: picked.uri, ambientName: picked.name });
    void previewAmbient(picked.uri);
  };

  const clearUpload = () => {
    void stopMusicPreview();
    updateVoix({ ambientUri: null, ambientName: null });
  };

  const previewVoice = async () => {
    if (previewingVoice) {
      Speech.stop();
      setPreviewingVoice(false);
      return;
    }
    await stopMusicPreview();
    setPreviewingVoice(true);
    try {
      await previewWelcomeSpeech(welcomeScript);
    } finally {
      setPreviewingVoice(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <EditorHeader title="Voix & musique" onBack={() => goBackInEditor(router)} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Accueil</Text>
        <View style={[styles.optionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.optionRow}>
            <Text style={[styles.optionLabel, { color: colors.text }]}>Message vocal</Text>
            <Switch
              value={voix.voiceGreeting}
              onValueChange={(value) => updateVoix({ voiceGreeting: value })}
              trackColor={{ true: colors.primary, false: colors.border }}
              thumbColor={colors.onPrimary}
            />
          </View>
        </View>

        {voix.voiceGreeting ? (
          <>
            <View style={styles.personaRow}>
              {VOICE_PERSONAS.map((persona) => {
                const selected = voix.voicePersona === persona.key;
                return (
                  <Pressable
                    key={persona.key}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    onPress={() => updateVoix({ voicePersona: persona.key })}
                    style={({ pressed }) => [
                      styles.personaChip,
                      {
                        backgroundColor: selected ? colors.chip : colors.surface,
                        borderColor: selected ? colors.primary : colors.border,
                      },
                      pressed && styles.pressed,
                    ]}
                  >
                    <Ionicons
                      name={persona.icon}
                      size={14}
                      color={selected ? colors.primary : colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.personaLabel,
                        { color: selected ? colors.primary : colors.text },
                      ]}
                    >
                      {persona.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => { void previewVoice(); }}
              style={({ pressed }) => [
                styles.previewVoiceBtn,
                { backgroundColor: colors.chip, borderColor: colors.border },
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name={previewingVoice ? 'stop-outline' : 'play-outline'}
                size={16}
                color={colors.primary}
              />
              <Text style={[styles.previewVoiceLabel, { color: colors.primary }]}>
                {previewingVoice ? 'Arrêter' : `Écouter (${sampleGuest.firstName})`}
              </Text>
            </Pressable>
          </>
        ) : null}

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Ambiance</Text>

        <Pressable
          accessibilityRole="button"
          onPress={() => { void uploadAmbient(); }}
          style={({ pressed }) => [
            styles.uploadCard,
            {
              backgroundColor: colors.surface,
              borderColor: hasUpload ? colors.primary : colors.border,
            },
            pressed && styles.pressed,
          ]}
        >
          <View style={[styles.musicIcon, { backgroundColor: colors.chip }]}>
            <Ionicons name="cloud-upload-outline" size={18} color={colors.primary} />
          </View>
          <View style={styles.musicBody}>
            <Text style={[styles.musicLabel, { color: colors.text }]}>
              {hasUpload ? (voix.ambientName || 'Fichier importé') : 'Importer un son'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </Pressable>

        {hasUpload ? (
          <View style={styles.uploadActions}>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                void previewAmbient(resolveAmbientUri(voix.musicKey, voix.ambientUri));
              }}
              style={({ pressed }) => [
                styles.smallBtn,
                { backgroundColor: colors.chip, borderColor: colors.border },
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name={playingMusic ? 'pause' : 'play'} size={14} color={colors.primary} />
              <Text style={[styles.smallBtnLabel, { color: colors.primary }]}>
                {playingMusic ? 'Pause' : 'Écouter'}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={clearUpload}
              style={({ pressed }) => [
                styles.smallBtn,
                { backgroundColor: colors.surface, borderColor: colors.border },
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="trash-outline" size={14} color="#A45A45" />
              <Text style={[styles.smallBtnLabel, { color: '#A45A45' }]}>Retirer</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.musicList}>
            {VOICE_MUSICS.map((music) => {
              const selected = voix.musicKey === music.key && !hasUpload;
              return (
                <Pressable
                  key={music.key}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => selectPreset(music.key)}
                  style={({ pressed }) => [
                    styles.musicRow,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    pressed && styles.pressed,
                    selected && { borderColor: colors.primary, backgroundColor: colors.chip },
                  ]}
                >
                  <View style={[styles.musicIcon, { backgroundColor: colors.chip }]}>
                    <Ionicons name={music.icon} size={17} color={colors.primary} />
                  </View>
                  <Text style={[styles.musicLabel, { flex: 1, color: selected ? colors.primary : colors.text }]}>
                    {music.label}
                  </Text>
                  {selected ? <Ionicons name="checkmark-circle" size={20} color={colors.primary} /> : null}
                </Pressable>
              );
            })}
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Options</Text>
        <View style={[styles.optionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.optionRow}>
            <Text style={[styles.optionLabel, { color: colors.text }]}>Lecture automatique</Text>
            <Switch
              value={voix.autoplay}
              onValueChange={(value) => updateVoix({ autoplay: value })}
              trackColor={{ true: colors.primary, false: colors.border }}
              thumbColor={colors.onPrimary}
            />
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.optionRow}>
            <Text style={[styles.optionLabel, { color: colors.text }]}>Boucle</Text>
            <Switch
              value={voix.loop}
              onValueChange={(value) => updateVoix({ loop: value })}
              trackColor={{ true: colors.primary, false: colors.border }}
              thumbColor={colors.onPrimary}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 20, paddingBottom: 40, gap: 0 },
  pressed: { opacity: 0.85 },
  sectionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, marginBottom: 10, marginTop: 14 },
  musicList: { gap: 8 },
  musicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.4,
    borderRadius: 14,
    padding: 12,
  },
  uploadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.4,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  uploadActions: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  smallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  smallBtnLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 12.5 },
  musicIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  musicBody: { flex: 1 },
  musicLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  optionCard: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 13,
  },
  optionLabel: { flex: 1, fontFamily: 'Inter_600SemiBold', fontSize: 13.5 },
  divider: { height: 1 },
  personaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  personaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: 1.2,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  personaLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 12.5 },
  previewVoiceBtn: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  previewVoiceLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
});
