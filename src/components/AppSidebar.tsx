import {
  LayoutGrid, ShoppingCart, Globe, Smartphone, DollarSign, BarChart3,
  ClipboardList, BookOpen, ScanBarcode, Users as UsersIcon, Settings,
  LogOut, AlertCircle, Lock, Crown,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { PlanSwitcher } from "@/components/PlanSwitcher";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter,
} from "@/components/ui/sidebar";
import type { PlanFeatures } from "@/hooks/useSubscription";

type AppRole = "master_admin" | "supervisor" | "staff";

interface NavItem {
  title: string;
  url: string;
  icon: any;
  roles: AppRole[];
  feature?: keyof PlanFeatures;
}

const navItems: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutGrid, roles: ["master_admin", "supervisor"], feature: "dashboard" },
  { title: "Point of Sale", url: "/pos", icon: ShoppingCart, roles: ["master_admin", "supervisor", "staff"], feature: "pos" },
  { title: "Inventory", url: "/inventory", icon: Globe, roles: ["master_admin", "supervisor"], feature: "inventory" },
  { title: "Products", url: "/products", icon: Smartphone, roles: ["master_admin", "supervisor", "staff"], feature: "products" },
  { title: "Sales", url: "/sales", icon: DollarSign, roles: ["master_admin", "supervisor"], feature: "sales" },
  { title: "Reports", url: "/reports", icon: BarChart3, roles: ["master_admin", "supervisor"], feature: "reports" },
  { title: "Z-Report", url: "/z-report", icon: ClipboardList, roles: ["master_admin", "supervisor"], feature: "zReport" },
  { title: "Outstanding", url: "/outstanding", icon: AlertCircle, roles: ["master_admin", "supervisor"], feature: "outstanding" },
  { title: "Customers", url: "/customers", icon: BookOpen, roles: ["master_admin", "supervisor"], feature: "customers" },
  { title: "Barcode", url: "/barcode", icon: ScanBarcode, roles: ["master_admin", "supervisor", "staff"], feature: "barcode" },
  { title: "Users", url: "/users", icon: UsersIcon, roles: ["master_admin"], feature: "users" },
  { title: "Settings", url: "/settings", icon: Settings, roles: ["master_admin"], feature: "settings" },
];

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

  const visibleItems = navItems.filter((item) => role && item.roles.includes(role));

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
        {/* Grandmaster-only link — invisible to normal users */}
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

        {/* Plan switcher hidden for grandmaster */}
        {!isGrandmaster && <PlanSwitcher />}

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {visibleItems.map((item) => {
                const accessible = !item.feature || isGrandmaster || hasFeatureAccess(item.feature);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={accessible ? item.url : "#"}
                        end={item.url === "/"}
                        className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-200 ${
                          accessible
                            ? "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                            : "text-muted-foreground/40 cursor-not-allowed"
                        }`}
                        activeClassName={accessible ? "bg-primary/10 text-primary border border-primary/25" : ""}
                        onClick={(e: React.MouseEvent) => { if (!accessible) e.preventDefault(); }}
                      >
                        <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
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
