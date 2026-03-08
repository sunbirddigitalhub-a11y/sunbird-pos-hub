import { Lock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ComingSoonPageProps {
  title: string;
  description: string;
  featureName: string;
}

export default function ComingSoonPage({ title, description, featureName }: ComingSoonPageProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in max-w-md mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <Lock className="h-8 w-8 text-primary" />
      </div>
      <h1 className="text-[24px] font-bold tracking-tight mb-2">{title}</h1>
      <p className="text-muted-foreground text-[14px] leading-relaxed mb-6">{description}</p>
      <div className="flex gap-3">
        <Button onClick={() => navigate("/upgrade")} className="rounded-xl h-10 px-6 text-[13px]">
          <Zap className="h-3.5 w-3.5 mr-1.5" /> Upgrade Plan
        </Button>
        <Button variant="outline" onClick={() => navigate(-1)} className="rounded-xl h-10 px-6 text-[13px]">
          Go Back
        </Button>
      </div>
    </div>
  );
}
