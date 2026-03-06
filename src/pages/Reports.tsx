import { useState, useEffect } from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageSquare, FileText, Image, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

interface ReceiptFile {
  name: string;
  url: string;
  created_at: string;
}

const Reports = () => {
  const [receipts, setReceipts] = useState<ReceiptFile[]>([]);
  const [loadingReceipts, setLoadingReceipts] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptFile | null>(null);
  const [showReceipts, setShowReceipts] = useState(false);

  const fetchReceipts = async () => {
    setLoadingReceipts(true);
    try {
      const { data, error } = await supabase.storage.from("receipts").list("", {
        limit: 100,
        sortBy: { column: "created_at", order: "desc" },
      });
      if (error) throw error;
      const files: ReceiptFile[] = (data || [])
        .filter((f) => f.name.endsWith(".png"))
        .map((f) => {
          const { data: urlData } = supabase.storage.from("receipts").getPublicUrl(f.name);
          return {
            name: f.name,
            url: urlData.publicUrl,
            created_at: f.created_at || "",
          };
        });
      setReceipts(files);
    } catch (err) {
      console.error("Error loading receipts:", err);
    } finally {
      setLoadingReceipts(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  const extractSaleNumber = (name: string) => {
    const parts = name.split("_");
    return parts[0] || name;
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground text-[14px] mt-1">Business analytics & daily accountability</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2 border-border/30 rounded-xl h-10 text-[13px]"
            onClick={() => setShowReceipts(!showReceipts)}
          >
            <Image className="h-4 w-4" />
            Receipts ({receipts.length})
          </Button>
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

      {/* Receipts Gallery */}
      {showReceipts && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-[15px] tracking-tight flex items-center gap-2">
              <Image className="h-4 w-4 text-primary" />
              Receipt Screenshots
            </h3>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => fetchReceipts()}>
              <Loader2 className={`h-4 w-4 ${loadingReceipts ? "animate-spin" : ""}`} />
            </Button>
          </div>
          {loadingReceipts ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : receipts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Image className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-[13px]">No receipts captured yet. Complete a sale in POS to see receipts here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {receipts.map((receipt) => (
                <button
                  key={receipt.name}
                  onClick={() => setSelectedReceipt(receipt)}
                  className="group rounded-xl overflow-hidden border border-border/20 hover:border-primary/40 transition-all duration-200 hover:shadow-lg bg-secondary/20"
                >
                  <div className="aspect-[3/4] overflow-hidden">
                    <img
                      src={receipt.url}
                      alt={receipt.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-2">
                    <p className="text-[11px] font-mono font-medium truncate text-primary">{extractSaleNumber(receipt.name)}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {receipt.created_at ? new Date(receipt.created_at).toLocaleDateString() : ""}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

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

      {/* Receipt Preview Dialog */}
      <Dialog open={!!selectedReceipt} onOpenChange={(open) => !open && setSelectedReceipt(null)}>
        <DialogContent className="glass-card border-border/30 max-w-lg max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              {selectedReceipt ? extractSaleNumber(selectedReceipt.name) : "Receipt"}
            </DialogTitle>
          </DialogHeader>
          {selectedReceipt && (
            <div className="space-y-4">
              <img
                src={selectedReceipt.url}
                alt={selectedReceipt.name}
                className="w-full rounded-xl border border-border/20"
              />
              <p className="text-[11px] text-muted-foreground text-center">
                {selectedReceipt.created_at ? new Date(selectedReceipt.created_at).toLocaleString() : ""}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reports;
