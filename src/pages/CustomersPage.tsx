import { useState, useEffect } from "react";
import { Search, Plus, Loader2, Users, Edit2, Trash2, Eye, CreditCard, Check, AlertCircle, Phone, Mail, MapPin, FileText, ArrowLeft, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  balance: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

interface Sale {
  id: string;
  sale_number: string;
  total_amount: number;
  payment_method: string;
  status: string;
  notes: string | null;
  created_at: string;
  amountPaid: number;
  balance: number;
}

const formatPrice = (n: number) => `UGX ${n.toLocaleString()}`;

const CustomersPage = () => {
  const { role } = useAuth();
  const isAdmin = role === "master_admin" || role === "supervisor";

  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formNotes, setFormNotes] = useState("");

  // Profile view state
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
  const [customerSales, setCustomerSales] = useState<Sale[]>([]);
  const [loadingSales, setLoadingSales] = useState(false);

  // Payment dialog
  const [showPayment, setShowPayment] = useState(false);
  const [paymentSale, setPaymentSale] = useState<Sale | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [processing, setProcessing] = useState(false);

  const fetchCustomers = async () => {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setCustomers(data as unknown as Customer[]);
    if (error) console.error(error);
    setLoading(false);
  };

  useEffect(() => { fetchCustomers(); }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search)) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  const totalCustomers = customers.length;
  const withBalances = customers.filter((c) => c.balance > 0).length;
  const totalOutstanding = customers.reduce((s, c) => s + c.balance, 0);
  const totalRevenue = customers.reduce((s, c) => s + c.total_spent, 0);

  const openAdd = () => {
    setEditing(null);
    setFormName(""); setFormPhone(""); setFormEmail(""); setFormAddress(""); setFormNotes("");
    setShowForm(true);
  };

  const openEdit = (c: Customer) => {
    setEditing(c);
    setFormName(c.name); setFormPhone(c.phone || ""); setFormEmail(c.email || "");
    setFormAddress(c.address || ""); setFormNotes(c.notes || "");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formName.trim() || !formPhone.trim()) return;
    setSaving(true);

    const payload: any = {
      name: formName.trim(),
      phone: formPhone.trim(),
      email: formEmail.trim() || null,
      address: formAddress.trim() || null,
      notes: formNotes.trim() || null,
    };

    if (editing) {
      const { error } = await supabase.from("customers").update(payload).eq("id", editing.id);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else {
        toast({ title: "Customer updated" });
        if (viewCustomer?.id === editing.id) {
          setViewCustomer({ ...viewCustomer, ...payload } as Customer);
        }
      }
    } else {
      const { error } = await supabase.from("customers").insert(payload as any);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Customer added" });
    }

    setSaving(false);
    setShowForm(false);
    fetchCustomers();
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    const { error } = await supabase.from("customers").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Customer deleted" }); fetchCustomers(); }
  };

  const openProfile = async (customer: Customer) => {
    setViewCustomer(customer);
    setLoadingSales(true);
    const { data } = await supabase
      .from("sales")
      .select("*")
      .eq("customer_id", customer.id)
      .order("created_at", { ascending: false });

    const parsed = ((data as any[]) || []).map((s: any) => {
      let paid = s.total_amount;
      let balance = 0;
      if (s.notes) {
        const paidMatch = s.notes.match(/Paid:\s*([\d,]+)/);
        const balMatch = s.notes.match(/Balance:\s*([\d,]+)/);
        if (paidMatch) paid = parseInt(paidMatch[1].replace(/,/g, ""));
        if (balMatch) balance = parseInt(balMatch[1].replace(/,/g, ""));
      }
      if (s.status === "Completed") balance = 0;
      return { ...s, amountPaid: paid, balance };
    });

    setCustomerSales(parsed);
    setLoadingSales(false);
  };

  const openPaymentDialog = (sale: Sale) => {
    setPaymentSale(sale);
    setPaymentAmount(sale.balance.toString());
    setPaymentMethod("Cash");
    setShowPayment(true);
  };

  const handleRecordPayment = async () => {
    if (!paymentSale || !viewCustomer || !paymentAmount) return;
    setProcessing(true);
    const payAmt = Number(paymentAmount);
    const newBalance = Math.max(0, paymentSale.balance - payAmt);
    const newPaid = paymentSale.amountPaid + payAmt;
    const newStatus = newBalance <= 0 ? "Completed" : "Partial";

    try {
      const { error } = await supabase.from("sales").update({
        status: newStatus,
        notes: newBalance > 0
          ? `Partial payment. Paid: ${newPaid}, Balance: ${newBalance}`
          : `Fully paid. Total: ${paymentSale.total_amount}`,
      } as any).eq("id", paymentSale.id);
      if (error) throw error;

      // Update customer balance
      const { data: cust } = await supabase.from("customers").select("balance, total_spent").eq("id", viewCustomer.id).single();
      if (cust) {
        await supabase.from("customers").update({
          balance: Math.max(0, ((cust as any).balance || 0) - payAmt),
          total_spent: ((cust as any).total_spent || 0) + payAmt,
        } as any).eq("id", viewCustomer.id);
      }

      toast({ title: newBalance <= 0 ? "Invoice fully paid!" : "Payment recorded", description: `${formatPrice(payAmt)} received` });
      setShowPayment(false);
      fetchCustomers();
      openProfile({ ...viewCustomer, balance: Math.max(0, viewCustomer.balance - payAmt), total_spent: viewCustomer.total_spent + payAmt });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const handleMarkPaid = async (sale: Sale) => {
    if (!viewCustomer) return;
    setProcessing(true);
    try {
      await supabase.from("sales").update({
        status: "Completed",
        notes: `Fully paid. Total: ${sale.total_amount}`,
      } as any).eq("id", sale.id);

      const { data: cust } = await supabase.from("customers").select("balance, total_spent").eq("id", viewCustomer.id).single();
      if (cust) {
        await supabase.from("customers").update({
          balance: Math.max(0, ((cust as any).balance || 0) - sale.balance),
          total_spent: ((cust as any).total_spent || 0) + sale.balance,
        } as any).eq("id", viewCustomer.id);
      }

      toast({ title: "Invoice marked as paid" });
      fetchCustomers();
      openProfile({ ...viewCustomer, balance: Math.max(0, viewCustomer.balance - sale.balance), total_spent: viewCustomer.total_spent + sale.balance });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  // ── PROFILE VIEW ──
  if (viewCustomer) {
    const outstandingSales = customerSales.filter((s) => s.status === "Partial" && s.balance > 0);
    return (
      <div className="space-y-6 animate-fade-in max-w-7xl">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setViewCustomer(null)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-[28px] font-bold tracking-tight">{viewCustomer.name}</h1>
            <p className="text-muted-foreground text-[14px] mt-0.5">Customer Profile</p>
          </div>
          {isAdmin && (
            <Button variant="outline" className="ml-auto gap-2 rounded-xl border-border/30 text-[13px]" onClick={() => openEdit(viewCustomer)}>
              <Edit2 className="h-3.5 w-3.5" /> Edit
            </Button>
          )}
        </div>

        {/* Customer Details Card */}
        <div className="glass-card p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Phone</p>
                <p className="text-[13px] font-medium">{viewCustomer.phone || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Email</p>
                <p className="text-[13px] font-medium">{viewCustomer.email || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Address</p>
                <p className="text-[13px] font-medium">{viewCustomer.address || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Customer Since</p>
                <p className="text-[13px] font-medium">{format(new Date(viewCustomer.created_at), "dd MMM yyyy")}</p>
              </div>
            </div>
          </div>
          {viewCustomer.notes && (
            <div className="mt-4 pt-3 border-t border-border/20">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Notes</p>
              <p className="text-[13px]">{viewCustomer.notes}</p>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="stat-card">
            <p className="text-[13px] text-muted-foreground">Total Purchases</p>
            <p className="text-[22px] font-semibold tracking-tight mt-1">{customerSales.length}</p>
          </div>
          <div className="stat-card">
            <p className="text-[13px] text-muted-foreground">Total Spent</p>
            <p className="text-[22px] font-semibold text-primary tracking-tight mt-1">{formatPrice(viewCustomer.total_spent)}</p>
          </div>
          <div className="stat-card">
            <p className="text-[13px] text-muted-foreground">Outstanding Balance</p>
            <p className={`text-[22px] font-semibold tracking-tight mt-1 ${viewCustomer.balance > 0 ? "text-warning" : "text-success"}`}>
              {viewCustomer.balance > 0 ? formatPrice(viewCustomer.balance) : "Cleared"}
            </p>
          </div>
          <div className="stat-card">
            <p className="text-[13px] text-muted-foreground">Unpaid Invoices</p>
            <p className="text-[22px] font-semibold tracking-tight mt-1">{outstandingSales.length}</p>
          </div>
        </div>

        {/* Outstanding Balances */}
        {outstandingSales.length > 0 && (
          <div>
            <h3 className="text-[15px] font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-warning" /> Outstanding Invoices
            </h3>
            <div className="glass-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/20">
                    <TableHead className="text-[11px] uppercase tracking-wider">Invoice</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider">Date</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider text-right">Total</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider text-right">Paid</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider text-right">Balance</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {outstandingSales.map((sale) => (
                    <TableRow key={sale.id} className="border-border/10">
                      <TableCell className="text-[13px] font-mono">{sale.sale_number}</TableCell>
                      <TableCell className="text-[12px] text-muted-foreground">{format(new Date(sale.created_at), "dd MMM yyyy")}</TableCell>
                      <TableCell className="text-[13px] text-right font-medium">{formatPrice(sale.total_amount)}</TableCell>
                      <TableCell className="text-[13px] text-right text-success">{formatPrice(sale.amountPaid)}</TableCell>
                      <TableCell className="text-[13px] text-right text-warning font-semibold">{formatPrice(sale.balance)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" title="Record payment" onClick={() => openPaymentDialog(sale)}>
                            <CreditCard className="h-3.5 w-3.5 text-primary" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" title="Mark paid" onClick={() => handleMarkPaid(sale)}>
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

        {/* Purchase History */}
        <div>
          <h3 className="text-[15px] font-semibold mb-3">Purchase History</h3>
          {loadingSales ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 text-primary animate-spin" /></div>
          ) : customerSales.length === 0 ? (
            <div className="glass-card p-8 text-center text-muted-foreground">
              <p className="text-[13px]">No purchases yet</p>
            </div>
          ) : (
            <div className="glass-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/20">
                    <TableHead className="text-[11px] uppercase tracking-wider">Invoice</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider">Date</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider text-right">Total</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider text-right">Paid</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider text-right">Balance</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider">Payment</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerSales.map((sale) => (
                    <TableRow key={sale.id} className="border-border/10">
                      <TableCell className="text-[13px] font-mono">{sale.sale_number}</TableCell>
                      <TableCell className="text-[12px] text-muted-foreground">{format(new Date(sale.created_at), "dd MMM yyyy")}</TableCell>
                      <TableCell className="text-[13px] text-right font-medium">{formatPrice(sale.total_amount)}</TableCell>
                      <TableCell className="text-[13px] text-right text-success">{formatPrice(sale.amountPaid)}</TableCell>
                      <TableCell className="text-[13px] text-right">
                        {sale.balance > 0 ? <span className="text-warning font-semibold">{formatPrice(sale.balance)}</span> : <span className="text-success">—</span>}
                      </TableCell>
                      <TableCell className="text-[12px]">{sale.payment_method}</TableCell>
                      <TableCell>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                          sale.status === "Completed" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
                        }`}>
                          {sale.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Payment Dialog */}
        <Dialog open={showPayment} onOpenChange={setShowPayment}>
          <DialogContent className="glass-card border-border/30 max-w-sm">
            <DialogHeader><DialogTitle className="text-[16px] font-semibold">Record Payment</DialogTitle></DialogHeader>
            {paymentSale && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-secondary/30 space-y-1">
                  <p className="text-[13px] font-mono font-medium">{paymentSale.sale_number}</p>
                  <div className="flex justify-between mt-2">
                    <span className="text-[12px] text-muted-foreground">Outstanding</span>
                    <span className="text-[14px] font-semibold text-warning">{formatPrice(paymentSale.balance)}</span>
                  </div>
                </div>
                <div>
                  <label className="text-[13px] font-medium block mb-1.5">Amount (UGX)</label>
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
                <Button className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold" disabled={!paymentAmount || Number(paymentAmount) <= 0 || processing} onClick={handleRecordPayment}>
                  {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : `Record ${formatPrice(Number(paymentAmount) || 0)}`}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit form dialog (reused) */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="glass-card border-border/30 max-w-md">
            <DialogHeader><DialogTitle className="text-[16px] font-semibold">Edit Customer</DialogTitle></DialogHeader>
            <CustomerFormFields
              formName={formName} setFormName={setFormName}
              formPhone={formPhone} setFormPhone={setFormPhone}
              formEmail={formEmail} setFormEmail={setFormEmail}
              formAddress={formAddress} setFormAddress={setFormAddress}
              formNotes={formNotes} setFormNotes={setFormNotes}
              saving={saving} onSave={handleSave} onCancel={() => setShowForm(false)}
              isEdit
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ── LIST VIEW ──
  return (
    <div className="space-y-6 animate-fade-in max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground text-[14px] mt-1">Manage customer accounts and credit sales</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-10 rounded-xl text-[13px] font-semibold active:scale-[0.97] transition-all" onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add Customer
        </Button>
      </div>

      {/* Summary Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-[13px] text-muted-foreground">Total Customers</p>
          <p className="text-[24px] font-semibold tracking-tight mt-1">{totalCustomers}</p>
        </div>
        <div className="stat-card">
          <p className="text-[13px] text-muted-foreground">With Balances</p>
          <p className="text-[24px] font-semibold text-warning tracking-tight mt-1">{withBalances}</p>
        </div>
        <div className="stat-card">
          <p className="text-[13px] text-muted-foreground">Total Outstanding</p>
          <p className="text-[24px] font-semibold text-warning tracking-tight mt-1">{formatPrice(totalOutstanding)}</p>
        </div>
        <div className="stat-card">
          <p className="text-[13px] text-muted-foreground">Total Revenue</p>
          <p className="text-[24px] font-semibold text-primary tracking-tight mt-1">{formatPrice(totalRevenue)}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by name, phone, or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px] apple-ring" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 text-primary animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Users className="h-10 w-10 mb-3 opacity-20" />
          <p className="text-[14px]">{search ? "No matching customers" : "No customers yet. Add your first customer!"}</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/20">
                <TableHead className="text-[11px] uppercase tracking-wider">Customer</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider">Phone</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-right">Total Spent</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-right">Balance</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider">Last Updated</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id} className="border-border/10 hover:bg-secondary/20 transition-colors cursor-pointer" onClick={() => openProfile(c)}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                        <span className="text-[11px] font-bold text-primary">{c.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</span>
                      </div>
                      <div>
                        <p className="text-[13px] font-medium">{c.name}</p>
                        {c.email && <p className="text-[11px] text-muted-foreground">{c.email}</p>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-[13px] text-muted-foreground">{c.phone || "—"}</TableCell>
                  <TableCell className="text-[13px] text-right font-semibold text-primary">{formatPrice(c.total_spent)}</TableCell>
                  <TableCell className="text-[13px] text-right">
                    {c.balance > 0 ? (
                      <span className="text-warning font-semibold flex items-center gap-1 justify-end">
                        <AlertCircle className="h-3 w-3" /> {formatPrice(c.balance)}
                      </span>
                    ) : (
                      <span className="text-success text-[12px]">Cleared</span>
                    )}
                  </TableCell>
                  <TableCell className="text-[12px] text-muted-foreground">{format(new Date(c.updated_at), "dd MMM yyyy")}</TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" title="View profile" onClick={() => openProfile(c)}>
                        <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                      {isAdmin && (
                        <>
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" title="Edit" onClick={() => openEdit(c)}>
                            <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" title="Delete" onClick={() => handleDelete(c.id)}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive/60" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add/Edit Customer Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="glass-card border-border/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-semibold">{editing ? "Edit Customer" : "Add Customer"}</DialogTitle>
          </DialogHeader>
          <CustomerFormFields
            formName={formName} setFormName={setFormName}
            formPhone={formPhone} setFormPhone={setFormPhone}
            formEmail={formEmail} setFormEmail={setFormEmail}
            formAddress={formAddress} setFormAddress={setFormAddress}
            formNotes={formNotes} setFormNotes={setFormNotes}
            saving={saving} onSave={handleSave} onCancel={() => setShowForm(false)}
            isEdit={!!editing}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Extracted form component
function CustomerFormFields({
  formName, setFormName, formPhone, setFormPhone, formEmail, setFormEmail,
  formAddress, setFormAddress, formNotes, setFormNotes,
  saving, onSave, onCancel, isEdit,
}: {
  formName: string; setFormName: (v: string) => void;
  formPhone: string; setFormPhone: (v: string) => void;
  formEmail: string; setFormEmail: (v: string) => void;
  formAddress: string; setFormAddress: (v: string) => void;
  formNotes: string; setFormNotes: (v: string) => void;
  saving: boolean; onSave: () => void; onCancel: () => void; isEdit: boolean;
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-1.5">Customer Name *</label>
        <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Full name" className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px]" />
      </div>
      <div>
        <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-1.5">Phone Number *</label>
        <Input value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="+256..." className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px]" />
      </div>
      <div>
        <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-1.5">Email (Optional)</label>
        <Input value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="email@example.com" className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px]" />
      </div>
      <div>
        <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-1.5">Address (Optional)</label>
        <Input value={formAddress} onChange={(e) => setFormAddress(e.target.value)} placeholder="City, area..." className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px]" />
      </div>
      <div>
        <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-1.5">Notes (Optional)</label>
        <Textarea value={formNotes} onChange={(e) => setFormNotes(e.target.value)} placeholder="Any notes about this customer..." className="bg-secondary/50 border-border/30 rounded-xl text-[14px] min-h-[70px]" />
      </div>
      <div className="flex gap-2 pt-2">
        <Button variant="outline" className="flex-1 rounded-xl border-border/30" onClick={onCancel}>Cancel</Button>
        <Button className="flex-1 rounded-xl bg-primary text-primary-foreground font-semibold" onClick={onSave} disabled={!formName.trim() || !formPhone.trim() || saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : isEdit ? "Update" : "Add Customer"}
        </Button>
      </div>
    </div>
  );
}

export default CustomersPage;
