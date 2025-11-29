import type { Child, FC } from 'hono/jsx';
import type { RouteProps } from '@buna/router';

type HomeLayoutProps = RouteProps & {
  children: Child;
};

const HomeLayout: FC<HomeLayoutProps> = ({ children }) => {
  return (
    <div class="bg-blue-600">
      <header>Posts layout header</header>
      <main>{children}</main>
    </div>
  );
};

export default HomeLayout;
