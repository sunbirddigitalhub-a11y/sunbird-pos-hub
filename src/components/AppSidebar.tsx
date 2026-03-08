import {
  LayoutGrid, ShoppingCart, Globe, Smartphone, DollarSign, BarChart3,
  ClipboardList, BookOpen, ScanBarcode, Users as UsersIcon, Settings,
  LogOut, AlertCircle, Lock, Crown, Truck, ShoppingBag, FileText,
  TrendingUp, UserCog, Store, Wallet, Plug, ScrollText,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
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

const navItems: NavItem[] = [
  // Core
  { title: "Dashboard", url: "/dashboard", icon: LayoutGrid, feature: "dashboard", section: "Core" },
  { title: "Point of Sale", url: "/pos", icon: ShoppingCart, feature: "pos", section: "Core" },
  { title: "Products", url: "/products", icon: Smartphone, feature: "products", section: "Core" },
  { title: "Inventory", url: "/inventory", icon: Globe, feature: "inventory", section: "Core" },
  { title: "Customers", url: "/customers", icon: BookOpen, feature: "customers", section: "Core" },
  // Sales & Finance
  { title: "Sales", url: "/sales", icon: DollarSign, feature: "sales", section: "Sales & Finance" },
  { title: "Invoices", url: "/invoices", icon: FileText, feature: "invoices", section: "Sales & Finance" },
  { title: "Expenses", url: "/expenses", icon: Wallet, feature: "expenses", section: "Sales & Finance" },
  { title: "Outstanding", url: "/outstanding", icon: AlertCircle, feature: "outstanding", section: "Sales & Finance" },
  // Supply Chain
  { title: "Suppliers", url: "/suppliers", icon: Truck, feature: "suppliers", section: "Supply Chain" },
  { title: "Purchases", url: "/purchases", icon: ShoppingBag, feature: "purchases", section: "Supply Chain" },
  // Reports & Analytics
  { title: "Reports", url: "/reports", icon: BarChart3, feature: "reports", section: "Reports" },
  { title: "Analytics", url: "/analytics", icon: TrendingUp, feature: "analytics", section: "Reports" },
  { title: "Z-Report", url: "/z-report", icon: ClipboardList, feature: "zReport", section: "Reports" },
  // Tools
  { title: "Barcode", url: "/barcode", icon: ScanBarcode, feature: "barcode", section: "Tools" },
  // Management
  { title: "Staff Management", url: "/staff-management", icon: UserCog, feature: "staffManagement", section: "Management" },
  { title: "Users", url: "/users", icon: UsersIcon, feature: "users", section: "Management" },
  { title: "Stores", url: "/stores", icon: Store, feature: "stores", section: "Management" },
  // System
  { title: "Integrations", url: "/integrations", icon: Plug, feature: "integrations", section: "System" },
  { title: "Settings", url: "/settings", icon: Settings, feature: "settings", section: "System" },
];

// Role-based visibility: which roles can SEE each item
// master_admin sees everything; supervisor sees most; staff sees Core + Tools only
const roleRestrictions: Record<string, AppRole[]> = {
  "/users": ["master_admin"],
  "/settings": ["master_admin"],
  "/staff-management": ["master_admin", "supervisor"],
  "/stores": ["master_admin"],
  "/integrations": ["master_admin"],
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

  // Group items by section, filtering by role
  const sections = navItems.reduce<Record<string, typeof navItems>>((acc, item) => {
    // Check role restrictions
    const allowedRoles = roleRestrictions[item.url];
    if (allowedRoles && role && !allowedRoles.includes(role) && !isGrandmaster) return acc;
    // Staff can only see Core + Tools sections
    if (role === "staff" && !["Core", "Tools"].includes(item.section)) return acc;
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
    <Sidebar className="border-r border-border/30">
      <SidebarHeader className="p-5 pb-6">
        <div className="flex items-center gap-3">
          <img src="/images/sunbird-logo.png" alt="Sunbird Logo" className="w-9 h-9 rounded-xl apple-shadow object-cover" />
          <div>
            <h2 className="text-[15px] font-semibold tracking-tight gold-gradient-text">Sunbird</h2>
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
                      className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-200 text-primary hover:bg-primary/10"
                      activeClassName="bg-primary/10 border border-primary/25"
                    >
                      <Crown className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
                      <span className="flex-1">Platform Overview</span>
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
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={accessible ? item.url : "#"}
                          end={item.url === "/"}
                          className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                            accessible
                              ? "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                              : "text-muted-foreground/40 cursor-not-allowed"
                          }`}
                          activeClassName={accessible ? "bg-primary/10 text-primary border border-primary/25" : ""}
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

      <SidebarFooter className="p-4 border-t border-border/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/80 to-primary/40 flex items-center justify-center">
            <span className="text-[11px] font-semibold text-primary-foreground">{initials}</span>
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
