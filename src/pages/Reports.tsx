import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/button";
import { MessageSquare, FileText } from "lucide-react";

const monthlyData = [
  { month: "Jul", revenue: 42000000, profit: 8400000 },
  { month: "Aug", revenue: 38000000, profit: 7600000 },
  { month: "Sep", revenue: 51000000, profit: 10200000 },
  { month: "Oct", revenue: 47000000, profit: 9400000 },
  { month: "Nov", revenue: 55000000, profit: 11000000 },
  { month: "Dec", revenue: 62000000, profit: 12400000 },
];

const paymentMix = [
  { name: "Cash", value: 45 },
  { name: "Mobile Money", value: 30 },
  { name: "Bank", value: 15 },
  { name: "EMI/Credit", value: 10 },
];

const COLORS = [
  "hsl(43, 72%, 55%)",
  "hsl(142, 71%, 45%)",
  "hsl(199, 89%, 48%)",
  "hsl(280, 65%, 60%)",
];

const formatM = (v: number) => `${(v / 1000000).toFixed(0)}M`;

const Reports = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Reports</h1>
          <p className="text-muted-foreground text-sm mt-1">Business analytics & daily accountability</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 border-border/50">
            <FileText className="h-4 w-4" />
            Z-Report
          </Button>
          <Button className="gap-2 bg-success text-success-foreground hover:bg-success/90">
            <MessageSquare className="h-4 w-4" />
            WhatsApp Summary
          </Button>
        </div>
      </div>

      {/* P&L Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Today's P&L</p>
          <p className="text-2xl font-bold text-success mt-1">UGX 2.56M</p>
          <p className="text-xs text-muted-foreground mt-1">Revenue: UGX 12.8M</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">This Week</p>
          <p className="text-2xl font-bold text-success mt-1">UGX 14.2M</p>
          <p className="text-xs text-muted-foreground mt-1">Revenue: UGX 71M</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">This Month</p>
          <p className="text-2xl font-bold text-success mt-1">UGX 12.4M</p>
          <p className="text-xs text-muted-foreground mt-1">Revenue: UGX 62M</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card p-5">
          <h3 className="font-display font-semibold text-base mb-4">6-Month Revenue vs Profit</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 12%, 18%)" />
              <XAxis dataKey="month" stroke="hsl(220, 10%, 55%)" fontSize={12} />
              <YAxis stroke="hsl(220, 10%, 55%)" fontSize={12} tickFormatter={formatM} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(220, 14%, 11%)",
                  border: "1px solid hsl(220, 12%, 18%)",
                  borderRadius: "8px",
                  color: "hsl(40, 20%, 92%)",
                }}
                formatter={(v: number) => [`UGX ${v.toLocaleString()}`, ""]}
              />
              <Bar dataKey="revenue" fill="hsl(43, 72%, 55%)" radius={[4, 4, 0, 0]} name="Revenue" />
              <Bar dataKey="profit" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5">
          <h3 className="font-display font-semibold text-base mb-4">Payment Methods</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={paymentMix} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                {paymentMix.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(220, 14%, 11%)",
                  border: "1px solid hsl(220, 12%, 18%)",
                  borderRadius: "8px",
                  color: "hsl(40, 20%, 92%)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {paymentMix.map((p, i) => (
              <div key={p.name} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-muted-foreground flex-1">{p.name}</span>
                <span className="font-medium">{p.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
