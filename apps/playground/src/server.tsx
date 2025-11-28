import { Hono } from 'hono';

import NotFound from './routes/_not-found';
import { routes, routeComponents, RoutingKeys, $router } from '#router';
import { jsxRenderer } from 'hono/jsx-renderer';
import { Link, Script, ViteClient } from 'vite-ssr-components/hono';
import { FC } from 'hono/jsx';

// 1) Extend ContextRenderer to accept extras props
declare module 'hono' {
  interface ContextRenderer {
    (content: string | Promise<string>, props?: { title?: string }): Response;
  }
}

export const RouterView: FC = (props) => <>{props.children}</>;
const app = new Hono();

/**
 * Renderer
 */
app.use(
  jsxRenderer(
    ({ children, title }) => {
      return (
        <html lang="en">
          <head>
            <ViteClient />
            <meta charSet="utf-8" />
            <meta
              name="viewport"
              content="width=device-width,initial-scale=1"
            />
            <Link href="/src/style.css" rel="stylesheet" />
            <Script src="/src/client.tsx" />
            <title>{title ?? 'Hono + Vite + Nano Stores'}</title>
          </head>
          <body>
            <div id="app">{children}</div>
          </body>
        </html>
      );
    },
    {
      stream: true, // enables SSR streaming + Suspense
    },
  ),
);

app.get('*', (c) => {
  const url = new URL(c.req.url);
  const search = Object.fromEntries(url.searchParams.entries());
  const hash = url.hash;

  // IMPORTANT: sync Nano Stores router with the current URL on SSR
  $router.open(url.pathname + url.search + url.hash);

  const match = $router.get();

  if (!match) {
    c.status(404);
    return c.render(
      <RouterView>
        <NotFound />
      </RouterView>,
    );
  }

  const Component = routeComponents[match.path as RoutingKeys];

  const fallback = Component ? (
    <Component c={c} params={match.params as any} search={search} hash={hash} />
  ) : null;

  return c.render(<RouterView>{fallback}</RouterView>);
});

export default app;
