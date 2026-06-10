import { lazy, Suspense, type ReactNode } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Layout (small, eager-loaded)
import PublicShell from "@/components/layout/PublicShell";
import DashboardShell from "@/components/layout/DashboardShell";

// Guards
import ProtectedRoute from "@/routes/ProtectedRoute";
import OnboardingGuard from "@/routes/OnboardingGuard";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

// Eager-loaded: homepage (paints fast), small static pages, auth
import Home from "@/pages/Home";
import {
  About, Contact, Support, Services as ServicesHub,
  Pricing, Dealers as DealersInfo, SellMyBoat, SellMyCar, SellMyAircraft, SellHub,
  Terms, Privacy, NotFound,
} from "@/pages/SimplePages";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";

// Heavier public pages are lazy-loaded so the initial bundle stays small.
const CategoryPage = lazy(() => import("@/pages/CategoryPage"));
const CategoriesIndex = lazy(() => import("@/pages/CategoryPage").then((m) => ({ default: m.CategoriesIndex })));
const BrowsePage = lazy(() => import("@/pages/CategoryPage").then((m) => ({ default: m.BrowsePage })));
const GroupPage = lazy(() => import("@/pages/CategoryPage").then((m) => ({ default: m.GroupPage })));
const ListingDetail = lazy(() => import("@/pages/ListingDetail"));
const DealerProfile = lazy(() => import("@/pages/DealerProfile"));
const DealersIndex = lazy(() => import("@/pages/DealerProfile").then((m) => ({ default: m.DealersIndex })));
const ServiceProviderProfile = lazy(() => import("@/pages/ServiceProviderProfile"));
const ServicesIndex = lazy(() => import("@/pages/ServiceProviderProfile").then((m) => ({ default: m.ServicesIndex })));
const TrustCenter = lazy(() => import("@/pages/public/TrustCenter"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogPostDetail = lazy(() => import("@/pages/BlogPostDetail"));
const MarketReports = lazy(() => import("@/pages/MarketReports"));
const MarketReportDetail = lazy(() => import("@/pages/MarketReportDetail"));
const AuctionsPage = lazy(() => import("@/pages/Auctions"));
const AuctionDetail = lazy(() => import("@/pages/AuctionDetail"));
const Financing = lazy(() => import("@/pages/RequestPages").then((m) => ({ default: m.Financing })));
const Insurance = lazy(() => import("@/pages/RequestPages").then((m) => ({ default: m.Insurance })));
const Inspections = lazy(() => import("@/pages/RequestPages").then((m) => ({ default: m.Inspections })));
const Transport = lazy(() => import("@/pages/RequestPages").then((m) => ({ default: m.Transport })));
const Concierge = lazy(() => import("@/pages/RequestPages").then((m) => ({ default: m.Concierge })));
const CheckoutSuccess = lazy(() => import("@/pages/CheckoutPages").then((m) => ({ default: m.CheckoutSuccess })));
const CheckoutCancel = lazy(() => import("@/pages/CheckoutPages").then((m) => ({ default: m.CheckoutCancel })));

// Programmatic SEO (Phase 2B)
const StatePage = lazy(() => import("@/pages/SeoPages").then((m) => ({ default: m.StatePage })));
const BrandPage = lazy(() => import("@/pages/SeoPages").then((m) => ({ default: m.BrandPage })));
const BrandsIndex = lazy(() => import("@/pages/SeoPages").then((m) => ({ default: m.BrandsIndex })));
const CityPage = lazy(() => import("@/pages/SeoPages").then((m) => ({ default: m.CityPage })));
const StatesIndex = lazy(() => import("@/pages/SeoPages").then((m) => ({ default: m.StatesIndex })));
const CategoryCityIndex = lazy(() => import("@/pages/SeoPages").then((m) => ({ default: m.CategoryCityIndex })));

// ─── Lazy-loaded surfaces (Phase 2G) ─────────────────────────────────────────
// Premium expansion surfaces
const Integrations = lazy(() => import("@/pages/public/Integrations"));
const DeveloperHub = lazy(() => import("@/pages/public/DeveloperHub"));
const Community = lazy(() => import("@/pages/public/Community"));
const DataDeletion = lazy(() => import("@/pages/public/DataDeletion"));
const AircraftPage = lazy(() => import("@/pages/public/AircraftPage"));
const AviationServicesPage = lazy(() => import("@/pages/public/AviationServicesPage"));
const FinancialHub = lazy(() => import("@/pages/buyer/FinancialHub"));
const TransactionRoom = lazy(() => import("@/pages/TransactionRoom"));
const BetaPage = lazy(() => import("@/pages/public/BetaPage"));
const HowItWorksPage = lazy(() => import("@/pages/public/HowItWorksPage"));
const FeedbackPage = lazy(() => import("@/pages/public/FeedbackPage"));

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
const DealerImport = lazy(() => import("@/pages/dashboard/dealer/DealerImport"));
const DealerWidgets = lazy(() => import("@/pages/dashboard/dealer/DealerWidgets"));

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
const AdminPaymentsLiveReadiness = lazy(() => import("@/pages/dashboard/admin/AdminPaymentsLiveReadiness"));
const AdminContent = lazy(() => import("@/pages/dashboard/admin/AdminContent"));
const AdminAuctions = lazy(() => import("@/pages/dashboard/admin/AdminAuctions"));
const AdminBlog = lazy(() => import("@/pages/dashboard/admin/AdminBlog"));
const AdminMarketReports = lazy(() => import("@/pages/dashboard/admin/AdminMarketReports"));
const AdminOutreach = lazy(() => import("@/pages/dashboard/admin/AdminOutreach"));
const AdminBetaInbox = lazy(() => import("@/pages/dashboard/admin/AdminBetaInbox"));

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
    <ErrorBoundary>
    <Routes>
      {/* Public marketing + marketplace surface */}
      <Route element={<PublicShell />}>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<L><BrowsePage /></L>} />
        <Route path="/boats" element={<L><GroupPage group="boat" /></L>} />
        <Route path="/autos" element={<L><GroupPage group="auto" /></L>} />
        <Route path="/aircraft" element={<L><AircraftPage /></L>} />
        <Route path="/airplanes" element={<L><AircraftPage /></L>} />
        <Route
          path="/jets"
          element={<L><AircraftPage defaultCategory="aircraft_jet" title="Jets for sale" eyebrow="business jets" blurb="Light, midsize, and super-midsize jets from vetted brokers and operators." /></L>}
        />
        <Route
          path="/helicopters"
          element={<L><AircraftPage defaultCategory="aircraft_helicopter" title="Helicopters for sale" eyebrow="rotorcraft" blurb="Turbine and piston helicopters — Robinson, Bell, Airbus." /></L>}
        />
        <Route path="/aviation-services" element={<L><AviationServicesPage /></L>} />
        <Route path="/categories" element={<L><CategoriesIndex /></L>} />
        <Route path="/categories/:category" element={<L><CategoryPage /></L>} />
        <Route path="/listings/:slug" element={<L><ListingDetail /></L>} />

        <Route path="/dealers" element={<L><DealersIndex /></L>} />
        <Route path="/dealers/:slug" element={<L><DealerProfile /></L>} />

        <Route path="/services" element={<L><ServicesIndex /></L>} />
        <Route path="/services/:slug" element={<L><ServiceProviderProfile /></L>} />

        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/support" element={<Support />} />
        <Route path="/blog" element={<L><Blog /></L>} />
        <Route path="/blog/:slug" element={<L><BlogPostDetail /></L>} />
        <Route path="/market-reports" element={<L><MarketReports /></L>} />
        <Route path="/market-reports/:slug" element={<L><MarketReportDetail /></L>} />
        <Route path="/auctions" element={<L><AuctionsPage /></L>} />
        <Route path="/auctions/:id" element={<L><AuctionDetail /></L>} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/dealers-info" element={<DealersInfo />} />
        <Route path="/sell" element={<SellHub />} />
        <Route path="/sell-my-boat" element={<SellMyBoat />} />
        <Route path="/sell-my-car" element={<SellMyCar />} />
        <Route path="/sell-my-aircraft" element={<SellMyAircraft />} />
        <Route path="/services-hub" element={<ServicesHub />} />

        <Route path="/financing" element={<L><Financing /></L>} />
        <Route path="/insurance" element={<L><Insurance /></L>} />
        <Route path="/inspections" element={<L><Inspections /></L>} />
        <Route path="/transport" element={<L><Transport /></L>} />
        <Route path="/concierge" element={<L><Concierge /></L>} />

        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/delete-my-data" element={<L><DataDeletion /></L>} />
        <Route path="/trust" element={<L><TrustCenter /></L>} />
        <Route path="/integrations" element={<L><Integrations /></L>} />
        <Route path="/integrations/developer" element={<L><DeveloperHub /></L>} />
        <Route path="/community" element={<L><Community /></L>} />
        <Route path="/beta" element={<L><BetaPage /></L>} />
        <Route path="/how-it-works" element={<L><HowItWorksPage /></L>} />
        <Route path="/feedback" element={<L><FeedbackPage /></L>} />

        <Route path="/checkout/success" element={<L><CheckoutSuccess /></L>} />
        <Route path="/checkout/cancel" element={<L><CheckoutCancel /></L>} />

        {/* ── Programmatic SEO (Phase 2B) ───────────────────────────────── */}
        <Route path="/by-state" element={<L><StatesIndex /></L>} />
        <Route path="/boats-for-sale-in-:state" element={<L><StatePage /></L>} />
        <Route path="/brands" element={<L><BrandsIndex /></L>} />
        <Route path="/:brand-for-sale" element={<L><BrandPage /></L>} />
        <Route path="/by-city" element={<L><CategoryCityIndex /></L>} />
        <Route path="/:category-in-:city" element={<L><CityPage /></L>} />

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
          <Route path="/transactions/:id" element={<L><TransactionRoom /></L>} />
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
            <Route path="/dealer/import" element={<L><DealerImport /></L>} />
            <Route path="/dealer/widgets" element={<L><DealerWidgets /></L>} />
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
          <Route path="/admin/payments/live-readiness" element={<L><AdminPaymentsLiveReadiness /></L>} />
          <Route path="/admin/content" element={<L><AdminContent /></L>} />
          <Route path="/admin/blog" element={<L><AdminBlog /></L>} />
          <Route path="/admin/market-reports" element={<L><AdminMarketReports /></L>} />
          <Route path="/admin/outreach" element={<L><AdminOutreach /></L>} />
          <Route path="/admin/beta-inbox" element={<L><AdminBetaInbox /></L>} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </ErrorBoundary>
  );
}
