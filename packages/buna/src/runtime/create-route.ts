import { createRoot } from "react-dom/client";
import type { ReactNode } from "react";

// This type defines what a route component must look like.
export type RouteComponent = () => ReactNode;

/**
 * createRoute
 * -----------
 * Wraps a user component to provide automatic client-side bootstrapping.
 *
 * - Returns the component untouched (so Bun's HTML bundler can use it).
 * - But ALSO, when running in the browser, auto-mounts it into #root.
 */
export function createRoute<T extends RouteComponent>(Component: T): T {
  // Client-side hydration / rendering
  if (typeof document !== "undefined") {
    const container = document.getElementById("root");
    if (container) {
      const root = createRoot(container);
      root.render(Component()); // <Component />
    }
  }

  // Important: return the component as-is
  return Component;
}