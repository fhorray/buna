import { defineConfig } from '@buna/config'
import tailwindcss from "@tailwindcss/vite";


export default defineConfig({
  routes: {
    dir: "app",
  },
  vite: {
    plugins: [tailwindcss()]
  }
})
