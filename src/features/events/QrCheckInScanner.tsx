/**
 * Scanner QR d’entrée — caméra native (expo-camera) + repli saisie manuelle.
 */

import { useCallback, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { brandColors, lightTheme } from '@/constants/theme';

/** Extrait un code invité depuis le contenu brut d’un QR. */
export function parseGuestQrPayload(raw: string): string {
  const text = raw.trim();
  if (!text) return '';

  try {
    const url = new URL(text);
    const guestId = url.searchParams.get('guestId') ?? url.searchParams.get('guest');
    if (guestId?.trim()) return guestId.trim();
  } catch {
    /* pas une URL — on continue */
  }

  const match = text.match(/INV-[\w-]+/i);
  if (match) return match[0].toUpperCase();

  if (text.includes(':')) {
    const tail = text.split(':').pop()?.trim();
    if (tail) return tail;
  }

  return text;
}

export function QrCheckInScanner({
  visible,
  onClose,
  onScan,
}: {
  visible: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [locked, setLocked] = useState(false);

  const handleScan = useCallback(
    (payload: { data: string }) => {
      if (locked) return;
      const code = parseGuestQrPayload(payload.data);
      if (!code) return;
      setLocked(true);
      onScan(code);
      onClose();
      setTimeout(() => setLocked(false), 1200);
    },
    [locked, onClose, onScan],
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Scanner le QR</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Fermer" onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={24} color="#F6F1E8" />
          </Pressable>
        </View>

        {!permission ? (
          <View style={styles.center}>
            <Text style={styles.hint}>Vérification de la caméra…</Text>
          </View>
        ) : !permission.granted ? (
          <View style={styles.center}>
            <Ionicons name="camera-outline" size={36} color={brandColors.coral} />
            <Text style={styles.hint}>
              Autorisez l’accès à la caméra pour scanner les QR des invités.
            </Text>
            <Pressable style={styles.cta} onPress={() => void requestPermission()}>
              <Text style={styles.ctaLabel}>Autoriser la caméra</Text>
            </Pressable>
            {Platform.OS === 'web' ? (
              <Text style={styles.webNote}>
                Sur le navigateur, utilisez un téléphone ou la saisie manuelle si la caméra est limitée.
              </Text>
            ) : null}
          </View>
        ) : (
          <View style={styles.cameraWrap}>
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={locked ? undefined : handleScan}
            />
            <View style={styles.frame} pointerEvents="none" />
            <Text style={styles.scanHint}>Cadrez le QR du pass invité</Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0E0C0A' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    color: '#F6F1E8',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 14,
  },
  hint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(246, 241, 232, 0.72)',
    textAlign: 'center',
  },
  cta: {
    marginTop: 8,
    backgroundColor: brandColors.coral,
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  ctaLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: brandColors.ink,
  },
  webNote: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(246, 241, 232, 0.45)',
    textAlign: 'center',
    marginTop: 8,
  },
  cameraWrap: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  frame: {
    position: 'absolute',
    top: '22%',
    left: '14%',
    right: '14%',
    bottom: '28%',
    borderWidth: 2,
    borderColor: brandColors.coral,
    borderRadius: 18,
  },
  scanHint: {
    position: 'absolute',
    bottom: 22,
    alignSelf: 'center',
    fontFamily: lightTheme.fontFamilies.sansMedium,
    fontSize: 13,
    color: '#F6F1E8',
    backgroundColor: 'rgba(14, 12, 10, 0.55)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
});
