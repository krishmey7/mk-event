/**
 * MK EVENTS — Sélection d’un fichier audio (ambiance uploadée).
 */

import * as DocumentPicker from 'expo-document-picker';

export async function pickLibraryAudio(): Promise<{ uri: string; name: string } | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['audio/*', 'audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/wav'],
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled) return null;
  const asset = result.assets?.[0];
  if (!asset?.uri) return null;
  return {
    uri: asset.uri,
    name: asset.name || 'ambiance.mp3',
  };
}
