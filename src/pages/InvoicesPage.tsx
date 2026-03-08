import { useState, useEffect } from "react";
import { Plus, Search, FileText, Download, Eye, Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";

const formatPrice = (n: number) => `UGX ${n.toLocaleString()}`;

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
  sale_id: string;
  items: { product_name: string; quantity: number; unit_price: number; total_price: number }[];
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Invoice | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const { data: sales } = await supabase
        .from("sales")
        .select("id, sale_number, customer_name, total_amount, status, created_at")
        .order("created_at", { ascending: false })
        .limit(100);

      if (!sales) { setLoading(false); return; }

      const invoiceList: Invoice[] = [];
      for (const sale of sales as any[]) {
        const { data: items } = await supabase
          .from("sale_items")
          .select("product_name, quantity, unit_price, total_price")
          .eq("sale_id", sale.id);

        invoiceList.push({
          id: sale.id,
          invoice_number: `INV-${sale.sale_number}`,
          customer_name: sale.customer_name || "Walk-in",
          total_amount: sale.total_amount,
          status: sale.status,
          created_at: sale.created_at,
          sale_id: sale.id,
          items: (items as any[]) || [],
        });
      }
      setInvoices(invoiceList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = invoices.filter(
    (inv) =>
      inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      inv.customer_name.toLowerCase().includes(search.toLowerCase())
  );

  const handlePrint = (inv: Invoice) => {
    const html = `
      <html><head><title>${inv.invoice_number}</title>
      <style>body{font-family:Inter,sans-serif;padding:40px;color:#1d1d1f}
      table{width:100%;border-collapse:collapse;margin-top:20px}
      th,td{padding:8px 12px;text-align:left;border-bottom:1px solid #eee}
      th{font-size:11px;text-transform:uppercase;color:#6b7280}
      .total{font-size:18px;font-weight:700;margin-top:20px}
      h1{font-size:24px;margin-bottom:4px}
      .meta{color:#6b7280;font-size:13px}</style></head>
      <body>
        <h1>${inv.invoice_number}</h1>
        <p class="meta">Customer: ${inv.customer_name}</p>
        <p class="meta">Date: ${format(new Date(inv.created_at), "PPP p")}</p>
        <table><thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
        <tbody>${inv.items.map(i => `<tr><td>${i.product_name}</td><td>${i.quantity}</td><td>${formatPrice(i.unit_price)}</td><td>${formatPrice(i.total_price)}</td></tr>`).join("")}</tbody></table>
        <p class="total">Total: ${formatPrice(inv.total_amount)}</p>
      </body></html>`;
    const win = window.open("", "_blank");
    if (win) { win.document.write(html); win.document.close(); win.print(); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[22px] md:text-[28px] font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground text-[13px] mt-0.5">{invoices.length} invoices generated from sales</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search invoices..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-10 bg-secondary/50 border-border/30 rounded-xl text-[13px]"
        />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/20">
                <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Invoice #</th>
                <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Customer</th>
                <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Amount</th>
                <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Status</th>
                <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Date</th>
                <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map((inv) => (
                <tr key={inv.id} className="border-b border-border/10 last:border-0 hover:bg-secondary/20 transition-colors">
                  <td className="py-3 px-4 text-[13px] font-mono">{inv.invoice_number}</td>
                  <td className="py-3 px-4 text-[13px] font-medium">{inv.customer_name}</td>
                  <td className="py-3 px-4 text-[13px] font-medium text-primary">{formatPrice(inv.total_amount)}</td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] px-2.5 py-1 rounded-full font-medium bg-success/10 text-success">
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[13px] text-muted-foreground">{format(new Date(inv.created_at), "MMM dd, yyyy")}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setSelected(inv)}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handlePrint(inv)}>
                        <Printer className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="py-10 text-center text-muted-foreground text-[13px]">No invoices found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.invoice_number}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex justify-between text-[13px]">
                <span className="text-muted-foreground">Customer</span>
                <span className="font-medium">{selected.customer_name}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-muted-foreground">Date</span>
                <span>{format(new Date(selected.created_at), "PPP p")}</span>
              </div>
              <div className="border-t border-border/20 pt-3 space-y-2">
                {selected.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-[13px]">
                    <span>{item.product_name} × {item.quantity}</span>
                    <span className="font-medium">{formatPrice(item.total_price)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border/20 pt-3 flex justify-between text-[15px] font-semibold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(selected.total_amount)}</span>
              </div>
              <Button onClick={() => handlePrint(selected)} className="w-full rounded-xl h-10 text-[13px]">
                <Printer className="h-4 w-4 mr-2" /> Print Invoice
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
