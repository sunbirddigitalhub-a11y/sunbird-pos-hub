import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  FileText, Printer, AlertTriangle, CheckCircle, History, Receipt, Loader2,
  Calendar, Eye, MessageCircle, Image, Camera, Download, Plus, Trash2,
  Package, Users, DollarSign, TrendingUp, BarChart3, Clock, ShieldCheck, ShoppingBag
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const formatPrice = (n: number) => `UGX ${n.toLocaleString()}`;

interface SaleRecord {
  id: string;
  sale_number: string;
  customer_name: string | null;
  total_amount: number;
  payment_method: string;
  status: string;
  notes: string | null;
  sold_by: string | null;
  created_at: string;
  items: { product_name: string; imei: string | null; unit_price: number; quantity: number }[];
}

interface Expense {
  id: string;
  name: string;
  category: string;
  amount: number;
  description: string | null;
  staff_member: string | null;
  created_at: string;
}

interface AuditEntry {
  id: string;
  action: string;
  performed_by: string | null;
  created_at: string;
  details: any;
  user_role: string | null;
  ip_address: string | null;
}

interface ReceiptFile {
  name: string;
  url: string;
  created_at: string;
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
  closed_by_name: string | null;
  closed_by_role: string | null;
  report_snapshot: any | null;
}

interface ProductSale {
  product_name: string;
  quantity: number;
  unit_price: number;
  total_revenue: number;
}

const expenseCategories = ["General", "Rent", "Utilities", "Salaries", "Transport", "Supplies", "Marketing", "Repairs", "Other"];

const ZReport = () => {
  const { profile, role } = useAuth();
  const [physicalCash, setPhysicalCash] = useState("");
  const [todaySales, setTodaySales] = useState<SaleRecord[]>([]);
  const [pastReports, setPastReports] = useState<ZReportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<SaleRecord | null>(null);
  const [selectedReport, setSelectedReport] = useState<ZReportRecord | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  // Expenses
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expName, setExpName] = useState("");
  const [expCategory, setExpCategory] = useState("General");
  const [expAmount, setExpAmount] = useState("");
  const [expDesc, setExpDesc] = useState("");
  const [savingExpense, setSavingExpense] = useState(false);

  // Audit / staff activity
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);

  // Inventory activity
  const [inventoryActivity, setInventoryActivity] = useState<any[]>([]);

  // Payment history (outstanding balance activity)
  const [todayPayments, setTodayPayments] = useState<any[]>([]);

  // Receipt screenshots
  const [receiptImages, setReceiptImages] = useState<ReceiptFile[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ReceiptFile | null>(null);

  const today = format(new Date(), "yyyy-MM-dd");

  // ─── Data fetching ───────────────────────────
  const fetchTodaySales = async () => {
    const startOfDay = `${today}T00:00:00`;
    const endOfDay = `${today}T23:59:59`;
    const { data: sales } = await supabase
      .from("sales" as any).select("*")
      .gte("created_at", startOfDay).lte("created_at", endOfDay)
      .order("created_at", { ascending: false });
    const salesArr = (sales as any[]) || [];
    const salesWithItems: SaleRecord[] = [];
    for (const sale of salesArr) {
      const { data: items } = await supabase
        .from("sale_items" as any).select("product_name, imei, unit_price, quantity")
        .eq("sale_id", sale.id);
      salesWithItems.push({ ...sale, items: (items as any[]) || [] });
    }
    setTodaySales(salesWithItems);
    setLoading(false);
  };

  const fetchExpenses = async () => {
    const startOfDay = `${today}T00:00:00`;
    const endOfDay = `${today}T23:59:59`;
    const { data } = await supabase
      .from("expenses" as any).select("*")
      .gte("created_at", startOfDay).lte("created_at", endOfDay)
      .order("created_at", { ascending: false });
    setExpenses((data as any[]) || []);
  };

  const fetchAuditLogs = async () => {
    const startOfDay = `${today}T00:00:00`;
    const endOfDay = `${today}T23:59:59`;
    const { data } = await supabase
      .from("audit_logs" as any).select("*")
      .gte("created_at", startOfDay).lte("created_at", endOfDay)
      .order("created_at", { ascending: false });
    setAuditLogs((data as any[]) || []);
  };

  const fetchInventoryActivity = async () => {
    const startOfDay = `${today}T00:00:00`;
    const endOfDay = `${today}T23:59:59`;
    const { data: added } = await supabase
      .from("inventory" as any).select("id, imei, status, created_at, updated_at, quantity, product_id")
      .gte("created_at", startOfDay).lte("created_at", endOfDay);
    const { data: updated } = await supabase
      .from("inventory" as any).select("id, imei, status, created_at, updated_at, quantity, product_id")
      .gte("updated_at", startOfDay).lte("updated_at", endOfDay);
    const { data: products } = await supabase.from("products" as any).select("id, name");
    const productMap = new Map((products as any[] || []).map((p: any) => [p.id, p.name]));
    const allItems = new Map<string, any>();
    for (const item of (added as any[] || [])) {
      allItems.set(item.id, { ...item, product_name: productMap.get(item.product_id) || "Unknown", action: "Added" });
    }
    for (const item of (updated as any[] || [])) {
      if (!allItems.has(item.id)) {
        const isNewToday = new Date(item.created_at).toISOString().slice(0, 10) === today;
        allItems.set(item.id, { ...item, product_name: productMap.get(item.product_id) || "Unknown", action: item.status === "Sold" ? "Sold" : isNewToday ? "Added" : "Updated" });
      }
    }
    setInventoryActivity(Array.from(allItems.values()));
  };

  const fetchPastReports = async () => {
    const { data } = await supabase
      .from("z_reports" as any).select("*")
      .order("report_date", { ascending: false });
    setPastReports((data as any[]) || []);
  };

  const fetchReceiptImages = async () => {
    setLoadingImages(true);
    try {
      const { data, error } = await supabase.storage.from("receipts").list("", {
        limit: 100, sortBy: { column: "created_at", order: "desc" },
      });
      if (error) throw error;
      const files: ReceiptFile[] = (data || [])
        .filter((f) => f.name.endsWith(".png"))
        .map((f) => {
          const { data: urlData } = supabase.storage.from("receipts").getPublicUrl(f.name);
          return { name: f.name, url: urlData.publicUrl, created_at: f.created_at || "" };
        });
      setReceiptImages(files);
    } catch (err) { console.error("Error loading receipt images:", err); }
    finally { setLoadingImages(false); }
  };

  const fetchTodayPayments = async () => {
    const startOfDay = `${today}T00:00:00`;
    const endOfDay = `${today}T23:59:59`;
    const { data } = await supabase
      .from("payment_history" as any).select("*")
      .gte("created_at", startOfDay).lte("created_at", endOfDay)
      .order("created_at", { ascending: false });
    setTodayPayments((data as any[]) || []);
  };

  // Fetch all outstanding sales (not just today's)
  const [allOutstandingSales, setAllOutstandingSales] = useState<any[]>([]);
  const fetchAllOutstanding = async () => {
    const { data } = await supabase
      .from("sales" as any).select("*")
      .eq("status", "Partial")
      .order("created_at", { ascending: false });
    setAllOutstandingSales((data as any[]) || []);
  };

  useEffect(() => {
    fetchTodaySales();
    fetchPastReports();
    fetchReceiptImages();
    fetchExpenses();
    fetchAuditLogs();
    fetchInventoryActivity();
    fetchTodayPayments();
    fetchAllOutstanding();
  }, []);

  // ─── Computed values ─────────────────────────
  const cashSales = todaySales.filter(s => s.payment_method === "Cash" && s.status === "Completed");
  const partialSales = todaySales.filter(s => s.status === "Partial");
  const outstandingSales = todaySales.filter(s => s.status === "Partial");

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
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalOutstanding = outstandingSales.reduce((s, sale) => {
    const match = sale.notes?.match(/Balance:\s*([\d,]+)/);
    return s + (match ? parseInt(match[1].replace(/,/g, "")) : 0);
  }, 0);
  const netCashReceived = totalSales - totalOutstanding - totalExpenses;

  // Outstanding balance activity
  const paymentsCollectedToday = todayPayments.reduce((s: number, p: any) => s + (p.amount || 0), 0);
  const newOutstandingToday = outstandingSales.reduce((s, sale) => {
    const match = sale.notes?.match(/Balance:\s*([\d,]+)/);
    return s + (match ? parseInt(match[1].replace(/,/g, "")) : 0);
  }, 0);
  const totalRemainingOutstanding = allOutstandingSales.reduce((s: number, sale: any) => {
    const match = sale.notes?.match(/Balance:\s*([\d,]+)/);
    return s + (match ? parseInt(match[1].replace(/,/g, "")) : 0);
  }, 0);

  // Sales by product aggregation
  const productSales: ProductSale[] = (() => {
    const map = new Map<string, ProductSale>();
    for (const sale of todaySales) {
      for (const item of sale.items) {
        const key = item.product_name;
        const existing = map.get(key);
        const qty = item.quantity || 1;
        if (existing) {
          existing.quantity += qty;
          existing.total_revenue += item.unit_price * qty;
        } else {
          map.set(key, { product_name: key, quantity: qty, unit_price: item.unit_price, total_revenue: item.unit_price * qty });
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => b.total_revenue - a.total_revenue);
  })();

  // ─── Actions ─────────────────────────────────
  const handleCloseDay = async () => {
    setClosing(true);
    try {
      const snapshot = {
        sales: todaySales.map(s => ({
          sale_number: s.sale_number, customer_name: s.customer_name, total_amount: s.total_amount,
          payment_method: s.payment_method, status: s.status, notes: s.notes, created_at: s.created_at, items: s.items,
        })),
        expenses: expenses.map(e => ({
          name: e.name, category: e.category, amount: e.amount, description: e.description,
          staff_member: e.staff_member, created_at: e.created_at,
        })),
        inventory_activity: inventoryActivity.map((item: any) => ({
          product_name: item.product_name, imei: item.imei, action: item.action,
          quantity: item.quantity, status: item.status, time: item.updated_at || item.created_at,
        })),
        staff_activity: auditLogs.map(log => ({
          action: log.action, email: (log.details as any)?.email || null,
          role: log.user_role, time: log.created_at, ip_address: log.ip_address,
        })),
        outstanding_balances: outstandingSales.map(s => ({
          sale_number: s.sale_number, customer_name: s.customer_name, total_amount: s.total_amount,
          amount_paid: parsePaid(s), balance: parseBalance(s), payment_method: s.payment_method,
          created_at: s.created_at, items: s.items.map(i => i.product_name),
        })),
        product_sales: productSales,
        outstanding_activity: {
          new_outstanding_today: newOutstandingToday,
          payments_collected_today: paymentsCollectedToday,
          payments_count_today: todayPayments.length,
          remaining_outstanding_total: totalRemainingOutstanding,
          payments: todayPayments.map((p: any) => ({
            amount: p.amount, payment_method: p.payment_method,
            staff_name: p.staff_name, created_at: p.created_at, notes: p.notes,
          })),
        },
        total_expenses: totalExpenses,
        total_outstanding: totalOutstanding,
        net_cash_received: netCashReceived,
        breakdown: breakdown,
      };

      const reportData = {
        report_date: today, total_sales: totalSales, total_transactions: totalTxns,
        cash_sales: breakdown[0].amount, cash_transactions: breakdown[0].count,
        mobile_money_sales: breakdown[1].amount, mobile_money_transactions: breakdown[1].count,
        bank_sales: breakdown[2].amount, bank_transactions: breakdown[2].count,
        split_sales: breakdown[3].amount, split_transactions: breakdown[3].count,
        physical_cash: physicalCash ? Number(physicalCash) : null,
        cash_difference: physicalCash ? Number(physicalCash) - systemCash : 0,
        status: "Closed", closed_at: new Date().toISOString(),
        closed_by: profile?.user_id || null, closed_by_name: profile?.full_name || null,
        closed_by_role: role || null, report_snapshot: snapshot,
      };
      const { error } = await supabase
        .from("z_reports" as any)
        .upsert(reportData as any, { onConflict: "report_date" });
      if (error) throw error;
      toast({ title: "Day closed", description: `Z-Report saved for ${format(new Date(), "dd MMM yyyy")}` });
      fetchPastReports();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setClosing(false); }
  };

  const handleAddExpense = async () => {
    if (!expName.trim() || !expAmount) return;
    setSavingExpense(true);
    try {
      const { error } = await supabase.from("expenses" as any).insert({
        name: expName.trim(), category: expCategory, amount: Number(expAmount),
        description: expDesc.trim() || null, staff_member: profile?.full_name || null,
        staff_user_id: profile?.user_id || null,
      } as any);
      if (error) throw error;
      toast({ title: "Expense added" });
      setExpName(""); setExpAmount(""); setExpDesc(""); setShowAddExpense(false);
      fetchExpenses();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setSavingExpense(false); }
  };

  const handleDeleteExpense = async (id: string) => {
    await supabase.from("expenses" as any).delete().eq("id", id);
    fetchExpenses();
  };

  // Screenshot the whole report
  const handleScreenshot = useCallback(async () => {
    if (!reportRef.current) return;
    try {
      const canvas = await html2canvas(reportRef.current, { backgroundColor: "#ffffff", scale: 2, useCORS: true, logging: false });
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `ZReport_${today}.png`; a.click();
        URL.revokeObjectURL(url);
        toast({ title: "Screenshot saved", description: "Report screenshot downloaded" });
      }, "image/png");
    } catch { toast({ title: "Error", description: "Could not capture screenshot", variant: "destructive" }); }
  }, [today]);

  // ─── TEXT-BASED PDF EXPORT ──────────────────
  const handleExportPDF = useCallback(() => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pw = pdf.internal.pageSize.getWidth();
    const ph = pdf.internal.pageSize.getHeight();
    const margin = 14;
    const maxW = pw - margin * 2;
    let y = margin;

    const checkPage = (needed: number) => {
      if (y + needed > ph - margin) { pdf.addPage(); y = margin; }
    };

    const drawLine = () => {
      pdf.setDrawColor(200); pdf.line(margin, y, pw - margin, y); y += 3;
    };

    const heading = (text: string) => {
      checkPage(14);
      pdf.setFontSize(12); pdf.setFont("helvetica", "bold");
      pdf.text(text, margin, y); y += 7;
    };

    const subText = (text: string, size = 9) => {
      checkPage(8);
      pdf.setFontSize(size); pdf.setFont("helvetica", "normal");
      pdf.text(text, margin, y); y += 5;
    };

    const drawTable = (headers: string[], rows: string[][], colWidths: number[]) => {
      const rowH = 6;
      // Header
      checkPage(rowH * 2);
      pdf.setFontSize(8); pdf.setFont("helvetica", "bold");
      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, y - 4, maxW, rowH, "F");
      let x = margin;
      headers.forEach((h, i) => { pdf.text(h, x + 1, y); x += colWidths[i]; });
      y += rowH;
      // Rows
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(8);
      rows.forEach((row) => {
        checkPage(rowH);
        x = margin;
        row.forEach((cell, i) => {
          const cellText = pdf.splitTextToSize(cell, colWidths[i] - 2);
          pdf.text(cellText[0] || "", x + 1, y);
          x += colWidths[i];
        });
        y += rowH;
      });
      y += 2;
    };

    // ── Title
    pdf.setFontSize(16); pdf.setFont("helvetica", "bold");
    pdf.text("SUNBIRD ONLINE STORES", pw / 2, y, { align: "center" }); y += 7;
    pdf.setFontSize(11); pdf.setFont("helvetica", "normal");
    pdf.text("End-of-Day Business Report", pw / 2, y, { align: "center" }); y += 6;
    pdf.setFontSize(9);
    pdf.text(`Date: ${format(new Date(), "dd MMMM yyyy")}`, pw / 2, y, { align: "center" }); y += 5;
    pdf.text(`Generated by: ${profile?.full_name || "N/A"} (${role || "N/A"}) at ${format(new Date(), "HH:mm:ss")}`, pw / 2, y, { align: "center" }); y += 4;
    drawLine();

    // ── 1. Daily Sales Summary
    heading("1. DAILY SALES SUMMARY");
    const summaryRows = [
      ["Total Sales", formatPrice(totalSales)],
      ["Cash Sales", formatPrice(systemCash)],
      ["Mobile Money Sales", formatPrice(breakdown[1].amount)],
      ["Partial Payments", formatPrice(partialSales.reduce((s, x) => s + x.total_amount, 0))],
      ["Outstanding Balances", formatPrice(totalOutstanding)],
      ["Total Transactions", String(totalTxns)],
    ];
    summaryRows.forEach(([label, val]) => {
      checkPage(6);
      pdf.setFontSize(9); pdf.setFont("helvetica", "normal");
      pdf.text(label, margin, y);
      pdf.setFont("helvetica", "bold");
      pdf.text(val, pw - margin, y, { align: "right" });
      y += 6;
    });
    y += 2; drawLine();

    // ── 2. Detailed Sales
    heading("2. DETAILED SALES");
    if (todaySales.length === 0) {
      subText("No sales recorded today.");
    } else {
      const cols2 = [28, 36, 28, 28, 28, 28];
      drawTable(
        ["Invoice", "Customer", "Payment", "Total", "Paid", "Balance"],
        todaySales.map(s => [
          s.sale_number, s.customer_name || "Walk-in", s.payment_method,
          formatPrice(s.total_amount), formatPrice(parsePaid(s)), formatPrice(parseBalance(s))
        ]),
        cols2
      );
    }
    drawLine();

    // ── 3. Outstanding Balances
    heading("3. OUTSTANDING BALANCES");
    if (outstandingSales.length === 0) {
      subText("No outstanding balances.");
    } else {
      const cols3 = [28, 36, 28, 28, 28, 28];
      drawTable(
        ["Invoice", "Customer", "Total", "Paid", "Balance", "Method"],
        outstandingSales.map(s => [
          s.sale_number, s.customer_name || "Walk-in",
          formatPrice(s.total_amount), formatPrice(parsePaid(s)),
          formatPrice(parseBalance(s)), s.payment_method
        ]),
        cols3
      );
      checkPage(8);
      pdf.setFontSize(9); pdf.setFont("helvetica", "bold");
      pdf.text("Total Outstanding Balance:", margin, y);
      pdf.text(formatPrice(totalOutstanding), pw - margin, y, { align: "right" }); y += 6;
    }
    drawLine();

    // ── 4. Sales by Product
    heading("4. SALES BY PRODUCT");
    if (productSales.length === 0) {
      subText("No products sold today.");
    } else {
      const cols4 = [60, 22, 32, 32];
      drawTable(
        ["Product Name", "Qty Sold", "Unit Price", "Total Revenue"],
        productSales.map(p => [p.product_name, String(p.quantity), formatPrice(p.unit_price), formatPrice(p.total_revenue)]),
        cols4
      );
    }
    drawLine();

    // ── 5. Expenses
    heading("5. EXPENSES");
    if (expenses.length === 0) {
      subText("No expenses recorded today.");
    } else {
      const cols5 = [36, 28, 28, 36, 22];
      drawTable(
        ["Name", "Category", "Amount", "Staff", "Time"],
        expenses.map(e => [e.name, e.category, formatPrice(e.amount), e.staff_member || "—", e.created_at ? format(new Date(e.created_at), "HH:mm") : "—"]),
        cols5
      );
      checkPage(8);
      pdf.setFontSize(9); pdf.setFont("helvetica", "bold");
      pdf.text("Total Daily Expenses:", margin, y);
      pdf.text(formatPrice(totalExpenses), pw - margin, y, { align: "right" }); y += 6;
    }
    drawLine();

    // ── 6. Inventory Activity
    heading("6. INVENTORY ACTIVITY");
    if (inventoryActivity.length === 0) {
      subText("No inventory changes today.");
    } else {
      const cols6 = [46, 24, 22, 36, 22];
      drawTable(
        ["Product", "Action", "Qty", "IMEI", "Time"],
        inventoryActivity.map((item: any) => [
          item.product_name, item.action, String(item.quantity), item.imei || "—",
          format(new Date(item.updated_at || item.created_at), "HH:mm")
        ]),
        cols6
      );
    }
    drawLine();

    // ── 7. Staff Login Activity
    heading("7. STAFF LOGIN ACTIVITY");
    const loginLogs = auditLogs.filter(l => l.action === "login" || l.action === "logout");
    if (loginLogs.length === 0) {
      subText("No staff activity recorded today.");
    } else {
      const cols7 = [48, 28, 36, 36];
      drawTable(
        ["Staff", "Role", "Action", "Time"],
        loginLogs.map(l => [
          (l.details as any)?.email || "—", l.user_role || "—", l.action,
          format(new Date(l.created_at), "HH:mm:ss")
        ]),
        cols7
      );
    }
    drawLine();

    // ── 8. Daily Financial Summary
    heading("8. DAILY FINANCIAL SUMMARY");
    const finRows = [
      ["Total Revenue", formatPrice(totalSales)],
      ["Total Expenses", formatPrice(totalExpenses)],
      ["Outstanding Balances", formatPrice(totalOutstanding)],
      ["Net Cash Received", formatPrice(netCashReceived)],
    ];
    checkPage(30);
    pdf.setFillColor(245, 245, 245);
    pdf.rect(margin, y - 4, maxW, finRows.length * 7 + 4, "F");
    finRows.forEach(([label, val]) => {
      pdf.setFontSize(10); pdf.setFont("helvetica", label === "Net Cash Received" ? "bold" : "normal");
      pdf.text(label, margin + 4, y);
      pdf.setFont("helvetica", "bold");
      pdf.text(val, pw - margin - 4, y, { align: "right" });
      y += 7;
    });
    y += 4;
    subText("Net Cash Received = Total Revenue - Outstanding Balances - Expenses", 7);
    y += 4; drawLine();

    // Footer
    checkPage(20);
    pdf.setFontSize(7); pdf.setFont("helvetica", "normal"); pdf.setTextColor(130);
    pdf.text(`Report generated on ${format(new Date(), "dd MMM yyyy")} at ${format(new Date(), "HH:mm:ss")} by ${profile?.full_name || "N/A"} (${role || "N/A"})`, pw / 2, y, { align: "center" });

    pdf.save(`ZReport_${today}.pdf`);
    toast({ title: "PDF exported", description: "Complete daily report PDF downloaded" });
  }, [today, todaySales, expenses, auditLogs, inventoryActivity, productSales, totalSales, totalExpenses, totalOutstanding, netCashReceived, breakdown, partialSales, outstandingSales, systemCash, totalTxns, profile, role]);

  const handlePrintReceipt = () => {
    if (!receiptRef.current) return;
    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) return;
    printWindow.document.write(`<html><head><title>Receipt</title><style>body{font-family:'Courier New',monospace;font-size:12px;padding:10px;max-width:300px;margin:0 auto;}</style></head><body>${receiptRef.current.innerHTML}</body></html>`);
    printWindow.document.close(); printWindow.print();
  };

  const extractSaleNumber = (name: string) => name.split("_")[0] || name;

  const parseBalance = (sale: SaleRecord) => {
    const match = sale.notes?.match(/Balance:\s*([\d,]+)/);
    return match ? parseInt(match[1].replace(/,/g, "")) : 0;
  };
  const parsePaid = (sale: SaleRecord) => {
    const match = sale.notes?.match(/Paid:\s*([\d,]+)/);
    return match ? parseInt(match[1].replace(/,/g, "")) : sale.total_amount;
  };

  const canGenerateReport = role === "master_admin" || role === "supervisor";

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight">Z-Report</h1>
          <p className="text-muted-foreground text-[14px] mt-1">End of Day — Complete daily activity report</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2 rounded-xl border-primary/30 text-primary" onClick={handleScreenshot}>
            <Camera className="h-4 w-4" /> Screenshot
          </Button>
          <Button variant="outline" size="sm" className="gap-2 rounded-xl border-primary/30 text-primary" onClick={handleExportPDF}>
            <Download className="h-4 w-4" /> PDF Export
          </Button>
        </div>
      </div>

      {/* ─── PRINTABLE REPORT AREA ─── */}
      <div ref={reportRef}>
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="bg-secondary/50 rounded-xl p-1 flex-wrap h-auto gap-1">
            <TabsTrigger value="summary" className="rounded-lg text-[12px] gap-1.5 data-[state=active]:bg-background">
              <BarChart3 className="h-3.5 w-3.5" /> Summary
            </TabsTrigger>
            <TabsTrigger value="sales" className="rounded-lg text-[12px] gap-1.5 data-[state=active]:bg-background">
              <Receipt className="h-3.5 w-3.5" /> Sales
            </TabsTrigger>
            <TabsTrigger value="outstanding" className="rounded-lg text-[12px] gap-1.5 data-[state=active]:bg-background">
              <DollarSign className="h-3.5 w-3.5" /> Outstanding
            </TabsTrigger>
            <TabsTrigger value="products" className="rounded-lg text-[12px] gap-1.5 data-[state=active]:bg-background">
              <ShoppingBag className="h-3.5 w-3.5" /> By Product
            </TabsTrigger>
            <TabsTrigger value="expenses" className="rounded-lg text-[12px] gap-1.5 data-[state=active]:bg-background">
              <TrendingUp className="h-3.5 w-3.5" /> Expenses
            </TabsTrigger>
            <TabsTrigger value="inventory" className="rounded-lg text-[12px] gap-1.5 data-[state=active]:bg-background">
              <Package className="h-3.5 w-3.5" /> Inventory
            </TabsTrigger>
            <TabsTrigger value="staff" className="rounded-lg text-[12px] gap-1.5 data-[state=active]:bg-background">
              <Users className="h-3.5 w-3.5" /> Staff Activity
            </TabsTrigger>
            <TabsTrigger value="screenshots" className="rounded-lg text-[12px] gap-1.5 data-[state=active]:bg-background">
              <Image className="h-3.5 w-3.5" /> Receipts
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-lg text-[12px] gap-1.5 data-[state=active]:bg-background">
              <History className="h-3.5 w-3.5" /> History
            </TabsTrigger>
          </TabsList>

          {/* ═══ SUMMARY TAB ═══ */}
          <TabsContent value="summary" className="space-y-5 mt-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {[
                { label: "Total Sales", value: formatPrice(totalSales), icon: DollarSign },
                { label: "Cash Sales", value: formatPrice(systemCash), icon: DollarSign },
                { label: "Mobile Money", value: formatPrice(breakdown[1].amount), icon: DollarSign },
                { label: "Partial Sales", value: formatPrice(partialSales.reduce((s, x) => s + x.total_amount, 0)), icon: TrendingUp },
                { label: "Outstanding", value: formatPrice(totalOutstanding), icon: AlertTriangle },
                { label: "Total Expenses", value: formatPrice(totalExpenses), icon: TrendingUp },
                { label: "Inventory Changes", value: String(inventoryActivity.length), icon: Package },
                { label: "Transactions", value: String(totalTxns), icon: BarChart3 },
              ].map((s) => (
                <div key={s.label} className="stat-card">
                  <div className="flex items-center gap-2 mb-1">
                    <s.icon className="h-3.5 w-3.5 text-primary" />
                    <p className="text-[11px] text-muted-foreground">{s.label}</p>
                  </div>
                  <p className="text-[18px] font-semibold tracking-tight">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Payment Breakdown */}
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
                        <td className="py-3 px-6 text-[13px] font-medium">{b.method}</td>
                        <td className="py-3 px-6 text-[13px] text-muted-foreground">{b.count}</td>
                        <td className="py-3 px-6 text-[13px] font-semibold text-primary">{formatPrice(b.amount)}</td>
                      </tr>
                    ))}
                    <tr className="bg-secondary/20">
                      <td className="py-3 px-6 text-[13px] font-bold">Total</td>
                      <td className="py-3 px-6 text-[13px] font-bold">{totalTxns}</td>
                      <td className="py-3 px-6 text-[13px] font-bold text-primary">{formatPrice(totalSales)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Daily Financial Summary */}
            <div className="glass-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border/20">
                <h3 className="font-semibold text-[15px] tracking-tight">Daily Financial Summary</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <tbody>
                    {[
                      { label: "Total Revenue", value: formatPrice(totalSales), color: "text-primary" },
                      { label: "Total Expenses", value: `-${formatPrice(totalExpenses)}`, color: "text-destructive" },
                      { label: "Outstanding Balances", value: `-${formatPrice(totalOutstanding)}`, color: "text-destructive" },
                    ].map((row) => (
                      <tr key={row.label} className="border-b border-border/10">
                        <td className="py-3 px-6 text-[13px] font-medium">{row.label}</td>
                        <td className={`py-3 px-6 text-[13px] font-semibold text-right ${row.color}`}>{row.value}</td>
                      </tr>
                    ))}
                    <tr className="bg-secondary/20">
                      <td className="py-3 px-6 text-[14px] font-bold">Net Cash Received</td>
                      <td className={`py-3 px-6 text-[14px] font-bold text-right ${netCashReceived >= 0 ? "text-primary" : "text-destructive"}`}>{formatPrice(netCashReceived)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-2 text-[11px] text-muted-foreground border-t border-border/10">
                Net Cash Received = Total Revenue − Outstanding Balances − Expenses
              </div>
            </div>

            {/* Cash Reconciliation & Close */}
            <div className="glass-card p-6">
              <h3 className="font-semibold text-[15px] tracking-tight mb-4">Cash Reconciliation</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-2">Physical Cash Count</label>
                  <Input type="number" placeholder="Enter physical cash..." value={physicalCash} onChange={(e) => setPhysicalCash(e.target.value)} className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px] apple-ring" />
                </div>
                <div>
                  <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-2">Difference</label>
                  <div className={`h-11 rounded-xl flex items-center px-4 gap-2 text-[14px] font-semibold ${!physicalCash ? "bg-secondary/30 text-muted-foreground" : diff === 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                    {!physicalCash ? "—" : diff === 0 ? <><CheckCircle className="h-4 w-4" /> Balanced</> : <><AlertTriangle className="h-4 w-4" /> {formatPrice(Math.abs(diff))} {diff > 0 ? "over" : "short"}</>}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                {canGenerateReport ? (
                  <Button onClick={handleCloseDay} disabled={closing || totalTxns === 0} className="flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-11 text-[13px] font-semibold">
                    {closing ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />} Close Day & Save Report
                  </Button>
                ) : (
                  <div className="flex-1 flex items-center gap-2 text-muted-foreground text-[13px]">
                    <ShieldCheck className="h-4 w-4" /> Only Admin/Supervisor can close the day
                  </div>
                )}
                <Button variant="outline" disabled={totalTxns === 0} className="gap-2 rounded-xl h-11 text-[13px] border-primary/30 text-primary" onClick={() => {
                  const text = `*SUNBIRD ONLINE STORES*\n*Z-REPORT — ${format(new Date(), "dd MMM yyyy")}*\n\nTotal Sales: ${formatPrice(totalSales)}\nTransactions: ${totalTxns}\n\n${breakdown.map(b => `${b.method}: ${formatPrice(b.amount)} (${b.count} txns)`).join("\n")}\n\nExpenses: ${formatPrice(totalExpenses)}\nOutstanding: ${formatPrice(totalOutstanding)}\nNet Cash: ${formatPrice(netCashReceived)}\n\nSystem Cash: ${formatPrice(systemCash)}${physicalCash ? `\nPhysical Cash: ${formatPrice(Number(physicalCash))}\nDiff: ${formatPrice(Math.abs(diff))} ${diff > 0 ? "(over)" : diff < 0 ? "(short)" : "(balanced)"}` : ""}\n\nGenerated by: ${profile?.full_name || "N/A"}`;
                  window.open(`https://wa.me/256704811097?text=${encodeURIComponent(text)}`, "_blank");
                }}>
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </Button>
              </div>
            </div>

            {/* Audit footer */}
            <div className="glass-card p-4 flex flex-wrap gap-x-6 gap-y-2 text-[12px] text-muted-foreground">
              <span><strong className="text-foreground">Generated By:</strong> {profile?.full_name || "N/A"}</span>
              <span><strong className="text-foreground">Role:</strong> {role || "N/A"}</span>
              <span><strong className="text-foreground">Time:</strong> {format(new Date(), "dd MMM yyyy, HH:mm:ss")}</span>
            </div>
          </TabsContent>

          {/* ═══ SALES TAB ═══ */}
          <TabsContent value="sales" className="mt-4">
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 text-primary animate-spin" /></div>
            ) : todaySales.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-[14px]">No sales today</div>
            ) : (
              <div className="glass-card overflow-hidden">
                <div className="px-6 py-4 border-b border-border/20">
                  <h3 className="font-semibold text-[15px] tracking-tight">Detailed Sales ({todaySales.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/20">
                        {["Invoice", "Customer", "Payment", "Total", "Paid", "Balance", "Time"].map((h) => (
                          <th key={h} className="text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">{h}</th>
                        ))}
                        <th className="py-3 px-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {todaySales.map((sale) => (
                        <tr key={sale.id} className="border-b border-border/10 last:border-0 hover:bg-secondary/20">
                          <td className="py-3 px-4 text-[12px] font-mono font-medium text-primary">{sale.sale_number}</td>
                          <td className="py-3 px-4 text-[12px]">{sale.customer_name || "Walk-in"}</td>
                          <td className="py-3 px-4 text-[12px]">{sale.payment_method}</td>
                          <td className="py-3 px-4 text-[12px] font-semibold">{formatPrice(sale.total_amount)}</td>
                          <td className="py-3 px-4 text-[12px] text-success">{formatPrice(parsePaid(sale))}</td>
                          <td className="py-3 px-4 text-[12px] font-semibold text-destructive">{formatPrice(parseBalance(sale))}</td>
                          <td className="py-3 px-4 text-[12px] text-muted-foreground">{format(new Date(sale.created_at), "HH:mm")}</td>
                          <td className="py-3 px-4">
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => setSelectedReceipt(sale)}>
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>

          {/* ═══ OUTSTANDING BALANCES TAB ═══ */}
          <TabsContent value="outstanding" className="mt-4 space-y-4">
            {/* Outstanding Balance Activity Summary */}
            <div className="glass-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border/20">
                <h3 className="font-semibold text-[15px] tracking-tight">Outstanding Balance Activity</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4">
                <div className="stat-card p-3">
                  <p className="text-[11px] text-muted-foreground">New Outstanding (Today)</p>
                  <p className="text-[18px] font-semibold text-warning">{formatPrice(newOutstandingToday)}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{outstandingSales.length} new credit sales</p>
                </div>
                <div className="stat-card p-3">
                  <p className="text-[11px] text-muted-foreground">Payments Collected (Today)</p>
                  <p className="text-[18px] font-semibold text-success">{formatPrice(paymentsCollectedToday)}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{todayPayments.length} payments received</p>
                </div>
                <div className="stat-card p-3">
                  <p className="text-[11px] text-muted-foreground">Total Remaining Outstanding</p>
                  <p className="text-[18px] font-semibold text-destructive">{formatPrice(totalRemainingOutstanding)}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{allOutstandingSales.length} unpaid invoices</p>
                </div>
              </div>
            </div>

            {/* Today's Payments Collected */}
            {todayPayments.length > 0 && (
              <div className="glass-card overflow-hidden">
                <div className="px-6 py-4 border-b border-border/20">
                  <h3 className="font-semibold text-[15px] tracking-tight">Payments Collected Today ({todayPayments.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/20">
                        {["Time", "Amount", "Method", "Staff", "Notes"].map((h) => (
                          <th key={h} className="text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {todayPayments.map((p: any) => (
                        <tr key={p.id} className="border-b border-border/10 last:border-0">
                          <td className="py-3 px-4 text-[12px] text-muted-foreground">{format(new Date(p.created_at), "HH:mm")}</td>
                          <td className="py-3 px-4 text-[12px] font-semibold text-success">{formatPrice(p.amount)}</td>
                          <td className="py-3 px-4 text-[12px]">{p.payment_method}</td>
                          <td className="py-3 px-4 text-[12px]">{p.staff_name || "N/A"}</td>
                          <td className="py-3 px-4 text-[12px] text-muted-foreground max-w-[200px] truncate">{p.notes || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-3 bg-secondary/20 border-t border-border/20 flex justify-between text-[13px] font-semibold">
                  <span>Total Collected</span>
                  <span className="text-success">{formatPrice(paymentsCollectedToday)}</span>
                </div>
              </div>
            )}

            {/* Today's New Outstanding Sales */}
            <div className="glass-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border/20">
                <h3 className="font-semibold text-[15px] tracking-tight">New Credit Sales Today</h3>
              </div>
              {outstandingSales.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-[14px]">No new credit sales today</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/20">
                        {["Invoice #", "Customer", "Product(s)", "Total", "Paid", "Balance", "Payment", "Time"].map((h) => (
                          <th key={h} className="text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {outstandingSales.map((sale) => (
                        <tr key={sale.id} className="border-b border-border/10 last:border-0">
                          <td className="py-3 px-4 text-[12px] font-mono font-medium text-primary">{sale.sale_number}</td>
                          <td className="py-3 px-4 text-[12px]">{sale.customer_name || "Walk-in"}</td>
                          <td className="py-3 px-4 text-[12px]">{sale.items.map(i => i.product_name).join(", ")}</td>
                          <td className="py-3 px-4 text-[12px] font-semibold">{formatPrice(sale.total_amount)}</td>
                          <td className="py-3 px-4 text-[12px] text-success">{formatPrice(parsePaid(sale))}</td>
                          <td className="py-3 px-4 text-[12px] font-semibold text-destructive">{formatPrice(parseBalance(sale))}</td>
                          <td className="py-3 px-4 text-[12px]">{sale.payment_method}</td>
                          <td className="py-3 px-4 text-[12px] text-muted-foreground">{format(new Date(sale.created_at), "HH:mm")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="px-6 py-3 bg-secondary/20 border-t border-border/20 flex justify-between text-[13px] font-semibold">
                <span>Today's Outstanding</span>
                <span className="text-destructive">{formatPrice(totalOutstanding)}</span>
              </div>
            </div>
          </TabsContent>

          {/* ═══ SALES BY PRODUCT TAB ═══ */}
          <TabsContent value="products" className="mt-4">
            <div className="glass-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border/20">
                <h3 className="font-semibold text-[15px] tracking-tight">Sales by Product</h3>
              </div>
              {productSales.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-[14px]">No products sold today</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/20">
                        {["Product Name", "Quantity Sold", "Unit Price", "Total Revenue"].map((h) => (
                          <th key={h} className="text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {productSales.map((p) => (
                        <tr key={p.product_name} className="border-b border-border/10 last:border-0">
                          <td className="py-3 px-4 text-[12px] font-medium">{p.product_name}</td>
                          <td className="py-3 px-4 text-[12px]">{p.quantity}</td>
                          <td className="py-3 px-4 text-[12px] text-muted-foreground">{formatPrice(p.unit_price)}</td>
                          <td className="py-3 px-4 text-[12px] font-semibold text-primary">{formatPrice(p.total_revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="px-6 py-3 bg-secondary/20 border-t border-border/20 flex justify-between text-[13px] font-semibold">
                <span>Total Products Sold: {productSales.reduce((s, p) => s + p.quantity, 0)}</span>
                <span className="text-primary">{formatPrice(productSales.reduce((s, p) => s + p.total_revenue, 0))}</span>
              </div>
            </div>
          </TabsContent>

          {/* ═══ EXPENSES TAB ═══ */}
          <TabsContent value="expenses" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[15px]">Today's Expenses</h3>
              <Button size="sm" className="gap-2 rounded-xl bg-primary text-primary-foreground" onClick={() => setShowAddExpense(true)}>
                <Plus className="h-4 w-4" /> Add Expense
              </Button>
            </div>
            <div className="glass-card overflow-hidden">
              {expenses.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-[14px]">No expenses recorded today</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/20">
                        {["Name", "Category", "Amount", "Description", "Staff", "Time", ""].map((h) => (
                          <th key={h} className="text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((exp) => (
                        <tr key={exp.id} className="border-b border-border/10 last:border-0">
                          <td className="py-3 px-4 text-[12px] font-medium">{exp.name}</td>
                          <td className="py-3 px-4 text-[12px]"><span className="px-2 py-0.5 rounded-md bg-secondary/60 text-[11px]">{exp.category}</span></td>
                          <td className="py-3 px-4 text-[12px] font-semibold text-destructive">{formatPrice(exp.amount)}</td>
                          <td className="py-3 px-4 text-[12px] text-muted-foreground max-w-[150px] truncate">{exp.description || "—"}</td>
                          <td className="py-3 px-4 text-[12px]">{exp.staff_member || "—"}</td>
                          <td className="py-3 px-4 text-[12px] text-muted-foreground">{format(new Date(exp.created_at), "HH:mm")}</td>
                          <td className="py-3 px-4">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteExpense(exp.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="px-6 py-3 bg-secondary/20 border-t border-border/20 flex justify-between text-[13px] font-semibold">
                <span>Total Expenses</span>
                <span className="text-destructive">{formatPrice(totalExpenses)}</span>
              </div>
            </div>
          </TabsContent>

          {/* ═══ INVENTORY ACTIVITY TAB ═══ */}
          <TabsContent value="inventory" className="mt-4">
            <div className="glass-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border/20">
                <h3 className="font-semibold text-[15px] tracking-tight">Inventory Activity Today</h3>
              </div>
              {inventoryActivity.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-[14px]">No inventory changes today</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/20">
                        {["Product", "IMEI", "Action", "Qty", "Status", "Time"].map((h) => (
                          <th key={h} className="text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {inventoryActivity.map((item) => (
                        <tr key={item.id} className="border-b border-border/10 last:border-0">
                          <td className="py-3 px-4 text-[12px] font-medium">{item.product_name}</td>
                          <td className="py-3 px-4 text-[12px] font-mono text-muted-foreground">{item.imei}</td>
                          <td className="py-3 px-4 text-[12px]">
                            <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${
                              item.action === "Added" ? "bg-success/10 text-success" :
                              item.action === "Sold" ? "bg-primary/10 text-primary" :
                              "bg-warning/10 text-warning"
                            }`}>{item.action}</span>
                          </td>
                          <td className="py-3 px-4 text-[12px]">{item.quantity}</td>
                          <td className="py-3 px-4 text-[12px]">{item.status}</td>
                          <td className="py-3 px-4 text-[12px] text-muted-foreground">{format(new Date(item.updated_at || item.created_at), "HH:mm")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="px-6 py-3 bg-secondary/20 border-t border-border/20 text-[13px] font-semibold">
                Total Changes: {inventoryActivity.length}
              </div>
            </div>
          </TabsContent>

          {/* ═══ STAFF ACTIVITY TAB ═══ */}
          <TabsContent value="staff" className="mt-4">
            <div className="glass-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border/20">
                <h3 className="font-semibold text-[15px] tracking-tight">Staff Login & Logout Activity</h3>
              </div>
              {auditLogs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-[14px]">No staff activity recorded today</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/20">
                        {["Action", "Staff", "Role", "Time", "IP Address"].map((h) => (
                          <th key={h} className="text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="border-b border-border/10 last:border-0">
                          <td className="py-3 px-4 text-[12px]">
                            <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${
                              log.action === "login" ? "bg-success/10 text-success" :
                              log.action === "logout" ? "bg-destructive/10 text-destructive" :
                              "bg-secondary/60 text-muted-foreground"
                            }`}>{log.action}</span>
                          </td>
                          <td className="py-3 px-4 text-[12px] font-medium">{(log.details as any)?.email || log.performed_by?.slice(0, 8) || "—"}</td>
                          <td className="py-3 px-4 text-[12px]">{log.user_role || "—"}</td>
                          <td className="py-3 px-4 text-[12px] text-muted-foreground">{format(new Date(log.created_at), "HH:mm:ss")}</td>
                          <td className="py-3 px-4 text-[12px] font-mono text-muted-foreground">{log.ip_address || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ═══ RECEIPT PHOTOS TAB ═══ */}
          <TabsContent value="screenshots" className="mt-4">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-[15px] tracking-tight flex items-center gap-2">
                  <Image className="h-4 w-4 text-primary" /> Receipt Screenshots
                </h3>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={fetchReceiptImages}>
                  <Loader2 className={`h-4 w-4 ${loadingImages ? "animate-spin" : ""}`} />
                </Button>
              </div>
              {loadingImages ? (
                <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : receiptImages.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Image className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p className="text-[13px]">No receipt screenshots yet. Use the 📷 button on POS receipts.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {receiptImages.map((receipt) => (
                    <button key={receipt.name} onClick={() => setSelectedImage(receipt)} className="group rounded-xl overflow-hidden border border-border/20 hover:border-primary/40 transition-all duration-200 hover:shadow-lg bg-secondary/20">
                      <div className="aspect-[3/4] overflow-hidden">
                        <img src={receipt.url} alt={receipt.name} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                      </div>
                      <div className="p-2">
                        <p className="text-[11px] font-mono font-medium truncate text-primary">{extractSaleNumber(receipt.name)}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{receipt.created_at ? new Date(receipt.created_at).toLocaleDateString() : ""}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ═══ STORED REPORTS TAB ═══ */}
          <TabsContent value="history" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[15px] tracking-tight flex items-center gap-2">
                <History className="h-4 w-4 text-primary" /> Stored End-of-Day Reports
              </h3>
              <span className="text-[12px] text-muted-foreground">{pastReports.length} report(s)</span>
            </div>
            {pastReports.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-[14px]">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p>No reports stored yet. Close the day from the Summary tab to save a report.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pastReports.map((report) => (
                  <div key={report.id} className="glass-card p-4 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${report.status === "Closed" ? "bg-success/10" : "bg-warning/10"}`}>
                      {report.status === "Closed" ? <CheckCircle className="h-5 w-5 text-success" /> : <Clock className="h-5 w-5 text-warning" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium">{format(new Date(report.report_date), "EEEE, dd MMM yyyy")}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {report.total_transactions} transactions · {report.status}
                        {report.closed_at && ` · Closed at ${format(new Date(report.closed_at), "HH:mm")}`}
                        {report.closed_by_name && ` by ${report.closed_by_name}`}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[14px] font-semibold text-primary">{formatPrice(report.total_sales)}</p>
                      {report.physical_cash !== null && (
                        <p className={`text-[10px] font-medium ${report.cash_difference === 0 ? "text-success" : "text-destructive"}`}>
                          {report.cash_difference === 0 ? "Balanced" : `${formatPrice(Math.abs(report.cash_difference))} ${(report.cash_difference ?? 0) > 0 ? "over" : "short"}`}
                        </p>
                      )}
                    </div>
                    <Button variant="outline" size="sm" className="shrink-0 rounded-lg gap-1.5 border-primary/30 text-primary text-[12px]" onClick={() => setSelectedReport(report)}>
                      <Eye className="h-3.5 w-3.5" /> View
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* ─── DIALOGS ─── */}

      {/* Add Expense Dialog */}
      <Dialog open={showAddExpense} onOpenChange={setShowAddExpense}>
        <DialogContent className="glass-card border-border/30 max-w-md">
          <DialogHeader><DialogTitle className="text-[16px]">Add Expense</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Expense name..." value={expName} onChange={(e) => setExpName(e.target.value)} className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px]" />
            <Select value={expCategory} onValueChange={setExpCategory}>
              <SelectTrigger className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px]"><SelectValue /></SelectTrigger>
              <SelectContent>{expenseCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <Input type="number" placeholder="Amount..." value={expAmount} onChange={(e) => setExpAmount(e.target.value)} className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px]" />
            <Input placeholder="Description (optional)..." value={expDesc} onChange={(e) => setExpDesc(e.target.value)} className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px]" />
            <Button onClick={handleAddExpense} disabled={savingExpense || !expName || !expAmount} className="w-full rounded-xl h-11 bg-primary text-primary-foreground gap-2">
              {savingExpense ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Save Expense
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Detail Dialog */}
      <Dialog open={!!selectedReceipt} onOpenChange={() => setSelectedReceipt(null)}>
        <DialogContent className="glass-card border-border/30 max-w-md">
          <DialogHeader><DialogTitle className="text-[16px] font-semibold text-center">Receipt</DialogTitle></DialogHeader>
          {selectedReceipt && (
            <>
              <div ref={receiptRef}>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontWeight: "bold", fontSize: "14px" }}>Sunbird Online Stores</p>
                  <p style={{ fontSize: "11px", color: "#888" }}>Receipt</p>
                </div>
                <div style={{ borderTop: "1px dashed #ccc", margin: "8px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}><span>Sale #:</span><span>{selectedReceipt.sale_number}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}><span>Date:</span><span>{format(new Date(selectedReceipt.created_at), "dd/MM/yyyy HH:mm")}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}><span>Customer:</span><span>{selectedReceipt.customer_name || "Walk-in"}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}><span>Payment:</span><span>{selectedReceipt.payment_method}</span></div>
                <div style={{ borderTop: "1px dashed #ccc", margin: "8px 0" }} />
                {selectedReceipt.items.map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                    <div><div>{item.product_name}</div>{item.imei && <div style={{ fontSize: "10px", color: "#888" }}>{item.imei}</div>}</div>
                    <span style={{ fontWeight: "bold" }}>{formatPrice(item.unit_price)}</span>
                  </div>
                ))}
                <div style={{ borderTop: "1px dashed #ccc", margin: "8px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: "bold" }}><span>TOTAL</span><span>{formatPrice(selectedReceipt.total_amount)}</span></div>
                <div style={{ textAlign: "center", fontSize: "10px", color: "#888", marginTop: "10px" }}>Thank you for shopping at Sunbird Online Stores!</div>
              </div>
              <Button className="w-full rounded-xl gap-2 bg-primary text-primary-foreground mt-2" onClick={handlePrintReceipt}>
                <Printer className="h-4 w-4" /> Print Receipt
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Receipt Image Preview */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="glass-card border-border/30 max-w-lg max-h-[90vh] overflow-auto">
          <DialogHeader><DialogTitle className="text-[15px] font-semibold flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> {selectedImage ? extractSaleNumber(selectedImage.name) : "Receipt"}</DialogTitle></DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              <img src={selectedImage.url} alt={selectedImage.name} className="w-full rounded-xl border border-border/20" />
              <p className="text-[11px] text-muted-foreground text-center">{selectedImage.created_at ? new Date(selectedImage.created_at).toLocaleString() : ""}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Past Report Full Detail (from snapshot) */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="glass-card border-border/30 max-w-2xl max-h-[85vh] overflow-auto">
          <DialogHeader><DialogTitle className="text-[16px] font-semibold">End-of-Day Report — {selectedReport && format(new Date(selectedReport.report_date), "EEEE, dd MMM yyyy")}</DialogTitle></DialogHeader>
          {selectedReport && (() => {
            const snap = selectedReport.report_snapshot;
            const snapSales = snap?.sales || [];
            const snapExpenses = snap?.expenses || [];
            const snapInventory = snap?.inventory_activity || [];
            const snapStaff = snap?.staff_activity || [];
            const snapOutstanding = snap?.outstanding_balances || [];
            const snapProductSales = snap?.product_sales || [];
            const snapTotalExp = snap?.total_expenses || 0;
            const snapTotalOut = snap?.total_outstanding || 0;
            const snapNetCash = snap?.net_cash_received ?? (selectedReport.total_sales - snapTotalOut - snapTotalExp);
            const r = selectedReport;

            return (
              <div className="space-y-5">
                {/* Report Audit Info */}
                <div className="p-3 flex flex-wrap gap-x-6 gap-y-1 text-[12px] text-muted-foreground bg-secondary/20 rounded-xl">
                  <span><strong className="text-foreground">Closed By:</strong> {r.closed_by_name || "N/A"}</span>
                  <span><strong className="text-foreground">Role:</strong> {r.closed_by_role || "N/A"}</span>
                  <span><strong className="text-foreground">Closed At:</strong> {r.closed_at ? format(new Date(r.closed_at), "dd MMM yyyy, HH:mm:ss") : "N/A"}</span>
                </div>

                {/* Sales Summary */}
                <div>
                  <h4 className="text-[13px] font-semibold mb-2 flex items-center gap-2"><DollarSign className="h-3.5 w-3.5 text-primary" /> Sales Summary</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="stat-card p-3"><p className="text-[11px] text-muted-foreground">Total Sales</p><p className="text-[16px] font-semibold text-primary">{formatPrice(r.total_sales)}</p></div>
                    <div className="stat-card p-3"><p className="text-[11px] text-muted-foreground">Transactions</p><p className="text-[16px] font-semibold">{r.total_transactions}</p></div>
                    <div className="stat-card p-3"><p className="text-[11px] text-muted-foreground">Expenses</p><p className="text-[16px] font-semibold text-destructive">{formatPrice(snapTotalExp)}</p></div>
                    <div className="stat-card p-3"><p className="text-[11px] text-muted-foreground">Net Cash</p><p className={`text-[16px] font-semibold ${snapNetCash >= 0 ? "text-primary" : "text-destructive"}`}>{formatPrice(snapNetCash)}</p></div>
                  </div>
                  <table className="w-full text-[12px] mt-3">
                    <thead><tr className="border-b border-border/20"><th className="text-left py-2 text-muted-foreground font-medium">Method</th><th className="text-left py-2 text-muted-foreground font-medium">Txns</th><th className="text-left py-2 text-muted-foreground font-medium">Amount</th></tr></thead>
                    <tbody>
                      <tr className="border-b border-border/10"><td className="py-2">Cash</td><td>{r.cash_transactions}</td><td className="text-primary font-semibold">{formatPrice(r.cash_sales)}</td></tr>
                      <tr className="border-b border-border/10"><td className="py-2">Mobile Money</td><td>{r.mobile_money_transactions}</td><td className="text-primary font-semibold">{formatPrice(r.mobile_money_sales)}</td></tr>
                      <tr className="border-b border-border/10"><td className="py-2">Bank</td><td>{r.bank_transactions}</td><td className="text-primary font-semibold">{formatPrice(r.bank_sales)}</td></tr>
                      <tr className="border-b border-border/10"><td className="py-2">Split</td><td>{r.split_transactions}</td><td className="text-primary font-semibold">{formatPrice(r.split_sales)}</td></tr>
                    </tbody>
                  </table>
                  {r.physical_cash !== null && (
                    <div className={`rounded-xl p-3 text-[13px] font-medium mt-3 ${r.cash_difference === 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                      Physical Cash: {formatPrice(r.physical_cash)} · Difference: {formatPrice(Math.abs(r.cash_difference))} {r.cash_difference > 0 ? "over" : r.cash_difference < 0 ? "short" : "balanced"}
                    </div>
                  )}
                </div>

                {/* Outstanding Balances */}
                {snapOutstanding.length > 0 && (
                  <div>
                    <h4 className="text-[13px] font-semibold mb-2 flex items-center gap-2"><AlertTriangle className="h-3.5 w-3.5 text-destructive" /> Outstanding Balances ({snapOutstanding.length})</h4>
                    <div className="overflow-x-auto rounded-xl border border-border/20">
                      <table className="w-full text-[12px]">
                        <thead><tr className="border-b border-border/20 bg-secondary/20"><th className="text-left py-2 px-3 text-muted-foreground font-medium">Invoice</th><th className="text-left py-2 px-3 text-muted-foreground font-medium">Customer</th><th className="text-left py-2 px-3 text-muted-foreground font-medium">Total</th><th className="text-left py-2 px-3 text-muted-foreground font-medium">Paid</th><th className="text-left py-2 px-3 text-muted-foreground font-medium">Balance</th></tr></thead>
                        <tbody>
                          {snapOutstanding.map((s: any, i: number) => (
                            <tr key={i} className="border-b border-border/10 last:border-0">
                              <td className="py-2 px-3 font-mono text-primary">{s.sale_number}</td>
                              <td className="py-2 px-3">{s.customer_name || "Walk-in"}</td>
                              <td className="py-2 px-3 font-semibold">{formatPrice(s.total_amount)}</td>
                              <td className="py-2 px-3 text-success">{formatPrice(s.amount_paid)}</td>
                              <td className="py-2 px-3 font-semibold text-destructive">{formatPrice(s.balance)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Sales by Product */}
                {snapProductSales.length > 0 && (
                  <div>
                    <h4 className="text-[13px] font-semibold mb-2 flex items-center gap-2"><ShoppingBag className="h-3.5 w-3.5 text-primary" /> Sales by Product ({snapProductSales.length})</h4>
                    <div className="overflow-x-auto rounded-xl border border-border/20">
                      <table className="w-full text-[12px]">
                        <thead><tr className="border-b border-border/20 bg-secondary/20"><th className="text-left py-2 px-3 text-muted-foreground font-medium">Product</th><th className="text-left py-2 px-3 text-muted-foreground font-medium">Qty</th><th className="text-left py-2 px-3 text-muted-foreground font-medium">Unit Price</th><th className="text-left py-2 px-3 text-muted-foreground font-medium">Revenue</th></tr></thead>
                        <tbody>
                          {snapProductSales.map((p: any, i: number) => (
                            <tr key={i} className="border-b border-border/10 last:border-0">
                              <td className="py-2 px-3 font-medium">{p.product_name}</td>
                              <td className="py-2 px-3">{p.quantity}</td>
                              <td className="py-2 px-3 text-muted-foreground">{formatPrice(p.unit_price)}</td>
                              <td className="py-2 px-3 font-semibold text-primary">{formatPrice(p.total_revenue)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Expenses */}
                {snapExpenses.length > 0 && (
                  <div>
                    <h4 className="text-[13px] font-semibold mb-2 flex items-center gap-2"><TrendingUp className="h-3.5 w-3.5 text-destructive" /> Expenses ({snapExpenses.length})</h4>
                    <div className="overflow-x-auto rounded-xl border border-border/20">
                      <table className="w-full text-[12px]">
                        <thead><tr className="border-b border-border/20 bg-secondary/20"><th className="text-left py-2 px-3 text-muted-foreground font-medium">Name</th><th className="text-left py-2 px-3 text-muted-foreground font-medium">Category</th><th className="text-left py-2 px-3 text-muted-foreground font-medium">Amount</th><th className="text-left py-2 px-3 text-muted-foreground font-medium">Staff</th><th className="text-left py-2 px-3 text-muted-foreground font-medium">Time</th></tr></thead>
                        <tbody>
                          {snapExpenses.map((exp: any, i: number) => (
                            <tr key={i} className="border-b border-border/10 last:border-0">
                              <td className="py-2 px-3 font-medium">{exp.name}</td>
                              <td className="py-2 px-3"><span className="px-2 py-0.5 rounded-md bg-secondary/60 text-[11px]">{exp.category}</span></td>
                              <td className="py-2 px-3 font-semibold text-destructive">{formatPrice(exp.amount)}</td>
                              <td className="py-2 px-3 text-muted-foreground">{exp.staff_member || "—"}</td>
                              <td className="py-2 px-3 text-muted-foreground">{exp.created_at ? format(new Date(exp.created_at), "HH:mm") : "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="px-3 py-2 bg-secondary/20 border-t border-border/20 flex justify-between text-[12px] font-semibold">
                        <span>Total</span><span className="text-destructive">{formatPrice(snapTotalExp)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Inventory Activity */}
                {snapInventory.length > 0 && (
                  <div>
                    <h4 className="text-[13px] font-semibold mb-2 flex items-center gap-2"><Package className="h-3.5 w-3.5 text-primary" /> Inventory Changes ({snapInventory.length})</h4>
                    <div className="overflow-x-auto rounded-xl border border-border/20">
                      <table className="w-full text-[12px]">
                        <thead><tr className="border-b border-border/20 bg-secondary/20"><th className="text-left py-2 px-3 text-muted-foreground font-medium">Product</th><th className="text-left py-2 px-3 text-muted-foreground font-medium">IMEI</th><th className="text-left py-2 px-3 text-muted-foreground font-medium">Action</th><th className="text-left py-2 px-3 text-muted-foreground font-medium">Qty</th><th className="text-left py-2 px-3 text-muted-foreground font-medium">Time</th></tr></thead>
                        <tbody>
                          {snapInventory.map((item: any, i: number) => (
                            <tr key={i} className="border-b border-border/10 last:border-0">
                              <td className="py-2 px-3 font-medium">{item.product_name}</td>
                              <td className="py-2 px-3 font-mono text-muted-foreground">{item.imei}</td>
                              <td className="py-2 px-3"><span className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${item.action === "Added" ? "bg-success/10 text-success" : item.action === "Sold" ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning"}`}>{item.action}</span></td>
                              <td className="py-2 px-3">{item.quantity}</td>
                              <td className="py-2 px-3 text-muted-foreground">{item.time ? format(new Date(item.time), "HH:mm") : "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Staff Activity */}
                {snapStaff.length > 0 && (
                  <div>
                    <h4 className="text-[13px] font-semibold mb-2 flex items-center gap-2"><Users className="h-3.5 w-3.5 text-primary" /> Staff Activity ({snapStaff.length})</h4>
                    <div className="overflow-x-auto rounded-xl border border-border/20">
                      <table className="w-full text-[12px]">
                        <thead><tr className="border-b border-border/20 bg-secondary/20"><th className="text-left py-2 px-3 text-muted-foreground font-medium">Action</th><th className="text-left py-2 px-3 text-muted-foreground font-medium">Staff</th><th className="text-left py-2 px-3 text-muted-foreground font-medium">Role</th><th className="text-left py-2 px-3 text-muted-foreground font-medium">Time</th></tr></thead>
                        <tbody>
                          {snapStaff.map((log: any, i: number) => (
                            <tr key={i} className="border-b border-border/10 last:border-0">
                              <td className="py-2 px-3"><span className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${log.action === "login" ? "bg-success/10 text-success" : log.action === "logout" ? "bg-destructive/10 text-destructive" : "bg-secondary/60"}`}>{log.action}</span></td>
                              <td className="py-2 px-3 font-medium">{log.email || "—"}</td>
                              <td className="py-2 px-3">{log.role || "—"}</td>
                              <td className="py-2 px-3 text-muted-foreground">{log.time ? format(new Date(log.time), "HH:mm:ss") : "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Financial Summary */}
                <div>
                  <h4 className="text-[13px] font-semibold mb-2 flex items-center gap-2"><BarChart3 className="h-3.5 w-3.5 text-primary" /> Daily Financial Summary</h4>
                  <div className="rounded-xl border border-border/20 overflow-hidden">
                    <table className="w-full text-[12px]">
                      <tbody>
                        <tr className="border-b border-border/10"><td className="py-2.5 px-3 font-medium">Total Revenue</td><td className="py-2.5 px-3 text-right font-semibold text-primary">{formatPrice(r.total_sales)}</td></tr>
                        <tr className="border-b border-border/10"><td className="py-2.5 px-3 font-medium">Total Expenses</td><td className="py-2.5 px-3 text-right font-semibold text-destructive">-{formatPrice(snapTotalExp)}</td></tr>
                        <tr className="border-b border-border/10"><td className="py-2.5 px-3 font-medium">Outstanding Balances</td><td className="py-2.5 px-3 text-right font-semibold text-destructive">-{formatPrice(snapTotalOut)}</td></tr>
                        <tr className="bg-secondary/20"><td className="py-2.5 px-3 font-bold">Net Cash Received</td><td className={`py-2.5 px-3 text-right font-bold ${snapNetCash >= 0 ? "text-primary" : "text-destructive"}`}>{formatPrice(snapNetCash)}</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* All Sales list */}
                {snapSales.length > 0 && (
                  <div>
                    <h4 className="text-[13px] font-semibold mb-2 flex items-center gap-2"><Receipt className="h-3.5 w-3.5 text-primary" /> All Sales ({snapSales.length})</h4>
                    <div className="space-y-2 max-h-60 overflow-auto">
                      {snapSales.map((sale: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/30 text-left">
                          <Receipt className="h-4 w-4 text-primary shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-medium">{sale.sale_number}</p>
                            <p className="text-[10px] text-muted-foreground">{sale.customer_name || "Walk-in"} · {sale.payment_method} · {sale.status} · {format(new Date(sale.created_at), "HH:mm")}</p>
                          </div>
                          <span className="text-[12px] font-semibold text-primary">{formatPrice(sale.total_amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No snapshot fallback */}
                {!snap && (
                  <div className="text-center py-8 text-muted-foreground text-[13px]">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-20" />
                    <p>This report was created before snapshot storage was enabled.</p>
                    <p className="text-[11px] mt-1">Only summary numbers are available.</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button className="flex-1 rounded-xl gap-2 bg-primary text-primary-foreground" onClick={() => {
                    const printWindow = window.open("", "_blank", "width=600,height=800");
                    if (!printWindow) return;
                    let html = `<html><head><title>Z-Report ${r.report_date}</title><style>body{font-family:Arial,sans-serif;font-size:13px;padding:20px;max-width:600px;margin:0 auto;}h2,h3{margin:8px 0;}table{width:100%;border-collapse:collapse;margin:10px 0;}th,td{padding:6px 8px;border-bottom:1px solid #eee;text-align:left;}.total td{font-weight:bold;border-top:2px solid #333;}hr{border:none;border-top:1px solid #ddd;margin:16px 0;}</style></head><body>`;
                    html += `<h2 style="text-align:center">Sunbird Online Stores</h2><p style="text-align:center;color:#666;">End-of-Day Report — ${format(new Date(r.report_date), "dd MMMM yyyy")}</p>`;
                    html += `<p style="text-align:center;color:#666;font-size:11px;">Closed by: ${r.closed_by_name || "N/A"} (${r.closed_by_role || "N/A"}) at ${r.closed_at ? format(new Date(r.closed_at), "HH:mm") : "N/A"}</p><hr>`;
                    html += `<h3>Sales Summary</h3><table><tr><th>Method</th><th>Txns</th><th>Amount</th></tr><tr><td>Cash</td><td>${r.cash_transactions}</td><td>UGX ${r.cash_sales.toLocaleString()}</td></tr><tr><td>Mobile Money</td><td>${r.mobile_money_transactions}</td><td>UGX ${r.mobile_money_sales.toLocaleString()}</td></tr><tr><td>Bank</td><td>${r.bank_transactions}</td><td>UGX ${r.bank_sales.toLocaleString()}</td></tr><tr><td>Split</td><td>${r.split_transactions}</td><td>UGX ${r.split_sales.toLocaleString()}</td></tr><tr class="total"><td>Total</td><td>${r.total_transactions}</td><td>UGX ${r.total_sales.toLocaleString()}</td></tr></table>`;
                    if (snapProductSales.length > 0) { html += `<hr><h3>Sales by Product</h3><table><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Revenue</th></tr>${snapProductSales.map((p: any) => `<tr><td>${p.product_name}</td><td>${p.quantity}</td><td>UGX ${p.unit_price.toLocaleString()}</td><td>UGX ${p.total_revenue.toLocaleString()}</td></tr>`).join("")}</table>`; }
                    if (snapExpenses.length > 0) { html += `<hr><h3>Expenses</h3><table><tr><th>Name</th><th>Category</th><th>Amount</th><th>Staff</th></tr>${snapExpenses.map((e: any) => `<tr><td>${e.name}</td><td>${e.category}</td><td>UGX ${e.amount.toLocaleString()}</td><td>${e.staff_member || "—"}</td></tr>`).join("")}<tr class="total"><td colspan="3">Total</td><td>UGX ${snapTotalExp.toLocaleString()}</td></tr></table>`; }
                    if (snapOutstanding.length > 0) { html += `<hr><h3>Outstanding Balances</h3><table><tr><th>Invoice</th><th>Customer</th><th>Total</th><th>Balance</th></tr>${snapOutstanding.map((s: any) => `<tr><td>${s.sale_number}</td><td>${s.customer_name || "Walk-in"}</td><td>UGX ${s.total_amount.toLocaleString()}</td><td>UGX ${s.balance.toLocaleString()}</td></tr>`).join("")}</table>`; }
                    html += `<hr><h3>Financial Summary</h3><table><tr><td>Total Revenue</td><td>UGX ${r.total_sales.toLocaleString()}</td></tr><tr><td>Total Expenses</td><td>-UGX ${snapTotalExp.toLocaleString()}</td></tr><tr><td>Outstanding</td><td>-UGX ${snapTotalOut.toLocaleString()}</td></tr><tr class="total"><td>Net Cash Received</td><td>UGX ${snapNetCash.toLocaleString()}</td></tr></table>`;
                    html += `</body></html>`;
                    printWindow.document.write(html);
                    printWindow.document.close(); printWindow.print();
                  }}>
                    <Printer className="h-4 w-4" /> Print
                  </Button>
                  <Button variant="outline" className="flex-1 rounded-xl gap-2 border-primary/30 text-primary" onClick={() => {
                    const text = `*SUNBIRD ONLINE STORES*\n*END-OF-DAY REPORT — ${format(new Date(r.report_date), "dd MMM yyyy")}*\n\nTotal Sales: ${formatPrice(r.total_sales)}\nTransactions: ${r.total_transactions}\n\nCash: ${formatPrice(r.cash_sales)} (${r.cash_transactions} txns)\nMobile Money: ${formatPrice(r.mobile_money_sales)} (${r.mobile_money_transactions} txns)\nBank: ${formatPrice(r.bank_sales)} (${r.bank_transactions} txns)\nSplit: ${formatPrice(r.split_sales)} (${r.split_transactions} txns)\n\n*Expenses:* ${formatPrice(snapTotalExp)}\n*Outstanding:* ${snapOutstanding.length} sale(s) — ${formatPrice(snapTotalOut)}\n*Net Cash:* ${formatPrice(snapNetCash)}\n*Inventory Changes:* ${snapInventory.length}\n*Staff Activities:* ${snapStaff.length}\n\nClosed by: ${r.closed_by_name || "N/A"} (${r.closed_by_role || "N/A"})`;
                    window.open(`https://wa.me/256704811097?text=${encodeURIComponent(text)}`, "_blank");
                  }}>
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ZReport;
