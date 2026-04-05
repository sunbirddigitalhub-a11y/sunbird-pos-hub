import {
  LayoutGrid, ShoppingCart, Globe, Smartphone, DollarSign, BarChart3,
  ClipboardList, BookOpen, ScanBarcode, Users as UsersIcon, Settings,
  LogOut, AlertCircle, Lock, Crown, Truck, ShoppingBag, FileText,
  TrendingUp, UserCog, Store, Wallet, Plug, ScrollText, CreditCard,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useBusinessTerminology } from "@/hooks/useBusinessTerminology";
import { PlanSwitcher } from "@/components/PlanSwitcher";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter,
} from "@/components/ui/sidebar";
import type { PlanFeatures } from "@/hooks/useSubscription";

type AppRole = "master_admin" | "supervisor" | "staff";

interface NavItem {
  title: string;
  url: string;
  icon: any;
  feature?: keyof PlanFeatures;
  section: string;
}

function useNavItems(): NavItem[] {
  const t = useBusinessTerminology();
  return [
    { title: "Dashboard", url: "/dashboard", icon: LayoutGrid, feature: "dashboard", section: t.sectionCore },
    { title: t.pos, url: "/pos", icon: ShoppingCart, feature: "pos", section: t.sectionCore },
    { title: t.products, url: "/products", icon: Smartphone, feature: "products", section: t.sectionCore },
    { title: t.inventory, url: "/inventory", icon: Globe, feature: "inventory", section: t.sectionCore },
    { title: t.customers, url: "/customers", icon: BookOpen, feature: "customers", section: t.sectionCore },
    { title: t.sales, url: "/sales", icon: DollarSign, feature: "sales", section: t.sectionSalesFinance },
    { title: t.invoices, url: "/invoices", icon: FileText, feature: "invoices", section: t.sectionSalesFinance },
    { title: t.expenses, url: "/expenses", icon: Wallet, feature: "expenses", section: t.sectionSalesFinance },
    { title: t.outstanding, url: "/outstanding", icon: AlertCircle, feature: "outstanding", section: t.sectionSalesFinance },
    { title: t.suppliers, url: "/suppliers", icon: Truck, feature: "suppliers", section: t.sectionSupplyChain },
    { title: t.purchases, url: "/purchases", icon: ShoppingBag, feature: "purchases", section: t.sectionSupplyChain },
    { title: "Reports", url: "/reports", icon: BarChart3, feature: "reports", section: "Reports" },
    { title: "Analytics", url: "/analytics", icon: TrendingUp, feature: "analytics", section: "Reports" },
    { title: "Z-Report", url: "/z-report", icon: ClipboardList, feature: "zReport", section: "Reports" },
    { title: t.barcode, url: "/barcode", icon: ScanBarcode, feature: "barcode", section: "Tools" },
    { title: t.staff + " Management", url: "/staff-management", icon: UserCog, feature: "staffManagement", section: "Management" },
    { title: "Users", url: "/users", icon: UsersIcon, feature: "users", section: "Management" },
    { title: t.stores, url: "/stores", icon: Store, feature: "stores", section: "Management" },
    { title: "Settings", url: "/settings", icon: Settings, feature: "settings", section: "System" },
  ];
}

const roleRestrictions: Record<string, AppRole[]> = {
  "/users": ["master_admin"],
  "/settings": ["master_admin"],
  "/staff-management": ["master_admin", "supervisor"],
  "/stores": ["master_admin"],
};

const roleBadgeStyles: Record<AppRole, string> = {
  master_admin: "bg-primary/15 text-primary",
  supervisor: "bg-chart-3/15 text-chart-3",
  staff: "bg-success/15 text-success",
};

const roleLabels: Record<AppRole, string> = {
  master_admin: "Admin",
  supervisor: "Supervisor",
  staff: "Staff",
};

export function AppSidebar() {
  const { profile, role, isGrandmaster, signOut } = useAuth();
  const { hasFeatureAccess } = useSubscription();
  const navItems = useNavItems();

  const coreSection = navItems[0]?.section;
  const toolsSection = navItems.find(i => i.url === "/barcode")?.section || "Tools";
  const sections = navItems.reduce<Record<string, typeof navItems>>((acc, item) => {
    if (role === "staff" && !isGrandmaster && item.section !== coreSection && item.section !== toolsSection) return acc;
    const allowedRoles = roleRestrictions[item.url];
    if (allowedRoles && role && !allowedRoles.includes(role) && !isGrandmaster) return acc;
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});

  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="p-5 pb-6">
        <div className="flex items-center gap-3">
          <img src="/images/sunbird-logo.png" alt="Sunbird Logo" className="w-9 h-9 rounded-xl apple-shadow object-cover" />
          <div>
            <h2 className="text-[15px] font-bold tracking-tight text-foreground">Sunbird</h2>
            <p className="text-[11px] text-muted-foreground tracking-wide">Online Stores</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3">
        {isGrandmaster && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/grandmaster"
                      className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-200 text-primary hover:bg-primary/8"
                      activeClassName="bg-primary/10 text-primary font-semibold"
                    >
                      <Crown className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
                      <span className="flex-1">Platform Overview</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/subscriptions"
                      className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-200 text-primary hover:bg-primary/8"
                      activeClassName="bg-primary/10 text-primary font-semibold"
                    >
                      <CreditCard className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
                      <span className="flex-1">Subscriptions</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/integrations"
                      className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-200 text-primary hover:bg-primary/8"
                      activeClassName="bg-primary/10 text-primary font-semibold"
                    >
                      <Plug className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
                      <span className="flex-1">Integrations</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {!isGrandmaster && <PlanSwitcher />}

        {Object.entries(sections).map(([section, items]) => (
          <SidebarGroup key={section}>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-3.5 mb-1">
              {section}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-0.5">
                {items.map((item) => {
                  const accessible = !item.feature || isGrandmaster || hasFeatureAccess(item.feature);
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={accessible ? item.url : "#"}
                          end={item.url === "/"}
                          className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                            accessible
                              ? "text-muted-foreground hover:text-foreground hover:bg-secondary"
                              : "text-muted-foreground/40 cursor-not-allowed"
                          }`}
                          activeClassName={accessible ? "bg-primary/10 text-primary font-semibold" : ""}
                          onClick={(e: React.MouseEvent) => {
                            if (!accessible) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <item.icon className="h-[17px] w-[17px] shrink-0" strokeWidth={1.8} />
                          <span className="flex-1">{item.title}</span>
                          {!accessible && <Lock className="h-3.5 w-3.5 text-muted-foreground/40" />}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
            <span className="text-[11px] font-semibold text-primary">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium truncate">{profile?.full_name || "User"}</p>
            {isGrandmaster ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-primary/15 text-primary">
                Grandmaster
              </span>
            ) : role && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${roleBadgeStyles[role]}`}>
                {roleLabels[role]}
              </span>
            )}
          </div>
          <button
            onClick={signOut}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
