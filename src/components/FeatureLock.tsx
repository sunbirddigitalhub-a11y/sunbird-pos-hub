import { Lock } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import type { PlanFeatures } from "@/hooks/useSubscription";

interface FeatureLockProps {
  feature: keyof PlanFeatures;
  children: React.ReactNode;
}

export function FeatureLock({ feature, children }: FeatureLockProps) {
  const { hasFeatureAccess, isGrandmaster } = useSubscription();

  if (isGrandmaster || hasFeatureAccess(feature)) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="pointer-events-none opacity-20 blur-[2px] select-none">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm rounded-xl">
        <div className="flex flex-col items-center gap-3 p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-foreground">Feature Locked</p>
            <p className="text-[13px] text-muted-foreground mt-1">
              Upgrade your plan to access this feature.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
