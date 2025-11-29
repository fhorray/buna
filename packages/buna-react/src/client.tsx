// packages/buna-react/src/client.tsx
import { useEffect, useState, type FC, type Child } from 'hono/jsx';
import { hydrateRoot } from 'hono/jsx/dom/client';

import type {
  LayoutComponent,
  NotFoundComponent,
  RouteComponent,
  RouteMeta,
  RouteMetaFn,
} from '@buna/router';
import type { RouterConfig } from '@buna/router/runtime-client';

type RouterState = ReturnType<RouterConfig['$router']['get']>;

type DirectoryLayerLike = {
  notFound?: RouteComponent;
  error?: RouteComponent;
  loading?: RouteComponent;
  layout?: LayoutComponent;
};

type CreateClientAppOptions = {
  router: RouterConfig;
  /**
   * Optional global app shell.
   * If omitted, Buna will use a default shell that simply renders children.
   */
  RouterView?: FC<{ children: Child }>;
  target?: string;
  defaultTitle?: string;
};

// Default 404 fallback when no _not-found.tsx exists
const DefaultNotFound: NotFoundComponent = (_props) => (
  <main>
    <h1>404 – Not Found</h1>
  </main>
);

// Default error fallback when no _error.tsx exists
const DefaultError: RouteComponent = (_props) => (
  <main>
    <h1>Something went wrong</h1>
  </main>
);

// Default global shell used when the user does not provide a RouterView
const DefaultRouterView: FC<{ children: Child }> = ({ children }) => {
  return <>{children}</>;
};

function getLayerForRoute(
  router: RouterConfig,
  routeName: string | null | undefined,
): DirectoryLayerLike | undefined {
  const layersByDir = router.directoryLayers as Record<
    string,
    DirectoryLayerLike
  >;

  if (!routeName) {
    return layersByDir[''] ?? undefined;
  }

  const meta = router.routesMeta[routeName];
  if (!meta) return layersByDir[''] ?? undefined;

  const dir = meta.directory ?? '';
  return layersByDir[dir] ?? layersByDir[''];
}

function getLayoutChainForRoute(
  router: RouterConfig,
  routeName: string | null | undefined,
): LayoutComponent[] {
  const layersByDir = router.directoryLayers as Record<
    string,
    DirectoryLayerLike
  >;

  if (!routeName) {
    const rootLayout = layersByDir['']?.layout as LayoutComponent | undefined;
    return rootLayout ? [rootLayout] : [];
  }

  const meta = router.routesMeta[routeName];
  if (!meta) {
    const rootLayout = layersByDir['']?.layout as LayoutComponent | undefined;
    return rootLayout ? [rootLayout] : [];
  }

  const dir = meta.directory ?? '';
  const segments = dir === '' ? [] : dir.split('/');

  const layouts: LayoutComponent[] = [];

  // root directory layout
  const rootLayout = layersByDir['']?.layout as LayoutComponent | undefined;
  if (rootLayout) {
    layouts.push(rootLayout);
  }

  // nested directories: "home", "home/blog", ...
  let current = '';
  for (const segment of segments) {
    current = current ? `${current}/${segment}` : segment;
    const layer = layersByDir[current];
    const layout = layer?.layout as LayoutComponent | undefined;
    if (layout) {
      layouts.push(layout);
    }
  }

  return layouts;
}

function resolveMeta(
  router: RouterConfig,
  state: RouterState,
): RouteMeta | undefined {
  if (!state || !state.route) return undefined;

  const Component = router.routeComponents[state.route] as
    | RouteComponent
    | undefined;
  if (!Component || !Component.meta) return undefined;

  if (typeof Component.meta === 'function') {
    const fn = Component.meta as RouteMetaFn;
    return fn({
      params: state.params ?? {},
      search: state.search ?? {},
      hash: state.hash ?? '',
    });
  }

  return Component.meta;
}

function createClientRouterComponent(
  router: RouterConfig,
  RouterView: FC<{ children: Child }>,
  defaultTitle: string,
) {
  const { $router, routeComponents } = router;

  const ClientRouter: FC = () => {
    const [state, setState] = useState<RouterState>($router.get());

    // Subscribe to router state changes
    useEffect(() => {
      const unsubscribe = $router.listen((value) => setState(value));
      return () => unsubscribe();
    }, []);

    // Sync document.title with route metadata
    useEffect(() => {
      const meta = resolveMeta(router, state);
      document.title = meta?.title ?? defaultTitle;
    }, [state]);

    // 1) No matched route → global 404
    if (!state || !state.route) {
      const layer = getLayerForRoute(router, null);
      const NotFound =
        (layer?.notFound as NotFoundComponent | undefined) ?? DefaultNotFound;

      return (
        <RouterView>
          <NotFound />
        </RouterView>
      );
    }

    const routeName = state.route as string;
    const Component = routeComponents[routeName] as RouteComponent | undefined;

    // 2) Known route name but no component → directory-level 404
    if (!Component) {
      const layer = getLayerForRoute(router, routeName);
      const NotFound =
        (layer?.notFound as NotFoundComponent | undefined) ?? DefaultNotFound;

      return (
        <RouterView>
          <NotFound />
        </RouterView>
      );
    }

    // 3) Normal route → wrap with a simple inline error boundary
    const layer = getLayerForRoute(router, routeName);
    const ErrorBoundary =
      (layer?.error as RouteComponent | undefined) ?? DefaultError;

    const SafeRoute: RouteComponent = (props) => {
      try {
        return (
          <Component
            c={undefined}
            params={props.params}
            search={props.search}
            hash={props.hash}
          />
        );
      } catch (err) {
        console.error('[Buna] Error while rendering route', routeName, err);
        return (
          <ErrorBoundary
            c={undefined}
            params={props.params}
            search={props.search}
            hash={props.hash}
          />
        );
      }
    };

    const layouts = getLayoutChainForRoute(router, routeName);

    const content = layouts.reduceRight<Child>(
      (child, Layout) => (
        <Layout
          params={state.params ?? {}}
          search={state.search ?? {}}
          hash={state.hash ?? ''}
        >
          {child}
        </Layout>
      ),
      <SafeRoute
        c={undefined}
        params={state.params ?? {}}
        search={state.search ?? {}}
        hash={state.hash ?? ''}
      />,
    );

    return <RouterView>{content}</RouterView>;
  };

  return ClientRouter;
}

export function createClientApp(options: CreateClientAppOptions) {
  const {
    router,
    RouterView,
    target = '#app',
    defaultTitle = 'Buna App',
  } = options;

  // Choose user shell or fallback to default shell
  const Shell = RouterView ?? DefaultRouterView;

  // Initialize router with the current URL to match SSR
  const initialPath =
    typeof window !== 'undefined'
      ? window.location.pathname + window.location.search + window.location.hash
      : undefined;

  if (initialPath) {
    router.$router.open(initialPath, true);
  }

  const ClientRouter = createClientRouterComponent(router, Shell, defaultTitle);

  const container = document.querySelector(target);

  if (container) {
    hydrateRoot(container as HTMLElement, <ClientRouter />);
  } else {
    console.error(
      `[Buna] Failed to hydrate: container "${target}" was not found`,
    );
  }
}
