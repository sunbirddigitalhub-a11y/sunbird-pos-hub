import { useState } from "react";
import { Search, Plus, Smartphone, Laptop, Tablet, MoreVertical, Edit2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const products = [
  { id: 1, name: "iPhone 15 Pro Max", category: "Smartphone", variants: "256GB / 512GB / 1TB", basePrice: 4200000, inStock: 3 },
  { id: 2, name: "Samsung Galaxy S24 Ultra", category: "Smartphone", variants: "256GB / 512GB", basePrice: 2500000, inStock: 5 },
  { id: 3, name: "MacBook Air M3", category: "Laptop", variants: "13\" / 15\"", basePrice: 5500000, inStock: 2 },
  { id: 4, name: "Tecno Spark 20 Pro+", category: "Smartphone", variants: "128GB / 256GB", basePrice: 600000, inStock: 12 },
  { id: 5, name: "Dell Inspiron 15", category: "Laptop", variants: "i5 / i7", basePrice: 2400000, inStock: 4 },
  { id: 6, name: "iPad Air M2", category: "Tablet", variants: "64GB / 256GB", basePrice: 3000000, inStock: 3 },
  { id: 7, name: "Samsung Galaxy A15", category: "Smartphone", variants: "128GB", basePrice: 680000, inStock: 8 },
  { id: 8, name: "iPhone 14", category: "Smartphone", variants: "128GB / 256GB", basePrice: 2900000, inStock: 6 },
];

const categoryIcon = (cat: string) => {
  if (cat === "Laptop") return Laptop;
  if (cat === "Tablet") return Tablet;
  return Smartphone;
};

const Products = () => {
  const [search, setSearch] = useState("");
  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground text-[14px] mt-1">Manage your product catalog</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-10 rounded-xl text-[13px] font-semibold active:scale-[0.97] transition-all">
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px] apple-ring" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => {
          const Icon = categoryIcon(p.category);
          return (
            <div key={p.id} className="glass-card p-5 transition-all duration-300 hover:scale-[1.01] cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/60 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary/80" />
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </div>
              <p className="text-[14px] font-semibold">{p.name}</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">{p.category} · {p.variants}</p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/20">
                <span className="text-[14px] font-semibold text-primary">UGX {p.basePrice.toLocaleString()}</span>
                <span className={`text-[12px] font-medium ${p.inStock > 5 ? "text-success" : p.inStock > 0 ? "text-warning" : "text-destructive"}`}>
                  {p.inStock} in stock
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Products;
