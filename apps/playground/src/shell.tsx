import type { Child, FC } from 'hono/jsx';

type RouterViewProps = {
  children: Child;
};

export const RouterView: FC<RouterViewProps> = ({ children }) => {
  // Some logic here
  return <>{children}</>;
};
