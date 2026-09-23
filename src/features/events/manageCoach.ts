/**
 * Coach local Gestion — handoff post-publish + tip Check-in.
 * Clé : mkevent.manageCoach.{eventId}
 */

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export type ManageCoachFlags = {
  welcomeSeen: boolean;
  entranceSeen: boolean;
};

const DEFAULT: ManageCoachFlags = {
  welcomeSeen: false,
  entranceSeen: false,
};

const memory = new Map<number, ManageCoachFlags>();

export function manageCoachKey(eventId: number): string {
  return `mkevent.manageCoach.${eventId}`;
}

function persist(eventId: number, flags: ManageCoachFlags): void {
  memory.set(eventId, flags);
  const raw = JSON.stringify(flags);
  const key = manageCoachKey(eventId);
  try {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.setItem(key, raw);
      return;
    }
  } catch {
    /* ignore */
  }
  void SecureStore.setItemAsync(key, raw).catch(() => undefined);
}

export function readManageCoach(eventId: number): ManageCoachFlags {
  const cached = memory.get(eventId);
  if (cached) return { ...cached };
  try {
    if (Platform.OS === 'web') {
      const raw = globalThis.localStorage?.getItem(manageCoachKey(eventId));
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ManageCoachFlags>;
        const flags: ManageCoachFlags = {
          welcomeSeen: Boolean(parsed.welcomeSeen),
          entranceSeen: Boolean(parsed.entranceSeen),
        };
        memory.set(eventId, flags);
        return { ...flags };
      }
    }
  } catch {
    /* ignore */
  }
  return { ...DEFAULT };
}

export async function hydrateManageCoach(eventId: number): Promise<ManageCoachFlags> {
  if (memory.has(eventId)) return { ...memory.get(eventId)! };
  if (Platform.OS === 'web') return readManageCoach(eventId);
  try {
    const raw = await SecureStore.getItemAsync(manageCoachKey(eventId));
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ManageCoachFlags>;
      const flags: ManageCoachFlags = {
        welcomeSeen: Boolean(parsed.welcomeSeen),
        entranceSeen: Boolean(parsed.entranceSeen),
      };
      memory.set(eventId, flags);
      return { ...flags };
    }
  } catch {
    /* ignore */
  }
  return { ...DEFAULT };
}

export function writeManageCoach(eventId: number, flags: ManageCoachFlags): void {
  persist(eventId, flags);
}

export function markWelcomeSeen(eventId: number): void {
  const current = readManageCoach(eventId);
  writeManageCoach(eventId, { ...current, welcomeSeen: true });
}

export function markEntranceSeen(eventId: number): void {
  const current = readManageCoach(eventId);
  writeManageCoach(eventId, { ...current, entranceSeen: true });
}

/** Rejoue le coach (Aide) — réaffiche le sheet missions. */
export function resetWelcomeCoach(eventId: number): void {
  const current = readManageCoach(eventId);
  writeManageCoach(eventId, { ...current, welcomeSeen: false });
}
