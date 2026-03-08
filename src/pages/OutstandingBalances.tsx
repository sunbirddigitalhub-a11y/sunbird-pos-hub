import { useState, useEffect, useRef } from "react";
import { Search, Loader2, DollarSign, FileText, Check, CreditCard, ChevronLeft, Phone, MapPin, History, Receipt, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import html2canvas from "html2canvas";

interface OutstandingSale {
  id: string;
  sale_number: string;
  customer_name: string | null;
  customer_id: string | null;
  total_amount: number;
  payment_method: string;
  status: string;
  notes: string | null;
  created_at: string;
  sold_by: string | null;
  amountPaid: number;
  balance: number;
  seller_name?: string;
}

interface CustomerGroup {
  customer_id: string | null;
  customer_name: string;
  phone: string | null;
  address: string | null;
  email: string | null;
  totalOutstanding: number;
  invoiceCount: number;
  sales: OutstandingSale[];
}

interface PaymentRecord {
  id: string;
  sale_id: string;
  amount: number;
  payment_method: string;
  staff_name: string | null;
  receipt_url: string | null;
  created_at: string;
  notes: string | null;
}

const formatPrice = (n: number) => `UGX ${n.toLocaleString()}`;

const OutstandingBalances = () => {
  const { profile } = useAuth();
  const [search, setSearch] = useState("");
  const [sales, setSales] = useState<OutstandingSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<OutstandingSale | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [processing, setProcessing] = useState(false);
  const [saleItems, setSaleItems] = useState<any[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Customer detail view
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerGroup | null>(null);
  const [customerPayments, setCustomerPayments] = useState<PaymentRecord[]>([]);

  // Receipt ref
  const receiptRef = useRef<HTMLDivElement>(null);

  const fetchOutstanding = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("sales")
      .select("*")
      .eq("status", "Partial")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    const sellerIds = [...new Set((data as any[]).map((s: any) => s.sold_by).filter(Boolean))];
    let sellerMap = new Map<string, string>();
    if (sellerIds.length > 0) {
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", sellerIds);
      if (profiles) (profiles as any[]).forEach((p: any) => sellerMap.set(p.user_id, p.full_name));
    }

    const parsed = ((data as any[]) || []).map((s: any) => {
      let paid = s.total_amount;
      let balance = 0;
      if (s.notes) {
        const paidMatch = s.notes.match(/Paid:\s*([\d,]+)/);
        const balMatch = s.notes.match(/Balance:\s*([\d,]+)/);
        if (paidMatch) paid = parseInt(paidMatch[1].replace(/,/g, ""));
        if (balMatch) balance = parseInt(balMatch[1].replace(/,/g, ""));
      }
      return {
        ...s,
        amountPaid: paid,
        balance,
        seller_name: s.sold_by ? sellerMap.get(s.sold_by) || "Staff" : "N/A",
      };
    });

    setSales(parsed);
    setLoading(false);
  };

  useEffect(() => { fetchOutstanding(); }, []);

  // Group sales by customer
  const [customerMap, setCustomerMap] = useState<Map<string, { phone: string | null; address: string | null; email: string | null }>>(new Map());

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      const customerIds = [...new Set(sales.map(s => s.customer_id).filter(Boolean))] as string[];
      if (customerIds.length === 0) return;
      const { data } = await supabase.from("customers").select("id, phone, address, email").in("id", customerIds);
      if (data) {
        const map = new Map<string, { phone: string | null; address: string | null; email: string | null }>();
        (data as any[]).forEach((c: any) => map.set(c.id, { phone: c.phone, address: c.address, email: c.email }));
        setCustomerMap(map);
      }
    };
    fetchCustomerDetails();
  }, [sales]);

  const customerGroups: CustomerGroup[] = (() => {
    const groups = new Map<string, CustomerGroup>();
    for (const sale of sales) {
      const key = sale.customer_id || "walk-in";
      const custInfo = sale.customer_id ? customerMap.get(sale.customer_id) : null;
      if (!groups.has(key)) {
        groups.set(key, {
          customer_id: sale.customer_id,
          customer_name: sale.customer_name || "Walk-in",
          phone: custInfo?.phone || null,
          address: custInfo?.address || null,
          email: custInfo?.email || null,
          totalOutstanding: 0,
          invoiceCount: 0,
          sales: [],
        });
      }
      const group = groups.get(key)!;
      group.totalOutstanding += sale.balance;
      group.invoiceCount += 1;
      group.sales.push(sale);
    }
    return Array.from(groups.values()).sort((a, b) => b.totalOutstanding - a.totalOutstanding);
  })();

  const filtered = search
    ? customerGroups.filter(g =>
        g.customer_name.toLowerCase().includes(search.toLowerCase()) ||
        (g.phone && g.phone.includes(search))
      )
    : customerGroups;

  const totalOutstanding = sales.reduce((sum, s) => sum + s.balance, 0);
  const totalInvoices = sales.length;
  const customersWithBalances = customerGroups.length;

  // Open customer detail
  const openCustomerDetail = async (group: CustomerGroup) => {
    setSelectedCustomer(group);
    // Fetch payment history for all customer sales
    const saleIds = group.sales.map(s => s.id);
    const { data } = await supabase
      .from("payment_history" as any)
      .select("*")
      .in("sale_id", saleIds)
      .order("created_at", { ascending: false });
    setCustomerPayments((data as any[]) || []);
  };

  // Open payment dialog
  const openPayment = (sale: OutstandingSale) => {
    setSelectedSale(sale);
    setPaymentAmount(sale.balance.toString());
    setPaymentMethod("Cash");
    setShowPayment(true);
  };

  // Fetch payment history for a specific sale
  const fetchPaymentHistory = async (saleId: string) => {
    setLoadingHistory(true);
    const { data } = await supabase
      .from("payment_history" as any)
      .select("*")
      .eq("sale_id", saleId)
      .order("created_at", { ascending: false });
    setPaymentHistory((data as any[]) || []);
    setLoadingHistory(false);
  };

  // Record payment
  const handleRecordPayment = async () => {
    if (!selectedSale || !paymentAmount) return;
    setProcessing(true);
    const payAmt = Number(paymentAmount);
    if (payAmt <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      setProcessing(false);
      return;
    }

    const newBalance = Math.max(0, selectedSale.balance - payAmt);
    const newPaid = selectedSale.amountPaid + payAmt;
    const newStatus = newBalance <= 0 ? "Completed" : "Partial";

    try {
      // 1. Update sale
      const { error: saleErr } = await supabase.from("sales").update({
        status: newStatus,
        notes: newBalance > 0
          ? `Partial payment. Paid: ${newPaid}, Balance: ${newBalance}`
          : `Fully paid. Total: ${selectedSale.total_amount}`,
      } as any).eq("id", selectedSale.id);
      if (saleErr) throw saleErr;

      // 2. Record payment history
      const { error: phErr } = await supabase.from("payment_history" as any).insert({
        sale_id: selectedSale.id,
        customer_id: selectedSale.customer_id,
        amount: payAmt,
        payment_method: paymentMethod,
        staff_name: profile?.full_name || null,
        staff_user_id: profile?.user_id || null,
        notes: `Payment of ${formatPrice(payAmt)} via ${paymentMethod}. ${newBalance <= 0 ? "Invoice fully paid." : `Remaining balance: ${formatPrice(newBalance)}`}`,
      } as any);
      if (phErr) throw phErr;

      // 3. Update customer balance
      if (selectedSale.customer_id) {
        const { data: cust } = await supabase.from("customers").select("balance, total_spent").eq("id", selectedSale.customer_id).single();
        if (cust) {
          await supabase.from("customers").update({
            balance: Math.max(0, ((cust as any).balance || 0) - payAmt),
            total_spent: ((cust as any).total_spent || 0) + payAmt,
          } as any).eq("id", selectedSale.customer_id);
        }
      }

      // 4. Generate payment receipt and store
      await generateAndStoreReceipt(selectedSale, payAmt, paymentMethod, newBalance, newPaid);

      toast({ title: newBalance <= 0 ? "Invoice fully paid!" : "Payment recorded", description: `${formatPrice(payAmt)} received` });
      setShowPayment(false);
      fetchOutstanding();

      // Refresh customer detail if open
      if (selectedCustomer) {
        setTimeout(() => {
          const updatedGroup = { ...selectedCustomer };
          openCustomerDetail(updatedGroup);
        }, 500);
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  // Generate payment receipt
  const generateAndStoreReceipt = async (
    sale: OutstandingSale, payAmt: number, method: string, newBalance: number, newPaid: number
  ) => {
    try {
      const receiptHtml = `
        <div style="font-family:'Courier New',monospace;font-size:12px;padding:20px;max-width:300px;margin:0 auto;background:white;">
          <div style="text-align:center;font-weight:bold;font-size:14px;">Sunbird Online Stores</div>
          <div style="text-align:center;font-size:11px;color:#888;">Payment Receipt</div>
          <div style="border-top:1px dashed #ccc;margin:8px 0;"></div>
          <div style="display:flex;justify-content:space-between;"><span>Invoice:</span><span>${sale.sale_number}</span></div>
          <div style="display:flex;justify-content:space-between;"><span>Customer:</span><span>${sale.customer_name || "Walk-in"}</span></div>
          <div style="display:flex;justify-content:space-between;"><span>Date:</span><span>${format(new Date(), "dd/MM/yyyy HH:mm")}</span></div>
          <div style="display:flex;justify-content:space-between;"><span>Staff:</span><span>${profile?.full_name || "N/A"}</span></div>
          <div style="border-top:1px dashed #ccc;margin:8px 0;"></div>
          <div style="display:flex;justify-content:space-between;"><span>Invoice Total:</span><span>${formatPrice(sale.total_amount)}</span></div>
          <div style="display:flex;justify-content:space-between;"><span>Previously Paid:</span><span>${formatPrice(sale.amountPaid)}</span></div>
          <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:14px;"><span>Payment:</span><span>${formatPrice(payAmt)}</span></div>
          <div style="display:flex;justify-content:space-between;"><span>Method:</span><span>${method}</span></div>
          <div style="border-top:1px dashed #ccc;margin:8px 0;"></div>
          <div style="display:flex;justify-content:space-between;"><span>Total Paid:</span><span>${formatPrice(newPaid)}</span></div>
          <div style="display:flex;justify-content:space-between;font-weight:bold;color:${newBalance > 0 ? '#d97706' : '#16a34a'};">
            <span>Balance:</span><span>${newBalance > 0 ? formatPrice(newBalance) : "CLEARED"}</span>
          </div>
          <div style="text-align:center;font-size:10px;color:#888;margin-top:12px;">Thank you for your payment!</div>
        </div>
      `;

      // Create a temporary element to render receipt
      const container = document.createElement("div");
      container.innerHTML = receiptHtml;
      container.style.position = "absolute";
      container.style.left = "-9999px";
      document.body.appendChild(container);

      const canvas = await html2canvas(container, { backgroundColor: "#ffffff", scale: 2 });
      document.body.removeChild(container);

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const fileName = `payment_${sale.sale_number}_${Date.now()}.png`;
        await supabase.storage.from("payment-receipts").upload(fileName, blob, { contentType: "image/png" });
      }, "image/png");
    } catch (err) {
      console.error("Receipt generation error:", err);
    }
  };

  // Mark as fully paid
  const handleMarkPaid = async (sale: OutstandingSale) => {
    setProcessing(true);
    try {
      const { error } = await supabase.from("sales").update({
        status: "Completed",
        notes: `Fully paid. Total: ${sale.total_amount}`,
      } as any).eq("id", sale.id);
      if (error) throw error;

      // Record in payment history
      await supabase.from("payment_history" as any).insert({
        sale_id: sale.id,
        customer_id: sale.customer_id,
        amount: sale.balance,
        payment_method: "Cash",
        staff_name: profile?.full_name || null,
        staff_user_id: profile?.user_id || null,
        notes: `Invoice marked as fully paid. Balance of ${formatPrice(sale.balance)} cleared.`,
      } as any);

      if (sale.customer_id) {
        const { data: cust } = await supabase.from("customers").select("balance, total_spent").eq("id", sale.customer_id).single();
        if (cust) {
          await supabase.from("customers").update({
            balance: Math.max(0, ((cust as any).balance || 0) - sale.balance),
            total_spent: ((cust as any).total_spent || 0) + sale.balance,
          } as any).eq("id", sale.customer_id);
        }
      }

      toast({ title: "Invoice marked as fully paid" });
      fetchOutstanding();
      if (selectedCustomer) {
        setTimeout(() => openCustomerDetail(selectedCustomer), 500);
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  // ─── CUSTOMER DETAIL VIEW ───
  if (selectedCustomer) {
    // Re-derive the customer's outstanding sales from the latest data
    const custSales = sales.filter(s =>
      selectedCustomer.customer_id
        ? s.customer_id === selectedCustomer.customer_id
        : !s.customer_id && selectedCustomer.customer_name === (s.customer_name || "Walk-in")
    );
    const custTotal = custSales.reduce((s, sale) => s + sale.balance, 0);

    return (
      <div className="space-y-6 animate-fade-in max-w-7xl">
        <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground -ml-2" onClick={() => setSelectedCustomer(null)}>
          <ChevronLeft className="h-4 w-4" /> Back to Outstanding Balances
        </Button>

        {/* Customer Header */}
        <div className="glass-card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
              <span className="text-[18px] font-bold text-primary">
                {selectedCustomer.customer_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-[22px] font-bold tracking-tight">{selectedCustomer.customer_name}</h2>
              <div className="flex flex-wrap gap-4 mt-1 text-[13px] text-muted-foreground">
                {selectedCustomer.phone && (
                  <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {selectedCustomer.phone}</span>
                )}
                {selectedCustomer.address && (
                  <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {selectedCustomer.address}</span>
                )}
                {selectedCustomer.email && (
                  <span className="flex items-center gap-1.5">✉ {selectedCustomer.email}</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-[12px] text-muted-foreground uppercase tracking-wider">Total Outstanding</p>
              <p className="text-[26px] font-bold text-warning tracking-tight">{formatPrice(custTotal)}</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="invoices" className="w-full">
          <TabsList className="bg-secondary/50 rounded-xl p-1 h-auto gap-1">
            <TabsTrigger value="invoices" className="rounded-lg text-[12px] gap-1.5 data-[state=active]:bg-background">
              <FileText className="h-3.5 w-3.5" /> Invoices ({custSales.length})
            </TabsTrigger>
            <TabsTrigger value="payments" className="rounded-lg text-[12px] gap-1.5 data-[state=active]:bg-background">
              <History className="h-3.5 w-3.5" /> Payment History ({customerPayments.length})
            </TabsTrigger>
          </TabsList>

          {/* Outstanding Invoices */}
          <TabsContent value="invoices" className="mt-4">
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/20">
                      <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground">Invoice</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground">Date</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground text-right">Total</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground text-right">Paid</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground text-right">Balance</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground">Status</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {custSales.map((sale) => (
                      <TableRow key={sale.id} className="border-border/10 hover:bg-secondary/30">
                        <TableCell className="text-[13px] font-mono font-medium text-primary">{sale.sale_number}</TableCell>
                        <TableCell className="text-[12px] text-muted-foreground">{format(new Date(sale.created_at), "dd MMM yyyy")}</TableCell>
                        <TableCell className="text-[13px] text-right font-medium">{formatPrice(sale.total_amount)}</TableCell>
                        <TableCell className="text-[13px] text-right text-success font-medium">{formatPrice(sale.amountPaid)}</TableCell>
                        <TableCell className="text-[13px] text-right text-warning font-semibold">{formatPrice(sale.balance)}</TableCell>
                        <TableCell><span className="px-2 py-0.5 rounded-md bg-warning/10 text-warning text-[11px] font-medium">Partial</span></TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" title="Record payment" onClick={() => openPayment(sale)}>
                              <CreditCard className="h-3.5 w-3.5 text-primary" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" title="Mark as paid" onClick={() => handleMarkPaid(sale)}>
                              <Check className="h-3.5 w-3.5 text-success" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="px-6 py-3 bg-secondary/20 border-t border-border/20 flex justify-between text-[13px] font-semibold">
                <span>Total Outstanding</span>
                <span className="text-warning">{formatPrice(custTotal)}</span>
              </div>
            </div>
          </TabsContent>

          {/* Payment History */}
          <TabsContent value="payments" className="mt-4">
            <div className="glass-card overflow-hidden">
              {customerPayments.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-[14px]">No payment history yet</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/20">
                        <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground">Date</TableHead>
                        <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground text-right">Amount</TableHead>
                        <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground">Method</TableHead>
                        <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground">Staff</TableHead>
                        <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground">Notes</TableHead>
                        <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground">Receipt</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customerPayments.map((p) => (
                        <TableRow key={p.id} className="border-border/10 hover:bg-secondary/30">
                          <TableCell className="text-[12px]">{format(new Date(p.created_at), "dd MMM yyyy, HH:mm")}</TableCell>
                          <TableCell className="text-[13px] text-right font-semibold text-success">{formatPrice(p.amount)}</TableCell>
                          <TableCell className="text-[12px]">{p.payment_method}</TableCell>
                          <TableCell className="text-[12px] text-muted-foreground">{p.staff_name || "N/A"}</TableCell>
                          <TableCell className="text-[12px] text-muted-foreground max-w-[200px] truncate">{p.notes || "—"}</TableCell>
                          <TableCell>
                            {p.receipt_url ? (
                              <a href={p.receipt_url} target="_blank" rel="noopener noreferrer" className="text-primary text-[12px] hover:underline flex items-center gap-1">
                                <Receipt className="h-3.5 w-3.5" /> View
                              </a>
                            ) : (
                              <span className="text-[11px] text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              {customerPayments.length > 0 && (
                <div className="px-6 py-3 bg-secondary/20 border-t border-border/20 flex justify-between text-[13px] font-semibold">
                  <span>Total Payments Recorded</span>
                  <span className="text-success">{formatPrice(customerPayments.reduce((s, p) => s + p.amount, 0))}</span>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Record Payment Dialog */}
        {renderPaymentDialog()}
      </div>
    );
  }

  // ─── HELPER: Payment Dialog ───
  function renderPaymentDialog() {
    return (
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="glass-card border-border/30 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-semibold">Record Payment</DialogTitle>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-secondary/30 space-y-1">
                <p className="text-[13px] font-mono font-medium">{selectedSale.sale_number}</p>
                <p className="text-[12px] text-muted-foreground">{selectedSale.customer_name}</p>
                <div className="flex justify-between mt-2">
                  <span className="text-[12px] text-muted-foreground">Invoice Total</span>
                  <span className="text-[13px] font-medium">{formatPrice(selectedSale.total_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[12px] text-muted-foreground">Already Paid</span>
                  <span className="text-[13px] font-medium text-success">{formatPrice(selectedSale.amountPaid)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[12px] text-muted-foreground">Outstanding</span>
                  <span className="text-[14px] font-semibold text-warning">{formatPrice(selectedSale.balance)}</span>
                </div>
              </div>
              <div>
                <label className="text-[13px] font-medium block mb-1.5">Payment Amount (UGX)</label>
                <Input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px]" />
              </div>
              <div>
                <label className="text-[13px] font-medium block mb-1.5">Payment Method</label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="MTN MoMo">MTN MoMo</SelectItem>
                    <SelectItem value="Airtel Pay">Airtel Pay</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold"
                disabled={!paymentAmount || Number(paymentAmount) <= 0 || processing}
                onClick={handleRecordPayment}
              >
                {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : `Record ${formatPrice(Number(paymentAmount) || 0)}`}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  // ─── MAIN VIEW: Customer List ───
  return (
    <div className="space-y-6 animate-fade-in max-w-7xl">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight">Outstanding Balances</h1>
        <p className="text-muted-foreground text-[14px] mt-1">Track and manage unpaid invoice balances by customer</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-[13px] text-muted-foreground">Total Outstanding</p>
          <p className="text-[24px] font-semibold text-warning tracking-tight mt-1">{formatPrice(totalOutstanding)}</p>
        </div>
        <div className="stat-card">
          <p className="text-[13px] text-muted-foreground">Outstanding Invoices</p>
          <p className="text-[24px] font-semibold tracking-tight mt-1">{totalInvoices}</p>
        </div>
        <div className="stat-card">
          <p className="text-[13px] text-muted-foreground">Customers With Balances</p>
          <p className="text-[24px] font-semibold tracking-tight mt-1">{customersWithBalances}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by customer name or phone..."
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
          <DollarSign className="h-10 w-10 mb-3 opacity-20" />
          <p className="text-[14px]">{search ? "No matching customers" : "No outstanding balances 🎉"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((group) => (
            <div
              key={group.customer_id || "walk-in"}
              className="glass-card p-4 hover:bg-secondary/20 transition-colors cursor-pointer"
              onClick={() => openCustomerDetail(group)}
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                  <span className="text-[13px] font-bold text-primary">
                    {group.customer_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-semibold truncate">{group.customer_name}</p>
                    <span className="px-2 py-0.5 rounded-md bg-warning/10 text-warning text-[11px] font-medium shrink-0">
                      {group.invoiceCount} {group.invoiceCount === 1 ? "invoice" : "invoices"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[12px] text-muted-foreground mt-0.5">
                    {group.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {group.phone}</span>}
                    <span>Last: {format(new Date(group.sales[0].created_at), "dd MMM yyyy")}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[18px] font-bold text-warning tracking-tight">{formatPrice(group.totalOutstanding)}</p>
                  <p className="text-[11px] text-muted-foreground">outstanding</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {renderPaymentDialog()}
    </div>
  );
};

export default OutstandingBalances;
