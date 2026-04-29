import { lazy, Suspense, type ReactNode } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Layout (small, eager-loaded)
import PublicShell from "@/components/layout/PublicShell";
import DashboardShell from "@/components/layout/DashboardShell";

// Guards
import ProtectedRoute from "@/routes/ProtectedRoute";
import OnboardingGuard from "@/routes/OnboardingGuard";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

// Public pages — eager-loaded so the homepage paints fast
import Home from "@/pages/Home";
import CategoryPage, { CategoriesIndex, BrowsePage, GroupPage } from "@/pages/CategoryPage";
import ListingDetail from "@/pages/ListingDetail";
import DealerProfile, { DealersIndex } from "@/pages/DealerProfile";
import ServiceProviderProfile, { ServicesIndex } from "@/pages/ServiceProviderProfile";
import {
  About, Contact, Services as ServicesHub,
  Pricing, Dealers as DealersInfo, SellMyBoat, SellMyCar, SellHub,
  Terms, Privacy, NotFound,
} from "@/pages/SimplePages";
import TrustCenter from "@/pages/public/TrustCenter";
import Blog from "@/pages/Blog";
import BlogPostDetail from "@/pages/BlogPostDetail";
import MarketReports from "@/pages/MarketReports";
import MarketReportDetail from "@/pages/MarketReportDetail";
import AuctionsPage from "@/pages/Auctions";
import AuctionDetail from "@/pages/AuctionDetail";
import { Financing, Insurance, Inspections, Transport, Concierge } from "@/pages/RequestPages";
import { CheckoutSuccess, CheckoutCancel } from "@/pages/CheckoutPages";

// Programmatic SEO (Phase 2B)
import {
  StatePage, BrandPage, BrandsIndex, CityPage, StatesIndex, CategoryCityIndex,
} from "@/pages/SeoPages";

// Auth (small)
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";

// ─── Lazy-loaded surfaces (Phase 2G) ─────────────────────────────────────────
// Premium expansion surfaces
const Integrations = lazy(() => import("@/pages/public/Integrations"));
const Community = lazy(() => import("@/pages/public/Community"));
const FinancialHub = lazy(() => import("@/pages/buyer/FinancialHub"));

// Onboarding
const DealerOnboarding = lazy(() => import("@/pages/onboarding/DealerOnboarding"));
const ServiceProviderOnboarding = lazy(() => import("@/pages/onboarding/ServiceProviderOnboarding"));

// Seller
const SellerDashboard = lazy(() => import("@/pages/dashboard/seller/SellerDashboard"));
const SellerListings = lazy(() => import("@/pages/dashboard/seller/SellerListings"));
const CreateListing = lazy(() => import("@/pages/dashboard/seller/CreateListing"));
const EditListing = lazy(() => import("@/pages/dashboard/seller/EditListing"));
const SellerInquiries = lazy(() => import("@/pages/dashboard/seller/SellerInquiries"));
const SellerAuctions = lazy(() => import("@/pages/dashboard/seller/SellerAuctions"));

// Dealer
const DealerDashboard = lazy(() => import("@/pages/dashboard/dealer/DealerDashboard"));
const DealerInventory = lazy(() => import("@/pages/dashboard/dealer/DealerInventory"));
const DealerLeads = lazy(() => import("@/pages/dashboard/dealer/DealerLeads"));
const DealerAnalytics = lazy(() => import("@/pages/dashboard/dealer/DealerAnalytics"));
const DealerProfilePage = lazy(() => import("@/pages/dashboard/dealer/DealerProfilePage"));

// Service provider
const ServiceDashboard = lazy(() => import("@/pages/dashboard/service/ServiceDashboard"));
const ServiceLeads = lazy(() => import("@/pages/dashboard/service/ServiceLeads"));
const ServiceProviderProfileForm = lazy(() => import("@/pages/dashboard/service/ServiceProviderProfileForm"));

// Buyer
const BuyerDashboard = lazy(() => import("@/pages/dashboard/buyer/BuyerDashboard"));
const BuyerSaved = lazy(() => import("@/pages/dashboard/buyer/BuyerSaved"));
const BuyerRequests = lazy(() => import("@/pages/dashboard/buyer/BuyerRequests"));
const BuyerReviews = lazy(() => import("@/pages/dashboard/buyer/BuyerReviews"));
const BuyerCompare = lazy(() => import("@/pages/dashboard/buyer/BuyerCompare"));

// Messaging
const Messages = lazy(() => import("@/pages/dashboard/Messages"));

// Admin
const AdminDashboard = lazy(() => import("@/pages/dashboard/admin/AdminDashboard"));
const AdminListings = lazy(() => import("@/pages/dashboard/admin/AdminListings"));
const AdminUsers = lazy(() => import("@/pages/dashboard/admin/AdminUsers"));
const AdminRequests = lazy(() => import("@/pages/dashboard/admin/AdminRequests"));
const AdminFraud = lazy(() => import("@/pages/dashboard/admin/AdminFraud"));
const AdminPayments = lazy(() => import("@/pages/dashboard/admin/AdminPayments"));
const AdminContent = lazy(() => import("@/pages/dashboard/admin/AdminContent"));
const AdminAuctions = lazy(() => import("@/pages/dashboard/admin/AdminAuctions"));
const AdminBlog = lazy(() => import("@/pages/dashboard/admin/AdminBlog"));
const AdminMarketReports = lazy(() => import("@/pages/dashboard/admin/AdminMarketReports"));

function PageSpinner() {
  return (
    <div className="min-h-[40vh] grid place-items-center">
      <div className="text-xs font-mono uppercase tracking-[0.32em] text-muted-foreground">loading…</div>
    </div>
  );
}

function L({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageSpinner />}>{children}</Suspense>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public marketing + marketplace surface */}
      <Route element={<PublicShell />}>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/boats" element={<GroupPage group="boat" />} />
        <Route path="/autos" element={<GroupPage group="auto" />} />
        <Route path="/categories" element={<CategoriesIndex />} />
        <Route path="/categories/:category" element={<CategoryPage />} />
        <Route path="/listings/:slug" element={<ListingDetail />} />

        <Route path="/dealers" element={<DealersIndex />} />
        <Route path="/dealers/:slug" element={<DealerProfile />} />

        <Route path="/services" element={<ServicesIndex />} />
        <Route path="/services/:slug" element={<ServiceProviderProfile />} />

        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPostDetail />} />
        <Route path="/market-reports" element={<MarketReports />} />
        <Route path="/market-reports/:slug" element={<MarketReportDetail />} />
        <Route path="/auctions" element={<AuctionsPage />} />
        <Route path="/auctions/:id" element={<AuctionDetail />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/dealers-info" element={<DealersInfo />} />
        <Route path="/sell" element={<SellHub />} />
        <Route path="/sell-my-boat" element={<SellMyBoat />} />
        <Route path="/sell-my-car" element={<SellMyCar />} />
        <Route path="/services-hub" element={<ServicesHub />} />

        <Route path="/financing" element={<Financing />} />
        <Route path="/insurance" element={<Insurance />} />
        <Route path="/inspections" element={<Inspections />} />
        <Route path="/transport" element={<Transport />} />
        <Route path="/concierge" element={<Concierge />} />

        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/trust" element={<TrustCenter />} />
        <Route path="/integrations" element={<L><Integrations /></L>} />
        <Route path="/community" element={<L><Community /></L>} />

        <Route path="/checkout/success" element={<CheckoutSuccess />} />
        <Route path="/checkout/cancel" element={<CheckoutCancel />} />

        {/* ── Programmatic SEO (Phase 2B) ───────────────────────────────── */}
        <Route path="/by-state" element={<StatesIndex />} />
        <Route path="/boats-for-sale-in-:state" element={<StatePage />} />
        <Route path="/brands" element={<BrandsIndex />} />
        <Route path="/:brand-for-sale" element={<BrandPage />} />
        <Route path="/by-city" element={<CategoryCityIndex />} />
        <Route path="/:category-in-:city" element={<CityPage />} />

        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Auth (no shell) */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Onboarding */}
      <Route element={<ProtectedRoute roles={["dealer"]} />}>
        <Route path="/onboarding/dealer" element={<L><DealerOnboarding /></L>} />
      </Route>
      <Route element={<ProtectedRoute roles={["service_provider"]} />}>
        <Route path="/onboarding/service-provider" element={<L><ServiceProviderOnboarding /></L>} />
      </Route>

      {/* Messaging — open to every signed-in role */}
      <Route element={<ProtectedRoute roles={["buyer", "seller", "dealer", "dealer_staff", "service_provider", "admin"]} />}>
        <Route element={<DashboardShell />}>
          <Route path="/messages" element={<L><Messages /></L>} />
          <Route path="/messages/:id" element={<L><Messages /></L>} />
        </Route>
      </Route>

      {/* Buyer dashboard */}
      <Route element={<ProtectedRoute roles={["buyer", "seller", "dealer", "dealer_staff", "service_provider", "admin"]} />}>
        <Route element={<DashboardShell />}>
          <Route path="/buyer" element={<L><BuyerDashboard /></L>} />
          <Route path="/buyer/saved" element={<L><BuyerSaved /></L>} />
          <Route path="/buyer/requests" element={<L><BuyerRequests /></L>} />
          <Route path="/buyer/reviews" element={<L><BuyerReviews /></L>} />
          <Route path="/buyer/compare" element={<L><BuyerCompare /></L>} />
          <Route path="/buyer/finance" element={<L><FinancialHub /></L>} />
        </Route>
      </Route>

      {/* Seller dashboard */}
      <Route element={<ProtectedRoute roles={["seller", "dealer", "dealer_staff", "admin"]} />}>
        <Route element={<DashboardShell />}>
          <Route path="/seller" element={<L><SellerDashboard /></L>} />
          <Route path="/seller/listings" element={<L><SellerListings /></L>} />
          <Route path="/seller/listings/new" element={<L><CreateListing /></L>} />
          <Route path="/seller/listings/:id" element={<L><EditListing /></L>} />
          <Route path="/seller/inquiries" element={<L><SellerInquiries /></L>} />
          <Route path="/seller/auctions" element={<L><SellerAuctions /></L>} />
        </Route>
      </Route>

      {/* Dealer dashboard (with onboarding guard) */}
      <Route element={<ProtectedRoute roles={["dealer", "dealer_staff", "admin"]} />}>
        <Route element={<OnboardingGuard />}>
          <Route element={<DashboardShell />}>
            <Route path="/dealer" element={<L><DealerDashboard /></L>} />
            <Route path="/dealer/inventory" element={<L><DealerInventory /></L>} />
            <Route path="/dealer/leads" element={<L><DealerLeads /></L>} />
            <Route path="/dealer/analytics" element={<L><DealerAnalytics /></L>} />
            <Route path="/dealer/profile" element={<L><DealerProfilePage /></L>} />
          </Route>
        </Route>
      </Route>

      {/* Service provider dashboard */}
      <Route element={<ProtectedRoute roles={["service_provider", "admin"]} />}>
        <Route element={<OnboardingGuard />}>
          <Route element={<DashboardShell />}>
            <Route path="/service" element={<L><ServiceDashboard /></L>} />
            <Route path="/service/leads" element={<L><ServiceLeads /></L>} />
            <Route path="/service/profile" element={<L><ServiceProviderProfileForm /></L>} />
          </Route>
        </Route>
      </Route>

      {/* Admin dashboard */}
      <Route element={<ProtectedRoute roles={["admin"]} />}>
        <Route element={<DashboardShell />}>
          <Route path="/admin" element={<L><AdminDashboard /></L>} />
          <Route path="/admin/listings" element={<L><AdminListings /></L>} />
          <Route path="/admin/auctions" element={<L><AdminAuctions /></L>} />
          <Route path="/admin/users" element={<L><AdminUsers /></L>} />
          <Route path="/admin/requests" element={<L><AdminRequests /></L>} />
          <Route path="/admin/fraud" element={<L><AdminFraud /></L>} />
          <Route path="/admin/payments" element={<L><AdminPayments /></L>} />
          <Route path="/admin/content" element={<L><AdminContent /></L>} />
          <Route path="/admin/blog" element={<L><AdminBlog /></L>} />
          <Route path="/admin/market-reports" element={<L><AdminMarketReports /></L>} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
