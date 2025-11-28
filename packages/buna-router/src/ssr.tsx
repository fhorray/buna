// packages/buna-router/src/ssr.ts
import type { Context, Hono } from 'hono';
import type { FC } from 'hono/jsx';
import type { RouteComponent, RouteMeta, RouteMetaFn } from './types';
import { JSX } from 'hono/jsx/jsx-runtime';

type RouterViewComponent = FC<{ children: JSX.Element }>;

type RouterStore = {
  get(): any;
  open(path: string, replace?: boolean): void;
};

type RouterModule = {
  routeComponents: Record<string, RouteComponent>;
  routesMeta: Record<
    string,
    {
      pattern: string;
      directory: string;
      filePath: string;
    }
  >;
  directoryLayers: Record<string, unknown>;
  directoryOrder: string[];
  $router: RouterStore;
};

type CreateSSRHandlerOptions = {
  RouterView: RouterViewComponent;
  NotFound: FC;
  router: RouterModule;
  defaultTitle?: string;
};

type ResolvedState = {
  state: any | null;
  search: Record<string, string>;
  hash: string;
};

function searchParamsToRecord(params: URLSearchParams): Record<string, string> {
  const result: Record<string, string> = {};

  params.forEach((value, key) => {
    result[key] = value;
  });

  return result;
}

function syncRouterFromRequest(
  c: Context,
  router: RouterModule,
): ResolvedState {
  const url = new URL(c.req.url);
  const search = searchParamsToRecord(url.searchParams);
  const hash = url.hash;

  router.$router.open(url.pathname + url.search + url.hash);
  const state = router.$router.get();

  return { state, search, hash };
}

function getRouteComponent(
  router: RouterModule,
  route: string,
): RouteComponent | undefined {
  const Component = router.routeComponents[route] as RouteComponent | undefined;
  return Component;
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

function renderNotFound(
  c: Context,
  RouterView: RouterViewComponent,
  NotFound: FC,
) {
  c.status(404);
  return c.render(
    <RouterView>
      <NotFound />
    </RouterView>,
  );
}

function createSSRHandler({
  RouterView,
  NotFound,
  router,
}: CreateSSRHandlerOptions) {
  return (c: Context) => {
    const { state, search, hash } = syncRouterFromRequest(c, router);

    if (!state || !state.route) {
      return renderNotFound(c, RouterView, NotFound);
    }

    const Component = getRouteComponent(router, state.route);

    if (!Component) {
      return renderNotFound(c, RouterView, NotFound);
    }

    const pageMeta = resolveRouteMeta(Component, state, search, hash);

    const element = (
      <RouterView>
        <Component
          c={c}
          params={state.params ?? {}}
          search={state.search ?? search}
          hash={state.hash ?? hash}
        />
      </RouterView>
    );

    // This was extended by the module inside types.ts
    return c.render(element, {
      title: pageMeta?.title,
      meta: pageMeta,
    });
  };
}

// Main function to use inside server.ts
export function withSSR(app: Hono, options: CreateSSRHandlerOptions): Hono {
  const handler = createSSRHandler(options);
  app.get('*', handler);
  return app;
}
