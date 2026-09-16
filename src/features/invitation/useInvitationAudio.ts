/**
 * Expérience audio invité :
 * 1) Accueil vocal (TTS FR) — script temps réel selon le type d’événement
 * 2) Ambiance douce en boucle pour toute la visite
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import * as Speech from 'expo-speech';

import {
  AMBIENT_VOLUME,
  buildWelcomeSpeech,
  resolveAmbientUri,
  type WelcomeSpeechContext,
} from './audioCatalog';

export interface InvitationVoixSettings {
  musicKey: string;
  ambientUri?: string | null;
  autoplay: boolean;
  loop: boolean;
  voiceGreeting: boolean;
}

async function configureAudioMode(): Promise<void> {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
    interruptionModeIOS: InterruptionModeIOS.DuckOthers,
    interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
  });
}

async function unloadSound(sound: Audio.Sound | null): Promise<void> {
  if (!sound) return;
  try {
    await sound.stopAsync();
  } catch {
    /* ignore */
  }
  try {
    await sound.unloadAsync();
  } catch {
    /* ignore */
  }
}

async function pickFrenchVoiceId(): Promise<string | undefined> {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const fr = voices.filter((voice) => /^fr/i.test(voice.language));
    if (fr.length === 0) return undefined;
    const preferred =
      fr.find((voice) => /neural|premium|enhanced|natural|google|thomas|amélie|amelie|marie|claire/i.test(voice.name))
      ?? fr.find((voice) => /fr-FR/i.test(voice.language))
      ?? fr[0];
    return preferred?.identifier;
  } catch {
    return undefined;
  }
}

async function speakWelcome(script: string): Promise<void> {
  Speech.stop();
  const voice = await pickFrenchVoiceId();
  await new Promise<void>((resolve) => {
    try {
      Speech.speak(script, {
        language: 'fr-FR',
        voice,
        pitch: 1.0,
        rate: Platform.OS === 'ios' ? 0.9 : 0.86,
        onDone: () => resolve(),
        onStopped: () => resolve(),
        onError: () => resolve(),
      });
    } catch {
      resolve();
    }
    setTimeout(() => resolve(), Math.min(28000, 1800 + script.length * 55));
  });
}

function speechFingerprint(speech: WelcomeSpeechContext): string {
  return [speech.persona, speech.guestFirstName, speech.hosts].join('::');
}

export function useInvitationAudio(options: {
  enabled: boolean;
  voix: InvitationVoixSettings;
  speech: WelcomeSpeechContext;
}) {
  const { enabled, voix, speech } = options;
  const musicRef = useRef<Audio.Sound | null>(null);
  const runIdRef = useRef(0);
  const [needsGesture, setNeedsGesture] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);
  const speechKey = speechFingerprint(speech);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  const stopAll = useCallback(async () => {
    runIdRef.current += 1;
    Speech.stop();
    await unloadSound(musicRef.current);
    musicRef.current = null;
    setPlaying(false);
  }, []);

  const startAmbient = useCallback(async (runId: number) => {
    if (runId !== runIdRef.current || mutedRef.current) return;
    if (!voix.autoplay) return;

    const uri = resolveAmbientUri(voix.musicKey, voix.ambientUri);
    await unloadSound(musicRef.current);
    musicRef.current = null;

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        {
          shouldPlay: true,
          isLooping: voix.loop,
          volume: AMBIENT_VOLUME,
        },
      );
      if (runId !== runIdRef.current || mutedRef.current) {
        await unloadSound(sound);
        return;
      }
      musicRef.current = sound;
      setPlaying(true);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        if (status.didJustFinish && !voix.loop) setPlaying(false);
      });
    } catch {
      setNeedsGesture(true);
    }
  }, [voix.ambientUri, voix.autoplay, voix.loop, voix.musicKey]);

  const runSequence = useCallback(async () => {
    if (!enabled || mutedRef.current) return;
    if (!voix.voiceGreeting && !voix.autoplay) return;

    const runId = ++runIdRef.current;
    setNeedsGesture(false);

    try {
      await configureAudioMode();
    } catch {
      /* ignore */
    }

    if (voix.voiceGreeting) {
      await speakWelcome(buildWelcomeSpeech(speech));
      if (runId !== runIdRef.current || mutedRef.current) return;
      await startAmbient(runId);
      return;
    }

    await startAmbient(runId);
  }, [enabled, speech, startAmbient, voix.autoplay, voix.voiceGreeting]);

  const runSequenceRef = useRef(runSequence);
  runSequenceRef.current = runSequence;

  useEffect(() => {
    if (!enabled) {
      void stopAll();
      return;
    }

    let cancelled = false;
    const boot = async () => {
      await new Promise((r) => setTimeout(r, 350));
      if (cancelled) return;
      try {
        await runSequenceRef.current();
      } catch {
        if (!cancelled) setNeedsGesture(true);
      }
    };
    void boot();

    return () => {
      cancelled = true;
      void stopAll();
    };
  }, [
    enabled,
    stopAll,
    voix.musicKey,
    voix.ambientUri,
    voix.loop,
    voix.autoplay,
    voix.voiceGreeting,
    speechKey,
  ]);

  const enableFromGesture = useCallback(async () => {
    mutedRef.current = false;
    setMuted(false);
    setNeedsGesture(false);
    await stopAll();
    await runSequence();
  }, [runSequence, stopAll]);

  const toggleMute = useCallback(async () => {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMuted(next);
    if (next) {
      Speech.stop();
      if (musicRef.current) {
        try {
          await musicRef.current.setVolumeAsync(0);
          await musicRef.current.pauseAsync();
        } catch {
          /* ignore */
        }
      }
      setPlaying(false);
      return;
    }
    setNeedsGesture(false);
    await stopAll();
    await runSequence();
  }, [runSequence, stopAll]);

  return {
    needsGesture,
    playing,
    muted,
    enableFromGesture,
    toggleMute,
    stopAll,
  };
}

export async function previewRemoteAudio(uri: string, volume = AMBIENT_VOLUME): Promise<() => Promise<void>> {
  await configureAudioMode();
  const { sound } = await Audio.Sound.createAsync(
    { uri },
    { shouldPlay: true, volume: Math.min(volume, AMBIENT_VOLUME + 0.08), isLooping: false },
  );
  return async () => {
    await unloadSound(sound);
  };
}

export async function previewWelcomeSpeech(script: string): Promise<void> {
  await speakWelcome(script);
}
