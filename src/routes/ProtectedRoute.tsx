import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/types/database";

interface Props {
  roles?: UserRole[];
  redirectTo?: string;
}

export default function ProtectedRoute({ roles, redirectTo = "/login" }: Props) {
  const { loading, user, role, profile } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-xs font-mono uppercase tracking-[0.32em] text-muted-foreground">loading…</div>
      </div>
    );
  }
  if (!user) {
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />;
  }
  if (profile?.banned) {
    return <Navigate to="/" replace />;
  }
  if (roles && (!role || !roles.includes(role))) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
