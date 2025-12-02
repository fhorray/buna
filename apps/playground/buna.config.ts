import { defineConfig } from "buna";
import { routes } from "./.buna/routes.generated";

export default defineConfig({
  routesDir: "src/routes",
  outDir: ".buna",
  routes
})