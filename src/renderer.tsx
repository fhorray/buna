import type { FC } from 'hono/jsx';
import { jsxRenderer } from 'hono/jsx-renderer';
import { Script, ViteClient } from 'vite-ssr-components/hono';

// 1) Extend ContextRenderer to accept extras props
declare module 'hono' {
  interface ContextRenderer {
    (content: string | Promise<string>, props?: { title?: string }): Response;
  }
}

// 2) Simple wrapper  to the route content
export const RouterView: FC = (props) => {
  return <>{props.children}</>;
};

// 3) JSX renderer with lgloba layout + stream habilitado
export const renderer = jsxRenderer(
  ({ children, title }) => {
    return (
      <html lang="en">
        <head>
          <ViteClient />
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <Script src="/src/style.css" />
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
);
