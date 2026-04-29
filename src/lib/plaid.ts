/**
 * Plaid client-side adapter. Real link-token / public-token exchange happens
 * via a Supabase edge function (not implemented yet — this module describes
 * the interface and provides a sandbox fallback so the UI can be built end
 * to end without live Plaid credentials).
 *
 * Required env once Plaid is wired:
 *   PLAID_CLIENT_ID  (server)
 *   PLAID_SECRET     (server)
 *   PLAID_ENV        (server, sandbox|development|production)
 */

const PLAID_CLIENT_ID = import.meta.env.VITE_PLAID_CLIENT_ID ?? "";
const SANDBOX = (import.meta.env.VITE_PLAID_SANDBOX ?? "true") === "true";

export interface PlaidLinkToken {
  link_token: string;
  expiration: string;
  sandbox: boolean;
}

export interface PlaidPublicTokenExchange {
  access_token: string;
  item_id: string;
  sandbox: boolean;
}

export function isPlaidConfigured(): boolean {
  return PLAID_CLIENT_ID.length > 0;
}

export function isPlaidSandbox(): boolean {
  return SANDBOX || !isPlaidConfigured();
}

/** Stub: in production this calls an edge function that talks to Plaid. */
export async function createLinkToken(userId: string): Promise<PlaidLinkToken> {
  if (isPlaidSandbox()) {
    return {
      link_token: `sandbox-link-${userId}-${Date.now()}`,
      expiration: new Date(Date.now() + 30 * 60_000).toISOString(),
      sandbox: true,
    };
  }
  throw new Error("Plaid live mode not yet wired — set VITE_PLAID_CLIENT_ID and implement edge function.");
}

export async function exchangePublicToken(publicToken: string): Promise<PlaidPublicTokenExchange> {
  if (isPlaidSandbox()) {
    return {
      access_token: `sandbox-access-${publicToken}`,
      item_id: `sandbox-item-${Date.now()}`,
      sandbox: true,
    };
  }
  throw new Error("Plaid live mode not yet wired.");
}
