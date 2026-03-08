import { Lock, Zap } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import type { PlanFeatures } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface FeatureLockProps {
  feature: keyof PlanFeatures;
  children: React.ReactNode;
}

export function FeatureLock({ feature, children }: FeatureLockProps) {
  const { hasFeatureAccess, isGrandmaster } = useSubscription();
  const navigate = useNavigate();

  if (isGrandmaster || hasFeatureAccess(feature)) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="pointer-events-none opacity-15 blur-[3px] select-none">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm rounded-xl">
        <div className="flex flex-col items-center gap-4 p-8 text-center max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Lock className="h-7 w-7 text-primary" />
          </div>
          <div>
            <p className="text-[16px] font-semibold text-foreground">Feature Locked</p>
            <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">
              Upgrade your plan to unlock this feature and grow your business.
            </p>
          </div>
          <Button onClick={() => navigate("/upgrade")} className="rounded-xl h-10 px-6 text-[13px]">
            <Zap className="h-3.5 w-3.5 mr-1.5" /> Upgrade Plan
          </Button>
        </div>
      </div>
    </div>
  );
}
