import { supabase } from "@/lib/supabase";

interface AuditEvent {
  actorId: string | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Append a row to public.audit_logs. Best-effort: failures are logged to the
 * console but never thrown — audit logging must not block admin workflows.
 * RLS allows insert for any authenticated session; reads are admin-only.
 */
export async function logAuditEvent(event: AuditEvent): Promise<void> {
  try {
    const { error } = await supabase.from("audit_logs").insert({
      actor_id: event.actorId,
      action: event.action,
      target_type: event.targetType ?? null,
      target_id: event.targetId ?? null,
      metadata: event.metadata ?? {},
    });
    if (error) console.warn("[audit] insert failed:", error.message);
  } catch (e) {
    console.warn("[audit] unexpected error:", (e as Error).message);
  }
}
