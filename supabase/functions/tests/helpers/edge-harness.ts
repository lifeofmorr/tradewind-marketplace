// Harness for unit-testing Deno edge functions under vitest (Node).
//
// The functions are written against two Deno runtime surfaces:
//   1. `Deno.env.get(...)` / `Deno.serve(handler)` — stubbed here via a
//      `Deno` global installed *before* the module is imported (the modules
//      read env and register their handler at import time).
//   2. URL imports (deno.land std `serve`, esm.sh supabase-js) — re-mapped in
//      vite.config.ts `test.alias` to local shims / the real npm package.
//
// All outbound traffic (Supabase REST/Auth, Anthropic, OpenAI, Resend, NHTSA,
// Plaid, internal function-to-function calls) goes through global `fetch`,
// which tests replace with `installFetchMock`.

import { vi } from "vitest";

export type EdgeHandler = (req: Request) => Response | Promise<Response>;

interface CapturedGlobal {
  __capturedEdgeHandler?: EdgeHandler;
  Deno?: unknown;
}

/** Install a minimal `Deno` global backed by the given env map. */
export function installDeno(env: Record<string, string | undefined>): void {
  (globalThis as CapturedGlobal).Deno = {
    env: { get: (name: string) => env[name] },
    serve: (handler: EdgeHandler) => {
      (globalThis as CapturedGlobal).__capturedEdgeHandler = handler;
    },
  };
}

/**
 * Load an edge function module fresh (module registry reset so module-level
 * env reads see `env`) and return the handler it registered.
 *
 * Usage:  const handler = await loadEdgeFunction(env, () => import("../foo/index.ts"));
 */
export async function loadEdgeFunction(
  env: Record<string, string | undefined>,
  importer: () => Promise<unknown>,
): Promise<EdgeHandler> {
  vi.resetModules();
  delete (globalThis as CapturedGlobal).__capturedEdgeHandler;
  installDeno(env);
  await importer();
  const handler = (globalThis as CapturedGlobal).__capturedEdgeHandler;
  if (!handler) throw new Error("edge function module did not register a handler");
  return handler;
}

export interface FetchCall {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: unknown;
}

export type RouteResponder = (call: FetchCall) => Response | Promise<Response> | undefined;

export interface FetchMock {
  calls: FetchCall[];
  /** Calls whose URL contains the given fragment. */
  to(fragment: string): FetchCall[];
}

/**
 * Replace global fetch with a router. Responders are tried in order; the
 * first that returns a Response wins. Unmatched requests throw so tests
 * never silently hit the network.
 */
export function installFetchMock(...responders: RouteResponder[]): FetchMock {
  const calls: FetchCall[] = [];
  const impl = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    let url: string;
    let method: string;
    let headers: Record<string, string> = {};
    let rawBody: unknown;
    if (input instanceof Request) {
      url = input.url;
      method = input.method;
      input.headers.forEach((v, k) => { headers[k.toLowerCase()] = v; });
      rawBody = input.body ? await input.clone().text() : undefined;
    } else {
      url = String(input);
      method = init?.method ?? "GET";
      headers = Object.fromEntries(
        Object.entries((init?.headers as Record<string, string>) ?? {}).map(([k, v]) => [k.toLowerCase(), String(v)]),
      );
      rawBody = init?.body;
    }
    let body: unknown = rawBody;
    if (typeof rawBody === "string") {
      try { body = JSON.parse(rawBody); } catch { body = rawBody; }
    }
    const call: FetchCall = { url, method, headers, body };
    calls.push(call);
    for (const responder of responders) {
      const res = await responder(call);
      if (res) return res;
    }
    throw new Error(`unexpected fetch in test: ${method} ${url}`);
  };
  vi.stubGlobal("fetch", impl);
  return {
    calls,
    to(fragment: string) {
      return calls.filter((c) => c.url.includes(fragment));
    },
  };
}

export function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

/** Anthropic /v1/messages response with the given completion text. */
export function anthropicResponse(text: string): Response {
  return json({
    content: [{ type: "text", text }],
    usage: { input_tokens: 11, output_tokens: 22 },
    model: "claude-sonnet-4-6",
  });
}

/** Responder serving the Anthropic API. Pass the text the model should "say". */
export function anthropicRoute(text: string | (() => string)): RouteResponder {
  return (call) =>
    call.url.startsWith("https://api.anthropic.com/")
      ? anthropicResponse(typeof text === "function" ? text() : text)
      : undefined;
}

/** Responder for the rate-limit RPC. */
export function rateLimitRoute(allowed = true, retryAfter = 0): RouteResponder {
  return (call) =>
    call.url.includes("/rest/v1/rpc/edge_rate_limit_hit")
      ? json([{ allowed, remaining: allowed ? 5 : 0, retry_after: retryAfter }])
      : undefined;
}

/** Responder for Supabase Auth user lookup (`/auth/v1/user`). */
export function authUserRoute(user: { id: string; email?: string } | null): RouteResponder {
  return (call) => {
    if (!call.url.includes("/auth/v1/user")) return undefined;
    return user ? json(user) : new Response("unauthorized", { status: 401 });
  };
}

export const SUPA_URL = "https://unit.supabase.test";

/** Baseline env most functions need. */
export function baseEnv(extra: Record<string, string | undefined> = {}): Record<string, string | undefined> {
  return {
    SUPABASE_URL: SUPA_URL,
    SUPABASE_ANON_KEY: "anon-unit-key",
    SUPABASE_SERVICE_ROLE_KEY: "service-role-unit-key",
    ANTHROPIC_API_KEY: "sk-ant-unit",
    APP_URL: "https://gotradewind.com",
    ...extra,
  };
}
