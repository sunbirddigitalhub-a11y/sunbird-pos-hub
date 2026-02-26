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
    <div className="space-y-6 animate-fade-in max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground text-[14px] mt-1">Search by date, customer, phone, or IMEI</p>
        </div>
        <Button variant="outline" className="gap-2 border-border/30 rounded-xl h-10 text-[13px]">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px] apple-ring"
          />
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
                {["ID", "Date", "Customer", "Item", "IMEI", "Amount", "Payment", "Status"].map((h) => (
                  <th key={h} className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-border/10 last:border-0 hover:bg-secondary/15 transition-colors duration-200">
                  <td className="py-3.5 px-5 text-[13px] font-mono text-muted-foreground">{t.id}</td>
                  <td className="py-3.5 px-5 text-[13px] text-muted-foreground">{t.date}</td>
                  <td className="py-3.5 px-5">
                    <p className="text-[13px] font-medium">{t.customer}</p>
                    <p className="text-[11px] text-muted-foreground">{t.phone}</p>
                  </td>
                  <td className="py-3.5 px-5 text-[13px]">{t.item}</td>
                  <td className="py-3.5 px-5 text-[13px] font-mono text-muted-foreground">{t.imei}</td>
                  <td className="py-3.5 px-5 text-[13px] font-semibold text-primary">UGX {t.amount.toLocaleString()}</td>
                  <td className="py-3.5 px-5 text-[13px]">{t.payment}</td>
                  <td className="py-3.5 px-5">
                    <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${statusStyles[t.status] || ""}`}>
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
