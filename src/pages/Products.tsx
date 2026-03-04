import { useState, useEffect } from "react";
import { Search, Plus, Smartphone, Laptop, Tablet, Edit2, Trash2, Loader2, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  category: string;
  variants: string | null;
  base_price: number;
  cost_price: number;
  supplier: string | null;
  in_stock: number;
}

const categoryIcon = (cat: string) => {
  if (cat === "Laptop") return Laptop;
  if (cat === "Tablet") return Tablet;
  return Smartphone;
};

const categories = ["Smartphone", "Laptop", "Tablet", "Accessory", "Other"];

const Products = () => {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // Form state
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("Smartphone");
  const [formVariants, setFormVariants] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formCost, setFormCost] = useState("");
  const [formSupplier, setFormSupplier] = useState("");

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error loading products", description: error.message, variant: "destructive" });
    } else if (data) {
      setProducts(data as unknown as Product[]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      (p.supplier && p.supplier.toLowerCase().includes(search.toLowerCase()))
  );

  const openNew = () => {
    setEditing(null);
    setFormName(""); setFormCategory("Smartphone"); setFormVariants(""); setFormPrice(""); setFormCost(""); setFormSupplier("");
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setFormName(p.name); setFormCategory(p.category); setFormVariants(p.variants || "");
    setFormPrice(String(p.base_price)); setFormCost(String(p.cost_price)); setFormSupplier(p.supplier || "");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formName.trim() || !formPrice) return;
    setSaving(true);

    const payload: any = {
      name: formName.trim(),
      category: formCategory,
      variants: formVariants.trim() || null,
      base_price: Number(formPrice),
      cost_price: Number(formCost) || 0,
      supplier: formSupplier.trim() || null,
    };

    if (editing) {
      const { error } = await supabase.from("products").update(payload).eq("id", editing.id);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Product updated" });
    } else {
      const { error } = await supabase.from("products").insert({ ...payload, in_stock: 0 });
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Product created" });
    }

    setSaving(false);
    setShowForm(false);
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Product deleted" }); fetchProducts(); }
  };

  const goToPOS = () => navigate("/pos");

  const totalValue = products.reduce((s, p) => s + p.base_price * p.in_stock, 0);
  const totalItems = products.reduce((s, p) => s + p.in_stock, 0);

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground text-[14px] mt-1">Manage your product catalog</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 border-border/30 rounded-xl h-10 text-[13px]" onClick={goToPOS}>
            <Package className="h-4 w-4" /> Open POS
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-10 rounded-xl text-[13px] font-semibold active:scale-[0.97] transition-all" onClick={openNew}>
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-[13px] text-muted-foreground">Products</p>
          <p className="text-[24px] font-semibold tracking-tight mt-1">{products.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-[13px] text-muted-foreground">Total Units</p>
          <p className="text-[24px] font-semibold tracking-tight mt-1">{totalItems}</p>
        </div>
        <div className="stat-card">
          <p className="text-[13px] text-muted-foreground">Inventory Value</p>
          <p className="text-[24px] font-semibold text-primary tracking-tight mt-1">UGX {(totalValue / 1000000).toFixed(1)}M</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, category, or supplier..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px] apple-ring"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Package className="h-10 w-10 mb-3 opacity-20" />
          <p className="text-[14px]">{search ? "No matching products" : "No products yet. Add your first product!"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => {
            const Icon = categoryIcon(p.category);
            return (
              <div key={p.id} className="glass-card p-5 transition-all duration-300 hover:scale-[1.01] group">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary/60 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary/80" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => openEdit(p)}>
                      <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => handleDelete(p.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive/60" />
                    </Button>
                  </div>
                </div>
                <p className="text-[14px] font-semibold">{p.name}</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  {p.category}{p.variants ? ` · ${p.variants}` : ""}{p.supplier ? ` · ${p.supplier}` : ""}
                </p>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/20">
                  <span className="text-[14px] font-semibold text-primary">UGX {p.base_price.toLocaleString()}</span>
                  <span className={`text-[12px] font-medium ${p.in_stock > 5 ? "text-success" : p.in_stock > 0 ? "text-warning" : "text-destructive"}`}>
                    {p.in_stock} in stock
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="glass-card border-border/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-semibold">{editing ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-1.5">Product Name *</label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. iPhone 15 Pro Max" className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-1.5">Category</label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-1.5">Variants</label>
                <Input value={formVariants} onChange={(e) => setFormVariants(e.target.value)} placeholder="128GB / 256GB" className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px]" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-1.5">Selling Price (UGX) *</label>
                <Input type="number" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} placeholder="4200000" className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px]" />
              </div>
              <div>
                <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-1.5">Cost Price (UGX)</label>
                <Input type="number" value={formCost} onChange={(e) => setFormCost(e.target.value)} placeholder="3200000" className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px]" />
              </div>
            </div>
            <div>
              <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-1.5">Supplier</label>
              <Input value={formSupplier} onChange={(e) => setFormSupplier(e.target.value)} placeholder="Dubai, China..." className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px]" />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 rounded-xl border-border/30" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button
                className="flex-1 rounded-xl bg-primary text-primary-foreground font-semibold"
                onClick={handleSave}
                disabled={!formName.trim() || !formPrice || saving}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;
