import type { Context, Hono } from 'hono';
import type { Child, FC } from 'hono/jsx';
import type { DirectoryLayer } from './router-core';
import type { RouterConfig } from './runtime-client';
import type {
  LayoutComponent,
  NotFoundComponent,
  RouteComponent,
  RouteMeta,
  RouteMetaFn,
  RouteLoader,
} from './types';
import { JSX } from 'hono/jsx/jsx-runtime';

type RouterViewComponent = FC<{ children: Child }>;

type CreateSSRHandlerOptions = {
  router: RouterConfig;
  /**
   * Optional global app shell.
   * If omitted, Buna will use a default shell that simply renders children.
   */
  RouterView?: RouterViewComponent;
  defaultTitle?: string;
};

type ResolvedState = {
  state: any | null;
  search: Record<string, string>;
  hash: string;
};

// Default global shell used when the user does not provide a RouterView
const DefaultRouterView: RouterViewComponent = ({ children }) => {
  return <>{children}</>;
};

// DEFAULT NOT FOUND COMPONENT
const DefaultNotFound: NotFoundComponent = () => (
  <main>
    <h1>404 – Not Found</h1>
  </main>
);

// DEFAULT ERROR COMPONENT
const DefaultError: FC<{ error?: unknown }> = ({ error }) => (
  <main>
    <h1>Something went wrong</h1>
    {error && <pre>{String(error)}</pre>}
  </main>
);

// Helpers
function getLayoutChainForRoute(
  router: RouterConfig,
  routeName: string | null | undefined,
): LayoutComponent[] {
  const layersByDir = router.directoryLayers;

  if (!routeName) {
    const rootLayout = layersByDir['']?.layout;
    return rootLayout ? [rootLayout] : [];
  }

  const meta = router.routesMeta[routeName];
  if (!meta) {
    const rootLayout = layersByDir['']?.layout;
    return rootLayout ? [rootLayout] : [];
  }

  const dir = meta.directory ?? '';
  const segments = dir === '' ? [] : dir.split('/');

  const layouts: DirectoryLayer['layout'][] = [];

  const rootLayout = layersByDir['']?.layout;
  if (rootLayout) layouts.push(rootLayout);

  let current = '';
  for (const segment of segments) {
    current = current ? `${current}/${segment}` : segment;
    const layout = layersByDir[current]?.layout;
    if (layout) layouts.push(layout);
  }

  return layouts.filter(Boolean) as LayoutComponent[];
}

function searchParamsToRecord(params: URLSearchParams): Record<string, string> {
  const result: Record<string, string> = {};

  params.forEach((value, key) => {
    result[key] = value;
  });

  return result;
}

function syncRouterFromRequest(
  c: Context,
  router: RouterConfig,
): ResolvedState {
  const url = new URL(c.req.url);
  const search = searchParamsToRecord(url.searchParams);
  const hash = url.hash;

  router.$router.open(url.pathname + url.search + url.hash);
  const state = router.$router.get();

  // set data inside hono context to pass to the components?
  // c.set("hash", hash);

  return { state, search, hash };
}

function getRouteComponent(
  router: RouterConfig,
  route: string,
): RouteComponent | undefined {
  const Component = router.routeComponents[route] as RouteComponent | undefined;
  return Component;
}

// Loader
function getRouteLoader(
  router: RouterConfig,
  route: string,
): RouteLoader<any, any, any> | undefined {
  return router.routeLoaders?.[route];
}

function resolveRouteMeta(
  Component: RouteComponent,
  state: any,
  search: Record<string, string>,
  hash: string,
): RouteMeta | undefined {
  if (!Component.meta) return undefined;

  if (typeof Component.meta === 'function') {
    const fn = Component.meta as RouteMetaFn;
    return fn({
      params: state.params ?? {},
      search: state.search ?? search,
      hash: state.hash ?? hash,
    });
  }

  return Component.meta;
}

// Directory layers helpers
function getLayerForRoute(
  router: RouterConfig,
  routeName: string,
): DirectoryLayer | undefined {
  const meta = router.routesMeta[routeName];
  if (!meta) return router.directoryLayers[''] ?? undefined;

  const dir = meta.directory ?? '';
  return router.directoryLayers[dir] ?? router.directoryLayers[''];
}

function getLayerForPath(
  router: RouterConfig,
  path: string,
): DirectoryLayer | undefined {
  const clean = path.replace(/^\/+/, ''); // remove leading "/"
  const pathSegments = clean === '' ? [] : clean.split('/');

  let bestDir: string | undefined;
  let bestDepth = -1;

  for (const dir of router.directoryOrder) {
    // '' is root
    if (dir === '') {
      if (bestDir === undefined) {
        bestDir = '';
        bestDepth = 0;
      }
      continue;
    }

    const dirSegments = dir.split('/');
    if (dirSegments.length > pathSegments.length) continue;

    let match = true;
    for (let i = 0; i < dirSegments.length; i++) {
      if (dirSegments[i] !== pathSegments[i]) {
        match = false;
        break;
      }
    }
    if (!match) continue;

    if (dirSegments.length > bestDepth) {
      bestDir = dir;
      bestDepth = dirSegments.length;
    }
  }

  if (bestDir === undefined) {
    bestDir = '';
  }

  return router.directoryLayers[bestDir] ?? router.directoryLayers[''];
}

// NOT FOUND helpers
function renderNotFoundForPath(
  c: Context,
  RouterView: RouterViewComponent,
  router: RouterConfig,
  path: string,
) {
  const layer = getLayerForPath(router, path);
  const NotFound = (layer?.notFound ?? DefaultNotFound) as NotFoundComponent;

  c.status(404);
  return c.render(
    <RouterView>
      <NotFound c={c} />
    </RouterView>,
  );
}

function renderNotFoundForRoute(
  c: Context,
  RouterView: RouterViewComponent,
  router: RouterConfig,
  routeName: string,
) {
  const layer = getLayerForRoute(router, routeName);
  const NotFound = (layer?.notFound ?? DefaultNotFound) as NotFoundComponent;

  c.status(404);
  return c.render(
    <RouterView>
      {/* TODO: set search, params hash etc.. */}
      <NotFound c={c} />
    </RouterView>,
  );
}

// ERROR helper
function renderErrorForRoute(
  c: Context,
  RouterView: RouterViewComponent,
  router: RouterConfig,
  routeName: string | null,
  error: unknown,
) {
  const layer = routeName
    ? getLayerForRoute(router, routeName)
    : router.directoryLayers[''] ?? undefined;

  const ErrorBoundary = (layer?.error ??
    ((props: { error?: unknown }) => <DefaultError {...props} />)) as FC<{
    error?: unknown;
  }>;

  c.status(500);
  return c.render(
    <RouterView>
      <ErrorBoundary error={error} />
    </RouterView>,
  );
}

export function createSSRHandler({
  RouterView,
  router,
  defaultTitle,
}: CreateSSRHandlerOptions) {
  const Shell = RouterView ?? DefaultRouterView;

  return async (c: Context) => {
    const url = new URL(c.req.url);

    const { state, search, hash } = syncRouterFromRequest(c, router);

    // No route matched → 404 based on raw path
    if (!state || !state.route) {
      return renderNotFoundForPath(c, Shell, router, url.pathname);
    }

    const routeName = state.route as string;
    const Component = getRouteComponent(router, routeName);

    if (!Component) {
      return renderNotFoundForRoute(c, Shell, router, routeName);
    }

    let pageMeta: RouteMeta | undefined;
    let loaderData: unknown;

    try {
      const loader = routeName ? getRouteLoader(router, routeName) : undefined;

      if (loader) {
        loaderData = await loader({
          c,
          params: state.params ?? {},
          search: state.search ?? search,
          hash: state.hash ?? hash,
        });

        console.log('[SSR loaderData]:', loaderData);
      }

      pageMeta = resolveRouteMeta(Component, state, search, hash);

      const element = (
        <Component
          c={c}
          params={state.params ?? {}}
          search={state.search ?? search}
          hash={state.hash ?? hash}
          // @ts-expect-error expect error since there are routes that does not use loader.
          data={loaderData}
        />
      );

      return c.render(element, {
        title: pageMeta?.title ?? defaultTitle,
        meta: pageMeta,
      });
    } catch (err) {
      // _error.tsx per route/directory
      return renderErrorForRoute(c, Shell, router, routeName, err);
    }
  };
}

export function withSSR(app: Hono, options: CreateSSRHandlerOptions): Hono {
  const handler = createSSRHandler(options);
  app.get('*', handler);
  return app;
}
