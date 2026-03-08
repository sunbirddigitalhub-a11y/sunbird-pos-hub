import { Check, Lock } from "lucide-react";
import { useSubscription, PlanType, PLAN_LABELS } from "@/hooks/useSubscription";
import { cn } from "@/lib/utils";

const plans: { id: PlanType; description: string }[] = [
  { id: "basic", description: "POS & Products" },
  { id: "business", description: "Sales, Reports & Customers" },
  { id: "enterprise", description: "Full system access" },
];

export function PlanSwitcher() {
  const { plan, switchPlan, isTrial, trialExpired, isGrandmaster } = useSubscription();

  if (isGrandmaster) return null;

  const canSwitch = isTrial && !trialExpired;

  return (
    <div className="mx-5 mb-4 rounded-xl border border-border/30 bg-card p-3">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
          {canSwitch ? "Preview Plan" : "Current Plan"}
        </span>
        {!canSwitch && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
      </div>
      <div className="space-y-1.5">
        {plans.map((p) => (
          <button
            key={p.id}
            disabled={!canSwitch}
            onClick={() => switchPlan(p.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200 text-[13px]",
              plan === p.id
                ? "bg-primary/10 border border-primary/30 text-foreground"
                : canSwitch
                  ? "hover:bg-secondary/50 text-muted-foreground"
                  : "text-muted-foreground/50 cursor-not-allowed"
            )}
          >
            <div className={cn(
              "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
              plan === p.id ? "border-primary bg-primary" : "border-muted-foreground/30"
            )}>
              {plan === p.id && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium">{PLAN_LABELS[p.id]}</p>
              <p className="text-[11px] text-muted-foreground">{p.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
