import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Users } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const salesData = [
  { name: "Mon", sales: 2400000, profit: 480000 },
  { name: "Tue", sales: 1800000, profit: 360000 },
  { name: "Wed", sales: 3200000, profit: 640000 },
  { name: "Thu", sales: 2800000, profit: 560000 },
  { name: "Fri", sales: 4100000, profit: 820000 },
  { name: "Sat", sales: 5200000, profit: 1040000 },
  { name: "Sun", sales: 3600000, profit: 720000 },
];

const topProducts = [
  { name: "iPhone 15 Pro", units: 12, revenue: 36000000 },
  { name: "Samsung S24", units: 8, revenue: 20000000 },
  { name: "MacBook Air M3", units: 5, revenue: 27500000 },
  { name: "Tecno Spark 20", units: 18, revenue: 10800000 },
  { name: "iPad Air", units: 4, revenue: 12000000 },
];

const recentSales = [
  { id: "TXN-001", customer: "John Mukasa", item: "iPhone 15 Pro Max", amount: "UGX 4,200,000", time: "2 min ago", status: "completed" },
  { id: "TXN-002", customer: "Sarah Nantongo", item: "Samsung Galaxy S24", amount: "UGX 2,500,000", time: "15 min ago", status: "completed" },
  { id: "TXN-003", customer: "David Okello", item: "MacBook Air M3", amount: "UGX 5,500,000", time: "1 hr ago", status: "emi" },
  { id: "TXN-004", customer: "Grace Achieng", item: "Tecno Spark 20 Pro", amount: "UGX 600,000", time: "2 hr ago", status: "completed" },
];

const stats = [
  { label: "Today's Sales", value: "UGX 12.8M", change: "+12%", up: true, icon: DollarSign },
  { label: "Transactions", value: "34", change: "+8%", up: true, icon: ShoppingCart },
  { label: "Items in Stock", value: "247", change: "-3", up: false, icon: Package },
  { label: "Active Customers", value: "89", change: "+5", up: true, icon: Users },
];

const formatUGX = (value: number) => `${(value / 1000000).toFixed(1)}M`;

const Dashboard = () => {
  return (
    <div className="space-y-8 animate-fade-in max-w-7xl">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-[14px] mt-1">Welcome back. Here's your business overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={stat.label} className="stat-card" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground text-[13px]">{stat.label}</span>
              <div className="w-8 h-8 rounded-xl bg-secondary/80 flex items-center justify-center">
                <stat.icon className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-[24px] font-semibold tracking-tight">{stat.value}</span>
              <span className={`text-[12px] font-medium flex items-center gap-0.5 mb-1 ${stat.up ? "text-success" : "text-destructive"}`}>
                {stat.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="font-semibold text-[15px] mb-5 tracking-tight">Weekly Revenue</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={salesData}>
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
          <div className="space-y-4">
            {topProducts.map((product, i) => (
              <div key={product.name} className="flex items-center gap-3">
                <span className="text-[12px] font-bold text-primary/70 w-5 text-right">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate">{product.name}</p>
                  <p className="text-[11px] text-muted-foreground">{product.units} units</p>
                </div>
                <span className="text-[13px] font-semibold text-primary">
                  {(product.revenue / 1000000).toFixed(1)}M
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border/30">
          <h3 className="font-semibold text-[15px] tracking-tight">Recent Transactions</h3>
        </div>
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
              {recentSales.map((sale) => (
                <tr key={sale.id} className="border-b border-border/10 last:border-0 hover:bg-secondary/20 transition-colors duration-200">
                  <td className="py-3.5 px-6 text-[13px] font-mono text-muted-foreground">{sale.id}</td>
                  <td className="py-3.5 px-6 text-[13px] font-medium">{sale.customer}</td>
                  <td className="py-3.5 px-6 text-[13px] text-secondary-foreground">{sale.item}</td>
                  <td className="py-3.5 px-6 text-[13px] font-medium text-primary">{sale.amount}</td>
                  <td className="py-3.5 px-6 text-[13px] text-muted-foreground">{sale.time}</td>
                  <td className="py-3.5 px-6">
                    <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${
                      sale.status === "completed"
                        ? "bg-success/10 text-success"
                        : "bg-warning/10 text-warning"
                    }`}>
                      {sale.status === "emi" ? "EMI" : "Paid"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
