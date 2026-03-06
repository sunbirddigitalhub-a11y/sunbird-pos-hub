import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Printer, AlertTriangle, CheckCircle, History, Receipt, Loader2, Calendar, Eye, MessageCircle, Image, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

const formatPrice = (n: number) => `UGX ${n.toLocaleString()}`;

interface SaleRecord {
  id: string;
  sale_number: string;
  customer_name: string | null;
  total_amount: number;
  payment_method: string;
  created_at: string;
  items: { product_name: string; imei: string | null; unit_price: number }[];
}

interface ZReportRecord {
  id: string;
  report_date: string;
  total_sales: number;
  total_transactions: number;
  cash_sales: number;
  cash_transactions: number;
  mobile_money_sales: number;
  mobile_money_transactions: number;
  bank_sales: number;
  bank_transactions: number;
  split_sales: number;
  split_transactions: number;
  physical_cash: number | null;
  cash_difference: number;
  status: string;
  closed_at: string | null;
}

interface ReceiptFile {
  name: string;
  url: string;
  created_at: string;
}

const ZReport = () => {
  const [physicalCash, setPhysicalCash] = useState("");
  const [todaySales, setTodaySales] = useState<SaleRecord[]>([]);
  const [pastReports, setPastReports] = useState<ZReportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<SaleRecord | null>(null);
  const [selectedReport, setSelectedReport] = useState<ZReportRecord | null>(null);
  const [reportSales, setReportSales] = useState<SaleRecord[]>([]);
  const receiptRef = useRef<HTMLDivElement>(null);

  // Receipt screenshots state
  const [receiptImages, setReceiptImages] = useState<ReceiptFile[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ReceiptFile | null>(null);

  const today = format(new Date(), "yyyy-MM-dd");

  const fetchTodaySales = async () => {
    const startOfDay = `${today}T00:00:00`;
    const endOfDay = `${today}T23:59:59`;

    const { data: sales } = await supabase
      .from("sales" as any)
      .select("*")
      .gte("created_at", startOfDay)
      .lte("created_at", endOfDay)
      .order("created_at", { ascending: false });

    const salesArr = (sales as any[]) || [];
    const salesWithItems: SaleRecord[] = [];
    for (const sale of salesArr) {
      const { data: items } = await supabase
        .from("sale_items" as any)
        .select("product_name, imei, unit_price")
        .eq("sale_id", sale.id);
      salesWithItems.push({ ...sale, items: (items as any[]) || [] });
    }

    setTodaySales(salesWithItems);
    setLoading(false);
  };

  const fetchPastReports = async () => {
    const { data } = await supabase
      .from("z_reports" as any)
      .select("*")
      .order("report_date", { ascending: false });
    setPastReports((data as any[]) || []);
  };

  const fetchReceiptImages = async () => {
    setLoadingImages(true);
    try {
      const { data, error } = await supabase.storage.from("receipts").list("", {
        limit: 100,
        sortBy: { column: "created_at", order: "desc" },
      });
      if (error) throw error;
      const files: ReceiptFile[] = (data || [])
        .filter((f) => f.name.endsWith(".png"))
        .map((f) => {
          const { data: urlData } = supabase.storage.from("receipts").getPublicUrl(f.name);
          return {
            name: f.name,
            url: urlData.publicUrl,
            created_at: f.created_at || "",
          };
        });
      setReceiptImages(files);
    } catch (err) {
      console.error("Error loading receipt images:", err);
    } finally {
      setLoadingImages(false);
    }
  };

  const fetchSalesForDate = async (date: string) => {
    const startOfDay = `${date}T00:00:00`;
    const endOfDay = `${date}T23:59:59`;

    const { data: sales } = await supabase
      .from("sales" as any)
      .select("*")
      .gte("created_at", startOfDay)
      .lte("created_at", endOfDay)
      .order("created_at", { ascending: false });

    const salesArr = (sales as any[]) || [];
    const salesWithItems: SaleRecord[] = [];
    for (const sale of salesArr) {
      const { data: items } = await supabase
        .from("sale_items" as any)
        .select("product_name, imei, unit_price")
        .eq("sale_id", sale.id);
      salesWithItems.push({ ...sale, items: (items as any[]) || [] });
    }
    setReportSales(salesWithItems);
  };

  useEffect(() => {
    fetchTodaySales();
    fetchPastReports();
    fetchReceiptImages();
  }, []);

  const breakdown = [
    { method: "Cash", amount: todaySales.filter(s => s.payment_method === "Cash").reduce((a, s) => a + s.total_amount, 0), count: todaySales.filter(s => s.payment_method === "Cash").length },
    { method: "Mobile Money", amount: todaySales.filter(s => s.payment_method === "Mobile Money").reduce((a, s) => a + s.total_amount, 0), count: todaySales.filter(s => s.payment_method === "Mobile Money").length },
    { method: "Bank", amount: todaySales.filter(s => s.payment_method === "Bank").reduce((a, s) => a + s.total_amount, 0), count: todaySales.filter(s => s.payment_method === "Bank").length },
    { method: "Split", amount: todaySales.filter(s => s.payment_method === "Split").reduce((a, s) => a + s.total_amount, 0), count: todaySales.filter(s => s.payment_method === "Split").length },
  ];
  const totalSales = breakdown.reduce((s, b) => s + b.amount, 0);
  const totalTxns = breakdown.reduce((s, b) => s + b.count, 0);
  const systemCash = breakdown.find(b => b.method === "Cash")?.amount || 0;
  const diff = physicalCash ? Number(physicalCash) - systemCash : 0;

  const handleCloseDay = async () => {
    setClosing(true);
    try {
      const reportData = {
        report_date: today,
        total_sales: totalSales,
        total_transactions: totalTxns,
        cash_sales: breakdown[0].amount,
        cash_transactions: breakdown[0].count,
        mobile_money_sales: breakdown[1].amount,
        mobile_money_transactions: breakdown[1].count,
        bank_sales: breakdown[2].amount,
        bank_transactions: breakdown[2].count,
        split_sales: breakdown[3].amount,
        split_transactions: breakdown[3].count,
        physical_cash: physicalCash ? Number(physicalCash) : null,
        cash_difference: physicalCash ? Number(physicalCash) - systemCash : 0,
        status: "Closed",
        closed_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("z_reports" as any)
        .upsert(reportData as any, { onConflict: "report_date" });

      if (error) throw error;
      toast({ title: "Day closed", description: `Z-Report saved for ${format(new Date(), "dd MMM yyyy")}` });
      fetchPastReports();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setClosing(false);
    }
  };

  const handlePrintReceipt = () => {
    if (!receiptRef.current) return;
    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Receipt</title>
      <style>
        body { font-family: 'Courier New', monospace; font-size: 12px; padding: 10px; max-width: 300px; margin: 0 auto; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .line { border-top: 1px dashed #000; margin: 8px 0; }
        .row { display: flex; justify-content: space-between; margin: 2px 0; }
        .small { font-size: 10px; }
      </style></head><body>${receiptRef.current.innerHTML}</body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handlePrintZReport = () => {
    const report = selectedReport;
    if (!report) return;
    const printWindow = window.open("", "_blank", "width=600,height=800");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Z-Report ${report.report_date}</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 13px; padding: 20px; max-width: 500px; margin: 0 auto; }
        h2 { text-align: center; margin-bottom: 5px; }
        .sub { text-align: center; color: #666; font-size: 11px; margin-bottom: 15px; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { padding: 6px 8px; border-bottom: 1px solid #eee; text-align: left; }
        th { font-size: 10px; text-transform: uppercase; color: #999; }
        .total td { font-weight: bold; border-top: 2px solid #333; }
        .section { margin-top: 15px; font-weight: bold; font-size: 14px; }
      </style></head><body>
        <h2>Sunbird Online Stores</h2>
        <p class="sub">Z-Report — ${format(new Date(report.report_date), "dd MMMM yyyy")}</p>
        <table>
          <tr><th>Method</th><th>Txns</th><th>Amount</th></tr>
          <tr><td>Cash</td><td>${report.cash_transactions}</td><td>UGX ${report.cash_sales.toLocaleString()}</td></tr>
          <tr><td>Mobile Money</td><td>${report.mobile_money_transactions}</td><td>UGX ${report.mobile_money_sales.toLocaleString()}</td></tr>
          <tr><td>Bank</td><td>${report.bank_transactions}</td><td>UGX ${report.bank_sales.toLocaleString()}</td></tr>
          <tr><td>Split</td><td>${report.split_transactions}</td><td>UGX ${report.split_sales.toLocaleString()}</td></tr>
          <tr class="total"><td>Total</td><td>${report.total_transactions}</td><td>UGX ${report.total_sales.toLocaleString()}</td></tr>
        </table>
        ${report.physical_cash !== null ? `
          <p class="section">Cash Reconciliation</p>
          <table>
            <tr><td>System Cash</td><td>UGX ${report.cash_sales.toLocaleString()}</td></tr>
            <tr><td>Physical Cash</td><td>UGX ${report.physical_cash.toLocaleString()}</td></tr>
            <tr class="total"><td>Difference</td><td>UGX ${Math.abs(report.cash_difference).toLocaleString()} ${report.cash_difference > 0 ? "(over)" : report.cash_difference < 0 ? "(short)" : "(balanced)"}</td></tr>
          </table>
        ` : ""}
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const extractSaleNumber = (name: string) => {
    const parts = name.split("_");
    return parts[0] || name;
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight">Z-Report</h1>
          <p className="text-muted-foreground text-[14px] mt-1">Daily closing, receipts & report history</p>
        </div>
      </div>

      <Tabs defaultValue="today" className="w-full">
        <TabsList className="bg-secondary/50 rounded-xl p-1">
          <TabsTrigger value="today" className="rounded-lg text-[13px] gap-2 data-[state=active]:bg-background">
            <FileText className="h-4 w-4" /> Today
          </TabsTrigger>
          <TabsTrigger value="receipts" className="rounded-lg text-[13px] gap-2 data-[state=active]:bg-background">
            <Receipt className="h-4 w-4" /> Receipts
          </TabsTrigger>
          <TabsTrigger value="screenshots" className="rounded-lg text-[13px] gap-2 data-[state=active]:bg-background">
            <Image className="h-4 w-4" /> Receipt Photos
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg text-[13px] gap-2 data-[state=active]:bg-background">
            <History className="h-4 w-4" /> Report History
          </TabsTrigger>
        </TabsList>

        {/* TODAY TAB */}
        <TabsContent value="today" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="stat-card">
              <p className="text-[13px] text-muted-foreground">Total Sales Today</p>
              <p className="text-[24px] font-semibold text-primary tracking-tight mt-1">{formatPrice(totalSales)}</p>
            </div>
            <div className="stat-card">
              <p className="text-[13px] text-muted-foreground">Transactions</p>
              <p className="text-[24px] font-semibold tracking-tight mt-1">{totalTxns}</p>
            </div>
            <div className="stat-card">
              <p className="text-[13px] text-muted-foreground">System Cash Expected</p>
              <p className="text-[24px] font-semibold tracking-tight mt-1">{formatPrice(systemCash)}</p>
            </div>
          </div>

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
                      <td className="py-3.5 px-6 text-[13px] font-semibold text-primary">{formatPrice(b.amount)}</td>
                    </tr>
                  ))}
                  <tr className="bg-secondary/20">
                    <td className="py-3.5 px-6 text-[13px] font-bold">Total</td>
                    <td className="py-3.5 px-6 text-[13px] font-bold">{totalTxns}</td>
                    <td className="py-3.5 px-6 text-[13px] font-bold text-primary">{formatPrice(totalSales)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

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
                  {!physicalCash ? "—" : diff === 0 ? (
                    <><CheckCircle className="h-4 w-4" /> Balanced</>
                  ) : (
                    <><AlertTriangle className="h-4 w-4" /> {formatPrice(Math.abs(diff))} {diff > 0 ? "over" : "short"}</>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                onClick={handleCloseDay}
                disabled={closing || totalTxns === 0}
                className="flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-11 text-[13px] font-semibold"
              >
                {closing ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                Close Day & Save Report
              </Button>
              <Button
                variant="outline"
                disabled={totalTxns === 0}
                className="gap-2 rounded-xl h-11 text-[13px] border-primary/30 text-primary"
                onClick={() => {
                  const text = `*SUNBIRD ONLINE STORES*\n*Z-REPORT — ${format(new Date(), "dd MMM yyyy")}*\n\nTotal Sales: ${formatPrice(totalSales)}\nTransactions: ${totalTxns}\n\n${breakdown.map(b => `${b.method}: ${formatPrice(b.amount)} (${b.count} txns)`).join("\n")}\n\nSystem Cash: ${formatPrice(systemCash)}${physicalCash ? `\nPhysical Cash: ${formatPrice(Number(physicalCash))}\nDifference: ${formatPrice(Math.abs(diff))} ${diff > 0 ? "(over)" : diff < 0 ? "(short)" : "(balanced)"}` : ""}`;
                  window.open(`https://wa.me/256704811097?text=${encodeURIComponent(text)}`, "_blank");
                }}
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* RECEIPTS TAB */}
        <TabsContent value="receipts" className="mt-4">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 text-primary animate-spin" /></div>
          ) : todaySales.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-[14px]">No sales today</div>
          ) : (
            <div className="space-y-3">
              {todaySales.map((sale) => (
                <div key={sale.id} className="glass-card p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Receipt className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium">{sale.sale_number}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {sale.customer_name || "Walk-in"} · {sale.payment_method} · {format(new Date(sale.created_at), "HH:mm")}
                    </p>
                  </div>
                  <p className="text-[14px] font-semibold text-primary shrink-0">{formatPrice(sale.total_amount)}</p>
                  <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8 rounded-lg" onClick={() => setSelectedReceipt(sale)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* RECEIPT PHOTOS TAB */}
        <TabsContent value="screenshots" className="mt-4">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-[15px] tracking-tight flex items-center gap-2">
                <Image className="h-4 w-4 text-primary" />
                Receipt Screenshots
              </h3>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => fetchReceiptImages()}>
                <Loader2 className={`h-4 w-4 ${loadingImages ? "animate-spin" : ""}`} />
              </Button>
            </div>
            {loadingImages ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : receiptImages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Image className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p className="text-[13px]">No receipt screenshots yet. Use the 📷 button on POS receipts to save screenshots here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {receiptImages.map((receipt) => (
                  <button
                    key={receipt.name}
                    onClick={() => setSelectedImage(receipt)}
                    className="group rounded-xl overflow-hidden border border-border/20 hover:border-primary/40 transition-all duration-200 hover:shadow-lg bg-secondary/20"
                  >
                    <div className="aspect-[3/4] overflow-hidden">
                      <img
                        src={receipt.url}
                        alt={receipt.name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-2">
                      <p className="text-[11px] font-mono font-medium truncate text-primary">{extractSaleNumber(receipt.name)}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {receipt.created_at ? new Date(receipt.created_at).toLocaleDateString() : ""}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* HISTORY TAB */}
        <TabsContent value="history" className="mt-4">
          {pastReports.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-[14px]">No past reports yet. Close a day to save.</div>
          ) : (
            <div className="space-y-3">
              {pastReports.map((report) => (
                <div key={report.id} className="glass-card p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-secondary/60 flex items-center justify-center shrink-0">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium">{format(new Date(report.report_date), "dd MMM yyyy")}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {report.total_transactions} txns · {report.status}
                      {report.physical_cash !== null && ` · Diff: ${formatPrice(Math.abs(report.cash_difference))}`}
                    </p>
                  </div>
                  <p className="text-[14px] font-semibold text-primary shrink-0">{formatPrice(report.total_sales)}</p>
                  <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8 rounded-lg" onClick={() => {
                    setSelectedReport(report);
                    fetchSalesForDate(report.report_date);
                  }}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Receipt Detail Dialog */}
      <Dialog open={!!selectedReceipt} onOpenChange={() => setSelectedReceipt(null)}>
        <DialogContent className="glass-card border-border/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-semibold text-center">Receipt</DialogTitle>
          </DialogHeader>
          {selectedReceipt && (
            <>
              <div ref={receiptRef}>
                <div className="center" style={{ textAlign: "center" }}>
                  <p style={{ fontWeight: "bold", fontSize: "14px" }}>Sunbird Online Stores</p>
                  <p style={{ fontSize: "11px", color: "#888" }}>Receipt</p>
                </div>
                <div style={{ borderTop: "1px dashed #ccc", margin: "8px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                  <span>Sale #:</span><span>{selectedReceipt.sale_number}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                  <span>Date:</span><span>{format(new Date(selectedReceipt.created_at), "dd/MM/yyyy HH:mm")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                  <span>Customer:</span><span>{selectedReceipt.customer_name || "Walk-in"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                  <span>Payment:</span><span>{selectedReceipt.payment_method}</span>
                </div>
                <div style={{ borderTop: "1px dashed #ccc", margin: "8px 0" }} />
                {selectedReceipt.items.map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                    <div>
                      <div>{item.product_name}</div>
                      {item.imei && <div style={{ fontSize: "10px", color: "#888" }}>{item.imei}</div>}
                    </div>
                    <span style={{ fontWeight: "bold" }}>{formatPrice(item.unit_price)}</span>
                  </div>
                ))}
                <div style={{ borderTop: "1px dashed #ccc", margin: "8px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: "bold" }}>
                  <span>TOTAL</span><span>{formatPrice(selectedReceipt.total_amount)}</span>
                </div>
                <div style={{ textAlign: "center", fontSize: "10px", color: "#888", marginTop: "10px" }}>
                  Thank you for shopping at Sunbird Online Stores!
                </div>
              </div>
              <Button className="w-full rounded-xl gap-2 bg-primary text-primary-foreground mt-2" onClick={handlePrintReceipt}>
                <Printer className="h-4 w-4" /> Print Receipt
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Receipt Image Preview Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="glass-card border-border/30 max-w-lg max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              {selectedImage ? extractSaleNumber(selectedImage.name) : "Receipt"}
            </DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              <img
                src={selectedImage.url}
                alt={selectedImage.name}
                className="w-full rounded-xl border border-border/20"
              />
              <p className="text-[11px] text-muted-foreground text-center">
                {selectedImage.created_at ? new Date(selectedImage.created_at).toLocaleString() : ""}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Past Report Detail Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => { setSelectedReport(null); setReportSales([]); }}>
        <DialogContent className="glass-card border-border/30 max-w-lg max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-semibold">
              Z-Report — {selectedReport && format(new Date(selectedReport.report_date), "dd MMM yyyy")}
            </DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="stat-card p-3">
                  <p className="text-[11px] text-muted-foreground">Total Sales</p>
                  <p className="text-[18px] font-semibold text-primary">{formatPrice(selectedReport.total_sales)}</p>
                </div>
                <div className="stat-card p-3">
                  <p className="text-[11px] text-muted-foreground">Transactions</p>
                  <p className="text-[18px] font-semibold">{selectedReport.total_transactions}</p>
                </div>
              </div>

              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-border/20">
                    <th className="text-left py-2 text-muted-foreground font-medium">Method</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Txns</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/10"><td className="py-2">Cash</td><td>{selectedReport.cash_transactions}</td><td className="text-primary font-semibold">{formatPrice(selectedReport.cash_sales)}</td></tr>
                  <tr className="border-b border-border/10"><td className="py-2">Mobile Money</td><td>{selectedReport.mobile_money_transactions}</td><td className="text-primary font-semibold">{formatPrice(selectedReport.mobile_money_sales)}</td></tr>
                  <tr className="border-b border-border/10"><td className="py-2">Bank</td><td>{selectedReport.bank_transactions}</td><td className="text-primary font-semibold">{formatPrice(selectedReport.bank_sales)}</td></tr>
                  <tr className="border-b border-border/10"><td className="py-2">Split</td><td>{selectedReport.split_transactions}</td><td className="text-primary font-semibold">{formatPrice(selectedReport.split_sales)}</td></tr>
                </tbody>
              </table>

              {selectedReport.physical_cash !== null && (
                <div className={`rounded-xl p-3 text-[13px] font-medium ${selectedReport.cash_difference === 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                  Physical: {formatPrice(selectedReport.physical_cash)} · Diff: {formatPrice(Math.abs(selectedReport.cash_difference))} {selectedReport.cash_difference > 0 ? "over" : selectedReport.cash_difference < 0 ? "short" : "balanced"}
                </div>
              )}

              {reportSales.length > 0 && (
                <div>
                  <h4 className="text-[13px] font-semibold mb-2">Receipts ({reportSales.length})</h4>
                  <div className="space-y-2 max-h-48 overflow-auto">
                    {reportSales.map((sale) => (
                      <button
                        key={sale.id}
                        onClick={() => { setSelectedReport(null); setSelectedReceipt(sale); }}
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors text-left"
                      >
                        <Receipt className="h-4 w-4 text-primary shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-medium">{sale.sale_number}</p>
                          <p className="text-[10px] text-muted-foreground">{sale.customer_name || "Walk-in"} · {format(new Date(sale.created_at), "HH:mm")}</p>
                        </div>
                        <span className="text-[12px] font-semibold text-primary">{formatPrice(sale.total_amount)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button className="flex-1 rounded-xl gap-2 bg-primary text-primary-foreground" onClick={handlePrintZReport}>
                  <Printer className="h-4 w-4" /> Print
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl gap-2 border-primary/30 text-primary"
                  onClick={() => {
                    if (!selectedReport) return;
                    const r = selectedReport;
                    const text = `*SUNBIRD ONLINE STORES*\n*Z-REPORT — ${format(new Date(r.report_date), "dd MMM yyyy")}*\n\nTotal Sales: ${formatPrice(r.total_sales)}\nTransactions: ${r.total_transactions}\n\nCash: ${formatPrice(r.cash_sales)} (${r.cash_transactions} txns)\nMobile Money: ${formatPrice(r.mobile_money_sales)} (${r.mobile_money_transactions} txns)\nBank: ${formatPrice(r.bank_sales)} (${r.bank_transactions} txns)\nSplit: ${formatPrice(r.split_sales)} (${r.split_transactions} txns)${r.physical_cash !== null ? `\n\nPhysical Cash: ${formatPrice(r.physical_cash)}\nDifference: ${formatPrice(Math.abs(r.cash_difference))} ${r.cash_difference > 0 ? "(over)" : r.cash_difference < 0 ? "(short)" : "(balanced)"}` : ""}`;
                    window.open(`https://wa.me/256704811097?text=${encodeURIComponent(text)}`, "_blank");
                  }}
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ZReport;
