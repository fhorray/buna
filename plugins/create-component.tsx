import type { Context } from 'hono';

export type RouteParams = Record<string, string>;
export type RouteSearch = Record<string, string>;

/**
 * Base props for any route component.
 *
 * P = route params (like { id: string } for /user/:id)
 * S = extra props that may come from the server during SSR
 */
export type RouteComponentProps<
  P extends RouteParams = RouteParams,
  S extends object = {},
> = {
  c?: Context; // optional: Hono context (only available on server-side)
  params: P; // route params, always string
  search?: RouteSearch; // URL search params (querystring)
  hash?: string; // URL hash, e.g. "#section1"
} & S;

type AnyRouteComponent<P extends RouteParams, S extends object> = (
  props: RouteComponentProps<P, S>,
) => any;

/**
 * Helper to create strongly-typed route components.
 *
 * - Accepts two generics: P = route params, S = server props.
 * - Ensures the final component always receives the correct typings.
 * - Works on both server (SSR) and client (hydrated SPA).
 */
export function createRouteComponent<
  P extends RouteParams = RouteParams,
  S extends object = {},
>(component: AnyRouteComponent<P, S>): AnyRouteComponent<P, S> {
  // We just coerce the type so TS always sees a valid component signature
  return component as AnyRouteComponent<P, S>;
}
