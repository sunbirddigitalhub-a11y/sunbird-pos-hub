import { useState } from "react";
import { Search, Calendar, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const salesData = [
  { id: "SL-001", date: "2024-12-15", customer: "John Mukasa", items: 2, total: 6700000, payment: "Cash", agent: "Admin" },
  { id: "SL-002", date: "2024-12-15", customer: "Sarah Nantongo", items: 1, total: 2500000, payment: "Mobile Money", agent: "Agent 1" },
  { id: "SL-003", date: "2024-12-14", customer: "David Okello", items: 1, total: 5500000, payment: "EMI", agent: "Admin" },
  { id: "SL-004", date: "2024-12-14", customer: "Grace Achieng", items: 3, total: 1880000, payment: "Cash", agent: "Agent 2" },
  { id: "SL-005", date: "2024-12-13", customer: "Peter Waswa", items: 1, total: 2400000, payment: "Bank", agent: "Admin" },
  { id: "SL-006", date: "2024-12-13", customer: "Mary Nabatanzi", items: 1, total: 3000000, payment: "Split", agent: "Agent 1" },
];

const Sales = () => {
  const [search, setSearch] = useState("");
  const filtered = salesData.filter(
    (s) => s.customer.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase())
  );
  const totalRevenue = filtered.reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight">Sales</h1>
          <p className="text-muted-foreground text-[14px] mt-1">All completed and pending sales</p>
        </div>
        <Button variant="outline" className="gap-2 border-border/30 rounded-xl h-10 text-[13px]">
          <Download className="h-4 w-4" /> Export
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-[13px] text-muted-foreground">Total Sales</p>
          <p className="text-[24px] font-semibold tracking-tight mt-1">{filtered.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-[13px] text-muted-foreground">Revenue</p>
          <p className="text-[24px] font-semibold text-primary tracking-tight mt-1">UGX {(totalRevenue / 1000000).toFixed(1)}M</p>
        </div>
        <div className="stat-card">
          <p className="text-[13px] text-muted-foreground">Avg. Sale</p>
          <p className="text-[24px] font-semibold tracking-tight mt-1">UGX {filtered.length ? (totalRevenue / filtered.length / 1000000).toFixed(1) : 0}M</p>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search sales..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px] apple-ring" />
        </div>
        <Button variant="outline" size="icon" className="border-border/30 rounded-xl h-11 w-11">
          <Calendar className="h-4 w-4" />
        </Button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/20">
                {["Sale ID", "Date", "Customer", "Items", "Total", "Payment", "Agent"].map((h) => (
                  <th key={h} className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-border/10 last:border-0 hover:bg-secondary/15 transition-colors duration-200">
                  <td className="py-3.5 px-5 text-[13px] font-mono text-muted-foreground">{s.id}</td>
                  <td className="py-3.5 px-5 text-[13px] text-muted-foreground">{s.date}</td>
                  <td className="py-3.5 px-5 text-[13px] font-medium">{s.customer}</td>
                  <td className="py-3.5 px-5 text-[13px]">{s.items}</td>
                  <td className="py-3.5 px-5 text-[13px] font-semibold text-primary">UGX {s.total.toLocaleString()}</td>
                  <td className="py-3.5 px-5 text-[13px]">{s.payment}</td>
                  <td className="py-3.5 px-5 text-[13px] text-muted-foreground">{s.agent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Sales;
