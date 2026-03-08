import { useState, useEffect } from "react";
import { Search, Loader2, DollarSign, FileText, Check, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

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

const formatPrice = (n: number) => `UGX ${n.toLocaleString()}`;

const OutstandingBalances = () => {
  const [search, setSearch] = useState("");
  const [sales, setSales] = useState<OutstandingSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<OutstandingSale | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [processing, setProcessing] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [detailSale, setDetailSale] = useState<OutstandingSale | null>(null);
  const [saleItems, setSaleItems] = useState<any[]>([]);

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

    // Get seller profiles
    const sellerIds = [...new Set((data as any[]).map((s: any) => s.sold_by).filter(Boolean))];
    let sellerMap = new Map<string, string>();
    if (sellerIds.length > 0) {
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", sellerIds);
      if (profiles) {
        (profiles as any[]).forEach((p: any) => sellerMap.set(p.user_id, p.full_name));
      }
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

  const filtered = sales.filter(
    (s) =>
      (s.sale_number?.toLowerCase().includes(search.toLowerCase())) ||
      (s.customer_name?.toLowerCase().includes(search.toLowerCase()))
  );

  const totalOutstanding = filtered.reduce((sum, s) => sum + s.balance, 0);
  const totalInvoices = filtered.length;

  const openPayment = (sale: OutstandingSale) => {
    setSelectedSale(sale);
    setPaymentAmount(sale.balance.toString());
    setPaymentMethod("Cash");
    setShowPayment(true);
  };

  const openDetail = async (sale: OutstandingSale) => {
    setDetailSale(sale);
    const { data } = await supabase.from("sale_items").select("*").eq("sale_id", sale.id);
    setSaleItems((data as any[]) || []);
    setShowDetail(true);
  };

  const handleRecordPayment = async () => {
    if (!selectedSale || !paymentAmount) return;
    setProcessing(true);
    const payAmt = Number(paymentAmount);
    const newBalance = Math.max(0, selectedSale.balance - payAmt);
    const newPaid = selectedSale.amountPaid + payAmt;
    const newStatus = newBalance <= 0 ? "Completed" : "Partial";

    try {
      const { error } = await supabase.from("sales").update({
        status: newStatus,
        notes: newBalance > 0
          ? `Partial payment. Paid: ${newPaid}, Balance: ${newBalance}`
          : `Fully paid. Total: ${selectedSale.total_amount}`,
      } as any).eq("id", selectedSale.id);

      if (error) throw error;

      // Update customer balance
      if (selectedSale.customer_id) {
        const { data: cust } = await supabase.from("customers").select("balance, total_spent").eq("id", selectedSale.customer_id).single();
        if (cust) {
          await supabase.from("customers").update({
            balance: Math.max(0, ((cust as any).balance || 0) - payAmt),
            total_spent: ((cust as any).total_spent || 0) + payAmt,
          } as any).eq("id", selectedSale.customer_id);
        }
      }

      toast({ title: newBalance <= 0 ? "Invoice fully paid!" : "Payment recorded", description: `${formatPrice(payAmt)} received` });
      setShowPayment(false);
      fetchOutstanding();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const handleMarkPaid = async (sale: OutstandingSale) => {
    setProcessing(true);
    try {
      const { error } = await supabase.from("sales").update({
        status: "Completed",
        notes: `Fully paid. Total: ${sale.total_amount}`,
      } as any).eq("id", sale.id);
      if (error) throw error;

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
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight">Outstanding Balances</h1>
        <p className="text-muted-foreground text-[14px] mt-1">Track and manage unpaid invoice balances</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="stat-card">
          <p className="text-[13px] text-muted-foreground">Total Outstanding</p>
          <p className="text-[24px] font-semibold text-warning tracking-tight mt-1">{formatPrice(totalOutstanding)}</p>
        </div>
        <div className="stat-card">
          <p className="text-[13px] text-muted-foreground">Outstanding Invoices</p>
          <p className="text-[24px] font-semibold tracking-tight mt-1">{totalInvoices}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by invoice number or customer name..."
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
          <p className="text-[14px]">{search ? "No matching invoices" : "No outstanding balances 🎉"}</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/20">
                  <TableHead className="text-[12px] uppercase tracking-wider text-muted-foreground">Invoice</TableHead>
                  <TableHead className="text-[12px] uppercase tracking-wider text-muted-foreground">Customer</TableHead>
                  <TableHead className="text-[12px] uppercase tracking-wider text-muted-foreground text-right">Total</TableHead>
                  <TableHead className="text-[12px] uppercase tracking-wider text-muted-foreground text-right">Paid</TableHead>
                  <TableHead className="text-[12px] uppercase tracking-wider text-muted-foreground text-right">Balance</TableHead>
                  <TableHead className="text-[12px] uppercase tracking-wider text-muted-foreground">Payment</TableHead>
                  <TableHead className="text-[12px] uppercase tracking-wider text-muted-foreground">Date</TableHead>
                  <TableHead className="text-[12px] uppercase tracking-wider text-muted-foreground">Staff</TableHead>
                  <TableHead className="text-[12px] uppercase tracking-wider text-muted-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((sale) => (
                  <TableRow key={sale.id} className="border-border/10 hover:bg-secondary/30 transition-colors">
                    <TableCell className="text-[13px] font-mono font-medium">{sale.sale_number}</TableCell>
                    <TableCell className="text-[13px]">{sale.customer_name || "Walk-in"}</TableCell>
                    <TableCell className="text-[13px] text-right font-medium">{formatPrice(sale.total_amount)}</TableCell>
                    <TableCell className="text-[13px] text-right text-success font-medium">{formatPrice(sale.amountPaid)}</TableCell>
                    <TableCell className="text-[13px] text-right text-warning font-semibold">{formatPrice(sale.balance)}</TableCell>
                    <TableCell className="text-[12px]">{sale.payment_method}</TableCell>
                    <TableCell className="text-[12px] text-muted-foreground">{format(new Date(sale.created_at), "dd MMM yyyy")}</TableCell>
                    <TableCell className="text-[12px]">{sale.seller_name}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" title="View details" onClick={() => openDetail(sale)}>
                          <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
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
        </div>
      )}

      {/* Record Payment Dialog */}
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
                    <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                    <SelectItem value="Bank">Bank</SelectItem>
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

      {/* Invoice Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="glass-card border-border/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-semibold">Invoice Details</DialogTitle>
          </DialogHeader>
          {detailSale && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-[13px]">
                  <span className="text-muted-foreground">Invoice</span>
                  <span className="font-mono font-medium">{detailSale.sale_number}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-medium">{detailSale.customer_name || "Walk-in"}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-muted-foreground">Date</span>
                  <span>{format(new Date(detailSale.created_at), "dd MMM yyyy, hh:mm a")}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span>{detailSale.payment_method}</span>
                </div>
              </div>

              <div className="border-t border-border/20 pt-3">
                <p className="text-[12px] text-muted-foreground uppercase tracking-wider mb-2">Items</p>
                {saleItems.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-[13px] py-1.5 border-b border-border/10">
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">{item.imei || "N/A"}</p>
                    </div>
                    <span className="font-medium">{formatPrice(item.total_price)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border/20 pt-3 space-y-1.5">
                <div className="flex justify-between text-[13px]">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="font-semibold">{formatPrice(detailSale.total_amount)}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="font-medium text-success">{formatPrice(detailSale.amountPaid)}</span>
                </div>
                <div className="flex justify-between text-[14px] font-semibold">
                  <span className="text-warning">Balance Remaining</span>
                  <span className="text-warning">{formatPrice(detailSale.balance)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 rounded-xl border-border/30 gap-2" onClick={() => { setShowDetail(false); openPayment(detailSale); }}>
                  <CreditCard className="h-4 w-4" /> Record Payment
                </Button>
                <Button className="flex-1 rounded-xl bg-primary text-primary-foreground gap-2" onClick={() => { setShowDetail(false); handleMarkPaid(detailSale); }}>
                  <Check className="h-4 w-4" /> Mark Paid
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OutstandingBalances;
