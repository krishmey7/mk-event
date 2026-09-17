/**
 * Panneau Voix & musique — persona et ambiance figées par type d’événement.
 */

import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';

import { EditorHint } from '@/features/editor/components/EditorHint';
import { useEditor, VOICE_MUSICS, VOICE_PERSONAS } from '@/features/editor/EditorContext';
import { pickLibraryAudio } from '@/features/editor/audioPicker';
import {
  AMBIENT_VOLUME,
  buildWelcomeSpeech,
  resolveAmbientUri,
} from '@/features/invitation/audioCatalog';
import { previewRemoteAudio, previewWelcomeSpeech } from '@/features/invitation/useInvitationAudio';
import { STUDIO_PREVIEW_GUEST } from '@/features/invitation/guestRegistry';
import { useAppTheme } from '@/context/ThemePreferenceContext';
import { fontFamilies } from '@/constants/theme';

export function VoixEditorPanel({ showHint = false }: { showHint?: boolean }) {
  const { voix, updateVoix, cover, guests } = useEditor();
  const { theme } = useAppTheme();
  const colors = {
    bg: theme.colors.background,
    surface: theme.colors.surface,
    border: theme.colors.border,
    text: theme.colors.textPrimary,
    textMuted: theme.colors.textMuted,
    primary: theme.colors.accent,
    onPrimary: theme.colors.onAccent,
    chip: theme.colors.surfaceElevated,
  };
  const [playingMusic, setPlayingMusic] = useState(false);
  const [previewingVoice, setPreviewingVoice] = useState(false);
  const stopMusicRef = useRef<null | (() => Promise<void>)>(null);

  const sampleGuest = guests[0] ?? STUDIO_PREVIEW_GUEST;
  const welcomeScript = buildWelcomeSpeech({
    persona: voix.voicePersona,
    guestFirstName: sampleGuest.firstName,
    hosts: cover.couple,
  });
  const music = VOICE_MUSICS.find((item) => item.key === voix.musicKey) ?? VOICE_MUSICS[0];
  const persona = VOICE_PERSONAS.find((item) => item.key === voix.voicePersona) ?? VOICE_PERSONAS[0];
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

  const uploadAmbient = async () => {
    const picked = await pickLibraryAudio();
    if (!picked) return;
    updateVoix({ ambientUri: picked.uri, ambientName: picked.name });
  };

  const clearUpload = () => {
    updateVoix({ ambientUri: null, ambientName: null });
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {showHint ? (
        <EditorHint>
          Accueil vocal et musique sont adaptés automatiquement au type d’événement.
        </EditorHint>
      ) : null}

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
        <Text style={[styles.autoHint, { color: colors.textMuted }]}>
          Voix {persona.label} — choisie selon votre studio.
        </Text>
      </View>

      {voix.voiceGreeting ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            void (async () => {
              if (previewingVoice) {
                Speech.stop();
                setPreviewingVoice(false);
                return;
              }
              setPreviewingVoice(true);
              try {
                await previewWelcomeSpeech(welcomeScript);
              } finally {
                setPreviewingVoice(false);
              }
            })();
          }}
          style={[styles.previewBtn, { borderColor: colors.border, backgroundColor: colors.chip }]}
        >
          <Ionicons
            name={previewingVoice ? 'stop-outline' : 'play-outline'}
            size={16}
            color={colors.primary}
          />
          <Text style={[styles.previewLabel, { color: colors.primary }]}>
            {previewingVoice ? 'Arrêter' : `Écouter (${sampleGuest.firstName})`}
          </Text>
        </Pressable>
      ) : null}

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Ambiance</Text>
      <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.musicIcon, { backgroundColor: colors.chip }]}>
          <Ionicons name={music.icon} size={17} color={colors.primary} />
        </View>
        <View style={styles.musicBody}>
          <Text style={[styles.musicLabel, { color: colors.text }]}>{music.label}</Text>
          <Text style={[styles.autoHint, { color: colors.textMuted }]}>
            Ambiance par défaut de ce studio.
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            void previewAmbient(resolveAmbientUri(voix.musicKey, voix.ambientUri));
          }}
          hitSlop={8}
        >
          <Ionicons name={playingMusic ? 'pause' : 'play'} size={18} color={colors.primary} />
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => {
          void uploadAmbient();
        }}
        style={[
          styles.uploadCard,
          {
            backgroundColor: colors.surface,
            borderColor: hasUpload ? colors.primary : colors.border,
          },
        ]}
      >
        <View style={[styles.musicIcon, { backgroundColor: colors.chip }]}>
          <Ionicons name="cloud-upload-outline" size={18} color={colors.primary} />
        </View>
        <View style={styles.musicBody}>
          <Text style={[styles.musicLabel, { color: colors.text }]}>
            {hasUpload ? (voix.ambientName || 'Fichier importé') : 'Remplacer par un son perso'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      </Pressable>

      {hasUpload ? (
        <Pressable
          accessibilityRole="button"
          onPress={clearUpload}
          style={[styles.smallBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Ionicons name="trash-outline" size={14} color="#A45A45" />
          <Text style={[styles.smallBtnLabel, { color: '#A45A45' }]}>Revenir à l’ambiance studio</Text>
        </Pressable>
      ) : null}

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
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  sectionTitle: { fontFamily: fontFamilies.sansSemiBold, fontSize: 14, marginBottom: 10, marginTop: 14 },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.4,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
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
  smallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  smallBtnLabel: { fontFamily: fontFamilies.sansSemiBold, fontSize: 12.5 },
  musicIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  musicBody: { flex: 1 },
  musicLabel: { fontFamily: fontFamilies.sansSemiBold, fontSize: 14 },
  autoHint: { fontFamily: fontFamilies.sans, fontSize: 12.5, lineHeight: 18, marginTop: 2 },
  optionCard: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 13,
  },
  optionLabel: { flex: 1, fontFamily: fontFamilies.sansSemiBold, fontSize: 13.5 },
  divider: { height: 1 },
  previewBtn: {
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
  previewLabel: { fontFamily: fontFamilies.sansSemiBold, fontSize: 13 },
});
