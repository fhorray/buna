export type DevtoolsStatus = 'idle' | 'loading' | 'success' | 'error';

export type DevtoolsQueryKey = readonly unknown[];

export type DevtoolsQuerySnapshot = {
  id: string;
  key: DevtoolsQueryKey;
  status: DevtoolsStatus;
  data?: unknown;
  error?: unknown;
  updatedAt: number;
};

export type RouterDevtoolsSnapshot = {
  currentPath: string;
  params: Record<string, string>;
  search: Record<string, string>;
  hash?: string;
  routes: Record<string, string>;
  routesMeta: Record<
    string,
    {
      pattern: string;
      directory: string;
      filePath: string;
    }
  >;
};