import type { LucideIcon } from "lucide-react";
import {
  Store,
  Sparkles,
  Building2,
  Wrench,
  Landmark,
  LineChart,
  Users2,
  ShieldAlert,
  CreditCard,
  PieChart,
  Workflow,
  Mail,
  MessageSquare,
  Database,
  Truck,
  ScrollText,
  Banknote,
  KeyRound,
  Calendar,
  Plug,
} from "lucide-react";

export type AppStatus = "active" | "coming_soon";

export interface ConnectedApp {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  to: string;
  status: AppStatus;
  /** Optional accent class on the icon background. */
  accent?: string;
}

/**
 * The "internal apps" that make up the TradeWind operating system.
 * Each app surfaces in the AppSwitcher command palette.
 */
export const TRADEWIND_APPS: ConnectedApp[] = [
  {
    id: "marketplace",
    name: "Marketplace",
    description: "Browse boats, autos, and verified dealer inventory.",
    icon: Store,
    to: "/browse",
    status: "active",
    accent: "from-brass-500/30 to-brass-700/10",
  },
  {
    id: "concierge",
    name: "Concierge",
    description: "AI-powered sourcing and white-glove buyer support.",
    icon: Sparkles,
    to: "/concierge",
    status: "active",
    accent: "from-violet-500/25 to-violet-700/10",
  },
  {
    id: "dealer-crm",
    name: "Dealer CRM",
    description: "Inventory, leads, and analytics for verified dealers.",
    icon: Building2,
    to: "/dealer",
    status: "active",
    accent: "from-sky-500/25 to-sky-700/10",
  },
  {
    id: "service-network",
    name: "Service Network",
    description: "Inspectors, surveyors, transport, and installers.",
    icon: Wrench,
    to: "/services",
    status: "active",
    accent: "from-emerald-500/25 to-emerald-700/10",
  },
  {
    id: "financing-hub",
    name: "Financing Hub",
    description: "Pre-qualification, lender match, and payment readiness.",
    icon: Landmark,
    to: "/buyer/finance",
    status: "active",
    accent: "from-amber-500/25 to-amber-700/10",
  },
  {
    id: "market-pulse",
    name: "Market Pulse",
    description: "Live pricing trends and asset valuation reports.",
    icon: LineChart,
    to: "/market-reports",
    status: "active",
    accent: "from-cyan-500/25 to-cyan-700/10",
  },
  {
    id: "community",
    name: "Community",
    description: "Insights from buyers, dealers, and pros in your category.",
    icon: Users2,
    to: "/community",
    status: "active",
    accent: "from-rose-500/25 to-rose-700/10",
  },
  {
    id: "admin-command",
    name: "Admin Command Center",
    description: "Trust, fraud, and platform operations.",
    icon: ShieldAlert,
    to: "/admin",
    status: "active",
    accent: "from-slate-500/25 to-slate-700/10",
  },
];

export type IntegrationCategory =
  | "CRM"
  | "Financial"
  | "Analytics"
  | "Automation"
  | "Dealer Tools"
  | "Service Tools";

export type IntegrationStatus = "connected" | "available" | "coming_soon";

export interface Integration {
  id: string;
  name: string;
  description: string;
  category: IntegrationCategory;
  icon: LucideIcon;
  status: IntegrationStatus;
}

export const INTEGRATION_CATEGORIES: IntegrationCategory[] = [
  "CRM",
  "Financial",
  "Analytics",
  "Automation",
  "Dealer Tools",
  "Service Tools",
];

export const INTEGRATIONS: Integration[] = [
  // CRM
  { id: "salesforce", name: "Salesforce", description: "Sync dealer leads and pipeline.", category: "CRM", icon: Users2, status: "available" },
  { id: "hubspot", name: "HubSpot", description: "Two-way contact and deal sync.", category: "CRM", icon: Users2, status: "available" },
  { id: "pipedrive", name: "Pipedrive", description: "Lightweight pipeline tracking.", category: "CRM", icon: Users2, status: "coming_soon" },

  // Financial
  { id: "plaid", name: "Plaid", description: "Bank account verification for buyers.", category: "Financial", icon: Banknote, status: "coming_soon" },
  { id: "stripe", name: "Stripe Connect", description: "Dealer payouts and platform fees.", category: "Financial", icon: CreditCard, status: "connected" },
  { id: "quickbooks", name: "QuickBooks", description: "Reconcile dealer transactions.", category: "Financial", icon: ScrollText, status: "available" },

  // Analytics
  { id: "ga4", name: "Google Analytics 4", description: "Marketing attribution and funnel.", category: "Analytics", icon: PieChart, status: "available" },
  { id: "segment", name: "Segment", description: "Customer event pipeline.", category: "Analytics", icon: Database, status: "available" },
  { id: "mixpanel", name: "Mixpanel", description: "Product analytics for dealers.", category: "Analytics", icon: PieChart, status: "coming_soon" },

  // Automation
  { id: "zapier", name: "Zapier", description: "Connect TradeWind to 7,000+ apps.", category: "Automation", icon: Workflow, status: "available" },
  { id: "make", name: "Make", description: "Visual automation flows.", category: "Automation", icon: Workflow, status: "coming_soon" },
  { id: "n8n", name: "n8n", description: "Self-hosted workflow automation.", category: "Automation", icon: Workflow, status: "coming_soon" },

  // Dealer Tools
  { id: "dealertrack", name: "Dealertrack", description: "Inventory and F&I integration.", category: "Dealer Tools", icon: Building2, status: "coming_soon" },
  { id: "vinsolutions", name: "VinSolutions", description: "Auto dealer CRM bridge.", category: "Dealer Tools", icon: KeyRound, status: "coming_soon" },
  { id: "boatwizard", name: "BoatWizard", description: "Marine inventory feed sync.", category: "Dealer Tools", icon: Building2, status: "available" },

  // Service Tools
  { id: "calendly", name: "Calendly", description: "Inspection and survey scheduling.", category: "Service Tools", icon: Calendar, status: "available" },
  { id: "shipsi", name: "Shipsi", description: "Bonded transport coordination.", category: "Service Tools", icon: Truck, status: "coming_soon" },
  { id: "sendgrid", name: "SendGrid", description: "Transactional email delivery.", category: "Service Tools", icon: Mail, status: "connected" },
  { id: "twilio", name: "Twilio", description: "SMS notifications and verification.", category: "Service Tools", icon: MessageSquare, status: "available" },
  { id: "webhook", name: "Custom Webhook", description: "Push events to any endpoint.", category: "Service Tools", icon: Plug, status: "available" },
];
