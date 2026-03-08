import { useState } from "react";
import { Store, Plus, MapPin, Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface StoreLocation {
  id: string;
  name: string;
  address: string;
  phone: string;
  status: "active" | "inactive";
}

export default function StoresPage() {
  const [stores, setStores] = useState<StoreLocation[]>([
    { id: "1", name: "Main Branch", address: "Kampala Road, Kampala", phone: "+256 700 123 456", status: "active" },
  ]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", phone: "" });

  const addStore = () => {
    if (!form.name) {
      toast({ title: "Error", description: "Store name is required", variant: "destructive" });
      return;
    }
    setStores([...stores, {
      id: Date.now().toString(),
      name: form.name,
      address: form.address,
      phone: form.phone,
      status: "active",
    }]);
    setDialogOpen(false);
    setForm({ name: "", address: "", phone: "" });
    toast({ title: "Store Added", description: `${form.name} has been added.` });
  };

  const toggleStatus = (id: string) => {
    setStores(stores.map((s) =>
      s.id === id ? { ...s, status: s.status === "active" ? "inactive" : "active" } : s
    ));
  };

  return (
    <div className="space-y-5 animate-fade-in max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[22px] md:text-[28px] font-bold tracking-tight">Stores & Branches</h1>
          <p className="text-muted-foreground text-[13px] mt-0.5">{stores.length} location{stores.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="rounded-xl h-10 text-[13px]">
          <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Store
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stores.map((store) => (
          <div key={store.id} className={`glass-card p-5 transition-all ${store.status === "inactive" ? "opacity-50" : ""}`}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                <Store className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-[15px] font-semibold truncate">{store.name}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    store.status === "active" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
                  }`}>
                    {store.status}
                  </span>
                </div>
                {store.address && (
                  <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span>{store.address}</span>
                  </div>
                )}
                {store.phone && (
                  <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground mt-0.5">
                    <Phone className="h-3 w-3 shrink-0" />
                    <span>{store.phone}</span>
                  </div>
                )}
                <div className="mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg h-8 text-[11px]"
                    onClick={() => toggleStatus(store.id)}
                  >
                    {store.status === "active" ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add New Store</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-1.5">Store Name</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Downtown Branch" className="h-10 rounded-xl text-[13px]" />
            </div>
            <div>
              <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-1.5">Address</label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street, City" className="h-10 rounded-xl text-[13px]" />
            </div>
            <div>
              <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-1.5">Phone</label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+256..." className="h-10 rounded-xl text-[13px]" />
            </div>
            <Button onClick={addStore} className="w-full rounded-xl h-10 text-[13px]">
              <Store className="h-4 w-4 mr-2" /> Add Store
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
