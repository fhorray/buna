# Buna – File-based Full-stack Framework

_Buna is an experimental framework built on top of **Hono + Vite + Nano Stores**.  
It aims to provide a **Next.js-like developer experience**, but fully optimized for lightweight runtimes and Cloudflare Workers._

---

## 🚩 Current Status

This is **not production-ready yet**, but it already contains a strong foundation:
✔ File-based routing  
✔ SSR with Hono JSX  
✔ Nano Stores as the runtime  
✔ Hydration and SPA mode  
✔ Vite plugin for auto-route generation  
✔ Monorepo structure ready for scalability  

---

## ✨ Features Already Implemented

### 🔄 File-Based Routing (Next.js style)
| Route file | URL generated |
|------------|----------------|
| `src/routes/index.tsx` | `/` |
| `src/routes/about.tsx` | `/about` |
| `src/routes/posts/[id].tsx` | `/posts/:id` |
| `src/routes/_not-found.tsx` | fallback |

Routing is scanned and compiled into:
```
.buna/client-routes.generated.ts
.buna/hono-routes.generated.tsx
```

Containing:
```ts
export const routes = { ... }
export const routeComponents = { ... }
export const $router = createRouter(routes)
```

---

### ⚡ SSR + Hydration

- Uses `jsxRenderer()` from Hono.
- Server renders full HTML.
- Client hydrates and turns into SPA (Nano Stores router).
- Works similar to Next.js pages, but **powered by Nano Stores instead of React Router**.

---

### 🧩 Monorepo Architecture

```
apps/
  playground/        ← Example Buna app
packages/
  buna-router/       ← Core types + router helpers
  buna-plugin/       ← Vite route scanner
```

---

## 🧠 Stack Philosophy

| Feature | Library |
|--------|---------|
| Server | `Hono` |
| Bundler | `Vite` |
| Routing | `@nanostores/router` |
| State | `nanostores` |
| Persistent state | `@nanostores/persistent` |
| Data fetching cache | `@nanostores/query` |
| React binding | `@nanostores/react` |

> **Buna doesn’t just use Nano Stores — it treats the entire Nano Stores family as the official runtime of the framework.**

---

## 📌 Planned Features (Roadmap)

### 🧠 Official Roadmap Table

| Feature | Description | Status | Priority |
|--------|-------------|--------|----------|
| `loaderQuery()` | SSR data fetching with hydration cache | 🚧 In progress | 🟥 High |
| `_app.tsx` | Global wrapper for all pages | 🚧 In progress | 🟥 High |
| `_layout.tsx` (per folder) | Nested layouts like Next.js | 🚧 In progress | 🟥 High |
| `createRouteQuery()` | Nano Stores query API for routes | 🧠 Planned | 🟥 High |
| `useRouteParams()` hook | Client-side params hook | 🧠 Planned | 🟨 Medium |
| `useRouteSearch()` hook | Client-side search params | 🧠 Planned | 🟨 Medium |
| `createAppAtom()` | Official global store API | 🧠 Planned | 🟨 Medium |
| `createPersistentMap()` | Official persistent state API | 🧠 Planned | 🟨 Medium |
| CLI `create-buna-app` | Project generator | 🧠 Planned | 🟩 Low |
| Vite preset | Auto-config for alias + plugin + hono | 🧠 Planned | 🟩 Low |
| Cloudflare deploy preset | `buna deploy` (wrapper for wrangler) | 🧠 Planned | 🟩 Low |
| Tests for route scanner | Snapshot coverage of plugin | 🧠 Planned | 🟨 Medium |
| Type-safe `RoutingKeys` | Autocomplete for router.navigate | ✔ Done | — |

Color meaning:
- 🟥 **High priority** → Required for MVP  
- 🟨 **Medium** → DX improvements  
- 🟩 **Low** → Nice to have / after MVP  

---

## 🧪 Example – Route Query (Upcoming Feature)

```ts
// src/routes/posts/[id].tsx
import { createRouteComponent } from '@buna/router'
import { createRouteQuery } from '@buna/router/query'

// SSR + CSR cache powered by nanostores/query
export const loaderQuery = createRouteQuery(async ({ params }) => {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts/' + params.id)
  return { post: await res.json() }
})

export default createRouteComponent(({ data }) => {
  return (
    <article>
      <h1>{data.post.title}</h1>
      <p>{data.post.body}</p>
    </article>
  )
})
```

---

## 🚀 Vision

> _“What if Next.js had been written for Cloudflare Workers and  
> Nano Stores had been its core runtime?”_

That’s the goal of Buna:
- Simple mental model
- Tiny runtime
- Predictable data layer
- Fully edge-ready
- Powered by Nano Stores

---

## 📃 License

MIT (planned)

---

Made with ❤️ using Hono, Nano Stores and TypeScript.
