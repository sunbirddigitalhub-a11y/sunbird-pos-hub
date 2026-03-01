import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Users, Loader2 } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfDay } from "date-fns";

const formatUGX = (value: number) => `${(value / 1000000).toFixed(1)}M`;

interface SaleRow {
  id: string;
  sale_number: string;
  customer_name: string | null;
  total_amount: number;
  payment_method: string;
  created_at: string;
  status: string;
}

interface SaleItemRow {
  product_name: string;
  unit_price: number;
  quantity: number;
  total_price: number;
}

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [todaySales, setTodaySales] = useState(0);
  const [todayTxns, setTodayTxns] = useState(0);
  const [totalStock, setTotalStock] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [weeklyData, setWeeklyData] = useState<{ name: string; sales: number }[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; units: number; revenue: number }[]>([]);
  const [recentSales, setRecentSales] = useState<SaleRow[]>([]);
  const [recentItems, setRecentItems] = useState<Record<string, SaleItemRow[]>>({});

  useEffect(() => {
    const load = async () => {
      const today = startOfDay(new Date()).toISOString();

      // Parallel fetches
      const [salesRes, inventoryRes, customersRes, weekRes, itemsRes] = await Promise.all([
        supabase.from("sales").select("*").gte("created_at", today).order("created_at", { ascending: false }),
        supabase.from("inventory").select("id").eq("status", "In Stock"),
        supabase.from("customers").select("id"),
        // Last 7 days sales
        supabase.from("sales").select("total_amount, created_at").gte("created_at", subDays(new Date(), 7).toISOString()),
        // Recent sale items for top products
        supabase.from("sale_items").select("product_name, unit_price, quantity, total_price, sale_id").order("created_at", { ascending: false }).limit(200),
      ]);

      const sales = (salesRes.data || []) as unknown as SaleRow[];
      setTodaySales(sales.reduce((s, r) => s + r.total_amount, 0));
      setTodayTxns(sales.length);
      setTotalStock((inventoryRes.data || []).length);
      setTotalCustomers((customersRes.data || []).length);

      // Weekly chart
      const dayMap: Record<string, number> = {};
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      for (let i = 6; i >= 0; i--) {
        const d = subDays(new Date(), i);
        dayMap[format(d, "yyyy-MM-dd")] = 0;
      }
      (weekRes.data || []).forEach((r: any) => {
        const key = format(new Date(r.created_at), "yyyy-MM-dd");
        if (dayMap[key] !== undefined) dayMap[key] += r.total_amount;
      });
      setWeeklyData(
        Object.entries(dayMap).map(([date, total]) => ({
          name: days[new Date(date).getDay()],
          sales: total,
        }))
      );

      // Top products
      const prodMap: Record<string, { units: number; revenue: number }> = {};
      const items = (itemsRes.data || []) as unknown as (SaleItemRow & { sale_id: string })[];
      items.forEach((it) => {
        if (!prodMap[it.product_name]) prodMap[it.product_name] = { units: 0, revenue: 0 };
        prodMap[it.product_name].units += it.quantity;
        prodMap[it.product_name].revenue += it.total_price;
      });
      setTopProducts(
        Object.entries(prodMap)
          .map(([name, v]) => ({ name, ...v }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5)
      );

      // Recent sales (last 10)
      const recentRes = await supabase.from("sales").select("*").order("created_at", { ascending: false }).limit(10);
      const recent = (recentRes.data || []) as unknown as SaleRow[];
      setRecentSales(recent);

      // Get items for recent sales
      if (recent.length > 0) {
        const saleIds = recent.map((s) => s.id);
        const riRes = await supabase.from("sale_items").select("sale_id, product_name, unit_price, quantity, total_price").in("sale_id", saleIds);
        const grouped: Record<string, SaleItemRow[]> = {};
        ((riRes.data || []) as unknown as (SaleItemRow & { sale_id: string })[]).forEach((it) => {
          if (!grouped[it.sale_id]) grouped[it.sale_id] = [];
          grouped[it.sale_id].push(it);
        });
        setRecentItems(grouped);
      }

      setLoading(false);
    };
    load();
  }, []);

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  const stats = [
    { label: "Today's Sales", value: `UGX ${formatUGX(todaySales)}`, icon: DollarSign },
    { label: "Transactions", value: String(todayTxns), icon: ShoppingCart },
    { label: "Items in Stock", value: String(totalStock), icon: Package },
    { label: "Customers", value: String(totalCustomers), icon: Users },
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-[14px] mt-1">Welcome back. Here's your business overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={stat.label} className="stat-card" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground text-[13px]">{stat.label}</span>
              <div className="w-8 h-8 rounded-xl bg-secondary/80 flex items-center justify-center">
                <stat.icon className="h-4 w-4 text-primary" />
              </div>
            </div>
            <span className="text-[24px] font-semibold tracking-tight">{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="font-semibold text-[15px] mb-5 tracking-tight">Weekly Revenue</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={weeklyData}>
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
                formatter={(value: number) => [`UGX ${value.toLocaleString()}`, "Sales"]}
              />
              <Area type="monotone" dataKey="sales" stroke="hsl(43, 72%, 55%)" fill="url(#goldGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-semibold text-[15px] mb-5 tracking-tight">Top Products</h3>
          {topProducts.length === 0 ? (
            <p className="text-muted-foreground text-[13px]">No sales data yet</p>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product, i) => (
                <div key={product.name} className="flex items-center gap-3">
                  <span className="text-[12px] font-bold text-primary/70 w-5 text-right">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate">{product.name}</p>
                    <p className="text-[11px] text-muted-foreground">{product.units} units</p>
                  </div>
                  <span className="text-[13px] font-semibold text-primary">{formatUGX(product.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border/30">
          <h3 className="font-semibold text-[15px] tracking-tight">Recent Transactions</h3>
        </div>
        {recentSales.length === 0 ? (
          <p className="text-muted-foreground text-[13px] p-6">No transactions yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/20">
                  <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-6">ID</th>
                  <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-6">Customer</th>
                  <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-6">Item</th>
                  <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-6">Amount</th>
                  <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-6">Time</th>
                  <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-6">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((sale) => {
                  const items = recentItems[sale.id] || [];
                  const itemName = items.length > 0 ? items[0].product_name : "—";
                  return (
                    <tr key={sale.id} className="border-b border-border/10 last:border-0 hover:bg-secondary/20 transition-colors duration-200">
                      <td className="py-3.5 px-6 text-[13px] font-mono text-muted-foreground">{sale.sale_number}</td>
                      <td className="py-3.5 px-6 text-[13px] font-medium">{sale.customer_name || "Walk-in"}</td>
                      <td className="py-3.5 px-6 text-[13px] text-secondary-foreground">{itemName}</td>
                      <td className="py-3.5 px-6 text-[13px] font-medium text-primary">UGX {sale.total_amount.toLocaleString()}</td>
                      <td className="py-3.5 px-6 text-[13px] text-muted-foreground">{timeAgo(sale.created_at)}</td>
                      <td className="py-3.5 px-6">
                        <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${
                          sale.status === "Completed" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                        }`}>
                          {sale.status === "Completed" ? "Paid" : sale.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
