import { useEffect, useState } from "react";
import { Users, Crown, TrendingUp, CreditCard, ShieldCheck, BarChart3, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const GRANDMASTER_EMAIL = "sunbirdgroup9@gmail.com";

interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  totalSubscriptions: number;
  trialUsers: number;
  basicUsers: number;
  businessUsers: number;
  enterpriseUsers: number;
  totalRevenue: number;
  totalSales: number;
  totalTransactions: number;
  recentSignups: { email: string; full_name: string; created_at: string }[];
  monthlySales: { month: string; total: number; count: number }[];
}

const formatPrice = (n: number) => `UGX ${n.toLocaleString()}`;
const formatM = (n: number) => n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(0)}K` : n.toString();

const PLAN_COLORS: Record<string, string> = {
  basic: "hsl(220, 8%, 50%)",
  business: "hsl(211, 80%, 55%)",
  enterprise: "hsl(43, 72%, 55%)",
  trial: "hsl(142, 60%, 45%)",
};

const GrandmasterDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.email !== GRANDMASTER_EMAIL) return;
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const [profilesRes, subsRes, salesRes] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("subscriptions" as any).select("*"),
        supabase.from("sales").select("total_amount, created_at"),
      ]);

      const profiles = (profilesRes.data as any[]) || [];
      const subs = (subsRes.data as any[]) || [];
      const sales = (salesRes.data as any[]) || [];

      const activeProfiles = profiles.filter((p: any) => p.status === "active");
      const trialSubs = subs.filter((s: any) => s.is_trial);
      const basicSubs = subs.filter((s: any) => !s.is_trial && s.plan === "basic");
      const businessSubs = subs.filter((s: any) => !s.is_trial && s.plan === "business");
      const enterpriseSubs = subs.filter((s: any) => !s.is_trial && s.plan === "enterprise");

      const totalRevenue = sales.reduce((sum: number, s: any) => sum + (s.total_amount || 0), 0);

      // Monthly sales aggregation (last 6 months)
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const now = new Date();
      const monthlySales: { month: string; total: number; count: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const monthSales = sales.filter((s: any) => s.created_at?.startsWith(monthKey));
        monthlySales.push({
          month: monthNames[d.getMonth()],
          total: monthSales.reduce((sum: number, s: any) => sum + (s.total_amount || 0), 0),
          count: monthSales.length,
        });
      }

      const recentSignups = profiles
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
        .map((p: any) => ({ email: p.email, full_name: p.full_name, created_at: p.created_at }));

      setStats({
        totalUsers: profiles.length,
        activeUsers: activeProfiles.length,
        totalSubscriptions: subs.length,
        trialUsers: trialSubs.length,
        basicUsers: basicSubs.length,
        businessUsers: businessSubs.length,
        enterpriseUsers: enterpriseSubs.length,
        totalRevenue,
        totalSales: sales.length,
        totalTransactions: sales.length,
        recentSignups,
        monthlySales,
      });
    } catch (err) {
      console.error("Error fetching platform stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;
  if (!user || user.email !== GRANDMASTER_EMAIL) return <Navigate to="/dashboard" replace />;

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const planDistribution = [
    { name: "Trial", value: stats.trialUsers, color: PLAN_COLORS.trial },
    { name: "Basic", value: stats.basicUsers, color: PLAN_COLORS.basic },
    { name: "Business", value: stats.businessUsers, color: PLAN_COLORS.business },
    { name: "Enterprise", value: stats.enterpriseUsers, color: PLAN_COLORS.enterprise },
  ].filter((d) => d.value > 0);

  const conversionRate = stats.totalSubscriptions > 0
    ? Math.round(((stats.totalSubscriptions - stats.trialUsers) / stats.totalSubscriptions) * 100)
    : 0;

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-chart-3" },
    { label: "Active Users", value: stats.activeUsers, icon: ShieldCheck, color: "text-success" },
    { label: "Trial Users", value: stats.trialUsers, icon: Clock, color: "text-warning" },
    { label: "Total Revenue", value: formatPrice(stats.totalRevenue), icon: CreditCard, color: "text-primary" },
    { label: "Total Transactions", value: stats.totalTransactions, icon: BarChart3, color: "text-chart-4" },
    { label: "Conversion Rate", value: `${conversionRate}%`, icon: TrendingUp, color: "text-success" },
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-primary/15 flex items-center justify-center">
          <Crown className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-[28px] font-bold tracking-tight">Platform Overview</h1>
          <p className="text-muted-foreground text-[14px] mt-0.5">Grandmaster analytics dashboard</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((stat, i) => (
          <div key={stat.label} className="stat-card" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <p className="text-[20px] font-bold tracking-tight">{stat.value}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly Sales Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="font-semibold text-[15px] mb-5 tracking-tight">Monthly Sales Volume</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats.monthlySales}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 8%, 14%)" vertical={false} />
              <XAxis dataKey="month" stroke="hsl(220, 5%, 40%)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(220, 5%, 40%)" fontSize={12} tickFormatter={formatM} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsla(220, 10%, 10%, 0.9)",
                  border: "1px solid hsl(220, 8%, 18%)",
                  borderRadius: "12px",
                  color: "hsl(0, 0%, 98%)",
                  backdropFilter: "blur(20px)",
                  fontSize: "13px",
                  padding: "10px 14px",
                }}
                formatter={(value: number) => [formatPrice(value), "Revenue"]}
              />
              <Bar dataKey="total" fill="hsl(43, 72%, 55%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Plan Distribution */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-[15px] mb-5 tracking-tight">Subscription Plans</h3>
          {planDistribution.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={planDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value" stroke="none">
                    {planDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {planDistribution.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-[13px]">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-muted-foreground">{d.name}</span>
                    </div>
                    <span className="font-semibold">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-muted-foreground text-[13px] text-center py-10">No subscriptions yet</p>
          )}
        </div>
      </div>

      {/* Recent Signups */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border/30">
          <h3 className="font-semibold text-[15px] tracking-tight">Recent Signups</h3>
        </div>
        <div className="divide-y divide-border/10">
          {stats.recentSignups.map((signup, i) => (
            <div key={i} className="flex items-center gap-3 px-6 py-3.5">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-[11px] font-bold text-primary">
                  {signup.full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium truncate">{signup.full_name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{signup.email}</p>
              </div>
              <span className="text-[11px] text-muted-foreground shrink-0">
                {new Date(signup.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
          {stats.recentSignups.length === 0 && (
            <p className="text-muted-foreground text-[13px] text-center py-8">No users yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GrandmasterDashboard;
