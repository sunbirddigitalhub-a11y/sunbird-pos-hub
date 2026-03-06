import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Search, Plus, ShoppingCart, X, CreditCard, Smartphone, Banknote, Building2, User, Check, Loader2, Printer, MessageCircle, Camera } from "lucide-react";
import html2canvas from "html2canvas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

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
  const [lastSale, setLastSale] = useState<{
    saleNumber: string;
    items: CartItem[];
    total: number;
    payment: string;
    customer: string;
    customerPhone: string;
    amountPaid: number;
    balance: number;
    warranty: number;
    date: Date;
  } | null>(null);

  const [showProcessSale, setShowProcessSale] = useState(false);
  const [salePrice, setSalePrice] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [warranty, setWarranty] = useState("6");
  const [processCustomerName, setProcessCustomerName] = useState("");
  const [processCustomerPhone, setProcessCustomerPhone] = useState("");
  const [processPayment, setProcessPayment] = useState("Cash");

  const fetchInventory = async () => {
    const { data, error } = await supabase
      .from("inventory")
      .select("id, product_id, imei, status, selling_price, cost_price, supplier")
      .eq("status", "In Stock");

    if (error) { console.error("Error fetching inventory:", error); return; }

    const { data: products } = await supabase.from("products").select("id, name, category");
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
    const { data } = await supabase.from("customers").select("id, name, phone");
    setCustomers((data as any[]) || []);
  };

  useEffect(() => { fetchInventory(); fetchCustomers(); }, []);

  const cartImeis = new Set(cart.map((c) => c.imei));
  const available = useMemo(
    () => inventory.filter(
      (item) => !cartImeis.has(item.imei) &&
        (item.product_name?.toLowerCase().includes(search.toLowerCase()) ||
          item.imei.toLowerCase().includes(search.toLowerCase()))
    ),
    [inventory, search, cartImeis]
  );

  const addToCart = (item: InventoryItem) => {
    if (cart.length === 0) {
      setCart([{
        inventory_id: item.id,
        product_name: item.product_name || "Unknown",
        imei: item.imei,
        price: item.selling_price,
        category: item.category || "Other",
      }]);
      setSalePrice(item.selling_price.toString());
      setAmountPaid(item.selling_price.toString());
      setProcessCustomerName(selectedCustomer?.name || "");
      setProcessCustomerPhone(selectedCustomer?.phone || "");
      setShowProcessSale(true);
    } else {
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
    }
  };

  const removeFromCart = (imei: string) => setCart((prev) => prev.filter((c) => c.imei !== imei));
  const subtotal = cart.reduce((sum, c) => sum + c.price, 0);

  const handleCreateCustomer = async () => {
    if (!newCustomerName.trim()) return;
    const { data, error } = await supabase
      .from("customers")
      .insert({ name: newCustomerName.trim(), phone: newCustomerPhone.trim() || null } as any)
      .select().single();

    if (error) { toast({ title: "Error", description: "Could not create customer", variant: "destructive" }); return; }
    const customer = data as any;
    setSelectedCustomer({ id: customer.id, name: customer.name, phone: customer.phone });
    setCustomers((prev) => [...prev, { id: customer.id, name: customer.name, phone: customer.phone }]);
    setShowNewCustomer(false);
    setShowCustomerDialog(false);
    setNewCustomerName("");
    setNewCustomerPhone("");
    toast({ title: "Customer created", description: customer.name });
  };

  const findOrCreateCustomer = async (name: string, phone: string): Promise<string | null> => {
    if (!name || name === "Walk-in Customer") return null;
    
    // Try to find existing customer by phone or name
    let customerId: string | null = selectedCustomer?.id || null;
    
    if (!customerId && phone) {
      const { data } = await supabase.from("customers").select("id").eq("phone", phone).maybeSingle();
      if (data) customerId = (data as any).id;
    }
    
    if (!customerId) {
      const { data } = await supabase.from("customers").select("id").eq("name", name).maybeSingle();
      if (data) customerId = (data as any).id;
    }
    
    if (!customerId) {
      const { data } = await supabase.from("customers")
        .insert({ name, phone: phone || null } as any)
        .select("id").single();
      if (data) customerId = (data as any).id;
    }
    
    return customerId;
  };

  const completeSale = async (overrideItems?: CartItem[], overrideTotal?: number, overridePayment?: string, overrideCustomerName?: string, overrideCustomerPhone?: string, overrideAmountPaid?: number, overrideWarranty?: number) => {
    const items = overrideItems || cart;
    const total = overrideTotal || subtotal;
    const payment = overridePayment || selectedPayment;
    const custName = overrideCustomerName || selectedCustomer?.name || "Walk-in Customer";
    const custPhone = overrideCustomerPhone || selectedCustomer?.phone || "";
    const paid = overrideAmountPaid ?? total;
    const warr = overrideWarranty || 6;
    const balance = Math.max(0, total - paid);

    if (items.length === 0) return;
    setProcessing(true);

    try {
      const saleNumber = `SL-${Date.now().toString(36).toUpperCase()}`;
      
      // Find or create customer (especially important for partial payments)
      const customerId = await findOrCreateCustomer(custName, custPhone);

      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .insert({
          sale_number: saleNumber,
          customer_id: customerId,
          customer_name: custName,
          total_amount: total,
          payment_method: payment,
          status: balance > 0 ? "Partial" : "Completed",
          notes: balance > 0 ? `Partial payment. Paid: ${paid}, Balance: ${balance}` : null,
        } as any).select().single();

      if (saleError) throw saleError;
      const saleId = (sale as any).id;

      const saleItems = items.map((item) => ({
        sale_id: saleId,
        inventory_id: item.inventory_id,
        product_name: item.product_name,
        imei: item.imei,
        quantity: 1,
        unit_price: item.price,
        total_price: item.price,
      }));

      const { error: itemsError } = await supabase.from("sale_items").insert(saleItems as any);
      if (itemsError) throw itemsError;

      for (const item of items) {
        await supabase.from("inventory").update({ status: "Sold" } as any).eq("id", item.inventory_id);
      }

      // Update customer: add total_spent and set balance for partial payments
      if (customerId) {
        const { data: cust } = await supabase.from("customers").select("total_spent, balance").eq("id", customerId).single();
        if (cust) {
          const existingBalance = (cust as any).balance || 0;
          await supabase.from("customers").update({
            total_spent: ((cust as any).total_spent || 0) + paid,
            balance: existingBalance + balance,
          } as any).eq("id", customerId);
        }
      }

      const saleDate = new Date();
      setLastSale({
        saleNumber,
        items: [...items],
        total,
        payment,
        customer: custName,
        customerPhone: custPhone,
        amountPaid: paid,
        balance,
        warranty: warr,
        date: saleDate,
      });
      setShowProcessSale(false);
      setShowReceipt(true);
      setCart([]);
      setSelectedCustomer(null);
      setSelectedPayment("Cash");
      fetchInventory();
      fetchCustomers();

      toast({ title: "Sale completed!", description: `${saleNumber} — ${formatPrice(total)}${balance > 0 ? ` (Balance: ${formatPrice(balance)})` : ""}` });
    } catch (err: any) {
      console.error("Sale error:", err);
      toast({ title: "Error", description: err.message || "Could not complete sale", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const handleProcessSaleComplete = () => {
    const total = Number(salePrice) || cart[0]?.price || 0;
    const updatedCart = cart.map((item, i) => i === 0 ? { ...item, price: total } : item);
    completeSale(
      updatedCart,
      total,
      processPayment,
      processCustomerName || "Walk-in Customer",
      processCustomerPhone,
      Number(amountPaid) || total,
      Number(warranty) || 6
    );
  };

  const filteredCustomers = customers.filter(
    (c) => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || (c.phone && c.phone.includes(customerSearch))
  );

  const generateReceiptHTML = () => {
    if (!lastSale) return "";
    const receiptId = lastSale.saleNumber.replace("SL-", "").slice(0, 8).toUpperCase();
    const warrantyDate = new Date(lastSale.date);
    warrantyDate.setMonth(warrantyDate.getMonth() + lastSale.warranty);

    return `
      <div style="font-family: 'Georgia', serif; max-width: 500px; margin: 0 auto; padding: 30px; background: white; color: #222;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="/images/sunbird-logo.png" style="width: 40px; height: 40px; border-radius: 8px; margin-bottom: 8px;" />
          <h1 style="margin: 0; font-size: 28px; color: #C8982C; letter-spacing: 3px;">SUNBIRD</h1>
          <p style="margin: 4px 0 0; font-size: 13px; color: #888;">Online Stores — Quality Phones from Dubai</p>
          <h2 style="margin: 15px 0 0; font-size: 16px; letter-spacing: 4px; color: #333;">S A L E S   R E C E I P T</h2>
        </div>
        <hr style="border: none; border-top: 2px solid #C8982C; margin: 15px 0;" />
        
        <div style="margin: 20px 0;">
          <p style="font-size: 11px; color: #C8982C; font-weight: bold; letter-spacing: 2px; margin-bottom: 10px;">CUSTOMER DETAILS</p>
          <div style="display: flex; justify-content: space-between; font-size: 14px; margin: 6px 0;">
            <span>Name</span><span style="font-weight: bold;">${lastSale.customer}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 14px; margin: 6px 0;">
            <span>Phone</span><span style="font-weight: bold;">${lastSale.customerPhone || "N/A"}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 14px; margin: 6px 0;">
            <span>Date</span><span style="font-weight: bold;">${format(lastSale.date, "dd MMM yyyy, hh:mm a")}</span>
          </div>
        </div>
        <hr style="border: none; border-top: 1px dashed #ccc; margin: 15px 0;" />

        <div style="margin: 20px 0;">
          <p style="font-size: 11px; color: #C8982C; font-weight: bold; letter-spacing: 2px; margin-bottom: 10px;">PRODUCT DETAILS</p>
          ${lastSale.items.map((item) => `
            <div style="display: flex; justify-content: space-between; font-size: 14px; margin: 6px 0;">
              <span>Device</span><span style="font-weight: bold;">${item.product_name}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 14px; margin: 6px 0;">
              <span>IMEI</span><span style="font-weight: bold;">${item.imei}</span>
            </div>
          `).join("")}
        </div>
        <hr style="border: none; border-top: 1px dashed #ccc; margin: 15px 0;" />

        <div style="margin: 20px 0;">
          <p style="font-size: 11px; color: #C8982C; font-weight: bold; letter-spacing: 2px; margin-bottom: 10px;">PAYMENT</p>
          <div style="display: flex; justify-content: space-between; font-size: 14px; margin: 6px 0;">
            <span>Payment Method</span><span style="font-weight: bold;">${lastSale.payment}</span>
          </div>
        </div>
        <hr style="border: none; border-top: 2px solid #C8982C; margin: 15px 0;" />

        <div style="display: flex; justify-content: space-between; font-size: 20px; font-weight: bold; color: #C8982C; margin: 15px 0;">
          <span>Total Price</span><span>${formatPrice(lastSale.total)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 14px; margin: 6px 0;">
          <span>Amount Paid</span><span style="font-weight: bold;">${formatPrice(lastSale.amountPaid)}</span>
        </div>
        ${lastSale.balance > 0 ? `
        <div style="display: flex; justify-content: space-between; font-size: 14px; margin: 6px 0; color: #e65100;">
          <span>Outstanding Balance</span><span style="font-weight: bold;">${formatPrice(lastSale.balance)}</span>
        </div>
        ` : ""}

        <div style="margin: 25px 0; padding: 15px; border: 1px solid #C8982C; border-radius: 10px; text-align: center; background: #FFFBF0;">
          <p style="font-size: 11px; color: #C8982C; font-weight: bold; letter-spacing: 2px; margin: 0;">WARRANTY VALID UNTIL</p>
          <p style="font-size: 20px; font-weight: bold; margin: 5px 0; color: #333;">${format(warrantyDate, "dd MMM yyyy")}</p>
          <p style="font-size: 12px; color: #888; margin: 0;">${lastSale.warranty} months from purchase</p>
        </div>

        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <div style="font-size: 11px; color: #666; line-height: 1.6;">
          <p style="font-weight: bold; margin-bottom: 5px;">Terms & Conditions:</p>
          <p>1. Warranty covers manufacturer defects only. Physical/water damage excluded.</p>
          <p>2. Warranty void if device is opened by unauthorized personnel.</p>
          <p>3. For installment purchases: device remains property of Sunbird Online Stores until full payment.</p>
          <p>4. Late payments may attract additional charges.</p>
          <p>5. Refunds are not available after 24 hours of purchase.</p>
          <p>Receipt ID: ${receiptId}</p>
        </div>

        <div style="text-align: center; margin-top: 25px;">
          <p style="font-size: 16px; color: #C8982C; font-weight: bold;">Thank you for choosing Sunbird! 🐦</p>
          <p style="font-size: 12px; color: #888;">📞 Contact us for support</p>
        </div>
      </div>
    `;
  };

  const sendReceiptWhatsApp = () => {
    if (!lastSale) return;
    const balanceText = lastSale.balance > 0 ? `\nOutstanding Balance: ${formatPrice(lastSale.balance)}` : "";
    const receiptText = `*SUNBIRD ONLINE STORES*\n*SALES RECEIPT*\n\nCustomer: ${lastSale.customer}\nPhone: ${lastSale.customerPhone || "N/A"}\nDate: ${format(lastSale.date, "dd MMM yyyy, hh:mm a")}\n\n${lastSale.items.map(i => `Device: ${i.product_name}\nIMEI: ${i.imei}`).join("\n")}\n\nPayment: ${lastSale.payment}\n*Total: ${formatPrice(lastSale.total)}*\nAmount Paid: ${formatPrice(lastSale.amountPaid)}${balanceText}\nWarranty: ${lastSale.warranty} months\n\nReceipt #${lastSale.saleNumber}\nThank you for choosing Sunbird! 🐦`;

    const encoded = encodeURIComponent(receiptText);
    window.open(`https://wa.me/256704811097?text=${encoded}`, "_blank");
  };

  // Compute remaining balance for Process Sale dialog
  const processBalance = Math.max(0, (Number(salePrice) || 0) - (Number(amountPaid) || 0));

  const receiptRef = useRef<HTMLDivElement>(null);

  const captureAndUploadReceipt = useCallback(async () => {
    if (!receiptRef.current || !lastSale) return;
    try {
      // Small delay to ensure receipt is fully rendered
      await new Promise((r) => setTimeout(r, 500));
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        logging: false,
      });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const fileName = `${lastSale.saleNumber}_${Date.now()}.png`;
        const { error } = await supabase.storage
          .from("receipts")
          .upload(fileName, blob, { contentType: "image/png", upsert: true });
        if (error) {
          console.error("Receipt upload error:", error);
        } else {
          console.log("Receipt saved:", fileName);
        }
      }, "image/png");
    } catch (err) {
      console.error("Receipt capture error:", err);
    }
  }, [lastSale]);

  useEffect(() => {
    if (showReceipt && lastSale) {
      captureAndUploadReceipt();
    }
  }, [showReceipt, lastSale, captureAndUploadReceipt]);

  return (
    <div className="flex flex-col lg:flex-row gap-5 h-[calc(100vh-6rem)] animate-fade-in">
      {/* Product Grid */}
      <div className="flex-1 flex flex-col min-w-0">
        <h1 className="text-[28px] font-bold tracking-tight mb-5">Point of Sale</h1>
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Scan IMEI or search by brand/model..."
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

        <div className="px-4 py-3 border-b border-border/20">
          <button onClick={() => setShowCustomerDialog(true)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors text-left">
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
              <button onClick={(e) => { e.stopPropagation(); setSelectedCustomer(null); }} className="text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </button>
        </div>

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
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive/60 hover:text-destructive shrink-0" onClick={() => removeFromCart(item.imei)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))
          )}
        </div>

        <div className="p-5 border-t border-border/20 space-y-4">
          <div className="flex justify-between text-[16px] font-semibold">
            <span>Total ({cart.length} items)</span>
            <span className="text-primary">{formatPrice(subtotal)}</span>
          </div>

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
            onClick={() => {
              if (cart.length === 1) {
                setSalePrice(cart[0].price.toString());
                setAmountPaid(cart[0].price.toString());
                setProcessCustomerName(selectedCustomer?.name || "");
                setProcessCustomerPhone(selectedCustomer?.phone || "");
                setShowProcessSale(true);
              } else {
                completeSale();
              }
            }}
          >
            {processing ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Processing...</>
            ) : (
              <><Check className="h-4 w-4 mr-2" /> Complete Sale — {formatPrice(subtotal)}</>
            )}
          </Button>
        </div>
      </div>

      {/* Process Sale Dialog */}
      <Dialog open={showProcessSale} onOpenChange={(open) => { if (!open) { setShowProcessSale(false); if (!processing) setCart([]); } }}>
        <DialogContent className="glass-card border-border/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-semibold">Process Sale</DialogTitle>
          </DialogHeader>
          {cart.length > 0 && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-secondary/30">
                <p className="text-[14px] font-semibold">{cart[0].product_name}</p>
                <p className="text-[12px] text-muted-foreground font-mono">{cart[0].imei}</p>
              </div>

              <div>
                <label className="text-[13px] font-medium block mb-1.5">Customer Name *</label>
                <Input value={processCustomerName} onChange={(e) => setProcessCustomerName(e.target.value)} placeholder="Customer name" className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px] apple-ring" />
              </div>
              <div>
                <label className="text-[13px] font-medium block mb-1.5">Customer Phone</label>
                <Input value={processCustomerPhone} onChange={(e) => setProcessCustomerPhone(e.target.value)} placeholder="+256..." className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] font-medium block mb-1.5">Sale Price (UGX) *</label>
                  <Input type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px]" />
                </div>
                <div>
                  <label className="text-[13px] font-medium block mb-1.5">Amount Paid (UGX)</label>
                  <Input type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px]" />
                </div>
              </div>

              {/* Balance indicator */}
              {processBalance > 0 && (
                <div className="p-3 rounded-xl bg-warning/10 border border-warning/20 flex justify-between items-center">
                  <span className="text-[12px] text-warning font-medium uppercase tracking-wider">Outstanding Balance</span>
                  <span className="text-[14px] font-semibold text-warning">{formatPrice(processBalance)}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] font-medium block mb-1.5">Payment Type</label>
                  <Select value={processPayment} onValueChange={setProcessPayment}>
                    <SelectTrigger className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                      <SelectItem value="Bank">Bank</SelectItem>
                      <SelectItem value="Split">Split</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[13px] font-medium block mb-1.5">Warranty (months)</label>
                  <Input type="number" value={warranty} onChange={(e) => setWarranty(e.target.value)} className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px]" />
                </div>
              </div>

              <Button
                className="w-full h-12 text-[15px] font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={processing || !processCustomerName.trim()}
                onClick={handleProcessSaleComplete}
              >
                {processing ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Processing...</> : processBalance > 0 ? `Complete Sale (Balance: ${formatPrice(processBalance)})` : "Complete Sale"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Customer Selection Dialog */}
      <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
        <DialogContent className="glass-card border-border/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-semibold">Select Customer</DialogTitle>
          </DialogHeader>
          {showNewCustomer ? (
            <div className="space-y-3">
              <Input placeholder="Customer name" value={newCustomerName} onChange={(e) => setNewCustomerName(e.target.value)} className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px]" autoFocus />
              <Input placeholder="Phone number (optional)" value={newCustomerPhone} onChange={(e) => setNewCustomerPhone(e.target.value)} className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px]" />
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowNewCustomer(false)}>Cancel</Button>
                <Button className="flex-1 rounded-xl bg-primary text-primary-foreground" onClick={handleCreateCustomer} disabled={!newCustomerName.trim()}>Create</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Input placeholder="Search customers..." value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px]" autoFocus />
              <div className="max-h-60 overflow-auto space-y-1">
                {filteredCustomers.map((c) => (
                  <button key={c.id} onClick={() => { setSelectedCustomer(c); setShowCustomerDialog(false); setCustomerSearch(""); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/60 transition-colors text-left">
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
        <DialogContent className="glass-card border-border/30 max-w-md max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-semibold text-center">
              <Check className="h-6 w-6 text-success mx-auto mb-2" />
              Sale Complete
            </DialogTitle>
          </DialogHeader>
          {lastSale && (
            <div className="space-y-4">
              {lastSale.balance > 0 && (
                <div className="p-3 rounded-xl bg-warning/10 border border-warning/20 text-center">
                  <p className="text-[12px] text-warning font-medium uppercase tracking-wider">Outstanding Balance</p>
                  <p className="text-[18px] font-bold text-warning mt-1">{formatPrice(lastSale.balance)}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Recorded in customer ledger</p>
                </div>
              )}
              <div ref={receiptRef} id="pos-receipt-content" dangerouslySetInnerHTML={{ __html: generateReceiptHTML() }} />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl gap-2 border-border/30"
                  onClick={() => {
                    const html = generateReceiptHTML();
                    const w = window.open("", "_blank", "width=600,height=900");
                    if (!w) return;
                    w.document.write(`<html><head><title>Receipt</title></head><body style="margin:0;padding:0;">${html}</body></html>`);
                    w.document.close();
                    w.print();
                  }}
                >
                  <Printer className="h-4 w-4" /> Print
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl gap-2 border-primary/30 text-primary"
                  onClick={sendReceiptWhatsApp}
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </Button>
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
