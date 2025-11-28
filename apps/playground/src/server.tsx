// apps/playground/src/server.tsx
import { Hono } from 'hono';
import { jsxRenderer } from 'hono/jsx-renderer';
import { Link, Script, ViteClient } from 'vite-ssr-components/hono';

import NotFound from './routes/_not-found';

import { withSSR } from '@buna/router';
import { config as router } from '#router';
import { FC } from 'hono/jsx';

export const RouterView: FC = (props) => <>{props.children}</>;

const app = new Hono();

app.use(
  jsxRenderer(
    ({ children, title }) => {
      const finalTitle = title ?? 'Buna Playground';

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
            <title>{finalTitle}</title>
          </head>
          <body>
            <div id="app" />
          </body>
        </html>
      );
    },
    { stream: true },
  ),
);

export default withSSR(app, {
  RouterView,
  NotFound,
  router,
});
