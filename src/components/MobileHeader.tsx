import { Search, Bell, Sun, Moon, Store } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

export function MobileHeader() {
  const { theme, setTheme } = useTheme();
  const { profile } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 md:hidden bg-background/90 backdrop-blur-xl border-b border-border/30">
      <div className="flex items-center justify-between px-4 h-14">
        {/* Left: Store */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
            <Store className="h-4 w-4 text-primary" />
          </div>
          <span className="text-[13px] font-semibold truncate max-w-[120px]">
            {profile?.full_name?.split(" ")[0] || "Sunbird"}
          </span>
        </div>

        {/* Center: Search */}
        {searchOpen ? (
          <div className="absolute inset-x-0 top-0 h-14 bg-background/95 backdrop-blur-xl flex items-center px-4 gap-2 z-10">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              autoFocus
              placeholder="Search products, sales..."
              className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted-foreground/60"
              onBlur={() => setSearchOpen(false)}
            />
            <button onClick={() => setSearchOpen(false)} className="text-[13px] text-primary font-medium">
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="flex-1 mx-3 h-9 bg-secondary/60 rounded-lg flex items-center gap-2 px-3 max-w-[200px]"
          >
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[12px] text-muted-foreground">Search...</span>
          </button>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors active:scale-95"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </button>
          <button className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors active:scale-95 relative">
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
          </button>
        </div>
      </div>
    </header>
  );
}
