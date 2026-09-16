/**
 * Bibliothèque locale Mes invitations + instantanés du studio.
 * Persisté dans localStorage (web) ; en mémoire sur native sans backend.
 */

import type { Event } from '@/types';
import type { EditorSnapshot } from '@/features/editor/snapshot';

const KEY = 'mk-event.library.v1';

type Disk = {
  events: Event[];
  snapshots: Record<string, EditorSnapshot>;
};

const snapshots = new Map<number, EditorSnapshot>();
let hydrated = false;

function storage(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

function readDisk(): Disk | null {
  const raw = storage()?.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Disk;
  } catch {
    return null;
  }
}

export function persistLibrary(events: Event[]): void {
  const payload: Disk = {
    events,
    snapshots: Object.fromEntries([...snapshots.entries()].map(([id, snap]) => [String(id), snap])),
  };
  try {
    storage()?.setItem(KEY, JSON.stringify(payload));
  } catch {
    /* quota */
  }
}

/** Applique le disque sur la liste seed (une fois). */
export function hydrateLibrary(seed: Event[]): void {
  if (hydrated) return;
  hydrated = true;
  const disk = readDisk();
  if (!disk) return;
  Object.entries(disk.snapshots ?? {}).forEach(([id, snap]) => {
    snapshots.set(Number(id), snap);
  });
  if (disk.events?.length) {
    seed.splice(0, seed.length, ...disk.events);
  }
}

export function getSnapshot(eventId: number): EditorSnapshot | null {
  return snapshots.get(eventId) ?? null;
}

export function putSnapshot(eventId: number, snapshot: EditorSnapshot): void {
  snapshots.set(eventId, snapshot);
}
