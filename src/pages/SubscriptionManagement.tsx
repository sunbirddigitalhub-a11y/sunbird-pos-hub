import { useEffect, useState, useCallback } from "react";
import { Navigate } from "react-router-dom";
import {
  Crown, Users, Shield, ShieldOff, Key, Copy, Check, RefreshCw,
  AlertTriangle, Clock, CheckCircle2, XCircle, Search, Filter,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PLAN_LABELS, PLAN_PRICES } from "@/hooks/useSubscription";
import type { PlanType } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

interface SubRecord {
  id: string;
  user_id: string;
  plan: PlanType;
  is_trial: boolean;
  is_active: boolean;
  trial_start: string;
  trial_end: string;
  created_at: string;
  // joined from profiles
  full_name: string;
  email: string;
  business_name: string;
}

interface ActivationCode {
  id: string;
  code: string;
  plan: string;
  duration_days: number;
  is_used: boolean;
  used_by: string | null;
  used_at: string | null;
  created_at: string;
  expires_at: string | null;
}

type TabKey = "active" | "expiring" | "expired" | "codes";

const tabConfig: { key: TabKey; label: string; icon: typeof CheckCircle2 }[] = [
  { key: "active", label: "Active", icon: CheckCircle2 },
  { key: "expiring", label: "Expiring Soon", icon: AlertTriangle },
  { key: "expired", label: "Expired", icon: XCircle },
  { key: "codes", label: "Activation Codes", icon: Key },
];

const planBadge: Record<string, string> = {
  basic: "bg-muted text-muted-foreground",
  business: "bg-primary/15 text-primary",
  enterprise: "bg-chart-3/15 text-chart-3",
};

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const segments = Array.from({ length: 4 }, () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
  );
  return segments.join("-");
}

function daysLeft(trialEnd: string): number {
  return Math.max(0, Math.ceil((new Date(trialEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

const SubscriptionManagement = () => {
  const { user, isGrandmaster, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<TabKey>("active");
  const [subs, setSubs] = useState<SubRecord[]>([]);
  const [codes, setCodes] = useState<ActivationCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Code generation dialog
  const [showGenerate, setShowGenerate] = useState(false);
  const [genPlan, setGenPlan] = useState<PlanType>("basic");
  const [genDuration, setGenDuration] = useState(30);
  const [genCount, setGenCount] = useState(1);
  const [generating, setGenerating] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user || !isGrandmaster) return;
    setLoading(true);
    try {
      // Fetch subscriptions with profile data
      const { data: subsData } = await supabase
        .from("subscriptions" as any)
        .select("*")
        .order("created_at", { ascending: false });

      const subsList = (subsData as any[]) || [];
      const userIds = subsList.map((s: any) => s.user_id);

      // Fetch profiles for those users
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email, business_id");

      // Fetch business names
      const { data: businesses } = await supabase
        .from("businesses" as any)
        .select("id, name");

      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
      const bizMap = new Map(((businesses as any[]) || []).map((b: any) => [b.id, b.name]));

      const merged: SubRecord[] = subsList.map((s: any) => {
        const p = profileMap.get(s.user_id) as any;
        return {
          ...s,
          full_name: p?.full_name || "Unknown",
          email: p?.email || "",
          business_name: p?.business_id ? (bizMap.get(p.business_id) || "—") : "—",
        };
      });

      setSubs(merged);

      // Fetch activation codes
      const { data: codesData } = await supabase
        .from("activation_codes" as any)
        .select("*")
        .order("created_at", { ascending: false });

      setCodes((codesData as any[]) || []);
    } catch (err) {
      console.error("Error fetching subscription data:", err);
    } finally {
      setLoading(false);
    }
  }, [user, isGrandmaster]);

  useEffect(() => {
    if (!authLoading && isGrandmaster) fetchData();
  }, [authLoading, isGrandmaster, fetchData]);

  if (authLoading) return null;
  if (!user || !isGrandmaster) return <Navigate to="/dashboard" replace />;

  const now = Date.now();
  const filtered = subs.filter((s) => {
    const q = search.toLowerCase();
    if (q && !s.full_name.toLowerCase().includes(q) && !s.email.toLowerCase().includes(q)) return false;

    const remaining = daysLeft(s.trial_end);
    const isExpired = s.is_trial && remaining <= 0;
    const isExpiring = s.is_trial && remaining > 0 && remaining <= 3;

    if (tab === "active") return s.is_active && !isExpired;
    if (tab === "expiring") return s.is_trial && !isExpired && remaining <= 3;
    if (tab === "expired") return isExpired || !s.is_active;
    return true;
  });

  const toggleAccess = async (sub: SubRecord) => {
    const newActive = !sub.is_active;
    await supabase
      .from("subscriptions" as any)
      .update({ is_active: newActive, updated_at: new Date().toISOString() } as any)
      .eq("id", sub.id);
    toast.success(newActive ? `Access granted for ${sub.full_name}` : `Access revoked for ${sub.full_name}`);
    fetchData();
  };

  const handleGenerateCodes = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      const newCodes = Array.from({ length: genCount }, () => ({
        code: generateCode(),
        plan: genPlan,
        duration_days: genDuration,
        created_by: user.id,
        expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90-day expiry
      }));

      const { error } = await supabase.from("activation_codes" as any).insert(newCodes as any);
      if (error) throw error;
      toast.success(`${genCount} activation code(s) generated!`);
      setShowGenerate(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to generate codes");
    } finally {
      setGenerating(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("Code copied to clipboard");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const activeCount = subs.filter((s) => s.is_active && !(s.is_trial && daysLeft(s.trial_end) <= 0)).length;
  const expiringCount = subs.filter((s) => s.is_trial && daysLeft(s.trial_end) > 0 && daysLeft(s.trial_end) <= 3).length;
  const expiredCount = subs.filter((s) => (s.is_trial && daysLeft(s.trial_end) <= 0) || !s.is_active).length;
  const unusedCodes = codes.filter((c) => !c.is_used).length;

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/15 flex items-center justify-center">
            <Crown className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-[24px] font-bold tracking-tight">Subscription Management</h1>
            <p className="text-muted-foreground text-[13px]">Manage all user subscriptions and activation codes</p>
          </div>
        </div>
        <Button onClick={() => setShowGenerate(true)} className="rounded-xl h-10 gap-2 text-[13px]">
          <Key className="h-4 w-4" /> Generate Codes
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Active", value: activeCount, icon: CheckCircle2, color: "text-success" },
          { label: "Expiring Soon", value: expiringCount, icon: AlertTriangle, color: "text-warning" },
          { label: "Expired", value: expiredCount, icon: XCircle, color: "text-destructive" },
          { label: "Unused Codes", value: unusedCodes, icon: Key, color: "text-primary" },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`h-4 w-4 ${s.color}`} />
              <span className="text-[11px] text-muted-foreground">{s.label}</span>
            </div>
            <p className="text-[22px] font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-secondary/40 w-fit">
        {tabConfig.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${
              tab === t.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      {tab !== "codes" && (
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="pl-9 rounded-xl h-10 text-[13px]"
          />
        </div>
      )}

      {/* Subscription Table */}
      {tab !== "codes" && (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Business</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Plan</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Trial</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {filtered.map((sub) => {
                  const remaining = daysLeft(sub.trial_end);
                  const isExpired = sub.is_trial && remaining <= 0;
                  return (
                    <tr key={sub.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium">{sub.full_name}</p>
                        <p className="text-[11px] text-muted-foreground">{sub.email}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{sub.business_name}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] px-2 py-1 rounded-full font-medium ${planBadge[sub.plan] || planBadge.basic}`}>
                          {PLAN_LABELS[sub.plan]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {sub.is_active && !isExpired ? (
                          <span className="text-[11px] px-2 py-1 rounded-full font-medium bg-success/15 text-success">Active</span>
                        ) : (
                          <span className="text-[11px] px-2 py-1 rounded-full font-medium bg-destructive/15 text-destructive">
                            {isExpired ? "Expired" : "Revoked"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {sub.is_trial ? (
                          <span className={`text-[11px] ${remaining <= 3 ? "text-warning" : "text-muted-foreground"}`}>
                            {isExpired ? "Ended" : `${remaining}d left`}
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">Paid</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant={sub.is_active ? "destructive" : "default"}
                          className="rounded-lg h-8 text-[12px] gap-1.5"
                          onClick={() => toggleAccess(sub)}
                        >
                          {sub.is_active ? (
                            <><ShieldOff className="h-3.5 w-3.5" /> Revoke</>
                          ) : (
                            <><Shield className="h-3.5 w-3.5" /> Grant</>
                          )}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-muted-foreground">
                      No subscriptions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Activation Codes Tab */}
      {tab === "codes" && (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Code</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Plan</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Duration</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Created</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {codes.map((c) => (
                  <tr key={c.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <code className="text-[12px] font-mono bg-secondary/60 px-2 py-1 rounded-lg">{c.code}</code>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] px-2 py-1 rounded-full font-medium ${planBadge[c.plan] || planBadge.basic}`}>
                        {PLAN_LABELS[c.plan as PlanType] || c.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.duration_days} days</td>
                    <td className="px-4 py-3">
                      {c.is_used ? (
                        <span className="text-[11px] px-2 py-1 rounded-full font-medium bg-muted text-muted-foreground">Used</span>
                      ) : (
                        <span className="text-[11px] px-2 py-1 rounded-full font-medium bg-success/15 text-success">Available</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-[12px]">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!c.is_used && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-lg h-8 text-[12px] gap-1.5"
                          onClick={() => copyCode(c.code)}
                        >
                          {copiedCode === c.code ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                          {copiedCode === c.code ? "Copied" : "Copy"}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {codes.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-muted-foreground">
                      No activation codes generated yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Generate Codes Dialog */}
      <Dialog open={showGenerate} onOpenChange={setShowGenerate}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[18px] font-bold">Generate Activation Codes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">Plan</label>
              <Select value={genPlan} onValueChange={(v) => setGenPlan(v as PlanType)}>
                <SelectTrigger className="rounded-xl h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic Plan</SelectItem>
                  <SelectItem value="business">Business Plan</SelectItem>
                  <SelectItem value="enterprise">Enterprise Plan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">Duration (days)</label>
              <Select value={String(genDuration)} onValueChange={(v) => setGenDuration(Number(v))}>
                <SelectTrigger className="rounded-xl h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days (1 month)</SelectItem>
                  <SelectItem value="90">90 days (3 months)</SelectItem>
                  <SelectItem value="180">180 days (6 months)</SelectItem>
                  <SelectItem value="365">365 days (1 year)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">Number of Codes</label>
              <Select value={String(genCount)} onValueChange={(v) => setGenCount(Number(v))}>
                <SelectTrigger className="rounded-xl h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 3, 5, 10, 20].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n} code{n > 1 ? "s" : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerate(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleGenerateCodes} disabled={generating} className="rounded-xl gap-2">
              {generating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionManagement;
