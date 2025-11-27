import { defineConfig } from 'vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import ssrPlugin from 'vite-ssr-components/plugin'
import tailwindcss from '@tailwindcss/vite'
import { buna } from '@buna/vite-plugin'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [cloudflare(), ssrPlugin(), tailwindcss(), buna()],
  resolve: {
    alias: {
      '#router': resolve(__dirname, '.buna/client-routes.generated.ts'),
      '#hono-app': resolve(__dirname, '.buna/hono-routes.generated.tsx'),
      '@': resolve(__dirname, 'src')
    },
  },
})
