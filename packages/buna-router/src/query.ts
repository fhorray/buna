import { nanoquery } from '@nanostores/query';

// NanoQuery
export const [
  createFetcherStore,
  createMutatorStore,
  { invalidateKeys, revalidateKeys, mutateCache },
] = nanoquery({
  // keys: ['GET', '/api/demo'] or ['POST', '/api/demo', { foo: 'bar' }]
  async fetcher(...keyParts) {
    const [method, path, body] = keyParts as [string, string, unknown?];

    const init: RequestInit = { method };

    if (body != null) {
      init.headers = { 'Content-Type': 'application/json' };
      init.body = JSON.stringify(body);
    }

    const res = await fetch(path, init);
    if (!res.ok) {
      throw new Error(`Request failed: ${res.status} ${res.statusText}`);
    }

    return res.json();
  },
});