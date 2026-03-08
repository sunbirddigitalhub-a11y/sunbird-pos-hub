import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TrialBanner } from "@/components/TrialBanner";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useTheme } from "@/hooks/useTheme";
import { Sun, Moon } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { theme, setTheme } = useTheme();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0">
          {/* Desktop header */}
          <header className="h-12 hidden md:flex items-center gap-4 border-b border-border/20 px-5 shrink-0 glass-subtle">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
            <div className="flex-1" />
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </header>

          {/* Mobile header */}
          <MobileHeader />

          <TrialBanner />
          <div className="flex-1 overflow-auto p-4 md:p-5 lg:p-8 pb-20 md:pb-8">
            {children}
          </div>

          {/* Mobile bottom nav */}
          <MobileBottomNav />
        </main>
      </div>
    </SidebarProvider>
  );
}
