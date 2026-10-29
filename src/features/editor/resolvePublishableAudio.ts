/**
 * Rend une URI audio publiable pour l’invité.
 * Avec eventId (API réelle) : upload vers le stockage média → URL https.
 * Les blob:/file: locaux ne doivent jamais partir dans le snapshot public.
 */

import { SIMULATE_BACKEND } from '@/constants/config';
import { apiClient } from '@/services/apiClient';

export type ResolvePublishableAudioOptions = {
  eventId?: number | null;
  fileName?: string | null;
};

/** URI déjà accessible depuis le web public. */
export function isPublicAudioUri(uri: string): boolean {
  const value = uri.trim();
  return /^https?:\/\//i.test(value) || value.startsWith('data:audio');
}

export async function resolvePublishableAudio(
  uri: string | null | undefined,
  options: ResolvePublishableAudioOptions = {},
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
      const blob = await uriToAudioBlob(value);
      if (!blob) return '';
      const form = new FormData();
      const name = sanitizeAudioFileName(options.fileName, blob.type, value);
      form.append('file', blob, name);
      const result = await apiClient.postForm<{ url: string }>(
        `/events/${eventId}/media/`,
        form,
      );
      return result.url?.trim() || '';
    } catch {
      return '';
    }
  }

  if (value.startsWith('data:audio')) return value;

  /* Simulation locale : data URL seulement si le fichier reste raisonnable. */
  try {
    const response = await fetch(value);
    if (!response.ok) return '';
    const blob = await response.blob();
    if (blob.size > 500_000) return '';
    return await blobToDataUrl(blob);
  } catch {
    return '';
  }
}

async function uriToAudioBlob(uri: string): Promise<Blob | null> {
  try {
    const response = await fetch(uri);
    if (!response.ok) return null;
    const blob = await response.blob();
    if (!blob || blob.size === 0) return null;
    return blob;
  } catch {
    return null;
  }
}

function sanitizeAudioFileName(
  fileName: string | null | undefined,
  mime: string,
  fallbackUri: string,
): string {
  const raw = (fileName ?? '').trim() || fallbackUri.split('/').pop() || 'ambiance.mp3';
  const base = raw.replace(/[^\w.\-()+ ]+/g, '_').slice(0, 80);
  if (/\.(mp3|m4a|wav|aac|ogg|webm)$/i.test(base)) return base;
  const ext =
    mime.includes('mp4') || mime.includes('m4a') ? '.m4a'
      : mime.includes('wav') ? '.wav'
        : mime.includes('ogg') ? '.ogg'
          : mime.includes('webm') ? '.webm'
            : mime.includes('aac') ? '.aac'
              : '.mp3';
  return `${base.replace(/\.[^.]+$/, '') || 'ambiance'}${ext}`;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('FileReader failed'));
    reader.readAsDataURL(blob);
  });
}
