import type { FC } from 'hono/jsx';
import type { Context } from 'hono';

export type RouteMeta = {
  title?: string;
  description?: string;
  ogImage?: string;
  keywords?: string[];
  [key: string]: unknown;
};

export type MetaContext<
  TParams extends Record<string, string> = Record<string, string>,
  TSearch extends Record<string, string> = Record<string, string>,
> = {
  params: TParams;
  search: TSearch;
  hash: string;
};

export type RouteMetaFn<
  TParams extends Record<string, string> = Record<string, string>,
  TSearch extends Record<string, string> = Record<string, string>,
> = (ctx: MetaContext<TParams, TSearch>) => RouteMeta;

export type RouteProps<
  TParams extends Record<string, string> = Record<string, string>,
  TSearch extends Record<string, string> = Record<string, string>,
  TExtraProps = unknown,
> = TExtraProps & {
  c?: Context; // present in SSR, optional on client 
  params: TParams;
  search: TSearch;
  hash: string;
};

// Default BUna Route Component
export type RouteComponent<
  TParams extends Record<string, string> = Record<string, string>,
  TSearch extends Record<string, string> = Record<string, string>,
  TExtraProps = unknown,
> = FC<RouteProps<TParams, TSearch, TExtraProps>> & {
  meta?: RouteMeta | RouteMetaFn<TParams, TSearch>;
};

export type CreateRouteComponentOptions<
  TParams extends Record<string, string> = Record<string, string>,
  TSearch extends Record<string, string> = Record<string, string>,
> = {
  meta?: RouteMeta | RouteMetaFn<TParams, TSearch>;
};


import 'hono';

declare module 'hono' {
  interface ContextRenderer {
    (
      content: string | Promise<string>,
      props?: {
        title?: string;
        meta?: RouteMeta;
      },
    ): Response;
  }
}