import type { ReadableAtom } from 'nanostores';
import { useState, useEffect, useRef } from 'hono/jsx';

export function useQuery<T>(store: ReadableAtom<T>): T {
  const [value, setValue] = useState(store.get());
  const storeRef = useRef<ReadableAtom<T> | null>(null);

  if (storeRef.current === null) {
    storeRef.current = store;
  } else if (storeRef.current !== store) {
    console.error(
      '[buna] useQuery() received a different store instance between renders.\n' +
        'This usually means you are creating the store inside the component or\n' +
        'passing unstable arguments (e.g. undefined params, new objects, etc.).',
    );
    throw new Error('[buna] Unstable store passed to useQuery()');
  }

  useEffect(() => {
    const unbind = store.subscribe(setValue);
    return () => {
      unbind();
    };
  }, [store.get()]);

  return value;
}
