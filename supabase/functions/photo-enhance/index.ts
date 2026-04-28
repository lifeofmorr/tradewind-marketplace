// POST /functions/v1/photo-enhance
// Body: { url: string, hints?: { isBoat?: boolean } }
// Returns: { url: string, enhancements: string[], _meta: { provider: string } }
//
// Phase 2E placeholder. Real impl will run auto-crop + horizon-leveling +
// HDR boost in a downstream worker (or wrap a Replicate / Modal job).
//
// For now we:
//   1. Verify the URL points at an image we can fetch.
//   2. Return the same URL with a list of "enhancements that would have run".
//
// This lets the client wire the Enhance button + show feedback today; we can
// drop in a real pipeline later without changing the contract.

import { handleOptions, jsonResponse, errorResponse } from "../_shared/cors.ts";

interface Body {
  url: string;
  hints?: { isBoat?: boolean };
}

Deno.serve(async (req: Request) => {
  const pre = handleOptions(req); if (pre) return pre;
  if (req.method !== "POST") return errorResponse("POST only", 405);
  let body: Body;
  try { body = await req.json() as Body; } catch { return errorResponse("Invalid JSON"); }
  if (!body.url) return errorResponse("url required");

  // Sanity check the URL: HEAD it and confirm Content-Type is image/*.
  let headOk = true;
  let contentType = "image/unknown";
  try {
    const head = await fetch(body.url, { method: "HEAD" });
    headOk = head.ok;
    contentType = head.headers.get("content-type") ?? contentType;
  } catch (e) {
    return errorResponse(`fetch failed: ${(e as Error).message}`, 400);
  }
  if (!headOk) return errorResponse(`HEAD ${body.url} not OK`, 400);
  if (!contentType.startsWith("image/")) {
    return errorResponse(`expected image/*, got ${contentType}`, 400);
  }

  // Sketch of the would-be pipeline. The real implementation lives behind the
  // same response shape, so the client doesn't change.
  const enhancements: string[] = [
    "auto-crop",
    "horizon-leveling",
    "exposure-balance",
    "color-correction",
  ];
  if (body.hints?.isBoat) enhancements.push("waterline-cleanup");

  return jsonResponse({
    url: body.url,
    enhancements,
    _meta: {
      provider: "placeholder",
      content_type: contentType,
      note: "Phase 2E placeholder — real pipeline lands in a follow-up.",
    },
  });
});
