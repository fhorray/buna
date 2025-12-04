import { serve } from "bun";
import { routes } from "#buna/routes.generated";
import { handleRequest } from "bunax/runtime";
import config from "@/buna.config"

const server = serve({
  routes,
  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
  fetch(req, server) {
    const env: any = {};
    const ctx = { waitUntil: (_p: Promise<any>) => { } };
    return handleRequest(req, env, ctx, config);
  },
});

console.log(`🚀 Server running at ${server.url}`);
