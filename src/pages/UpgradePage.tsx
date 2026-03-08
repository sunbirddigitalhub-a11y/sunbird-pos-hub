import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Zap, Crown, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription, PlanType, PLAN_LABELS, PLAN_PRICES } from "@/hooks/useSubscription";
import { cn } from "@/lib/utils";

const plans: {
  id: PlanType;
  tag?: string;
  popular?: boolean;
  features: string[];
  limits: string;
}[] = [
  {
    id: "basic",
    features: [
      "POS sales & checkout",
      "Product management",
      "Barcode scanner",
      "Basic inventory",
      "Daily sales summary",
      "Customer database",
    ],
    limits: "1 store · 1 user · Limited reports",
  },
  {
    id: "business",
    tag: "Most Popular",
    popular: true,
    features: [
      "Everything in Basic",
      "Staff management",
      "Advanced reports",
      "Supplier system",
      "Purchase orders",
      "Inventory alerts",
      "Profit tracking",
      "Export reports",
      "Expenses tracking",
      "Invoices",
    ],
    limits: "1 store · Up to 5 users",
  },
  {
    id: "enterprise",
    features: [
      "Everything in Business",
      "Multi-store support",
      "Unlimited staff",
      "Analytics dashboard",
      "API access",
      "Automated alerts",
      "Priority support",
    ],
    limits: "Unlimited stores · Unlimited users",
  },
];

const UpgradePage = () => {
  const navigate = useNavigate();
  const { plan: currentPlan, isTrial, trialDaysLeft, trialExpired, switchPlan, isGrandmaster } = useSubscription();
  const [currency, setCurrency] = useState<"usd" | "ugx">("usd");
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);

  if (isGrandmaster) {
    navigate("/dashboard");
    return null;
  }

  const handleUpgrade = async (planId: PlanType) => {
    setSelectedPlan(planId);
    await switchPlan(planId);
    // In the future, this would redirect to Stripe checkout
    navigate("/dashboard");
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight">Upgrade Your Plan</h1>
          <p className="text-muted-foreground text-[14px] mt-1">
            {isTrial && !trialExpired
              ? `You have ${trialDaysLeft} day${trialDaysLeft !== 1 ? "s" : ""} left in your free trial.`
              : trialExpired
                ? "Your trial has expired. Choose a plan to continue."
                : `You're on the ${PLAN_LABELS[currentPlan]}.`
            }
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="rounded-xl">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Currency Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center rounded-full bg-secondary/80 p-1 border border-border/30">
          <button
            onClick={() => setCurrency("usd")}
            className={cn(
              "px-5 py-2 rounded-full text-[13px] font-semibold transition-all",
              currency === "usd" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            🇺🇸 USD
          </button>
          <button
            onClick={() => setCurrency("ugx")}
            className={cn(
              "px-5 py-2 rounded-full text-[13px] font-semibold transition-all",
              currency === "ugx" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            🇺🇬 UGX
          </button>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((p) => {
          const price = PLAN_PRICES[p.id];
          const isCurrentPlan = currentPlan === p.id && !isTrial;
          return (
            <div
              key={p.id}
              className={cn(
                "rounded-2xl p-6 border transition-all duration-200 relative",
                p.popular
                  ? "border-primary/50 bg-primary/5 shadow-lg shadow-primary/10 scale-[1.02]"
                  : "border-border/40 bg-card hover:border-border/60"
              )}
            >
              {p.tag && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold uppercase tracking-wider px-4 py-1 rounded-full bg-primary text-primary-foreground">
                  {p.tag}
                </span>
              )}

              <h3 className="text-[18px] font-bold mt-2">{PLAN_LABELS[p.id]}</h3>
              <div className="mt-4 mb-2">
                <span className="text-[36px] font-bold tracking-tight">
                  {currency === "usd" ? `$${price.usd}` : `UGX ${price.ugx.toLocaleString()}`}
                </span>
                <span className="text-[13px] text-muted-foreground">/month</span>
              </div>
              <p className="text-[12px] text-muted-foreground mb-5">{p.limits}</p>

              <ul className="space-y-2.5 mb-6">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px]">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleUpgrade(p.id)}
                disabled={isCurrentPlan}
                className={cn(
                  "w-full h-11 rounded-xl font-semibold text-[13px]",
                  p.popular
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                    : isCurrentPlan
                      ? "bg-secondary text-muted-foreground"
                      : "bg-secondary hover:bg-secondary/80 text-foreground"
                )}
              >
                {isCurrentPlan ? (
                  "Current Plan"
                ) : (
                  <>
                    {p.popular ? <Zap className="h-3.5 w-3.5 mr-1.5" /> : <ArrowRight className="h-3.5 w-3.5 mr-1.5" />}
                    {isTrial ? "Select Plan" : "Upgrade"}
                  </>
                )}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UpgradePage;
