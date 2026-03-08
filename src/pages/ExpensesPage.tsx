import { useState, useEffect } from "react";
import { Plus, Search, Trash2, Loader2, Wallet, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

const formatPrice = (n: number) => `UGX ${n.toLocaleString()}`;

const CATEGORIES = ["General", "Rent", "Utilities", "Transport", "Supplies", "Salary", "Marketing", "Other"];

export default function ExpensesPage() {
  const { profile } = useAuth();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", amount: "", category: "General", description: "" });

  useEffect(() => { fetchExpenses(); }, []);

  const fetchExpenses = async () => {
    const { data } = await supabase.from("expenses").select("*").order("created_at", { ascending: false });
    setExpenses((data as any[]) || []);
    setLoading(false);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", amount: "", category: "General", description: "" });
    setDialogOpen(true);
  };

  const openEdit = (exp: any) => {
    setEditing(exp);
    setForm({ name: exp.name, amount: exp.amount.toString(), category: exp.category, description: exp.description || "" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.amount) {
      toast({ title: "Error", description: "Name and amount are required", variant: "destructive" });
      return;
    }

    const payload = {
      name: form.name,
      amount: parseInt(form.amount),
      category: form.category,
      description: form.description || null,
      staff_member: profile?.full_name || null,
      staff_user_id: profile?.user_id || null,
    };

    if (editing) {
      await supabase.from("expenses").update(payload).eq("id", editing.id);
      toast({ title: "Updated", description: "Expense updated successfully." });
    } else {
      await supabase.from("expenses").insert(payload);
      toast({ title: "Added", description: "Expense recorded successfully." });
    }

    setDialogOpen(false);
    fetchExpenses();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("expenses").delete().eq("id", id);
    toast({ title: "Deleted", description: "Expense removed." });
    fetchExpenses();
  };

  const filtered = expenses.filter(
    (e) => e.name.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalExpenses = filtered.reduce((s, e) => s + (e.amount || 0), 0);

  if (loading) {
    return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="h-8 w-8 text-primary animate-spin" /></div>;
  }

  return (
    <div className="space-y-5 animate-fade-in max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[22px] md:text-[28px] font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground text-[13px] mt-0.5">Total: {formatPrice(totalExpenses)}</p>
        </div>
        <Button onClick={openNew} className="rounded-xl h-10 text-[13px]">
          <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Expense
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search expenses..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10 bg-secondary/50 border-border/30 rounded-xl text-[13px]" />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/20">
                <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Name</th>
                <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Category</th>
                <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Amount</th>
                <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">By</th>
                <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Date</th>
                <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map((exp) => (
                <tr key={exp.id} className="border-b border-border/10 last:border-0 hover:bg-secondary/20 transition-colors">
                  <td className="py-3 px-4 text-[13px] font-medium">{exp.name}</td>
                  <td className="py-3 px-4"><span className="text-[11px] px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">{exp.category}</span></td>
                  <td className="py-3 px-4 text-[13px] font-medium text-destructive">{formatPrice(exp.amount)}</td>
                  <td className="py-3 px-4 text-[13px] text-muted-foreground">{exp.staff_member || "—"}</td>
                  <td className="py-3 px-4 text-[13px] text-muted-foreground">{format(new Date(exp.created_at), "MMM dd, yyyy")}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEdit(exp)}><Edit2 className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive" onClick={() => handleDelete(exp.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="py-10 text-center text-muted-foreground text-[13px]">No expenses recorded</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Expense" : "Add Expense"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-1.5">Name</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Office rent" className="h-10 rounded-xl text-[13px]" />
            </div>
            <div>
              <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-1.5">Amount (UGX)</label>
              <Input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} type="number" placeholder="0" className="h-10 rounded-xl text-[13px]" />
            </div>
            <div>
              <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-1.5">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full h-10 rounded-xl border border-border/30 bg-secondary/50 px-3 text-[13px]">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-1.5">Description (optional)</label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Details..." className="h-10 rounded-xl text-[13px]" />
            </div>
            <Button onClick={handleSave} className="w-full rounded-xl h-10 text-[13px]">
              <Wallet className="h-4 w-4 mr-2" /> {editing ? "Update" : "Save"} Expense
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
