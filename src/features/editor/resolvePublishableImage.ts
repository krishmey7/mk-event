/**
 * Rend une URI d’image publiable pour l’invité.
 * blob:/file: locaux → JPEG compressé en data URL (persiste dans studio_config).
 * https / data: déjà OK → inchangé.
 */

import { Platform } from 'react-native';

const MAX_EDGE = 1280;
const JPEG_QUALITY = 0.78;

export function isRemoteOrDataImage(uri: string): boolean {
  const value = uri.trim();
  return /^https?:\/\//i.test(value) || value.startsWith('data:');
}

export async function resolvePublishableImage(uri: string | null | undefined): Promise<string> {
  const value = (uri ?? '').trim();
  if (!value) return '';
  if (isRemoteOrDataImage(value)) return value;

  try {
    if (Platform.OS === 'web') {
      const response = await fetch(value);
      if (!response.ok) throw new Error(`fetch ${response.status}`);
      const blob = await response.blob();
      const dataUrl = await compressBlobToJpegDataUrl(blob);
      return dataUrl.startsWith('data:') ? dataUrl : '';
    }

    // Natif : fetch file:// / content:// → data URL (sans canvas).
    const response = await fetch(value);
    const blob = await response.blob();
    const dataUrl = await blobToDataUrl(blob);
    return dataUrl.startsWith('data:') ? dataUrl : '';
  } catch {
    // Ne jamais republier blob:/file: — l’invité ne peut pas les résoudre.
    return '';
  }
}

export async function resolvePublishableImages(uris: string[]): Promise<string[]> {
  return Promise.all(uris.map((uri) => resolvePublishableImage(uri)));
}

async function compressBlobToJpegDataUrl(blob: Blob): Promise<string> {
  if (typeof document === 'undefined') {
    return blobToDataUrl(blob);
  }

  const bitmap = await createImageBitmap(blob);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    return blobToDataUrl(blob);
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('FileReader failed'));
    reader.readAsDataURL(blob);
  });
}
