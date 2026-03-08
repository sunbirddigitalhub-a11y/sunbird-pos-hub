import { useEffect, useState, useCallback } from "react";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Users, AlertTriangle, Plus, UserPlus, FileText } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { format, startOfDay, subDays } from "date-fns";

const formatUGX = (value: number) => `${(value / 1000000).toFixed(1)}M`;
const formatPrice = (n: number) => `UGX ${n.toLocaleString()}`;

interface DashboardStats {
  todaySales: number;
  todayTransactions: number;
  totalRevenue: number;
  totalProducts: number;
  lowStockCount: number;
  totalCustomers: number;
  yesterdaySales: number;
  weeklyData: { name: string; sales: number }[];
  recentSales: { id: string; customer_name: string; total_amount: number; created_at: string; payment_method: string; sale_number: string }[];
  topProducts: { name: string; units: number; revenue: number }[];
  lowStockItems: { name: string; in_stock: number }[];
}

const Dashboard = () => {
  const { businessId } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      const today = startOfDay(new Date()).toISOString();
      const yesterday = startOfDay(subDays(new Date(), 1)).toISOString();
      const weekAgo = startOfDay(subDays(new Date(), 7)).toISOString();

      const [salesRes, productsRes, customersRes, saleItemsRes] = await Promise.all([
        supabase.from("sales").select("*").gte("created_at", weekAgo).order("created_at", { ascending: false }),
        supabase.from("products").select("id, name, in_stock, base_price"),
        supabase.from("customers").select("id"),
        supabase.from("sale_items").select("product_name, quantity, total_price, created_at").gte("created_at", weekAgo),
      ]);

      const sales = (salesRes.data as any[]) || [];
      const products = (productsRes.data as any[]) || [];
      const customers = (customersRes.data as any[]) || [];
      const saleItems = (saleItemsRes.data as any[]) || [];

      const todaySales = sales.filter(s => s.created_at >= today);
      const yesterdaySales = sales.filter(s => s.created_at >= yesterday && s.created_at < today);

      const todayTotal = todaySales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
      const yesterdayTotal = yesterdaySales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
      const totalRevenue = sales.reduce((sum, s) => sum + (s.total_amount || 0), 0);

      const lowStock = products.filter(p => p.in_stock > 0 && p.in_stock <= 5);

      // Weekly chart data
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const weeklyData: { name: string; sales: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = subDays(new Date(), i);
        const dayStart = startOfDay(d).toISOString();
        const dayEnd = startOfDay(subDays(d, -1)).toISOString();
        const daySales = sales.filter(s => s.created_at >= dayStart && s.created_at < dayEnd);
        weeklyData.push({
          name: dayNames[d.getDay()],
          sales: daySales.reduce((sum, s) => sum + (s.total_amount || 0), 0),
        });
      }

      // Top products by revenue
      const productMap = new Map<string, { units: number; revenue: number }>();
      saleItems.forEach((si: any) => {
        const existing = productMap.get(si.product_name) || { units: 0, revenue: 0 };
        productMap.set(si.product_name, {
          units: existing.units + (si.quantity || 1),
          revenue: existing.revenue + (si.total_price || 0),
        });
      });
      const topProducts = Array.from(productMap.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      const recentSales = todaySales.slice(0, 5).map((s: any) => ({
        id: s.id,
        customer_name: s.customer_name || "Walk-in",
        total_amount: s.total_amount,
        created_at: s.created_at,
        payment_method: s.payment_method,
        sale_number: s.sale_number,
      }));

      setStats({
        todaySales: todayTotal,
        todayTransactions: todaySales.length,
        totalRevenue,
        totalProducts: products.length,
        lowStockCount: lowStock.length,
        totalCustomers: customers.length,
        yesterdaySales: yesterdayTotal,
        weeklyData,
        recentSales,
        topProducts,
        lowStockItems: lowStock.slice(0, 5).map(p => ({ name: p.name, in_stock: p.in_stock })),
      });
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!stats) return null;

  const salesChange = stats.yesterdaySales > 0
    ? Math.round(((stats.todaySales - stats.yesterdaySales) / stats.yesterdaySales) * 100)
    : stats.todaySales > 0 ? 100 : 0;

  const statCards = [
    { label: "Today's Sales", value: formatPrice(stats.todaySales), change: `${salesChange >= 0 ? "+" : ""}${salesChange}%`, up: salesChange >= 0, icon: DollarSign },
    { label: "Transactions", value: stats.todayTransactions.toString(), change: `today`, up: true, icon: ShoppingCart },
    { label: "Products in Stock", value: stats.totalProducts.toString(), change: `${stats.lowStockCount} low`, up: stats.lowStockCount === 0, icon: Package },
    { label: "Total Customers", value: stats.totalCustomers.toString(), change: "all time", up: true, icon: Users },
  ];

  return (
    <div className="space-y-5 md:space-y-6 animate-fade-in max-w-7xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] md:text-[28px] font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-[13px] md:text-[14px] mt-0.5">Welcome back. Here's your business overview.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => navigate("/pos")} className="rounded-xl h-10 md:h-9 text-[13px] min-w-[44px]">
            <Plus className="h-3.5 w-3.5 mr-1.5" /> New Sale
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate("/products")} className="rounded-xl h-10 md:h-9 text-[13px] min-w-[44px]">
            <Package className="h-3.5 w-3.5 mr-1.5" /> Add Product
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((stat, i) => (
          <div key={stat.label} className="stat-card" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground text-[12px] sm:text-[13px]">{stat.label}</span>
              <div className="w-8 h-8 rounded-xl bg-secondary/80 flex items-center justify-center">
                <stat.icon className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-[18px] sm:text-[24px] font-semibold tracking-tight">{stat.value}</span>
              <span className={`text-[11px] font-medium flex items-center gap-0.5 mb-1 ${stat.up ? "text-success" : "text-destructive"}`}>
                {stat.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Low Stock Alerts */}
      {stats.lowStockItems.length > 0 && (
        <div className="glass-card p-4 border-warning/30">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h3 className="font-semibold text-[14px]">Low Stock Alerts</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.lowStockItems.map((item) => (
              <span key={item.name} className="text-[12px] px-3 py-1.5 rounded-lg bg-warning/10 text-warning border border-warning/20">
                {item.name} — {item.in_stock} left
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Charts + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="font-semibold text-[15px] mb-5 tracking-tight">Weekly Revenue</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={stats.weeklyData}>
              <defs>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(43, 72%, 55%)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="hsl(43, 72%, 55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 8%, 14%)" vertical={false} />
              <XAxis dataKey="name" stroke="hsl(220, 5%, 40%)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(220, 5%, 40%)" fontSize={12} tickFormatter={formatUGX} tickLine={false} axisLine={false} />
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
                formatter={(value: number) => [formatPrice(value), "Sales"]}
              />
              <Area type="monotone" dataKey="sales" stroke="hsl(43, 72%, 55%)" fill="url(#goldGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-semibold text-[15px] mb-5 tracking-tight">Top Products</h3>
          {stats.topProducts.length > 0 ? (
            <div className="space-y-4">
              {stats.topProducts.map((product, i) => (
                <div key={product.name} className="flex items-center gap-3">
                  <span className="text-[12px] font-bold text-primary/70 w-5 text-right">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate">{product.name}</p>
                    <p className="text-[11px] text-muted-foreground">{product.units} units</p>
                  </div>
                  <span className="text-[13px] font-semibold text-primary">
                    {formatUGX(product.revenue)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-[13px] text-center py-10">No sales this week</p>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border/30 flex items-center justify-between">
          <h3 className="font-semibold text-[15px] tracking-tight">Today's Transactions</h3>
          <Button size="sm" variant="ghost" onClick={() => navigate("/sales")} className="text-[12px] text-primary">
            View All
          </Button>
        </div>
        {stats.recentSales.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/20">
                  <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-6">Sale #</th>
                  <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-6">Customer</th>
                  <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-6">Amount</th>
                  <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-6">Payment</th>
                  <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-6">Time</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentSales.map((sale) => (
                  <tr key={sale.id} className="border-b border-border/10 last:border-0 hover:bg-secondary/20 transition-colors duration-200">
                    <td className="py-3 px-6 text-[13px] font-mono text-muted-foreground">{sale.sale_number}</td>
                    <td className="py-3 px-6 text-[13px] font-medium">{sale.customer_name}</td>
                    <td className="py-3 px-6 text-[13px] font-medium text-primary">{formatPrice(sale.total_amount)}</td>
                    <td className="py-3 px-6">
                      <span className="text-[11px] px-2.5 py-1 rounded-full font-medium bg-success/10 text-success">
                        {sale.payment_method}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-[13px] text-muted-foreground">
                      {format(new Date(sale.created_at), "h:mm a")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted-foreground text-[13px] text-center py-10">No transactions today</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
