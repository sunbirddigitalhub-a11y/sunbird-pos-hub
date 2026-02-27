import { useState, useEffect } from "react";
import { Store, Globe, Receipt, Bell, Shield, Palette, Database, Save, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const sections = [
  { id: "general", label: "General", icon: Store },
  { id: "currency", label: "Currency & Tax", icon: Globe },
  { id: "receipts", label: "Receipts", icon: Receipt },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "data", label: "Data & Backup", icon: Database },
];

const defaultSettings: Record<string, string> = {
  store_name: "Sunbird Online Stores",
  business_phone: "+256 700 123 456",
  address: "Kampala Road, Kampala, Uganda",
  default_currency: "UGX (Ugandan Shilling)",
  exchange_rate: "950",
  apply_vat: "false",
  show_imei_receipt: "true",
  warranty_footer: "true",
  emi_schedule_receipt: "true",
  receipt_footer_text: "Thank you for shopping at Sunbird Online Stores!",
  emi_reminders: "true",
  low_stock_alerts: "true",
  daily_summary_whatsapp: "false",
  whatsapp_number: "+256704811097",
  hide_cost_from_agents: "true",
  hide_profit_from_nonadmin: "true",
  require_zreport: "true",
  auto_backup: "true",
  keep_deleted_history: "true",
};

const SettingsPage = () => {
  const [active, setActive] = useState("general");
  const [settings, setSettings] = useState<Record<string, string>>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("settings" as any).select("key, value");
      if (data) {
        const map: Record<string, string> = { ...defaultSettings };
        (data as any[]).forEach((r: any) => { map[r.key] = r.value; });
        setSettings(map);
      }
      setLoading(false);
    };
    load();
  }, []);

  const update = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSwitch = (key: string) => {
    setSettings((prev) => ({ ...prev, [key]: prev[key] === "true" ? "false" : "true" }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(settings)) {
        await supabase
          .from("settings" as any)
          .upsert({ key, value } as any, { onConflict: "key" });
      }
      toast({ title: "Settings saved", description: "Your changes have been saved successfully." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  const SwitchRow = ({ label, desc, settingKey }: { label: string; desc: string; settingKey: string }) => (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-[13px] font-medium">{label}</p>
        <p className="text-[12px] text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={settings[settingKey] === "true"} onCheckedChange={() => toggleSwitch(settingKey)} />
    </div>
  );

  return (
    <div className="animate-fade-in max-w-5xl">
      <div className="mb-8">
        <h1 className="text-[28px] font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-[14px] mt-1">Configure your POS system</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <nav className="md:w-56 shrink-0 space-y-1">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                active === s.id
                  ? "bg-primary/10 text-primary border border-primary/25"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              }`}
            >
              <s.icon className="h-4 w-4 shrink-0" strokeWidth={1.8} />
              {s.label}
            </button>
          ))}
        </nav>

        <div className="flex-1 glass-card p-6 space-y-6">
          {active === "general" && (
            <>
              <h3 className="font-semibold text-[15px] tracking-tight">General Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-2">Store Name</label>
                  <Input value={settings.store_name} onChange={(e) => update("store_name", e.target.value)} className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px] apple-ring" />
                </div>
                <div>
                  <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-2">Business Phone</label>
                  <Input value={settings.business_phone} onChange={(e) => update("business_phone", e.target.value)} className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px] apple-ring" />
                </div>
                <div>
                  <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-2">Address</label>
                  <Input value={settings.address} onChange={(e) => update("address", e.target.value)} className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px] apple-ring" />
                </div>
              </div>
            </>
          )}

          {active === "currency" && (
            <>
              <h3 className="font-semibold text-[15px] tracking-tight">Currency & Tax</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-2">Default Currency</label>
                  <Input value={settings.default_currency} onChange={(e) => update("default_currency", e.target.value)} className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px] apple-ring" />
                </div>
                <div>
                  <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-2">AED → UGX Exchange Rate</label>
                  <Input value={settings.exchange_rate} onChange={(e) => update("exchange_rate", e.target.value)} type="number" className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px] apple-ring" />
                </div>
                <SwitchRow label="Apply VAT (18%)" desc="Add VAT to selling prices" settingKey="apply_vat" />
              </div>
            </>
          )}

          {active === "receipts" && (
            <>
              <h3 className="font-semibold text-[15px] tracking-tight">Receipt Settings</h3>
              <div className="space-y-4">
                <SwitchRow label="Show IMEI on receipt" desc="Print IMEI/Serial on customer receipts" settingKey="show_imei_receipt" />
                <SwitchRow label="Warranty footer" desc="Add warranty terms to bottom of receipt" settingKey="warranty_footer" />
                <SwitchRow label="EMI schedule on receipt" desc="Include payment schedule for EMI sales" settingKey="emi_schedule_receipt" />
                <div>
                  <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-2">Receipt Footer Text</label>
                  <Input value={settings.receipt_footer_text} onChange={(e) => update("receipt_footer_text", e.target.value)} className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px] apple-ring" />
                </div>
              </div>
            </>
          )}

          {active === "notifications" && (
            <>
              <h3 className="font-semibold text-[15px] tracking-tight">Notifications</h3>
              <div className="space-y-4">
                <SwitchRow label="EMI payment reminders" desc="Auto-send payment due reminders" settingKey="emi_reminders" />
                <SwitchRow label="Low stock alerts" desc="Alert when inventory is below 3 units" settingKey="low_stock_alerts" />
                <SwitchRow label="Daily summary WhatsApp" desc="Send daily sales summary to admin" settingKey="daily_summary_whatsapp" />
                <div>
                  <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-2">WhatsApp Number</label>
                  <Input value={settings.whatsapp_number} onChange={(e) => update("whatsapp_number", e.target.value)} className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px] apple-ring" />
                </div>
              </div>
            </>
          )}

          {active === "security" && (
            <>
              <h3 className="font-semibold text-[15px] tracking-tight">Security</h3>
              <div className="space-y-4">
                <SwitchRow label="Hide purchase cost from agents" desc="Sales agents won't see cost prices" settingKey="hide_cost_from_agents" />
                <SwitchRow label="Hide net profit from non-admins" desc="Only admins see profit figures" settingKey="hide_profit_from_nonadmin" />
                <SwitchRow label="Require Z-Report to close day" desc="Mandatory daily reconciliation" settingKey="require_zreport" />
              </div>
            </>
          )}

          {active === "appearance" && (
            <>
              <h3 className="font-semibold text-[15px] tracking-tight">Appearance</h3>
              <div className="space-y-4">
                <p className="text-[13px] text-muted-foreground">Theme is set to Gold on Charcoal (Dark). Customization options coming soon.</p>
              </div>
            </>
          )}

          {active === "data" && (
            <>
              <h3 className="font-semibold text-[15px] tracking-tight">Data & Backup</h3>
              <div className="space-y-4">
                <SwitchRow label="Auto-backup daily" desc="Automatic cloud backup at midnight" settingKey="auto_backup" />
                <SwitchRow label="Keep deleted product history" desc="Sales records preserved after product deletion" settingKey="keep_deleted_history" />
                <Button variant="outline" className="border-border/30 rounded-xl h-10 text-[13px]">
                  Export All Data
                </Button>
              </div>
            </>
          )}

          <div className="pt-4 border-t border-border/20">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 rounded-xl h-10 text-[13px] font-semibold active:scale-[0.97] transition-all"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
