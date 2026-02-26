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
  "hsl(142, 60%, 45%)",
  "hsl(211, 80%, 55%)",
  "hsl(280, 55%, 60%)",
];

const formatM = (v: number) => `${(v / 1000000).toFixed(0)}M`;

const Reports = () => {
  return (
    <div className="space-y-8 animate-fade-in max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground text-[14px] mt-1">Business analytics & daily accountability</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 border-border/30 rounded-xl h-10 text-[13px]">
            <FileText className="h-4 w-4" />
            Z-Report
          </Button>
          <Button className="gap-2 bg-success text-success-foreground hover:bg-success/90 rounded-xl h-10 text-[13px] font-semibold">
            <MessageSquare className="h-4 w-4" />
            WhatsApp Summary
          </Button>
        </div>
      </div>

      {/* P&L */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Today's P&L", value: "UGX 2.56M", sub: "Revenue: UGX 12.8M" },
          { label: "This Week", value: "UGX 14.2M", sub: "Revenue: UGX 71M" },
          { label: "This Month", value: "UGX 12.4M", sub: "Revenue: UGX 62M" },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <p className="text-[13px] text-muted-foreground">{s.label}</p>
            <p className="text-[24px] font-semibold text-success tracking-tight mt-1">{s.value}</p>
            <p className="text-[12px] text-muted-foreground mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="font-semibold text-[15px] mb-5 tracking-tight">6-Month Revenue vs Profit</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 8%, 14%)" vertical={false} />
              <XAxis dataKey="month" stroke="hsl(220, 5%, 40%)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(220, 5%, 40%)" fontSize={12} tickFormatter={formatM} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsla(220, 10%, 10%, 0.9)",
                  border: "1px solid hsl(220, 8%, 18%)",
                  borderRadius: "12px",
                  color: "hsl(0, 0%, 98%)",
                  fontSize: "13px",
                  padding: "10px 14px",
                }}
                formatter={(v: number) => [`UGX ${v.toLocaleString()}`, ""]}
              />
              <Bar dataKey="revenue" fill="hsl(43, 72%, 55%)" radius={[6, 6, 0, 0]} name="Revenue" />
              <Bar dataKey="profit" fill="hsl(142, 60%, 45%)" radius={[6, 6, 0, 0]} name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-semibold text-[15px] mb-5 tracking-tight">Payment Methods</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={paymentMix} cx="50%" cy="50%" innerRadius={48} outerRadius={75} paddingAngle={4} dataKey="value" strokeWidth={0}>
                {paymentMix.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsla(220, 10%, 10%, 0.9)",
                  border: "1px solid hsl(220, 8%, 18%)",
                  borderRadius: "12px",
                  color: "hsl(0, 0%, 98%)",
                  fontSize: "13px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2.5 mt-3">
            {paymentMix.map((p, i) => (
              <div key={p.name} className="flex items-center gap-2.5 text-[13px]">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-muted-foreground flex-1">{p.name}</span>
                <span className="font-semibold">{p.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
