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
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
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

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutGrid },
  { title: "Point of Sale", url: "/pos", icon: ShoppingCart },
  { title: "Inventory", url: "/inventory", icon: Globe },
  { title: "Products", url: "/products", icon: Smartphone },
  { title: "Sales", url: "/sales", icon: DollarSign },
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "Z-Report", url: "/z-report", icon: ClipboardList },
  { title: "Customer Ledger", url: "/customer-ledger", icon: BookOpen },
  { title: "Users", url: "/users", icon: UsersIcon },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
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
              {navItems.map((item) => (
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
            <span className="text-[11px] font-semibold text-primary-foreground">AD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium truncate">Admin</p>
            <p className="text-[11px] text-muted-foreground truncate">admin@sunbird.ug</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
