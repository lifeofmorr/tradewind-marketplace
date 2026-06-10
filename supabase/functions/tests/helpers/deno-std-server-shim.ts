// Vitest stand-in for https://deno.land/std@0.168.0/http/server.ts.
// Instead of starting a server, `serve` registers the handler so tests can
// drive it with synthetic Request objects (see edge-harness.ts).

export type EdgeHandler = (req: Request) => Response | Promise<Response>;

export function serve(handler: EdgeHandler): void {
  (globalThis as { __capturedEdgeHandler?: EdgeHandler }).__capturedEdgeHandler = handler;
}
