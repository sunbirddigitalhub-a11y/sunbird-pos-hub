import { useState, useEffect, useMemo } from "react";
import { Search, Plus, Minus, ShoppingCart, X, CreditCard, Smartphone, Banknote, Building2, User, Check, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface InventoryItem {
  id: string;
  product_id: string | null;
  imei: string;
  status: string;
  selling_price: number;
  cost_price: number;
  supplier: string | null;
  product_name?: string;
  category?: string;
}

interface CartItem {
  inventory_id: string;
  product_name: string;
  imei: string;
  price: number;
  category: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string | null;
}

const formatPrice = (n: number) => `UGX ${n.toLocaleString()}`;

const paymentMethods = [
  { id: "Cash", icon: Banknote, label: "Cash" },
  { id: "Mobile Money", icon: Smartphone, label: "Mobile Money" },
  { id: "Bank", icon: Building2, label: "Bank" },
  { id: "Split", icon: CreditCard, label: "Split" },
];

const POS = () => {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("Cash");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<{ saleNumber: string; items: CartItem[]; total: number; payment: string; customer: string } | null>(null);

  // Fetch available inventory
  const fetchInventory = async () => {
    const { data, error } = await supabase
      .from("inventory" as any)
      .select("id, product_id, imei, status, selling_price, cost_price, supplier")
      .eq("status", "In Stock");

    if (error) {
      console.error("Error fetching inventory:", error);
      return;
    }

    // Fetch product names
    const { data: products } = await supabase
      .from("products" as any)
      .select("id, name, category");

    const productMap = new Map((products as any[] || []).map((p: any) => [p.id, p]));
    
    const items = ((data as any[]) || []).map((item: any) => ({
      ...item,
      product_name: productMap.get(item.product_id)?.name || "Unknown",
      category: productMap.get(item.product_id)?.category || "Other",
    }));

    setInventory(items);
    setLoading(false);
  };

  const fetchCustomers = async () => {
    const { data } = await supabase
      .from("customers" as any)
      .select("id, name, phone");
    setCustomers((data as any[]) || []);
  };

  useEffect(() => {
    fetchInventory();
    fetchCustomers();
  }, []);

  // Filter inventory not already in cart
  const cartImeis = new Set(cart.map((c) => c.imei));
  const available = useMemo(
    () =>
      inventory.filter(
        (item) =>
          !cartImeis.has(item.imei) &&
          (item.product_name?.toLowerCase().includes(search.toLowerCase()) ||
            item.imei.toLowerCase().includes(search.toLowerCase()))
      ),
    [inventory, search, cartImeis]
  );

  const addToCart = (item: InventoryItem) => {
    setCart((prev) => [
      ...prev,
      {
        inventory_id: item.id,
        product_name: item.product_name || "Unknown",
        imei: item.imei,
        price: item.selling_price,
        category: item.category || "Other",
      },
    ]);
  };

  const removeFromCart = (imei: string) => setCart((prev) => prev.filter((c) => c.imei !== imei));

  const subtotal = cart.reduce((sum, c) => sum + c.price, 0);

  const handleCreateCustomer = async () => {
    if (!newCustomerName.trim()) return;
    const { data, error } = await supabase
      .from("customers" as any)
      .insert({ name: newCustomerName.trim(), phone: newCustomerPhone.trim() || null } as any)
      .select()
      .single();

    if (error) {
      toast({ title: "Error", description: "Could not create customer", variant: "destructive" });
      return;
    }
    const customer = data as any;
    setSelectedCustomer({ id: customer.id, name: customer.name, phone: customer.phone });
    setCustomers((prev) => [...prev, { id: customer.id, name: customer.name, phone: customer.phone }]);
    setShowNewCustomer(false);
    setShowCustomerDialog(false);
    setNewCustomerName("");
    setNewCustomerPhone("");
    toast({ title: "Customer created", description: customer.name });
  };

  const completeSale = async () => {
    if (cart.length === 0) return;
    setProcessing(true);

    try {
      const saleNumber = `SL-${Date.now().toString(36).toUpperCase()}`;

      // Insert sale
      const { data: sale, error: saleError } = await supabase
        .from("sales" as any)
        .insert({
          sale_number: saleNumber,
          customer_id: selectedCustomer?.id || null,
          customer_name: selectedCustomer?.name || "Walk-in Customer",
          total_amount: subtotal,
          payment_method: selectedPayment,
          status: "Completed",
        } as any)
        .select()
        .single();

      if (saleError) throw saleError;

      const saleId = (sale as any).id;

      // Insert sale items
      const saleItems = cart.map((item) => ({
        sale_id: saleId,
        inventory_id: item.inventory_id,
        product_name: item.product_name,
        imei: item.imei,
        quantity: 1,
        unit_price: item.price,
        total_price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("sale_items" as any)
        .insert(saleItems as any);

      if (itemsError) throw itemsError;

      // Mark inventory as sold
      for (const item of cart) {
        await supabase
          .from("inventory" as any)
          .update({ status: "Sold" } as any)
          .eq("id", item.inventory_id);
      }

      // Update customer total_spent
      if (selectedCustomer) {
        const { data: cust } = await supabase
          .from("customers" as any)
          .select("total_spent")
          .eq("id", selectedCustomer.id)
          .single();
        
        if (cust) {
          await supabase
            .from("customers" as any)
            .update({ total_spent: ((cust as any).total_spent || 0) + subtotal } as any)
            .eq("id", selectedCustomer.id);
        }
      }

      setLastSale({
        saleNumber,
        items: [...cart],
        total: subtotal,
        payment: selectedPayment,
        customer: selectedCustomer?.name || "Walk-in Customer",
      });
      setShowReceipt(true);
      setCart([]);
      setSelectedCustomer(null);
      setSelectedPayment("Cash");
      fetchInventory();

      toast({ title: "Sale completed!", description: `${saleNumber} — ${formatPrice(subtotal)}` });
    } catch (err: any) {
      console.error("Sale error:", err);
      toast({ title: "Error", description: err.message || "Could not complete sale", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      (c.phone && c.phone.includes(customerSearch))
  );

  return (
    <div className="flex flex-col lg:flex-row gap-5 h-[calc(100vh-6rem)] animate-fade-in">
      {/* Product Grid */}
      <div className="flex-1 flex flex-col min-w-0">
        <h1 className="text-[28px] font-bold tracking-tight mb-5">Point of Sale</h1>
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Scan barcode or search product / IMEI..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px] apple-ring"
            autoFocus
          />
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : available.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p className="text-[14px]">{search ? "No matching items found" : "No items in stock"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 overflow-auto flex-1 pb-2">
            {available.map((item) => (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                className="glass-card p-4 text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
              >
                <div className="w-10 h-10 rounded-xl bg-secondary/60 flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors duration-300">
                  <Smartphone className="h-5 w-5 text-primary/80" />
                </div>
                <p className="text-[13px] font-medium truncate">{item.product_name}</p>
                <p className="text-[11px] text-muted-foreground font-mono mt-1">{item.imei}</p>
                <p className="text-[14px] font-semibold text-primary mt-2">{formatPrice(item.selling_price)}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Cart Panel */}
      <div className="w-full lg:w-[400px] glass-card flex flex-col shrink-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-border/20 flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-[14px] tracking-tight">Current Sale</h2>
          <span className="ml-auto text-[12px] text-muted-foreground">{cart.length} items</span>
        </div>

        {/* Customer Selection */}
        <div className="px-4 py-3 border-b border-border/20">
          <button
            onClick={() => setShowCustomerDialog(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors text-left"
          >
            <User className="h-4 w-4 text-muted-foreground" />
            {selectedCustomer ? (
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium truncate">{selectedCustomer.name}</p>
                <p className="text-[11px] text-muted-foreground">{selectedCustomer.phone || "No phone"}</p>
              </div>
            ) : (
              <span className="text-[13px] text-muted-foreground">Select customer (optional)</span>
            )}
            {selectedCustomer && (
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedCustomer(null); }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-auto px-4 py-3 space-y-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <ShoppingCart className="h-10 w-10 mb-3 opacity-20" />
              <p className="text-[13px]">Tap a product to add it</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.imei} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 animate-scale-in">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate">{item.product_name}</p>
                  <p className="text-[11px] text-muted-foreground font-mono">{item.imei}</p>
                  <p className="text-[12px] text-primary font-semibold mt-0.5">{formatPrice(item.price)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg text-destructive/60 hover:text-destructive shrink-0"
                  onClick={() => removeFromCart(item.imei)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Checkout */}
        <div className="p-5 border-t border-border/20 space-y-4">
          <div className="flex justify-between text-[16px] font-semibold">
            <span>Total ({cart.length} items)</span>
            <span className="text-primary">{formatPrice(subtotal)}</span>
          </div>

          {/* Payment Methods */}
          <div className="grid grid-cols-2 gap-2">
            {paymentMethods.map(({ id, icon: Icon, label }) => (
              <Button
                key={id}
                variant="outline"
                onClick={() => setSelectedPayment(id)}
                className={`gap-2 text-[13px] h-10 rounded-xl transition-all duration-200 ${
                  selectedPayment === id
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border/30 hover:bg-secondary/60"
                }`}
              >
                <Icon className="h-4 w-4" /> {label}
              </Button>
            ))}
          </div>

          <Button
            className="w-full h-12 text-[15px] font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
            disabled={cart.length === 0 || processing}
            onClick={completeSale}
          >
            {processing ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Processing...</>
            ) : (
              <><Check className="h-4 w-4 mr-2" /> Complete Sale — {formatPrice(subtotal)}</>
            )}
          </Button>
        </div>
      </div>

      {/* Customer Selection Dialog */}
      <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
        <DialogContent className="glass-card border-border/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-semibold">Select Customer</DialogTitle>
          </DialogHeader>
          {showNewCustomer ? (
            <div className="space-y-3">
              <Input
                placeholder="Customer name"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px]"
                autoFocus
              />
              <Input
                placeholder="Phone number (optional)"
                value={newCustomerPhone}
                onChange={(e) => setNewCustomerPhone(e.target.value)}
                className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px]"
              />
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowNewCustomer(false)}>Cancel</Button>
                <Button className="flex-1 rounded-xl bg-primary text-primary-foreground" onClick={handleCreateCustomer} disabled={!newCustomerName.trim()}>
                  Create
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Input
                placeholder="Search customers..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px]"
                autoFocus
              />
              <div className="max-h-60 overflow-auto space-y-1">
                {filteredCustomers.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCustomer(c);
                      setShowCustomerDialog(false);
                      setCustomerSearch("");
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/60 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-[11px] font-bold text-primary">{c.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</span>
                    </div>
                    <div>
                      <p className="text-[13px] font-medium">{c.name}</p>
                      <p className="text-[11px] text-muted-foreground">{c.phone || "No phone"}</p>
                    </div>
                  </button>
                ))}
              </div>
              <Button variant="outline" className="w-full gap-2 rounded-xl border-border/30" onClick={() => setShowNewCustomer(true)}>
                <Plus className="h-4 w-4" /> New Customer
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="glass-card border-border/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-semibold text-center">
              <Check className="h-6 w-6 text-success mx-auto mb-2" />
              Sale Complete
            </DialogTitle>
          </DialogHeader>
          {lastSale && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-[12px] text-muted-foreground font-mono">{lastSale.saleNumber}</p>
                <p className="text-[24px] font-bold text-primary mt-1">{formatPrice(lastSale.total)}</p>
                <p className="text-[13px] text-muted-foreground mt-0.5">{lastSale.customer} · {lastSale.payment}</p>
              </div>
              <div className="border-t border-border/20 pt-3 space-y-2">
                {lastSale.items.map((item) => (
                  <div key={item.imei} className="flex justify-between text-[13px]">
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">{item.imei}</p>
                    </div>
                    <span className="text-primary font-semibold">{formatPrice(item.price)}</span>
                  </div>
                ))}
              </div>
              <div className="text-center pt-2">
                <p className="text-[11px] text-muted-foreground">Thank you for shopping at Sunbird Online Stores!</p>
              </div>
              <Button className="w-full rounded-xl bg-primary text-primary-foreground" onClick={() => setShowReceipt(false)}>
                New Sale
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default POS;
