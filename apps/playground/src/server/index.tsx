import { Hono } from 'hono';
import { jsxRenderer } from 'hono/jsx-renderer';
import { Link, Script, ViteClient } from 'vite-ssr-components/hono';

import { config as router } from '#router';
import { withSSR } from '@buna/router';
import api from './api';
import { RouterView } from '@/shell';

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

// Api Routing
app.route('/api', api);

export default withSSR(app, {
  RouterView,
  router,
});
