import { useSyncExternalStore } from 'react';
import type { Router } from 'expo-router';

import type { Event } from '@/types';
import { getTemplate, getTemplateById } from '@/features/templates/registry';

let pendingTemplateKey: string | undefined;
const listeners = new Set<() => void>();

function emitEditorTemplate(): void {
  listeners.forEach((listener) => listener());
}

function parseTemplateParam(fromUrl?: string | string[]): string | undefined {
  const raw = Array.isArray(fromUrl) ? fromUrl[0] : fromUrl;
  if (raw && getTemplate(raw).key === raw) return raw;
  return undefined;
}

/** Mémorise le modèle choisi au clic (le layout Expo n’a pas toujours la query). */
export function rememberEditorTemplate(key: string): void {
  pendingTemplateKey = key;
  emitEditorTemplate();
}

/** Clé du modèle à ouvrir : query d’URL, sinon dernier clic catalogue. */
export function useResolvedEditorTemplate(fromUrl?: string | string[]): string | undefined {
  const remembered = useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange);
      return () => {
        listeners.delete(onStoreChange);
      };
    },
    () => pendingTemplateKey,
    () => pendingTemplateKey,
  );
  return parseTemplateParam(fromUrl) ?? remembered;
}

/**
 * Quitte le studio : retour navigateur si possible,
 * sinon repli sur « Mes invitations ».
 */
export function safeExitEditor(router: Router): void {
  if (router.canGoBack()) router.back();
  else router.replace('/invitations');
}

/** Revient à l’écran précédent du studio (pas à la liste d’invitations). */
export function goBackInEditor(router: Router): void {
  if (router.canGoBack()) router.back();
  else router.replace('/editor');
}

/** Ouvre le studio pour un modèle du catalogue. */
export function openTemplateEditor(router: Router, templateKey: string): void {
  rememberEditorTemplate(templateKey);
  router.navigate({
    pathname: '/editor',
    params: { template: templateKey },
  });
}

/** Ouvre le studio pour un événement déjà dans Mes invitations. */
export function openEventEditor(router: Router, event: Pick<Event, 'id' | 'template'>): void {
  const template = getTemplateById(event.template);
  rememberEditorTemplate(template.key);
  router.navigate({
    pathname: '/editor',
    params: { template: template.key, event: String(event.id) },
  });
}

/** Ouvre la page de gestion (invités, stats, check-in) d’une invitation. */
export function openEventManage(router: Router, event: Pick<Event, 'id'>): void {
  router.push(`/invitations/${event.id}`);
}
