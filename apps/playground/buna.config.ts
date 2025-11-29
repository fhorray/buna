import { defineConfig } from '@buna/config'
import { cloudflare } from "@cloudflare/vite-plugin";



export default defineConfig({
  vite: {
    plugins: [
      cloudflare(),
    ]
  }
})
