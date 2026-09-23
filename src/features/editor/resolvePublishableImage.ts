/**
 * Rend une URI d’image publiable pour l’invité.
 * Avec eventId (API réelle) : upload vers MEDIA_ROOT → URL https.
 * Sinon (simulation) : blob/file → data URL JPEG compressée.
 */

import { Platform } from 'react-native';

import { SIMULATE_BACKEND } from '@/constants/config';
import { apiClient } from '@/services/apiClient';

const MAX_EDGE = 960;
const JPEG_QUALITY = 0.62;
/** Au-delà (~150 Ko en base64), on recompresse pour éviter 413 / timeouts. */
const MAX_DATA_URL_CHARS = 180_000;

export function isRemoteOrDataImage(uri: string): boolean {
  const value = uri.trim();
  return /^https?:\/\//i.test(value) || value.startsWith('data:');
}

export type ResolvePublishableOptions = {
  /** Si défini et backend réel : upload multipart au lieu de data URL. */
  eventId?: number | null;
};

export async function resolvePublishableImage(
  uri: string | null | undefined,
  options: ResolvePublishableOptions = {},
): Promise<string> {
  const value = (uri ?? '').trim();
  if (!value) return '';

  if (/^https?:\/\//i.test(value)) return value;

  const eventId = options.eventId;
  const shouldUpload =
    Boolean(eventId)
    && Number.isFinite(eventId)
    && !SIMULATE_BACKEND;

  if (shouldUpload) {
    try {
      const blob = await uriToJpegBlob(value);
      if (!blob) return '';
      const form = new FormData();
      form.append('file', blob, `image-${Date.now()}.jpg`);
      const result = await apiClient.postForm<{ url: string }>(
        `/events/${eventId}/media/`,
        form,
      );
      return result.url?.trim() || '';
    } catch {
      return '';
    }
  }

  if (value.startsWith('data:')) {
    if (value.length <= MAX_DATA_URL_CHARS || Platform.OS !== 'web') {
      return value;
    }
    try {
      const response = await fetch(value);
      const blob = await response.blob();
      const compressed = await compressBlobToJpegDataUrl(blob);
      return compressed.startsWith('data:') ? compressed : value;
    } catch {
      return value;
    }
  }

  try {
    if (Platform.OS === 'web') {
      const response = await fetch(value);
      if (!response.ok) throw new Error(`fetch ${response.status}`);
      const blob = await response.blob();
      const dataUrl = await compressBlobToJpegDataUrl(blob);
      return dataUrl.startsWith('data:') ? dataUrl : '';
    }

    const response = await fetch(value);
    const blob = await response.blob();
    const dataUrl = await blobToDataUrl(blob);
    return dataUrl.startsWith('data:') ? dataUrl : '';
  } catch {
    return '';
  }
}

export async function resolvePublishableImages(
  uris: string[],
  options: ResolvePublishableOptions = {},
): Promise<string[]> {
  return Promise.all(uris.map((uri) => resolvePublishableImage(uri, options)));
}

async function uriToJpegBlob(uri: string): Promise<Blob | null> {
  try {
    if (uri.startsWith('data:')) {
      const response = await fetch(uri);
      const blob = await response.blob();
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        const dataUrl = await compressBlobToJpegDataUrl(blob);
        const compressed = await fetch(dataUrl);
        return compressed.blob();
      }
      return blob;
    }
    const response = await fetch(uri);
    if (!response.ok) return null;
    const blob = await response.blob();
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const dataUrl = await compressBlobToJpegDataUrl(blob);
      const compressed = await fetch(dataUrl);
      return compressed.blob();
    }
    return blob;
  } catch {
    return null;
  }
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
