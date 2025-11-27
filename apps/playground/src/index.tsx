import { Hono } from 'hono';
import { renderer, RouterView } from './renderer';
import NotFound from './routes/_not-found';
import { routes, routeComponents, RoutingKeys, $router } from '#router';

const app = new Hono();

app.use(renderer);

function matchRoute(pathname: string) {
  // Remove trailing slash except root
  const normalized = pathname.replace(/\/$/, '') || '/';

  for (const [name, pattern] of Object.entries(routes)) {
    if (typeof pattern !== 'string') continue;

    const regexp = pattern.replace(/\/$/g, '') || '/';
    const matcher = regexp
      .replace(/[\s!#$()+,.:<=?[\\\]^{|}]/g, '\\$&')
      .replace(/\/\\:(\w+)\\\?/g, '(?:/(?<$1>(?<=/)[^/]+))?')
      .replace(/\/\\:(\w+)/g, '/(?<$1>[^/]+)');

    const re = new RegExp('^' + matcher + '$', 'i');
    const m = normalized.match(re);
    if (m) {
      const params = Object.keys({ ...(m.groups ?? {}) }).reduce<
        Record<string, string>
      >((acc, key) => {
        acc[key] = m.groups?.[key] ? decodeURIComponent(m.groups[key]) : '';
        return acc;
      }, {});

      return { name, params };
    }
  }

  return null;
}

app.get('*', (c) => {
  const url = new URL(c.req.url);
  const match = matchRoute(url.pathname);
  const search = Object.fromEntries(url.searchParams.entries());
  const hash = url.hash;

  // IMPORTANT: sync Nano Stores router with the current URL on SSR
  $router.open(url.pathname + url.search + url.hash);

  if (!match) {
    c.status(404);
    return c.render(
      <RouterView>
        <NotFound />
      </RouterView>,
    );
  }

  const Component = routeComponents[match.name as RoutingKeys];

  const fallback = Component ? (
    <Component c={c} params={match.params as any} search={search} hash={hash} />
  ) : null;

  return c.render(<RouterView>{fallback}</RouterView>);
});

export default app;
