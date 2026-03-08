import { useEffect, useState, useCallback } from "react";
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Users,
  Calendar, ArrowUpRight, ArrowDownRight, BarChart3,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format, subDays, startOfDay, startOfMonth, subMonths } from "date-fns";

const formatPrice = (n: number) => `UGX ${n.toLocaleString()}`;
const formatShort = (n: number) => n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(0)}K` : n.toString();

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

type Period = "7d" | "30d" | "90d";

export default function AnalyticsPage() {
  const { businessId } = useAuth();
  const [period, setPeriod] = useState<Period>("30d");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const periodDays = period === "7d" ? 7 : period === "30d" ? 30 : 90;

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const start = startOfDay(subDays(new Date(), periodDays)).toISOString();
      const prevStart = startOfDay(subDays(new Date(), periodDays * 2)).toISOString();

      const [salesRes, prevSalesRes, productsRes, customersRes, saleItemsRes, expensesRes] = await Promise.all([
        supabase.from("sales").select("*").gte("created_at", start).order("created_at", { ascending: true }),
        supabase.from("sales").select("total_amount, created_at").gte("created_at", prevStart).lt("created_at", start),
        supabase.from("products").select("id, name, in_stock, base_price, cost_price, category"),
        supabase.from("customers").select("id, total_spent, created_at"),
        supabase.from("sale_items").select("product_name, quantity, total_price, unit_price, created_at").gte("created_at", start),
        supabase.from("expenses").select("amount, category, created_at").gte("created_at", start),
      ]);

      const sales = (salesRes.data as any[]) || [];
      const prevSales = (prevSalesRes.data as any[]) || [];
      const products = (productsRes.data as any[]) || [];
      const customers = (customersRes.data as any[]) || [];
      const saleItems = (saleItemsRes.data as any[]) || [];
      const expenses = (expensesRes.data as any[]) || [];

      // KPI calculations
      const totalRevenue = sales.reduce((s, r) => s + (r.total_amount || 0), 0);
      const prevRevenue = prevSales.reduce((s, r) => s + (r.total_amount || 0), 0);
      const revenueChange = prevRevenue > 0 ? Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 100) : totalRevenue > 0 ? 100 : 0;

      const totalTransactions = sales.length;
      const prevTransactions = prevSales.length;
      const txChange = prevTransactions > 0 ? Math.round(((totalTransactions - prevTransactions) / prevTransactions) * 100) : totalTransactions > 0 ? 100 : 0;

      const avgOrderValue = totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0;
      const prevAOV = prevTransactions > 0 ? Math.round(prevRevenue / prevTransactions) : 0;
      const aovChange = prevAOV > 0 ? Math.round(((avgOrderValue - prevAOV) / prevAOV) * 100) : 0;

      const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);
      const grossProfit = totalRevenue - totalExpenses;

      // Revenue trend (daily)
      const revenueByDay: Record<string, number> = {};
      for (let i = periodDays - 1; i >= 0; i--) {
        const d = subDays(new Date(), i);
        const key = format(d, period === "7d" ? "EEE" : "MMM dd");
        revenueByDay[key] = 0;
      }
      sales.forEach((s: any) => {
        const key = format(new Date(s.created_at), period === "7d" ? "EEE" : "MMM dd");
        if (revenueByDay[key] !== undefined) revenueByDay[key] += s.total_amount || 0;
      });
      const revenueTrend = Object.entries(revenueByDay).map(([name, revenue]) => ({ name, revenue }));

      // Payment method breakdown
      const paymentMethods: Record<string, number> = {};
      sales.forEach((s: any) => {
        const m = s.payment_method || "Cash";
        paymentMethods[m] = (paymentMethods[m] || 0) + (s.total_amount || 0);
      });
      const paymentBreakdown = Object.entries(paymentMethods).map(([name, value]) => ({ name, value }));

      // Top products
      const productMap = new Map<string, { units: number; revenue: number }>();
      saleItems.forEach((si: any) => {
        const existing = productMap.get(si.product_name) || { units: 0, revenue: 0 };
        productMap.set(si.product_name, {
          units: existing.units + (si.quantity || 1),
          revenue: existing.revenue + (si.total_price || 0),
        });
      });
      const topProducts = Array.from(productMap.entries())
        .map(([name, d]) => ({ name: name.length > 20 ? name.slice(0, 18) + "…" : name, ...d }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 8);

      // Category breakdown
      const categoryMap: Record<string, number> = {};
      products.forEach((p: any) => {
        categoryMap[p.category] = (categoryMap[p.category] || 0) + 1;
      });
      const categoryBreakdown = Object.entries(categoryMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);

      // Expense breakdown by category
      const expCatMap: Record<string, number> = {};
      expenses.forEach((e: any) => {
        expCatMap[e.category || "General"] = (expCatMap[e.category || "General"] || 0) + (e.amount || 0);
      });
      const expenseBreakdown = Object.entries(expCatMap).map(([name, value]) => ({ name, value }));

      // Sales by hour (for current period)
      const hourMap: Record<number, number> = {};
      for (let h = 0; h < 24; h++) hourMap[h] = 0;
      sales.forEach((s: any) => {
        const h = new Date(s.created_at).getHours();
        hourMap[h] += s.total_amount || 0;
      });
      const salesByHour = Object.entries(hourMap).map(([hour, amount]) => ({
        hour: `${parseInt(hour) % 12 || 12}${parseInt(hour) < 12 ? "am" : "pm"}`,
        amount,
      }));

      // New customers in period
      const newCustomers = customers.filter(c => c.created_at >= start).length;

      setData({
        totalRevenue, revenueChange, totalTransactions, txChange,
        avgOrderValue, aovChange, grossProfit, totalExpenses,
        revenueTrend, paymentBreakdown, topProducts, categoryBreakdown,
        expenseBreakdown, salesByHour, newCustomers,
        totalProducts: products.length, totalCustomers: customers.length,
      });
    } catch (err) {
      console.error("Analytics fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [businessId, periodDays, period]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data) return null;

  const kpis = [
    { label: "Total Revenue", value: formatPrice(data.totalRevenue), change: data.revenueChange, icon: DollarSign },
    { label: "Transactions", value: data.totalTransactions.toString(), change: data.txChange, icon: ShoppingCart },
    { label: "Avg Order Value", value: formatPrice(data.avgOrderValue), change: data.aovChange, icon: BarChart3 },
    { label: "New Customers", value: data.newCustomers.toString(), change: null, icon: Users },
  ];

  const tooltipStyle = {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "10px",
    color: "hsl(var(--foreground))",
    fontSize: "12px",
    padding: "8px 12px",
  };

  return (
    <div className="space-y-5 md:space-y-6 animate-fade-in max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[22px] md:text-[28px] font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground text-[13px] mt-0.5">Business performance insights</p>
        </div>
        <div className="flex gap-1.5 bg-secondary/60 p-1 rounded-xl">
          {(["7d", "30d", "90d"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                period === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p === "7d" ? "7 Days" : p === "30d" ? "30 Days" : "90 Days"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi, i) => (
          <div key={kpi.label} className="stat-card min-h-[100px]" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-muted-foreground text-[11px] sm:text-[12px]">{kpi.label}</span>
              <div className="w-8 h-8 rounded-xl bg-secondary/80 flex items-center justify-center shrink-0">
                <kpi.icon className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-end gap-1">
              <span className="text-[16px] sm:text-[22px] font-semibold tracking-tight leading-none">{kpi.value}</span>
              {kpi.change !== null && (
                <span className={`text-[10px] font-medium flex items-center gap-0.5 ${kpi.change >= 0 ? "text-success" : "text-destructive"}`}>
                  {kpi.change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {kpi.change >= 0 ? "+" : ""}{kpi.change}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Revenue + Profit Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-success/15 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-success" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Gross Profit</p>
            <p className="text-[16px] font-semibold text-success">{formatPrice(data.grossProfit)}</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-destructive/15 flex items-center justify-center">
            <TrendingDown className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Total Expenses</p>
            <p className="text-[16px] font-semibold text-destructive">{formatPrice(data.totalExpenses)}</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Products / Customers</p>
            <p className="text-[16px] font-semibold">{data.totalProducts} / {data.totalCustomers}</p>
          </div>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="glass-card p-5 md:p-6">
        <h3 className="font-semibold text-[15px] mb-4 tracking-tight">Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data.revenueTrend}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} interval={period === "90d" ? 6 : period === "30d" ? 3 : 0} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={formatShort} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [formatPrice(v), "Revenue"]} />
            <Area type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" fill="url(#revenueGradient)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Top Products + Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Products Bar Chart */}
        <div className="glass-card p-5 md:p-6">
          <h3 className="font-semibold text-[15px] mb-4 tracking-tight">Top Products by Revenue</h3>
          {data.topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.topProducts} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={formatShort} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} width={100} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [formatPrice(v), "Revenue"]} />
                <Bar dataKey="revenue" fill="hsl(var(--chart-1))" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-[13px] text-center py-16">No sales data yet</p>
          )}
        </div>

        {/* Payment Methods Pie */}
        <div className="glass-card p-5 md:p-6">
          <h3 className="font-semibold text-[15px] mb-4 tracking-tight">Payment Methods</h3>
          {data.paymentBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={data.paymentBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                  {data.paymentBreakdown.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [formatPrice(v), "Amount"]} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-[13px] text-center py-16">No payment data yet</p>
          )}
        </div>
      </div>

      {/* Sales by Hour + Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-5 md:p-6">
          <h3 className="font-semibold text-[15px] mb-4 tracking-tight">Sales by Hour of Day</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.salesByHour}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} interval={2} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={formatShort} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [formatPrice(v), "Sales"]} />
              <Bar dataKey="amount" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5 md:p-6">
          <h3 className="font-semibold text-[15px] mb-4 tracking-tight">Product Categories</h3>
          {data.categoryBreakdown.length > 0 ? (
            <div className="space-y-3">
              {data.categoryBreakdown.map((cat: any, i: number) => {
                const max = Math.max(...data.categoryBreakdown.map((c: any) => c.value));
                const pct = max > 0 ? (cat.value / max) * 100 : 0;
                return (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[13px] font-medium">{cat.name}</span>
                      <span className="text-[12px] text-muted-foreground">{cat.value} products</span>
                    </div>
                    <div className="h-2 bg-secondary/60 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-[13px] text-center py-16">No products yet</p>
          )}
        </div>
      </div>

      {/* Expense Breakdown */}
      {data.expenseBreakdown.length > 0 && (
        <div className="glass-card p-5 md:p-6">
          <h3 className="font-semibold text-[15px] mb-4 tracking-tight">Expense Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {data.expenseBreakdown.map((exp: any, i: number) => (
              <div key={exp.name} className="p-3 rounded-xl bg-secondary/40 border border-border/20">
                <p className="text-[11px] text-muted-foreground mb-1">{exp.name}</p>
                <p className="text-[15px] font-semibold">{formatPrice(exp.value)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
