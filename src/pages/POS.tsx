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

const formatPrice = (n: number) =>
  `UGX ${n.toLocaleString()}`;

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
      prev
        .map((c) => (c.id === id ? { ...c, qty: Math.max(0, c.qty + delta) } : c))
        .filter((c) => c.qty > 0)
    );

  const subtotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const filtered = catalog.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-7rem)] animate-fade-in">
      {/* Product Grid */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-display font-bold">Point of Sale</h1>
        </div>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Scan barcode or search product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-secondary border-border/50"
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 overflow-auto flex-1">
          {filtered.map((item) => (
            <button
              key={item.id}
              onClick={() => addToCart(item)}
              className="glass-card p-4 text-left hover:border-primary/30 hover:gold-glow transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-medium truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground font-mono mt-1">{item.imei}</p>
              <p className="text-sm font-bold text-primary mt-2">{formatPrice(item.price)}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Cart Panel */}
      <div className="w-full lg:w-96 glass-card flex flex-col shrink-0">
        <div className="p-4 border-b border-border/50 flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-sm">Current Sale</h2>
          <span className="ml-auto text-xs text-muted-foreground">{cart.length} items</span>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <ShoppingCart className="h-10 w-10 mb-2 opacity-30" />
              <p className="text-sm">No items in cart</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-primary">{formatPrice(item.price)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQty(item.id, -1)}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-6 text-center text-sm font-medium">{item.qty}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQty(item.id, 1)}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeFromCart(item.id)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-border/50 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-base font-bold">
            <span>Total</span>
            <span className="text-primary">{formatPrice(subtotal)}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="gap-2 border-border/50 text-sm h-10">
              <Banknote className="h-4 w-4" /> Cash
            </Button>
            <Button variant="outline" className="gap-2 border-border/50 text-sm h-10">
              <Smartphone className="h-4 w-4" /> Mobile
            </Button>
            <Button variant="outline" className="gap-2 border-border/50 text-sm h-10">
              <Building2 className="h-4 w-4" /> Bank
            </Button>
            <Button variant="outline" className="gap-2 border-border/50 text-sm h-10">
              <CreditCard className="h-4 w-4" /> Split
            </Button>
          </div>

          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-semibold" disabled={cart.length === 0}>
            Complete Sale
          </Button>
        </div>
      </div>
    </div>
  );
};

export default POS;
