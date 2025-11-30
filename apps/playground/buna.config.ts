import { defineConfig } from '@buna/config'
import { cloudflare } from "@cloudflare/vite-plugin";
import build from '@hono/vite-build/node'
import ssrPlugin from "vite-ssr-components/plugin";
import tailwindcss from "@tailwindcss/vite";



export default defineConfig({
  vite: {
    plugins: [
      cloudflare(),
      ssrPlugin(),
      tailwindcss(),
    ]
  }
})
