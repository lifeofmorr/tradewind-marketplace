import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Pushes dealer / service_provider users into onboarding until their org row
 * exists (profile.dealer_id or profile.service_provider_id is set).
 */
export default function OnboardingGuard() {
  const { profile, loading } = useAuth();
  const location = useLocation();
  if (loading || !profile) return <Outlet />;

  const onDealerOnboarding = location.pathname.startsWith("/onboarding/dealer");
  const onServiceOnboarding = location.pathname.startsWith("/onboarding/service-provider");

  if (profile.role === "dealer" && !profile.dealer_id && !onDealerOnboarding) {
    return <Navigate to="/onboarding/dealer" replace />;
  }
  if (profile.role === "service_provider" && !profile.service_provider_id && !onServiceOnboarding) {
    return <Navigate to="/onboarding/service-provider" replace />;
  }
  return <Outlet />;
}
