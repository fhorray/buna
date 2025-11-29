import { nanoquery } from '@nanostores/query';
import type { ReadableAtom } from 'nanostores';

import {
  $devtoolsEnabled,
  devtoolsKeyToId,
  upsertQuerySnapshot,
} from '@buna/devtools';

// Base nanoquery instance
const [
  baseCreateFetcherStore,
  baseCreateMutatorStore,
  baseHelpers,
] = nanoquery({
  // keys: ['GET', '/api/demo'] or ['POST', '/api/demo', { foo: 'bar' }]
  async fetcher(...keyParts) {
    const [method, path, body] = keyParts as [string, string, unknown?];

    const id = devtoolsKeyToId(keyParts);

    if ($devtoolsEnabled.get()) {
      upsertQuerySnapshot(id, {
        key: keyParts,
        status: 'loading',
      });
    }

    const init: RequestInit = { method };

    if (body != null) {
      init.headers = { 'Content-Type': 'application/json' };
      init.body = JSON.stringify(body);
    }

    const res = await fetch(path, init);

    if (!res.ok) {
      if ($devtoolsEnabled.get()) {
        upsertQuerySnapshot(id, {
          key: keyParts,
          status: 'error',
          error: { status: res.status, statusText: res.statusText },
        });
      }
      throw new Error(`Request failed: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();

    if ($devtoolsEnabled.get()) {
      upsertQuerySnapshot(id, {
        key: keyParts,
        status: 'success',
        data,
      });
    }

    return data;
  },
});

// Public API: same names the rest of the code already uses
export const createFetcherStore = baseCreateFetcherStore;
export const createMutatorStore = baseCreateMutatorStore;

export const { invalidateKeys, revalidateKeys, mutateCache } = baseHelpers;