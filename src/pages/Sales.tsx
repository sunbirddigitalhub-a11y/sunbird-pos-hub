import { useState, useEffect } from "react";
import { Search, Calendar, Download, Loader2, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

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
  sale_id: string;
  product_name: string;
  quantity: number;
}

const Sales = () => {
  const [search, setSearch] = useState("");
  const [sales, setSales] = useState<SaleRow[]>([]);
  const [itemCounts, setItemCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [salesRes, itemsRes] = await Promise.all([
        supabase.from("sales").select("*").order("created_at", { ascending: false }).limit(500),
        supabase.from("sale_items").select("sale_id, product_name, quantity").limit(1000),
      ]);
      setSales((salesRes.data || []) as unknown as SaleRow[]);
      
      const counts: Record<string, number> = {};
      ((itemsRes.data || []) as unknown as SaleItemRow[]).forEach((it) => {
        counts[it.sale_id] = (counts[it.sale_id] || 0) + it.quantity;
      });
      setItemCounts(counts);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = sales.filter(
    (s) =>
      (s.customer_name || "").toLowerCase().includes(search.toLowerCase()) ||
      s.sale_number.toLowerCase().includes(search.toLowerCase())
  );
  const totalRevenue = filtered.reduce((sum, s) => sum + s.total_amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight">Sales</h1>
          <p className="text-muted-foreground text-[14px] mt-1">All completed and pending sales</p>
        </div>
        <Button variant="outline" className="gap-2 border-border/30 rounded-xl h-10 text-[13px]">
          <Download className="h-4 w-4" /> Export
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-[13px] text-muted-foreground">Total Sales</p>
          <p className="text-[24px] font-semibold tracking-tight mt-1">{filtered.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-[13px] text-muted-foreground">Revenue</p>
          <p className="text-[24px] font-semibold text-primary tracking-tight mt-1">UGX {(totalRevenue / 1000000).toFixed(1)}M</p>
        </div>
        <div className="stat-card">
          <p className="text-[13px] text-muted-foreground">Avg. Sale</p>
          <p className="text-[24px] font-semibold tracking-tight mt-1">UGX {filtered.length ? (totalRevenue / filtered.length / 1000000).toFixed(1) : 0}M</p>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search sales..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px] apple-ring" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <ShoppingCart className="h-10 w-10 mb-3 opacity-20" />
          <p className="text-[14px]">{search ? "No matching sales" : "No sales yet"}</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/20">
                  {["Sale ID", "Date", "Customer", "Items", "Total", "Payment", "Status"].map((h) => (
                    <th key={h} className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-b border-border/10 last:border-0 hover:bg-secondary/15 transition-colors duration-200">
                    <td className="py-3.5 px-5 text-[13px] font-mono text-muted-foreground">{s.sale_number}</td>
                    <td className="py-3.5 px-5 text-[13px] text-muted-foreground">{format(new Date(s.created_at), "yyyy-MM-dd")}</td>
                    <td className="py-3.5 px-5 text-[13px] font-medium">{s.customer_name || "Walk-in"}</td>
                    <td className="py-3.5 px-5 text-[13px]">{itemCounts[s.id] || 0}</td>
                    <td className="py-3.5 px-5 text-[13px] font-semibold text-primary">UGX {s.total_amount.toLocaleString()}</td>
                    <td className="py-3.5 px-5 text-[13px]">{s.payment_method}</td>
                    <td className="py-3.5 px-5">
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${
                        s.status === "Completed" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                      }`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
