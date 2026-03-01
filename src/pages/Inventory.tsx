import { useState, useEffect } from "react";
import { Search, Plus, Filter, Smartphone, Laptop, Tablet, MoreVertical, Loader2, Edit2, Trash2, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface InventoryItem {
  id: string;
  imei: string;
  product_id: string | null;
  selling_price: number;
  cost_price: number;
  supplier: string | null;
  status: string;
  created_at: string;
}

interface ProductRow {
  id: string;
  name: string;
  category: string;
}

const statusStyles: Record<string, string> = {
  "In Stock": "bg-success/10 text-success",
  Sold: "bg-muted text-muted-foreground",
  "In Transit": "bg-warning/10 text-warning",
};

const categoryIcon = (cat: string) => {
  if (cat === "Laptop") return Laptop;
  if (cat === "Tablet") return Tablet;
  return Smartphone;
};

const Inventory = () => {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<Record<string, ProductRow>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [productList, setProductList] = useState<ProductRow[]>([]);

  // Form
  const [formImei, setFormImei] = useState("");
  const [formProductId, setFormProductId] = useState("");
  const [formSellingPrice, setFormSellingPrice] = useState("");
  const [formCostPrice, setFormCostPrice] = useState("");
  const [formSupplier, setFormSupplier] = useState("");
  const [formStatus, setFormStatus] = useState("In Stock");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchData = async () => {
    const [invRes, prodRes] = await Promise.all([
      supabase.from("inventory").select("*").order("created_at", { ascending: false }),
      supabase.from("products").select("id, name, category"),
    ]);
    setItems((invRes.data || []) as unknown as InventoryItem[]);
    const prods = (prodRes.data || []) as unknown as ProductRow[];
    setProductList(prods);
    const map: Record<string, ProductRow> = {};
    prods.forEach((p) => (map[p.id] = p));
    setProducts(map);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = items.filter((item) => {
    const prod = item.product_id ? products[item.product_id] : null;
    const name = prod?.name || "";
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) || item.imei.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openNew = () => {
    setEditing(null);
    setFormImei(""); setFormProductId(""); setFormSellingPrice(""); setFormCostPrice(""); setFormSupplier(""); setFormStatus("In Stock");
    setShowForm(true);
  };

  const openEdit = (item: InventoryItem) => {
    setEditing(item);
    setFormImei(item.imei);
    setFormProductId(item.product_id || "");
    setFormSellingPrice(String(item.selling_price));
    setFormCostPrice(String(item.cost_price));
    setFormSupplier(item.supplier || "");
    setFormStatus(item.status);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formImei.trim()) return;
    setSaving(true);
    const payload = {
      imei: formImei.trim(),
      product_id: formProductId || null,
      selling_price: Number(formSellingPrice) || 0,
      cost_price: Number(formCostPrice) || 0,
      supplier: formSupplier.trim() || null,
      status: formStatus,
    };
    if (editing) {
      const { error } = await supabase.from("inventory").update(payload as any).eq("id", editing.id);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Item updated" });
    } else {
      const { error } = await supabase.from("inventory").insert(payload as any);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Item added to inventory" });
    }
    setSaving(false);
    setShowForm(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("inventory").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Item deleted" }); fetchData(); }
  };

  const inStockCount = items.filter((i) => i.status === "In Stock").length;
  const soldCount = items.filter((i) => i.status === "Sold").length;

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
          <h1 className="text-[28px] font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground text-[14px] mt-1">{items.length} items tracked with IMEI</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-10 rounded-xl text-[13px] font-semibold transition-all active:scale-[0.97]" onClick={openNew}>
          <Plus className="h-4 w-4" /> Add Item
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card"><p className="text-[13px] text-muted-foreground">Total Items</p><p className="text-[24px] font-semibold tracking-tight mt-1">{items.length}</p></div>
        <div className="stat-card"><p className="text-[13px] text-muted-foreground">In Stock</p><p className="text-[24px] font-semibold text-success tracking-tight mt-1">{inStockCount}</p></div>
        <div className="stat-card"><p className="text-[13px] text-muted-foreground">Sold</p><p className="text-[24px] font-semibold text-muted-foreground tracking-tight mt-1">{soldCount}</p></div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or IMEI..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px] apple-ring" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] h-11 bg-secondary/50 border-border/30 rounded-xl text-[13px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="In Stock">In Stock</SelectItem>
            <SelectItem value="Sold">Sold</SelectItem>
            <SelectItem value="In Transit">In Transit</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Package className="h-10 w-10 mb-3 opacity-20" />
          <p className="text-[14px]">{search || statusFilter !== "all" ? "No matching items" : "No inventory yet"}</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/20">
                  <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-5">Product</th>
                  <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-5">IMEI/Serial</th>
                  <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-5">Status</th>
                  <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-5">Price</th>
                  <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-5">Origin</th>
                  <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-5"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const prod = item.product_id ? products[item.product_id] : null;
                  const Icon = categoryIcon(prod?.category || "Smartphone");
                  return (
                    <tr key={item.id} className="border-b border-border/10 last:border-0 hover:bg-secondary/15 transition-colors duration-200">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-secondary/60 flex items-center justify-center shrink-0">
                            <Icon className="h-4 w-4 text-primary/80" />
                          </div>
                          <div>
                            <p className="text-[13px] font-medium">{prod?.name || "Unknown Product"}</p>
                            <p className="text-[11px] text-muted-foreground">{prod?.category || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-[13px] font-mono text-muted-foreground">{item.imei}</td>
                      <td className="py-3.5 px-5">
                        <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${statusStyles[item.status] || ""}`}>{item.status}</span>
                      </td>
                      <td className="py-3.5 px-5 text-[13px] font-semibold text-primary">UGX {item.selling_price.toLocaleString()}</td>
                      <td className="py-3.5 px-5 text-[13px] text-muted-foreground">{item.supplier || "—"}</td>
                      <td className="py-3.5 px-5">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => openEdit(item)}>
                            <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive/60" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="glass-card border-border/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-semibold">{editing ? "Edit Inventory Item" : "Add Inventory Item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-1.5">IMEI / Serial *</label>
              <Input value={formImei} onChange={(e) => setFormImei(e.target.value)} placeholder="356938035643809" className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px]" />
            </div>
            <div>
              <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-1.5">Product</label>
              <Select value={formProductId} onValueChange={setFormProductId}>
                <SelectTrigger className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px]">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {productList.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-1.5">Selling Price (UGX)</label>
                <Input type="number" value={formSellingPrice} onChange={(e) => setFormSellingPrice(e.target.value)} placeholder="4200000" className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px]" />
              </div>
              <div>
                <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-1.5">Cost Price (UGX)</label>
                <Input type="number" value={formCostPrice} onChange={(e) => setFormCostPrice(e.target.value)} placeholder="3200000" className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px]" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-1.5">Supplier</label>
                <Input value={formSupplier} onChange={(e) => setFormSupplier(e.target.value)} placeholder="Dubai, China..." className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px]" />
              </div>
              <div>
                <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-1.5">Status</label>
                <Select value={formStatus} onValueChange={setFormStatus}>
                  <SelectTrigger className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="In Stock">In Stock</SelectItem>
                    <SelectItem value="In Transit">In Transit</SelectItem>
                    <SelectItem value="Sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 rounded-xl border-border/30" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button className="flex-1 rounded-xl bg-primary text-primary-foreground font-semibold" onClick={handleSave} disabled={!formImei.trim() || saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? "Update" : "Add"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;
