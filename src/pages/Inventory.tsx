import { useState } from "react";
import { Search, Plus, Filter, Smartphone, Laptop, MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const inventoryData = [
  { id: 1, name: "iPhone 15 Pro Max 256GB", category: "Smartphone", imei: "356938035643809", status: "In Stock", cost: "UGX 3,200,000", price: "UGX 4,200,000", supplier: "Dubai" },
  { id: 2, name: "Samsung Galaxy S24 Ultra", category: "Smartphone", imei: "490154203237518", status: "In Stock", cost: "UGX 1,800,000", price: "UGX 2,500,000", supplier: "Dubai" },
  { id: 3, name: "MacBook Air M3 15\"", category: "Laptop", imei: "C02ZM4XRLVDL", status: "Sold", cost: "UGX 4,000,000", price: "UGX 5,500,000", supplier: "Dubai" },
  { id: 4, name: "Tecno Spark 20 Pro+", category: "Smartphone", imei: "867530012345678", status: "In Transit", cost: "UGX 380,000", price: "UGX 600,000", supplier: "China" },
  { id: 5, name: "iPhone 14 128GB", category: "Smartphone", imei: "353456789012345", status: "In Stock", cost: "UGX 2,200,000", price: "UGX 2,900,000", supplier: "Dubai" },
  { id: 6, name: "Samsung Galaxy A15", category: "Smartphone", imei: "490154203237519", status: "In Stock", cost: "UGX 450,000", price: "UGX 680,000", supplier: "China" },
  { id: 7, name: "Dell Inspiron 15", category: "Laptop", imei: "5CG1234ABC", status: "In Stock", cost: "UGX 1,800,000", price: "UGX 2,400,000", supplier: "Dubai" },
  { id: 8, name: "iPad Air M2", category: "Tablet", imei: "DMPC12345678", status: "In Stock", cost: "UGX 2,200,000", price: "UGX 3,000,000", supplier: "Dubai" },
];

const statusStyles: Record<string, string> = {
  "In Stock": "bg-success/10 text-success",
  "Sold": "bg-muted text-muted-foreground",
  "In Transit": "bg-warning/10 text-warning",
  "Dubai Purchase": "bg-chart-3/10 text-chart-3",
};

const Inventory = () => {
  const [search, setSearch] = useState("");
  const filtered = inventoryData.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.imei.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Inventory</h1>
          <p className="text-muted-foreground text-sm mt-1">{inventoryData.length} items tracked with IMEI</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or IMEI..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-secondary border-border/50"
          />
        </div>
        <Button variant="outline" size="icon" className="border-border/50">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-secondary/30">
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Product</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">IMEI/Serial</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Selling Price</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Origin</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b border-border/30 last:border-0 hover:bg-secondary/20 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                        {item.category === "Laptop" ? (
                          <Laptop className="h-4 w-4 text-primary" />
                        ) : (
                          <Smartphone className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm font-mono text-muted-foreground">{item.imei}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusStyles[item.status] || ""}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-primary">{item.price}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{item.supplier}</td>
                  <td className="py-3 px-4">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
