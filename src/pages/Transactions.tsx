import { useState } from "react";
import { Search, Calendar, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const transactions = [
  { id: "TXN-2024-001", date: "2024-12-15", customer: "John Mukasa", phone: "0772123456", item: "iPhone 15 Pro Max", imei: "356938035643809", amount: 4200000, payment: "Cash", status: "Completed" },
  { id: "TXN-2024-002", date: "2024-12-15", customer: "Sarah Nantongo", phone: "0701234567", item: "Samsung Galaxy S24", imei: "490154203237518", amount: 2500000, payment: "Mobile Money", status: "Completed" },
  { id: "TXN-2024-003", date: "2024-12-14", customer: "David Okello", phone: "0782345678", item: "MacBook Air M3", imei: "C02ZM4XRLVDL", amount: 5500000, payment: "EMI", status: "Partial" },
  { id: "TXN-2024-004", date: "2024-12-14", customer: "Grace Achieng", phone: "0753456789", item: "Tecno Spark 20 Pro+", imei: "867530012345678", amount: 600000, payment: "Cash", status: "Completed" },
  { id: "TXN-2024-005", date: "2024-12-13", customer: "Peter Waswa", phone: "0774567890", item: "Dell Inspiron 15", imei: "5CG1234ABC", amount: 2400000, payment: "Bank", status: "Completed" },
  { id: "TXN-2024-006", date: "2024-12-13", customer: "Mary Nabatanzi", phone: "0705678901", item: "iPad Air M2", imei: "DMPC12345678", amount: 3000000, payment: "Split", status: "Completed" },
];

const statusStyles: Record<string, string> = {
  Completed: "bg-success/10 text-success",
  Partial: "bg-warning/10 text-warning",
  Refunded: "bg-destructive/10 text-destructive",
};

const Transactions = () => {
  const [search, setSearch] = useState("");
  const filtered = transactions.filter(
    (t) =>
      t.customer.toLowerCase().includes(search.toLowerCase()) ||
      t.imei.toLowerCase().includes(search.toLowerCase()) ||
      t.phone.includes(search) ||
      t.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Transactions</h1>
          <p className="text-muted-foreground text-sm mt-1">Search by date, customer, phone, or IMEI</p>
        </div>
        <Button variant="outline" className="gap-2 border-border/50">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-secondary border-border/50"
          />
        </div>
        <Button variant="outline" size="icon" className="border-border/50">
          <Calendar className="h-4 w-4" />
        </Button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-secondary/30">
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Transaction ID</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Date</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Customer</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Item</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">IMEI</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Amount</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Payment</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-border/30 last:border-0 hover:bg-secondary/20 transition-colors">
                  <td className="py-3 px-4 text-sm font-mono text-muted-foreground">{t.id}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{t.date}</td>
                  <td className="py-3 px-4">
                    <p className="text-sm font-medium">{t.customer}</p>
                    <p className="text-xs text-muted-foreground">{t.phone}</p>
                  </td>
                  <td className="py-3 px-4 text-sm">{t.item}</td>
                  <td className="py-3 px-4 text-sm font-mono text-muted-foreground">{t.imei}</td>
                  <td className="py-3 px-4 text-sm font-medium text-primary">UGX {t.amount.toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm">{t.payment}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusStyles[t.status] || ""}`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
