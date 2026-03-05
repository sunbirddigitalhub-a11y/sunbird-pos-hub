import { useState, useEffect } from "react";
import { Search, AlertCircle, Loader2, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  total_spent: number;
  balance: number;
  created_at: string;
  updated_at: string;
}

const CustomerLedger = () => {
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("updated_at", { ascending: false });

    if (data) setCustomers(data as unknown as Customer[]);
    if (error) console.error("Error loading customers:", error);
    setLoading(false);
  };

  useEffect(() => { fetchCustomers(); }, []);

  const filtered = customers.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || (c.phone && c.phone.includes(search))
  );
  const totalOutstanding = customers.reduce((s, c) => s + c.balance, 0);

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight">Customer Ledger</h1>
        <p className="text-muted-foreground text-[14px] mt-1">Purchase history & outstanding balances</p>
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

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
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
                  {["Customer", "Phone", "Total Spent", "Balance", "Last Updated"].map((h) => (
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
                    <td className="py-3.5 px-5 text-[13px] text-muted-foreground">
                      {new Date(c.updated_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerLedger;
