import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type PlanType = "basic" | "business" | "enterprise";

export interface PlanFeatures {
  dashboard: boolean;
  pos: boolean;
  inventory: boolean;
  products: boolean;
  sales: boolean;
  reports: boolean;
  zReport: boolean;
  outstanding: boolean;
  customers: boolean;
  barcode: boolean;
  users: boolean;
  settings: boolean;
  suppliers: boolean;
  purchases: boolean;
  invoices: boolean;
  analytics: boolean;
  staffManagement: boolean;
  stores: boolean;
  expenses: boolean;
}

const PLAN_FEATURES: Record<PlanType, PlanFeatures> = {
  basic: {
    dashboard: true, pos: true, products: true, inventory: true, customers: true,
    sales: true, barcode: true, reports: true,
    // Locked in Basic
    zReport: false, outstanding: false, users: false, settings: false,
    suppliers: false, purchases: false, invoices: false, analytics: false,
    staffManagement: false, stores: false, expenses: false, integrations: false,
  },
  business: {
    dashboard: true, pos: true, products: true, inventory: true, customers: true,
    sales: true, barcode: true, reports: true,
    zReport: true, outstanding: true, expenses: true,
    suppliers: true, purchases: true, invoices: true,
    staffManagement: true, users: true, settings: true,
    // Locked in Business
    analytics: false, stores: false, integrations: false,
  },
  enterprise: {
    dashboard: true, pos: true, products: true, inventory: true, customers: true,
    sales: true, barcode: true, reports: true,
    zReport: true, outstanding: true, expenses: true,
    suppliers: true, purchases: true, invoices: true,
    staffManagement: true, users: true, settings: true,
    analytics: true, stores: true, integrations: true,
  },
};

const FEATURE_ROUTE_MAP: Record<string, keyof PlanFeatures> = {
  "/dashboard": "dashboard", "/pos": "pos", "/inventory": "inventory",
  "/products": "products", "/sales": "sales", "/reports": "reports",
  "/z-report": "zReport", "/outstanding": "outstanding", "/customers": "customers",
  "/barcode": "barcode", "/users": "users", "/settings": "settings",
  "/suppliers": "suppliers", "/purchases": "purchases", "/invoices": "invoices",
  "/analytics": "analytics", "/staff-management": "staffManagement",
  "/stores": "stores", "/expenses": "expenses", "/integrations": "integrations",
};

export const PLAN_LABELS: Record<PlanType, string> = {
  basic: "Basic Plan", business: "Business Plan", enterprise: "Enterprise Plan",
};

export const PLAN_PRICES: Record<PlanType, { usd: number; ugx: number }> = {
  basic: { usd: 10, ugx: 37000 },
  business: { usd: 25, ugx: 92000 },
  enterprise: { usd: 60, ugx: 220000 },
};

export { PLAN_FEATURES, FEATURE_ROUTE_MAP };

interface SubscriptionContextType {
  plan: PlanType;
  isTrial: boolean;
  trialDaysLeft: number;
  trialExpired: boolean;
  isGrandmaster: boolean;
  loading: boolean;
  switchPlan: (plan: PlanType) => Promise<void>;
  hasFeatureAccess: (feature: keyof PlanFeatures) => boolean;
  isRouteAccessible: (route: string) => boolean;
  planFeatures: PlanFeatures;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user, isGrandmaster, loading: authLoading } = useAuth();
  const [plan, setPlan] = useState<PlanType>("basic");
  const [isTrial, setIsTrial] = useState(true);
  const [trialEnd, setTrialEnd] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  const trialDaysLeft = trialEnd
    ? Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;
  const trialExpired = isTrial && trialDaysLeft <= 0;

  const fetchSubscription = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from("subscriptions" as any)
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (data) {
      const d = data as any;
      setPlan(d.plan as PlanType);
      setIsTrial(d.is_trial);
      setTrialEnd(new Date(d.trial_end));
    } else {
      await supabase.from("subscriptions" as any).insert({
        user_id: user.id, plan: "basic", is_trial: true,
      } as any);
      setPlan("basic");
      setIsTrial(true);
      setTrialEnd(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading) fetchSubscription();
  }, [authLoading, fetchSubscription]);

  const switchPlan = async (newPlan: PlanType) => {
    if (!user || (trialExpired && !isGrandmaster)) return;
    setPlan(newPlan);
    await supabase
      .from("subscriptions" as any)
      .update({ plan: newPlan, updated_at: new Date().toISOString() } as any)
      .eq("user_id", user.id);
  };

  const hasFeatureAccess = (feature: keyof PlanFeatures): boolean => {
    if (isGrandmaster) return true;
    if (isTrial && !trialExpired) return true;
    return PLAN_FEATURES[plan][feature];
  };

  const isRouteAccessible = (route: string): boolean => {
    if (isGrandmaster) return true;
    const feature = FEATURE_ROUTE_MAP[route];
    if (!feature) return true;
    return hasFeatureAccess(feature);
  };

  const planFeatures: PlanFeatures = isGrandmaster || (isTrial && !trialExpired)
    ? PLAN_FEATURES.enterprise
    : PLAN_FEATURES[plan];

  return (
    <SubscriptionContext.Provider value={{
      plan, isTrial, trialDaysLeft, trialExpired, isGrandmaster,
      loading, switchPlan, hasFeatureAccess, isRouteAccessible, planFeatures,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error("useSubscription must be used within SubscriptionProvider");
  return ctx;
}
