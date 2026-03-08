import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  ScanBarcode,
  Printer,
  QrCode,
  Search,
  Copy,
  Check,
  Package,
  RefreshCw,
  Zap,
  History,
  Volume2,
  VolumeX,
  Tag,
  Trash2,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  barcode: string | null;
  base_price: number;
  cost_price: number;
  in_stock: number;
}

interface ScanEntry {
  barcode: string;
  product: Product | null;
  timestamp: Date;
  status: "found" | "not_found";
}

const generateBarcode = (): string => {
  const prefix = "SB";
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `${prefix}${timestamp}${random}`;
};

const formatPrice = (amount: number) =>
  `UGX ${amount.toLocaleString("en-UG")}`;

export default function BarcodePage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("scan");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Scan state
  const [scanInput, setScanInput] = useState("");
  const [scanHistory, setScanHistory] = useState<ScanEntry[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const scanInputRef = useRef<HTMLInputElement>(null);
  const barcodeBuffer = useRef("");
  const barcodeTimeout = useRef<NodeJS.Timeout | null>(null);

  // Generate state
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [generatedBarcode, setGeneratedBarcode] = useState("");

  // Print state
  const [printSearch, setPrintSearch] = useState("");
  const [selectedPrintProducts, setSelectedPrintProducts] = useState<string[]>([]);
  const [labelSize, setLabelSize] = useState<"small" | "medium" | "large">("medium");
  const [printQty, setPrintQty] = useState(1);

  // Lookup state
  const [lookupSearch, setLookupSearch] = useState("");
  const [lookupResult, setLookupResult] = useState<Product | null>(null);
  const [lookupSearched, setLookupSearched] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("id, name, category, barcode, base_price, cost_price, in_stock")
      .order("name");
    setProducts(data || []);
    setLoading(false);
  };

  // Hardware scanner listener
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isListening) return;
      if (document.activeElement?.tagName === "INPUT" && document.activeElement !== scanInputRef.current) return;

      if (e.key === "Enter" && barcodeBuffer.current.length > 3) {
        e.preventDefault();
        processBarcode(barcodeBuffer.current.trim());
        barcodeBuffer.current = "";
        return;
      }

      if (e.key.length === 1) {
        barcodeBuffer.current += e.key;
        if (barcodeTimeout.current) clearTimeout(barcodeTimeout.current);
        barcodeTimeout.current = setTimeout(() => {
          barcodeBuffer.current = "";
        }, 200);
      }
    },
    [isListening, products]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const processBarcode = (code: string) => {
    const product = products.find(
      (p) => p.barcode?.toLowerCase() === code.toLowerCase()
    );

    const entry: ScanEntry = {
      barcode: code,
      product: product || null,
      timestamp: new Date(),
      status: product ? "found" : "not_found",
    };

    setScanHistory((prev) => [entry, ...prev]);

    if (soundEnabled) {
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = product ? 800 : 300;
        gain.gain.value = 0.15;
        osc.start();
        osc.stop(ctx.currentTime + (product ? 0.12 : 0.3));
      } catch {}
    }

    toast({
      title: product ? "Product Found" : "Not Found",
      description: product
        ? `${product.name} — ${formatPrice(product.base_price)}`
        : `No product matches barcode: ${code}`,
      variant: product ? "default" : "destructive",
    });
  };

  const handleManualScan = () => {
    if (scanInput.trim().length < 3) return;
    processBarcode(scanInput.trim());
    setScanInput("");
    scanInputRef.current?.focus();
  };

  // Generate barcode for a product
  const handleGenerate = async () => {
    if (!selectedProduct) return;
    const code = generateBarcode();
    const { error } = await supabase
      .from("products")
      .update({ barcode: code })
      .eq("id", selectedProduct);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    setGeneratedBarcode(code);
    toast({ title: "Barcode Generated", description: `Barcode ${code} assigned successfully.` });
    fetchProducts();
  };

  const copyBarcode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied", description: code });
  };

  // Lookup
  const handleLookup = () => {
    const q = lookupSearch.trim().toLowerCase();
    if (!q) return;
    const found = products.find(
      (p) =>
        p.barcode?.toLowerCase() === q ||
        p.name.toLowerCase().includes(q)
    );
    setLookupResult(found || null);
    setLookupSearched(true);
  };

  // Print labels
  const handlePrintLabels = () => {
    const toPrint = products.filter((p) =>
      selectedPrintProducts.includes(p.id) && p.barcode
    );

    if (toPrint.length === 0) {
      toast({ title: "No Products", description: "Select products with barcodes to print.", variant: "destructive" });
      return;
    }

    const sizes = {
      small: { w: 120, h: 60, fontSize: 10 },
      medium: { w: 200, h: 100, fontSize: 13 },
      large: { w: 300, h: 150, fontSize: 16 },
    };
    const s = sizes[labelSize];

    const labelsHtml = toPrint
      .flatMap((p) =>
        Array.from({ length: printQty }, () => `
          <div style="width:${s.w}px;height:${s.h}px;border:1px solid #333;padding:8px;display:inline-flex;flex-direction:column;justify-content:center;align-items:center;margin:4px;font-family:monospace;text-align:center;">
            <div style="font-size:${s.fontSize}px;font-weight:700;margin-bottom:4px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:${s.w - 16}px;">${p.name}</div>
            <div style="font-size:${s.fontSize + 4}px;letter-spacing:3px;font-weight:900;margin:4px 0;">${p.barcode}</div>
            <div style="font-size:${s.fontSize - 2}px;color:#555;">${formatPrice(p.base_price)}</div>
          </div>
        `)
      )
      .join("");

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(`
        <html><head><title>Barcode Labels</title></head>
        <body style="margin:16px;display:flex;flex-wrap:wrap;">
          ${labelsHtml}
          <script>setTimeout(()=>window.print(),400);<\/script>
        </body></html>
      `);
      win.document.close();
    }
  };

  const productsWithBarcode = products.filter((p) => p.barcode);
  const productsWithoutBarcode = products.filter((p) => !p.barcode);

  const filteredPrintProducts = productsWithBarcode.filter(
    (p) =>
      !printSearch ||
      p.name.toLowerCase().includes(printSearch.toLowerCase()) ||
      p.barcode?.toLowerCase().includes(printSearch.toLowerCase())
  );

  const togglePrintSelect = (id: string) => {
    setSelectedPrintProducts((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Barcode</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Scan, generate, look up and print barcodes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 px-3 py-1.5">
            <Tag className="h-3.5 w-3.5" />
            {productsWithBarcode.length} with barcode
          </Badge>
          <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-warning border-warning/30">
            <Package className="h-3.5 w-3.5" />
            {productsWithoutBarcode.length} without
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 h-11">
          <TabsTrigger value="scan" className="gap-2 text-xs sm:text-sm">
            <ScanBarcode className="h-4 w-4" /> Scan
          </TabsTrigger>
          <TabsTrigger value="generate" className="gap-2 text-xs sm:text-sm">
            <QrCode className="h-4 w-4" /> Generate
          </TabsTrigger>
          <TabsTrigger value="lookup" className="gap-2 text-xs sm:text-sm">
            <Search className="h-4 w-4" /> Lookup
          </TabsTrigger>
          <TabsTrigger value="print" className="gap-2 text-xs sm:text-sm">
            <Printer className="h-4 w-4" /> Print
          </TabsTrigger>
        </TabsList>

        {/* ── SCAN TAB ── */}
        <TabsContent value="scan" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Barcode Scanner</CardTitle>
                  <CardDescription>
                    Use a hardware scanner or type a barcode manually
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={soundEnabled ? "secondary" : "ghost"}
                    onClick={() => setSoundEnabled(!soundEnabled)}
                  >
                    {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </Button>
                  <Button
                    size={isListening ? "sm" : "sm"}
                    variant={isListening ? "default" : "outline"}
                    onClick={() => setIsListening(!isListening)}
                    className="gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    {isListening ? "Listening…" : "Start Scanner"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isListening && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20">
                  <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-sm font-medium text-primary">
                    Hardware scanner active — scan any barcode
                  </span>
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  ref={scanInputRef}
                  placeholder="Type or scan barcode…"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleManualScan()}
                  className="flex-1"
                />
                <Button onClick={handleManualScan} className="gap-2">
                  <ScanBarcode className="h-4 w-4" /> Scan
                </Button>
              </div>

              {scanHistory.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <History className="h-4 w-4" /> Scan History
                    </h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setScanHistory([])}
                      className="text-xs gap-1"
                    >
                      <Trash2 className="h-3 w-3" /> Clear
                    </Button>
                  </div>
                  <div className="rounded-xl border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Barcode</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {scanHistory.slice(0, 20).map((entry, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-mono text-xs">{entry.barcode}</TableCell>
                            <TableCell>{entry.product?.name || "—"}</TableCell>
                            <TableCell>
                              {entry.product ? formatPrice(entry.product.base_price) : "—"}
                            </TableCell>
                            <TableCell>
                              <Badge variant={entry.status === "found" ? "default" : "destructive"} className="text-xs">
                                {entry.status === "found" ? "Found" : "Not Found"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {entry.timestamp.toLocaleTimeString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── GENERATE TAB ── */}
        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Generate Barcode</CardTitle>
              <CardDescription>
                Assign a unique barcode to products that don't have one
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {productsWithoutBarcode.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Check className="h-10 w-10 mx-auto mb-2 text-success" />
                  <p className="font-medium">All products have barcodes!</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Select Product (without barcode)</Label>
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a product…" />
                      </SelectTrigger>
                      <SelectContent>
                        {productsWithoutBarcode.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} — {p.category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleGenerate} disabled={!selectedProduct} className="gap-2">
                    <QrCode className="h-4 w-4" /> Generate & Assign
                  </Button>
                </>
              )}

              {generatedBarcode && (
                <div className="mt-4 p-4 rounded-xl border bg-secondary/40 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Generated Barcode</p>
                    <p className="text-xl font-mono font-bold tracking-widest">{generatedBarcode}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => copyBarcode(generatedBarcode)} className="gap-2">
                    <Copy className="h-4 w-4" /> Copy
                  </Button>
                </div>
              )}

              {productsWithBarcode.length > 0 && (
                <div className="mt-6 space-y-2">
                  <h3 className="text-sm font-semibold">Products with Barcodes</h3>
                  <div className="rounded-xl border overflow-hidden max-h-[300px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Barcode</TableHead>
                          <TableHead className="w-10"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {productsWithBarcode.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell className="font-medium">{p.name}</TableCell>
                            <TableCell className="font-mono text-xs">{p.barcode}</TableCell>
                            <TableCell>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={() => copyBarcode(p.barcode!)}
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── LOOKUP TAB ── */}
        <TabsContent value="lookup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Barcode Lookup</CardTitle>
              <CardDescription>Search by barcode or product name</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter barcode or product name…"
                  value={lookupSearch}
                  onChange={(e) => {
                    setLookupSearch(e.target.value);
                    setLookupSearched(false);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                  className="flex-1"
                />
                <Button onClick={handleLookup} className="gap-2">
                  <Search className="h-4 w-4" /> Search
                </Button>
              </div>

              {lookupSearched && (
                lookupResult ? (
                  <Card className="border-primary/30 bg-primary/5">
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold">{lookupResult.name}</h3>
                        <Badge>{lookupResult.category}</Badge>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Barcode</p>
                          <p className="font-mono font-semibold">{lookupResult.barcode || "None"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Price</p>
                          <p className="font-semibold">{formatPrice(lookupResult.base_price)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Cost</p>
                          <p className="font-semibold">{formatPrice(lookupResult.cost_price)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">In Stock</p>
                          <p className="font-semibold">{lookupResult.in_stock}</p>
                        </div>
                      </div>
                      {lookupResult.barcode && (
                        <Button size="sm" variant="outline" onClick={() => copyBarcode(lookupResult.barcode!)} className="gap-2">
                          <Copy className="h-4 w-4" /> Copy Barcode
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="h-10 w-10 mx-auto mb-2 opacity-40" />
                    <p>No product found for "{lookupSearch}"</p>
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── PRINT TAB ── */}
        <TabsContent value="print" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Print Barcode Labels</CardTitle>
              <CardDescription>
                Select products and print labels for your thermal or regular printer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="Filter products…"
                  value={printSearch}
                  onChange={(e) => setPrintSearch(e.target.value)}
                  className="flex-1"
                />
                <div className="flex gap-2">
                  <Select value={labelSize} onValueChange={(v) => setLabelSize(v as any)}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-1.5">
                    <Label className="text-xs whitespace-nowrap">Qty:</Label>
                    <Input
                      type="number"
                      min={1}
                      max={50}
                      value={printQty}
                      onChange={(e) => setPrintQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16"
                    />
                  </div>
                </div>
              </div>

              {filteredPrintProducts.length > 0 ? (
                <div className="rounded-xl border overflow-hidden max-h-[350px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">
                          <input
                            type="checkbox"
                            checked={
                              filteredPrintProducts.length > 0 &&
                              filteredPrintProducts.every((p) => selectedPrintProducts.includes(p.id))
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPrintProducts((prev) => [
                                  ...new Set([...prev, ...filteredPrintProducts.map((p) => p.id)]),
                                ]);
                              } else {
                                setSelectedPrintProducts((prev) =>
                                  prev.filter((id) => !filteredPrintProducts.find((p) => p.id === id))
                                );
                              }
                            }}
                            className="rounded"
                          />
                        </TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Barcode</TableHead>
                        <TableHead>Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPrintProducts.map((p) => (
                        <TableRow
                          key={p.id}
                          className="cursor-pointer"
                          onClick={() => togglePrintSelect(p.id)}
                        >
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedPrintProducts.includes(p.id)}
                              onChange={() => togglePrintSelect(p.id)}
                              className="rounded"
                            />
                          </TableCell>
                          <TableCell className="font-medium">{p.name}</TableCell>
                          <TableCell className="font-mono text-xs">{p.barcode}</TableCell>
                          <TableCell>{formatPrice(p.base_price)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Printer className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p>No products with barcodes to print</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <p className="text-sm text-muted-foreground">
                  {selectedPrintProducts.length} product(s) selected × {printQty} label(s) each
                </p>
                <Button
                  onClick={handlePrintLabels}
                  disabled={selectedPrintProducts.length === 0}
                  className="gap-2"
                >
                  <Printer className="h-4 w-4" /> Print Labels
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
