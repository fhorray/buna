import { atom, map } from 'nanostores';
import type {
  DevtoolsQueryKey,
  DevtoolsQuerySnapshot,
  RouterDevtoolsSnapshot,
} from './types';


// Enable flag (only used in dev)
export const $devtoolsEnabled = atom<boolean>(
  typeof import.meta !== 'undefined'
    ? !!(import.meta as any).env?.DEV
    : true,
);

// All queries keyed by an id
export const $queries = map<Record<string, DevtoolsQuerySnapshot>>({});

// Current router snapshot
export const $router = atom<RouterDevtoolsSnapshot | null>(null);

// Small helper to generate a stable id from query key
export function devtoolsKeyToId(keyParts: DevtoolsQueryKey): string {
  try {
    return JSON.stringify(keyParts);
  } catch {
    return String(keyParts[0] ?? 'unknown-key');
  }
}

// Update or insert a query snapshot
export function upsertQuerySnapshot(
  id: string,
  snapshot: Partial<DevtoolsQuerySnapshot> & { key: DevtoolsQueryKey },
): void {
  if (!$devtoolsEnabled.get()) return;

  const current = $queries.get()[id];

  const next: DevtoolsQuerySnapshot = {
    ...current,
    ...snapshot,
    id,
    status: 'idle',
    updatedAt: Date.now(),

  };

  $queries.setKey(id, next);
}

// Set router snapshot
export function setRouterSnapshot(snapshot: RouterDevtoolsSnapshot): void {
  if (!$devtoolsEnabled.get()) return;
  $router.set({
    ...snapshot,
    // always update time implicitly via queries if needed later
  });
}