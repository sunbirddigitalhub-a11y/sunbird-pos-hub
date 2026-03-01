import { useState, useEffect } from "react";
import { Search, AlertCircle, Loader2, Plus, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  total_spent: number;
  balance: number;
  created_at: string;
  updated_at: string;
}

const CustomerLedger = () => {
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");

  const fetchCustomers = async () => {
    const { data } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
    setCustomers((data || []) as unknown as Customer[]);
    setLoading(false);
  };

  useEffect(() => { fetchCustomers(); }, []);

  const filtered = customers.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || (c.phone || "").includes(search)
  );
  const totalOutstanding = customers.reduce((s, c) => s + c.balance, 0);

  const handleAdd = async () => {
    if (!formName.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("customers").insert({ name: formName.trim(), phone: formPhone.trim() || null, email: formEmail.trim() || null } as any);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Customer added" }); setShowForm(false); setFormName(""); setFormPhone(""); setFormEmail(""); fetchCustomers(); }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight">Customer Ledger</h1>
          <p className="text-muted-foreground text-[14px] mt-1">Purchase history & outstanding balances</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-10 rounded-xl text-[13px] font-semibold" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" /> Add Customer
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-[13px] text-muted-foreground">Total Customers</p>
          <p className="text-[24px] font-semibold tracking-tight mt-1">{customers.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-[13px] text-muted-foreground">Outstanding Balance</p>
          <p className="text-[24px] font-semibold text-warning tracking-tight mt-1">UGX {(totalOutstanding / 1000000).toFixed(1)}M</p>
        </div>
        <div className="stat-card">
          <p className="text-[13px] text-muted-foreground">With Balances</p>
          <p className="text-[24px] font-semibold tracking-tight mt-1">{customers.filter((c) => c.balance > 0).length}</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by name or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px] apple-ring" />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Users className="h-10 w-10 mb-3 opacity-20" />
          <p className="text-[14px]">{search ? "No matching customers" : "No customers yet"}</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/20">
                  {["Customer", "Phone", "Total Spent", "Balance"].map((h) => (
                    <th key={h} className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-border/10 last:border-0 hover:bg-secondary/15 transition-colors duration-200">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                          <span className="text-[11px] font-bold text-primary">{c.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</span>
                        </div>
                        <span className="text-[13px] font-medium">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-[13px] text-muted-foreground">{c.phone || "—"}</td>
                    <td className="py-3.5 px-5 text-[13px] font-semibold text-primary">UGX {c.total_spent.toLocaleString()}</td>
                    <td className="py-3.5 px-5">
                      {c.balance > 0 ? (
                        <span className="text-[13px] font-semibold text-warning flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5" />
                          UGX {c.balance.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-[12px] text-success font-medium">Cleared</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="glass-card border-border/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-semibold">Add Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-1.5">Name *</label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Customer name" className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px]" />
            </div>
            <div>
              <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-1.5">Phone</label>
              <Input value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="0772123456" className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px]" />
            </div>
            <div>
              <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-1.5">Email</label>
              <Input value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="email@example.com" className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px]" />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 rounded-xl border-border/30" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button className="flex-1 rounded-xl bg-primary text-primary-foreground font-semibold" onClick={handleAdd} disabled={!formName.trim() || saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerLedger;
