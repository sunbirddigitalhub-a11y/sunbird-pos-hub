import { Clock, Crown, Zap } from "lucide-react";
import { useSubscription, PLAN_LABELS } from "@/hooks/useSubscription";

export function TrialBanner() {
  const { isTrial, trialDaysLeft, trialExpired, isGrandmaster, plan } = useSubscription();

  if (isGrandmaster) return null;

  if (trialExpired) {
    return (
      <div className="mx-5 mt-4 mb-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 flex items-center gap-3">
        <Clock className="h-4 w-4 text-destructive shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-destructive">Trial Expired</p>
          <p className="text-[11px] text-muted-foreground">
            You're on the {PLAN_LABELS[plan]}. Upgrade to unlock more features.
          </p>
        </div>
        <Zap className="h-4 w-4 text-destructive shrink-0" />
      </div>
    );
  }

  if (!isTrial) return null;

  return (
    <div className="mx-5 mt-4 mb-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 flex items-center gap-3">
      <Crown className="h-4 w-4 text-primary shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-foreground">
          Free Trial — <span className="text-primary font-semibold">{trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""}</span> remaining
        </p>
        <p className="text-[11px] text-muted-foreground">
          Preview all plans. Switch plans below to explore features.
        </p>
      </div>
    </div>
  );
}
