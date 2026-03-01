import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { Button } from "@/components/ui/button";
import { MessageSquare, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, subMonths, startOfMonth, endOfMonth, startOfDay, subDays, startOfWeek } from "date-fns";
import { useNavigate } from "react-router-dom";

const COLORS = [
  "hsl(43, 72%, 55%)",
  "hsl(142, 60%, 45%)",
  "hsl(211, 80%, 55%)",
  "hsl(280, 55%, 60%)",
];
const formatM = (v: number) => `${(v / 1000000).toFixed(0)}M`;

interface SaleRow {
  total_amount: number;
  payment_method: string;
  created_at: string;
}

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [weekRevenue, setWeekRevenue] = useState(0);
  const [monthRevenue, setMonthRevenue] = useState(0);
  const [monthlyData, setMonthlyData] = useState<{ month: string; revenue: number }[]>([]);
  const [paymentMix, setPaymentMix] = useState<{ name: string; value: number }[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const now = new Date();
      const todayStart = startOfDay(now).toISOString();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 }).toISOString();
      const monthStart = startOfMonth(now).toISOString();
      const sixMonthsAgo = startOfMonth(subMonths(now, 5)).toISOString();

      const { data } = await supabase.from("sales").select("total_amount, payment_method, created_at").gte("created_at", sixMonthsAgo).order("created_at", { ascending: true });
      const sales = (data || []) as unknown as SaleRow[];

      let tRev = 0, wRev = 0, mRev = 0;
      const mMap: Record<string, number> = {};
      const pMap: Record<string, number> = {};

      // Init months
      for (let i = 5; i >= 0; i--) {
        const m = subMonths(now, i);
        mMap[format(m, "MMM")] = 0;
      }

      sales.forEach((s) => {
        const d = new Date(s.created_at);
        if (d.toISOString() >= todayStart) tRev += s.total_amount;
        if (d.toISOString() >= weekStart) wRev += s.total_amount;
        if (d.toISOString() >= monthStart) mRev += s.total_amount;

        const mKey = format(d, "MMM");
        if (mMap[mKey] !== undefined) mMap[mKey] += s.total_amount;

        const pm = s.payment_method || "Cash";
        pMap[pm] = (pMap[pm] || 0) + 1;
      });

      setTodayRevenue(tRev);
      setWeekRevenue(wRev);
      setMonthRevenue(mRev);
      setMonthlyData(Object.entries(mMap).map(([month, revenue]) => ({ month, revenue })));

      const total = Object.values(pMap).reduce((a, b) => a + b, 0) || 1;
      setPaymentMix(Object.entries(pMap).map(([name, count]) => ({ name, value: Math.round((count / total) * 100) })));

      setLoading(false);
    };
    load();
  }, []);

  const sendWhatsAppSummary = () => {
    const msg = `📊 *Sunbird Daily Summary*\n\n💰 Today: UGX ${todayRevenue.toLocaleString()}\n📅 This Week: UGX ${weekRevenue.toLocaleString()}\n📆 This Month: UGX ${monthRevenue.toLocaleString()}\n\n${paymentMix.map(p => `• ${p.name}: ${p.value}%`).join('\n')}`;
    window.open(`https://wa.me/256704811097?text=${encodeURIComponent(msg)}`, "_blank");
  };

  if (loading) {
    return <div className="flex items-center justify-center py-32"><Loader2 className="h-8 w-8 text-primary animate-spin" /></div>;
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground text-[14px] mt-1">Business analytics & daily accountability</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 border-border/30 rounded-xl h-10 text-[13px]" onClick={() => navigate("/z-report")}>
            <FileText className="h-4 w-4" /> Z-Report
          </Button>
          <Button className="gap-2 bg-success text-success-foreground hover:bg-success/90 rounded-xl h-10 text-[13px] font-semibold" onClick={sendWhatsAppSummary}>
            <MessageSquare className="h-4 w-4" /> WhatsApp Summary
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Today's Revenue", value: `UGX ${formatM(todayRevenue)}` },
          { label: "This Week", value: `UGX ${formatM(weekRevenue)}` },
          { label: "This Month", value: `UGX ${formatM(monthRevenue)}` },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <p className="text-[13px] text-muted-foreground">{s.label}</p>
            <p className="text-[24px] font-semibold text-primary tracking-tight mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="font-semibold text-[15px] mb-5 tracking-tight">6-Month Revenue</h3>
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
                formatter={(v: number) => [`UGX ${v.toLocaleString()}`, "Revenue"]}
              />
              <Bar dataKey="revenue" fill="hsl(43, 72%, 55%)" radius={[6, 6, 0, 0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-semibold text-[15px] mb-5 tracking-tight">Payment Methods</h3>
          {paymentMix.length === 0 ? (
            <p className="text-muted-foreground text-[13px]">No data yet</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={paymentMix} cx="50%" cy="50%" innerRadius={48} outerRadius={75} paddingAngle={4} dataKey="value" strokeWidth={0}>
                    {paymentMix.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "hsla(220, 10%, 10%, 0.9)", border: "1px solid hsl(220, 8%, 18%)", borderRadius: "12px", color: "hsl(0, 0%, 98%)", fontSize: "13px" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2.5 mt-3">
                {paymentMix.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-2.5 text-[13px]">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-muted-foreground flex-1">{p.name}</span>
                    <span className="font-semibold">{p.value}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
