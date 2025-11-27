import { useEffect, useState } from 'hono/jsx';
import { hydrateRoot } from 'hono/jsx/dom/client';
import NotFound from './routes/_not-found';
import { $router, routeComponents, RoutingKeys } from '#router';
import { RouterView } from './server';

type RouterState = ReturnType<typeof $router.get>;

// Boot router with the current URL so hydration matches the SSR markup.
const initialPath =
  typeof window !== 'undefined'
    ? window.location.pathname + window.location.search + window.location.hash
    : undefined;

if (initialPath) {
  $router.open(initialPath, true);
}

function ClientRouter() {
  const [state, setState] = useState<RouterState>($router.get());

  useEffect(() => {
    const unsubscribe = $router.listen((value) => setState(value));
    return () => unsubscribe();
  }, []);

  if (!state) {
    return (
      <RouterView>
        <NotFound />
      </RouterView>
    );
  }

  const Component = routeComponents[state.route as RoutingKeys];

  if (!Component) {
    return (
      <RouterView>
        <NotFound />
      </RouterView>
    );
  }

  return (
    <RouterView>
      <Component
        params={state.params as any}
        search={state.search}
        hash={state.hash}
      />
    </RouterView>
  );
}

const container = document.getElementById('app');

if (container) {
  hydrateRoot(container, <ClientRouter />);
} else {
  console.error('App container not found for hydration');
}
