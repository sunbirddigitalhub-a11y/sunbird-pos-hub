import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Printer, AlertTriangle, CheckCircle } from "lucide-react";

const ZReport = () => {
  const [physicalCash, setPhysicalCash] = useState("");
  const systemCash = 4850000;
  const diff = physicalCash ? Number(physicalCash) - systemCash : 0;

  const breakdown = [
    { method: "Cash", amount: 4850000, count: 12 },
    { method: "Mobile Money", amount: 3200000, count: 8 },
    { method: "Bank Transfer", amount: 2800000, count: 4 },
    { method: "EMI / Credit", amount: 1950000, count: 3 },
  ];
  const totalSales = breakdown.reduce((s, b) => s + b.amount, 0);
  const totalTxns = breakdown.reduce((s, b) => s + b.count, 0);

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight">Z-Report</h1>
          <p className="text-muted-foreground text-[14px] mt-1">Daily closing & cash reconciliation</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 border-border/30 rounded-xl h-10 text-[13px]">
            <Printer className="h-4 w-4" /> Print
          </Button>
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-10 text-[13px] font-semibold">
            <FileText className="h-4 w-4" /> Close Day
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-[13px] text-muted-foreground">Total Sales Today</p>
          <p className="text-[24px] font-semibold text-primary tracking-tight mt-1">UGX {(totalSales / 1000000).toFixed(1)}M</p>
        </div>
        <div className="stat-card">
          <p className="text-[13px] text-muted-foreground">Transactions</p>
          <p className="text-[24px] font-semibold tracking-tight mt-1">{totalTxns}</p>
        </div>
        <div className="stat-card">
          <p className="text-[13px] text-muted-foreground">System Cash Expected</p>
          <p className="text-[24px] font-semibold tracking-tight mt-1">UGX {systemCash.toLocaleString()}</p>
        </div>
      </div>

      {/* Payment breakdown */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border/20">
          <h3 className="font-semibold text-[15px] tracking-tight">Payment Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/20">
                {["Payment Method", "Transactions", "Amount"].map((h) => (
                  <th key={h} className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-6">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {breakdown.map((b) => (
                <tr key={b.method} className="border-b border-border/10 last:border-0">
                  <td className="py-3.5 px-6 text-[13px] font-medium">{b.method}</td>
                  <td className="py-3.5 px-6 text-[13px] text-muted-foreground">{b.count}</td>
                  <td className="py-3.5 px-6 text-[13px] font-semibold text-primary">UGX {b.amount.toLocaleString()}</td>
                </tr>
              ))}
              <tr className="bg-secondary/20">
                <td className="py-3.5 px-6 text-[13px] font-bold">Total</td>
                <td className="py-3.5 px-6 text-[13px] font-bold">{totalTxns}</td>
                <td className="py-3.5 px-6 text-[13px] font-bold text-primary">UGX {totalSales.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Cash Reconciliation */}
      <div className="glass-card p-6">
        <h3 className="font-semibold text-[15px] tracking-tight mb-4">Cash Reconciliation</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-2">Physical Cash Count</label>
            <Input
              type="number"
              placeholder="Enter physical cash amount..."
              value={physicalCash}
              onChange={(e) => setPhysicalCash(e.target.value)}
              className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px] apple-ring"
            />
          </div>
          <div>
            <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-2">Difference</label>
            <div className={`h-11 rounded-xl flex items-center px-4 gap-2 text-[14px] font-semibold ${
              !physicalCash ? "bg-secondary/30 text-muted-foreground" :
              diff === 0 ? "bg-success/10 text-success" :
              "bg-destructive/10 text-destructive"
            }`}>
              {!physicalCash ? (
                "—"
              ) : diff === 0 ? (
                <><CheckCircle className="h-4 w-4" /> Balanced</>
              ) : (
                <><AlertTriangle className="h-4 w-4" /> UGX {Math.abs(diff).toLocaleString()} {diff > 0 ? "over" : "short"}</>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZReport;
