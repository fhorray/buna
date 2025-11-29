import type { RouteLoader } from './types';

export type InferLoaderData<T> = T extends RouteLoader<infer D, any, any>
  ? D
  : never;

export function createRouteQuery<
  TData,
  TParams extends Record<string, string> = Record<string, string>,
  TSearch extends Record<string, string> = Record<string, string>,
>(loader: RouteLoader<TData, TParams, TSearch>) {
  return loader;
}