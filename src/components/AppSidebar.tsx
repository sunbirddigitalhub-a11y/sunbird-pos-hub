import {
  LayoutGrid,
  ShoppingCart,
  Globe,
  Smartphone,
  DollarSign,
  BarChart3,
  ClipboardList,
  BookOpen,
  Users as UsersIcon,
  Settings,
  LogOut,
  AlertCircle,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

type AppRole = "master_admin" | "supervisor" | "staff";

interface NavItem {
  title: string;
  url: string;
  icon: any;
  roles: AppRole[];
}

const navItems: NavItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutGrid, roles: ["master_admin", "supervisor"] },
  { title: "Point of Sale", url: "/pos", icon: ShoppingCart, roles: ["master_admin", "supervisor", "staff"] },
  { title: "Inventory", url: "/inventory", icon: Globe, roles: ["master_admin", "supervisor"] },
  { title: "Products", url: "/products", icon: Smartphone, roles: ["master_admin", "supervisor", "staff"] },
  { title: "Sales", url: "/sales", icon: DollarSign, roles: ["master_admin", "supervisor"] },
  { title: "Reports", url: "/reports", icon: BarChart3, roles: ["master_admin", "supervisor"] },
  { title: "Z-Report", url: "/z-report", icon: ClipboardList, roles: ["master_admin", "supervisor"] },
  { title: "Customer Ledger", url: "/customer-ledger", icon: BookOpen, roles: ["master_admin"] },
  { title: "Users", url: "/users", icon: UsersIcon, roles: ["master_admin"] },
  { title: "Settings", url: "/settings", icon: Settings, roles: ["master_admin"] },
];

const roleBadgeStyles: Record<AppRole, string> = {
  master_admin: "bg-primary/15 text-primary",
  supervisor: "bg-chart-3/15 text-chart-3",
  staff: "bg-success/15 text-success",
};

const roleLabels: Record<AppRole, string> = {
  master_admin: "Master Admin",
  supervisor: "Supervisor",
  staff: "Staff",
};

export function AppSidebar() {
  const { profile, role, signOut } = useAuth();

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
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[14px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all duration-200"
                      activeClassName="bg-primary/10 text-primary border border-primary/25"
                    >
                      <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
            {role && (
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
