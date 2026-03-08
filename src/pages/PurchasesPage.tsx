import { useState, useEffect } from "react";
import { Search, Loader2, ShoppingBag, Package, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const formatPrice = (n: number) => `UGX ${n.toLocaleString()}`;

interface PurchaseRecord {
  id: string;
  product_name: string;
  supplier: string;
  cost_price: number;
  quantity: number;
  imei: string;
  created_at: string;
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { fetchPurchases(); }, []);

  const fetchPurchases = async () => {
    const { data } = await supabase
      .from("inventory")
      .select("id, imei, cost_price, quantity, supplier, created_at, product_id, products(name)")
      .order("created_at", { ascending: false })
      .limit(200);

    const list = ((data as any[]) || []).map((r) => ({
      id: r.id,
      product_name: r.products?.name || "Unknown",
      supplier: r.supplier || "Unknown",
      cost_price: r.cost_price,
      quantity: r.quantity,
      imei: r.imei,
      created_at: r.created_at,
    }));
    setPurchases(list);
    setLoading(false);
  };

  const filtered = purchases.filter(
    (p) =>
      p.product_name.toLowerCase().includes(search.toLowerCase()) ||
      p.supplier.toLowerCase().includes(search.toLowerCase()) ||
      p.imei.toLowerCase().includes(search.toLowerCase())
  );

  const totalCost = filtered.reduce((s, p) => s + (p.cost_price * p.quantity), 0);

  if (loading) {
    return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="h-8 w-8 text-primary animate-spin" /></div>;
  }

  return (
    <div className="space-y-5 animate-fade-in max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[22px] md:text-[28px] font-bold tracking-tight">Purchases</h1>
          <p className="text-muted-foreground text-[13px] mt-0.5">{purchases.length} purchase records • Total: {formatPrice(totalCost)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-4 w-4 text-primary" />
            <span className="text-[12px] text-muted-foreground">Total Items</span>
          </div>
          <span className="text-[20px] font-semibold">{purchases.length}</span>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-destructive" />
            <span className="text-[12px] text-muted-foreground">Total Cost</span>
          </div>
          <span className="text-[20px] font-semibold">{formatPrice(totalCost)}</span>
        </div>
        <div className="stat-card hidden md:block">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag className="h-4 w-4 text-chart-3" />
            <span className="text-[12px] text-muted-foreground">Suppliers</span>
          </div>
          <span className="text-[20px] font-semibold">{new Set(purchases.map(p => p.supplier)).size}</span>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by product, supplier, IMEI..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10 bg-secondary/50 border-border/30 rounded-xl text-[13px]" />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/20">
                <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Product</th>
                <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Supplier</th>
                <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">IMEI</th>
                <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Cost</th>
                <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Qty</th>
                <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map((p) => (
                <tr key={p.id} className="border-b border-border/10 last:border-0 hover:bg-secondary/20 transition-colors">
                  <td className="py-3 px-4 text-[13px] font-medium">{p.product_name}</td>
                  <td className="py-3 px-4 text-[13px] text-muted-foreground">{p.supplier}</td>
                  <td className="py-3 px-4 text-[12px] font-mono text-muted-foreground">{p.imei}</td>
                  <td className="py-3 px-4 text-[13px] font-medium">{formatPrice(p.cost_price)}</td>
                  <td className="py-3 px-4 text-[13px]">{p.quantity}</td>
                  <td className="py-3 px-4 text-[13px] text-muted-foreground">{format(new Date(p.created_at), "MMM dd, yyyy")}</td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="py-10 text-center text-muted-foreground text-[13px]">No purchase records found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
