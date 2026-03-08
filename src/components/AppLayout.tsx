import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TrialBanner } from "@/components/TrialBanner";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center gap-4 border-b border-border/20 px-5 shrink-0 glass-subtle">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
          </header>
          <TrialBanner />
          <div className="flex-1 overflow-auto p-5 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
