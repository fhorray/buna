# buna()

**buna()** is an experimental framework inspired by **Next.js**, **Nuxt** and others frameworks, built on top of:

- ⚡ **Hono** (edge-first server, Cloudflare Workers ready)
- ⚛️ **React / Hono JSX**
- 🚀 **Vite** (bundling + dev server)
- 🧠 **Nano Stores** (state management + router)
- 📁 **File-based routing** (`apps/playground/src/routes/**`)

> The goal: provide a minimal DX layer — like Next.js — without hiding the power of Hono, Cloudflare Workers, and React.

---

## ✨ Features (current)

| Feature                           | Status     | Notes                                    |
| --------------------------------- | ---------- | ---------------------------------------- |
| File-based routing                | ✔️ Working | `[id].tsx` and folders already supported |
| SSR with React                    | ✔️ Working | Hono + Vite SSR integration              |
| Client hydration                  | ✔️ Working | Uses `hydrateRoot()`                     |
| Nano Stores Router                | ✔️ Working | SPA navigation support                   |
| Custom Vite Plugin (`buna()`)     | ✔️ Working | Generates `.buna/*` files automatically  |
| Not found page (`_not-found.tsx`) | ✔️ Working | Used manually on server and client       |
| Cloudflare Workers deploy         | ✔️ Working | `wrangler` setup included                |

---

## 📦 Project Structure

```
apps/playground/
 ├─ src/                    # playground source
 │   ├─ routes/             # file-based routes (path customizable)
 │   │   ├─ index.tsx
 │   │   ├─ about.tsx
 │   │   └─ posts/
 │   │       └─ [id].tsx
 │   ├─ client.tsx          # client hydration
 │   ├─ index.tsx           # Hono + SSR entry
 │   └─ renderer.tsx        # HTML template
 ├─ public/                 # static assets
 └─ .buna/                  # generated automatically
packages/
 ├─ buna-plugin/            # Vite plugin (route generation)
 └─ buna-router/            # type helper for routes
```

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start dev server (Vite + SSR)
npm run dev

# Preview build output
npm run preview

# Deploy to Cloudflare Workers
npm run deploy
```

---

## 🧠 File-based Routing

Any file inside `apps/playground/src/routes/**` becomes a route automatically.

| Filename             | Route generated         |
| -------------------- | ----------------------- |
| `index.tsx`          | `/`                     |
| `about.tsx`          | `/about`                |
| `posts/[id].tsx`     | `/posts/:id`            |
| `blog/[...slug].tsx` | `/blog/*` (coming soon) |

Example route:

```tsx
// apps/playground/src/routes/about.tsx
import { createRouteComponent } from '@buna/router';

export default createRouteComponent(() => {
  return <h1>About Page</h1>;
});
```

---

## 🔥 Server Rendering (Hono + React)

`apps/playground/src/index.tsx` handles **matching**, **rendering** and **passing props** to pages:

```tsx
return c.render(
  <Component c={c} params={match.params} search={search} hash={hash} />,
);
```

On the client, we hydrate using:

```tsx
hydrateRoot(container, <ClientRouter />);
```

---

## 🧪 Loader API (experimental — not implemented yet)

```tsx
export const loader = async ({ c, params, search }) => {
  const post = await c.env.DB.getPost(params.id);
  return { post };
};

export default createRouteComponent<{ id: string }, { post: Post }>(
  ({ data }) => {
    return <h1>{data.post.title}</h1>;
  },
);
```

**Planned features:**

| Feature                                  | Status     |
| ---------------------------------------- | ---------- |
| `loader()` per route                     | 🔜 planned |
| API routes via `apps/playground/src/routes/api/*.ts`     | 🔜 planned |
| Layouts (`_layout.tsx`)                  | 🔜 planned |
| `_app.tsx` global wrapper                | 🔜 planned |
| SSG / ISR (`export const prerender`)     | 🔜 planned |
| Route metadata (`export const metadata`) | 🔜 planned |
| CLI (`npx create-buna-app`)              | 🔜 planned |

---

## 🧠 Why buna()?

> Instead of hiding the server like Next.js,
> buna() tries to _embrace_ Hono and Cloudflare Workers.
>
> It should feel like a “framework” — **without losing the control**.

---

## 🗺️ Roadmap

- Loader API + data hydration
- API routes (`apps/playground/src/routes/api/`)
- Layout system per folder
- Global `_app.tsx` support
- Static site generation (SSG)
- Route metadata (`export const metadata`)
- CLI scaffolding

---

## 🧾 License

MIT — use freely, improve it, break it, rebuild it. PRs welcome!

---

**buna() — a tiny spark toward a next-generation edge framework.**
