import { useState } from "react";
import { Search, Plus, Minus, ShoppingCart, X, CreditCard, Smartphone, Banknote, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const catalog = [
  { id: 1, name: "iPhone 15 Pro Max 256GB", price: 4200000, imei: "356938035643809" },
  { id: 2, name: "Samsung Galaxy S24 Ultra", price: 2500000, imei: "490154203237518" },
  { id: 5, name: "iPhone 14 128GB", price: 2900000, imei: "353456789012345" },
  { id: 6, name: "Samsung Galaxy A15", price: 680000, imei: "490154203237519" },
  { id: 7, name: "Dell Inspiron 15", price: 2400000, imei: "5CG1234ABC" },
  { id: 8, name: "iPad Air M2", price: 3000000, imei: "DMPC12345678" },
];

interface CartItem {
  id: number;
  name: string;
  price: number;
  imei: string;
  qty: number;
}

const formatPrice = (n: number) => `UGX ${n.toLocaleString()}`;

const POS = () => {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: (typeof catalog)[0]) => {
    setCart((prev) => {
      const exists = prev.find((c) => c.id === item.id);
      if (exists) return prev.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (id: number) => setCart((prev) => prev.filter((c) => c.id !== id));
  const updateQty = (id: number, delta: number) =>
    setCart((prev) =>
      prev.map((c) => (c.id === id ? { ...c, qty: Math.max(0, c.qty + delta) } : c)).filter((c) => c.qty > 0)
    );

  const subtotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const filtered = catalog.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col lg:flex-row gap-5 h-[calc(100vh-6rem)] animate-fade-in">
      {/* Products */}
      <div className="flex-1 flex flex-col min-w-0">
        <h1 className="text-[28px] font-bold tracking-tight mb-5">Point of Sale</h1>
        <div className="relative mb-5">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Scan barcode or search product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px] apple-ring"
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 overflow-auto flex-1 pb-2">
          {filtered.map((item) => (
            <button
              key={item.id}
              onClick={() => addToCart(item)}
              className="glass-card p-4 text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
            >
              <div className="w-10 h-10 rounded-xl bg-secondary/60 flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors duration-300">
                <Smartphone className="h-5 w-5 text-primary/80" />
              </div>
              <p className="text-[13px] font-medium truncate">{item.name}</p>
              <p className="text-[11px] text-muted-foreground font-mono mt-1">{item.imei}</p>
              <p className="text-[14px] font-semibold text-primary mt-2">{formatPrice(item.price)}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Cart */}
      <div className="w-full lg:w-[380px] glass-card flex flex-col shrink-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-border/20 flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-[14px] tracking-tight">Current Sale</h2>
          <span className="ml-auto text-[12px] text-muted-foreground">{cart.length} items</span>
        </div>

        <div className="flex-1 overflow-auto px-4 py-3 space-y-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <ShoppingCart className="h-10 w-10 mb-3 opacity-20" />
              <p className="text-[13px]">No items in cart</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 animate-scale-in">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate">{item.name}</p>
                  <p className="text-[12px] text-primary">{formatPrice(item.price)}</p>
                </div>
                <div className="flex items-center gap-0.5">
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => updateQty(item.id, -1)}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-6 text-center text-[13px] font-semibold">{item.qty}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => updateQty(item.id, 1)}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive/60 hover:text-destructive" onClick={() => removeFromCart(item.id)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))
          )}
        </div>

        <div className="p-5 border-t border-border/20 space-y-4">
          <div className="flex justify-between text-[13px]">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-[16px] font-semibold">
            <span>Total</span>
            <span className="text-primary">{formatPrice(subtotal)}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: Banknote, label: "Cash" },
              { icon: Smartphone, label: "Mobile" },
              { icon: Building2, label: "Bank" },
              { icon: CreditCard, label: "Split" },
            ].map(({ icon: Icon, label }) => (
              <Button key={label} variant="outline" className="gap-2 border-border/30 text-[13px] h-10 rounded-xl hover:bg-secondary/60 transition-all duration-200">
                <Icon className="h-4 w-4" /> {label}
              </Button>
            ))}
          </div>

          <Button
            className="w-full h-12 text-[15px] font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 active:scale-[0.98]"
            disabled={cart.length === 0}
          >
            Complete Sale
          </Button>
        </div>
      </div>
    </div>
  );
};

export default POS;
