import { BunaDevtoolsPanel } from '@buna/devtools';
import type { Child, FC } from 'hono/jsx';

type RouterViewProps = {
  children: Child;
};

export const RouterView: FC<RouterViewProps> = ({ children }) => {
  // Some logic here
  return (
    <>
      {import.meta.env.DEV ? <BunaDevtoolsPanel /> : null}
      {children}
    </>
  );
};
