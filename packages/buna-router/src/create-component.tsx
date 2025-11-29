// create-route-component.ts
import { HtmlEscapedString } from 'hono/utils/html';
import type { RouteComponent, RouteProps } from './types';

/**
 * Helper to create strongly-typed route components.
 *
 * - Ensures the final component always receives the correct typings.
 * - Works on both server (SSR) and client (hydrated SPA).
 */
export function CreateFileRoute<
  TParams extends Record<string, string> = Record<string, string>,
  TSearch extends Record<string, string> = Record<string, string>,
  TExtraProps = unknown,
>(
  render: (
    props: RouteProps<TParams, TSearch, TExtraProps>,
  ) => HtmlEscapedString | Promise<HtmlEscapedString>, // TODO: is this type right? I should verify it later
  options?: RouteComponent<TParams, TSearch>,
): RouteComponent<TParams, TSearch, TExtraProps> {
  const Component = render as RouteComponent<TParams, TSearch, TExtraProps>;

  if (options?.meta) {
    Component.meta = options.meta;
  }

  return Component;
}

// Alias for CreateComponent
export function CreateComponent<
  TParams extends Record<string, string> = Record<string, string>,
  TSearch extends Record<string, string> = Record<string, string>,
  TExtraProps = unknown,
>(
  _path: string,
  render: (
    props: RouteProps<TParams, TSearch, TExtraProps>,
  ) => HtmlEscapedString | Promise<HtmlEscapedString>,
  options?: RouteComponent<TParams, TSearch>,
): RouteComponent<TParams, TSearch, TExtraProps> {
  // Por enquanto ignoramos o path em runtime.
  // No futuro dá pra usar isso pra asserts de “path do arquivo vs path informado”.
  return CreateFileRoute<TParams, TSearch, TExtraProps>(render, options);
}
