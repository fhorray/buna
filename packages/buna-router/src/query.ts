import { KeySelector, nanoquery } from '@nanostores/query';

import {
  $devtoolsEnabled,
  appendLog,
  devtoolsKeyToId,
  upsertQuerySnapshot
} from '@buna/devtools';

const [
  baseCreateFetcherStore,
  baseCreateMutatorStore,
  baseHelpers,
] = nanoquery({
  async fetcher(...keyParts) {
    const [method, path, body] = keyParts as [string, string, unknown?];

    const id = devtoolsKeyToId(keyParts);

    if ($devtoolsEnabled.get()) {
      upsertQuerySnapshot(id, {
        key: keyParts,
        status: 'loading',
      });

      appendLog({
        level: 'info',
        source: 'query',
        message: `Fetching ${String(method)} ${String(path)}`,
        payload: { keyParts, body },
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

        appendLog({
          level: 'error',
          source: 'query',
          message: `Request failed ${String(method)} ${String(path)}`,
          payload: {
            status: res.status,
            statusText: res.statusText,
            keyParts,
          },
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

      appendLog({
        level: 'info',
        source: 'query',
        message: `Request success ${String(method)} ${String(path)}`,
        payload: { keyParts },
      });
    }

    return data;
  },
});

// Public API
export const createFetcherStore = baseCreateFetcherStore;
export const createMutatorStore = baseCreateMutatorStore;

export const {
  invalidateKeys,
  revalidateKeys,
  mutateCache,
} = baseHelpers;


// Helpers for devtools
export function invalidateQuery(keyParts: unknown[]): void {
  const [method, path] = keyParts as [string, string, ...unknown[]];


  const selector: KeySelector = (serializedKey) => {
    // serializedKey é string interna do nanoquery
    // Ex.: "GET /api/todo/123", "/api/todo/123", ou algo com JSON.stringify
    return (
      serializedKey.includes(String(method)) &&
      serializedKey.includes(String(path))
    );
  };

  invalidateKeys(selector);
}

export function revalidateQuery(keyParts: unknown[]): void {
  const [method, path] = keyParts as [string, string, ...unknown[]];

  const selector: KeySelector = (serializedKey) => {
    return (
      serializedKey.includes(String(method)) &&
      serializedKey.includes(String(path))
    );
  };

  revalidateKeys(selector);
}