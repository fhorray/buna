// src/plugins/create-component.ts
import type { Context } from 'hono';

export type RouteComponentProps<P = unknown> = {
  c?: Context; // optional, para poder usar no client sem passar c
  params: P;
  search?: Record<string, string>;
  hash?: string;
};

export function createRouteComponent<P = unknown>(
  component: (props: RouteComponentProps<P>) => any,
): (props: RouteComponentProps<P>) => any {
  // we coerce the type so TS always sees a component that accepts props
  return component as (props: RouteComponentProps<P>) => any;
}
