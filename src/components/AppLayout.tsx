import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TrialBanner } from "@/components/TrialBanner";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useTheme } from "@/hooks/useTheme";
import { Sun, Moon, Bell, Search } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { theme, setTheme } = useTheme();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0">
          {/* Desktop header */}
          <header className="h-14 hidden md:flex items-center gap-4 border-b border-border px-6 shrink-0 bg-card">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
            <div className="flex-1 max-w-md">
              <div className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg">
                <Search className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Search...</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors relative"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
              </button>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </header>

          {/* Mobile header */}
          <MobileHeader />

          <TrialBanner />
          <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 pb-20 md:pb-8 bg-background">
            {children}
          </div>

          {/* Mobile bottom nav */}
          <MobileBottomNav />
        </main>
      </div>
    </SidebarProvider>
  );
}
