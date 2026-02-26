import { useState } from "react";
import { Store, Globe, Receipt, Bell, Shield, Palette, Database, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const sections = [
  { id: "general", label: "General", icon: Store },
  { id: "currency", label: "Currency & Tax", icon: Globe },
  { id: "receipts", label: "Receipts", icon: Receipt },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "data", label: "Data & Backup", icon: Database },
];

const SettingsPage = () => {
  const [active, setActive] = useState("general");

  return (
    <div className="animate-fade-in max-w-5xl">
      <div className="mb-8">
        <h1 className="text-[28px] font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-[14px] mt-1">Configure your POS system</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Section Nav */}
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

        {/* Content */}
        <div className="flex-1 glass-card p-6 space-y-6">
          {active === "general" && (
            <>
              <h3 className="font-semibold text-[15px] tracking-tight">General Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-2">Store Name</label>
                  <Input defaultValue="Sunbird Online Stores" className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px] apple-ring" />
                </div>
                <div>
                  <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-2">Business Phone</label>
                  <Input defaultValue="+256 700 123 456" className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px] apple-ring" />
                </div>
                <div>
                  <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-2">Address</label>
                  <Input defaultValue="Kampala Road, Kampala, Uganda" className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px] apple-ring" />
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
                  <Input defaultValue="UGX (Ugandan Shilling)" className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px] apple-ring" />
                </div>
                <div>
                  <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-2">AED → UGX Exchange Rate</label>
                  <Input defaultValue="950" type="number" className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px] apple-ring" />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-[13px] font-medium">Apply VAT (18%)</p>
                    <p className="text-[12px] text-muted-foreground">Add VAT to selling prices</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </>
          )}

          {active === "receipts" && (
            <>
              <h3 className="font-semibold text-[15px] tracking-tight">Receipt Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-[13px] font-medium">Show IMEI on receipt</p>
                    <p className="text-[12px] text-muted-foreground">Print IMEI/Serial on customer receipts</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-[13px] font-medium">Warranty footer</p>
                    <p className="text-[12px] text-muted-foreground">Add warranty terms to bottom of receipt</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-[13px] font-medium">EMI schedule on receipt</p>
                    <p className="text-[12px] text-muted-foreground">Include payment schedule for EMI sales</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div>
                  <label className="text-[12px] text-muted-foreground uppercase tracking-wider block mb-2">Receipt Footer Text</label>
                  <Input defaultValue="Thank you for shopping at Sunbird Online Stores!" className="h-11 bg-secondary/50 border-border/30 rounded-xl text-[14px] apple-ring" />
                </div>
              </div>
            </>
          )}

          {active === "notifications" && (
            <>
              <h3 className="font-semibold text-[15px] tracking-tight">Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-[13px] font-medium">EMI payment reminders</p>
                    <p className="text-[12px] text-muted-foreground">Auto-send payment due reminders</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-[13px] font-medium">Low stock alerts</p>
                    <p className="text-[12px] text-muted-foreground">Alert when inventory is below 3 units</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-[13px] font-medium">Daily summary WhatsApp</p>
                    <p className="text-[12px] text-muted-foreground">Send daily sales summary to admin group</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </>
          )}

          {active === "security" && (
            <>
              <h3 className="font-semibold text-[15px] tracking-tight">Security</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-[13px] font-medium">Hide purchase cost from agents</p>
                    <p className="text-[12px] text-muted-foreground">Sales agents won't see cost prices</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-[13px] font-medium">Hide net profit from non-admins</p>
                    <p className="text-[12px] text-muted-foreground">Only admins see profit figures</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-[13px] font-medium">Require Z-Report to close day</p>
                    <p className="text-[12px] text-muted-foreground">Mandatory daily reconciliation</p>
                  </div>
                  <Switch defaultChecked />
                </div>
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
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-[13px] font-medium">Auto-backup daily</p>
                    <p className="text-[12px] text-muted-foreground">Automatic cloud backup at midnight</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-[13px] font-medium">Keep deleted product history</p>
                    <p className="text-[12px] text-muted-foreground">Sales records preserved after product deletion</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Button variant="outline" className="border-border/30 rounded-xl h-10 text-[13px]">
                  Export All Data
                </Button>
              </div>
            </>
          )}

          <div className="pt-4 border-t border-border/20">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 rounded-xl h-10 text-[13px] font-semibold active:scale-[0.97] transition-all">
              <Save className="h-4 w-4" /> Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
