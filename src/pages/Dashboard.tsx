import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Users } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
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
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back. Here's your business overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-muted-foreground text-sm">{stat.label}</span>
              <stat.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold">{stat.value}</span>
              <span className={`text-xs font-medium flex items-center gap-0.5 mb-1 ${stat.up ? "text-success" : "text-destructive"}`}>
                {stat.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card p-5">
          <h3 className="font-display font-semibold text-base mb-4">Weekly Revenue</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(43, 72%, 55%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(43, 72%, 55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 12%, 18%)" />
              <XAxis dataKey="name" stroke="hsl(220, 10%, 55%)" fontSize={12} />
              <YAxis stroke="hsl(220, 10%, 55%)" fontSize={12} tickFormatter={formatUGX} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(220, 14%, 11%)",
                  border: "1px solid hsl(220, 12%, 18%)",
                  borderRadius: "8px",
                  color: "hsl(40, 20%, 92%)",
                }}
                formatter={(value: number) => [`UGX ${value.toLocaleString()}`, "Sales"]}
              />
              <Area type="monotone" dataKey="sales" stroke="hsl(43, 72%, 55%)" fill="url(#goldGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5">
          <h3 className="font-display font-semibold text-base mb-4">Top Products</h3>
          <div className="space-y-3">
            {topProducts.map((product, i) => (
              <div key={product.name} className="flex items-center gap-3">
                <span className="text-xs font-bold text-primary w-5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.units} units</p>
                </div>
                <span className="text-sm font-medium text-primary">
                  {(product.revenue / 1000000).toFixed(1)}M
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Sales */}
      <div className="glass-card p-5">
        <h3 className="font-display font-semibold text-base mb-4">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left text-xs font-medium text-muted-foreground py-3 pr-4">ID</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 pr-4">Customer</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 pr-4">Item</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 pr-4">Amount</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 pr-4">Time</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.map((sale) => (
                <tr key={sale.id} className="border-b border-border/30 last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 pr-4 text-sm font-mono text-muted-foreground">{sale.id}</td>
                  <td className="py-3 pr-4 text-sm font-medium">{sale.customer}</td>
                  <td className="py-3 pr-4 text-sm">{sale.item}</td>
                  <td className="py-3 pr-4 text-sm font-medium text-primary">{sale.amount}</td>
                  <td className="py-3 pr-4 text-sm text-muted-foreground">{sale.time}</td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
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
