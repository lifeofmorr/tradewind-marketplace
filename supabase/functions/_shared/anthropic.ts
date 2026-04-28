// Anthropic Claude (claude-sonnet-4-6) wrapper with OpenAI fallback.
// Set ANTHROPIC_API_KEY in supabase secrets; OPENAI_API_KEY is optional.
//
// Usage:
//   const text = await callLLM({
//     system: "You are a TradeWind listing writer.",
//     user: "Write a description for a 2022 Boston Whaler 320.",
//     maxTokens: 800,
//     responseFormat: "json",   // optional — forces JSON-only output
//   });

const ANTHROPIC_MODEL = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-sonnet-4-6";
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
const ANTHROPIC_VERSION = "2023-06-01";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") ?? "";
const OPENAI_MODEL = Deno.env.get("OPENAI_FALLBACK_MODEL") ?? "gpt-4o-mini";

export interface LLMArgs {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
  responseFormat?: "text" | "json";
}

export interface LLMResult {
  text: string;
  provider: "anthropic" | "openai";
  model: string;
  inputTokens: number;
  outputTokens: number;
}

export async function callLLM(args: LLMArgs): Promise<LLMResult> {
  if (ANTHROPIC_API_KEY) {
    try {
      return await callAnthropic(args);
    } catch (err) {
      console.warn("[llm] anthropic failed, falling back:", (err as Error).message);
      if (!OPENAI_API_KEY) throw err;
    }
  }
  if (!OPENAI_API_KEY) {
    throw new Error("No LLM API key configured (ANTHROPIC_API_KEY or OPENAI_API_KEY).");
  }
  return await callOpenAI(args);
}

async function callAnthropic(args: LLMArgs): Promise<LLMResult> {
  const body = {
    model: ANTHROPIC_MODEL,
    max_tokens: args.maxTokens ?? 1024,
    temperature: args.temperature ?? 0.4,
    system: args.responseFormat === "json"
      ? `${args.system}\n\nRespond with ONLY valid JSON. No prose, no code fences.`
      : args.system,
    messages: [{ role: "user", content: args.user }],
  };
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": ANTHROPIC_VERSION,
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const errText = await r.text();
    throw new Error(`anthropic ${r.status}: ${errText}`);
  }
  const data = await r.json() as {
    content?: { type: string; text: string }[];
    usage?: { input_tokens: number; output_tokens: number };
    model?: string;
  };
  const text = (data.content ?? []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
  return {
    text,
    provider: "anthropic",
    model: data.model ?? ANTHROPIC_MODEL,
    inputTokens: data.usage?.input_tokens ?? 0,
    outputTokens: data.usage?.output_tokens ?? 0,
  };
}

async function callOpenAI(args: LLMArgs): Promise<LLMResult> {
  const body: Record<string, unknown> = {
    model: OPENAI_MODEL,
    max_tokens: args.maxTokens ?? 1024,
    temperature: args.temperature ?? 0.4,
    messages: [
      { role: "system", content: args.system },
      { role: "user", content: args.user },
    ],
  };
  if (args.responseFormat === "json") {
    body.response_format = { type: "json_object" };
  }
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const errText = await r.text();
    throw new Error(`openai ${r.status}: ${errText}`);
  }
  const data = await r.json() as {
    choices?: { message?: { content?: string } }[];
    usage?: { prompt_tokens: number; completion_tokens: number };
    model?: string;
  };
  const text = data.choices?.[0]?.message?.content?.trim() ?? "";
  return {
    text,
    provider: "openai",
    model: data.model ?? OPENAI_MODEL,
    inputTokens: data.usage?.prompt_tokens ?? 0,
    outputTokens: data.usage?.completion_tokens ?? 0,
  };
}

/** Best-effort JSON parse — strips ``` fences if the model added any. */
export function parseJSON<T>(text: string): T {
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "").trim();
  return JSON.parse(cleaned) as T;
}
