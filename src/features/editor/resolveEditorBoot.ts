/**
 * Résout l’instantané studio à l’ouverture de l’éditeur :
 * serveur (studio_config + invités) > cache local > null.
 */

import { SIMULATE_BACKEND } from '@/constants/config';
import {
  editorSnapshotFromStudioConfig,
  mapApiGuestsToEditor,
  type EditorSnapshot,
} from '@/features/editor/snapshot';
import { eventsService } from '@/services/eventsService';
import { guestsService } from '@/services/guestsService';

export async function resolveEditorBootSnapshot(
  eventId: number,
): Promise<EditorSnapshot | null> {
  const local = eventsService.readSnapshot(eventId);

  if (SIMULATE_BACKEND) {
    return local;
  }

  try {
    const [event, apiGuests] = await Promise.all([
      eventsService.getEvent(eventId),
      guestsService.listGuests(eventId).catch(() => []),
    ]);
    const guests = mapApiGuestsToEditor(apiGuests);
    const fromServer = editorSnapshotFromStudioConfig(event.studio_config, guests);
    if (fromServer) {
      eventsService.saveSnapshot(eventId, fromServer);
      return fromServer;
    }
  } catch {
    /* Réseau / 404 — repli local. */
  }

  return local;
}
