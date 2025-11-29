import type { ReadableAtom } from 'nanostores';
import { useState, useEffect } from 'hono/jsx';

export function useQuery<T>(store: ReadableAtom<T>): T {
  const [value, setValue] = useState(store.get());

  useEffect(() => {
    const unbind = store.subscribe(setValue);
    return () => {
      unbind();
    };
  }, []);

  return value;
}
