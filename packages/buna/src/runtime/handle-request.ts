import type { BunaEnv, BunaExecutionContext } from "./types";

export async function handleRequest(
  request: Request,
  env: BunaEnv,
  ctx: BunaExecutionContext
): Promise<Response> {
  const url = new URL(request.url);

  // Temporary logic: basic routing by path
  if (url.pathname === "/api/ping") {
    return Response.json({ message: "pong from buna runtime" });
  }

  // Fallback for now
  return new Response("Not Found", { status: 404 });
}