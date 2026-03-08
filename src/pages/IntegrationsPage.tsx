import { useState } from "react";
import {
  Plug, MessageSquare, CreditCard, Smartphone, Mail, Globe,
  Cloud, Database, CheckCircle2, ExternalLink, Lock, Zap,
  BarChart3, Bell, Shield, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: string;
  status: "connected" | "available" | "coming_soon";
  plan: "basic" | "business" | "enterprise";
}

const integrations: Integration[] = [
  // Communication
  { id: "whatsapp", name: "WhatsApp Business", description: "Send receipts and alerts via WhatsApp", icon: MessageSquare, category: "Communication", status: "available", plan: "business" },
  { id: "sms", name: "SMS Notifications", description: "Send SMS alerts for payments and stock", icon: Smartphone, category: "Communication", status: "available", plan: "business" },
  { id: "email", name: "Email Notifications", description: "Automated email reports and alerts", icon: Mail, category: "Communication", status: "available", plan: "basic" },
  // Payments
  { id: "mobile_money", name: "Mobile Money", description: "MTN & Airtel Mobile Money integration", icon: CreditCard, category: "Payments", status: "available", plan: "business" },
  { id: "stripe", name: "Stripe Payments", description: "Accept international card payments", icon: CreditCard, category: "Payments", status: "coming_soon", plan: "enterprise" },
  // Analytics & Reporting
  { id: "google_analytics", name: "Google Analytics", description: "Track customer behavior and traffic", icon: BarChart3, category: "Analytics", status: "available", plan: "enterprise" },
  { id: "custom_reports", name: "Custom Report API", description: "Export data to external BI tools", icon: Database, category: "Analytics", status: "available", plan: "enterprise" },
  // Cloud & Backup
  { id: "cloud_backup", name: "Cloud Backup", description: "Automated daily cloud backups", icon: Cloud, category: "Cloud & Backup", status: "available", plan: "business" },
  { id: "google_drive", name: "Google Drive Sync", description: "Sync reports to Google Drive", icon: Globe, category: "Cloud & Backup", status: "coming_soon", plan: "enterprise" },
  // Security
  { id: "2fa", name: "Two-Factor Auth", description: "Extra security layer for staff logins", icon: Shield, category: "Security", status: "available", plan: "business" },
  { id: "audit_log", name: "Audit Log API", description: "Export detailed audit trails", icon: Bell, category: "Security", status: "available", plan: "enterprise" },
];

const categoryOrder = ["Communication", "Payments", "Analytics", "Cloud & Backup", "Security"];

export default function IntegrationsPage() {
  const { hasFeatureAccess, plan, isGrandmaster } = useSubscription();
  const [enabledIntegrations, setEnabledIntegrations] = useState<Set<string>>(new Set(["email"]));
  const [filter, setFilter] = useState<string>("all");

  const toggleIntegration = (id: string, integration: Integration) => {
    const planLevel = { basic: 0, business: 1, enterprise: 2 };
    const userLevel = isGrandmaster ? 2 : planLevel[plan];
    const requiredLevel = planLevel[integration.plan];

    if (userLevel < requiredLevel) {
      toast({
        title: "Plan upgrade required",
        description: `Upgrade to ${integration.plan.charAt(0).toUpperCase() + integration.plan.slice(1)} to use ${integration.name}.`,
        variant: "destructive",
      });
      return;
    }

    if (integration.status === "coming_soon") {
      toast({ title: "Coming Soon", description: `${integration.name} is under development.` });
      return;
    }

    setEnabledIntegrations((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast({ title: "Disconnected", description: `${integration.name} has been disconnected.` });
      } else {
        next.add(id);
        toast({ title: "Connected", description: `${integration.name} has been enabled.` });
      }
      return next;
    });
  };

  const filtered = filter === "all"
    ? integrations
    : integrations.filter((i) => i.category === filter);

  const grouped = categoryOrder
    .map((cat) => ({
      category: cat,
      items: filtered.filter((i) => i.category === cat),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="space-y-5 md:space-y-6 animate-fade-in max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[22px] md:text-[28px] font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground text-[13px] mt-0.5">Connect your POS with third-party services</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-success/15 flex items-center justify-center">
            <CheckCircle2 className="h-4 w-4 text-success" />
          </div>
          <span className="text-[13px] font-medium">{enabledIntegrations.size} active</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {["all", ...categoryOrder].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap transition-all ${
              filter === cat
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat === "all" ? "All" : cat}
          </button>
        ))}
      </div>

      {/* Integration cards */}
      {grouped.map(({ category, items }) => (
        <div key={category}>
          <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">{category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {items.map((integration) => {
              const isEnabled = enabledIntegrations.has(integration.id);
              const planLevel = { basic: 0, business: 1, enterprise: 2 };
              const userLevel = isGrandmaster ? 2 : planLevel[plan];
              const requiredLevel = planLevel[integration.plan];
              const isLocked = userLevel < requiredLevel;
              const isComingSoon = integration.status === "coming_soon";

              return (
                <div
                  key={integration.id}
                  className={`glass-card p-4 flex items-start gap-4 transition-all ${
                    isEnabled ? "border-primary/30" : ""
                  } ${isLocked || isComingSoon ? "opacity-60" : ""}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isEnabled ? "bg-primary/15" : "bg-secondary/80"
                  }`}>
                    <integration.icon className={`h-5 w-5 ${isEnabled ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[14px] font-medium">{integration.name}</p>
                      {isComingSoon && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">Soon</span>
                      )}
                      {isLocked && !isComingSoon && (
                        <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-[12px] text-muted-foreground mt-0.5">{integration.description}</p>
                    <span className="text-[10px] text-muted-foreground/60 mt-1 inline-block capitalize">{integration.plan} plan</span>
                  </div>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={() => toggleIntegration(integration.id, integration)}
                    disabled={isComingSoon}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* API Keys section */}
      <div className="glass-card p-5 md:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <Plug className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-[15px]">API Access</h3>
            <p className="text-[12px] text-muted-foreground">Connect external tools to your POS data</p>
          </div>
        </div>
        <div className="bg-secondary/40 rounded-xl p-4 border border-border/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium">REST API</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Access your data programmatically</p>
            </div>
            {isGrandmaster || plan === "enterprise" ? (
              <Button size="sm" variant="outline" className="rounded-xl h-9 text-[12px]">
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> View Docs
              </Button>
            ) : (
              <Button size="sm" className="rounded-xl h-9 text-[12px]">
                <Zap className="h-3.5 w-3.5 mr-1.5" /> Enterprise Only
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
