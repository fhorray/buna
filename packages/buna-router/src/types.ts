import 'hono';
import type { Child, FC } from 'hono/jsx';
import type { Context } from 'hono';


// ---- Shared primitives ----

export type RouteParams = Record<string, string>;
export type RouteSearch = Record<string, string>;

export type RouteLocation<
  TParams extends RouteParams = RouteParams,
  TSearch extends RouteSearch = RouteSearch,
> = {
  params: TParams;
  search: TSearch;
  hash: string;
};

// ---- Meta ----

export type RouteMeta = {
  title?: string;
  description?: string;
  ogImage?: string;
  keywords?: string[];
  [key: string]: unknown;
};

export type MetaContext<
  TParams extends RouteParams = RouteParams,
  TSearch extends RouteSearch = RouteSearch,
> = RouteLocation<TParams, TSearch>;

export type RouteMetaFn<
  TParams extends RouteParams = RouteParams,
  TSearch extends RouteSearch = RouteSearch,
> = (ctx: MetaContext<TParams, TSearch>) => RouteMeta;

// ---- Core route props ----

export type RouteProps<
  TParams extends RouteParams = RouteParams,
  TSearch extends RouteSearch = RouteSearch,
  TExtraProps = unknown,
> = RouteLocation<TParams, TSearch> & {
  c: Context | undefined;
} & TExtraProps;

export type RouteComponent<
  TParams extends RouteParams = RouteParams,
  TSearch extends RouteSearch = RouteSearch,
  TExtraProps = unknown,
> = FC<RouteProps<TParams, TSearch, TExtraProps>> & {
  meta?: RouteMeta | RouteMetaFn<TParams, TSearch>;
};

export type NotFoundComponentProps = {
  c: Context
} | {
  c?: Context
}

export type NotFoundComponent = FC<NotFoundComponentProps>;


// ---- Layout component ----

export type LayoutProps<
  TParams extends RouteParams = RouteParams,
  TSearch extends RouteSearch = RouteSearch,
> = RouteLocation<TParams, TSearch> & {
  children: Child;
  /**
   * Optional because some layouts might be used without `Context`
   */
  c?: Context;
};

export type LayoutComponent<
  TParams extends RouteParams = RouteParams,
  TSearch extends RouteSearch = RouteSearch,
> = FC<LayoutProps<TParams, TSearch>>;

// ---- Hono renderer augmentation ----

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