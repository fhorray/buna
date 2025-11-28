// create-route-component.ts
import { FC } from 'hono/jsx';
import type {
  CreateRouteComponentOptions,
  RouteComponent,
  RouteMeta,
  RouteMetaFn,
  RouteProps,
} from './types';
import { HtmlEscapedString } from 'hono/utils/html';

/**
 * Helper to create strongly-typed route components.
 *
 * - Ensures the final component always receives the correct typings.
 * - Works on both server (SSR) and client (hydrated SPA).
 */
export function createRouteComponent<
  TParams extends Record<string, string> = Record<string, string>,
  TSearch extends Record<string, string> = Record<string, string>,
  TExtraProps = unknown,
>(
  render: (
    props: RouteProps<TParams, TSearch, TExtraProps>,
  ) => HtmlEscapedString | Promise<HtmlEscapedString>, // TODO: is this type right? I should verify it later
  options?: CreateRouteComponentOptions<TParams, TSearch>,
): RouteComponent<TParams, TSearch, TExtraProps> {
  const Component = render as RouteComponent<TParams, TSearch, TExtraProps>;

  if (options?.meta) {
    Component.meta = options.meta;
  }

  return Component;
}
