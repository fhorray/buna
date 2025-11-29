# Buna — File-based Full-stack Framework

_Hono + Vite + Nano Stores + Cloudflare Workers_

Buna is an experimental full-stack framework inspired by the Next.js mental model —  
but optimized for **edge runtimes** and a **tiny reactive core** powered by Nano Stores.

It aims to provide opinionated DX with:

- **File-based routing** (frontend)
- **Hono-based server & API**
- **SSR + SPA navigation** via Nano Stores
- **Auto-generated router code** (`runtime-client` + `runtime-hono`)
- **Auto-generated API client** on top of `@nanostores/query`
- Smooth deployment flow for Cloudflare Workers

---

## 🚀 Current Status

> ⚠️ **Not production-ready yet**, but already usable and actively evolving.

Already implemented:

- ✔ File-based routing with automatic glob scanning
- ✔ SSR via Hono JSX renderer
- ✔ Hydration + SPA navigation via Nano Stores
- ✔ Auto-generated routing code (`runtime-client` + `runtime-hono`)
- ✔ Meta API via `.meta` on route components
- ✔ Dev playground included
- ✔ Monorepo structure ready for scaling
- ✔ Typed `createComponent()` layer for DX
- ✔ **Auto-generated Nanoquery API client** from Hono `server/api.ts`
- ✔ Vite plugin that watches `src/routes` **and** `src/server` and regenerates `.buna/*` files

---

## 📁 File-based Routing

Routes are scanned using Vite glob imports and compiled into generated files:

```txt
.buna/
  ↳ client-routes.generated.ts
  ↳ server-routes.generated.tsx
  ↳ query.generated.ts        // auto-generated API client

🔹 client-routes.generated.ts (runtime-client)

import { createRouterConfigFromGlob } from '@buna/router/runtime-client';

const files = import.meta.glob('/src/routes/**/*.{tsx,jsx,mdx}', {
  eager: true,
});

export const config = createRouterConfigFromGlob(files, {
  routesBase: '/src/routes',
});

export const routes = config.routes;
export const routeComponents = config.routeComponents;
export const routesMeta = config.routesMeta;
export const directoryLayers = config.directoryLayers;
export const directoryOrder = config.directoryOrder;
export const $router = config.$router;
export type RoutingKeys = keyof typeof routeComponents;

🔹 server-routes.generated.tsx (runtime-hono)

import { createHonoAppFromGlob } from '@buna/router/runtime-hono';

const files = import.meta.glob('/src/routes/**/*.{tsx,jsx,mdx}', {
  eager: true,
});

const config = createHonoAppFromGlob(files, { routesBase: '/src/routes' });

export const honoRoutesMeta = config.routesMeta;
export const honoDirectoryLayers = config.directoryLayers;
export const honoDirectoryOrder = config.directoryOrder;
export default config.app;


⸻

🔌 Vite Plugin — Routing + API Client Generation

The buna() Vite plugin is responsible for:
	•	scanning your routes directory (default: src/routes)
	•	scanning your server directory (default: src/server)
	•	generating:

.buna/client-routes.generated.ts
.buna/server-routes.generated.tsx
.buna/query.generated.ts


	•	and watching both routesDir and serverDir:
	•	whenever a .ts/.tsx/.js/.jsx file changes in src/routes or src/server,
	•	all .buna/* generated files are regenerated.

Typical usage (via @buna/config) assumes a structure like:

apps/playground/
  src/
    routes/
    server/
      api.ts     // Hono API entry (scanned by the plugin)
      index.tsx  // main Hono + SSR app

The plugin is configured roughly like this:

buna({
  routesDir: 'src/routes',
  serverDir: 'src/server',
  apiFile: 'src/server/api.ts',
  apiBasePath: '/api',
  outputClient: '.buna/client-routes.generated.ts',
  outputHono: '.buna/server-routes.generated.tsx',
  outputQuery: '.buna/query.generated.ts',
});


⸻

🧩 Route Components + Meta API

Routes are built using createComponent() with full typing + optional .meta for SEO and SSR.

import { createComponent } from '@buna/router';
import { useState } from 'hono/jsx';

type AboutParams = {};
type AboutSearch = {};

const AboutPage = createComponent<AboutParams, AboutSearch>(
  ({ params, search, hash, c }) => {
    const [showDebug, setShowDebug] = useState(false);

    return (
      <main className="min-h-screen bg-[#0d0d0d] text-slate-100 flex items-center justify-center px-6">
        {/* ... */}
      </main>
    );
  },
);

AboutPage.meta = ({ params }) => {
  return {
    title: 'About – Buna Playground',
    description: 'Learn more about the Buna framework and playground.',
    keywords: ['buna', 'framework', 'about'],
  };
};

export default AboutPage;

The createComponent helper injects:
	•	c: Hono Context
	•	params: route params (from URL)
	•	search: parsed querystring object
	•	hash: URL hash
	•	plus any extra props you define via generics.

⸻

⚡ SSR + Hydration + SPA Mode
	•	The server renders full HTML via Hono + JSX.
	•	The client bootstraps a Nano Stores router and turns the app into SPA mode.
	•	Routing is store-driven (@nanostores/router) — no React Router required.
	•	Supports MDX, JSX, TSX routes.

import { createComponent } from '@buna/router';

export default createComponent<{ id: string }>((props) => {
  return <h1>Post {props.params.id}</h1>;
});


⸻

🌐 Auto-generated API Client (Hono + Nanoquery)

The plugin also scans your Hono API entry file (default src/server/api.ts) and generates a typed-ish Nanoquery client in .buna/query.generated.ts.

Example Hono API

// src/server/api.ts
import { Hono } from 'hono';

const api = new Hono();

api.get('/posts', async (c) => {
  // ...
  return c.json([{ id: 1, title: 'Hello' }]);
});

api.get('/posts/:id', async (c) => {
  const id = c.req.param('id');
  return c.json({ id, title: 'Post ' + id });
});

api.post('/posts', async (c) => {
  const body = await c.req.json();
  // create post...
  return c.json({ ok: true });
});

export default api;

Mounted under /api in your main server:

// src/server/index.tsx
import { Hono } from 'hono';
import api from './api';
import { withSSR } from '@buna/router';
import { config as router } from '#router';

const app = new Hono();

// ... jsxRenderer, head, etc.

// Mount API under /api
app.route('/api', api);

export default withSSR(app, { router });

Generated client: .buna/query.generated.ts

The plugin turns those routes into a structured api object backed by @nanostores/query:

// .buna/query.generated.ts
// AUTO-GENERATED BY buna-plugin. DO NOT EDIT.
import { createFetcherStore, createMutatorStore } from '@buna/router/query';

export const api = {
  posts: {
    // GET /api/posts
    list: createFetcherStore<any>(['GET', '/api/posts']),

    // GET /api/posts/:id
    byId(id: string) {
      const path = `/api/posts/${id}`;
      return createFetcherStore<any>(['GET', path]);
    },

    // POST /api/posts
    create: createMutatorStore<any>(async ({ data, revalidate }) => {
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: data ? JSON.stringify(data) : undefined,
      });

      // revalidate all queries touching /api/posts
      revalidate((key) => typeof key === 'string' && key.includes('/api/posts'));
    }),
  },
} as const;

export type ApiClient = typeof api;

You typically alias this file in tsconfig/Vite:

{
  "compilerOptions": {
    "paths": {
      "#api": [".buna/query.generated.ts"]
    }
  }
}

So you can:

import { api } from '#api';


⸻

🔄 Data Fetching with Nanoquery

Buna uses @nanostores/query (Nanoquery) as the core data-fetching layer.
@buna/router/query exports:
	•	createRouteQuery (for future route-bound helpers)
	•	createFetcherStore, createMutatorStore
	•	a shared Nanoquery context (with invalidateKeys, revalidateKeys, mutateCache)

The generated api client is purely Nanoquery-based. The fetcher context is defined once in the router layer and used everywhere.

Consuming API in a route component

// src/routes/posts/[id].tsx
import { createComponent } from '@buna/router';
import { useState, useEffect } from 'hono/jsx';
import { useStore } from '@buna/react'; // thin wrapper around Nano Stores for Hono JSX
import { api } from '#api';

type Params = { id: string };

export default createComponent<Params>(({ params }) => {
  // Nanoquery store for this post
  const $post = api.posts.byId(params.id);

  const { data, loading, error } = useStore($post as any);

  if (loading && !data) return <p>Loading…</p>;
  if (error) return <p>Error: {String(error)}</p>;
  if (!data) return <p>No data</p>;

  return (
    <article>
      <h1>{data.title ?? data.id}</h1>
      <p>{data.body ?? JSON.stringify(data)}</p>
    </article>
  );
});

Creating and invalidating via mutation

// src/routes/posts/new.tsx
import { createComponent } from '@buna/router';
import { useStore } from '@buna/react';
import { api } from '#api';

export default createComponent(() => {
  const mutationStore = api.posts.create;
  const { mutate, loading, error } = useStore(mutationStore as any);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    await mutate({ title: 'Hello', body: 'World' });
  }

  return (
    <form onSubmit={handleSubmit as any}>
      <button disabled={loading}>Create</button>
      {error && <p>Error: {String(error)}</p>}
    </form>
  );
});

Data is always consumed via Nano Stores / Nanoquery, which:
	•	works on SSR
	•	can be hydrated/cached later
	•	keeps fetch logic outside of components

⸻

🧠 Core Stack Philosophy

Purpose	Library / Layer
Server runtime	Hono
Build & dev	Vite
Routing	@nanostores/router
State management	Nano Stores family
SSR framework	Hono JSX renderer
Persistent state	@nanostores/persistent
Query caching	@nanostores/query
File-based routing code	@buna/router + plugin
API client generation	buna Vite plugin + Nanoquery

Buna treats Nano Stores as its runtime, not just a library.

⸻

🧠 Roadmap (MVP Requirements)

Feature	Description	Status	Priority
Root shell detection	src/shell.tsx convention	🧠 Planned	🟥 High
Nested layouts	Folder-based layouts	🧠 Planned	🟥 High
Nanoquery API client generation	From Hono server/api.ts routes	✔ MVP	🟥 High
Route-aware query helpers	Helpers that bind params/search to Nanoquery	🚧 In progress	🟥 High
DevTools	Nano Stores + Router + Query debugging	🧠 Planned	🟥 High
useRouteParams(), useRouteSearch()	Convenience hooks for params/search	🧠 Planned	🟨 Medium
CLI create-buna-app	Project bootstrapper	🧠 Planned	🟩 Low
Vite preset	Zero-config plugin	🧠 Planned	🟩 Low

Legend:
🟥 High → Needed for MVP
🟨 Medium → DX improvements
🟩 Low → Post-MVP

⸻

🔬 Planned: DevTools

Similar to Nuxt / React Query Devtools:
	•	Visual router inspector
	•	Inspect Nano Stores in real time
	•	Inspect Nanoquery cache (per key/route)
	•	SSR/CSR hydration timing logs
	•	Hot-reload route preview

Very likely format:

{
  import.meta.env.DEV && <BunaDevTools />;
}


⸻

🎯 Vision

What if Next.js had been built directly for Cloudflare Workers —
using Nano Stores as its runtime instead of React Router?

Buna explores that idea:
	•	Tiny runtime
	•	Predictable store semantics
	•	File-based routing mental model
	•	Edge-ready architecture
	•	Auto-generated API client + query layer
	•	Future DevTools / DX ecosystem

⸻

📜 License

MIT (planned)

⸻

Made with ❤️ using Hono, Nano Stores and TypeScript.

```
