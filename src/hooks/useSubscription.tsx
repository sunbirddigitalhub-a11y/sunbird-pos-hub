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
}

const PLAN_FEATURES: Record<PlanType, PlanFeatures> = {
  basic: {
    dashboard: true,
    pos: true,
    inventory: false,
    products: true,
    sales: false,
    reports: false,
    zReport: false,
    outstanding: false,
    customers: false,
    barcode: true,
    users: false,
    settings: false,
  },
  business: {
    dashboard: true,
    pos: true,
    inventory: true,
    products: true,
    sales: true,
    reports: true,
    zReport: false,
    outstanding: true,
    customers: true,
    barcode: true,
    users: false,
    settings: false,
  },
  enterprise: {
    dashboard: true,
    pos: true,
    inventory: true,
    products: true,
    sales: true,
    reports: true,
    zReport: true,
    outstanding: true,
    customers: true,
    barcode: true,
    users: true,
    settings: true,
  },
};

const FEATURE_ROUTE_MAP: Record<string, keyof PlanFeatures> = {
  "/dashboard": "dashboard",
  "/pos": "pos",
  "/inventory": "inventory",
  "/products": "products",
  "/sales": "sales",
  "/reports": "reports",
  "/z-report": "zReport",
  "/outstanding": "outstanding",
  "/customers": "customers",
  "/barcode": "barcode",
  "/users": "users",
  "/settings": "settings",
};

export const PLAN_LABELS: Record<PlanType, string> = {
  basic: "Basic Plan",
  business: "Business Plan",
  enterprise: "Enterprise Plan",
};

const GRANDMASTER_EMAIL = "sunbirdgroup9@gmail.com";

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
  const { user, loading: authLoading } = useAuth();
  const [plan, setPlan] = useState<PlanType>("basic");
  const [isTrial, setIsTrial] = useState(true);
  const [trialEnd, setTrialEnd] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  const isGrandmaster = user?.email === GRANDMASTER_EMAIL;

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
      // No subscription found — create one
      await supabase.from("subscriptions" as any).insert({
        user_id: user.id,
        plan: "basic",
        is_trial: true,
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
    if (isTrial && !trialExpired) return true; // Trial users can preview all features
    return PLAN_FEATURES[plan][feature];
  };

  const isRouteAccessible = (route: string): boolean => {
    if (isGrandmaster) return true;
    const feature = FEATURE_ROUTE_MAP[route];
    if (!feature) return true;
    return hasFeatureAccess(feature);
  };

  const planFeatures = isGrandmaster || (isTrial && !trialExpired)
    ? Object.fromEntries(Object.keys(PLAN_FEATURES.enterprise).map(k => [k, true])) as PlanFeatures
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
