import { useState, useEffect } from "react";
import { Plus, Search, Loader2, Truck, Edit2, Trash2, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  products_count: number;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", notes: "" });

  useEffect(() => { fetchSuppliers(); }, []);

  const fetchSuppliers = async () => {
    // Derive suppliers from products table supplier field + inventory supplier field
    const { data: products } = await supabase.from("products").select("supplier");
    const { data: inventory } = await supabase.from("inventory").select("supplier");

    const supplierSet = new Map<string, number>();
    [...((products as any[]) || []), ...((inventory as any[]) || [])].forEach((r) => {
      if (r.supplier && r.supplier.trim()) {
        const name = r.supplier.trim();
        supplierSet.set(name, (supplierSet.get(name) || 0) + 1);
      }
    });

    const list: Supplier[] = Array.from(supplierSet.entries()).map(([name, count]) => ({
      id: name,
      name,
      phone: "",
      email: "",
      address: "",
      notes: "",
      products_count: count,
    }));

    setSuppliers(list);
    setLoading(false);
  };

  const filtered = suppliers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="h-8 w-8 text-primary animate-spin" /></div>;
  }

  return (
    <div className="space-y-5 animate-fade-in max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[22px] md:text-[28px] font-bold tracking-tight">Suppliers</h1>
          <p className="text-muted-foreground text-[13px] mt-0.5">{suppliers.length} suppliers in your network</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search suppliers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10 bg-secondary/50 border-border/30 rounded-xl text-[13px]" />
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((supplier) => (
            <div key={supplier.id} className="glass-card p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium truncate">{supplier.name}</p>
                  <p className="text-[12px] text-muted-foreground mt-0.5">{supplier.products_count} products linked</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <Truck className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-[14px] font-medium">No suppliers found</p>
          <p className="text-[12px] text-muted-foreground mt-1">Add suppliers when creating products or inventory items</p>
        </div>
      )}
    </div>
  );
}
