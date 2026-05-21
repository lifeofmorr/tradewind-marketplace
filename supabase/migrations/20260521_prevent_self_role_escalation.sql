-- ─────────────────────────────────────────────────────────────────────────────
-- Prevent self role escalation on profiles
--
-- The profiles_update_own_or_admin RLS policy lets users update their own row.
-- Without a column-level guard, a signed-in non-admin could PATCH profiles
-- and set their own role to 'admin' (or banned=false, etc).
--
-- This trigger blocks any change to the protected admin-controlled columns
-- (role, banned, verification_level) unless the caller is already an admin.
-- The admin check uses public.is_admin(), which evaluates against the row's
-- OLD state at the time the trigger fires — so a non-admin trying to flip
-- themselves to admin will see is_admin() = false and be rejected.
-- ─────────────────────────────────────────────────────────────────────────────

BEGIN;

CREATE OR REPLACE FUNCTION public.profiles_guard_admin_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Service-role (no JWT) bypasses RLS already, so auth.uid() is null there —
  -- treat that as a trusted server-side update and let it through.
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  -- Admins may modify these fields on any row (including their own).
  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  -- Non-admin caller — reject if any protected column is being changed.
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'role changes require admin'
      USING ERRCODE = '42501';
  END IF;
  IF NEW.banned IS DISTINCT FROM OLD.banned THEN
    RAISE EXCEPTION 'banned changes require admin'
      USING ERRCODE = '42501';
  END IF;
  IF NEW.verification_level IS DISTINCT FROM OLD.verification_level THEN
    RAISE EXCEPTION 'verification_level changes require admin'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_guard_admin_fields ON public.profiles;
CREATE TRIGGER trg_profiles_guard_admin_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.profiles_guard_admin_fields();

COMMIT;
