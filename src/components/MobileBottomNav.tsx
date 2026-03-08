import { LayoutGrid, ShoppingCart, Package, BarChart3, MoreHorizontal } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { useBusinessTerminology } from "@/hooks/useBusinessTerminology";
import {
  DollarSign, BookOpen, ScanBarcode, Globe, ClipboardList,
  Settings, Truck, ShoppingBag, FileText, TrendingUp, UserCog,
  Store, Wallet, Plug, Lock, Users as UsersIcon, Crown, CreditCard,
  AlertCircle, LogOut,
} from "lucide-react";
import type { PlanFeatures } from "@/hooks/useSubscription";

interface MoreItem {
  title: string;
  path: string;
  icon: any;
  feature?: keyof PlanFeatures;
}

export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);
  const { hasFeatureAccess } = useSubscription();
  const { isGrandmaster, signOut, role } = useAuth();
  const t = useBusinessTerminology();

  const primaryTabs = [
    { label: "Home", icon: LayoutGrid, path: "/dashboard" },
    { label: t.pos, icon: ShoppingCart, path: "/pos" },
    { label: t.products, icon: Package, path: "/products" },
    { label: "Reports", icon: BarChart3, path: "/reports" },
    { label: "More", icon: MoreHorizontal, path: "__more__" },
  ];

  const moreItems: MoreItem[] = [
    { title: t.inventory, path: "/inventory", icon: Globe, feature: "inventory" },
    { title: t.customers, path: "/customers", icon: BookOpen, feature: "customers" },
    { title: t.sales, path: "/sales", icon: DollarSign, feature: "sales" },
    { title: t.invoices, path: "/invoices", icon: FileText, feature: "invoices" },
    { title: t.expenses, path: "/expenses", icon: Wallet, feature: "expenses" },
    { title: t.outstanding, path: "/outstanding", icon: AlertCircle, feature: "outstanding" },
    { title: t.suppliers, path: "/suppliers", icon: Truck, feature: "suppliers" },
    { title: t.purchases, path: "/purchases", icon: ShoppingBag, feature: "purchases" },
    { title: "Analytics", path: "/analytics", icon: TrendingUp, feature: "analytics" },
    { title: "Z-Report", path: "/z-report", icon: ClipboardList, feature: "zReport" },
    { title: t.barcode, path: "/barcode", icon: ScanBarcode, feature: "barcode" },
    { title: t.staff, path: "/staff-management", icon: UserCog, feature: "staffManagement" },
    { title: "Users", path: "/users", icon: UsersIcon, feature: "users" },
    { title: t.stores, path: "/stores", icon: Store, feature: "stores" },
    
    { title: "Settings", path: "/settings", icon: Settings, feature: "settings" },
  ];

  const handleTab = (path: string) => {
    if (path === "__more__") {
      setMoreOpen(true);
    } else {
      navigate(path);
    }
  };

  const handleMoreItem = (item: MoreItem) => {
    const accessible = !item.feature || isGrandmaster || hasFeatureAccess(item.feature);
    if (accessible) {
      navigate(item.path);
      setMoreOpen(false);
    }
  };

  const roleRestrictions: Record<string, string[]> = {
    "/users": ["master_admin"],
    "/settings": ["master_admin"],
    "/staff-management": ["master_admin", "supervisor"],
    "/stores": ["master_admin"],
    "/integrations": ["master_admin"],
  };

  const filteredMoreItems = moreItems.filter((item) => {
    if (role === "staff" && !isGrandmaster) return false;
    const allowed = roleRestrictions[item.path];
    if (allowed && role && !allowed.includes(role) && !isGrandmaster) return false;
    return true;
  });

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-xl border-t border-border/30 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {primaryTabs.map((tab) => {
            const isActive = tab.path !== "__more__" && location.pathname === tab.path;
            const isMore = tab.path === "__more__";
            return (
              <button
                key={tab.label}
                onClick={() => handleTab(tab.path)}
                className={`flex flex-col items-center gap-1 min-w-[56px] py-1.5 rounded-xl transition-all duration-200 active:scale-90 ${
                  isActive
                    ? "text-primary"
                    : isMore && moreOpen
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <tab.icon className="h-5 w-5" strokeWidth={isActive ? 2.2 : 1.6} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[80vh] pb-safe">
          <SheetHeader className="pb-2">
            <SheetTitle className="text-[16px] font-semibold">All Features</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto max-h-[60vh] -mx-2">
            {isGrandmaster && (
              <div className="mb-3 px-2">
                <p className="text-[10px] uppercase tracking-widest text-primary/60 font-medium mb-2 px-2">Grandmaster</p>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => { navigate("/grandmaster"); setMoreOpen(false); }}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-primary/10 active:scale-95 transition-transform"
                  >
                    <Crown className="h-5 w-5 text-primary" />
                    <span className="text-[11px] font-medium text-primary">Platform</span>
                  </button>
                  <button
                    onClick={() => { navigate("/subscriptions"); setMoreOpen(false); }}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-primary/10 active:scale-95 transition-transform"
                  >
                    <CreditCard className="h-5 w-5 text-primary" />
                    <span className="text-[11px] font-medium text-primary">Subs</span>
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-4 gap-2 px-2">
              {filteredMoreItems.map((item) => {
                const accessible = !item.feature || isGrandmaster || hasFeatureAccess(item.feature);
                return (
                  <button
                    key={item.path}
                    onClick={() => handleMoreItem(item)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all active:scale-95 ${
                      accessible
                        ? "hover:bg-secondary/60 active:bg-secondary/80"
                        : "opacity-40"
                    } ${location.pathname === item.path ? "bg-primary/10" : ""}`}
                  >
                    <div className="relative">
                      <item.icon className={`h-5 w-5 ${location.pathname === item.path ? "text-primary" : "text-muted-foreground"}`} />
                      {!accessible && (
                        <Lock className="h-2.5 w-2.5 text-muted-foreground absolute -top-0.5 -right-1" />
                      )}
                    </div>
                    <span className={`text-[11px] font-medium ${location.pathname === item.path ? "text-primary" : ""}`}>
                      {item.title}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-border/30 px-2">
              <button
                onClick={() => { signOut(); setMoreOpen(false); }}
                className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors active:scale-[0.98]"
              >
                <LogOut className="h-5 w-5" />
                <span className="text-[14px] font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
